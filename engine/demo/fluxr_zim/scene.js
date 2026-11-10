/* Fluxr Explains — sample: "Why Zimbabwe uses US dollars" (cold open + Fluxr part). Theme: fluxr. */
const C = CINE; const { shot, cue, E, tw, prog, clamp, lerp, kf, spr, noise1, sv, G, P, el, Person, SKIN, HAIR, poseAt } = C;
const BASE = window.SCENE.replace(/[^/]+$/, ''); const KIT = '/home/claude/fluxr-posts/kit/';
const LEAD = .6; const V = C.voice(C.loadJSON(BASE + 'words_min.json'), LEAD);
const at = (w, after = 0) => V.at(w, after), to = (w, after = 0) => V.to(w, after);
C.setTheme('fluxr'); C.NOTE.USD10 = ['#5e7d5c', '#d9e3cf', '$10'];
const LIME = '#85ed70', DEEP = '#0d372b', GOLD = '#ffc94d';
window.META = { music: { style: 'amapiano', drop: at('in', 15) - .05, end: 63.5, breaks: [[at('within') - .1, at('within') + .9]] } };
C.initFX({ grain: .055, vignette: .5 });
const bug = el('div', { class: 'bug' }, C.stage, `<img src="${KIT}logos/fluxr-white.png" style="height:34px"> <span style="opacity:.8">EXPLAINS</span>`);

// ---------- shared builders ----------
function kicker(parent, text, { x = 120, y = 120, color = LIME } = {}) {
  const e = el('div', { class: 'abs' }, parent, `<div style="display:inline-flex;align-items:center;gap:16px;font:800 40px/1 'Barlow Condensed';letter-spacing:.12em;color:#fff;background:rgba(6,20,15,.62);padding:12px 22px 12px 14px;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.25)"><span style="width:10px;height:44px;background:${color};border-radius:3px"></span>${text}</div>`);
  e.style.left = x + 'px'; e.style.top = y + 'px'; return e;
}
const vendorO = { skin: SKIN.dark, hair: 'scarf', female: true, scarf: '#1f8a5a', scarf2: '#f6d32d', shirt: '#e2603a', skirt: '#2c4a8a', skirtPattern: '#f6d32d', earrings: true, seed: 11 };
const custO = { skin: SKIN.brown, hair: 'fade', shirt: '#f0f0ea', pants: '#3d4b66', jacket: '#4a6b8a', seed: 12 };
function market(w, { dayK = 0 } = {}) {
  const L4 = w.layer(6, { w: 3200, h: 1800 }), L3 = w.layer(3, { w: 2800, h: 1500 }), L2 = w.layer(1.7, { w: 2400, h: 1300 }), L1 = w.layer(1, { w: 1920, h: 1080 }), L0 = w.layer(.6, { w: 1920, h: 1080 });
  const sky1 = C.sky(L4, [[0, '#6aa7d8'], [.6, '#f3c58a'], [1, '#f9e2b4']]); const sky2 = C.sky(L4, [[0, '#3f6fb0'], [.55, '#f2a65e'], [1, '#f6c27a']]);
  const sun = C.sun(L4, 0, 0, { r: 110 }); C.G(sun, 0, 0);
  const cl = [C.cloud(L4.svg, L4.defs, { s: 1.2, o: .85 }), C.cloud(L4.svg, L4.defs, { s: .8, o: .7 }), C.cloud(L4.svg, L4.defs, { s: 1, o: .75 })];
  C.hills(L3, 860, { color: '#7d9a6a', amp: 90, seed: 4 }); const sk = C.skyline(L3.svg, L3.defs, { w: 2800, h: 330, color: '#6b7fa4', seed: 21 }); G(sk.g, 0, 980);
  sv('rect', { x: 0, y: 975, width: 2800, height: 600, fill: '#c9925e' }, L3.svg);
  // background stalls and passers-by
  const bgSt = [C.stall(L2.svg, L2.defs, { a1: '#2f7d9e' }), C.stall(L2.svg, L2.defs, { a1: '#e0a52f' }), C.stall(L2.svg, L2.defs, { a1: '#8e44ad' })];
  bgSt.forEach((s, i) => G(s, 380 + i * 820, 1010, 0, .95)); sv('rect', { x: 0, y: 1008, width: 2400, height: 400, fill: '#c98a55' }, L2.svg);
  const walkers = [new Person(L2.svg, L2.defs, { skin: SKIN.deep, hair: 'cap', cap: '#c0392b', shirt: '#2fbf71', seed: 21 }), new Person(L2.svg, L2.defs, { skin: SKIN.medium, hair: 'braids', female: true, shirt: '#f3a712', skirt: '#a23b72', seed: 22 }), new Person(L2.svg, L2.defs, { skin: SKIN.dark, hair: 'short', shirt: '#4c9be8', seed: 23 })];
  C.ground(L1, 900, { color: '#c98a55', line: false });
  const vendor = new Person(L1.svg, L1.defs, vendorO);
  const st = C.stall(L1.svg, L1.defs, { w: 760, h: 520, a1: '#d9483b' }); G(st, 760, 960);
  const breadG = C.bread(L1.svg, L1.defs, {}); G(breadG, 600, 778, 0, .55);
  const board = C.chalkboard(L1.svg, L1.defs, { w: 330, h: 230, title: 'BREAD' }); G(board, 1010, 690, -3, 1);
  const price = C.T(board, 'Z$ 100 000', { y: 30, 'font-size': 58, fill: '#fff3c4', 'font-family': 'Barlow Condensed' });
  const sub = C.T(board, '', { y: 82, 'font-size': 24, fill: LIME, 'font-family': 'Barlow', 'font-weight': 700 });
  const cust = new Person(L1.svg, L1.defs, custO);
  // foreground crates
  const fg = sv('g', {}, L0.svg); for (let i = 0; i < 3; i++) { const cg = sv('g', {}, fg); sv('rect', { x: -170, y: -120, width: 340, height: 160, rx: 8, fill: '#8a6240' }, cg); for (let j = 0; j < 8; j++) sv('circle', { cx: -130 + j * 37, cy: -130, r: 24, fill: ['#e4572e', '#f3a712', '#2fbf71'][i] }, cg); G(cg, [90, 1840, 1500][i], [1080, 1090, 1180][i], 0, 1.1); }
  return { L4, L3, L2, L1, L0, sky1, sky2, sun, cl, walkers, vendor, cust, price, sub, board };
}
function setMarket(m, t, lt, dayK) {
  m.sky2.setAttribute('opacity', dayK); G(m.sun, lerp(900, 2300, dayK), lerp(620, 380, dayK));
  m.cl.forEach((c, i) => G(c, (600 + i * 900 + t * (12 + i * 5)) % 3400 - 100, 260 + i * 90));
  m.walkers.forEach((p, i) => { const sp = [70, -55, 90][i]; const x = ((i * 700 + lt * sp) % 2600 + 2600) % 2600 - 100; p.set(t, { x, y: 1060, s: .62, side: 1, flip: sp < 0, walk: lt * 1.1 + i * .3, expr: 'neutral' }); });
}

