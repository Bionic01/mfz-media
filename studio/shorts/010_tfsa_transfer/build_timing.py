"""Word timings (free transcription of the TTS node) -> words_raw.json, words_B.json (on-screen R amounts), timings.json."""
import json, re
LEAD, TAIL = 0.15, 0.55
raw = [w for w in json.load(open("words_raw_dl.json"))["words"] if w["type"] == "word"]
raw = [[w["text"], round(w["start"] + LEAD, 3), round(w["end"] + LEAD, 3)] for w in raw]
json.dump(raw, open("words_raw.json", "w"))
script = json.load(open("script.json"))
norm = lambda s: re.sub(r"[^a-z0-9%]", "", s.lower())
# line keys by consuming spoken tokens in order
lines, i = [], 0
for key, screen, tts in script:
    toks = [t for t in tts.split() if norm(t)]
    seg = raw[i:i + len(toks)]
    assert [norm(x[0]) for x in seg] == [norm(t) for t in toks], (key, seg, toks)
    lines.append({"key": key, "start": seg[0][1], "end": seg[-1][2], "n": len(toks), "text": screen})
    i += len(toks)
assert i == len(raw)
# on-screen words: "3,834 rand" -> "R3 834", "3 rand 20" -> "R3.20"
out, j = [], 0
while j < len(raw):
    t = raw[j][0]
    if j + 2 < len(raw) and t == "3" and norm(raw[j+1][0]) == "rand" and raw[j+2][0].startswith("20"):
        out.append(["R3.20" + raw[j+2][0][2:], raw[j][1], raw[j+2][2]]); j += 3; continue
    if re.fullmatch(r"\d+", t) and j + 1 < len(raw) and norm(raw[j+1][0]) == "percent":
        out.append([t + "%" + raw[j+1][0][7:], raw[j][1], raw[j+1][2]]); j += 2; continue
    if re.fullmatch(r"[\d,]+", t) and j + 1 < len(raw) and norm(raw[j+1][0]) == "rand":
        p = re.sub(r"^rand", "", raw[j+1][0])
        out.append(["R" + t.replace(",", " ") + p, raw[j][1], raw[j+1][2]]); j += 2; continue
    out.append(raw[j]); j += 1
json.dump(out, open("words_B.json", "w"), ensure_ascii=False)
dur = round(raw[-1][2] + TAIL, 2)
json.dump({"voice": "Darius (ElevenLabs eleven_v4) single take, 14 Nov 2026", "duration": dur, "lines": lines},
          open("timings.json", "w"), indent=1)
for l in lines: print(f'{l["key"]:8s} {l["start"]:6.2f} {l["end"]:6.2f}')
print("duration", dur); print(" ".join(w[0] for w in out))
