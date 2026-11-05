"""Money From Zero — Main video 01: Tax-Free Savings Accounts, the complete beginner guide (2026)."""
import os, json, re
from manim import *
from manim.utils.exceptions import EndSceneEarlyException
from mfz_brand import *

PREVIEW = os.environ.get("PREVIEW") == "1"
config.pixel_width = 1920 if PREVIEW else 3840
config.pixel_height = 1080 if PREVIEW else 2160
config.frame_rate = 30
config.frame_width = 16
config.frame_height = 9
config.background_color = BG

HERE = os.path.dirname(os.path.abspath(__file__))
STOP = float(os.environ["STOP"]) if os.environ.get("STOP") else None
START = float(os.environ.get("START", "0"))
TL = json.load(open(os.path.join(HERE, "timeline.json")))
WORDS = json.load(open(os.path.join(HERE, "words_all.json")))
CH = {c["key"]: c for c in TL["chapters"]}
END = TL["duration"]


def norm(w):
    return re.sub(r"[^a-z0-9%]", "", w.lower())


# Amounts are voiced as "46,000 rand": match cues without the "rand" words and without an "r" prefix.
IDX = [i for i, w in enumerate(WORDS) if norm(w[0]) not in ("rand", "")]
NW = [norm(WORDS[i][0]) for i in IDX]


def _tok(t):
    t = norm(t)
    return t[1:] if re.fullmatch(r"r\d+", t) else t


def cue(phrase, chapter=None, after=0.0):
    toks = [x for x in (_tok(t) for t in phrase.split()) if x not in ("rand", "")]
    for j in range(len(IDX) - len(toks) + 1):
        w = WORDS[IDX[j]]
        if w[1] < after:
            continue
        if chapter and w[3] != chapter:
            continue
        if NW[j:j + len(toks)] == toks:
            return w[1]
    raise ValueError(f"cue not found: {phrase} ({chapter})")


# illustrative growth model (5% real, monthly), same as the script
def growth_series(start_age, real=0.05):
    r = (1 + real) ** (1 / 12) - 1
    bal = contrib = 0.0
    pts_b, pts_c = [(start_age, 0)], [(start_age, 0)]
    age = start_age
    while age < 65:
        for _ in range(12):
            c = 0.0
            if contrib < 500000 - 1e-6:
                c = min(46000 / 12, 500000 - contrib)
            bal = bal * (1 + r) + c
            contrib += c
        age += 1
        pts_b.append((age, bal))
        pts_c.append((age, contrib))
    return pts_b, pts_c


