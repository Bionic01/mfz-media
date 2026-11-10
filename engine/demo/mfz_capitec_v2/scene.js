/* Money From Zero — sample v2 (motion-graphics heavy): the Capitec story opening + "what it means for you". Theme: mfz. */
const C = CINE; const { shot, cue, E, prog, clamp, lerp, kf, spr, noise1, sv, G, P, el, Person, SKIN, poseAt, pop } = C;
const BASE = window.SCENE.replace(/[^/]+$/, '');
const LEAD = .6; const V = C.voice(C.loadJSON(BASE + '../mfz_capitec/words_min.json'), LEAD);
const at = (w, after = 0) => V.at(w, after), to = (w, after = 0) => V.to(w, after);
C.setTheme('mfz');
const GOLD = '#f7be33', GREEN = '#2fd27f', INK = '#f4eedf', BG = '#121214', RED = '#ff5d5d', MUTED = '#b9b3a8', BLUE = '#6cb4ff';
window.META = { music: { style: 'doc', drop: at('but') - .05, end: 53.5, breaks: [] } };
C.initFX({ grain: .055, vignette: .5 });
el('div', { class: 'bug' }, C.stage, `<span class="z">0</span>MONEY FROM ZERO`);

const uiSvg = u => { const s = C.svgBox(1920, 1080, u); return { svg: s, defs: sv('defs', {}, s) }; };
function tag(parent, text, { color = GOLD } = {}) { return el('div', { class: 'abs' }, parent, `<div style="display:inline-flex;align-items:center;gap:14px;font:800 36px/1 'Barlow Condensed';letter-spacing:.12em;color:${INK};background:rgba(18,18,20,.72);padding:12px 22px 12px 14px;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.3)"><span style="width:10px;height:40px;background:${color};border-radius:3px"></span>${text}</div>`); }
const src = (parent, text) => { const e = el('div', { class: 'abs' }, parent, text); e.style.cssText += `font:600 22px/1 Barlow;color:${MUTED};white-space:nowrap;letter-spacing:.02em`; return e; };
function motionBg(w, { c1 = '#26262c', c2 = '#08080a', blobs = ['#3a3326', '#1c1c22', '#4a3c1c'], key = '#ffd9a0', glyphs = ['R'], dots = true } = {}) {
  const L = w.layer(4, { w: 3000, h: 1900 }); C.studio(L, { c1, c2, key }); const ups = [C.blobs(L, { colors: blobs, o: .5 })]; if (dots) ups.push(C.dotGrid(L, { o: .06 })); if (glyphs) ups.push(C.glyphs(L, { chars: glyphs, color: GOLD, o: [.03, .09] }));
  return { L, set: t => ups.forEach(f => f(t)) };
}
function street(w) {
  const L5 = w.layer(6, { w: 3400, h: 1900 }), L3 = w.layer(2.6, { w: 3000, h: 1600 }), Lh = w.layer(1.9, { w: 2700, h: 1400 }), L1 = w.layer(1, { w: 2400, h: 1080 }), L0 = w.layer(.6, { w: 2600, h: 1080 });
  const skyN = C.sky(L5, [[0, '#0e1630'], [.6, '#2a3566'], [1, '#6b5a7a']]); const skyD = C.sky(L5, [[0, '#2e4c86'], [.55, '#e48a58'], [1, '#f7c98c']]);
  const sun = C.sun(L5, 0, 0, { r: 120, color: '#ffe1a6', glow: '#ff9a52' }); const stars = sv('g', {}, L5.svg); const R = C.rnd(3); for (let i = 0; i < 90; i++) sv('circle', { cx: R() * 3400, cy: R() * 900, r: .8 + R() * 2, fill: '#fff', opacity: .3 + R() * .6 }, stars);
  const sk = C.skyline(L3.svg, L3.defs, { w: 3000, h: 380, color: '#28304a', seed: 12, windows: .18 }); G(sk.g, 0, 1010); sv('rect', { x: 0, y: 1005, width: 3000, height: 600, fill: '#2b2d38' }, L3.svg);
  const hz = C.haze(Lh, { color: '#e9a06a', o: .35, from: .35, to: .9 });
  C.ground(L1, 900, { color: '#4a4c58', line: false }); sv('rect', { x: 0, y: 900, width: 2400, height: 26, fill: '#6b6e7c' }, L1.svg);
  const br = C.branch(L1.svg, L1.defs, { w: 820, h: 470, wall: '#ece6da', accent: '#1d1d22', sign: 'BANK', sub: 'OPEN 08:00' }); G(br.g, 1200, 905);
  const fp = C.flagPole(L1.svg, L1.defs, 'za', { h: 560, w: 200, fh: 130 }); G(fp.g, 1700, 905);
  const lp = [C.lamp(L1.svg, L1.defs, { h: 560 }), C.lamp(L1.svg, L1.defs, { h: 560 })]; G(lp[0], 560, 905); G(lp[1], 1980, 905, 0, -1, 1);
  const fg = sv('g', {}, L0.svg); for (let i = 0; i < 3; i++) { const t = C.acacia(fg, L0.defs, { s: 1.6, c: '#1d2a22', trunk: '#15110e' }); G(t, [-60, 2500, 1300][i], 1180, 0, 1); }
  return { L1, skyN, skyD, sun, stars, br, fp, hz };
}
const cueOnce = (s, list) => { if (!s.__c) { s.__c = 1; list.forEach(c => cue(...c)); } };

