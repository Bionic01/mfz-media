/* CINE 3D shot templates (C.T3), Look v4 (12 Nov 2026). One call = one finished 3D shot, lit, moving, cued.
   T3.name(a, b, opts): absolute times like C.T8. Every template takes opts.pal (a colour script name, see PAL) and
   opts.title / opts.kicker / opts.src for crisp 2D overlays, and opts.tr ({in, tin}) for the transition.
   Rules (README "Look v4"): one hero subject filling the frame, readable screens, big type, a colour per chapter,
   the camera always moving. */
'use strict';
(() => {
const C = window.CINE, GL = C.GL, T = GL.T; const { shot, cue, E, prog, clamp, lerp, kf, noise1, el, P } = C;
const V3 = (x, y, z) => new T.Vector3(x, y, z);

/** colour script: one palette per chapter */
const PAL = {
  night:   { bg: ['#1c1850', '#04031a'], fog: ['#04031a', 12, 42], key: '#f4f0ff', rim: '#4ff0ff', sky: '#9fb0ff', ground: '#0b0a2a', grid: '#2a2870', acc: '#4ff0ff', acc2: '#ffcf3a', ink: '#ffffff' },
  cyan:    { bg: ['#06304a', '#020814'], fog: ['#020814', 12, 40], key: '#e8fbff', rim: '#33e0ff', sky: '#7fe9ff', ground: '#03121e', grid: '#0b3f5a', acc: '#4ff0ff', acc2: '#ff5fa2', ink: '#ffffff' },
  network: { bg: ['#0c2244', '#020611'], fog: ['#020611', 16, 64], key: '#eaf4ff', rim: '#4ff0ff', sky: '#9fd0ff', ground: '#050c1e', grid: '#14306a', acc: '#4ff0ff', acc2: '#85ed70', ink: '#ffffff' },
  steel:   { bg: ['#4a1238', '#0c0310'], fog: ['#0c0310', 12, 40], key: '#ffffff', rim: '#ff4f7a', sky: '#ffc0d8', ground: '#180716', grid: '#4a1a44', acc: '#ff4f7a', acc2: '#ffd36b', ink: '#ffffff' },
  sunset:  { bg: ['#6a2208', '#120502', '#e0601f'], fog: ['#1f0904', 16, 60], key: '#ffd7a8', rim: '#ff7a3d', sky: '#ffb070', ground: '#2e1408', grid: '#6a2c10', acc: '#ffcf3a', acc2: '#ff5f8a', ink: '#ffffff' },
  gold:    { bg: ['#2e1a5a', '#07041a'], fog: ['#07041a', 12, 44], key: '#fff3d6', rim: '#ffcf3a', sky: '#d8c0ff', ground: '#110a26', grid: '#3a2a6e', acc: '#ffd23a', acc2: '#4ff0ff', ink: '#ffffff' },
  brand:   { bg: ['#123a66', '#030a1c'], fog: ['#030a1c', 12, 44], key: '#f2f8ff', rim: '#85ed70', sky: '#b8d8ff', ground: '#06122a', grid: '#1a3c70', acc: '#85ed70', acc2: '#ffcf3a', ink: '#ffffff' },
  purple:  { bg: ['#40126a', '#0a0318'], fog: ['#0a0318', 12, 44], key: '#fff0f6', rim: '#ff7ad9', sky: '#e0b4ff', ground: '#150a26', grid: '#46207a', acc: '#ff7ad9', acc2: '#ffd36b', ink: '#ffffff' },
  dawn:    { bg: ['#25447a', '#070d1f', '#ff7fa8'], fog: ['#070d1f', 14, 50], key: '#ffe9e0', rim: '#ff7fa8', sky: '#ffd0e0', ground: '#0d1630', grid: '#2a3a72', acc: '#ff7fa8', acc2: '#4ff0ff', ink: '#ffffff' },
};

// ---------------- overlays ----------------
const uiSvg = u => { const s = C.svgBox(1920, 1080, u); return { svg: s, defs: C.sv('defs', {}, s) }; };
function tag(u, text, col) { return C.tpl.tag(u, text, col); }
function big(u, html, { size = 120, color = '#fff', weight = 800, font = 'Barlow Condensed', ls = '.01em', shadow = true, align = 'center' } = {}) {
  const e = el('div', { class: 'abs' }, u, html); e.style.cssText += `font:${weight} ${size}px/1 '${font}';color:${color};letter-spacing:${ls};white-space:nowrap;text-align:${align};` + (shadow ? 'text-shadow:0 8px 40px rgba(0,0,0,.6),0 2px 6px rgba(0,0,0,.5);' : ''); return e; }
function hl(u, html, size, pal) { return C.highlight(u, html, { size, mark: pal.acc, markInk: '#0a0d10' }); }
/** anchored label: a pill at a 2D point with a short leader line to the 3D anchor */
function pin2d(u, text, col, size = 38) { const e = el('div', { class: 'abs' }, u, `<div style="font:800 ${size}px/1 'Barlow Condensed';letter-spacing:.06em;color:#fff;background:rgba(6,10,14,.78);padding:12px 20px;border-radius:10px;border-left:8px solid ${col};white-space:nowrap;box-shadow:0 10px 30px rgba(0,0,0,.35)">${text}</div>`); return e; }
/** standard overlays for every 3D template */
function overlays(u, o, pal) {
  const ov = {};
  if (o.kicker) ov.k = tag(u, o.kicker, pal.acc);
  if (o.title) ov.ti = hl(u, o.title, o.titleSize || 76, pal);
  if (o.src) ov.src = C.tpl.src(u, o.src);
  return ov;
}
function setOverlays(ov, o, t, a) {
  if (ov.k) P(ov.k, { x: o.kx ?? 960, y: o.ky ?? 96, o: prog(t, a + .05, a + .35) });
  if (ov.ti) { ov.ti.set(t, o.titleAt ?? a + .25, .45); P(ov.ti.el, { x: o.tx ?? 960, y: o.ty ?? (o.kicker ? 186 : 120), o: prog(t, a, a + .3) }); }
  if (ov.src) P(ov.src, { x: 960, y: 1040, o: .9 * prog(t, a + .4, a + .8) });
}

/** shared 3D shot wrapper: builds a stage with the palette, runs build/update, overlays, renders */
function shot3(a, b, o, build, update) {
  shot(a, b + .35, ({ root }) => {
    const pal = Object.assign({}, PAL[o.pal || 'night'], o.palx || {});
    const S = GL.stage(root, Object.assign({ bg: pal.bg, fog: pal.fog, key: pal.key, rim: pal.rim, sky: pal.sky, bloom: o.bloom || [.42, .4, .9] }, o.stage || {}));
    const u = C.ui(root); const st = build(S, u, pal) || {}; st.S = S; st.u = u; st.pal = pal; st.ov = overlays(u, o, pal); if (o.ui) st.ui2 = o.ui.build(u); return st;
  }, (s, lt, t, k) => { update(s, lt, t, k); update(s, lt, t, k); /* twice: labels are projected with this frame's camera, not the last one */ setOverlays(s.ov, o, t, a); if (o.ui) o.ui.update(s.ui2, t); s.S.render(t); }, Object.assign({ in: 'cut', tin: .35, live: false }, o.tr || {}));
}
const once = (s, list) => { if (!s.__c) { s.__c = 1; list.filter(Boolean).forEach(c => cue(...c)); } };

// ---------------- props ----------------
function floor(pal, o = {}) { return GL.ground({ color: o.color || pal.ground, grid: o.grid ?? 1, gridCol: pal.grid, gridA: o.gridA ?? .45, rough: o.rough ?? .55 }); }
function envelope(col = '#cdd3da') { const g = new T.Group(); g.add(GL.mesh(GL.rbox(1.6, 1, .12, .06, 3), GL.M.plastic(col, .5)));
  const sh = new T.Shape(); sh.moveTo(-.78, .48); sh.lineTo(0, -.05); sh.lineTo(.78, .48); sh.lineTo(.7, .48); sh.lineTo(0, .05); sh.lineTo(-.7, .48); sh.closePath();
  g.add(GL.mesh(new T.ExtrudeGeometry(sh, { depth: .02, bevelEnabled: false }), GL.M.matte('#7d8a9c'), { pos: [0, 0, .061] })); const lb = GL.label('SMS', { size: 90, world: .45, bg: '#ffcf3a', color: '#1b1f24' }); lb.position.set(.45, -.28, .09); g.add(lb); return { group: g }; }
function db(pal) { const g = new T.Group(); for (let i = 0; i < 3; i++) { g.add(GL.mesh(new T.CylinderGeometry(.9, .9, .5, 40), GL.M.metal('#2b3340', .35), { pos: [0, .3 + i * .62, 0] })); g.add(GL.mesh(new T.TorusGeometry(.905, .025, 8, 60), GL.M.glow(pal.acc, 3), { cast: false, pos: [0, .3 + i * .62 + .2, 0], rot: [Math.PI / 2, 0, 0] })); } return { group: g }; }
function building(pal, o = {}) { const g = new T.Group(); const w = o.w || 3, h = o.h || 2.2, d = o.d || 2.4;
  g.add(GL.mesh(new T.BoxGeometry(w, h, d), GL.M.matte(o.col || '#1d2530', .7), { pos: [0, h / 2, 0] }));
  const win = GL.M.glow(o.win || pal.acc, .9); for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) g.add(GL.mesh(new T.PlaneGeometry(w / 8, h / 6), win, { cast: false, pos: [-w / 2 + w / 10 + c * w / 5, h * .35 + r * h * .33, d / 2 + .005] }));
  return { group: g }; }
function clock3d(pal, o = {}) { const g = new T.Group(); const face = GL.canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#f4f2ec'; c.beginPath(); c.arc(256, 256, 250, 0, 7); c.fill(); c.fillStyle = '#1b1f24'; for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, r1 = i % 5 ? 228 : 212; c.save(); c.translate(256, 256); c.rotate(a); c.fillRect(-(i % 5 ? 2 : 5), -238, i % 5 ? 4 : 10, 238 - r1); c.restore(); } });
  g.add(GL.mesh(new T.CylinderGeometry(1.15, 1.15, .22, 64), GL.M.metal(o.rim || '#c9ced6', .3), { rot: [Math.PI / 2, 0, 0] }));
  g.add(GL.mesh(new T.CircleGeometry(1.05, 64), new T.MeshStandardMaterial({ map: face.tex, roughness: .6 }), { cast: false, pos: [0, 0, .115] }));
  const arcM = new T.Mesh(new T.RingGeometry(.2, 1.0, 64, 1, Math.PI / 2, 0), new T.MeshBasicMaterial({ color: o.col || pal.acc, transparent: true, opacity: .55, side: T.DoubleSide })); arcM.position.z = .12; g.add(arcM);
  const hand = GL.mesh(GL.rbox(.07, .95, .04, .03, 2), GL.M.matte('#1b1f24'), { pos: [0, .4, .14] }); const hp = new T.Group(); hp.add(hand); hp.position.z = 0; g.add(hp);
  g.add(GL.mesh(new T.CylinderGeometry(.08, .08, .08, 20), GL.M.matte(o.col || pal.acc), { pos: [0, 0, .16], rot: [Math.PI / 2, 0, 0] }));
  return { group: g, set(k) { k = clamp(k); hp.rotation.z = -k * Math.PI * 2; arcM.geometry.dispose(); arcM.geometry = new T.RingGeometry(.2, 1.0, 64, 1, Math.PI / 2 - k * Math.PI * 2, k * Math.PI * 2); } }; }
function doorPortal(pal) { const g = new T.Group(); g.add(GL.mesh(GL.rbox(1.6, 2.8, .25, .06, 2), GL.M.matte('#2a1d14', .7), { pos: [0, 1.4, 0] })); g.add(GL.mesh(new T.PlaneGeometry(1.2, 2.4), GL.M.glow(pal.acc, 1.1), { cast: false, pos: [0, 1.35, .13] })); return { group: g }; }
function person3d(col = '#e4572e', skin = '#6b3f26', o = {}) { const g = new T.Group(); const sk = GL.M.matte(skin, .6);
  g.add(GL.mesh(new T.CapsuleGeometry(.24, .5, 6, 14), GL.M.matte(col, .6), { pos: [0, .62, 0] }));
  g.add(GL.mesh(new T.CapsuleGeometry(.09, .32, 4, 8), GL.M.matte(o.legs || '#29335c', .7), { pos: [-.11, .2, 0] })); g.add(GL.mesh(new T.CapsuleGeometry(.09, .32, 4, 8), GL.M.matte(o.legs || '#29335c', .7), { pos: [.11, .2, 0] }));
  g.add(GL.mesh(new T.SphereGeometry(.27, 24, 18), sk, { pos: [0, 1.25, 0] }));
  if (o.hair !== false) g.add(GL.mesh(new T.SphereGeometry(.28, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.2), GL.M.matte(o.hairCol || '#1a1210', .8), { pos: [0, 1.29, -.02] }));
  if (o.scarf) g.add(GL.mesh(new T.SphereGeometry(.3, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.4), GL.M.matte(o.scarf, .7), { pos: [0, 1.3, -.02] }));
  [-1, 1].forEach(sx => { g.add(GL.mesh(new T.SphereGeometry(.06, 12, 10), GL.M.matte('#bdbdbd', .6), { cast: false, pos: [sx * .1, 1.28, .23] })); g.add(GL.mesh(new T.SphereGeometry(.032, 10, 8), GL.M.basic('#111111'), { cast: false, pos: [sx * .1, 1.28, .285] })); });
  const armL = GL.mesh(new T.CapsuleGeometry(.07, .4, 4, 8), GL.M.matte(col, .6), { pos: [-.32, .72, 0], rot: [0, 0, .25] }); const armR = GL.mesh(new T.CapsuleGeometry(.07, .4, 4, 8), GL.M.matte(col, .6), { pos: [.3, .78, .12], rot: [-1.1, 0, -.2] }); g.add(armL); g.add(armR);
  return { group: g, armR }; }
const PROPS = {
  phone: o => GL.featurePhone(o), smart: o => GL.smartphone(o), tower: o => GL.tower(o), rack: o => GL.rack(o), bank: o => GL.bank(o),
  envelope: () => envelope(), db: (o, pal) => db(pal), building: (o, pal) => building(pal, o), clock: (o, pal) => clock3d(pal, o), door: (o, pal) => doorPortal(pal),
  coins: o => ({ group: GL.coinStack(o.n || 10, o) }), notes: o => { const g = new T.Group(); for (let i = 0; i < (o.n || 12); i++) { const n = GL.note(o); n.position.y = i * .02 + .01; n.rotation.y = (i * 37 % 11 - 5) * .03; n.rotation.x = -Math.PI / 2; g.add(n); } return { group: g }; },
  house: o => GL.house(o), person: o => person3d(o.col, o.skin, o),
};
function prop(name, o = {}, pal) { const p = PROPS[name](o, pal); if (o.pos) p.group.position.set(...o.pos); if (o.rot) p.group.rotation.set(...o.rot); if (o.scale) p.group.scale.setScalar(o.scale); return p; }

const T3 = {};

/** hero phone: { smart, screen: t => state (lcd or popup), key: t => cache key, dial: [[t, key]], cam: 'hero'|'macro'|'left'|'right'|'low',
    send: t (radio waves from the phone), tags: [{text, at, anchor:[x,y,z] (phone space), side: 1|-1}], side: {html, at, size} (big text beside), env: 'floor'|'none' } */
T3.phone = (a, b, o) => shot3(a, b, o, (S, u, pal) => {
  if (o.env !== 'none') S.add(floor(pal));
  const ph = o.smart ? GL.smartphone(o.phoneOpts || {}) : GL.featurePhone(o.phoneOpts || {}); ph.group.position.set(0, 1.5, 0); if (o.phoneScale) ph.group.scale.setScalar(o.phoneScale); S.add(ph);
  const wv = GL.waves(pal.acc, 4, { maxR: 4, thick: .025, facing: 'camera' }); wv.group.position.set(0, 2.9, 0); S.add(wv);
  const dust = GL.dust({ n: 220, box: [22, 9, 22], color: pal.acc, alpha: .35 }); S.add(dust);
  const tags = (o.tags || []).map(tg => ({ tg, e: pin2d(u, tg.text, tg.col || pal.acc) }));
  const side = o.side ? big(u, o.side.html, { size: o.side.size || 150, color: o.side.color || '#fff' }) : null;
  const sub = o.side && o.side.sub ? big(u, o.side.sub, { size: 44, weight: 700, font: 'Barlow', color: 'rgba(255,255,255,.85)' }) : null;
  if (o.dial) o.dial.forEach(([t, k]) => cue(t, k === 'call' ? 'click' : 'dtmf' + k, .7));
  if (o.send) cue(o.send, 'swoosh_up', .5);
  return { ph, wv, dust, tags, side, sub };
}, (s, lt, t) => {
  if (o.screenFn) s.ph.draw((g, w, h) => o.screenFn(g, w, h, t), Math.round(t * 15));
  else { const st = o.screen ? o.screen(t) : {}; const key = o.key ? o.key(t) : JSON.stringify(st); s.ph.draw((g, w, h) => (o.smart ? GL.popupScreen : GL.lcdScreen)(g, w, h, st), key); }
  if (s.ph.press) s.ph.press(o.dial ? GL.pressAt(t, o.dial) : {}, s.pal.acc);
  const sp = o.spin ?? 1; s.ph.group.rotation.y = (o.ry ?? -.32) * sp + .12 * Math.sin(t * .5) * sp; s.ph.group.rotation.x = -.06 + .03 * Math.sin(t * .4); s.ph.group.position.y = 1.5 + (o.phoneScale ? (o.phoneScale - 1) * .4 : 0) + .04 * Math.sin(t * 1.1);
  s.wv.set(o.send && t > o.send ? t - o.send : -10, .9); s.wv.group.visible = !!(o.send && t > o.send); s.wv.group.lookAt(s.S.cam.position); s.dust.set(t);
  const k = E.ioS(prog(t, a, b + .35)); const presets = {
    hero: [[1.1, 1.9, 5.0], [0.05, 1.5, 0], [0.4, 1.7, 4.1], [0, 1.55, 0]],
    macro: [[0.5, 2.05, 3.5], [0, 1.9, 0], [0.15, 2.0, 3.0], [0, 1.92, 0]],
    left: [[1.7, 1.9, 5.0], [1.25, 1.55, 0], [1.4, 1.8, 4.3], [1.15, 1.6, 0]],
    right: [[-1.7, 1.9, 5.0], [-1.25, 1.55, 0], [-1.4, 1.8, 4.3], [-1.15, 1.6, 0]],
    low: [[1.4, 0.9, 4.2], [0, 1.6, 0], [0.6, 1.1, 3.4], [0, 1.7, 0]],
    wide: [[2.5, 2.6, 6.5], [0, 1.4, 0], [1.8, 2.3, 5.4], [0, 1.5, 0]] };
  const c = o.camKeys ? null : presets[o.cam || 'hero'];
  if (c) { const p = c[0].map((v, i) => lerp(v, c[2][i], k)), q = c[1].map((v, i) => lerp(v, c[3][i], k)); const ps = o.phoneScale || 1; if (ps !== 1) { q[1] += (ps - 1) * .4; for (let i = 0; i < 3; i++) p[i] = q[i] + (p[i] - q[i]) * Math.sqrt(ps) * 1.02; } s.S.cam.position.set(...p); s.S.cam.lookAt(...q); GL.drift(s.S.cam, t, .03); }
  else GL.camKeys(s.S.cam, t, o.camKeys);
  s.tags.forEach(({ tg, e }) => { const an = s.ph.group.localToWorld(V3(...(tg.anchor || [0, 0, 0]))); const [x, y] = GL.toScreen(s.S, an); const q = E.outB(prog(t, tg.at, tg.at + .35));
    P(e, { x: x + (tg.dx ?? 330) * (tg.side || 1), y: y + (tg.dy || 0), o: q, s: .8 + .2 * q }); });
  if (s.side) { const q = E.outQu(prog(t, o.side.at ?? a + .3, (o.side.at ?? a + .3) + .5)); P(s.side, { x: o.side.x ?? 1380, y: (o.side.y ?? 470) + (1 - q) * 60, o: q }); }
  if (s.sub) { const q = E.outQu(prog(t, o.side.subAt ?? (o.side.at ?? a + .3) + .3, (o.side.subAt ?? (o.side.at ?? a + .3) + .3) + .5)); P(s.sub, { x: o.side.x ?? 1380, y: (o.side.y ?? 470) + (o.side.subDy ?? 120), o: q }); }
});

/** big 3D number / word: { text, at, label (2D under it), sub, props: 'coins'|'phones'|'notes'|'none', color, size } */
T3.number = (a, b, o) => shot3(a, b, o, (S, u, pal) => {
  S.add(floor(pal, { gridA: .3 }));
  const tx = GL.text3d(o.text, { size: o.size || 1.6, depth: .45, color: o.color || '#e9e9e9', side: o.sideCol || pal.acc, metal: .35, rough: .35 }); tx.position.set(0, 1.9, 0); S.add(tx);
  tx.userData.fit = Math.min(1, (o.maxW || 7.2) / (tx.userData.w || 1)); S.exposure = .82; S.bloom = [.38, .4, .9];
  const light = new T.PointLight(pal.acc, 30, 12); light.position.set(-4, 3, 3); S.scene.add(light);
  const deco = []; const n = o.props === 'none' ? 0 : 14; const r = C.rnd(o.seed || 21);
  for (let i = 0; i < n; i++) { const kind = o.props || 'phones'; let m;
    if (kind === 'coins') { m = GL.coin({ r: .35 }); } else if (kind === 'notes') { m = GL.note({ color: o.noteCol || '#2f7d4f', value: o.noteVal || '' }); m.scale.setScalar(.7); } else { m = GL.featurePhone().group; m.scale.setScalar(.38); }
    const ang = (i / n) * Math.PI * 1.6 - Math.PI * .8, rad = 5 + r() * 2.5; m.position.set(Math.sin(ang) * rad, .6 + r() * 3.6, -2.2 - Math.cos(ang) * 2.2 - r() * 2); m.userData = { ph: r() * 6, sp: .3 + r() * .5, y0: m.position.y }; S.scene.add(m); deco.push(m); }
  const lab = o.label ? big(u, o.label, { size: o.labelSize || 54, font: 'Barlow Condensed', ls: '.08em', color: pal.acc }) : null;
  const sub = o.sub ? big(u, o.sub, { size: 34, weight: 600, font: 'Barlow', color: 'rgba(255,255,255,.8)' }) : null;
  once({}, [[o.at ?? a + .2, 'impact', .5], [(o.at ?? a + .2) - .5, 'riser', .3]]);
  return { tx, light, deco, lab, sub };
}, (s, lt, t) => {
  const at = o.at ?? a + .2; const q = E.outB(prog(t, at, at + .7)); s.tx.scale.setScalar(Math.max(.001, q * s.tx.userData.fit)); s.tx.rotation.y = (1 - E.outC(prog(t, at, at + 1.1))) * -1.2 + .12 * Math.sin(t * .5); s.tx.position.y = 1.9 + .06 * Math.sin(t * .9);
  s.light.position.x = lerp(-6, 6, (t * .15) % 1); s.deco.forEach(m => { m.position.y = m.userData.y0 + Math.sin(t * m.userData.sp + m.userData.ph) * .25; m.rotation.y += 0; m.rotation.y = t * m.userData.sp + m.userData.ph; m.rotation.x = .3 * Math.sin(t * .4 + m.userData.ph); });
  const k = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(-1.4, 1.4, k), lerp(2.6, 2.3, k), lerp(8.4, 7.1, k)); s.S.cam.lookAt(0, 1.75, 0); GL.drift(s.S.cam, t, .03);
  if (s.lab) P(s.lab, { x: 960, y: o.labelY ?? 790, o: E.outC(prog(t, at + .3, at + .7)) });
  if (s.sub) P(s.sub, { x: 960, y: (o.labelY ?? 790) + 70, o: E.outC(prog(t, at + .6, at + 1)) });
});

