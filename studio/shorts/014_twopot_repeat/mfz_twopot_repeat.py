"""Short 014: three two-pot withdrawals of R10,000 = about R75,900 less at retirement (illustration).
Bright flat look (Rodney, 16 Nov 2026): deep grounds, vivid rounded shapes, glow, gold accent, motion in every frame,
no split-flap tiles, nothing cut by an edge."""
import os, json, math, random
from manim import *
from manim.utils.exceptions import EndSceneEarlyException

PREVIEW = os.environ.get("PREVIEW") == "1"
config.pixel_width = 1080 if PREVIEW else 2160
config.pixel_height = 1920 if PREVIEW else 3840
config.frame_rate = 30 if PREVIEW else 60
config.frame_height = 16
config.frame_width = 9
config.background_color = "#0B2A3A"

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


GREEN_T, GREEN_B = "#0E6E6A", "#0A2546"
MAG_T, MAG_B = "#7A1B6E", "#1E0F4F"


def pot(s=1.0):
    body = RoundedRectangle(corner_radius=1.15 * s, width=4.6 * s, height=3.9 * s, stroke_width=0,
                            fill_color=VIOLET, fill_opacity=1)
    shade = RoundedRectangle(corner_radius=1.15 * s, width=1.6 * s, height=3.9 * s, stroke_width=0,
                             fill_color="#6A4FD9", fill_opacity=1).align_to(body, RIGHT)
    rim = RoundedRectangle(corner_radius=0.28 * s, width=5.1 * s, height=0.62 * s, stroke_width=0,
                           fill_color=PINK, fill_opacity=1).move_to(body.get_top() + DOWN * 0.05 * s)
    band = RoundedRectangle(corner_radius=0.22 * s, width=3.7 * s, height=0.85 * s, stroke_width=0,
                            fill_color=CREAM, fill_opacity=1).move_to(body.get_center() + DOWN * 0.25 * s)
    bt = fitw(bold("TWO-POT", NAVY, 0.55 * s), 3.3 * s).move_to(band)
    shine = RoundedRectangle(corner_radius=0.2 * s, width=0.35 * s, height=1.9 * s, stroke_width=0,
                             fill_color=CREAM, fill_opacity=0.22).move_to(body.get_center() + LEFT * 1.55 * s + UP * 0.2 * s)
    peek = VGroup(*[coin(0.42 * s).move_to(rim.get_top() + [x * s, 0.18 * s, 0]) for x in (-1.5, -0.5, 0.5, 1.5)])
    peek[1].shift(UP * 0.25 * s); peek[2].shift(UP * 0.12 * s)
    return VGroup(peek, body, shade, shine, band, bt, rim)


def numcoin(n, r=0.55):
    c = coin(r, str(n))
    return c


