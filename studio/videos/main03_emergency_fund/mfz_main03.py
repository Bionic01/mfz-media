"""Money From Zero — Main video 03: how to build an emergency fund from zero (South Africa, 2026)."""
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


def car_icon(s=1.0, col=BLUE):
    bodyr = RoundedRectangle(corner_radius=0.25 * s, width=3.2 * s, height=0.9 * s, stroke_width=0,
                             fill_color=col, fill_opacity=1)
    cab = RoundedRectangle(corner_radius=0.25 * s, width=1.8 * s, height=0.75 * s, stroke_width=0,
                           fill_color=col, fill_opacity=1).next_to(bodyr, UP, buff=-0.15 * s).shift(LEFT * 0.2 * s)
    win = RoundedRectangle(corner_radius=0.1 * s, width=1.4 * s, height=0.4 * s, stroke_width=0,
                           fill_color=PANEL, fill_opacity=1).move_to(cab).shift(UP * 0.05 * s)
    w1 = VGroup(Circle(radius=0.38 * s, stroke_width=0, fill_color="#2A2A30", fill_opacity=1),
                Circle(radius=0.16 * s, stroke_width=0, fill_color=MUTED, fill_opacity=1))
    w2 = w1.copy()
    w1.move_to(bodyr.get_bottom() + LEFT * 0.95 * s)
    w2.move_to(bodyr.get_bottom() + RIGHT * 0.95 * s)
    return VGroup(cab, win, bodyr, w1, w2)


def person_icon(s=1.0, col=GREY):
    head = Circle(radius=0.32 * s, stroke_width=0, fill_color=col, fill_opacity=1)
    torso = RoundedRectangle(corner_radius=0.35 * s, width=1.0 * s, height=1.1 * s, stroke_width=0,
                             fill_color=col, fill_opacity=1).next_to(head, DOWN, buff=0.1 * s)
    return VGroup(head, torso)


def tyre_icon(s=1.0):
    outer = Circle(radius=1.0 * s, stroke_width=0, fill_color="#2A2A30", fill_opacity=1)
    tread = Circle(radius=0.92 * s, color=GREY, stroke_width=6 * s)
    rim = Circle(radius=0.5 * s, stroke_width=0, fill_color=MUTED, fill_opacity=1)
    hub = Circle(radius=0.14 * s, stroke_width=0, fill_color=GOLD, fill_opacity=1)
    spokes = VGroup(*[Line(ORIGIN, 0.45 * s * np.array([np.cos(a), np.sin(a), 0]), color=GREY, stroke_width=6 * s)
                      for a in np.linspace(0, 2 * PI, 6, endpoint=False)])
    return VGroup(outer, tread, rim, spokes, hub)


def shield_icon(s=1.0, col=GREEN):
    pts = [[-0.8, 0.75, 0], [0, 1.0, 0], [0.8, 0.75, 0], [0.8, 0.0, 0], [0, -1.0, 0], [-0.8, 0.0, 0]]
    sh = VMobject(stroke_width=0, fill_color=col, fill_opacity=1).set_points_smoothly(
        [np.array(p) * s for p in pts] + [np.array(pts[0]) * s])
    t = tick_icon(BG, s=0.7 * s).move_to(sh).shift(DOWN * 0.05 * s)
    t.set_stroke(width=16 * s)
    return VGroup(sh, t)