/** Africa in 3D: { hl: {ISO: colour}, focus: [lon, lat], dist, tilt, raise: [[ISO, t]], arcs: [{from:[lon,lat], to:[lon,lat], at, col}], pins: [{lon, lat, at, text, col}],
    codes: [{lon, lat, text, at, col}] (big floating code labels), orbit } */
T3.map = (a, b, o) => shot3(a, b, Object.assign({ pal: 'sunset' }, o), (S, u, pal) => {
  S.add(GL.ground({ color: pal.ground, size: 120 }));
  const af = GL.africa({ color: o.landCol || '#3b2a1e', edge: o.edgeCol || '#a8795c', hl: o.hl || {} }); S.add(af);
  for (const iso in (o.glow || {})) af.color(iso, o.glow[iso], .6);
  const arcs = (o.arcs || []).map(A => { const p = af.xy(...A.from), q = af.xy(...A.to); const m = GL.arc(p, q, { color: A.col || pal.acc, h: A.h || 1.2, r: A.r || .04 }); S.add(m); cue(A.at, 'swoosh_up', .35); return { A, m }; });
  const pins = (o.pins || []).map(Pn => { const pp = af.xy(Pn.lon, Pn.lat); const g = new T.Group(); g.add(GL.mesh(new T.ConeGeometry(.09, .4, 16), GL.M.glow(Pn.col || pal.acc, 2.5), { cast: false, pos: [0, .2, 0], rot: [Math.PI, 0, 0] })); g.add(GL.mesh(new T.SphereGeometry(.12, 16, 12), GL.M.glow(Pn.col || pal.acc, 3), { cast: false, pos: [0, .45, 0] })); g.position.copy(pp); S.scene.add(g);
    const e = Pn.text ? pin2d(u, Pn.text, Pn.col || pal.acc, Pn.size || 40) : null; if (Pn.at) cue(Pn.at, 'pop', .4); return { Pn, g, e, pp }; });
  const codes = (o.codes || []).map(Cd => { const l = GL.label(Cd.text, { size: 120, world: (Cd.world || .62) * Math.min(1, (o.dist ?? 9) / 11), bg: 'rgba(5,8,12,.85)', border: Cd.col || pal.acc, color: '#fff' }); const pp = af.xy(Cd.lon, Cd.lat); l.position.set(pp.x, pp.y + (Cd.h || .7), pp.z); S.scene.add(l); cue(Cd.at, 'pop', .45); return { Cd, l }; });
  const dust = GL.dust({ n: 200, box: [16, 6, 16], color: pal.acc2 || pal.acc, alpha: .3 }); S.add(dust);
  return { af, arcs, pins, codes, dust };
}, (s, lt, t) => {
  (o.raise || []).forEach(([iso, at, h]) => s.af.raise(iso, E.outB(prog(t, at, at + .6)), h || .35));
  s.arcs.forEach(({ A, m }) => m.set(E.outC(prog(t, A.at, A.at + 1.1)), ((t - A.at) * .7) % 1.3));
  s.pins.forEach(({ Pn, g, e, pp }) => { const q = E.outB(prog(t, Pn.at ?? a, (Pn.at ?? a) + .4)); g.scale.setScalar(Math.max(.001, q)); g.position.y = pp.y + .05 * Math.sin(t * 3); if (e) { const [x, y] = GL.toScreen(s.S, pp.clone().add(V3(0, .5, 0))); P(e, { x: x + (Pn.dx ?? 0), y: y - (Pn.dy ?? 70), o: q }); } });
  s.codes.forEach(({ Cd, l }) => { const q = E.outB(prog(t, Cd.at, Cd.at + .45)); l.scale.setScalar(Math.max(.001, q)); l.quaternion.copy(s.S.cam.quaternion); });
  s.dust.set(t);
  const f = o.focus || [22, -8]; const fp = s.af.xy(...f); const k = E.ioS(prog(t, a, b + .35)); const d = lerp(o.dist ?? 9, (o.dist ?? 9) * (o.push ?? .82), k); const tilt = o.tilt ?? .95; const yaw = (o.yaw ?? -.35) + (o.orbit ?? .18) * k;
  s.S.cam.position.set(fp.x + Math.sin(yaw) * d * Math.cos(tilt), fp.y + d * Math.sin(tilt), fp.z + Math.cos(yaw) * d * Math.cos(tilt)); s.S.cam.lookAt(fp.x, fp.y, fp.z); GL.drift(s.S.cam, t, .02);
});

