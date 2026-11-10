/* Fluxr Explains — sample v2 (motion-graphics heavy): "Why Zimbabwe uses US dollars" opening + the Fluxr part. Theme: fluxr. */
const C = CINE; const { shot, cue, E, prog, clamp, lerp, kf, spr, noise1, sv, G, P, el, Person, SKIN, poseAt, pop } = C;
const BASE = window.SCENE.replace(/[^/]+$/, ''); const KIT = '/home/claude/fluxr-posts/kit/';
const LEAD = .6; const V = C.voice(C.loadJSON(BASE + '../fluxr_zim/words_min.json'), LEAD);
const at = (w, after = 0) => V.at(w, after), to = (w, after = 0) => V.to(w, after);
C.setTheme('fluxr'); C.NOTE.USD10 = ['#5e7d5c', '#d9e3cf', '$10'];
const LIME = '#85ed70', DEEP = '#0d372b', GOLD = '#ffc94d', RED = '#ff6b5a', INK = '#ffffff';
window.META = { music: { style: 'amapiano', drop: at('in', 15) - .05, end: 63.8, breaks: [[at('within') - .1, at('within') + .9]] } };
C.initFX({ grain: .05, vignette: .45 });
el('div', { class: 'bug' }, C.stage, `<img src="${KIT}logos/fluxr-white.png" style="height:34px"> <span style="opacity:.8">EXPLAINS</span>`);

// ---------- helpers ----------
const uiSvg = u => { const s = C.svgBox(1920, 1080, u); return { svg: s, defs: sv('defs', {}, s) }; };
function kicker(parent, text, { color = LIME } = {}) { return el('div', { class: 'abs' }, parent, `<div style="display:inline-flex;align-items:center;gap:16px;font:800 38px/1 'Barlow Condensed';letter-spacing:.12em;color:#fff;background:rgba(6,20,15,.66);padding:12px 22px 12px 14px;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.25)"><span style="width:10px;height:42px;background:${color};border-radius:3px"></span>${text}</div>`); }
function motionBg(w, { c1 = '#14513e', c2 = '#04140e', blobs = ['#1f6f4a', '#0b3f2f', '#2f8a5a'], key = LIME, glyphs = ['R', '$', 'Z$'], dots = true } = {}) {
  const L = w.layer(4, { w: 3000, h: 1900 }); C.studio(L, { c1, c2, key }); const ups = [C.blobs(L, { colors: blobs })]; if (dots) ups.push(C.dotGrid(L, {})); if (glyphs) ups.push(C.glyphs(L, { chars: glyphs }));
  return { L, set: t => ups.forEach(f => f(t)) };
}
const vendorO = { skin: SKIN.dark, hair: 'scarf', female: true, scarf: '#1f8a5a', scarf2: '#f6d32d', shirt: '#e2603a', skirt: '#2c4a8a', skirtPattern: '#f6d32d', earrings: true, seed: 11 };
const custO = { skin: SKIN.brown, hair: 'fade', shirt: '#f0f0ea', pants: '#3d4b66', jacket: '#4a6b8a', seed: 12 };
function market(w) {
  const L4 = w.layer(6, { w: 3200, h: 1800 }), L3 = w.layer(3, { w: 2800, h: 1500 }), Lh = w.layer(2.2, { w: 2600, h: 1400 }), L2 = w.layer(1.7, { w: 2400, h: 1300 }), L1 = w.layer(1, { w: 1920, h: 1080 }), L0 = w.layer(.6, { w: 1920, h: 1080 });
  const sky1 = C.sky(L4, [[0, '#6aa7d8'], [.6, '#f3c58a'], [1, '#f9e2b4']]); const sky2 = C.sky(L4, [[0, '#3f6fb0'], [.55, '#f2a65e'], [1, '#f6c27a']]);
  const sun = C.sun(L4, 0, 0, { r: 110 }); const cl = [C.cloud(L4.svg, L4.defs, { s: 1.2, o: .85 }), C.cloud(L4.svg, L4.defs, { s: .8, o: .7 }), C.cloud(L4.svg, L4.defs, { s: 1, o: .75 })];
  const rays = C.rays(L4, 2300, 380, { n: 9, len: 2200, alpha: .08, spread: 80, angle: 150 });
  C.hills(L3, 860, { color: '#7d9a6a', amp: 90, seed: 4 }); const sk = C.skyline(L3.svg, L3.defs, { w: 2800, h: 330, color: '#6b7fa4', seed: 21 }); G(sk.g, 0, 980); sv('rect', { x: 0, y: 975, width: 2800, height: 600, fill: '#c9925e' }, L3.svg);
  C.haze(Lh, { color: '#f6d8a6', o: .55, from: .3, to: .85 });
  const bgSt = [C.stall(L2.svg, L2.defs, { a1: '#2f7d9e' }), C.stall(L2.svg, L2.defs, { a1: '#e0a52f' }), C.stall(L2.svg, L2.defs, { a1: '#8e44ad' })]; bgSt.forEach((s, i) => G(s, 380 + i * 820, 1010, 0, .95)); sv('rect', { x: 0, y: 1008, width: 2400, height: 400, fill: '#c98a55' }, L2.svg);
  const flagp = C.flagPole(L2.svg, L2.defs, 'zw', { h: 420, w: 190, fh: 120 }); G(flagp.g, 2050, 1010);
  const walkers = [new Person(L2.svg, L2.defs, { skin: SKIN.deep, hair: 'cap', cap: '#c0392b', shirt: '#2fbf71', seed: 21 }), new Person(L2.svg, L2.defs, { skin: SKIN.medium, hair: 'braids', female: true, shirt: '#f3a712', skirt: '#a23b72', seed: 22 }), new Person(L2.svg, L2.defs, { skin: SKIN.dark, hair: 'short', shirt: '#4c9be8', seed: 23 })];
  C.ground(L1, 900, { color: '#c98a55', line: false });
  const vendor = new Person(L1.svg, L1.defs, vendorO); const st = C.stall(L1.svg, L1.defs, { w: 760, h: 520, a1: '#d9483b' }); G(st, 760, 960);
  const breadG = C.bread(L1.svg, L1.defs, {}); G(breadG, 600, 778, 0, .55); const cust = new Person(L1.svg, L1.defs, custO);
  const fg = sv('g', {}, L0.svg); for (let i = 0; i < 3; i++) { const cg = sv('g', {}, fg); sv('rect', { x: -170, y: -120, width: 340, height: 160, rx: 8, fill: '#8a6240' }, cg); for (let j = 0; j < 8; j++) sv('circle', { cx: -130 + j * 37, cy: -130, r: 24, fill: ['#e4572e', '#f3a712', '#2fbf71'][i] }, cg); G(cg, [90, 1840, 1500][i], [1080, 1090, 1180][i], 0, 1.1); }
  return { L1, sky1, sky2, sun, cl, rays, walkers, vendor, cust, flagp };
}
function setMarket(m, t, lt, dayK) {
  m.sky2.setAttribute('opacity', dayK); G(m.sun, lerp(900, 2300, dayK), lerp(620, 380, dayK)); m.rays(t); m.flagp.set(t);
  m.cl.forEach((c, i) => G(c, (600 + i * 900 + t * (12 + i * 5)) % 3400 - 100, 260 + i * 90));
  m.walkers.forEach((p, i) => { const sp = [70, -55, 90][i]; const x = ((i * 700 + lt * sp) % 2600 + 2600) % 2600 - 100; p.set(t, { x, y: 1060, s: .62, side: 1, flip: sp < 0, walk: lt * 1.1 + i * .3, expr: 'neutral' }); });
}
function appScreen(g, file, w2, h2) { const iw = Math.max(w2 / .81, h2 / (.75 * 1.778)), ih = iw * 1.778; sv('rect', { width: w2, height: h2, fill: '#0b2a20' }, g); sv('image', { href: C.ENG + 'assets/app/' + file, x: -.14 * iw - (.81 * iw - w2) / 2, y: -.25 * ih, width: iw, height: ih, preserveAspectRatio: 'none' }, g); }
const cueOnce = (s, list) => { if (!s.__c) { s.__c = 1; list.forEach(c => cue(...c)); } };

