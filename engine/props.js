/* CINE props: money, phones, buildings, street, shop, map. Every builder returns an SVG <g> drawn around its own
   origin (centre unless noted) so it can be placed with CINE.G(g, x, y, rot, scale). Builders take (parent, defs, opts). */
'use strict';
(() => {
const { sv, grad, blurFilter, mix, dk, lt, rnd, clamp, lerp, uid } = window.CINE;
const T = (g, txt, a) => { const e = sv('text', Object.assign({ 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-family': 'Barlow Condensed', 'font-weight': 800 }, a), g); e.textContent = txt; return e; };
const shadowF = {}; const softShadow = defs => { const id = uid('ds'); const f = sv('filter', { id, x: '-30%', y: '-30%', width: '160%', height: '160%' }, defs); sv('feDropShadow', { dx: 0, dy: 14, stdDeviation: 14, 'flood-color': '#000', 'flood-opacity': .35 }, f); return `url(#${id})`; };
const clipRect = (defs, x, y, w, h, rx = 0) => { const id = uid('cr'); const c = sv('clipPath', { id }, defs); sv('rect', { x, y, width: w, height: h, rx }, c); return `url(#${id})`; };

// ---------------- money ----------------
const NOTE = {
  ZAR10: ['#3e9b5a', '#a9dcb0', 'R10'], ZAR20: ['#b8733a', '#f0c995', 'R20'], ZAR50: ['#c2413c', '#f2a9a0', 'R50'], ZAR100: ['#4b55b5', '#b9bff0', 'R100'], ZAR200: ['#d9822b', '#f6cf98', 'R200'],
  USD1: ['#5e7d5c', '#d9e3cf', '$1'], USD20: ['#5e7d5c', '#d9e3cf', '$20'], USD100: ['#4f7570', '#d6e6df', '$100'],
  ZWD: ['#3c6fa8', '#c6dcf2', '$100 000 000 000 000'], BOND: ['#6d5a9c', '#d8cff0', '$5'],
};
/** stylised banknote (not a replica): kind ZAR100 / USD100 / ZWD ... */
function note(parent, defs, { kind = 'ZAR100', w = 320, h = 156, shade = 0 } = {}) {
  const [c, pale, label] = NOTE[kind] || NOTE.ZAR100; const g = sv('g', {}, parent); const x = -w / 2, y = -h / 2;
  sv('rect', { x, y, width: w, height: h, rx: 8, fill: grad(defs, [[0, lt(pale, .2)], [.55, pale], [1, mix(pale, c, .35)]], { x1: 0, y1: 0, x2: 1, y2: 1 }) }, g);
  const cl = sv('g', { 'clip-path': clipRect(defs, x, y, w, h, 8) }, g);
  for (let i = 0; i < 9; i++) { let d = ''; for (let k = 0; k <= 40; k++) { const px = x + k / 40 * w, py = y + h * (.15 + i * .09) + Math.sin(k * .55 + i) * 6; d += (k ? 'L' : 'M') + px.toFixed(1) + ' ' + py.toFixed(1); } sv('path', { d, fill: 'none', stroke: c, 'stroke-width': 1.2, opacity: .25 }, cl); }
  sv('rect', { x: x + 8, y: y + 8, width: w - 16, height: h - 16, rx: 5, fill: 'none', stroke: c, 'stroke-width': 3, opacity: .7 }, g);
  if (kind.startsWith('USD')) { sv('ellipse', { cx: 0, cy: 0, rx: h * .3, ry: h * .36, fill: mix(pale, c, .25), stroke: c, 'stroke-width': 3 }, g); sv('path', { d: `M ${-h * .2} ${h * .3} Q ${-h * .2} ${-h * .05} 0 ${-h * .08} Q ${h * .2} ${-h * .05} ${h * .2} ${h * .3} Z M 0 ${-h * .08} m -${h * .11} -${h * .08} a ${h * .11} ${h * .12} 0 1 0 ${h * .22} 0 a ${h * .11} ${h * .12} 0 1 0 -${h * .22} 0`, fill: c, opacity: .55 }, g);
    T(g, label.replace('$', ''), { x: x + 44, y: y + 36, 'font-size': 34, fill: c }); T(g, label.replace('$', ''), { x: -x - 44, y: -y - 34, 'font-size': 34, fill: c }); T(g, 'US DOLLARS', { x: 0, y: y + 22, 'font-size': 16, fill: c, 'letter-spacing': 4 }); }
  else if (kind === 'ZWD') { // balancing rocks motif + huge number
    const r = sv('g', { transform: `translate(${x + w * .8},${y + h * .58})`, fill: c, opacity: .7 }, g); sv('ellipse', { cx: 0, cy: 22, rx: 38, ry: 16 }, r); sv('ellipse', { cx: 4, cy: -4, rx: 26, ry: 14 }, r); sv('ellipse', { cx: -2, cy: -26, rx: 18, ry: 11 }, r);
    T(g, 'ONE HUNDRED TRILLION DOLLARS', { x: -w * .1, y: y + h * .3, 'font-size': h * .1, fill: c, 'letter-spacing': 1 });
    T(g, '100 000 000 000 000', { x: -w * .1, y: y + h * .62, 'font-size': h * .2, fill: dk(c, .2) }); T(g, 'ZIMBABWE', { x: -w * .1, y: y + h * .84, 'font-size': h * .09, fill: c, 'letter-spacing': 5 }); }
  else { sv('circle', { cx: x + w * .74, cy: 0, r: h * .3, fill: mix(pale, c, .2), stroke: c, 'stroke-width': 2, opacity: .9 }, g);
    sv('path', { d: `M ${x + w * .66} ${h * .16} q 10 -40 30 -34 q 16 -20 30 4 q 12 20 -6 30 z`, fill: c, opacity: .45 }, g);
    T(g, label, { x: x + w * .32, y: 2, 'font-size': h * .42, fill: c }); T(g, 'RAND', { x: x + w * .32, y: h * .3, 'font-size': h * .1, fill: c, 'letter-spacing': 5 });
    T(g, label.slice(1), { x: x + 34, y: y + 26, 'font-size': 22, fill: c }); }
  sv('rect', { x: x + w * .56, y, width: 7, height: h, fill: '#c9cdd3', opacity: .65 }, g); // security strip
  sv('rect', { x, y, width: w, height: h, rx: 8, fill: grad(defs, [[0, '#fff', .35], [.5, '#fff', 0], [1, '#000', .12 + shade]], { x1: 0, y1: 0, x2: 1, y2: 1 }) }, g);
  return g;
}
/** neat stack of notes seen from the front at an angle; n notes; returns g */
function noteStack(parent, defs, { kind = 'ZAR100', n = 12, w = 320, h = 156, band = '#f2b632', dx = 0, dy = -5 } = {}) {
  const g = sv('g', {}, parent); sv('ellipse', { cx: 0, cy: h / 2 + 6, rx: w * .55, ry: 18, fill: '#000', opacity: .25, filter: blurFilter(defs, 8) }, g);
  for (let i = 0; i < n; i++) { const e = note(g, defs, { kind, w, h, shade: (n - i) * .01 }); e.setAttribute('transform', `translate(${(i * dx + Math.sin(i * 2.1) * 3).toFixed(1)},${(i * dy).toFixed(1)})`); }
  if (band) { const y = (n - 1) * dy; sv('rect', { x: -26, y: y - h / 2 - 2, width: 52, height: h - (n - 1) * dy + 4, fill: band, rx: 3 }, g); sv('rect', { x: -26, y: y - h / 2 - 2, width: 10, height: h - (n - 1) * dy + 4, fill: '#fff', opacity: .25 }, g); }
  return g;
}
/** coin; returns {g, flip(angle deg)} */
function coin(parent, defs, { r = 70, label = 'R5', metal = 'gold' } = {}) {
  const g = sv('g', {}, parent); const inner = sv('g', {}, g);
  const [a, b, cc] = metal === 'gold' ? ['#ffe08a', '#d39b2a', '#8a5a12'] : metal === 'bi' ? ['#f4f4f4', '#b9bec6', '#6b7079'] : ['#eef1f5', '#aab1bb', '#5f6670'];
  const edge = sv('ellipse', { cx: 0, cy: 0, rx: r, ry: r, fill: cc }, inner);
  const face = sv('g', {}, inner);
  sv('circle', { r, fill: grad(defs, [[0, a], [1, b]], { x1: 0, y1: 0, x2: 1, y2: 1 }) }, face);
  sv('circle', { r: r * .82, fill: 'none', stroke: dk(b, .15), 'stroke-width': r * .05, opacity: .7 }, face);
  if (metal === 'bi') sv('circle', { r: r * .62, fill: grad(defs, [[0, '#ffe08a'], [1, '#c48a1e']], { x1: 0, y1: 0, x2: 1, y2: 1 }) }, face);
  T(face, label, { y: 2, 'font-size': r * .62, fill: dk(b, .45) });
  sv('ellipse', { cx: -r * .3, cy: -r * .38, rx: r * .42, ry: r * .18, fill: '#fff', opacity: .35, transform: `rotate(-30 ${-r * .3} ${-r * .38})` }, face);
  return { g, flip(deg) { const c = Math.cos(deg * Math.PI / 180); face.setAttribute('transform', `scale(${c.toFixed(4)},1)`); edge.setAttribute('rx', Math.max(Math.abs(c) * r, 0) + r * .08 * Math.abs(Math.sin(deg * Math.PI / 180))); edge.setAttribute('cx', (Math.sin(deg * Math.PI / 180) * r * .05).toFixed(2)); } };
}
function coinPile(parent, defs, { n = 14, r = 46, seed = 3, metal = 'gold' } = {}) {
  const g = sv('g', {}, parent); const R = rnd(seed); sv('ellipse', { cx: 0, cy: 10, rx: r * 2.6, ry: r * .6, fill: '#000', opacity: .3, filter: blurFilter(defs, 8) }, g);
  for (let i = 0; i < n; i++) { const k = i / n; const c = coin(g, defs, { r, metal, label: '' }); const x = (R() - .5) * r * 3.6 * (1 - k * .7), y = -k * r * 1.6 + (R() - .5) * 8; c.g.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(1,${(.35 + R() * .25).toFixed(2)})`); }
  return g;
}

// ---------------- devices ----------------
/** smartphone; content drawn by screenFn(g, w, h) in screen coords (0,0 top-left). returns {g, screen} */
function phone(parent, defs, { w = 300, h = 620, color = '#1b1d23', screenFn = null, glow = true } = {}) {
  const g = sv('g', {}, parent); const x = -w / 2, y = -h / 2;
  sv('rect', { x: x + 6, y: y + 22, width: w, height: h, rx: 46, fill: '#000', opacity: .35, filter: blurFilter(defs, 18) }, g);
  sv('rect', { x, y, width: w, height: h, rx: 44, fill: grad(defs, [[0, lt(color, .25)], [.5, color], [1, dk(color, .3)]], { x1: 0, y1: 0, x2: 1, y2: 0 }) }, g);
  sv('rect', { x: x + 3, y: y + 3, width: w - 6, height: h - 6, rx: 41, fill: 'none', stroke: '#fff', 'stroke-width': 1.5, opacity: .18 }, g);
  const sx = x + 14, sy = y + 14, sw = w - 28, sh = h - 28;
  const scr = sv('g', { 'clip-path': clipRect(defs, sx, sy, sw, sh, 32) }, g);
  sv('rect', { x: sx, y: sy, width: sw, height: sh, fill: '#0e1116' }, scr);
  const screen = sv('g', { transform: `translate(${sx},${sy})` }, scr);
  if (screenFn) screenFn(screen, sw, sh, defs);
  sv('rect', { x: -38, y: sy + 10, width: 76, height: 22, rx: 11, fill: '#05060a' }, g); // island
  sv('path', { d: `M ${sx} ${sy} L ${sx + sw * .55} ${sy} L ${sx + sw * .1} ${sy + sh} L ${sx} ${sy + sh} Z`, fill: '#fff', opacity: .05 }, scr); // glass sheen
  return { g, screen, sw, sh };
}
/** feature phone with a USSD screen; returns {g, setText(lines[]), screen} */
function featurePhone(parent, defs, { w = 230, h = 470, color = '#2c3440' } = {}) {
  const g = sv('g', {}, parent); const x = -w / 2, y = -h / 2;
  sv('rect', { x: x + 8, y: y + 20, width: w, height: h, rx: 40, fill: '#000', opacity: .35, filter: blurFilter(defs, 16) }, g);
  sv('rect', { x, y, width: w, height: h, rx: 40, fill: grad(defs, [[0, lt(color, .2)], [1, dk(color, .3)]], { x1: 0, y1: 0, x2: 1, y2: 1 }) }, g);
  sv('rect', { x: x + 24, y: y + 40, width: w - 48, height: h * .36, rx: 10, fill: '#0b0f0c' }, g);
  const scr = sv('g', { transform: `translate(${x + 32},${y + 50})` }, g);
  sv('rect', { x: 0, y: 0, width: w - 64, height: h * .36 - 20, rx: 4, fill: grad(defs, [[0, '#cfe8c8'], [1, '#a8d39b']]) }, scr);
  const lines = []; for (let i = 0; i < 5; i++) lines.push(T(scr, '', { x: 8, y: 18 + i * 28, 'text-anchor': 'start', 'font-family': 'JetBrains Mono, monospace', 'font-weight': 700, 'font-size': 19, fill: '#1d2a1a' }));
  const ky = y + 60 + h * .36; const keys = '123456789*0#';
  for (let i = 0; i < 12; i++) { const kx = x + 36 + (i % 3) * ((w - 72) / 2), kyy = ky + 40 + Math.floor(i / 3) * 52; sv('rect', { x: kx - 28, y: kyy - 18, width: 56, height: 38, rx: 12, fill: lt(color, .15) }, g); T(g, keys[i], { x: kx, y: kyy + 1, 'font-size': 24, fill: '#e9eef4', 'font-family': 'Barlow' }); }
  sv('rect', { x: x + w * .32, y: ky - 4, width: w * .36, height: 26, rx: 13, fill: lt(color, .25) }, g);
  return { g, screen: scr, setText(arr) { lines.forEach((l, i) => l.textContent = arr[i] || ''); } };
}
function bankCard(parent, defs, { w = 420, h = 264, c1 = '#1f3b73', c2 = '#4a7bd1', name = 'MONEY FROM ZERO', num = '•••• 4821' } = {}) {
  const g = sv('g', {}, parent); const x = -w / 2, y = -h / 2;
  sv('rect', { x: x + 6, y: y + 18, width: w, height: h, rx: 22, fill: '#000', opacity: .35, filter: blurFilter(defs, 14) }, g);
  sv('rect', { x, y, width: w, height: h, rx: 22, fill: grad(defs, [[0, c2], [1, c1]], { x1: 0, y1: 0, x2: 1, y2: 1 }) }, g);
  sv('circle', { cx: x + w * .9, cy: y + h * .1, r: h * .7, fill: '#fff', opacity: .06 }, g);
  sv('rect', { x: x + 34, y: y + 80, width: 62, height: 48, rx: 8, fill: grad(defs, [[0, '#f6e3a1'], [1, '#c9a24a']], { x1: 0, y1: 0, x2: 1, y2: 1 }) }, g);
  for (let i = 0; i < 3; i++) sv('path', { d: `M ${x + 120 + i * 12} ${y + 88} q 10 16 0 32`, fill: 'none', stroke: '#fff', 'stroke-width': 4, opacity: .7, 'stroke-linecap': 'round' }, g);
  T(g, num, { x: x + 34, y: y + 170, 'text-anchor': 'start', 'font-size': 34, fill: '#fff', 'font-family': 'Barlow', 'font-weight': 700, 'letter-spacing': 3 });
  T(g, name, { x: x + 34, y: y + 222, 'text-anchor': 'start', 'font-size': 20, fill: '#fff', opacity: .8, 'letter-spacing': 3 });
  sv('rect', { x, y, width: w, height: h, rx: 22, fill: grad(defs, [[0, '#fff', .25], [.45, '#fff', 0]], { x1: 0, y1: 0, x2: 1, y2: 1 }) }, g);
  return g;
}
/** paper receipt / voucher slip; lines = [[text, size, bold]]; returns {g, setReveal(k)} */
function slip(parent, defs, { w = 300, lines = [], title = 'VOUCHER' } = {}) {
  const g = sv('g', {}, parent); const h = 80 + lines.length * 42; let d = `M ${-w / 2} 0 L ${w / 2} 0 L ${w / 2} ${h}`; for (let i = 0; i <= 20; i++) d += ` L ${w / 2 - i * w / 20} ${h + (i % 2 ? 10 : 0)}`; d += ' Z';
  const inner = sv('g', {}, g); const cp = uid('sl'); const c = sv('clipPath', { id: cp }, defs); const cr = sv('rect', { x: -w / 2 - 5, y: -5, width: w + 10, height: h + 20 }, c); inner.setAttribute('clip-path', `url(#${cp})`);
  sv('path', { d, fill: '#000', opacity: .25, filter: blurFilter(defs, 8), transform: 'translate(6,10)' }, inner);
  sv('path', { d, fill: grad(defs, [[0, '#ffffff'], [1, '#ece8df']]) }, inner);
  T(inner, title, { y: 36, 'font-size': 30, fill: '#222', 'letter-spacing': 4 }); sv('path', { d: `M ${-w / 2 + 20} 60 L ${w / 2 - 20} 60`, stroke: '#222', 'stroke-dasharray': '6 6', 'stroke-width': 2 }, inner);
  lines.forEach(([tx, sz = 26, b = false], i) => T(inner, tx, { y: 92 + i * 42, 'font-size': sz, fill: '#262626', 'font-family': b ? 'Barlow Condensed' : 'JetBrains Mono, monospace', 'font-weight': b ? 800 : 600 }));
  return { g, h, setReveal(k) { cr.setAttribute('height', (h + 20) * clamp(k)); } };
}
/** wall clock; returns {g, set(hours)} */
function clock(parent, defs, { r = 120, face = '#fbf7ee', rim = '#2b2f3a' } = {}) {
  const g = sv('g', {}, parent); sv('circle', { r: r + 10, fill: '#000', opacity: .3, filter: blurFilter(defs, 10), cy: 10 }, g);
  sv('circle', { r: r + 10, fill: rim }, g); sv('circle', { r, fill: face }, g);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; sv('line', { x1: Math.sin(a) * r * .8, y1: -Math.cos(a) * r * .8, x2: Math.sin(a) * r * .92, y2: -Math.cos(a) * r * .92, stroke: '#333', 'stroke-width': i % 3 ? 4 : 9, 'stroke-linecap': 'round' }, g); }
  const hh = sv('line', { x1: 0, y1: 0, x2: 0, y2: -r * .5, stroke: '#222', 'stroke-width': 12, 'stroke-linecap': 'round' }, g);
  const mm = sv('line', { x1: 0, y1: 0, x2: 0, y2: -r * .76, stroke: '#222', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
  sv('circle', { r: 10, fill: '#d9483b' }, g);
  return { g, set(hours) { hh.setAttribute('transform', `rotate(${(hours % 12) * 30})`); mm.setAttribute('transform', `rotate(${(hours % 1) * 360})`); } };
}

// ---------------- buildings & street ----------------
/** classical "big bank" facade, origin at bottom centre */
function bankHall(parent, defs, { w = 1000, h = 700, stone = '#e9e1d2', name = 'BANK', glow = 0 } = {}) {
  const g = sv('g', {}, parent); const sd = dk(stone, .22), sh = dk(stone, .4);
  const base = h * .1, colH = h * .52, entY = -base - colH; const ped = h * .2;
  sv('ellipse', { cx: 0, cy: 0, rx: w * .62, ry: 30, fill: '#000', opacity: .3, filter: blurFilter(defs, 16) }, g);
  for (let i = 0; i < 4; i++) sv('rect', { x: -w / 2 - 40 + i * 14, y: -base + i * base / 4 - base / 4 * 0, width: w + 80 - i * 28, height: base / 4, fill: i % 2 ? sd : stone }, g);
  sv('rect', { x: -w / 2 + 20, y: entY, width: w - 40, height: colH, fill: dk(stone, .55) }, g);
  // doors with warm light
  sv('rect', { x: -70, y: -base - colH * .62, width: 140, height: colH * .62, rx: 70, fill: grad(defs, [[0, '#ffd58a'], [1, '#c77d2a']]), opacity: .6 + glow * .4 }, g);
  const n = 6; for (let i = 0; i < n; i++) { const cx = -w / 2 + 70 + i * (w - 140) / (n - 1); const cw = w * .06;
    sv('rect', { x: cx - cw / 2, y: entY, width: cw, height: colH, fill: grad(defs, [[0, sd], [.35, lt(stone, .2)], [.7, stone], [1, sh]], { x1: 0, y1: 0, x2: 1, y2: 0 }) }, g);
    for (let k = 1; k < 5; k++) sv('line', { x1: cx - cw / 2 + k * cw / 5, y1: entY, x2: cx - cw / 2 + k * cw / 5, y2: entY + colH, stroke: sh, 'stroke-width': 1.5, opacity: .35 }, g);
    sv('rect', { x: cx - cw * .7, y: entY - 16, width: cw * 1.4, height: 16, fill: stone }, g); sv('rect', { x: cx - cw * .7, y: -base - 14, width: cw * 1.4, height: 14, fill: sd }, g); }
  sv('rect', { x: -w / 2, y: entY - 70, width: w, height: 56, fill: stone }, g); sv('rect', { x: -w / 2, y: entY - 22, width: w, height: 8, fill: sd }, g);
  T(g, name, { x: 0, y: entY - 42, 'font-size': 44, fill: sh, 'letter-spacing': 22, 'font-family': 'Barlow', 'font-weight': 700 });
  sv('path', { d: `M ${-w / 2 - 20} ${entY - 70} L 0 ${entY - 70 - ped} L ${w / 2 + 20} ${entY - 70} Z`, fill: stone }, g);
  sv('path', { d: `M ${-w / 2 + 40} ${entY - 82} L 0 ${entY - 60 - ped} L ${w / 2 - 40} ${entY - 82} Z`, fill: sd }, g);
  sv('circle', { cx: 0, cy: entY - 70 - ped * .45, r: ped * .22, fill: stone, stroke: sh, 'stroke-width': 4 }, g);
  T(g, 'R', { x: 0, y: entY - 70 - ped * .45, 'font-size': ped * .26, fill: sh });
  return g;
}
/** small modern bank branch / shop front, origin bottom centre. sign text, colours, light (0..1) */
function branch(parent, defs, { w = 760, h = 420, wall = '#f4f1ea', accent = '#2563c9', sign = 'BANK', sub = '', light = 1, people = false } = {}) {
  const g = sv('g', {}, parent); const x = -w / 2;
  sv('ellipse', { cx: 0, cy: 0, rx: w * .6, ry: 24, fill: '#000', opacity: .3, filter: blurFilter(defs, 14) }, g);
  sv('rect', { x, y: -h, width: w, height: h, fill: grad(defs, [[0, lt(wall, .1)], [1, dk(wall, .12)]]) }, g);
  sv('rect', { x: x - 10, y: -h - 18, width: w + 20, height: 26, fill: dk(wall, .3) }, g);
  // sign band
  sv('rect', { x: x + 30, y: -h + 30, width: w - 60, height: 96, rx: 10, fill: accent }, g);
  const signGlow = sv('rect', { x: x + 30, y: -h + 30, width: w - 60, height: 96, rx: 10, fill: '#fff', opacity: 0 }, g);
  T(g, sign, { y: -h + 78, 'font-size': 62, fill: '#fff', 'letter-spacing': 8 });
  // windows with interior light
  const winY = -h + 160, winH = h - 160 - 10; const lit = grad(defs, [[0, '#fff3cf'], [1, '#ffc56b']]);
  [[x + 30, w * .3], [x + w - 30 - w * .3, w * .3]].forEach(([wx, ww]) => { sv('rect', { x: wx, y: winY, width: ww, height: winH, rx: 4, fill: '#2c3440' }, g); const L = sv('rect', { x: wx + 8, y: winY + 8, width: ww - 16, height: winH - 16, fill: lit, opacity: .2 + .8 * light, class: 'lit' }, g);
    sv('path', { d: `M ${wx + 8} ${winY + 8} l ${ww * .4} 0 l ${-ww * .3} ${winH - 16} l ${-ww * .1} 0 Z`, fill: '#fff', opacity: .15 }, g); });
  // door
  const dw = w * .22; sv('rect', { x: -dw / 2, y: winY, width: dw, height: winH + 10, fill: '#2c3440' }, g);
  const door = sv('rect', { x: -dw / 2 + 8, y: winY + 8, width: dw - 16, height: winH - 6, fill: lit, opacity: .2 + .8 * light }, g);
  sv('line', { x1: 0, y1: winY + 8, x2: 0, y2: -2, stroke: '#2c3440', 'stroke-width': 6 }, g);
  if (sub) { const sbw = Math.max(dw + 20, sub.length * 17 + 36); sv('rect', { x: -sbw / 2, y: winY - 44, width: sbw, height: 36, rx: 6, fill: '#111', opacity: .85 }, g); T(g, sub, { y: winY - 26, 'font-size': 24, fill: '#7dff9b', 'letter-spacing': 3, 'font-family': 'Barlow' }); }
  sv('rect', { x, y: -h, width: w, height: h, fill: grad(defs, [[0, '#000', 0], [.7, '#000', 0], [1, '#000', .2]], { x1: 0, y1: 0, x2: 1, y2: 0 }) }, g);
  return { g, setLight(k) { g.querySelectorAll('.lit').forEach(e => e.setAttribute('opacity', .2 + .8 * k)); door.setAttribute('opacity', .2 + .8 * k); signGlow.setAttribute('opacity', k * .12); } };
}
/** township spaza / tuck shop, origin bottom centre */
function spaza(parent, defs, { w = 640, h = 380, wall = '#f2b632', roof = '#9aa3ad', sign = 'SPAZA', accent = '#d9483b' } = {}) {
  const g = sv('g', {}, parent); const x = -w / 2;
  sv('ellipse', { cx: 0, cy: 0, rx: w * .6, ry: 22, fill: '#000', opacity: .3, filter: blurFilter(defs, 12) }, g);
  sv('rect', { x, y: -h, width: w, height: h, fill: grad(defs, [[0, lt(wall, .08)], [1, dk(wall, .15)]]) }, g);
  for (let i = 0; i < 6; i++) sv('rect', { x: x + 20 + i * 105, y: -h + 20, width: 60, height: 4, fill: dk(wall, .1), opacity: .5 }, g);
  // corrugated roof
  const rf = sv('g', {}, g); sv('path', { d: `M ${x - 40} ${-h + 10} L ${x + w + 40} ${-h - 30} L ${x + w + 40} ${-h - 10} L ${x - 40} ${-h + 34} Z`, fill: roof }, rf);
  for (let i = 0; i < 26; i++) { const px = x - 40 + i * (w + 80) / 26; sv('line', { x1: px, y1: -h + 10 - i * 40 / 26 + 1, x2: px, y2: -h + 34 - i * 40 / 26, stroke: dk(roof, .25), 'stroke-width': 3 }, rf); }
  // hatch with burglar bars and goods
  const hx = x + 60, hy = -h + 120, hw = w * .58, hh = 160;
  sv('rect', { x: hx, y: hy, width: hw, height: hh, fill: '#2a2320' }, g);
  const goods = ['#e4572e', '#29a3d4', '#f3d34a', '#2fbf71', '#ffffff', '#a23b72']; for (let r2 = 0; r2 < 3; r2++) for (let i = 0; i < 9; i++) sv('rect', { x: hx + 10 + i * (hw - 20) / 9, y: hy + 12 + r2 * 50, width: (hw - 20) / 9 - 6, height: 38, rx: 3, fill: goods[(i * 3 + r2) % goods.length], opacity: .9 }, g);
  for (let i = 0; i <= 10; i++) sv('line', { x1: hx + i * hw / 10, y1: hy, x2: hx + i * hw / 10, y2: hy + hh, stroke: '#4a4f57', 'stroke-width': 5 }, g);
  sv('rect', { x: hx - 10, y: hy + hh, width: hw + 20, height: 16, fill: dk(wall, .35) }, g);
  // painted sign
  sv('rect', { x: x + 40, y: -h + 30, width: w - 80, height: 74, rx: 6, fill: accent }, g); T(g, sign, { y: -h + 68, 'font-size': 52, fill: '#fff', 'letter-spacing': 6 });
  // door
  sv('rect', { x: x + w - 150, y: -h + 120, width: 100, height: h - 120, fill: '#3c6fa8' }, g); sv('circle', { cx: x + w - 66, cy: -h * .35, r: 6, fill: '#f2d06b' }, g);
  // airtime board
  sv('rect', { x: x + 70, y: -110, width: 190, height: 90, rx: 6, fill: '#1d2320' }, g); T(g, 'AIRTIME', { x: x + 165, y: -82, 'font-size': 30, fill: '#ffd34d' }); T(g, 'DATA • VOUCHERS', { x: x + 165, y: -46, 'font-size': 20, fill: '#fff' });
  return g;
}
/** market stall with awning + produce, origin bottom centre */
function stall(parent, defs, { w = 560, h = 380, a1 = '#d9483b', a2 = '#f6efe2', board = '' } = {}) {
  const g = sv('g', {}, parent); const x = -w / 2;
  sv('ellipse', { cx: 0, cy: 0, rx: w * .6, ry: 20, fill: '#000', opacity: .3, filter: blurFilter(defs, 12) }, g);
  [x + 14, -x - 14].forEach(px => sv('rect', { x: px - 7, y: -h, width: 14, height: h, fill: '#6b4a2f' }, g));
  sv('rect', { x: x + 10, y: -150, width: w - 20, height: 110, fill: '#8a6240' }, g); sv('rect', { x: x, y: -160, width: w, height: 18, fill: '#a87a50' }, g);
  const R = rnd(9); const fruit = ['#e4572e', '#f3a712', '#2fbf71', '#d62246', '#f6d32d'];
  for (let k = 0; k < 4; k++) { const cx = x + 70 + k * (w - 140) / 3; sv('path', { d: `M ${cx - 60} -160 L ${cx + 60} -160 L ${cx + 50} -196 L ${cx - 50} -196 Z`, fill: '#c69a62' }, g);
    for (let i = 0; i < 9; i++) sv('circle', { cx: cx - 44 + (i % 5) * 22 + (i > 4 ? 11 : 0), cy: -200 - (i > 4 ? 18 : 0), r: 15, fill: fruit[k % fruit.length], stroke: dk(fruit[k % fruit.length], .25), 'stroke-width': 2 }, g); }
  const aw = sv('g', {}, g); const stripes = 10; for (let i = 0; i < stripes; i++) { const sx = x - 20 + i * (w + 40) / stripes; sv('path', { d: `M ${sx} ${-h} L ${sx + (w + 40) / stripes} ${-h} L ${sx + (w + 40) / stripes} ${-h + 70} Q ${sx + (w + 40) / stripes / 2} ${-h + 96} ${sx} ${-h + 70} Z`, fill: i % 2 ? a1 : a2 }, aw); }
  sv('rect', { x: x - 20, y: -h - 10, width: w + 40, height: 14, fill: dk(a1, .3) }, aw);
  if (board) { sv('rect', { x: -110, y: -h + 110, width: 220, height: 120, rx: 6, fill: '#22302a', stroke: '#8a6240', 'stroke-width': 8 }, g); }
  return g;
}
function chalkboard(parent, defs, { w = 360, h = 260, title = 'PRICES' } = {}) {
  const g = sv('g', {}, parent); sv('rect', { x: -w / 2 + 8, y: -h / 2 + 14, width: w, height: h, rx: 8, fill: '#000', opacity: .35, filter: blurFilter(defs, 10) }, g);
  sv('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 8, fill: '#8a6240' }, g); sv('rect', { x: -w / 2 + 14, y: -h / 2 + 14, width: w - 28, height: h - 28, rx: 4, fill: grad(defs, [[0, '#2c3b33'], [1, '#1d2722']]) }, g);
  T(g, title, { y: -h / 2 + 50, 'font-size': 36, fill: '#f4f1e8', 'font-family': 'Barlow', 'font-weight': 700, 'letter-spacing': 4 });
  return g;
}
function bread(parent, defs, { s = 1 } = {}) {
  const g = sv('g', { transform: `scale(${s})` }, parent);
  sv('ellipse', { cx: 0, cy: 50, rx: 140, ry: 16, fill: '#000', opacity: .3, filter: blurFilter(defs, 8) }, g);
  sv('path', { d: 'M -130 40 L -130 -10 C -130 -70 -60 -80 0 -80 C 60 -80 130 -70 130 -10 L 130 40 Z', fill: grad(defs, [[0, '#e9a85a'], [1, '#b46a28']]) }, g);
  for (let i = -2; i <= 2; i++) sv('path', { d: `M ${i * 46 - 18} -66 q 18 -10 36 0`, stroke: '#f6d29b', 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round' }, g);
  sv('rect', { x: -130, y: 10, width: 260, height: 30, fill: '#f6efe2', opacity: .85 }, g);
  return g;
}
function wheelbarrow(parent, defs, { fill = null } = {}) {
  const g = sv('g', {}, parent);
  sv('ellipse', { cx: 0, cy: 110, rx: 200, ry: 16, fill: '#000', opacity: .3, filter: blurFilter(defs, 8) }, g);
  const wheel = sv('g', { transform: 'translate(-150,70)' }, g); sv('circle', { r: 42, fill: '#2b2b2b' }, wheel); sv('circle', { r: 18, fill: '#8a8f99' }, wheel);
  for (let i = 0; i < 4; i++) sv('line', { x1: 0, y1: 0, x2: Math.cos(i * .8) * 38, y2: Math.sin(i * .8) * 38, stroke: '#8a8f99', 'stroke-width': 4 }, wheel);
  sv('line', { x1: 60, y1: 40, x2: 70, y2: 110, stroke: '#4a4f57', 'stroke-width': 10 }, g);
  sv('path', { d: 'M -190 -40 L 120 -40 L 80 50 L -150 50 Z', fill: grad(defs, [[0, '#3d8f5a'], [1, '#24603a']]) }, g);
  sv('line', { x1: 100, y1: -20, x2: 260, y2: -60, stroke: '#6b4a2f', 'stroke-width': 14, 'stroke-linecap': 'round' }, g);
  const load = sv('g', {}, g); if (fill) fill(load);
  return { g, wheel, load };
}
/** minibus taxi (side view), origin bottom centre; returns {g, wheels:[...]} */
function taxi(parent, defs, { body = '#f4f4f2', stripe = '#2f7d4f', w = 700 } = {}) {
  const g = sv('g', {}, parent); const h = 300;
  sv('ellipse', { cx: 0, cy: 0, rx: w * .55, ry: 22, fill: '#000', opacity: .35, filter: blurFilter(defs, 12) }, g);
  sv('path', { d: `M ${-w / 2} -50 L ${-w / 2} ${-h + 40} Q ${-w / 2} ${-h} ${-w / 2 + 40} ${-h} L ${w / 2 - 120} ${-h} Q ${w / 2 - 60} ${-h} ${w / 2 - 20} ${-h + 110} L ${w / 2} -110 Q ${w / 2 + 6} -50 ${w / 2 - 20} -50 Z`, fill: grad(defs, [[0, lt(body, .1)], [1, dk(body, .14)]]) }, g);
  sv('rect', { x: -w / 2, y: -150, width: w, height: 26, fill: stripe }, g);
  for (let i = 0; i < 4; i++) sv('rect', { x: -w / 2 + 30 + i * 120, y: -h + 30, width: 100, height: 90, rx: 10, fill: '#2c3440' }, g);
  sv('path', { d: `M ${w / 2 - 110} ${-h + 30} L ${w / 2 - 70} ${-h + 30} Q ${w / 2 - 40} ${-h + 60} ${w / 2 - 28} ${-h + 120} L ${w / 2 - 110} ${-h + 120} Z`, fill: '#2c3440' }, g);
  sv('rect', { x: w / 2 - 34, y: -96, width: 30, height: 18, rx: 4, fill: '#ffe08a' }, g);
  const wheels = [-w / 2 + 130, w / 2 - 140].map(cx => { const wg = sv('g', { transform: `translate(${cx},-44)` }, g); sv('circle', { r: 50, fill: '#1d1d1f' }, wg); sv('circle', { r: 26, fill: '#b9bec6' }, wg); for (let i = 0; i < 5; i++) sv('circle', { cx: Math.cos(i * 1.256) * 14, cy: Math.sin(i * 1.256) * 14, r: 4, fill: '#6b7079' }, wg); return wg; });
  return { g, spin(a) { wheels.forEach((wg, i) => { const tr = wg.getAttribute('transform').replace(/ rotate\([^)]*\)/, ''); wg.setAttribute('transform', tr + ` rotate(${a})`); }); } };
}
/** simple house; type 'rdp' | 'suburb'; origin bottom centre */
function house(parent, defs, { w = 300, h = 200, wall = '#e9e1d2', roof = '#8a5a3c', type = 'rdp', lit = 0 } = {}) {
  const g = sv('g', {}, parent);
  sv('rect', { x: -w / 2, y: -h, width: w, height: h, fill: grad(defs, [[0, wall], [1, dk(wall, .15)]]) }, g);
  if (type === 'rdp') sv('path', { d: `M ${-w / 2 - 14} ${-h + 4} L ${w / 2 + 14} ${-h - 26} L ${w / 2 + 14} ${-h - 8} L ${-w / 2 - 14} ${-h + 22} Z`, fill: roof }, g);
  else sv('path', { d: `M ${-w / 2 - 24} ${-h + 4} L 0 ${-h - h * .55} L ${w / 2 + 24} ${-h + 4} Z`, fill: roof }, g);
  const wc = lit ? '#ffd27a' : '#3a4656'; sv('rect', { x: -w / 2 + 30, y: -h + 50, width: 70, height: 60, fill: wc }, g); sv('rect', { x: w / 2 - 100, y: -h + 50, width: 70, height: 60, fill: wc }, g);
  sv('rect', { x: -30, y: -110, width: 60, height: 110, fill: dk(roof, .1) }, g);
  return g;
}
/** city skyline silhouette, origin bottom-left, width w */
function skyline(parent, defs, { w = 1920, h = 420, color = '#2b3550', seed = 5, joburg = false, windows = .0, winColor = '#ffd27a' } = {}) {
  const g = sv('g', {}, parent); const R = rnd(seed); let x = 0; const wins = [];
  while (x < w) { const bw = 60 + R() * 120, bh = h * (.3 + R() * .65); sv('rect', { x, y: -bh, width: bw - 6, height: bh, fill: color }, g);
    if (windows > 0) for (let yy = -bh + 16; yy < -20; yy += 26) for (let xx = x + 10; xx < x + bw - 22; xx += 22) if (R() < windows) wins.push(sv('rect', { x: xx, y: yy, width: 10, height: 14, fill: winColor, opacity: .85 }, g));
    if (R() < .25) sv('rect', { x: x + bw * .4, y: -bh - 40, width: 6, height: 40, fill: color }, g); x += bw; }
  if (joburg) { // Hillbrow-style tower and Ponte-style cylinder silhouettes
    const tx = w * .62; sv('path', { d: `M ${tx - 16} 0 L ${tx - 10} ${-h * 1.35} L ${tx + 10} ${-h * 1.35} L ${tx + 16} 0 Z`, fill: color }, g); sv('rect', { x: tx - 34, y: -h * 1.3, width: 68, height: 50, rx: 10, fill: color }, g); sv('rect', { x: tx - 3, y: -h * 1.6, width: 6, height: h * .3, fill: color }, g);
    const px = w * .32; sv('rect', { x: px - 70, y: -h * 1.05, width: 140, height: h * 1.05, rx: 24, fill: color }, g); for (let yy = -h; yy < 0; yy += 22) sv('rect', { x: px - 60, y: yy, width: 120, height: 6, fill: windows ? winColor : lt(color, .05), opacity: windows ? .5 : .5 }, g); }
  return { g, wins };
}
/** soft cloud, origin centre */
function cloud(parent, defs, { s = 1, color = '#fff', o = .9 } = {}) {
  const g = sv('g', { opacity: o }, parent); [[0, 0, 90], [-90, 20, 60], [90, 18, 66], [-40, -40, 64], [46, -34, 58]].forEach(([x, y, r]) => sv('circle', { cx: x * s, cy: y * s, r: r * s, fill: color }, g));
  sv('rect', { x: -150 * s, y: 18 * s, width: 300 * s, height: 60 * s, rx: 30 * s, fill: color }, g); return g;
}
function acacia(parent, defs, { s = 1, c = '#3e5f3a', trunk = '#4a3424' } = {}) {
  const g = sv('g', { transform: `scale(${s})` }, parent);
  sv('path', { d: 'M -8 0 L -4 -120 L -40 -180 M -4 -120 L 30 -190 M 0 -150 L 4 -200', stroke: trunk, 'stroke-width': 14, fill: 'none', 'stroke-linecap': 'round' }, g);
  sv('ellipse', { cx: 0, cy: -210, rx: 170, ry: 34, fill: c }, g); sv('ellipse', { cx: -30, cy: -232, rx: 110, ry: 24, fill: lt(c, .1) }, g); return g;
}
function lamp(parent, defs, { h = 520, on = 1 } = {}) {
  const g = sv('g', {}, parent); sv('rect', { x: -6, y: -h, width: 12, height: h, fill: '#2b2f3a' }, g); sv('path', { d: `M 0 ${-h} q 0 -30 50 -30 l 20 0`, stroke: '#2b2f3a', 'stroke-width': 10, fill: 'none' }, g);
  sv('rect', { x: 50, y: -h - 36, width: 46, height: 16, rx: 6, fill: '#2b2f3a' }, g); sv('ellipse', { cx: 73, cy: -h - 18, rx: 22, ry: 6, fill: '#ffe7a8', opacity: on }, g);
  sv('path', { d: `M 55 ${-h - 18} L -80 0 L 230 0 L 91 ${-h - 18} Z`, fill: '#ffe7a8', opacity: .07 * on, filter: blurFilter(defs, 12) }, g); return g;
}
/** cell tower with pulsing signal arcs; returns {g, pulse(t)} */
function tower(parent, defs, { h = 520, color = '#c9ced6', wave = '#7dff9b' } = {}) {
  const g = sv('g', {}, parent); sv('path', { d: `M -60 0 L -10 ${-h} L 10 ${-h} L 60 0`, stroke: color, 'stroke-width': 8, fill: 'none' }, g);
  for (let i = 1; i < 8; i++) { const y = -i * h / 8; const wdt = 60 * (1 - i / 8) + 10 * i / 8; sv('path', { d: `M ${-wdt} ${y} L ${wdt} ${y + h / 8} M ${wdt} ${y} L ${-wdt} ${y + h / 8}`, stroke: color, 'stroke-width': 3, opacity: .7 }, g); }
  sv('rect', { x: -24, y: -h - 10, width: 48, height: 30, rx: 4, fill: color }, g); const arcs = [];
  for (let i = 0; i < 3; i++) [-1, 1].forEach(s => arcs.push(sv('path', { d: `M ${s * 40} ${-h - 40} a 60 60 0 0 ${s > 0 ? 1 : 0} 0 60`, transform: `translate(0,${-h - 10}) scale(1) translate(0,${h + 10})`, stroke: wave, 'stroke-width': 8, fill: 'none', 'stroke-linecap': 'round' }, g)));
  return { g, pulse(t) { arcs.forEach((a, i) => { const k = ((t * 1.2 + Math.floor(i / 2) * .33) % 1); a.setAttribute('transform', `translate(0 ${-h - 10}) scale(${(1 + k * 2.2).toFixed(3)}) translate(0 ${h + 10})`); a.setAttribute('opacity', (1 - k).toFixed(3)); a.setAttribute('stroke-width', (8 / (1 + k * 2.2)).toFixed(2)); }); } };
}
/** image (logo, flag): href absolute or relative to engine */
function img(parent, href, { w = 200, h = 200, x = -w / 2, y = -h / 2 } = {}) { const g = sv('g', {}, parent); const im = sv('image', { href, x, y, width: w, height: h, preserveAspectRatio: 'xMidYMid meet' }, g); return g; }

// ---------------- map ----------------
/** Africa map; returns {g, country(key) -> path, proj(lon,lat), arc(from,to,opts)} ; map space ~1010x1020 */
function africaMap(parent, defs, { land = '#2f4a3f', stroke = '#5f8a74', ocean = null, glow = '#85ed70' } = {}) {
  const g = sv('g', {}, parent); const paths = {}; const A = window.AFRICA;
  const sh = sv('g', { filter: blurFilter(defs, 18), opacity: .55, transform: 'translate(14,26)' }, g);
  for (const k in A) sv('path', { d: A[k].d, fill: '#000' }, sh);
  for (const k in A) paths[k] = sv('path', { d: A[k].d, fill: land, stroke, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, g);
  const top = sv('g', {}, g);
  return { g, top, paths, A, proj: window.AFRICA_PROJ,
    highlight(k, color, a = 1) { const p = paths[k]; if (!p) return; p.setAttribute('fill', mix(land, color, a)); p.setAttribute('stroke', a > .5 ? lt(color, .3) : stroke); top.appendChild(p); },
    arc(p0, p1, { color = glow, width = 6, lift = .35 } = {}) { const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2; const dx = p1[0] - p0[0], dy = p1[1] - p0[1]; const cx = mx - dy * lift, cy = my + dx * lift * .2 - Math.hypot(dx, dy) * lift;
      const d = `M ${p0[0]} ${p0[1]} Q ${cx} ${cy} ${p1[0]} ${p1[1]}`; const glowP = sv('path', { d, stroke: color, 'stroke-width': width * 3, fill: 'none', opacity: .3, filter: blurFilter(defs, 6), 'stroke-linecap': 'round' }, top);
      const p = sv('path', { d, stroke: color, 'stroke-width': width, fill: 'none', 'stroke-linecap': 'round' }, top); const dot = sv('circle', { r: width * 1.8, fill: '#fff' }, top); const L = p.getTotalLength();
      [p, glowP].forEach(e => e.style.strokeDasharray = L);
      return k => { [p, glowP].forEach(e => e.style.strokeDashoffset = L * (1 - k)); const q = p.getPointAtLength(L * clamp(k)); dot.setAttribute('cx', q.x); dot.setAttribute('cy', q.y); dot.setAttribute('opacity', k > 0 && k < 1 ? 1 : 0); }; },
    pin(p, { color = glow, label = '', size = 26 } = {}) { const pg = sv('g', { transform: `translate(${p[0]},${p[1]})` }, top); const ring = sv('circle', { r: 14, fill: 'none', stroke: color, 'stroke-width': 4 }, pg); sv('circle', { r: 9, fill: color }, pg);
      if (label) { const tx = T(pg, label, { x: 18, y: -18, 'text-anchor': 'start', 'font-size': size, fill: '#fff', 'font-family': 'Barlow', 'font-weight': 700 }); }
      return t => { const k = (t * .8) % 1; ring.setAttribute('r', 14 + k * 30); ring.setAttribute('opacity', 1 - k); }; } };
}


/** point-in-country test in map coordinates (ray casting on the outline rings); works before anything is rendered */
const _rings = {};
function inCountry(key, x, y) {
  if (!_rings[key]) _rings[key] = window.AFRICA[key].d.split('M').filter(Boolean).map(r => r.replace('Z', '').split('L').map(p => p.split(',').map(Number)));
  let inside = false;
  for (const ring of _rings[key]) for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
Object.assign(window.CINE, { inCountry, T, softShadow, clipRect, NOTE, note, noteStack, coin, coinPile, phone, featurePhone, bankCard, slip, clock, bankHall, branch, spaza, stall, chalkboard, bread, wheelbarrow, taxi, house, skyline, cloud, acacia, lamp, tower, img, africaMap });
})();
