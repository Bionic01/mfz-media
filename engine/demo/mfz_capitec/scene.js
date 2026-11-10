/* Money From Zero — sample: the Capitec story (opening + "what it means for you"). Theme: mfz. */
const C = CINE; const { shot, cue, E, tw, prog, clamp, lerp, kf, spr, noise1, sv, G, P, el, Person, SKIN, HAIR, poseAt } = C;
const BASE = window.SCENE.replace(/[^/]+$/, '');
const LEAD = .6; const V = C.voice(C.loadJSON(BASE + 'words_min.json'), LEAD);
const at = (w, after = 0) => V.at(w, after), to = (w, after = 0) => V.to(w, after);
C.setTheme('mfz');
const GOLD = '#f7be33', GREEN = '#2fd27f', INK = '#f4eedf', BG = '#121214', RED = '#ff5d5d', MUTED = '#b9b3a8';
window.META = { music: { style: 'doc', drop: at('but') - .05, end: 52.5, breaks: [] } };
C.initFX({ grain: .06, vignette: .55 });
const bug = el('div', { class: 'bug' }, C.stage, `<span class="z">0</span>MONEY FROM ZERO`);

function flapRow(parent, text, size = 84) { const f = C.flapText(parent, text, { size }); return f; }
function tag(parent, text, { color = GOLD } = {}) { const e = el('div', { class: 'abs' }, parent, `<div style="display:inline-flex;align-items:center;gap:14px;font:800 38px/1 'Barlow Condensed';letter-spacing:.12em;color:${INK};background:rgba(18,18,20,.7);padding:12px 22px 12px 14px;border-radius:10px"><span style="width:10px;height:40px;background:${color};border-radius:3px"></span>${text}</div>`); return e; }
const src = (parent, text) => { const e = el('div', { class: 'abs' }, parent, text); e.style.cssText += `font:600 22px/1 Barlow;color:${MUTED};white-space:nowrap;letter-spacing:.02em`; return e; };
function street(w, { dawn = 0 } = {}) {
  const L5 = w.layer(6, { w: 3400, h: 1900 }), L3 = w.layer(2.6, { w: 3000, h: 1600 }), L1 = w.layer(1, { w: 2400, h: 1080 }), L0 = w.layer(.6, { w: 2600, h: 1080 });
  const skyN = C.sky(L5, [[0, '#0e1630'], [.6, '#2a3566'], [1, '#6b5a7a']]); const skyD = C.sky(L5, [[0, '#2e4c86'], [.55, '#e48a58'], [1, '#f7c98c']]);
  const sun = C.sun(L5, 0, 0, { r: 120, color: '#ffe1a6', glow: '#ff9a52' });
  const stars = sv('g', {}, L5.svg); const R = C.rnd(3); for (let i = 0; i < 90; i++) sv('circle', { cx: R() * 3400, cy: R() * 900, r: .8 + R() * 2, fill: '#fff', opacity: .3 + R() * .6 }, stars);
  const sk = C.skyline(L3.svg, L3.defs, { w: 3000, h: 380, color: '#28304a', seed: 12, windows: .18 }); G(sk.g, 0, 1010); sv('rect', { x: 0, y: 1005, width: 3000, height: 600, fill: '#2b2d38' }, L3.svg);
  C.ground(L1, 900, { color: '#4a4c58', line: false }); sv('rect', { x: 0, y: 900, width: 2400, height: 26, fill: '#6b6e7c' }, L1.svg);
  const br = C.branch(L1.svg, L1.defs, { w: 820, h: 470, wall: '#ece6da', accent: '#1d1d22', sign: 'BANK', sub: 'OPEN 08:00' }); G(br.g, 1200, 905);
  const lp = [C.lamp(L1.svg, L1.defs, { h: 560 }), C.lamp(L1.svg, L1.defs, { h: 560 })]; G(lp[0], 560, 905); G(lp[1], 1880, 905, 0, -1, 1);
  const fg = sv('g', {}, L0.svg); for (let i = 0; i < 3; i++) { const t = C.acacia(fg, L0.defs, { s: 1.6, c: '#1d2a22', trunk: '#15110e' }); G(t, [-60, 2500, 1300][i], 1180, 0, 1); }
  return { L5, L3, L1, L0, skyN, skyD, sun, stars, br, sk };
}