/** two things side by side: { left: {prop, opts, label, at}, right: {...}, link: 'beam'|'note'|null, linkAt, mid: {html, at} } */
T3.versus = (a, b, o) => shot3(a, b, o, (S, u, pal) => {
  S.add(floor(pal));
  const mk = (side, sx) => { if (!side) return null; const p = prop(side.prop, Object.assign({}, side.opts || {}), pal); p.group.position.x = sx * (o.gap || 3.2); if (side.y !== undefined) p.group.position.y = side.y; if (side.scale) p.group.scale.setScalar(side.scale); S.add(p);
    const ped = GL.mesh(new T.CylinderGeometry(1.5, 1.6, .2, 48), GL.M.matte('#0d0f13', .4), { pos: [sx * (o.gap || 3.2), .1, 0] }); S.scene.add(ped);
    const ring = GL.mesh(new T.TorusGeometry(1.55, .02, 8, 80), GL.M.glow(side.col || pal.acc, 2.5), { cast: false, pos: [sx * (o.gap || 3.2), .21, 0], rot: [Math.PI / 2, 0, 0] }); S.scene.add(ring);
    const lab = side.label ? big(u, side.label, { size: side.labelSize || 54, ls: '.06em', color: side.col || pal.acc }) : null; if (side.at) cue(side.at, 'pop', .45); return { p, lab, side, ring }; };
  const L = mk(o.left, -1), R = mk(o.right, 1);
  let link = null; if (o.link) { link = GL.beam([[-(o.gap || 3.2) + 1, 1.6, 0], [0, 2.6, 0], [(o.gap || 3.2) - 1, 1.6, 0]], { color: o.linkCol || pal.acc2 || pal.acc, r: .05 }); S.add(link); if (o.linkAt) cue(o.linkAt, 'swoosh_up', .4); }
  const mid = o.mid ? big(u, o.mid.html, { size: o.mid.size || 110, color: o.mid.color || '#fff' }) : null;
  return { L, R, link, mid };
}, (s, lt, t) => {
  [s.L, s.R].forEach((X, i) => { if (!X) return; const at = X.side.at ?? a + .1; const q = E.outB(prog(t, at, at + .5)); X.p.group.scale.setScalar(Math.max(.001, q * (X.side.scale || 1))); X.p.group.rotation.y = (i ? -.35 : .35) + .15 * Math.sin(t * .5 + i); if (X.p.set) X.p.set(X.side.k ? X.side.k(t) : t); if (X.p.blink) X.p.blink(t);
    if (X.p.press) X.p.press({}); if (X.p.draw && X.side.screen) X.p.draw((g, w, h) => GL.lcdScreen(g, w, h, X.side.screen(t)), JSON.stringify(X.side.screen(t)));
    if (X.lab) { const [x, y] = GL.toScreen(s.S, V3((i ? 1 : -1) * (o.gap || 3.2), 0, 1.4)); const hw = X.lab.offsetWidth / 2 + 40; P(X.lab, { x: clamp(x, hw, 1920 - hw), y: Math.min(y + 40, 1000), o: E.outC(prog(t, at + .2, at + .5)) }); } });
  if (s.link) s.link.set(E.outC(prog(t, o.linkAt ?? a + .6, (o.linkAt ?? a + .6) + .8)), ((t - (o.linkAt ?? a)) * .8) % 1.3, ((t - (o.linkAt ?? a)) * .8 + .5) % 1.3);
  if (s.mid) P(s.mid, { x: 960, y: o.mid.y ?? 300, o: E.outB(prog(t, o.mid.at ?? a + .5, (o.mid.at ?? a + .5) + .4)), s: .85 + .15 * E.outB(prog(t, o.mid.at ?? a + .5, (o.mid.at ?? a + .5) + .4)) });
  const k = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(-.8, .8, k), lerp(3.2, 2.8, k), lerp(9.6, 8.6, k)); s.S.cam.lookAt(0, 1.5, 0); GL.drift(s.S.cam, t, .03);
});

