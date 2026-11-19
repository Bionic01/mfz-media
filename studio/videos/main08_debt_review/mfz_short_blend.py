"""Blended-look version (19 Nov 2026): picture and sound both from the blended long video. MFZ version (gold, MONEY FROM ZERO kick, MFZ logo strip) of the Fluxr vertical story Short cut from the CINE v2 long video (11 Nov 2026).
Layout 1080x1920: blurred fill of the same footage, the 16:9 animation framed in the middle, a big title on top,
word-synced captions under the frame, the Fluxr logo, and "Full story on our channel" at the end.
Audio = the long video's own mix (voice + music + effects) for that segment.
Usage: python3 shorts_v2.py A [--src video_silent.mp4] [--test still.png]"""
import json, re, os, sys, subprocess, argparse

HERE = os.path.dirname(os.path.abspath(__file__))
KIT = os.path.abspath(os.path.join(HERE, '../../../kit'))
ap = argparse.ArgumentParser(); ap.add_argument('key'); ap.add_argument('--src', default='blend/MoneyFromZero08_blend.mp4'); ap.add_argument('--mix', default='blend/MoneyFromZero08_blend.mp4'); ap.add_argument('--ver', default='v1'); ap.add_argument('--test', default=None)
A = ap.parse_args(); KEY = A.key
SEG = json.load(open(os.path.join(HERE, 'mfz_shorts.json')))[KEY]
WORDS = [x[:3] for x in json.load(open('/home/claude/mfz-media/studio/videos/main08_debt_review/words_all.json'))]
T0, T1 = SEG['start'], SEG['end']; TAIL = 1.8; DUR = T1 - T0 + TAIL
VS = SEG.get('vstart', T0)  # picture starts here (a clean shot); its first frame is held until then so frame 1 is clean under the title
TITLES = {k: v['t'] for k, v in json.load(open(os.path.join(HERE, 'mfz_shorts.json'))).items()}
LIME, WHITE = '&H33BEF7&', '&HFFFFFF&'
NUM = set('one two three four five six seven eight nine ten eleven twelve twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million billion trillion percent point'.split())

def ts(t): return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"
def clean(w): return w.replace('/ˈflʌksə/', 'Fluxr').replace('For All Voucher', '4ALL Voucher')
def is_num(w): core = re.sub(r'[^a-z0-9-]', '', w.lower()); return bool(re.search(r'\d', core)) or any(p in NUM for p in core.split('-'))

words = [[clean(w[0]), w[1] - T0, min(w[2], T1) - T0] for w in WORDS if T0 - 0.01 <= w[1] < T1]
cards, cur = [], []
for w in words:
    cand = ' '.join([x[0] for x in cur] + [w[0]])
    if cur and (len(cand) > 22 or cur[-1][0][-1] in '.:!?,'): cards.append(cur); cur = []
    cur.append(w)
if cur: cards.append(cur)
ev = []
for i, c in enumerate(cards):
    st = c[0][1]; nxt = cards[i + 1][0][1] if i + 1 < len(cards) else T1 - T0
    en = max(min(nxt, c[-1][2] + .4), st + .25)
    # karaoke-style: the word being spoken turns lime
    for j, w in enumerate(c):
        ws = w[1]; we = c[j + 1][1] if j + 1 < len(c) else en
        if we <= ws: continue
        parts = [('{\\c' + LIME + '}' + x[0] + '{\\c' + WHITE + '}') if (k == j or is_num(x[0])) else x[0] for k, x in enumerate(c)]
        ev.append(f"Dialogue: 1,{ts(max(st, ws))},{ts(we)},Cap,,0,0,0,,{{\\fad({40 if j == 0 else 0},0)}}" + ' '.join(parts))
t1, t2 = TITLES[KEY]
fmt = lambda s: re.sub(r'\{([^}]*)\}', lambda m: '{\\c' + LIME + '}' + m.group(1) + '{\\c' + WHITE + '}', s)
ev.append(f"Dialogue: 2,{ts(0)},{ts(DUR)},Title,,0,0,0,,{{\\fad(250,0)}}{fmt(t1)}\\N{fmt(t2)}")
ev.append(f"Dialogue: 2,{ts(0)},{ts(DUR)},Kick,,0,0,0,,MONEY FROM ZERO")
ev.append(f"Dialogue: 3,{ts(T1 - T0 - .2)},{ts(DUR)},End,,0,0,0,,{{\\fad(200,0)\\t(0,250,\\fscx108\\fscy108)\\t(250,450,\\fscx100\\fscy100)}}" + SEG['end_txt'])
head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Barlow ExtraBold,80,&H00FFFFFF,&H00FFFFFF,&H00220B0C,&H96000000,0,0,0,0,100,100,0,0,1,7,3,8,70,70,1340,1
Style: Title,Barlow Condensed ExtraBold,104,&H00FFFFFF,&H00FFFFFF,&H00220B0C,&H96000000,0,0,0,0,100,100,0,0,1,6,4,8,60,60,330,1
Style: Kick,Barlow Condensed ExtraBold,40,&H0033BEF7,&H0033BEF7,&H000C0B22,&H00000000,0,0,0,0,100,100,6,0,1,4,0,8,60,60,270,1
Style: End,Barlow Condensed ExtraBold,78,&H00220B0C,&H00220B0C,&H0033BEF7,&H0033BEF7,0,0,0,0,100,100,2,0,3,22,0,2,60,60,400,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ass = os.path.join(HERE, f'out/captions_blend_{KEY}.ass'); open(ass, 'w').write(head + '\n'.join(ev) + '\n')
logo = os.path.join(HERE, 'mfz_logo.png')
out = os.path.join(HERE, f'out/MoneyFromZero_{KEY}_Short_blend.mp4' if not A.test else f'_test_short_{KEY}.mp4')
if A.test: vin = ['-loop', '1', '-t', '3', '-i', A.test]; dur = 3; ain = ['-f', 'lavfi', '-t', '3', '-i', 'anullsrc=r=48000:cl=stereo']
else: vin = ['-ss', str(VS), '-t', str(T1 - VS), '-i', A.src]; dur = DUR; ain = ['-ss', str(T0), '-t', str(T1 - T0), '-i', A.mix]
fc = (f"[0:v]fps=30,tpad=start_mode=clone:start_duration={round(VS - T0, 3) if not A.test else 0}:stop_mode=clone:stop_duration={TAIL if not A.test else 0},split[a][b];"
      "[a]scale=-2:1920,crop=1080:1920,gblur=sigma=38,eq=brightness=-0.16:saturation=1.15[bg];"
      "[b]scale=1080:-2[fg];"
      "[bg][fg]overlay=0:700[c0];"
      "[c0]drawbox=x=0:y=696:w=1080:h=4:color=0xF7BE33@0.9:t=fill,drawbox=x=0:y=1308:w=1080:h=4:color=0xF7BE33@0.9:t=fill[c1];"
      "[2:v]scale=230:-1[lg];[c1][lg]overlay=(W-w)/2:150[c2];"
      f"[c2]subtitles={ass}:fontsdir=/root/.fonts[v]")
af = f"[1:a]afade=t=in:d=0.05,afade=t=out:st={max(0, T1 - T0 - .5)}:d=0.5,apad=whole_dur={dur}[a]" if not A.test else "[1:a]anull[a]"
cmd = ['ffmpeg', '-v', 'error', '-y', *vin, *ain, '-i', logo, '-filter_complex', fc + ';' + af, '-map', '[v]', '-map', '[a]',
       '-t', str(dur), '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]
subprocess.run(cmd, check=True); print(out)
