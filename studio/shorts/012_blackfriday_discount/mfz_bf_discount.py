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


def cross_icon(color=RED, s=0.45):
    a = Line([-s, -s, 0], [s, s, 0], color=color, stroke_width=12)
    b = Line([-s, s, 0], [s, -s, 0], color=color, stroke_width=12)
    return VGroup(a, b)


def tv_icon(s=1.0, price=None, price_color=GOLD):
    scr = RoundedRectangle(corner_radius=0.15 * s, width=4.6 * s, height=2.9 * s, color=TEXT, stroke_width=8 * s,
                           fill_color="#22324A", fill_opacity=1)
    glare = Polygon([-2.0 * s, 1.2 * s, 0], [-0.9 * s, 1.2 * s, 0], [-1.9 * s, -0.4 * s, 0], stroke_width=0,
                    fill_color=BLUE, fill_opacity=0.25)
    leg = Polygon([-0.4 * s, -1.45 * s, 0], [0.4 * s, -1.45 * s, 0], [0.7 * s, -1.95 * s, 0], [-0.7 * s, -1.95 * s, 0],
                  stroke_width=0, fill_color=MUTED, fill_opacity=1)
    g = VGroup(leg, scr, glare)
    if price:
        tag = RoundedRectangle(corner_radius=0.12 * s, width=2.3 * s, height=0.9 * s, stroke_width=0,
                               fill_color=price_color, fill_opacity=1).move_to(scr.get_corner(UR) + [-0.55 * s, -0.1 * s, 0]).rotate(-0.15)
        tt = bold(price, 80, BG).scale_to_fit_height(0.55 * s).move_to(tag).rotate(-0.15)
        g.add(tag, tt)
    return g


def store_card(s=1.0, color=RED):
    c = RoundedRectangle(corner_radius=0.25 * s, width=4.2 * s, height=2.6 * s, stroke_width=0,
                         fill_color=color, fill_opacity=1)
    chip = RoundedRectangle(corner_radius=0.08 * s, width=0.75 * s, height=0.55 * s, stroke_width=0,
                            fill_color=GOLD, fill_opacity=1).move_to(c.get_center() + [-1.3 * s, 0.25 * s, 0])
    t = bold("STORE CARD", 60, TEXT).scale_to_fit_width(2.4 * s).move_to(c.get_center() + [0.55 * s, 0.75 * s, 0])
    num = label("•••• 4271", 40, TEXT).scale_to_fit_width(2.0 * s).move_to(c.get_center() + [0.4 * s, -0.65 * s, 0])
    return VGroup(c, chip, t, num)


def statement_icon(s=1.0):
    p = RoundedRectangle(corner_radius=0.12 * s, width=3.4 * s, height=4.4 * s, color=STROKE, stroke_width=5,
                         fill_color=TEXT, fill_opacity=1)
    h = bold("STATEMENT", 60, BG).scale_to_fit_width(2.6 * s).move_to(p.get_top() + DOWN * 0.5 * s)
    rows = VGroup()
    for i, (a, b) in enumerate([("Interest", "21.25%"), ("Service fee", "R69"), ("Credit life", "R4.50"), ("", "")]):
        y = 0.6 * s - i * 0.75 * s
        rows.add(Line(p.get_left() + [0.3 * s, y - 0.32 * s, 0], p.get_right() + [-0.3 * s, y - 0.32 * s, 0], color=MUTED,
                      stroke_width=2))
        if a:
            rows.add(label(a, 34, BG).scale_to_fit_height(0.26 * s).move_to(p.get_center() + [-0.75 * s, y, 0]))
            rows.add(bold(b, 40, RED).scale_to_fit_height(0.3 * s).move_to(p.get_center() + [1.0 * s, y, 0]))
    return VGroup(p, h, rows)


def lens_icon(s=1.0, color=GOLD):
    ring = Circle(radius=0.8 * s, color=color, stroke_width=14 * s, fill_color=color, fill_opacity=0.12)
    handle = Line(ring.get_center() + [0.57 * s, -0.57 * s, 0], ring.get_center() + [1.4 * s, -1.4 * s, 0],
                  color=color, stroke_width=22 * s)
    return VGroup(handle, ring)