/** a crowd of 100 people, some light up: { n, lit: fraction or [[fraction, at, col]], value html, label } */
T3.crowd = (a, b, o) => shot3(a, b, o, (S, u, pal) => {
  S.add(floor(pal, { gridA: .2 })); const n = o.n || 100, cols = o.cols || 20; const body = new T.InstancedMesh(new T.CapsuleGeometry(.16, .42, 3, 8), new T.MeshStandardMaterial({ roughness: .7 }), n); const head = new T.InstancedMesh(new T.SphereGeometry(.13, 12, 10), new T.MeshStandardMaterial({ roughness: .7 }), n);
  body.castShadow = head.castShadow = true; const r = C.rnd(o.seed || 5); const pos = []; const m4 = new T.Matrix4();
  for (let i = 0; i < n; i++) { const x = (i % cols - (cols - 1) / 2) * .62 + (r() - .5) * .15, z = (Math.floor(i / cols) - (n / cols - 1) / 2) * .7 + (r() - .5) * .15; pos.push([x, z, r()]); m4.makeTranslation(x, .38, z); body.setMatrixAt(i, m4); m4.makeTranslation(x, .86, z); head.setMatrixAt(i, m4); head.setColorAt(i, new T.Color(['#6b3f26', '#8a5a3b', '#4a2c1a', '#a06a45'][i % 4])); body.setColorAt(i, new T.Color('#3a4250')); }
  S.scene.add(body); S.scene.add(head);
  const val = o.value ? big(u, o.value, { size: o.valueSize || 190, color: pal.acc }) : null; const lab = o.label ? big(u, o.label, { size: 50, ls: '.06em' }) : null;
  return { body, head, pos, val, lab };
}, (s, lt, t) => {
  const groups = Array.isArray(o.lit) ? o.lit : [[o.lit ?? .25, o.at ?? a + .5, s.pal.acc]]; const cc = new T.Color(); const order = s.pos.map((p, i) => [p[2], i]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
  order.forEach((i, rank) => { let col = '#3a4250', glow = 0; let acc = 0; for (const [f, at, c] of groups) { const lim = Math.round(f * s.pos.length); if (rank >= acc && rank < acc + lim) { const q = prog(t, at + (rank - acc) * .012, at + (rank - acc) * .012 + .25); if (q > 0) { col = c; glow = q; } } acc += lim; }
    cc.set('#3a4250').lerp(new T.Color(col), glow).multiplyScalar(1 + glow * .6); s.body.setColorAt(i, cc); }); s.body.instanceColor.needsUpdate = true;
  const k = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(-3, 3, k), lerp(7.5, 6.2, k), lerp(9.5, 8.2, k)); s.S.cam.lookAt(0, 0, 0); GL.drift(s.S.cam, t, .03);
  const at = Array.isArray(o.lit) ? o.lit[0][1] : (o.at ?? a + .5);
  if (s.val) P(s.val, { x: o.vx ?? 960, y: o.vy ?? 230, o: E.outB(prog(t, at, at + .4)), s: .8 + .2 * E.outB(prog(t, at, at + .4)) });
  if (s.lab) P(s.lab, { x: o.vx ?? 960, y: (o.vy ?? 230) + 130, o: E.outC(prog(t, at + .3, at + .7)) });
});

/** 3D bar columns: { items: [{label, value, col, at, text}], max, unit } */
T3.bars = (a, b, o) => shot3(a, b, o, (S, u, pal) => {
  S.add(floor(pal)); const n = o.items.length, gap = o.gap || 3; const max = o.max || Math.max(...o.items.map(i => i.value));
  const bars = o.items.map((it, i) => { const x = (i - (n - 1) / 2) * gap; const m = GL.mesh(GL.rbox(1.6, 1, 1.6, .08, 3), new T.MeshPhysicalMaterial({ color: it.col || pal.acc, roughness: .25, metalness: .1, clearcoat: 1, emissive: it.col || pal.acc, emissiveIntensity: .15 }), { pos: [x, 0, 0] }); S.scene.add(m);
    const lab = big(u, it.label, { size: 44, ls: '.06em' }); const val = big(u, '', { size: 96, color: it.col || pal.acc }); if (it.at) cue(it.at, 'whoosh_low', .35); return { it, m, x, lab, val }; });
  return { bars, max };
}, (s, lt, t) => {
  const H = o.h || 3.4; s.bars.forEach(B => { const q = E.outC(prog(t, B.it.at ?? a + .2, (B.it.at ?? a + .2) + .9)); const h = Math.max(.02, H * B.it.value / s.max * q); B.m.scale.y = h; B.m.position.y = h / 2;
    const [x, y] = GL.toScreen(s.S, V3(B.x, h + .1, 0)); const [x2, y2] = GL.toScreen(s.S, V3(B.x, 0, 1.2)); B.val.innerHTML = B.it.text ? (q > .98 ? B.it.text : (o.fmt ? o.fmt(B.it.value * q) : Math.round(B.it.value * q))) : (o.fmt ? o.fmt(B.it.value * q) : Math.round(B.it.value * q)) + (o.unit || '');
    P(B.val, { x, y: y - 70, o: prog(t, B.it.at ?? a + .2, (B.it.at ?? a + .2) + .2) }); P(B.lab, { x: x2, y: y2 + 30, o: prog(t, B.it.at ?? a + .2, (B.it.at ?? a + .2) + .3) }); });
  const k = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(-1.5, 1.5, k), lerp(3.6, 3.2, k), lerp(11, 10, k)); s.S.cam.lookAt(0, 2.0, 0); GL.drift(s.S.cam, t, .03);
});

/** chapter title in 3D: { lines: ['WHO', 'PAYS?'], kicker, prop: name, propOpts } */
T3.title = (a, b, o) => shot3(a, b, o, (S, u, pal) => {
  S.add(floor(pal, { gridA: .55 }));
  const lines = (o.lines || []).map((ln, i) => { const m = GL.text3d(ln, { size: o.size || (i ? 1.0 : 1.25), depth: .35, color: i === (o.accentLine ?? -1) ? pal.acc : '#ececec', side: pal.acc, metal: .25, rough: .4 }); m.userData.fit = Math.min(1, (o.maxW || 6.4) / (m.userData.w || 1)); S.scene.add(m); return m; });
  const pr = o.prop ? prop(o.prop, Object.assign({ pos: [o.propX ?? 0, 0, -3.2] }, o.propOpts || {}), pal) : null; if (pr) S.add(pr);
  /* A side prop gets its own part of the frame: the text moves over (and shrinks if it must) so it never covers the
     prop, and the prop sways toward the camera instead of spinning (USSD v6, 13 Nov 2026: a coin stack hid behind
     'PAYS?', a phone behind the D of 'USSD', a clock turned edge-on). o.propFree keeps the old free-spinning layout. */
  let tx = 0, side = 0;
  if (pr && !o.propFree) {
    pr.group.updateMatrixWorld(true); const box = new T.Box3().setFromObject(pr.group);
    const pcx = (box.max.x + box.min.x) / 2, pw = box.max.x - box.min.x, D = 8, k = D / (D - pr.group.position.z), half = 3.4;
    const L = (pcx - pw / 2) * k, R = (pcx + pw / 2) * k; side = pcx >= 0 ? 1 : -1;
    const lo = side > 0 ? -half : R + .75, hi = side > 0 ? L - .75 : half, span = Math.max(2.4, hi - lo); tx = (lo + hi) / 2;
    lines.forEach(m => { m.userData.fit = Math.min(m.userData.fit, span / (m.userData.w || 1)); });
  }
  S.bloom = [.32, .4, .92]; const sp = new T.SpotLight(pal.acc, 60, 20, .5, .6); sp.position.set(0, 7, 4); sp.target.position.set(0, 1.5, 0); S.scene.add(sp); S.scene.add(sp.target);
  cue(a + .15, 'whoosh', .4); cue(a + .45, 'impact', .35);
  return { lines, pr, tx, side };
}, (s, lt, t) => {
  const n = s.lines.length; s.lines.forEach((m, i) => { const at = a + .12 + i * .22; const q = E.outB(prog(t, at, at + .6)); const lh = (o.size || 1.1) * 1.4; const y = 1.95 + (n - 1) * lh / 2 - i * lh; m.position.set(s.tx, y - (1 - q) * 1.5, (1 - q) * 2); m.rotation.x = (1 - q) * -1.2; m.scale.setScalar(Math.max(.001, q * m.userData.fit)); m.rotation.y = .08 * Math.sin(t * .6 + i); });
  if (s.pr) { if (s.pr.blink) s.pr.blink(t); if (s.pr.set) s.pr.set(t); s.pr.group.rotation.y = o.propFree ? t * .15 : (o.propRot ?? -.3 * s.side) + .12 * Math.sin(t * .7); }
  const k = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(1.2, -1.2, k), lerp(2.0, 2.4, k), lerp(8.5, 7.4, k)); s.S.cam.lookAt(0, 1.8, 0); GL.drift(s.S.cam, t, .03);
});