// ================= A1: map intro, 2008 =================
const A1 = [0, at('a') - .05];
shot(A1[0], A1[1] + .5, ({ root, world }) => { const w = world(); const bg = motionBg(w, { glyphs: null });
  const L = w.layer(1, { w: 1920, h: 1080 }); const map = C.africaMap(L.svg, L.defs, { land: '#1d4d3c', stroke: '#3f7f63' }); G(map.g, 455, 30); map.highlight('ZWE', LIME, .9);
  const H = map.proj(31.05, -17.83); const hx = H[0] + 455, hy = H[1] + 30; const pin = map.pin(H, { label: '', size: 18 });
  const fl = C.flag(L.svg, L.defs, 'zw', { r: 34 }); const u = C.ui(root); const od = C.odometer(u, { digits: 4, size: 220, color: '#fff', group: 9 });
  const lab = kicker(u, 'HARARE, ZIMBABWE'); return { w, bg, fl, hx, hy, od, lab, pin };
}, (s, lt, t) => { s.bg.set(t); s.pin(t);
  pop(s.fl, s.hx + 46, s.hy - 46, t, .35, { s: 1, spin: -40 });
  s.od.set(lerp(1980, 2008, E.outQu(prog(t, .1, at('2008') + .3)))); P(s.od.el, { x: 960, y: 220, o: prog(t, 0, .25) * (1 - prog(t, A1[1] - .2, A1[1] + .2)) });
  P(s.lab, { x: 960, y: 900, o: E.outC(prog(t, at('2008'), at('2008') + .4)) });
  const z = kf(t, [[0, .9], [A1[1] + .4, 3.4]], E.inC); s.w.camera({ x: (s.hx - 960) * clamp((z - .9) / 2.5), y: (s.hy - 540) * clamp((z - .9) / 2.5), zoom: z, rot: lerp(-4, 0, prog(t, 0, A1[1])), focus: 1, dof: 0 });
  cueOnce(s, [[.3, 'swoosh_up', .6], [.35, 'pop', .5], [at('2008'), 'flaps', .5], [A1[1] - .25, 'whoosh', .7]]);
}, { in: 'fade', tin: .5 });

// ================= A2: the loaf of bread, morning -> afternoon =================
const A2 = [at('a') - .05, at('prices') - .1];
shot(A2[0], A2[1] + .4, ({ root, world }) => { const w = world(); const m = market(w);
  const tag = C.priceTag(m.L1.svg, m.L1.defs, { w: 280, h: 120 }); G(tag.g, 900, 640);
  const co = C.callout(m.L1.svg, m.L1.defs, { from: [600, 770], to: [690, 880], text: '1 LOAF OF BREAD', color: GOLD, size: 24 });
  const up = C.icon(m.L1.svg, m.L1.defs, 'up', { r: 34, bg: RED, fg: '#fff' });
  const u = C.ui(root); const us = uiSvg(u); const da = C.dayArc(us.svg, us.defs, { w: 420 }); const k = kicker(u, 'HARARE · 2008');
  return { w, m, tag, co, up, da, k };
}, (s, lt, t) => {
  const dayK = E.ioS(prog(t, at('afternoon') - .5, at('morning') - .1)); setMarket(s.m, t, lt, dayK);
  s.m.vendor.set(t, { x: 640, y: 960, s: .72, pose: poseAt(t, [[0, 'relaxed'], [at('cost') - .3, 'present'], [at('afternoon'), 'shrug']]), expr: t > at('afternoon') ? 'worried' : 'smile', turn: .25, gesture: t < at('afternoon') ? .4 : 0 });
  s.m.cust.set(t, { x: 1330, y: 990, s: 1.02, pose: poseAt(t, [[0, 'stand'], [at('more') + .1, 'facepalm']]), turn: -.6, look: [-.8, .1], expr: t > at('more') + .1 ? 'shock' : 'neutral' });
  const k = prog(t, at('cost'), at('morning') + .1); const v = 100000 * Math.pow(2, k * 3.2); s.tag.label.textContent = 'Z$ ' + (v >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : Math.round(v / 1000) + 'K'); s.tag.set(t, 1 + 2 * Math.max(0, 1 - Math.abs(t - at('more')) * 2));
  s.co.set(prog(t, at('loaf') - .1, at('loaf') + .6), t); pop(s.up.g, 1060, 590, t, at('more'), { s: 1 }); s.up.draw(prog(t, at('more'), at('more') + .4));
  G(s.da.g, 300, 300); s.da.set(dayK, t); s.da.g.setAttribute('opacity', prog(t, A2[0] + .3, A2[0] + .7));
  P(s.k, { x: 330, y: 120, o: prog(t, A2[0] + .2, A2[0] + .6) });
  s.w.camera({ x: kf(t, [[A2[0], -330], [at('cost'), -240], [A2[1], -10]]), y: kf(t, [[A2[0], 120], [at('cost'), 80], [A2[1], 30]]), zoom: kf(t, [[A2[0], 2.1], [at('cost'), 1.85], [A2[1], 1.25]]), rot: noise1(t * .3, 3) * .4, focus: 1, dof: 1 });
  cueOnce(s, [[at('loaf') - .1, 'pop', .5], [at('cost'), 'tick', .4], [at('more'), 'ding', .6], [at('afternoon'), 'swish', .4], [at('afternoon') + .1, 'tick', .4]]);
}, { in: 'circle', tin: .6, colors: [LIME], ix: 58, iy: 40 });

// ================= A3: doubling every day =================
const A3 = [at('prices') - .1, at('people') - .1];
shot(A3[0], A3[1] + .35, ({ root, world }) => { const w = world(); const bg = motionBg(w, { c1: '#4a1f1a', c2: '#120706', blobs: ['#7a2a1f', '#3a120c', '#a8452e'], key: '#ff9a52', glyphs: ['Z$', '×2'] });
  const L = w.layer(1, { w: 1920, h: 3000 }); const base = 2600; const cols = [];
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  for (let i = 0; i < 7; i++) { const x = 300 + i * 220; const g = sv('g', {}, L.svg);
    const bar = sv('rect', { x: x - 70, y: base, width: 140, height: 0, rx: 16, fill: C.grad(L.defs, [[0, '#ffd0b5'], [.3, '#ff7a52'], [1, '#b8321e']]) }, g);
    const card = sv('g', { transform: `translate(${x},${base + 70})` }, g); sv('rect', { x: -70, y: -36, width: 140, height: 72, rx: 12, fill: '#fff' }, card); C.T(card, days[i], { 'font-size': 34, fill: '#7a2a1f' });
    const ic = C.icon(g, L.defs, 'bread', { r: 34, bg: '#fff', fg: '#b8321e' }); ic.draw(1); const val = C.T(g, '×' + Math.pow(2, i), { x, 'font-size': 84, fill: '#fff' }); cols.push({ bar, ic, val, x }); }
  const x2 = []; for (let i = 0; i < 6; i++) { const g = sv('g', {}, L.svg); sv('circle', { r: 30, fill: GOLD }, g); C.T(g, '×2', { 'font-size': 30, fill: '#3a120c' }); x2.push(g); }
  const u = C.ui(root); const us = uiSvg(u); const fl = C.flag(us.svg, us.defs, 'zw', { r: 44 });
  const hl = C.highlight(u, 'PRICES DOUBLED <mark>ROUGHLY EVERY DAY</mark>', { size: 76, mark: GOLD, markInk: '#3a120c' }); const sub = el('div', { class: 'abs' }, u, 'Zimbabwe, late 2008'); sub.style.cssText += "font:600 34px/1 Barlow;color:#ffd9c8";
  return { w, bg, cols, x2, base, fl, hl, sub };
}, (s, lt, t) => { s.bg.set(t);
  const a0 = A3[0] + .35, step = (at('day') - a0) / 6.2;
  s.cols.forEach((c, i) => { const st = a0 + i * step; const q = E.outB(prog(t, st, st + .45)); const h = 34 * Math.pow(2, i) * q; c.bar.setAttribute('y', s.base - h); c.bar.setAttribute('height', h);
    pop(c.ic.g, c.x, s.base - h - 50, t, st + .1, { s: .9 }); c.val.setAttribute('transform', `translate(0,${s.base - h - 130})`); c.val.setAttribute('opacity', q); });
  s.x2.forEach((g, i) => pop(g, s.cols[i].x + 110, s.base - 34 * Math.pow(2, i) * .6 - 30, t, a0 + (i + 1) * step - .05, { s: 1, spin: 90 }));
  const last = a0 + 6 * step; const fol = E.ioC(prog(t, a0 + 2.5 * step, last + .5));
  const zz = lerp(1.0, .42, fol); s.w.camera({ x: 0, y: 1100 - 410 / zz, zoom: zz, rot: lerp(-1, 1.5, prog(t, A3[0], A3[1])), focus: 1, dof: .5 });
  pop(s.fl, 190, 300, t, A3[0] + .2, { s: 1, spin: -30 }); s.hl.set(t, at('roughly') - .1, .5); P(s.hl.el, { x: 640, y: 400, o: prog(t, A3[0] + .15, A3[0] + .45) }); P(s.sub, { x: 140, y: 470, anchor: 'tl', o: prog(t, A3[0] + .5, A3[0] + .9) });
  if (!s.__c) { s.__c = 1; for (let i = 0; i < 7; i++) cue(a0 + i * step, 'pop', .45 + i * .04); cue(last + .1, 'riser', .45); cue(A3[0] + .2, 'pop', .4); }
}, { in: 'bands', tin: .5, colors: [RED, GOLD, '#fff'] });

