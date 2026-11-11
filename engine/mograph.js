/* CINE motion graphics: flag badges, icon badges, callouts, odometers, stat cards, timelines, arc flyers, bursts,
   animated backgrounds, haze, highlight text, shape transitions. Everything is deterministic in t. */
'use strict';
(() => {
const C = window.CINE; const { sv, el, grad, blurFilter, clamp, lerp, E, prog, rnd, mix, dk, lt, uid, noise1 } = C;
const ENG = (document.currentScript && document.currentScript.src.replace(/[^/]*$/, '')) || '';
C.ENG = ENG;

// ---------------- flags ----------------
const FILE_FLAGS = ['bw', 'cd', 'et', 'ke', 'ls', 'mw', 'mz', 'ng', 'pk', 'so', 'za', 'zw'];
// code-drawn flags (simplified, 300x200)
const DRAWN = {
  us: g => { for (let i = 0; i < 13; i++) sv('rect', { x: 0, y: i * 200 / 13, width: 300, height: 200 / 13, fill: i % 2 ? '#fff' : '#b22234' }, g); sv('rect', { x: 0, y: 0, width: 130, height: 108, fill: '#3c3b6e' }, g); for (let j = 0; j < 5; j++) for (let i = 0; i < 6; i++) sv('circle', { cx: 12 + i * 21, cy: 12 + j * 21, r: 4, fill: '#fff' }, g); },
  gb: g => { sv('rect', { width: 300, height: 200, fill: '#012169' }, g); sv('path', { d: 'M0 0L300 200M300 0L0 200', stroke: '#fff', 'stroke-width': 40 }, g); sv('path', { d: 'M0 0L300 200M300 0L0 200', stroke: '#c8102e', 'stroke-width': 13 }, g); sv('path', { d: 'M150 0v200M0 100h300', stroke: '#fff', 'stroke-width': 66 }, g); sv('path', { d: 'M150 0v200M0 100h300', stroke: '#c8102e', 'stroke-width': 40 }, g); },
  zm: g => { sv('rect', { width: 300, height: 200, fill: '#198a00' }, g); [['#de2010', 0], ['#000', 1], ['#ef7d00', 2]].forEach(([c, i]) => sv('rect', { x: 210 + i * 30, y: 80, width: 30, height: 120, fill: c }, g)); sv('path', { d: 'M230 40q15-14 30 0q-15 4-15 18q0-14-15-18z', fill: '#ef7d00' }, g); },
  tz: g => { sv('rect', { width: 300, height: 200, fill: '#1eb53a' }, g); sv('path', { d: 'M300 0V200H0z', fill: '#00a3dd' }, g); sv('path', { d: 'M0 200L300 0', stroke: '#fcd116', 'stroke-width': 70 }, g); sv('path', { d: 'M0 200L300 0', stroke: '#000', 'stroke-width': 46 }, g); },
  ug: g => { ['#000', '#fcdc04', '#d90000', '#000', '#fcdc04', '#d90000'].forEach((c, i) => sv('rect', { y: i * 200 / 6, width: 300, height: 200 / 6, fill: c }, g)); sv('circle', { cx: 150, cy: 100, r: 40, fill: '#fff' }, g); },
  gh: g => { ['#ce1126', '#fcd116', '#006b3f'].forEach((c, i) => sv('rect', { y: i * 200 / 3, width: 300, height: 200 / 3, fill: c }, g)); sv('path', { d: 'M150 70l9 22h23l-19 13 7 22-20-14-20 14 7-22-19-13h23z', fill: '#000' }, g); },
  sz: g => { ['#3e5eb9', '#ffd900', '#b10c0c', '#ffd900', '#3e5eb9'].forEach((c, i) => sv('rect', { y: [0, 40, 50, 150, 160][i], width: 300, height: [40, 10, 100, 10, 40][i], fill: c }, g)); sv('ellipse', { cx: 150, cy: 100, rx: 70, ry: 36, fill: '#fff' }, g); sv('path', { d: 'M80 100a70 36 0 0 0 140 0z', fill: '#000' }, g); },
  ao: g => { sv('rect', { width: 300, height: 100, fill: '#cc092f' }, g); sv('rect', { y: 100, width: 300, height: 100, fill: '#000' }, g); sv('circle', { cx: 150, cy: 100, r: 34, fill: 'none', stroke: '#ffcb00', 'stroke-width': 10 }, g); },
  cn: g => { sv('rect', { width: 300, height: 200, fill: '#de2910' }, g); sv('path', { d: 'M50 30l9 26h27l-22 16 8 26-22-16-22 16 8-26-22-16h27z', fill: '#ffde00' }, g); },
  in: g => { ['#ff9933', '#fff', '#138808'].forEach((c, i) => sv('rect', { y: i * 200 / 3, width: 300, height: 200 / 3, fill: c }, g)); sv('circle', { cx: 150, cy: 100, r: 26, fill: 'none', stroke: '#000080', 'stroke-width': 5 }, g); },
  ae: g => { ['#00732f', '#fff', '#000'].forEach((c, i) => sv('rect', { y: i * 200 / 3, width: 300, height: 200 / 3, fill: c }, g)); sv('rect', { width: 80, height: 200, fill: '#ff0000' }, g); },
  eu: g => { sv('rect', { width: 300, height: 200, fill: '#003399' }, g); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; sv('circle', { cx: 150 + Math.cos(a) * 60, cy: 100 + Math.sin(a) * 60, r: 8, fill: '#ffcc00' }, g); } },
};
const FOCUS = { zm: .78, us: .32, gb: .5, ae: .4 }; // horizontal point of the flag to centre in the badge
const SQUASH = { ng: 1.5, cd: 1.15, mw: 1.15, ke: 1.15, zw: 1.1, za: 1.1, gb: 1.2, us: 1.1, bw: 1.1, et: 1.15, mz: 1.15, ls: 1.1, so: 1.1 }; // fit more of wide flags
/** circular flag badge centred on 0,0. returns g */
function flag(parent, defs, code, { r = 48, ring = '#ffffff', ringW = 5, shadow = true, gloss = true } = {}) {
  code = code.toLowerCase(); const g = sv('g', {}, parent);
  if (shadow) sv('circle', { cx: 0, cy: r * .18, r: r * 1.02, fill: '#000', opacity: .35, filter: blurFilter(defs, r * .16) }, g);
  const id = uid('fc'); const cp = sv('clipPath', { id }, defs); sv('circle', { r }, cp);
  const inner = sv('g', { 'clip-path': `url(#${id})` }, g);
  const fx = (FOCUS[code] ?? .5) - .5, sq = SQUASH[code] || 1;
  if (FILE_FLAGS.includes(code)) sv('image', { href: ENG + 'assets/flags/' + code + '.svg', x: -r * 1.5 / sq - fx * r * 3 / sq, y: -r, width: r * 3 / sq, height: r * 2, preserveAspectRatio: 'none' }, inner);
  else if (DRAWN[code]) { const fg = sv('g', { transform: `translate(${-r * 1.5 / sq - fx * r * 3 / sq},${-r}) scale(${r / 100 / sq},${r / 100})` }, inner); DRAWN[code](fg); }
  else sv('circle', { r, fill: '#888' }, inner);
  if (gloss) { sv('ellipse', { cx: -r * .25, cy: -r * .45, rx: r * .7, ry: r * .38, fill: '#fff', opacity: .22 }, inner); sv('circle', { r, fill: grad(defs, [[0, '#000', 0], [.7, '#000', 0], [1, '#000', .25]], { radial: true }) }, inner); }
  if (ringW) sv('circle', { r: r - ringW / 2 + .5, fill: 'none', stroke: ring, 'stroke-width': ringW }, g);
  return g;
}
/** rectangular waving flag on a pole (origin = bottom of pole). returns {g, set(t)} */
function flagPole(parent, defs, code, { h = 260, w = 150, fh = 100 } = {}) {
  code = code.toLowerCase(); const g = sv('g', {}, parent); sv('rect', { x: -4, y: -h, width: 8, height: h, rx: 3, fill: '#c9ced6' }, g); sv('circle', { cx: 0, cy: -h, r: 8, fill: '#f2c14e' }, g);
  const strips = []; const N = 12; const id = uid('fp');
  for (let i = 0; i < N; i++) { const cid = uid('fs'); const cp = sv('clipPath', { id: cid }, defs); sv('rect', { x: i * w / N - .5, y: 0, width: w / N + 1, height: fh }, cp);
    const sg = sv('g', {}, g); const inner = sv('g', { 'clip-path': `url(#${cid})` }, sg);
    if (FILE_FLAGS.includes(code)) sv('image', { href: ENG + 'assets/flags/' + code + '.svg', x: 0, y: 0, width: w, height: fh, preserveAspectRatio: 'none' }, inner);
    else if (DRAWN[code]) { const fg = sv('g', { transform: `scale(${w / 300},${fh / 200})` }, inner); DRAWN[code](fg); }
    const shade = sv('rect', { x: i * w / N, y: 0, width: w / N + 1, height: fh, fill: '#000', opacity: 0 }, sg); strips.push({ sg, shade, i }); }
  return { g, set(t) { strips.forEach(s => { const k = s.i / N; const ph = t * 5 - s.i * .55; const dy = Math.sin(ph) * 7 * k; s.sg.setAttribute('transform', `translate(4,${(-h + 6 + dy).toFixed(2)})`); s.shade.setAttribute('opacity', (.18 * (1 + Math.cos(ph)) / 2 * k).toFixed(3)); }); } };
}

// ---------------- icons ----------------
const IC = {
  phone: 'M16 4h16a3 3 0 0 1 3 3v34a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z M21 38h6',
  sim: 'M14 4h14l8 8v29a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z M17 22h14v14H17z M24 22v14 M17 29h14',
  wifi: 'M6 19a26 26 0 0 1 36 0 M12 26a17 17 0 0 1 24 0 M18 33a8 8 0 0 1 12 0 M24 40h.01',
  data: 'M10 40v-6 M18 40v-12 M26 40v-18 M34 40v-26',
  bolt: 'M27 4L11 27h12l-3 17 17-24H25z',
  cart: 'M4 8h6l5 22h22l4-15H13 M19 38h.01 M34 38h.01',
  bread: 'M8 22c0-7 7-12 16-12s16 5 16 12c0 2-2 3-3 3v13H11V25c-1 0-3-1-3-3z M17 16l-2 5 M24 15v5 M31 16l2 5',
  house: 'M6 22L24 7l18 15 M11 18v22h26V18 M20 40V28h8v12',
  family: 'M15 9a5 5 0 1 0 .01 0 M33 9a5 5 0 1 0 .01 0 M7 40v-9a8 8 0 0 1 16 0v9 M25 40v-9a8 8 0 0 1 16 0v9',
  bank: 'M5 18L24 7l19 11z M9 22v14 M17 22v14 M31 22v14 M39 22v14 M5 40h38',
  wallet: 'M6 14h32a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z M6 14l26-8v8 M33 26h9v8h-9z',
  coins: 'M10 12a14 5 0 1 0 28 0a14 5 0 1 0-28 0 M10 12v8c0 3 6 5 14 5s14-2 14-5v-8 M10 20v8c0 3 6 5 14 5s14-2 14-5v-8 M10 28v8c0 3 6 5 14 5s14-2 14-5v-8',
  chart: 'M6 41h36 M10 34l9-10 7 6 12-16 M32 14h6v6',
  calendar: 'M8 10h32v30H8z M8 18h32 M16 6v8 M32 6v8 M14 25h4 M22 25h4 M30 25h4 M14 32h4 M22 32h4',
  clock: 'M24 6a18 18 0 1 0 .01 0 M24 14v10l7 5',
  globe: 'M24 6a18 18 0 1 0 .01 0 M6 24h36 M24 6c-7 6-7 30 0 36 M24 6c7 6 7 30 0 36',
  check: 'M10 25l9 9 19-20', cross: 'M13 13l22 22 M35 13L13 35', up: 'M24 40V8 M12 20L24 8l12 12', down: 'M24 8v32 M12 28l12 12 12-12',
  shop: 'M6 18l3-10h30l3 10 M6 18c0 3 3 5 6 5s6-2 6-5c0 3 3 5 6 5s6-2 6-5c0 3 3 5 6 5s6-2 6-5 M9 23v17h30V23 M20 40V30h8v10',
  bag: 'M18 12h12l-3-6h-6z M17 12c-8 6-11 14-11 20 0 6 6 10 18 10s18-4 18-10c0-6-3-14-11-20z M28 24c-1-2-8-2-8 1.5s8 2 8 5.5-7 3-8 1 M24 21v3 M24 33v3',
  send: 'M6 22L42 6 30 42l-7-15z M23 27L42 6',
  receipt: 'M12 4h24v38l-4-3-4 3-4-3-4 3-4-3-4 3z M17 14h14 M17 21h14 M17 28h9',
  signal: 'M24 22v20 M17 42h14 M24 18h.01 M16 11a12 12 0 0 0 0 15 M32 11a12 12 0 0 1 0 15 M10 5a20 20 0 0 0 0 27 M38 5a20 20 0 0 1 0 27',
  person: 'M24 8a7 7 0 1 0 .01 0 M10 42v-6a14 14 0 0 1 28 0v6',
  printer: 'M13 18V6h22v12 M8 18h32v14h-5 M13 32H8 M13 26h22v16H13z',
  scale: 'M24 6v34 M14 42h20 M8 14h32 M8 14l-6 13h12z M40 14l-6 13h12z',
  percent: 'M10 38L38 10 M14 10a4 4 0 1 0 .01 0 M34 30a4 4 0 1 0 .01 0',
  card: 'M5 12h38v26H5z M5 19h38 M10 31h10',
  voucher: 'M5 14h38v8a4 4 0 0 0 0 8v8H5v-8a4 4 0 0 0 0-8z M30 14v24',
  hash: 'M18 6l-4 36 M34 6l-4 36 M8 17h34 M6 31h34',
  plane: 'M42 8L6 22l12 4 4 14 6-10 10 6z M18 26L42 8',
  bus: 'M8 8h32v28H8z M8 26h32 M14 36v5 M34 36v5 M14 31h.01 M34 31h.01 M8 16h32',
  star: 'M24 5l5.6 12.4L43 19l-10 9.3 2.7 13.7L24 35.2 12.3 42 15 28.3 5 19l13.4-1.6z',
  lock: 'M12 22h24v20H12z M16 22v-6a8 8 0 0 1 16 0v6 M24 30v5',
  fire: 'M24 4c2 8 12 12 12 24a12 12 0 0 1-24 0c0-6 4-9 5-14 2 4 5 5 5 5s-1-8 2-15z',
  bulb: 'M17 30c-4-3-7-7-7-12a14 14 0 0 1 28 0c0 5-3 9-7 12v5H17z M18 41h12 M20 35v-6 M28 35v-6',
  water: 'M24 5C17 15 11 22 11 30a13 13 0 0 0 26 0c0-8-6-15-13-25z',
  tv: 'M5 10h38v26H5z M17 42h14 M24 36v6',
};
/** circular icon badge; returns {g, draw(k)} (k 0..1 draws the line art) */
function icon(parent, defs, name, { r = 40, bg = '#ffffff', fg = '#0d372b', ring = null, sw = 3.4, shadow = true } = {}) {
  const g = sv('g', {}, parent); const rip = sv('circle', { r, fill: 'none', stroke: bg, 'stroke-width': 3, opacity: 0 }, g); const seed = (ICN = (ICN + .37) % 1);
  if (shadow) sv('circle', { cy: r * .16, r, fill: '#000', opacity: .3, filter: blurFilter(defs, r * .15) }, g);
  sv('circle', { r, fill: grad(defs, [[0, lt(bg, .12)], [1, dk(bg, .1)]], { x1: 0, y1: 0, x2: .3, y2: 1 }) }, g);
  if (ring) sv('circle', { r: r - 2.5, fill: 'none', stroke: ring, 'stroke-width': 5 }, g);
  const s = r * 1.1 / 48; const p = sv('path', { d: IC[name] || IC.star, fill: 'none', stroke: fg, 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, transform: `scale(${s}) translate(-24,-24)` }, g);
  p.style.strokeDasharray = '1 1';
  return { g, path: p, draw(k) { p.style.strokeDashoffset = (1 - clamp(k)).toFixed(4);
    // once drawn, a ring keeps pulsing out of the badge
    const now = C.now || 0; const ph = (now * .62 + seed) % 1; const on = k >= 1 ? 1 : 0; rip.setAttribute('r', (r * (1 + .6 * E.outC(ph))).toFixed(1)); rip.setAttribute('opacity', (on * .55 * (1 - ph)).toFixed(3)); } };
}
let ICN = 0;
/** pop-in transform helper: places g at x,y with overshoot scale + small spin; returns progress */
function pop(g, x, y, t, a, { s = 1, dur = .45, spin = 0, out = 1e9, outDur = .3, idle = 1 } = {}) {
  const q = E.outB(prog(t, a, a + dur)); const o = 1 - E.inC(prog(t, out, out + outDur)); const k = Math.max(.001, q * o);
  // after it lands, keep it alive: a slow bob, sway and breathe (Rodney 11 Nov 2026: "non-stop motion")
  const ik = idle * E.ioS(prog(t, a + dur * .6, a + dur + .5)); const ph = x * .013 + y * .007;
  const by = Math.sin(t * 1.7 + ph * 7) * 6 * ik, rr = Math.sin(t * 1.15 + ph * 5) * 2.4 * ik, br = 1 + Math.sin(t * 2.2 + ph * 3) * .025 * ik;
  g.setAttribute('transform', `translate(${x.toFixed(1)},${(y + by).toFixed(1)}) rotate(${((1 - q) * spin + rr).toFixed(2)}) scale(${(s * k * br).toFixed(4)})`); g.setAttribute('opacity', q > .001 && o > .001 ? 1 : 0); return q * o;
}

// ---------------- callouts, labels, highlight ----------------
/** label with an elbow leader line from `from` (the thing) to `to` (the label). returns {g, set(k)} */
function callout(parent, defs, { from, to, text, sub = '', color = '#85ed70', ink = '#fff', size = 30, bg = 'rgba(8,20,16,.82)' } = {}) {
  const g = sv('g', {}, parent); const mx = to[0], my = from[1] + (to[1] - from[1]) * 1;
  const d = `M ${from[0]} ${from[1]} L ${lerp(from[0], to[0], .45)} ${to[1]} L ${to[0]} ${to[1]}`;
  const line = sv('path', { d, fill: 'none', stroke: color, 'stroke-width': 3, pathLength: 1, 'stroke-linecap': 'round' }, g); line.style.strokeDasharray = '1 1';
  const dot = sv('circle', { cx: from[0], cy: from[1], r: 7, fill: color }, g); const ring = sv('circle', { cx: from[0], cy: from[1], r: 7, fill: 'none', stroke: color, 'stroke-width': 3 }, g);
  const right = to[0] >= from[0]; const lab = sv('g', {}, g);
  const tw = Math.max(text.length * size * .52, sub.length * size * .36) + 36; const th = sub ? size * 2.1 : size * 1.5;
  sv('rect', { x: right ? to[0] : to[0] - tw, y: to[1] - th / 2, width: tw, height: th, rx: 10, fill: bg }, lab); sv('rect', { x: right ? to[0] : to[0] - 6, y: to[1] - th / 2, width: 6, height: th, rx: 3, fill: color }, lab);
  C.T(lab, text, { x: right ? to[0] + 20 : to[0] - tw + 16, y: to[1] - (sub ? size * .38 : 0), 'text-anchor': 'start', 'font-size': size, fill: ink });
  if (sub) C.T(lab, sub, { x: right ? to[0] + 20 : to[0] - tw + 16, y: to[1] + size * .52, 'text-anchor': 'start', 'font-size': size * .66, fill: ink, opacity: .75, 'font-family': 'Barlow', 'font-weight': 600 });
  return { g, set(k, t = 0) { line.style.strokeDashoffset = (1 - E.ioC(clamp(k * 2))).toFixed(4); const q = E.outB(clamp(k * 2 - 1)); lab.setAttribute('opacity', clamp(q * 3));
    lab.setAttribute('transform', `translate(${(1 - q) * (right ? -20 : 20)},0)`); dot.setAttribute('r', 7 * E.outB(clamp(k * 4))); const rk = (t * .9) % 1; ring.setAttribute('r', 7 + rk * 18); ring.setAttribute('opacity', k > .2 ? 1 - rk : 0); } };
}
/** DOM text with a marker highlight sweep; html may contain <em>; returns {el, set(t, a)} */
function highlight(parent, html, { size = 72, color = '#fff', mark = '#85ed70', markInk = '#0d372b', font = "'Barlow Condensed'", weight = 800 } = {}) {
  const e = el('div', { class: 'abs' }, parent); e.style.cssText += `font:${weight} ${size}px/1.1 ${font};color:${color};white-space:nowrap;`;
  e.innerHTML = html.replace(/<mark>(.*?)<\/mark>/g, `<span class="hl" style="padding:0 .12em;background:linear-gradient(${mark},${mark}) no-repeat 0 60%/0% 78%;border-radius:4px">$1</span>`);
  const hl = [...e.querySelectorAll('.hl')];
  return { el: e, set(t, a, dur = .45) { hl.forEach((h, i) => { const q = E.ioC(prog(t, a + i * .2, a + i * .2 + dur)); h.style.backgroundSize = `${(q * 100).toFixed(1)}% 78%`; h.style.color = q > .5 ? markInk : color; }); } };
}
/** rolling-digit odometer (DOM). set(value) rolls smoothly. */
function odometer(parent, { digits = 6, size = 120, color = '#fff', font = "'Barlow Condensed'", prefix = '', group = 3, weight = 800 } = {}) {
  const e = el('div', { class: 'abs' }, parent); e.style.cssText += `font:${weight} ${size}px/1 ${font};color:${color};white-space:nowrap;display:flex;align-items:flex-end;text-shadow:0 8px 30px rgba(0,0,0,.45)`;
  if (prefix) el('span', {}, e, prefix);
  const cols = [];
  for (let i = digits - 1; i >= 0; i--) {
    if (i < digits - 1 && (i + 1) % group === 0) el('span', { style: 'display:inline-block;width:.22em' }, e);
    const win = el('span', {}, e); win.style.cssText = 'display:inline-block;height:1em;overflow:hidden;position:relative;width:.56em;text-align:center';
    const strip = el('span', {}, win, '0<br>1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>0'); strip.style.cssText = 'display:block;line-height:1em'; cols.push({ i, win, strip });
  }
  return { el: e, set(v) { v = Math.max(0, v); const mag = v < 1 ? 1 : Math.floor(Math.log10(v)) + 1; cols.forEach(c => { let p;
    if (c.i === 0) p = v % 10; else { const low = (v % Math.pow(10, c.i)) / Math.pow(10, c.i); p = Math.floor(v / Math.pow(10, c.i)) % 10 + Math.max(0, (low - .9) / .1); }
    c.strip.style.transform = `translateY(${(-p).toFixed(3)}em)`; c.win.style.opacity = c.i < mag ? 1 : .0; c.win.style.width = c.i < mag ? '.56em' : '0'; }); } };
}
/** stat card (DOM): big value line + label, with accent bar */
function statCard(parent, { value = '', label = '', color = '#85ed70', w = 420, iconSvg = '' } = {}) {
  const e = el('div', { class: 'abs' }, parent, `<div style="display:flex;gap:18px;align-items:center;width:${w}px;padding:22px 26px;border-radius:18px;background:rgba(10,14,18,.78);box-shadow:0 20px 50px rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.08)"><div style="width:8px;align-self:stretch;border-radius:4px;background:${color}"></div><div><div class="v" style="font:800 64px/1 'Barlow Condensed';color:#fff">${value}</div><div style="font:600 26px/1.2 Barlow;color:rgba(255,255,255,.75);margin-top:6px">${label}</div></div></div>`);
  return { el: e, v: e.querySelector('.v') };
}
/** horizontal timeline (svg). events: [{k (0..1 position), label, sub}] ; set(k) where k = progress of the playhead */
function timeline(parent, defs, { x = 260, y = 760, w = 1400, events = [], color = '#85ed70', ink = '#fff' } = {}) {
  const g = sv('g', {}, parent); sv('rect', { x, y: y - 3, width: w, height: 6, rx: 3, fill: '#fff', opacity: .18 }, g);
  const bar = sv('rect', { x, y: y - 3, width: 0, height: 6, rx: 3, fill: color }, g); const head = sv('circle', { cx: x, cy: y, r: 11, fill: '#fff' }, g);
  const ev = events.map((e, i) => { const eg = sv('g', {}, g); const ex = x + e.k * w; sv('circle', { cx: ex, cy: y, r: 16, fill: '#0b1512', stroke: color, 'stroke-width': 5 }, eg);
    const up = i % 2 === 0; sv('line', { x1: ex, y1: y + (up ? -18 : 18), x2: ex, y2: y + (up ? -70 : 70), stroke: color, 'stroke-width': 3 }, eg);
    C.T(eg, e.label, { x: ex, y: y + (up ? -100 : 100), 'font-size': 44, fill: ink }); if (e.sub) C.T(eg, e.sub, { x: ex, y: y + (up ? -142 : 140), 'font-size': 26, fill: ink, opacity: .75, 'font-family': 'Barlow', 'font-weight': 600 });
    return { eg, k: e.k, ex }; });
  return { g, set(k) { const kk = clamp(k); bar.setAttribute('width', w * kk); head.setAttribute('cx', x + w * kk); ev.forEach(e => { const q = E.outB(clamp((kk - e.k) / .08 + .5)); e.eg.setAttribute('opacity', clamp(q * 2)); e.eg.setAttribute('transform', `translate(0,${(1 - q) * 20})`); }); } };
}

// ---------------- motion along arcs ----------------
const qbez = (p0, pc, p1, k) => { const u = 1 - k; return [u * u * p0[0] + 2 * u * k * pc[0] + k * k * p1[0], u * u * p0[1] + 2 * u * k * pc[1] + k * k * p1[1]]; };
const arcCtrl = (p0, p1, lift = .35) => { const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2; const d = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]); return [mx, my - d * lift]; };
/** moves `node` from p0 to p1 along an arc with a fading trail; returns set(k) */
function flyer(parent, node, p0, p1, { lift = .35, trail = 10, color = '#85ed70', rotate = false, s = 1 } = {}) {
  const pc = arcCtrl(p0, p1, lift); const tg = sv('g', {}, parent); const dots = []; for (let i = 0; i < trail; i++) dots.push(sv('circle', { r: 6 * (1 - i / trail), fill: color }, tg)); parent.appendChild(node);
  return k => { const kk = clamp(k); const p = qbez(p0, pc, p1, E.ioC(kk)); const p2 = qbez(p0, pc, p1, E.ioC(Math.min(1, kk + .01))); const ang = Math.atan2(p2[1] - p[1], p2[0] - p[0]) * 180 / Math.PI;
    node.setAttribute('transform', `translate(${p[0].toFixed(1)},${p[1].toFixed(1)}) rotate(${rotate ? ang.toFixed(1) : 0}) scale(${s * (kk > 0 && kk < 1 ? 1 : (kk >= 1 ? 1 : .001))})`); node.setAttribute('opacity', kk > 0 ? 1 : 0);
    dots.forEach((d, i) => { const q = qbez(p0, pc, p1, E.ioC(Math.max(0, kk - (i + 1) * .018))); d.setAttribute('cx', q[0]); d.setAttribute('cy', q[1]); d.setAttribute('opacity', kk > 0 && kk < 1 ? (1 - i / trail) * .6 : 0); }); };
}
/** dashed travelling arc (svg) between points; returns set(k, t) */
function dashArc(parent, defs, p0, p1, { lift = .35, color = '#85ed70', width = 5, dash = 14 } = {}) {
  const pc = arcCtrl(p0, p1, lift); const d = `M ${p0[0]} ${p0[1]} Q ${pc[0]} ${pc[1]} ${p1[0]} ${p1[1]}`;
  const glow = sv('path', { d, fill: 'none', stroke: color, 'stroke-width': width * 3, opacity: .22, filter: blurFilter(defs, 6), pathLength: 1 }, parent);
  const p = sv('path', { d, fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-dasharray': `${dash} ${dash * .8}` }, parent);
  const mid = uid('mk'); const m = sv('mask', { id: mid, maskUnits: 'userSpaceOnUse', x: -5000, y: -5000, width: 10000, height: 10000 }, defs); const mp = sv('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': width * 4, pathLength: 1 }, m); mp.style.strokeDasharray = '1 1'; p.setAttribute('mask', `url(#${mid})`); glow.style.strokeDasharray = '1 1';
  const head = sv('circle', { r: width * 1.6, fill: '#fff' }, parent);
  return (k, t = 0) => { const kk = clamp(k); mp.style.strokeDashoffset = 1 - kk; glow.style.strokeDashoffset = 1 - kk; p.setAttribute('stroke-dashoffset', (-t * 60).toFixed(1)); const q = qbez(p0, pc, p1, kk); head.setAttribute('cx', q[0]); head.setAttribute('cy', q[1]); head.setAttribute('opacity', kk > 0 && kk < 1 ? 1 : 0); };
}

// ---------------- bursts, rings, sparkles ----------------
function burst(parent, x, y, { n = 12, r0 = 30, r1 = 120, color = '#85ed70', width = 6 } = {}) {
  const g = sv('g', { transform: `translate(${x},${y})` }, parent); const ls = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; ls.push({ l: sv('line', { stroke: color, 'stroke-width': width, 'stroke-linecap': 'round' }, g), a }); }
  const ring = sv('circle', { r: 0, fill: 'none', stroke: color, 'stroke-width': 4 }, g);
  return k => { const kk = clamp(k); const a = E.outC(kk), b = E.outC(clamp(kk * 1.6 - .3)); ls.forEach(o => { const c = Math.cos(o.a), s = Math.sin(o.a); const ra = lerp(r0, r1, b), rb = lerp(r0, r1, a); o.l.setAttribute('x1', c * ra); o.l.setAttribute('y1', s * ra); o.l.setAttribute('x2', c * rb); o.l.setAttribute('y2', s * rb); o.l.setAttribute('opacity', kk > 0 && kk < 1 ? 1 : 0); });
    ring.setAttribute('r', r1 * 1.1 * E.outC(kk)); ring.setAttribute('opacity', kk > 0 ? (1 - kk) : 0); };
}
function sparkles(parent, { n = 18, area = [0, 0, 1920, 1080], color = '#fff', seed = 4 } = {}) {
  const R = rnd(seed); const items = []; for (let i = 0; i < n; i++) { const g = sv('path', { d: 'M0 -10 L2.5 -2.5 L10 0 L2.5 2.5 L0 10 L-2.5 2.5 L-10 0 L-2.5 -2.5 Z', fill: color }, parent); items.push({ g, x: area[0] + R() * area[2], y: area[1] + R() * area[3], ph: R() * 10, sp: .6 + R() }); }
  return t => items.forEach(p => { const k = (Math.sin(t * p.sp * 2 + p.ph) + 1) / 2; p.g.setAttribute('transform', `translate(${p.x},${p.y}) scale(${(k * k * 1.3).toFixed(3)}) rotate(${(t * 40).toFixed(1)})`); p.g.setAttribute('opacity', k); });
}