// ================= SHOT 1: Harare market, morning -> afternoon =================
const S1 = [0, at('prices') - .05];
shot(S1[0], S1[1] + .35, ({ root, world }) => { const w = world(); const m = market(w); const u = C.ui(root);
  const k1 = kicker(u, 'HARARE, ZIMBABWE · 2008', { x: 110, y: 110 });
  const chip = el('div', { class: 'chip' }, u, 'MORNING'); chip.style.background = '#fff3c4';
  return { w, m, k1, chip };
}, (s, lt, t) => {
  const dayK = E.ioS(prog(t, at('afternoon') - .6, at('morning') - .2));
  setMarket(s.m, t, lt, dayK);
  s.m.vendor.set(t, { x: 640, y: 960, s: .72, pose: poseAt(t, [[0, 'relaxed'], [at('cost') - .3, 'present'], [at('afternoon'), 'shrug']]), expr: t > at('afternoon') ? 'worried' : 'smile', turn: .25, talk: 0 });
  s.m.cust.set(t, { x: 1330, y: 990, s: 1.02, pose: poseAt(t, [[0, 'stand'], [at('afternoon') + .2, 'facepalm']]), turn: -.6, look: [-.8, .1], expr: t > at('afternoon') + .2 ? 'shock' : 'neutral' });
  // price climbs (illustrative)
  const k = prog(t, 1.2, at('morning') + .2); const v = Math.round(100000 * Math.pow(2, k * 4) / 1000) * 1000;
  s.m.price.textContent = 'Z$ ' + v.toLocaleString('en-ZA').replace(/,/g, ' '); s.m.sub.textContent = t > at('afternoon') ? '▲ AFTERNOON PRICE' : '';
  if (!s.c1) { s.c1 = 1; for (let i = 0; i < 9; i++) cue(1.3 + i * ((at('morning') - 1.2) / 9), 'tick', .5); cue(at('afternoon'), 'ding', .6); cue(at('2008') - .1, 'whoosh_low', .7); }
  // camera: start tight on the price board, pull out to the scene
  const z = kf(t, [[0, 2.35], [at('harare'), 1.9], [at('afternoon'), 1.28], [S1[1], 1.18]], E.ioC);
  const cx = kf(t, [[0, 50], [at('afternoon'), 60], [S1[1], 40]]), cy = kf(t, [[0, 150], [at('afternoon'), 90], [S1[1], 60]]);
  s.w.camera({ x: cx + noise1(t * .3, 1) * 6, y: cy + noise1(t * .3, 2) * 4, zoom: z, rot: noise1(t * .2, 3) * .3, focus: 1, dof: .9 });
  P(s.k1, { o: E.outC(prog(t, at('2008') - .2, at('2008') + .4)) * (1 - prog(t, S1[1] - .3, S1[1])), x: (1 - E.outC(prog(t, at('2008') - .2, at('2008') + .5))) * -60, anchor: 'tl' });
  s.chip.textContent = t > at('afternoon') - .1 ? 'AFTERNOON' : 'MORNING'; s.chip.style.background = t > at('afternoon') - .1 ? '#ffb45e' : '#fff3c4';
  P(s.chip, { x: 230, y: 210, o: prog(t, 1.4, 1.8), s: 1 + .25 * Math.max(0, 1 - Math.abs(t - at('afternoon')) * 5) });
}, { in: 'fade', tin: .6 });

// ================= SHOT 2a: doubling every day =================
const S2 = [at('prices') - .05, at('people') - .1];
shot(S2[0], S2[1] + .3, ({ root, world }) => { const w = world(); const Lb = w.layer(3, { w: 2600, h: 2400 }), L = w.layer(1, { w: 1920, h: 3200 });
  C.studio(Lb, { c1: '#164a3a', c2: '#06150f', key: LIME, kx: .5, ky: .62 });
  for (let i = 0; i < 40; i++) sv('line', { x1: 0, y1: 400 + i * 60, x2: 2600, y2: 400 + i * 60, stroke: LIME, opacity: .05 }, Lb.svg);
  const bars = []; const base = 2700;
  for (let i = 0; i < 7; i++) { const g = sv('g', {}, L.svg); const x = 330 + i * 210; const r = sv('rect', { x: x - 80, y: base, width: 160, height: 0, rx: 14, fill: C.grad(L.defs, [[0, '#d9ffcf'], [.25, LIME], [1, '#2f8a4a']]) }, g);
    const gl = sv('rect', { x: x - 80, y: base, width: 160, height: 0, rx: 14, fill: LIME, opacity: .35, filter: C.blurFilter(L.defs, 16) }, g); g.insertBefore(gl, r);
    const lab = C.T(g, 'DAY ' + (i + 1), { x, y: base + 50, 'font-size': 36, fill: '#cfe9d8' }); const val = C.T(g, '×' + Math.pow(2, i), { x, y: base - 30, 'font-size': 52, fill: '#fff' }); bars.push({ r, gl, val, x }); }
  sv('line', { x1: 160, y1: base, x2: 1760, y2: base, stroke: '#cfe9d8', 'stroke-width': 3, opacity: .5 }, L.svg);
  const u = C.ui(root); const t1 = C.kTitle(u, 'PRICES <b>DOUBLED</b>', { size: 120, width: 1100, align: 'left' }); const t2 = C.kTitle(u, 'roughly every day', { size: 64, weight: 700, font: "'Barlow'", color: '#cfe9d8', width: 1100, align: 'left' });
  return { w, L, bars, base, t1, t2 };
}, (s, lt, t) => {
  const a0 = S2[0] + .3, step = (at('day') - a0) / 6.2;
  s.bars.forEach((b, i) => { const st = a0 + i * step; const q = E.outB(prog(t, st, st + .45)); const h = 30 * Math.pow(2, i) * q; b.r.setAttribute('y', s.base - h); b.r.setAttribute('height', h); b.gl.setAttribute('y', s.base - h); b.gl.setAttribute('height', h); b.val.setAttribute('y', s.base - h - 34); b.val.setAttribute('opacity', q);
    if (!s['c' + i]) { s['c' + i] = 1; cue(st, 'pop', .5 + i * .05); } });
  const last = a0 + 6 * step; const follow = E.ioC(prog(t, a0 + 3 * step, last + .6));
  s.w.camera({ x: lerp(-40, 120, follow), y: lerp(760, 420, follow), zoom: lerp(1.04, .9, follow), rot: lerp(-1.5, 1, prog(t, S2[0], S2[1])), focus: 1, dof: .6 });
  s.t1.set(t, S2[0] + .15, .09, .5, S2[1] - .2); P(s.t1.el, { x: 680, y: 190 }); s.t2.set(t, at('roughly') - .1, .06, .4, S2[1] - .2); P(s.t2.el, { x: 680, y: 295 });
  if (!s.cc) { s.cc = 1; cue(S2[0], 'swish', .6); cue(last + .1, 'riser', .4); }
}, { in: 'zoom', tin: .35 });

