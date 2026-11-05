"""Money From Zero brand kit for manim: colours, type, split-flap tiles, chapter cards."""
from manim import *

BG = "#121214"
TEXT = "#F4EEDF"
MUTED = "#B9B3A8"
GREEN = "#2FD27F"
GOLD = "#F7BE33"
GOLD_D = "#E3A114"
RED = "#FF5D5D"
BLUE = "#6CB4FF"
PANEL = "#1F1F23"
TILE_TOP = "#2B2B30"
STROKE = "#3A3A41"
GREY = "#55555E"


def bold(txt, size, color=TEXT):
    return Text(txt, font="Barlow Condensed", weight=BOLD, font_size=size, color=color)


def label(txt, size, color=TEXT):
    return Text(txt, font="Barlow", weight=SEMIBOLD, font_size=size, color=color)


def body(txt, size, color=TEXT):
    return Text(txt, font="Barlow", weight=MEDIUM, font_size=size, color=color)


def rands(v):
    return "R" + f"{int(round(v)):,}".replace(",", " ")


def coin(r=0.32):
    c = Circle(radius=r, color="#B7791F", stroke_width=5, fill_color=GOLD, fill_opacity=1)
    return VGroup(c, bold("R", int(r * 110), "#6B3F00").move_to(c))


def tick_icon(color=GREEN, s=0.42):
    return VMobject(color=color, stroke_width=10).set_points_as_corners(
        [[-s * 0.55, 0, 0], [-s * 0.1, -s * 0.45, 0], [s * 0.6, s * 0.5, 0]])


def cross_icon(color=RED, s=0.32):
    return VGroup(Line([-s, -s, 0], [s, s, 0], color=color, stroke_width=10),
                  Line([-s, s, 0], [s, -s, 0], color=color, stroke_width=10))


def box(w, h, x=0, y=0, stroke=STROKE, sw=3, r=0.28, fill=PANEL):
    return RoundedRectangle(corner_radius=r, width=w, height=h, color=stroke, stroke_width=sw,
                            fill_color=fill, fill_opacity=1).move_to([x, y, 0])


def flip_tile(ch, w=1.1, h=1.55, color=TEXT, gold_edge=False):
    cr = w * 0.1
    base = RoundedRectangle(corner_radius=cr, width=w, height=h, stroke_width=0,
                            fill_color="#202024", fill_opacity=1)
    top_clip = Rectangle(width=w + 0.2, height=h / 2 + 0.1).move_to(base.get_center() + UP * (h / 4 + 0.05))
    top = Intersection(base, top_clip, stroke_width=0, fill_color=TILE_TOP, fill_opacity=1)
    parts = [base, top]
    if ch.strip():
        glyph = bold(ch, int(h * 74), color)
        if ch == "-":
            glyph.scale_to_fit_width(w * 0.4).move_to(base).shift(UP * h * 0.09)
        elif ch in ":":
            glyph.scale_to_fit_height(h * 0.42).move_to(base)
        else:
            glyph.scale_to_fit_height(h * 0.6).move_to(base)
        parts.append(glyph)
    parts.append(Rectangle(width=w, height=h * 0.028, stroke_width=0, fill_color=BG, fill_opacity=1).move_to(base))
    if gold_edge:
        parts.append(RoundedRectangle(corner_radius=cr, width=w, height=h, stroke_width=3,
                                      color=GOLD, stroke_opacity=0.7, fill_opacity=0))
    return VGroup(*parts)


def flip_word(text, w=0.9, h=1.25, gap=0.1, color=TEXT, gold_last_zero=False):
    tiles = VGroup()
    for i, ch in enumerate(text):
        is_zero = gold_last_zero and ch == "0" and i == len(text) - 1
        tiles.add(flip_tile(ch, w, h, GOLD if is_zero else color, gold_edge=is_zero))
    return tiles.arrange(RIGHT, buff=gap)


def brand_mark(size=40):
    t = flip_tile("0", w=size / 80, h=size / 57, color=GOLD)
    name = bold("MONEY FROM ZERO", size, TEXT)
    return VGroup(t, name).arrange(RIGHT, buff=0.2)


def flip_in(scene_play, tiles, rt=1.0, lag=0.1):
    """Animate tiles as if flaps drop into place."""
    for t in tiles:
        t.save_state()
        t.stretch(0.02, 1)
    return LaggedStart(*[Restore(t) for t in tiles], lag_ratio=lag, run_time=rt)