class MFZMain01(Scene):
    # ---------- timing helpers ----------
    def P(self, *anims, rt=1.0, **kw):
        self.play(*anims, run_time=rt, **kw)
        self.t += rt

    def W(self, dt):
        if dt > 1e-3:
            self.wait(dt)
            self.t += dt

    def at(self, target):
        if STOP is not None and target >= STOP:
            self.W(STOP - self.t)
            raise EndSceneEarlyException()
        self.W(target - self.t)

    def c(self, phrase, chapter=None, after=None):
        return cue(phrase, chapter, self.t - 0.05 if after is None else after)

    # ---------- layout helpers ----------
    def heading(self, text):
        tiles = flip_word(text, w=0.5, h=0.72, gap=0.06)
        if tiles.width > 15:
            tiles.scale_to_fit_width(15)
        tiles.move_to([0, 3.15, 0])
        return tiles

    def chapter_in(self, key, title):
        self.at(CH[key]["start"] - 0.35)
        old = [m for m in self.mobjects if m not in (self.bg, self.brand)]
        if old:
            self.P(*[FadeOut(m) for m in old], rt=0.35)
        h = self.heading(title)
        self.add(*h)
        self.P(flip_in(None, h, rt=0.9, lag=0.06), rt=0.9)
        self.hd = VGroup(*h)
        return h

    def clear(self, rt=0.35, keep=(), heading_too=False):
        hd = set() if heading_too or self.hd is None else set(self.hd.submobjects)
        is_hd = lambda m: m in hd or (len(m.submobjects) > 0 and set(m.submobjects) <= hd)
        old = [m for m in self.mobjects if m not in (self.bg, self.brand) and m not in keep and not is_hd(m)]
        if old:
            self.P(*[FadeOut(m) for m in old], rt=rt)

    def construct(self):
        self.t = 0.0
        self.hd = None
        self.bg = ImageMobject(os.path.join(HERE, "bg_board_16x9.png")).scale_to_fit_width(16)
        self.bg.set_z_index(-10)
        self.brand = brand_mark(30).to_corner(UL, buff=0.35)
        self.add(self.bg, self.brand)

        self.cold_open()
        self.ch1()
        self.ch2()
        self.ch3()
        self.ch4()
        self.ch5()
        self.ch6()
        self.ch7()
        self.ch8()
        self.ch8b()
        self.ch9()
        self.ch10()
        self.ch11()
        self.at(END)

    # =====================================================================
    def cold_open(self):
        K = "cold_open"
        # R3 833 a month
        amt = bold("R3 833", 200, GOLD).move_to([-3.2, 1.0, 0])
        per = label("a month", 56, MUTED).next_to(amt, DOWN, buff=0.15)
        coins = VGroup(*[coin(0.34).move_to([2.4 + 0.75 * (i % 4), -2.6 + 0.62 * (i // 4), 0]) for i in range(12)])
        self.at(cue("putting away", K))
        self.P(FadeIn(amt, scale=0.85), FadeIn(per), rt=0.6)
        self.P(LaggedStart(*[FadeIn(cc, shift=DOWN * 1.5) for cc in coins], lag_ratio=0.1), rt=1.4)
        grp1 = VGroup(amt, per, coins)

        # timeline 25 -> 36 -> 65
        ax_y = -2.6
        x_of = lambda age: -6.5 + (age - 25) * (13.0 / 40)
        line = Line([x_of(25), ax_y, 0], [x_of(65), ax_y, 0], color=GREY, stroke_width=5)
        ticks = VGroup()
        for a in (25, 36, 65):
            ticks.add(VGroup(Line([x_of(a), ax_y - 0.12, 0], [x_of(a), ax_y + 0.12, 0], color=GREY, stroke_width=5),
                             label(f"Age {a}", 30, MUTED).move_to([x_of(a), ax_y - 0.5, 0])))
        stack = Rectangle(width=x_of(36) - x_of(25), height=1.0, stroke_width=0, fill_color=GOLD,
                          fill_opacity=1).move_to([(x_of(25) + x_of(36)) / 2, ax_y + 0.5, 0])
        stop_l = label("you stop paying in", 32, GOLD).next_to(stack, UP, buff=0.2)
        pts_b, _ = growth_series(25)
        ymax = 2.8e6
        y_of = lambda v: ax_y + v / ymax * 5.6
        curve = VMobject(color=GREEN, stroke_width=9).set_points_smoothly(
            [[x_of(a), y_of(v), 0] for a, v in pts_b])
        self.at(cue("in about eleven years", K))
        self.P(FadeOut(grp1), rt=0.4)
        self.P(Create(line), FadeIn(ticks), rt=0.6)
        self.P(GrowFromEdge(stack, LEFT), FadeIn(stop_l), rt=1.2)
        self.at(cue("keeps growing", K))
        self.P(Create(curve), rt=3.0, rate_func=linear)
        sars = label("SARS takes:", 44, MUTED).move_to([3.0, 2.2, 0])
        zero = bold("R0", 150, GREEN).next_to(sars, RIGHT, buff=0.3)
        self.at(cue("and sars never", K))
        self.P(FadeIn(sars), FadeIn(zero, scale=1.5), rt=0.6)

        # title board
        self.at(cue("its called", K))
        self.clear(rt=0.4, heading_too=True)
        r1 = flip_word("TAX-FREE", w=0.95, h=1.35, gap=0.1)
        r2 = flip_word("SAVINGS ACCOUNT", w=0.8, h=1.15, gap=0.08)
        board = VGroup(r1, r2).arrange(DOWN, buff=0.25).move_to([0, 1.0, 0])
        sub = label("The complete beginner guide  ·  South Africa 2026", 40, MUTED).next_to(board, DOWN, buff=0.45)
        self.add(*r1, *r2)
        self.P(flip_in(None, list(r1) + list(r2), rt=1.6, lag=0.06), rt=1.6)
        self.P(FadeIn(sub, shift=UP * 0.2), rt=0.5)

        # what you'll learn
        chips = VGroup()
        for i, (txt, col) in enumerate([("How it works", GREEN), ("2 costly mistakes", RED), ("How to open one", GOLD)]):
            t = label(txt, 36, BG)
            pill = RoundedRectangle(corner_radius=0.35, width=t.width + 0.8, height=0.75, stroke_width=0,
                                    fill_color=col, fill_opacity=1)
            chips.add(VGroup(pill, t.move_to(pill)))
        chips.arrange(RIGHT, buff=0.4).move_to([0, -3.0, 0])
        self.at(cue("exactly how it works", K))
        self.P(FadeIn(chips[0], shift=UP * 0.2), rt=0.4)
        self.at(cue("the two mistakes", K))
        self.P(FadeIn(chips[1], shift=UP * 0.2), rt=0.4)
        self.at(cue("how to open one", K))
        self.P(FadeIn(chips[2], shift=UP * 0.2), rt=0.4)

    # =====================================================================
    def ch1(self):
        K = "ch1_what"
        self.chapter_in(K, "WHAT IS A TFSA?")
        wrap = RoundedRectangle(corner_radius=0.5, width=12.6, height=4.6, color=GREEN, stroke_width=8,
                                fill_color=PANEL, fill_opacity=1).move_to([0, -0.9, 0])
        tag = RoundedRectangle(corner_radius=0.25, width=2.4, height=0.8, stroke_width=0, fill_color=GREEN,
                               fill_opacity=1).move_to(wrap.get_top() + DOWN * 0.0)
        tag_t = bold("TFSA", 54, BG).move_to(tag)
        self.at(cue("think of it as a container", K))
        self.P(DrawBorderThenFill(wrap), FadeIn(tag), FadeIn(tag_t), rt=1.0)
        cards = VGroup()
        for name, sub in [("Savings account", "at your bank"), ("Unit trust", "a managed fund"), ("ETF", "follows the market")]:
            b = box(3.6, 2.2, stroke=STROKE)
            n = label(name, 38)
            if n.width > 3.3:
                n.scale_to_fit_width(3.3)
            n.move_to(b.get_center() + UP * 0.3)
            s = body(sub, 30, MUTED)
            if s.width > 3.3:
                s.scale_to_fit_width(3.3)
            s.next_to(n, DOWN, buff=0.2)
            cards.add(VGroup(b, n, s))
        cards.arrange(RIGHT, buff=0.4).move_to(wrap.get_center() + DOWN * 0.15)
        for i, ph in enumerate(["a simple savings account", "a unit trust", "an etf"]):
            self.at(cue(ph, K))
            self.P(FadeIn(cards[i], shift=DOWN * 0.4), rt=0.45)
        prot = label("Everything it earns inside is protected from tax", 40, GREEN).next_to(wrap, DOWN, buff=0.35)
        self.at(cue("protected from tax", K))
        self.P(wrap.animate.set_stroke(GREEN, 14), FadeIn(prot, shift=UP * 0.2), rt=0.6)
        self.P(wrap.animate.set_stroke(GREEN, 8), rt=0.4)
        since = VGroup()
        st = label("Since 1 March 2015", 34, TEXT)
        sb = RoundedRectangle(corner_radius=0.3, width=st.width + 0.6, height=0.7, color=GOLD, stroke_width=4,
                              fill_color=PANEL, fill_opacity=1)
        since.add(sb, st.move_to(sb))
        since.move_to([5.6, 1.8, 0])
        self.at(cue("tfsas started on", K))
        self.P(FadeIn(since, scale=0.8), rt=0.5)

    # =====================================================================
    def ch2(self):
        K = "ch2_tax"
        self.chapter_in(K, "THE TAX YOU SKIP")
        col_x = [-5.3, 0.6, 5.4]
        hdr_n = label("Normally", 40, MUTED).move_to([col_x[1], 1.9, 0])
        hdr_t = label("Inside a TFSA", 40, GREEN).move_to([col_x[2], 1.9, 0])
        rows = []
        data = [("Interest", "Income tax above\nR23 800 a year*"), ("Dividends", "20% dividends tax"),
                ("Capital gains", "CGT on gains above\nR50 000 a year")]
        for i, (name, normal) in enumerate(data):
            y = 0.85 - i * 1.55
            b = box(15.0, 1.35, 0, y)
            n = label(name, 44).move_to([col_x[0] - 1.9, y, 0], aligned_edge=LEFT)
            nm = body(normal, 32, TEXT).move_to([col_x[1], y, 0])
            r0 = bold("R0", 76, GREEN).move_to([col_x[2] - 0.5, y, 0])
            tk = tick_icon(s=0.4).next_to(r0, RIGHT, buff=0.35)
            rows.append((VGroup(b, n), nm, VGroup(r0, tk)))
        foot = body("*R23 800 if you're under 65", 26, MUTED).move_to([-4.9, -3.95, 0])
        self.at(cue("taxed in three ways", K))
        self.P(FadeIn(hdr_n), rt=0.3)
        for (rb, nm, _), ph in zip(rows, ["interest is taxed", "dividends from shares", "capital gains tax"]):
            self.at(cue(ph, K))
            self.P(FadeIn(rb), FadeIn(nm, shift=LEFT * 0.2), rt=0.45)
            if ph == "interest is taxed":
                self.P(FadeIn(foot), rt=0.2)
        self.at(cue("none of that applies", K))
        self.P(FadeIn(hdr_t), rt=0.3)
        for (_, _, r), ph in zip(rows, ["no income tax", "no dividends tax", "no capital gains tax"]):
            self.at(cue(ph, K))
            self.P(FadeIn(r, scale=1.3), rt=0.4)
        bonus_t = label("Bonus: TFSA interest doesn't use up your R23 800 interest exemption", 34, GOLD)
        bonus_b = RoundedRectangle(corner_radius=0.3, width=bonus_t.width + 0.8, height=0.85, color=GOLD,
                                   stroke_width=4, fill_color=PANEL, fill_opacity=1)
        bonus = VGroup(bonus_b, bonus_t.move_to(bonus_b)).move_to([0, -3.75, 0])
        self.at(cue("heres a bonus", K))
        self.P(FadeOut(foot), FadeIn(bonus, shift=UP * 0.2), rt=0.5)

        # worked example
        self.at(cue("lets make that real", K))
        self.clear(rt=0.35)
        lines = [
            ("R500 000 in a normal savings account at 8%", None, TEXT, "say you have"),
            ("Interest for the year", "R40 000", TEXT, "thats r40000"),
            ("Exempt (under 65)", "– R23 800", MUTED, "the first r23800"),
            ("Taxable interest", "R16 200", TEXT, "so r16200"),
            ("Tax at 26%", "≈ R4 200 a year", RED, "if you pay 26%"),
            ("Inside a TFSA", "R0", GREEN, "inside a tfsa that bill"),
        ]
        rows2 = []
        for i, (l, v, colr, ph) in enumerate(lines):
            y = 1.9 - i * 1.0
            if v is None:
                g = label(l, 44, GOLD).move_to([0, y, 0])
            else:
                b = box(11.0, 0.85, 0, y, r=0.2, stroke=RED if colr == RED else (GREEN if colr == GREEN else STROKE))
                lt = label(l, 36, MUTED if colr == MUTED else TEXT).move_to([-5.1, y, 0], aligned_edge=LEFT)
                vt = bold(v, 56, colr).move_to([5.1, y, 0], aligned_edge=RIGHT)
                g = VGroup(b, lt, vt)
            rows2.append((g, ph))
        for g, ph in rows2:
            self.at(cue(ph, K))
            self.P(FadeIn(g, shift=UP * 0.2), rt=0.45)
        self.at(cue("every single year", K))
        self.P(Indicate(rows2[4][0], color=RED, scale_factor=1.03), rt=0.8)
        self.at(cue("that bill is zero", K))
        self.P(Indicate(rows2[5][0], color=GREEN, scale_factor=1.05), rt=0.8)

    # =====================================================================
    def ch3(self):
        K = "ch3_limits"
        self.chapter_in(K, "THE TWO LIMITS")
        yl = label("YEARLY", 36, MUTED).move_to([-4.2, 2.0, 0])
        yv = bold("R46 000", 150, GREEN).next_to(yl, DOWN, buff=0.15)
        ym = body("per tax year  ·  ≈ R3 833 a month", 34, TEXT).next_to(yv, DOWN, buff=0.15)
        ll = label("LIFETIME", 36, MUTED).move_to([4.2, 2.0, 0])
        lv = bold("R500 000", 150, GOLD).next_to(ll, DOWN, buff=0.15)
        lm = body("for your whole life", 34, TEXT).next_to(lv, DOWN, buff=0.15)
        self.at(cue("the yearly limit", K))
        self.P(FadeIn(yl), FadeIn(yv, scale=0.85), rt=0.5)
        self.at(cue("thats about r3833", K))
        self.P(FadeIn(ym), rt=0.4)
        # limit history bars
        hist = [("2015", 30000), ("2017", 33000), ("2020", 36000), ("2026", 46000)]
        bars = VGroup()
        base_y = -3.6
        for i, (yr, v) in enumerate(hist):
            x = -6.6 + i * 1.55
            h = v / 46000 * 2.3
            bar = Rectangle(width=1.1, height=h, stroke_width=0, fill_color=GREEN if yr == "2026" else GREY,
                            fill_opacity=1).move_to([x, base_y + h / 2, 0])
            vt = label(f"R{v // 1000}k", 28, TEXT).next_to(bar, UP, buff=0.1)
            yt = label(yr, 26, MUTED).next_to(bar, DOWN, buff=0.12)
            bars.add(VGroup(bar, vt, yt))
        self.at(cue("when tfsas started", K))
        self.P(FadeOut(ym), rt=0.2)
        for i, ph in enumerate(["the limit was r30000", "up to r33000", "then r36000", "and now r46000"]):
            self.at(cue(ph, K))
            self.P(GrowFromEdge(bars[i][0], DOWN), FadeIn(bars[i][1]), FadeIn(bars[i][2]), rt=0.45)
        self.at(cue("and the lifetime limit", K))
        self.P(FadeIn(ll), FadeIn(lv, scale=0.85), FadeIn(lm), rt=0.6)
        # use it or lose it
        self.at(cue("one thing catches people out", K))
        self.P(FadeOut(bars), rt=0.3)
        bw, by = 12.0, -1.6
        bbg = RoundedRectangle(corner_radius=0.2, width=bw, height=0.9, color=GREY, stroke_width=3,
                               fill_color=PANEL, fill_opacity=1).move_to([0, by, 0])
        uw = bw * 20000 / 46000
        used = RoundedRectangle(corner_radius=0.2, width=uw, height=0.9, stroke_width=0, fill_color=GREEN,
                                fill_opacity=1).move_to([-bw / 2 + uw / 2, by, 0])
        lost = RoundedRectangle(corner_radius=0.2, width=bw - uw, height=0.9, color=RED, stroke_width=4,
                                fill_color=RED, fill_opacity=0.22).move_to([bw / 2 - (bw - uw) / 2, by, 0])
        ul = label("Used: R20 000", 34, GREEN).next_to(used, UP, buff=0.2).align_to(used, LEFT)
        lol = label("Unused R26 000: gone forever", 34, RED).next_to(lost, UP, buff=0.2).align_to(lost, RIGHT)
        self.P(VGroup(yl, yv, ll, lv, lm).animate.shift(UP * 0.25).scale(0.8), rt=0.4)
        self.P(FadeIn(bbg), rt=0.3)
        self.at(cue("if you only put in", K))
        self.P(GrowFromEdge(used, LEFT), FadeIn(ul), rt=0.6)
        self.at(cue("the other r26000", K))
        self.P(FadeIn(lost), FadeIn(lol), rt=0.5)
        nxt = label("Next tax year: back to R46 000", 34, MUTED).move_to([0, -2.6, 0])
        self.at(cue("next year you start", K))
        self.P(FadeIn(nxt), rt=0.4)
        # eleven years
        self.at(cue("at the full amount", K))
        blocks = VGroup(*[Rectangle(width=(bw * 46000 / 500000) if i < 10 else bw - 10 * bw * 46000 / 500000,
                                    height=0.9, stroke_width=2, stroke_color=BG, fill_color=GOLD, fill_opacity=1)
                          for i in range(11)]).arrange(RIGHT, buff=0).move_to([0, -3.55, 0])
        el = label("≈ 11 years at the full amount to reach R500 000", 32, GOLD).next_to(blocks, UP, buff=0.2)
        self.P(FadeOut(nxt), FadeIn(el), LaggedStart(*[FadeIn(b, shift=RIGHT * 0.2) for b in blocks], lag_ratio=0.15),
               rt=2.0)

    # =====================================================================
    def ch4(self):
        K = "ch4_growth"
        self.chapter_in(K, "THE BEST PART")
        c1 = label("Counts towards the limits: what you put in", 40, GOLD).move_to([0, 1.3, 0])
        c2 = label("Doesn't count: what it grows into", 40, GREEN).move_to([0, 0.2, 0])
        self.at(cue("only count what you put in", K))
        self.P(FadeIn(c1, shift=UP * 0.2), rt=0.4)
        self.at(cue("not what it grows into", K))
        self.P(FadeIn(c2, shift=UP * 0.2), rt=0.4)

        # chart
        self.at(cue("lets look at an example", K))
        self.P(FadeOut(c1), FadeOut(c2), rt=0.3)
        ox, oy, W, H = -6.2, -3.4, 11.6, 5.4
        x_of = lambda a: ox + (a - 25) / 40 * W
        y_of = lambda v: oy + v / 3.0e6 * H
        axes = VGroup(Line([ox, oy, 0], [ox + W, oy, 0], color=GREY, stroke_width=4),
                      Line([ox, oy, 0], [ox, oy + H, 0], color=GREY, stroke_width=4))
        xt = VGroup(*[label(str(a), 26, MUTED).move_to([x_of(a), oy - 0.35, 0]) for a in (25, 35, 45, 55, 65)])
        yt = VGroup(*[label(f"R{v / 1e6:g}m", 26, MUTED).move_to([ox - 0.6, y_of(v), 0]) for v in (1e6, 2e6, 3e6)])
        grid = VGroup(*[DashedLine([ox, y_of(v), 0], [ox + W, y_of(v), 0], color=STROKE, stroke_width=2,
                                   dash_length=0.15) for v in (1e6, 2e6, 3e6)])
        xl = label("Age", 28, MUTED).move_to([ox + W + 0.5, oy, 0])
        note = body("Illustration only: 5% a year above inflation, after fees, in today's money", 26, MUTED
                    ).move_to([0, -4.15, 0])
        self.P(Create(axes), FadeIn(xt), FadeIn(yt), FadeIn(grid), FadeIn(xl), rt=0.8)
        self.at(cue("these numbers are only an illustration", K))
        self.P(FadeIn(note), rt=0.4)

        b25, c25 = growth_series(25)
        b35, c35 = growth_series(35)
        to_pts = lambda pts, upto=65: [[x_of(a), y_of(v), 0] for a, v in pts if a <= upto]
        contrib = VMobject(color=GOLD, stroke_width=8).set_points_as_corners(to_pts(c25, 36))
        contrib_flat = Line(to_pts(c25)[11], to_pts(c25)[-1], color=GOLD, stroke_width=8)
        bal_a = VMobject(color=GREEN, stroke_width=9).set_points_smoothly(to_pts(b25, 36))
        bal_b = VMobject(color=GREEN, stroke_width=9).set_points_smoothly(to_pts(b25)[11:])
        self.at(cue("say you start at 25", K))
        dot25 = Dot([x_of(25), y_of(0), 0], color=GREEN, radius=0.12)
        self.P(FadeIn(dot25, scale=2), rt=0.3)
        self.at(cue("you put in r3833", K))
        self.P(Create(contrib), Create(bal_a), rt=2.2, rate_func=linear)
        m36_l = label("R500 000 paid in by age 36", 28, GOLD).move_to([ox + 0.35, y_of(1.2e6), 0], aligned_edge=LEFT)
        m36 = VGroup(Dot([x_of(36), y_of(500000), 0], color=GOLD, radius=0.1), m36_l,
                     Line(m36_l.get_bottom() + DOWN * 0.05, [x_of(36) - 0.1, y_of(500000) + 0.1, 0], color=GOLD,
                          stroke_width=3))
        self.P(FadeIn(m36), rt=0.3)
        self.at(cue("then you stop paying in", K))
        self.P(Create(contrib_flat), rt=1.0)
        self.at(cue("if it grows at 5%", K))
        self.P(Create(bal_b), rt=4.0, rate_func=rate_functions.ease_in_sine)
        end_v = b25[-1][1]
        e_lab = VGroup(Dot([x_of(65), y_of(end_v), 0], color=GREEN, radius=0.13),
                       bold("≈ R2.7 million", 72, GREEN).move_to([x_of(65) - 2.2, y_of(end_v) + 0.45, 0]))
        self.at(cue("you'd have about r27 million", K) if False else cue("about r27 million", K))
        self.P(FadeIn(e_lab, shift=UP * 0.2), rt=0.5)
        self.at(cue("only r500000 of that", K))
        brace_g = label("82% of it is growth, all tax-free", 34, GREEN).move_to([ox + 0.4, y_of(2.0e6), 0], aligned_edge=LEFT)
        self.P(Indicate(contrib_flat, color=GOLD), rt=0.7)
        self.at(cue("about 82% is growth", K))
        self.P(FadeIn(brace_g, shift=UP * 0.2), rt=0.5)
        # start at 35
        bal35 = VMobject(color=BLUE, stroke_width=8).set_points_smoothly(to_pts(b35))
        l35 = VGroup(Dot([x_of(65), y_of(b35[-1][1]), 0], color=BLUE, radius=0.12),
                     bold("Start at 35: ≈ R1.7 million", 52, BLUE).move_to([ox + 0.4, y_of(2.45e6), 0], aligned_edge=LEFT))
        self.at(cue("start ten years later", K))
        self.P(FadeOut(brace_g), Create(bal35), rt=2.5, rate_func=linear)
        self.P(FadeIn(l35), rt=0.4)
        gap = Line([x_of(65), y_of(b35[-1][1]), 0], [x_of(65), y_of(end_v), 0], color=GOLD, stroke_width=10)
        self.at(cue("thats why starting early", K))
        self.P(Create(gap), rt=0.6)
        self.P(Indicate(gap, color=GOLD), rt=0.8)

    # =====================================================================
    def ch5(self):
        K = "ch5_trap1"
        self.chapter_in(K, "TRAP 1: OVER THE LIMIT")
        acc_a = VGroup(box(4.6, 2.0, -4.6, 0.6), label("Bank TFSA", 36).move_to([-4.6, 1.05, 0]),
                       bold("R30 000", 70, TEXT).move_to([-4.6, 0.25, 0]))
        acc_b = VGroup(box(4.6, 2.0, 0.6, 0.6), label("Platform TFSA", 36).move_to([0.6, 1.05, 0]),
                       bold("R20 000", 70, TEXT).move_to([0.6, 0.25, 0]))
        plus = bold("+", 90, MUTED).move_to([-2.0, 0.6, 0])
        eq = bold("=", 90, MUTED).move_to([3.2, 0.6, 0])
        tot = VGroup(box(3.4, 2.0, 5.6, 0.6, stroke=RED, sw=5), label("Your total", 34, MUTED).move_to([5.6, 1.05, 0]),
                     bold("R50 000", 70, RED).move_to([5.6, 0.25, 0]))
        self.at(cue("for you as a person", K))
        self.P(FadeIn(acc_a, shift=UP * 0.2), rt=0.4)
        self.at(cue("more than one tfsa", K))
        self.P(FadeIn(plus), FadeIn(acc_b, shift=UP * 0.2), rt=0.4)
        self.at(cue("counts together", K))
        self.P(FadeIn(eq), FadeIn(tot, shift=UP * 0.2), rt=0.5)
        lim = label("Your limit is R46 000 across ALL your TFSAs", 38, GOLD).move_to([0, -1.2, 0])
        self.P(FadeIn(lim), rt=0.4)
        sees = label("Each provider only sees its own account. Keeping track is your job.", 34, MUTED
                     ).move_to([0, -2.2, 0])
        self.at(cue("your bank can only see", K))
        self.P(FadeIn(sees), rt=0.4)

        # SARS example table
        self.at(cue("if you go over", K))
        self.P(*[FadeOut(m) for m in (acc_a, acc_b, plus, eq, tot, lim, sees)], rt=0.35)

        def row(lab, val, y, colr=TEXT, stroke=STROKE):
            return VGroup(box(9.0, 0.95, -2.2, y, r=0.2, stroke=stroke, sw=3 if stroke == STROKE else 5),
                          label(lab, 36, MUTED).move_to([-6.3, y, 0], aligned_edge=LEFT),
                          bold(val, 60, colr).move_to([1.9, y, 0], aligned_edge=RIGHT))
        r1 = row("You put in", "R50 000", 1.7)
        r2 = row("Limit", "R46 000", 0.6)
        r3 = row("Over by", "R4 000", -0.5, GOLD)
        r4 = row("Penalty (40%)", "R1 600", -1.6, RED, RED)
        src = body("Example from SARS", 28, MUTED).move_to([-2.2, -2.45, 0])
        big = bold("40%", 220, RED).move_to([5.3, 0.1, 0])
        bigl = label("penalty on the extra", 34, RED).next_to(big, DOWN, buff=0.1)
        self.P(FadeIn(big, scale=0.8), FadeIn(bigl), rt=0.5)
        self.at(cue("heres sarss own example", K) if False else cue("own example", K))
        self.P(FadeIn(r1, shift=UP * 0.2), FadeIn(src), rt=0.4)
        self.at(cue("the limit is r46000", K))
        self.P(FadeIn(r2, shift=UP * 0.2), rt=0.4)
        self.at(cue("youre r4000 over", K))
        self.P(FadeIn(r3, shift=UP * 0.2), rt=0.4)
        self.at(cue("forty percent of", K))
        self.P(FadeIn(r4, shift=UP * 0.2), rt=0.4)
        self.P(Indicate(r4, color=RED, scale_factor=1.04), rt=0.7)

        # debit order trap
        self.at(cue("even a tiny mistake", K))
        self.P(*[FadeOut(m) for m in (r1, r2, r3, r4, src, big, bigl)], rt=0.35)
        d1 = VGroup(box(12.0, 1.3, 0, 0.9, stroke=RED, sw=5),
                    bold("R3 834 × 12 = R46 008", 80, TEXT).move_to([-1.0, 0.9, 0]),
                    label("R8 over", 40, RED).move_to([4.6, 0.9, 0]))
        d2 = VGroup(box(12.0, 1.3, 0, -0.9, stroke=GREEN, sw=5),
                    bold("R3 833 × 12 = R45 996", 80, TEXT).move_to([-1.0, -0.9, 0]),
                    tick_icon(s=0.45).move_to([4.6, -0.9, 0]))
        self.at(cue("a debit order of", K))
        self.P(FadeIn(d1, shift=UP * 0.2), rt=0.5)
        self.at(cue("thats r8 over", K))
        self.P(Indicate(d1[2], color=RED, scale_factor=1.2), FadeIn(d2, shift=UP * 0.2), rt=0.8)

    # =====================================================================
    def ch6(self):
        K = "ch6_trap2"
        self.chapter_in(K, "TRAP 2: TAKING MONEY OUT")
        jar = RoundedRectangle(corner_radius=0.4, width=2.8, height=3.0, color=TEXT, stroke_width=6,
                               fill_color=PANEL, fill_opacity=1).move_to([-5.0, 0.0, 0])
        lid = RoundedRectangle(corner_radius=0.12, width=3.1, height=0.38, stroke_width=0, fill_color="#D8D2C4",
                               fill_opacity=1).next_to(jar, UP, buff=0.05)
        coins = VGroup(*[coin(0.3).move_to(jar.get_bottom() + [(-0.72 + 0.72 * (i % 3)), 0.5 + 0.6 * (i // 3), 0])
                         for i in range(12)])
        take = VGroup(*[coins[i] for i in (9, 10, 11)])
        bw, by = 9.0, -2.9
        bbg = RoundedRectangle(corner_radius=0.2, width=bw, height=0.8, color=GREY, stroke_width=3,
                               fill_color=PANEL, fill_opacity=1).move_to([2.0, by, 0])
        bl = label("This year's R46 000 limit", 32, MUTED).next_to(bbg, UP, buff=0.2)
        f1w = bw * 20000 / 46000
        f1 = RoundedRectangle(corner_radius=0.2, width=f1w, height=0.8, stroke_width=0, fill_color=GREEN,
                              fill_opacity=1).move_to([2.0 - bw / 2 + f1w / 2, by, 0])
        f2w = bw * 10000 / 46000
        f2 = Rectangle(width=f2w, height=0.8, stroke_width=0, fill_color=RED, fill_opacity=0.85
                       ).move_to([2.0 - bw / 2 + f1w + f2w / 2, by, 0])
        f2l = label("counts again", 32, RED).next_to(f2, RIGHT, buff=0.25)
        outl = label("Take out R10 000", 40).move_to([2.2, 1.2, 0])
        backl = label("Put it back later", 40).move_to([2.2, 1.2, 0])
        self.at(cue("you can withdraw", K))
        self.P(FadeIn(jar), FadeIn(lid), FadeIn(coins), FadeIn(bbg), FadeIn(bl), FadeIn(f1), rt=0.6)
        self.at(cue("if you take out", K))
        self.P(take.animate.shift(RIGHT * 6.5 + DOWN * 0.3), FadeIn(outl), rt=0.9)
        self.at(cue("and later put it back", K))
        self.P(FadeOut(outl), FadeIn(backl), take.animate.shift(LEFT * 6.5 + UP * 0.3), rt=0.9)
        self.at(cue("treats that as a new", K))
        self.P(GrowFromEdge(f2, LEFT), FadeIn(f2l), rt=0.6)
        self.P(Indicate(VGroup(f2, f2l), color=RED), rt=0.7)
        # not an emergency fund
        self.at(cue("not your emergency fund", K))
        self.clear()
        e = VGroup(box(6.6, 3.2, -3.9, -0.6), label("Emergency money", 44, GOLD).move_to([-3.9, 0.35, 0]),
                   body("Normal savings account", 34).move_to([-3.9, -0.55, 0]),
                   body("Easy to reach, any time", 30, MUTED).move_to([-3.9, -1.35, 0]))
        tf = VGroup(box(6.6, 3.2, 3.9, -0.6, stroke=GREEN, sw=5), label("TFSA", 44, GREEN).move_to([3.9, 0.35, 0]),
                    body("Long-term money", 34).move_to([3.9, -0.55, 0]),
                    body("Leave it to grow", 30, MUTED).move_to([3.9, -1.35, 0]))
        self.P(FadeIn(e, shift=UP * 0.2), rt=0.4)
        self.at(cue("and let your tfsa", K))
        self.P(FadeIn(tf, shift=UP * 0.2), rt=0.4)

    # =====================================================================
    def ch7(self):
        K = "ch7_transfer"
        self.chapter_in(K, "SWITCHING PROVIDERS")
        a = VGroup(box(3.8, 1.6, -5.4, 0.9), label("Old provider", 38).move_to([-5.4, 0.9, 0]))
        b = VGroup(box(3.8, 1.6, 5.4, 0.9, stroke=GREEN, sw=5), label("New provider", 38).move_to([5.4, 0.9, 0]))
        arr = Arrow([-3.3, 0.9, 0], [3.3, 0.9, 0], color=GREEN, stroke_width=10, buff=0)
        at = bold("TRANSFER", 60, GREEN).next_to(arr, UP, buff=0.15)
        ok = VGroup(tick_icon(s=0.35), label("Not a new contribution", 34, GREEN)).arrange(RIGHT, buff=0.3
                                                                                         ).next_to(arr, DOWN, buff=0.35)
        days = label("Must be done within 10 business days", 30, MUTED).next_to(ok, DOWN, buff=0.2)
        self.at(cue("you can transfer", K))
        self.P(FadeIn(a), FadeIn(b), rt=0.4)
        self.P(GrowArrow(arr), FadeIn(at), rt=0.6)
        self.at(cue("a proper transfer", K))
        self.P(FadeIn(ok), rt=0.4)
        self.at(cue("ten business days", K))
        self.P(FadeIn(days), rt=0.4)
        # wrong way
        you = VGroup(Circle(radius=0.55, color=TEXT, stroke_width=5).move_to([0, -2.4, 0]),
                     label("You", 32).move_to([0, -2.4, 0]))
        w1 = Arrow([-4.6, 0.0, 0], [-0.7, -2.2, 0], color=RED, stroke_width=8, buff=0.1)
        w2 = Arrow([0.7, -2.2, 0], [4.6, 0.0, 0], color=RED, stroke_width=8, buff=0.1)
        bad = VGroup(cross_icon(s=0.25), label("Withdraw + redeposit = counts as a new contribution", 32, RED)
                     ).arrange(RIGHT, buff=0.3).move_to([0, -3.65, 0])
        self.at(cue("what you must never do", K))
        self.P(FadeOut(days), FadeIn(you), GrowArrow(w1), GrowArrow(w2), rt=0.8)
        self.at(cue("brand new contribution", K))
        self.P(FadeIn(bad, shift=UP * 0.2), rt=0.4)

    # =====================================================================
    def ch8(self):
        K = "ch8_inside"
        self.chapter_in(K, "WHAT GOES INSIDE")
        cash = VGroup(box(7.2, 5.2, -3.9, -0.6), label("CASH", 52, GOLD).move_to([-3.9, 1.5, 0]),
                      body("Bank savings or fixed deposit", 32).move_to([-3.9, 0.85, 0]))
        cash_pts = [[-6.8 + i * 0.6, -0.9 + i * 0.06, 0] for i in range(10)]
        cash_line = VMobject(color=GOLD, stroke_width=7).set_points_as_corners(cash_pts)
        cash_line.stretch_to_fit_width(5.6).move_to([-3.9, -0.55, 0])
        cash_b = VGroup(body("✓ Simple and safe", 30, TEXT), body("– Growth usually slow", 30, MUTED),
                        body("– Fixed terms: up to 5 years", 30, MUTED)).arrange(DOWN, aligned_edge=LEFT, buff=0.18
                                                                                    ).move_to([-3.9, -2.4, 0])
        inv = VGroup(box(7.2, 5.2, 3.9, -0.6, stroke=GREEN, sw=5), label("INVESTMENTS", 52, GREEN).move_to([3.9, 1.5, 0]),
                     body("Unit trusts and ETFs", 32).move_to([3.9, 0.85, 0]))
        import random
        random.seed(7)
        v = -1.2
        inv_pts = []
        for i in range(30):
            v += 0.06 + random.uniform(-0.22, 0.22)
            inv_pts.append([1.0 + i * 0.2, v, 0])
        inv_line = VMobject(color=GREEN, stroke_width=7).set_points_as_corners(inv_pts)
        inv_line.stretch_to_fit_height(1.3).stretch_to_fit_width(5.6).move_to([3.9, -0.55, 0])
        inv_b = VGroup(body("– Goes up and down", 30, MUTED), body("✓ More room to grow", 30, TEXT),
                       body("✓ Best for 10+ years", 30, TEXT)).arrange(DOWN, aligned_edge=LEFT, buff=0.18
                                                                         ).move_to([3.9, -2.4, 0])
        self.at(cue("a cash option", K))
        self.P(FadeIn(cash), rt=0.4)
        self.P(Create(cash_line), FadeIn(cash_b), rt=0.8)
        self.at(cue("or an investment option", K))
        self.P(FadeIn(inv), rt=0.4)
        # ETF spreads money
        etf_c = coin(0.45).move_to([3.9, -0.5, 0]).set_z_index(5)
        tiles = VGroup(*[RoundedRectangle(corner_radius=0.06, width=0.36, height=0.36, stroke_width=0,
                                          fill_color=GREEN, fill_opacity=0.9) for _ in range(24)]
                       ).arrange_in_grid(3, 8, buff=0.08).move_to([3.9, -0.5, 0]).set_z_index(5)
        etf_l = label("one ETF = many companies", 30, GREEN).next_to(tiles, DOWN, buff=0.25).set_z_index(5)
        self.at(cue("can follow a whole", K))
        self.P(FadeIn(etf_c, scale=0.5), rt=0.3)
        self.at(cue("across many companies", K))
        self.P(ReplacementTransform(etf_c, tiles), FadeIn(etf_l), rt=0.8)
        self.at(cue("the value goes up and down", K))
        self.P(FadeOut(tiles), FadeOut(etf_l), rt=0.3)
        self.P(Create(inv_line), FadeIn(inv_b), rt=1.2)
        # no individual shares
        self.at(cue("one thing you cant do", K))
        nos = VGroup(cross_icon(s=0.28), label("No individual company shares: invest through funds", 34, RED)
                     ).arrange(RIGHT, buff=0.3)
        nb = RoundedRectangle(corner_radius=0.3, width=nos.width + 0.8, height=0.85, color=RED, stroke_width=4,
                              fill_color=PANEL, fill_opacity=1)
        nogrp = VGroup(nb, nos.move_to(nb)).move_to([0, -3.85, 0]).set_z_index(5)
        self.P(FadeIn(nogrp, scale=0.9), rt=0.4)
        # protections
        self.at(cue("the rules also protect you", K))
        self.clear()
        items = [("No performance fees", "providers cant charge"), ("Fees must be reasonable", "fees must be reasonable"),
                 ("Withdrawals paid within 7 business days", "withdrawals must be paid"),
                 ("Fees still differ: always compare", "fees still differ")]
        rows = VGroup()
        for i, (txt, ph) in enumerate(items):
            y = 1.5 - i * 1.25
            b = box(12.0, 1.0, 0, y)
            ic = tick_icon(s=0.35) if i < 3 else bold("!", 60, GOLD)
            ic.move_to([-5.3, y, 0])
            t = label(txt, 40, TEXT if i < 3 else GOLD).move_to([-4.6, y, 0], aligned_edge=LEFT)
            g = VGroup(b, ic, t)
            rows.add(g)
            self.at(cue(ph, K))
            self.P(FadeIn(g, shift=RIGHT * 0.3), rt=0.4)

    # =====================================================================
    def ch8b(self):
        K = "ch8b_ra"
        self.chapter_in(K, "TFSA VS RA")
        hdr = VGroup(label("Retirement annuity", 40, GOLD).move_to([1.4, 1.9, 0]),
                     label("TFSA", 40, GREEN).move_to([5.9, 1.9, 0]))
        data = [("Tax break when you pay in", "Yes, a deduction", True, "No deduction", False, "a tax deduction now"),
                ("When you take it out", "Taxed", False, "Tax-free", True, "youre taxed when"),
                ("Getting to your money", "Mostly locked", False, "Any time", True, "most of your money")]
        rows = []
        for i, (rl, ra, rag, tf, tfg, ph) in enumerate(data):
            y = 0.8 - i * 1.4
            b = box(15.0, 1.2, 0, y)
            l = label(rl, 36, MUTED).move_to([-7.2, y, 0], aligned_edge=LEFT)
            a = body(ra, 34, GREEN if rag else RED)
            if a.width > 4.4:
                a.scale_to_fit_width(4.4)
            a.move_to([1.4, y, 0])
            t = body(tf, 34, GREEN if tfg else RED).move_to([5.9, y, 0])
            rows.append((VGroup(b, l, a), t, ph))
        self.at(cue("they work in opposite ways", K))
        self.P(FadeIn(hdr), rt=0.4)
        for g, t, ph in rows:
            self.at(cue(ph, K))
            self.P(FadeIn(g, shift=UP * 0.15), rt=0.4)
        for i, ph in enumerate(["a tfsa gives you no deduction", "everything comes out tax-free", "reach your money"]):
            self.at(cue(ph, K))
            self.P(FadeIn(rows[i][1], scale=1.2), rt=0.35)
        both = label("Many people use both: the RA for retirement, the TFSA for long-term goals", 34, TEXT
                     ).move_to([0, -3.6, 0])
        if both.width > 14.4:
            both.scale_to_fit_width(14.4)
        self.at(cue("theyre not rivals", K))
        self.P(FadeIn(both, shift=UP * 0.2), rt=0.5)

    # =====================================================================
    def ch9(self):
        K = "ch9_kids"
        self.chapter_in(K, "A TFSA FOR YOUR KIDS")
        def person(x, s, col):
            head = Circle(radius=0.38 * s, color=col, stroke_width=6, fill_color=PANEL, fill_opacity=1)
            bodyp = RoundedRectangle(corner_radius=0.35 * s, width=1.2 * s, height=1.1 * s, color=col, stroke_width=6,
                                     fill_color=PANEL, fill_opacity=1)
            g = VGroup(bodyp, head.next_to(bodyp, UP, buff=0.08))
            return g.move_to([x, 0.9, 0])
        p = person(-4.0, 1.0, TEXT)
        k = person(3.6, 0.75, GOLD)
        pl = label("Your own R500 000", 34, MUTED).next_to(p, DOWN, buff=0.3)
        kl = label("The child's own R500 000", 34, GOLD).next_to(k, DOWN, buff=0.3)
        self.at(cue("open a tfsa for your children", K))
        self.P(FadeIn(p), FadeIn(pl), FadeIn(k), rt=0.5)
        self.at(cue("uses the childs own limits", K))
        self.P(FadeIn(kl, shift=UP * 0.2), rt=0.4)
        head = label("A huge head start", 44, GREEN).move_to([3.6, -1.6, 0])
        self.at(cue("huge head start", K))
        self.P(FadeIn(head, scale=0.9), rt=0.4)
        wd = label("Withdrawals must go into an account in the child's name", 34, MUTED).move_to([0, -3.3, 0])
        self.at(cue("when money is withdrawn", K))
        self.P(FadeIn(wd, shift=UP * 0.2), rt=0.4)

    # =====================================================================
    def ch10(self):
        K = "ch10_open"
        self.chapter_in(K, "HOW TO OPEN ONE")
        steps = [("1", "Pick a provider", "your bank or an investment platform", "step one"),
                 ("2", "Get your ID ready", "and possibly proof of address (FICA)", "step two"),
                 ("3", "Pick what's inside", "cash or investments, and check the fees", "step three"),
                 ("4", "Set a debit order", "e.g. R3 833 a month, under the limit", "step four")]
        cards = VGroup()
        for i, (n, t, s, ph) in enumerate(steps):
            x = -5.85 + i * 3.9
            b = box(3.6, 3.4, x, 0.1)
            nt = flip_tile(n, 0.7, 1.0, GOLD).move_to([x, 1.2, 0])
            tt = label(t, 32).move_to([x, 0.15, 0])
            if tt.width > 3.3:
                tt.scale_to_fit_width(3.3)
            st = body(s, 24, MUTED)
            if st.width > 3.3:
                st = Paragraph(*self._wrap(s, 22), font="Barlow", font_size=24, color=MUTED, alignment="center")
            st.move_to([x, -0.75, 0])
            cards.add(VGroup(b, nt, tt, st))
        for i, (_, _, _, ph) in enumerate(steps):
            self.at(cue(ph, K))
            self.P(FadeIn(cards[i], shift=UP * 0.25), rt=0.45)
        dl = VGroup(RoundedRectangle(corner_radius=0.3, width=12.0, height=1.0, color=GOLD, stroke_width=4,
                                     fill_color=PANEL, fill_opacity=1),
                    label("Tax year ends: last day of February. Some providers cut off a few days earlier.", 32, GOLD)
                    ).move_to([0, -2.6, 0])
        dl[1].move_to(dl[0])
        if dl[1].width > 11.4:
            dl[1].scale_to_fit_width(11.4)
        self.at(cue("watch the deadline", K))
        self.P(FadeIn(dl, shift=UP * 0.2), rt=0.5)

    def _wrap(self, s, n):
        words, lines, cur = s.split(), [], ""
        for w in words:
            if len(cur) + len(w) + 1 > n and cur:
                lines.append(cur); cur = w
            else:
                cur = (cur + " " + w).strip()
        lines.append(cur)
        return lines

    # =====================================================================
    def ch11(self):
        K = "ch11_recap"
        self.chapter_in(K, "RECAP")
        items = [("A TFSA is a wrapper that protects your money from tax", "a tfsa is a wrapper"),
                 ("R46 000 a year, R500 000 for life", "you can put in r46000"),
                 ("Growth doesn't count towards the limits", "growth doesnt count"),
                 ("Don't go over the limit", "dont go over the limit"),
                 ("Not an emergency fund", "dont treat it like"),
                 ("Switching? Transfer, don't withdraw", "if you switch providers")]
        rows = VGroup()
        for i, (txt, ph) in enumerate(items):
            y = 2.0 - i * 0.95
            g = VGroup(tick_icon(s=0.3).move_to([-6.2, y, 0]),
                       label(txt, 36).move_to([-5.6, y, 0], aligned_edge=LEFT))
            rows.add(g)
            self.at(cue(ph, K))
            self.P(FadeIn(g, shift=RIGHT * 0.3), rt=0.35)
        # end board
        self.at(cue("start small", K))
        self.clear(rt=0.4, heading_too=True)
        self.P(FadeOut(self.brand), rt=0.2)
        r1 = flip_word("MONEY", 1.0, 1.4, 0.1)
        r2 = flip_word("FROM", 1.0, 1.4, 0.1)
        r3 = flip_word("ZER0", 1.0, 1.4, 0.1, gold_last_zero=True)
        board = VGroup(r1, r2, r3).arrange(DOWN, buff=0.18).move_to([-3.3, 0.3, 0])
        tiles = list(r1) + list(r2) + list(r3)
        self.add(*tiles)
        self.P(flip_in(None, tiles, rt=1.6, lag=0.08), rt=1.6)
        sub = RoundedRectangle(corner_radius=0.55, width=5.4, height=1.1, stroke_width=0, fill_color=GREEN,
                               fill_opacity=1).move_to([4.2, 0.9, 0])
        sub_t = bold("SUBSCRIBE", 64, BG).move_to(sub)
        tag = label("One more piece of money,\nmade simple, every week", 36, TEXT).move_to([4.2, -0.6, 0])
        disc = body("General information, not financial advice.", 26, MUTED).move_to([4.2, -2.0, 0])
        self.at(cue("if this helped", K))
        self.P(FadeIn(sub, scale=0.8), FadeIn(sub_t, scale=0.8), FadeIn(tag), rt=0.6)
        self.at(cue("this video is general information", K))
        self.P(FadeIn(disc), rt=0.4)