// ================= SHOT 2b: bags of cash =================
const S3 = [at('people') - .1, at('in', 13) - .05];
shot(S3[0], S3[1] + .3, ({ root, world }) => { const w = world();
  const L4 = w.layer(5, { w: 4200, h: 1600 }), L3 = w.layer(2.4, { w: 4800, h: 1400 }), L1 = w.layer(1, { w: 6000, h: 1080 }), L0 = w.layer(.55, { w: 7000, h: 1080 });
  C.sky(L4, [[0, '#5d95c9'], [.7, '#f0bd85'], [1, '#f6d8a6']]); C.sun(L4, 2600, 520, { r: 100 });
  const sk = C.skyline(L3.svg, L3.defs, { w: 4800, h: 360, color: '#7c8db0', seed: 7 }); G(sk.g, 0, 1000); sv('rect', { x: 0, y: 990, width: 4800, height: 500, fill: '#b98457' }, L3.svg);
  // shop fronts row
  const cols = ['#f2b632', '#5aa8ff', '#e4572e', '#2fbf71', '#a23b72', '#f6efe2', '#16a085'];
  for (let i = 0; i < 9; i++) { const sp = C.spaza(L1.svg, L1.defs, { w: 600, h: 400, wall: cols[i % cols.length], sign: ['GROCERIES', 'BUTCHERY', 'BAKERY', 'GENERAL DEALER', 'HARDWARE', 'GROCERIES', 'TUCK SHOP', 'BAKERY', 'GROCERIES'][i], accent: ['#d9483b', '#1d3557', '#6b4a2f', '#2b2f3a'][i % 4] }); G(sp, 300 + i * 680, 820, 0, 1); }
  C.road(L1, 830, { h: 260 });
  const man = new Person(L1.svg, L1.defs, { skin: SKIN.dark, hair: 'cap', cap: '#2f7d4f', shirt: '#e8e2d0', pants: '#5b4636', seed: 31 });
  const wb = C.wheelbarrow(L1.svg, L1.defs, { fill: g => { for (let i = 0; i < 12; i++) { const n = C.noteStack(g, L1.defs, { kind: 'ZWD', n: 4, w: 150, h: 70, band: '#f2b632' }); G(n, -160 + (i % 4) * 76, -56 - Math.floor(i / 4) * 34, (i * 23) % 24 - 12, 1); } } });
  const wom = new Person(L1.svg, L1.defs, { skin: SKIN.brown, hair: 'scarf', scarf: '#8e44ad', scarf2: '#f6d32d', female: true, shirt: '#2fbf71', skirt: '#1d3557', seed: 32 });
  const bag = sv('g', {}, L1.svg); sv('path', { d: 'M -70 -10 Q -80 110 0 120 Q 80 110 70 -10 Z', fill: '#c9b48a' }, bag); for (let i = 0; i < 5; i++) { const n = C.note(bag, L1.defs, { kind: 'ZWD', w: 110, h: 52 }); n.setAttribute('transform', `translate(${-40 + i * 20},${-14 - (i % 2) * 10}) rotate(${-20 + i * 10})`); } sv('path', { d: 'M -74 -6 Q 0 14 74 -6 L 70 10 Q 0 30 -70 10 Z', fill: '#a8946a' }, bag);
  wom.hold(1, bag, { x: 0, y: 30, r: 0, upright: true, s: .9 });
  const fg = sv('g', {}, L0.svg); for (let i = 0; i < 6; i++) { const lp = C.lamp(fg, L0.defs, { h: 900, on: 0 }); G(lp, 900 + i * 1500, 1100, 0, 1.2); }
  const u = C.ui(root); const k = kicker(u, 'BAGS OF CASH, JUST TO BUY GROCERIES', { x: 110, y: 900 });
  return { w, man, wb, wom, k };
}, (s, lt, t, kk) => {
  const x = 900 + lt * 260; const ph = lt * 1.25;
  s.man.set(t, { x, y: 980, s: 1, side: 1, walk: ph, stride: 18, pose: 'push', walkArms: 0, expr: 'focus' });
  G(s.wb.g, x + 330, 920, 0, -1.15, 1.15); s.wb.wheel.setAttribute('transform', `translate(-150,70) rotate(${lt * 260})`);
  s.wom.set(t, { x: 2900 - lt * 190, y: 860, s: .8, side: 1, flip: true, walk: lt * 1.05 + .4, stride: 22, pose: 'hold', walkArms: .2, expr: 'worried' });
  s.w.camera({ x: x + 250 - 3000, y: -40, zoom: 1.12, focus: 1, dof: .9, rot: noise1(t * .4, 5) * .4 });
  P(s.k, { o: E.outC(prog(t, at('bags') - .2, at('bags') + .3)) * (1 - prog(t, S3[1] - .2, S3[1] + .2)), anchor: 'tl', x: (1 - E.outC(prog(t, at('bags') - .2, at('bags') + .5))) * -40 });
  if (!s.c) { s.c = 1; cue(S3[0], 'whoosh', .6); for (let i = 0; i < 6; i++) cue(S3[0] + .2 + i * .62, 'step', .35); cue(at('cash'), 'paper', .7); }
}, { in: 'whip', tin: .4, dir: 1 });