// ================= B1: 1 March 2001 (date board) =================
const B1 = [0, at('a') - .1];
shot(B1[0], B1[1] + .45, ({ root, world }) => { const w = world(); const bg = motionBg(w, {});
  const u = C.ui(root); const us = uiSvg(u); const f1 = C.flapText(u, '01 MARCH', { size: 150 }), f2 = C.flapText(u, '2001', { size: 190 });
  const cal = C.icon(us.svg, us.defs, 'calendar', { r: 56, bg: GOLD, fg: BG }); const fz = C.flag(us.svg, us.defs, 'za', { r: 50 }); const sp = C.sparkles(us.svg, { n: 16, color: GOLD, area: [300, 200, 1320, 600] });
  return { w, bg, f1, f2, cal, fz, sp };
}, (s, lt, t) => { s.bg.set(t); s.sp(t); s.f1.set(t, .2, .05); s.f2.set(t, at('2001') - .1, .07); P(s.f1.el, { x: 960, y: 400 }); P(s.f2.el, { x: 960, y: 620 });
  pop(s.cal.g, 380, 400, t, .1, { s: 1, spin: -30 }); s.cal.draw(prog(t, .1, .6)); pop(s.fz, 1560, 620, t, at('2001'), { s: 1, spin: 40 });
  s.w.camera({ zoom: 1 + lt * .04, rot: lerp(-1, .5, prog(t, B1[0], B1[1])) });
  cueOnce(s, [[.2, 'flaps', .7], [at('2001') - .1, 'flaps', .6], [.1, 'pop', .4], [at('2001'), 'pop', .5]]);
}, { in: 'fade', tin: .4 });

// ================= B2: a new bank opens its doors =================
const B2 = [at('a') - .1, at('it') - .1];
shot(B2[0], B2[1] + .45, ({ root, world }) => { const w = world(); const s = street(w); const u = C.ui(root); const us = uiSvg(u);
  const ppl = [{ skin: SKIN.dark, hair: 'short', shirt: '#3d6fb5', pants: '#2b2f3a', seed: 61 }, { skin: SKIN.brown, hair: 'bun', female: true, shirt: '#c0392b', skirt: '#1f2a36', seed: 62 }, { skin: SKIN.medium, hair: 'cap', cap: '#f7be33', shirt: '#2fbf71', pants: '#3d4b66', seed: 63 }].map(o => new Person(s.L1.svg, s.L1.defs, o));
  const br = C.burst(s.L1.svg, 1200, 520, { n: 14, r0: 300, r1: 520, color: GOLD }); const t1 = C.highlight(u, 'A NEW BANK <mark>OPENS</mark>', { size: 84, mark: GOLD, markInk: BG }); const tg = tag(u, '1 MARCH 2001 · SOUTH AFRICA');
  return { w, s, ppl, br, t1, tg };
}, (s, lt, t) => {
  const dawn = E.ioS(prog(t, B2[0], at('africa') + .3)); s.s.skyD.setAttribute('opacity', .3 + .7 * dawn); s.s.stars.setAttribute('opacity', 1 - dawn); G(s.s.sun, 2100, lerp(1200, 900, dawn)); s.s.fp.set(t);
  const on = E.outC(prog(t, at('opened'), at('opened') + .5)); s.s.br.setLight(on); s.br(prog(t, at('opened'), at('opened') + .9));
  s.ppl.forEach((p, i) => { const st = at('doors') - .2 + i * .35; const x = lerp([200, 2300, 380][i], 1200 + (i - 1) * 60, clamp((t - st) / 2.4)); const walking = t > st && t < st + 2.4;
    p.set(t, { x, y: 950 + i * 10, s: .8, side: walking ? 1 : .2, flip: [false, true, false][i], walk: walking ? (t - st) * 1.3 : null, expr: 'smile', o: t > st - .1 ? 1 : 0 }); });
  s.t1.set(t, at('opened') - .1); P(s.t1.el, { x: 960, y: 160, o: prog(t, at('new') - .2, at('new')) }); P(s.tg, { x: 960, y: 260, o: E.outC(prog(t, at('south') - .2, at('south') + .2)) });
  s.w.camera({ x: kf(t, [[B2[0], -40], [B2[1], 80]]), y: kf(t, [[B2[0], 20], [B2[1], 50]]), zoom: kf(t, [[B2[0], 1.05], [B2[1], 1.3]]), focus: 1, dof: .9, rot: noise1(t * .2, 4) * .3 });
  cueOnce(s, [[at('opened'), 'lights', .7], [at('opened') + .05, 'sparkle', .4], [at('doors'), 'shopbell', .4], ...[0, 1, 2, 3, 4, 5].map(i => [at('doors') + i * .4, 'step', .25])]);
}, { in: 'bands', tin: .5, colors: [GOLD, INK, '#2b2b30'] });

