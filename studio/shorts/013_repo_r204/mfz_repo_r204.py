"""Short 013: +0.25% on the repo rate = about R204 more a month on a R1.2 million bond.
Bright flat look (Rodney, 16 Nov 2026): rich deep backgrounds, vivid rounded shapes, soft glow, gold accent,
something moving in every frame, no split-flap tiles, nothing cut by an edge."""
import os, json, math, random
from manim import *
from manim.utils.exceptions import EndSceneEarlyException

PREVIEW = os.environ.get("PREVIEW") == "1"
config.pixel_width = 1080 if PREVIEW else 2160
config.pixel_height = 1920 if PREVIEW else 3840
config.frame_rate = 30 if PREVIEW else 60
config.frame_height = 16
config.frame_width = 9
config.background_color = "#160F45"

STOP = float(os.environ["STOP"]) if os.environ.get("STOP") else None
HERE = os.path.dirname(os.path.abspath(__file__))
TIM = json.load(open(os.path.join(HERE, "timings.json")))
CUE = {x["key"]: (x["start"], x["end"]) for x in TIM["lines"]}
END = TIM["duration"] + 0.5
WORDS = json.load(open(os.path.join(HERE, "words_raw.json")))

# palette: deep rich grounds, vivid flat foregrounds, the channel's gold as the accent
INDIGO_T, INDIGO_B = "#2A1B78", "#0B1F4D"
TEAL_T, TEAL_B = "#0B5E73", "#0A2347"
PLUM_T, PLUM_B = "#5A1A78", "#1A1150"
CREAM = "#FFF6E5"
GOLD = "#F7BE33"
GOLD_D = "#D99A12"
GOLD_L = "#FFE08A"
CORAL = "#FF6B5E"
CORAL_D = "#D9473B"
MINT = "#3BE8A0"
MINT_D = "#1FB77A"
CYAN = "#4DE1FF"
PINK = "#FF5FA2"
VIOLET = "#8C6BFF"
NAVY = "#120B3A"
PANEL = "#241A6B"


def bold(txt, color=CREAM, h=None):
    t = Text(txt, font="Barlow Condensed", weight=BOLD, font_size=120, color=color)
    if h:
        t.scale_to_fit_height(h)
    return t


def label(txt, color=CREAM, h=None):
    t = Text(txt, font="Barlow", weight=SEMIBOLD, font_size=80, color=color)
    if h:
        t.scale_to_fit_height(h)
    return t


def fitw(m, w):
    if m.width > w:
        m.scale_to_fit_width(w)
    return m


def glow(center, r, color, layers=14, peak=0.22):
    g = VGroup(*[Circle(radius=r * (0.35 + 0.65 * (i + 1) / layers), stroke_width=0, fill_color=color,
                        fill_opacity=peak / layers * 1.6) for i in range(layers)][::-1])
    return g.move_to(center)


def pill(txt, color, w, h=0.9, tc=NAVY):
    r = RoundedRectangle(corner_radius=h / 2, width=w, height=h, stroke_width=0, fill_color=color, fill_opacity=1)
    t = fitw(bold(txt, tc, h * 0.58), w - 0.5)
    return VGroup(r, t.move_to(r))


def coin(r=0.45, txt="R"):
    rim = Circle(radius=r, stroke_width=0, fill_color=GOLD_D, fill_opacity=1)
    face = Circle(radius=r * 0.84, stroke_width=0, fill_color=GOLD, fill_opacity=1)
    shine = Arc(radius=r * 0.62, start_angle=PI * 0.55, angle=PI * 0.5, stroke_width=r * 9, color=GOLD_L)
    t = fitw(bold(txt, "#7A4A00", r * 0.75), r * 1.4)
    return VGroup(rim, face, shine, t.move_to(face))