// ================= M1: 1 March 2001, a new bank opens =================
const M1 = [0, at('it') - .1];
shot(M1[0], M1[1] + .35, ({ root, world }) => { const w = world(); const s = street(w); const u = C.ui(root);
  const ppl = [new Person(s.L1.svg, s.L1.defs, { skin: SKIN.dark, hair: 'short', shirt: '#3d6fb5', pants: '#2b2f3a', seed: 61 }), new Person(s.L1.svg, s.L1.defs, { skin: SKIN.brown, hair: 'bun', female: true, shirt: '#c0392b', skirt: '#1f2a36', seed: 62 }), new Person(s.L1.svg, s.L1.defs, { skin: SKIN.medium, hair: 'cap', cap: '#f7be33', shirt: '#2fbf71', pants: '#3d4b66', seed: 63 })];
  const date = flapRow(u, '01 MARCH 2001', 92); const t1 = C.kTitle(u, 'A new bank opens its doors', { size: 56, weight: 700, font: "'Barlow'", color: INK, width: 1200 });
  return { w, s, ppl, date, t1 };
}, (s, lt, t) => {
  const dawn = E.ioS(prog(t, 0, at('doors') + .6)); s.s.skyD.setAttribute('opacity', dawn); s.s.stars.setAttribute('opacity', 1 - dawn); G(s.s.sun, 2100, lerp(1250, 900, dawn));
  const on = E.outC(prog(t, at('opened'), at('opened') + .5)); s.s.br.setLight(on * (.9 + .1 * Math.sin(t * 30) * (1 - prog(t, at('opened'), at('opened') + .4))));
  s.ppl.forEach((p, i) => { const st = at('doors') + i * .5; const x = lerp([300, 2100, 200][i], 1200 + (i - 1) * 60, clamp((t - st) / 3.2)); const walking = t > st && t < st + 3.2;
    p.set(t, { x, y: 950 + i * 10, s: .8, side: walking ? 1 : .2, flip: [false, true, false][i], walk: walking ? (t - st) * 1.3 : null, expr: 'smile', o: t > st - .1 ? 1 : 0 }); });
  s.date.set(t, .4, .05); P(s.date.el, { x: 960, y: 170, anchor: 'c' }); s.t1.set(t, at('new') - .1, .07, .45, M1[1] - .1); P(s.t1.el, { x: 960, y: 290 });
  s.w.camera({ x: kf(t, [[0, -60], [M1[1], 80]]), y: kf(t, [[0, -60], [M1[1], 40]]), zoom: kf(t, [[0, 1.0], [M1[1], 1.32]]), focus: 1, dof: .9, rot: noise1(t * .2, 4) * .3 });
  if (!s.c) { s.c = 1; cue(.4, 'flaps', .6); cue(at('opened'), 'lights', .7); cue(at('doors'), 'shopbell', .4); for (let i = 0; i < 8; i++) cue(at('doors') + .3 + i * .45, 'step', .25); }
}, { in: 'fade', tin: .8 });

// ================= M2: 55 branches, 25 000 clients =================
const M2 = [at('it') - .1, at('tiny') - .1];
shot(M2[0], M2[1] + .35, ({ root, world }) => { const w = world(); const Lb = w.layer(3, { w: 2600, h: 1600 }); C.studio(Lb, { c1: '#26262c', c2: '#0a0a0c', key: '#ffd9a0' });
  const L = w.layer(1, { w: 1920, h: 1080 }); const icons = [];
  for (let i = 0; i < 55; i++) { const g = sv('g', {}, L.svg); sv('rect', { x: -22, y: -26, width: 44, height: 36, rx: 3, fill: '#ece6da' }, g); sv('rect', { x: -26, y: -34, width: 52, height: 12, rx: 3, fill: GOLD }, g); sv('rect', { x: -7, y: -12, width: 14, height: 22, fill: '#ffd27a' }, g);
    icons.push({ g, x: 170 + (i % 11) * 72, y: 330 + Math.floor(i / 11) * 92 }); }
  const dots = sv('g', {}, L.svg); const R = C.rnd(8); const pd = []; for (let i = 0; i < 250; i++) { const c = sv('circle', { r: 9, fill: i % 7 ? INK : GOLD, opacity: .9 }, dots); pd.push({ c, x: 1060 + (i % 25) * 30 + (R() - .5) * 6, y: 330 + Math.floor(i / 25) * 42 + (R() - .5) * 6, d: R() }); }
  const u = C.ui(root); const c1 = C.counter(u, { size: 150, color: GOLD, prefix: '' }); const l1 = el('div', { class: 'abs' }, u, 'BRANCHES'); const c2 = C.counter(u, { size: 150, color: GOLD, prefix: '' }); const l2 = el('div', { class: 'abs' }, u, 'CLIENTS');
  [l1, l2].forEach(e => e.style.cssText += `font:800 44px/1 'Barlow Condensed';letter-spacing:.2em;color:${INK}`);
  const note = src(u, 'Each dot ≈ 100 clients'); return { w, icons, pd, c1, c2, l1, l2, note };
}, (s, lt, t) => {
  const a1 = at('fifty-five') - .2; s.icons.forEach((ic, i) => { const q = E.outB(prog(t, a1 + i * .02, a1 + i * .02 + .3)); G(ic.g, ic.x, ic.y, 0, Math.max(.001, q)); });
  const a2 = at('twenty-five') - .2; s.pd.forEach((d, i) => { const q = E.outB(prog(t, a2 + d.d * .9, a2 + d.d * .9 + .25)); d.c.setAttribute('cx', d.x); d.c.setAttribute('cy', d.y); d.c.setAttribute('r', 9 * Math.max(0, q)); });
  s.c1.set(Math.round(55 * E.outC(prog(t, a1, a1 + 1.2)))); P(s.c1.el, { x: 530, y: 900, o: prog(t, a1, a1 + .2) }); P(s.l1, { x: 530, y: 1000, o: prog(t, a1 + .2, a1 + .5) });
  s.c2.set(Math.round(25000 * E.outC(prog(t, a2, a2 + 1.3)))); P(s.c2.el, { x: 1420, y: 900, o: prog(t, a2, a2 + .2) }); P(s.l2, { x: 1420, y: 1000, o: prog(t, a2 + .2, a2 + .5) });
  P(s.note, { x: 1420, y: 260, o: prog(t, a2 + .4, a2 + .8) });
  s.w.camera({ x: lerp(-30, 30, prog(t, M2[0], M2[1])), zoom: lerp(1.04, 1.0, prog(t, M2[0], M2[1])), focus: 1, dof: .5 });
  if (!s.c) { s.c = 1; cue(M2[0], 'swish', .5); for (let i = 0; i < 12; i++) cue(a1 + i * .1, 'tick', .4); cue(a2, 'sparkle', .5); }
}, { in: 'zoom', tin: .35 });

