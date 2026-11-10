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


class MFZ_EFUND_CODI(Scene):
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
            c = mob.get_center(); w = mob.width * 0.45; h = mob.height * 0.4
            return VGroup(Line(c + [-w, -h, 0], c + [w, h, 0], color=color, stroke_width=sw),
                          Line(c + [-w, h, 0], c + [w, -h, 0], color=color, stroke_width=sw))

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

        # ================= HOOK =================
        bk = bank_icon(TEXT, 1.25).move_to([0, 3.9, 0])
        self.at("hook")
        self.P(FadeIn(bk, shift=DOWN * 0.3), rt=0.4)
        self.at(wt("hook", "fails") - 0.05)
        crk = cross(bk, RED, 14)
        self.P(Create(crk), bk.animate.set_color(MUTED), rt=0.4)
        self.P(Wiggle(VGroup(bk, crk), scale_value=1.04), rt=0.4)
        self.at(wt("hook", "how") - 0.05)
        q = label("how much is safe?", 60, TEXT).move_to([0, 1.3, 0])
        self.P(FadeIn(q, shift=UP * 0.2), rt=0.4)
        self.at(wt("hook", "100,000") - 0.12)
        amt = tiles_amount("R100 000", w=0.95, h=1.35, color=GOLD).move_to([0, -0.4, 0])
        flip_in(amt, rt=0.8)
        hook_grp = VGroup(bk, crk, q, amt)

        # ================= CODI =================
        c_l = label("since", 50, MUTED).move_to([0, 5.4, 0])
        c_d = tiles_amount("1 APR 2024", w=0.7, h=1.0, color=TEXT, gap=0.05).move_to([0, 4.3, 0])
        sh = shield_icon(GREEN, 1.25).move_to([0, 1.3, 0])
        sh_t = bold("CODI", 130, GREEN).scale_to_fit_width(1.9).move_to(sh.get_center() + UP * 0.3)
        c_full = VGroup(label("Corporation for", 46, TEXT), label("Deposit Insurance", 46, TEXT)).arrange(DOWN, buff=0.12).move_to([0, -1.75, 0])
        self.at("codi")
        self.P(FadeOut(hook_grp), rt=0.3)
        self.P(FadeIn(c_l), rt=0.2)
        flip_in(c_d, rt=0.8)
        self.at(wt("codi", "insured") - 0.1)
        self.P(DrawBorderThenFill(sh), rt=0.5)
        self.at(wt("codi", "CODI") - 0.1)
        self.P(FadeIn(sh_t, scale=1.3), rt=0.35)
        self.at(wt("codi", "Corporation") - 0.1)
        self.P(FadeIn(c_full, shift=UP * 0.2), rt=0.4)
        codi_grp = VGroup(c_l, c_d, sh, sh_t, c_full)

        # ================= LIMIT =================
        l_up = label("covered up to", 50, MUTED).move_to([0, 5.3, 0])
        l_amt = bold("R100 000", 200, GOLD).scale_to_fit_width(7.4).move_to([0, 3.8, 0])
        p1 = pill("PER PERSON", 1.6, GREEN)
        p2 = pill("PER BANK", 0.2, GREEN)
        p3 = label("+ interest included", 54, TEXT).move_to([0, -1.2, 0])
        self.at("limit")
        self.P(FadeOut(codi_grp), rt=0.3)
        self.P(FadeIn(l_up), rt=0.2)
        self.at(wt("limit", "100,000") - 0.1)
        self.P(FadeIn(l_amt, scale=1.3), rt=0.4)
        self.at(wt("limit", "person") - 0.12)
        self.P(FadeIn(p1, scale=0.9), rt=0.3)
        self.at(wt("limit", "bank") - 0.12)
        self.P(FadeIn(p2, scale=0.9), rt=0.3)
        self.at(wt("limit", "includes") - 0.1)
        self.P(FadeIn(p3, shift=UP * 0.2), rt=0.35)
        lim_grp = VGroup(l_up, l_amt, p1, p2, p3)

        # ================= FREE =================
        fa = box(3.8, 3.8, 3.0, x=-2.05, stroke=GREEN, sw=5)
        fa_i = tick_icon(GREEN, 0.9).move_to(fa.get_center() + UP * 0.8)
        fa_t = bold("AUTOMATIC", 70, TEXT).scale_to_fit_width(3.2).move_to(fa.get_center() + DOWN * 0.45)
        fa_s = label("you don't apply", 36, MUTED).move_to(fa.get_center() + DOWN * 1.3)
        fb = box(3.8, 3.8, 3.0, x=2.05, stroke=GOLD, sw=5)
        fb_i = bold("R0", 120, GOLD).move_to(fb.get_center() + UP * 0.75)
        fb_t = bold("FREE", 70, TEXT).move_to(fb.get_center() + DOWN * 0.45)
        fb_s = label("you don't pay", 36, MUTED).move_to(fb.get_center() + DOWN * 1.3)
        self.at("free")
        self.P(FadeOut(lim_grp), rt=0.3)
        self.P(FadeIn(fa, scale=0.9), Create(fa_i), FadeIn(fa_t), rt=0.45)
        self.at(wt("free", "free") - 0.12)
        self.P(FadeIn(fb, scale=0.9), FadeIn(fb_i, scale=1.2), FadeIn(fb_t), rt=0.4)
        self.at(wt("free", "apply") - 0.15)
        self.P(FadeIn(fa_s), rt=0.3)
        self.at(wt("free", "pay") - 0.15)
        self.P(FadeIn(fb_s), rt=0.3)
        free_grp = VGroup(fa, fa_i, fa_t, fa_s, fb, fb_i, fb_t, fb_s)

        # ================= COVERED =================
        cv_t = bold("COVERED", 110, GREEN).move_to([0, 5.3, 0])
        names = ["Savings account", "Cheque account", "Notice deposit", "Fixed deposit", "Bank money market account"]
        cues = [("Savings", 1), ("cheque", 1), ("notice", 1), ("fixed", 1), ("money", 1)]
        rows = []
        for k, n in enumerate(names):
            y = 3.85 - k * 1.12
            pnl = RoundedRectangle(corner_radius=0.2, width=7.6, height=0.92, color=STROKE, stroke_width=3,
                                   fill_color=PANEL, fill_opacity=1).move_to([0, y, 0])
            tk = tick_icon(GREEN, 0.42).move_to([-3.25, y, 0])
            tx = label(n, 46, TEXT)
            if tx.width > 6.0:
                tx.scale_to_fit_width(6.0)
            tx.next_to(tk, RIGHT, buff=0.4)
            rows.append(VGroup(pnl, tk, tx))
        self.at("covered")
        self.P(FadeOut(free_grp), rt=0.3)
        self.P(FadeIn(cv_t, shift=DOWN * 0.2), rt=0.3)
        for r, (wd, nth) in zip(rows, cues):
            self.at(wt("covered", wd, nth) - 0.1)
            self.P(FadeIn(r, shift=RIGHT * 0.3), rt=0.3)
        self.P(Indicate(rows[4], color=GREEN, scale_factor=1.04), rt=0.5)
        cov_grp = VGroup(cv_t, *rows)

        # ================= TRAP =================
        t_box = box(7.6, 2.6, 3.4, stroke=RED, sw=6)
        t_tx = VGroup(bold("MONEY MARKET", 96, TEXT), bold("UNIT TRUST", 96, TEXT)).arrange(DOWN, buff=0.1)
        t_tx.scale_to_fit_width(6.2).move_to(t_box)
        t_st = stamp("NOT COVERED", 0.6, RED, w=6.8)
        t_sub = VGroup(label("an investment,", 50, TEXT), label("not a bank deposit", 50, MUTED)).arrange(DOWN, buff=0.15).move_to([0, -1.5, 0])
        self.at("trap")
        self.P(cov_grp.animate.set_opacity(0.0), rt=0.3)
        self.remove(cov_grp)
        self.P(FadeIn(t_box, scale=0.9), FadeIn(t_tx, scale=0.9), rt=0.4)
        self.at(wt("trap", "not") - 0.1)
        self.P(FadeIn(t_st, scale=1.6), rt=0.3)
        self.P(Wiggle(t_st, scale_value=1.05), rt=0.4)
        self.at(wt("trap", "investment") - 0.15)
        self.P(FadeIn(t_sub, shift=UP * 0.2), rt=0.4)
        trap_grp = VGroup(t_box, t_tx, t_st, t_sub)

        # ================= BANKS =================
        bA = bank_icon(TEXT, 0.75).move_to([-2.1, 4.3, 0])
        bB = bank_icon(TEXT, 0.75).move_to([2.1, 4.3, 0])
        lA = label("Bank A", 40, MUTED).next_to(bA, DOWN, buff=0.2)
        lB = label("Bank B", 40, MUTED).next_to(bB, DOWN, buff=0.2)
        chips = VGroup(*[RoundedRectangle(corner_radius=0.1, width=1.0, height=0.55, stroke_width=0,
                                          fill_color=BLUE, fill_opacity=1) for _ in range(3)]).arrange(RIGHT, buff=0.15)
        chips.move_to([-2.1, 1.7, 0])
        ch_l = label("3 accounts", 38, BLUE).next_to(chips, DOWN, buff=0.2)
        capA = box(3.7, 1.6, -0.3, x=-2.1, stroke=GOLD, sw=5)
        capA_t = bold("R100 000", 80, GOLD).scale_to_fit_width(3.1).move_to(capA)
        oneL = label("one limit", 40, TEXT).next_to(capA, DOWN, buff=0.2)
        capB = box(3.7, 1.6, -0.3, x=2.1, stroke=GOLD, sw=5)
        capB_t = bold("R100 000", 80, GOLD).scale_to_fit_width(3.1).move_to(capB)
        ownL = label("its own limit", 40, TEXT).next_to(capB, DOWN, buff=0.2)
        self.at("banks")
        self.P(FadeOut(trap_grp), rt=0.3)
        self.P(FadeIn(bA, shift=DOWN * 0.2), FadeIn(lA), rt=0.35)
        self.at(wt("banks", "accounts") - 0.1)
        self.P(LaggedStart(*[FadeIn(c, shift=DOWN * 0.2) for c in chips], lag_ratio=0.25), FadeIn(ch_l), rt=0.5)
        self.at(wt("banks", "share") - 0.1)
        self.P(FadeIn(capA, scale=0.9), FadeIn(capA_t, scale=0.9), rt=0.4)
        self.P(chips.animate.arrange(RIGHT, buff=0.02).move_to([-2.1, 1.7, 0]), FadeIn(oneL), rt=0.4)
        self.at(wt("banks", "second") - 0.1)
        self.P(FadeIn(bB, shift=DOWN * 0.2), FadeIn(lB), rt=0.35)
        self.at(wt("banks", "100,000") - 0.15)
        self.P(FadeIn(capB, scale=0.9), FadeIn(capB_t, scale=0.9), FadeIn(ownL), rt=0.4)
        banks_grp = VGroup(bA, bB, lA, lB, chips, ch_l, capA, capA_t, oneL, capB, capB_t, ownL)

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
        self.P(FadeOut(banks_grp), rt=0.3)
        self.P(DrawBorderThenFill(card), FadeIn(g1), FadeIn(g2), FadeIn(g3), rt=0.7)
        self.at(wt("guide", "Follow") - 0.1)
        self.P(FadeIn(fpill, scale=0.8), FadeIn(fpill_t, scale=0.8), FadeIn(daily), FadeIn(disc), rt=0.5)
        self.P(Indicate(VGroup(fpill, fpill_t), color=GREEN, scale_factor=1.08), rt=0.7)
        guide_grp = VGroup(card, g1, g2, g3, fpill, fpill_t, daily, disc)

        # ================= LOOP =================
        bk2 = bank_icon(TEXT, 1.25).move_to([0, 3.9, 0])
        q2 = label("how much of yours is safe?", 56, TEXT).scale_to_fit_width(7.6).move_to([0, 1.3, 0])
        self.at("loop")
        self.P(FadeOut(guide_grp), rt=0.3)
        self.P(FadeIn(bk2, shift=DOWN * 0.3), rt=0.4)
        self.at(wt("loop", "failed") - 0.05)
        crk2 = cross(bk2, RED, 14)
        self.P(Create(crk2), bk2.animate.set_color(MUTED), rt=0.4)
        self.at(wt("loop", "how") - 0.1)
        self.P(FadeIn(q2, shift=UP * 0.2), rt=0.4)
        self.at(END)
