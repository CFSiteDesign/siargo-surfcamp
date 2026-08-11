#!/usr/bin/env python3
"""
Build the Siargao Surf Camp display typefaces.

Two faces are generated from one skeleton set, so the family stays coherent:

  Siargao Liquid — hero face. Stroke width breathes along each stroke, which
                   gives the poured, bulging letterforms of the "Currents of
                   Devotion" poster.
  Siargao Block  — section-heading face. Same skeletons at a constant, slightly
                   narrower width: chunky and rounded like "CALI, MEET CULTURE",
                   but calmer so it holds up in a paragraph-adjacent heading.

Construction
------------
Every glyph is described as a *skeleton* — one or more polylines through the
middle of each stroke — never as an outline. The outline is derived by offsetting
the skeleton by the stroke radius on both sides and closing the ends with round
caps. That is what produces the consistent rounded terminals and even colour
across the alphabet, and it means a change to one parameter restyles all 70
glyphs at once.

Closed skeletons (the ring of O, 0, Q) offset to two contours — an outer and an
inner — giving a true counter with the correct winding.

Run:  python3 tools/build_fonts.py
Out:  src/assets/fonts/SiargaoLiquid.ttf / .woff  (+ Block)
"""

import math
import os
import struct
import zlib
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

UPM = 1000
CAP = 700          # cap height
BASE = 0
ASCENDER = 780
DESCENDER = -200

# Skeletons are authored on this box, then shifted by the left sidebearing.
LEFT = 90
RIGHT = 510
MID = (LEFT + RIGHT) / 2


# ─────────────────────────── geometry helpers ────────────────────────────

def arc(cx, cy, rx, ry, a0, a1, n=28):
    """Sampled elliptical arc, angles in degrees, counter-clockwise positive."""
    pts = []
    for i in range(n + 1):
        t = a0 + (a1 - a0) * i / n
        r = math.radians(t)
        pts.append((cx + rx * math.cos(r), cy + ry * math.sin(r)))
    return pts


def resample(points, step=14.0):
    """Insert points so no segment is longer than `step`.

    The offsetting below works per-vertex, so curvature is only as smooth as the
    input sampling — this keeps long straight runs from cutting corners when the
    radius is modulated along them.
    """
    out = [points[0]]
    for a, b in zip(points, points[1:]):
        d = math.hypot(b[0] - a[0], b[1] - a[1])
        if d > step:
            k = int(math.ceil(d / step))
            for i in range(1, k):
                out.append((a[0] + (b[0] - a[0]) * i / k, a[1] + (b[1] - a[1]) * i / k))
        out.append(b)
    return out


def signed_area(poly):
    s = 0.0
    for a, b in zip(poly, poly[1:] + poly[:1]):
        s += a[0] * b[1] - b[0] * a[1]
    return s / 2.0


def orient(poly, clockwise=True):
    a = signed_area(poly)
    if (a > 0 and clockwise) or (a < 0 and not clockwise):
        return poly[::-1]
    return poly


def radius_at(t, r0, wobble, phase, wrap=False):
    """Stroke radius at normalised position t along a stroke.

    `wobble` 0 gives a monoline; raising it makes the stroke swell and pinch,
    which is the whole character of the Liquid face. Closed rings use a whole
    number of cycles so the thickness meets itself at the seam.
    """
    if wobble <= 0:
        return r0
    freq = 2.0 if wrap else 1.35
    return r0 * (1.0 + wobble * math.sin(2 * math.pi * (freq * t + phase)))


def cone(p0, r0, p1, r1, steps=9):
    """Outline of the convex hull of two circles.

    This is the whole trick behind the letterforms being robust. Offsetting a
    skeleton by averaged vertex normals blows up into spikes wherever two
    segments meet at a sharp angle (the miter runs away), which is exactly what
    happens at the apex of A, the joins of K, W, X and every piece of
    punctuation. Emitting one hull per segment instead means each join is a
    circle that both neighbours contain, so joins and caps are round by
    construction and nothing can self-intersect.

    Contours overlap freely and the glyph fills correctly because TrueType uses
    the non-zero winding rule and every contour here is wound the same way.
    Counters still appear — nothing covers the middle of a ring of segments.
    """
    (x0, y0), (x1, y1) = p0, p1
    dx, dy = x1 - x0, y1 - y0
    d = math.hypot(dx, dy)
    if d < 1e-6:
        return orient(arc(x0, y0, r0, r0, 0, 360, steps * 3)[:-1], clockwise=True)

    # Tangent points sit at ±alpha from the centre line on both circles.
    alpha = math.acos(max(-1.0, min(1.0, (r0 - r1) / d)))
    theta = math.atan2(dy, dx)

    pts = []
    a0 = theta + alpha
    sweep0 = 2 * math.pi - 2 * alpha
    for i in range(steps + 1):
        t = a0 + sweep0 * i / steps
        pts.append((x0 + r0 * math.cos(t), y0 + r0 * math.sin(t)))
    a1 = theta - alpha
    for i in range(steps + 1):
        t = a1 + (2 * alpha) * i / steps
        pts.append((x1 + r1 * math.cos(t), y1 + r1 * math.sin(t)))
    return orient(pts, clockwise=True)


