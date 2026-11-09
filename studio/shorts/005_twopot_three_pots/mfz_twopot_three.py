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


class MFZ_TWOPOT_THREE(Scene):
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

        def lock_icon(color=GOLD, s=1.0):
            body = RoundedRectangle(corner_radius=0.08 * s, width=0.9 * s, height=0.7 * s, stroke_width=0,
                                    fill_color=color, fill_opacity=1)
            shackle = Arc(radius=0.3 * s, start_angle=0, angle=PI, color=color, stroke_width=12 * s)
            shackle.next_to(body, UP, buff=-0.02)
            hole = Circle(radius=0.08 * s, stroke_width=0, fill_color=BG, fill_opacity=1).move_to(body)
            return VGroup(shackle, body, hole)

        POT_C = [BLUE, GREEN, GOLD]
        POT_N = ["VESTED", "SAVINGS", "RETIREMENT"]
        POT_X = [-2.9, 0, 2.9]
        PY = 3.3

        def pot(i, y=PY):
            c = POT_C[i]
            jar = RoundedRectangle(corner_radius=0.35, width=2.6, height=2.9, color=c, stroke_width=6,
                                   fill_color=PANEL, fill_opacity=1).move_to([POT_X[i], y - 0.15, 0])
            lid = RoundedRectangle(corner_radius=0.1, width=2.0, height=0.36, stroke_width=0, fill_color=c,
                                   fill_opacity=1).next_to(jar, UP, buff=0.08)
            num = bold(str(i + 1), 120, c).move_to(jar.get_center() + UP * 0.45)
            nm = label(POT_N[i], 40, TEXT)
            if nm.width > 2.25:
                nm.scale_to_fit_width(2.25)
            nm.move_to(jar.get_center() + DOWN * 0.8)
            return VGroup(jar, lid, num, nm)

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
            c = mob.get_center(); w = mob.width * 0.42; h = mob.height * 0.38
            return VGroup(Line(c + [-w, -h, 0], c + [w, h, 0], color=color, stroke_width=sw),
                          Line(c + [-w, h, 0], c + [w, -h, 0], color=color, stroke_width=sw))

        # ================= HOOK: "two-pot" ... three pots =================
        def hook_board():
            t2 = flip_tile("2", w=2.1, h=2.9, color=GOLD, gold_edge=True).move_to([-1.55, 3.4, 0])
            pw = bold("POTS", 200, TEXT).next_to(t2, RIGHT, buff=0.4)
            g = VGroup(t2, pw).move_to([0, 3.4, 0])
            return g

        hb = hook_board()
        sub = label("it's called two-pot...", 54, MUTED).move_to([0, 1.2, 0])
        self.at("hook")
        flip_in([hb[0]], rt=0.5)
        self.P(FadeIn(hb[1], shift=LEFT * 0.3), FadeIn(sub), rt=0.4)
        self.at(wt("hook", "three") - 0.12)
        t3 = flip_tile("3", w=2.1, h=2.9, color=GREEN).move_to(hb[0])
        self.P(hb[0].animate.stretch(0.02, 1), rt=0.12)
        self.remove(hb[0]); t3.save_state(); t3.stretch(0.02, 1); self.add(t3)
        self.P(Restore(t3), rt=0.18)
        st = stamp("THREE POTS", -0.6, color=GREEN, w=6.6)
        self.P(FadeIn(st, scale=1.6), rt=0.3)
        self.P(Wiggle(st, scale_value=1.05), rt=0.45)
        hook_grp = Group(t3, hb[1], sub, st)

        # ================= POT ROW =================
        pots = [pot(i) for i in range(3)]
        row = VGroup(*pots)

        def focus(i):
            self.P(*[p.animate.set_opacity(1.0 if j == i else 0.28) for j, p in enumerate(pots)], rt=0.3)
            self.P(Indicate(pots[i], color=POT_C[i], scale_factor=1.06), rt=0.4)

        # ---- pot 1: vested ----
        v_l = label("Everything saved up to", 50, MUTED).move_to([0, 0.9, 0])
        v_d = tiles_amount("31 AUG 2024", w=0.68, h=1.0, color=BLUE, gap=0.05).move_to([0, -0.3, 0])
        v_r = RoundedRectangle(corner_radius=0.2, width=6.6, height=1.15, color=BLUE, stroke_width=5,
                               fill_color=BLUE, fill_opacity=0.12).move_to([0, -1.8, 0])
        v_rt = bold("OLD RULES APPLY", 66, BLUE).scale_to_fit_width(5.6).move_to(v_r)
        self.at("vested")
        self.P(FadeOut(hook_grp), rt=0.3)
        self.P(LaggedStart(*[FadeIn(p, shift=UP * 0.3) for p in pots], lag_ratio=0.2), rt=0.6)
        focus(0)
        self.at(wt("vested", "Everything") - 0.1)
        self.P(FadeIn(v_l), rt=0.3)
        flip_in(v_d, rt=0.8)
        self.at(wt("vested", "old") - 0.1)
        self.P(FadeIn(v_r, scale=0.9), FadeIn(v_rt, scale=0.9), rt=0.4)
        v_grp = VGroup(v_l, v_d, v_r, v_rt)

        # ---- pot 2: savings ----
        s_big = bold("1/3", 220, GREEN).move_to([0, 0.0, 0])
        s_l = label("of what goes in from", 48, MUTED).move_to([0, -1.5, 0])
        s_d = bold("1 SEPTEMBER 2024", 70, TEXT).move_to([0, -2.3, 0])
        self.at("savings")
        self.P(FadeOut(v_grp), rt=0.3)
        focus(1)
        self.at(wt("savings", "One") - 0.1)
        self.P(FadeIn(s_big, scale=1.3), rt=0.4)
        self.at(wt("savings", "from") - 0.15)
        self.P(FadeIn(s_l), FadeIn(s_d, shift=UP * 0.2), rt=0.4)
        s_grp = VGroup(s_big, s_l, s_d)

        # ---- pot 3: retirement ----
        r_big = bold("2/3", 220, GOLD).move_to([-0.9, 0.0, 0])
        r_lock = lock_icon(GOLD, 1.7).next_to(r_big, RIGHT, buff=0.6)
        r_l = bold("LOCKED UNTIL YOU RETIRE", 70, TEXT).scale_to_fit_width(7.2).move_to([0, -1.6, 0])
        self.at("retire")
        self.P(FadeOut(s_grp), rt=0.3)
        focus(2)
        self.at(wt("retire", "other") - 0.1)
        self.P(FadeIn(r_big, scale=1.3), rt=0.4)
        self.at(wt("retire", "locked") - 0.1)
        self.P(FadeIn(r_lock, shift=DOWN * 0.3), FadeIn(r_l, shift=UP * 0.2), rt=0.4)
        r_grp = VGroup(r_big, r_lock, r_l)

        # ---- seed: 10% of vested, max R30 000, into savings ----
        arc = CurvedArrow(pots[0][0].get_bottom() + [0.3, -0.1, 0], pots[1][0].get_bottom() + [-0.3, -0.1, 0],
                          angle=PI * 0.7, color=GREEN, stroke_width=10)
        sd_l = label("once-off start", 50, MUTED).move_to([0, 0.15, 0])
        sd_big = bold("10%", 180, GREEN).move_to([-1.9, -1.3, 0])
        sd_of = label("of your vested pot", 40, TEXT).next_to(sd_big, DOWN, buff=0.1)
        sd_box = box(3.6, 2.0, -1.45, x=2.1, stroke=GOLD, sw=5)
        sd_mx = label("max", 40, MUTED).move_to(sd_box.get_center() + UP * 0.55)
        sd_amt = bold("R30 000", 100, GOLD).scale_to_fit_width(3.1).move_to(sd_box.get_center() + DOWN * 0.25)
        self.at("seed")
        self.P(FadeOut(r_grp), pots[0].animate.set_opacity(1), pots[1].animate.set_opacity(1),
               pots[2].animate.set_opacity(0.28), rt=0.35)
        self.at(wt("seed", "start") - 0.2)
        self.P(Create(arc), FadeIn(sd_l), rt=0.5)
        self.at(wt("seed", "10") - 0.1)
        self.P(FadeIn(sd_big, scale=1.3), FadeIn(sd_of), rt=0.4)
        self.at(wt("seed", "up") - 0.1)
        self.P(FadeIn(sd_box, scale=0.9), FadeIn(sd_mx), FadeIn(sd_amt, scale=0.9), rt=0.4)
        seed_grp = VGroup(arc, sd_l, sd_big, sd_of, sd_box, sd_mx, sd_amt, row)

        # ---- example: R1 500 a month -> R500 + R1 000 ----
        e_t = label("Example", 50, GOLD).move_to([0, 5.4, 0])
        e_amt = tiles_amount("R1 500", w=1.0, h=1.4).move_to([0, 3.9, 0])
        e_m = label("a month into your fund", 46, MUTED).next_to(e_amt, DOWN, buff=0.3)
        BW, BH, BY = 7.8, 1.5, 0.7
        lx = -BW / 2
        sv = Rectangle(width=BW / 3, height=BH, stroke_width=0, fill_color=GREEN, fill_opacity=1).move_to([lx + BW / 6, BY, 0])
        rt_ = Rectangle(width=BW * 2 / 3, height=BH, stroke_width=0, fill_color=GOLD, fill_opacity=1).move_to([lx + BW * 2 / 3, BY, 0])
        svt = bold("R500", 70, BG).move_to(sv)
        rtt = bold("R1 000", 70, BG).move_to(rt_)
        svl = label("savings", 42, GREEN).next_to(sv, DOWN, buff=0.25)
        rtl_lock = lock_icon(GOLD, 0.55)
        rtl = VGroup(rtl_lock, label("locked away", 42, GOLD)).arrange(RIGHT, buff=0.2).next_to(rt_, DOWN, buff=0.25)
        self.at("example")
        self.P(FadeOut(seed_grp), rt=0.3)
        self.P(FadeIn(e_t), rt=0.2)
        flip_in(e_amt, rt=0.7)
        self.P(FadeIn(e_m), rt=0.3)
        self.at(wt("example", "500") - 0.1)
        self.P(GrowFromEdge(sv, LEFT), FadeIn(svt), FadeIn(svl), rt=0.45)
        self.at(wt("example", "1,000") - 0.1)
        self.P(GrowFromEdge(rt_, LEFT), FadeIn(rtt), FadeIn(rtl), rt=0.5)
        ex_grp = VGroup(e_t, e_amt, e_m, sv, rt_, svt, rtt, svl, rtl)

        # ---- access: only the savings pot ----
        pots2 = [pot(i, y=3.6) for i in range(3)]
        lk1 = lock_icon(RED, 1.25).move_to(pots2[0][0].get_center() + UP * 0.3)
        lk3 = lock_icon(RED, 1.25).move_to(pots2[2][0].get_center() + UP * 0.3)
        tk = tick_icon(GREEN, 0.9).move_to(pots2[1][0].get_center() + DOWN * 2.0)
        a_l = label("still in the fund?", 50, MUTED).move_to([0, 5.85, 0])
        c1 = box(3.6, 2.9, -0.6, x=-1.95, stroke=GOLD, sw=5)
        c1a = bold("1×", 140, GOLD).move_to(c1.get_center() + UP * 0.35)
        c1b = label("per tax year", 38, TEXT).move_to(c1.get_center() + DOWN * 0.9)
        c2 = box(3.6, 2.9, -0.6, x=1.95, stroke=GOLD, sw=5)
        c2a = bold("R2 000", 100, GOLD).scale_to_fit_width(3.0).move_to(c2.get_center() + UP * 0.35)
        c2b = label("minimum", 38, TEXT).move_to(c2.get_center() + DOWN * 0.9)
        self.at("access")
        self.P(FadeOut(ex_grp), rt=0.3)
        self.P(FadeIn(VGroup(*pots2), shift=UP * 0.2), FadeIn(a_l), rt=0.45)
        self.at(wt("access", "only") - 0.1)
        self.P(pots2[0].animate.set_opacity(0.3), pots2[2].animate.set_opacity(0.3),
               FadeIn(lk1, scale=1.3), FadeIn(lk3, scale=1.3), rt=0.4)
        self.P(Indicate(pots2[1], color=GREEN, scale_factor=1.08), Create(tk), rt=0.5)
        self.at(wt("access", "once") - 0.15)
        self.P(FadeOut(tk), FadeIn(c1, scale=0.9), FadeIn(c1a, scale=0.9), FadeIn(c1b), rt=0.4)
        self.at(wt("access", "from") - 0.1)
        self.P(FadeIn(c2, scale=0.9), FadeIn(c2a, scale=0.9), FadeIn(c2b), rt=0.4)
        acc_grp = VGroup(*pots2, lk1, lk3, a_l, c1, c1a, c1b, c2, c2a, c2b)

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
        self.P(FadeOut(acc_grp), rt=0.3)
        self.P(DrawBorderThenFill(card), FadeIn(g1), FadeIn(g2), FadeIn(g3), rt=0.7)
        self.at(wt("guide", "Follow") - 0.1)
        self.P(FadeIn(fpill, scale=0.8), FadeIn(fpill_t, scale=0.8), FadeIn(daily), FadeIn(disc), rt=0.5)
        self.P(Indicate(VGroup(fpill, fpill_t), color=GREEN, scale_factor=1.08), rt=0.7)
        guide_grp = VGroup(card, g1, g2, g3, fpill, fpill_t, daily, disc)

        # ================= LOOP: "two-pot"? which of the three =================
        hb2 = hook_board()
        q = label("which of the three?", 60, TEXT).move_to([0, 1.2, 0])
        mini = VGroup(*[pot(i, y=-0.9) for i in range(3)]).scale(0.62).move_to([0, -1.0, 0])
        self.at("loop")
        self.P(FadeOut(guide_grp), rt=0.3)
        flip_in([hb2[0]], rt=0.5)
        self.P(FadeIn(hb2[1], shift=LEFT * 0.3), rt=0.35)
        self.at(wt("loop", "which") - 0.15)
        self.P(FadeIn(q, shift=UP * 0.2), LaggedStart(*[FadeIn(m, shift=UP * 0.2) for m in mini], lag_ratio=0.2), rt=0.6)
        self.at(END)