class MFZ_TWOPOT_REPEAT(Scene):
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
        pt = pot(0.78).move_to([0, 3.0, 0])
        pg = glow(pt.get_center(), 3.3, PINK, peak=0.28)
        cs = VGroup()
        for i, (x, y) in enumerate([(-2.9, 5.15), (0, 5.85), (2.9, 5.15)]):
            c = numcoin(i + 1, 0.6).move_to([x, y, 0])
            cs.add(VGroup(glow(c.get_center(), 1.0, GOLD, peak=0.35), c))
        big = fitw(bold("3 WITHDRAWALS", GOLD, 1.3), 7.8).move_to([0, -0.05, 0])
        line2 = VGroup(bold("=", CREAM, 0.8), bold("R75 900", CORAL, 1.2), bold("LESS", CREAM, 0.95)).arrange(RIGHT, buff=0.28)
        fitw(line2, 8.0).move_to([0, -1.45, 0])
        sub = pill("AT RETIREMENT", MINT, 5.6, 0.85).move_to([0, -2.8, 0])
        return VGroup(pg, pt), cs, big, line2, sub

    def construct(self):
        random.seed(14)
        self.t = 0.0

        def ground(c1, c2):
            r = Rectangle(width=9.4, height=16.4, stroke_width=0)
            r.set_fill(color=[c2, c1], opacity=1)
            r.set_sheen_direction(UP)
            return r
        bg = ground(GREEN_T, GREEN_B).set_z_index(-20)
        self.add(bg)
        clock = ValueTracker(0)
        clock.add_updater(lambda m, dt: m.increment_value(dt))
        self.add(clock)
        blobs = VGroup()
        for i, (c, x, y, r) in enumerate([(CYAN, -3.0, 5.0, 3.2), (PINK, 3.2, -1.0, 3.0), (VIOLET, -2.6, -5.5, 3.4),
                                          (GOLD, 3.0, 6.5, 2.2)]):
            b = glow([x, y, 0], r, c, layers=14, peak=0.16)
            b.base = np.array([x, y, 0.0]); b.k = i
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

        def swap_ground(c1, c2, rt=0.5):
            nb = ground(c1, c2).set_z_index(-19).set_opacity(0)
            self.add(nb)
            self.P(nb.animate.set_opacity(1), rt=rt)
            return nb

        zero = VGroup(Circle(radius=0.36, stroke_width=0, fill_color=GOLD, fill_opacity=1), bold("0", NAVY, 0.45))
        zero[1].move_to(zero[0])
        brand = VGroup(zero, bold("MONEY FROM ZERO", CREAM, 0.42)).arrange(RIGHT, buff=0.2).move_to([0, 7.15, 0])
        self.add(brand)
        self.bob(brand, amp=0.03, freq=0.3)

        # ---------- HOOK: full title frame at frame 0 ----------
        ps, cs, big, line2, sub = self.hook_layout()
        self.add(ps, cs, big, line2, sub)
        self.bob(ps, 0.08, 0.45)
        for i, c in enumerate(cs):
            self.bob(c, 0.12, 0.55 + 0.1 * i, rot=0.03)
        self.bob(big, 0.05, 0.5)
        self.bob(sub, 0.04, 0.4)
        self.W(0.2)
        self.P(LaggedStart(*[Indicate(c[1], scale_factor=1.25, color=GOLD_L) for c in cs], lag_ratio=0.3), rt=0.9)
        self.at(wt("hook", "75,900") - 0.1)
        self.P(Indicate(line2[1], scale_factor=1.15, color=CORAL), rt=0.6)
        self.at(wt("hook", "retirement") - 0.1)
        self.P(Indicate(sub, scale_factor=1.08), rt=0.5)

        # ---------- RARE: more than 60% are third withdrawals ----------
        self.at("rare")
        for m in (ps, big, line2, sub, *cs):
            m.clear_updaters()
        self.clear(ps, cs, big, line2, sub, rt=0.3)
        head = bold("IT'S NOT RARE!", CREAM, 0.95).move_to([0, 6.0, 0])
        gc = np.array([0, 1.6, 0]); R = 2.35
        track = Circle(radius=R, stroke_width=58, color="#123E5C").move_to(gc)
        qm = bold("?", GOLD, 1.3).move_to(gc)
        self.P(FadeIn(head, shift=DOWN * 0.4, scale=0.8), Create(track), FadeIn(qm, scale=0.4), rt=0.4)
        self.bob(head, 0.04, 0.5)
        self.bob(qm, 0.1, 0.8, rot=0.05)
        self.at(wt("rare", "march") - 0.1)
        src = pill("MOMENTUM DATA · MARCH 2026", CYAN, 6.6, 0.7).move_to([0, 4.95, 0])
        self.P(FadeIn(src, shift=DOWN * 0.3), rt=0.35)
        shares = [(0.62, CORAL), (0.33, CYAN), (0.05, MINT)]
        arcs, a0 = VGroup(), PI / 2
        for f, c in shares:
            arcs.add(Arc(radius=R, start_angle=a0, angle=-f * TAU + 0.04, stroke_width=58, color=c).move_arc_center_to(gc))
            a0 -= f * TAU
        rg = glow(gc, 3.5, CORAL, peak=0.22)
        pct = ValueTracker(0)
        ctr = always_redraw(lambda: bold(f"{int(round(pct.get_value()))}%+", GOLD, 1.15).move_to(gc + UP * 0.25))
        clab = label("of claims", CREAM, 0.42).move_to(gc + DOWN * 0.75)
        self.P(FadeIn(rg), rt=0.3)
        self.at(wt("rare", "60") - 0.25)
        qm.clear_updaters()
        self.remove(qm)
        self.add(ctr)
        self.P(Create(arcs[0]), pct.animate.set_value(60), FadeIn(clab), rt=0.8, rate_func=rate_functions.ease_out_cubic)
        ctr.clear_updaters()
        self.at(wt("rare", "third") - 0.15)
        third = pill("3RD WITHDRAWAL", CORAL, 5.6, 0.95, CREAM).move_to([0, -1.55, 0])
        self.P(FadeIn(third, scale=1.4), Create(arcs[1]), Create(arcs[2]), rt=0.5)
        self.bob(third, 0.05, 0.7, rot=0.01)
        spin = VGroup(track, arcs)
        spin.add_updater(lambda m, dt: m.rotate(-0.08 * dt, about_point=gc))

        # ---------- FIRST: first-timers just 5% ----------
        self.at("first")
        spin.clear_updaters(); third.clear_updaters()
        mg = glow(arcs[2].get_center(), 1.6, MINT, peak=0.5)
        ctr5 = bold("5%", MINT, 1.3).move_to(ctr)
        flab = label("first-timers", CREAM, 0.42).move_to(clab)
        self.P(arcs[0].animate.set_stroke(opacity=0.25), arcs[1].animate.set_stroke(opacity=0.25),
               arcs[2].animate.set_stroke(width=90), FadeIn(mg), Transform(ctr, ctr5), Transform(clab, flab),
               FadeOut(third), rt=0.5)
        self.remove(third)
        self.at(wt("first", "5") - 0.15)
        f5 = pill("FIRST TIME: JUST 5%", MINT, 6.2, 0.95).move_to([0, -1.55, 0])
        self.P(FadeIn(f5, shift=UP * 0.3, scale=0.7), Indicate(ctr, scale_factor=1.2, color=MINT), rt=0.5)
        self.bob(f5, 0.05, 0.6)
        spin2 = VGroup(track, arcs, mg)
        spin2.add_updater(lambda m, dt: m.rotate(0.1 * dt, about_point=gc))

        # ---------- EXAMPLE: R10,000, three years in a row = R30,000 out ----------
        self.at("example")
        spin2.clear_updaters(); f5.clear_updaters(); head.clear_updaters()
        self.clear(head, src, track, arcs, mg, ctr, clab, f5, rg, rt=0.3)
        p2 = pot(0.85).move_to([0, 3.6, 0])
        p2g = glow(p2.get_center(), 3.4, PINK, peak=0.25)
        self.P(FadeIn(p2g), FadeIn(p2, shift=UP * 0.5), rt=0.35)
        self.bob(p2, 0.06, 0.4)
        self.at(wt("example", "10,000") - 0.15)
        big10 = coin(0.95, "R10 000").move_to([0, 0.15, 0])
        b10g = glow(big10.get_center(), 1.7, GOLD, peak=0.35)
        self.P(FadeIn(b10g), FadeIn(big10, scale=0.3, shift=DOWN * 1.2), rt=0.4)
        self.bob(big10, 0.08, 0.7)
        self.at(wt("example", "three") - 0.1)
        xs = [-2.85, 0, 2.85]
        chips = VGroup(*[pill(f"YEAR {i + 1}", CYAN, 2.5, 0.7).move_to([x, -1.55, 0]) for i, x in enumerate(xs)])
        cc = VGroup(*[coin(0.95, "R10 000").move_to(p2.get_center()) for _ in xs])
        big10.clear_updaters()
        self.remove(big10)
        self.P(FadeOut(b10g), rt=0.01)
        self.add(cc)
        self.P(LaggedStart(*[c.animate.move_to([x, 0.15, 0]) for c, x in zip(cc, xs)], lag_ratio=0.25),
               LaggedStart(*[FadeIn(ch, shift=UP * 0.3) for ch in chips], lag_ratio=0.25), rt=0.9)
        for c in cc:
            self.bob(c, 0.07, 0.6, rot=0.02)
        self.at(wt("example", "30,000") - 0.15)
        out = VGroup(RoundedRectangle(corner_radius=0.45, width=6.0, height=1.25, stroke_width=0, fill_color=GOLD,
                                      fill_opacity=1), bold("R30 000 OUT", NAVY, 0.78))
        out[1].move_to(out[0]); out.move_to([0, -2.95, 0])
        self.P(FadeIn(out, scale=1.5), rt=0.35)
        self.bob(out, 0.04, 0.6)

        # ---------- TAX: taxed at your marginal rate, and a fee ----------
        self.at("tax")
        for c in cc:
            c.clear_updaters()
        out.clear_updaters()
        self.P(FadeOut(out), FadeOut(chips), rt=0.3)
        self.remove(out, chips)
        self.at(wt("tax", "taxed") - 0.1)
        bites = VGroup()
        for c in cc:
            b = VGroup(RoundedRectangle(corner_radius=0.2, width=1.55, height=0.68, stroke_width=0, fill_color=CORAL,
                                        fill_opacity=1), bold("TAX", CREAM, 0.42))
            b[1].move_to(b[0]); b.move_to(c.get_center() + [0, 0.2, 0])
            bites.add(b)
        tl = fitw(label("taxed at your marginal rate", CREAM, 0.5), 8.0).move_to([0, -2.35, 0])
        self.P(LaggedStart(*[FadeIn(b, scale=1.6) for b in bites], lag_ratio=0.15), FadeIn(tl, shift=UP * 0.2), rt=0.5)
        self.P(LaggedStart(*[b.animate.shift(DOWN * 1.5 + RIGHT * 0.6).rotate(-0.3) for b in bites], lag_ratio=0.1),
               *[c.animate.scale(0.8) for c in cc], rt=0.6)
        self.bob(bites, 0.06, 0.8)
        self.at(wt("tax", "fee") - 0.2)
        fees = VGroup()
        for c in cc:
            f = VGroup(RoundedRectangle(corner_radius=0.2, width=1.4, height=0.62, stroke_width=0, fill_color=CYAN,
                                        fill_opacity=1), bold("FEE", NAVY, 0.38))
            f[1].move_to(f[0]); f.move_to(c.get_center() + [-0.55, 0.85, 0])
            fees.add(f)
        fl = label("+ a fee", CYAN, 0.5).move_to([0, -3.05, 0])
        self.P(LaggedStart(*[FadeIn(f, scale=1.6) for f in fees], lag_ratio=0.12), FadeIn(fl), *[c.animate.scale(0.9) for c in cc], rt=0.45)

        # ---------- GROWTH: R30,000 left 20 years at 5% real -> about R75,900 ----------
        self.at("growth")
        bites.clear_updaters(); p2.clear_updaters()
        self.clear(p2, p2g, cc, bites, fees, tl, fl, rt=0.3)
        nb = swap_ground(PLUM_T, PLUM_B, rt=0.35)
        rc = bold("THE REAL COST?", CREAM, 0.85).move_to([0, 5.95, 0])
        self.P(FadeIn(rc, shift=DOWN * 0.3), rt=0.3)
        self.at(wt("growth", "growth") - 0.15)
        gw = bold("GROWTH", MINT, 1.6).move_to([0, 2.0, 0])
        gwg = glow(gw.get_center(), 3.0, MINT, peak=0.3)
        sprout = VGroup(Line([0, -1.8, 0], [0, 0.3, 0], stroke_width=16, color=MINT_D),
                        Ellipse(width=1.3, height=0.6, stroke_width=0, fill_color=MINT, fill_opacity=1).rotate(0.5).move_to([0.55, 0.05, 0]),
                        Ellipse(width=1.3, height=0.6, stroke_width=0, fill_color=MINT, fill_opacity=1).rotate(-0.5).move_to([-0.55, -0.55, 0]))
        self.P(FadeIn(gwg), FadeIn(gw, scale=0.5), GrowFromEdge(sprout, DOWN), rt=0.5)
        self.bob(gw, 0.06, 0.6)
        self.at(wt("growth", "left") - 0.1)
        gw.clear_updaters()
        self.P(FadeOut(gw, shift=UP * 0.4), FadeOut(gwg), FadeOut(sprout), rt=0.3)
        self.remove(gw, gwg, sprout)
        N, base, maxh = 20, -2.0, 4.2
        vals = [30000 * (75868.67 / 30000) ** (i / (N - 1)) for i in range(N)]
        bw = 0.3
        bars = VGroup()
        for i, v in enumerate(vals):
            h = maxh * v / vals[-1]
            col = interpolate_color(ManimColor(MINT), ManimColor(GOLD), i / (N - 1))
            b = RoundedRectangle(corner_radius=0.1, width=bw, height=h, stroke_width=0, fill_color=col, fill_opacity=1)
            b.move_to([-3.5 + i * (7.0 / (N - 1)), base + h / 2, 0])
            bars.add(b)
        ax0 = label("today", CREAM, 0.38).move_to([-3.3, base - 0.45, 0])
        ax1 = label("+20 years", CREAM, 0.38).move_to([3.0, base - 0.45, 0])
        val = ValueTracker(30000)
        cnt = always_redraw(lambda: bold(rnd(val.get_value()), GOLD, 1.15).move_to([0, 4.45, 0]))
        self.add(cnt)
        self.P(FadeIn(bars[0], shift=UP * 0.3), FadeIn(ax0), rt=0.3)
        self.at(wt("growth", "20") - 0.1)
        t5 = wt("growth", "5") - 0.1
        tend = wt("growth", "75,900") - 0.1
        frac = (t5 - self.t) / (tend - self.t)
        k = 1 + int(round(frac * (N - 1)))
        self.P(LaggedStart(*[GrowFromEdge(b, DOWN) for b in bars[1:k]], lag_ratio=0.35),
               val.animate.set_value(vals[k - 1]), rt=t5 - self.t, rate_func=rate_functions.linear)
        self.note5 = VGroup(pill("5% A YEAR ABOVE INFLATION", CYAN, 6.6, 0.72),
                            label("illustration", CREAM, 0.3).shift(DOWN * 0.6)).move_to([0, 3.05, 0])
        self.at(t5)
        self.P(LaggedStart(*[GrowFromEdge(b, DOWN) for b in bars[k:]], lag_ratio=0.35), FadeIn(ax1),
               FadeIn(self.note5, scale=0.7), val.animate.set_value(75868.67), rt=tend - self.t,
               rate_func=rate_functions.linear)
        self.P(FadeOut(self.note5), rt=0.2)
        cnt.clear_updaters()
        self.remove(cnt)
        fin = bold("R75 900", GOLD, 1.35).move_to([0, 4.45, 0])
        fg = glow(fin.get_center(), 2.8, GOLD, peak=0.35)
        self.add(fg, fin)
        self.P(Indicate(fin, scale_factor=1.15, color=GOLD_L), rt=0.5)
        self.bob(fin, 0.05, 0.6)
        self.bob(bars, 0.03, 0.4)
        self.at(wt("growth", "today's") - 0.15)
        tm = pill("IN TODAY'S MONEY", MINT, 5.2, 0.75).move_to([0, 3.2, 0])
        self.P(FadeIn(tm, scale=0.7), rt=0.35)

        # ---------- GUIDE ----------
        self.at(CUE["guide"][0] - 0.2)
        fin.clear_updaters(); bars.clear_updaters()
        old = Group(rc, bars, ax0, ax1, fin, fg, tm)
        nb2 = ground(MAG_T, MAG_B).set_z_index(-19).set_opacity(0)
        self.add(nb2)
        scr = RoundedRectangle(corner_radius=0.35, width=7.6, height=4.4, stroke_width=0, fill_opacity=1).move_to([0, 2.7, 0])
        scr.set_fill(color=[VIOLET, CYAN], opacity=1); scr.set_sheen_direction(RIGHT)
        mini = pot(0.5).move_to(scr.get_center() + LEFT * 1.9)
        play = Triangle(stroke_width=0, fill_color=CREAM, fill_opacity=1).rotate(-PI / 2).scale(0.6).move_to(scr.get_center() + RIGHT * 1.6)
        pring = Circle(radius=0.85, stroke_width=0, fill_color=NAVY, fill_opacity=0.35).move_to(play)
        gt = fitw(bold("TWO-POT EXPLAINED", GOLD, 0.85), 7.8).move_to([0, -0.2, 0])
        gp = pill("FULL GUIDE ON THE CHANNEL", MINT, 6.8, 0.85).move_to([0, -1.35, 0])
        disc = label("General information, not financial advice", CREAM, 0.3).move_to([0, -2.35, 0]).set_opacity(0.85)
        sg = glow(scr.get_center(), 4.4, PINK, peak=0.25)
        scrg = VGroup(scr, mini, pring, play)
        self.P(FadeOut(old, scale=0.85), nb2.animate.set_opacity(1), FadeIn(sg), FadeIn(scrg, scale=0.7),
               FadeIn(gt, shift=UP * 0.3), FadeIn(gp), FadeIn(disc), rt=0.4)
        self.remove(*old.get_family())
        self.bob(scrg, 0.06, 0.6)
        pring.add_updater(lambda m, dt: m.scale(1 + 0.3 * math.sin(clock.get_value() * 5) * dt))

        # ---------- LOOP: rebuild the title frame ----------
        self.at("loop")
        scrg.clear_updaters(); pring.clear_updaters()
        ps, cs, big, line2, sub = self.hook_layout()
        q = bold("?", GOLD, 1.6).move_to([0, -0.05, 0])
        old = Group(scrg, gt, gp, disc, sg)
        self.P(FadeOut(old, scale=0.85), FadeOut(nb2), FadeOut(nb), FadeIn(ps, shift=DOWN * 0.4), FadeIn(q, scale=0.4), rt=0.45)
        self.remove(*old.get_family(), nb, nb2)
        self.bob(ps, 0.08, 0.45)
        self.at(wt("loop", "withdraw") - 0.1)
        self.P(LaggedStart(*[FadeIn(c, scale=0.3, shift=UP * 0.5) for c in cs], lag_ratio=0.25), rt=0.7)
        for i, c in enumerate(cs):
            self.bob(c, 0.12, 0.55 + 0.1 * i, rot=0.03)
        self.at(wt("loop", "remember") - 0.35)
        self.P(ReplacementTransform(q, big), FadeIn(line2, shift=UP * 0.3), FadeIn(sub, shift=UP * 0.2), rt=0.6)
        self.bob(big, 0.05, 0.5)
        self.bob(sub, 0.04, 0.4)
        self.at(END - 0.02)