// ================= B3: 55 branches + 25 000 clients =================
const B3 = [at('it') - .1, at('tiny') - .1];
shot(B3[0], B3[1] + .35, ({ root, world }) => { const w = world(); const bg = motionBg(w, { glyphs: null });
  const L = w.layer(1, { w: 1920, h: 1080 }); const map = C.africaMap(L.svg, L.defs, { land: '#2a2a30', stroke: '#3a3a41' }); map.highlight('ZAF', GOLD, .3);
  const R = C.rnd(55); const pins = []; const A = window.AFRICA.ZAF; let tries = 0; while (pins.length < 55 && tries++ < 5000) { const x = 460 + R() * 380, y = 760 + R() * 300; if (!C.inCountry('ZAF', x, y)) continue; const g = sv('g', { transform: `translate(${x},${y})` }, map.top); sv('rect', { x: -7, y: -7, width: 14, height: 12, rx: 2, fill: INK }, g); sv('rect', { x: -8, y: -10, width: 16, height: 5, rx: 2, fill: GOLD }, g); pins.push({ g, x, y, d: R() }); }
  G(map.g, -150, -560, 0, 1.25);
  const u = C.ui(root); const us = uiSvg(u); const o1 = C.odometer(u, { digits: 2, size: 160, color: GOLD }); const l1 = el('div', { class: 'abs' }, u, 'BRANCHES'); const o2 = C.odometer(u, { digits: 5, size: 160, color: GOLD }); const l2 = el('div', { class: 'abs' }, u, 'CLIENTS');
  [l1, l2].forEach(e => e.style.cssText += `font:800 46px/1 'Barlow Condensed';letter-spacing:.22em;color:${INK}`);
  const i1 = C.icon(us.svg, us.defs, 'bank', { r: 52, bg: GOLD, fg: BG }), i2 = C.icon(us.svg, us.defs, 'family', { r: 52, bg: INK, fg: BG });
  const dots = sv('g', {}, us.svg); const pd = []; for (let i = 0; i < 125; i++) { const c = sv('circle', { r: 0, fill: i % 9 ? INK : GOLD }, dots); pd.push({ c, x: 1170 + (i % 25) * 26, y: 700 + Math.floor(i / 25) * 34, d: R() }); }
  const note = src(u, 'Each dot ≈ 200 clients'); return { w, bg, pins, o1, o2, l1, l2, i1, i2, pd, note };
}, (s, lt, t) => { s.bg.set(t); const a1 = at('fifty-five') - .25, a2 = at('twenty-five') - .25;
  s.pins.forEach(p => { const q = E.outB(prog(t, a1 + p.d * .9, a1 + p.d * .9 + .3)); p.g.setAttribute('transform', `translate(${p.x},${p.y}) scale(${Math.max(.001, q)})`); });
  s.o1.set(55 * E.outC(prog(t, a1, a1 + 1.1))); P(s.o1.el, { x: 1360, y: 270, o: prog(t, a1, a1 + .2) }); P(s.l1, { x: 1360, y: 370, o: prog(t, a1 + .2, a1 + .5) }); pop(s.i1.g, 1140, 270, t, a1, { s: 1 }); s.i1.draw(prog(t, a1, a1 + .5));
  s.o2.set(25000 * E.outC(prog(t, a2, a2 + 1.3))); P(s.o2.el, { x: 1480, y: 540, o: prog(t, a2, a2 + .2) }); P(s.l2, { x: 1480, y: 640, o: prog(t, a2 + .2, a2 + .5) }); pop(s.i2.g, 1150, 540, t, a2, { s: 1 }); s.i2.draw(prog(t, a2, a2 + .5));
  s.pd.forEach(d => { const q = E.outB(prog(t, a2 + .2 + d.d * .9, a2 + .45 + d.d * .9)); d.c.setAttribute('cx', d.x); d.c.setAttribute('cy', d.y); d.c.setAttribute('r', 8 * Math.max(0, q)); });
  P(s.note, { x: 1490, y: 900, o: prog(t, a2 + .8, a2 + 1.2) });
  s.w.camera({ x: lerp(-40, 0, prog(t, B3[0], B3[1])), zoom: lerp(1.06, 1.0, prog(t, B3[0], B3[1])), focus: 1, dof: .3 });
  cueOnce(s, [[B3[0], 'swish', .5], ...[...Array(10).keys()].map(i => [a1 + i * .09, 'tick', .35]), [a2, 'sparkle', .5], [a1, 'pop', .4], [a2, 'pop', .4]]);
}, { in: 'zoom', tin: .35 });

// ================= B4: tiny, next to the big four =================
const B4 = [at('tiny') - .1, at('but') - .1];
shot(B4[0], B4[1] + .35, ({ root, world }) => { const w = world(); const L5 = w.layer(5, { w: 3600, h: 2400 }), Lh = w.layer(2, { w: 3400, h: 2300 }), L1 = w.layer(1, { w: 3200, h: 2200 });
  C.sky(L5, [[0, '#1c2440'], [.6, '#5a5370'], [1, '#c58b6a']]); C.sun(L5, 2800, 1500, { r: 140, color: '#ffd9a0', glow: '#ff9a52' }); C.haze(Lh, { color: '#c58b6a', o: .4, from: .4, to: .9 });
  sv('rect', { x: 0, y: 1840, width: 3200, height: 400, fill: '#2f313c' }, L1.svg);
  for (let i = 0; i < 4; i++) { const h = C.bankHall(L1.svg, L1.defs, { w: 560, h: 1500 - i * 60, stone: ['#e9e1d2', '#dcd3c3', '#e4dccd', '#d6cdbd'][i], name: 'BANK' }); G(h, 1080 + i * 560, 1850); }
  const br = C.branch(L1.svg, L1.defs, { w: 300, h: 190, wall: '#ece6da', accent: '#1d1d22', sign: 'BANK' }); G(br.g, 520, 1850); br.setLight(1);
  const kid = new Person(L1.svg, L1.defs, { skin: SKIN.brown, hair: 'short', shirt: GOLD, pants: '#2b2f3a', seed: 71 }); const tiny = C.T(L1.svg, 'TINY', { x: 520, y: 1590, 'font-size': 64, fill: INK, 'letter-spacing': 8 });
  const u = C.ui(root); const brk = el('div', { class: 'abs' }, u); brk.style.cssText += `width:1080px;height:26px;border:5px solid ${GOLD};border-bottom:none;border-radius:6px 6px 0 0`; const lab = el('div', { class: 'abs' }, u, 'THE BIG FOUR'); lab.style.cssText += `font:800 64px/1 'Barlow Condensed';letter-spacing:.14em;color:${GOLD}`;
  return { w, kid, tiny, brk, lab };
}, (s, lt, t) => {
  s.kid.set(t, { x: 300, y: 1860, s: .5, pose: 'stand', look: [.8, -1], turn: .5, expr: 'surprised' }); s.tiny.setAttribute('opacity', E.outC(prog(t, B4[0] + .1, B4[0] + .4)));
  const pull = E.ioC(prog(t, at('next') - .4, B4[1] + .2)); s.w.camera({ x: lerp(-1120, 0, pull), y: lerp(640, 120, pull), zoom: lerp(2.0, .62, pull), focus: 1, dof: .5, rot: lerp(2, 0, pull) });
  const q = E.outC(prog(t, at('big') - .1, at('four') + .2)); P(s.brk, { x: 1160, y: 170, o: q, sx: Math.max(.001, q) }); P(s.lab, { x: 1160, y: 110, o: q });
  cueOnce(s, [[B4[0], 'pop', .4], [at('next') - .3, 'whoosh_low', .8], [at('four'), 'boom', .5]]);
}, { in: 'whip', tin: .35, dir: -1 });

