"""Money From Zero — Main video 04: how Capitec became SA's biggest bank by clients, and what bank fees cost you."""
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


class MFZMain04(Scene):
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
    def src(self, txt, y=-3.95):
        return fit(body(txt, 24, MUTED), 15).move_to([0, y, 0])

    def bank_icon(self, s=1.0, col=GOLD):
        roof = Polygon([-1.1 * s, 0.55 * s, 0], [1.1 * s, 0.55 * s, 0], [0, 1.15 * s, 0], stroke_width=0,
                       fill_color=col, fill_opacity=1)
        cols = VGroup(*[Rectangle(width=0.22 * s, height=1.0 * s, stroke_width=0, fill_color=col, fill_opacity=1
                                  ).move_to([x * s, 0, 0]) for x in (-0.75, -0.25, 0.25, 0.75)])
        base = Rectangle(width=2.2 * s, height=0.22 * s, stroke_width=0, fill_color=col, fill_opacity=1
                         ).move_to([0, -0.62 * s, 0])
        return VGroup(roof, cols, base)

    def phone_icon(self, s=1.0, col=BLUE):
        b = RoundedRectangle(corner_radius=0.15 * s, width=0.9 * s, height=1.6 * s, color=col, stroke_width=8 * s,
                             fill_color=PANEL, fill_opacity=1)
        scr = RoundedRectangle(corner_radius=0.06 * s, width=0.66 * s, height=1.1 * s, stroke_width=0,
                               fill_color=col, fill_opacity=0.35).move_to(b).shift(UP * 0.08 * s)
        dot = Dot(radius=0.05 * s, color=col).move_to(b.get_bottom() + UP * 0.16 * s)
        return VGroup(b, scr, dot)

    def money_row(self, item, calc, amt, y, col=TEXT, acol=GOLD):
        a = fit(label(item, 36, col), 6.3).move_to([-7.0, y, 0], aligned_edge=LEFT)
        b = fit(body(calc, 32, MUTED), 3.8).move_to([1.4, y, 0])
        c = bold(amt, 52, acol).move_to([6.9, y, 0], aligned_edge=RIGHT)
        ln = Line([-7.1, y - 0.36, 0], [7.1, y - 0.36, 0], color=STROKE, stroke_width=2)
        return VGroup(a, b, c, ln)

    # =====================================================================
    def cold_open(self):
        K = "cold_open"
        y03 = outline_pill("2003", MUTED, 36).move_to([-4.6, 2.3, 0])
        n03 = bold("25 000", 130, TEXT).move_to([-4.6, 0.7, 0])
        l03 = label("clients", 40, MUTED).next_to(n03, DOWN, buff=0.1)
        st = body("a small bank from Stellenbosch", 30, MUTED).next_to(l03, DOWN, buff=0.15)
        ytd = outline_pill("TODAY", GOLD, 36).move_to([3.6, 2.3, 0])
        ntd = bold("26.6 MILLION", 130, GOLD).move_to([3.6, 0.7, 0])
        fit(ntd, 7.6)
        ltd = label("clients", 40, MUTED).next_to(ntd, DOWN, buff=0.1)
        arrow = Arrow([-1.9, 0.7, 0], [-0.6, 0.7, 0], color=GREEN, stroke_width=10, buff=0)
        self.at(cue("in 2003 a small", K))
        self.P(FadeIn(y03, shift=DOWN * 0.2), rt=0.4)
        self.at(cue("about 25000 clients", K))
        self.P(FadeIn(n03, scale=0.85), FadeIn(l03), FadeIn(st), rt=0.6)
        self.at(cue("today it has", K))
        self.P(GrowArrow(arrow), FadeIn(ytd, shift=DOWN * 0.2), rt=0.4)
        self.P(FadeIn(ntd, scale=0.8), FadeIn(ltd), rt=0.6)

        # bar comparison
        self.at(cue("thats more than any", K))
        self.clear(rt=0.35, heading_too=True)
        t = label("Clients, largest South African banks", 40, TEXT).move_to([0, 2.5, 0])
        b1 = Rectangle(width=11.0, height=1.1, stroke_width=0, fill_color=GOLD, fill_opacity=1)
        b2 = Rectangle(width=11.0 * 13.1 / 25.8, height=1.1, stroke_width=0, fill_color=GREY, fill_opacity=1)
        b1.move_to([-4.5, 0.9, 0], aligned_edge=LEFT)
        b2.move_to([-4.5, -0.8, 0], aligned_edge=LEFT)
        n1 = label("Capitec", 40, GOLD).next_to(b1, LEFT, buff=0.3)
        n2 = fit(label("Next biggest", 36, MUTED), 2.6).next_to(b2, LEFT, buff=0.3)
        v1 = bold("25.8 million", 56, BG).move_to(b1.get_right() + LEFT * 1.9)
        v2 = bold("13.1 million", 56, TEXT).next_to(b2, RIGHT, buff=0.3)
        x2 = pill("ABOUT 2x", GREEN, 40).move_to([4.6, -2.3, 0])
        s = self.src("Each bank at its latest reporting period. Source: BusinessTech, 22 Sep 2026. Capitec: 26.6 million by Aug 2026")
        self.P(FadeIn(t), FadeIn(n1), GrowFromEdge(b1, LEFT), rt=0.8)
        self.P(FadeIn(v1), FadeIn(s), rt=0.3)
        self.at(cue("about twice as many", K))
        self.P(FadeIn(n2), GrowFromEdge(b2, LEFT), rt=0.6)
        self.P(FadeIn(v2), FadeIn(x2, scale=0.8), rt=0.4)

        # title board
        self.at(cue("that bank is capitec", K))
        self.clear(rt=0.35, heading_too=True)
        r1 = flip_word("CAPITEC", w=1.0, h=1.42, gap=0.09, color=GOLD)
        board = VGroup(r1).move_to([0, 1.5, 0])
        self.add(*r1)
        self.P(flip_in(None, list(r1), rt=1.2, lag=0.06), rt=1.2)
        sub = label("From small lender to South Africa's biggest bank by clients", 40, TEXT).next_to(board, DOWN, buff=0.45)
        fit(sub, 15)
        self.at(cue("it started as a small", K))
        self.P(FadeIn(sub, shift=UP * 0.2), rt=0.5)
        q = bold("So how did it win?", 64, GREEN).move_to([0, -1.2, 0])
        self.at(cue("so how did it win", K))
        self.P(FadeIn(q, scale=0.85), rt=0.4)
        chips = VGroup(pill("The story", GOLD), pill("What it did differently", GREEN),
                       pill("What YOUR bank costs you", BLUE)).arrange(RIGHT, buff=0.35).move_to([0, -2.6, 0])
        fit(chips, 15)
        self.at(cue("in this video", K))
        self.P(FadeOut(q), rt=0.25)
        for chip, ph in zip(chips, ["the story in plain", "what it actually did", "the lesson for your"]):
            self.at(cue(ph, K))
            self.P(FadeIn(chip, shift=UP * 0.2), rt=0.35)
        disc = body("General information, not financial advice. Not a recommendation of any bank.", 26, MUTED
                    ).move_to([0, -3.75, 0])
        self.P(FadeIn(disc), rt=0.3)

    # =====================================================================
    def ch1(self):
        K = "ch1_start"
        self.chapter_in(K, "HOW IT STARTED")
        yr = flip_word("2000", w=0.9, h=1.25, gap=0.08, color=GOLD).move_to([-4.8, 1.3, 0])
        psg = VGroup(bold("PSG", 96, TEXT), body("founded by Jannie Mouton", 32, MUTED)).arrange(DOWN, buff=0.25)
        psg.move_to([1.6, 1.55, 0])
        self.at(cue("our story starts", K))
        self.add(*yr)
        self.P(flip_in(None, list(yr), rt=0.7, lag=0.08), rt=0.7)
        self.at(cue("a company called psg", K))
        self.P(FadeIn(psg, shift=LEFT * 0.3), rt=0.5)
        ml = VGroup(label("Microlending", 44, GOLD), body("small, short loans to ordinary people", 32, TEXT)
                    ).arrange(DOWN, buff=0.12).move_to([-3.6, -1.0, 0])
        self.at(cue("psg owned a microlending", K))
        self.P(FadeIn(ml, shift=UP * 0.2), rt=0.5)
        # 68 branch dots
        dots = VGroup(*[Square(0.2, stroke_width=0, fill_color=GREEN, fill_opacity=1) for _ in range(68)])
        dots.arrange_in_grid(rows=4, cols=17, buff=0.1).move_to([3.4, -1.25, 0])
        names = VGroup(outline_pill("SmartFin", BLUE, 30), outline_pill("FinAid", BLUE, 30)
                       ).arrange(RIGHT, buff=0.3).move_to([3.4, -0.1, 0])
        nl = label("68 small branches", 36, TEXT).move_to([3.4, -2.35, 0])
        self.at(cue("it had bought two", K))
        self.P(FadeIn(names, shift=DOWN * 0.2), rt=0.4)
        self.at(cue("with 68 small", K))
        self.P(LaggedStart(*[FadeIn(d, scale=0.3) for d in dots], lag_ratio=0.02), FadeIn(nl), rt=1.0)

        # people
        self.at(cue("then psg decided", K))
        self.clear(rt=0.35)
        arrow_t = VGroup(label("Microlender", 44, MUTED), Arrow(LEFT, RIGHT, color=GOLD, stroke_width=8),
                         label("Bank", 52, GOLD)).arrange(RIGHT, buff=0.3).move_to([0, 1.9, 0])
        self.P(FadeIn(arrow_t, shift=UP * 0.2), rt=0.5)
        ppl = [("Michiel le Roux", "first chief executive", "michiel le roux"),
               ("Riaan Stassen", "experienced banker", "including riaan stassen"),
               ("Gerrie Fourie", "later ran the whole company", "a banker called gerrie")]
        for i, (n, r, ph) in enumerate(ppl):
            x = -5.0 + i * 5.0
            b = box(4.6, 2.9, x, -0.75)
            ic = person_icon(0.62, GOLD if i == 0 else BLUE).move_to([x, -0.15, 0])
            nm = fit(label(n, 36, TEXT), 4.2).move_to([x, -1.2, 0])
            rl = fit(body(r, 28, MUTED), 4.2).move_to([x, -1.75, 0])
            self.at(cue(ph, K))
            self.P(FadeIn(VGroup(b, ic, nm, rl), shift=UP * 0.2), rt=0.45)
        s = self.src("Founders as listed by Wikipedia and BusinessTech (21 Jul 2025)")
        self.P(FadeIn(s), rt=0.3)

        # founded
        self.at(cue("on the first of march", K))
        self.clear(rt=0.35)
        d = flip_word("1 MARCH 2001", w=0.85, h=1.2, gap=0.07, color=GOLD).move_to([0, 1.3, 0])
        self.add(*d)
        self.P(flip_in(None, list(d), rt=1.0, lag=0.05), rt=1.0)
        loc = VGroup(self.bank_icon(0.55, GREEN), label("Capitec is founded in Stellenbosch", 44, TEXT)
                     ).arrange(RIGHT, buff=0.35).move_to([0, -0.4, 0])
        self.at(cue("capitec was founded", K))
        self.P(FadeIn(loc, shift=UP * 0.2), rt=0.5)
        l1 = outline_pill("Lend people money", MUTED, 34).move_to([-4.6, -2.3, 0])
        l2 = outline_pill("Hold their salary, every month", GREEN, 34)
        l2.move_to([-0.6 + l2.width / 2, -2.3, 0])
        ar = Arrow([-1.85, -2.3, 0], [-0.85, -2.3, 0], color=GOLD, stroke_width=8, buff=0)
        self.at(cue("lending people money", K))
        self.P(FadeIn(l1, shift=UP * 0.2), rt=0.4)
        self.at(cue("asking them to trust", K))
        self.P(GrowArrow(ar), FadeIn(l2, shift=UP * 0.2), rt=0.5)

    # =====================================================================
    def ch2(self):
        K = "ch2_bet"
        self.chapter_in(K, "WHO WAS IT FOR?")
        lb = box(6.8, 3.6, -3.7, 0.1)
        rb = box(6.8, 3.6, 3.7, 0.1, stroke=GREEN, sw=4)
        lt = VGroup(label("The big banks", 44, MUTED), body("already had the", 34, MUTED),
                    body("wealthier clients", 34, MUTED)).arrange(DOWN, buff=0.18).move_to([-3.7, 0.1, 0])
        rt_ = VGroup(label("Capitec", 44, GREEN), body("lower-income workers", 34, TEXT),
                     body("people with no bank account", 34, TEXT)).arrange(DOWN, buff=0.18).move_to([3.7, 0.1, 0])
        self.at(cue("the big banks already", K))
        self.P(FadeIn(lb), FadeIn(lt, shift=UP * 0.2), rt=0.5)
        self.at(cue("so capitec went after", K))
        self.P(FadeIn(rb), FadeIn(rt_[0], shift=UP * 0.2), rt=0.4)
        self.at(cue("lowerincome workers", K))
        self.P(FadeIn(rt_[1]), rt=0.3)
        self.at(cue("never had a bank", K))
        self.P(FadeIn(rt_[2]), rt=0.3)

        # the idea
        self.at(cue("capitec describes its", K))
        self.clear(rt=0.35)
        qt = VGroup(body("“Banking should be", 48, TEXT), bold("SIMPLE, TRANSPARENT AND AFFORDABLE”", 72, GOLD)
                    ).arrange(DOWN, buff=0.2).move_to([0, 1.3, 0])
        fit(qt, 15)
        qs = body("Capitec, annual results release, 22 April 2026", 26, MUTED).next_to(qt, DOWN, buff=0.2)
        self.P(FadeIn(qt[0]), rt=0.4)
        self.at(cue("banking should be simple", K))
        self.P(FadeIn(qt[1], shift=UP * 0.2), FadeIn(qs), rt=0.6)
        cards = [("SIMPLE", "One main account", "simple means one"),
                 ("TRANSPARENT", "You can see what you pay", "transparent means you"),
                 ("AFFORDABLE", "Low fees", "and affordable means")]
        for i, (h, t, ph) in enumerate(cards):
            x = -5.0 + i * 5.0
            g = VGroup(box(4.6, 1.9, x, -1.55), label(h, 40, GREEN).move_to([x, -1.1, 0]),
                       fit(body(t, 32, TEXT), 4.2).move_to([x, -1.85, 0]))
            self.at(cue(ph, K))
            self.P(FadeIn(g, shift=UP * 0.2), rt=0.4)
            if i == 2:
                self.cards_af = g
        fee = VGroup(body("Monthly account fee (2026):", 32, MUTED), bold("R7.50", 60, GOLD)).arrange(RIGHT, buff=0.3)
        fee.move_to([0, -3.45, 0])
        self.at(cue("monthly account fee", K))
        self.P(FadeIn(fee, shift=UP * 0.2), rt=0.4)

        # the bet
        self.at(cue("it sounds obvious", K))
        self.clear(rt=0.35)
        bet = bold("A BIG BET", 110, GOLD).move_to([0, 1.5, 0])
        self.P(FadeIn(bet, scale=0.85), rt=0.5)
        eq = VGroup(label("A few rand", 52, TEXT), bold("×", 72, MUTED), label("millions of clients", 52, GREEN),
                    bold("=", 72, MUTED), label("real money", 52, GOLD)).arrange(RIGHT, buff=0.35).move_to([0, -0.8, 0])
        fit(eq, 15)
        self.at(cue("when each client", K))
        self.P(FadeIn(eq[0], shift=UP * 0.2), rt=0.4)
        self.at(cue("a huge number", K))
        self.P(FadeIn(eq[1]), FadeIn(eq[2], shift=UP * 0.2), rt=0.4)
        self.P(FadeIn(eq[3]), FadeIn(eq[4], scale=0.8), rt=0.4)

    # =====================================================================
    def ch3(self):
        K = "ch3_growth"
        self.chapter_in(K, "THE GROWTH")
        ax_y = -2.9
        base = Line([-6.5, ax_y, 0], [6.5, ax_y, 0], color=STROKE, stroke_width=4)
        data = [("2003", 0.025, "25 000", "from about 25000"), ("Feb 2025", 24.1, "24.1 million", "grew to 241 million"),
                ("Aug 2026", 26.6, "26.6 million", "and to 266 million")]
        self.P(Create(base), rt=0.4)
        hmax = 4.5
        bars = []
        for i, (yl, v, lab, ph) in enumerate(data):
            x = -4.2 + i * 4.2
            h = max(0.06, hmax * v / 26.6)
            b = Rectangle(width=2.4, height=h, stroke_width=0, fill_color=GOLD if i == 2 else (GREEN if i == 1 else GREY),
                          fill_opacity=1).move_to([x, ax_y + h / 2, 0])
            xl = label(yl, 34, MUTED).move_to([x, ax_y - 0.45, 0])
            vl = bold(lab, 48, TEXT).next_to(b, UP, buff=0.15)
            try:
                t = cue(ph, K)
            except ValueError:
                t = None
            if t is not None:
                self.at(t)
            self.P(GrowFromEdge(b, DOWN), FadeIn(xl), FadeIn(vl), rt=0.6)
            bars.append(b)
        badge = pill("MORE THAN 1 000x", GREEN, 40).move_to([-4.3, -0.7, 0])
        self.at(cue("more than a thousand", K))
        self.P(FadeIn(badge, scale=0.8), rt=0.4)

        # branches
        self.at(cue("branches grew from", K))
        self.clear(rt=0.35)
        bt = label("Branches", 48, TEXT).move_to([0, 2.0, 0])
        a = flip_word("266", w=1.0, h=1.4, gap=0.08).move_to([-3.4, 0.2, 0])
        b = flip_word("885", w=1.0, h=1.4, gap=0.08, color=GOLD).move_to([3.4, 0.2, 0])
        ar = Arrow([-1.6, 0.2, 0], [1.6, 0.2, 0], color=GREEN, stroke_width=10, buff=0)
        la = label("2003", 34, MUTED).next_to(a, DOWN, buff=0.3)
        lb = label("latest full year", 34, MUTED).next_to(b, DOWN, buff=0.3)
        self.add(*a)
        self.P(FadeIn(bt), flip_in(None, list(a), rt=0.6, lag=0.08), FadeIn(la), rt=0.6)
        self.at(cue("to 885", K) if self._has("to 885", K) else self.t + 0.6)
        self.add(*b)
        self.P(GrowArrow(ar), flip_in(None, list(b), rt=0.6, lag=0.08), FadeIn(lb), rt=0.6)
        s = self.src("Sources: BusinessTech (21 Jul 2025; 22 Sep 2026)")
        self.P(FadeIn(s), rt=0.3)

        # profit
        self.at(cue("and profit followed", K))
        self.clear(rt=0.35)
        pt = VGroup(label("Headline earnings", 48, TEXT), body("a main measure of profit", 32, MUTED)
                    ).arrange(DOWN, buff=0.1).move_to([0, 2.0, 0])
        self.P(FadeIn(pt), rt=0.4)
        rows = [("2003", "R30 million", MUTED, "were 30 million"),
                ("Year to Feb 2026", "R16.8 billion", GOLD, "in the year to"),
                ("6 months to Aug 2026", "R9.5 billion  (+19%)", GREEN, "and in just the")]
        for i, (p, v, col, ph) in enumerate(rows):
            y = 0.55 - i * 1.25
            g = VGroup(box(13.4, 1.05, 0, y, r=0.2),
                       fit(label(p, 38, TEXT), 5.5).move_to([-6.3, y, 0], aligned_edge=LEFT),
                       bold(v, 60, col).move_to([6.3, y, 0], aligned_edge=RIGHT))
            self.at(cue(ph, K))
            self.P(FadeIn(g, shift=RIGHT * 0.2), rt=0.45)
        s = self.src("Sources: BusinessTech (21 Jul 2025); Capitec results, 22 Apr 2026; interim results, 30 Sep 2026")
        self.P(FadeIn(s), rt=0.3)

        # CEO handover
        self.at(cue("the founders stepped back", K))
        self.clear(rt=0.35)
        p1 = VGroup(person_icon(1.0, GREY), label("Gerrie Fourie", 40, TEXT), body("last founder running it day to day", 28, MUTED),
                    body("retired July 2025", 30, MUTED)).arrange(DOWN, buff=0.15).move_to([-3.8, -0.2, 0])
        p2 = VGroup(person_icon(1.0, GOLD), label("Graham Lee", 40, GOLD), body("chief executive", 28, MUTED),
                    body("from 19 July 2025", 30, MUTED)).arrange(DOWN, buff=0.15).move_to([3.8, -0.2, 0])
        ar = Arrow([-1.0, 0.3, 0], [1.0, 0.3, 0], color=GOLD, stroke_width=10, buff=0)
        self.at(cue("gerrie fourie the last", K))
        self.P(FadeIn(p1, shift=UP * 0.2), rt=0.5)
        self.at(cue("graham lee", K))
        self.P(GrowArrow(ar), FadeIn(p2, shift=UP * 0.2), rt=0.5)

    def _has(self, ph, K):
        try:
            cue(ph, K)
            return True
        except ValueError:
            return False

    # =====================================================================
    def ch4(self):
        K = "ch4_money"
        self.chapter_in(K, "HOW DOES IT MAKE MONEY?")
        items = [("1", "Loans", "The interest you pay is the bank's income", "first loans"),
                 ("2", "Your deposits", "Pays you a little, lends it out at more", "second the money"),
                 ("3", "Fees", "A few rand × millions of clients", "third fees"),
                 ("4", "New businesses", "Capitec Connect · 16.5 million app users", "fourth new businesses")]
        for i, (n, t, s_, ph) in enumerate(items):
            x = -3.75 if i % 2 == 0 else 3.75
            y = 1.05 if i < 2 else -1.55
            b = box(7.1, 2.25, x, y)
            nt = flip_tile(n, 0.6, 0.85, GOLD).move_to([x - 2.95, y + 0.45, 0])
            tt = fit(label(t, 44), 5.2).move_to([x - 2.4, y + 0.45, 0], aligned_edge=LEFT)
            ss = fit(body(s_, 30, MUTED), 6.5).move_to([x, y - 0.5, 0])
            self.at(cue(ph, K))
            self.P(FadeIn(VGroup(b, nt, tt, ss), shift=UP * 0.2), rt=0.45)
            if i == 0:
                self.at(cue("your loan is their", K))
                hl = label("Your loan = their income", 30, RED).next_to(b, DOWN, buff=0.08)
                self.P(Indicate(tt, color=RED), rt=0.5)
        s = self.src("App users: Capitec interim results, 6 months to 31 Aug 2026 (via Bizcommunity, 30 Sep 2026)")
        self.P(FadeIn(s), rt=0.3)

        # deposits mini diagram is inside card 2; now: 3 things that stand out
        self.at(cue("three things stand out", K))
        self.clear(rt=0.35)
        t = label("3 things stand out", 52, GOLD).move_to([0, 1.75, 0])
        self.P(FadeIn(t), rt=0.4)
        rows = [(person_icon(0.4, GREEN), "It served people others overlooked", "it served people"),
                (coin(0.3), "It kept prices simple", "it kept prices"),
                (self.phone_icon(0.45), "It pushed hard into the app", "it pushed hard")]
        for i, (ic, txt, ph) in enumerate(rows):
            g = self.row_card(ic, txt, 0, 0.55 - i * 1.15, 12.0, TEXT, 40, 0.95)
            self.at(cue(ph, K))
            self.P(FadeIn(g, shift=RIGHT * 0.2), rt=0.4)
        note = self.banner("Not a recommendation to bank with Capitec, or anyone else", MUTED, -3.0, 34)
        self.at(cue("quick note", K))
        self.P(FadeIn(note, shift=UP * 0.2), rt=0.4)

    # =====================================================================
    def ch5(self):
        K = "ch5_lesson"
        self.chapter_in(K, "YOUR BANK FEES")
        big = VGroup(label("Your bank fees are", 48, TEXT), bold("NOT JUST THE MONTHLY FEE", 80, GOLD)
                     ).arrange(DOWN, buff=0.2).move_to([0, 0.6, 0])
        fit(big, 15)
        self.at(cue("your bank fees are", K))
        self.P(FadeIn(big[0]), rt=0.3)
        self.P(FadeIn(big[1], scale=0.85), rt=0.5)

        self.at(cue("every bank charges", K))
        self.clear(rt=0.35)
        eq = VGroup(outline_pill("Monthly fee", GOLD, 40, 1.0), bold("+", 80, MUTED),
                    outline_pill("A price for each thing you do", GREEN, 40, 1.0)).arrange(RIGHT, buff=0.35)
        eq.move_to([0, 1.7, 0])
        fit(eq, 15)
        self.P(FadeIn(eq[0], shift=UP * 0.2), rt=0.4)
        self.at(cue("and then a price", K))
        self.P(FadeIn(eq[1]), FadeIn(eq[2], shift=UP * 0.2), rt=0.4)
        acts = [("Debit order", "a debit order"), ("Drawing cash", "drawing cash"),
                ("Paying someone", "paying someone"), ("Instant payment", "an instant payment")]
        for i, (t, ph) in enumerate(acts):
            x = -5.4 + i * 3.6
            g = VGroup(box(3.3, 1.2, x, -0.2, stroke=GREEN, sw=3), fit(label(t, 30, TEXT), 2.8).move_to([x, -0.2, 0]))
            self.at(cue(ph, K))
            self.P(FadeIn(g, shift=UP * 0.2), rt=0.3)
        warn = body("Compare by the monthly fee alone, and you lose more on the small things", 34, RED).move_to([0, -2.1, 0])
        fit(warn, 15)
        self.at(cue("many people compare", K))
        self.P(FadeIn(warn, shift=UP * 0.2), rt=0.4)

        # prepaid phone analogy
        self.at(cue("think of a prepaid", K))
        self.clear(rt=0.35)
        ph = self.phone_icon(1.6, BLUE).move_to([-4.3, -0.2, 0])
        l1 = VGroup(label("Price per minute:", 44, TEXT), bold("small", 64, GREEN)).arrange(RIGHT, buff=0.3)
        l2 = VGroup(label("Your bill:", 44, TEXT), bold("depends on use", 64, GOLD)).arrange(RIGHT, buff=0.3)
        l3 = bold("Banking works the same way", 64, TEXT)
        g = VGroup(l1, l2, l3).arrange(DOWN, buff=0.45, aligned_edge=LEFT).move_to([2.2, -0.2, 0])
        fit(g, 9.6)
        self.P(FadeIn(ph, scale=0.8), FadeIn(l1, shift=LEFT * 0.2), rt=0.5)
        self.at(cue("but your bill", K))
        self.P(FadeIn(l2, shift=LEFT * 0.2), rt=0.4)
        self.at(cue("banking works the same", K))
        self.P(FadeIn(l3, shift=LEFT * 0.2), rt=0.4)
        tr = self.banner("What you pay depends on HOW you bank", GOLD, -3.2, 38)
        self.at(cue("what you pay depends", K))
        self.P(FadeIn(tr, shift=UP * 0.2), rt=0.4)

    # =====================================================================
    def ch6(self):
        K = "ch6_example"
        self.chapter_in(K, "A MONTH OF FEES")
        ic = person_icon(1.1, GOLD).move_to([-4.8, 0.2, 0])
        nm = label("Lerato", 56, GOLD).next_to(ic, DOWN, buff=0.25)
        info = VGroup(label("Prices: Capitec, 2026 (from 1 March 2026)", 40, TEXT),
                      body("used because they're published and easy to follow", 32, MUTED),
                      body("Your bank's prices will be different", 32, RED)).arrange(DOWN, buff=0.25, aligned_edge=LEFT)
        info.move_to([1.8, 0.2, 0])
        fit(info, 9.5)
        self.at(cue("lets take lerato", K))
        self.P(FadeIn(ic, shift=UP * 0.2), FadeIn(nm), rt=0.5)
        self.at(cue("well use capitecs", K))
        self.P(FadeIn(info[0]), FadeIn(info[1]), rt=0.4)
        self.at(cue("your banks prices", K))
        self.P(FadeIn(info[2]), rt=0.3)

        # the table
        self.at(cue("leratos month looks", K))
        self.clear(rt=0.35)
        rows = [("Monthly fee", "", "R7.50", "the monthly fee"),
                ("4 debit orders", "4 × R3", "R12", "four debit orders"),
                ("R2 000 cash at an ATM", "R10 per R1 000", "R20", "she draws"),
                ("5 payments, same bank", "5 × R1", "R5", "she pays friends"),
                ("2 normal payments, other banks", "2 × R2", "R4", "two normal payments"),
                ("2 immediate payments", "2 × R6", "R12", "and two immediate")]
        self.tab = []
        for i, (a, b, c, ph) in enumerate(rows):
            y = 1.95 - i * 0.8
            r = self.money_row(a, b, c, y)
            self.at(cue(ph, K))
            self.P(FadeIn(r, shift=RIGHT * 0.2), rt=0.35)
            self.tab.append(r)
        tot = VGroup(label("Total", 44, TEXT).move_to([-7.0, -2.95, 0], aligned_edge=LEFT),
                     bold("R60.50 a month", 64, RED).move_to([6.9, -2.95, 0], aligned_edge=RIGHT))
        yr = bold("= R726 a year", 48, RED).move_to([6.9, -3.8, 0], aligned_edge=RIGHT)
        self.at(cue("add it up", K))
        self.P(FadeIn(tot, shift=UP * 0.2), rt=0.45)
        self.at(cue("thats 726 rand a year", K) if self._has("thats 726 rand a year", K) else self.t + 0.8)
        self.P(FadeIn(yr, shift=UP * 0.2), rt=0.4)

        # two habits
        self.at(cue("now lerato changes", K))
        self.clear(rt=0.35)
        h = label("Two habits change", 48, GOLD).move_to([0, 1.95, 0])
        self.P(FadeIn(h), rt=0.35)
        h1 = self.row_card(tick_icon(s=0.3), "Pay by card in shops (card purchases are free), not cash", 0, 0.9, 14.0, TEXT, 36)
        h2 = self.row_card(tick_icon(s=0.3), "Normal payments instead of immediate ones", 0, -0.25, 14.0, TEXT, 36)
        self.at(cue("she pays with her card", K))
        self.P(FadeIn(h1, shift=RIGHT * 0.2), rt=0.4)
        self.at(cue("and she pays people", K))
        self.P(FadeIn(h2, shift=RIGHT * 0.2), rt=0.4)
        before = VGroup(label("Before", 36, MUTED), bold("R60.50", 72, RED), body("R726 a year", 32, MUTED)
                        ).arrange(DOWN, buff=0.1).move_to([-4.6, -2.3, 0])
        after = VGroup(label("After", 36, MUTED), bold("R32.50", 72, GREEN), body("R390 a year", 32, MUTED)
                       ).arrange(DOWN, buff=0.1).move_to([0, -2.3, 0])
        ar = Arrow([-2.9, -2.1, 0], [-1.6, -2.1, 0], color=GOLD, stroke_width=8, buff=0)
        self.at(cue("her new total", K))
        self.P(FadeIn(before), GrowArrow(ar), FadeIn(after, shift=LEFT * 0.2), rt=0.5)
        sv = VGroup(label("She saves", 36, TEXT), bold("R336", 96, GOLD), label("a year", 36, TEXT)).arrange(DOWN, buff=0.08)
        sv.move_to([4.9, -2.25, 0])
        sb = SurroundingRectangle(sv, color=GOLD, buff=0.25, corner_radius=0.2, stroke_width=4)
        self.at(cue("same bank same life", K))
        self.P(FadeIn(sv, scale=0.85), Create(sb), rt=0.6)

        self.at(cue("and remember those are", K))
        self.clear(rt=0.35)
        m = VGroup(bold("Those are LOW fees.", 72, TEXT),
                   body("At a bank that charges more per transaction,", 40, MUTED),
                   body("the same habits can cost you a lot more.", 40, RED)).arrange(DOWN, buff=0.3).move_to([0, 0, 0])
        self.P(FadeIn(m[0], scale=0.9), rt=0.4)
        self.at(cue("if your bank charges", K))
        self.P(FadeIn(m[1]), FadeIn(m[2]), rt=0.5)

    # =====================================================================
    def ch7(self):
        K = "ch7_traps"
        self.chapter_in(K, "5 FEE TRAPS")
        traps = [("Drawing cash you don't need", "trap one"),
                 ("Paying for speed: immediate costs more than normal", "trap two"),
                 ("Debit orders you forgot about", "trap three"),
                 ("Doing in a branch what the app can do (R1 vs R6)", "trap four"),
                 ("Ignoring small amounts: Lerato's came to R726 a year", "trap five")]
        for i, (t, ph) in enumerate(traps):
            y = 1.95 - i * 1.1
            b = box(14.4, 0.92, 0, y, r=0.2)
            n = flip_tile(str(i + 1), 0.55, 0.78, RED).move_to([-6.75, y, 0])
            tt = fit(label(t, 38, TEXT), 12.6).move_to([-6.2, y, 0], aligned_edge=LEFT)
            self.at(cue(ph, K))
            self.P(FadeIn(VGroup(b, n, tt), shift=RIGHT * 0.2), rt=0.4)
        s = self.src("Capitec 2026: R1 to pay a Capitec client on the app, R6 in a branch")
        self.at(cue("at capitec for example", K))
        self.P(FadeIn(s), rt=0.3)

    # =====================================================================
    def ch8(self):
        K = "ch8_how"
        self.chapter_in(K, "CHECK YOUR BANK FEES")
        steps = [("Statements", "Download your last 3 bank statements", "step one"),
                 ("Find every fee", "Look for: fee, charge, admin", "step two"),
                 ("Add up ÷ 3", "Your real monthly bank cost", "step three"),
                 ("Pricing guide", "On your bank's website. Usually updated yearly", "step four"),
                 ("Top 3 fees", "Can one habit change avoid them?", "step five"),
                 ("Then compare", "Use your own habits, not just the monthly fee", "step six")]
        for i, (t, s_, ph) in enumerate(steps):
            x = -5.1 + (i % 3) * 5.1
            y = 0.85 if i < 3 else -2.05
            b = box(4.8, 2.6, x, y)
            n = flip_tile(str(i + 1), 0.6, 0.85, GOLD).move_to([x - 1.65, y + 0.68, 0])
            tt = fit(label(t, 40), 3.1).move_to([x - 1.2, y + 0.68, 0], aligned_edge=LEFT)
            ss = fit(self.para(s_, 24, 30, MUTED), 4.4).move_to([x, y - 0.45, 0])
            self.at(cue(ph, K))
            self.P(FadeIn(VGroup(b, n, tt, ss), shift=UP * 0.2), rt=0.4)

    # =====================================================================
    def ch9(self):
        K = "ch9_recap"
        self.chapter_in(K, "RECAP")
        items = [("Capitec: started 2001 as a small lender in Stellenbosch", "capitec started in"),
                 ("Went after people the big banks overlooked", "it went after"),
                 ("Simple prices, and 25 000 clients grew to 26.6 million", "kept its prices"),
                 ("Your bank cost = monthly fee + every small fee", "your bank cost is"),
                 ("Add up 3 months of statements, find the biggest fees", "add up three months"),
                 ("Change one habit: for Lerato, R336 a year", "and change one habit")]
        for i, (txt, ph) in enumerate(items):
            y = 2.05 - i * 0.92
            g = VGroup(tick_icon(s=0.3).move_to([-6.0, y, 0]),
                       fit(label(txt, 40), 11.6).move_to([-5.4, y, 0], aligned_edge=LEFT))
            self.at(cue(ph, K))
            self.P(FadeIn(g, shift=RIGHT * 0.3), rt=0.35)
        disc0 = self.banner("General information, not financial advice", MUTED, -3.7, 30)
        self.at(cue("this video is general", K))
        self.P(FadeIn(disc0), rt=0.3)
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