// ================= M3: tiny, next to the big four =================
const M3 = [at('tiny') - .1, at('but') - .1];
shot(M3[0], M3[1] + .35, ({ root, world }) => { const w = world(); const L5 = w.layer(5, { w: 3600, h: 2400 }), L1 = w.layer(1, { w: 3200, h: 2200 });
  C.sky(L5, [[0, '#1c2440'], [.6, '#5a5370'], [1, '#c58b6a']]); C.sun(L5, 2800, 1500, { r: 140, color: '#ffd9a0', glow: '#ff9a52' });
  sv('rect', { x: 0, y: 1840, width: 3200, height: 400, fill: '#2f313c' }, L1.svg);
  const halls = []; for (let i = 0; i < 4; i++) { const h = C.bankHall(L1.svg, L1.defs, { w: 560, h: 1500 - i * 60, stone: ['#e9e1d2', '#dcd3c3', '#e4dccd', '#d6cdbd'][i], name: 'BANK' }); halls.push(h); G(h, 1080 + i * 560, 1850); }
  const br = C.branch(L1.svg, L1.defs, { w: 300, h: 190, wall: '#ece6da', accent: '#1d1d22', sign: 'BANK' }); G(br.g, 520, 1850); br.setLight(1);
  const kid = new Person(L1.svg, L1.defs, { skin: SKIN.brown, hair: 'short', shirt: GOLD, pants: '#2b2f3a', seed: 71 });
  const u = C.ui(root); const brk = el('div', { class: 'abs' }, u); brk.style.cssText += `width:1080px;height:26px;border:5px solid ${GOLD};border-bottom:none;border-radius:6px 6px 0 0`; const lab = el('div', { class: 'abs' }, u, 'THE BIG FOUR'); lab.style.cssText += `font:800 64px/1 'Barlow Condensed';letter-spacing:.14em;color:${GOLD}`;
  const tiny = C.T(L1.svg, 'TINY', { x: 520, y: 1590, 'font-size': 64, fill: INK, 'letter-spacing': 8 });
  return { w, kid, brk, lab, tiny };
}, (s, lt, t) => {
  s.kid.set(t, { x: 300, y: 1860, s: .5, pose: 'stand', look: [.8, -1], turn: .5, expr: 'surprised' });
  const pull = E.ioC(prog(t, at('next') - .4, M3[1] + .2));
  s.w.camera({ x: lerp(-1120, 0, pull), y: lerp(640, 120, pull), zoom: lerp(2.0, .62, pull), focus: 1, dof: .5, rot: lerp(2, 0, pull) });
  s.tiny.setAttribute('opacity', E.outC(prog(t, M3[0] + .1, M3[0] + .4)));
  const q = E.outC(prog(t, at('big') - .1, at('four') + .2)); P(s.brk, { x: 1160, y: 170, o: q, sx: Math.max(.001, q) }); P(s.lab, { x: 1160, y: 110, o: q });
  if (!s.c) { s.c = 1; cue(M3[0], 'pop', .4); cue(at('next') - .3, 'whoosh_low', .8); cue(at('four'), 'boom', .5); }
}, { in: 'whip', tin: .35, dir: -1 });

