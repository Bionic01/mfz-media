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


class MFZ_TFSA_UNUSED(Scene):
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

        def cross(mob, color=RED, sw=12):
            c = mob.get_center(); w = mob.width * 0.42; h = mob.height * 0.42
            return VGroup(Line(c + [-w, -h, 0], c + [w, h, 0], color=color, stroke_width=sw),
                          Line(c + [-w, h, 0], c + [w, -h, 0], color=color, stroke_width=sw))

        def stamp(txt, y, color=RED, w=7.0, ang=-6):
            b = RoundedRectangle(corner_radius=0.2, width=w, height=1.6, color=color, stroke_width=10,
                                 fill_color=color, fill_opacity=0.12).move_to([0, y, 0])
            t = bold(txt, 110, color).scale_to_fit_width(w - 0.7).move_to(b)
            return VGroup(b, t).rotate(ang * DEGREES)

        # ================= HOOK =================
        def hook_board():
            amt = tiles_amount("R46 000", color=GOLD).move_to([0, 3.4, 0])
            pm = label("of tax-free space a year", 52, MUTED).next_to(amt, DOWN, buff=0.45)
            return amt, pm

        amt, pm = hook_board()
        skip = label("Skip a year?", 64, TEXT).move_to([0, 0.9, 0])
        st = stamp("GONE FOREVER", -0.8)
        self.at("hook")
        flip_in(amt, rt=0.8)
        self.P(FadeIn(pm, shift=UP * 0.2), rt=0.35)
        self.P(FadeIn(skip, shift=UP * 0.2), rt=0.35)
        self.at(wt("hook", "Forever") - 0.15)
        self.P(FadeIn(st, scale=1.6), rt=0.3)
        self.P(Wiggle(st, scale_value=1.05), rt=0.5)
        hook_grp = Group(amt, pm, skip, st)

        # ================= RULE: SARS says forfeited =================
        q = box(7.6, 4.2, 2.9)
        q1 = label("SARS says:", 46, GOLD).move_to([-3.3, 4.45, 0], aligned_edge=LEFT)
        q2 = label("any unused part of the", 52, TEXT).move_to([0, 3.6, 0])
        q3 = label("yearly limit is", 52, TEXT).move_to([0, 2.85, 0])
        q4 = bold("FORFEITED", 120, RED).move_to([0, 1.75, 0])
        y1 = box(2.9, 1.5, -0.9, x=-2.3)
        y1t = bold("2026/27", 72, TEXT).scale_to_fit_width(2.4).move_to(y1)
        y2 = box(2.9, 1.5, -0.9, x=2.3)
        y2t = bold("2027/28", 72, MUTED).scale_to_fit_width(2.4).move_to(y2)
        arr = Arrow([-0.6, -0.9, 0], [0.6, -0.9, 0], buff=0, color=MUTED, stroke_width=8, max_tip_length_to_length_ratio=0.5)
        nocarry = label("does NOT carry over", 48, RED).move_to([0, -2.3, 0])
        self.at("rule")
        self.P(FadeOut(hook_grp), rt=0.3)
        self.P(FadeIn(q), FadeIn(q1), rt=0.4)
        self.P(FadeIn(q2), FadeIn(q3), rt=0.4)
        self.at(wt("rule", "forfeited") - 0.1)
        self.P(FadeIn(q4, scale=1.3), rt=0.35)
        self.at(wt("rule", "It") - 0.1)
        self.P(FadeIn(y1), FadeIn(y1t), FadeIn(y2), FadeIn(y2t), GrowArrow(arr), rt=0.5)
        x = cross(Square(0.9).move_to(arr), sw=10)
        self.at(wt("rule", "carry") - 0.1)
        self.P(Create(x), FadeIn(nocarry, shift=UP * 0.2), rt=0.4)
        rule_grp = VGroup(q, q1, q2, q3, q4, y1, y1t, y2, y2t, arr, x, nocarry)

        # ================= EXAMPLE: R10 000 used, R36 000 lost =================
        title = label("This tax year's limit: R46 000", 50, MUTED).move_to([0, 4.6, 0])
        BW, BH, BY = 7.6, 1.5, 2.9
        frac = 10000 / 46000
        left_x = -BW / 2
        used = Rectangle(width=BW * frac, height=BH, stroke_width=0, fill_color=GREEN, fill_opacity=1)
        used.move_to([left_x + BW * frac / 2, BY, 0])
        unused = Rectangle(width=BW * (1 - frac), height=BH, stroke_width=0, fill_color=GREY, fill_opacity=1)
        unused.move_to([left_x + BW * frac + BW * (1 - frac) / 2, BY, 0])
        frame = Rectangle(width=BW, height=BH, color=STROKE, stroke_width=4).move_to([0, BY, 0])
        ul = bold("R10 000", 64, GREEN).next_to(used, DOWN, buff=0.3).align_to(used, LEFT)
        ul2 = label("put in", 40, MUTED).next_to(ul, DOWN, buff=0.12).align_to(ul, LEFT)
        nl = bold("R36 000", 64, TEXT).next_to(unused, DOWN, buff=0.3).align_to(unused, RIGHT)
        nl2 = label("unused", 40, MUTED).next_to(nl, DOWN, buff=0.12).align_to(nl, RIGHT)
        cal = box(5.6, 2.0, -1.6, stroke=RED, sw=5)
        cal1 = label("1 March", 50, MUTED).move_to(cal.get_center() + UP * 0.45)
        cal2 = bold("R36 000 GONE", 86, RED).scale_to_fit_width(4.9).move_to(cal.get_center() + DOWN * 0.35)
        self.at("example")
        self.P(FadeOut(rule_grp), rt=0.3)
        self.P(FadeIn(title), Create(frame), rt=0.4)
        self.P(GrowFromEdge(used, LEFT), FadeIn(ul), FadeIn(ul2), rt=0.5)
        self.at(wt("example", "other") - 0.1)
        self.P(GrowFromEdge(unused, LEFT), FadeIn(nl), FadeIn(nl2), rt=0.5)
        self.at(wt("example", "disappears") - 0.1)
        ghost = DashedVMobject(Rectangle(width=unused.width, height=BH, color=RED, stroke_width=5).move_to(unused), num_dashes=40)
        self.P(unused.animate.set_fill(RED, opacity=0.35), rt=0.4)
        self.P(FadeOut(unused), FadeIn(ghost), nl.animate.set_color(RED), rt=0.5)
        self.at(wt("example", "first") - 0.1)
        self.P(FadeIn(cal, scale=0.9), FadeIn(cal1), FadeIn(cal2), rt=0.45)
        ex_grp = VGroup(title, used, frame, ul, ul2, nl, nl2, ghost, cal, cal1, cal2)

        # ================= NEXT: no catch-up =================
        n1 = box(7.4, 2.6, 3.6)
        n1a = label("Carried to next year?", 46, MUTED).move_to([0, 4.3, 0])
        n1b = bold("+R36 000", 96, TEXT).move_to([0, 3.25, 0])
        nx = cross(n1b, sw=10)
        catch = stamp("NO CATCH-UP", 1.2, ang=-4)
        only = label("only next year's limit", 54, TEXT).move_to([0, -0.6, 0])
        self.at("next")
        self.P(FadeOut(ex_grp), rt=0.3)
        self.P(FadeIn(n1), FadeIn(n1a), FadeIn(n1b), rt=0.4)
        self.P(Create(nx), rt=0.3)
        self.P(FadeIn(catch, scale=1.5), rt=0.3)
        self.at(wt("next", "You", 2) - 0.1)
        self.P(FadeIn(only, shift=UP * 0.2), rt=0.4)
        next_grp = VGroup(n1, n1a, n1b, nx, catch, only)

        # ================= LIFETIME + MATH: about 11 years =================
        lt = tiles_amount("R500 000", w=0.86, h=1.25, color=GOLD).move_to([0, 4.2, 0])
        ltl = label("lifetime limit", 52, MUTED).next_to(lt, DOWN, buff=0.35)
        oyt = label("filled one year at a time", 48, TEXT).move_to([0, 1.9, 0])
        CW, CH, CG = 0.56, 1.0, 0.08
        cells = VGroup(*[RoundedRectangle(corner_radius=0.08, width=CW, height=CH, stroke_width=3, color=STROKE,
                                          fill_color=PANEL, fill_opacity=1) for _ in range(11)]).arrange(RIGHT, buff=CG)
        cells.move_to([0, 0.5, 0])
        fills = VGroup(*[RoundedRectangle(corner_radius=0.08, width=CW, height=CH, stroke_width=0,
                                          fill_color=GREEN, fill_opacity=1).move_to(c) for c in cells])
        self.at("lifetime")
        self.P(FadeOut(next_grp), rt=0.3)
        flip_in(lt, rt=0.8)
        self.P(FadeIn(ltl), rt=0.3)
        self.at(wt("lifetime", "you") - 0.1)
        self.P(FadeIn(oyt), FadeIn(cells), rt=0.4)
        self.P(LaggedStart(*[FadeIn(f) for f in fills[:3]], lag_ratio=0.4), rt=0.9)

        eq = bold("R500 000 ÷ R46 000", 76, TEXT).move_to([0, -0.9, 0])
        eqn = label("at today's limit", 36, MUTED).move_to([0, -3.1, 0])
        eq2 = bold("≈ 11 YEARS", 110, GOLD).move_to([0, -2.2, 0])
        self.at("math")
        self.P(FadeIn(eq, shift=UP * 0.2), rt=0.4)
        self.P(LaggedStart(*[FadeIn(f) for f in fills[3:]], lag_ratio=0.25), rt=1.0)
        self.at(wt("math", "about") - 0.1)
        self.P(FadeIn(eq2, scale=1.3), FadeIn(eqn), rt=0.4)
        # skip a year: one cell goes red, row grows to 12
        self.at(wt("math", "Every") - 0.1)
        extra = RoundedRectangle(corner_radius=0.08, width=CW, height=CH, stroke_width=4, color=RED,
                                 fill_color=RED, fill_opacity=0.25)
        row12 = VGroup(*cells, extra).copy().arrange(RIGHT, buff=CG).move_to([0, 0.5, 0])
        self.P(*[c.animate.move_to(row12[i]) for i, c in enumerate(cells)],
               *[f.animate.move_to(row12[i]) for i, f in enumerate(fills)], rt=0.4)
        extra.move_to(row12[11])
        plus = bold("+1", 54, RED).next_to(extra, UP, buff=0.15)
        self.P(FadeIn(extra, scale=1.4), FadeIn(plus), Transform(eq2, bold("12 YEARS", 110, RED).move_to(eq2)), rt=0.45)
        self.at(wt("math", "adds"))
        self.P(Indicate(VGroup(extra, plus), color=RED), rt=0.6)
        life_grp = VGroup(lt, ltl, oyt, cells, fills, eq, eqn, eq2, extra, plus)

        # ================= DEADLINE =================
        cb = RoundedRectangle(corner_radius=0.3, width=5.4, height=5.0, color=GOLD, stroke_width=6,
                              fill_color=PANEL, fill_opacity=1).move_to([0, 2.4, 0])
        ctop = RoundedRectangle(corner_radius=0.3, width=5.4, height=1.1, stroke_width=0, fill_color=GOLD,
                                fill_opacity=1).move_to(cb.get_top() + DOWN * 0.55)
        ctop_t = bold("TAX YEAR ENDS", 60, BG).move_to(ctop)
        cday = bold("28", 180, TEXT).move_to(cb.get_center() + DOWN * 0.05)
        cmon = bold("FEBRUARY 2027", 60, MUTED).move_to(cb.get_center() + DOWN * 1.7)
        dl = bold("YOUR DEADLINE", 96, GOLD).move_to([0, -1.3, 0])
        self.at("deadline")
        self.P(FadeOut(life_grp), rt=0.3)
        self.P(DrawBorderThenFill(cb), FadeIn(ctop), FadeIn(ctop_t), rt=0.5)
        self.P(FadeIn(cday, scale=1.3), FadeIn(cmon), rt=0.4)
        self.at(wt("deadline", "That's") - 0.1)
        self.P(FadeIn(dl, scale=1.2), rt=0.35)
        self.P(Indicate(dl, color=GOLD), rt=0.5)
        dl_grp = VGroup(cb, ctop, ctop_t, cday, cmon, dl)

        # ================= SAFE: don't go over =================
        g = box(7.4, 2.6, 3.6, stroke=GREEN, sw=5)
        gk = tick_icon(GREEN, 0.45).move_to([-3.05, 3.25, 0])
        g1 = label("Max per tax year, all accounts", 36, MUTED).move_to([0, 4.3, 0])
        g2 = bold("R46 000 IN TOTAL", 84, GREEN).scale_to_fit_width(5.6).move_to([0.35, 3.25, 0])
        r = box(7.4, 3.0, 0.3, stroke=RED, sw=5)
        r1 = label("Go over?", 44, MUTED).move_to([0, 1.3, 0])
        r2 = bold("40% PENALTY", 100, RED).scale_to_fit_width(6.4).move_to([0, 0.4, 0])
        r3 = label("on the extra", 40, MUTED).move_to([0, -0.65, 0])
        self.at("safe")
        self.P(FadeOut(dl_grp), rt=0.3)
        self.P(FadeIn(g), Create(gk), FadeIn(g1), FadeIn(g2), rt=0.5)
        self.at(wt("safe", "or") - 0.1)
        self.P(FadeIn(r), FadeIn(r1), rt=0.3)
        self.at(wt("safe", "40") - 0.1)
        self.P(FadeIn(r2, scale=1.3), FadeIn(r3), rt=0.4)
        safe_grp = VGroup(g, gk, g1, g2, r, r1, r2, r3)

        # ================= GUIDE + FOLLOW =================
        card = RoundedRectangle(corner_radius=0.35, width=7.4, height=3.4, color=GOLD, stroke_width=6,
                                fill_color=PANEL, fill_opacity=1).move_to([0, 3.0, 0])
        c1 = label("FULL GUIDE", 44, GOLD).move_to(card.get_center() + UP * 1.0)
        c2 = bold("TAX-FREE SAVINGS", 96, TEXT).scale_to_fit_width(6.4).move_to(card.get_center() + UP * 0.05)
        c3 = label("on the channel", 44, MUTED).move_to(card.get_center() + DOWN * 1.0)
        fpill = RoundedRectangle(corner_radius=0.55, width=6.2, height=1.1, stroke_width=0, fill_color=GREEN,
                                 fill_opacity=1).move_to([0, -0.2, 0])
        fpill_t = bold("+ FOLLOW", 66, BG).move_to(fpill)
        daily = label("a new money rule every day", 44, TEXT).move_to([0, -1.5, 0])
        disc = label("General information, not financial advice.", 30, MUTED).move_to([0, -2.5, 0])
        self.at("guide")
        self.P(FadeOut(safe_grp), rt=0.3)
        self.P(DrawBorderThenFill(card), FadeIn(c1), FadeIn(c2), FadeIn(c3), rt=0.7)
        self.at(wt("guide", "Follow") - 0.1)
        self.P(FadeIn(fpill, scale=0.8), FadeIn(fpill_t, scale=0.8), FadeIn(daily), FadeIn(disc), rt=0.5)
        self.P(Indicate(VGroup(fpill, fpill_t), color=GREEN, scale_factor=1.08), rt=0.7)
        guide_grp = VGroup(card, c1, c2, c3, fpill, fpill_t, daily, disc)

        # ================= LOOP: back to R46 000 =================
        nb = label("never comes back", 64, RED).move_to([0, 0.9, 0])
        amt2, pm2 = hook_board()
        self.at("loop")
        self.P(FadeOut(guide_grp), rt=0.3)
        flip_in(amt2, rt=0.8)
        self.P(FadeIn(pm2), rt=0.3)
        self.at(wt("loop", "never") - 0.1)
        self.P(FadeIn(nb, shift=UP * 0.2), rt=0.35)
        self.at(END)
