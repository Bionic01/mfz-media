"""Final-file QA for long videos and Shorts (both channels). Run it on the finished mp4 before publishing.

  python3 qa.py <video.mp4> [--out DIR] [--every 10] [--max-empty 1.0] [--lufs -14] [--max-mb 95]

Checks, each printed as OK or FLAG:
  - dead air: stretches longer than --max-empty seconds where the screen is nearly empty (only background/haze);
    catches shots whose first element appears late (found three of these in the USSD video, 11 Nov 2026)
  - frozen picture: stretches longer than --max-static seconds where almost nothing moves (Rodney, 11 Nov 2026:
    "high quality, non-stop motion, like no errors"); the USSD v2 render had 95 s of these
  - loudness: integrated LUFS within 1 LU of --lufs, true peak at or below -1 dBTP
  - file size under --max-mb, and the format (resolution, fps, codecs)
Writes DIR/qa_sheet.jpg (a frame every --every seconds) and DIR/qa_flags.jpg (a frame from the middle of every
flagged stretch) so every flag gets looked at. Exit code 1 if anything is flagged: fix it, re-render the shot
(render.py video --from/--to), splice, and run qa.py again.
"""
import argparse, json, os, re, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw


def probe(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate:format=duration,size',
                        '-of', 'json', path], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def gray_frames(path, w, h, fps=5):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'fps={fps},scale={w}:{h},format=gray', '-f', 'rawvideo', '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)


def motion_scores(a):
    """Share of pixels that visibly change between frames 0.2 s apart. A frozen picture (only haze drifting) scores ~0."""
    if len(a) < 2: return np.zeros(len(a))
    m = (np.abs(np.diff(a, axis=0)) > 6).mean(axis=(1, 2))
    return np.concatenate([[m[0]], m])


def detail_scores(path, w, h, fps=5, frames=None):
    """Share of pixels with fine detail per frame (text, icons, edges). Smooth backgrounds and haze score near zero."""
    a = frames if frames is not None else gray_frames(path, w, h, fps)
    # ignore the channel logo bug in the top corners (left out of the count, not blanked: blanking draws an edge that reads as detail)
    keep = np.ones((h, w), bool)
    keep[: int(h * .12) + 5, int(w * .75) - 5:] = False
    keep[: int(h * .12) + 5, : int(w * .1) + 5] = False
    try:
        from scipy.ndimage import uniform_filter
        box = uniform_filter(a, size=(1, 9, 9))
    except ImportError:  # same 9x9 box blur in float64 (float32 sums lose precision and invent detail)
        k = 9; a64 = a.astype(np.float64)
        pad = np.pad(a64, ((0, 0), (k // 2, k // 2), (k // 2, k // 2)), mode='reflect')
        cs = np.pad(pad.cumsum(1).cumsum(2), ((0, 0), (1, 0), (1, 0)))
        box = (cs[:, k:, k:] - cs[:, :-k, k:] - cs[:, k:, :-k] + cs[:, :-k, :-k]) / (k * k)
    return ((np.abs(a - box) > 10) & keep).sum(axis=(1, 2)) / keep.sum()


def runs_below(sc, thr, fps, min_s):
    out, st = [], None
    for i, v in enumerate(list(sc) + [1.0]):
        if v < thr and st is None: st = i
        if v >= thr and st is not None:
            if (i - st) / fps >= min_s: out.append((st / fps, i / fps))
            st = None
    return out


def frame(path, t, w):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.2f}', '-i', path, '-frames:v', '1', '-vf', f'scale={w}:-2', '-f', 'image2pipe',
                        '-vcodec', 'png', '-'], capture_output=True, check=True)
    from io import BytesIO
    return Image.open(BytesIO(r.stdout)).convert('RGB')