// ================= B5: it did something simple =================
const B5 = [at('but') - .1, at('its', 14) - .1];
shot(B5[0], B5[1] + .3, ({ root, world }) => { const w = world(); const bg = motionBg(w, { glyphs: null }); const u = C.ui(root); const us = uiSvg(u);
  const bulb = C.icon(us.svg, us.defs, 'bulb', { r: 110, bg: GOLD, fg: BG, sw: 3 }); const br = C.burst(us.svg, 960, 420, { n: 16, r0: 140, r1: 300, color: GOLD }); const sp = C.sparkles(us.svg, { n: 14, color: GOLD, area: [500, 150, 920, 500] });
  const t1 = C.highlight(u, 'IT DID SOMETHING <mark>SIMPLE</mark>', { size: 96, mark: GOLD, markInk: BG }); return { w, bg, bulb, br, sp, t1 };
}, (s, lt, t) => { s.bg.set(t); s.sp(t); pop(s.bulb.g, 960, 420, t, B5[0] + .1, { s: 1 }); s.bulb.draw(prog(t, B5[0] + .1, B5[0] + .7)); s.br(prog(t, at('simple') - .1, at('simple') + .8));
  s.t1.set(t, at('simple') - .1); P(s.t1.el, { x: 960, y: 700, o: prog(t, B5[0], B5[0] + .2) }); s.w.camera({ zoom: 1 + lt * .03 });
  cueOnce(s, [[B5[0] + .1, 'bloop', .5], [at('simple'), 'ding', .6]]);
}, { in: 'circle', tin: .5, colors: [GOLD], ix: 50, iy: 40 });

// ================= B6: opened at 8, an hour before other banks =================
const B6 = [at('its', 14) - .1, at('so', 19) - .1];
shot(B6[0], B6[1] + .35, ({ root, world }) => { const w = world(); const bg = motionBg(w, {});
  const L = w.layer(1, { w: 1920, h: 1080 }); const c1 = C.clock(L.svg, L.defs, { r: 230, rim: GOLD }); const c2 = C.clock(L.svg, L.defs, { r: 190, rim: '#55555e', face: '#d9d4c8' });
  const u = C.ui(root); const us = uiSvg(u); const f1 = C.flapText(u, '08:00', { size: 100, accent: true }), f2 = C.flapText(u, '09:00', { size: 80 }); const l1 = el('div', { class: 'abs' }, u, 'THIS BANK'), l2 = el('div', { class: 'abs' }, u, 'OTHER BANKS');
  [l1, l2].forEach(e => e.style.cssText += `font:800 44px/1 'Barlow Condensed';letter-spacing:.14em;color:${INK};white-space:nowrap`);
  const hr = el('div', { class: 'abs' }, u, '+1 HOUR'); hr.style.cssText += `font:800 70px/1 'Barlow Condensed';color:${BG};background:${GREEN};padding:10px 24px;border-radius:14px;letter-spacing:.06em;box-shadow:0 12px 30px rgba(0,0,0,.4)`;
  const sun = C.icon(us.svg, us.defs, 'clock', { r: 40, bg: GREEN, fg: BG }); return { w, bg, c1, c2, f1, f2, l1, l2, hr, sun };
}, (s, lt, t) => { s.bg.set(t); const eight = at('eight');
  s.c1.set(7 + 45 / 60 + (15 / 60) * E.ioC(prog(t, B6[0] + .2, eight))); s.c2.set(9);
  const split = E.ioC(prog(t, at('hour') - .4, at('hour') + .5));
  G(s.c1.g, lerp(960, 560, split), lerp(560, 520, split), 0, lerp(1, .85, split) * (1 + .06 * Math.max(0, 1 - Math.abs(t - eight) * 4))); G(s.c2.g, lerp(1800, 1360, split), 520, 0, Math.max(.001, split));
  s.f1.set(t, eight - .25, .05); P(s.f1.el, { x: lerp(960, 560, split), y: 900 }); s.f2.set(t, at('hour') - .1, .05); P(s.f2.el, { x: 1360, y: 880, o: split });
  P(s.l1, { x: lerp(960, 560, split), y: 1000, o: prog(t, eight, eight + .3) }); P(s.l2, { x: 1360, y: 980, o: split });
  P(s.hr, { x: 960, y: 200, o: E.outC(prog(t, at('before') - .1, at('before') + .25)), s: E.outB(prog(t, at('before') - .1, at('before') + .35)) });
  s.w.camera({ zoom: kf(t, [[B6[0], 1.2], [eight, 1.1], [B6[1], 1.0]]), y: kf(t, [[B6[0], 40], [B6[1], 0]]), focus: 1, dof: .6 });
  if (!s.__c) { s.__c = 1; for (let i = 0; i < 8; i++) cue(B6[0] + .2 + i * ((eight - B6[0] - .2) / 8), i % 2 ? 'tock' : 'tick', .45); cue(eight, 'ding', .7); cue(eight - .25, 'flaps', .5); cue(at('hour') - .2, 'swish', .5); cue(at('before'), 'pop', .5); }
}, { in: 'flash', tin: .2 });

