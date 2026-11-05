"""Build an SRT from words_all.json: amounts shown as R20,000, max 2 lines of 42 chars, break on sentences/pauses."""
import json, re, sys

W = json.load(open("words_all.json"))
out = sys.argv[1] if len(sys.argv) > 1 else "subs.en.srt"

# merge "<number> rand" -> "R<number>", "<n> billion rand" -> "R<n> billion"
toks = []
i = 0
while i < len(W):
    t, s, e, k = W[i]
    if re.fullmatch(r"\d[\d,]*", t) and i + 1 < len(W) and re.fullmatch(r"rand[.,!?]?", W[i + 1][0].lower()):
        toks.append(["R" + t + W[i + 1][0][4:], s, W[i + 1][2]])
        i += 2
        continue
    if (re.fullmatch(r"\d[\d,]*", t) and i + 2 < len(W) and W[i + 1][0] in ("billion", "million")
            and re.fullmatch(r"rand[.,!?]?", W[i + 2][0].lower())):
        toks.append(["R" + t, s, W[i][2]])
        toks.append([W[i + 1][0] + W[i + 2][0][4:], W[i + 1][1], W[i + 2][2]])
        i += 3
        continue
    toks.append([t, s, e])
    i += 1

MAXL, MAXC, MAXD = 42, 84, 6.0
cues, cur = [], []


def flush():
    if cur:
        cues.append(list(cur))
        cur.clear()


for j, w in enumerate(toks):
    if cur:
        text = " ".join(x[0] for x in cur + [w])
        gap = w[1] - cur[-1][2]
        if gap > 0.6:
            flush()
        elif len(text) > MAXC or w[2] - cur[0][1] > MAXD:
            cut = max([k for k in range(3, len(cur)) if re.search(r"[,;:]$", cur[k - 1][0])], default=None)
            if cut:
                rest = cur[cut:]
                del cur[cut:]
                flush()
                cur.extend(rest)
            else:
                flush()
    cur.append(w)
    if re.search(r"[.?!]$", w[0]) and len(" ".join(x[0] for x in cur)) > 20:
        flush()
flush()


def lines(ws):
    text = " ".join(x[0] for x in ws)
    if len(text) <= MAXL:
        return text
    best, bi = None, 1
    for k in range(1, len(ws)):
        a = " ".join(x[0] for x in ws[:k])
        b = " ".join(x[0] for x in ws[k:])
        if len(a) <= MAXL and len(b) <= MAXL:
            score = abs(len(a) - len(b)) - (8 if re.search(r"[,.:;?]$", a) else 0)
            if best is None or score < best:
                best, bi = score, k
    if best is None:
        bi = min(range(1, len(ws)), key=lambda k: max(len(" ".join(x[0] for x in ws[:k])),
                                                      len(" ".join(x[0] for x in ws[k:]))))
    return " ".join(x[0] for x in ws[:bi]) + "\n" + " ".join(x[0] for x in ws[bi:])


def ts(t):
    h, r = divmod(t, 3600)
    m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s - int(s)) * 1000)):03d}".replace(",1000", ",999")


with open(out, "w", encoding="utf-8") as f:
    for n, c in enumerate(cues, 1):
        start = c[0][1]
        end = c[-1][2]
        if n < len(cues):
            end = min(max(end, start + 1.0), cues[n][0][1] - 0.02)
        f.write(f"{n}\n{ts(start)} --> {ts(end)}\n{lines(c)}\n\n")
print(len(cues), "cues ->", out)
