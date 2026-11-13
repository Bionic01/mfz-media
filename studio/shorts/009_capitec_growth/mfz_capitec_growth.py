import os, json
from manim import *
from manim.utils.exceptions import EndSceneEarlyException

PREVIEW = os.environ.get("PREVIEW") == "1"
config.pixel_width = 1080 if PREVIEW else 2160
config.pixel_height = 1920 if PREVIEW else 3840
config.frame_rate = 30 if PREVIEW else 60
config.frame_height = 16
config.frame_width = 9
config.background_color = "#121214"

STOP = float(os.environ["STOP"]) if os.environ.get("STOP") else None
HERE = os.path.dirname(os.path.abspath(__file__))
TIM = json.load(open(os.path.join(HERE, "timings.json")))
CUE = {x["key"]: (x["start"], x["end"]) for x in TIM["lines"]}
END = TIM["duration"] + 0.5

BG = "#121214"
TEXT = "#F4EEDF"
MUTED = "#B9B3A8"
GREEN = "#2FD27F"
GOLD = "#F7BE33"
GOLD_D = "#E3A114"
RED = "#FF5D5D"
PANEL = "#1F1F23"
TILE_TOP = "#2B2B30"
STROKE = "#3A3A41"
GREY = "#55555E"
BLUE = "#6CB4FF"


def bold(txt, size, color=TEXT):
    return Text(txt, font="Barlow Condensed", weight=BOLD, font_size=size, color=color)


def label(txt, size, color=TEXT):
    return Text(txt, font="Barlow", weight=SEMIBOLD, font_size=size, color=color)


def rands(v):
    return "R" + f"{int(round(v)):,}".replace(",", " ")


def coin(r=0.32):
    c = Circle(radius=r, color="#B7791F", stroke_width=5, fill_color=GOLD, fill_opacity=1)
    return VGroup(c, bold("R", int(r * 110), "#6B3F00").move_to(c))


def tick_icon(color=GREEN, s=0.42):
    return VMobject(color=color, stroke_width=10).set_points_as_corners(
        [[-s * 0.55, 0, 0], [-s * 0.1, -s * 0.45, 0], [s * 0.6, s * 0.5, 0]])


def box(w, h, y, x=0, stroke=STROKE, sw=3, r=0.28):
    return RoundedRectangle(corner_radius=r, width=w, height=h, color=stroke, stroke_width=sw,
                            fill_color=PANEL, fill_opacity=1).move_to([x, y, 0])


def flip_tile(ch, w=1.1, h=1.55, color=TEXT, gold_edge=False):
    """A split-flap tile: darker bottom flap, lighter top flap, the character, and the flap gap."""
    cr = w * 0.1
    base = RoundedRectangle(corner_radius=cr, width=w, height=h, stroke_width=0,
                            fill_color="#202024", fill_opacity=1)
    top_clip = Rectangle(width=w + 0.2, height=h / 2 + 0.1).move_to(base.get_center() + UP * (h / 4 + 0.05))
    top = Intersection(base, top_clip, stroke_width=0, fill_color=TILE_TOP, fill_opacity=1)
    glyph = bold(ch, int(h * 74), color)
    glyph.scale_to_fit_height(h * 0.6).move_to(base)
    gap = Rectangle(width=w, height=h * 0.028, stroke_width=0, fill_color=BG, fill_opacity=1).move_to(base)
    parts = [base, top, glyph, gap]
    if gold_edge:
        parts.append(RoundedRectangle(corner_radius=cr, width=w, height=h, stroke_width=3,
                                      color=GOLD, stroke_opacity=0.7, fill_opacity=0))
    return VGroup(*parts)


def brand_mark():
    t = flip_tile("0", w=0.5, h=0.7, color=GOLD)
    name = bold("MONEY FROM ZERO", 40, TEXT)
    return VGroup(t, name).arrange(RIGHT, buff=0.22)


WORDS = json.load(open(os.path.join(HERE, "words_raw.json")))


def wt(key, word, nth=1):
    """Start time of the nth occurrence of `word` inside line `key`."""
    s, e = CUE[key]
    k = 0
    for w in WORDS:
        tok = w[0].lower().strip(".,'?")
        ok = (tok == word.lower()) if word[0].isdigit() else tok.startswith(word.lower())
        if s - 0.01 <= w[1] <= e + 0.01 and ok:
            k += 1
            if k == nth:
                return w[1]
    raise KeyError((key, word))


