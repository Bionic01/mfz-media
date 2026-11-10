/* CINE worlds: skies, ground, interiors and studio backdrops. All draw into a World layer L (L.svg, L.defs, L.w, L.h). */
'use strict';
(() => {
const { sv, grad, blurFilter, mix, dk, lt, rnd, W, H } = window.CINE;
const full = L => ({ x: 0, y: 0, width: L.w, height: L.h });
/** vertical gradient sky. stops: [[0,'#..'],[1,'#..']] */
function sky(L, stops = [[0, '#2a3b6b'], [.6, '#e98a5b'], [1, '#f6d29b']]) { return sv('rect', Object.assign(full(L), { fill: grad(L.defs, stops) }), L.svg); }
function sun(L, x, y, { r = 90, color = '#fff1c4', glow = '#ffb45e', g = 2.6 } = {}) {
  const grp = sv('g', {}, L.svg); sv('circle', { cx: x, cy: y, r: r * g * 2, fill: grad(L.defs, [[0, glow, .55], [1, glow, 0]], { radial: true }) }, grp);
  sv('circle', { cx: x, cy: y, r: r * 1.25, fill: color, opacity: .35, filter: blurFilter(L.defs, 20) }, grp); sv('circle', { cx: x, cy: y, r, fill: color }, grp); return grp;
}
/** rolling hills band; returns path */
function hills(L, y, { color = '#3e5f3a', amp = 60, seed = 3, n = 5, h = 400 } = {}) {
  const R = rnd(seed); let d = `M 0 ${L.h} L 0 ${y}`; const pts = []; for (let i = 0; i <= n; i++) pts.push([i / n * L.w, y - R() * amp]);
  for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; d += ` C ${x0 + (x1 - x0) / 2} ${y0} ${x0 + (x1 - x0) / 2} ${y1} ${x1} ${y1}`; }
  d += ` L ${L.w} ${L.h} Z`; return sv('path', { d, fill: grad(L.defs, [[0, lt(color, .06)], [1, dk(color, .25)]]) }, L.svg);
}
/** flat ground from y to bottom, with a soft horizon line */
function ground(L, y, { color = '#c97b4a', far = null, line = true } = {}) {
  const g = sv('g', {}, L.svg); sv('rect', { x: 0, y, width: L.w, height: L.h - y, fill: grad(L.defs, [[0, far || lt(color, .1)], [1, dk(color, .2)]]) }, g);
  if (line) sv('rect', { x: 0, y: y - 2, width: L.w, height: 6, fill: '#fff', opacity: .12, filter: blurFilter(L.defs, 3) }, g); return g;
}
/** perspective tiled floor (interiors): horizon y, vanishing x */
function floor(L, y, { c1 = '#d9d2c3', c2 = '#c9c0ae', vx = L.w / 2, lines = 22, rows = 9 } = {}) {
  const g = sv('g', {}, L.svg); sv('rect', { x: 0, y, width: L.w, height: L.h - y, fill: grad(L.defs, [[0, dk(c1, .1)], [1, c1]]) }, g);
  for (let i = -lines; i <= lines; i++) sv('line', { x1: vx + i * 30, y1: y, x2: vx + i * 260, y2: L.h, stroke: c2, 'stroke-width': 2, opacity: .7 }, g);
  for (let j = 1; j <= rows; j++) { const k = Math.pow(j / rows, 2.2); const yy = y + (L.h - y) * k; sv('line', { x1: 0, y1: yy, x2: L.w, y2: yy, stroke: c2, 'stroke-width': 1 + k * 3, opacity: .7 }, g); }
  sv('rect', { x: 0, y, width: L.w, height: (L.h - y) * .35, fill: grad(L.defs, [[0, '#000', .25], [1, '#000', 0]]) }, g); return g;
}
/** dark product-shot studio: radial key light + floor glow; good for "macro" money shots */
function studio(L, { c1 = '#2b2e38', c2 = '#0b0c10', key = '#ffd9a0', kx = .5, ky = .38, floorY = .72 } = {}) {
  const g = sv('g', {}, L.svg); sv('rect', Object.assign(full(L), { fill: grad(L.defs, [[0, c1], [1, c2]], { radial: true, cx: kx, cy: ky, r: .8 }) }), g);
  sv('ellipse', { cx: L.w * kx, cy: L.h * ky, rx: L.w * .35, ry: L.h * .35, fill: grad(L.defs, [[0, key, .18], [1, key, 0]], { radial: true }) }, g);
  sv('ellipse', { cx: L.w * kx, cy: L.h * floorY + 40, rx: L.w * .4, ry: 90, fill: grad(L.defs, [[0, key, .12], [1, key, 0]], { radial: true }) }, g); return g;
}
/** bank interior back wall with panels, high windows and a counter band */
function bankInterior(L, { wall = '#efe6d6', trim = '#b89a6a', floorY = 760 } = {}) {
  const g = sv('g', {}, L.svg); sv('rect', { x: 0, y: 0, width: L.w, height: floorY, fill: grad(L.defs, [[0, dk(wall, .1)], [1, wall]]) }, g);
  for (let i = 0; i < 6; i++) { const x = 80 + i * (L.w - 160) / 6; sv('rect', { x: x + 20, y: 90, width: (L.w - 160) / 6 - 40, height: 300, rx: 140, fill: grad(L.defs, [[0, '#bfe0ff'], [1, '#fff6dc']]), opacity: .9 }, g);
    sv('rect', { x: x - 10, y: 60, width: 26, height: floorY - 60, fill: lt(wall, .1) }, g); sv('rect', { x: x - 2, y: 60, width: 6, height: floorY - 60, fill: dk(wall, .12) }, g); }
  sv('rect', { x: 0, y: 40, width: L.w, height: 26, fill: trim }, g); sv('rect', { x: 0, y: floorY - 16, width: L.w, height: 16, fill: dk(trim, .2) }, g);
  floor(L, floorY, { c1: '#e6dfcf', c2: '#cfc5b0' }); return g;
}
/** night-time township street backdrop pieces: road band with markings */
function road(L, y, { color = '#3a3d44', h = 160, marks = true } = {}) {
  const g = sv('g', {}, L.svg); sv('rect', { x: 0, y, width: L.w, height: h, fill: color }, g); sv('rect', { x: 0, y: y - 18, width: L.w, height: 18, fill: '#8d8f94' }, g);
  if (marks) for (let x = 0; x < L.w; x += 160) sv('rect', { x, y: y + h / 2 - 5, width: 90, height: 10, fill: '#f3f0e6', opacity: .8 }, g); return g;
}
/** light shaft from a window/top: polygon with blur */
function shaft(L, x, y, w, h, { color = '#fff4d6', o = .16, skew = 220 } = {}) {
  return sv('path', { d: `M ${x} ${y} L ${x + w} ${y} L ${x + w + skew} ${y + h} L ${x + skew} ${y + h} Z`, fill: color, opacity: o, filter: blurFilter(L.defs, 20), style: 'mix-blend-mode:screen' }, L.svg);
}
/** soft colour wash on top of a layer (grading inside a world) */
function wash(L, color, o = .2, blend = 'soft-light') { return sv('rect', Object.assign(full(L), { fill: color, opacity: o, style: `mix-blend-mode:${blend}` }), L.svg); }
Object.assign(window.CINE, { sky, sun, hills, ground, floor, studio, bankInterior, road, shaft, wash });
})();
