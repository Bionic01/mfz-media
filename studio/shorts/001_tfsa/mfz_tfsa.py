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


class MFZ_TFSA(Scene):
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

        # ================= HOOK: the jar that grows tax-free =================
        jar = RoundedRectangle(corner_radius=0.45, width=3.2, height=3.8, color=TEXT, stroke_width=6,
                               fill_color=PANEL, fill_opacity=1).move_to([0, 0.6, 0])
        lid = RoundedRectangle(corner_radius=0.15, width=3.5, height=0.45, color=TEXT, stroke_width=0,
                               fill_color="#D8D2C4", fill_opacity=1).next_to(jar, UP, buff=0.05)
        coins = VGroup(*[coin().move_to(jar.get_bottom() + [(-0.85 + 0.85 * (i % 3)), 0.5 + 0.62 * (i // 3), 0])
                         for i in range(12)])
        arrow = Arrow([2.3, -0.9, 0], [3.4, 2.6, 0], color=GREEN, stroke_width=14, buff=0,
                      max_tip_length_to_length_ratio=0.22)
        tax_lbl = bold("TAX", 76, RED).move_to([-2.75, 1.9, 0])
        strike = Line(tax_lbl.get_corner(DL) + [-0.1, -0.05, 0], tax_lbl.get_corner(UR) + [0.1, 0.05, 0],
                      color=RED, stroke_width=10)
        r0 = bold("R0", 76, GREEN).next_to(tax_lbl, DOWN, buff=0.25)
        head = bold("GROWS 100% TAX-FREE", 80, GREEN).scale_to_fit_width(7.6).move_to([0, 4.7, 0])
        self.at("hook1")
        self.P(FadeIn(jar), FadeIn(lid), FadeIn(head, shift=DOWN * 0.2), rt=0.5)
        self.P(LaggedStart(*[FadeIn(c, shift=DOWN * 1.2) for c in coins], lag_ratio=0.12), rt=1.6)
        self.P(GrowArrow(arrow), rt=0.6)
        self.P(FadeIn(tax_lbl), rt=0.3)
        self.P(Create(strike), FadeIn(r0, scale=1.4), rt=0.5)
        hook = VGroup(jar, lid, coins, arrow, tax_lbl, strike, r0, head)

        qm = bold("?", 300, GOLD).move_to([2.6, 1.6, 0])
        self.at("hook2")
        self.P(VGroup(jar, lid, coins).animate.set_opacity(0.35), FadeOut(arrow), FadeIn(qm, scale=0.6), rt=0.6)

        # ================= NAME =================
        n1 = bold("TAX-FREE", 150).move_to([0, 2.8, 0])
        n2 = bold("SAVINGS ACCOUNT", 150).scale_to_fit_width(7.8).next_to(n1, DOWN, buff=0.15)
        pill = RoundedRectangle(corner_radius=0.5, width=3.4, height=1.05, stroke_width=0,
                                fill_color=GREEN, fill_opacity=1).next_to(n2, DOWN, buff=0.6)
        pill_t = bold("TFSA", 72, BG).move_to(pill)
        self.at("name")
        self.P(FadeOut(hook), FadeOut(qm), rt=0.35)
        self.P(FadeIn(n1, shift=UP * 0.3), FadeIn(n2, shift=UP * 0.3), rt=0.6)
        self.P(FadeIn(pill, scale=0.8), FadeIn(pill_t, scale=0.8), rt=0.4)
        name_grp = VGroup(n1, n2, pill, pill_t)

        # ================= R46 000 PER TAX YEAR =================
        v = ValueTracker(0)
        big = always_redraw(lambda: bold(rands(v.get_value()), 160, GREEN).move_to([0, 2.8, 0]))
        per = label("per tax year  (2026/27)", 46, MUTED).move_to([0, 1.3, 0])
        bar_w, bar_y = 7.4, -0.4
        bar_bg = RoundedRectangle(corner_radius=0.2, width=bar_w, height=0.9, color=GREY, stroke_width=3,
                                  fill_color=PANEL, fill_opacity=1).move_to([0, bar_y, 0])

        def fill_bar(frac, color=GREEN):
            w = max(bar_w * frac, 0.01)
            return RoundedRectangle(corner_radius=0.2, width=w, height=0.9, stroke_width=0,
                                    fill_color=color, fill_opacity=1).move_to([-bar_w / 2 + w / 2, bar_y, 0])

        full = fill_bar(1.0)
        self.at("year")
        self.P(FadeOut(name_grp, shift=UP * 0.3), rt=0.35)
        self.add(big)
        self.P(FadeIn(per), FadeIn(bar_bg), rt=0.3)
        self.at(self.sub("year", 0.45))
        self.P(v.animate.set_value(46000), GrowFromEdge(full, LEFT), rt=1.6, rate_func=rush_from)

        # ================= USE IT OR LOSE IT =================
        used = fill_bar(20000 / 46000)
        unused = RoundedRectangle(corner_radius=0.2, width=bar_w * (26000 / 46000), height=0.9, stroke_width=4,
                                  color=RED, fill_color=RED, fill_opacity=0.22
                                  ).move_to([bar_w / 2 - bar_w * (26000 / 46000) / 2, bar_y, 0])
        lost_l = label("Unused = lost", 42, RED).next_to(unused, DOWN, buff=0.35).align_to(unused, RIGHT)
        this_y = label("This year: used R20 000", 42, GREEN).next_to(bar_bg, UP, buff=0.3).align_to(bar_bg, LEFT)
        nxt_bar_y = -2.6
        nxt_bg = bar_bg.copy().move_to([0, nxt_bar_y, 0])
        nxt_full = RoundedRectangle(corner_radius=0.2, width=bar_w, height=0.9, stroke_width=0, fill_color=GREEN,
                                    fill_opacity=1).move_to([0, nxt_bar_y, 0])
        nxt_l = label("Next year: R46 000 again", 42, MUTED).next_to(nxt_bg, DOWN, buff=0.3)
        self.at("lose")
        self.P(FadeOut(per), ReplacementTransform(full, used), FadeIn(unused), FadeIn(this_y), rt=0.6)
        self.at(self.sub("lose", 0.38))
        self.P(FadeIn(lost_l), Indicate(unused, color=RED), rt=0.8)
        self.P(FadeIn(nxt_bg), GrowFromEdge(nxt_full, LEFT), FadeIn(nxt_l), rt=0.8)
        year_grp = VGroup(big, bar_bg, used, unused, lost_l, this_y, nxt_bg, nxt_full, nxt_l)

        # ================= R500 000 LIFETIME =================
        life_t = bold("R500 000", 190, GOLD).scale_to_fit_width(7.4).move_to([0, 3.0, 0])
        life_s = label("lifetime limit", 50, MUTED).next_to(life_t, DOWN, buff=0.2)
        lb_w, lb_y = 7.4, -0.3
        life_bg = RoundedRectangle(corner_radius=0.2, width=lb_w, height=1.2, color=GREY, stroke_width=3,
                                   fill_color=PANEL, fill_opacity=1).move_to([0, lb_y, 0])
        bw = lb_w * 46000 / 500000
        blocks = VGroup(*[Rectangle(width=bw if i < 10 else lb_w - 10 * bw, height=1.2, stroke_width=2,
                                    stroke_color=BG, fill_color=GOLD, fill_opacity=1)
                          for i in range(11)])
        blocks.arrange(RIGHT, buff=0).move_to([0, lb_y, 0])
        yrs = label("about 11 years of maxing it out", 40, MUTED).next_to(life_bg, DOWN, buff=0.4)
        self.at("life")
        self.P(FadeOut(year_grp), rt=0.35)
        self.P(FadeIn(life_t, scale=0.8), FadeIn(life_s), FadeIn(life_bg), rt=0.6)
        self.P(LaggedStart(*[FadeIn(b, shift=RIGHT * 0.2) for b in blocks], lag_ratio=0.18), rt=1.8)
        self.P(FadeIn(yrs), rt=0.4)
        life_grp = VGroup(life_t, life_s, life_bg, blocks, yrs)

        # ================= BEST PART: never taxed =================
        best = bold("THE BEST PART", 120, GREEN).scale_to_fit_width(7.2).move_to([0, 3.5, 0])
        rows = VGroup()
        for i, word in enumerate(["Interest", "Dividends", "Growth"]):
            y = 1.3 - i * 1.55
            b = box(7.4, 1.25, y)
            w = label(word, 46).move_to([-3.3, y, 0], aligned_edge=LEFT)
            tx = label("Tax: R0", 42, GREEN).move_to([2.6, y, 0], aligned_edge=RIGHT)
            tk = tick_icon().move_to([3.2, y, 0])
            rows.add(VGroup(b, w, tx, tk))
        self.at("best")
        self.P(FadeOut(life_grp), FadeIn(best, scale=1.2), rt=0.5)
        self.at("never")
        for i in range(3):
            self.P(FadeIn(rows[i][0]), FadeIn(rows[i][1], shift=RIGHT * 0.3), rt=0.35)
            self.P(FadeIn(rows[i][2]), Create(rows[i][3]), rt=0.35)
        never_grp = VGroup(best, rows)

        # ================= GROWTH CAN GO PAST R500 000 =================
        base_y = -3.0
        col_w = 2.6
        contrib = Rectangle(width=col_w, height=3.6, stroke_width=0, fill_color=GOLD, fill_opacity=1)
        contrib.move_to([-2.3, base_y + 1.8, 0])
        growth = Rectangle(width=col_w, height=4.4, stroke_width=0, fill_color=GREEN, fill_opacity=1)
        growth.move_to([-2.3, base_y + 3.6 + 2.2, 0])
        limit_y = base_y + 3.6
        limit = DashedLine([-3.9, limit_y, 0], [3.9, limit_y, 0], color=TEXT, stroke_width=5, dash_length=0.2)
        limit_l = label("R500 000 limit", 38, TEXT).move_to([-0.6, limit_y + 0.35, 0], aligned_edge=LEFT)
        c_l = label("What you put in", 38, GOLD).move_to([-0.6, base_y + 1.6, 0], aligned_edge=LEFT)
        g_l = label("Tax-free growth", 40, GREEN).move_to([-0.6, limit_y + 2.3, 0], aligned_edge=LEFT)
        g_l2 = label("no limit", 38, GREEN).next_to(g_l, DOWN, buff=0.15).align_to(g_l, LEFT)
        floor = Line([-3.9, base_y, 0], [3.9, base_y, 0], color=GREY, stroke_width=4)
        self.at("past")
        self.P(FadeOut(never_grp), rt=0.35)
        self.P(Create(floor), GrowFromEdge(contrib, DOWN), FadeIn(c_l), rt=0.8)
        self.P(Create(limit), FadeIn(limit_l), rt=0.5)
        self.at(self.sub("past", 0.42))
        self.P(GrowFromEdge(growth, DOWN), rt=1.6, rate_func=rush_into)
        self.P(FadeIn(g_l), FadeIn(g_l2), rt=0.5)
        self.P(Indicate(growth, color=GREEN, scale_factor=1.04), rt=0.7)
        past_grp = VGroup(contrib, growth, limit, limit_l, c_l, g_l, g_l2, floor)

        # ================= TWO TRAPS =================
        warn_tri = Triangle(color=GOLD, stroke_width=10, fill_color=GOLD, fill_opacity=0.15).scale(1.6).move_to([0, 2.0, 0])
        warn_ex = bold("!", 170, GOLD).move_to(warn_tri.get_center() + DOWN * 0.25)
        traps_t = bold("2 TRAPS", 130, GOLD).move_to([0, -0.5, 0])
        self.at("traps")
        self.P(FadeOut(past_grp), rt=0.35)
        self.P(DrawBorderThenFill(warn_tri), FadeIn(warn_ex), FadeIn(traps_t, shift=UP * 0.2), rt=0.7)
        traps_grp = VGroup(warn_tri, warn_ex, traps_t)

        # ================= TRAP 1: 40% penalty =================
        t1 = bold("TRAP 1:  OVER THE LIMIT", 80, GOLD).scale_to_fit_width(7.4).move_to([0, 4.3, 0])

        def money_row(lab, value, y, color=TEXT):
            b = box(7.4, 1.1, y, r=0.25)
            l = label(lab, 40, MUTED).move_to([-3.4, y, 0], aligned_edge=LEFT)
            vv = bold(value, 64, color).move_to([3.4, y, 0], aligned_edge=RIGHT)
            return VGroup(b, l, vv)

        r_in = money_row("You put in", "R50 000", 2.8)
        r_lim = money_row("Limit", "R46 000", 1.45)
        r_ex = money_row("Extra", "R4 000", 0.1, GOLD)
        r_pen = money_row("Penalty (40%)", "R1 600", -1.25, RED)
        r_pen[0].set_stroke(RED, 5)
        self.at("one")
        self.P(FadeOut(traps_grp), FadeIn(t1, shift=DOWN * 0.2), rt=0.4)
        self.P(FadeIn(r_in, shift=UP * 0.2), rt=0.4)
        self.P(FadeIn(r_lim, shift=UP * 0.2), rt=0.4)
        self.at(self.sub("one", 0.45))
        self.P(FadeIn(r_ex, shift=UP * 0.2), rt=0.4)
        self.at(self.sub("one", 0.62))
        self.P(FadeIn(r_pen, shift=UP * 0.2), rt=0.4)
        self.P(Indicate(r_pen, color=RED, scale_factor=1.05), rt=0.8)
        one_grp = VGroup(t1, r_in, r_lim, r_ex, r_pen)

        # ================= TRAP 2: withdrawals =================
        t2 = bold("TRAP 2:  TAKING MONEY OUT", 80, GOLD).scale_to_fit_width(7.4).move_to([0, 4.3, 0])
        jar2 = RoundedRectangle(corner_radius=0.4, width=2.6, height=3.0, color=TEXT, stroke_width=6,
                                fill_color=PANEL, fill_opacity=1).move_to([-2.1, 1.4, 0])
        lid2 = RoundedRectangle(corner_radius=0.12, width=2.9, height=0.38, stroke_width=0,
                                fill_color="#D8D2C4", fill_opacity=1).next_to(jar2, UP, buff=0.05)
        mcoins = VGroup(*[coin(0.28).move_to(jar2.get_bottom() + [(-0.65 + 0.65 * (i % 3)), 0.45 + 0.56 * (i // 3), 0])
                          for i in range(9)])
        take = VGroup(*[mcoins[i] for i in (6, 7, 8)])
        out_l = label("Take out\nR10 000", 42, TEXT).move_to([2.1, 2.3, 0])
        back_l = label("Put it back", 42, TEXT).move_to([2.1, 2.3, 0])
        lim2_bg = RoundedRectangle(corner_radius=0.2, width=7.4, height=0.8, color=GREY, stroke_width=3,
                                   fill_color=PANEL, fill_opacity=1).move_to([0, -2.3, 0])
        lim2_lbl = label("This year's R46 000 limit", 38, MUTED).next_to(lim2_bg, UP, buff=0.25)
        f1w = 7.4 * 20000 / 46000
        f1 = RoundedRectangle(corner_radius=0.2, width=f1w, height=0.8, stroke_width=0, fill_color=GREEN,
                              fill_opacity=1).move_to([-3.7 + f1w / 2, -2.3, 0])
        f2w = 7.4 * 10000 / 46000
        f2 = Rectangle(width=f2w, height=0.8, stroke_width=0, fill_color=RED, fill_opacity=0.85
                       ).move_to([-3.7 + f1w + f2w / 2, -2.3, 0])
        f2_l = label("counts again", 40, RED).next_to(f2, DOWN, buff=0.3)
        self.at("two")
        self.P(FadeOut(one_grp), FadeIn(t2, shift=DOWN * 0.2), rt=0.4)
        self.P(FadeIn(jar2), FadeIn(lid2), FadeIn(mcoins), FadeIn(lim2_bg), FadeIn(lim2_lbl), FadeIn(f1), rt=0.6)
        self.P(take.animate.shift(RIGHT * 4.0 + DOWN * 0.6), FadeIn(out_l), rt=0.8)
        self.at(self.sub("two", 0.46))
        self.P(FadeOut(out_l), FadeIn(back_l), rt=0.3)
        self.P(take.animate.shift(LEFT * 4.0 + UP * 0.6), rt=0.7)
        self.P(GrowFromEdge(f2, LEFT), FadeIn(f2_l), rt=0.6)
        self.P(Indicate(VGroup(f2, f2_l), color=RED, scale_factor=1.05), rt=0.7)
        two_grp = VGroup(t2, jar2, lid2, mcoins, back_l, lim2_bg, lim2_lbl, f1, f2, f2_l)

        # ================= CHECKLIST =================
        items = ["Long-term money", "Bank or investment app", "Start small", "Start early"]
        fracs = [0.0, 0.3, 0.68, 0.86]
        check_rows = VGroup()
        for i, txt in enumerate(items):
            y = 3.2 - i * 1.6
            b = box(7.4, 1.25, y)
            circ = Circle(radius=0.36, color=GREEN, stroke_width=5).move_to([-3.0, y, 0])
            tk = tick_icon(s=0.36).move_to(circ)
            lab = label(txt, 48).move_to([-2.35, y, 0], aligned_edge=LEFT)
            if lab.width > 5.4:
                lab.scale_to_fit_width(5.4).move_to([-2.35, y, 0], aligned_edge=LEFT)
            check_rows.add(VGroup(b, circ, tk, lab))
        self.at("open")
        self.P(FadeOut(two_grp), rt=0.35)
        for i in range(4):
            self.at(max(self.sub("open", fracs[i]), self.t))
            self.P(FadeIn(check_rows[i][0]), FadeIn(check_rows[i][1]), FadeIn(check_rows[i][3], shift=RIGHT * 0.3),
                   rt=0.35)
            self.P(Create(check_rows[i][2]), rt=0.3)

        # ================= END CARD: the split-flap board =================
        words = ["MONEY", "FROM", "ZER0"]
        tw, th, gap = 1.12, 1.56, 0.12
        board = VGroup()
        for r, word in enumerate(words):
            row = VGroup()
            for c, ch in enumerate(word):
                last = (r == 2 and c == 3)
                row.add(flip_tile(ch, tw, th, GOLD if last else TEXT, gold_edge=last))
            row.arrange(RIGHT, buff=gap)
            board.add(row)
        board.arrange(DOWN, buff=0.22).move_to([0, 2.4, 0])
        tiles = [t for row in board for t in row]
        fpill = RoundedRectangle(corner_radius=0.55, width=6.2, height=1.1, stroke_width=0, fill_color=GREEN,
                                 fill_opacity=1).move_to([0, -1.6, 0])
        fpill_t = bold("+ FOLLOW", 66, BG).move_to(fpill)
        disc = label("General information, not financial advice.", 28, MUTED).move_to([0, -2.75, 0])
        self.at("follow")
        self.P(FadeOut(check_rows), FadeOut(brand), rt=0.35)
        for t in tiles:
            t.save_state()
            t.stretch(0.02, 1)
        self.add(*tiles)
        self.P(LaggedStart(*[Restore(t) for t in tiles], lag_ratio=0.12), rt=1.6)
        self.P(FadeIn(fpill, scale=0.8), FadeIn(fpill_t, scale=0.8), FadeIn(disc), rt=0.5)
        self.P(Indicate(VGroup(fpill, fpill_t), color=GREEN, scale_factor=1.08), rt=0.7)
        self.at(END)