def bank_icon(color=TEXT, s=1.0):
    roof = Polygon([-1.5 * s, 0.55 * s, 0], [1.5 * s, 0.55 * s, 0], [0, 1.45 * s, 0], stroke_width=0,
                   fill_color=color, fill_opacity=1)
    beam = Rectangle(width=3.0 * s, height=0.22 * s, stroke_width=0, fill_color=color, fill_opacity=1).move_to([0, 0.4 * s, 0])
    cols = VGroup(*[Rectangle(width=0.32 * s, height=1.5 * s, stroke_width=0, fill_color=color, fill_opacity=1)
                    .move_to([x * s, -0.5 * s, 0]) for x in (-1.05, -0.35, 0.35, 1.05)])
    base = Rectangle(width=3.3 * s, height=0.3 * s, stroke_width=0, fill_color=color, fill_opacity=1).move_to([0, -1.4 * s, 0])
    return VGroup(roof, beam, cols, base)


def shield_icon(color=GREEN, s=1.0):
    pts = [[-1.2, 1.3, 0], [0, 1.75, 0], [1.2, 1.3, 0], [1.1, -0.2, 0], [0, -1.6, 0], [-1.1, -0.2, 0]]
    sh = Polygon(*[[p[0] * s, p[1] * s, 0] for p in pts], color=color, stroke_width=10 * s,
                 fill_color=color, fill_opacity=0.15)
    return sh


def person(color=MUTED, s=1.0):
    head = Circle(radius=0.32 * s, stroke_width=0, fill_color=color, fill_opacity=1).move_to([0, 0.55 * s, 0])
    body = RoundedRectangle(corner_radius=0.3 * s, width=0.95 * s, height=0.85 * s, stroke_width=0,
                            fill_color=color, fill_opacity=1).move_to([0, -0.3 * s, 0])
    return VGroup(head, body)


def calendar_icon(day="31", s=1.0, color=RED):
    body = RoundedRectangle(corner_radius=0.15 * s, width=2.2 * s, height=2.2 * s, color=STROKE, stroke_width=4,
                            fill_color=PANEL, fill_opacity=1)
    top = Rectangle(width=2.2 * s, height=0.55 * s, stroke_width=0, fill_color=color, fill_opacity=1)
    top.move_to(body.get_top() + DOWN * 0.275 * s)
    rings = VGroup(*[RoundedRectangle(corner_radius=0.05, width=0.14 * s, height=0.4 * s, stroke_width=0,
                                      fill_color=TEXT, fill_opacity=1).move_to(body.get_top() + [x * s, 0, 0])
                     for x in (-0.55, 0.55)])
    d = bold(day, 120, TEXT).scale_to_fit_height(1.0 * s).move_to(body.get_center() + DOWN * 0.25 * s)
    return VGroup(body, top, rings, d)


def jar_icon(s=1.0):
    j = RoundedRectangle(corner_radius=0.45 * s, width=2.6 * s, height=3.2 * s, color=TEXT, stroke_width=8,
                         fill_opacity=0)
    lid = RoundedRectangle(corner_radius=0.1 * s, width=1.9 * s, height=0.4 * s, stroke_width=0,
                           fill_color=GOLD_D, fill_opacity=1).next_to(j, UP, buff=0.04)
    return VGroup(j, lid)


def bolt_icon(color=RED, s=1.0):
    pts = [[0.25, 1.0], [-0.55, -0.1], [-0.05, -0.1], [-0.3, -1.0], [0.55, 0.15], [0.05, 0.15]]
    return Polygon(*[[p[0] * s, p[1] * s, 0] for p in pts], stroke_width=0, fill_color=color, fill_opacity=1)


def clock_icon(color=GREEN, s=1.0):
    c = Circle(radius=0.9 * s, color=color, stroke_width=10 * s, fill_opacity=0)
    h1 = Line([0, 0, 0], [0, 0.6 * s, 0], color=color, stroke_width=10 * s)
    h2 = Line([0, 0, 0], [0.42 * s, -0.2 * s, 0], color=color, stroke_width=10 * s)
    return VGroup(c, h1, h2)