// ================= M4: opened at 8, an hour before other banks =================
const M4 = [at('but') - .1, at('so', 19) - .1];
shot(M4[0], M4[1] + .35, ({ root, world }) => { const w = world(); const Lb = w.layer(3, { w: 2600, h: 1600 }); C.studio(Lb, { c1: '#2b2a2f', c2: '#0b0b0d', key: '#ffe1b0', kx: .5, ky: .45 });
  const L = w.layer(1, { w: 1920, h: 1080 }); const c1 = C.clock(L.svg, L.defs, { r: 240, rim: GOLD }); const c2 = C.clock(L.svg, L.defs, { r: 200, rim: '#55555e', face: '#d9d4c8' });
  const u = C.ui(root); const l1 = el('div', { class: 'abs' }, u, '<b style="color:#f7be33">08:00</b>  THIS BANK'); const l2 = el('div', { class: 'abs' }, u, '<b>09:00</b>  OTHER BANKS');
  [l1, l2].forEach(e => e.style.cssText += `font:800 54px/1 'Barlow Condensed';letter-spacing:.08em;color:${INK};white-space:nowrap`);
  const t1 = C.kTitle(u, 'It did something <em>simple</em>', { size: 84, width: 1400 }); const hr = el('div', { class: 'abs' }, u, '+1 HOUR'); hr.style.cssText += `font:800 70px/1 'Barlow Condensed';color:${GREEN};letter-spacing:.06em`;
  return { w, c1, c2, l1, l2, t1, hr };
}, (s, lt, t) => {
  const eight = at('eight'); const h = 7 + 40 / 60 + (20 / 60) * E.ioC(prog(t, M4[0] + .3, eight)); s.c1.set(h + (t > eight ? 0 : 0));
  s.c2.set(9);
  const split = E.ioC(prog(t, at('hour') - .4, at('hour') + .5));
  G(s.c1.g, lerp(960, 560, split), lerp(600, 560, split), 0, lerp(1, .9, split) * (1 + .05 * Math.max(0, 1 - Math.abs(t - eight) * 4)));
  G(s.c2.g, lerp(1700, 1360, split), 560, 0, split > .001 ? split : .001); s.c2.g.setAttribute('opacity', split);
  s.t1.set(t, M4[0] + .2, .1, .45, at('its', 14) - .2); P(s.t1.el, { x: 960, y: 170 });
  P(s.l1, { x: 560, y: 900, o: E.outC(prog(t, eight - .1, eight + .3)) }); P(s.l2, { x: 1360, y: 900, o: split });
  P(s.hr, { x: 960, y: 430, o: E.outC(prog(t, at('before') - .1, at('before') + .3)), s: E.outB(prog(t, at('before') - .1, at('before') + .35)) });
  s.w.camera({ zoom: kf(t, [[M4[0], 1.25], [eight, 1.12], [M4[1], 1.0]]), y: kf(t, [[M4[0], 40], [M4[1], 0]]), focus: 1, dof: .6 });
  if (!s.c) { s.c = 1; for (let i = 0; i < 9; i++) cue(M4[0] + .3 + i * ((eight - M4[0] - .3) / 9), i % 2 ? 'tock' : 'tick', .45); cue(eight, 'ding', .7); cue(at('hour') - .2, 'swish', .5); cue(at('before'), 'pop', .4); }
}, { in: 'flash', tin: .2 });

// ================= M5: working people bank before work =================
const M5 = [at('so', 19) - .1, at('it', 21) - .1];
shot(M5[0], M5[1] + .35, ({ root, world }) => { const w = world(); const s = street(w); s.skyN.setAttribute('opacity', 0); G(s.sun, 900, 860); s.stars.setAttribute('opacity', 0); s.br.setLight(1);
  const ot = C.bankHall(s.L1.svg, s.L1.defs, { w: 640, h: 560, stone: '#c9c1b2', name: 'BANK' }); G(ot, 300, 905); const closed = sv('g', {}, s.L1.svg); sv('rect', { x: 210, y: 650, width: 180, height: 56, rx: 8, fill: '#111' }, closed); C.T(closed, 'OPENS 09:00', { x: 300, y: 679, 'font-size': 30, fill: RED, 'font-family': 'Barlow', 'font-weight': 700 });
  const workers = [{ skin: SKIN.dark, hair: 'cap', cap: '#f39c12', shirt: '#e67e22', pants: '#34495e', seed: 81 }, { skin: SKIN.medium, hair: 'bun', female: true, shirt: '#5dade2', pants: '#1b4f72', seed: 82 }, { skin: SKIN.brown, hair: 'side', shirt: '#ffffff', jacket: '#2c3e50', tie: RED, pants: '#2c3e50', seed: 83 }, { skin: SKIN.deep, hair: 'scarf', scarf: '#8e44ad', scarf2: GOLD, female: true, shirt: '#16a085', skirt: '#2c3e50', seed: 84 }].map(o => new Person(s.L1.svg, s.L1.defs, o));
  const u = C.ui(root); const t1 = C.kTitle(u, 'Bank <em>before</em> work', { size: 96, width: 1200 }); return { w, s, workers, t1 };
}, (s, lt, t) => {
  s.workers.forEach((p, i) => { const x0 = 500 - i * 230 + lt * 300; const x = Math.min(x0, 1150 + i * 30); const walking = x0 < 1150 + i * 30; p.set(t, { x, y: 960 + (i % 2) * 14, s: .82, side: walking ? 1 : .3, walk: walking ? lt * 1.35 + i * .25 : null, expr: 'smile', o: x < 1150 + i * 30 - 10 || !walking ? 1 : 1 }); });
  s.t1.set(t, at('working') - .1, .08, .45, M5[1] - .1); P(s.t1.el, { x: 960, y: 180 });
  s.w.camera({ x: lerp(-200, 100, prog(t, M5[0], M5[1])), y: 60, zoom: 1.15, focus: 1, dof: .9 });
  if (!s.c) { s.c = 1; cue(M5[0], 'whoosh', .5); for (let i = 0; i < 9; i++) cue(M5[0] + .2 + i * .37, 'step', .25); cue(at('bank', 20), 'shopbell', .4); }
}, { in: 'whip', tin: .35, dir: 1 });