// ================= B7: working people bank before work =================
const B7 = [at('so', 19) - .1, at('it', 21) - .1];
shot(B7[0], B7[1] + .35, ({ root, world }) => { const w = world(); const s = street(w); s.skyN.setAttribute('opacity', 0); G(s.sun, 900, 860); s.stars.setAttribute('opacity', 0); s.br.setLight(1);
  const ot = C.bankHall(s.L1.svg, s.L1.defs, { w: 640, h: 560, stone: '#c9c1b2', name: 'BANK' }); G(ot, 300, 905); const closed = sv('g', {}, s.L1.svg); sv('rect', { x: 200, y: 650, width: 200, height: 56, rx: 8, fill: '#111' }, closed); C.T(closed, 'OPENS 09:00', { x: 300, y: 679, 'font-size': 30, fill: RED, 'font-family': 'Barlow', 'font-weight': 700 });
  const wk = [{ skin: SKIN.dark, hair: 'cap', cap: '#f39c12', shirt: '#e67e22', pants: '#34495e', seed: 81 }, { skin: SKIN.medium, hair: 'bun', female: true, shirt: '#5dade2', pants: '#1b4f72', seed: 82 }, { skin: SKIN.brown, hair: 'side', shirt: '#ffffff', jacket: '#2c3e50', tie: RED, pants: '#2c3e50', seed: 83 }, { skin: SKIN.deep, hair: 'scarf', scarf: '#8e44ad', scarf2: GOLD, female: true, shirt: '#16a085', skirt: '#2c3e50', seed: 84 }].map(o => new Person(s.L1.svg, s.L1.defs, o));
  const icons = ['bag', 'phone', 'card', 'clock'].map(n => { const ic = C.icon(s.L1.svg, s.L1.defs, n, { r: 30, bg: GOLD, fg: BG }); ic.draw(1); return ic; });
  const u = C.ui(root); const t1 = C.highlight(u, 'BANK <mark>BEFORE</mark> WORK', { size: 92, mark: GOLD, markInk: BG }); return { w, s, wk, icons, t1 };
}, (s, lt, t) => { s.s.fp.set(t);
  s.wk.forEach((p, i) => { const x0 = 500 - i * 230 + lt * 300; const x = Math.min(x0, 1150 + i * 30); const walking = x0 < 1150 + i * 30; p.set(t, { x, y: 960 + (i % 2) * 14, s: .82, side: walking ? 1 : .3, walk: walking ? lt * 1.35 + i * .25 : null, expr: 'smile' });
    pop(s.icons[i].g, x + 10, 960 + (i % 2) * 14 - 520, t, B7[0] + .3 + i * .15, { s: 1 }); });
  s.t1.set(t, at('before', 19) - .1); P(s.t1.el, { x: 960, y: 150, o: prog(t, at('working') - .2, at('working')) });
  s.w.camera({ x: lerp(-200, 100, prog(t, B7[0], B7[1])), y: 60, zoom: 1.15, focus: 1, dof: .9 });
  cueOnce(s, [[B7[0], 'whoosh', .5], ...[...Array(8).keys()].map(i => [B7[0] + .2 + i * .36, 'step', .25]), ...[0, 1, 2, 3].map(i => [B7[0] + .3 + i * .15, 'pop', .3]), [at('bank', 20), 'shopbell', .4]]);
}, { in: 'whip', tin: .35, dir: 1 });

// ================= B8: simple, low cost, growing =================
const B8 = [at('it', 21) - .1, at('branch') - .1];
shot(B8[0], B8[1] + .3, ({ root, world }) => { const w = world(); const bg = motionBg(w, {}); const u = C.ui(root); const us = uiSvg(u);
  const items = [['card', 'SIMPLE', GOLD], ['coins', 'LOW COST', GREEN], ['chart', 'GROWING', BLUE]].map(([n, l, c], i) => { const g = sv('g', {}, us.svg); sv('rect', { x: -240, y: -250, width: 480, height: 500, rx: 34, fill: '#1c1c21', stroke: c, 'stroke-width': 4 }, g);
    const ic = C.icon(g, us.defs, n, { r: 92, bg: c, fg: BG, shadow: false }); ic.g.setAttribute('transform', 'translate(0,-60)'); C.T(g, l, { y: 140, 'font-size': 72, fill: INK, 'letter-spacing': 4 }); return { g, ic }; });
  const lc = sv('g', {}, us.svg); const draw = C.lineChart({ svg: lc, defs: us.defs }, [2, 3, 3.5, 5, 7, 9, 12, 16, 21, 26], { x: 1440, y: 520, w: 320, h: 200, color: BLUE, width: 7 });
  const dn = C.icon(us.svg, us.defs, 'down', { r: 34, bg: GREEN, fg: BG }); return { w, bg, items, draw, dn };
}, (s, lt, t) => { s.bg.set(t); const ts = [at('simple', 22) - .15, at('costs') - .15, at('growing') - .2];
  s.items.forEach((it, i) => { const q = pop(it.g, 400 + i * 560, 560, t, ts[i], { s: .95, spin: i % 2 ? 8 : -8 }); it.ic.draw(prog(t, ts[i] + .1, ts[i] + .6)); });
  pop(s.dn.g, 1110, 400, t, ts[1] + .3, { s: 1 }); s.dn.draw(prog(t, ts[1] + .3, ts[1] + .7)); s.draw(E.ioC(prog(t, ts[2] + .2, ts[2] + 1.2)));
  s.w.camera({ zoom: 1.02 + lt * .01 });
  cueOnce(s, [...ts.map(a => [a + .05, 'thud', .6]), [ts[2] + .2, 'swoosh_up', .4], [ts[1] + .3, 'coin', .4]]);
}, { in: 'bands', tin: .5, colors: [GOLD, GREEN, BLUE] });

