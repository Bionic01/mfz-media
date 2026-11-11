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
        if s - 0.01 <= w[1] <= e + 0.01 and w[0].lower().strip(".,'") .startswith(word.lower()):
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


class MFZ_EFUND_R10K(Scene):
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

        def flip_in(group, rt=0.9):
            for t in group:
                t.save_state()
                t.stretch(0.02, 1)
            self.add(*group)
            self.P(LaggedStart(*[Restore(t) for t in group], lag_ratio=0.12), rt=rt)

        def stamp(txt, y, color=RED, w=7.0, ang=-6):
            b = RoundedRectangle(corner_radius=0.2, width=w, height=1.6, color=color, stroke_width=10,
                                 fill_color=color, fill_opacity=0.12).move_to([0, y, 0])
            t = bold(txt, 110, color).scale_to_fit_width(w - 0.7).move_to(b)
            return VGroup(b, t).rotate(ang * DEGREES)

        def pill(txt, y, color, w=6.0, x=0):
            p = RoundedRectangle(corner_radius=0.5, width=w, height=1.0, color=color, stroke_width=5,
                                 fill_color=color, fill_opacity=0.14).move_to([x, y, 0])
            t = bold(txt, 64, color)
            if t.width > w - 0.6:
                t.scale_to_fit_width(w - 0.6)
            return VGroup(p, t.move_to(p))

        def hook_scene(key, fw):
            """R10 000 emergency question (used for the hook and the loop ending)."""
            em = pill("EMERGENCY", 4.6, RED, w=5.4)
            amt = tiles_amount("R10 000", w=1.0, h=1.45, color=GOLD).move_to([0, 2.7, 0])
            q = VGroup(label("from savings,", 60, TEXT), label("today?", 60, TEXT)).arrange(DOWN, buff=0.15).move_to([0, 0.4, 0])
            self.at(key)
            self.P(FadeIn(em, scale=1.3), rt=0.3)
            self.at(wt(key, "10,000") - 0.15)
            flip_in(amt, rt=0.7)
            self.P(Wiggle(em, scale_value=1.06), rt=0.4)
            self.at(wt(key, fw) - 0.1)
            self.P(FadeIn(q, shift=UP * 0.2), rt=0.4)
            return VGroup(em, amt, q)

        # ================= HOOK =================
        hook_grp = hook_scene("hook", "from")

        # ================= SURVEY =================
        s_t = label("JustMoney survey, 2026", 50, MUTED).move_to([0, 5.4, 0])
        s_n = bold("5 400+ people", 110, TEXT).scale_to_fit_width(6.4).move_to([0, 4.2, 0])
        ppl = VGroup(*[person(GREY, 1.1) for _ in range(5)]).arrange(RIGHT, buff=0.35).move_to([0, 1.9, 0])
        s_big = bold("FEWER THAN 1 IN 5", 110, GREEN).scale_to_fit_width(7.4).move_to([0, -0.15, 0])
        s_sub = label("could cover it from savings", 48, TEXT).move_to([0, -1.25, 0])
        self.at("survey")
        self.P(FadeOut(hook_grp), rt=0.3)
        self.P(FadeIn(s_t), rt=0.25)
        self.at(wt("survey", "5,400") - 0.1)
        self.P(FadeIn(s_n, scale=1.2), rt=0.35)
        self.P(LaggedStart(*[FadeIn(p, shift=UP * 0.3) for p in ppl], lag_ratio=0.15), rt=0.7)
        self.at(wt("survey", "fewer") - 0.1)
        self.P(FadeIn(s_big, scale=1.2), rt=0.35)
        self.at(wt("survey", "five") - 0.1)
        self.P(ppl[0].animate.set_color(GREEN).scale(1.12), FadeIn(s_sub, shift=UP * 0.2), rt=0.4)
        surv_grp = VGroup(s_t, s_n, ppl, s_big, s_sub)

        # ================= EARNERS =================
        e_t = label("not only low earners", 54, MUTED).move_to([0, 5.4, 0])
        e_p = pill("EARNING OVER R35 000 / MONTH", 4.2, GOLD, w=7.6)
        e_big = bold("57%", 300, RED).scale_to_fit_height(2.6).move_to([0, 1.7, 0])
        e_sub = VGroup(label("could NOT cover", 52, TEXT), label("R10 000 from savings", 52, TEXT)).arrange(DOWN, buff=0.12).move_to([0, -0.5, 0])
        bar_bg = RoundedRectangle(corner_radius=0.2, width=7.4, height=0.5, stroke_width=0, fill_color=GREY, fill_opacity=0.6).move_to([0, -1.9, 0])
        bar = RoundedRectangle(corner_radius=0.2, width=7.4 * 0.57, height=0.5, stroke_width=0, fill_color=RED, fill_opacity=1)
        bar.align_to(bar_bg, LEFT).set_y(-1.9)
        self.at("earners")
        self.P(FadeOut(surv_grp), rt=0.3)
        self.P(FadeIn(e_t), rt=0.3)
        self.at(wt("earners", "people") - 0.1)
        self.P(FadeIn(e_p, scale=0.9), rt=0.4)
        self.at(wt("earners", "57%") - 0.1)
        self.add(bar_bg)
        self.P(FadeIn(e_big, scale=1.4), GrowFromEdge(bar, LEFT), rt=0.5)
        self.at(wt("earners", "could") - 0.1)
        self.P(FadeIn(e_sub, shift=UP * 0.2), rt=0.4)
        earn_grp = VGroup(e_t, e_p, e_big, e_sub, bar_bg, bar)

        # ================= BORROW =================
        b_big = bold("43%", 300, GOLD).scale_to_fit_height(2.6).move_to([0, 4.0, 0])
        b_sub = label("borrow before month-end", 56, TEXT).scale_to_fit_width(7.2).move_to([0, 2.15, 0])
        cal = calendar_icon("31", 1.1).move_to([-1.9, 0.0, 0])
        cash = VGroup(*[coin(0.42) for _ in range(3)]).arrange(DOWN, buff=0.12).move_to([2.2, 0.0, 0])
        arr = Arrow([-0.5, 0, 0], [1.3, 0, 0], color=MUTED, stroke_width=8, buff=0)
        b_cap = label("just to cover living costs", 44, MUTED).move_to([0, -2.05, 0])
        self.at("borrow")
        self.P(FadeOut(earn_grp), rt=0.25)
        self.P(FadeIn(b_big, scale=1.4), rt=0.35)
        self.at(wt("borrow", "borrow") - 0.15)
        self.P(FadeIn(b_sub, shift=UP * 0.2), rt=0.35)
        self.at(wt("borrow", "month-end") - 0.1)
        self.P(FadeIn(cal, shift=DOWN * 0.3), rt=0.35)
        self.P(GrowArrow(arr), LaggedStart(*[FadeIn(c, shift=LEFT * 0.4) for c in cash], lag_ratio=0.2), rt=0.5)
        self.at(wt("borrow", "living") - 0.1)
        self.P(FadeIn(b_cap), rt=0.3)
        bor_grp = VGroup(b_big, b_sub, cal, cash, arr, b_cap)

        # ================= DEBT =================
        d_em = pill("EMERGENCY", 4.3, RED, w=5.4)
        d_arr = Arrow([0, 3.5, 0], [0, 2.1, 0], color=MUTED, stroke_width=10, buff=0)
        d_st = stamp("BORROWED MONEY", 1.0, RED, w=7.2, ang=-5)
        d_sub = label("more debt", 56, MUTED).move_to([0, -0.9, 0])
        self.at("debt")
        self.P(FadeOut(bor_grp), rt=0.25)
        self.at(wt("debt", "emergency") - 0.15)
        self.P(FadeIn(d_em, scale=1.3), rt=0.3)
        self.P(Wiggle(d_em, scale_value=1.06), rt=0.35)
        self.at(wt("debt", "paid") - 0.15)
        self.P(GrowArrow(d_arr), rt=0.25)
        self.at(wt("debt", "borrowed") - 0.1)
        self.P(FadeIn(d_st, scale=1.6), rt=0.3)
        self.P(FadeIn(d_sub), rt=0.3)
        debt_grp = VGroup(d_em, d_arr, d_st, d_sub)

        # ================= FIX =================
        f_t = bold("THE FIX: START SMALL", 110, GREEN).scale_to_fit_width(7.4).move_to([0, 5.3, 0])
        jar = jar_icon(1.0).move_to([0, 2.4, 0])
        f_goal = bold("R2 000", 120, GOLD).scale_to_fit_width(2.1).move_to(jar[0])
        f_l = label("first goal", 44, MUTED).next_to(jar, DOWN, buff=0.3)
        f_p = pill("SEPARATE SAVINGS ACCOUNT", -0.85, BLUE, w=7.4)
        self.at("fix")
        self.P(FadeOut(debt_grp), rt=0.25)
        self.P(FadeIn(f_t, shift=DOWN * 0.2), rt=0.35)
        self.at(wt("fix", "Aim") - 0.1)
        self.P(Create(jar[0]), FadeIn(jar[1]), rt=0.5)
        self.at(wt("fix", "2,000") - 0.1)
        self.P(FadeIn(f_goal, scale=1.3), FadeIn(f_l), rt=0.4)
        self.at(wt("fix", "separate") - 0.1)
        self.P(FadeIn(f_p, scale=0.9), rt=0.35)
        fix_grp = VGroup(f_t, jar, f_goal, f_l, f_p)

        # ================= MATH =================
        m_eq = bold("R200 x 10 MONTHS", 110, TEXT).scale_to_fit_width(7.2).move_to([0, 5.0, 0])
        segs = VGroup(*[RoundedRectangle(corner_radius=0.08, width=0.62, height=1.3, color=STROKE, stroke_width=3,
                                         fill_color=PANEL, fill_opacity=1) for _ in range(10)]).arrange(RIGHT, buff=0.1).move_to([0, 2.7, 0])
        fills = VGroup(*[RoundedRectangle(corner_radius=0.08, width=0.62, height=1.3, stroke_width=0,
                                          fill_color=GREEN, fill_opacity=1).move_to(s) for s in segs])
        mlab = VGroup(*[label(str(i + 1), 30, MUTED).next_to(segs[i], DOWN, buff=0.15) for i in range(10)])
        m_res = bold("= R2 000", 150, GOLD).scale_to_fit_width(4.6).move_to([0, 0.3, 0])
        self.at("math")
        self.P(FadeOut(fix_grp), rt=0.25)
        self.P(FadeIn(m_eq, shift=DOWN * 0.2), FadeIn(segs), FadeIn(mlab), rt=0.35)
        self.at(wt("math", "gets") - 0.1)
        self.P(LaggedStart(*[FadeIn(f, scale=0.6) for f in fills], lag_ratio=0.3), rt=1.0)
        self.P(FadeIn(m_res, scale=1.3), rt=0.35)
        math_grp = VGroup(m_eq, segs, fills, mlab, m_res)

        # ================= GOAL =================
        g_t = label("then keep building", 54, MUTED).move_to([0, 5.4, 0])
        line = Line([-3.3, 3.2, 0], [3.3, 3.2, 0], color=STROKE, stroke_width=10)
        d1 = Dot([-3.3, 3.2, 0], radius=0.22, color=GOLD)
        d2 = Dot([3.3, 3.2, 0], radius=0.22, color=GREEN)
        l1 = bold("R2 000", 80, GOLD).scale_to_fit_width(2.4).move_to([-2.6, 2.3, 0])
        l1s = label("starter", 38, MUTED).next_to(l1, DOWN, buff=0.1)
        l2 = bold("3-6 MONTHS", 80, GREEN).scale_to_fit_width(3.6).move_to([2.0, 2.3, 0])
        l2s = label("of essential costs", 38, MUTED).scale_to_fit_width(3.4).next_to(l2, DOWN, buff=0.1)
        prog = Line([-3.3, 3.2, 0], [3.3, 3.2, 0], color=GREEN, stroke_width=10)
        self.at("goal")
        self.P(FadeOut(math_grp), rt=0.25)
        self.P(FadeIn(g_t), Create(line), FadeIn(d1), FadeIn(l1), FadeIn(l1s), rt=0.5)
        self.at(wt("goal", "three") - 0.15)
        self.P(Create(prog), rt=0.7)
        self.P(FadeIn(d2, scale=1.5), FadeIn(l2, shift=UP * 0.2), rt=0.35)
        self.at(wt("goal", "essential") - 0.1)
        self.P(FadeIn(l2s), rt=0.3)
        goal_grp = VGroup(g_t, line, d1, d2, l1, l1s, l2, l2s, prog)

        # ================= GUIDE + FOLLOW =================
        card = RoundedRectangle(corner_radius=0.35, width=7.4, height=3.4, color=GOLD, stroke_width=6,
                                fill_color=PANEL, fill_opacity=1).move_to([0, 3.0, 0])
        g1 = label("FULL GUIDE", 44, GOLD).move_to(card.get_center() + UP * 1.0)
        g2 = bold("EMERGENCY FUND", 96, TEXT).scale_to_fit_width(6.4).move_to(card.get_center() + UP * 0.05)
        g3 = label("on the channel", 44, MUTED).move_to(card.get_center() + DOWN * 1.0)
        fpill = RoundedRectangle(corner_radius=0.55, width=6.2, height=1.1, stroke_width=0, fill_color=GREEN,
                                 fill_opacity=1).move_to([0, -0.2, 0])
        fpill_t = bold("+ FOLLOW", 66, BG).move_to(fpill)
        daily = label("a new money rule every day", 44, TEXT).move_to([0, -1.5, 0])
        disc = label("General information, not financial advice.", 30, MUTED).move_to([0, -2.5, 0])
        self.at("guide")
        self.P(FadeOut(goal_grp), rt=0.3)
        self.P(DrawBorderThenFill(card), FadeIn(g1), FadeIn(g2), FadeIn(g3), rt=0.7)
        self.at(wt("guide", "Follow") - 0.1)
        self.P(FadeIn(fpill, scale=0.8), FadeIn(fpill_t, scale=0.8), FadeIn(daily), FadeIn(disc), rt=0.5)
        self.P(Indicate(VGroup(fpill, fpill_t), color=GREEN, scale_factor=1.08), rt=0.7)
        guide_grp = VGroup(card, g1, g2, g3, fpill, fpill_t, daily, disc)

        # ================= LOOP =================
        self.at(CUE["loop"][0] - 0.3)
        self.P(FadeOut(guide_grp), rt=0.3)
        hook_scene("loop", "today")
        self.at(END)