// ================= M6: simple, low cost, growing =================
const M6 = [at('it', 21) - .1, at('branch') - .1];
shot(M6[0], M6[1] + .3, ({ root, world }) => { const w = world(); const Lb = w.layer(3, { w: 2600, h: 1600 }); C.studio(Lb, { c1: '#26262c', c2: '#09090b', key: '#ffd9a0' });
  const L = w.layer(1, { w: 1920, h: 1080 });
  const card = C.bankCard(L.svg, L.defs, { c1: '#1d1d22', c2: '#3a3a41', name: 'ONE SIMPLE ACCOUNT' }); const cn = C.coin(L.svg, L.defs, { r: 110, label: 'R', metal: 'gold' });
  const arrow = sv('g', {}, L.svg); sv('path', { d: 'M -20 -40 L 20 -40 L 20 30 L 50 30 L 0 80 L -50 30 L -20 30 Z', fill: GREEN }, arrow);
  const lc = sv('g', {}, L.svg); const draw = C.lineChart({ svg: lc, defs: L.defs }, [2, 3, 3.5, 5, 7, 9, 12, 16, 21, 26], { x: 1340, y: 720, w: 420, h: 330, color: GREEN, width: 9 });
  const u = C.ui(root); const words = ['SIMPLE.', 'LOW COST.', 'GROWING.'].map(x => { const e = el('div', { class: 'abs' }, u, x); e.style.cssText += `font:800 110px/1 'Barlow Condensed';color:${INK};letter-spacing:.02em;white-space:nowrap`; return e; });
  return { w, card, cn, arrow, draw, words };
}, (s, lt, t) => {
  const ts = [at('simple', 22) - .1, at('costs') - .1, at('growing') - .15];
  const k = ts.map(a => E.outB(prog(t, a, a + .4)));
  s.words.forEach((e, i) => P(e, { x: 320 + i * 640, y: 820, o: clamp(k[i] * 2), s: .6 + .4 * k[i], blur: (1 - clamp(k[i])) * 8 }));
  G(s.card, 320, 470, -8 + Math.sin(t) * 2, .9 * Math.max(.001, k[0])); G(s.cn.g, 960, 470 + Math.sin(t * 1.2) * 6, 0, Math.max(.001, k[1])); s.cn.flip(lt * 120);
  G(s.arrow, 1110, 470, 0, Math.max(.001, k[1]) * .9); s.arrow.setAttribute('opacity', k[1] > .01 ? 1 : 0);
  s.draw(E.ioC(prog(t, ts[2], ts[2] + 1.2)));
  s.w.camera({ x: lerp(-40, 40, prog(t, M6[0], M6[1])), zoom: 1.02, focus: 1, dof: .4 });
  if (!s.c) { s.c = 1; ts.forEach(a => cue(a + .05, 'thud', .6)); cue(ts[2] + .1, 'swoosh_up', .4); }
}, { in: 'zoom', tin: .3 });