// ================= B9: branch by branch, then app by app =================
const B9 = [at('branch') - .1, at('today') - .1];
shot(B9[0], B9[1] + .35, ({ root, world }) => { const w = world(); const bg = motionBg(w, { glyphs: null });
  const L = w.layer(1, { w: 1920, h: 1080 }); const map = C.africaMap(L.svg, L.defs, { land: '#2a2a30', stroke: '#3a3a41' }); G(map.g, 455, 30); map.highlight('ZAF', GOLD, .25);
  const b = map.A.ZAF.b; const R = C.rnd(17); const pins = [], phones = []; let tries = 0;
  while (pins.length < 70 && tries++ < 5000) { const x = b[0] + R() * (b[2] - b[0]), y = b[1] + R() * (b[3] - b[1]); if (!C.inCountry('ZAF', x, y)) continue; const g = sv('g', { transform: `translate(${x},${y})` }, map.top); sv('circle', { r: 4.5, fill: GOLD, stroke: BG, 'stroke-width': 1 }, g); pins.push({ g, d: R() }); }
  tries = 0; while (phones.length < 40 && tries++ < 5000) { const x = b[0] + R() * (b[2] - b[0]), y = b[1] + R() * (b[3] - b[1]); if (!C.inCountry('ZAF', x, y)) continue; const g = sv('g', {}, map.top); sv('rect', { x: -9, y: -16, width: 18, height: 32, rx: 4, fill: '#fff', stroke: BG, 'stroke-width': 2 }, g); sv('rect', { x: -6, y: -12, width: 12, height: 21, rx: 2, fill: GREEN }, g); phones.push({ g, d: R(), x, y }); }
  const zc = [0, 1].map(k => phones.reduce((a, q) => a + (k ? q.y : q.x), 0) / phones.length);
  const u = C.ui(root); const us = uiSvg(u); const i1 = C.icon(us.svg, us.defs, 'bank', { r: 46, bg: GOLD, fg: BG }), i2 = C.icon(us.svg, us.defs, 'phone', { r: 46, bg: GREEN, fg: BG });
  const l1 = el('div', { class: 'abs' }, u, 'BRANCH BY BRANCH'), l2 = el('div', { class: 'abs' }, u, 'THEN APP BY APP'); [l1, l2].forEach((e, i) => e.style.cssText += `font:800 64px/1 'Barlow Condensed';letter-spacing:.06em;color:${i ? GREEN : GOLD};white-space:nowrap`);
  return { w, bg, pins, phones, zc, i1, i2, l1, l2 };
}, (s, lt, t) => { s.bg.set(t); const a1 = at('branch'), a2 = at('app');
  s.pins.forEach(p => { const q = E.outB(prog(t, a1 + p.d, a1 + p.d + .3)); p.g.firstChild.setAttribute('r', 4.5 * Math.max(0, q)); });
  s.phones.forEach(p => { const q = E.outB(prog(t, a2 + p.d * 1.1, a2 + p.d * 1.1 + .3)); p.g.setAttribute('transform', `translate(${p.x},${p.y}) scale(${Math.max(.001, q) * .5})`); });
  const cx = s.zc[0] - 505, cy = s.zc[1] - 510; s.w.camera({ x: lerp(cx - 20, cx + 15, prog(t, B9[0], B9[1])), y: lerp(cy - 30, cy, prog(t, B9[0], B9[1])), zoom: lerp(3.3, 4.4, E.ioC(prog(t, B9[0], B9[1]))), focus: 1, dof: .5, rot: lerp(-2, 1, prog(t, B9[0], B9[1])) });
  pop(s.i1.g, 160, 160, t, a1 - .1); s.i1.draw(prog(t, a1, a1 + .5)); P(s.l1, { x: 230, y: 160, anchor: 'tl', o: E.outC(prog(t, a1 - .1, a1 + .3)) }); s.l1.style.transform += ' translateY(-50%)';
  pop(s.i2.g, 160, 270, t, a2 - .1); s.i2.draw(prog(t, a2, a2 + .5)); P(s.l2, { x: 230, y: 270, anchor: 'tl', o: E.outC(prog(t, a2 - .1, a2 + .3)) }); s.l2.style.transform += ' translateY(-50%)';
  if (!s.__c) { s.__c = 1; for (let i = 0; i < 10; i++) cue(a1 + i * .1, 'tick', .35); for (let i = 0; i < 8; i++) cue(a2 + i * .13, 'bloop', .3); }
}, { in: 'fade', tin: .3 });

// ================= B10: 26 million active clients =================
const B10 = [at('today') - .1, at('so', 34) - .1];
shot(B10[0], B10[1] + .35, ({ root, world }) => { const w = world(); const bg = motionBg(w, { glyphs: null });
  const L = w.layer(1, { w: 2600, h: 1500 }); const cr = C.crowd(L.svg, L.defs, { cols: 16, rows: 6, x: 1300, y: 900, dx: 150, dy: 80, s: .42, seed: 9 });
  const u = C.ui(root); const us = uiSvg(u); const od = C.odometer(u, { digits: 8, size: 180, color: GOLD }); const lab = el('div', { class: 'abs' }, u, 'ACTIVE CLIENTS'); lab.style.cssText += `font:800 54px/1 'Barlow Condensed';letter-spacing:.24em;color:${INK}`;
  const fz = C.flag(us.svg, us.defs, 'za', { r: 40 }); const so = src(u, 'Source: Capitec annual results, year to February 2026'); const sp = C.sparkles(us.svg, { n: 14, color: GOLD, area: [500, 60, 920, 260] });
  return { w, bg, cr, od, lab, fz, so, sp };
}, (s, lt, t) => { s.bg.set(t); s.sp(t); const a = at('twenty-six') - .3; s.cr.set(t, prog(t, B10[0], a + .8), { expr: 'smile' });
  s.od.set(26000000 * E.outE(prog(t, a, a + 1.6))); P(s.od.el, { x: 960, y: 150, o: prog(t, a, a + .2) }); P(s.lab, { x: 960, y: 262, o: prog(t, a + .3, a + .7) }); pop(s.fz, 300, 150, t, a + .2, { s: 1 });
  P(s.so, { x: 960, y: 1030, o: prog(t, a + .6, a + 1) });
  s.w.camera({ zoom: kf(t, [[B10[0], 1.9], [B10[1], .95]], E.ioC), y: kf(t, [[B10[0], 300], [B10[1], 60]]), focus: 1, dof: .6 });
  cueOnce(s, [[B10[0], 'whoosh_low', .6], [a + .1, 'riser', .4], [a + 1.4, 'impact', .5]]);
}, { in: 'zoom', tin: .35 });