// ================= A4: bags of cash for groceries =================
const A4 = [at('people') - .1, at('in', 13) - .05];
shot(A4[0], A4[1] + .35, ({ root, world }) => { const w = world();
  const L4 = w.layer(5, { w: 4200, h: 1600 }), L3 = w.layer(2.4, { w: 4800, h: 1400 }), Lh = w.layer(1.8, { w: 5200, h: 1300 }), L1 = w.layer(1, { w: 6000, h: 1080 }), L0 = w.layer(.55, { w: 7000, h: 1080 });
  C.sky(L4, [[0, '#5d95c9'], [.7, '#f0bd85'], [1, '#f6d8a6']]); C.sun(L4, 2600, 520, { r: 100 });
  const sk = C.skyline(L3.svg, L3.defs, { w: 4800, h: 360, color: '#7c8db0', seed: 7 }); G(sk.g, 0, 1000); sv('rect', { x: 0, y: 990, width: 4800, height: 500, fill: '#b98457' }, L3.svg); C.haze(Lh, { color: '#f6d8a6', o: .5 });
  const cols = ['#f2b632', '#5aa8ff', '#e4572e', '#2fbf71', '#a23b72', '#f6efe2', '#16a085'];
  for (let i = 0; i < 9; i++) { const sp = C.spaza(L1.svg, L1.defs, { w: 600, h: 400, wall: cols[i % cols.length], sign: ['GROCERIES', 'BUTCHERY', 'BAKERY', 'GENERAL DEALER', 'HARDWARE', 'GROCERIES', 'TUCK SHOP', 'BAKERY', 'GROCERIES'][i], accent: ['#d9483b', '#1d3557', '#6b4a2f', '#2b2f3a'][i % 4] }); G(sp, 300 + i * 680, 820, 0, 1); }
  C.road(L1, 830, { h: 260 });
  const man = new Person(L1.svg, L1.defs, { skin: SKIN.dark, hair: 'cap', cap: '#2f7d4f', shirt: '#e8e2d0', pants: '#5b4636', seed: 31 });
  const wb = C.wheelbarrow(L1.svg, L1.defs, { fill: g => { for (let i = 0; i < 12; i++) { const n = C.noteStack(g, L1.defs, { kind: 'ZWD', n: 4, w: 150, h: 70, band: '#f2b632' }); G(n, -160 + (i % 4) * 76, -56 - Math.floor(i / 4) * 34, (i * 23) % 24 - 12, 1); } } });
  const wom = new Person(L1.svg, L1.defs, { skin: SKIN.brown, hair: 'scarf', scarf: '#8e44ad', scarf2: '#f6d32d', female: true, shirt: '#2fbf71', skirt: '#1d3557', seed: 32 });
  const sk2 = C.sack(L1.svg, L1.defs, { s: .55 }); wom.hold(1, sk2, { x: 0, y: 118, upright: true });
  const notes = C.fall(L1, (i, r) => C.note(L1.svg, L1.defs, { kind: 'ZWD', w: 90, h: 42 }), { n: 14, area: [900, 150, 1500, 200], g: 260 });
  const fg = sv('g', {}, L0.svg); for (let i = 0; i < 5; i++) { const lp = C.lamp(fg, L0.defs, { h: 900, on: 0 }); G(lp, 900 + i * 1700, 1100, 0, 1.2); }
  const u = C.ui(root); const us = uiSvg(u); const ic1 = C.icon(us.svg, us.defs, 'bag', { r: 54, bg: GOLD, fg: '#3a2a0c' }), ic2 = C.icon(us.svg, us.defs, 'bag', { r: 54, bg: GOLD, fg: '#3a2a0c' }), ic3 = C.icon(us.svg, us.defs, 'cart', { r: 64, bg: '#fff', fg: DEEP });
  const eq = sv('g', {}, us.svg); C.T(eq, '=', { 'font-size': 90, fill: '#fff' }); const plus = sv('g', {}, us.svg); C.T(plus, '+', { 'font-size': 80, fill: '#fff' });
  const k = kicker(u, 'BAGS OF CASH, JUST TO BUY GROCERIES'); return { w, man, wb, wom, notes, ic1, ic2, ic3, eq, plus, k };
}, (s, lt, t) => {
  const x = 900 + lt * 250; s.man.set(t, { x, y: 980, s: 1, side: 1, walk: lt * 1.25, stride: 18, pose: 'push', walkArms: 0, expr: 'focus' });
  G(s.wb.g, x + 330, 920, 0, -1.15, 1.15); s.wb.wheel.setAttribute('transform', `translate(-150,70) rotate(${lt * 260})`);
  s.wom.set(t, { x: 2700 - lt * 170, y: 870, s: .8, side: 1, flip: true, walk: lt * 1.05 + .4, stride: 22, pose: { lean: 4, head: 4, aA: [-8, 6], aB: [6, -2], lA: [-3, 0], lB: [3, 0] }, walkArms: .2, expr: 'worried' });
  s.notes(lt * .6); s.w.camera({ x: x + 250 - 3000, y: -40, zoom: 1.12, focus: 1, dof: .9, rot: noise1(t * .4, 5) * .4 });
  const g0 = at('groceries') - .3; pop(s.ic1.g, 1200, 300, t, g0, { s: 1 }); s.ic1.draw(prog(t, g0, g0 + .5)); pop(s.plus, 1320, 300, t, g0 + .1); pop(s.ic2.g, 1440, 300, t, g0 + .15); s.ic2.draw(prog(t, g0 + .15, g0 + .6));
  pop(s.eq, 1570, 300, t, g0 + .3); pop(s.ic3.g, 1710, 300, t, g0 + .4, { s: 1.1 }); s.ic3.draw(prog(t, g0 + .4, g0 + .9));
  P(s.k, { x: 600, y: 120, o: E.outC(prog(t, at('bags') - .2, at('bags') + .3)) });
  if (!s.__c) { s.__c = 1; cue(A4[0], 'whoosh', .6); for (let i = 0; i < 6; i++) cue(A4[0] + .2 + i * .62, 'step', .35); cue(at('cash'), 'flutter', .6); cue(g0, 'pop', .5); cue(g0 + .15, 'pop', .5); cue(g0 + .4, 'bloop', .5); }
}, { in: 'whip', tin: .4, dir: 1 });

// ================= A5: January 2009, the printing press =================
const A5 = [at('in', 13) - .05, at('a', 18) - .1];
shot(A5[0], A5[1] + .35, ({ root, world }) => { const w = world(); const bg = motionBg(w, { c1: '#123b5c', c2: '#050b14', blobs: ['#1d4f7a', '#0b2236', '#2a6a9a'], key: '#9fd0ff', glyphs: ['Z$'] });
  const Lb = w.layer(2.2, { w: 2400, h: 1300 }); const bh = C.bankHall(Lb.svg, Lb.defs, { w: 1100, h: 800, stone: '#4a6a8a', name: 'CENTRAL BANK' }); G(bh, 1200, 1150); Lb.el.style.opacity = .55;
  const L = w.layer(1, { w: 1920, h: 1080 }); C.floor(L, 900, { c1: '#1b2a3a', c2: '#2a3e54' }); const pp = C.printingPress(L.svg, L.defs, {}); G(pp.g, 1080, 960, 0, 1);
  const cal = C.calendarPage(L.svg, L.defs, { accent: '#d9483b' }); const u = C.ui(root); const lb = C.lightBeam(u, { x: 1100, y: -200, angle: 22, color: 'rgba(160,210,255,.16)' });
  const k = kicker(u, 'THE CENTRAL BANK PRINTS MORE', { color: '#9fd0ff' }); return { w, bg, pp, cal, k };
}, (s, lt, t) => { s.bg.set(t); s.pp.set(t, prog(t, at('printed') - .3, A5[1] + .5));
  s.cal.set(t < at('january') + .25 ? 'DECEMBER' : 'JANUARY', t < at('january') + .25 ? '2008' : '2009', prog(t, at('january'), at('january') + .5)); pop(s.cal.g, 360, 470, t, A5[0] + .15, { s: 1, spin: -12 });
  P(s.k, { x: 1150, y: 130, o: E.outC(prog(t, at('central') - .2, at('central') + .3)) });
  s.w.camera({ x: lerp(-80, 60, prog(t, A5[0], A5[1])), y: 20, zoom: lerp(1.05, 1.18, prog(t, A5[0], A5[1])), focus: 1, dof: .7 });
  cueOnce(s, [[A5[0], 'swish', .5], [at('january'), 'paper', .7], [at('printed') - .2, 'print', .7], [at('printed') + .6, 'print', .5]]);
}, { in: 'zoom', tin: .35 });