class MFZMain03(Scene):
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
                     self.ch8, self.ch9):
            step()
        self.at(END)

    # ---------- little helpers ----------
    def row_card(self, icon, txt, x, y, w, col=TEXT, size=36, h=0.9, stroke=STROKE):
        b = box(w, h, x, y, r=0.2, stroke=stroke, sw=3 if stroke == STROKE else 4)
        ic = icon.move_to([x - w / 2 + 0.55, y, 0])
        t = fit(label(txt, size, col), w - 1.4).move_to([x - w / 2 + 1.05, y, 0], aligned_edge=LEFT)
        return VGroup(b, ic, t)

    def banner(self, txt, col, y, size=34, icon=None):
        t = label(txt, size, col)
        inner = VGroup(icon, t).arrange(RIGHT, buff=0.3) if icon is not None else VGroup(t)
        b = RoundedRectangle(corner_radius=0.3, width=inner.width + 0.9, height=inner.height + 0.5, color=col,
                             stroke_width=4, fill_color=PANEL, fill_opacity=1)
        g = VGroup(b, inner.move_to(b)).move_to([0, y, 0])
        return fit(g, 15.2)

    # =====================================================================
    def cold_open(self):
        K = "cold_open"
        car = car_icon(1.6).move_to([-4.2, 0.6, 0])
        smoke = VGroup(*[Circle(radius=r, stroke_width=0, fill_color=GREY, fill_opacity=0.7).move_to(
            car.get_right() + LEFT * 0.3 + UP * (0.6 + 0.4 * i) + RIGHT * 0.15 * i) for i, r in enumerate([0.18, 0.26, 0.34])])
        tom = outline_pill("Tomorrow", MUTED, 32).move_to([-5.3, 2.6, 0])
        cost = bold("R10 000", 200, RED).move_to([3.3, 0.9, 0])
        cl = label("car repair bill", 44, TEXT).next_to(cost, DOWN, buff=0.15)
        q = label("Could you pay it from your savings?", 46, GOLD).move_to([0, -2.4, 0])
        self.at(cue("imagine your car", K))
        self.P(FadeIn(tom, shift=DOWN * 0.2), FadeIn(car, shift=RIGHT * 0.5), rt=0.6)
        self.at(cue("breaks down", K))
        self.P(LaggedStart(*[FadeIn(s, scale=0.5) for s in smoke], lag_ratio=0.3), rt=0.6)
        self.at(cue("the repair costs", K))
        self.P(FadeIn(cost, scale=0.8), FadeIn(cl, shift=UP * 0.2), rt=0.6)
        self.at(cue("could you pay", K))
        self.P(FadeIn(q, shift=UP * 0.2), rt=0.5)

        self.at(cue("in a survey", K))
        self.clear(rt=0.35, heading_too=True)
        people = VGroup(*[person_icon(1.0, GREEN if i == 0 else GREY) for i in range(5)]).arrange(RIGHT, buff=0.55)
        people.move_to([0, 0.9, 0])
        src = body("JustMoney \"Money & Me 2026\" survey · 5,400+ responses · July–August 2026", 28, MUTED
                   ).move_to([0, 2.7, 0])
        res = VGroup(bold("FEWER THAN 1 IN 5", 110, GOLD),
                     label("could cover a R10 000 emergency from savings", 42, TEXT)).arrange(DOWN, buff=0.15)
        res.move_to([0, -2.0, 0])
        self.P(FadeIn(src), LaggedStart(*[FadeIn(p, shift=UP * 0.3) for p in people], lag_ratio=0.15), rt=1.0)
        self.at(cue("fewer than one", K))
        self.P(FadeIn(res[0], scale=0.85), Indicate(people[0], color=GREEN, scale_factor=1.15), rt=0.6)
        self.P(FadeIn(res[1], shift=UP * 0.2), rt=0.4)

        # title board
        self.at(cue("thats what an emergency", K))
        self.clear(rt=0.4, heading_too=True)
        r1 = flip_word("EMERGENCY", w=1.0, h=1.42, gap=0.09)
        r2 = flip_word("FUND", w=1.0, h=1.42, gap=0.09, color=GOLD)
        board = VGroup(r1, r2).arrange(DOWN, buff=0.22).move_to([0, 1.15, 0])
        sub = label("How to build one from zero  ·  South Africa 2026", 40, MUTED).next_to(board, DOWN, buff=0.4)
        self.add(*r1, *r2)
        self.P(flip_in(None, list(r1) + list(r2), rt=1.5, lag=0.05), rt=1.5)
        self.P(FadeIn(sub, shift=UP * 0.2), rt=0.5)
        chips = VGroup(pill("What it is", GREEN), pill("How big", GOLD), pill("Where to keep it", BLUE),
                       pill("Start with R200", GREEN)).arrange(RIGHT, buff=0.35).move_to([0, -2.75, 0])
        for chip, ph in zip(chips, ["what it is", "exactly how big", "where to keep it", "how to start with"]):
            self.at(cue(ph, K))
            self.P(FadeIn(chip, shift=UP * 0.2), rt=0.4)
        disc = body("General information, not financial advice.", 26, MUTED).move_to([0, -3.8, 0])
        self.P(FadeIn(disc), rt=0.3)

    # =====================================================================
    def ch1(self):
        K = "ch1_what"
        self.chapter_in(K, "WHAT IS AN EMERGENCY FUND?")
        d = VGroup(label("Money for one job only:", 44, TEXT), bold("SURPRISES", 96, GOLD)).arrange(RIGHT, buff=0.35)
        d.move_to([0, 1.4, 0])
        n1 = outline_pill("Not savings for a goal", MUTED, 32)
        n2 = outline_pill("Not an investment", MUTED, 32)
        n3 = outline_pill("Cash, there on your worst day", GREEN, 32)
        ns = VGroup(n1, n2, n3).arrange(RIGHT, buff=0.35).move_to([0, -0.3, 0])
        fit(ns, 15)
        self.at(cue("one job only", K))
        self.P(FadeIn(d[0], shift=RIGHT * 0.2), rt=0.4)
        self.at(cue("paying for surprises", K))
        self.P(FadeIn(d[1], scale=0.8), rt=0.4)
        self.at(cue("its not savings", K))
        self.P(FadeIn(n1, shift=UP * 0.2), rt=0.35)
        self.at(cue("not an investment", K))
        self.P(FadeIn(n2, shift=UP * 0.2), rt=0.35)
        self.at(cue("in cash on your", K))
        self.P(FadeIn(n3, shift=UP * 0.2), rt=0.35)

        # the 3-question test + the two columns
        self.at(cue("a real emergency", K))
        self.clear(rt=0.35)
        test = VGroup(*[outline_pill(s, GOLD, 30) for s in ("Not planned", "Can't ignore it", "Can't wait")]
                      ).arrange(RIGHT, buff=0.3).move_to([0, 2.15, 0])
        self.P(FadeIn(test[0], shift=UP * 0.2), rt=0.35)
        self.at(cue("that you cant ignore", K))
        self.P(FadeIn(test[1], shift=UP * 0.2), rt=0.35)
        self.at(cue("that cant wait", K))
        self.P(FadeIn(test[2], shift=UP * 0.2), rt=0.35)
        lh = label("EMERGENCY", 38, GREEN).move_to([-3.9, 1.25, 0])
        rh = label("NOT AN EMERGENCY", 38, RED).move_to([3.9, 1.25, 0])
        yes = [("Losing your job", "losing your job"), ("A medical bill", "a medical bill"),
               ("The car breaks down", "the car breaking"), ("The geyser bursts", "the geyser bursting"),
               ("A funeral in the family", "a funeral in")]
        no = [("A holiday", "a holiday"), ("A new phone", "a new phone"), ("A Black Friday deal", "a black friday")]
        self.P(FadeIn(lh), rt=0.3)
        for i, (t, ph) in enumerate(yes):
            g = self.row_card(tick_icon(s=0.3), t, -3.9, 0.4 - i * 0.92, 7.3, TEXT, 34, 0.78)
            self.at(cue(ph, K))
            self.P(FadeIn(g, shift=RIGHT * 0.2), rt=0.3)
        self.at(cue("what isnt an emergency", K))
        self.P(FadeIn(rh), rt=0.3)
        for i, (t, ph) in enumerate(no):
            g = self.row_card(cross_icon(s=0.2), t, 3.9, 0.4 - i * 0.92, 7.3, MUTED, 34, 0.78)
            self.at(cue(ph, K))
            self.P(FadeIn(g, shift=LEFT * 0.2), rt=0.3)
        dp = body("Save for these too, in a different pot", 30, GOLD).move_to([3.9, -2.4, 0])
        self.at(cue("in a different pot", K))
        self.P(FadeIn(dp), rt=0.3)

        # spare tyre
        self.at(cue("think of your emergency", K))
        self.clear(rt=0.35)
        ty = tyre_icon(1.7).move_to([-3.2, -0.4, 0])
        tl = VGroup(bold("A SPARE TYRE", 96, GOLD), body("You hope you never need it.", 40, TEXT),
                    body("When you do, you're glad it's there.", 40, GREEN)).arrange(DOWN, buff=0.25, aligned_edge=LEFT)
        tl.move_to([2.6, -0.4, 0])
        self.P(FadeIn(ty, scale=0.7), FadeIn(tl[0], shift=LEFT * 0.2), rt=0.6)
        self.P(Rotate(ty, -PI / 2), rt=0.6)
        self.at(cue("you hope you never", K))
        self.P(FadeIn(tl[1]), rt=0.35)
        self.at(cue("but when you do", K))
        self.P(FadeIn(tl[2]), rt=0.35)

    # =====================================================================
    def ch2(self):
        K = "ch2_why"
        self.chapter_in(K, "WHY IT MATTERS")
        lh = label("NO EMERGENCY FUND", 36, RED).move_to([0, 2.15, 0])
        steps = ["Surprise", "Borrow", "Interest every month", "Another loan"]
        nodes = []
        for i, s in enumerate(steps):
            col = GOLD if i == 0 else RED
            t = label(s, 32, col)
            b = RoundedRectangle(corner_radius=0.25, width=t.width + 0.6, height=1.05, color=col,
                                 stroke_width=4, fill_color=PANEL, fill_opacity=1)
            nodes.append(VGroup(b, t.move_to(b)))
        VGroup(*nodes).arrange(RIGHT, buff=0.85).move_to([0, 0.9, 0])
        fit(VGroup(*nodes), 15.2)
        arrows = [Arrow(nodes[i].get_right(), nodes[i + 1].get_left(), buff=0.12, color=MUTED, stroke_width=6,
                        max_tip_length_to_length_ratio=0.3) for i in range(3)]
        loop = CurvedArrow(nodes[3].get_bottom() + DOWN * 0.1, nodes[1].get_bottom() + DOWN * 0.1, angle=-PI / 3,
                           color=RED, stroke_width=6)
        lenders = body("Loan · credit card · store card · loan shark", 30, MUTED).move_to([0, -0.05, 0])
        self.at(cue("why does it matter", K))
        self.P(FadeIn(lh), rt=0.3)
        self.at(cue("when a surprise comes", K))
        self.P(FadeIn(nodes[0], scale=0.9), rt=0.35)
        self.at(cue("people borrow", K))
        self.P(GrowArrow(arrows[0]), FadeIn(nodes[1], shift=RIGHT * 0.2), rt=0.4)
        self.at(cue("a loan a credit", K))
        self.P(FadeIn(lenders), rt=0.3)
        self.at(cue("costs you interest", K))
        self.P(GrowArrow(arrows[1]), FadeIn(nodes[2], shift=RIGHT * 0.2), rt=0.4)
        self.at(cue("then another loan", K))
        self.P(GrowArrow(arrows[2]), FadeIn(nodes[3], shift=RIGHT * 0.2), rt=0.4)
        self.P(FadeOut(lenders), Create(loop), rt=0.7)

        # two-pot alternative
        self.at(cue("or people take money", K))
        self.clear(rt=0.35)
        top = label("Or a two-pot savings pot withdrawal", 40, TEXT).move_to([0, 2.15, 0])
        who = body("Example: earns R25 000 a month, under 65", 32, GOLD).move_to([0, 1.45, 0])

        def row(l, v, y, colr=TEXT):
            return VGroup(box(10.0, 0.95, 0, y, r=0.2),
                          label(l, 38, MUTED).move_to([-4.6, y, 0], aligned_edge=LEFT),
                          bold(v, 62, colr).move_to([4.6, y, 0], aligned_edge=RIGHT))
        r1 = row("You take", "R10 000", 0.45)
        r2 = row("Tax at 26%", "– R2 600", -0.65, RED)
        r3 = row("Your fund's admin fee", "– a fee", -1.75, RED)
        self.P(FadeIn(top), rt=0.35)
        self.at(cue("say you earn", K))
        self.P(FadeIn(who), rt=0.3)
        self.at(cue("from your savings pot", K))
        self.P(FadeIn(r1, shift=UP * 0.2), rt=0.4)
        self.at(cue("sars takes about", K))
        self.P(FadeIn(r2, shift=UP * 0.2), rt=0.4)
        self.at(cue("charges a fee", K))
        self.P(FadeIn(r3, shift=UP * 0.2), rt=0.4)

        self.at(cue("with an emergency fund", K))
        self.clear(rt=0.35)
        g = self.banner("With an emergency fund: you just pay", GREEN, 1.2, 46, tick_icon(s=0.4))
        chips = VGroup(pill("No interest", GREEN), pill("No tax", GREEN), pill("No stress", GREEN)
                       ).arrange(RIGHT, buff=0.4).move_to([0, -0.4, 0])
        refill = label("Then fill it up again", 40, GOLD).move_to([0, -2.0, 0])
        self.P(FadeIn(g, shift=UP * 0.2), rt=0.45)
        for c, ph in zip(chips, ["no interest", "no tax", "no stress"]):
            self.at(cue(ph, K))
            self.P(FadeIn(c, scale=0.8), rt=0.3)
        self.at(cue("fill it up", K))
        self.P(FadeIn(refill, shift=UP * 0.2), rt=0.35)

    # =====================================================================
    def ch3(self):
        K = "ch3_size"
        self.chapter_in(K, "HOW BIG SHOULD IT BE?")
        rule = VGroup(bold("3–6 MONTHS", 120, GOLD), label("of your ESSENTIAL expenses", 44, TEXT)
                      ).arrange(DOWN, buff=0.1).move_to([0, 1.3, 0])
        rot = body("A common rule of thumb", 30, MUTED).next_to(rule, DOWN, buff=0.2)
        self.at(cue("rule of thumb", K))
        self.P(FadeIn(rule[0], scale=0.85), FadeIn(rot), rt=0.5)
        self.P(FadeIn(rule[1]), rt=0.35)
        nots = outline_pill("Not your salary", RED, 30).move_to([0, -0.85, 0])
        self.at(cue("not your salary", K))
        self.P(FadeIn(nots, shift=UP * 0.2), rt=0.35)
        ess = [("Rent or bond", "rent or bond"), ("Food", "food"), ("Transport", "transport"),
               ("Electricity & water", "electricity and water"), ("Airtime & data", "airtime and data"),
               ("School fees", "school fees"), ("Minimum debt payments", "the minimum payments")]
        self.at(cue("your essentials", K))
        self.P(FadeOut(nots), rt=0.25)
        row1 = VGroup(*[pill(t, BLUE, 32) for t, _ in ess[:4]]).arrange(RIGHT, buff=0.3).move_to([0, -1.2, 0])
        row2 = VGroup(*[pill(t, BLUE, 32) for t, _ in ess[4:]]).arrange(RIGHT, buff=0.3).move_to([0, -2.15, 0])
        fit(row1, 15)
        fit(row2, 15)
        for c, (t, ph) in zip(list(row1) + list(row2), ess):
            self.at(cue(ph, K))
            self.P(FadeIn(c, shift=UP * 0.15), rt=0.25)
        tip = body("Tip: use 3 months of bank statements. Count only what you must pay, even in a bad month.", 28,
                   GOLD).move_to([0, -3.3, 0])
        fit(tip, 15)
        self.at(cue("to find your number", K))
        self.P(FadeIn(tip), rt=0.35)

        # Thandi
        self.at(cue("lets take thandi", K))
        self.clear(rt=0.35)
        th = VGroup(person_icon(0.9, GOLD), VGroup(label("Thandi", 44, GOLD),
                                                   body("Essentials: R10 000 a month", 36, TEXT)
                                                   ).arrange(DOWN, aligned_edge=LEFT, buff=0.1)).arrange(RIGHT, buff=0.4)
        th.move_to([0, 1.85, 0])
        self.P(FadeIn(th, shift=DOWN * 0.2), rt=0.4)
        blocks = VGroup(*[RoundedRectangle(corner_radius=0.12, width=2.0, height=1.0, stroke_width=0,
                                           fill_color=GREEN if i < 3 else BLUE, fill_opacity=1) for i in range(6)]
                        ).arrange(RIGHT, buff=0.15).move_to([0, 0.15, 0])
        mlab = VGroup(*[body(f"Month {i + 1}", 26, BG).move_to(b) for i, b in enumerate(blocks)])
        b3 = Brace(blocks[:3], DOWN, color=GREEN)
        t3 = bold("3 months = R30 000", 60, GREEN).next_to(b3, DOWN, buff=0.15)
        b6 = Brace(blocks, UP, color=BLUE).shift(UP * 0.0)
        t6 = bold("6 months = R60 000", 60, BLUE).move_to([0, -2.9, 0])
        self.at(cue("so three months", K))
        self.P(LaggedStart(*[FadeIn(b, shift=UP * 0.2) for b in blocks[:3]], lag_ratio=0.2), FadeIn(mlab[:3]), rt=0.6)
        self.P(GrowFromCenter(b3), FadeIn(t3), rt=0.4)
        self.at(cue("six months is", K))
        self.P(LaggedStart(*[FadeIn(b, shift=UP * 0.2) for b in blocks[3:]], lag_ratio=0.2), FadeIn(mlab[3:]), rt=0.6)
        self.P(FadeIn(t6, shift=UP * 0.2), rt=0.35)

        # three levels
        self.at(cue("if that sounds impossible", K))
        self.clear(rt=0.35)
        nb = label("Nobody starts there. Build it in 3 levels.", 40, TEXT).move_to([0, 2.15, 0])
        self.P(FadeIn(nb), rt=0.4)
        lv = [("LEVEL 1", "R2 000", "Starter fund", GREEN, "level one"),
              ("LEVEL 2", "R10 000", "1 month of essentials", GOLD, "level two"),
              ("LEVEL 3", "R30 000 – R60 000", "3 to 6 months", BLUE, "level three")]
        hs = [1.4, 2.3, 3.2]
        for i, (n, v, s, c, ph) in enumerate(lv):
            x = -5.0 + i * 5.0
            h = hs[i]
            step = RoundedRectangle(corner_radius=0.15, width=4.6, height=h, stroke_width=0, fill_color=c,
                                    fill_opacity=1).move_to([x, -3.4 + h / 2, 0])
            nt = bold(n, 40, BG).move_to(step.get_top() + DOWN * 0.4)
            vt = fit(bold(v, 64, c), 4.6).next_to(step, UP, buff=0.2)
            st = body(s, 30, TEXT).next_to(vt, UP, buff=0.1)
            self.at(cue(ph, K))
            self.P(GrowFromEdge(step, DOWN), FadeIn(nt), rt=0.4)
            self.P(FadeIn(vt, shift=UP * 0.15), FadeIn(st), rt=0.35)
        n6 = body("6 if your income goes up and down, or you support others", 26, MUTED)
        n3 = body("3 can be enough if your job is very stable", 26, MUTED)
        self.at(cue("aim for six", K))
        self.P(FadeOut(nb), rt=0.2)
        notes = VGroup(n6, n3).arrange(DOWN, buff=0.1).move_to([0, 2.15, 0])
        self.P(FadeIn(n6), rt=0.3)
        self.at(cue("three can be enough", K))
        self.P(FadeIn(n3), rt=0.3)

    # =====================================================================
    def ch4(self):
        K = "ch4_where"
        self.chapter_in(K, "WHERE TO KEEP IT")
        needs = [("SAFE", "safe", GREEN, "it must be safe"), ("EASY TO REACH", "within a few days", BLUE, "easy to reach"),
                 ("EARNS INTEREST", "so inflation doesn't eat it", GOLD, "earn some interest")]
        for i, (t, s, c, ph) in enumerate(needs):
            x = -5.1 + i * 5.1
            b = box(4.7, 2.4, x, 0.6, stroke=c, sw=5)
            tt = fit(bold(t, 64, c), 4.2).move_to([x, 0.95, 0])
            ss = body(s if i else "your money is protected", 30, MUTED).move_to([x, 0.1, 0])
            fit(ss, 4.2)
            self.at(cue(ph, K))
            self.P(FadeIn(VGroup(b, tt, ss), shift=UP * 0.2), rt=0.4)
        infl = self.banner("Inflation: 4.5% a year (CPI, September 2026, Stats SA)", GOLD, -2.0, 34)
        self.at(cue("inflation was", K))
        self.P(FadeIn(infl, shift=UP * 0.2), rt=0.4)

        # separate account + split
        self.at(cue("the simplest home", K))
        self.clear(rt=0.35)
        sa = self.banner("A separate savings account at a bank", GREEN, 2.05, 40, tick_icon(s=0.35))
        ev = body("Not your everyday account: too easy to spend", 32, RED).move_to([0, 1.15, 0])
        self.P(FadeIn(sa, shift=DOWN * 0.2), rt=0.4)
        self.at(cue("not your everyday", K))
        self.P(FadeIn(ev), rt=0.3)
        W = 13.0
        seg1 = RoundedRectangle(corner_radius=0.15, width=W / 3, height=1.3, stroke_width=0, fill_color=GREEN,
                                fill_opacity=1).move_to([-W / 2 + W / 6, -0.6, 0])
        seg2 = RoundedRectangle(corner_radius=0.15, width=2 * W / 3 - 0.1, height=1.3, stroke_width=0, fill_color=BLUE,
                                fill_opacity=1).move_to([W / 6 + 0.05, -0.6, 0])
        s1t = VGroup(bold("1 MONTH", 48, BG), body("instant access", 28, BG)).arrange(DOWN, buff=0.02).move_to(seg1)
        s2t = VGroup(bold("THE REST", 48, BG), body("notice account, e.g. 32 days", 28, BG)).arrange(DOWN, buff=0.02
                                                                                                  ).move_to(seg2)
        self.at(cue("once it grows", K))
        self.P(GrowFromEdge(seg1, LEFT), rt=0.4)
        self.at(cue("keep one month", K))
        self.P(FadeIn(s1t), rt=0.3)
        self.at(cue("put the rest", K))
        self.P(GrowFromEdge(seg2, LEFT), rt=0.5)
        self.P(FadeIn(s2t), rt=0.3)
        fx = VGroup(lock_icon(0.45, RED), label("Don't lock ALL of it in a fixed deposit", 34, RED)).arrange(RIGHT, buff=0.3)
        fx.move_to([0, -2.4, 0])
        self.at(cue("avoid locking all", K))
        self.P(FadeIn(fx, shift=UP * 0.2), rt=0.4)

        # CODI
        self.at(cue("the good news", K))
        self.clear(rt=0.35)
        sh = shield_icon(1.5).move_to([-5.0, 0.2, 0])
        c1 = VGroup(bold("UP TO R100 000", 92, GREEN), label("per person, at each bank", 40, TEXT)).arrange(
            DOWN, buff=0.1, aligned_edge=LEFT).move_to([1.4, 1.3, 0])
        c2 = body("Corporation for Deposit Insurance (CODI) · since April 2024 · free and automatic", 28, MUTED)
        fit(c2, 9.8).move_to([1.4, 0.0, 0])
        cov = VGroup(*[pill(t, GREEN, 30) for t in ("Savings", "Notice", "Fixed deposit")]).arrange(RIGHT, buff=0.3)
        cov.move_to([1.4, -1.0, 0])
        self.P(FadeIn(sh, scale=0.7), rt=0.4)
        self.at(cue("bank deposits are protected", K))
        self.P(Indicate(sh, color=GREEN), rt=0.4)
        self.at(cue("covers up to", K))
        self.P(FadeIn(c1, shift=LEFT * 0.2), FadeIn(c2), rt=0.5)
        self.at(cue("that includes savings", K))
        self.P(LaggedStart(*[FadeIn(c, scale=0.8) for c in cov], lag_ratio=0.25), rt=0.6)

        self.at(cue("heres a detail", K))
        self.clear(rt=0.35)

        def card(x, t1, t2, ok, tag, sub):
            col = GREEN if ok else GOLD
            b = box(7.2, 4.4, x, -0.2, stroke=col, sw=5)
            a = fit(label(t1, 44, TEXT), 6.5).move_to([x, 1.3, 0])
            bb = label(t2, 34, MUTED).move_to([x, 0.65, 0])
            ic = (tick_icon(s=0.55) if ok else cross_icon(GOLD, s=0.35)).move_to([x, -0.4, 0])
            tg = bold(tag, 52, col).move_to([x, -1.35, 0])
            sb = fit(body(sub, 28, MUTED), 6.6).move_to([x, -2.0, 0])
            return VGroup(b, a, bb, ic, tg, sb)
        k1 = card(-3.85, "Money market ACCOUNT", "at a bank = a bank deposit", True, "COVERED", "by CODI, up to R100 000")
        k2 = card(3.85, "Money market UNIT TRUST", "= an investment", False, "NOT COVERED",
                  "Usually low risk, but not guaranteed")
        self.at(cue("a money market account", K))
        self.P(FadeIn(k1, shift=UP * 0.2), rt=0.45)
        self.at(cue("a money market unit", K))
        self.P(FadeIn(k2, shift=UP * 0.2), rt=0.45)

        self.at(cue("and interest is good", K))
        self.clear(rt=0.35)
        ix = VGroup(label("Under 65? The first", 44, TEXT), bold("R23 800", 150, GREEN),
                    label("of interest each year is tax-free", 44, TEXT),
                    body("2026/27 tax year (R34 500 if you're 65 or older)", 28, MUTED)).arrange(DOWN, buff=0.2)
        ix.move_to([0, -0.3, 0])
        self.P(FadeIn(ix[0]), rt=0.3)
        self.at(cue("the first", K, after=self.t))
        self.P(FadeIn(ix[1], scale=0.8), rt=0.45)
        self.P(FadeIn(ix[2]), FadeIn(ix[3]), rt=0.35)

        self.at(cue("where shouldnt you", K))
        self.clear(rt=0.35)
        nh = label("WHERE NOT TO KEEP IT", 36, RED).move_to([0, 2.15, 0])
        bad = [("Under the mattress", "Can be stolen. Earns nothing.", "under the mattress"),
               ("In shares", "Can fall just when you need it", "in shares"),
               ("In your TFSA", "Withdraw, and that contribution space is gone forever", "not in your taxfree")]
        self.P(FadeIn(nh), rt=0.3)
        for i, (t, s, ph) in enumerate(bad):
            y = 1.1 - i * 1.45
            b = box(14.0, 1.25, 0, y, r=0.2)
            ic = cross_icon(s=0.25).move_to([-6.3, y, 0])
            tt = label(t, 42, TEXT).move_to([-5.6, y, 0], aligned_edge=LEFT)
            ss = fit(body(s, 32, MUTED), 7.2).move_to([6.6, y, 0], aligned_edge=RIGHT)
            self.at(cue(ph, K))
            self.P(FadeIn(VGroup(b, ic, tt), shift=RIGHT * 0.2), FadeIn(ss), rt=0.4)

    # =====================================================================
    def ch5(self):
        K = "ch5_example"
        self.chapter_in(K, "HOW FAST IT GROWS")
        il = body("Illustration only: the account pays 6% a year. Check your own bank's rate.", 30, GOLD
                  ).move_to([0, -3.75, 0])
        # simulate
        r = 0.06 / 12
        bal, pts = 0.0, [(0, 0.0)]
        for m in range(1, 37):
            bal = bal * (1 + r) + (200 if m <= 10 else 1000)
            pts.append((m, bal))
        ax = Axes(x_range=[0, 36, 6], y_range=[0, 32000, 8000], x_length=11.0, y_length=4.2,
                  axis_config={"color": MUTED, "stroke_width": 3, "include_tip": False},
                  ).move_to([0.6, -0.45, 0])
        xl = VGroup(*[body(f"{m}", 24, MUTED).next_to(ax.c2p(m, 0), DOWN, buff=0.15) for m in range(0, 37, 6)])
        xt = body("months", 24, MUTED).next_to(ax.c2p(36, 0), DOWN, buff=0.15).shift(RIGHT * 0.9)
        yl = VGroup(*[body(rands(v), 24, MUTED).next_to(ax.c2p(0, v), LEFT, buff=0.15) for v in (10000, 20000, 30000)])
        p1 = VMobject(color=GREEN, stroke_width=8).set_points_smoothly([ax.c2p(m, v) for m, v in pts[:11]])
        p2 = VMobject(color=GOLD, stroke_width=8).set_points_smoothly([ax.c2p(m, v) for m, v in pts[10:]])
        dot1 = Dot(ax.c2p(10, pts[10][1]), radius=0.12, color=GREEN)
        lab1 = VGroup(label("R200 a month", 30, GREEN), bold("10 months: ≈ R2 045", 44, GREEN),
                      body("Level 1 done", 28, TEXT)).arrange(DOWN, buff=0.05, aligned_edge=LEFT)
        lab1.move_to(ax.c2p(1, 13000), aligned_edge=LEFT)
        dot2 = Dot(ax.c2p(36, pts[36][1]), radius=0.12, color=GOLD)
        lab2 = VGroup(label("then R1 000 a month", 30, GOLD), bold("26 months later: R30 000+", 44, GOLD)
                      ).arrange(DOWN, buff=0.05, aligned_edge=RIGHT)
        lab2.move_to(ax.c2p(24, 30000), aligned_edge=RIGHT)
        self.at(cue("lets see how fast", K))
        self.P(Create(ax), FadeIn(xl), FadeIn(xt), FadeIn(yl), rt=0.7)
        self.at(cue("we'll say the account".replace("'", ""), K))
        self.P(FadeIn(il), rt=0.35)
        self.at(cue("thandi starts with", K))
        self.P(Create(p1), rt=1.4)
        self.at(cue("after 10 months", K) if True else 0)
        self.P(FadeIn(dot1, scale=0.5), FadeIn(lab1, shift=UP * 0.2), rt=0.45)
        self.at(cue("then she pushes", K))
        self.P(Create(p2), rt=2.2)
        self.at(cue("she passes", K))
        self.P(FadeIn(dot2, scale=0.5), FadeIn(lab2, shift=LEFT * 0.2), rt=0.45)
        three = self.banner("About 3 years, from zero, to 3 months of essentials", GREEN, -3.85, 30)
        self.at(cue("so in roughly three", K))
        self.P(FadeOut(il), FadeIn(three, shift=UP * 0.2), rt=0.4)

        self.at(cue("and her", K, after=self.t))
        self.clear(rt=0.35)
        a = VGroup(label("R30 000 earns about", 44, TEXT), bold("R1 850", 140, GOLD), label("a year in interest", 44, TEXT)
                   ).arrange(DOWN, buff=0.15).move_to([-3.6, 0.2, 0])
        lim = VGroup(label("Tax-free limit", 36, MUTED), bold("R23 800", 100, GREEN), label("→ no tax to pay", 36, GREEN)
                     ).arrange(DOWN, buff=0.15).move_to([4.2, 0.2, 0])
        self.P(FadeIn(a, shift=UP * 0.2), rt=0.5)
        self.at(cue("far below", K))
        self.P(FadeIn(lim, shift=LEFT * 0.2), rt=0.45)
        key = self.banner("The key: start, and never stop", GOLD, -2.6, 40)
        self.at(cue("the key is not", K))
        self.clear(rt=0.3)
        self.P(FadeIn(key.move_to([0, 0.7, 0]), scale=0.9), rt=0.45)
        yr = label("Start a year earlier = a year closer", 44, GREEN).move_to([0, -1.0, 0])
        self.at(cue("if thandi had started", K))
        self.P(FadeIn(yr, shift=UP * 0.2), rt=0.4)
        self.at(cue("thats why today", K))
        self.P(Indicate(yr, color=GOLD), rt=0.6)

    # =====================================================================
    def ch6(self):
        K = "ch6_find"
        self.chapter_in(K, "FINDING THE R200")
        specs = [("Pay yourself first", "Debit order for the day after payday", "first pay yourself"),
                 ("Check your statements", "3 months: unused subscriptions, bank fees, takeaways, small airtime bundles",
                  "second look at"),
                 ("Save the surprises", "Bonus, tax refund, stokvel payout, a gift: put part in the fund",
                  "third save the"),
                 ("Debt paid off?", "Keep paying the same amount, into your emergency fund", "fourth when you")]
        pos = [(-3.95, 0.95), (3.95, 0.95), (-3.95, -1.75), (3.95, -1.75)]
        for i, ((x, y), (t, s, ph)) in enumerate(zip(pos, specs)):
            b = box(7.6, 2.5, x, y)
            n = flip_tile(str(i + 1), 0.66, 0.92, GOLD).move_to([x - 3.0, y + 0.6, 0])
            tt = fit(label(t, 42), 5.6).move_to([x - 2.45, y + 0.6, 0], aligned_edge=LEFT)
            ss = self.para(s, 40, 28, MUTED, "left")
            fit(ss, 6.9).move_to([x - 3.45, y - 0.45, 0], aligned_edge=LEFT)
            self.at(cue(ph, K))
            self.P(FadeIn(VGroup(b, n, tt), shift=UP * 0.2), FadeIn(ss), rt=0.45)
        bf = self.banner("Black Friday: before you buy on credit, is your emergency fund there yet?", GOLD, -3.65, 30)
        self.at(cue("with black friday", K))
        self.P(FadeIn(bf, shift=UP * 0.2), rt=0.45)

    # =====================================================================
    def ch7(self):
        K = "ch7_traps"
        self.chapter_in(K, "THE 5 TRAPS")
        traps = [("Using it for non-emergencies", "Be honest with yourself", "trap one"),
                 ("Keeping it in your main account", "If you see it every day, you'll spend it", "trap two"),
                 ("Chasing high returns", "This money is for safety. Investing comes after.", "trap three"),
                 ("Not refilling it", "Rebuild it before you save for anything else", "trap four"),
                 ("Waiting until debt is paid off", "Build your starter R2 000 first", "trap five")]
        shown = []
        for i, (t, s, ph) in enumerate(traps):
            y = 1.95 - i * 1.17
            b = box(15.0, 1.02, 0, y, r=0.2)
            n = flip_tile(str(i + 1), 0.56, 0.8, RED).move_to([-6.9, y, 0])
            tt = fit(label(t, 36, TEXT), 6.9).move_to([-6.35, y, 0], aligned_edge=LEFT)
            ss = fit(body(s, 30, MUTED), 6.0).move_to([7.2, y, 0], aligned_edge=RIGHT)
            g = VGroup(b, n, tt, ss)
            self.at(cue(ph, K))
            anims = [FadeIn(g, shift=RIGHT * 0.2)] + [p[2].animate.set_color(MUTED) for p in shown]
            self.P(*anims, rt=0.4)
            shown.append(g)

    # =====================================================================
    def ch8(self):
        K = "ch8_how"
        self.chapter_in(K, "HOW TO START")
        steps = [("Add it up", "Your essential expenses for one month", "step one"),
                 ("Open an account", "A separate savings account. Check the fees.", "step two"),
                 ("Debit order", "The day after payday. Even R200.", "step three"),
                 ("Name it", "\"Emergency fund\"", "step four"),
                 ("Grow it", "R2 000, then 1 month, then 3 to 6 months", "step five"),
                 ("Check it", "Once a year, or when your costs change", "step six")]
        for i, (t, s, ph) in enumerate(steps):
            x = -5.1 + (i % 3) * 5.1
            y = 0.85 if i < 3 else -2.05
            b = box(4.8, 2.6, x, y)
            n = flip_tile(str(i + 1), 0.6, 0.85, GOLD).move_to([x - 1.65, y + 0.68, 0])
            tt = fit(label(t, 40), 3.1).move_to([x - 1.2, y + 0.68, 0], aligned_edge=LEFT)
            ss = fit(self.para(s, 24, 30, MUTED), 4.4).move_to([x, y - 0.45, 0])
            self.at(cue(ph, K))
            self.P(FadeIn(VGroup(b, n, tt, ss), shift=UP * 0.2), rt=0.4)

    # =====================================================================
    def ch9(self):
        K = "ch9_recap"
        self.chapter_in(K, "RECAP")
        items = [("Money for surprises only", "money for surprises"),
                 ("Aim for 3–6 months of essentials, start with R2 000", "aim for three"),
                 ("Separate bank account that earns interest", "keep it in a separate"),
                 ("Not in shares or your TFSA", "not in shares"),
                 ("Bank deposits covered up to R100 000 per bank", "bank deposits are covered"),
                 ("Start today with a debit order, even R200", "and start today")]
        for i, (txt, ph) in enumerate(items):
            y = 2.05 - i * 0.92
            g = VGroup(tick_icon(s=0.3).move_to([-6.0, y, 0]),
                       fit(label(txt, 40), 11.6).move_to([-5.4, y, 0], aligned_edge=LEFT))
            self.at(cue(ph, K))
            self.P(FadeIn(g, shift=RIGHT * 0.3), rt=0.35)
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
