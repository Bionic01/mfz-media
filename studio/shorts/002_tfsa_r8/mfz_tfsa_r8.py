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


class MFZ_TFSA_R8(Scene):
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

    def sub(self, key, frac):
        s, e = CUE[key]
        return s + frac * (e - s)

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

        def money_row(lab, value, y, color=TEXT):
            b = box(7.4, 1.15, y, r=0.25)
            l = label(lab, 42, MUTED).move_to([-3.4, y, 0], aligned_edge=LEFT)
            vv = bold(value, 68, color).move_to([3.4, y, 0], aligned_edge=RIGHT)
            return VGroup(b, l, vv)

        # ================= HOOK: R3 834 a month =================
        def hook_board():
            amt = tiles_amount("R3 834", color=GOLD).move_to([0, 3.3, 0])
            pm = label("a month into your TFSA", 52, MUTED).next_to(amt, DOWN, buff=0.45)
            return amt, pm

        amt, pm = hook_board()
        stamp_box = RoundedRectangle(corner_radius=0.2, width=7.0, height=1.6, color=RED, stroke_width=10,
                                     fill_color=RED, fill_opacity=0.12).move_to([0, -0.4, 0])
        stamp_t = bold("OVER THE LIMIT", 110, RED).scale_to_fit_width(6.3).move_to(stamp_box)
        stamp = VGroup(stamp_box, stamp_t).rotate(-6 * DEGREES)
        self.at("hook")
        flip_in(amt, rt=0.8)
        self.P(FadeIn(pm, shift=UP * 0.2), rt=0.35)
        self.at(self.sub("hook", 0.78))
        self.P(FadeIn(stamp, scale=1.6), rt=0.3)
        self.P(Wiggle(stamp, scale_value=1.05), rt=0.6)
        hook_grp = VGroup(amt, pm, stamp)

        # ================= MATH: 12 x R3 834 = R46 008 =================
        cal = VGroup()
        for i in range(12):
            r, c = divmod(i, 4)
            cell = RoundedRectangle(corner_radius=0.12, width=1.7, height=0.95, color=STROKE, stroke_width=3,
                                    fill_color=PANEL, fill_opacity=1).move_to([-2.85 + c * 1.9, 3.6 - r * 1.15, 0])
            cell_t = label("R3 834", 30, GOLD).move_to(cell)
            cal.add(VGroup(cell, cell_t))
        times = label("12 months  ×  R3 834", 48, MUTED).move_to([0, -0.2, 0])
        v = ValueTracker(0)
        total = always_redraw(lambda: bold(rands(v.get_value()), 170, TEXT).move_to([0, -1.9, 0]))
        self.at("math")
        self.P(FadeOut(hook_grp), rt=0.3)
        self.P(LaggedStart(*[FadeIn(c, scale=0.7) for c in cal], lag_ratio=0.08), rt=1.2)
        self.P(FadeIn(times), rt=0.3)
        self.at(self.sub("math", 0.6))
        self.add(total)
        self.P(v.animate.set_value(46008), rt=1.2, rate_func=rush_from)
        math_grp = VGroup(cal, times)

        # ================= LIMIT: R46 000 vs R46 008 =================
        lim_t = label("Yearly limit", 40, MUTED).move_to([-3.6, 3.9, 0], aligned_edge=LEFT)
        lim_v = bold("R46 000", 96, GREEN).move_to([3.6, 3.9, 0], aligned_edge=RIGHT)
        you_t = label("You put in", 40, MUTED).move_to([-3.6, 2.4, 0], aligned_edge=LEFT)
        you_v = bold("R46 008", 96, TEXT).move_to([3.6, 2.4, 0], aligned_edge=RIGHT)
        bar_w, bar_y = 7.4, 0.5
        bar_bg = RoundedRectangle(corner_radius=0.2, width=bar_w, height=1.0, color=GREY, stroke_width=3,
                                  fill_color=PANEL, fill_opacity=1).move_to([0, bar_y, 0])
        fill = RoundedRectangle(corner_radius=0.2, width=bar_w - 0.35, height=1.0, stroke_width=0, fill_color=GREEN,
                                fill_opacity=1).move_to([-0.175, bar_y, 0])
        over = Rectangle(width=0.35, height=1.0, stroke_width=0, fill_color=RED, fill_opacity=1).move_to([bar_w / 2 - 0.175, bar_y, 0])
        lim_line = DashedLine([bar_w / 2 - 0.35, bar_y + 0.8, 0], [bar_w / 2 - 0.35, bar_y - 0.8, 0], color=TEXT, stroke_width=5, dash_length=0.12)
        r8 = bold("R8 TOO MUCH", 130, RED).scale_to_fit_width(6.6).move_to([0, -1.5, 0])
        arr = Arrow(r8.get_top() + RIGHT * 2.6, over.get_bottom(), color=RED, stroke_width=10, buff=0.15)
        self.at("limit")
        self.P(FadeOut(math_grp), total.animate.set_opacity(0), rt=0.3)
        self.remove(total)
        self.P(FadeIn(lim_t), FadeIn(lim_v, shift=LEFT * 0.3), FadeIn(bar_bg), rt=0.4)
        self.P(GrowFromEdge(fill, LEFT), Create(lim_line), rt=0.8)
        self.at(self.sub("limit", 0.6))
        self.P(FadeIn(you_t), FadeIn(you_v, shift=LEFT * 0.3), GrowFromEdge(over, LEFT), rt=0.4)
        self.P(FadeIn(r8, scale=1.3), GrowArrow(arr), rt=0.4)
        limit_grp = VGroup(lim_t, lim_v, you_t, you_v, bar_bg, fill, over, lim_line, r8, arr)

        # ================= PENALTY: 40% =================
        sars = label("SARS", 60, MUTED).move_to([0, 5.0, 0])
        pct = bold("40%", 300, RED).move_to([0, 2.4, 0])
        pen = bold("PENALTY", 130, TEXT).next_to(pct, DOWN, buff=0.2)
        on_every = label("on every rand above the limit", 48, MUTED).next_to(pen, DOWN, buff=0.4)
        self.at("penalty")
        self.P(FadeOut(limit_grp), rt=0.3)
        self.P(FadeIn(sars), FadeIn(pct, scale=1.4), rt=0.5)
        self.P(FadeIn(pen, shift=UP * 0.2), rt=0.35)
        self.at(self.sub("penalty", 0.55))
        self.P(FadeIn(on_every), rt=0.4)
        pen_grp = VGroup(sars, pct, pen, on_every)

        # ================= SMALL: R8 x 40% = R3.20 =================
        eq1 = bold("R8  ×  40%", 140, TEXT).move_to([0, 3.4, 0])
        eq_eq = bold("=", 140, MUTED).move_to([0, 1.9, 0])
        eq2 = bold("R3.20", 230, GOLD).move_to([0, 0.2, 0])
        same = label("Same rule for big mistakes", 52, RED).move_to([0, -1.8, 0])
        self.at("small")
        self.P(FadeOut(pen_grp), rt=0.3)
        self.P(FadeIn(eq1, shift=DOWN * 0.2), rt=0.4)
        self.at(self.sub("small", 0.25))
        self.P(FadeIn(eq_eq), FadeIn(eq2, scale=0.7), rt=0.5)
        self.at(self.sub("small", 0.5))
        self.P(eq2.animate.scale(0.7).set_opacity(0.6), FadeIn(same, shift=UP * 0.2), rt=0.5)
        small_grp = VGroup(eq1, eq_eq, eq2, same)

        # ================= BIG: R50 000 -> R1 600 =================
        bt = bold("A BIGGER MISTAKE", 90, GOLD).scale_to_fit_width(7.0).move_to([0, 4.5, 0])
        r_in = money_row("You put in", "R50 000", 2.9)
        r_lim = money_row("Yearly limit", "R46 000", 1.5)
        r_ex = money_row("Extra", "R4 000", 0.1, GOLD)
        r_pen = money_row("Penalty (40%)", "R1 600", -1.3, RED)
        r_pen[0].set_stroke(RED, 5)
        src = label("Example from SARS", 34, MUTED).move_to([0, -2.45, 0])
        self.at("big")
        self.P(FadeOut(small_grp), FadeIn(bt, shift=DOWN * 0.2), rt=0.35)
        self.P(FadeIn(r_in, shift=UP * 0.2), rt=0.35)
        self.P(FadeIn(r_lim, shift=UP * 0.2), rt=0.35)
        self.at(self.sub("big", 0.35))
        self.P(FadeIn(r_ex, shift=UP * 0.2), rt=0.35)
        self.at(self.sub("big", 0.66))
        self.P(FadeIn(r_pen, shift=UP * 0.2), FadeIn(src), rt=0.4)
        self.P(Indicate(r_pen, color=RED, scale_factor=1.05), rt=0.8)
        big_grp = VGroup(bt, r_in, r_lim, r_ex, r_pen, src)

        # ================= ALL ACCOUNTS: one limit =================
        def acct(name, x):
            b = RoundedRectangle(corner_radius=0.3, width=3.0, height=2.3, color=TEXT, stroke_width=5,
                                 fill_color=PANEL, fill_opacity=1).move_to([x, 3.0, 0])
            n = label(name, 44).move_to(b.get_center() + UP * 0.45)
            s = label("TFSA", 40, GOLD).move_to(b.get_center() + DOWN * 0.45)
            return VGroup(b, n, s)
        a1, a2 = acct("Account 1", -2.1), acct("Account 2", 2.1)
        plus = bold("+", 120, MUTED).move_to([0, 3.0, 0])
        a_arr = Arrow([0, 1.6, 0], [0, 0.45, 0], color=TEXT, stroke_width=10, buff=0)
        one = RoundedRectangle(corner_radius=0.3, width=7.4, height=1.5, color=GREEN, stroke_width=6,
                               fill_color=GREEN, fill_opacity=0.15).move_to([0, -0.4, 0])
        one_t = bold("ONE R46 000 LIMIT", 90, GREEN).scale_to_fit_width(6.6).move_to(one)
        not2 = label("2 accounts  ≠  2 limits", 54, RED).move_to([0, -2.2, 0])
        self.at("all")
        self.P(FadeOut(big_grp), rt=0.3)
        self.P(FadeIn(a1, shift=RIGHT * 0.3), FadeIn(a2, shift=LEFT * 0.3), FadeIn(plus), rt=0.5)
        self.at(self.sub("all", 0.3))
        self.P(GrowArrow(a_arr), FadeIn(one, scale=0.9), FadeIn(one_t, scale=0.9), rt=0.6)
        self.at(self.sub("all", 0.6))
        self.P(FadeIn(not2, shift=UP * 0.2), rt=0.4)
        all_grp = VGroup(a1, a2, plus, a_arr, one, one_t, not2)

        # ================= FIX: R3 833 or less =================
        safe = label("The safe number", 54, MUTED).move_to([0, 4.7, 0])
        famt = tiles_amount("R3 833", color=GREEN).move_to([0, 3.0, 0])
        fpm = label("a month or less", 52, TEXT).next_to(famt, DOWN, buff=0.4)
        chk = money_row("12 × R3 833", "R45 996", 0.0, GREEN)
        chk_tk = tick_icon(s=0.5).move_to([0, -1.5, 0])
        every = label("all accounts added together", 46, MUTED).move_to([0, -2.4, 0])
        self.at("fix")
        self.P(FadeOut(all_grp), FadeIn(safe), rt=0.3)
        flip_in(famt, rt=0.8)
        self.P(FadeIn(fpm), rt=0.3)
        self.at(self.sub("fix", 0.55))
        self.P(FadeIn(chk, shift=UP * 0.2), rt=0.4)
        self.P(Create(chk_tk), rt=0.3)
        self.at(self.sub("fix", 0.75))
        self.P(FadeIn(every), rt=0.35)
        fix_grp = VGroup(safe, famt, fpm, chk, chk_tk, every)

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
        self.P(FadeOut(fix_grp), rt=0.3)
        self.P(DrawBorderThenFill(card), FadeIn(c1), FadeIn(c2), FadeIn(c3), rt=0.7)
        self.at(self.sub("guide", 0.5))
        self.P(FadeIn(fpill, scale=0.8), FadeIn(fpill_t, scale=0.8), FadeIn(daily), FadeIn(disc), rt=0.5)
        self.P(Indicate(VGroup(fpill, fpill_t), color=GREEN, scale_factor=1.08), rt=0.7)
        guide_grp = VGroup(card, c1, c2, c3, fpill, fpill_t, daily, disc)

        # ================= LOOP: back to R3 834 =================
        one_r = bold("+R1 a month", 110, RED).move_to([0, 0.4, 0])
        amt2, pm2 = hook_board()
        self.at("loop")
        self.P(FadeOut(guide_grp), rt=0.3)
        self.P(FadeIn(one_r, scale=1.3), rt=0.4)
        self.at(self.sub("loop", 0.55))
        flip_in(amt2, rt=0.8)
        self.P(FadeIn(pm2), rt=0.3)
        self.at(END)