/** money pile growing: { from, to (number of notes), at, dur, count: {from, to, fmt}, noteCol, noteVal, label } */
T3.pile = (a, b, o) => shot3(a, b, o, (S, u, pal) => {
  S.add(floor(pal)); const N = o.to || 220; const geo = new T.BoxGeometry(1.5, .02, .7); const tex = GL.canvasTex(256, 120, (c, w, h) => { c.fillStyle = o.noteCol || '#3d8f5a'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 4; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = '#fff'; c.font = '800 54px "Barlow Condensed"'; c.textBaseline = 'middle'; c.fillText(o.noteVal || '', 20, h / 2); });
  const mat = [GL.M.matte('#d8e4da'), GL.M.matte('#d8e4da'), new T.MeshStandardMaterial({ map: tex.tex, roughness: .7 }), new T.MeshStandardMaterial({ map: tex.tex, roughness: .7 }), GL.M.matte('#d8e4da'), GL.M.matte('#d8e4da')];
  const im = new T.InstancedMesh(geo, mat, N); im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; /* instances move: a bounding sphere from the first frame would cull the whole pile later */ const r = C.rnd(7); const slots = [];
  for (let i = 0; i < N; i++) { const stack = i % 6, lev = Math.floor(i / 6); slots.push({ x: (stack % 3 - 1) * 1.7 + (r() - .5) * .08, z: (Math.floor(stack / 3) - .5) * .9 + (r() - .5) * .08, y: .011 + lev * .021, ry: (r() - .5) * .12 }); }
  S.scene.add(im); const cnt = o.count ? big(u, '', { size: o.countSize || 170, color: pal.acc2 || pal.acc }) : null; const lab = o.label ? big(u, o.label, { size: 50, ls: '.06em' }) : null;
  return { im, slots, cnt, lab, N };
}, (s, lt, t) => {
  const at = o.at ?? a + .3, dur = o.dur || 3; const k = E.ioQ(prog(t, at, at + dur)); const n = o.clear ? Math.round(lerp(s.N, 0, E.inQ(prog(t, o.clear, o.clear + (o.clearDur || 1.6))))) : Math.round(lerp(o.from || 0, s.N, k)); const m4 = new T.Matrix4(), q4 = new T.Quaternion(), e = new T.Euler();
  for (let i = 0; i < s.N; i++) { const sl = s.slots[i]; const drop = i < n ? 0 : (o.clear ? -8 : 6); e.set(0, sl.ry, 0); q4.setFromEuler(e); m4.compose(V3(sl.x, sl.y + drop, sl.z), q4, V3(1, 1, i < n ? 1 : .0001)); s.im.setMatrixAt(i, m4); } s.im.instanceMatrix.needsUpdate = true;
  if (s.cnt) { const v = lerp(o.count.from, o.count.to, E.outC(prog(t, at, at + dur))); s.cnt.innerHTML = o.count.fmt ? o.count.fmt(v) : Math.round(v); P(s.cnt, { x: 960, y: o.cy ?? 250, o: prog(t, at - .2, at + .2) }); }
  if (s.lab) P(s.lab, { x: 960, y: (o.cy ?? 250) + 120, o: prog(t, at, at + .4) });
  const kk = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(-2.2, 2.2, kk), lerp(3.6, 3.0, kk), lerp(7.2, 6.2, kk)); s.S.cam.lookAt(0, 1.0, 0); GL.drift(s.S.cam, t, .03);
});

/** village / town at a time of day, with a tower and phones glowing: { night, phones: [[x,z,at]], beams: true, people } */
T3.village = (a, b, o) => shot3(a, b, Object.assign({ pal: 'sunset' }, o), (S, u, pal) => {
  S.add(GL.ground({ color: o.groundCol || '#3a2412', size: 160, rough: .95 })); const r = C.rnd(o.seed || 12); const houses = [];
  for (let i = 0; i < (o.n || 16); i++) { const h = GL.house({ wall: ['#e9dcc5', '#d8c3a0', '#c9a27a', '#f0e6d2'][i % 4], roof: ['#a8432f', '#6b4a3a', '#8a8f96', '#b5652f'][i % 4], night: o.night }); const ang = r() * Math.PI * 2, rad = 3 + r() * 9; h.group.position.set(Math.cos(ang) * rad, 0, Math.sin(ang) * rad - 3); h.group.rotation.y = r() * 6; S.add(h); houses.push(h); }
  for (let i = 0; i < 22; i++) { const tr = GL.tree({ acacia: true, leaf: ['#3d6b2f', '#556b2f', '#2f5d3a'][i % 3], h: 1 + r() * .8, r: .6 + r() * .4 }); const ang = r() * Math.PI * 2, rad = 4 + r() * 14; tr.position.set(Math.cos(ang) * rad, 0, Math.sin(ang) * rad - 4); S.scene.add(tr); }
  const tw = GL.tower({ h: 9 }); tw.group.position.set(o.towerX ?? 6, 0, o.towerZ ?? -9); S.add(tw);
  const sun = GL.mesh(new T.SphereGeometry(3.2, 32, 20), GL.M.basic(o.sunCol || '#ffcf7a', { fog: false }), { cast: false, pos: [14, 7, -46] }); S.scene.add(sun);
  const peeps = (o.people || []).map(([x, z, col, at]) => { const p = person3d(col); p.group.position.set(x, 0, z); S.add(p); const glow = GL.mesh(GL.rbox(.16, .28, .03, .02, 2), GL.M.glow(pal.acc, 3), { cast: false, pos: [x + .18, 1.0, z + .1] }); S.scene.add(glow); const wv = GL.waves(pal.acc, 3, { maxR: 2.5, facing: 'camera', thick: .02 }); wv.group.position.set(x + .18, 1.1, z + .1); S.add(wv); return { p, glow, wv, at: at ?? a + .5 }; });
  const sig = GL.waves(o.sigCol || '#7fe3ff', 4, { maxR: 7, facing: 'camera', thick: .03, alpha: .7 }); sig.group.position.set(o.towerX ?? 6, 8.3, o.towerZ ?? -9); S.add(sig);
  const dust = GL.dust({ n: 260, box: [30, 8, 30], color: '#ffd9a0', alpha: .25 }); S.add(dust);
  return { tw, peeps, sig, dust };
}, (s, lt, t) => {
  s.tw.blink(t); s.sig.set(t, .5); s.sig.group.lookAt(s.S.cam.position); s.dust.set(t);
  s.peeps.forEach(P0 => { const on = t > P0.at; P0.glow.visible = on; P0.wv.group.visible = on; if (on) { P0.wv.set(t - P0.at, 1); P0.wv.group.lookAt(s.S.cam.position); } });
  const keys = o.camKeys || [[a, [-15, 7, 17], [0, 1.2, -5]], [b + .35, [-10, 5, 13], [2, 1.8, -6]]]; GL.camKeys(s.S.cam, t, keys, E.lin); GL.drift(s.S.cam, t, .04);
});

/** the network journey: one shared layout, the packet travels between nodes; o.hits = [[t, node]] (node index), o.back (return trip) */
const NET = [
  { name: 'YOUR PHONE', p: [0, 0, 0] }, { name: 'CELL TOWER', p: [5, 0, -4] }, { name: 'SWITCHING CENTRE', p: [11, 0, -1] },
  { name: 'HOME REGISTER', sub: 'your details', p: [16, 0, -5] }, { name: 'USSD GATEWAY', p: [21, 0, -1.5] }, { name: 'THE SERVICE', sub: 'network · bank · Fluxr', p: [27, 0, -4] },
];
T3.network = (a, b, o) => shot3(a, b, Object.assign({ pal: 'network' }, o), (S, u, pal) => {
  S.add(floor(pal, { gridA: .5 }));
  const nodes = NET.map((nd, i) => { let p; if (i === 0) { p = GL.featurePhone(); p.group.scale.setScalar(.75); p.group.position.set(nd.p[0], 1.1, nd.p[2]); }
    else if (i === 1) { p = GL.tower({ h: 6.5 }); p.group.position.set(...nd.p); }
    else if (i === 2) { p = building(pal, { w: 3.2, h: 2.4, d: 2.6 }); p.group.position.set(...nd.p); const rk = GL.rack({ h: 2.2, seed: 4 }); rk.group.position.set(nd.p[0] + 2.1, 0, nd.p[2] + .4); S.add(rk); p.rack = rk; }
    else if (i === 3) { p = db(pal); p.group.position.set(...nd.p); }
    else if (i === 4) { p = GL.rack({ h: 3, seed: 9 }); p.group.position.set(...nd.p); const r2 = GL.rack({ h: 3, seed: 11 }); r2.group.position.set(nd.p[0] + 1.2, 0, nd.p[2]); S.add(r2); p.r2 = r2; }
    else { p = { group: new T.Group() }; const bk = GL.bank({ w: 3.2, d: 2.2, cols: 4 }); bk.group.scale.setScalar(.55); bk.group.position.set(-1.7, 0, 0); p.group.add(bk.group); const tw = GL.tower({ h: 3.4, sections: 5 }); tw.group.position.set(.2, 0, -.6); p.group.add(tw.group); p.tw = tw;
      const fx = GL.rack({ h: 2, seed: 13 }); fx.group.position.set(1.9, 0, 0); p.group.add(fx.group); p.fx = fx; const fl = GL.label('FLUXR', { size: 80, world: .5, bg: '#0d372b', border: '#85ed70' }); fl.position.set(1.9, 2.35, .6); p.group.add(fl); p.group.position.set(...nd.p); }
    S.add(p); const lab = pin2d(u, nd.name + (nd.sub ? `<span style="font:600 26px Barlow;letter-spacing:0;opacity:.8;margin-left:12px">${nd.sub}</span>` : ''), pal.acc, 40); return { nd, p, lab }; });
  const top = i => { const [x, , z] = NET[i].p; return [x, i === 0 ? 2.2 : i === 1 ? 5.6 : i === 3 ? 2.3 : i === 2 ? 2.6 : 2.8, z]; };
  const pts = []; NET.forEach((n, i) => { pts.push(top(i)); if (i < NET.length - 1) { const q = top(i + 1); pts.push([(n.p[0] + q[0]) / 2, Math.max(top(i)[1], q[1]) + 1.2, (n.p[2] + q[2]) / 2]); } });
  const bm = GL.beam(pts, { color: pal.acc, r: .06, seg: 400 }); S.add(bm); const pk = GL.orb('#eaffd8', .16, 5); S.add(pk);
  // fraction along the beam for each node (points at even indices)
  const fr = NET.map((n, i) => i / (NET.length - 1));
  const dust = GL.dust({ n: 300, box: [40, 8, 20], color: pal.acc, alpha: .3 }); dust.group.position.x = 13; S.add(dust);
  (o.hits || []).forEach(([t]) => cue(t, 'bloop', .35));
  return { nodes, bm, pk, fr, dust };
}, (s, lt, t) => {
  const hits = o.hits || [[a, 0], [b, 1]]; let pos = 0; for (let i = 0; i < hits.length; i++) { const [ht, nd] = hits[i]; if (t >= ht) pos = s.fr[nd]; if (i + 1 < hits.length && t >= ht && t < hits[i + 1][0]) { const [h2, n2] = hits[i + 1]; const tr = Math.min(1.2, h2 - ht); const st = h2 - tr; pos = t < st ? s.fr[nd] : lerp(s.fr[nd], s.fr[n2], E.ioC(prog(t, st, h2))); } }
  const rev = o.back ? 1 : Math.max(pos, o.revealMin || 0); s.bm.set(rev + .001, pos, -1); const pp = s.bm.at(pos); s.pk.group.position.copy(pp);
  s.nodes.forEach(({ p, lab, nd }, i) => { if (p.blink) p.blink(t); if (p.set) p.set(t); if (p.rack) p.rack.set(t); if (p.r2) p.r2.set(t); if (p.tw) p.tw.blink(t); if (p.fx) p.fx.set(t);
    if (p.draw) p.draw((g, w, h) => GL.lcdScreen(g, w, h, o.back && t > (o.menuAt ?? b - 1) ? { title: 'MENU', lines: ['1 Balance', '2 Buy bundle', '3 Send money'] } : { input: o.code || '*120#', soft: ['', 'Call'] }), (o.back && t > (o.menuAt ?? b - 1)) + '');
    const reached = hits.find(([ht, n]) => n === i); const q = reached ? E.outB(prog(t, reached[0] - .1, reached[0] + .3)) : (o.showAll ? 1 : 0);
    const [x, y, vis] = GL.toScreen(s.S, V3(nd.p[0], (i === 1 ? 7 : 3.4), nd.p[2])); const ok = vis && isFinite(x) && isFinite(y) && x > 80 && x < 1840 && y > 60; P(lab, { x: ok ? x : -999, y: Math.max(y - 30, o.title ? 270 : 90), o: ok ? q : 0, s: .85 + .15 * q }); });
  s.dust.set(t);
  // camera tracks the packet
  const look = pp.clone().add(V3(2.4, -1.4, -1.2)); const cp = look.clone().add(V3(-2.6 + (o.camSide || 0), 6.4, 14.5)); const k = E.ioS(prog(t, a, b + .35));
  if (o.wide) { s.S.cam.position.set(13.5 + lerp(-2, 2, k), 9, 19); s.S.cam.lookAt(13.5, 1.5, -2.5); } else { s.S.cam.position.copy(cp); s.S.cam.lookAt(look.x, look.y, look.z); }
  GL.drift(s.S.cam, t, .04);
});