def stroke(points, r0, wobble=0.0, phase=0.0, closed=False, step=None):
    """Chain of hulls along a skeleton. Works for open strokes and closed rings."""
    step = step or (66.0 if wobble > 0 else 999.0)
    pts = resample(points, step) if wobble > 0 else list(points)
    if closed and pts[0] == pts[-1]:
        pts = pts[:-1]

    n = len(pts)
    span = n if closed else max(1, n - 1)
    rad = [radius_at(i / span, r0, wobble, phase, wrap=closed) for i in range(n)]

    out = []
    last = n if closed else n - 1
    for i in range(last):
        j = (i + 1) % n
        out.append(cone(pts[i], rad[i], pts[j], rad[j]))
    return out


def dot(cx, cy, r):
    return [orient(arc(cx, cy, r, r, 0, 360, 20)[:-1], clockwise=True)]


# ───────────────────────────── the alphabet ──────────────────────────────
# Each entry: list of ('o'|'c', skeleton points). 'c' = closed loop (counter).

def ring(cx, cy, rx, ry):
    return ('c', arc(cx, cy, rx, ry, 0, 360, 40)[:-1])


GLYPHS = {
    'A': [('o', [(105, 0), (300, CAP), (495, 0)]), ('o', [(178, 250), (422, 250)])],
    'B': [('o', [(130, 0), (130, CAP)]),
          ('o', arc(300, 528, 205, 172, 90, -90)),
          ('o', arc(300, 178, 220, 178, 90, -90))],
    'C': [('o', arc(310, 350, 200, 350, 55, 305))],
    'D': [('o', [(130, 0), (130, CAP)]),
          ('o', arc(210, 350, 290, 350, 90, -90))],
    'E': [('o', [(140, 0), (140, CAP)]), ('o', [(140, CAP), (470, CAP)]),
          ('o', [(140, 350), (420, 350)]), ('o', [(140, 0), (470, 0)])],
    'F': [('o', [(140, 0), (140, CAP)]), ('o', [(140, CAP), (470, CAP)]),
          ('o', [(140, 360), (410, 360)])],
    'G': [('o', arc(310, 350, 200, 350, 55, 300)), ('o', [(500, 300), (500, 60)]),
          ('o', [(340, 300), (500, 300)])],
    'H': [('o', [(130, 0), (130, CAP)]), ('o', [(470, 0), (470, CAP)]),
          ('o', [(130, 350), (470, 350)])],
    'I': [('o', [(300, 0), (300, CAP)])],
    'J': [('o', [(430, CAP), (430, 190)] + arc(300, 190, 130, 190, 0, -180, 20)[1:])],
    'K': [('o', [(140, 0), (140, CAP)]), ('o', [(480, CAP), (170, 330)]),
          ('o', [(230, 390), (490, 0)])],
    'L': [('o', [(150, CAP), (150, 0), (470, 0)])],
    'M': [('o', [(120, 0), (120, CAP), (300, 210), (480, CAP), (480, 0)])],
    'N': [('o', [(130, 0), (130, CAP), (470, 0), (470, CAP)])],
    'O': [ring(300, 350, 200, 350)],
    'P': [('o', [(140, 0), (140, CAP)]), ('o', arc(300, 480, 205, 220, 90, -90))],
    'Q': [ring(300, 350, 200, 350), ('o', [(380, 190), (520, -60)])],
    'R': [('o', [(140, 0), (140, CAP)]), ('o', arc(300, 490, 195, 210, 90, -90)),
          ('o', [(300, 280), (490, 0)])],
    'S': [('o', arc(300, 530, 190, 170, 60, 250)[:-1] +
                arc(300, 185, 195, 185, 78, -160, 26))],
    'T': [('o', [(120, CAP), (480, CAP)]), ('o', [(300, CAP), (300, 0)])],
    'U': [('o', [(130, CAP), (130, 220)] + arc(300, 220, 170, 220, 180, 360, 22)[1:] +
                [(470, CAP)])],
    'V': [('o', [(110, CAP), (300, 0), (490, CAP)])],
    'W': [('o', [(80, CAP), (190, 0), (300, 430), (410, 0), (520, CAP)])],
    'X': [('o', [(130, CAP), (470, 0)]), ('o', [(470, CAP), (130, 0)])],
    'Y': [('o', [(120, CAP), (300, 340), (480, CAP)]), ('o', [(300, 340), (300, 0)])],
    'Z': [('o', [(140, CAP), (470, CAP), (140, 0), (475, 0)])],

    '0': [ring(300, 350, 190, 350)],
    '1': [('o', [(180, 540), (310, CAP), (310, 0)]), ('o', [(170, 0), (450, 0)])],
    '2': [('o', arc(300, 500, 185, 175, 190, -25, 26) + [(120, 0), (480, 0)])],
    '3': [('o', arc(295, 530, 180, 165, 155, -95, 24)),
          ('o', arc(295, 185, 195, 185, 95, -175, 26))],
    '4': [('o', [(390, 0), (390, CAP), (110, 195), (490, 195)])],
    '5': [('o', [(450, CAP), (175, CAP), (155, 400)] +
                arc(300, 200, 190, 200, 100, -150, 26))],
    '6': [('o', arc(300, 350, 200, 350, 80, 205, 22)), ring(305, 200, 185, 200)],
    '7': [('o', [(120, CAP), (480, CAP), (250, 0)])],
    '8': [ring(300, 520, 165, 180), ring(300, 175, 195, 175)],
    '9': [('o', arc(300, 350, 200, 350, 260, 385, 22)), ring(295, 500, 185, 200)],

    '.': [('d', (300, 85, 92))],
    ',': [('d', (300, 95, 92)), ('o', [(300, 30), (245, -155)])],
    ':': [('d', (300, 480, 92)), ('d', (300, 85, 92))],
    ';': [('d', (300, 480, 92)), ('d', (300, 95, 92)), ('o', [(300, 30), (245, -155)])],
    '!': [('o', [(300, CAP), (300, 235)]), ('d', (300, 85, 95))],
    '?': [('o', arc(300, 505, 175, 175, 195, -60, 24) + [(300, 260)]),
          ('d', (300, 85, 95))],
    "'": [('o', [(300, CAP), (300, 500)])],
    '"': [('o', [(215, CAP), (215, 500)]), ('o', [(385, CAP), (385, 500)])],
    '-': [('o', [(150, 330), (450, 330)])],
    '–': [('o', [(120, 330), (480, 330)])],
    '—': [('o', [(90, 330), (510, 330)])],
    # Loop over the top, diagonal through the waist, bowl at the foot, tail out.
    '&': [('o', [(475, 195), (330, 380)] + arc(292, 505, 112, 120, -58, 248, 20) +
                [(205, 330)] + arc(300, 180, 172, 180, 182, -22, 24))],
    '/': [('o', [(140, -60), (460, CAP)])],
    '(': [('o', arc(430, 330, 250, 420, 130, 230, 22))],
    ')': [('o', arc(170, 330, 250, 420, 50, -50, 22))],
    '+': [('o', [(140, 330), (460, 330)]), ('o', [(300, 170), (300, 490)])],
    '%': [ring(180, 530, 105, 118) + (0.62,), ring(420, 170, 105, 118) + (0.62,),
          ('o', [(470, CAP), (130, 0)])],
    '#': [('o', [(215, CAP), (155, 0)]), ('o', [(425, CAP), (365, 0)]),
          ('o', [(120, 480), (490, 480)]), ('o', [(105, 220), (475, 220)])],
    '₱': [('o', [(140, 0), (140, CAP)]), ('o', arc(300, 490, 195, 210, 90, -90)),
          ('o', [(80, 560), (430, 560)]), ('o', [(80, 420), (430, 420)])],
    '@': [ring(300, 330, 95, 100) + (0.6,),
          ('o', arc(300, 330, 255, 275, -35, 250, 30), 0.6)],
}

