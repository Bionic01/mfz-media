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


def tfsa_jar(amount=None, s=1.0, fill=0.0, color=GREEN):
    j = jar_icon(s)
    lab = RoundedRectangle(corner_radius=0.1 * s, width=1.9 * s, height=0.62 * s, stroke_width=0,
                           fill_color=color, fill_opacity=1).move_to(j[0].get_center() + UP * 0.75 * s)
    lt = bold("TFSA", 60, BG).scale_to_fit_height(0.42 * s).move_to(lab)
    g = VGroup(j, lab, lt)
    if fill > 0:
        h = 3.2 * s * fill * 0.8
        f = RoundedRectangle(corner_radius=0.3 * s, width=2.3 * s, height=h, stroke_width=0, fill_color=GOLD,
                             fill_opacity=0.35).move_to(j[0].get_bottom() + UP * (h / 2 + 0.12 * s))
        g.add_to_back(f)
    if amount:
        g.add(bold(amount, 80, GOLD).scale_to_fit_height(0.5 * s).move_to(j[0].get_center() + DOWN * 0.55 * s))
    return g


def provider(name, color=MUTED, s=0.8):
    b = bank_icon(color, s)
    t = label(name, 40, color).next_to(b, DOWN, buff=0.22)
    return VGroup(b, t)