/** Fireship "receipt": a source card in 3D with the key words highlighted on time.
    { source: 'GSMA · State of the Industry Report 2018', lines: ['...'], mark: 'over 90 per cent' (substring to highlight), markAt, quote: true } */
T3.receipt = (a, b, o) => shot3(a, b, o, (S, u, pal) => {
  S.add(floor(pal, { gridA: .35 })); const W2 = 1400, H2 = 760; const card = GL.canvasTex(W2, H2);
  const m = GL.mesh(GL.rbox(5.6, 3.04, .06, .08, 3), [GL.M.matte('#d9d5cc'), GL.M.matte('#d9d5cc'), GL.M.matte('#d9d5cc'), GL.M.matte('#d9d5cc'), new T.MeshStandardMaterial({ map: card.tex, roughness: .8, color: '#cfcbc4' }), GL.M.matte('#cfc9be')]); m.position.set(0, 1.9, 0); S.scene.add(m);
  const draw = k => card.draw((c, w, h) => { c.fillStyle = '#f7f4ee'; c.fillRect(0, 0, w, h); c.fillStyle = pal.acc === '#ffd23a' ? '#2e1a5a' : '#13213a'; c.fillRect(0, 0, w, 110);
    c.fillStyle = '#fff'; c.font = '800 54px "Barlow Condensed"'; c.textBaseline = 'middle'; c.fillText(o.source || '', 56, 56, w - 112);
    c.font = `${o.quote ? 600 : 700} ${o.fs || 66}px "Barlow"`; c.textBaseline = 'top'; let y = 170; const lh = (o.fs || 66) * 1.32;
    (o.lines || []).forEach(line => { const txt = (o.quote ? '' : '') + line; const mk = o.mark && line.includes(o.mark) ? line.indexOf(o.mark) : -1;
      if (mk >= 0) { const pre = line.slice(0, mk); const x0 = 70 + c.measureText(pre).width, wM = c.measureText(o.mark).width; c.fillStyle = 'rgba(255,207,58,.85)'; c.fillRect(x0 - 6, y - 4, (wM + 12) * k, lh - 6); }
      c.fillStyle = '#1b1f24'; c.fillText(txt, 70, y, w - 140); y += lh; });
    if (o.foot) { c.fillStyle = '#6b6f76'; c.font = '600 34px "Barlow"'; c.fillText(o.foot, 70, h - 80, w - 140); } }, Math.round(k * 20));
  S.exposure = .78; S.bloom = [.2, .35, .97]; draw(0); cue(o.markAt ?? a + 1, 'swish', .35); const sp = GL.dust({ n: 160, box: [16, 7, 10], color: pal.acc, alpha: .3 }); S.add(sp);
  return { m, draw, sp };
}, (s, lt, t) => { const k = E.ioC(prog(t, o.markAt ?? a + 1, (o.markAt ?? a + 1) + .7)); s.draw(k); s.sp.set(t);
  const q = E.outB(prog(t, a, a + .5)); s.m.rotation.set(-.12 + .04 * Math.sin(t * .5), -.25 + .08 * Math.sin(t * .4), .02); s.m.position.y = 1.9 - (1 - q) * 2.5;
  const kk = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(.8, -.4, kk), lerp(2.4, 2.1, kk), lerp(6.4, 5.4, kk)); s.S.cam.lookAt(0, 1.85, 0); GL.drift(s.S.cam, t, .02); });

/** Kurzgesagt particle map: thousands of glowing dots fill Africa (or the iso list) on time. { n, isos: [..] | null, at, dur, value html, label, col } */
let _AFDOTS = null;
function africaDots(n, isos) { const cv = document.createElement('canvas'); cv.width = 1100; cv.height = 1100; const c = cv.getContext('2d'); c.fillStyle = '#fff';
  for (const iso in window.AFRICA) { if (isos && !isos.includes(iso)) continue; c.fill(new Path2D(window.AFRICA[iso].d)); }
  const img = c.getImageData(0, 0, 1100, 1100).data; const r = C.rnd(77); const pts = []; let guard = 0;
  while (pts.length < n && guard++ < n * 40) { const x = r() * 1100, y = r() * 1100; if (img[((y | 0) * 1100 + (x | 0)) * 4] > 128) pts.push([x, y, r()]); } return pts; }
T3.dotMap = (a, b, o) => shot3(a, b, Object.assign({ pal: 'gold' }, o), (S, u, pal) => {
  S.add(GL.ground({ color: pal.ground, size: 120 })); const pts = africaDots(o.n || 6000, o.isos || null); const sc = .01;
  const geo = new T.BufferGeometry(); const pos = new Float32Array(pts.length * 3), col = new Float32Array(pts.length * 3); pts.forEach(([x, y], i) => { pos[i * 3] = (x - 560) * sc; pos[i * 3 + 1] = .05; pos[i * 3 + 2] = (y - 560) * sc; });
  geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('color', new T.BufferAttribute(col, 3));
  const spr = GL.canvasTex(64, 64, (c, w, h) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  const ptsM = new T.Points(geo, new T.PointsMaterial({ size: o.size || .12, map: spr.tex, vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending })); S.scene.add(ptsM);
  const af = GL.africa({ color: '#140c2a', edge: pal.grid, depth: .02 }); S.add(af);
  const val = o.value ? big(u, o.value, { size: o.valueSize || 200, color: pal.acc }) : null; const lab = o.label ? big(u, o.label, { size: 48, ls: '.06em' }) : null;
  cue(o.at ?? a + .3, 'sparkle', .4); return { pts, col, geo, val, lab, af };
}, (s, lt, t) => { const at = o.at ?? a + .3, dur = o.dur || 2.2; const cc = new T.Color(o.col || s.pal.acc); const c2 = new T.Color(s.pal.acc2);
  s.pts.forEach(([x, y, r], i) => { const ord = (y / 1100) * .6 + r * .4; const q = clamp((t - at - ord * dur) / .35); const tw = .7 + .3 * Math.sin(t * 3 + r * 40); const cl = r < .12 ? c2 : cc; s.col[i * 3] = cl.r * q * tw; s.col[i * 3 + 1] = cl.g * q * tw; s.col[i * 3 + 2] = cl.b * q * tw; }); s.geo.attributes.color.needsUpdate = true;
  const k = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(-1.5, 1.5, k), lerp(11, 9.5, k), lerp(8, 6.5, k)); s.S.cam.lookAt(0, 0, 1.2); GL.drift(s.S.cam, t, .03);
  if (s.val) P(s.val, { x: o.vx ?? 1440, y: o.vy ?? 420, o: E.outB(prog(t, at + .4, at + .9)), s: .85 + .15 * E.outB(prog(t, at + .4, at + .9)) });
  if (s.lab) P(s.lab, { x: o.vx ?? 1440, y: (o.vy ?? 420) + 130, o: E.outC(prog(t, at + .7, at + 1.1)) }); });