// ================= B11: what does it mean for you? / your account has a price =================
const B11 = [at('so', 34) - .1, at('monthly') - .15];
shot(B11[0], B11[1] + .35, ({ root, world }) => { const w = world(); const bg = motionBg(w, {});
  const L = w.layer(1, { w: 1920, h: 1080 }); const her = new Person(L.svg, L.defs, { skin: SKIN.brown, hair: 'afro', female: true, shirt: '#2fd27f', pants: '#1f2a36', earrings: true, seed: 91 });
  const card = C.bankCard(L.svg, L.defs, { c1: '#1d1d22', c2: '#3a3a41', name: 'YOUR BANK ACCOUNT' }); const tg = C.priceTag(L.svg, L.defs, { w: 220, h: 100, color: GOLD }); tg.label.textContent = 'R ?';
  const u = C.ui(root); const us = uiSvg(u); const qm = C.icon(us.svg, us.defs, 'person', { r: 50, bg: GOLD, fg: BG }); const t1 = C.highlight(u, 'WHAT DOES THAT MEAN <mark>FOR YOU?</mark>', { size: 76, mark: GOLD, markInk: BG });
  const t2 = C.highlight(u, 'YOUR ACCOUNT <mark>HAS A PRICE</mark>', { size: 76, mark: GOLD, markInk: BG }); return { w, bg, her, card, tg, qm, t1, t2 };
}, (s, lt, t) => { s.bg.set(t); const pr = at('price');
  s.her.set(t, { x: 520, y: 1060, s: 1.25, pose: poseAt(t, [[0, 'present'], [pr - .4, 'point']]), gesture: t < pr - .4 ? .8 : .2, expr: t > pr ? 'surprised' : 'smile', turn: .25, talk: 0 });
  const q = E.outB(prog(t, at('your') - .2, at('your') + .3)); G(s.card, 1300, 560 + Math.sin(t * 1.4) * 8, -8 + Math.sin(t) * 2, Math.max(.001, q) * 1.1); G(s.tg.g, 1460, 470, 0, Math.max(.001, E.outB(prog(t, pr - .2, pr + .3)))); s.tg.set(t, 1.5);
  pop(s.qm.g, 260, 170, t, B11[0] + .2); s.qm.draw(prog(t, B11[0] + .2, B11[0] + .6));
  s.t1.set(t, at('you', 35) - .2); P(s.t1.el, { x: 900, y: 170, o: prog(t, B11[0] + .1, B11[0] + .3) * (1 - prog(t, at('your') - .3, at('your') - .1)) });
  s.t2.set(t, pr - .1); P(s.t2.el, { x: 900, y: 170, o: prog(t, at('your') - .2, at('your')) });
  s.w.camera({ x: lerp(-40, 40, prog(t, B11[0], B11[1])), y: 30, zoom: lerp(1.12, 1.04, prog(t, B11[0], B11[1])), focus: 1, dof: .4 });
  cueOnce(s, [[B11[0], 'swish', .4], [B11[0] + .2, 'pop', .4], [at('your') - .2, 'whoosh', .4], [pr, 'thud', .5]]);
}, { in: 'circle', tin: .5, colors: [GOLD], ix: 30, iy: 60 });

// ================= B12: monthly fees, cash withdrawals, notifications =================
const B12 = [at('monthly') - .15, at('add') - .15];
shot(B12[0], B12[1] + .35, ({ root, world }) => { const w = world(); const bg = motionBg(w, {});
  const L = w.layer(1, { w: 1920, h: 1080 }); const slip = C.slip(L.svg, L.defs, { w: 420, title: 'BANK FEES', lines: [['Monthly fee', 28], ['Cash withdrawals', 28], ['Notifications', 28], ['', 10], ['TOTAL / MONTH', 34, true]] });
  const jar = sv('g', {}, L.svg); sv('path', { d: 'M -110 -160 L 110 -160 L 120 120 Q 0 150 -120 120 Z', fill: 'rgba(200,230,255,.12)', stroke: 'rgba(220,240,255,.5)', 'stroke-width': 4 }, jar); sv('rect', { x: -120, y: -190, width: 240, height: 34, rx: 8, fill: '#55555e' }, jar);
  const fill = sv('rect', { x: -112, y: 120, width: 224, height: 0, fill: C.grad(L.defs, [[0, '#ffe08a'], [1, '#c98a1e']]) }, jar); const coins = [0, 1, 2].map(() => C.coin(L.svg, L.defs, { r: 34, label: 'R' }));
  const u = C.ui(root); const us = uiSvg(u); const icons = [['calendar', 'Monthly fees'], ['bank', 'Cash withdrawals'], ['phone', 'Notifications']].map(([n, l]) => { const ic = C.icon(us.svg, us.defs, n, { r: 46, bg: GOLD, fg: BG }); const e = el('div', { class: 'abs' }, u, l); e.style.cssText += `font:800 50px/1 'Barlow Condensed';color:${INK};white-space:nowrap;letter-spacing:.04em`; return { ic, e }; });
  return { w, bg, slip, jar, fill, coins, icons };
}, (s, lt, t) => { s.bg.set(t); const tk = [at('monthly'), at('cash', 39), at('notifications')];
  G(s.slip.g, 1080, 150, 2, 1.35); s.slip.setReveal(E.ioS(prog(t, B12[0], tk[2] + .6)));
  s.icons.forEach((g, i) => { pop(g.ic.g, 200, 330 + i * 150, t, tk[i] - .15, { s: 1 }); g.ic.draw(prog(t, tk[i] - .1, tk[i] + .4)); P(g.e, { x: 270, y: 330 + i * 150, anchor: 'tl', o: E.outC(prog(t, tk[i] - .1, tk[i] + .2)) }); g.e.style.transform += ' translateY(-50%)'; });
  G(s.jar, 1640, 820, 0, .85); const lvl = tk.reduce((a, x) => a + E.outC(prog(t, x + .3, x + .8)), 0) / 3; s.fill.setAttribute('y', 120 - 230 * lvl * .45); s.fill.setAttribute('height', 230 * lvl * .45);
  s.coins.forEach((c, i) => { const q = prog(t, tk[i], tk[i] + .55); G(c.g, 1640 + (i - 1) * 25, lerp(250, 840 - lvl * 50, E.inQ(q)), 0, q > 0 && q < 1 ? 1 : .001); c.flip(q * 900); });
  s.w.camera({ x: lerp(-30, 30, prog(t, B12[0], B12[1])), zoom: 1.02, focus: 1, dof: .3 });
  cueOnce(s, [[B12[0], 'print', .5], ...tk.map(x => [x - .1, 'pop', .4]), ...tk.map(x => [x + .5, 'coin', .5])]);
}, { in: 'whip', tin: .35, dir: 1 });

