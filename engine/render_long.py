"""Render a long scene in resumable chunks, so every background job stays under the 2-hour limit.
Motion v3 (12 Nov 2026) renders at about 1.4 frames per second on 2 cores, so a 9-minute video takes about 3 hours.

  python3 render_long.py scene.js video_silent.mp4 --theme fluxr [--chunk 4500] [--budget 100]

Run it with run_in_background. It renders the chunks that aren't finished yet (in <out>.chunks/), stops before
--budget minutes, and ends by printing MORE (run the same command again) or DONE (all chunks joined into <out>).
A chunk counts as finished only when its file has exactly the expected number of frames, so a killed job just
re-renders the chunk it was on.
"""
import argparse, os, subprocess, sys, time
HERE = os.path.dirname(os.path.abspath(__file__)); FPS = 30


def frames(path):
    if not os.path.exists(path): return -1
    r = subprocess.run(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0', path], capture_output=True, text=True)
    try: return int(r.stdout.strip())
    except ValueError: return -1


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('scene'); ap.add_argument('out'); ap.add_argument('--theme', default='mfz')
    ap.add_argument('--chunk', type=int, default=4500, help='frames per chunk (4500 = 150 s, about 55 min of rendering)')
    ap.add_argument('--budget', type=float, default=100, help='minutes this run may use before it stops and asks to be run again')
    ap.add_argument('--workers', type=int, default=2)
    a = ap.parse_args(); T0 = time.time()
    import json; cdir = os.path.abspath(a.out) + '.chunks'; os.makedirs(cdir, exist_ok=True); dj = f'{cdir}/duration.json'
    if not os.path.exists(dj): subprocess.run([sys.executable, os.path.join(HERE, 'render.py'), 'cues', a.scene, dj, '--theme', a.theme], capture_output=True, text=True, check=True)
    dur = json.load(open(dj))['duration']; N = int(round(dur * FPS))
    plan = [(s, min(N, s + a.chunk)) for s in range(0, N, a.chunk)]
    last = None
    for s, e in plan:
        path = f'{cdir}/c{s:06d}.mp4'
        if frames(path) == e - s: continue
        used = (time.time() - T0) / 60; est = last if last else (e - s) / 1.2 / 60
        if used + est > a.budget: print(f'MORE: {used:.0f} min used, next chunk needs about {est:.0f} min. Run the same command again.', flush=True); return
        t = time.time(); print(f'chunk {s}-{e} ({(e - s) / FPS:.0f}s of video)', flush=True)
        subprocess.run([sys.executable, os.path.join(HERE, 'render.py'), 'video', a.scene, path, '--from', f'{s / FPS:.6f}', '--to', f'{e / FPS:.6f}', '--workers', str(a.workers), '--theme', a.theme], check=True)
        got = frames(path)
        if got != e - s: print(f'chunk {s}-{e} has {got} frames, expected {e - s}; run again', flush=True); return
        last = (time.time() - t) / 60; print(f'chunk {s}-{e} done in {last:.0f} min', flush=True)
    lst = f'{cdir}/list.txt'; open(lst, 'w').write(''.join(f"file '{cdir}/c{s:06d}.mp4'\n" for s, e in plan))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', '-movflags', '+faststart', a.out], check=True)
    got = frames(a.out); print(('DONE: ' if got == N else 'CHECK: ') + f'{a.out} has {got} of {N} frames', flush=True)


if __name__ == '__main__':
    main()
