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


class MFZ_CAPITEC_R6_R2(Scene):
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

        def tiles_amount(txt, w=1.0, h=1.4, color=TEXT, gap=0.08):
            row = VGroup(*[flip_tile(c, w, h, color) if c != " " else Rectangle(width=w * 0.35, height=h, stroke_width=0, fill_opacity=0)
                           for c in txt])
            return row.arrange(RIGHT, buff=gap)

        def flip_in(group, rt=0.6):
            for t in group:
                t.save_state()
                t.stretch(0.02, 1)
            self.add(*group)
            self.P(LaggedStart(*[Restore(t) for t in group], lag_ratio=0.12), rt=rt)

        def pill(txt, y, color, w=6.0, x=0, h=1.0, size=64):
            p = RoundedRectangle(corner_radius=h / 2, width=w, height=h, color=color, stroke_width=5,
                                 fill_color=color, fill_opacity=0.14).move_to([x, y, 0])
            t = bold(txt, size, color)
            if t.width > w - 0.5:
                t.scale_to_fit_width(w - 0.5)
            return VGroup(p, t.move_to(p))

        def stamp(txt, y, color=RED, w=7.0, ang=-6, x=0):
            b = RoundedRectangle(corner_radius=0.2, width=w, height=1.6, color=color, stroke_width=10,
                                 fill_color=color, fill_opacity=0.12).move_to([x, y, 0])
            t = bold(txt, 110, color).scale_to_fit_width(w - 0.7).move_to(b)
            return VGroup(b, t).rotate(ang * DEGREES)

        def fee_card(x, kind):
            col = RED if kind == "IMMEDIATE" else GREEN
            c = box(3.75, 6.4, 1.4, x=x, stroke=col, sw=6)
            ic = (bolt_icon(col, 0.85) if kind == "IMMEDIATE" else clock_icon(col, 0.75)).move_to([x, 3.45, 0])
            name = bold(kind, 64, col).scale_to_fit_width(3.0).move_to([x, 2.0, 0])
            amt = tiles_amount("R6" if kind == "IMMEDIATE" else "R2", w=1.2, h=1.7, color=GOLD).move_to([x, -0.3, 0])
            return c, ic, name, amt

        def hook_scene(key):
            top = pill("SAME PAYMENT  ·  SAME BANK", 5.6, TEXT, w=7.8, size=60)
            L = fee_card(-2.15, "IMMEDIATE")
            R = fee_card(2.15, "NORMAL")
            vs = VGroup(Circle(radius=0.48, color=MUTED, stroke_width=5, fill_color=BG, fill_opacity=1), bold("vs", 56, TEXT)).move_to([0, 1.4, 0]).set_z_index(5)
            self.at(key)
            self.P(FadeIn(top, shift=DOWN * 0.2), FadeIn(L[0]), FadeIn(R[0]), FadeIn(L[1], scale=1.4), FadeIn(R[1], scale=1.4),
                   FadeIn(L[2]), FadeIn(R[2]), FadeIn(vs), rt=0.3)
            self.at(wt(key, "6") - 0.15)
            flip_in(L[3])
            self.P(Indicate(L[1], color=RED, scale_factor=1.15), rt=0.4)
            self.at(wt(key, "2") - 0.15)
            flip_in(R[3])
            self.P(Indicate(R[1], color=GREEN, scale_factor=1.15), rt=0.4)
            return VGroup(top, *L, *R, vs)

        # ================= HOOK =================
        hook_grp = hook_scene("hook")

        # ================= FEES (phone app with two payment rows) =================
        f_t = label("Capitec fees, 2026", 60, MUTED).move_to([0, 5.9, 0])
        ph = phone_icon(5.4, 7.4).move_to([-1.0, 1.35, 0])
        scr_t = label("Pay another bank", 46, TEXT).move_to(ph.get_top() + DOWN * 0.95)
        def row(y, kind, amt, col):
            r = RoundedRectangle(corner_radius=0.18, width=4.8, height=1.5, color=col, stroke_width=4,
                                 fill_color=col, fill_opacity=0.12).move_to([-1.0, y, 0])
            ic = (bolt_icon(col, 0.38) if kind == "Immediate" else clock_icon(col, 0.32)).move_to(r.get_left() + RIGHT * 0.55)
            tx = label(kind, 40, TEXT).next_to(ic, RIGHT, buff=0.22)
            am = bold(amt, 84, GOLD).move_to(r.get_right() + LEFT * 0.62)
            return VGroup(r, ic, tx, am)
        r1 = row(2.6, "Immediate", "R6", RED)
        r2 = row(0.7, "Normal", "R2", GREEN)
        bk = bank_icon(TEXT, 0.42).move_to([3.35, 1.9, 0])
        bk_l = VGroup(label("another", 34, MUTED), label("bank", 34, MUTED)).arrange(DOWN, buff=0.08).next_to(bk, DOWN, buff=0.25)
        arr = Arrow([1.75, 1.9, 0], [2.6, 1.9, 0], color=MUTED, stroke_width=8, buff=0)
        f_note = label("Your bank's prices may differ.", 40, MUTED).move_to([0, -2.95, 0])
        self.at("fees")
        self.P(FadeOut(hook_grp), rt=0.25)
        self.P(FadeIn(f_t), FadeIn(ph, shift=UP * 0.4), rt=0.4)
        self.P(FadeIn(scr_t), rt=0.25)
        self.at(wt("fees", "immediate") - 0.15)
        self.P(FadeIn(r1, shift=RIGHT * 0.3), rt=0.35)
        self.at(wt("fees", "another") - 0.1)
        self.P(GrowArrow(arr), FadeIn(bk, shift=LEFT * 0.3), FadeIn(bk_l), rt=0.4)
        self.at(wt("fees", "6") - 0.1)
        self.P(Indicate(r1[3], color=GOLD, scale_factor=1.3), rt=0.4)
        self.at(wt("fees", "normal") - 0.15)
        self.P(FadeIn(r2, shift=RIGHT * 0.3), FadeIn(f_note), rt=0.35)
        self.at(wt("fees", "2") - 0.1)
        self.P(Indicate(r2[3], color=GOLD, scale_factor=1.3), rt=0.4)
        fees_grp = VGroup(f_t, ph, scr_t, r1, r2, bk, bk_l, arr, f_note)

        # ================= DIFF: same account, only speed =================
        d_bank = bank_icon(TEXT, 0.9).move_to([0, 4.1, 0])
        d_lab = label("same account", 46, MUTED).next_to(d_bank, DOWN, buff=0.25)
        coinL = coin(0.5).move_to([-3.2, 1.0, 0])
        coinR = coin(0.5).move_to([3.2, 1.0, 0])
        pL = Line([-3.2, 1.0, 0], [-0.7, 3.2, 0], color=RED, stroke_width=6)
        pR = Line([3.2, 1.0, 0], [0.7, 3.2, 0], color=GREEN, stroke_width=6)
        d_sp = bold("ONLY DIFFERENCE: SPEED", 100, GOLD).scale_to_fit_width(7.8).move_to([0, -0.2, 0])
        lane1 = VGroup(bolt_icon(RED, 0.5), label("right away", 60, TEXT)).arrange(RIGHT, buff=0.35).move_to([0, -1.55, 0])
        lane2 = VGroup(clock_icon(GREEN, 0.42), label("can take longer", 60, TEXT)).arrange(RIGHT, buff=0.35).move_to([0, -2.8, 0])
        self.at("diff")
        self.P(FadeOut(fees_grp), rt=0.25)
        self.P(FadeIn(d_bank, scale=0.9), FadeIn(coinL), FadeIn(coinR), rt=0.3)
        self.at(wt("diff", "lands") - 0.15)
        self.P(MoveAlongPath(coinL, pL), MoveAlongPath(coinR, pR), rt=0.7)
        self.P(FadeIn(d_lab), coinL.animate.set_opacity(0), coinR.animate.set_opacity(0), Indicate(d_bank, color=GOLD), rt=0.45)
        self.at(wt("diff", "speed") - 0.15)
        self.P(FadeIn(d_sp, scale=1.2), rt=0.35)
        self.at(wt("diff", "Immediate") - 0.1)
        self.P(FadeIn(lane1, shift=RIGHT * 1.5), rt=0.3)
        self.at(wt("diff", "Normal") - 0.1)
        self.P(FadeIn(lane2, shift=RIGHT * 0.5), rt=0.6)
        diff_grp = VGroup(d_bank, d_lab, coinL, coinR, d_sp, lane1, lane2)

        # ================= MATH: 12 months, two bars =================
        m_t = label("2 payments a month, for a year", 50, MUTED).scale_to_fit_width(7.6).move_to([0, 5.95, 0])
        months = VGroup(*[VGroup(RoundedRectangle(corner_radius=0.08, width=1.05, height=0.75, color=STROKE, stroke_width=3,
                                                  fill_color=PANEL, fill_opacity=1),
                                 label(m, 26, MUTED))
                          for m in ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]])
        for g in months:
            g[1].move_to(g[0])
        months.arrange_in_grid(2, 6, buff=0.12).move_to([0, 4.55, 0])
        base_y = -2.9
        barA = Rectangle(width=2.6, height=4.9, stroke_width=0, fill_color=RED, fill_opacity=1)
        barA.move_to([-1.8, base_y + 2.45, 0])
        barB = Rectangle(width=2.6, height=4.9 * 48 / 144, stroke_width=0, fill_color=GREEN, fill_opacity=1)
        barB.move_to([1.8, base_y + 4.9 * 48 / 144 / 2, 0])
        axis = Line([-3.6, base_y, 0], [3.6, base_y, 0], color=STROKE, stroke_width=6)
        vA = bold("R144", 100, TEXT).scale_to_fit_height(0.85).next_to(barA, UP, buff=0.15)
        vB = bold("R48", 100, TEXT).scale_to_fit_height(0.85).next_to(barB, UP, buff=0.15)
        lA = label("immediate", 38, BG).move_to(barA.get_bottom() + UP * 0.5)
        lB = label("normal", 38, BG).move_to(barB.get_bottom() + UP * 0.5)
        self.at("math")
        self.P(FadeOut(diff_grp), rt=0.25)
        self.P(FadeIn(m_t), LaggedStart(*[FadeIn(m, scale=0.7) for m in months], lag_ratio=0.06), Create(axis), rt=0.8)
        self.at(wt("math", "immediate") - 0.1)
        self.P(LaggedStart(*[m[0].animate.set_fill(RED, 0.55) for m in months], lag_ratio=0.08), rt=1.0)
        self.at(wt("math", "144") - 0.25)
        self.P(GrowFromEdge(barA, DOWN), rt=0.5)
        self.P(FadeIn(vA, shift=UP * 0.2), FadeIn(lA), rt=0.3)
        self.at(wt("math", "normal") - 0.1)
        self.P(LaggedStart(*[m[0].animate.set_fill(GREEN, 0.55) for m in months], lag_ratio=0.06), rt=0.8)
        self.at(wt("math", "48") - 0.2)
        self.P(GrowFromEdge(barB, DOWN), rt=0.4)
        self.P(FadeIn(vB, shift=UP * 0.2), FadeIn(lB), rt=0.3)
        math_grp = VGroup(m_t, months, barA, barB, axis, vA, vB, lA, lB)

        # ================= SAVE: R96 a year =================
        s_amt = tiles_amount("R96", w=1.5, h=2.1, color=GOLD).move_to([0, 3.7, 0])
        s_y = bold("A YEAR, BACK IN YOUR POCKET", 90, GREEN).scale_to_fit_width(7.6).move_to([0, 1.6, 0])
        s_eq = label("R144 - R48 = R96", 56, MUTED).move_to([0, 0.4, 0])
        s_cal = calendar_icon("1", 0.95, GREEN).move_to([-2.0, -1.8, 0])
        s_plan = label("plan ahead", 72, TEXT).next_to(s_cal, RIGHT, buff=0.45)
        self.at("save")
        self.P(FadeOut(math_grp), rt=0.25)
        flip_in(s_amt, rt=0.6)
        self.at(wt("save", "back") - 0.15)
        self.P(FadeIn(s_y, scale=1.15), FadeIn(s_eq), rt=0.4)
        self.at(wt("save", "planning") - 0.15)
        self.P(FadeIn(s_cal, shift=DOWN * 0.3), FadeIn(s_plan, shift=LEFT * 0.3), rt=0.4)
        save_grp = VGroup(s_amt, s_y, s_eq, s_cal, s_plan)

        # ================= CASH: ATM =================
        c_t = bold("CASH COSTS TOO", 110, TEXT).scale_to_fit_width(6.4).move_to([0, 5.9, 0])
        atm = atm_icon(1.25).move_to([0, 2.3, 0])
        bill = note("R1 000", 3.2, 1.45).move_to(atm[4].get_center()).set_z_index(-1)
        bill_target = [-2.0, -1.35, 0]
        c_fee = stamp("-R10 FEE", -1.35, RED, w=4.0, ang=-8, x=2.2)
        c_sub = label("per R1 000 at any SA ATM", 48, MUTED).move_to([0, -2.95, 0])
        self.at("cash")
        self.P(FadeOut(save_grp), rt=0.25)
        self.P(FadeIn(c_t, shift=DOWN * 0.2), FadeIn(atm, shift=UP * 0.4), rt=0.4)
        self.at(wt("cash", "Every") - 0.1)
        self.add(bill)
        self.P(bill.animate.move_to(bill_target).set_z_index(1), rt=0.7)
        self.at(wt("cash", "ATM") - 0.1)
        self.P(Indicate(atm[2], color=BLUE, scale_factor=1.3), rt=0.4)
        self.at(wt("cash", "10") - 0.2)
        self.P(FadeIn(c_fee, scale=1.6), Wiggle(bill, scale_value=1.05), rt=0.35)
        self.P(FadeIn(c_sub), rt=0.3)
        cash_grp = VGroup(c_t, atm, bill, c_fee, c_sub)

        # ================= TIP: bank statement =================
        doc = RoundedRectangle(corner_radius=0.2, width=7.2, height=7.6, color=STROKE, stroke_width=4,
                               fill_color="#ECE6D6", fill_opacity=1).move_to([0, 2.0, 0])
        d_head = bold("BANK STATEMENT", 70, BG).move_to(doc.get_top() + DOWN * 0.6)
        items = [("Monthly fee", "R7.50"), ("Debit orders", "R12.00"), ("Immediate payments", "R12.00"),
                 ("Cash withdrawal", "R20.00"), ("Payments", "R5.00")]
        rows = VGroup()
        for i, (a, b) in enumerate(items):
            y = doc.get_top()[1] - 1.7 - i * 1.0
            rows.add(VGroup(label(a, 36, "#3A3A41").move_to([-3.25, y, 0], aligned_edge=LEFT),
                            label(b, 36, "#3A3A41").move_to([3.25, y, 0], aligned_edge=RIGHT)))
        hi = RoundedRectangle(corner_radius=0.12, width=7.0, height=0.85, color=RED, stroke_width=6,
                              fill_color=RED, fill_opacity=0.18).move_to([0, rows[3].get_y(), 0])
        ex = label("example", 30, GREY).move_to(doc.get_bottom() + UP * 0.45)
        tk = VGroup(tick_icon(GREEN, 0.5), bold("CHANGE ONE HABIT", 80, GREEN)).arrange(RIGHT, buff=0.35)
        tk.scale_to_fit_width(7.4).move_to([0, -2.75, 0])
        self.at("tip")
        self.P(FadeOut(cash_grp), rt=0.25)
        self.P(FadeIn(doc, shift=UP * 0.5), FadeIn(d_head), rt=0.35)
        self.P(LaggedStart(*[FadeIn(r, shift=RIGHT * 0.2) for r in rows], lag_ratio=0.15), FadeIn(ex), rt=0.7)
        self.at(wt("tip", "biggest") - 0.15)
        self.P(Create(hi), rt=0.4)
        self.P(Wiggle(VGroup(hi, rows[3]), scale_value=1.04), rt=0.4)
        self.at(wt("tip", "change") - 0.15)
        self.P(FadeIn(tk, shift=UP * 0.2), rt=0.35)
        tip_grp = VGroup(doc, d_head, rows, hi, ex, tk)

        # ================= GUIDE + FOLLOW =================
        card = RoundedRectangle(corner_radius=0.35, width=7.4, height=3.4, color=GOLD, stroke_width=6,
                                fill_color=PANEL, fill_opacity=1).move_to([0, 3.3, 0])
        g1 = label("FULL STORY", 44, GOLD).move_to(card.get_center() + UP * 1.0)
        g2 = bold("CAPITEC + YOUR FEES", 96, TEXT).scale_to_fit_width(6.6).move_to(card.get_center() + UP * 0.05)
        g3 = label("on the channel", 44, MUTED).move_to(card.get_center() + DOWN * 1.0)
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
        self.at(wt("guide", "Follow") - 0.1)
        self.P(FadeIn(fpill, scale=0.8), FadeIn(fpill_t, scale=0.8), FadeIn(daily), FadeIn(disc), rt=0.5)
        self.P(Indicate(VGroup(fpill, fpill_t), color=GREEN, scale_factor=1.08), rt=0.7)
        guide_grp = VGroup(card, g1, g2, g3, fpill, fpill_t, daily, disc)

        # ================= LOOP =================
        self.at(CUE["loop"][0] - 0.3)
        self.P(FadeOut(guide_grp), rt=0.3)
        hook_scene("loop")
        self.at(END)