// ================= B13: add them up and compare (balance) =================
const B13 = [at('add') - .15, at('small') - .1];
shot(B13[0], B13[1] + .35, ({ root, world }) => { const w = world(); const bg = motionBg(w, {});
  const L = w.layer(1, { w: 1920, h: 1080 }); const bl = C.balance(L.svg, L.defs, { w: 900, h: 560 }); G(bl.g, 960, 1010, 0, .9);
  const lc = C.coinPile(bl.left, L.defs, { n: 18, r: 30, seed: 3 }); lc.setAttribute('transform', 'translate(0,-6)'); const rc = C.coinPile(bl.right, L.defs, { n: 8, r: 30, seed: 5 }); rc.setAttribute('transform', 'translate(0,-6)');
  const u = C.ui(root); const l1 = el('div', { class: 'abs' }, u, 'YOUR BANK'), l2 = el('div', { class: 'abs' }, u, 'ANOTHER BANK'); [l1, l2].forEach(e => e.style.cssText += `font:800 46px/1 'Barlow Condensed';letter-spacing:.12em;color:${INK};background:rgba(18,18,20,.7);padding:10px 18px;border-radius:10px;white-space:nowrap`);
  const t1 = C.highlight(u, 'ADD THEM UP. <mark>COMPARE.</mark>', { size: 90, mark: GOLD, markInk: BG }); return { w, bg, bl, lc, rc, l1, l2, t1 };
}, (s, lt, t) => { s.bg.set(t); const cmp = at('compare');
  const a = lerp(0, -14, E.outB(prog(t, cmp - .2, cmp + .6))) + Math.sin(t * 4) * .8; s.bl.set(a);
  s.lc.setAttribute('opacity', prog(t, at('add'), at('add') + .3)); s.rc.setAttribute('opacity', prog(t, cmp - .3, cmp));
  const r = a * Math.PI / 180; P(s.l1, { x: 960 - 405 * Math.cos(r), y: 1010 - 504 - 405 * Math.sin(r) + 300, o: prog(t, at('add'), at('add') + .3) }); P(s.l2, { x: 960 + 405 * Math.cos(r), y: 1010 - 504 + 405 * Math.sin(r) + 300, o: prog(t, cmp - .3, cmp) });
  s.t1.set(t, cmp - .1); P(s.t1.el, { x: 960, y: 160, o: prog(t, B13[0], B13[0] + .2) });
  s.w.camera({ zoom: lerp(1.06, 1.0, prog(t, B13[0], B13[1])) });
  cueOnce(s, [[B13[0], 'swish', .4], [at('add'), 'coins', .5], [cmp, 'thud', .6]]);
}, { in: 'zoom', tin: .3 });

// ================= B14: small monthly fees x 12 = real money =================
const B14 = [at('small') - .1, V.end + 1.1];
shot(B14[0], B14[1] + .35, ({ root, world }) => { const w = world(); const bg = motionBg(w, {});
  const L = w.layer(1, { w: 1920, h: 1080 }); const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']; const cells = [];
  months.forEach((m, i) => { const g = sv('g', {}, L.svg); sv('rect', { x: -70, y: -60, width: 140, height: 120, rx: 14, fill: '#1f1f24', stroke: '#3a3a41', 'stroke-width': 2 }, g); C.T(g, m, { y: -30, 'font-size': 26, fill: MUTED }); const c = C.coin(g, L.defs, { r: 28, label: 'R' }); c.g.setAttribute('transform', 'translate(0,18)'); cells.push({ g, c, x: 300 + (i % 6) * 210, y: 360 + Math.floor(i / 6) * 190 }); });
  const pile = C.coinPile(L.svg, L.defs, { n: 44, r: 40, seed: 4 });
  const u = C.ui(root); const t1 = C.highlight(u, 'SMALL FEES × 12 = <mark>REAL MONEY</mark>', { size: 84, mark: GREEN, markInk: BG }); const disc = src(u, 'General information, not financial advice'); return { w, bg, cells, pile, t1, disc };
}, (s, lt, t) => { s.bg.set(t); const a = at('small') + .1, yr = at('year') - .3;
  s.cells.forEach((c, i) => { pop(c.g, c.x, c.y, t, a + i * .1, { s: 1.3, out: yr + i * .03, outDur: .3 }); c.c.flip(t * 120 + i * 30); });
  G(s.pile, 1560, 820, 0, Math.max(.001, E.outB(prog(t, yr, yr + .6))) * 2.4);
  s.t1.set(t, at('real') - .1); P(s.t1.el, { x: 960, y: 150, o: prog(t, B14[0], B14[0] + .2) }); P(s.disc, { x: 960, y: 1030, o: prog(t, yr, yr + .4) });
  s.w.camera({ zoom: lerp(1.05, 1.0, prog(t, B14[0], B14[1])) });
  if (!s.__c) { s.__c = 1; for (let i = 0; i < 12; i++) cue(a + i * .1, 'coin', .25); cue(yr + .1, 'coins', .7); cue(yr + .2, 'cash', .5); }
}, { in: 'bands', tin: .5, colors: [GREEN, GOLD, INK] });

// ================= end card =================
const B15 = [B14[1], B14[1] + 4.6];
shot(B15[0], B15[1], ({ root, world }) => { const w = world(); const bg = motionBg(w, {}); const u = C.ui(root);
  const f = C.flapText(u, 'MONEY FROM ZERO', { size: 110 }); const s1 = el('div', { class: 'abs' }, u, 'The full Capitec story is on the channel'); s1.style.cssText += `font:700 44px/1 Barlow;color:${INK};white-space:nowrap`;
  const sub = C.subscribe(u, {}); const disc = src(u, 'General information, not financial advice'); return { w, bg, f, s1, sub, disc };
}, (s, lt, t) => { s.bg.set(t); const a = B15[0]; s.f.set(t, a + .1, .04); P(s.f.el, { x: 960, y: 380 }); P(s.s1, { x: 960, y: 560, o: E.outC(prog(t, a + .8, a + 1.2)) });
  s.sub.set(t, a + 1.7); P(s.sub.el, { x: 960, y: 740, o: E.outC(prog(t, a + 1.1, a + 1.5)) }); P(s.disc, { x: 960, y: 1030, o: prog(t, a + .5, a + .9) });
  cueOnce(s, [[a + .1, 'flaps', .6], [a + 2.45, 'click', .8], [a + 2.5, 'chime', .4]]);
}, { in: 'fade', tin: .4 });
window.DURATION = B15[1];