/** a character in a little world, holding a phone: { char: {col, skin, scarf, hairCol, legs}, env: 'room'|'street'|'village', screen: t=>state, side: {html, at}, tags } */
T3.person = (a, b, o) => shot3(a, b, o, (S, u, pal) => {
  S.add(floor(pal, { gridA: .2 })); const ch = o.char || {}; const p = person3d(ch.col || '#e4572e', ch.skin || '#6b3f26', ch); p.group.scale.setScalar(1.6); p.group.position.set(o.px ?? -1.2, 0, 0); S.add(p);
  const ph = GL.featurePhone({ res: 360 }); ph.group.scale.setScalar(.17); ph.group.position.set(.36, .78, .2); ph.group.rotation.set(-.5, .2, 0); p.group.add(ph.group);
  const glow = new T.PointLight(pal.acc, 2.5, 3); glow.position.set(.3, 1.1, .5); p.group.add(glow);
  const props = []; if (o.env === 'village') { for (let i = 0; i < 6; i++) { const h = GL.house({ night: true }); h.group.position.set(-6 + i * 2.6, 0, -6 - (i % 2) * 2); h.group.rotation.y = i * .7; S.add(h); } const tw = GL.tower({ h: 7 }); tw.group.position.set(5, 0, -9); S.add(tw); props.push(tw); }
  else if (o.env === 'room') { S.scene.add(GL.mesh(new T.BoxGeometry(14, 6, .2), GL.M.matte(pal.grid, .9), { pos: [0, 3, -4] })); S.scene.add(GL.mesh(new T.BoxGeometry(2.6, 1.8, .12), GL.M.matte('#3a2a20', .7), { pos: [2.8, 2.6, -3.9] })); const win = GL.mesh(new T.PlaneGeometry(2.3, 1.5), new T.MeshBasicMaterial({ map: GL.gradTex('#ffcf8a', '#ff8a5a'), fog: false }), { cast: false, pos: [2.8, 2.6, -3.82] }); S.scene.add(win); S.scene.add(GL.mesh(new T.BoxGeometry(.08, 1.5, .05), GL.M.matte('#3a2a20'), { pos: [2.8, 2.6, -3.8] })); const tb = GL.mesh(GL.rbox(2.2, .1, 1.1, .03, 2), GL.M.matte('#6b4a32', .6), { pos: [1.2, .9, -.6] }); S.scene.add(tb); }
  const side = o.side ? big(u, o.side.html, { size: o.side.size || 110 }) : null; const tags = (o.tags || []).map(tg => ({ tg, e: pin2d(u, tg.text, tg.col || pal.acc) }));
  return { p, ph, props, side, tags };
}, (s, lt, t) => { const st = o.screen ? o.screen(t) : { lines: ['1 Balance', '2 Send money'], title: 'MENU' }; s.ph.draw((g, w, h) => GL.lcdScreen(g, w, h, st), JSON.stringify(st)); s.ph.press({});
  s.p.group.rotation.y = (o.ry ?? .35) + .08 * Math.sin(t * .6); s.p.group.position.y = .02 * Math.sin(t * 2.2); s.props.forEach(x => x.blink && x.blink(t));
  const k = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(1.6, .6, k), lerp(2.4, 2.2, k), lerp(6.4, 5.4, k)); s.S.cam.lookAt(o.lookX ?? .2, 1.5, 0); GL.drift(s.S.cam, t, .03);
  if (s.side) P(s.side, { x: o.side.x ?? 1380, y: o.side.y ?? 470, o: E.outQu(prog(t, o.side.at ?? a + .3, (o.side.at ?? a + .3) + .5)) });
  s.tags.forEach(({ tg, e }) => P(e, { x: tg.x ?? 1380, y: tg.y ?? 620, o: E.outB(prog(t, tg.at, tg.at + .35)) })); });

/** Kurzgesagt metaphor: the network as a road. A wide data lane with big trucks, and the thin signalling lane where USSD rides. { at, hl } */
T3.lanes = (a, b, o) => shot3(a, b, Object.assign({ pal: 'network' }, o), (S, u, pal) => {
  S.add(GL.ground({ color: '#05081a', size: 160 })); const road = GL.mesh(new T.PlaneGeometry(80, 7), GL.M.matte('#141a33', .7), { cast: false, rot: [-Math.PI / 2, 0, 0], pos: [0, .01, 0] }); S.scene.add(road);
  const sig = GL.mesh(new T.PlaneGeometry(80, 1.2), new T.MeshStandardMaterial({ color: '#0a1a14', emissive: pal.acc, emissiveIntensity: .25 }), { cast: false, rot: [-Math.PI / 2, 0, 0], pos: [0, .02, 3.1] }); S.scene.add(sig);
  for (let i = -40; i < 40; i += 3) { S.scene.add(GL.mesh(new T.PlaneGeometry(1.4, .12), GL.M.basic('#5a6390'), { cast: false, rot: [-Math.PI / 2, 0, 0], pos: [i, .02, 0] })); }
  const trucks = []; for (let i = 0; i < 7; i++) { const g = new T.Group(); g.add(GL.mesh(GL.rbox(3.2, 1.3, 1.5, .15, 3), GL.M.plastic(['#4f7dff', '#ff5fa2', '#ffb03b', '#7a5cff'][i % 4], .4), { pos: [0, .9, 0] })); g.add(GL.mesh(GL.rbox(1, 1, 1.5, .12, 3), GL.M.plastic('#e9eef5', .4), { pos: [2.1, .75, 0] })); const lb = GL.label(['VIDEO', 'PHOTOS', 'APPS', 'MAPS'][i % 4], { size: 60, world: .5, bg: null }); lb.position.set(0, 1.0, .77); g.add(lb); g.position.set(-30 + i * 9, 0, i % 2 ? -1.6 : 1.4); S.scene.add(g); trucks.push(g); }
  const pk = []; for (let i = 0; i < 12; i++) { const m = GL.orb(pal.acc, .14, 4); m.group.position.set(-30 + i * 5, .4, 3.1); S.add(m); pk.push(m.group); }
  const l1 = pin2d(u, 'DATA LANES', '#7a5cff', 44), l2 = pin2d(u, 'SIGNALLING LANE: CALL SET-UP + USSD', pal.acc, 44); return { trucks, pk, l1, l2 };
}, (s, lt, t) => { s.trucks.forEach((g, i) => { g.position.x = ((-30 + i * 9 + t * (i % 2 ? 4 : 5.5)) % 63 + 63) % 63 - 31; }); s.pk.forEach((g, i) => { g.position.x = ((-30 + i * 5 + t * 9) % 60 + 60) % 60 - 30; });
  const k = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(-6, -2, k), lerp(6.5, 5, k), lerp(13, 11, k)); s.S.cam.lookAt(2, 0, 1); GL.drift(s.S.cam, t, .03);
  const [x1, y1] = GL.toScreen(s.S, V3(-2, 0, -1.5)); const [x2, y2] = GL.toScreen(s.S, V3(4, 0, 3.4)); P(s.l1, { x: x1, y: y1 - 120, o: prog(t, a + .3, a + .6) }); P(s.l2, { x: x2, y: y2 + 70, o: prog(t, o.at ?? a + 1, (o.at ?? a + 1) + .3) }); });

/** three things on pedestals: { items: [{prop, opts, label, at, col, scale}] } */
T3.trio = (a, b, o) => shot3(a, b, o, (S, u, pal) => {
  S.add(floor(pal)); const n = o.items.length, gap = o.gap || 3.4;
  const xs = o.items.map((it, i) => { const x = (i - (n - 1) / 2) * gap; const p = prop(it.prop, Object.assign({}, it.opts || {}), pal); p.group.position.x = x; if (it.y !== undefined) p.group.position.y = it.y; S.add(p);
    S.scene.add(GL.mesh(new T.CylinderGeometry(1.35, 1.45, .2, 48), GL.M.matte('#0d0f13', .4), { pos: [x, .1, 0] })); S.scene.add(GL.mesh(new T.TorusGeometry(1.4, .02, 8, 80), GL.M.glow(it.col || pal.acc, 2.5), { cast: false, pos: [x, .21, 0], rot: [Math.PI / 2, 0, 0] }));
    const lab = big(u, it.label, { size: it.labelSize || 46, ls: '.05em', color: it.col || pal.acc }); if (it.at) cue(it.at, 'pop', .4); return { it, p, x, lab }; });
  return { xs };
}, (s, lt, t) => { s.xs.forEach(X => { const at = X.it.at ?? a + .2; const q = E.outB(prog(t, at, at + .5)); X.p.group.scale.setScalar(Math.max(.001, q * (X.it.scale || 1))); X.p.group.rotation.y = .3 * Math.sin(t * .5 + X.x); if (X.p.blink) X.p.blink(t); if (X.p.set) X.p.set(t); if (X.p.press) X.p.press({});
    if (X.p.draw && X.it.screen) X.p.draw((g, w, h) => (X.it.prop === 'smart' ? GL.popupScreen : GL.lcdScreen)(g, w, h, X.it.screen), 'static');
    const [x, y] = GL.toScreen(s.S, V3(X.x, X.it.top ?? 0, X.it.top !== undefined ? 0 : 1.5)); P(X.lab, { x, y: y + (X.it.top !== undefined ? -50 : 70), o: E.outC(prog(t, at + .2, at + .5)) }); });
  const k = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(-1, 1, k), lerp(3.4, 3, k), lerp(11, 9.8, k)); s.S.cam.lookAt(0, 1.4, 0); GL.drift(s.S.cam, t, .03); });

