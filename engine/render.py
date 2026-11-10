#!/usr/bin/env python3
"""CINE renderer: deterministic HTML/SVG scenes -> frames -> H.264.

usage:
  python3 render.py snap  <scene.js> <t1,t2,...> [--theme mfz|fluxr] [--out DIR] [--scale 1]   PNG stills + contact sheet
  python3 render.py cues  <scene.js> <out.json>  [--theme ...]                                 SFX cue list + duration
  python3 render.py video <scene.js> <out.mp4>   [--theme ...] [--workers 2] [--scale 1] [--from S] [--to S] [--crf 16]
       [--audio mix.wav]   frames are piped straight into ffmpeg (no frames on disk); workers render contiguous chunks.
A scene is a JS file that uses window.CINE (see README.md). It is loaded inside engine/shell.html.
"""
import argparse, json, os, sys, time, subprocess, threading, functools, http.server, socketserver, math, multiprocessing as mp
ENGINE = os.path.dirname(os.path.abspath(__file__))
FPS = 30


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()


def serve():
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory='/'))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv.server_address[1]


def open_page(p, port, scene, theme, scale, extra=''):
    b = p.chromium.launch(args=['--disable-web-security', '--font-render-hinting=none', '--disable-gpu-vsync', '--force-color-profile=srgb', '--disable-lcd-text'])
    ctx = b.new_context(viewport={'width': 1920, 'height': 1080}, device_scale_factor=scale)
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: print('pageerror:', e, flush=True))
    pg.on('console', lambda m: m.type in ('error', 'warning') and print('console:', m.text, flush=True))
    url = f'http://127.0.0.1:{port}{ENGINE}/shell.html?scene={os.path.abspath(scene)}&theme={theme}{extra}'
    pg.goto(url, wait_until='load')
    pg.evaluate('document.fonts.ready')
    pg.evaluate('window.ready()')
    return b, pg


def worker(args):
    scene, theme, scale, f0, f1, seg, crf, wi = args
    from playwright.sync_api import sync_playwright
    port = serve()
    with sync_playwright() as p:
        b, pg = open_page(p, port, scene, theme, scale)
        cdp = pg.context.new_cdp_session(pg)
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', str(FPS), '-i', '-',
                               '-c:v', 'libx264', '-preset', 'medium', '-crf', str(crf), '-pix_fmt', 'yuv420p', '-g', '60', seg], stdin=subprocess.PIPE)
        t0 = time.time(); import base64
        for f in range(f0, f1):
            pg.evaluate('t => window.renderAt(t)', f / FPS)
            r = cdp.send('Page.captureScreenshot', {'format': 'jpeg', 'quality': 94, 'optimizeForSpeed': True})
            ff.stdin.write(base64.b64decode(r['data']))
            if (f - f0) % 150 == 0:
                el = time.time() - t0; done = f - f0 + 1
                print(f'[w{wi}] {done}/{f1 - f0} frames  {el:.0f}s  eta {el / done * (f1 - f0 - done):.0f}s', flush=True)
        ff.stdin.close(); ff.wait(); b.close()
    return seg


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('mode'); ap.add_argument('scene'); ap.add_argument('arg')
    ap.add_argument('--theme', default='mfz'); ap.add_argument('--out', default=None); ap.add_argument('--scale', type=float, default=1)
    ap.add_argument('--workers', type=int, default=max(1, os.cpu_count() or 1)); ap.add_argument('--from', dest='t0', type=float, default=0)
    ap.add_argument('--to', dest='t1', type=float, default=None); ap.add_argument('--crf', type=int, default=16); ap.add_argument('--audio', default=None)
    a = ap.parse_args()
    from playwright.sync_api import sync_playwright
    if a.mode in ('snap', 'cues', 'info'):
        port = serve()
        with sync_playwright() as p:
            b, pg = open_page(p, port, a.scene, a.theme, a.scale)
            dur = pg.evaluate('window.DURATION')
            if a.mode == 'snap':
                out = a.out or os.path.join(os.path.dirname(os.path.abspath(a.scene)), 'snaps'); os.makedirs(out, exist_ok=True)
                ts = [float(x) for x in a.arg.split(',')] if a.arg != 'auto' else [round(dur * (i + .5) / 12, 2) for i in range(12)]
                paths = []
                for t in ts:
                    t1 = time.time(); pg.evaluate('t => window.renderAt(t)', t)
                    path = f'{out}/{t:07.2f}.png'; pg.screenshot(path=path); paths.append(path)
                    print(f'{t:.2f}s  {1000 * (time.time() - t1):.0f}ms', flush=True)
                # contact sheet
                try:
                    from PIL import Image, ImageDraw
                    ims = [Image.open(x).convert('RGB').resize((640, 360)) for x in paths]; cols = 3; rows = math.ceil(len(ims) / cols)
                    sheet = Image.new('RGB', (cols * 640 + (cols + 1) * 8, rows * 360 + (rows + 1) * 8), (30, 30, 30)); d = ImageDraw.Draw(sheet)
                    for i, (im, t) in enumerate(zip(ims, ts)):
                        x, y = 8 + (i % cols) * 648, 8 + (i // cols) * 368; sheet.paste(im, (x, y)); d.text((x + 8, y + 6), f'{t:.2f}s', fill=(255, 255, 0))
                    sheet.save(f'{out}/sheet.jpg', quality=88); print('sheet', f'{out}/sheet.jpg')
                except Exception as e: print('sheet failed', e)
            elif a.mode == 'cues':
                pg.evaluate('d => { for (let t = 0; t <= d; t += 0.2) window.renderAt(t); window.renderAt(d - 0.001); }', dur)
                json.dump({'duration': dur, 'cues': pg.evaluate('window.CUES || []'), 'meta': pg.evaluate('window.META || {}')}, open(a.arg, 'w'), indent=1)
                print('cues ->', a.arg, 'duration', dur)
            else: print(json.dumps({'duration': dur}))
            b.close()
        return
    # video
    port = serve()
    with sync_playwright() as p:
        b, pg = open_page(p, port, a.scene, a.theme, a.scale); dur = pg.evaluate('window.DURATION'); b.close()
    t1 = a.t1 if a.t1 is not None else dur
    F0, F1 = int(round(a.t0 * FPS)), int(round(t1 * FPS)); n = F1 - F0; W = max(1, min(a.workers, n))
    out = os.path.abspath(a.arg); tmp = out + '.parts'; os.makedirs(tmp, exist_ok=True)
    chunks = []; per = math.ceil(n / W)
    for i in range(W):
        s, e = F0 + i * per, min(F1, F0 + (i + 1) * per)
        if s < e: chunks.append((a.scene, a.theme, a.scale, s, e, f'{tmp}/seg{i:02d}.mp4', a.crf, i))
    print(f'render {n} frames ({n / FPS:.1f}s) with {len(chunks)} workers at scale {a.scale}', flush=True); T = time.time()
    with mp.get_context('spawn').Pool(len(chunks)) as pool: segs = pool.map(worker, chunks)
    lst = f'{tmp}/list.txt'; open(lst, 'w').write(''.join(f"file '{s}'\n" for s in segs))
    silent = out if not a.audio else f'{tmp}/silent.mp4'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', '-movflags', '+faststart', silent], check=True)
    if a.audio:
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', silent, '-ss', str(a.t0), '-i', a.audio, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', out], check=True)
    print(f'done {out} in {time.time() - T:.0f}s', flush=True)


if __name__ == '__main__':
    main()