// ================= SHOT 3: the 100 trillion dollar note =================
const S4 = [at('in', 13) - .05, at('within') - .2];
shot(S4[0], S4[1] + .35, ({ root, world }) => { const w = world(); const Lb = w.layer(3, { w: 2600, h: 1600 }); C.studio(Lb, { c1: '#123b5c', c2: '#050b14', key: '#9fd0ff', kx: .5, ky: .45 });
  const bk = C.bokeh(Lb, { n: 40, color: '#9fd0ff', area: [0, 0, 2600, 1600], size: [10, 40], alpha: [.04, .14] });
  const u = C.ui(root);
  const card = C.card3d(u, 1100, 500, { persp: 1600 }); const n = C.note(card.svg, card.defs, { kind: 'ZWD', w: 1080, h: 480 }); G(n, 550, 250);
  const eq = el('div', { class: 'abs' }, u, '='); eq.style.cssText += "font:800 160px/1 'Barlow Condensed';color:#fff;";
  const fs = C.svgBox(1920, 1080, u); const fsd = sv('defs', {}, fs); const fan = [['USD20', -10], ['USD10', 8]].map(([k, r], i) => { const g = C.note(fs, fsd, { kind: k, w: 420, h: 200 }); return { g, r, i }; });
  const k30 = C.counter(u, { size: 150, color: LIME, prefix: '≈ US$' });
  const kick = kicker(u, 'JANUARY 2009', { x: 110, y: 110, color: '#9fd0ff' });
  const big = C.kTitle(u, 'ONE HUNDRED <em>TRILLION</em> DOLLARS', { size: 92, width: 1700 });
  const day = C.kTitle(u, 'worth on its first day', { size: 50, weight: 700, font: "'Barlow'", color: '#cfe0ff', width: 900 });
  return { w, bk, card, eq, fan, k30, kick, big, day };
}, (s, lt, t) => {
  s.bk(t);
  const inK = E.outQu(prog(t, S4[0] + .1, S4[0] + 1.6)); const side = E.ioC(prog(t, at('on', 20) - .2, at('on', 20) + .9));
  const ry = lerp(-75, -14, inK) + Math.sin(t * .8) * 4 + lerp(0, 22, side), rx = lerp(25, 9, inK) + Math.cos(t * .6) * 2;
  s.card.set({ x: lerp(960, 600, side), y: lerp(620, 600, side) + Math.sin(t * 1.3) * 8, rx, ry, rz: lerp(-8, -3, inK), s: lerp(.6, 1.18, inK) * lerp(1, .72, side), light: ((t - S4[0]) * .45) % 1.6 - .3, o: prog(t, S4[0], S4[0] + .2) });
  s.kick.style.opacity = prog(t, S4[0] + .2, S4[0] + .6) * (1 - prog(t, S4[1] - .2, S4[1]));
  s.big.set(t, at('one', 15) - .1, .12, .45, at('on', 20) - .1); P(s.big.el, { x: 960, y: 235 });
  P(s.eq, { x: 1050, y: 560, o: E.outC(prog(t, at('worth', 20) - .2, at('worth', 20) + .2)), s: E.outB(prog(t, at('worth', 20) - .2, at('worth', 20) + .3)) });
  s.fan.forEach(f => { const q = E.outB(prog(t, at('thirty') - .2 + f.i * .15, at('thirty') + .35 + f.i * .15)); G(f.g, 1460 + f.i * 60, 520 + f.i * 50, f.r * q, .001 + q * .95); f.g.setAttribute('opacity', q > .01 ? 1 : 0); });
  const kq = prog(t, at('thirty') - .1, at('dollars', 23) - .2); s.k30.set(Math.round(30 * E.outC(kq))); P(s.k30.el, { x: 1500, y: 860, o: kq > 0 ? 1 : 0 });
  s.day.set(t, at('first', 20) - .1, .06, .4, S4[1] - .1); P(s.day.el, { x: 1500, y: 300 });
  s.w.camera({ x: Math.sin(t * .3) * 30, y: 0, zoom: 1.05 + lt * .01, focus: 1, dof: 1 });
  if (!s.c) { s.c = 1; cue(S4[0] + .1, 'whoosh_low', .8); cue(at('one', 15), 'impact', .55); cue(at('worth', 20), 'swish', .5); cue(at('thirty') - .1, 'cash', .6); cue(at('dollars', 23), 'coin', .4); }
}, { in: 'flash', tin: .25 });