// ---------------- animated backgrounds & haze ----------------
/** soft drifting colour blobs */
function blobs(L, { colors = ['#1f6f4a', '#0b3f2f', '#2f8a5a'], n = 7, seed = 2, o = .55, blur = 80 } = {}) {
  const R = rnd(seed); const f = blurFilter(L.defs, blur); const g = sv('g', { filter: f, opacity: o }, L.svg); const items = [];
  for (let i = 0; i < n; i++) items.push({ c: sv('circle', { r: 200 + R() * 260, fill: colors[i % colors.length] }, g), x: R() * L.w, y: R() * L.h, ph: R() * 10, sp: .05 + R() * .08 });
  return t => items.forEach(p => { p.c.setAttribute('cx', p.x + Math.sin(t * p.sp * 2 + p.ph) * 160); p.c.setAttribute('cy', p.y + Math.cos(t * p.sp * 1.6 + p.ph) * 110); });
}
/** perspective-free dotted grid that slides */
function dotGrid(L, { color = '#ffffff', o = .08, gap = 48, r = 2.2 } = {}) {
  const id = uid('pt'); const pt = sv('pattern', { id, width: gap, height: gap, patternUnits: 'userSpaceOnUse' }, L.defs); sv('circle', { cx: gap / 2, cy: gap / 2, r, fill: color }, pt);
  const rect = sv('rect', { x: -gap, y: -gap, width: L.w + gap * 2, height: L.h + gap * 2, fill: `url(#${id})`, opacity: o }, L.svg);
  return t => rect.setAttribute('transform', `translate(${((t * 12) % gap).toFixed(1)},${((t * 6) % gap).toFixed(1)})`);
}
/** floating currency symbols / glyphs */
function glyphs(L, { chars = ['R', '$', 'Z$'], n = 24, color = '#ffffff', o = [.04, .12], size = [40, 120], seed = 6 } = {}) {
  const R = rnd(seed); const items = []; for (let i = 0; i < n; i++) { const e = C.T(L.svg, chars[i % chars.length], { 'font-size': lerp(size[0], size[1], R()), fill: color, opacity: lerp(o[0], o[1], R()) }); items.push({ e, x: R() * L.w, y: R() * L.h, sp: 10 + R() * 25, rs: (R() - .5) * 20, ph: R() * 6 }); }
  return t => items.forEach(p => { const y = ((p.y - t * p.sp) % (L.h + 200) + L.h + 200) % (L.h + 200) - 100; p.e.setAttribute('transform', `translate(${(p.x + Math.sin(t * .4 + p.ph) * 30).toFixed(1)},${y.toFixed(1)}) rotate(${(p.rs * Math.sin(t * .3 + p.ph)).toFixed(1)})`); });
}
/** depth haze: a full-layer gradient (put it in its own layer between depths) */
function haze(L, { color = '#f6d8a6', o = .5, from = .35, to = 1 } = {}) { return sv('rect', { x: 0, y: 0, width: L.w, height: L.h, fill: grad(L.defs, [[0, color, 0], [from, color, 0], [to, color, o]]) }, L.svg); }
/** god-light overlay in a DOM layer (screen blend) */
function lightBeam(parent, { x = 1500, y = -100, angle = 25, color = 'rgba(255,240,200,.18)' } = {}) { const e = el('div', { class: 'abs' }, parent); e.style.cssText += `width:600px;height:1800px;left:${x}px;top:${y}px;transform-origin:50% 0;transform:rotate(${angle}deg);background:linear-gradient(90deg,transparent,${color},transparent);filter:blur(30px);mix-blend-mode:screen;pointer-events:none`; return e; }

