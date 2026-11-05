"""Split script.md into chapters, spoken.txt and 3 roughly equal voice parts (chapter boundaries)."""
import json, re, sys

src = open("script.md", encoding="utf-8").read()
chapters, key, buf = [], None, []
for line in src.splitlines():
    m = re.fullmatch(r"\[([a-z0-9_]+)\]", line.strip())
    if m and "_" in m.group(1) or (m and m.group(1).startswith("ch")):
        if key:
            chapters.append([key, "\n".join(buf).strip()])
        key, buf = m.group(1), []
    elif key:
        buf.append(line)
if key:
    chapters.append([key, "\n".join(buf).strip()])

n_parts = int(sys.argv[1]) if len(sys.argv) > 1 else 3
total = sum(len(t) for _, t in chapters)
parts, cur, acc = [], [], 0
for k, t in chapters:
    cur.append(k)
    acc += len(t)
    if len(parts) < n_parts - 1 and acc >= total * (len(parts) + 1) / n_parts:
        parts.append(cur)
        cur = []
if cur:
    parts.append(cur)

text = dict(chapters)
for i, keys in enumerate(parts, 1):
    open(f"part{i}.txt", "w", encoding="utf-8").write("\n\n".join(text[k] for k in keys))
spoken = "\n\n".join(t for _, t in chapters)
open("spoken.txt", "w", encoding="utf-8").write(spoken)
json.dump({"chapters": chapters, "parts": parts}, open("parts.json", "w"), indent=1)
for i, keys in enumerate(parts, 1):
    s = "\n\n".join(text[k] for k in keys)
    print(f"part{i}: {keys} chars={len(s)} words={len(s.split())}")
print("total chars", len(spoken), "words", len(spoken.split()))