// ================= SHOT 4a: goodbye Zim dollar (notes blow away) =================
const S5 = [at('within') - .2, at('people', 28) - .1];
shot(S5[0], S5[1] + .35, ({ root, world }) => { const w = world(); const Lb = w.layer(3, { w: 2600, h: 1600 }); C.studio(Lb, { c1: '#2a2f3a', c2: '#07080b', key: '#ffd9a0', kx: .55, ky: .45 });
  const L = w.layer(1, { w: 1920, h: 1080 }); const R = C.rnd(5); const notes = [];
  for (let i = 0; i < 26; i++) { const n = C.note(L.svg, L.defs, { kind: 'ZWD', w: 300, h: 136 }); notes.push({ n, x0: 760 + (R() - .5) * 500, y0: 520 + (R() - .5) * 300, vx: 700 + R() * 900, vy: -120 + R() * 260, rs: (R() - .5) * 400, d: R() * .9, ph: R() * 6 }); }
  const u = C.ui(root); const t1 = C.kTitle(u, 'GOODBYE, <em>ZIMBABWE DOLLAR</em>', { size: 104, width: 1700 }); const t2 = C.kTitle(u, 'suspended in April 2009', { size: 48, weight: 700, font: "'Barlow'", color: '#ddd', width: 1200 });
  return { w, notes, t1, t2 };
}, (s, lt, t) => {
  const gust = at('within') + .1;
  s.notes.forEach(p => { const tt = Math.max(0, t - gust - p.d * .6); const x = p.x0 + p.vx * tt * tt * .6 + Math.sin(tt * 3 + p.ph) * 30 * tt, y = p.y0 + p.vy * tt + Math.sin(tt * 4 + p.ph) * 40 * tt;
    p.n.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${(p.rs * tt + (p.ph - 3) * 6).toFixed(1)}) scale(${(.9 * Math.cos(tt * 3 + p.ph)).toFixed(3)},.9)`); });
  s.t1.set(t, at('stopped') - .2, .1, .5, S5[1] - .1); P(s.t1.el, { x: 960, y: 520 }); s.t2.set(t, at('own') - .1, .05, .4, S5[1] - .1); P(s.t2.el, { x: 960, y: 640 });
  s.w.camera({ x: lt * 20, y: 0, zoom: 1 + lt * .03, focus: 1, dof: .6, rot: -lt * .3 });
  if (!s.c) { s.c = 1; cue(gust - .2, 'wind', .7); cue(gust + .2, 'flutter', .8); cue(at('stopped'), 'stamp', .55); }
}, { in: 'zoom', tin: .3 });

// ================= SHOT 4b: paying in US dollars and rand =================
const S6 = [at('people', 28) - .1, at('today') - .1];
shot(S6[0], S6[1] + .35, ({ root, world }) => { const w = world(); const m = market(w); const u = C.ui(root);
  const usd = C.note(m.L1.svg, m.L1.defs, { kind: 'USD20', w: 200, h: 96 }); const zar = C.coin(m.L1.svg, m.L1.defs, { r: 36, label: 'R5', metal: 'bi' }); const zarN = C.note(m.L1.svg, m.L1.defs, { kind: 'ZAR50', w: 200, h: 96 });
  m.cust.hold(1, usd, { x: 0, y: 10, r: 90, s: 1 });
  m.board.style.display = 'none'; const p1 = C.pill(u, 'US DOLLARS', { border: LIME }); const p2 = C.pill(u, 'SOUTH AFRICAN RAND', { border: GOLD });
  return { w, m, usd, zar, zarN, p1, p2 };
}, (s, lt, t) => {
  setMarket(s.m, t, lt, .6);
  const give = at('paid'); const handed = t > give + .55;
  if (handed && s.m.cust.held[1]) { s.m.cust.hold(1, null); s.m.vendor.hold(1, s.usd, { x: 0, y: 10, r: -90 }); }
  if (!handed && s.m.vendor.held[1]) { s.m.vendor.hold(1, null); s.m.cust.hold(1, s.usd, { x: 0, y: 10, r: 90, s: 1 }); }
  s.m.cust.set(t, { x: 1250, y: 990, s: 1.02, flip: true, pose: poseAt(t, [[0, 'stand'], [give - .3, { lean: 4, head: 2, aA: [-8, 6], aB: [82, -16], lA: [-3, 0], lB: [3, 0] }]]), turn: .6, look: [.8, 0], expr: 'smile' });
  s.m.vendor.set(t, { x: 640, y: 960, s: .72, pose: poseAt(t, [[0, 'relaxed'], [give - .2, { lean: 2, head: 4, aA: [-10, 6], aB: [96, -26], lA: [-3, 0], lB: [3, 0] }], [at('rand') - .2, 'celebrate']]), expr: t > give ? 'happy' : 'smile', turn: .35 });
  // rand coin + note land on the counter
  const q = prog(t, at('rand') - .35, at('rand') + .2); const cy = lerp(600, 760, E.outB(q));
  G(s.zar.g, 690, cy, 0, q > 0 ? 1 : .001); s.zar.flip(q < 1 ? q * 720 : 0); G(s.zarN, 560, lerp(560, 768, E.outB(prog(t, at('rand') - .2, at('rand') + .35))), -8 + 14 * prog(t, at('rand'), at('instead')), prog(t, at('rand') - .2, at('rand')) > 0 ? .8 : .001);
  s.w.camera({ x: lerp(-60, 60, prog(t, S6[0], S6[1])), y: 40, zoom: lerp(1.55, 1.42, prog(t, S6[0], S6[1])), focus: 1, dof: 1 });
  P(s.p1, { x: 330, y: 170, o: E.outC(prog(t, at('us', 29) - .1, at('us', 29) + .3)), s: E.outB(prog(t, at('us', 29) - .1, at('us', 29) + .35)) });
  P(s.p2, { x: 400, y: 265, o: E.outC(prog(t, at('south', 30) - .1, at('south', 30) + .3)), s: E.outB(prog(t, at('south', 30) - .1, at('south', 30) + .35)) });
  if (!s.c) { s.c = 1; cue(S6[0], 'swish', .5); cue(give + .4, 'paper', .7); cue(at('us', 29), 'pop', .5); cue(at('south', 30), 'pop', .5); cue(at('rand') + .1, 'coin', .7); cue(at('rand') + .35, 'paper', .4); }
}, { in: 'whip', tin: .35, dir: -1 });

// ================= SHOT 5: the map =================
const S7 = [at('today') - .1, at('and', 38) - .05];
shot(S7[0], S7[1] + .35, ({ root, world }) => { const w = world(); const Lb = w.layer(4, { w: 3000, h: 2000 }); C.studio(Lb, { c1: '#123a2f', c2: '#03110c', key: LIME, kx: .5, ky: .5 });
  for (let i = 0; i < 60; i++) sv('line', { x1: i * 50, y1: 0, x2: i * 50, y2: 2000, stroke: LIME, opacity: .035 }, Lb.svg);
  const L = w.layer(1, { w: 1920, h: 1080 }); const map = C.africaMap(L.svg, L.defs, { land: '#1d4d3c', stroke: '#3f7f63' }); G(map.g, 960 - 505, 540 - 510, 0, 1);
  map.highlight('ZAF', '#ffc94d', .85); map.highlight('ZWE', LIME, .9);
  const J = map.proj(28.05, -26.2), cities = [[31.05, -17.83, 'Harare'], [28.58, -20.15, 'Bulawayo'], [32.67, -18.97, 'Mutare'], [29.82, -19.45, 'Gweru'], [30.83, -20.07, 'Masvingo']].map(([lo, la, n]) => ({ p: map.proj(lo, la), n }));
  const arcs = cities.map(c => map.arc(J, c.p, { color: LIME, width: 3.5, lift: .4 })); const pins = cities.map((c, i) => map.pin(c.p, { label: i === 0 ? c.n : '', size: 18 })); const pj = map.pin(J, { color: '#ffc94d', label: 'Johannesburg', size: 18 });
  const u = C.ui(root); const k = kicker(u, 'SOUTH AFRICA → ZIMBABWE', { x: 110, y: 110 });
  const t1 = C.kTitle(u, 'MILLIONS OF FAMILIES', { size: 96, width: 1200, align: 'left' }); const t2 = C.kTitle(u, 'count on support sent from South Africa', { size: 46, weight: 700, font: "'Barlow'", color: '#cfe9d8', width: 1200, align: 'left' });
  const parts = C.bokeh(L, { n: 30, color: LIME, size: [3, 8], alpha: [.1, .35], area: [500, 300, 900, 700], drift: 8 });
  return { w, arcs, pins, pj, k, t1, t2, J, parts };
}, (s, lt, t) => {
  s.parts(t); s.arcs.forEach((a, i) => a(E.ioC(prog(t, at('sent') - .9 + i * .18, at('sent') + .5 + i * .18)))); s.pins.forEach(p => p(t)); s.pj(t);
  const z = kf(t, [[S7[0], 1.0], [at('families') + .2, 2.3], [S7[1], 2.75]], E.ioC);
  const cx = lerp(0, (s.J[0] - 70) - 505, prog(z, 1, 2.75)), cy = lerp(0, (s.J[1] - 90) - 510, prog(z, 1, 2.75));
  s.w.camera({ x: cx, y: cy, zoom: z, rot: lerp(-3, 0, prog(t, S7[0], S7[1])), focus: 1, dof: .8 });
  P(s.k, { anchor: 'tl', o: E.outC(prog(t, S7[0] + .2, S7[0] + .6)) }); s.t1.set(t, at('millions') - .1, .1, .5, S7[1] - .1); P(s.t1.el, { x: 720, y: 820 }); s.t2.set(t, at('count') - .1, .04, .4, S7[1] - .1); P(s.t2.el, { x: 720, y: 910 });
  if (!s.c) { s.c = 1; cue(S7[0], 'whoosh_low', .7); cue(at('sent') - .5, 'swoosh_up', .5); cue(at('sent') + .4, 'sparkle', .5); }
}, { in: 'zoom', tin: .4 });

// ================= SHOT 6: Fluxr logo =================
const S8 = [at('and', 38) - .05, at('buy', 40) - .1];
shot(S8[0], S8[1] + .3, ({ root, world }) => { const w = world(); const Lb = w.layer(2, { w: 2400, h: 1400 }); C.studio(Lb, { c1: '#14513e', c2: '#04140e', key: LIME, kx: .5, ky: .5 });
  const ring = sv('circle', { cx: 1200, cy: 700, r: 10, fill: 'none', stroke: LIME, 'stroke-width': 6 }, Lb.svg); const ring2 = sv('circle', { cx: 1200, cy: 700, r: 10, fill: 'none', stroke: '#fff', 'stroke-width': 2 }, Lb.svg);
  const rays = C.rays(Lb, 1200, 700, { n: 14, len: 1400, color: LIME, alpha: .07, spread: 360, angle: 0 });
  const u = C.ui(root); const logo = el('img', { src: KIT + 'logos/fluxr-white.png', class: 'abs' }, u); logo.style.width = '760px';
  const t1 = C.kTitle(u, 'we built Fluxr for <b>exactly this</b>', { size: 54, weight: 700, font: "'Barlow'", color: '#e6f5ec', width: 1400 });
  return { w, ring, ring2, rays, logo, t1 };
}, (s, lt, t) => {
  s.rays(t); const hit = at('built'); const q = spr(t, hit - .1, 6, 11); const r = E.outC(prog(t, hit, hit + 1.2));
  s.ring.setAttribute('r', 40 + r * 900); s.ring.setAttribute('opacity', 1 - r); s.ring2.setAttribute('r', 20 + E.outC(prog(t, hit + .1, hit + 1.4)) * 700); s.ring2.setAttribute('opacity', 1 - prog(t, hit + .1, hit + 1.4));
  P(s.logo, { x: 960, y: 500, s: Math.max(.001, q), o: prog(t, hit - .1, hit + .05), blur: (1 - clamp(q)) * 10 });
  s.t1.set(t, at('exactly') - .1, .06, .4, S8[1] - .1); P(s.t1.el, { x: 960, y: 700 });
  s.w.camera({ x: 0, y: 0, zoom: 1 + lt * .02, focus: 1, dof: 0 });
  if (!s.c) { s.c = 1; cue(hit - .9, 'swell', .7); cue(hit, 'impact', .6); cue(hit + .05, 'sparkle', .6); }
}, { in: 'fade', tin: .3 });

// ================= SHOT 7: buy a voucher at the spaza =================
const S9 = [at('buy', 40) - .1, at('dial') - .05];
shot(S9[0], S9[1] + .3, ({ root, world }) => { const w = world(); const L4 = w.layer(4, { w: 2800, h: 1600 }), L1 = w.layer(1, { w: 1920, h: 1080 });
  C.sky(L4, [[0, '#f0a46b'], [1, '#f9d9a5']]); const sk = C.skyline(L4.svg, L4.defs, { w: 2800, h: 300, color: '#c48a6a', seed: 3, joburg: true }); G(sk.g, 0, 1000); sv('rect', { x: 0, y: 995, width: 2800, height: 700, fill: '#b9805a' }, L4.svg);
  C.ground(L1, 880, { color: '#b9805a' });
  const sp = C.spaza(L1.svg, L1.defs, { w: 1000, h: 600, wall: '#f2b632', sign: 'SPAZA · AIRTIME · VOUCHERS', accent: '#1f6f4a' }); G(sp, 760, 920);
  const hatch = sv('g', { 'clip-path': C.clipRect(L1.defs, 320, 440, 580, 160) }, L1.svg); const owner = new Person(hatch, L1.defs, { skin: SKIN.dark, hair: 'bald', beard: true, shirt: '#2f7d4f', seed: 41 });
  const cust = new Person(L1.svg, L1.defs, { skin: SKIN.medium, hair: 'braids', female: true, shirt: '#e4572e', pants: '#29335c', seed: 42 });
  const slip = C.slip(L1.svg, L1.defs, { w: 230, title: 'VOUCHER', lines: [['R50.00', 30, true], ['PIN •••• •••• ••••', 18], ['THANK YOU', 18]] });
  const u = C.ui(root); const logos = ['1voucher', 'ott-voucher', 'blu-voucher', 'fnb-voucher', '4all-voucher'].map(n => { const d = el('div', { class: 'abs' }, u, `<img src="${KIT}logos/${n}.png" style="max-width:220px;max-height:64px">`); d.style.cssText += 'background:#fff;border-radius:18px;padding:18px 24px;box-shadow:0 14px 40px rgba(0,0,0,.35);display:grid;place-items:center;width:240px;height:78px;'; return d; });
  const k = kicker(u, 'BUY A VOUCHER AT YOUR LOCAL STORE', { x: 110, y: 110 });
  return { w, owner, cust, slip, logos, k };
}, (s, lt, t) => {
  s.owner.set(t, { x: 600, y: 900, s: .8, pose: poseAt(t, [[0, 'relaxed'], [at('voucher', 42) - .2, 'give']]), expr: 'smile', turn: .4 });
  s.cust.set(t, { x: 1340, y: 1000, s: 1.05, pose: poseAt(t, [[0, 'stand'], [at('voucher', 42), 'receive']]), side: .2, turn: -.7, look: [-.7, 0], expr: 'smile' });
  const pr = prog(t, at('voucher', 42) - .2, at('store') + .1); G(s.slip.g, 960, 520, 4, 1); s.slip.setReveal(E.ioS(pr)); s.slip.g.setAttribute('opacity', pr > 0 ? 1 : 0);
  s.logos.forEach((d, i) => { const st = at('local') - .2 + i * .1; const q = E.outB(prog(t, st, st + .4)); P(d, { x: 1130 + (i % 3) * 262 + (i > 2 ? 131 : 0), y: 240 + Math.floor(i / 3) * 112 + (1 - q) * 60, o: clamp(q * 2), s: .74 }); });
  s.w.camera({ x: lerp(160, 80, prog(t, S9[0], S9[1])), y: -150, zoom: lerp(1.45, 1.3, prog(t, S9[0], S9[1])), focus: 1, dof: .8 });
  P(s.k, { anchor: 'tl', o: E.outC(prog(t, S9[0] + .1, S9[0] + .5)) });
  if (!s.c) { s.c = 1; cue(S9[0], 'shopbell', .5); cue(at('voucher', 42) - .15, 'print', .6); for (let i = 0; i < 5; i++) cue(at('local') - .2 + i * .1, 'pop', .35); }
}, { in: 'whip', tin: .35, dir: 1 });

// ================= SHOT 8: dial the code (synced to spoken digits) =================
const S10 = [at('dial') - .05, at('send', 51) - .05];
shot(S10[0], S10[1] + .3, ({ root, world }) => { const w = world(); const Lb = w.layer(3, { w: 2600, h: 1600 }); C.studio(Lb, { c1: '#16503d', c2: '#04120d', key: LIME, kx: .35, ky: .5 });
  const bk = C.bokeh(Lb, { n: 30, color: LIME, area: [0, 0, 2600, 1600], size: [12, 40], alpha: [.04, .12] });
  const L = w.layer(1, { w: 1920, h: 1080 }); const fp = C.featurePhone(L.svg, L.defs, { w: 340, h: 690, color: '#27303c' }); G(fp.g, 560, 560, -6, 1.15);
  const hi = sv('circle', { r: 46, fill: LIME, opacity: 0 }, L.svg);
  const u = C.ui(root); const code = el('div', { class: 'abs' }, u); code.style.cssText += "font:800 108px/1 'Barlow Condensed';color:#fff;letter-spacing:.02em;white-space:nowrap;text-shadow:0 10px 40px rgba(0,0,0,.5)";
  const lab = el('div', { class: 'abs' }, u, 'any phone · no data needed'); lab.style.cssText += "font:700 44px/1 'Barlow';color:#cfe9d8;white-space:nowrap";
  // key events from the words
  const seq = [['star', '*'], ['one', '1'], ['three', '3'], ['zero', '0'], ['star', '*'], ['three', '3'], ['one', '1'], ['zero', '0'], ['two', '2'], ['six', '6'], ['star', '*']];
  let after = at('dial'); const ev = seq.map(([wd, ch]) => { const tt = at(wd, after); after = tt + .01; return { t: tt, ch }; });
  ev.push({ t: at('pin', 49) - .1, ch: 'PIN', pin: true }); ev.push({ t: at('hash'), ch: '#' });
  ev.forEach(e => cue(e.t, e.pin ? 'type' : 'dtmf' + e.ch, e.pin ? .5 : .9));
  return { w, fp, code, lab, ev, hi, bk };
}, (s, lt, t) => {
  s.bk(t); let txt = '', last = null; for (const e of s.ev) if (t >= e.t) { txt += e.pin ? 'VoucherPIN' : e.ch; last = e; }
  const disp = txt.replace('VoucherPIN', '<span style="color:#85ed70">VoucherPIN</span>');
  s.code.innerHTML = disp + (Math.floor(t * 2.5) % 2 ? '<span style="opacity:.6">|</span>' : '&nbsp;');
  P(s.code, { x: 1340, y: 470, o: prog(t, S10[0], S10[0] + .3) });
  const ussd = txt.replace('VoucherPIN', '••••'); const lines = []; for (let i = 0; i < ussd.length; i += 11) lines.push(ussd.slice(i, i + 11)); s.fp.setText(lines.length ? lines : ['']);
  // key highlight on the phone keypad
  const keys = '123456789*0#'; if (last && !last.pin && t - last.t < .22) { const i = keys.indexOf(last.ch); const kx = -170 + 36 + (i % 3) * ((340 - 72) / 2), ky = -345 + 60 + 690 * .36 + 40 + Math.floor(i / 3) * 52;
    const sc = 1.15, a = -6 * Math.PI / 180; const px = 560 + sc * (kx * Math.cos(a) - ky * Math.sin(a)), py = 560 + sc * (kx * Math.sin(a) + ky * Math.cos(a)); s.hi.setAttribute('cx', px); s.hi.setAttribute('cy', py); s.hi.setAttribute('opacity', .5 * (1 - (t - last.t) / .22)); } else s.hi.setAttribute('opacity', 0);
  P(s.lab, { x: 1340, y: 600, o: E.outC(prog(t, at('hash') + .1, at('hash') + .5)) });
  s.w.camera({ x: lerp(-40, 20, prog(t, S10[0], S10[1])), y: 0, zoom: lerp(1.02, 1.1, prog(t, S10[0], S10[1])), focus: 1, dof: .8, rot: noise1(t * .3, 2) * .4 });
}, { in: 'zoom', tin: .3 });

// ================= SHOT 9: family back home / your own phone here =================
const S11 = [at('send', 51) - .05, to('africa', 56) + .5];
shot(S11[0], S11[1] + .3, ({ root, world }) => { const w = world(); const Lb = w.layer(3, { w: 2600, h: 1600 }), L = w.layer(1, { w: 1920, h: 1080 });
  sv('rect', { x: 0, y: 0, width: 2600, height: 1600, fill: '#0a2a20' }, Lb.svg);
  // left: home (Zimbabwe), warm; right: here (South Africa), cool
  const clipL = C.clipRect(L.defs, -200, -200, 1160, 1480); const clipR = C.clipRect(L.defs, 960, -200, 1200, 1480);
  const left = sv('g', { 'clip-path': clipL }, L.svg), right = sv('g', { 'clip-path': clipR }, L.svg);
  sv('rect', { x: -200, y: -200, width: 1200, height: 1500, fill: C.grad(L.defs, [[0, '#f0a46b'], [1, '#f9d9a5']]) }, left);
  const hs = sv('g', {}, left); [[110, '#e9e1d2'], [480, '#f2d5a8']].forEach(([x, c]) => G(C.house(hs, L.defs, { wall: c, type: 'rdp' }), x, 820, 0, 1.1));
  sv('rect', { x: -200, y: 820, width: 1200, height: 400, fill: '#c98a55' }, left);
  const tw = C.tower(left, L.defs, { h: 420, wave: LIME }); G(tw.g, 800, 820, 0, .9);
  const gogo = new Person(left, L.defs, { skin: SKIN.dark, hair: 'scarf', scarf: '#c0392b', scarf2: '#f6efe2', female: true, elder: true, glasses: true, shirt: '#5aa8ff', skirt: '#1d3557', seed: 51 });
  const ph1 = C.phone(left, L.defs, { w: 80, h: 160, screenFn: (g, w2, h2) => { sv('rect', { x: 0, y: 0, width: w2, height: h2, fill: '#0d372b' }, g); C.T(g, '✓', { x: w2 / 2, y: h2 * .4, 'font-size': 40, fill: LIME }); C.T(g, 'AIRTIME', { x: w2 / 2, y: h2 * .64, 'font-size': 12, fill: '#fff' }); } });
  gogo.hold(1, ph1.g, { x: -4, y: 10, r: 0, upright: true, s: 1 });
  sv('rect', { x: 960, y: -200, width: 1200, height: 1500, fill: C.grad(L.defs, [[0, '#5a7fbf'], [1, '#a9c4e8']]) }, right);
  const sk = C.skyline(right, L.defs, { w: 1100, h: 330, color: '#3c5486', seed: 9, joburg: true, windows: .25 }); G(sk.g, 960, 820); sv('rect', { x: 960, y: 820, width: 1200, height: 400, fill: '#6f7e94' }, right);
  const guy = new Person(right, L.defs, { skin: SKIN.brown, hair: 'short', shirt: '#2fbf71', pants: '#29335c', seed: 52 });
  const ph2 = C.phone(right, L.defs, { w: 80, h: 160, screenFn: (g, w2, h2) => { sv('rect', { x: 0, y: 0, width: w2, height: h2, fill: '#0d372b' }, g); C.T(g, '+1GB', { x: w2 / 2, y: h2 * .42, 'font-size': 24, fill: LIME }); C.T(g, 'DATA', { x: w2 / 2, y: h2 * .64, 'font-size': 12, fill: '#fff' }); } });
  guy.hold(1, ph2.g, { x: -4, y: 10, r: 0, upright: true, s: 1 });
  const div = sv('rect', { x: 954, y: -200, width: 12, height: 1500, fill: LIME }, L.svg);
  const u = C.ui(root); const pL = C.pill(u, 'FAMILY BACK HOME', { border: LIME }); const pR = C.pill(u, 'YOUR OWN PHONE, HERE', { border: GOLD });
  const n1 = el('div', { class: 'abs' }, u, '<div style="background:#fff;color:#111;border-radius:22px;padding:18px 26px;font:700 30px/1.25 Barlow;box-shadow:0 20px 50px rgba(0,0,0,.35)"><span style="color:#2f8a4a">●</span> Airtime received</div>');
  const n2 = el('div', { class: 'abs' }, u, '<div style="background:#fff;color:#111;border-radius:22px;padding:18px 26px;font:700 30px/1.25 Barlow;box-shadow:0 20px 50px rgba(0,0,0,.35)"><span style="color:#2f8a4a">●</span> Data added</div>');
  return { w, tw, gogo, guy, pL, pR, n1, n2, div, ph1, ph2 };
}, (s, lt, t) => {
  s.tw.pulse(t); const g1 = at('airtime') + .2, g2 = at('top') + .1;
  s.gogo.set(t, { x: 420, y: 960, s: 1.12, pose: t > g1 ? 'phone' : 'relaxed', expr: t > g1 + .4 ? 'happy' : 'smile', turn: .3 });
  s.guy.set(t, { x: 1460, y: 960, s: 1.12, pose: t > g2 ? 'phone' : 'stand', expr: t > g2 + .4 ? 'happy' : 'neutral', turn: -.3 });
  const sh = E.outB(prog(t, g1, g1 + .3)); P(s.n1, { x: 690, y: 330, o: prog(t, g1, g1 + .15), s: .6 + .4 * sh }); const sh2 = E.outB(prog(t, g2, g2 + .3)); P(s.n2, { x: 1720, y: 330, o: prog(t, g2, g2 + .15), s: .6 + .4 * sh2 });
  P(s.pL, { x: 480, y: 150, o: E.outC(prog(t, at('family', 52) - .1, at('family', 52) + .3)) }); P(s.pR, { x: 1440, y: 150, o: E.outC(prog(t, at('own', 54) - .2, at('own', 54) + .2)) });
  s.w.camera({ x: lerp(-160, 160, E.ioC(prog(t, at('or', 54) - .4, at('or', 54) + .6))), y: -40, zoom: 1.22, focus: 1, dof: 0 });
  if (!s.c) { s.c = 1; cue(S11[0], 'swish', .5); cue(g1, 'buzz', .6); cue(g1 + .05, 'notif', .6); cue(g2, 'buzz', .5); cue(g2 + .05, 'notif', .6); }
}, { in: 'iris', tin: .5, ix: 30, iy: 50 });

// ================= SHOT 10: end card =================
const S12 = [S11[1], S11[1] + 5.2];
shot(S12[0], S12[1], ({ root, world }) => { const w = world(); const Lb = w.layer(2, { w: 2400, h: 1400 }); C.studio(Lb, { c1: '#14513e', c2: '#04140e', key: LIME });
  const bk = C.bokeh(Lb, { n: 34, color: LIME, area: [0, 0, 2400, 1400], size: [10, 40], alpha: [.04, .13] });
  const u = C.ui(root); const logo = el('img', { src: KIT + 'logos/fluxr-white.png', class: 'abs' }, u); logo.style.width = '520px';
  const code = el('div', { class: 'abs' }, u, '*130*31026*<span style="color:#85ed70">VoucherPIN</span>#'); code.style.cssText += "font:800 104px/1 'Barlow Condensed';color:#fff;white-space:nowrap";
  const l1 = el('div', { class: 'abs' }, u, 'Or get the <b style="color:#85ed70">Fluxr app on Google Play</b>'); l1.style.cssText += "font:700 46px/1 Barlow;color:#e6f5ec;white-space:nowrap";
  const l2 = el('div', { class: 'abs' }, u, 'www.fluxr.co.za'); l2.style.cssText += "font:700 40px/1 Barlow;color:#a9c4b8;white-space:nowrap;letter-spacing:.06em";
  const sub = C.pill(u, '▶  SUBSCRIBE FOR THE NEXT STORY', { border: LIME, bg: 'rgba(133,237,112,.12)' });
  return { w, bk, logo, code, l1, l2, sub };
}, (s, lt, t) => {
  s.bk(t); const a = S12[0];
  P(s.logo, { x: 960, y: 250, s: E.outB(prog(t, a, a + .5)), o: prog(t, a, a + .2) });
  P(s.code, { x: 960, y: 460, o: E.outC(prog(t, a + .3, a + .7)), y: 460 + (1 - E.outC(prog(t, a + .3, a + .8))) * 40 });
  P(s.l1, { x: 960, y: 600, o: E.outC(prog(t, a + .6, a + 1)) }); P(s.l2, { x: 960, y: 680, o: E.outC(prog(t, a + .8, a + 1.2)) });
  P(s.sub, { x: 960, y: 860, o: E.outC(prog(t, a + 1.1, a + 1.5)), s: 1 + .04 * Math.sin(t * 4) });
  s.w.camera({ zoom: 1 + lt * .015 });
  if (!s.c) { s.c = 1; cue(a, 'whoosh', .5); cue(a + .3, 'pop', .4); cue(a + 1.1, 'chime', .5); }
}, { in: 'fade', tin: .4 });
window.DURATION = S12[1];