// ================= M7: branch by branch, then app by app =================
const M7 = [at('branch') - .1, at('today') - .1];
shot(M7[0], M7[1] + .35, ({ root, world }) => { const w = world(); const Lb = w.layer(4, { w: 3000, h: 2000 }); C.studio(Lb, { c1: '#202024', c2: '#08080a', key: '#ffd9a0' });
  const L = w.layer(1, { w: 1920, h: 1080 }); const map = C.africaMap(L.svg, L.defs, { land: '#2a2a30', stroke: '#3a3a41' }); G(map.g, 960 - 505, 540 - 510); map.highlight('ZAF', GOLD, .25);
  const b = map.A.ZAF.b; const R = C.rnd(17); const pins = [], phones = [];
  const inside = (x, y) => C.inCountry('ZAF', x, y);
  let tries = 0; while (pins.length < 60 && tries++ < 4000) { const x = b[0] + R() * (b[2] - b[0]), y = b[1] + R() * (b[3] - b[1]); if (!inside(x, y)) continue; const g = sv('g', { transform: `translate(${x},${y})` }, map.top); sv('circle', { r: 4.5, fill: GOLD, stroke: '#121214', 'stroke-width': 1 }, g); pins.push({ g, d: R() }); }
  tries = 0; while (phones.length < 34 && tries++ < 4000) { const x = b[0] + R() * (b[2] - b[0]), y = b[1] + R() * (b[3] - b[1]); if (!inside(x, y)) continue; const g = sv('g', { transform: `translate(${x},${y})` }, map.top); sv('rect', { x: -9, y: -16, width: 18, height: 32, rx: 4, fill: '#fff', stroke: '#121214', 'stroke-width': 2 }, g); sv('rect', { x: -6, y: -12, width: 12, height: 21, rx: 2, fill: GREEN }, g); phones.push({ g, d: R(), x, y }); }
  const u = C.ui(root); const l1 = el('div', { class: 'abs' }, u, 'BRANCH BY BRANCH'); const l2 = el('div', { class: 'abs' }, u, 'THEN APP BY APP');
  [l1, l2].forEach((e, i) => e.style.cssText += `font:800 76px/1 'Barlow Condensed';letter-spacing:.06em;color:${i ? GREEN : GOLD};white-space:nowrap`);
  const zc = [0, 1].map(k => phones.reduce((s2, q) => s2 + (k ? q.y : q.x), 0) / phones.length); return { w, pins, phones, l1, l2, zc };
}, (s, lt, t) => {
  const a1 = at('branch'), a2 = at('app');
  s.pins.forEach(p => { const q = E.outB(prog(t, a1 + p.d * 1.0, a1 + p.d * 1.0 + .3)); p.g.setAttribute('opacity', q > 0 ? 1 : 0); p.g.firstChild.setAttribute('r', 4.5 * Math.max(0, q)); });
  s.phones.forEach(p => { const q = E.outB(prog(t, a2 + p.d * 1.1, a2 + p.d * 1.1 + .3)); p.g.setAttribute('transform', `translate(${p.x},${p.y}) scale(${Math.max(.001, q) * .5})`); });
  const cx = s.zc[0] - 505, cy = s.zc[1] - 510;
  s.w.camera({ x: lerp(cx - 20, cx + 15, prog(t, M7[0], M7[1])), y: lerp(cy - 10, cy + 20, prog(t, M7[0], M7[1])), zoom: lerp(3.3, 4.4, E.ioC(prog(t, M7[0], M7[1]))), focus: 1, dof: .5, rot: lerp(-2, 1, prog(t, M7[0], M7[1])) });
  P(s.l1, { x: 960, y: 150, o: E.outC(prog(t, a1 - .1, a1 + .3)) * (1 - E.inC(prog(t, a2 - .3, a2))) }); P(s.l2, { x: 960, y: 150, o: E.outC(prog(t, a2 - .1, a2 + .3)) });
  if (!s.c) { s.c = 1; for (let i = 0; i < 10; i++) cue(a1 + i * .1, 'tick', .35); for (let i = 0; i < 8; i++) cue(a2 + i * .13, 'bloop', .3); }
}, { in: 'fade', tin: .3 });

// ================= M8: 26 million active clients =================
const M8 = [at('today') - .1, at('so', 34) - .1];
shot(M8[0], M8[1] + .35, ({ root, world }) => { const w = world(); const Lb = w.layer(4, { w: 3200, h: 2000 }); C.studio(Lb, { c1: '#2a2a30', c2: '#0a0a0c', key: '#ffd9a0', ky: .3 });
  const L = w.layer(1, { w: 2600, h: 1500 }); const cr = C.crowd(L.svg, L.defs, { cols: 16, rows: 6, x: 1300, y: 900, dx: 150, dy: 80, s: .42, seed: 9 });
  const u = C.ui(root); const k = C.counter(u, { size: 190, color: GOLD, prefix: '' }); const lab = el('div', { class: 'abs' }, u, 'ACTIVE CLIENTS'); lab.style.cssText += `font:800 56px/1 'Barlow Condensed';letter-spacing:.24em;color:${INK}`;
  const so = src(u, 'Source: Capitec annual results, year to February 2026'); return { w, cr, k, lab, so };
}, (s, lt, t) => {
  const a = at('twenty-six') - .3; const fillK = prog(t, M8[0], a + .8); s.cr.set(t, fillK, { expr: 'smile' });
  s.k.set(Math.round(26000000 * E.outE(prog(t, a, a + 1.6)) / 1000) * 1000); P(s.k.el, { x: 960, y: 150, o: prog(t, a, a + .2) }); P(s.lab, { x: 960, y: 262, o: prog(t, a + .3, a + .7) });
  P(s.so, { x: 960, y: 1030, o: prog(t, a + .6, a + 1) });
  s.w.camera({ zoom: kf(t, [[M8[0], 1.9], [M8[1], .95]], E.ioC), y: kf(t, [[M8[0], 300], [M8[1], 60]]), focus: 1, dof: .6 });
  if (!s.c) { s.c = 1; cue(M8[0], 'whoosh_low', .6); cue(a + .1, 'riser', .4); cue(a + 1.4, 'impact', .5); }
}, { in: 'zoom', tin: .35 });