def house(s=1.0):
    body = RoundedRectangle(corner_radius=0.18 * s, width=3.2 * s, height=2.3 * s, stroke_width=0,
                            fill_color=CORAL, fill_opacity=1).move_to([0, -0.85 * s, 0])
    shade = RoundedRectangle(corner_radius=0.18 * s, width=1.0 * s, height=2.3 * s, stroke_width=0,
                             fill_color=CORAL_D, fill_opacity=1).align_to(body, RIGHT).align_to(body, DOWN)
    roof = Polygon([-2.05 * s, 0.25 * s, 0], [2.05 * s, 0.25 * s, 0], [0, 2.15 * s, 0], stroke_width=0,
                   fill_color=VIOLET, fill_opacity=1).round_corners(0.22 * s)
    chim = RoundedRectangle(corner_radius=0.06 * s, width=0.45 * s, height=0.9 * s, stroke_width=0,
                            fill_color=VIOLET, fill_opacity=1).move_to([1.15 * s, 1.35 * s, 0])
    door = RoundedRectangle(corner_radius=0.2 * s, width=0.8 * s, height=1.3 * s, stroke_width=0,
                            fill_color=NAVY, fill_opacity=1).move_to([-0.55 * s, -1.35 * s, 0])
    knob = Dot([-0.32 * s, -1.35 * s, 0], radius=0.06 * s, color=GOLD)
    win = RoundedRectangle(corner_radius=0.12 * s, width=0.9 * s, height=0.8 * s, stroke_width=0,
                           fill_color=GOLD_L, fill_opacity=1).move_to([0.75 * s, -0.55 * s, 0])
    wglow = glow(win.get_center(), 0.9 * s, GOLD, peak=0.35)
    cross = VGroup(Line(win.get_top(), win.get_bottom(), stroke_width=6 * s, color=CORAL_D),
                   Line(win.get_left(), win.get_right(), stroke_width=6 * s, color=CORAL_D))
    return VGroup(chim, roof, body, shade, door, knob, wglow, win, cross)


def arrow_shape(color, s=1.0):
    a = Polygon([-0.45 * s, -1.1 * s, 0], [0.45 * s, -1.1 * s, 0], [0.45 * s, 0.1 * s, 0], [1.0 * s, 0.1 * s, 0],
                [0, 1.2 * s, 0], [-1.0 * s, 0.1 * s, 0], [-0.45 * s, 0.1 * s, 0], stroke_width=0,
                fill_color=color, fill_opacity=1).round_corners(0.12 * s)
    return a


def brick(txt="R100 000", w=2.6, h=1.0, color=MINT):
    b = RoundedRectangle(corner_radius=0.16, width=w, height=h, stroke_width=0, fill_color=color, fill_opacity=1)
    band = RoundedRectangle(corner_radius=0.08, width=w * 0.22, height=h, stroke_width=0, fill_color=MINT_D,
                            fill_opacity=1).move_to(b)
    t = fitw(bold(txt, NAVY, h * 0.5), w * 0.9)
    return VGroup(b, band, t.move_to(b))


def bank(s=1.0):
    roof = Polygon([-2.2 * s, 0.9 * s, 0], [2.2 * s, 0.9 * s, 0], [0, 2.1 * s, 0], stroke_width=0,
                   fill_color=CYAN, fill_opacity=1).round_corners(0.18 * s)
    beam = RoundedRectangle(corner_radius=0.08 * s, width=4.2 * s, height=0.35 * s, stroke_width=0,
                            fill_color=CREAM, fill_opacity=1).move_to([0, 0.7 * s, 0])
    cols = VGroup(*[RoundedRectangle(corner_radius=0.1 * s, width=0.45 * s, height=2.0 * s, stroke_width=0,
                                     fill_color=CREAM, fill_opacity=1).move_to([x * s, -0.45 * s, 0])
                    for x in (-1.5, -0.5, 0.5, 1.5)])
    base = RoundedRectangle(corner_radius=0.1 * s, width=4.6 * s, height=0.45 * s, stroke_width=0,
                            fill_color=CYAN, fill_opacity=1).move_to([0, -1.65 * s, 0])
    star = Star(5, outer_radius=0.3 * s, inner_radius=0.13 * s, stroke_width=0, fill_color=GOLD,
                fill_opacity=1).move_to([0, 1.4 * s, 0])
    return VGroup(roof, beam, cols, base, star)


