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


class MFZ_TWOPOT_R20K(Scene):
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
            c = mob.get_center(); w = mob.width * 0.48; h = mob.height * 0.42
            return VGroup(Line(c + [-w, -h, 0], c + [w, h, 0], color=color, stroke_width=sw),
                          Line(c + [-w, h, 0], c + [w, -h, 0], color=color, stroke_width=sw))

        def stamp(txt, y, color=RED, w=7.0, ang=-6):
            b = RoundedRectangle(corner_radius=0.2, width=w, height=1.6, color=color, stroke_width=10,
                                 fill_color=color, fill_opacity=0.12).move_to([0, y, 0])
            t = bold(txt, 110, color).scale_to_fit_width(w - 0.7).move_to(b)
            return VGroup(b, t).rotate(ang * DEGREES)

        # ================= HOOK =================
        def hook_board():
            amt = tiles_amount("R20 000", color=GOLD).move_to([0, 3.4, 0])
            pm = label("from your savings pot", 52, MUTED).next_to(amt, DOWN, buff=0.45)
            return amt, pm

        amt, pm = hook_board()
        self.at("hook")
        flip_in(amt, rt=0.8)
        self.P(FadeIn(pm, shift=UP * 0.2), rt=0.35)
        self.at(wt("hook", "don't") - 0.1)
        x0 = cross(amt, sw=14)
        self.P(Create(x0), rt=0.35)
        st = stamp("NOT IN YOUR HAND", -0.2, w=7.2)
        self.P(FadeIn(st, scale=1.6), rt=0.3)
        self.P(Wiggle(st, scale_value=1.05), rt=0.5)
        hook_grp = VGroup(amt, pm, x0, st)

        # ================= RULE: added to income, taxed at your rate =================
        r_t = label("Your income for the year", 50, MUTED).move_to([0, 4.7, 0])
        sal = RoundedRectangle(corner_radius=0.15, width=6.4, height=2.2, stroke_width=0, fill_color=GREY,
                               fill_opacity=1).move_to([0, 2.6, 0])
        sal_t = bold("SALARY", 80, TEXT).move_to(sal)
        wd = RoundedRectangle(corner_radius=0.15, width=6.4, height=1.1, stroke_width=0, fill_color=GOLD,
                              fill_opacity=1).next_to(sal, UP, buff=0.08)
        wd_t = bold("+ R20 000 WITHDRAWAL", 60, BG).scale_to_fit_width(5.6).move_to(wd)
        taxed = label("taxed at your normal rate", 56, TEXT).move_to([0, 0.5, 0])
        tx = stamp("TAXED", -1.1, ang=-4, w=5.0)
        self.at("rule")
        self.P(FadeOut(hook_grp), rt=0.3)
        self.P(FadeIn(r_t), FadeIn(sal), FadeIn(sal_t), rt=0.4)
        self.at(wt("rule", "withdrawal") - 0.1)
        wd.shift(UP * 1.5); wd_t.shift(UP * 1.5)
        self.add(wd, wd_t)
        self.P(wd.animate.shift(DOWN * 1.5), wd_t.animate.shift(DOWN * 1.5), rt=0.5)
        r_t2 = label("Your income for the year", 50, MUTED).next_to(wd, UP, buff=0.3)
        self.P(r_t.animate.move_to(r_t2), rt=0.3)
        self.at(wt("rule", "taxes") - 0.1)
        self.P(FadeIn(taxed, shift=UP * 0.2), rt=0.4)
        self.P(FadeIn(tx, scale=1.5), rt=0.3)
        rule_grp = VGroup(r_t, sal, sal_t, wd, wd_t, taxed, tx)

        # ================= EXAMPLE =================
        e_t = label("Example", 50, GOLD).move_to([0, 4.7, 0])
        m_amt = tiles_amount("R25 000", w=0.9, h=1.3).move_to([0, 3.2, 0])
        m_l = label("a month", 50, MUTED).next_to(m_amt, DOWN, buff=0.3)
        y_box = box(7.0, 2.0, 0.0, stroke=GOLD, sw=5)
        y_amt = bold("R300 000 A YEAR", 96, GOLD).scale_to_fit_width(6.2).move_to(y_box)
        u65 = label("under 65", 54, TEXT).move_to([0, -1.75, 0])
        self.at("example")
        self.P(FadeOut(rule_grp), rt=0.3)
        self.P(FadeIn(e_t), rt=0.2)
        flip_in(m_amt, rt=0.7)
        self.P(FadeIn(m_l), rt=0.3)
        self.at(wt("example", "That's") - 0.05)
        self.P(FadeIn(y_box, scale=0.9), FadeIn(y_amt, scale=0.9), rt=0.45)
        self.at(wt("example", "under") - 0.1)
        self.P(FadeIn(u65, shift=UP * 0.2), rt=0.35)
        ex_grp = VGroup(e_t, m_amt, m_l, y_box, y_amt, u65)

        # ================= RATE: the 26% bracket =================
        b_t = label("SARS tax brackets 2026/27", 46, MUTED).move_to([0, 4.8, 0])
        rows = [("up to R245 100", "18%"), ("R245 101 – R383 100", "26%"), ("R383 101 – R530 200", "31%")]
        rgrp = VGroup()
        for i, (rng, pc) in enumerate(rows):
            y = 3.6 - i * 1.45
            hl = (i == 1)
            b = box(7.6, 1.25, y, stroke=GOLD if hl else STROKE, sw=6 if hl else 3, r=0.2)
            l = label(rng, 42, TEXT if hl else MUTED).move_to([-3.45, y, 0], aligned_edge=LEFT)
            p = bold(pc, 64, GOLD if hl else MUTED).move_to([2.95, y, 0])
            rgrp.add(VGroup(b, l, p))
        you = label("you are here: R300 000", 40, GREEN).next_to(rgrp[1], DOWN, buff=0.12).shift(LEFT * 0.0)
        big = bold("26%", 220, GOLD).move_to([0, -1.2, 0])
        bigl = label("on every extra rand", 48, TEXT).next_to(big, DOWN, buff=0.2)
        self.at("rate")
        self.P(FadeOut(ex_grp), rt=0.3)
        self.P(FadeIn(b_t), LaggedStart(*[FadeIn(r, shift=LEFT * 0.3) for r in rgrp], lag_ratio=0.25), rt=0.8)
        self.at(wt("rate", "every") - 0.1)
        rgrp[2].set_z_index(-1)
        self.P(rgrp[2].animate.set_opacity(0.0), FadeIn(you), Indicate(rgrp[1], color=GOLD, scale_factor=1.04), rt=0.6)
        self.at(wt("rate", "26") - 0.1)
        self.P(FadeIn(big, scale=1.4), FadeIn(bigl), rt=0.4)
        rate_grp = VGroup(b_t, rgrp, you, big, bigl)

        # ================= TAX: R5 200 of R20 000 =================
        BW, BH, BY = 7.6, 1.6, 2.6
        fr = 5200 / 20000
        lx = -BW / 2
        top_l = label("Your R20 000", 54, TEXT).move_to([0, 4.4, 0])
        keep = Rectangle(width=BW, height=BH, stroke_width=0, fill_color=GREEN, fill_opacity=1).move_to([0, BY, 0])
        frame = Rectangle(width=BW, height=BH, color=STROKE, stroke_width=4).move_to([0, BY, 0])
        taxr = Rectangle(width=BW * fr, height=BH, stroke_width=0, fill_color=RED, fill_opacity=1)
        taxr.move_to([lx + BW * fr / 2, BY, 0])
        sars_l = bold("SARS", 56, BG).move_to(taxr)
        tax_amt = bold("≈ R5 200", 120, RED).move_to([0, 0.4, 0])
        tax_l = label("goes to SARS in tax", 48, MUTED).next_to(tax_amt, DOWN, buff=0.2)
        self.at("tax")
        self.P(FadeOut(rate_grp), rt=0.3)
        self.P(FadeIn(top_l), GrowFromEdge(keep, LEFT), Create(frame), rt=0.5)
        self.at(wt("tax", "takes") - 0.1)
        self.P(GrowFromEdge(taxr, LEFT), FadeIn(sars_l), rt=0.5)
        self.at(wt("tax", "5,200") - 0.1)
        self.P(FadeIn(tax_amt, scale=1.3), FadeIn(tax_l), rt=0.4)
        tax_grp = VGroup(top_l, keep, frame, taxr, sars_l, tax_amt, tax_l)

        # ================= LEFT: R14 800, then the fee =================
        lft_l = label("What's left", 54, MUTED).move_to([0, 4.6, 0])
        lft = tiles_amount("R14 800", color=GREEN).move_to([0, 3.2, 0])
        lft_n = label("before fees", 44, MUTED).next_to(lft, DOWN, buff=0.35)
        fee_b = box(7.2, 1.7, 0.2, stroke=RED, sw=5)
        fee_t = bold("− YOUR FUND'S ADMIN FEE", 70, RED).scale_to_fit_width(6.4).move_to(fee_b)
        self.at("left")
        self.P(FadeOut(VGroup(top_l, taxr, sars_l, tax_amt, tax_l, frame)),
               keep.animate.stretch_to_fit_width(BW * (1 - fr)).move_to([0, -2.4, 0]).set_opacity(0), rt=0.3)
        self.remove(keep)
        self.P(FadeIn(lft_l), rt=0.2)
        flip_in(lft, rt=0.8)
        self.P(FadeIn(lft_n), rt=0.3)
        self.at(wt("left", "admin") - 0.2)
        self.P(FadeIn(fee_b, shift=UP * 0.2), FadeIn(fee_t, shift=UP * 0.2), rt=0.4)
        self.P(Indicate(fee_t, color=RED), rt=0.5)
        left_grp = VGroup(lft_l, lft, lft_n, fee_b, fee_t)

        # ================= DEBT: SARS first =================
        d_q = bold("OWE SARS?", 120, GOLD).move_to([0, 4.2, 0])
        s1 = box(7.2, 1.5, 2.2, stroke=RED, sw=5)
        s1t = label("1.  SARS takes the debt", 50, RED).move_to(s1)
        s2 = box(7.2, 1.5, -0.3, stroke=GREEN, sw=5)
        s2t = label("2.  Then you get paid", 50, GREEN).move_to(s2)
        ar = Arrow([0, 1.42, 0], [0, 0.48, 0], buff=0, color=MUTED, stroke_width=10, max_tip_length_to_length_ratio=0.4)
        self.at("debt")
        self.P(FadeOut(left_grp), rt=0.3)
        self.P(FadeIn(d_q, scale=1.3), rt=0.35)
        self.at(wt("debt", "taken") - 0.1)
        self.P(FadeIn(s1, shift=UP * 0.2), FadeIn(s1t, shift=UP * 0.2), rt=0.4)
        self.at(wt("debt", "before") - 0.1)
        self.P(GrowArrow(ar), FadeIn(s2, shift=UP * 0.2), FadeIn(s2t, shift=UP * 0.2), rt=0.4)
        debt_grp = VGroup(d_q, s1, s1t, s2, s2t, ar)

        # ================= LIMITS =================
        c1 = box(3.6, 3.4, 2.6, x=-1.95, stroke=GOLD, sw=5)
        c1a = bold("1×", 160, GOLD).move_to(c1.get_center() + UP * 0.4)
        c1b = label("per tax year", 40, TEXT).move_to(c1.get_center() + DOWN * 1.05)
        c2 = box(3.6, 3.4, 2.6, x=1.95, stroke=GOLD, sw=5)
        c2a = bold("R2 000", 110, GOLD).scale_to_fit_width(3.0).move_to(c2.get_center() + UP * 0.4)
        c2b = label("minimum", 40, TEXT).move_to(c2.get_center() + DOWN * 1.05)
        self.at("limits")
        self.P(FadeOut(debt_grp), rt=0.3)
        self.at(wt("limits", "once") - 0.15)
        self.P(FadeIn(c1, scale=0.9), FadeIn(c1a, scale=0.9), FadeIn(c1b), rt=0.4)
        self.at(wt("limits", "from") - 0.1)
        self.P(FadeIn(c2, scale=0.9), FadeIn(c2a, scale=0.9), FadeIn(c2b), rt=0.4)
        lim_grp = VGroup(c1, c1a, c1b, c2, c2a, c2b)

        # ================= GUIDE + FOLLOW =================
        card = RoundedRectangle(corner_radius=0.35, width=7.4, height=3.4, color=GOLD, stroke_width=6,
                                fill_color=PANEL, fill_opacity=1).move_to([0, 3.0, 0])
        g1 = label("FULL GUIDE", 44, GOLD).move_to(card.get_center() + UP * 1.0)
        g2 = bold("TWO-POT SYSTEM", 96, TEXT).scale_to_fit_width(6.4).move_to(card.get_center() + UP * 0.05)
        g3 = label("on the channel", 44, MUTED).move_to(card.get_center() + DOWN * 1.0)
        fpill = RoundedRectangle(corner_radius=0.55, width=6.2, height=1.1, stroke_width=0, fill_color=GREEN,
                                 fill_opacity=1).move_to([0, -0.2, 0])
        fpill_t = bold("+ FOLLOW", 66, BG).move_to(fpill)
        daily = label("a new money rule every day", 44, TEXT).move_to([0, -1.5, 0])
        disc = label("General information, not financial advice.", 30, MUTED).move_to([0, -2.5, 0])
        self.at("guide")
        self.P(FadeOut(lim_grp), rt=0.3)
        self.P(DrawBorderThenFill(card), FadeIn(g1), FadeIn(g2), FadeIn(g3), rt=0.7)
        self.at(wt("guide", "Follow") - 0.1)
        self.P(FadeIn(fpill, scale=0.8), FadeIn(fpill_t, scale=0.8), FadeIn(daily), FadeIn(disc), rt=0.5)
        self.P(Indicate(VGroup(fpill, fpill_t), color=GREEN, scale_factor=1.08), rt=0.7)
        guide_grp = VGroup(card, g1, g2, g3, fpill, fpill_t, daily, disc)

        # ================= LOOP: back to R20 000 =================
        amt2, pm2 = hook_board()
        q = label("what will you really get?", 54, TEXT).move_to([0, 0.6, 0])
        self.at("loop")
        self.P(FadeOut(guide_grp), rt=0.3)
        flip_in(amt2, rt=0.8)
        self.P(FadeIn(pm2), rt=0.3)
        self.at(wt("loop", "work") - 0.1)
        self.P(FadeIn(q, shift=UP * 0.2), rt=0.35)
        self.at(END)