// ================= M9: what it means for you (fees) =================
const M9 = [at('so', 34) - .1, at('add') - .15];
shot(M9[0], M9[1] + .35, ({ root, world }) => { const w = world(); const Lb = w.layer(3, { w: 2600, h: 1600 }); C.studio(Lb, { c1: '#2c2a2e', c2: '#0b0b0d', key: '#ffd9a0', kx: .35 });
  const L = w.layer(1, { w: 1920, h: 1080 });
  const her = new Person(L.svg, L.defs, { skin: SKIN.brown, hair: 'afro', female: true, shirt: '#2fd27f', pants: '#1f2a36', earrings: true, seed: 91 });
  const ph = C.phone(L.svg, L.defs, { w: 64, h: 128, screenFn: (g, w2, h2) => { sv('rect', { x: 0, y: 0, width: w2, height: h2, fill: '#121214' }, g); C.T(g, 'FEES', { x: w2 / 2, y: 26, 'font-size': 12, fill: GOLD }); for (let i = 0; i < 4; i++) sv('rect', { x: 7, y: 42 + i * 16, width: w2 - 14, height: 9, rx: 3, fill: '#3a3a41' }, g); } });
  her.hold(1, ph.g, { x: -4, y: 8, upright: true });
  const jar = sv('g', {}, L.svg); sv('path', { d: 'M -110 -160 L 110 -160 L 120 120 Q 0 150 -120 120 Z', fill: 'rgba(200,230,255,.12)', stroke: 'rgba(220,240,255,.5)', 'stroke-width': 4 }, jar); sv('rect', { x: -120, y: -190, width: 240, height: 34, rx: 8, fill: '#55555e' }, jar);
  const fill = sv('rect', { x: -112, y: 120, width: 224, height: 0, fill: C.grad(L.defs, [[0, '#ffe08a'], [1, '#c98a1e']]) }, jar); const coins = []; for (let i = 0; i < 3; i++) { const c = C.coin(L.svg, L.defs, { r: 34, label: 'R' }); coins.push(c); }
  const u = C.ui(root); const q1 = C.kTitle(u, 'What does that mean <em>for you?</em>', { size: 84, width: 1500 });
  const price = el('div', { class: 'abs' }, u, 'YOUR ACCOUNT HAS A PRICE'); price.style.cssText += `font:800 60px/1 'Barlow Condensed';letter-spacing:.06em;color:${GOLD};white-space:nowrap`;
  const chips = ['Monthly fees', 'Cash withdrawals', 'Notifications'].map(x => C.pill(u, x, { border: GOLD, size: 40 }));
  return { w, her, jar, fill, coins, q1, price, chips };
}, (s, lt, t) => {
  const tk = [at('monthly'), at('cash', 39), at('notifications')];
  s.her.set(t, { x: 560, y: 1020, s: 1.18, pose: poseAt(t, [[M9[0], 'phone'], [at('price') - .3, 'phone'], [tk[2] + .3, 'think']]), expr: t > tk[0] ? 'worried' : 'neutral', turn: .25, look: t > tk[0] ? [.7, .1] : [-.2, .9] });
  G(s.jar, 1500, 820, 0, .9); const lvl = tk.reduce((a, x) => a + E.outC(prog(t, x + .3, x + .8)), 0) / 3; s.fill.setAttribute('y', 120 - 230 * lvl * .45); s.fill.setAttribute('height', 230 * lvl * .45);
  s.coins.forEach((c, i) => { const q = prog(t, tk[i], tk[i] + .55); const y = lerp(300, 840 - lvl * 60, E.inQ(q)); G(c.g, 1500 + (i - 1) * 30, y, 0, q > 0 && q < 1 ? 1 : .001); c.flip(q * 900); });
  s.q1.set(t, M9[0] + .2, .08, .45, at('your') - .1); P(s.q1.el, { x: 960, y: 180 });
  P(s.price, { x: 1160, y: 180, o: E.outC(prog(t, at('price') - .3, at('price') + .1)) });
  s.chips.forEach((e, i) => P(e, { x: 1180, y: 330 + i * 110, o: E.outC(prog(t, tk[i] - .15, tk[i] + .2)), s: E.outB(prog(t, tk[i] - .15, tk[i] + .25)) }));
  s.w.camera({ x: lerp(-60, 40, prog(t, M9[0], M9[1])), y: 40, zoom: lerp(1.15, 1.05, prog(t, M9[0], M9[1])), focus: 1, dof: .5 });
  if (!s.c) { s.c = 1; cue(M9[0], 'swish', .4); cue(at('price'), 'thud', .5); tk.forEach(x => { cue(x - .1, 'pop', .4); cue(x + .5, 'coin', .5); }); }
}, { in: 'whip', tin: .35, dir: 1 });

