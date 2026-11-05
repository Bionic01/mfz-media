"""Money From Zero — Main video 02: the two-pot retirement system (South Africa, 2026)."""
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
TL = json.load(open(os.path.join(HERE, "timeline.json")))
WORDS = json.load(open(os.path.join(HERE, "words_all.json")))
CH = {c["key"]: c for c in TL["chapters"]}
END = TL["duration"]


def norm(w):
    return re.sub(r"[^a-z0-9%]", "", w.lower())


NW = [norm(w[0]) for w in WORDS]


def cue(phrase, chapter=None, after=0.0):
    toks = [norm(t) for t in phrase.split()]
    for i in range(len(WORDS) - len(toks) + 1):
        if WORDS[i][1] < after:
            continue
        if chapter and WORDS[i][3] != chapter:
            continue
        if NW[i:i + len(toks)] == toks:
            return WORDS[i][1]
    raise ValueError(f"cue not found: {phrase} ({chapter})")


def fit(m, w):
    if m.width > w:
        m.scale_to_fit_width(w)
    return m


def pill(txt, col, size=36, fg=BG):
    t = label(txt, size, fg)
    p = RoundedRectangle(corner_radius=0.35, width=t.width + 0.8, height=0.75, stroke_width=0,
                         fill_color=col, fill_opacity=1)
    return VGroup(p, t.move_to(p))


def outline_pill(txt, col, size=34, h=0.85):
    t = label(txt, size, col)
    p = RoundedRectangle(corner_radius=0.3, width=t.width + 0.8, height=h, color=col, stroke_width=4,
                         fill_color=PANEL, fill_opacity=1)
    return VGroup(p, t.move_to(p))


def lock_icon(s=1.0, col=GOLD):
    bodyr = RoundedRectangle(corner_radius=0.12 * s, width=1.0 * s, height=0.8 * s, stroke_width=0,
                             fill_color=col, fill_opacity=1)
    shackle = Arc(radius=0.3 * s, start_angle=0, angle=PI, color=col, stroke_width=14 * s)
    legs = VGroup(Line([-0.3 * s, 0, 0], [-0.3 * s, -0.12 * s, 0], color=col, stroke_width=14 * s),
                  Line([0.3 * s, 0, 0], [0.3 * s, -0.12 * s, 0], color=col, stroke_width=14 * s))
    top = VGroup(shackle, legs).next_to(bodyr, UP, buff=-0.1 * s)
    hole = VGroup(Circle(radius=0.09 * s, stroke_width=0, fill_color=BG, fill_opacity=1),
                  Rectangle(width=0.07 * s, height=0.2 * s, stroke_width=0, fill_color=BG, fill_opacity=1
                            ).shift(DOWN * 0.1 * s)).move_to(bodyr).shift(DOWN * 0.03 * s)
    return VGroup(top, bodyr, hole)


def door_icon(s=1.0, col=GREEN):
    frame = RoundedRectangle(corner_radius=0.06 * s, width=0.62 * s, height=1.0 * s, color=col,
                             stroke_width=8 * s, fill_color=PANEL, fill_opacity=1)
    knob = Dot(radius=0.06 * s, color=col).move_to(frame.get_center() + RIGHT * 0.17 * s)
    return VGroup(frame, knob)