class MFZ_TFSA_TRANSFER(Scene):
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
                return flip_tile(c, w, h, color)
            return VGroup(*[one(c) for c in txt]).arrange(RIGHT, buff=gap)

        def idle(mob, until, k=1.05):
            dt = until - self.t
            if dt > 0.5:
                self.P(mob.animate.scale(k), rate_func=there_and_back, rt=dt)

        def flip_in(group, rt=0.6, extra=()):
            for t in group:
                t.save_state()
                t.stretch(0.02, 1)
            self.add(*group)
            self.P(LaggedStart(*[Restore(t) for t in group], lag_ratio=0.1), *extra, rt=rt)

        def meter(y, frac_list, colors, limit_frac=None, w=7.4, h=0.9):
            """Horizontal bar: segments (fractions of w) left to right, optional limit marker."""
            frame = RoundedRectangle(corner_radius=0.12, width=w, height=h, color=STROKE, stroke_width=4,
                                     fill_color=PANEL, fill_opacity=1).move_to([0, y, 0])
            segs = VGroup()
            x0 = -w / 2
            for f, c in zip(frac_list, colors):
                r = Rectangle(width=max(w * f, 0.01), height=h - 0.16, stroke_width=0, fill_color=c, fill_opacity=0.9)
                r.move_to([x0 + w * f / 2, y, 0])
                segs.add(r)
                x0 += w * f
            g = VGroup(frame, segs)
            return g

        # ================= HOOK: old provider -> new provider, it goes wrong, 40% =================
        def providers_scene(key, ending=False):
            p_old = provider("OLD PROVIDER", MUTED, 0.9).move_to([-2.4, 3.4, 0])
            p_new = provider("NEW PROVIDER", GREEN, 0.9).move_to([2.4, 3.4, 0])
            jar = tfsa_jar(None, 0.8, 0.6).move_to([-2.4, -0.4, 0])
            arr = Arrow([-0.85, 3.7, 0], [0.85, 3.7, 0], color=GOLD, stroke_width=10, buff=0, max_tip_length_to_length_ratio=0.3)
            self.at(key)
            self.P(FadeIn(p_old, shift=RIGHT * 0.4), FadeIn(p_new, shift=LEFT * 0.4), FadeIn(jar, scale=0.6), rt=0.3)
            self.P(GrowArrow(arr), jar.animate.move_to([0, -0.4, 0]), rt=0.6)
            out = [p_old, p_new, jar, arr]
            if not ending:
                self.at(wt(key, "better") - 0.1)
                self.P(Indicate(p_new, color=GREEN, scale_factor=1.08), jar.animate.move_to([2.4, -0.4, 0]), rt=0.6)
                self.at(wt(key, "wrong") - 0.2)
                x = cross_icon(RED, 0.55).move_to(arr)
                self.P(arr.animate.set_color(RED), FadeIn(x, scale=1.6), jar.animate.move_to([0, -0.5, 0]).rotate(0.25), rt=0.35)
                self.P(Wiggle(jar), rt=0.5)
                self.at(wt(key, "40") - 0.25)
                pct = tiles("40%", 1.6, 2.2, RED).move_to([0, 0.0, 0])
                pen = bold("PENALTY", 120, RED).scale_to_fit_width(6.0).move_to([0, -2.0, 0])
                self.P(FadeOut(jar), rt=0.12)
                flip_in(pct, rt=0.5)
                self.at(wt(key, "penalty") - 0.1)
                self.P(FadeIn(pen, scale=1.3), rt=0.3)
                idle(VGroup(pct, pen), CUE["lerato"][0] - 0.3, 1.06)
                out += [x, pct, pen]
            else:
                # loop ending: the same two providers, the right way vs the wrong way
                self.at(wt(key, "Transfer") - 0.15)
                ok = VGroup(tick_icon(GREEN, 0.7), bold("TRANSFER", 130, GREEN)).arrange(RIGHT, buff=0.3).move_to([0, 0.2, 0])
                self.P(FadeIn(ok, scale=1.2), jar.animate.move_to(p_new[0].get_center()).scale(0.3).set_opacity(0), rt=0.4)
                self.at(wt(key, "withdraw") - 0.25)
                bad = VGroup(cross_icon(RED, 0.5), bold("WITHDRAW", 130, RED)).arrange(RIGHT, buff=0.3).move_to([0, -1.6, 0])
                self.P(FadeIn(bad, scale=1.2), rt=0.3)
                idle(VGroup(ok, bad), END - 0.05, 1.06)
            return VGroup(*out)

        hook_grp = providers_scene("hook")

        # ================= LERATO: R30 000 in a TFSA, R20 000 added this year =================
        ler = person(GOLD, 2.0).move_to([-2.3, 4.0, 0])
        ler_t = bold("LERATO", 96, GOLD).next_to(ler, DOWN, buff=0.25)
        jar = tfsa_jar("R30 000", 1.3, 0.65).move_to([2.1, 3.4, 0])
        yr_t = label("this tax year", 56, MUTED).move_to([0, 0.0, 0])
        lim = 46000
        m1 = meter(-1.0, [20000 / lim], [GOLD], w=7.8, h=1.1)
        m1_l = bold("R20 000", 84, GOLD).next_to(m1, DOWN, buff=0.25).align_to(m1, LEFT)
        m1_r = label("limit R46 000", 50, MUTED).next_to(m1, DOWN, buff=0.3).align_to(m1, RIGHT)
        self.at("lerato")
        self.P(FadeOut(hook_grp), rt=0.25)
        self.P(FadeIn(ler, shift=UP * 0.4), FadeIn(ler_t), rt=0.35)
        self.at(wt("lerato", "30,000") - 0.2)
        self.P(FadeIn(jar, shift=UP * 0.5), rt=0.4)
        self.P(Indicate(jar[-1], color=GOLD, scale_factor=1.15), rt=0.5)
        self.at(wt("lerato", "this") - 0.15)
        m1_frame, m1_seg = m1
        m1_seg_full = m1_seg.copy()
        m1_seg.stretch(0.01, 0, about_edge=LEFT)
        self.P(FadeIn(yr_t), FadeIn(m1_frame), FadeIn(m1_r), rt=0.3)
        self.at(wt("lerato", "added") - 0.1)
        self.P(Transform(m1_seg, m1_seg_full), FadeIn(m1_l, shift=UP * 0.2), rt=0.7)
        idle(VGroup(ler, jar), CUE["withdraw"][0] - 0.3, 1.05)
        ler_grp = VGroup(ler, ler_t, jar, yr_t, m1, m1_l, m1_r)

        # ================= WITHDRAW: out to the wallet, into a new TFSA = new contribution =================
        old = tfsa_jar("R30 000", 1.1, 0.65, MUTED).move_to([-2.3, 4.0, 0])
        old_l = label("old TFSA", 50, MUTED).next_to(old, DOWN, buff=0.2)
        new = tfsa_jar(None, 1.1, 0.0, GREEN).move_to([2.3, 4.0, 0])
        new_l = label("new TFSA", 50, GREEN).next_to(new, DOWN, buff=0.2)
        cash = VGroup(*[note("R10 000", 2.8, 1.25) for _ in range(3)])
        for i, n in enumerate(cash):
            n.move_to(old[0].get_center() + UP * 0.1 * i)
        self.at("withdraw")
        self.P(FadeOut(ler_grp), rt=0.25)
        self.P(FadeIn(old), FadeIn(old_l), FadeIn(new), FadeIn(new_l), rt=0.35)
        self.at(wt("withdraw", "withdraws") - 0.1)
        self.add(cash)
        self.P(LaggedStart(*[n.animate.move_to([0, 0.3 + 0.3 * i, 0]).rotate(0.08 * (i - 1)) for i, n in enumerate(cash)],
                           lag_ratio=0.2), old[-1].animate.set_opacity(0.2), rt=0.8)
        wl = label("withdrawn", 56, GOLD).move_to([0, -0.9, 0])
        self.P(FadeIn(wl), rt=0.25)
        self.at(wt("withdraw", "puts") - 0.1)
        self.P(LaggedStart(*[n.animate.move_to(new[0].get_center() + UP * 0.1 * i).scale(0.7) for i, n in enumerate(cash)],
                           lag_ratio=0.15), FadeOut(wl), rt=0.8)
        self.at(wt("withdraw", "SARS") - 0.15)
        stamp_box = RoundedRectangle(corner_radius=0.2, width=7.4, height=1.5, color=RED, stroke_width=8,
                                     fill_color=RED, fill_opacity=0.12).move_to([0, -1.5, 0])
        stamp = bold("NEW CONTRIBUTION", 120, RED).scale_to_fit_width(6.8).move_to(stamp_box)
        sg = VGroup(stamp_box, stamp).rotate(-0.08)
        sars = label("To SARS:", 60, MUTED).move_to([0, -0.2, 0])
        self.P(FadeIn(sars), rt=0.25)
        self.at(wt("withdraw", "new", 2) - 0.15)
        self.P(FadeIn(sg, scale=1.6), rt=0.3)
        self.P(Wiggle(sg, scale_value=1.05), rt=0.5)
        idle(VGroup(new, cash), CUE["math"][0] - 0.3, 1.05)
        wd_grp = VGroup(old, old_l, new, new_l, cash, sars, sg)

        # ================= MATH: 20 000 + 30 000 = 50 000 > 46 000; R4 000 x 40% = R1 600 =================
        head = label("this tax year", 48, MUTED).move_to([0, 5.6, 0])
        tot = tiles("R50 000", 1.05, 1.5, TEXT).move_to([0, 4.0, 0])
        W8 = 7.4
        scale_max = 50000
        m2 = meter(2.2, [20000 / scale_max, 26000 / scale_max, 4000 / scale_max], [GOLD, GOLD_D, RED], w=W8, h=1.2)
        m2_frame, m2_segs = m2
        lim_x = -W8 / 2 + W8 * lim / scale_max
        lim_line = DashedLine([lim_x, 3.0, 0], [lim_x, 1.3, 0], color=TEXT, stroke_width=7, dash_length=0.15)
        lim_lab = label("limit R46 000", 42, TEXT).next_to(lim_line, DOWN, buff=0.12).shift(LEFT * 1.0)
        s_a = label("R20 000", 46, BG).move_to(m2_segs[0])
        s_b = label("+ R30 000", 46, BG).move_to(Rectangle(width=W8 * 30000 / scale_max, height=0.5).move_to(
            [-W8 / 2 + W8 * (20000 + 15000) / scale_max, 2.2, 0]))
        over = VGroup(bold("R4 000", 140, RED), label("over", 70, RED)).arrange(RIGHT, buff=0.25).move_to([0, -0.2, 0])
        times = VGroup(bold("× 40%", 140, TEXT)).move_to([0, -1.8, 0])
        pen = tiles("R1 600", 1.2, 1.7, RED).move_to([0, -0.3, 0])
        pen_l = bold("PENALTY", 100, RED).scale_to_fit_width(4.6).move_to([0, -2.1, 0])
        self.at("math")
        self.P(FadeOut(wd_grp), rt=0.25)
        full = m2_segs.copy()
        for s in m2_segs:
            s.stretch(0.01, 0, about_edge=LEFT).move_to([-W8 / 2, 2.2, 0], aligned_edge=LEFT)
        self.P(FadeIn(head), FadeIn(m2_frame), rt=0.2)
        flip_in(tot, rt=0.5, extra=(Transform(m2_segs[0], full[0]),))
        self.add(s_a)
        self.P(Transform(m2_segs[1], full[1]), Transform(m2_segs[2], full[2]), FadeIn(s_b), rt=0.6)
        self.at(wt("math", "limit") - 0.15)
        self.P(Create(lim_line), FadeIn(lim_lab), rt=0.4)
        self.P(Indicate(lim_line, color=GOLD), rt=0.5)
        idle(VGroup(m2, lim_line, lim_lab, s_a, s_b), wt("math", "4,000") - 0.2, 1.05)
        self.at(wt("math", "4,000") - 0.15)
        self.P(FadeIn(over, shift=UP * 0.3), Indicate(m2_segs[2], color=RED, scale_factor=1.3), rt=0.4)
        self.at(wt("math", "40") - 0.15)
        self.P(FadeIn(times, scale=1.3), rt=0.3)
        self.at(wt("math", "1,600") - 0.3)
        self.P(FadeOut(over), FadeOut(times), rt=0.15)
        flip_in(pen, rt=0.5)
        self.at(wt("math", "penalty") - 0.1)
        self.P(FadeIn(pen_l, scale=1.3), rt=0.3)
        idle(VGroup(pen, pen_l), CUE["lifetime"][0] - 0.3, 1.06)
        math_grp = VGroup(head, tot, m2, lim_line, lim_lab, s_a, s_b, pen, pen_l)

        # ================= LIFETIME: R500 000 for life, withdrawals don't give it back =================
        lt_h = bold("LIFETIME LIMIT", 110, TEXT).scale_to_fit_width(6.4).move_to([0, 5.4, 0])
        lt_v = tiles("R500 000", 0.92, 1.3, GOLD, gap=0.06).move_to([0, 3.7, 0])
        m3 = meter(1.6, [0.18, 0.06], [GOLD, GOLD_D], w=7.8, h=1.2)
        back = VGroup(cross_icon(RED, 0.45), bold("NEVER GIVEN BACK", 110, RED)).arrange(RIGHT, buff=0.3)
        if back.width > 7.6:
            back.scale_to_fit_width(7.6)
        back.move_to([0, -1.7, 0])
        self.at("lifetime")
        self.P(FadeOut(math_grp), rt=0.25)
        self.P(FadeIn(lt_h, shift=DOWN * 0.2), rt=0.3)
        self.at(wt("lifetime", "withdrawals") - 0.1)
        self.P(FadeIn(m3), rt=0.3)
        out_note = note("R30 000", 2.8, 1.25).move_to(m3[1][0].get_center())
        self.add(out_note)
        self.P(out_note.animate.move_to([1.9, -0.1, 0]).rotate(0.2), rt=0.5)
        self.P(Indicate(m3[1], color=GOLD, scale_factor=1.05), rt=0.35)
        self.at(wt("lifetime", "500,000") - 0.25)
        flip_in(lt_v, rt=0.5)
        self.at(wt("lifetime", "back") - 0.3)
        self.P(FadeIn(back, scale=1.2), FadeOut(out_note), rt=0.35)
        idle(VGroup(lt_v, back), CUE["fix"][0] - 0.3, 1.05)
        life_grp = VGroup(lt_h, lt_v, m3, back)

        # ================= FIX: ask the NEW provider for a TFSA transfer =================
        rw = bold("THE RIGHT WAY", 110, GREEN).scale_to_fit_width(6.2).move_to([0, 5.6, 0])
        p_old = provider("OLD PROVIDER", MUTED, 0.85).move_to([-2.4, 2.9, 0])
        p_new = provider("NEW PROVIDER", GREEN, 0.85).move_to([2.4, 2.9, 0])
        me = person(GOLD, 1.4).move_to([2.9, -0.1, 0])
        bub = RoundedRectangle(corner_radius=0.3, width=5.6, height=1.2, color=GOLD, stroke_width=5,
                               fill_color=PANEL, fill_opacity=1).move_to([-1.15, 0.0, 0])
        bub_t = label("A TFSA transfer, please", 48, GOLD).scale_to_fit_width(5.0).move_to(bub)
        tj = tfsa_jar(None, 0.5, 0.6).move_to([-2.4, 3.4, 0])
        path = ArcBetweenPoints([-2.4, 3.4, 0], [2.4, 3.4, 0], angle=-PI / 2)
        c2c = bold("COMPANY TO COMPANY", 100, TEXT).scale_to_fit_width(6.8).move_to([0, 5.6, 0])
        safe = VGroup(tick_icon(GREEN, 0.5), bold("LIMITS UNTOUCHED", 110, GREEN)).arrange(RIGHT, buff=0.3)
        if safe.width > 7.6:
            safe.scale_to_fit_width(7.6)
        safe.move_to([0, -2.2, 0])
        self.at("fix")
        self.P(FadeOut(life_grp), rt=0.25)
        self.P(FadeIn(rw, scale=1.2), rt=0.3)
        self.at(wt("fix", "ask") - 0.15)
        self.P(FadeIn(p_old), FadeIn(p_new), FadeIn(me, shift=UP * 0.3), rt=0.35)
        self.at(wt("fix", "provider") - 0.1)
        self.P(FadeIn(bub, scale=0.7), FadeIn(bub_t), Indicate(p_new, color=GREEN, scale_factor=1.06), rt=0.4)
        idle(VGroup(bub, bub_t, me), wt("fix", "goes") - 0.2, 1.07)
        self.at(wt("fix", "goes") - 0.15)
        self.add(tj)
        self.P(FadeOut(rw), FadeIn(c2c), rt=0.25)
        self.P(MoveAlongPath(tj, path), rt=1.0)
        self.P(Flash(p_new[0], color=GREEN), rt=0.4)
        self.at(wt("fix", "touch") - 0.25)
        self.P(FadeIn(safe, scale=1.2), rt=0.35)
        idle(VGroup(safe, tj), CUE["guide"][0] - 0.3, 1.05)
        fix_grp = VGroup(p_old, p_new, me, bub, bub_t, tj, c2c, safe)

        # ================= GUIDE =================
        card = RoundedRectangle(corner_radius=0.35, width=8.0, height=3.8, color=GOLD, stroke_width=6,
                                fill_color=PANEL, fill_opacity=1).move_to([0, 3.0, 0])
        g1 = label("FULL GUIDE", 44, GOLD).move_to(card.get_center() + UP * 1.0)
        g2 = bold("TFSA EXPLAINED", 100, TEXT).scale_to_fit_width(7.0).move_to(card.get_center() + UP * 0.05)
        g3 = label("limits, penalty, transfers", 44, MUTED).move_to(card.get_center() + DOWN * 1.0)
        fpill = RoundedRectangle(corner_radius=0.55, width=6.2, height=1.1, stroke_width=0, fill_color=GREEN,
                                 fill_opacity=1).move_to([0, -0.4, 0])
        fpill_t = bold("+ FOLLOW", 66, BG).move_to(fpill)
        disc = label("General information, not financial advice.", 34, MUTED).move_to([0, -1.7, 0])
        self.at(CUE["guide"][0] - 0.1)
        self.P(FadeOut(fix_grp), rt=0.25)
        self.P(DrawBorderThenFill(card), FadeIn(g1), FadeIn(g2), FadeIn(g3), rt=0.55)
        self.at(wt("guide", "channel") - 0.2)
        self.P(FadeIn(fpill, scale=0.8), FadeIn(fpill_t, scale=0.8), FadeIn(disc), Indicate(g2, color=GOLD, scale_factor=1.05), rt=0.5)
        idle(VGroup(fpill, fpill_t), CUE["loop"][0] - 0.3, 1.08)
        guide_grp = VGroup(card, g1, g2, g3, fpill, fpill_t, disc)

        # ================= LOOP =================
        self.at(CUE["loop"][0] - 0.3)
        self.P(FadeOut(guide_grp), rt=0.3)
        providers_scene("loop", ending=True)
        self.at(END)