// ================= M10: add them up, compare, a year =================
const M10 = [at('add') - .15, V.end + 1.2];
shot(M10[0], M10[1] + .35, ({ root, world }) => { const w = world(); const Lb = w.layer(3, { w: 2600, h: 1600 }); C.studio(Lb, { c1: '#262529', c2: '#09090b', key: '#ffd9a0' });
  const L = w.layer(1, { w: 1920, h: 1080 });
  const months = 'JFMAMJJASOND'; const stacks = []; for (let i = 0; i < 12; i++) { const g = sv('g', {}, L.svg); C.T(g, months[i], { x: 0, y: 40, 'font-size': 30, fill: MUTED }); const cg = sv('g', {}, g); for (let j = 0; j < 4; j++) { const c = C.coin(cg, L.defs, { r: 30, label: '' }); c.g.setAttribute('transform', `translate(0,${-j * 14}) scale(1,.45)`); } stacks.push({ g, cg, i }); }
  const pile = C.coinPile(L.svg, L.defs, { n: 40, r: 44, seed: 4 });
  const u = C.ui(root); const t1 = C.kTitle(u, 'Add them up. <em>Compare.</em>', { size: 96, width: 1500 }); const t2 = C.kTitle(u, 'Small monthly fees × 12 = <b>real money</b>', { size: 72, width: 1700 });
  const cards = [['YOUR BANK', 1], ['ANOTHER BANK', .55]].map(([n, v]) => { const e = el('div', { class: 'abs' }, u, `<div style="width:300px;font:800 34px/1 'Barlow Condensed';letter-spacing:.1em;color:${INK};text-align:center">${n}</div><div class="bar" style="margin:14px auto 0;width:150px;height:300px;display:flex;align-items:flex-end"><div style="width:100%;height:0;background:linear-gradient(${v === 1 ? RED : GREEN},${v === 1 ? '#a8302f' : '#1d8a50'});border-radius:10px 10px 0 0"></div></div>`); return { e, v, bar: e.querySelector('.bar > div') }; });
  return { w, stacks, pile, t1, t2, cards };
}, (s, lt, t) => {
  const comp = at('compare'), small = at('small');
  s.t1.set(t, M10[0] + .1, .1, .45, small - .3); P(s.t1.el, { x: 960, y: 170 });
  s.cards.forEach((c, i) => { const q = E.outC(prog(t, comp - .1 + i * .15, comp + .6 + i * .15)); c.bar.style.height = (c.v * 100 * q) + '%'; P(c.e, { x: 700 + i * 520, y: 640, o: clamp(q * 3) * (1 - prog(t, small - .4, small - .1)) }); });
  s.t2.set(t, small - .1, .07, .45, 1e9); P(s.t2.el, { x: 960, y: 170 });
  s.stacks.forEach(st => { const a = small + .2 + st.i * .12; const q = E.outB(prog(t, a, a + .3)); G(st.g, 300 + st.i * 120, 700, 0, Math.max(.001, q)); });
  const yr = at('year') - .3; const pq = E.outB(prog(t, yr, yr + .6)); G(s.pile, 960, 820, 0, Math.max(.001, pq) * 2.3);
  s.stacks.forEach(st => st.g.setAttribute('opacity', 1 - prog(t, yr, yr + .4)));
  s.w.camera({ zoom: lerp(1.08, 1.0, prog(t, M10[0], M10[1])), focus: 1, dof: .4 });
  if (!s.c) { s.c = 1; cue(M10[0], 'swish', .4); cue(comp, 'whoosh', .4); for (let i = 0; i < 12; i++) cue(small + .2 + i * .12, 'coin', .25); cue(yr + .1, 'coins', .7); cue(yr + .2, 'cash', .5); }
}, { in: 'fade', tin: .3 });

// ================= end card =================
const M11 = [M10[1], M10[1] + 4.2];
shot(M11[0], M11[1], ({ root, world }) => { const w = world(); const Lb = w.layer(2, { w: 2400, h: 1400 }); C.studio(Lb, { c1: '#26262c', c2: '#08080a', key: GOLD });
  const u = C.ui(root); const f = C.flapText(u, 'MONEY FROM ZERO', { size: 110 }); const s1 = el('div', { class: 'abs' }, u, 'The full Capitec story is on the channel'); s1.style.cssText += `font:700 46px/1 Barlow;color:${INK};white-space:nowrap`;
  const sub = C.pill(u, '▶  SUBSCRIBE FOR THE NEXT MONEY STORY', { border: GOLD, bg: 'rgba(247,190,51,.1)' }); return { w, f, s1, sub };
}, (s, lt, t) => { const a = M11[0]; s.f.set(t, a + .1, .04); P(s.f.el, { x: 960, y: 420 }); P(s.s1, { x: 960, y: 600, o: E.outC(prog(t, a + .8, a + 1.2)) }); P(s.sub, { x: 960, y: 760, o: E.outC(prog(t, a + 1.1, a + 1.5)) });
  if (!s.c) { s.c = 1; cue(a + .1, 'flaps', .6); cue(a + 1.1, 'chime', .4); } }, { in: 'fade', tin: .4 });
window.DURATION = M11[1];