// ---------------- UI pieces ----------------
/** notification banner (DOM) like a phone toast */
function toast(parent, { title = 'Airtime received', sub = '', color = '#2f8a4a', iconTxt = '✓' } = {}) {
  return el('div', { class: 'abs' }, parent, `<div style="display:flex;gap:16px;align-items:center;background:#fff;color:#111;border-radius:24px;padding:16px 26px 16px 16px;box-shadow:0 24px 60px rgba(0,0,0,.35);font-family:Barlow"><div style="width:52px;height:52px;border-radius:16px;background:${color};color:#fff;display:grid;place-items:center;font:800 30px/1 Barlow">${iconTxt}</div><div><div style="font:800 30px/1.1 Barlow">${title}</div>${sub ? `<div style="font:600 22px/1.2 Barlow;color:#555;margin-top:4px">${sub}</div>` : ''}</div></div>`);
}
/** a key-cap chip (DOM) for codes like *130* */
function keycap(parent, txt, { color = '#ffffff', bg = '#14251f', accent = '#85ed70', size = 92 } = {}) {
  return el('div', { class: 'abs' }, parent, `<div style="font:800 ${size}px/1 'Barlow Condensed';color:${color};background:linear-gradient(${bg},#0a1511);padding:.12em .28em .16em;border-radius:.2em;box-shadow:0 .1em 0 ${accent}, 0 .3em .5em rgba(0,0,0,.45);border:2px solid rgba(255,255,255,.08);white-space:nowrap">${txt}</div>`);
}
/** subscribe button with a cursor click (DOM); set(t, a) */
function subscribe(parent, { text = 'SUBSCRIBE' } = {}) {
  const e = el('div', { class: 'abs' }, parent, `<div class="b" style="display:flex;align-items:center;gap:14px;font:800 40px/1 Barlow;letter-spacing:.06em;color:#fff;background:#e62117;padding:20px 34px;border-radius:999px;box-shadow:0 14px 40px rgba(0,0,0,.4)"><span class="tx">${text}</span></div><div class="cur" style="position:absolute;width:44px;height:44px;left:0;top:0"><svg width="44" height="44" viewBox="0 0 24 24"><path d="M4 2l16 10-7 1 4 8-3 1-4-8-6 5z" fill="#fff" stroke="#111" stroke-width="1.2"/></svg></div>`);
  const b = e.querySelector('.b'), cur = e.querySelector('.cur'), tx = e.querySelector('.tx');
  return { el: e, set(t, a) { const m = E.ioC(prog(t, a, a + .7)); cur.style.transform = `translate(${lerp(420, 230, m)}px,${lerp(160, 40, m)}px)`; const click = t > a + .75; b.style.transform = `scale(${t > a + .7 && t < a + .85 ? .94 : 1})`;
    b.style.background = click ? '#3a3a3a' : '#e62117'; tx.textContent = click ? 'SUBSCRIBED ✓' : text; } };
}

Object.assign(C, { flag, flagPole, FLAG_CODES: [...FILE_FLAGS, ...Object.keys(DRAWN)], IC, icon, pop, callout, highlight, odometer, statCard, timeline, qbez, arcCtrl, flyer, dashArc, burst, sparkles, blobs, dotGrid, glyphs, haze, lightBeam, toast, keycap, subscribe });
})();
