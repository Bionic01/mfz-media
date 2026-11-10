/* CINE props, part 2: printing press, balance scale, money sack, grocery basket, cash box, tear-off calendar,
   hand holding a phone (close-up, moving thumb), rubber stamp, price tag, time-of-day arc, data meter. */
'use strict';
(() => {
const C = window.CINE; const { sv, grad, blurFilter, mix, dk, lt, rnd, clamp, lerp, E, uid } = C; const T = C.T;

/** banknote printing press; origin = floor centre. set(t, k) where k = 0..1 run amount; returns {g, set} */
function printingPress(parent, defs, { kind = 'ZWD', body = '#3b4a5c' } = {}) {
  const g = sv('g', {}, parent);
  sv('ellipse', { cx: 0, cy: 0, rx: 470, ry: 26, fill: '#000', opacity: .35, filter: blurFilter(defs, 14) }, g);
  const out = sv('g', {}, g); // notes that slide out (behind the front panel)
  sv('rect', { x: -330, y: -430, width: 520, height: 430, rx: 26, fill: grad(defs, [[0, lt(body, .12)], [1, dk(body, .25)]]) }, g);
  sv('rect', { x: -300, y: -400, width: 460, height: 130, rx: 14, fill: dk(body, .35) }, g);
  const rollers = [-200, -60].map(x => { const rg = sv('g', { transform: `translate(${x},-335)` }, g); sv('circle', { r: 52, fill: grad(defs, [[0, '#d9dde3'], [1, '#7b838e']], { x1: 0, y1: 0, x2: 1, y2: 1 }) }, rg); for (let i = 0; i < 6; i++) sv('line', { x1: 0, y1: 0, x2: Math.cos(i) * 46, y2: Math.sin(i) * 46, stroke: '#5b626c', 'stroke-width': 4 }, rg); sv('circle', { r: 12, fill: '#2b2f36' }, rg); return rg; });
  const lights = [0, 1, 2].map(i => sv('circle', { cx: -260 + i * 40, cy: -230, r: 11, fill: '#333' }, g));
  sv('rect', { x: -300, y: -190, width: 460, height: 22, rx: 6, fill: dk(body, .4) }, g); T(g, 'CENTRAL BANK PRINTING', { x: -70, y: -120, 'font-size': 30, fill: '#cfd6df', 'letter-spacing': 3 });
  sv('rect', { x: 190, y: -170, width: 230, height: 14, rx: 4, fill: '#8a919b' }, g); // output tray
  const pile = sv('g', {}, g); const flying = [];
  for (let i = 0; i < 8; i++) { const n = C.note(out, defs, { kind, w: 200, h: 92 }); flying.push(n); }
  const pileNotes = []; for (let i = 0; i < 26; i++) { const n = C.note(pile, defs, { kind, w: 200, h: 92 }); n.setAttribute('transform', `translate(${305 + Math.sin(i * 2.3) * 6},${-176 - i * 7}) scale(1,.35)`); pileNotes.push(n); }
  return { g, set(t, k) {
    rollers.forEach((r, i) => r.setAttribute('transform', `translate(${[-200, -60][i]},-335) rotate(${(t * 380 * (i ? -1 : 1)).toFixed(1)})`));
    lights.forEach((l, i) => l.setAttribute('fill', Math.floor(t * 4 + i) % 3 === 0 ? ['#85ed70', '#ffc94d', '#ff6b5a'][i] : '#333'));
    flying.forEach((n, i) => { const ph = ((t * 1.6 + i / flying.length) % 1); const x = lerp(120, 320, ph), y = lerp(-250, -190 - Math.min(26, k * 26) * 7, ph); n.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${(ph * 8).toFixed(1)}) scale(1,${lerp(.9, .35, ph).toFixed(3)})`); n.setAttribute('opacity', k > 0 ? 1 : 0); });
    pileNotes.forEach((n, i) => n.setAttribute('opacity', i < k * 26 ? 1 : 0)); } };
}
/** balance scale; origin = base centre. returns {g, left, right, set(angleDeg)} — put things in left/right (pan groups) */
function balance(parent, defs, { w = 700, h = 520, metal = '#d9b24a' } = {}) {
  const g = sv('g', {}, parent); const m = grad(defs, [[0, lt(metal, .25)], [1, dk(metal, .3)]], { x1: 0, y1: 0, x2: 1, y2: 0 });
  sv('ellipse', { cx: 0, cy: 0, rx: w * .35, ry: 22, fill: '#000', opacity: .35, filter: blurFilter(defs, 10) }, g);
  sv('path', { d: `M -110 0 L 110 0 L 70 -40 L -70 -40 Z`, fill: m }, g); sv('rect', { x: -12, y: -h, width: 24, height: h - 40, fill: m }, g); sv('circle', { cx: 0, cy: -h, r: 22, fill: m }, g);
  const beam = sv('g', { transform: `translate(0,${-h})` }, g); sv('rect', { x: -w / 2, y: -9, width: w, height: 18, rx: 9, fill: m }, beam);
  const pans = [-1, 1].map(s => { const pg = sv('g', {}, g); sv('path', { d: 'M 0 0 L -120 170 M 0 0 L 120 170', stroke: '#8a7a4a', 'stroke-width': 3 }, pg); sv('path', { d: 'M -150 170 L 150 170 Q 120 220 0 222 Q -120 220 -150 170 Z', fill: m }, pg); const content = sv('g', { transform: 'translate(0,166)' }, pg); return { pg, content, s }; });
  return { g, left: pans[0].content, right: pans[1].content, set(a) { beam.setAttribute('transform', `translate(0,${-h}) rotate(${a})`); const r = a * Math.PI / 180;
    pans.forEach(p => { const px = p.s * w / 2 * Math.cos(r), py = -h + p.s * w / 2 * Math.sin(r); p.pg.setAttribute('transform', `translate(${px.toFixed(1)},${py.toFixed(1)})`); }); } };
}
/** money sack bulging with notes; origin = bottom centre */
function sack(parent, defs, { kind = 'ZWD', s = 1, color = '#c9b48a' } = {}) {
  const g = sv('g', { transform: `scale(${s})` }, parent); sv('ellipse', { cx: 0, cy: 0, rx: 110, ry: 16, fill: '#000', opacity: .3, filter: blurFilter(defs, 8) }, g);
  for (let i = 0; i < 6; i++) { const n = C.note(g, defs, { kind, w: 120, h: 56 }); n.setAttribute('transform', `translate(${-50 + i * 20},${-205 - (i % 2) * 12}) rotate(${-25 + i * 10})`); }
  sv('path', { d: 'M -60 -190 Q -120 -120 -110 -50 Q -100 0 0 0 Q 100 0 110 -50 Q 120 -120 60 -190 Z', fill: grad(defs, [[0, lt(color, .1)], [1, dk(color, .2)]], { x1: 0, y1: 0, x2: 1, y2: 0 }) }, g);
  sv('path', { d: 'M -64 -192 Q 0 -170 64 -192 L 60 -176 Q 0 -156 -60 -176 Z', fill: dk(color, .3) }, g); T(g, 'Z$', { y: -90, 'font-size': 60, fill: dk(color, .45) });
  return g;
}
/** grocery basket with bread, milk, eggs; origin = bottom centre */
function basket(parent, defs, { s = 1 } = {}) {
  const g = sv('g', { transform: `scale(${s})` }, parent); sv('ellipse', { cx: 0, cy: 0, rx: 170, ry: 16, fill: '#000', opacity: .3, filter: blurFilter(defs, 8) }, g);
  sv('rect', { x: -40, y: -250, width: 70, height: 120, rx: 6, fill: '#f6f6f2' }, g); sv('rect', { x: -40, y: -210, width: 70, height: 36, fill: '#3c8de0' }, g); T(g, 'MILK', { x: -5, y: -192, 'font-size': 20, fill: '#fff' });
  const b = C.bread(g, defs, { s: .45 }); b.setAttribute('transform', 'translate(70,-150) scale(.45) rotate(-12)');
  for (let i = 0; i < 4; i++) sv('ellipse', { cx: -110 + i * 26, cy: -138, rx: 13, ry: 17, fill: '#f3e3c4' }, g);
  sv('path', { d: 'M -150 -130 L 150 -130 L 120 0 L -120 0 Z', fill: grad(defs, [[0, '#d9483b'], [1, '#a1302a']]) }, g);
  for (let i = 1; i < 6; i++) sv('line', { x1: -150 + i * 50, y1: -130, x2: -120 + i * 40, y2: 0, stroke: '#7d221d', 'stroke-width': 4 }, g);
  sv('path', { d: 'M -130 -130 Q 0 -280 130 -130', fill: 'none', stroke: '#7d221d', 'stroke-width': 12 }, g); return g;
}
/** cash tin (open) with notes; origin = centre */
function cashBox(parent, defs, { s = 1 } = {}) {
  const g = sv('g', { transform: `scale(${s})` }, parent); sv('rect', { x: -170, y: -60, width: 340, height: 120, rx: 12, fill: grad(defs, [[0, '#4a5866'], [1, '#2a323b']]) }, g);
  const slots = sv('g', {}, g); for (let i = 0; i < 4; i++) sv('rect', { x: -155 + i * 78, y: -50, width: 70, height: 60, rx: 6, fill: '#1b2228' }, slots);
  const content = sv('g', {}, g); return { g, content };
}
/** tear-off calendar page; returns {g, set(month, year, flipK)} */
function calendarPage(parent, defs, { w = 260, h = 300, accent = '#d9483b' } = {}) {
  const g = sv('g', {}, parent); sv('rect', { x: -w / 2 + 8, y: -h / 2 + 14, width: w, height: h, rx: 18, fill: '#000', opacity: .35, filter: blurFilter(defs, 12) }, g);
  sv('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 18, fill: '#fbf7ee' }, g); sv('rect', { x: -w / 2, y: -h / 2, width: w, height: 80, rx: 18, fill: accent }, g); sv('rect', { x: -w / 2, y: -h / 2 + 50, width: w, height: 30, fill: accent }, g);
  [-60, 60].forEach(x => sv('rect', { x: x - 8, y: -h / 2 - 22, width: 16, height: 44, rx: 8, fill: '#555' }, g));
  const mo = T(g, '', { y: -h / 2 + 42, 'font-size': 42, fill: '#fff', 'letter-spacing': 4 }); const yr = T(g, '', { y: 30, 'font-size': 120, fill: '#222' });
  const flip = sv('g', {}, g); sv('rect', { x: -w / 2, y: -h / 2 + 80, width: w, height: h - 80, fill: '#efe9dc' }, flip);
  return { g, set(m, y, k = 0) { mo.textContent = m; yr.textContent = y; flip.setAttribute('transform', `translate(0,${-h / 2 + 80}) scale(1,${(1 - clamp(k)).toFixed(3)}) translate(0,${h / 2 - 80})`); flip.setAttribute('opacity', k > 0 && k < 1 ? 1 : 0); } };
}
/** big hand holding a feature phone (close-up). returns {g, phone, thumb(x,y,press)} ; phone is C.featurePhone */
function phoneHand(parent, defs, { skin = '#6b4128', sleeve = '#e2603a' } = {}) {
  const g = sv('g', {}, parent); const sd = dk(skin, .2);
  sv('path', { d: 'M -260 760 L -120 420 L 160 420 L 300 760 Z', fill: sleeve }, g); // sleeve
  sv('path', { d: 'M -150 520 Q -210 330 -170 180 L 170 180 Q 210 330 150 520 Z', fill: skin }, g); // palm behind phone
  const fp = C.featurePhone(g, defs, { w: 340, h: 690, color: '#27303c' }); fp.g.setAttribute('transform', 'translate(0,60)');
  [[-212, 130], [-216, 200], [-212, 270], [-204, 340]].forEach(([x, y]) => sv('rect', { x, y, width: 48, height: 60, rx: 24, fill: skin, stroke: sd, 'stroke-width': 3 }, g)); // fingers wrapping the left edge
  const th = sv('g', {}, g); sv('path', { d: 'M 0 0 C 30 -10 60 -40 70 -90 C 76 -120 50 -140 26 -126 C 4 -112 -10 -60 -40 -30 Z', fill: skin, stroke: sd, 'stroke-width': 3 }, th); sv('ellipse', { cx: 52, cy: -110, rx: 16, ry: 12, fill: lt(skin, .25), opacity: .7, transform: 'rotate(-30 52 -110)' }, th);
  return { g, phone: fp, thumb(x, y, press = 0) { th.setAttribute('transform', `translate(${(x - 52).toFixed(1)},${(y + 122 + press * 8).toFixed(1)}) scale(${1 - press * .06})`); } };
}
/** rubber stamp mark; set(k) slams it in */
function stampMark(parent, defs, text, { color = '#e23b3b', size = 70, rot = -12 } = {}) {
  const g = sv('g', {}, parent); const inner = sv('g', { transform: `rotate(${rot})` }, g); const w = text.length * size * .6 + 60;
  sv('rect', { x: -w / 2, y: -size * .8, width: w, height: size * 1.6, rx: 12, fill: 'none', stroke: color, 'stroke-width': 9 }, inner); T(inner, text, { 'font-size': size, fill: color, 'letter-spacing': 6 });
  return { g, set(k) { const q = clamp(k); const s = q < 1 ? lerp(2.4, 1, E.inQ(q)) : 1; inner.setAttribute('transform', `rotate(${rot}) scale(${s})`); g.setAttribute('opacity', q > 0 ? Math.min(1, q * 3) : 0); } };
}
/** hanging price tag; returns {g, label, set(t, swing)} */
function priceTag(parent, defs, { w = 260, h = 120, color = '#ffc94d' } = {}) {
  const g = sv('g', {}, parent); const inner = sv('g', {}, g); sv('line', { x1: 0, y1: -120, x2: 0, y2: -40, stroke: '#ddd', 'stroke-width': 3 }, inner);
  sv('path', { d: `M -${w / 2} -40 L ${w / 2 - 30} -40 L ${w / 2} ${h / 2 - 40} L ${w / 2 - 30} ${h - 40} L -${w / 2} ${h - 40} Z`, fill: color }, inner); sv('circle', { cx: w / 2 - 34, cy: h / 2 - 40, r: 8, fill: '#fff' }, inner);
  const label = T(inner, '', { x: -20, y: h / 2 - 40, 'font-size': h * .46, fill: '#1b1b1b' });
  return { g, label, set(t, sw = 1) { inner.setAttribute('transform', `rotate(${(Math.sin(t * 2.6) * 6 * sw).toFixed(2)} 0 -120)`); } };
}
/** time-of-day arc with a sun icon travelling from morning to afternoon; set(k) */
function dayArc(parent, defs, { w = 520, color = '#ffc94d', labels = ['MORNING', 'AFTERNOON'] } = {}) {
  const g = sv('g', {}, parent); const d = `M ${-w / 2} 0 A ${w / 2} ${w * .38} 0 0 1 ${w / 2} 0`;
  sv('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': 4, 'stroke-dasharray': '8 10', opacity: .5 }, g);
  const sun = sv('g', {}, g); sv('circle', { r: 34, fill: color }, sun); for (let i = 0; i < 8; i++) sv('line', { x1: Math.cos(i * .785) * 44, y1: Math.sin(i * .785) * 44, x2: Math.cos(i * .785) * 58, y2: Math.sin(i * .785) * 58, stroke: color, 'stroke-width': 6, 'stroke-linecap': 'round' }, sun);
  labels.forEach((l, i) => T(g, l, { x: (i ? 1 : -1) * w / 2, y: 46, 'font-size': 30, fill: '#fff', 'letter-spacing': 2 }));
  return { g, set(k, t = 0) { const a = Math.PI * (1 - clamp(k)); sun.setAttribute('transform', `translate(${(Math.cos(a) * w / 2).toFixed(1)},${(-Math.sin(a) * w * .38).toFixed(1)}) rotate(${(t * 30).toFixed(1)})`); } };
}
/** horizontal meter (e.g. data filling); set(k) */
function meter(parent, defs, { w = 300, h = 34, color = '#85ed70', label = '' } = {}) {
  const g = sv('g', {}, parent); sv('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: h / 2, fill: '#000', opacity: .35 }, g);
  const f = sv('rect', { x: -w / 2 + 4, y: -h / 2 + 4, width: 0, height: h - 8, rx: (h - 8) / 2, fill: color }, g); const tx = T(g, label, { y: -h, 'font-size': 26, fill: '#fff' });
  return { g, set(k, txt) { f.setAttribute('width', (w - 8) * clamp(k)); if (txt !== undefined) tx.textContent = txt; } };
}
Object.assign(C, { printingPress, balance, sack, basket, cashBox, calendarPage, phoneHand, stampMark, priceTag, dayArc, meter });
})();