# Glyphs whose advance should differ from the default.
WIDTHS = {
    'I': 400, 'J': 520, '1': 480, '.': 380, ',': 380, ':': 380, ';': 380,
    '!': 400, "'": 400, '"': 560, '-': 560, '–': 600, '—': 600, '(': 420,
    ')': 420, 'W': 700, 'M': 640, '/': 520,
}
DEFAULT_WIDTH = 600


def glyph_contours(spec, r0, wobble):
    """Render one glyph spec. A third element scales the stroke weight for that
    part only — small rings (%, @) need a lighter stroke or the counter closes."""
    contours = []
    for i, item in enumerate(spec):
        kind, data = item[0], item[1]
        rs = item[2] if len(item) > 2 else 1.0
        phase = (i * 0.37) % 1.0
        if kind == 'd':
            cx, cy, rr = data
            contours += dot(cx, cy, rr * (r0 / 88.0))
        else:
            contours += stroke(data, r0 * rs, wobble, phase, closed=(kind == 'c'))
    return contours


def build(family, style_r, wobble, xscale, out_stem):
    order = ['.notdef', 'space'] + [f'g{ord(c):04X}' for c in GLYPHS]
    cmap = {ord(' '): 'space'}
    glyphs = {}
    metrics = {}

    pen = TTGlyphPen(None)
    glyphs['.notdef'] = pen.glyph()
    metrics['.notdef'] = (DEFAULT_WIDTH, 0)
    glyphs['space'] = TTGlyphPen(None).glyph()
    metrics['space'] = (int(300 * xscale), 0)

    for ch, spec in GLYPHS.items():
        name = f'g{ord(ch):04X}'
        cmap[ord(ch)] = name
        # Lowercase renders as caps — these are display faces, drawn caps-only.
        if 'A' <= ch <= 'Z':
            cmap[ord(ch.lower())] = name

        p = TTGlyphPen(None)
        for contour in glyph_contours(spec, style_r, wobble):
            pts = [(round(x * xscale), round(y)) for x, y in contour]
            p.moveTo(pts[0])
            for q in pts[1:]:
                p.lineTo(q)
            p.closePath()
        glyphs[name] = p.glyph()
        metrics[name] = (int(WIDTHS.get(ch, DEFAULT_WIDTH) * xscale), 0)

    fb = FontBuilder(UPM, isTTF=True)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=ASCENDER, descent=DESCENDER, lineGap=0)
    fb.setupNameTable({
        'familyName': family,
        'styleName': 'Regular',
        'uniqueFontIdentifier': f'{family} Regular; Mad Monkey Siargao Surf Camp',
        'fullName': f'{family} Regular',
        'psName': family.replace(' ', ''),
        'version': 'Version 1.000',
        'copyright': 'Mad Monkey. Drawn for the Siargao Surf Camp landing page.',
    })
    fb.setupOS2(sTypoAscender=ASCENDER, sTypoDescender=DESCENDER, sCapHeight=CAP,
                usWinAscent=ASCENDER, usWinDescent=-DESCENDER, achVendID='MMKY')
    fb.setupPost(isFixedPitch=0)

    ttf = f'{out_stem}.ttf'
    fb.save(ttf)

    fb.font.flavor = 'woff'
    fb.save(f'{out_stem}.woff')
    print(f'  {os.path.basename(ttf)}  ({os.path.getsize(ttf)/1024:.1f} kB)  '
          f'+ .woff ({os.path.getsize(out_stem + ".woff")/1024:.1f} kB)')


if __name__ == '__main__':
    here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out = os.path.join(here, 'src', 'assets', 'fonts')
    os.makedirs(out, exist_ok=True)
    print('Building Siargao display faces…')
    # Liquid: bubble lettering per the lilac Siargao poster — strokes fat enough
    # that counters shrink to slots, with only a whisper of swell left so the
    # bubbles stay clean rather than drippy.
    build('Siargao Liquid', style_r=112, wobble=0.14, xscale=1.05,
          out_stem=os.path.join(out, 'SiargaoLiquid'))
    # Block: same skeletons, monoline and a touch narrower — section headings.
    build('Siargao Block', style_r=72, wobble=0.0, xscale=0.93,
          out_stem=os.path.join(out, 'SiargaoBlock'))
    print('Done.')