// ================= A6: the 100 trillion dollar note (3D hero) =================
const A6 = [at('a', 18) - .1, at('on', 20) - .1];
shot(A6[0], A6[1] + .35, ({ root, world }) => { const w = world(); const bg = motionBg(w, { c1: '#123b5c', c2: '#050b14', blobs: ['#1d4f7a', '#0b2236', '#2a6a9a'], key: '#9fd0ff', glyphs: null });
  const bk = C.bokeh(bg.L, { n: 40, color: '#9fd0ff', area: [0, 0, 3000, 1900], size: [10, 40], alpha: [.04, .14] });
  const u = C.ui(root); const us = uiSvg(u); const card = C.card3d(u, 1100, 500, { persp: 1600 }); const n = C.note(card.svg, card.defs, { kind: 'ZWD', w: 1080, h: 480 }); G(n, 550, 250);
  const od = el('div', { class: 'abs' }, u); od.style.cssText += "font:800 110px/1 'Barlow Condensed';color:#fff;white-space:nowrap;text-shadow:0 8px 30px rgba(0,0,0,.5)"; const zeros = el('div', { class: 'abs' }, u, '14 ZEROS'); zeros.style.cssText += `font:800 46px/1 'Barlow Condensed';letter-spacing:.14em;color:${GOLD}`;
  const br = C.burst(us.svg, 960, 470, { n: 16, r0: 380, r1: 640, color: '#9fd0ff', width: 5 }); const sp = C.sparkles(us.svg, { n: 22, area: [300, 150, 1320, 650] });
  return { w, bg, bk, card, od, zeros, br, sp };
}, (s, lt, t) => { s.bg.set(t); s.bk(t); s.sp(t);
  const inK = E.outQu(prog(t, A6[0], A6[0] + 1.3)); s.card.set({ x: 960, y: 450 + Math.sin(t * 1.3) * 8, rx: lerp(28, 8, inK) + Math.cos(t * .6) * 2, ry: lerp(-80, -10, inK) + Math.sin(t * .8) * 5, rz: lerp(-10, -3, inK), s: lerp(.55, 1.15, inK), light: ((t - A6[0]) * .5) % 1.6 - .3, o: prog(t, A6[0], A6[0] + .15) });
  const q = prog(t, at('one', 15) - .1, at('note') - .2); const nz = Math.min(14, Math.floor(q * 15)); const str = ('1' + '0'.repeat(nz)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); s.od.textContent = str; P(s.od, { x: 960, y: 880, o: prog(t, at('one', 15) - .2, at('one', 15)), s: 1 + .05 * Math.max(0, 1 - ((q * 15) % 1) * 4) });
  if (!s.__z) { s.__z = 1; for (let i = 1; i <= 14; i++) cue(at('one', 15) - .1 + i / 15 * (at('note') - .1 - at('one', 15)), 'tick', .35); }
  P(s.zeros, { x: 960, y: 980, o: E.outC(prog(t, at('note') - .2, at('note') + .2)), s: E.outB(prog(t, at('note') - .2, at('note') + .25)) });
  s.br(prog(t, at('trillion') - .05, at('trillion') + .9));
  s.w.camera({ zoom: 1 + lt * .02 });
  cueOnce(s, [[A6[0], 'whoosh_low', .7], [at('trillion'), 'impact', .55], [at('trillion') + .05, 'sparkle', .5], [at('note'), 'pop', .5]]);
}, { in: 'flash', tin: .25 });

// ================= A7: worth about US$30 — the balance =================
const A7 = [at('on', 20) - .1, at('within') - .2];
shot(A7[0], A7[1] + .35, ({ root, world }) => { const w = world(); const bg = motionBg(w, { c1: '#163a2c', c2: '#05120d', glyphs: ['$', 'Z$'] });
  const L = w.layer(1, { w: 1920, h: 1080 }); const bl = C.balance(L.svg, L.defs, { w: 900, h: 560 }); G(bl.g, 960, 1000, 0, .9);
  const zn = C.note(bl.left, L.defs, { kind: 'ZWD', w: 260, h: 120 }); zn.setAttribute('transform', 'translate(0,-60)');
  const u20 = C.note(bl.right, L.defs, { kind: 'USD20', w: 230, h: 110 }); const u10 = C.note(bl.right, L.defs, { kind: 'USD10', w: 230, h: 110 });
  const fz = C.flag(bl.left, L.defs, 'zw', { r: 46 }), fu = C.flag(bl.right, L.defs, 'us', { r: 46 });
  const u = C.ui(root); const cal = C.icon(L.svg, L.defs, 'calendar', { r: 46, bg: '#fff', fg: DEEP }); const t1 = C.highlight(u, 'ON ITS <mark>FIRST DAY</mark>', { size: 64 });
  const od = C.odometer(u, { digits: 2, size: 150, color: LIME, prefix: '≈ US$' }); return { w, bg, bl, u20, u10, fz, fu, cal, t1, od };
}, (s, lt, t) => { s.bg.set(t);
  const th = at('thirty'); const a = t < th ? lerp(-14, -14, 0) + Math.sin(t * 3) * 1.5 : lerp(-14, 0, E.outB(prog(t, th, th + .8))) + Math.sin(t * 5) * Math.max(0, 1 - (t - th)) * 2; s.bl.set(a);
  const q1 = E.outB(prog(t, th - .25, th + .15)), q2 = E.outB(prog(t, th - .05, th + .35)); s.u20.setAttribute('transform', `translate(0,${-55 - (1 - q1) * 300}) scale(${Math.max(.001, q1)})`); s.u10.setAttribute('transform', `translate(10,${-80 - (1 - q2) * 300}) rotate(-6) scale(${Math.max(.001, q2)})`);
  pop(s.fz, 0, -200, t, A7[0] + .3, { s: 1 }); pop(s.fu, 0, -200, t, th, { s: 1 });
  pop(s.cal.g, 300, 250, t, at('first', 20) - .2, { s: 1 }); s.cal.draw(prog(t, at('first', 20) - .2, at('first', 20) + .4)); s.t1.set(t, at('first', 20) - .1, .4); P(s.t1.el, { x: 620, y: 250, o: prog(t, at('first', 20) - .25, at('first', 20)) });
  s.od.set(Math.round(30 * E.outC(prog(t, th, at('dollars', 23))))); P(s.od.el, { x: 1500, y: 250, o: prog(t, th - .1, th + .1) });
  s.w.camera({ x: noise1(t * .3, 7) * 20, y: lerp(30, 0, prog(t, A7[0], A7[1])), zoom: lerp(1.08, 1.0, prog(t, A7[0], A7[1])), focus: 1, dof: .4 });
  cueOnce(s, [[A7[0], 'swish', .5], [at('first', 20) - .2, 'pop', .45], [th - .2, 'paper', .5], [th + .1, 'thud', .6], [th + .2, 'cash', .5]]);
}, { in: 'bands', tin: .5, colors: [LIME, '#fff', GOLD] });