def phone_icon(w=3.0, h=5.4):
    body = RoundedRectangle(corner_radius=0.4, width=w, height=h, color=TEXT, stroke_width=6,
                            fill_color="#18181B", fill_opacity=1)
    notch = RoundedRectangle(corner_radius=0.08, width=w * 0.3, height=0.14, stroke_width=0,
                             fill_color=TEXT, fill_opacity=1).move_to(body.get_top() + DOWN * 0.28)
    return VGroup(body, notch)


def atm_icon(s=1.0):
    body = RoundedRectangle(corner_radius=0.2 * s, width=3.6 * s, height=4.2 * s, color=STROKE, stroke_width=6,
                            fill_color=PANEL, fill_opacity=1)
    scr = RoundedRectangle(corner_radius=0.1 * s, width=2.6 * s, height=1.5 * s, stroke_width=0,
                           fill_color="#2A3B4C", fill_opacity=1).move_to(body.get_center() + UP * 0.95 * s)
    t = bold("ATM", 70, BLUE).scale_to_fit_height(0.55 * s).move_to(scr)
    slot = RoundedRectangle(corner_radius=0.05, width=2.4 * s, height=0.22 * s, stroke_width=0,
                            fill_color=BG, fill_opacity=1).move_to(body.get_center() + DOWN * 1.15 * s)
    keys = VGroup(*[RoundedRectangle(corner_radius=0.04, width=0.42 * s, height=0.26 * s, stroke_width=0,
                                     fill_color=GREY, fill_opacity=1) for _ in range(6)]).arrange_in_grid(2, 3, buff=0.1 * s)
    keys.move_to(body.get_center() + DOWN * 0.25 * s)
    return VGroup(body, scr, t, keys, slot)


def note(txt="R1 000", w=3.0, h=1.4):
    r = RoundedRectangle(corner_radius=0.12, width=w, height=h, color="#1E7A4C", stroke_width=5,
                         fill_color="#2E9E63", fill_opacity=1)
    inner = RoundedRectangle(corner_radius=0.08, width=w - 0.3, height=h - 0.3, color="#BFF0D3", stroke_width=2,
                             fill_opacity=0).move_to(r)
    t = bold(txt, 80, "#0F3D25").scale_to_fit_height(h * 0.42).move_to(r)
    return VGroup(r, inner, t)


def pin_icon(color=RED, s=1.0):
    head = Circle(radius=0.55 * s, stroke_width=0, fill_color=color, fill_opacity=1)
    tip = Polygon([-0.48 * s, -0.25 * s, 0], [0.48 * s, -0.25 * s, 0], [0, -1.35 * s, 0], stroke_width=0,
                  fill_color=color, fill_opacity=1)
    hole = Circle(radius=0.2 * s, stroke_width=0, fill_color=BG, fill_opacity=1)
    return VGroup(tip, head, hole)


def trophy_icon(s=1.0):
    cup = Polygon([-1.0 * s, 1.0 * s, 0], [1.0 * s, 1.0 * s, 0], [0.55 * s, -0.55 * s, 0], [-0.55 * s, -0.55 * s, 0],
                  stroke_width=0, fill_color=GOLD, fill_opacity=1)
    hl = Arc(radius=0.45 * s, start_angle=PI / 2, angle=PI, color=GOLD, stroke_width=14 * s).move_to([-1.05 * s, 0.45 * s, 0])
    hr = Arc(radius=0.45 * s, start_angle=-PI / 2, angle=PI, color=GOLD, stroke_width=14 * s).move_to([1.05 * s, 0.45 * s, 0])
    stem = Rectangle(width=0.3 * s, height=0.6 * s, stroke_width=0, fill_color=GOLD_D, fill_opacity=1).move_to([0, -0.85 * s, 0])
    base = RoundedRectangle(corner_radius=0.08 * s, width=1.6 * s, height=0.4 * s, stroke_width=0, fill_color=GOLD_D,
                            fill_opacity=1).move_to([0, -1.3 * s, 0])
    one = bold("1", 100, BG).scale_to_fit_height(0.85 * s).move_to([0, 0.45 * s, 0])
    return VGroup(hl, hr, cup, stem, base, one)