def wt(key, word, nth=1):
    s, e = CUE[key]
    k = 0
    for w in WORDS:
        tok = w[0].lower().strip(".,'?:")
        ok = (tok == word.lower()) if word[0].isdigit() else tok.startswith(word.lower())
        if s - 0.01 <= w[1] <= e + 0.01 and ok:
            k += 1
            if k == nth:
                return w[1]
    raise KeyError((key, word))


def rnd(v):
    return "R" + f"{int(round(v)):,}".replace(",", " ")


class MFZ_REPO_R204(Scene):
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

    def bob(self, m, amp=0.08, freq=0.6, rot=0.0):
        ph = random.random() * TAU
        st = {"t": 0.0}

        def up(mob, dt):
            st["t"] += dt
            w = TAU * freq
            mob.shift(UP * amp * w * math.cos(w * st["t"] + ph) * dt)
            if rot:
                mob.rotate(rot * w * math.cos(w * st["t"] + ph + 1) * dt)
        m.add_updater(up)
        return m

    def clear(self, *grps, rt=0.35):
        g = Group(*grps)
        for m in g.get_family():
            m.clear_updaters()
        self.P(FadeOut(g, scale=0.85), rt=rt)
        self.remove(*g.get_family())

    def hook_layout(self):
        h = house(0.95).move_to([0, 4.1, 0])
        hg = glow(h.get_center(), 3.4, PINK, peak=0.3)
        arr = arrow_shape(GOLD, 0.55).move_to([2.85, 5.2, 0])
        ag = glow(arr.get_center(), 1.0, GOLD, peak=0.35)
        big = bold("+0.25%", GOLD, 2.0).move_to([0, 0.35, 0])
        line2 = VGroup(bold("=", CREAM, 0.8), bold("+R204", CORAL, 1.25), bold("A MONTH", CREAM, 0.95)).arrange(RIGHT, buff=0.25)
        fitw(line2, 8.0).move_to([0, -1.55, 0])
        sub = pill("ON A R1.2 MILLION BOND", MINT, 6.6, 0.85).move_to([0, -3.05, 0])
        return VGroup(hg, h, ag, arr), big, line2, sub

    def construct(self):
        random.seed(13)
        self.t = 0.0
        # living background: gradient ground + drifting glow blobs + rising sparks
        def ground(c1, c2):
            r = Rectangle(width=9.4, height=16.4, stroke_width=0)
            r.set_fill(color=[c2, c1], opacity=1)
            r.set_sheen_direction(UP)
            return r
        bg = ground(INDIGO_T, INDIGO_B).set_z_index(-20)
        self.add(bg)
        clock = ValueTracker(0)
        clock.add_updater(lambda m, dt: m.increment_value(dt))
        self.add(clock)
        blobs = VGroup()
        for i, (c, x, y, r) in enumerate([(VIOLET, -3.0, 5.0, 3.2), (PINK, 3.2, -1.0, 3.0), (CYAN, -2.6, -5.5, 3.4),
                                          (GOLD, 3.0, 6.5, 2.2)]):
            b = glow([x, y, 0], r, c, layers=14, peak=0.16)
            b.base = np.array([x, y, 0.0])
            b.k = i
            b.add_updater(lambda m: m.move_to(m.base + np.array([0.9 * math.sin(clock.get_value() * 0.35 + m.k * 1.7),
                                                                   0.7 * math.cos(clock.get_value() * 0.28 + m.k), 0])))
            blobs.add(b)
        blobs.set_z_index(-15)
        self.add(blobs)
        sparks = VGroup()
        for i in range(26):
            d = Dot(radius=random.uniform(0.025, 0.06), color=random.choice([CREAM, GOLD_L, CYAN, PINK]))
            d.set_opacity(random.uniform(0.35, 0.8))
            d.x0, d.y0, d.v = random.uniform(-4.3, 4.3), random.uniform(-8, 8), random.uniform(0.25, 0.6)
            d.add_updater(lambda m: m.move_to([m.x0 + 0.15 * math.sin(clock.get_value() + m.y0),
                                               (m.y0 + m.v * clock.get_value() + 8) % 16.4 - 8.2, 0]))
            sparks.add(d)
        sparks.set_z_index(-14)
        self.add(sparks)

        def swap_ground(c1, c2, rt=0.6):
            nb = ground(c1, c2).set_z_index(-19).set_opacity(0)
            self.add(nb)
            self.P(nb.animate.set_opacity(1), rt=rt)
            return nb

        # brand bug: gold coin "0" + name (top, always on)
        zero = VGroup(Circle(radius=0.36, stroke_width=0, fill_color=GOLD, fill_opacity=1), bold("0", NAVY, 0.45))
        zero[1].move_to(zero[0])
        brand = VGroup(zero, bold("MONEY FROM ZERO", CREAM, 0.42)).arrange(RIGHT, buff=0.2).move_to([0, 7.15, 0])
        self.add(brand)
        self.bob(brand, amp=0.03, freq=0.3)

        # ---------- HOOK: title frame, fully visible at frame 0 ----------
        hs, big, line2, sub = self.hook_layout()
        self.add(hs, big, line2, sub)
        self.bob(hs, 0.10, 0.45)
        self.bob(big, 0.05, 0.5)
        self.bob(sub, 0.04, 0.4)
        self.W(0.25)
        self.P(Indicate(big, scale_factor=1.08, color=GOLD_L), rt=0.6)
        self.at(wt("hook", "204") - 0.1)
        self.P(Indicate(line2[1], scale_factor=1.2, color=CORAL), rt=0.6)
        # coins drop into the house, one per "month"
        self.at(wt("hook", "every"))
        coins = VGroup(*[coin(0.32).move_to([-2.9 + 0.62 * i, 8.6, 0]) for i in range(4)])
        self.add(coins)
        self.P(LaggedStart(*[c.animate.move_to(hs[1].get_center() + [-1.2 + 0.8 * i, 0.2, 0]).scale(0.6) for i, c in
                             enumerate(coins)], lag_ratio=0.2), rt=0.9)
        self.P(FadeOut(coins, scale=0.3), rt=0.25)

        # ---------- SETUP: the R1.2 million home loan ----------
        self.at("setup")
        hs.clear_updaters()
        self.P(FadeOut(big, shift=UP * 0.5), FadeOut(line2, shift=UP * 0.5), FadeOut(sub),
               FadeOut(hs[2]), FadeOut(hs[3]), rt=0.3)
        self.remove(big, line2, sub, hs[2], hs[3])
        hs.remove(hs[3], hs[2])
        self.P(hs.animate.scale(1.45).move_to([0, 2.1, 0]), rt=0.4)
        self.bob(hs, 0.08, 0.4)
        hike = VGroup(RoundedRectangle(corner_radius=0.4, width=3.0, height=0.95, stroke_width=0, fill_color=GOLD,
                                       fill_opacity=1), bold("+0.25%", NAVY, 0.6))
        hike[1].move_to(hike[0])
        hike.move_to([0, 6.1, 0])
        self.P(FadeIn(hike, shift=DOWN * 0.6, scale=0.6), rt=0.45)
        self.bob(hike, 0.06, 0.7)
        self.at(wt("setup", "1.2") - 0.15)
        tag = VGroup(RoundedRectangle(corner_radius=0.3, width=7.4, height=1.35, stroke_width=0, fill_color=CREAM,
                                      fill_opacity=1),
                     bold("R1.2 MILLION HOME LOAN", NAVY, 0.72))
        fitw(tag[1], 6.8).move_to(tag[0])
        tag.move_to([0, -1.75, 0])
        note20 = label("20-year bond, at prime (example)", GOLD_L, 0.36).move_to([0, -2.85, 0])
        self.P(FadeIn(tag, shift=UP * 0.5, scale=0.7), rt=0.45)
        self.P(FadeIn(note20, shift=UP * 0.2), rt=0.35)
        self.bob(tag, 0.05, 0.5, rot=0.01)

        # ---------- PRIME: gauge 10.75% -> 11%, instalment counts up ----------
        self.at("prime")
        self.clear(hs, hike, tag, note20, rt=0.35)
        gc = np.array([0, 3.0, 0])
        R = 2.7
        back = Arc(radius=R, start_angle=PI, angle=-PI, stroke_width=46, color="#3A2E8F").move_arc_center_to(gc)
        cols = [MINT, CYAN, GOLD, CORAL]
        segs = VGroup(*[Arc(radius=R, start_angle=PI - i * PI / 4, angle=-PI / 4 + 0.03, stroke_width=46,
                            color=c).move_arc_center_to(gc) for i, c in enumerate(cols)])
        ang = lambda v: PI - (v - 9.5) / 3.0 * PI   # dial from 9.5% to 12.5%
        needle = VGroup(Polygon([0, 0.16, 0], [R - 0.55, 0, 0], [0, -0.16, 0], stroke_width=0, fill_color=CREAM,
                                fill_opacity=1).round_corners(0.05),
                        Circle(radius=0.3, stroke_width=0, fill_color=CREAM, fill_opacity=1))
        needle.shift(gc - needle[1].get_center())
        needle.rotate(ang(10.75), about_point=gc)
        ptitle = bold("PRIME", CREAM, 0.7).move_to(gc + [0, -0.95, 0])
        val = bold("10.75%", GOLD, 1.0).move_to(gc + [0, -1.95, 0])
        gglow = glow(gc + [0, 0.8, 0], 3.6, VIOLET, peak=0.28)
        self.P(FadeIn(gglow), Create(back), LaggedStart(*[Create(s) for s in segs], lag_ratio=0.2),
               FadeIn(needle, scale=0.4), FadeIn(ptitle), FadeIn(val, shift=UP * 0.3), rt=0.6)
        self.at(wt("prime", "11") - 0.1)
        val2 = bold("11%", CORAL, 1.0).move_to(val)
        self.P(Rotate(needle, ang(11.0) - ang(10.75), about_point=gc, rate_func=rate_functions.ease_out_back),
               Transform(val, val2), rt=0.7)
        # wobble the needle so the dial is never still
        wob = {"t": 0}

        def nw(m, dt):
            wob["t"] += dt
            m.rotate(0.03 * math.cos(5 * wob["t"]) * dt * 5, about_point=gc)
        needle.add_updater(nw)
        self.at(wt("prime", "instalment") - 0.15)
        card = RoundedRectangle(corner_radius=0.4, width=7.6, height=3.0, stroke_width=0, fill_color=PANEL,
                                fill_opacity=1).move_to([0, -1.3, 0])
        cardg = glow(card.get_center(), 4.0, CYAN, peak=0.16)
        cap = label("MONTHLY INSTALMENT", CYAN, 0.42).move_to(card.get_top() + DOWN * 0.55)
        amt = ValueTracker(12182.75)
        num = always_redraw(lambda: bold(rnd(amt.get_value()), CREAM, 1.25).move_to(card.get_center() + DOWN * 0.3))
        self.P(FadeIn(cardg), FadeIn(card, shift=UP * 0.4), FadeIn(cap), rt=0.4)
        self.add(num)
        self.at(wt("prime", "12,386") - 0.2)
        self.P(amt.animate.set_value(12386.26), rt=0.9, rate_func=rate_functions.ease_out_cubic)
        num.clear_updaters()
        self.P(num.animate.set_color(GOLD), rt=0.2)
        badge = VGroup(RoundedRectangle(corner_radius=0.5, width=3.3, height=1.0, stroke_width=0, fill_color=CORAL,
                                        fill_opacity=1), bold("+R204", CREAM, 0.65))
        badge[1].move_to(badge[0])
        badge.move_to(card.get_corner(DR) + [-1.5, -0.15, 0]).rotate(0.06)
        self.P(FadeIn(badge, scale=1.6), rt=0.35)
        self.bob(badge, 0.07, 0.8, rot=0.02)
        self.bob(card, 0.04, 0.4)

        # ---------- YEAR: 12 months ring -> R2,442 ----------
        self.at(CUE["year"][0] - 0.2)
        needle.clear_updaters()
        self.clear(back, segs, needle, ptitle, val, gglow, card, cardg, cap, num, badge, rt=0.25)
        rc = np.array([0, 2.0, 0])
        months = "JFMAMJJASOND"
        dots = VGroup()
        for i, m in enumerate(months):
            a = PI / 2 - i * TAU / 12
            p = rc + 3.3 * np.array([math.cos(a), math.sin(a), 0])
            c = Circle(radius=0.48, stroke_width=0, fill_color="#3A2E8F", fill_opacity=1).move_to(p)
            dots.add(VGroup(c, bold(m, CREAM, 0.4).move_to(p)))
        total = ValueTracker(0)
        tnum = always_redraw(lambda: bold(rnd(total.get_value()), GOLD, 1.15).move_to(rc + UP * 0.25))
        ayear = bold("A YEAR", CREAM, 0.6).move_to(rc + DOWN * 1.0)
        rg = glow(rc, 3.6, GOLD, peak=0.22)
        self.P(FadeIn(rg), LaggedStart(*[FadeIn(d, scale=0.3) for d in dots], lag_ratio=0.05), rt=0.3)
        self.add(tnum)
        self.P(LaggedStart(*[d[0].animate.set_fill(GOLD) for d in dots], lag_ratio=0.12),
               total.animate.set_value(2442.16), rt=0.8, rate_func=rate_functions.ease_out_sine)
        tnum.clear_updaters()
        self.P(FadeIn(ayear, shift=UP * 0.3), Indicate(tnum, scale_factor=1.12, color=GOLD_L), rt=0.5)
        perm = label("+R204 x 12 months", GOLD_L, 0.42).move_to([0, -2.75, 0])
        self.P(FadeIn(perm, shift=UP * 0.2), rt=0.3)
        spin = {"t": 0}
        dots.add_updater(lambda m, dt: m.rotate(-0.12 * dt, about_point=rc))

        # ---------- RULE: every 0.25% ~ R17 a month per R100,000 ----------
        self.at("rule")
        dots.clear_updaters()
        self.clear(dots, tnum, ayear, rg, perm, rt=0.3)
        nb = swap_ground(TEAL_T, TEAL_B, rt=0.4)
        bulb_g = glow([-2.45, 5.6, 0], 1.3, GOLD, peak=0.45)
        bulb = VGroup(Circle(radius=0.55, stroke_width=0, fill_color=GOLD_L, fill_opacity=1),
                      RoundedRectangle(corner_radius=0.08, width=0.45, height=0.4, stroke_width=0, fill_color=CREAM,
                                       fill_opacity=1).shift(DOWN * 0.62)).move_to([-2.45, 5.6, 0])
        trick = bold("THE TRICK", CREAM, 1.05).next_to(bulb, RIGHT, buff=0.4)
        head = VGroup(bulb_g, bulb, trick)
        head.move_to([0, 5.4, 0])
        self.P(FadeIn(head, shift=DOWN * 0.4), rt=0.4)
        self.bob(head, 0.05, 0.5)
        self.at(wt("rule", "every") - 0.1)
        every = pill("EVERY +0.25%", GOLD, 5.2, 1.1).move_to([0, 3.4, 0])
        self.P(FadeIn(every, scale=0.6), rt=0.4)
        self.bob(every, 0.04, 0.6)
        self.at(wt("rule", "17") - 0.15)
        c17 = coin(1.15, "R17").move_to([2.4, 0.9, 0])
        c17g = glow(c17.get_center(), 1.9, GOLD, peak=0.35)
        pm = label("a month", GOLD_L, 0.45).next_to(c17, DOWN, buff=0.3)
        self.P(FadeIn(c17g), FadeIn(c17, scale=0.3, shift=UP * 0.5), FadeIn(pm), rt=0.45)
        self.bob(c17, 0.08, 0.7, rot=0.03)
        self.at(wt("rule", "100,000") - 0.15)
        b1 = brick("R100 000", 3.2, 1.25).move_to([-2.4, 0.9, 0])
        owed = label("you owe", MINT, 0.45).next_to(b1, DOWN, buff=0.3)
        eq = bold("=", CREAM, 0.7).move_to([0.15, 0.9, 0])
        self.P(FadeIn(b1, shift=RIGHT * 0.6), FadeIn(owed), FadeIn(eq, scale=0.4), rt=0.45)
        self.bob(b1, 0.06, 0.55)

        # ---------- EXAMPLE: R800,000 -> about R136 ----------
        self.at("example")
        for m in (c17, b1):
            m.clear_updaters()
        every.clear_updaters()
        self.P(FadeOut(c17g), FadeOut(pm), FadeOut(owed), FadeOut(eq), FadeOut(every),
               b1.animate.scale(0.55).move_to([-2.4, 2.2, 0]),
               c17.animate.scale(0.3).move_to([0.2, 2.2, 0]), rt=0.4)
        self.remove(c17g, pm, owed, eq, every)
        bricks = VGroup(b1, *[brick("R100 000", 3.2 * 0.55, 1.25 * 0.55) for _ in range(7)])
        for i, b in enumerate(bricks[1:], start=1):
            b.move_to([-2.4, 2.2 - 0.72 * i, 0])
        self.P(LaggedStart(*[FadeIn(b, shift=DOWN * 0.4) for b in bricks[1:]], lag_ratio=0.12), rt=0.75)
        coins8 = VGroup(c17, *[c17.copy() for _ in range(7)])
        for i, c in enumerate(coins8[1:], start=1):
            c.move_to([0.2, 2.2 - 0.72 * i, 0])
        self.P(LaggedStart(*[FadeIn(c, scale=0.3) for c in coins8[1:]], lag_ratio=0.12), rt=0.75)
        owe = pill("OWE R800 000", MINT, 4.0, 0.8).move_to([-1.1, 3.4, 0])
        fitw(owe, 4.0)
        self.P(FadeIn(owe, shift=DOWN * 0.3), rt=0.3)
        self.at(wt("example", "136") - 0.25)
        res = VGroup(bold("about", CREAM, 0.6), bold("R136", GOLD, 1.5), bold("A MONTH", CREAM, 0.55)).arrange(DOWN, buff=0.15).move_to([2.15, 0.0, 0])
        resg = glow(res.get_center(), 2.0, GOLD, peak=0.35)
        self.P(FadeIn(resg), LaggedStart(*[c.animate.move_to(res[1].get_center()).scale(0.4).set_opacity(0) for c in coins8], lag_ratio=0.06),
               FadeIn(res, scale=1.4), rt=0.6)
        self.remove(coins8)
        sm = label("8 x R17", GOLD_L, 0.42).move_to([2.15, -1.9, 0])
        self.P(FadeIn(sm), rt=0.25)
        self.bob(res, 0.05, 0.6)
        self.bob(bricks, 0.04, 0.45)

        # ---------- CUT: same maths, in reverse ----------
        self.at("cut")
        res.clear_updaters(); bricks.clear_updaters()
        self.clear(head, bricks, owe, res, resg, sm, rt=0.3)
        arr = arrow_shape(CORAL, 1.6).move_to([0, 2.6, 0])
        ag = glow(arr.get_center(), 2.8, CORAL, peak=0.3)
        hk = bold("+0.25%", CORAL, 1.2).move_to([0, -0.6, 0])
        self.P(FadeIn(ag), FadeIn(arr, shift=UP), FadeIn(hk), rt=0.4)
        self.at(wt("cut", "reverse") - 0.6)
        arr2 = arrow_shape(MINT, 1.6).rotate(PI).move_to(arr)
        ag2 = glow(arr.get_center(), 2.8, MINT, peak=0.3)
        hk2 = bold("-0.25% = YOU PAY LESS", MINT, 0.95).move_to(hk)
        fitw(hk2, 8.0)
        self.P(Transform(arr, arr2, path_arc=PI), Transform(ag, ag2), Transform(hk, hk2), rt=0.7)
        self.bob(arr, 0.12, 0.8)

        # ---------- WHEN: Reserve Bank, Thursday 19 November ----------
        self.at("when")
        arr.clear_updaters()
        self.clear(arr, ag, hk, rt=0.3)
        nb2 = swap_ground(PLUM_T, PLUM_B, rt=0.35)
        bk = bank(1.05).move_to([0, 3.5, 0])
        bkg = glow(bk.get_center(), 3.4, CYAN, peak=0.28)
        lab = bold("NEXT RATE DECISION", CREAM, 0.75).move_to([0, 0.95, 0])
        self.P(FadeIn(bkg), FadeIn(bk, shift=UP * 0.6), FadeIn(lab, shift=UP * 0.3), rt=0.5)
        self.bob(bk, 0.07, 0.4)
        self.at(wt("when", "thursday") - 0.2)
        cal = RoundedRectangle(corner_radius=0.35, width=4.4, height=3.1, stroke_width=0, fill_color=CREAM,
                               fill_opacity=1).move_to([0, -1.5, 0])
        ctop = RoundedRectangle(corner_radius=0.35, width=4.4, height=0.95, stroke_width=0, fill_color=CORAL,
                                fill_opacity=1).align_to(cal, UP)
        ctop2 = Rectangle(width=4.4, height=0.4, stroke_width=0, fill_color=CORAL, fill_opacity=1).align_to(ctop, DOWN)
        thu = bold("THURSDAY", CREAM, 0.5).move_to(ctop)
        d19 = bold("19 NOV", NAVY, 1.35).move_to(cal.get_center() + DOWN * 0.45)
        calg = VGroup(cal, ctop, ctop2, thu, d19)
        self.P(FadeIn(calg, scale=0.5, shift=UP * 0.5), rt=0.45)
        self.bob(calg, 0.05, 0.6, rot=0.015)

        # ---------- GUIDE: full guide on the channel ----------
        self.at("guide")
        calg.clear_updaters(); bk.clear_updaters()
        self.clear(bk, bkg, lab, calg, rt=0.3)
        scr = RoundedRectangle(corner_radius=0.35, width=7.6, height=4.6, stroke_width=0, fill_color=PANEL,
                               fill_opacity=1).move_to([0, 2.6, 0])
        scr.set_fill(color=[VIOLET, PINK], opacity=1)
        scr.set_sheen_direction(RIGHT)
        play = Triangle(stroke_width=0, fill_color=CREAM, fill_opacity=1).rotate(-PI / 2).scale(0.75).move_to(scr)
        pring = Circle(radius=1.0, stroke_width=0, fill_color=NAVY, fill_opacity=0.35).move_to(scr)
        gt = bold("REPO RATE EXPLAINED", GOLD, 0.8).move_to([0, -0.35, 0])
        fitw(gt, 7.8)
        gp = pill("FULL GUIDE ON THE CHANNEL", MINT, 6.8, 0.85).move_to([0, -1.55, 0])
        disc = label("General information, not financial advice", CREAM, 0.3).move_to([0, -2.6, 0])
        disc.set_opacity(0.85)
        sg = glow(scr.get_center(), 4.4, PINK, peak=0.25)
        self.P(FadeIn(sg), FadeIn(VGroup(scr, pring, play), scale=0.7), FadeIn(gt, shift=UP * 0.3), rt=0.45)
        self.P(FadeIn(gp, shift=UP * 0.2), FadeIn(disc), rt=0.3)
        scrg = VGroup(scr, pring, play)
        self.bob(scrg, 0.06, 0.5)
        pring.add_updater(lambda m, dt: m.scale(1 + 0.25 * math.sin(clock.get_value() * 4) * dt))

        # ---------- LOOP: back to the title frame ----------
        self.at("loop")
        scrg.clear_updaters(); pring.clear_updaters()
        self.clear(scrg, gt, gp, disc, sg, rt=0.3)
        self.P(FadeOut(nb2), FadeOut(nb), rt=0.35)
        self.remove(nb, nb2)
        random.seed(13)
        hs, big, line2, sub = self.hook_layout()
        q = bold("?", GOLD, 2.0).move_to([0, 0.35, 0])
        self.P(FadeIn(hs, shift=DOWN * 0.4), FadeIn(q, scale=0.4), rt=0.45)
        self.bob(hs, 0.10, 0.45)
        self.at(wt("loop", "cost") - 0.3)
        self.P(ReplacementTransform(q, big), FadeIn(line2, shift=UP * 0.3), FadeIn(sub, shift=UP * 0.2), rt=0.6)
        self.bob(big, 0.05, 0.5)
        self.at(END - 0.02)