def sheet(path, times, w, out, cols=6):
    if not times: return
    ims = [frame(path, t, w) for t in times]
    fw, fh = ims[0].size
    s = Image.new('RGB', (cols * fw, ((len(ims) + cols - 1) // cols) * fh), 'black'); d = ImageDraw.Draw(s)
    for i, (t, im) in enumerate(zip(times, ims)):
        x, y = (i % cols) * fw, (i // cols) * fh; s.paste(im, (x, y)); d.text((x + 5, y + 4), f'{int(t // 60)}:{t % 60:04.1f}', fill='yellow')
    s.save(out, quality=85)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video'); ap.add_argument('--out', default=None); ap.add_argument('--every', type=float, default=10)
    ap.add_argument('--max-empty', type=float, default=1.0); ap.add_argument('--max-static', type=float, default=1.5); ap.add_argument('--static-thr', type=float, default=0.004); ap.add_argument('--lufs', type=float, default=-14); ap.add_argument('--max-mb', type=float, default=95)
    a = ap.parse_args()
    out = a.out or os.path.join(os.path.dirname(os.path.abspath(a.video)), 'qa'); os.makedirs(out, exist_ok=True)
    flags = []
    p = probe(a.video); dur = float(p['format']['duration']); mb = int(p['format']['size']) / 1e6
    v = next(s for s in p['streams'] if s['codec_type'] == 'video'); au = [s for s in p['streams'] if s['codec_type'] == 'audio']
    vert = v['height'] > v['width']
    print(f"format: {v['width']}x{v['height']} {v['codec_name']} {v['r_frame_rate']} fps, audio {au[0]['codec_name'] if au else 'NONE'}, {dur:.1f}s, {mb:.1f} MB")
    if not au: flags.append('no audio stream')
    if mb > a.max_mb: flags.append(f'file is {mb:.1f} MB, over {a.max_mb} MB')

    # dead air
    w, h = (180, 320) if vert else (320, 180)
    frames = gray_frames(a.video, w, h)
    sc = detail_scores(a.video, w, h, frames=frames)
    thr = 0.003  # share of the frame with fine detail; an empty background scores ~0, one icon with a label ~0.01+
    empty = runs_below(sc, thr, 5, a.max_empty)
    for t0, t1 in empty:
        flags.append(f'dead air {int(t0 // 60)}:{t0 % 60:04.1f}-{int(t1 // 60)}:{t1 % 60:04.1f} ({t1 - t0:.1f}s): nearly empty screen')
    # frozen picture: Rodney wants non-stop motion (11 Nov 2026 23:46), so nothing may sit still for --max-static seconds
    mo = motion_scores(frames)
    frozen = runs_below(mo, a.static_thr, 5, a.max_static)
    total = sum(t1 - t0 for t0, t1 in frozen)
    print(f'motion: median {np.median(mo):.4f}, frozen stretches over {a.max_static}s: {len(frozen)} ({total:.1f}s of {dur:.0f}s)')
    for t0, t1 in frozen:
        flags.append(f'frozen {int(t0 // 60)}:{t0 % 60:04.1f}-{int(t1 // 60)}:{t1 % 60:04.1f} ({t1 - t0:.1f}s): the picture barely moves')
    flagged = empty + frozen
    sheet(a.video, [(t0 + t1) / 2 for t0, t1 in flagged][:60], 480 if not vert else 270, os.path.join(out, 'qa_flags.jpg'))

    # loudness
    if au:
        r = subprocess.run(['ffmpeg', '-nostats', '-i', a.video, '-map', '0:a:0', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True)
        tail = r.stderr[r.stderr.rfind('Summary:'):]
        I = re.search(r'I:\s+(-?[\d.]+) LUFS', tail); P = re.search(r'Peak:\s+(-?[\d.]+|-inf) dBFS', tail)
        lufs = float(I.group(1)) if I else None; peak = float(P.group(1)) if P and P.group(1) != '-inf' else None
        print(f'loudness: {lufs} LUFS integrated, true peak {peak} dBTP')
        if lufs is None or abs(lufs - a.lufs) > 1: flags.append(f'loudness {lufs} LUFS (target {a.lufs})')
        if peak is not None and peak > -1.0: flags.append(f'true peak {peak} dBTP (keep at or below -1)')

    sheet(a.video, [min(dur - .3, t) for t in np.arange(1, dur, a.every)], 384 if not vert else 216, os.path.join(out, 'qa_sheet.jpg'))
    print(f'sheets: {out}/qa_sheet.jpg' + (f', {out}/qa_flags.jpg' if flagged else ''))
    if flags:
        for f in flags: print('FLAG', f)
        sys.exit(1)
    print('OK: no flags. Still look at qa_sheet.jpg before publishing.')


if __name__ == '__main__':
    main()