class MFZ_BF_DISCOUNT(Scene):
    def P(self, *anims, rt=1.0, **kw):
        self.play(*anims, run_time=rt, **kw)
        self.t += rt

    def W(self, dt):
        """Never a frozen picture: any gap longer than 0.4 s gently breathes the live group."""
        if dt <= 1e-3:
            return
        if dt > 0.4 and self.live is not None and len(self.live) > 0:
            k = 1.035 if self.flip else 1 / 1.035
            self.flip = not self.flip
            self.play(self.live.animate.scale(k).shift(UP * 0.06 * (1 if self.flip else -1)), run_time=dt, rate_func=smooth)
        else:
            self.wait(dt)
        self.t += dt

    def clear(self, grp, *anims, rt=0.3):
        self.play(FadeOut(grp), *anims, run_time=rt)
        self.t += rt
        self.remove(grp, *grp.get_family())

    def at(self, target):
        if isinstance(target, str):
            target = CUE[target][0]
        if STOP is not None and target >= STOP:
            self.W(STOP - self.t)
            raise EndSceneEarlyException()
        self.W(target - self.t)

    def construct(self):
        self.t = 0.0
        self.live = None
        self.flip = False
        bg = ImageMobject(os.path.join(HERE, "bg_board.png")).scale_to_fit_height(16)
        bg.set_z_index(-10)
        brand = brand_mark().move_to([0, 6.95, 0])
        self.add(bg, brand)

        def tiles(txt, w=1.0, h=1.4, color=TEXT, gap=0.08):
            def one(c):
                if c == " ":
                    return Rectangle(width=w * 0.35, height=h, stroke_width=0, fill_opacity=0)
                return flip_tile(c, w, h, color)
            return VGroup(*[one(c) for c in txt]).arrange(RIGHT, buff=gap)

        def flip_in(group, rt=0.5, extra=()):
            for t in group:
                t.save_state()
                t.stretch(0.02, 1)
            self.add(*group)
            self.P(LaggedStart(*[Restore(t) for t in group], lag_ratio=0.1), *extra, rt=rt)

        def pill(txt, color, w, h=1.0, tc=BG, size=70):
            r = RoundedRectangle(corner_radius=h / 2, width=w, height=h, stroke_width=0, fill_color=color, fill_opacity=1)
            t = bold(txt, size, tc)
            t.scale_to_fit_height(h * 0.56)
            if t.width > w - 0.5:
                t.scale_to_fit_width(w - 0.5)
            return VGroup(r, t.move_to(r))

        def price_tag(txt, color=GOLD, s=1.0, tc=BG):
            body = Polygon([-1.45 * s, 0.62 * s, 0], [1.2 * s, 0.62 * s, 0], [1.75 * s, 0, 0], [1.2 * s, -0.62 * s, 0],
                           [-1.45 * s, -0.62 * s, 0], stroke_width=0, fill_color=color, fill_opacity=1)
            hole = Circle(radius=0.13 * s, stroke_width=0, fill_color=BG, fill_opacity=1).move_to([1.2 * s, 0, 0])
            t = bold(txt, 90, tc).scale_to_fit_height(0.62 * s).move_to([-0.15 * s, 0, 0])
            if t.width > 2.4 * s:
                t.scale_to_fit_width(2.4 * s)
            return VGroup(body, hole, t)

        # ================= HOOK / LOOP: SAVED R1 250 -> PAID R6 570 (both on screen from frame 1) =================
        def hook_layout():
            tv = tv_icon(0.78).move_to([-1.55, 4.55, 0])
            old = price_tag("R6 250", MUTED, 0.72).move_to([2.3, 5.45, 0])
            strike = Line(old.get_left() + [0.15, -0.2, 0], old.get_right() + [-0.35, 0.2, 0], color=RED, stroke_width=8)
            new = price_tag("R5 000", GOLD, 0.72).move_to([2.25, 3.85, 0]).rotate(-0.08)
            sv_l = bold("YOU SAVED", 78, GREEN).move_to([0, 2.05, 0])
            sv = tiles("R1 250", 0.95, 1.35, GREEN).move_to([0, 0.75, 0])
            pd_l = bold("THEN PAID", 78, RED).move_to([0, -0.75, 0])
            pd = tiles("R6 570", 0.95, 1.35, RED).move_to([0, -2.0, 0])
            return tv, VGroup(old, strike), new, sv_l, sv, pd_l, pd

        def hook_scene(key, ending=False):
            tv, old, new, sv_l, sv, pd_l, pd = hook_layout()
            allg = VGroup(tv, old, new, sv_l, sv, pd_l, pd)
            if not ending:
                self.add(allg)
                self.live = allg
                self.P(Wiggle(sv, scale_value=1.06), rt=0.6)
                self.at(wt(key, "paid") - 0.15)
                self.P(Indicate(pd_l, color=RED, scale_factor=1.2), Wiggle(pd, scale_value=1.08), rt=0.6)
                self.at(wt(key, "full") - 0.1)
                self.P(Indicate(old, color=TEXT, scale_factor=1.15), rt=0.5)
                return allg
            self.at(key)
            self.P(FadeIn(tv, scale=0.85), FadeIn(old), FadeIn(new, shift=LEFT * 0.3), rt=0.35)
            self.live = VGroup(tv, old, new)
            self.at(wt(key, "save") - 0.15)
            flip_in(sv, rt=0.45, extra=(FadeIn(sv_l, shift=UP * 0.2),))
            self.live = VGroup(tv, old, new, sv_l, sv)
            self.at(wt(key, "1,250") + 0.35)
            flip_in(pd, rt=0.45, extra=(FadeIn(pd_l),))
            self.live = allg
            self.at(END)

        hook_grp = hook_scene("hook")

        # ================= SETUP: R6 250 TV, Black Friday for R5 000 =================
        self.at("setup")
        tv2 = tv_icon(1.25).move_to([0, 3.9, 0])
        old2 = price_tag("R6 250", MUTED, 0.95).move_to([0, 0.75, 0])
        self.clear(hook_grp, FadeIn(tv2, scale=0.8), rt=0.3)
        self.live = VGroup(tv2)
        self.at(wt("setup", "6,250") - 0.2)
        self.P(FadeIn(old2, shift=DOWN * 0.4), rt=0.35)
        self.live = VGroup(tv2, old2)
        self.at(wt("setup", "Black") - 0.15)
        bf = RoundedRectangle(corner_radius=0.15, width=6.6, height=1.2, stroke_width=0, fill_color=TEXT,
                              fill_opacity=1)
        bf_t = bold("BLACK FRIDAY", 100, BG).scale_to_fit_height(0.8).move_to(bf)
        bfg = VGroup(bf, bf_t).rotate(-0.05).move_to([0, 6.0, 0])
        x = Line(old2.get_left() + [0.15, -0.3, 0], old2.get_right() + [-0.4, 0.3, 0], color=RED, stroke_width=14)
        self.P(FadeIn(bfg, scale=1.3), Create(x), old2.animate.set_opacity(0.55), rt=0.4)
        self.live = VGroup(tv2, old2, x, bfg)
        self.at(wt("setup", "5,000") - 0.2)
        new2 = price_tag("R5 000", GOLD, 1.1).move_to([0.35, -1.0, 0]).rotate(0.06)
        off = pill("-20%", GREEN, 2.2, 0.9).move_to([-2.6, -1.95, 0]).rotate(0.12)
        self.P(FadeIn(new2, scale=1.4), FadeIn(off, scale=0.6), rt=0.4)
        setup_grp = VGroup(tv2, old2, x, bfg, new2, off)
        self.live = setup_grp

        # ================= CARD: store card, 12 months, legal maximums =================
        self.at("card")
        card = store_card(0.85).move_to([0, 5.0, 0]).rotate(-0.06)
        self.clear(setup_grp, FadeIn(card, shift=UP * 0.6), rt=0.35)
        self.live = VGroup(card)
        self.at(wt("card", "12") - 0.2)
        cells = VGroup(*[RoundedRectangle(corner_radius=0.1, width=1.45, height=0.95, color=STROKE, stroke_width=3,
                                          fill_color=PANEL, fill_opacity=1) for _ in range(12)]).arrange_in_grid(3, 4, buff=0.16)
        cells.move_to([0, 0.35, 0])
        mnames = "JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC".split()
        mons = ["DEC"] + mnames[:11]   # paid from December (after Black Friday) for 12 months
        mtxt = VGroup(*[label(m, 34, MUTED).scale_to_fit_height(0.3).move_to(c) for m, c in zip(mons, cells)])
        twelve = bold("12 MONTHS", 92, TEXT).next_to(cells, UP, buff=0.25)
        self.P(FadeIn(twelve, shift=DOWN * 0.2), LaggedStart(*[FadeIn(VGroup(c, t), scale=0.6) for c, t in zip(cells, mtxt)],
                                                            lag_ratio=0.06), rt=0.7)
        self.live = VGroup(card, twelve, cells, mtxt)
        self.at(wt("card", "legal") - 0.15)
        mx_box = RoundedRectangle(corner_radius=0.2, width=7.2, height=1.3, color=RED, stroke_width=8,
                                  fill_color=RED, fill_opacity=0.12)
        mx = bold("LEGAL MAXIMUMS", 120, RED).scale_to_fit_width(6.4).move_to(mx_box)
        mxg = VGroup(mx_box, mx).move_to([0, -2.05, 0]).rotate(0.05)
        self.P(FadeIn(mxg, scale=1.5), rt=0.3)
        self.P(Wiggle(mxg, scale_value=1.05), rt=0.45)
        card_grp = VGroup(card, twelve, cells, mtxt, mxg)
        self.live = card_grp

        # ================= COSTS: a till slip prints the extras =================
        self.at("costs")
        slip = Rectangle(width=6.6, height=6.3, stroke_width=0, fill_color=TEXT, fill_opacity=1).move_to([0, 2.8, 0])
        teeth = VGroup(*[Triangle(stroke_width=0, fill_color=TEXT, fill_opacity=1).scale(0.2).rotate(PI)
                         .move_to([-3.1 + i * 0.4, slip.get_bottom()[1] - 0.08, 0]) for i in range(16)])
        hdr = bold("WHAT THE CARD ADDS", 70, BG).scale_to_fit_width(5.4).move_to([0, 5.35, 0])
        sub = label("12 months, legal maximums", 40, GREY).scale_to_fit_height(0.32).next_to(hdr, DOWN, buff=0.15)
        rule0 = DashedLine([-2.9, 4.45, 0], [2.9, 4.45, 0], color=GREY, stroke_width=3)
        self.clear(card_grp, FadeIn(VGroup(slip, teeth), shift=DOWN * 0.8), FadeIn(hdr), FadeIn(sub), Create(rule0), rt=0.4)
        slip_grp = VGroup(slip, teeth, hdr, sub, rule0)
        self.live = slip_grp

        def row(name, amt, y, col=RED):
            a = label(name, 52, BG).scale_to_fit_height(0.42)
            if a.width > 3.5:
                a.scale_to_fit_width(3.5)
            a.move_to([-2.8 + a.width / 2, y, 0])
            b = bold(amt, 70, col).scale_to_fit_height(0.55)
            b.move_to([2.8 - b.width / 2, y, 0])
            return VGroup(a, b)

        r1 = row("Interest 21.25%", "+R594", 3.75)
        r2 = row("Fee R69 × 12", "+R828", 2.85, "#B07A00")
        r3 = row("Credit life", "+R151", 1.95, "#2C6FB8")
        self.P(FadeIn(r1, shift=RIGHT * 0.3), rt=0.3)
        slip_grp.add(r1)
        self.at(wt("costs", "69") - 0.2)
        self.P(FadeIn(r2, shift=RIGHT * 0.3), rt=0.3)
        slip_grp.add(r2)
        self.at(wt("costs", "credit") - 0.15)
        self.P(FadeIn(r3, shift=RIGHT * 0.3), rt=0.3)
        slip_grp.add(r3)
        self.at(wt("costs", "1,570") - 0.25)
        rule1 = Line([-2.9, 1.35, 0], [2.9, 1.35, 0], color=BG, stroke_width=5)
        ex_l = bold("EXTRA", 80, BG).scale_to_fit_height(0.6).move_to([-2.8, 0.6, 0], aligned_edge=LEFT)
        ex = bold("+R1 570", 110, RED).scale_to_fit_height(0.85)
        ex.move_to([2.8 - ex.width / 2, 0.6, 0])
        self.P(Create(rule1), FadeIn(ex_l), FadeIn(ex, scale=1.4), rt=0.4)
        slip_grp.add(rule1, ex_l, ex)
        self.P(Indicate(ex, color=RED, scale_factor=1.12), rt=0.5)
        self.live = slip_grp

        # ================= TOTAL: R5 000 + R1 570 = R6 570 =================
        self.at("total")
        eq_a = bold("R5 000", 120, GOLD)
        eq_p = bold("+", 120, TEXT)
        eq_b = bold("R1 570", 120, RED)
        eq = VGroup(eq_a, eq_p, eq_b).arrange(RIGHT, buff=0.3).move_to([0, 4.6, 0])
        if eq.width > 8.2:
            eq.scale_to_fit_width(8.2)
        tot_l = bold("TOTAL PAID", 90, TEXT).move_to([0, 2.7, 0])
        tot = tiles("R6 570", 1.05, 1.5, RED).move_to([0, 1.1, 0])
        self.clear(slip_grp, FadeIn(eq_a, shift=RIGHT * 0.4), FadeIn(eq_p), FadeIn(eq_b, shift=LEFT * 0.4), rt=0.4)
        self.live = VGroup(eq)
        self.at(wt("total", "6,570") - 0.25)
        flip_in(tot, rt=0.5, extra=(FadeIn(tot_l, shift=UP * 0.2),))
        cardm = store_card(0.55).move_to([2.6, -1.3, 0]).rotate(0.2)
        self.P(FadeIn(cardm, shift=UP * 0.3), Wiggle(tot, scale_value=1.05), rt=0.5)
        tot_grp = VGroup(eq, tot_l, tot, cardm)
        self.live = tot_grp

        # ================= VERDICT: R320 more than the full price (horizontal bars) =================
        self.at("verdict")
        L = -3.6
        S = 7.0 / 6572.98

        def hbar(amount, y, color, lab, val):
            r = Rectangle(width=amount * S, height=1.05, stroke_width=0, fill_color=color, fill_opacity=0.95)
            r.move_to([L + amount * S / 2, y, 0])
            l = label(lab, 46, MUTED).scale_to_fit_height(0.4).move_to([L, y + 0.92, 0], aligned_edge=LEFT)
            v = bold(val, 90, BG).scale_to_fit_height(0.62).move_to(r.get_left() + [0.25, 0, 0], aligned_edge=LEFT)
            return r, l, v

        rs, ls, vs = hbar(5000, 4.7, GOLD, "Black Friday price", "R5 000")
        rf, lf, vf = hbar(6250, 2.55, MUTED, "Full price, no sale", "R6 250")
        rp, lp, vp = hbar(6572.98, 0.4, RED, "Paid on the store card", "R6 570")
        self.clear(tot_grp, FadeIn(VGroup(rs, ls, vs), shift=RIGHT * 0.4), FadeIn(VGroup(rf, lf, vf), shift=RIGHT * 0.4), rt=0.4)
        self.live = VGroup(rs, ls, vs, rf, lf, vf)
        self.at(wt("verdict", "320") - 0.35)
        self.add(lp)
        grow_from = rp.copy().stretch(0.01, 0, about_edge=LEFT)
        rp_full = rp.copy()
        self.add(grow_from)
        self.P(Transform(grow_from, rp_full), FadeIn(lp), FadeIn(vp), rt=0.5)
        edge = DashedLine([L + 6250 * S, 3.2, 0], [L + 6250 * S, -0.35, 0], color=TEXT, stroke_width=4)
        gap = Rectangle(width=(6572.98 - 6250) * S, height=1.05, stroke_width=5, color=TEXT, fill_opacity=0)
        gap.move_to([L + 6250 * S + (6572.98 - 6250) * S / 2, 0.4, 0])
        more = VGroup(bold("+R320", 130, RED), label("more than full price", 50, TEXT)).arrange(DOWN, buff=0.1)
        more.move_to([0.6, -1.55, 0])
        self.P(Create(edge), Create(gap), FadeIn(more, scale=1.3), rt=0.45)
        self.P(Indicate(more[0], color=RED, scale_factor=1.1), rt=0.5)
        ver_grp = VGroup(rs, ls, vs, rf, lf, vf, grow_from, lp, vp, edge, gap, more)
        self.live = ver_grp

        # ================= LESSON: a discount on credit isn't always a discount; save R500 x 10, pay cash =================
        self.at("lesson")
        dtag = price_tag("-20%", GREEN, 1.25).move_to([-0.6, 4.4, 0]).rotate(0.08)
        plus_c = VGroup(bold("+", 120, RED), store_card(0.5)).arrange(RIGHT, buff=0.25).move_to([1.6, 2.4, 0])
        self.clear(ver_grp, FadeIn(dtag, scale=1.2), rt=0.35)
        self.live = VGroup(dtag)
        self.at(wt("lesson", "credit") - 0.15)
        self.P(FadeIn(plus_c, shift=LEFT * 0.4), rt=0.3)
        self.live = VGroup(dtag, plus_c)
        self.at(wt("lesson", "always") - 0.1)
        xx = cross_icon(RED, 1.1).move_to(dtag)
        self.P(Create(xx), dtag.animate.set_opacity(0.45), rt=0.35)
        self.live = VGroup(dtag, plus_c, xx)
        self.at(wt("lesson", "Save") - 0.15)
        les1 = VGroup(dtag, plus_c, xx)
        slots = VGroup(*[RoundedRectangle(corner_radius=0.1, width=2.75, height=1.0, color=STROKE, stroke_width=3,
                                          fill_color=PANEL, fill_opacity=1) for _ in range(10)]).arrange_in_grid(5, 2, buff=0.18)
        slots.move_to([0, 2.3, 0])
        mlab = VGroup(*[label(m, 34, MUTED).scale_to_fit_height(0.32).move_to(sl) for m, sl in
                        zip("JAN FEB MAR APR MAY JUN JUL AUG SEP OCT".split(), slots)])
        jar = mlab
        notes = VGroup(*[note("R500", 2.75, 1.0).move_to(sl) for sl in slots])
        hdr2 = bold("SAVE R500 × 10 MONTHS", 96, GREEN).move_to([0, 5.75, 0])
        if hdr2.width > 8.2:
            hdr2.scale_to_fit_width(8.2)
        self.P(les1.animate.scale(0.5).move_to([3.0, -1.3, 0]).set_opacity(0), FadeIn(slots), FadeIn(jar), FadeIn(hdr2, shift=DOWN * 0.2), rt=0.35)
        self.remove(les1)
        self.live = VGroup(jar, slots, hdr2)
        self.at(wt("lesson", "10") - 0.1)
        self.P(LaggedStart(*[FadeIn(n, scale=1.6) for n in notes], lag_ratio=0.12), rt=0.8)
        self.live = VGroup(jar, slots, notes, hdr2)
        self.at(wt("lesson", "pay") - 0.15)
        cash = pill("= R5 000 CASH", GREEN, 6.0, 1.2).move_to([-1.0, -1.55, 0])
        tv4 = tv_icon(0.42, "PAID", GREEN).move_to([3.0, -1.35, 0])
        self.P(FadeIn(cash, scale=1.2), FadeIn(tv4, shift=UP * 0.3), rt=0.4)
        les_grp = VGroup(jar, slots, notes, hdr2, cash, tv4)
        self.live = les_grp

        # ================= GUIDE =================
        gcard = RoundedRectangle(corner_radius=0.35, width=8.0, height=3.8, color=GOLD, stroke_width=6,
                                 fill_color=PANEL, fill_opacity=1).move_to([0, 3.5, 0])
        g1 = label("FULL GUIDE ON THE CHANNEL", 44, GOLD).scale_to_fit_height(0.36).move_to(gcard.get_center() + UP * 1.0)
        g2 = bold("STORE CARDS EXPLAINED", 100, TEXT).scale_to_fit_width(7.0).move_to(gcard.get_center() + UP * 0.05)
        g3 = label("the real cost of buying on credit", 44, MUTED).scale_to_fit_width(6.6).move_to(gcard.get_center() + DOWN * 1.0)
        fpill = pill("+ FOLLOW", GREEN, 6.2, 1.1).move_to([0, 0.35, 0])
        disc = label("General information, not financial advice.", 34, MUTED).move_to([0, -0.9, 0])
        self.at(CUE["guide"][0] - 0.1)
        self.clear(les_grp, rt=0.25)
        self.P(DrawBorderThenFill(gcard), FadeIn(g1), FadeIn(g2), FadeIn(g3), FadeIn(disc), rt=0.5)
        self.live = VGroup(gcard, g1, g2, g3, disc)
        self.at(wt("guide", "channel") - 0.2)
        self.P(FadeIn(fpill, scale=0.8), Indicate(g2, color=GOLD, scale_factor=1.05), rt=0.45)
        guide_grp = VGroup(gcard, g1, g2, g3, fpill, disc)
        self.live = guide_grp

        # ================= LOOP =================
        self.at(CUE["loop"][0] - 0.1)
        self.clear(guide_grp, rt=0.3)
        self.live = None
        hook_scene("loop", ending=True)
