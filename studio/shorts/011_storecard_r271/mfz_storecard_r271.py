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


class MFZ_STORECARD_R271(Scene):
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

        # ================= HOOK / LOOP: "only R271 a month" for a R5 000 TV =================
        def hook_scene(key, ending=False):
            tv = tv_icon(1.1, "R5 000").move_to([0, 4.55, 0])
            pm = tiles("R271", 1.25, 1.75, GOLD).move_to([0, 0.45, 0])
            pm_l = bold("A MONTH", 96, TEXT).next_to(pm, DOWN, buff=0.3)
            only = label("only", 64, MUTED).next_to(pm, UP, buff=0.25).align_to(pm, LEFT)
            if not ending:
                # the very first frame is already full: TV, "only", "A MONTH"; the R271 tiles flip in at once
                self.add(tv, only, pm_l)
                flip_in(pm, rt=0.45)
                self.live = VGroup(tv, pm, pm_l, only)
                self.at(wt(key, "store") - 0.15)
                card = store_card(0.75).move_to([0, -2.35, 0]).rotate(0.08)
                self.P(FadeIn(card, shift=UP * 0.6), rt=0.35)
                self.live = VGroup(tv, pm, pm_l, only, card)
                self.at(wt(key, "almost") - 0.1)
                big = tiles("R9 750", 1.15, 1.65, RED).move_to([0, 0.45, 0])
                cost = bold("REAL COST", 96, RED).next_to(big, DOWN, buff=0.3)
                self.P(FadeOut(pm), FadeOut(pm_l), FadeOut(only), FadeOut(card, shift=DOWN * 0.4), rt=0.15)
                flip_in(big, rt=0.5, extra=(FadeIn(cost, scale=1.2),))
                self.P(Wiggle(tv), rt=0.5)
                self.live = VGroup(tv, big, cost)
                return VGroup(tv, big, cost)
            else:
                self.at(key)
                self.P(FadeIn(tv, scale=0.85), rt=0.3)
                self.live = VGroup(tv)
                self.at(wt(key, "only") - 0.15)
                flip_in(pm, rt=0.5, extra=(FadeIn(only), FadeIn(pm_l, shift=UP * 0.2)))
                self.live = VGroup(tv, pm, pm_l, only)
                self.at(END)

        hook_grp = hook_scene("hook")

        # ================= THANDI: Black Friday, store card, 36 months, legal maximums =================
        th = person(GOLD, 1.7).move_to([-2.4, 4.7, 0])
        th_t = bold("THANDI", 84, GOLD).next_to(th, DOWN, buff=0.2)
        tv2 = tv_icon(0.75, "R5 000").move_to([1.9, 4.6, 0])
        bf = RoundedRectangle(corner_radius=0.15, width=6.4, height=1.2, stroke_width=0, fill_color=TEXT,
                              fill_opacity=1).move_to([0, 1.35, 0])
        bf_t = bold("BLACK FRIDAY", 100, BG).scale_to_fit_height(0.8).move_to(bf)
        bfg = VGroup(bf, bf_t).rotate(0.04)
        cal = calendar_icon("36", 1.0, GOLD).move_to([-1.9, -0.7, 0])
        cal_l = bold("MONTHS", 84, TEXT).next_to(cal, RIGHT, buff=0.4)
        mx_box = RoundedRectangle(corner_radius=0.2, width=7.4, height=1.4, color=RED, stroke_width=8,
                                  fill_color=RED, fill_opacity=0.12).move_to([0, -2.95, 0])
        mx = bold("LEGAL MAXIMUMS", 120, RED).scale_to_fit_width(6.6).move_to(mx_box)
        mxg = VGroup(mx_box, mx).rotate(-0.06)
        self.at("thandi")
        self.P(FadeOut(hook_grp), FadeIn(th, shift=UP * 0.4), FadeIn(th_t), rt=0.3)
        self.P(FadeIn(tv2, shift=LEFT * 0.5), rt=0.3)
        self.live = VGroup(th, th_t, tv2)
        self.at(wt("thandi", "Black") - 0.15)
        self.P(FadeIn(bfg, scale=1.3), rt=0.35)
        self.live = VGroup(th, th_t, tv2, bfg)
        self.at(wt("thandi", "store") - 0.15)
        card2 = store_card(0.55).move_to(th.get_center() + [0.9, -0.6, 0]).rotate(0.25)
        self.P(FadeIn(card2, scale=0.5), rt=0.3)
        self.live = VGroup(th, th_t, tv2, bfg, card2)
        self.at(wt("thandi", "36") - 0.2)
        self.P(FadeIn(cal, shift=UP * 0.3), FadeIn(cal_l, shift=LEFT * 0.3), rt=0.35)
        self.live = VGroup(th, th_t, tv2, bfg, card2, cal, cal_l)
        self.at(wt("thandi", "legal") - 0.15)
        self.P(FadeIn(mxg, scale=1.5), rt=0.3)
        self.P(Wiggle(mxg, scale_value=1.05), rt=0.45)
        th_grp = VGroup(th, th_t, tv2, bfg, card2, cal, cal_l, mxg)
        self.live = th_grp

        # ================= THE STACK: R5 000 + interest + fees + credit life =================
        UNIT = 7.9 / 9750       # height per rand
        X = -2.05
        BOT = -2.9
        BW = 2.9

        def block(amount, color, bottom):
            h = amount * UNIT
            return Rectangle(width=BW, height=h, stroke_width=0, fill_color=color, fill_opacity=0.95).move_to(
                [X, bottom + h / 2, 0])

        b0 = block(5000, GREY, BOT)
        b0_t = bold("R5 000", 96, TEXT)
        b0_t.scale_to_fit_width(min(b0_t.width, BW - 0.35)).move_to(b0)
        b0_s = label("the TV", 44, MUTED).next_to(b0_t, DOWN, buff=0.15)
        top1 = BOT + 5000 * UNIT
        b1 = block(1804.64, RED, top1)
        top2 = top1 + 1804.64 * UNIT
        b2 = block(2484, GOLD_D, top2)
        top3 = top2 + 2484 * UNIT
        b3 = block(458.59, BLUE, top3)
        RX = 1.95

        def side(big, small, color, y):
            a = bold(big, 104, color)
            b = label(small, 42, MUTED)
            g = VGroup(a, b).arrange(DOWN, buff=0.1, aligned_edge=LEFT)
            if g.width > 4.0:
                g.scale_to_fit_width(4.0)
            return g.move_to([RX, y, 0])

        def grow(b):
            full = b.copy()
            b.stretch(0.01, 1, about_edge=DOWN)
            return Transform(b, full)

        # interest
        self.at("interest")
        self.P(FadeOut(th_grp), rt=0.25)
        self.P(FadeIn(b0, shift=UP * 0.3), FadeIn(b0_t), FadeIn(b0_s), rt=0.35)
        self.live = VGroup(b0, b0_t, b0_s)
        self.at(wt("interest", "21.25") - 0.2)
        pct = bold("21.25%", 150, RED).move_to([RX - 0.05, 4.4, 0])
        pct_l = label("interest a year", 46, MUTED).next_to(pct, DOWN, buff=0.15)
        self.P(FadeIn(pct, scale=1.3), FadeIn(pct_l), rt=0.4)
        self.live = VGroup(b0, b0_t, b0_s, pct, pct_l)
        self.at(wt("interest", "1,800") - 0.25)
        s1 = side("+R1 800", "interest", RED, top1 + 1804.64 * UNIT / 2)
        self.add(b1)
        self.P(grow(b1), FadeOut(pct), FadeOut(pct_l), FadeIn(s1, shift=LEFT * 0.3), rt=0.5)
        stack = VGroup(b0, b0_t, b0_s, b1, s1)
        self.live = stack

        # service fee
        self.at("fee")
        fee = VGroup(bold("R69", 130, GOLD), bold("× 36", 100, TEXT)).arrange(RIGHT, buff=0.3).move_to([RX - 0.05, 4.9, 0])
        fee_l = label("service fee, every month", 42, MUTED).next_to(fee, DOWN, buff=0.15)
        self.P(FadeIn(fee, scale=1.2), FadeIn(fee_l), rt=0.35)
        self.live = VGroup(stack, fee, fee_l)
        self.at(wt("fee", "2,484") - 0.25)
        s2 = side("+R2 484", "service fees", GOLD, top2 + 2484 * UNIT / 2)
        self.add(b2)
        self.P(grow(b2), FadeOut(fee), FadeOut(fee_l), FadeIn(s2, shift=LEFT * 0.3), rt=0.5)
        stack.add(b2, s2)
        self.live = stack

        # credit life
        self.at("life")
        sh = shield_icon(BLUE, 0.5).move_to([RX - 1.4, 5.7, 0])
        sh_l = bold("CREDIT LIFE", 80, BLUE).next_to(sh, RIGHT, buff=0.3)
        if sh_l.get_right()[0] > 4.3:
            VGroup(sh, sh_l).shift(LEFT * (sh_l.get_right()[0] - 4.3))
        self.P(FadeIn(sh, scale=0.6), FadeIn(sh_l), rt=0.35)
        self.live = VGroup(stack, sh, sh_l)
        self.at(wt("life", "460") - 0.25)
        s3 = side("+R460", "insurance", BLUE, top3 + 0.15)
        s3.next_to(s2, UP, buff=0.25).align_to(s2, LEFT)
        self.add(b3)
        self.P(grow(b3), FadeOut(sh), FadeOut(sh_l), FadeIn(s3, shift=LEFT * 0.3), rt=0.5)
        stack.add(b3, s3)
        self.live = stack

        # ================= TOTAL: almost R9 750; R4 750 extra vs R1 250 saved =================
        self.at("total")
        tot = tiles("R9 750", 0.62, 0.9, RED, gap=0.04).move_to([RX + 0.05, 5.6, 0])
        brace = Brace(VGroup(b1, b2, b3), RIGHT, color=TEXT)
        self.P(FadeOut(VGroup(s1, s2, s3)), Indicate(b0_t, color=GOLD, scale_factor=1.15), rt=0.35)
        self.live = VGroup(b0, b0_t, b0_s, b1, b2, b3)
        self.at(wt("total", "almost") - 0.15)
        flip_in(tot, rt=0.5)
        self.live = VGroup(b0, b0_t, b0_s, b1, b2, b3, tot)
        self.at(wt("total", "About") - 0.15)
        brace.next_to(VGroup(b1, b2, b3), RIGHT, buff=0.15)
        extra = VGroup(bold("+R4 750", 110, RED), label("extra", 56, RED)).arrange(DOWN, buff=0.05, aligned_edge=LEFT)
        extra.scale_to_fit_width(min(extra.width, 3.3))
        extra.next_to(brace, RIGHT, buff=0.25)
        self.P(GrowFromCenter(brace), FadeIn(extra, shift=LEFT * 0.3), rt=0.45)
        self.live = VGroup(b0, b0_t, b0_s, b1, b2, b3, tot, brace, extra)
        self.at(wt("total", "saved") - 0.15)
        saved = VGroup(tick_icon(GREEN, 0.3), VGroup(label("saved", 48, GREEN), bold("R1 250", 90, GREEN)).arrange(DOWN, buff=0.05, aligned_edge=LEFT)).arrange(RIGHT, buff=0.2)
        saved.scale_to_fit_width(min(saved.width, 3.3))
        saved.next_to(b0, RIGHT, buff=0.35).shift(UP * 0.6)
        self.P(FadeIn(saved, shift=UP * 0.2), rt=0.35)
        self.at(wt("total", "on", 2) - 0.1)
        self.P(saved.animate.set_opacity(0.5), Indicate(extra, color=RED, scale_factor=1.06), rt=0.45)
        tot_grp = VGroup(b0, b0_t, b0_s, b1, b2, b3, tot, brace, extra, saved)
        self.live = tot_grp

        # ================= SHORTER / SAVE FIRST =================
        self.at("short")
        self.P(FadeOut(tot_grp), rt=0.25)
        H = 6.6 / 9747.23
        base = -2.2

        def bar(x, amount, color, lab, txt):
            h = amount * H
            r = Rectangle(width=2.6, height=h, stroke_width=0, fill_color=color, fill_opacity=0.95).move_to([x, base + h / 2, 0])
            v = bold(txt, 84, color).next_to(r, UP, buff=0.2)
            l = label(lab, 50, MUTED).next_to(r, DOWN, buff=0.2)
            return r, v, l

        r36, v36, l36 = bar(1.8, 9747.23, RED, "36 months", "R9 750")
        r12, v12, l12 = bar(-1.8, 6572.98, GOLD, "12 months", "R6 570")
        self.P(FadeIn(r36), FadeIn(v36), FadeIn(l36), rt=0.3)
        self.live = VGroup(r36, v36, l36)
        self.at(wt("short", "12") - 0.15)
        self.add(r12)
        self.P(grow(r12), FadeIn(l12), rt=0.45)
        self.at(wt("short", "6,570") - 0.2)
        self.P(FadeIn(v12, shift=UP * 0.2), rt=0.3)
        self.live = VGroup(r36, v36, l36, r12, v12, l12)
        self.at(wt("short", "Better") - 0.15)
        bars = VGroup(r36, v36, l36, r12, v12, l12)
        jar = jar_icon(0.85).move_to([-1.6, 4.0, 0])
        coins = VGroup(*[coin(0.34) for _ in range(6)])
        for i, c in enumerate(coins):
            c.move_to([-3.6 + (i % 3) * 0.5, 6.2 + i * 0.05, 0])
        sf = bold("SAVE FIRST", 130, GREEN).move_to([0, 0.9, 0])
        pc = bold("PAY CASH", 130, GREEN).move_to([0, -0.9, 0])
        tv3 = tv_icon(0.6, "R5 000", GREEN).move_to([2.0, 4.1, 0])
        self.P(FadeOut(bars), FadeIn(jar, scale=0.8), rt=0.3)
        self.live = VGroup(jar)
        self.at(wt("short", "save") - 0.15)
        self.add(coins)
        self.P(LaggedStart(*[c.animate.move_to(jar[0].get_bottom() + [(-0.55 + (i % 3) * 0.55), 0.45 + (i // 3) * 0.55, 0])
                             for i, c in enumerate(coins)], lag_ratio=0.15), FadeIn(sf, scale=1.2), rt=0.6)
        self.live = VGroup(jar, coins, sf)
        self.at(wt("short", "pay") - 0.15)
        self.P(FadeIn(pc, scale=1.2), FadeIn(tv3, shift=UP * 0.3), rt=0.35)
        sv_grp = VGroup(jar, coins, sf, pc, tv3)
        self.live = sv_grp

        # ================= CHECK YOUR STATEMENT =================
        self.at("check")
        st = statement_icon(1.15).move_to([0, 2.9, 0])
        ln = lens_icon(1.0).move_to(st.get_center() + [1.5, -0.3, 0])
        less = bold("MAY CHARGE LESS", 110, TEXT).scale_to_fit_width(7.0).move_to([0, -0.85, 0])
        chk = VGroup(tick_icon(GOLD, 0.45), bold("CHECK IT", 120, GOLD)).arrange(RIGHT, buff=0.3).move_to([0, -2.5, 0])
        self.P(FadeOut(sv_grp), FadeIn(st, shift=UP * 0.4), rt=0.3)
        self.live = VGroup(st)
        self.at(wt("check", "less") - 0.2)
        self.P(FadeIn(less, scale=1.15), rt=0.3)
        self.live = VGroup(st, less)
        self.at(wt("check", "check") - 0.15)
        self.P(FadeIn(ln, shift=UP * 0.4 + LEFT * 0.4), FadeIn(chk, scale=1.2), rt=0.35)
        self.P(ln.animate.shift(LEFT * 1.4 + UP * 0.6), rt=0.6)
        ck_grp = VGroup(st, ln, less, chk)
        self.live = ck_grp

        # ================= GUIDE =================
        card = RoundedRectangle(corner_radius=0.35, width=8.0, height=3.8, color=GOLD, stroke_width=6,
                                fill_color=PANEL, fill_opacity=1).move_to([0, 3.0, 0])
        g1 = label("FULL GUIDE", 44, GOLD).move_to(card.get_center() + UP * 1.0)
        g2 = bold("STORE CARDS EXPLAINED", 100, TEXT).scale_to_fit_width(7.0).move_to(card.get_center() + UP * 0.05)
        g3 = label("interest, fees, credit life, 5 traps", 44, MUTED).scale_to_fit_width(7.0).move_to(card.get_center() + DOWN * 1.0)
        fpill = RoundedRectangle(corner_radius=0.55, width=6.2, height=1.1, stroke_width=0, fill_color=GREEN,
                                 fill_opacity=1).move_to([0, -0.4, 0])
        fpill_t = bold("+ FOLLOW", 66, BG).move_to(fpill)
        disc = label("General information, not financial advice.", 34, MUTED).move_to([0, -1.7, 0])
        self.at(CUE["guide"][0] - 0.1)
        self.P(FadeOut(ck_grp), rt=0.25)
        self.P(DrawBorderThenFill(card), FadeIn(g1), FadeIn(g2), FadeIn(g3), rt=0.55)
        self.live = VGroup(card, g1, g2, g3)
        self.at(wt("guide", "channel") - 0.2)
        self.P(FadeIn(fpill, scale=0.8), FadeIn(fpill_t, scale=0.8), FadeIn(disc), Indicate(g2, color=GOLD, scale_factor=1.05), rt=0.5)
        guide_grp = VGroup(card, g1, g2, g3, fpill, fpill_t, disc)
        self.live = guide_grp

        # ================= LOOP =================
        self.at(CUE["loop"][0] - 0.1)
        self.P(FadeOut(guide_grp), rt=0.3)
        self.live = None
        hook_scene("loop", ending=True)