// ================= A8: Zimbabwe stops using its own dollar =================
const A8 = [at('within') - .2, at('people', 28) - .1];
shot(A8[0], A8[1] + .35, ({ root, world }) => { const w = world(); const bg = motionBg(w, { c1: '#2a2f3a', c2: '#07080b', blobs: ['#3a4250', '#15181e', '#4a3a3a'], key: '#ffd9a0', glyphs: ['Z$'] });
  const L = w.layer(1, { w: 1920, h: 1080 }); const R = C.rnd(5); const notes = [];
  for (let i = 0; i < 22; i++) { const n = C.note(L.svg, L.defs, { kind: 'ZWD', w: 260, h: 118 }); notes.push({ n, x0: 760 + (R() - .5) * 600, y0: 420 + (R() - .5) * 300, vx: 700 + R() * 900, vy: -120 + R() * 260, rs: (R() - .5) * 400, d: R() * .9, ph: R() * 6 }); }
  const hero = C.note(L.svg, L.defs, { kind: 'ZWD', w: 640, h: 290 }); const stp = C.stampMark(L.svg, L.defs, 'SUSPENDED', { size: 76 });
  const tl = C.timeline(L.svg, L.defs, { x: 260, y: 900, w: 1400, color: GOLD, events: [{ k: .08, label: '2008', sub: 'prices double daily' }, { k: .5, label: 'JAN 2009', sub: 'Z$100 trillion note' }, { k: .92, label: 'APR 2009', sub: 'Zimbabwe dollar suspended' }] });
  const u = C.ui(root); const us = uiSvg(u); const fl = C.flag(us.svg, us.defs, 'zw', { r: 40 }); return { w, bg, notes, hero, stp, tl, fl };
}, (s, lt, t) => { s.bg.set(t); const gust = at('within') + .1;
  s.notes.forEach(p => { const tt = Math.max(0, t - gust - p.d * .6); const x = p.x0 + p.vx * tt * tt * .6 + Math.sin(tt * 3 + p.ph) * 30 * tt, y = p.y0 + p.vy * tt + Math.sin(tt * 4 + p.ph) * 40 * tt; p.n.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${(p.rs * tt + (p.ph - 3) * 6).toFixed(1)}) scale(${(.9 * Math.cos(tt * 3 + p.ph)).toFixed(3)},.9)`); });
  pop(s.hero, 960, 420, t, at('zimbabwe', 26) - .3, { s: 1 }); G(s.stp.g, 980, 430); s.stp.set(prog(t, at('stopped') - .05, at('stopped') + .2));
  s.tl.set(lerp(.05, 1, E.ioC(prog(t, A8[0] + .2, A8[1])))); pop(s.fl, 150, 150, t, A8[0] + .2);
  s.w.camera({ x: lt * 10, zoom: 1 + lt * .02, focus: 1, dof: .4, rot: -lt * .2 + (t > at('stopped') && t < at('stopped') + .25 ? Math.sin(t * 90) * .8 : 0) });
  cueOnce(s, [[gust - .2, 'wind', .6], [gust + .2, 'flutter', .7], [at('zimbabwe', 26) - .3, 'whoosh', .5], [at('stopped'), 'stamp', .7]]);
}, { in: 'zoom', tin: .3 });

// ================= A9: paid in US dollars and rand =================
const A9 = [at('people', 28) - .1, at('today') - .1];
shot(A9[0], A9[1] + .35, ({ root, world }) => { const w = world(); const m = market(w);
  const usd = C.note(m.L1.svg, m.L1.defs, { kind: 'USD20', w: 200, h: 96 }); const zar = C.coin(m.L1.svg, m.L1.defs, { r: 36, label: 'R5', metal: 'bi' }); const zarN = C.note(m.L1.svg, m.L1.defs, { kind: 'ZAR50', w: 200, h: 96 });
  m.cust.hold(1, usd, { x: 0, y: 10, r: 90, s: 1 }); const u = C.ui(root); const us = uiSvg(u);
  const fu = C.flag(us.svg, us.defs, 'us', { r: 52 }), fz = C.flag(us.svg, us.defs, 'za', { r: 52 }); const l1 = kicker(u, 'US DOLLARS'), l2 = kicker(u, 'SOUTH AFRICAN RAND', { color: GOLD });
  const sp = C.sparkles(us.svg, { n: 12, area: [300, 500, 600, 300], color: GOLD }); return { w, m, usd, zar, zarN, fu, fz, l1, l2, sp };
}, (s, lt, t) => { setMarket(s.m, t, lt, .6); s.sp(t);
  const give = at('paid'); const handed = t > give + .55;
  if (handed && s.m.cust.held[1]) { s.m.cust.hold(1, null); s.m.vendor.hold(1, s.usd, { x: 0, y: 10, r: -90 }); }
  if (!handed && s.m.vendor.held[1]) { s.m.vendor.hold(1, null); s.m.cust.hold(1, s.usd, { x: 0, y: 10, r: 90, s: 1 }); }
  s.m.cust.set(t, { x: 1250, y: 990, s: 1.02, flip: true, pose: poseAt(t, [[0, 'stand'], [give - .3, { lean: 4, head: 2, aA: [-8, 6], aB: [82, -16], lA: [-3, 0], lB: [3, 0] }]]), turn: .6, look: [.8, 0], expr: 'smile' });
  s.m.vendor.set(t, { x: 640, y: 960, s: .72, pose: poseAt(t, [[0, 'relaxed'], [give - .2, { lean: 2, head: 4, aA: [-10, 6], aB: [96, -26], lA: [-3, 0], lB: [3, 0] }], [at('rand') - .2, 'celebrate']]), expr: t > give ? 'happy' : 'smile', turn: .35 });
  const q = prog(t, at('rand') - .35, at('rand') + .2); G(s.zar.g, 690, lerp(600, 760, E.outB(q)), 0, q > 0 ? 1 : .001); s.zar.flip(q < 1 ? q * 720 : 0);
  G(s.zarN, 560, lerp(560, 768, E.outB(prog(t, at('rand') - .2, at('rand') + .35))), -8 + 14 * prog(t, at('rand'), at('instead')), prog(t, at('rand') - .2, at('rand')) > 0 ? .8 : .001);
  pop(s.fu, 150, 200, t, at('us', 29) - .1, { s: 1, spin: -60 }); pop(s.fz, 150, 320, t, at('south', 30) - .1, { s: 1, spin: -60 });
  P(s.l1, { x: 222, y: 200, anchor: 'tl', o: E.outC(prog(t, at('us', 29), at('us', 29) + .3)) }); s.l1.style.transform += ' translateY(-50%)';
  P(s.l2, { x: 222, y: 320, anchor: 'tl', o: E.outC(prog(t, at('south', 30), at('south', 30) + .3)) }); s.l2.style.transform += ' translateY(-50%)';
  s.w.camera({ x: lerp(-60, 60, prog(t, A9[0], A9[1])), y: 40, zoom: lerp(1.55, 1.42, prog(t, A9[0], A9[1])), focus: 1, dof: 1 });
  cueOnce(s, [[A9[0], 'swish', .5], [give + .4, 'paper', .7], [at('us', 29) - .1, 'pop', .5], [at('south', 30) - .1, 'pop', .5], [at('rand') + .1, 'coin', .7], [at('rand') + .35, 'paper', .4]]);
}, { in: 'whip', tin: .35, dir: -1 });

// ================= A10: the map, families supported from South Africa =================
const A10 = [at('today') - .1, at('and', 38) - .05];
shot(A10[0], A10[1] + .35, ({ root, world }) => { const w = world(); const bg = motionBg(w, { glyphs: null });
  const L = w.layer(1, { w: 1920, h: 1080 }); const map = C.africaMap(L.svg, L.defs, { land: '#1d4d3c', stroke: '#3f7f63' }); G(map.g, 455, 30); map.highlight('ZAF', GOLD, .55); map.highlight('ZWE', LIME, .75);
  const P2 = (lo, la) => { const p = map.proj(lo, la); return [p[0] + 455, p[1] + 30]; };
  const src = [P2(28.05, -26.2), P2(18.42, -33.92), P2(31.03, -29.86)], dst = [P2(31.05, -17.83), P2(28.58, -20.15), P2(32.67, -18.97), P2(29.82, -19.45), P2(30.83, -20.07)];
  const arcs = [], fly = [], houses = [];
  dst.forEach((d, i) => { const s0 = src[i % 3]; arcs.push(C.dashArc(L.svg, L.defs, s0, d, { color: LIME, width: 3, dash: 9, lift: .25 })); const ic = C.icon(L.svg, L.defs, i % 2 ? 'sim' : 'wifi', { r: 13, bg: '#fff', fg: DEEP, shadow: false }); ic.draw(1); fly.push(C.flyer(L.svg, ic.g, s0, d, { lift: .25, trail: 6, color: LIME })); const h = C.icon(L.svg, L.defs, 'house', { r: 12, bg: GOLD, fg: '#3a2a0c', shadow: false }); h.draw(1); houses.push({ g: h.g, p: d }); });
  const fz = C.flag(L.svg, L.defs, 'za', { r: 26 }), fw = C.flag(L.svg, L.defs, 'zw', { r: 26 }); const pj = map.pin(src[0].map((v, i) => v - [455, 30][i]), { color: GOLD });
  const u = C.ui(root); const t1 = C.kTitle(u, 'MILLIONS OF <b>FAMILIES</b>', { size: 90, width: 900, align: 'left' }); const t2 = C.kTitle(u, 'count on support sent from South Africa', { size: 40, weight: 700, font: "'Barlow'", color: '#cfe9d8', width: 900, align: 'left' });
  return { w, bg, arcs, fly, houses, fz, fw, pj, t1, t2, src, dst };
}, (s, lt, t) => { s.bg.set(t); s.pj(t);
  const a0 = at('support') - .6; s.arcs.forEach((a, i) => a(E.ioC(prog(t, a0 + i * .2, a0 + 1 + i * .2)), t)); s.fly.forEach((f, i) => f(prog(t, a0 + .3 + i * .2, a0 + 1.6 + i * .2)));
  s.houses.forEach((h, i) => pop(h.g, h.p[0] + 18, h.p[1] - 18, t, at('families') + i * .12, { s: 1 }));
  pop(s.fz, s.src[0][0] - 46, s.src[0][1] + 30, t, A10[0] + .4, { s: 1, spin: -40 }); pop(s.fw, s.dst[0][0] + 40, s.dst[0][1] - 44, t, at('zimbabwe', 34) - .1, { s: 1, spin: -40 });
  const z = kf(t, [[A10[0], 1.0], [at('families') + .2, 2.4], [A10[1], 2.8]], E.ioC); const tx = (s.src[0][0] + s.dst[0][0]) / 2 + 70, ty = (s.src[0][1] + s.dst[0][1]) / 2;
  s.w.camera({ x: (tx - 960) * clamp((z - 1) / 1.4), y: (ty - 540) * clamp((z - 1) / 1.4), zoom: z, rot: lerp(-3, 0, prog(t, A10[0], A10[1])), focus: 1, dof: 0 });
  s.t1.set(t, at('millions') - .1, .1, .5, A10[1] - .1); P(s.t1.el, { x: 1420, y: 850 }); s.t2.set(t, at('count') - .1, .04, .4, A10[1] - .1); P(s.t2.el, { x: 1420, y: 935 });
  cueOnce(s, [[A10[0], 'whoosh_low', .7], [at('families'), 'pop', .4], [a0 + .2, 'swoosh_up', .5], [a0 + 1.4, 'sparkle', .5]]);
}, { in: 'circle', tin: .6, colors: [LIME], ix: 50, iy: 50 });

// ================= A11: Fluxr logo =================
const A11 = [at('and', 38) - .05, at('buy', 40) - .1];
shot(A11[0], A11[1] + .3, ({ root, world }) => { const w = world(); const bg = motionBg(w, { glyphs: null });
  const rays = C.rays(bg.L, 1500, 950, { n: 16, len: 1600, color: LIME, alpha: .07, spread: 360, angle: 0 });
  const u = C.ui(root); const us = uiSvg(u); const br = C.burst(us.svg, 960, 470, { n: 18, r0: 200, r1: 520, color: LIME }); const br2 = C.burst(us.svg, 960, 470, { n: 10, r0: 260, r1: 420, color: '#fff', width: 3 });
  const orb = ['sim', 'wifi', 'bolt', 'voucher', 'receipt', 'phone'].map((n, i) => { const ic = C.icon(us.svg, us.defs, n, { r: 40, bg: i % 2 ? '#fff' : LIME, fg: DEEP }); ic.draw(1); return ic; });
  const logo = el('img', { src: KIT + 'logos/fluxr-white.png', class: 'abs' }, u); logo.style.width = '760px';
  const t1 = C.highlight(u, 'we built Fluxr for <mark>exactly this</mark>', { size: 56, font: 'Barlow', weight: 700 }); const sp = C.sparkles(us.svg, { n: 20, area: [300, 150, 1320, 700] });
  return { w, bg, rays, br, br2, orb, logo, t1, sp };
}, (s, lt, t) => { s.bg.set(t); s.rays(t); s.sp(t); const hit = at('built'); const q = spr(t, hit - .1, 6, 11);
  s.br(prog(t, hit - .05, hit + .9)); s.br2(prog(t, hit + .1, hit + 1.1));
  P(s.logo, { x: 960, y: 470, s: Math.max(.001, q), o: prog(t, hit - .1, hit + .05), blur: (1 - clamp(q)) * 10 });
  s.orb.forEach((ic, i) => { const a = i / s.orb.length * Math.PI * 2 + t * .5; const rr = 470 * E.outC(prog(t, hit + .1 + i * .05, hit + .7 + i * .05)); pop(ic.g, 960 + Math.cos(a) * rr, 470 + Math.sin(a) * rr * .55, t, hit + .1 + i * .05, { s: 1 }); });
  s.t1.set(t, at('exactly') + .9, .4); P(s.t1.el, { x: 960, y: 760, o: prog(t, at('exactly') - .2, at('exactly') + .1) });
  s.w.camera({ zoom: 1 + lt * .02 });
  cueOnce(s, [[hit - 1.6, 'swell', .7], [hit, 'impact', .6], [hit + .05, 'sparkle', .6], [hit + .2, 'bloop', .4]]);
}, { in: 'bands', tin: .55, colors: [LIME, '#fff', DEEP] });

// ================= A12: buy a voucher at your local store =================
const A12 = [at('buy', 40) - .1, at('dial') - .05];
shot(A12[0], A12[1] + .3, ({ root, world }) => { const w = world(); const L4 = w.layer(4, { w: 2800, h: 1600 }), Lh = w.layer(2, { w: 2400, h: 1300 }), L1 = w.layer(1, { w: 1920, h: 1080 });
  C.sky(L4, [[0, '#f0a46b'], [1, '#f9d9a5']]); const sk = C.skyline(L4.svg, L4.defs, { w: 2800, h: 300, color: '#c48a6a', seed: 3, joburg: true }); G(sk.g, 0, 1000); sv('rect', { x: 0, y: 995, width: 2800, height: 700, fill: '#b9805a' }, L4.svg); C.haze(Lh, { color: '#f9d9a5', o: .45 });
  C.ground(L1, 880, { color: '#b9805a' }); const sp = C.spaza(L1.svg, L1.defs, { w: 1000, h: 600, wall: '#f2b632', sign: 'SPAZA · AIRTIME · VOUCHERS', accent: '#1f6f4a' }); G(sp, 760, 920);
  const hatch = sv('g', { 'clip-path': C.clipRect(L1.defs, 320, 440, 580, 160) }, L1.svg); const owner = new Person(hatch, L1.defs, { skin: SKIN.dark, hair: 'bald', beard: true, shirt: '#2f7d4f', seed: 41 });
  const cust = new Person(L1.svg, L1.defs, { skin: SKIN.medium, hair: 'braids', female: true, shirt: '#e4572e', pants: '#29335c', seed: 42 });
  const slip = C.slip(L1.svg, L1.defs, { w: 230, title: 'VOUCHER', lines: [['R50.00', 30, true], ['PIN •••• •••• ••••', 18], ['THANK YOU', 18]] });
  const u = C.ui(root); const cards = ['1voucher', 'ott-voucher', 'blu-voucher', 'fnb-voucher', '4all-voucher'].map(n => { const c = C.card3d(u, 300, 120, { persp: 900 }); const im = sv('image', { href: KIT + 'logos/' + n + '.png', x: 30, y: 20, width: 240, height: 80, preserveAspectRatio: 'xMidYMid meet' }, c.svg); c.svg.insertBefore(sv('rect', { x: 0, y: 0, width: 300, height: 120, rx: 18, fill: '#fff' }), im); c.inner.style.boxShadow = '0 18px 40px rgba(0,0,0,.35)'; c.inner.style.borderRadius = '18px'; return c; });
  const k = kicker(u, 'BUY A VOUCHER AT YOUR LOCAL STORE'); return { w, owner, cust, slip, cards, k };
}, (s, lt, t) => {
  s.owner.set(t, { x: 600, y: 900, s: .8, pose: poseAt(t, [[0, 'relaxed'], [at('voucher', 42) - .2, 'give']]), expr: 'smile', turn: .4, gesture: .3 });
  s.cust.set(t, { x: 1340, y: 1000, s: 1.05, pose: poseAt(t, [[0, 'stand'], [at('voucher', 42), 'receive']]), side: .2, turn: -.7, look: [-.7, 0], expr: 'smile' });
  const pr = prog(t, at('voucher', 42) - .2, at('store') + .1); G(s.slip.g, 960, 520, 4, 1); s.slip.setReveal(E.ioS(pr)); s.slip.g.setAttribute('opacity', pr > 0 ? 1 : 0);
  s.cards.forEach((c, i) => { const st = at('local') - .35 + i * .09; const q = E.outB(prog(t, st, st + .45)); const fan = (i - 2); c.set({ x: 1360 + fan * 95, y: 330 + Math.abs(fan) * 18 + (1 - q) * 200, rz: fan * 8, ry: (1 - q) * 70, rx: 10, s: .95, o: clamp(q * 2) }); c.wrap.style.zIndex = 10 - Math.abs(fan); });
  s.w.camera({ x: lerp(160, 80, prog(t, A12[0], A12[1])), y: -150, zoom: lerp(1.45, 1.3, prog(t, A12[0], A12[1])), focus: 1, dof: .8 });
  P(s.k, { x: 560, y: 120, o: E.outC(prog(t, A12[0] + .1, A12[0] + .5)) });
  if (!s.__c) { s.__c = 1; cue(A12[0], 'shopbell', .5); cue(at('voucher', 42) - .15, 'print', .6); for (let i = 0; i < 5; i++) cue(at('local') - .35 + i * .09, 'swish', .25); }
}, { in: 'whip', tin: .35, dir: 1 });

// ================= A13: dial the code (thumb presses synced to the spoken digits) =================
const A13 = [at('dial') - .05, at('send', 51) - .05];
shot(A13[0], A13[1] + .3, ({ root, world }) => { const w = world(); const bg = motionBg(w, { glyphs: ['*', '#'] });
  const L = w.layer(1, { w: 1920, h: 1080 }); const ph = C.phoneHand(L.svg, L.defs, { skin: SKIN.brown, sleeve: '#e4572e' }); G(ph.g, 520, 420, -6, 1);
  const u = C.ui(root); const us = uiSvg(u);
  const seq = [['star', '*'], ['one', '1'], ['three', '3'], ['zero', '0'], ['star', '*'], ['three', '3'], ['one', '1'], ['zero', '0'], ['two', '2'], ['six', '6'], ['star', '*']];
  let after = at('dial'); const ev = seq.map(([wd, ch]) => { const tt = at(wd, after); after = tt + .01; return { t: tt, ch }; }); ev.push({ t: at('pin', 49) - .1, ch: 'PIN', pin: true }); ev.push({ t: at('hash'), ch: '#' });
  ev.forEach(e => cue(e.t, e.pin ? 'type' : 'dtmf' + e.ch, e.pin ? .5 : .9)); cue(at('hash') + .25, 'chime', .6);
  const groups = [{ txt: '*130*', from: 0, to: 4 }, { txt: '31026*', from: 5, to: 10 }, { txt: 'VoucherPIN', from: 11, to: 11 }, { txt: '#', from: 12, to: 12 }];
  const caps = groups.map((g, i) => ({ g, el: C.keycap(u, '', { accent: i === 2 ? GOLD : LIME, size: 96 }) }));
  const ok = C.icon(us.svg, us.defs, 'check', { r: 56, bg: LIME, fg: DEEP }); const br = C.burst(us.svg, 1290, 620, { n: 12, r0: 60, r1: 150, color: LIME });
  const tags = [['phone', 'ANY PHONE'], ['data', 'NO DATA NEEDED']].map(([n, l]) => { const ic = C.icon(us.svg, us.defs, n, { r: 34, bg: '#fff', fg: DEEP }); ic.draw(1); const e = el('div', { class: 'abs' }, u, l); e.style.cssText += "font:800 40px/1 'Barlow Condensed';letter-spacing:.08em;color:#fff;white-space:nowrap"; return { ic, e }; });
  return { w, bg, ph, ev, caps, ok, br, tags };
}, (s, lt, t) => { s.bg.set(t);
  let n = 0, last = null; s.ev.forEach((e, i) => { if (t >= e.t) { n = i + 1; last = e; } });
  const typed = s.ev.slice(0, n).map(e => e.pin ? 'VoucherPIN' : e.ch).join(''); const ussd = typed.replace('VoucherPIN', '••••'); const lines = []; for (let i = 0; i < ussd.length; i += 11) lines.push(ussd.slice(i, i + 11)); s.ph.phone.setText(lines.length ? lines : ['']);
  // thumb moves to the key being pressed
  const keys = '123456789*0#'; const tgt = last && !last.pin ? keys.indexOf(last.ch) : 4; const kx = -134 + (tgt % 3) * 134, ky = 60 + (-345 + 60 + 248.4 + 40 + Math.floor(tgt / 3) * 52);
  const press = last && t - last.t < .14 ? 1 - (t - last.t) / .14 : 0; s.ph.thumb(kx, ky, press);
  s.caps.forEach((c, i) => { const shown = s.ev.slice(c.g.from, Math.min(n, c.g.to + 1)).map(e => e.pin ? 'VoucherPIN' : e.ch).join(''); c.el.firstChild.textContent = shown; const st = s.ev[c.g.from].t; const q = E.outB(prog(t, st - .05, st + .3));
    P(c.el, { x: 0, y: 0, anchor: 'tl', o: q > .01 ? 1 : 0 }); c.el.style.transformOrigin = '0 50%'; c.el.style.left = '1050px'; c.el.style.top = (140 + i * 140) + 'px'; c.el.style.transform = `scale(${(.7 + .3 * q).toFixed(3)})`; });
  pop(s.ok.g, 1290, 620, t, at('hash') + .2, { s: 1 }); s.ok.draw(prog(t, at('hash') + .25, at('hash') + .6)); s.br(prog(t, at('hash') + .2, at('hash') + 1));
  s.tags.forEach((g, i) => { const st = at('hash') + .5 + i * .2; pop(g.ic.g, 1090, 860 + i * 100, t, st); P(g.e, { x: 1150, y: 860 + i * 100, anchor: 'tl', o: E.outC(prog(t, st, st + .3)) }); g.e.style.transform += ' translateY(-50%)'; });
  s.w.camera({ x: lerp(-30, 20, prog(t, A13[0], A13[1])), y: lerp(40, 0, prog(t, A13[0], A13[1])), zoom: lerp(1.0, 1.06, prog(t, A13[0], A13[1])), focus: 1, dof: .6 });
}, { in: 'zoom', tin: .3 });

// ================= A14: send airtime and data home =================
const A14 = [at('send', 51) - .05, at('or', 54) - .1];
shot(A14[0], A14[1] + .35, ({ root, world }) => { const w = world(); const bg = motionBg(w, { glyphs: null });
  const L = w.layer(1, { w: 1920, h: 1080 });
  const ph1 = C.phone(L.svg, L.defs, { w: 260, h: 540, screenFn: (g, w2, h2) => appScreen(g, 'phone-03-airtime.png', w2, h2) }); G(ph1.g, 420, 560, -6, 1);
  const gogo = new Person(L.svg, L.defs, { skin: SKIN.dark, hair: 'scarf', scarf: '#c0392b', scarf2: '#f6efe2', female: true, elder: true, glasses: true, shirt: '#5aa8ff', skirt: '#1d3557', seed: 51 });
  const hs = C.house(L.svg, L.defs, { wall: '#f2d5a8', type: 'rdp', w: 320, h: 220 }); L.svg.insertBefore(hs, gogo.g); G(hs, 1600, 900);
  const gph = C.phone(L.svg, L.defs, { w: 70, h: 140, screenFn: (g, w2, h2) => { sv('rect', { width: w2, height: h2, fill: DEEP }, g); C.T(g, '✓', { x: w2 / 2, y: h2 / 2, 'font-size': 40, fill: LIME }); } }); gogo.hold(1, gph.g, { x: -4, y: 10, upright: true });
  const fl1 = C.flag(L.svg, L.defs, 'za', { r: 40 }), fl2 = C.flag(L.svg, L.defs, 'zw', { r: 40 });
  const items = [['sim', LIME], ['wifi', '#fff'], ['sim', LIME]].map(([n, c]) => { const ic = C.icon(L.svg, L.defs, n, { r: 40, bg: c, fg: DEEP }); ic.draw(1); return ic; });
  const fls = items.map((ic, i) => C.flyer(L.svg, ic.g, [560, 420], [1430, 650], { lift: .35, trail: 10, color: LIME }));
  const u = C.ui(root); const ts = C.toast(u, { title: 'Airtime received', sub: 'from your family in South Africa' }); const k = kicker(u, 'SEND AIRTIME AND DATA TO FAMILY BACK HOME');
  return { w, bg, gogo, fl1, fl2, fls, ts, k };
}, (s, lt, t) => { s.bg.set(t); const a0 = at('airtime') - .2;
  s.fls.forEach((f, i) => f(prog(t, a0 + i * .45, a0 + 1.1 + i * .45)));
  const got = a0 + 1.1; s.gogo.set(t, { x: 1480, y: 1000, s: 1.0, pose: t > got ? 'phone' : 'relaxed', expr: t > got + .3 ? 'happy' : 'smile', turn: -.3, gesture: 0 });
  pop(s.fl1, 300, 220, t, A14[0] + .2); pop(s.fl2, 1640, 300, t, A14[0] + .35);
  P(s.ts, { x: 1180, y: 160, o: prog(t, got, got + .15), s: .7 + .3 * E.outB(prog(t, got, got + .35)) }); P(s.k, { x: 760, y: 980, o: E.outC(prog(t, A14[0] + .1, A14[0] + .5)) });
  s.w.camera({ x: lerp(-40, 40, prog(t, A14[0], A14[1])), zoom: 1.02, focus: 1, dof: .3 });
  cueOnce(s, [[A14[0], 'swish', .5], [a0, 'swoosh_up', .5], [a0 + .45, 'swoosh_up', .4], [got, 'notif', .7], [got + .05, 'buzz', .5]]);
}, { in: 'circle', tin: .5, colors: [LIME], ix: 22, iy: 52 });

// ================= A15: or top up your own phone here =================
const A15 = [at('or', 54) - .1, to('africa', 56) + .45];
shot(A15[0], A15[1] + .35, ({ root, world }) => { const w = world(); const L4 = w.layer(4, { w: 2800, h: 1600 }), Lh = w.layer(2, { w: 2400, h: 1300 }), L1 = w.layer(1, { w: 1920, h: 1080 });
  C.sky(L4, [[0, '#4f74b8'], [1, '#a9c4e8']]); const sk = C.skyline(L4.svg, L4.defs, { w: 2800, h: 420, color: '#3c5486', seed: 9, joburg: true, windows: .25 }); G(sk.g, 0, 1040); C.haze(Lh, { color: '#c9dcf2', o: .5 });
  C.ground(L1, 860, { color: '#6f7e94' }); C.road(L1, 870, { h: 140 }); const tx = C.taxi(L1.svg, L1.defs, {});
  const guy = new Person(L1.svg, L1.defs, { skin: SKIN.brown, hair: 'short', shirt: '#2fbf71', pants: '#29335c', seed: 52 });
  const gp = C.phone(L1.svg, L1.defs, { w: 70, h: 140, screenFn: (g, w2, h2) => { sv('rect', { width: w2, height: h2, fill: DEEP }, g); } }); guy.hold(1, gp.g, { x: -4, y: 10, upright: true });
  const u = C.ui(root); const us = uiSvg(u); const fz = C.flag(us.svg, us.defs, 'za', { r: 48 }); const mt = C.meter(us.svg, us.defs, { w: 420, h: 40, label: 'DATA' });
  const tiles = [['phone', 'Airtime'], ['wifi', 'Data'], ['bolt', 'Electricity'], ['voucher', 'Vouchers'], ['receipt', 'Bills']].map(([n, l]) => { const g = sv('g', {}, us.svg); sv('rect', { x: -80, y: -80, width: 160, height: 160, rx: 26, fill: '#fff', opacity: .96 }, g); const ic = C.icon(g, us.defs, n, { r: 40, bg: LIME, fg: DEEP, shadow: false }); ic.draw(1); ic.g.setAttribute('transform', 'translate(0,-16)'); C.T(g, l, { y: 50, 'font-size': 26, fill: DEEP, 'font-family': 'Barlow', 'font-weight': 700 }); return g; });
  const ts = C.toast(u, { title: 'Data added', sub: 'your own phone, here in South Africa' }); return { w, tx, guy, fz, mt, tiles, ts };
}, (s, lt, t) => {
  G(s.tx.g, lerp(2300, -500, prog(t, A15[0], A15[1] + .5)), 985, 0, .55); s.tx.spin(-lt * 500);
  s.guy.set(t, { x: 700, y: 1070, s: 1.1, pose: 'phone', expr: t > at('own', 54) + .3 ? 'happy' : 'smile', turn: .3 });
  pop(s.fz, 140, 160, t, A15[0] + .1, { s: 1 }); G(s.mt.g, 1340, 260); s.mt.set(E.ioC(prog(t, at('top'), at('phone', 55) + .3)), 'DATA ' + Math.round(100 * E.ioC(prog(t, at('top'), at('phone', 55) + .3))) + '%'); s.mt.g.setAttribute('opacity', prog(t, at('top') - .2, at('top')));
  s.tiles.forEach((g, i) => pop(g, 1020 + i * 190, 560, t, at('here') - .2 + i * .1, { s: .95 }));
  P(s.ts, { x: 1340, y: 790, o: prog(t, at('phone', 55), at('phone', 55) + .15), s: .7 + .3 * E.outB(prog(t, at('phone', 55), at('phone', 55) + .35)) });
  s.w.camera({ x: lerp(-60, 30, prog(t, A15[0], A15[1])), y: -20, zoom: 1.08, focus: 1, dof: .8 });
  cueOnce(s, [[A15[0], 'whoosh', .5], [at('top'), 'swoosh_up', .4], [at('phone', 55), 'notif', .6], ...[0, 1, 2, 3, 4].map(i => [at('here') - .2 + i * .1, 'pop', .3])]);
}, { in: 'whip', tin: .35, dir: 1 });

// ================= A16: end card =================
const A16 = [A15[1], A15[1] + 5.4];
shot(A16[0], A16[1], ({ root, world }) => { const w = world(); const bg = motionBg(w, { glyphs: null }); const bk = C.bokeh(bg.L, { n: 34, color: LIME, area: [0, 0, 3000, 1900], size: [10, 40], alpha: [.04, .13] });
  const u = C.ui(root); const logo = el('img', { src: KIT + 'logos/fluxr-white.png', class: 'abs' }, u); logo.style.width = '460px';
  const code = el('div', { class: 'abs' }, u, '*130*31026*<span style="color:#85ed70">VoucherPIN</span>#'); code.style.cssText += "font:800 92px/1 'Barlow Condensed';color:#fff;white-space:nowrap";
  const l1 = el('div', { class: 'abs' }, u, 'Or get the <b style="color:#85ed70">Fluxr app on Google Play</b>'); l1.style.cssText += "font:700 42px/1 Barlow;color:#e6f5ec;white-space:nowrap";
  const l2 = el('div', { class: 'abs' }, u, 'www.fluxr.co.za'); l2.style.cssText += "font:700 36px/1 Barlow;color:#a9c4b8;white-space:nowrap;letter-spacing:.06em";
  const card = C.card3d(u, 330, 680, { persp: 1400 }); const ph = C.phone(card.svg, card.defs, { w: 310, h: 660, screenFn: (g, w2, h2) => appScreen(g, 'phone-01-home.png', w2, h2) }); G(ph.g, 165, 340);
  const sub = C.subscribe(u, {}); return { w, bg, bk, logo, code, l1, l2, card, sub };
}, (s, lt, t) => { s.bg.set(t); s.bk(t); const a = A16[0];
  P(s.logo, { x: 760, y: 230, s: E.outB(prog(t, a, a + .5)), o: prog(t, a, a + .2) });
  P(s.code, { x: 760, y: 420, o: E.outC(prog(t, a + .3, a + .7)), y: 420 + (1 - E.outC(prog(t, a + .3, a + .8))) * 40 });
  P(s.l1, { x: 760, y: 550, o: E.outC(prog(t, a + .6, a + 1)) }); P(s.l2, { x: 760, y: 630, o: E.outC(prog(t, a + .8, a + 1.2)) });
  const q = E.outQu(prog(t, a + .2, a + 1.2)); s.card.set({ x: 1530, y: 560 + (1 - q) * 600, ry: lerp(-40, -16, q) + Math.sin(t) * 3, rx: 6, rz: 4, s: .95, light: ((t - a) * .4) % 1.6 - .3 });
  s.sub.set(t, a + 1.6); P(s.sub.el, { x: 760, y: 820, o: E.outC(prog(t, a + 1.1, a + 1.5)) });
  s.w.camera({ zoom: 1 + lt * .015 });
  cueOnce(s, [[a, 'whoosh', .5], [a + .3, 'pop', .4], [a + .3, 'swoosh_up', .4], [a + 2.35, 'click', .8], [a + 2.4, 'chime', .5]]);
}, { in: 'bands', tin: .5, colors: [LIME, '#fff', DEEP] });
window.DURATION = A16[1];