class MFZ_CAPITEC_GROWTH(Scene):
    def P(self, *anims, rt=1.0, **kw):
        self.play(*anims, run_time=rt, **kw)
        self.t += rt

    def W(self, dt):
        if dt > 1e-3:
            self.wait(dt)
            self.t += dt

    def at(self, target):
        if isinstance(target, str):
            target = CUE[target][0]
        if STOP is not None and target >= STOP:
            self.W(STOP - self.t)
            raise EndSceneEarlyException()
        self.W(target - self.t)

    def construct(self):
        self.t = 0.0
        bg = ImageMobject(os.path.join(HERE, "bg_board.png")).scale_to_fit_height(16)
        bg.set_z_index(-10)
        brand = brand_mark().move_to([0, 6.95, 0])
        self.add(bg, brand)

        def tiles(txt, w=1.0, h=1.4, color=TEXT, gap=0.08):
            def one(c):
                if c == " ":
                    return Rectangle(width=w * 0.35, height=h, stroke_width=0, fill_opacity=0)
                if c == ".":
                    d = Dot(radius=h * 0.07, color=color)
                    holder = Rectangle(width=w * 0.35, height=h, stroke_width=0, fill_opacity=0)
                    d.move_to(holder.get_bottom() + UP * h * 0.2)
                    return VGroup(holder, d)
                return flip_tile(c, w, h, color)
            row = VGroup(*[one(c) for c in txt])
            return row.arrange(RIGHT, buff=gap)

        def idle(mob, until, k=1.05):
            dt = until - self.t
            if dt > 0.5:
                self.P(mob.animate.scale(k), rate_func=there_and_back, rt=dt)

        def flip_in(group, rt=0.6):
            for t in group:
                t.save_state()
                t.stretch(0.02, 1)
            self.add(*group)
            self.P(LaggedStart(*[Restore(t) for t in group], lag_ratio=0.1), rt=rt)

        def crowd(n_cols, n_rows, s, y, color=MUTED):
            g = VGroup(*[person(color, s) for _ in range(n_cols * n_rows)])
            return g.arrange_in_grid(n_rows, n_cols, buff=0.12 * s / 0.3).move_to([0, y, 0])

        def hook_scene(key, question=False):
            yr = tiles("2003", 0.9, 1.25, GOLD).move_to([0, 5.35, 0])
            num = tiles("25 000", 1.15, 1.6, TEXT).move_to([0, 3.0, 0])
            lab = label("clients", 56, MUTED).move_to([0, 1.75, 0])
            one = person(TEXT, 0.9).move_to([0, -0.4, 0])
            self.at(key)
            for t in list(yr) + list(num):
                t.save_state(); t.stretch(0.02, 1)
            self.add(*yr, *num)
            self.P(LaggedStart(*[Restore(t) for t in list(yr) + list(num)], lag_ratio=0.08), FadeIn(lab), rt=0.6)
            self.at(wt(key, "25,000") - 0.15)
            self.P(FadeIn(one, scale=0.5), Indicate(num, color=GOLD, scale_factor=1.06), rt=0.4)
            self.P(Indicate(one, color=GOLD), rt=0.5)
            # the jump
            t_key = "26.6"
            idle(VGroup(num, one), wt(key, t_key) - 0.4, 1.07)
            self.at(wt(key, t_key) - 0.35)
            yr2 = tiles("2026", 0.9, 1.25, GOLD).move_to(yr)
            num2 = tiles("26.6 MILLION", 0.66, 1.2, GOLD, gap=0.05).move_to([0, 3.0, 0])
            grid = crowd(12, 7, 0.3, -0.85, MUTED)
            self.P(FadeOut(yr), FadeOut(num), FadeOut(one), rt=0.15)
            for t in list(yr2) + list(num2):
                t.save_state(); t.stretch(0.02, 1)
            self.add(*yr2, *num2)
            self.P(LaggedStart(*[Restore(t) for t in list(yr2) + list(num2)], lag_ratio=0.05),
                   LaggedStart(*[FadeIn(p, scale=0.3) for p in grid], lag_ratio=0.01), rt=1.0)
            out = [yr2, num2, lab, grid]
            if question:
                q = bold("HOW?", 220, GREEN).move_to([0, -0.85, 0]).set_z_index(5)
                self.P(grid.animate.set_opacity(0.25), FadeIn(q, scale=1.4), rt=0.35)
                idle(q, END - 0.05, 1.12)
                out.append(q)
            else:
                self.P(grid.animate.set_color(TEXT), rt=0.6)
            return VGroup(*out)

        # ================= HOOK =================
        hook_grp = hook_scene("hook")

        # ================= WHO: Capitec, 2001, Stellenbosch, microlender =================
        name = tiles("CAPITEC", 0.98, 1.4, TEXT).move_to([0, 5.3, 0])
        bk = bank_icon(TEXT, 0.95).move_to([-1.9, 2.4, 0])
        cal = calendar_icon("2001", 1.1, GREEN).move_to([2.0, 2.5, 0])
        cal[3].scale_to_fit_width(1.7).move_to(cal[0].get_center() + DOWN * 0.3)
        pin = pin_icon(RED, 0.75).move_to([-2.6, -0.5, 0])
        town = bold("STELLENBOSCH", 110, TEXT).scale_to_fit_width(5.0).next_to(pin, RIGHT, buff=0.35)

        self.at("who")
        self.P(FadeOut(hook_grp), rt=0.25)
        flip_in(name, rt=0.55)
        self.P(FadeIn(bk, shift=UP * 0.4), rt=0.3)
        self.at(wt("who", "2001") - 0.15)
        self.P(FadeIn(cal, shift=DOWN * 0.4), rt=0.35)
        self.at(wt("who", "Stellenbosch") - 0.15)
        self.P(FadeIn(pin, shift=DOWN * 0.8), FadeIn(town, shift=LEFT * 0.3), rt=0.4)
        self.at(wt("who", "small") - 0.15)
        sp = RoundedRectangle(corner_radius=0.5, width=7.4, height=1.0, color=GOLD, stroke_width=5,
                              fill_color=GOLD, fill_opacity=0.14).move_to([0, -2.45, 0])
        st = bold("A SMALL MICROLENDER", 64, GOLD).move_to(sp)
        if st.width > 6.9:
            st.scale_to_fit_width(6.9)
        self.P(FadeIn(sp), FadeIn(st), bk.animate.scale(0.75), rt=0.4)
        self.P(Indicate(bk, color=GOLD), rt=0.5)
        who_grp = VGroup(name, bk, cal, pin, town, sp, st)

        # ================= MATH: dot vs giant circle, x1000, 23 years =================
        dotc = Dot([0, 2.4, 0], radius=0.09, color=GOLD)
        dl = label("25 000", 46, GOLD).next_to(dotc, RIGHT, buff=0.3)
        big = Circle(radius=0.09 * (26.6e6 / 25000) ** 0.5, color=GREEN, stroke_width=6, fill_color=GREEN,
                     fill_opacity=0.18).move_to([0, 2.4, 0])
        bl = bold("26.6 MILLION", 110, GREEN).scale_to_fit_width(5.2).move_to([0, 2.4, 0])
        times = bold("MORE THAN 1 000×", 120, TEXT).scale_to_fit_width(7.6).move_to([0, -1.3, 0])
        tl = Line([-2.4, -2.95, 0], [2.4, -2.95, 0], color=STROKE, stroke_width=8)
        y1 = label("2003", 44, MUTED).next_to(tl.get_start(), LEFT, buff=0.2)
        y2 = label("2026", 44, MUTED).next_to(tl.get_end(), RIGHT, buff=0.2)
        prog = Line([-2.4, -2.95, 0], [2.4, -2.95, 0], color=GOLD, stroke_width=10)
        yrs = bold("ABOUT 23 YEARS", 60, GOLD).move_to([0, -2.35, 0])
        self.at("math")
        self.P(FadeOut(who_grp), rt=0.25)
        self.P(FadeIn(dotc, scale=4), FadeIn(dl), rt=0.35)
        self.P(Flash(dotc, color=GOLD), rt=0.4)
        self.at(wt("math", "26.6") - 0.2)
        self.P(GrowFromCenter(big), FadeOut(dl), FadeOut(dotc), rt=0.9)
        self.P(FadeIn(bl, scale=0.6), rt=0.35)
        idle(VGroup(big, bl), wt("math", "thousand") - 0.32, 1.06)
        self.at(wt("math", "thousand") - 0.3)
        self.P(FadeIn(times, scale=1.3), rt=0.35)
        self.P(Indicate(times, color=GOLD, scale_factor=1.06), rt=0.5)
        self.at(wt("math", "23") - 0.5)
        self.P(Create(tl), FadeIn(y1), FadeIn(y2), rt=0.3)
        self.P(Create(prog), FadeIn(yrs), rt=0.7)
        self.P(big.animate.scale(1.04), rate_func=there_and_back, rt=0.6)
        math_grp = VGroup(dotc, big, bl, times, tl, y1, y2, prog, yrs)

        # ================= TOP: biggest by number of clients =================
        tro = trophy_icon(1.6).move_to([0, 3.7, 0])
        t1 = bold("SOUTH AFRICA'S BIGGEST BANK", 100, TEXT).scale_to_fit_width(7.8).move_to([0, 0.95, 0])
        t2 = label("by number of clients", 64, GOLD).move_to([0, -0.15, 0])
        row = crowd(14, 2, 0.32, -1.9, MUTED)
        self.at("top")
        self.P(FadeOut(math_grp), rt=0.25)
        self.P(FadeIn(tro, shift=UP * 0.6, scale=0.7), rt=0.4)
        self.at(wt("top", "biggest") - 0.3)
        self.P(FadeIn(t1, scale=1.15), rt=0.35)
        self.at(wt("top", "number") - 0.15)
        self.P(FadeIn(t2), LaggedStart(*[FadeIn(p, shift=UP * 0.3) for p in row], lag_ratio=0.03), rt=0.7)
        self.P(Wiggle(tro, scale_value=1.06), rt=0.6)
        top_grp = VGroup(tro, t1, t2, row)

        # ================= FEES: statement grows lines =================
        lesson = bold("THE LESSON FOR YOU", 100, GREEN).scale_to_fit_width(7.0).move_to([0, 5.85, 0])
        doc = RoundedRectangle(corner_radius=0.2, width=7.2, height=6.2, color=STROKE, stroke_width=4,
                               fill_color="#ECE6D6", fill_opacity=1).move_to([0, 1.6, 0])
        d_head = bold("YOUR BANK COST", 72, BG).move_to(doc.get_top() + DOWN * 0.65)
        items = ["Monthly fee", "+ Debit orders", "+ Payments", "+ Cash withdrawals"]
        cue_words = [("monthly", 1), ("debit", 1), ("payments", 1), ("cash", 1)]
        rows = VGroup()
        for i, a in enumerate(items):
            y = doc.get_top()[1] - 1.75 - i * 1.1
            r = RoundedRectangle(corner_radius=0.12, width=6.6, height=1.0, stroke_width=0,
                                 fill_color=(GREEN if i == 0 else RED), fill_opacity=0.16).move_to([0, y, 0])
            tx = label(a, 54, "#2A2A30").move_to([-3.0, y, 0], aligned_edge=LEFT)
            rows.add(VGroup(r, tx))
        more = bold("MORE THAN THE MONTHLY FEE", 80, GOLD).scale_to_fit_width(7.6).move_to([0, -2.4, 0])
        self.at("fees")
        self.P(FadeOut(top_grp), rt=0.25)
        self.P(FadeIn(lesson, shift=DOWN * 0.2), rt=0.35)
        self.at(wt("fees", "bank") - 0.15)
        self.P(FadeIn(doc, shift=UP * 0.5), FadeIn(d_head), rt=0.4)
        self.at(wt("fees", "monthly") - 0.15)
        self.P(FadeIn(rows[0], shift=RIGHT * 0.3), FadeIn(more), rt=0.35)
        for k in (1, 2, 3):
            w, n = cue_words[k]
            self.at(wt("fees", w, n) - 0.12)
            self.P(FadeIn(rows[k], shift=RIGHT * 0.4), rt=0.3)
        self.P(Wiggle(VGroup(rows[1], rows[2], rows[3]), scale_value=1.03), rt=0.5)
        fees_grp = VGroup(lesson, doc, d_head, rows, more)

        # ================= TIP: 3 months, compare =================
        mons = VGroup(*[calendar_icon(m, 0.85, BLUE) for m in ("1", "2", "3")]).arrange(RIGHT, buff=0.45).move_to([0, 4.6, 0])
        for c in mons:
            c[3].scale_to_fit_height(0.7).move_to(c[0].get_center() + DOWN * 0.22)
        add = bold("ADD UP 3 MONTHS", 110, TEXT).scale_to_fit_width(7.2).move_to([0, 2.75, 0])
        accA = box(3.4, 2.6, 0.45, x=-2.0, stroke=MUTED, sw=4)
        accB = box(3.4, 2.6, 0.45, x=2.0, stroke=GREEN, sw=6)
        aA = VGroup(label("your", 40, MUTED), label("account", 40, MUTED)).arrange(DOWN, buff=0.1).move_to(accA)
        aB = VGroup(label("another", 40, TEXT), label("account", 40, TEXT)).arrange(DOWN, buff=0.1).move_to(accB)
        vs = VGroup(Circle(radius=0.45, color=MUTED, stroke_width=5, fill_color=BG, fill_opacity=1), bold("vs", 52, TEXT)).move_to([0, 0.45, 0])
        less = VGroup(tick_icon(GREEN, 0.5), bold("COSTS LESS?", 90, GREEN)).arrange(RIGHT, buff=0.3).move_to([0, -1.75, 0])
        self.at("tip")
        self.P(FadeOut(fees_grp), rt=0.25)
        self.at(wt("tip", "three") - 0.2)
        self.P(LaggedStart(*[FadeIn(c, shift=DOWN * 0.5) for c in mons], lag_ratio=0.25), FadeIn(add), rt=0.6)
        self.at(wt("tip", "statement") - 0.1)
        self.P(Indicate(add, color=GOLD, scale_factor=1.05), rt=0.4)
        self.at(wt("tip", "another") - 0.2)
        self.P(FadeIn(accA), FadeIn(aA), FadeIn(accB), FadeIn(aB), FadeIn(vs), rt=0.35)
        self.at(wt("tip", "less") - 0.2)
        self.P(FadeIn(less, scale=1.2), Indicate(accB, color=GREEN, scale_factor=1.05), rt=0.4)
        tip_grp = VGroup(mons, add, accA, accB, aA, aB, vs, less)

        # ================= GUIDE + FOLLOW =================
        card = RoundedRectangle(corner_radius=0.35, width=7.4, height=3.4, color=GOLD, stroke_width=6,
                                fill_color=PANEL, fill_opacity=1).move_to([0, 3.3, 0])
        g1 = label("FULL STORY", 44, GOLD).move_to(card.get_center() + UP * 1.0)
        g2 = bold("THE CAPITEC STORY", 96, TEXT).scale_to_fit_width(6.6).move_to(card.get_center() + UP * 0.05)
        g3 = label("+ a real month of fees", 44, MUTED).move_to(card.get_center() + DOWN * 1.0)
        fpill = RoundedRectangle(corner_radius=0.55, width=6.2, height=1.1, stroke_width=0, fill_color=GREEN,
                                 fill_opacity=1).move_to([0, 0.1, 0])
        fpill_t = bold("+ FOLLOW", 66, BG).move_to(fpill)
        daily = label("a new money rule every day", 50, TEXT).move_to([0, -1.3, 0])
        disc = label("General information, not financial advice.", 34, MUTED).move_to([0, -2.6, 0])
        self.at("guide")
        self.P(FadeOut(tip_grp), rt=0.3)
        self.P(DrawBorderThenFill(card), FadeIn(g1), FadeIn(g2), FadeIn(g3), rt=0.6)
        self.at(wt("guide", "month") - 0.1)
        self.P(Indicate(g2, color=GOLD, scale_factor=1.06), rt=0.6)
        self.at(wt("guide", "channel") - 0.1)
        self.P(FadeIn(fpill, scale=0.8), FadeIn(fpill_t, scale=0.8), FadeIn(disc), rt=0.4)
        self.at(wt("guide", "Follow") - 0.1)
        self.P(FadeIn(daily, shift=UP * 0.2), rt=0.3)
        self.P(Indicate(VGroup(fpill, fpill_t), color=GREEN, scale_factor=1.08), rt=0.7)
        guide_grp = VGroup(card, g1, g2, g3, fpill, fpill_t, daily, disc)

        # ================= LOOP =================
        self.at(CUE["loop"][0] - 0.3)
        self.P(FadeOut(guide_grp), rt=0.3)
        hook_scene("loop", question=True)
        self.at(END)