class MFZMain02(Scene):
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

    def _wrap(self, s, n):
        words, lines, cur = s.split(), [], ""
        for w in words:
            if len(cur) + len(w) + 1 > n and cur:
                lines.append(cur)
                cur = w
            else:
                cur = (cur + " " + w).strip()
        lines.append(cur)
        return lines

    def para(self, s, n, size, col=MUTED, align="center"):
        # disable_ligatures: with ligatures ("fi", "ffi") Paragraph assigns glyphs to the wrong line
        return Paragraph(*self._wrap(s, n), font="Barlow", weight=MEDIUM, font_size=size, color=col,
                         alignment=align, line_spacing=0.85, disable_ligatures=True)

    def construct(self):
        self.t = 0.0
        self.hd = None
        self.bg = ImageMobject(os.path.join(HERE, "bg_board_16x9.png")).scale_to_fit_width(16)
        self.bg.set_z_index(-10)
        self.brand = brand_mark(30).to_corner(UL, buff=0.35)
        self.add(self.bg, self.brand)
        for step in (self.cold_open, self.ch1, self.ch2, self.ch3, self.ch4, self.ch5, self.ch6, self.ch7,
                     self.ch8, self.ch9, self.ch10, self.ch11):
            step()
        self.at(END)

    # =====================================================================
    def cold_open(self):
        K = "cold_open"
        when = outline_pill("Sep 2024  –  Feb 2026", MUTED, 34).move_to([0, 2.6, 0])
        big = bold("R79 BILLION", 210, GOLD).move_to([0, 0.9, 0])
        bl = label("taken out of retirement savings", 44, TEXT).next_to(big, DOWN, buff=0.2)
        tax = VGroup(bold("R21 BILLION", 120, RED), label("in tax", 44, RED)).arrange(RIGHT, buff=0.35,
                                                                                    aligned_edge=DOWN)
        tax.move_to([0, -2.4, 0])
        self.at(cue("from september 2024", K))
        self.P(FadeIn(when, shift=DOWN * 0.2), rt=0.5)
        self.at(cue("sars approved about", K))
        self.P(FadeIn(big, scale=0.8), rt=0.6)
        self.P(FadeIn(bl, shift=UP * 0.2), rt=0.4)
        self.at(cue("and the tax on", K))
        self.P(FadeIn(tax, shift=UP * 0.3), rt=0.6)

        # title board
        self.at(cue("thats the twopot", K))
        self.clear(rt=0.4, heading_too=True)
        r1 = flip_word("TWO-POT", w=1.05, h=1.5, gap=0.1)
        r2 = flip_word("RETIREMENT SYSTEM", w=0.74, h=1.06, gap=0.07)
        board = VGroup(r1, r2).arrange(DOWN, buff=0.25).move_to([0, 1.05, 0])
        sub = label("What you really get when you withdraw  ·  South Africa 2026", 40, MUTED
                    ).next_to(board, DOWN, buff=0.45)
        self.add(*r1, *r2)
        self.P(flip_in(None, list(r1) + list(r2), rt=1.6, lag=0.05), rt=1.6)
        self.P(FadeIn(sub, shift=UP * 0.2), rt=0.5)
        chips = VGroup(pill("The 3 pots", GREEN), pill("The real cost", RED), pill("4 traps", GOLD),
                       pill("How to withdraw", BLUE)).arrange(RIGHT, buff=0.35).move_to([0, -3.0, 0])
        for chip, ph in zip(chips, ["how the three pots", "really costs you", "the traps to avoid",
                                    "how to withdraw the"]):
            self.at(cue(ph, K))
            self.P(FadeIn(chip, shift=UP * 0.2), rt=0.4)

    # =====================================================================
    def ch1(self):
        K = "ch1_why"
        self.chapter_in(K, "WHY THE RULES CHANGED")
        lp = box(7.3, 5.4, -3.9, -0.55, stroke=RED, sw=5)
        lh = label("BEFORE SEPTEMBER 2024", 38, RED).move_to([-3.9, 1.7, 0])
        l1 = body("Only one way to get money early:", 32, TEXT).move_to([-3.9, 0.9, 0])
        l1b = bold("RESIGN", 64, RED).next_to(l1, DOWN, buff=0.15)
        bar_bg = RoundedRectangle(corner_radius=0.15, width=5.8, height=0.6, color=GREY, stroke_width=3,
                                  fill_color=PANEL, fill_opacity=1).move_to([-3.9, -1.0, 0])
        bar = RoundedRectangle(corner_radius=0.15, width=5.8, height=0.6, stroke_width=0, fill_color=GOLD,
                               fill_opacity=1).move_to(bar_bg)
        bar_l = label("Your whole fund", 30, MUTED).next_to(bar_bg, UP, buff=0.15)
        l3 = label("Cashed out at every job change", 32, GOLD).move_to([-3.9, -1.9, 0])
        l4 = label("Retire with almost nothing", 36, RED).move_to([-3.9, -2.65, 0])
        self.at(cue("before september 2024", K))
        self.P(FadeIn(lp), FadeIn(lh), rt=0.5)
        self.at(cue("they had to resign", K))
        self.P(FadeIn(l1), FadeIn(l1b, scale=1.2), rt=0.5)
        self.P(FadeIn(bar_bg), FadeIn(bar), FadeIn(bar_l), rt=0.4)
        self.at(cue("cash out your whole fund", K))
        self.P(bar.animate.stretch_to_fit_width(0.05, about_edge=LEFT), rt=1.2)
        self.at(cue("they changed jobs", K))
        self.P(FadeIn(l3, shift=UP * 0.15), rt=0.4)
        self.at(cue("reached retirement with", K))
        self.P(FadeIn(l4, shift=UP * 0.15), rt=0.4)

        rp = box(7.3, 5.4, 3.9, -0.55, stroke=GREEN, sw=5)
        rh = label("FROM 1 SEPTEMBER 2024", 38, GREEN).move_to([3.9, 1.7, 0])
        d = door_icon(1.1).move_to([1.3, 0.25, 0])
        dt = label("A little access\nfor emergencies", 36, GREEN).next_to(d, RIGHT, buff=0.45)
        lk = lock_icon(0.95).move_to([1.3, -1.75, 0])
        lt = label("The rest locked\nuntil you retire", 36, GOLD).next_to(lk, RIGHT, buff=0.45)
        self.at(cue("so the government changed", K))
        self.P(FadeIn(rp), FadeIn(rh), rt=0.5)
        self.at(cue("a little access", K))
        self.P(FadeIn(d, scale=0.8), FadeIn(dt, shift=LEFT * 0.2), rt=0.5)
        self.at(cue("lock the rest away", K))
        self.P(FadeIn(lk, scale=0.8), FadeIn(lt, shift=LEFT * 0.2), rt=0.5)

    # =====================================================================
    def ch2(self):
        K = "ch2_pots"
        self.chapter_in(K, "THE THREE POTS")
        t2 = flip_tile("2", 1.6, 2.2, TEXT).move_to([0, -0.3, 0])
        t3 = flip_tile("3", 1.6, 2.2, GOLD, gold_edge=True).move_to([0, -0.3, 0])
        self.at(cue("its called twopot", K))
        self.P(FadeIn(t2, scale=0.9), rt=0.4)
        self.at(cue("actually three", K))
        t3.save_state()
        t3.stretch(0.02, 1)
        self.P(FadeOut(t2), rt=0.15)
        self.P(Restore(t3), rt=0.35)
        self.W(0.4)
        self.P(FadeOut(t3), rt=0.3)

        xs = [-5.1, 0, 5.1]
        cols = [BLUE, GREEN, GOLD]
        names = ["VESTED", "SAVINGS", "RETIREMENT"]
        fracs = ["Before\nSep 2024", "1/3", "2/3"]
        lines = [["Saved up to 31 Aug 2024", "No new money, still grows", "Old rules apply"],
                 ["of contributions from", "1 Sep 2024", "You can access it early"],
                 ["of contributions from", "1 Sep 2024", "Locked until you retire"]]
        pots = []
        for x, c, n, f, ls in zip(xs, cols, names, fracs, lines):
            b = box(4.7, 4.0, x, -0.35, stroke=c, sw=6)
            nm = bold(n, 60, c).move_to([x, 1.15, 0])
            fr = (label(f, 40, TEXT) if "\n" in f else bold(f, 110, c)).move_to([x, 0.05, 0])
            txt = VGroup(*[body(s, 28, MUTED if i < 2 else TEXT) for i, s in enumerate(ls)]
                         ).arrange(DOWN, buff=0.12).move_to([x, -1.35, 0])
            for m in txt:
                fit(m, 4.3)
            pots.append((VGroup(b, nm), fr, txt))
        for (bx, fr, txt), ph, ph2 in zip(pots, ["the vested pot", "the savings pot", "the retirement pot"],
                                          ["this is everything", "one third of your", "the other two thirds"]):
            self.at(cue(ph, K))
            self.P(FadeIn(bx, shift=UP * 0.2), rt=0.45)
            self.at(cue(ph2, K))
            self.P(FadeIn(fr, scale=0.8), FadeIn(txt), rt=0.45)
        # door + safe
        dg = VGroup(door_icon(0.55), label("Emergency door", 32, GREEN)).arrange(RIGHT, buff=0.25
                                                                                 ).move_to([0, -2.95, 0])
        sg = VGroup(lock_icon(0.5), label("Locked safe", 32, GOLD)).arrange(RIGHT, buff=0.25).move_to([5.1, -2.95, 0])
        self.at(cue("is a small emergency door", K))
        self.P(FadeIn(dg, shift=UP * 0.2), Indicate(pots[1][0][0], color=GREEN, scale_factor=1.02), rt=0.6)
        self.at(cue("is a locked safe", K))
        self.P(FadeIn(sg, shift=UP * 0.2), Indicate(pots[2][0][0], color=GOLD, scale_factor=1.02), rt=0.6)
        # seed money
        seed = coin(0.4).move_to([-5.1, 0.05, 0]).set_z_index(5)
        seed_l = outline_pill("Seed money: once-off 10% of your vested pot, max R30 000", GOLD, 32
                              ).move_to([0, -3.85, 0]).set_z_index(5)
        self.at(cue("seed money", K))
        self.P(FadeOut(pots[0][1]), FadeIn(seed, scale=0.5), rt=0.35)
        self.P(seed.animate.move_to([0, 0.05, 0]), path_arc=-PI / 3, rt=1.0)
        self.P(FadeOut(seed, scale=0.5), Indicate(pots[1][1], color=GOLD), FadeIn(pots[0][1]), rt=0.5)
        self.at(cue("a onceoff 10%", K))
        self.P(FadeIn(seed_l, shift=UP * 0.2), rt=0.4)

    # =====================================================================
    def ch3(self):
        K = "ch3_rules"
        self.chapter_in(K, "SAVINGS POT RULES")
        lh = label("THE RULES", 36, MUTED).move_to([-4.0, 2.2, 0])
        rh = label("WHAT PEOPLE MISS", 36, RED).move_to([4.0, 2.2, 0])

        def rule(title, sub, x, y, col=TEXT, stroke=STROKE):
            b = box(7.4, 1.3, x, y, stroke=stroke, sw=3 if stroke == STROKE else 5)
            t = fit(label(title, 40, col), 6.5).move_to([x - 3.3, y + (0.2 if sub else 0), 0], aligned_edge=LEFT)
            g = VGroup(b, t)
            if sub:
                g.add(body(sub, 28, MUTED).move_to([x - 3.3, y - 0.3, 0], aligned_edge=LEFT))
            return g

        r1 = rule("Once per tax year", "1 March to the end of February", -4.0, 1.2)
        r2 = rule("Minimum withdrawal: R2 000", None, -4.0, -0.3)
        m1 = rule("Taxed at your normal rate", "It's added to your income", 4.0, 1.2, RED, RED)
        m2 = rule("Admin fee, often about R300", None, 4.0, -0.3, RED, RED)
        m3 = rule("SARS debt comes off first", "Before you see a cent", 4.0, -1.8, RED, RED)
        self.at(cue("what are the rules", K))
        self.P(FadeIn(lh), rt=0.3)
        self.at(cue("once per tax year", K))
        self.P(FadeIn(r1[:2], shift=RIGHT * 0.2), rt=0.4)
        self.at(cue("the tax year runs", K))
        self.P(FadeIn(r1[2]), rt=0.3)
        self.at(cue("the smallest amount", K))
        self.P(FadeIn(r2, shift=RIGHT * 0.2), rt=0.4)
        self.at(cue("heres what many people", K))
        self.P(FadeIn(rh), rt=0.3)
        self.at(cue("not taxfree", K))
        self.P(FadeIn(m1, shift=LEFT * 0.2), rt=0.4)
        self.at(cue("an admin fee", K))
        self.P(FadeIn(m2, shift=LEFT * 0.2), rt=0.4)
        self.at(cue("if you owe sars", K))
        self.P(FadeIn(m3, shift=LEFT * 0.2), rt=0.4)
        ok = VGroup(tick_icon(s=0.35), label("You don't have to withdraw. Left alone, it keeps growing.", 34, GREEN)
                    ).arrange(RIGHT, buff=0.3)
        okb = RoundedRectangle(corner_radius=0.3, width=ok.width + 0.9, height=0.95, color=GREEN, stroke_width=4,
                               fill_color=PANEL, fill_opacity=1)
        okg = VGroup(okb, ok.move_to(okb)).move_to([0, -3.4, 0])
        self.at(cue("you dont have to withdraw", K))
        self.P(FadeIn(okg, shift=UP * 0.2), rt=0.5)

    # =====================================================================
    def ch4(self):
        K = "ch4_example"
        self.chapter_in(K, "A REAL EXAMPLE")
        who = label("Earns R25 000 a month (R300 000 a year), under 65", 38, GOLD).move_to([0, 2.15, 0])

        def row(l, v, y, colr=TEXT, stroke=STROKE):
            return VGroup(box(11.0, 0.9, 0, y, r=0.2, stroke=stroke, sw=3 if stroke == STROKE else 5),
                          label(l, 38, MUTED if colr == TEXT else colr).move_to([-5.1, y, 0], aligned_edge=LEFT),
                          bold(v, 62, colr).move_to([5.1, y, 0], aligned_edge=RIGHT))
        rows = [(row("You withdraw", "R20 000", 1.1), "and you withdraw"),
                (row("Tax at 26%", "– R5 200", 0.05, RED), "so sars takes about"),
                (row("Admin fee", "– R345", -1.0, RED), "take off a fee"),
                (row("In your hand", "≈ R14 450", -2.05, GREEN, GREEN), "youre left with around")]
        self.at(cue("say you earn", K))
        self.P(FadeIn(who, shift=DOWN * 0.15), rt=0.4)
        for g, ph in rows:
            self.at(cue(ph, K))
            self.P(FadeIn(g, shift=UP * 0.2), rt=0.45)
        gone = label("About 28% gone before you spend a cent", 36, RED).move_to([0, -3.25, 0])
        self.at(cue("so you didnt really", K))
        self.P(Indicate(rows[0][0][2], color=RED, scale_factor=1.1), rt=0.6)
        self.at(cue("you got about", K))
        self.P(Indicate(rows[3][0], color=GREEN, scale_factor=1.04), FadeIn(gone, shift=UP * 0.2), rt=0.7)

        # hidden cost: growth bars
        self.at(cue("and theres a hidden cost", K))
        self.clear(rt=0.35)
        top = label("If that R20 000 had stayed invested", 40, TEXT).move_to([0, 2.15, 0])
        vals = [("Today", 20000), ("10 years", 32578), ("20 years", 53066), ("30 years", 86439)]
        base_y = -2.9
        bars = []
        for i, (lab_, v) in enumerate(vals):
            x = -4.5 + i * 3.0
            h = v / 86439 * 3.4
            col = GREY if i == 0 else GOLD
            bar = RoundedRectangle(corner_radius=0.12, width=1.8, height=h, stroke_width=0, fill_color=col,
                                   fill_opacity=1).move_to([x, base_y + h / 2, 0])
            vt = bold(rands(v) if i == 0 else "≈ " + rands(round(v, -3)), 50, TEXT if i == 0 else GOLD
                      ).next_to(bar, UP, buff=0.15)
            if i == 3:
                vt = bold("≈ R86 000", 58, GOLD).next_to(bar, UP, buff=0.15)
            lt = label(lab_, 30, MUTED).next_to(bar, DOWN, buff=0.15)
            bars.append(VGroup(bar, vt, lt))
        foot = body("Illustration only: 5% a year above inflation, in today's money", 26, MUTED
                    ).move_to([0, -3.95, 0])
        self.P(FadeIn(top), rt=0.4)
        self.P(GrowFromEdge(bars[0][0], DOWN), FadeIn(bars[0][1]), FadeIn(bars[0][2]), rt=0.5)
        self.at(cue("growing at 5%", K))
        self.P(FadeIn(foot), rt=0.3)
        for i in (1, 2):
            self.P(GrowFromEdge(bars[i][0], DOWN), FadeIn(bars[i][1]), FadeIn(bars[i][2]), rt=0.7)
        self.at(cue("in 30 years", K))
        self.P(GrowFromEdge(bars[3][0], DOWN), FadeIn(bars[3][2]), rt=0.8)
        self.at(cue("could be worth about", K))
        self.P(FadeIn(bars[3][1], scale=1.3), rt=0.5)
        cost = outline_pill("The real cost of that withdrawal", RED, 34).move_to([-3.4, 0.9, 0])
        self.at(cue("thats what the withdrawal", K))
        self.P(FadeIn(cost, shift=RIGHT * 0.2), Indicate(bars[3], color=RED, scale_factor=1.03), rt=0.8)

    # =====================================================================
    def ch5(self):
        K = "ch5_retire"
        self.chapter_in(K, "THE RETIREMENT POT")
        lk = lock_icon(2.3).move_to([-5.0, 0.5, 0])
        lkl = Paragraph("Locked until", "you retire", font="Barlow", weight=SEMIBOLD, font_size=40, color=GOLD,
                        alignment="center", line_spacing=0.8).next_to(lk, DOWN, buff=0.4)
        self.at(cue("this one is strict", K))
        self.P(FadeIn(lk, scale=0.8), FadeIn(lkl), rt=0.5)

        def item(icon, txt, y, col=TEXT):
            g = VGroup(icon.move_to([-1.4, y, 0]), fit(label(txt, 40, col), 8.0).move_to([-0.8, y, 0], aligned_edge=LEFT))
            return VGroup(box(9.4, 1.0, 2.8, y, r=0.2), g)
        i1 = item(cross_icon(s=0.22), "Not if you resign", 1.5, TEXT)
        i2 = item(cross_icon(s=0.22), "Not if you're retrenched", 0.35, TEXT)
        i3 = item(Arrow(LEFT * 0.3, RIGHT * 0.3, color=MUTED, stroke_width=8, buff=0), "Stays in the fund, or moves to another", -0.8, MUTED)
        i4 = item(tick_icon(s=0.32), "At retirement: buys a monthly income", -1.95, GOLD)
        ann = body("called an annuity", 30, MUTED).move_to([2.8, -2.75, 0])
        for g, ph in [(i1, "not if you resign"), (i2, "not if youre retrenched"), (i3, "it stays in the"),
                      (i4, "when you retire it")]:
            self.at(cue(ph, K))
            self.P(FadeIn(g, shift=LEFT * 0.2), rt=0.4)
        self.at(cue("called an annuity", K))
        self.P(FadeIn(ann), rt=0.3)

        self.at(cue("there are a few exceptions", K))
        self.clear(rt=0.35)
        ex = [("Death", "It goes to your beneficiaries", "if you pass away", TEXT),
              ("Emigration", "After 3 years in a row as a non-resident for tax", "if you emigrate", TEXT),
              ("Small savings", "Maybe all in cash at retirement. Ask your fund.", "if your savings are small", GOLD)]
        lt = label("EXCEPTIONS", 36, MUTED).move_to([0, 1.9, 0])
        self.P(FadeIn(lt), rt=0.3)
        for i, (t, s, ph, c) in enumerate(ex):
            x = -5.1 + i * 5.1
            b = box(4.7, 3.4, x, -0.6)
            tt = fit(bold(t, 60, c), 4.2).move_to([x, 0.35, 0])
            ss = self.para(s, 25, 30, TEXT).move_to([x, -1.0, 0])
            fit(ss, 4.2)
            self.at(cue(ph, K))
            self.P(FadeIn(VGroup(b, tt, ss), shift=UP * 0.25), rt=0.45)

    # =====================================================================
    def ch6(self):
        K = "ch6_vested"
        self.chapter_in(K, "THE VESTED POT")
        sub = label("Money saved before 1 September 2024: the old rules still apply", 36, BLUE).move_to([0, 2.15, 0])
        data = [("Pension or provident fund", "Usually cash out when you resign (taxed)", "if youre in a pension", TEXT),
                ("Tax-free on withdrawal", "First R27 500 in your lifetime", "but the first", GREEN),
                ("Tax-free at retirement", "Up to R550 000 of your cash lump sum", "when you retire up to", GREEN),
                ("Retirement annuity", "Usually locked until age 55", "if you have a retirement annuity", GOLD)]
        self.at(cue("the old rules still apply", K))
        self.P(FadeIn(sub, shift=DOWN * 0.15), rt=0.4)
        for i, (l, v, ph, c) in enumerate(data):
            y = 1.0 - i * 1.35
            b = box(15.0, 1.15, 0, y)
            lt = label(l, 36, MUTED).move_to([-7.1, y, 0], aligned_edge=LEFT)
            vt = fit(label(v, 40, c), 8.0).move_to([7.1, y, 0], aligned_edge=RIGHT)
            self.at(cue(ph, K))
            self.P(FadeIn(VGroup(b, lt), shift=UP * 0.15), FadeIn(vt, shift=LEFT * 0.2), rt=0.45)

    # =====================================================================
    def ch7(self):
        K = "ch7_traps"
        self.chapter_in(K, "THE 4 TRAPS")
        pos = [(-3.95, 0.95), (3.95, 0.95), (-3.95, -2.15), (3.95, -2.15)]
        cards = []
        specs = [("Tax surprise", "Final tax is set when you file. You may still owe SARS more.", RED),
                 ("Flat fee", "R320 is small on R20 000. On R2 000 it eats", RED),
                 ("The habit", "of Momentum claims since 1 March 2026 were third withdrawals", GOLD),
                 ("Scams", "Official channels only. Never share your OTP or password.", RED)]
        for i, ((x, y), (t, s, c)) in enumerate(zip(pos, specs)):
            b = box(7.6, 2.85, x, y, stroke=STROKE)
            n = flip_tile(str(i + 1), 0.72, 1.0, GOLD).move_to([x - 3.0, y + 0.65, 0])
            tt = label(t, 44, TEXT).move_to([x - 2.45, y + 0.65, 0], aligned_edge=LEFT)
            cards.append([b, n, tt, x, y, c])
        # card bodies with their own visuals
        x, y = cards[0][3], cards[0][4]
        b0 = self.para(specs[0][1], 36, 28, TEXT, "left").move_to([x - 3.35, y - 0.55, 0], aligned_edge=LEFT)
        v0 = bold("+ R?", 80, RED).move_to([x + 2.55, y + 0.55, 0])
        x, y = cards[1][3], cards[1][4]
        b1 = self.para(specs[1][1], 26, 28, TEXT, "left").move_to([x - 3.35, y - 0.55, 0], aligned_edge=LEFT)
        v1 = bold("16%", 110, RED).move_to([x + 2.35, y - 0.45, 0])
        x, y = cards[2][3], cards[2][4]
        v2 = bold("62%", 110, GOLD).move_to([x - 2.05, y - 0.5, 0])
        b2 = self.para(specs[2][1], 24, 26, TEXT, "left").move_to([x - 0.65, y - 0.5, 0], aligned_edge=LEFT)
        x, y = cards[3][3], cards[3][4]
        b3 = self.para(specs[3][1], 30, 28, TEXT, "left").move_to([x - 3.35, y - 0.55, 0], aligned_edge=LEFT)
        otp = VGroup(RoundedRectangle(corner_radius=0.15, width=1.6, height=0.8, color=RED, stroke_width=4,
                                      fill_color=PANEL, fill_opacity=1), bold("OTP", 46, TEXT))
        otp[1].move_to(otp[0])
        otp.add(cross_icon(s=0.42).move_to(otp[0]))
        otp.move_to([x + 2.6, y + 0.6, 0])
        bodies = [VGroup(b0, v0), VGroup(b1), VGroup(v2, b2), VGroup(b3, otp)]
        for bd in bodies:
            for m in bd:
                if m.width > 6.8:
                    m.scale_to_fit_width(6.8)
        phrases = ["trap one", "trap two", "trap three", "trap four"]
        shown = []
        for i, ph in enumerate(phrases):
            self.at(cue(ph, K))
            b, n, tt = cards[i][:3]
            anims = [FadeIn(b), FadeIn(n), FadeIn(tt, shift=RIGHT * 0.2)]
            for prev in shown:
                anims.append(prev.animate.set_opacity(0.45))
            self.P(*anims, rt=0.45)
            if i == 1:
                self.P(FadeIn(bodies[1]), rt=0.4)
            elif i == 2:
                self.at(cue("at momentum", K))
                self.P(FadeIn(b2), rt=0.3)
                self.at(cue("62%", K))
                self.P(FadeIn(v2, scale=1.3), rt=0.4)
            else:
                self.P(FadeIn(bodies[i]), rt=0.4)
            if i == 1:
                self.at(cue("eats 16%", K))
                self.P(FadeIn(v1, scale=1.3), rt=0.4)
            grp = VGroup(b, n, tt, bodies[i]) if i != 1 else VGroup(b, n, tt, bodies[1], v1)
            shown.append(grp)
        self.at(cue("every time your retirement", K))
        self.P(Indicate(v2, color=GOLD, scale_factor=1.15), rt=0.7)
        self.at(cue("never share your otp", K))
        self.P(*[g.animate.set_opacity(1) for g in shown[:3]], Indicate(otp, color=RED, scale_factor=1.15), rt=0.7)

    # =====================================================================
    def ch8(self):
        K = "ch8_when"
        self.chapter_in(K, "SHOULD YOU WITHDRAW?")
        yes = VGroup(tick_icon(s=0.4), label("Real emergencies", 52, GREEN)).arrange(RIGHT, buff=0.35)
        yb = RoundedRectangle(corner_radius=0.4, width=yes.width + 1.0, height=1.2, color=GREEN, stroke_width=5,
                              fill_color=PANEL, fill_opacity=1)
        yg = VGroup(yb, yes.move_to(yb)).move_to([0, 1.4, 0])
        nos = VGroup()
        for t in ("Holidays", "Shopping", "Things that can wait"):
            g = VGroup(cross_icon(s=0.18), label(t, 36, RED)).arrange(RIGHT, buff=0.25)
            bb = RoundedRectangle(corner_radius=0.3, width=g.width + 0.7, height=0.85, color=RED, stroke_width=4,
                                  fill_color=PANEL, fill_opacity=1)
            nos.add(VGroup(bb, g.move_to(bb)))
        nos.arrange(RIGHT, buff=0.4).move_to([0, -0.2, 0])
        self.at(cue("meant for real emergencies", K))
        self.P(FadeIn(yg, scale=0.9), rt=0.5)
        for g, ph in zip(nos, ["not holidays", "not shopping", "not things that"]):
            self.at(cue(ph, K))
            self.P(FadeIn(g, shift=UP * 0.2), rt=0.35)

        self.at(cue("but life happens", K))
        self.clear(rt=0.35)
        ls = VGroup(box(6.4, 3.0, -4.0, 0.4, stroke=RED, sw=5), bold("Loan shark", 60, RED).move_to([-4.0, 1.1, 0]),
                    body("Huge interest", 34, TEXT).move_to([-4.0, 0.1, 0]),
                    body("Debt that keeps growing", 30, MUTED).move_to([-4.0, -0.5, 0]))
        wd = VGroup(box(6.4, 3.0, 4.0, 0.4, stroke=GOLD, sw=5), bold("Withdrawal", 60, GOLD).move_to([4.0, 1.1, 0]),
                    body("Tax + fee + lost growth", 34, TEXT).move_to([4.0, 0.1, 0]),
                    body("But no new debt", 30, MUTED).move_to([4.0, -0.5, 0]))
        vs = bold("VS", 60, MUTED).move_to([0, 0.4, 0])
        self.at(cue("between a withdrawal", K))
        self.P(FadeIn(wd, shift=UP * 0.2), rt=0.4)
        self.at(cue("and a loan shark", K))
        self.P(FadeIn(vs), FadeIn(ls, shift=UP * 0.2), rt=0.4)
        le = label("Can be the lesser evil", 40, GREEN).move_to([4.0, -1.6, 0])
        self.at(cue("the lesser evil", K))
        self.P(FadeIn(le, shift=UP * 0.15), rt=0.4)
        kc = outline_pill("Know the real cost before you do it", GOLD, 36).move_to([0, -3.0, 0])
        self.at(cue("just know the real cost", K))
        self.P(FadeIn(kc, shift=UP * 0.2), rt=0.4)

        self.at(cue("ask yourself three questions", K))
        self.clear(rt=0.35)
        qs = [("Is this a real emergency?", None, "is this a real"),
              ("Is there a cheaper option?", "like a payment plan", "is there a cheaper"),
              ("What will I get after tax and fees?", None, "and do i know")]
        for i, (q, s, ph) in enumerate(qs):
            x = -5.1 + i * 5.1
            b = box(4.7, 3.2, x, 0.4)
            n = flip_tile("?", 0.7, 1.0, GOLD).move_to([x, 1.35, 0])
            qt = self.para(q, 16, 36, TEXT).move_to([x, 0.05, 0])
            fit(qt, 4.2)
            g = VGroup(b, n, qt)
            if s:
                g.add(body(s, 28, MUTED).move_to([x, -0.85, 0]))
            self.at(cue(ph, K))
            self.P(FadeIn(g, shift=UP * 0.25), rt=0.45)
        ef = VGroup(tick_icon(s=0.35), label("Best protection: your own emergency fund, even a small one", 36, GREEN)
                    ).arrange(RIGHT, buff=0.3)
        efb = RoundedRectangle(corner_radius=0.3, width=ef.width + 0.9, height=1.0, color=GREEN, stroke_width=4,
                               fill_color=PANEL, fill_opacity=1)
        efg = VGroup(efb, ef.move_to(efb)).move_to([0, -2.6, 0])
        nsa = body("in a normal savings account", 30, MUTED).next_to(efg, DOWN, buff=0.2)
        self.at(cue("the best protection", K))
        self.P(FadeIn(efg, shift=UP * 0.2), rt=0.5)
        self.at(cue("in a normal savings account", K))
        self.P(FadeIn(nsa), rt=0.3)

    # =====================================================================
    def ch9(self):
        K = "ch9_how"
        self.chapter_in(K, "HOW TO WITHDRAW")
        steps = [("1", "Check", "At least R2 000 saved, and no withdrawal yet this tax year", "step one"),
                 ("2", "Tax in order", "Registered, returns filed, name, ID and bank details all match", "step two"),
                 ("3", "Apply", "On your fund's website or app, or through HR at work", "step three"),
                 ("4", "Tax directive", "SARS sets the tax and takes any money you owe", "step four"),
                 ("5", "Get paid", "Into your bank account, often within about two weeks", "step five")]
        for i, (n, t, s, ph) in enumerate(steps):
            x = -6.24 + i * 3.12
            b = box(2.92, 4.0, x, 0.05)
            nt = flip_tile(n, 0.7, 1.0, GOLD).move_to([x, 1.35, 0])
            tt = fit(label(t, 34), 2.6).move_to([x, 0.4, 0])
            st = fit(self.para(s, 17, 24, MUTED), 2.6).next_to(tt, DOWN, buff=0.25)
            self.at(cue(ph, K))
            self.P(FadeIn(VGroup(b, nt, tt, st), shift=UP * 0.25), rt=0.45)
        dl = outline_pill("Don't apply at the very end of February: it may count against the next tax year", GOLD, 30)
        fit(dl, 15.2).move_to([0, -2.9, 0])
        self.at(cue("dont apply at the", K))
        self.P(FadeIn(dl, shift=UP * 0.2), rt=0.5)

    # =====================================================================
    def ch10(self):
        K = "ch10_news"
        self.chapter_in(K, "WHAT IS CHANGING?")
        b = box(12.0, 3.6, 0, 0.1)
        t1 = label("Retrenched workers in serious hardship", 44, TEXT).move_to([0, 0.85, 0])
        t2 = body("could get some money from the retirement pot", 36, MUTED).move_to([0, 0.1, 0])
        self.at(cue("government is talking", K))
        self.P(FadeIn(b), FadeIn(t1, shift=UP * 0.15), rt=0.5)
        self.at(cue("some money from", K))
        self.P(FadeIn(t2), rt=0.4)
        stamp_t = bold("PROPOSAL ONLY · NOT LAW", 60, RED)
        stamp_b = RoundedRectangle(corner_radius=0.2, width=stamp_t.width + 0.8, height=1.2, color=RED,
                                   stroke_width=8, fill_color=BG, fill_opacity=0.85)
        stamp = VGroup(stamp_b, stamp_t.move_to(stamp_b)).rotate(-6 * DEGREES).move_to([0, -1.25, 0])
        self.at(cue("its only a proposal", K))
        self.P(FadeIn(stamp, scale=1.6), rt=0.4)
        warn = label("Be careful of anyone who tells you otherwise", 36, GOLD).move_to([0, -3.1, 0])
        self.at(cue("so be careful", K))
        self.P(FadeIn(warn, shift=UP * 0.2), rt=0.4)

    # =====================================================================
    def ch11(self):
        K = "ch11_recap"
        self.chapter_in(K, "RECAP")
        items = [("3 pots: vested, savings and retirement", "there are three pots"),
                 ("Savings pot: once a tax year, from R2 000", "you can withdraw from"),
                 ("Every withdrawal: tax + fee + lost growth", "every withdrawal is taxed"),
                 ("Retirement pot: locked until you retire", "the retirement pot is locked"),
                 ("Only claim through official channels", "and always claim")]
        for i, (txt, ph) in enumerate(items):
            y = 1.9 - i * 1.05
            g = VGroup(tick_icon(s=0.3).move_to([-6.0, y, 0]), label(txt, 40).move_to([-5.4, y, 0], aligned_edge=LEFT))
            self.at(cue(ph, K))
            self.P(FadeIn(g, shift=RIGHT * 0.3), rt=0.35)
        # end board
        self.at(cue("if this helped", K))
        self.clear(rt=0.4, heading_too=True)
        self.P(FadeOut(self.brand), rt=0.2)
        r1 = flip_word("MONEY", 1.0, 1.4, 0.1)
        r2 = flip_word("FROM", 1.0, 1.4, 0.1)
        r3 = flip_word("ZER0", 1.0, 1.4, 0.1, gold_last_zero=True)
        board = VGroup(r1, r2, r3).arrange(DOWN, buff=0.18).move_to([-3.3, 0.3, 0])
        tiles = list(r1) + list(r2) + list(r3)
        self.add(*tiles)
        self.P(flip_in(None, tiles, rt=1.4, lag=0.07), rt=1.4)
        sub = RoundedRectangle(corner_radius=0.55, width=5.4, height=1.1, stroke_width=0, fill_color=GREEN,
                               fill_opacity=1).move_to([4.2, 0.9, 0])
        sub_t = bold("SUBSCRIBE", 64, BG).move_to(sub)
        tag = label("New Shorts every day,\na full guide every week", 36, TEXT).move_to([4.2, -0.6, 0])
        disc = body("General information, not financial advice.", 26, MUTED).move_to([4.2, -2.0, 0])
        self.at(cue("subscribe to money", K))
        self.P(FadeIn(sub, scale=0.8), FadeIn(sub_t, scale=0.8), FadeIn(tag), rt=0.6)
        self.at(cue("see you in the", K))
        self.P(FadeIn(disc), rt=0.4)
