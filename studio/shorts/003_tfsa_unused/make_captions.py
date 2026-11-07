"""Word-synced burnt-in captions (ASS) from the narration's word timings.
Cards of up to MAX_CHARS, never splitting a rand amount; amounts and percentages in gold."""
import json, re, sys

HERE = sys.argv[1] if len(sys.argv) > 1 else "."
words = json.load(open(f"{HERE}/words_B.json"))
END = json.load(open(f"{HERE}/timings.json"))["duration"]
MAX_CHARS = 16
GOLD = "&H33BEF7&"   # #F7BE33 in ASS BGR
CREAM = "&HDFEEF4&"  # #F4EEDF


def ts(t):
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def is_amount(w):
    return bool(re.search(r"R\d|\d%", w))


# group words into cards; break after sentence-ending punctuation
cards, cur = [], []
for w in words:
    text = w[0]
    cand = " ".join([x[0] for x in cur] + [text])
    if cur and (len(cand) > MAX_CHARS or cur[-1][0][-1] in ".:!?"):
        cards.append(cur); cur = []
    cur.append(w)
if cur:
    cards.append(cur)

events = []
for i, c in enumerate(cards):
    start = c[0][1]
    nxt = cards[i + 1][0][1] if i + 1 < len(cards) else END
    end = min(nxt, c[-1][2] + 0.45)
    if end - start < 0.25:
        end = start + 0.25
    parts = []
    for w in c:
        t = w[0].replace(" ", " ")
        parts.append("{\\c" + GOLD + "}" + t + "{\\c" + CREAM + "}" if is_amount(w[0]) else t)
    events.append(f"Dialogue: 0,{ts(start)},{ts(end)},Cap,,0,0,0,,{{\\fad(40,0)}}" + " ".join(parts))

head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Barlow ExtraBold,96,&H00DFEEF4,&H00DFEEF4,&H00141212,&H96000000,0,0,0,0,100,100,0,0,1,7,4,2,70,70,400,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
open(f"{HERE}/captions.ass", "w").write(head + "\n".join(events) + "\n")
print("cards:", len(events))
for e in events[:6]:
    print(e)