/** Fluxr app screens (canvas, our own drawing of the app's flow): mode 'home' | 'redeem' | 'airtime'; k = 0..1 progress inside the mode */
function appScreen(g, w, h, mode, k) {
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#0f3d2e'); bg.addColorStop(1, '#06170f'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff'; g.font = `600 ${w * .045}px "Barlow"`; g.textBaseline = 'middle'; g.fillText('09:41', w * .07, h * .03);
  if (GL.TEX.fluxr && GL.TEX.fluxr.image) { const im = GL.TEX.fluxr.image; const lw = w * .34; g.drawImage(im, w * .07, h * .065, lw, lw * im.height / im.width); }
  const card = (y, hh, col) => { g.fillStyle = col; GL.rr(g, w * .07, y, w * .86, hh, w * .04); g.fill(); };
  if (mode === 'home') { card(h * .14, h * .17, '#85ed70'); g.fillStyle = '#0d372b'; g.font = `700 ${w * .05}px "Barlow"`; g.fillText('Wallet balance', w * .12, h * .18); g.font = `800 ${w * .13}px "Barlow Condensed"`; g.fillText('R ' + (250 * E.outC(clamp(k * 2))).toFixed(2), w * .12, h * .255);
    const tiles = [['Airtime', '#4fa3ff'], ['Data', '#ffb347'], ['Electricity', '#ffd23a'], ['Redeem voucher', '#ff7ad9']]; tiles.forEach(([tt, c], i) => { const x = w * (.07 + (i % 2) * .44), y = h * (.36 + Math.floor(i / 2) * .16); const on = k > .45 + i * .12 && k < .55 + i * .12; g.fillStyle = on ? '#ffffff' : 'rgba(255,255,255,.08)'; GL.rr(g, x, y, w * .42, h * .14, w * .04); g.fill(); g.fillStyle = c; g.beginPath(); g.arc(x + w * .1, y + h * .05, w * .05, 0, 7); g.fill(); g.fillStyle = on ? '#0d372b' : '#fff'; g.font = `700 ${w * .052}px "Barlow"`; g.fillText(tt, x + w * .04, y + h * .105, w * .36); }); }
  else if (mode === 'redeem') { g.fillStyle = '#fff'; g.font = `800 ${w * .08}px "Barlow Condensed"`; g.fillText('Redeem a voucher', w * .07, h * .17); card(h * .23, h * .1, 'rgba(255,255,255,.1)'); g.fillStyle = '#fff'; g.font = `700 ${w * .07}px "Barlow"`; const pin = '1234 5678 9012 3456'.slice(0, Math.round(clamp(k * 1.6) * 19)); g.fillText(pin + (k < .62 ? '|' : ''), w * .12, h * .28);
    g.fillStyle = k > .7 ? '#85ed70' : 'rgba(133,237,112,.4)'; GL.rr(g, w * .07, h * .38, w * .86, h * .08, w * .04); g.fill(); g.fillStyle = '#0d372b'; g.font = `800 ${w * .06}px "Barlow"`; g.fillText('Redeem', w * .4, h * .42);
    if (k > .78) { const q = E.outB(clamp((k - .78) / .15)); g.save(); g.globalAlpha = q; card(h * .52, h * .14, '#ffffff'); g.fillStyle = '#0a7d3b'; g.font = `800 ${w * .06}px "Barlow"`; g.fillText('Credit in your wallet', w * .12, h * .59); g.restore(); } }
  else { g.fillStyle = '#fff'; g.font = `800 ${w * .08}px "Barlow Condensed"`; g.fillText('Buy airtime', w * .07, h * .17); const rows = [['Network', 'Econet · Zimbabwe'], ['Number', '+263 77 ••• ••••'], ['Amount', 'US$ 5']]; rows.forEach(([l, v], i) => { card(h * (.23 + i * .11), h * .09, 'rgba(255,255,255,.08)'); g.fillStyle = 'rgba(255,255,255,.65)'; g.font = `600 ${w * .045}px "Barlow"`; g.fillText(l, w * .11, h * (.255 + i * .11)); g.fillStyle = '#fff'; g.font = `700 ${w * .055}px "Barlow"`; g.fillText(v, w * .11, h * (.29 + i * .11), w * .78); });
    g.fillStyle = k > .55 ? '#85ed70' : 'rgba(133,237,112,.4)'; GL.rr(g, w * .07, h * .6, w * .86, h * .08, w * .04); g.fill(); g.fillStyle = '#0d372b'; g.font = `800 ${w * .06}px "Barlow"`; g.fillText('Send', w * .43, h * .64);
    if (k > .7) { const q = E.outB(clamp((k - .7) / .15)); g.save(); g.globalAlpha = q; g.fillStyle = '#85ed70'; g.beginPath(); g.arc(w / 2, h * .8, w * .1 * q, 0, 7); g.fill(); g.strokeStyle = '#0d372b'; g.lineWidth = w * .02; g.beginPath(); g.moveTo(w * .45, h * .8); g.lineTo(w * .49, h * .825); g.lineTo(w * .56, h * .775); g.stroke(); g.restore(); } }
}
/** smartphone with the Fluxr app: { modes: [[t, 'home'], [t, 'redeem'], [t, 'airtime']], cam } */
T3.app = (a, b, o) => T3.phone(a, b, Object.assign({ smart: true, pal: 'brand', cam: o.cam || 'left', phoneOpts: { resW: 540, resH: 1080 } }, o, { screen: null }), null);
const _phone = T3.phone; T3.phone = (a, b, o) => { if (o.smart && o.modes) { const modes = o.modes; o = Object.assign({}, o); o.screenFn = (g, w, h, t) => { let cur = modes[0]; modes.forEach(m => { if (t >= m[0]) cur = m; }); const nx = modes[modes.indexOf(cur) + 1]; const k = prog(t, cur[0], nx ? nx[0] : b); appScreen(g, w, h, cur[1], k); }; } return _phone(a, b, o); };

/** a row of 3D voucher cards from logo textures, dealt on time, never overlapping: { cards: [{tex, at}], kicker } */
T3.vouchers = (a, b, o) => shot3(a, b, Object.assign({ pal: 'brand' }, o), (S, u, pal) => {
  S.add(floor(pal, { gridA: .3 })); S.exposure = .8; S.bloom = [.18, .35, .97]; const n = o.cards.length; const cards = o.cards.map((cd, i) => { const tx = GL.TEX[cd.tex]; const ar = tx && tx.image ? tx.image.width / tx.image.height : 2; const w = 1.9, h = Math.min(1.2, w / ar + .3);
    const face = GL.canvasTex(512, Math.round(512 * h / w), (c, cw, ch) => { c.fillStyle = '#ffffff'; GL.rr(c, 0, 0, cw, ch, 36); c.fill(); if (tx && tx.image) { const iw = cw * .8, ih = iw / ar; const s2 = Math.min(1, (ch * .8) / ih); c.drawImage(tx.image, (cw - iw * s2) / 2, (ch - ih * s2) / 2, iw * s2, ih * s2); } });
    const m = GL.mesh(GL.rbox(w, h, .06, .08, 3), [GL.M.matte('#fff'), GL.M.matte('#fff'), GL.M.matte('#fff'), GL.M.matte('#fff'), new T.MeshStandardMaterial({ map: face.tex, roughness: .5 }), GL.M.matte('#e8e8e8')]); S.scene.add(m); cue(cd.at, 'paper', .5); return { cd, m, w }; });
  return { cards };
}, (s, lt, t) => { const gap = 2.15; const n = s.cards.length; s.cards.forEach((C2, i) => { const q = E.outC(prog(t, C2.cd.at - .35, C2.cd.at + .25)); const x = (i - (n - 1) / 2) * gap; C2.m.position.set(lerp(x + 2, x, q), 1.6 + (1 - q) * -2.5 + .05 * Math.sin(t * 1.3 + i), (1 - q) * 2); C2.m.rotation.set(-.08, (1 - q) * 1.6 + .08 * Math.sin(t * .7 + i), 0); C2.m.visible = q > .001; });
  const k = E.ioS(prog(t, a, b + .35)); const far = s.cards.length > 3 ? 1.28 : 1; s.S.cam.position.set(lerp(-.6, .6, k), 2.3, lerp(8.6, 7.8, k) * far); s.S.cam.lookAt(0, 1.55, 0); GL.drift(s.S.cam, t, .02); });

/** the Fluxr logo in light: { tex: 'fluxr', line: html, at } */
T3.logo = (a, b, o) => shot3(a, b, Object.assign({ pal: 'brand' }, o), (S, u, pal) => {
  S.add(floor(pal, { gridA: .5 })); const tx = GL.TEX[o.tex || 'fluxr']; const ar = tx && tx.image ? tx.image.width / tx.image.height : 3;
  const m = GL.mesh(new T.PlaneGeometry(4.6, 4.6 / ar), new T.MeshBasicMaterial({ map: tx, transparent: true, toneMapped: false, color: new T.Color(1.6, 1.6, 1.6) }), { cast: false }); m.position.set(0, 2, 0); S.scene.add(m);
  const ring = GL.waves(pal.acc, 3, { maxR: 5, facing: 'camera', thick: .03 }); ring.group.position.set(0, 2, -.2); S.add(ring); const dust = GL.dust({ n: 260, box: [20, 8, 14], color: pal.acc, alpha: .45 }); S.add(dust);
  const line = o.line ? hl(u, o.line, 60, pal) : null; cue(o.at ?? a + .2, 'impact', .4); return { m, ring, dust, line };
}, (s, lt, t) => { const at = o.at ?? a + .2; const q = E.outB(prog(t, at, at + .6)); s.m.scale.setScalar(Math.max(.001, q)); s.m.rotation.y = .1 * Math.sin(t * .6); s.ring.set(t - at, .6); s.dust.set(t);
  if (s.line) { s.line.set(t, at + .5, .4); P(s.line.el, { x: 960, y: 820, o: prog(t, at + .4, at + .7) }); }
  const k = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(0, lerp(2.4, 2.1, k), lerp(7.5, 6.4, k)); s.S.cam.lookAt(0, 1.9, 0); GL.drift(s.S.cam, t, .02); });

/** phones of every kind lined up, all dialling: { stamps: [{html, at}], codeAt } */
T3.lineup = (a, b, o) => shot3(a, b, o, (S, u, pal) => {
  S.add(floor(pal)); const ph = []; const kinds = ['feature', 'smart', 'feature', 'smart', 'feature']; const cols = ['#262b33', '#3a2a4a', '#8a2b2b', '#1f3a5a', '#2b4a33'];
  kinds.forEach((kd, i) => { const p = kd === 'smart' ? GL.smartphone({ frame: cols[i], resW: 360, resH: 720 }) : GL.featurePhone({ color: cols[i], res: 360 }); p.group.position.set((i - 2) * 1.9, 1.45, -Math.abs(i - 2) * .6); p.group.scale.setScalar(.82); S.add(p); ph.push({ p, kd }); });
  const stamps = (o.stamps || []).map(st => ({ st, e: big(u, st.html, { size: st.size || 86, color: st.color || pal.acc }) })); stamps.forEach(x => cue(x.st.at, 'stamp', .4));
  return { ph, stamps };
}, (s, lt, t) => { const on = t > (o.codeAt ?? a + .4); s.ph.forEach(({ p, kd }, i) => { const st = on ? { lines: ['1 Balance', '2 Buy bundle', '3 Send money'], title: 'MENU' } : { input: '*120#', soft: ['', 'Call'] };
    p.draw((g, w, h) => kd === 'smart' ? GL.popupScreen(g, w, h, on ? { lines: ['MENU', '1 Balance', '2 Buy bundle', '3 Send money'], input: '' } : {}) : GL.lcdScreen(g, w, h, st), String(on)); if (p.press) p.press({}); p.group.rotation.y = .25 * Math.sin(t * .6 + i); p.group.position.y = 1.45 + .06 * Math.sin(t * 1.4 + i); });
  s.stamps.forEach(({ st, e }, i) => { const q = E.outB(prog(t, st.at, st.at + .3)); P(e, { x: st.x ?? 960, y: st.y ?? (150 + i * 105), o: q, s: 1.25 - .25 * q, r: st.r ?? -3 }); });
  const k = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(-1.2, 1.2, k), lerp(2.6, 2.3, k), 8); s.S.cam.position.z = lerp(8.2, 7.2, k); s.S.cam.lookAt(0, 1.95, 0); GL.drift(s.S.cam, t, .02); });

C.T3 = T3; C.T3.PAL = PAL; C.T3.appScreen = appScreen; C.T3.helpers = { shot3, big, pin2d, hl, tag, floor, prop, PROPS, once };
})();
