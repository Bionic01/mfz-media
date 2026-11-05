"""Join voice parts, master to -14 LUFS, and build words_all.json + timeline.json.

Needs: parts.json (from split_script.py), tts_part{i}.txt, audio/part{i}.mp3, words_part{i}_raw.json
"""
import json, re, subprocess, difflib

LEAD, GAP, TAIL = 0.4, 1.0, 2.0
P = json.load(open("parts.json"))
text = dict(P["chapters"])
parts = P["parts"]


def norm(w):
    return re.sub(r"[^a-z0-9%]", "", w.lower())


def to_tts(s):
    return re.sub(r"R(\d{1,3}(?:,\d{3})*(?:\.\d+)?)( billion| million)?", lambda m: m.group(1) + (m.group(2) or "") + " rand", s)


def dur(f):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                          "-of", "csv=p=0", f]).decode())


words_all, chapters, offset = [], [], LEAD
for pi, keys in enumerate(parts, 1):
    raw = [w for w in json.load(open(f"words_part{pi}_raw.json")) if not re.fullmatch(r"\[[^\]]+\]", w[0])]
    # expected tokens with chapter labels
    exp = []
    for k in keys:
        toks = [t for t in re.sub(r"\[[^\]]+\]", " ", to_tts(text[k])).split()]
        exp += [(norm(t), k) for t in toks if norm(t)]
    a = [norm(w[0]) for w in raw]
    b = [e[0] for e in exp]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    lab = [None] * len(raw)
    for i, j, n in sm.get_matching_blocks():
        for d in range(n):
            lab[i + d] = exp[j + d][1]
    # fill gaps from neighbours
    last = keys[0]
    for i in range(len(lab)):
        if lab[i] is None:
            lab[i] = last
        last = lab[i]
    print(f"part{pi}: {len(raw)} words, match ratio {sm.ratio():.3f}")
    for w, k in zip(raw, lab):
        if norm(w[0]) == "":
            continue
        words_all.append([w[0], round(w[1] + offset, 3), round(w[2] + offset, 3), k])
    offset += dur(f"audio/part{pi}.mp3") + GAP

duration = round(offset - GAP + TAIL, 2)
seen = []
for w in words_all:
    if w[3] not in seen:
        seen.append(w[3])
        chapters.append({"key": w[3], "start": w[1]})
json.dump(words_all, open("words_all.json", "w"))
json.dump({"duration": duration, "chapters": chapters}, open("timeline.json", "w"), indent=1)
for c in chapters:
    m, s = divmod(int(c["start"]), 60)
    print(f"{m}:{s:02d}  {c['key']}")
print("duration", duration, "words", len(words_all))

# audio: lead + parts with gaps + tail, 48 kHz
inputs, filt = [], []
for i in range(len(parts)):
    inputs += ["-i", f"audio/part{i + 1}.mp3"]
chain = f"aevalsrc=0:d={LEAD}:s=48000[l];"
segs = ["[l]"]
for i in range(len(parts)):
    chain += f"[{i}:a]aresample=48000,aformat=channel_layouts=mono[p{i}];"
    segs.append(f"[p{i}]")
    if i < len(parts) - 1:
        chain += f"aevalsrc=0:d={GAP}:s=48000[g{i}];"
        segs.append(f"[g{i}]")
chain += f"aevalsrc=0:d={TAIL}:s=48000[t];"
segs.append("[t]")
chain += "".join(segs) + f"concat=n={len(segs)}:v=0:a=1[out]"
subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", chain, "-map", "[out]",
                "-c:a", "pcm_s24le", "voice_raw.wav"], check=True)
# two-pass loudnorm
r = subprocess.run(["ffmpeg", "-i", "voice_raw.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json",
                    "-f", "null", "-"], capture_output=True, text=True)
js = json.loads(r.stderr[r.stderr.rfind("{"):r.stderr.rfind("}") + 1])
af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
      f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "voice_raw.wav", "-af", af + ",aresample=48000", "-ac", "2",
                "-c:a", "aac", "-b:a", "320k", "voice_master.m4a"], check=True)
r = subprocess.run(["ffmpeg", "-i", "voice_master.m4a", "-af", "ebur128", "-f", "null", "-"],
                   capture_output=True, text=True)
print([l for l in r.stderr.splitlines() if " I:" in l][-1], "| master", dur("voice_master.m4a"))
