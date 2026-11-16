/* Money From Zero main06: The repo rate explained (how-to). Look v4 (engine README): lit 3D sets, one palette per chapter
   with the channel gold as the accent, one hero subject per shot, big rare type, receipts, stamp words, the camera always moving.
   Voice = voice_master.m4a (words_all.json, LEAD 0). Naledi (an illustration) is the person we follow.
   Hand-made sets for this video (below): Naledi's street, the Reserve Bank at night, the three-stop rate journey, the rate
   staircase, the brake/truck metaphor, the inflation dial, the car on a pedestal, the savings jar, the lopsided scale, the
   MPC calendar, the bond statement, the card under its legal ceiling, the 240 months of a bond, the committee table. */
const C = CINE; const T3 = C.T3; const GL = C.GL; const T = GL.T; const { shot, cue, E, prog, clamp, lerp, el, P } = C;
const H = T3.helpers; const { shot3, big, pin2d, floor, once } = H;
const BASE = window.SCENE.replace(/[^/]+$/, '');
const V = C.voice(C.loadJSON(BASE + 'words_all.json'), 0);
function N(txt, near) { const k = txt.toLowerCase().replace(/[^a-z0-9#* ]/g, '').split(' '); const W = V.words; let best = null;
  for (let i = 0; i < W.length; i++) { let ok = true; for (let j = 0; j < k.length; j++) if (!W[i + j] || W[i + j].w !== k[j]) { ok = false; break; } if (ok && (best === null || Math.abs(W[i].a - near) < Math.abs(best - near))) best = W[i].a; }
  if (best === null || Math.abs(best - near) > 3) console.error('N miss: ' + txt + ' @' + near + ' -> ' + best); return best ?? near; }
const X = (txt, near) => N(txt, near) - .12;
C.setTheme('mfz'); const GOLD = '#f7be33', GREEN = '#2fd27f', RED = '#ff5d5d', CYAN = '#4ff0ff', PINK = '#ff7fa8', INK = '#f4eedf';
const END = V.end;
window.META = { music: { style: 'doc', drop: 71.5, end: END + 2.5, breaks: [] } };
C.initFX({ grain: 0, vignette: 0 }); GL.noCssFx();
el('div', { class: 'bug' }, C.stage, `<span class="z">0</span>MONEY FROM ZERO`);
const V3 = (x, y, z) => new T.Vector3(x, y, z);
// Money From Zero palettes: the engine palettes with the channel gold as the main accent
const PALX = { acc: GOLD };
const pal = name => ({ pal: name, palx: Object.assign({}, PALX) });
const R = v => 'R' + Math.round(v).toLocaleString('en-ZA').replace(/[\s, ]/g, ' ');
const S0 = '<span style="color:' + GOLD + '">';

/** a 2D counter that rolls between values at times: keys [[t, value]] */
function rollAt(t, keys) { let v = keys[0][1]; for (let i = 1; i < keys.length; i++) { const [t1, v1] = keys[i]; const v0 = keys[i - 1][1]; if (t >= t1 - .6) v = lerp(v0, v1, E.ioC(prog(t, t1 - .6, t1 + .4))); } return v; }

// ---------------- props made for this video ----------------
function car(col = '#d9483b') { const g = new T.Group(); const body = GL.M.plastic(col, .3);
  g.add(GL.mesh(GL.rbox(3.6, .7, 1.7, .25, 4), body, { pos: [0, .65, 0] }));
  g.add(GL.mesh(GL.rbox(2.0, .62, 1.5, .25, 4), body, { pos: [-.2, 1.25, 0] }));
  g.add(GL.mesh(GL.rbox(1.86, .46, 1.52, .18, 3), GL.M.glass('#9fd7ff'), { pos: [-.2, 1.27, 0] }));
  const wheels = []; [[-1.15, .82], [1.15, .82], [-1.15, -.82], [1.15, -.82]].forEach(([x, z]) => { const w = GL.mesh(new T.CylinderGeometry(.36, .36, .26, 24), GL.M.matte('#15171b', .6), { pos: [x, .36, z], rot: [Math.PI / 2, 0, 0] }); g.add(w); wheels.push(w);
    g.add(GL.mesh(new T.CylinderGeometry(.18, .18, .27, 16), GL.M.metal('#c9ced6', .3), { pos: [x, .36, z], rot: [Math.PI / 2, 0, 0] })); });
  [-.55, .55].forEach(z => g.add(GL.mesh(GL.rbox(.06, .14, .3, .03, 2), GL.M.glow('#fff4d0', 2.2), { cast: false, pos: [1.81, .75, z] })));
  [-.55, .55].forEach(z => g.add(GL.mesh(GL.rbox(.06, .12, .3, .03, 2), GL.M.glow('#ff3030', 2.2), { cast: false, pos: [-1.81, .78, z] })));
  return { group: g, wheels, spin(a) { wheels.forEach(w => { w.rotation.y = a; }); } }; }
function truck(col = '#2f6fd6') { const g = new T.Group();
  g.add(GL.mesh(GL.rbox(4.6, 2.1, 2.0, .15, 3), GL.M.plastic('#e9eef5', .4), { pos: [-.9, 1.6, 0] }));
  g.add(GL.mesh(GL.rbox(1.7, 1.7, 2.0, .2, 3), GL.M.plastic(col, .35), { pos: [2.3, 1.35, 0] }));
  g.add(GL.mesh(GL.rbox(.1, .8, 1.7, .05, 2), GL.M.glass(), { pos: [3.16, 1.65, 0] }));
  const lb = GL.label('THE ECONOMY', { size: 80, world: .55, bg: null, color: '#1b2a44' }); lb.position.set(-.9, 1.7, 1.02); g.add(lb);
  const wheels = []; [-2.6, -1.6, 2.4].forEach(x => [-.95, .95].forEach(z => { const w = GL.mesh(new T.CylinderGeometry(.45, .45, .3, 24), GL.M.matte('#15171b'), { pos: [x, .45, z], rot: [Math.PI / 2, 0, 0] }); g.add(w); wheels.push(w); }));
  const brake = []; [-.7, .7].forEach(z => { const m = GL.mesh(GL.rbox(.06, .2, .3, .03, 2), GL.M.glow('#ff2a2a', 0), { cast: false, pos: [-3.22, .9, z] }); g.add(m); brake.push(m); });
  return { group: g, wheels, brake }; }
function jar() { const g = new T.Group(); g.add(GL.mesh(new T.CylinderGeometry(1.0, 1.0, 2.0, 40, 1, true), new T.MeshPhysicalMaterial({ color: '#cfefff', roughness: .05, transparent: true, opacity: .22, side: T.DoubleSide, clearcoat: 1 }), { cast: false, pos: [0, 1.0, 0] }));
  g.add(GL.mesh(new T.CylinderGeometry(1.05, 1.05, .22, 40), GL.M.metal('#c9a23a', .3), { pos: [0, 2.1, 0] })); g.add(GL.mesh(new T.CylinderGeometry(1.0, 1.0, .06, 40), GL.M.matte('#9fb7c4'), { pos: [0, .03, 0] })); return { group: g }; }
function cardMesh(col = '#1d2a4a', label = 'CREDIT CARD') { const g = new T.Group(); const face = GL.canvasTex(860, 540, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, col); gr.addColorStop(1, '#0b1020'); c.fillStyle = gr; GL.rr(c, 0, 0, w, h, 46); c.fill();
    c.fillStyle = '#e2c26a'; GL.rr(c, 70, 170, 120, 90, 14); c.fill(); c.fillStyle = 'rgba(255,255,255,.85)'; c.font = '700 54px "Barlow"'; c.fillText('5326  ••••  ••••  2026', 70, 380); c.font = '800 44px "Barlow Condensed"'; c.fillStyle = GOLD; c.fillText(label, 70, 110); c.fillStyle = 'rgba(255,255,255,.6)'; c.font = '600 34px "Barlow"'; c.fillText('N. MOKOENA', 70, 470); });
  const m = GL.mesh(GL.rbox(3.4, 2.14, .06, .14, 3), [GL.M.matte('#0b1020'), GL.M.matte('#0b1020'), GL.M.matte('#0b1020'), GL.M.matte('#0b1020'), new T.MeshPhysicalMaterial({ map: face.tex, roughness: .3, clearcoat: 1 }), GL.M.matte('#0b1020')]); g.add(m); return { group: g }; }
function person(col, skin, o) { return H.PROPS.person(Object.assign({ col, skin }, o || {})); }
const NALEDI = { col: '#e4572e', skin: '#6b3f26', hairCol: '#1a1210', legs: '#1d3557' };

// ---------------- hand-made shots ----------------
/** Naledi's street at dusk: a row of houses, hers in front with lit windows; o.meter: {keys:[[t,v]], at, label}; o.cam: 'wide'|'door'|'high'; o.keysAt: keys glint */
function street(a, b, o) { return shot3(a, b, Object.assign(pal(o.pal || 'dawn'), o), (S, u, pal) => {
  S.add(GL.ground({ color: '#1a1d33', size: 140 })); const road = GL.mesh(new T.PlaneGeometry(80, 3.2), GL.M.matte('#20243a', .8), { cast: false, rot: [-Math.PI / 2, 0, 0], pos: [0, .01, 3.2] }); S.scene.add(road);
  for (let i = -20; i < 20; i += 2) S.scene.add(GL.mesh(new T.PlaneGeometry(1, .1), GL.M.basic('#8a8fb0'), { cast: false, rot: [-Math.PI / 2, 0, 0], pos: [i, .02, 3.2] }));
  const walls = ['#e9dcc5', '#d8c3a0', '#f0e6d2', '#c9d6e3', '#e3c9c0']; const roofs = ['#a8432f', '#6b4a3a', '#8a8f96', '#b5652f', '#4a5a7a'];
  for (let i = -4; i <= 4; i++) { if (i === 0) continue; const h = GL.house({ wall: walls[(i + 9) % 5], roof: roofs[(i + 7) % 5], night: true, w: 2.4, d: 2 }); h.group.position.set(i * 3.1, 0, -.6 - Math.abs(i) * .15); S.add(h);
    const tr = GL.tree({ leaf: ['#2f5d3a', '#3d6b2f'][i & 1], h: 1.3, r: .7 }); tr.position.set(i * 3.1 + 1.5, 0, .9); S.scene.add(tr); }
  const hero = GL.house({ wall: '#f4ead8', roof: '#c0502f', night: true, w: 2.8, d: 2.2, h: 1.5 }); hero.group.position.set(0, 0, .2); S.add(hero);
  const lamp = new T.PointLight('#ffcf8a', 6, 7); lamp.position.set(.4, 1.4, 2.2); S.scene.add(lamp);
  const n = person(NALEDI.col, NALEDI.skin, NALEDI); n.group.scale.setScalar(.95); n.group.position.set(.9, 0, 1.75); n.group.rotation.y = -.3; S.add(n);
  const key = GL.mesh(new T.TorusGeometry(.06, .02, 8, 20), GL.M.gold(), { pos: [1.22, .9, 1.9] }); S.scene.add(key);
  const dust = GL.dust({ n: 200, box: [24, 8, 14], color: '#ffd9a0', alpha: .25 }); S.add(dust);
  const sky = GL.mesh(new T.SphereGeometry(2.4, 32, 20), GL.M.basic('#ffd7a0', { fog: false }), { cast: false, pos: [-12, 8, -40] }); S.scene.add(sky);
  const meter = o.meter ? big(u, '', { size: o.meter.size || 150, color: '#fff' }) : null; const mlab = o.meter && o.meter.label ? big(u, o.meter.label, { size: 44, ls: '.08em', color: GOLD }) : null;
  const tags = (o.tags || []).map(tg => ({ tg, e: pin2d(u, tg.text, tg.col || GOLD, tg.size || 40) })); tags.forEach(x => cue(x.tg.at, 'pop', .4));
  if (o.meter) (o.meter.keys || []).slice(1).forEach(([t]) => cue(t - .5, 'tick', .4));
  return { hero, n, key, dust, meter, mlab, tags };
}, (s, lt, t) => { s.dust.set(t); s.key.rotation.y = t * 2; s.key.visible = t < (o.keysOff ?? 1e9);
  const k = E.ioS(prog(t, a, b + .35)); const cams = { wide: [[-7, 3.6, 13], [0, 1.2, 0], [-4, 3.0, 11], [0, 1.3, 0]], door: [[4.6, 2.2, 8.4], [.4, 1.2, 1.0], [3.4, 1.9, 6.8], [.5, 1.2, 1.0]], high: [[0, 9, 10], [0, .5, 0], [2, 7.5, 8.5], [0, .8, 0]], roof: [[-2.5, 2.2, 8], [0, 2.4, 0], [-1, 2.6, 6.8], [0, 2.6, 0]] }[o.cam || 'wide'];
  s.S.cam.position.set(...cams[0].map((v, i) => lerp(v, cams[2][i], k))); s.S.cam.lookAt(...cams[1].map((v, i) => lerp(v, cams[3][i], k))); GL.drift(s.S.cam, t, .03);
  if (s.meter) { const v = rollAt(t, o.meter.keys); s.meter.innerHTML = (o.meter.fmt ? o.meter.fmt(v) : R(v)) + (o.meter.unit || ''); const q = E.outB(prog(t, o.meter.at ?? a + .2, (o.meter.at ?? a + .2) + .5)); P(s.meter, { x: o.meter.x ?? 960, y: o.meter.y ?? 250, o: q, s: .85 + .15 * q }); if (s.mlab) P(s.mlab, { x: o.meter.x ?? 960, y: (o.meter.y ?? 250) + 110, o: q }); }
  s.tags.forEach(({ tg, e }) => { const q = E.outB(prog(t, tg.at, tg.at + .35)); P(e, { x: tg.x ?? 1400, y: tg.y ?? 700, o: q, s: .85 + .15 * q }); });
}); }

/** the Reserve Bank at night (a generic central-bank building), a 3D rate number rising over it: o.rates [[t, '7.25%']] */
function sarb(a, b, o) { return shot3(a, b, Object.assign(pal(o.pal || 'night'), o), (S, u, pal) => {
  S.add(floor(pal, { gridA: .25 })); const bk = GL.bank({ label: 'RESERVE BANK', w: 7, d: 3.6, cols: 8 }); bk.group.position.set(0, 0, -1); S.add(bk);
  for (let i = -1; i <= 1; i += 2) { const tw = new T.Mesh(new T.BoxGeometry(2.2, 9, 2.2), GL.M.matte('#151a33', .8)); tw.position.set(i * 7, 4.5, -6); S.scene.add(tw); for (let r = 0; r < 8; r++) S.scene.add(GL.mesh(new T.PlaneGeometry(1.6, .25), GL.M.glow(r % 3 ? '#ffd27a' : '#4a5a9a', .8), { cast: false, pos: [i * 7, 1 + r, -4.89] })); }
  const sp = new T.SpotLight(GOLD, 120, 26, .45, .5); sp.position.set(0, 9, 6); sp.target.position.set(0, 2, -1); S.scene.add(sp); S.scene.add(sp.target);
  const rates = (o.rates || []).map(([at, txt, col]) => { const m = GL.text3d(txt, { size: 1.25, depth: .4, color: col || GOLD, side: '#6a4a10', emissive: col || GOLD, ei: .15 }); m.position.set(0, 6.2, -1); S.scene.add(m); cue(at, 'impact', .4); return { at, m }; });
  const dust = GL.dust({ n: 260, box: [24, 10, 16], color: GOLD, alpha: .3 }); S.add(dust);
  const side = o.side ? big(u, o.side.html, { size: o.side.size || 110 }) : null; return { rates, dust, side };
}, (s, lt, t) => { s.dust.set(t); s.rates.forEach((r, i) => { const nx = s.rates[i + 1]; const q = E.outB(prog(t, r.at, r.at + .6)) * (nx ? 1 - E.inC(prog(t, nx.at - .3, nx.at)) : 1); r.m.scale.setScalar(Math.max(.001, q)); r.m.position.y = 6.2 + (1 - q) * -1.5 + .08 * Math.sin(t); r.m.rotation.y = .15 * Math.sin(t * .5); r.m.visible = q > .002; });
  const k = E.ioS(prog(t, a, b + .35)); const c = o.cam === 'low' ? [[-3, 1, 11], [0, 4.2, -1], [2, 1.4, 9], [0, 4.6, -1]] : [[-5, 4, 15], [0, 3.6, -1], [-2, 3.4, 12], [0, 4.2, -1]];
  s.S.cam.position.set(...c[0].map((v, i) => lerp(v, c[2][i], k))); s.S.cam.lookAt(...c[1].map((v, i) => lerp(v, c[3][i], k))); GL.drift(s.S.cam, t, .03);
  if (s.side) P(s.side, { x: o.side.x ?? 960, y: o.side.y ?? 930, o: E.outQu(prog(t, o.side.at ?? a + .3, (o.side.at ?? a + .3) + .5)) });
}); }

/** the three stops: Reserve Bank -> your bank -> you. o.hits [[t, node]], labels per node shown when reached */
const STOPS = [{ x: -7, name: 'RESERVE BANK' }, { x: 0, name: 'YOUR BANK' }, { x: 7, name: 'YOU' }];
function journey(a, b, o) { return shot3(a, b, Object.assign(pal(o.pal || 'network'), o), (S, u, pal) => {
  S.add(floor(pal, { gridA: .5 }));
  const b1 = GL.bank({ label: 'RESERVE BANK', w: 4.6, d: 2.6, cols: 6 }); b1.group.position.set(-7, 0, -1); S.add(b1);
  const b2 = GL.bank({ label: 'BANK', w: 3.4, d: 2.2, cols: 4, stone: '#c4ccd8' }); b2.group.position.set(0, 0, -1); b2.group.scale.setScalar(.9); S.add(b2);
  const hs = GL.house({ wall: '#f4ead8', roof: '#c0502f', night: true, w: 2.4, d: 2 }); hs.group.position.set(7, 0, -1); S.add(hs); const n = person(NALEDI.col, NALEDI.skin, NALEDI); n.group.position.set(8.5, 0, .4); n.group.rotation.y = -.5; S.add(n);
  const bm = GL.beam([[-7, 4.6, -1], [-3.5, 6.2, 0], [0, 3.9, -1], [3.5, 5.6, 0], [7, 2.8, -1]], { color: GOLD, r: .07, seg: 300 }); S.add(bm); const pk = GL.orb('#fff2c0', .2, 5); S.add(pk);
  const labs = STOPS.map((st, i) => { const L = (o.labels || [])[i]; return L ? { e: pin2d(u, L, i === 2 ? PINK : GOLD, 46), i } : null; }).filter(Boolean);
  const names = STOPS.map(st => big(u, st.name, { size: 40, ls: '.1em', color: 'rgba(255,255,255,.85)' }));
  (o.hits || []).forEach(([t]) => cue(t, 'bloop', .35)); const dust = GL.dust({ n: 260, box: [30, 8, 16], color: GOLD, alpha: .3 }); S.add(dust);
  return { bm, pk, labs, names, dust };
}, (s, lt, t) => { const hits = o.hits || [[a, 0]]; const fr = [0, .5, 1]; let pos = fr[hits[0][1]];
  for (let i = 0; i < hits.length; i++) { const [ht, nd] = hits[i]; if (t >= ht) pos = fr[nd]; if (i + 1 < hits.length && t >= ht && t < hits[i + 1][0]) { const [h2, n2] = hits[i + 1]; const st = h2 - Math.min(1.2, h2 - ht); pos = t < st ? fr[nd] : lerp(fr[nd], fr[n2], E.ioC(prog(t, st, h2))); } }
  s.bm.set(Math.max(pos, o.reveal || 0) + .001, pos, -1); s.pk.group.position.copy(s.bm.at(pos)); s.dust.set(t);
  const fc = o.focus ?? null; const k = E.ioS(prog(t, a, b + .35)); const fx = fc === null ? lerp(-7, 7, pos) * .55 : STOPS[fc].x;
  s.S.cam.position.set(fx + lerp(-1.2, 1.2, k), fc === null ? 7 : 5.4, fc === null ? 17 : 13); s.S.cam.lookAt(fx, 2.4, -1); GL.drift(s.S.cam, t, .03);
  s.labs.forEach(({ e, i }) => { const reached = hits.find(h => h[1] === i); const q = reached ? E.outB(prog(t, reached[0], reached[0] + .4)) : (o.showAll ? 1 : 0); const [x, y] = GL.toScreen(s.S, V3(STOPS[i].x, i === 2 ? 3.2 : 5.3, -1)); P(e, { x: clamp(x, 220, 1700), y: Math.max(y - 60, 230), o: q, s: .85 + .15 * q }); });
  s.names.forEach((e, i) => { const [x, y, vis] = GL.toScreen(s.S, V3(STOPS[i].x, 0, 1.6)); P(e, { x, y: Math.min(y + 20, 1010), o: vis && x > 60 && x < 1860 ? .9 : 0 }); });
}); }

/** the rate staircase: blocks stacked = repo, +3.5 = prime, + your deal / + a quarter. o.blocks [{h, col, label, at}] */
function stairs(a, b, o) { return shot3(a, b, Object.assign(pal(o.pal || 'network'), o), (S, u, pal) => {
  S.add(floor(pal, { gridA: .4 })); let y = 0; const bl = o.blocks.map((B, i) => { const h = B.h * .42; const m = GL.mesh(GL.rbox(2.6, h, 2.6, .08, 3), new T.MeshPhysicalMaterial({ color: B.col || GOLD, roughness: .25, clearcoat: 1, emissive: B.col || GOLD, emissiveIntensity: .12 }), { pos: [0, y + h / 2, 0] }); S.scene.add(m); const y0 = y; y += h;
    const lab = big(u, B.label, { size: B.size || 60, color: B.col || GOLD }); const sub = B.sub ? big(u, B.sub, { size: 38, weight: 700, font: 'Barlow', color: 'rgba(255,255,255,.85)' }) : null; cue(B.at, i ? 'thud' : 'whoosh_low', .4); return { B, m, h, y0, lab, sub }; });
  const tot = o.total ? big(u, o.total.html, { size: o.total.size || 150, color: '#fff' }) : null; return { bl, tot, top: y };
}, (s, lt, t) => { s.bl.forEach(X => { const q = E.outB(prog(t, X.B.at, X.B.at + .55)); X.m.position.y = X.y0 + X.h / 2 + (1 - q) * 4; X.m.visible = q > .01; X.m.rotation.y = .5 + .1 * Math.sin(t * .4);
    const [x, y] = GL.toScreen(s.S, V3(1.7, X.y0 + X.h / 2, 1.3)); P(X.lab, { x: x + 40, y: y - 36, o: q, anchor: 'tl' }); if (X.sub) P(X.sub, { x: x + 40, y: y + 34, o: q, anchor: 'tl' }); });
  if (s.tot) { const q = E.outB(prog(t, o.total.at, o.total.at + .5)); P(s.tot, { x: o.total.x ?? 560, y: o.total.y ?? 220, o: q, s: .85 + .15 * q }); }
  const k = E.ioS(prog(t, a, b + .35)); const hy = Math.max(2, s.top * .55); const far = Math.max(1, s.top / 4); s.S.cam.position.set(lerp(-5.5, -4.5, k) * far, hy + 2.2, lerp(11, 9.5, k) * far); s.S.cam.lookAt(1.6, hy, 0); GL.drift(s.S.cam, t, .03);
}); }

/** the brake metaphor: a truck ("the economy") on a road; o.brakeAt: brake lights + slowing; o.gauge {from, to, at, label} 2D speed dial */
function brake(a, b, o) { return shot3(a, b, Object.assign(pal(o.pal || 'sunset'), o), (S, u, pal) => {
  S.add(GL.ground({ color: '#2a1206', size: 160 })); S.scene.add(GL.mesh(new T.PlaneGeometry(200, 6), GL.M.matte('#1e1e26', .7), { cast: false, rot: [-Math.PI / 2, 0, 0], pos: [0, .01, 0] }));
  const dashes = []; for (let i = 0; i < 30; i++) { const m = GL.mesh(new T.PlaneGeometry(2, .16), GL.M.basic('#e8d7a8'), { cast: false, rot: [-Math.PI / 2, 0, 0], pos: [0, .02, 0] }); S.scene.add(m); dashes.push(m); }
  const tk = truck(); S.add(tk); const r = C.rnd(4); const props = []; for (let i = 0; i < 16; i++) { const tr = GL.tree({ acacia: true, leaf: '#3d5b2f', h: 1.2 + r() * .8, r: .7 }); tr.position.set(-60 + i * 8, 0, -6 - r() * 6); S.scene.add(tr); props.push(tr); }
  const gauge = o.gauge ? el('div', { class: 'abs' }, u, `<svg width="420" height="260" viewBox="-210 -210 420 260"><path d="M -180 0 A 180 180 0 0 1 180 0" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="26" stroke-linecap="round"/><path class="hot" d="M 127 -127 A 180 180 0 0 1 180 0" fill="none" stroke="${RED}" stroke-width="26" stroke-linecap="round"/><line class="nd" x1="0" y1="0" x2="0" y2="-160" stroke="#fff" stroke-width="10" stroke-linecap="round"/><circle r="18" fill="${GOLD}"/></svg><div style="font:800 46px 'Barlow Condensed';letter-spacing:.1em;color:${GOLD};text-align:center;margin-top:-10px">${o.gauge.label || 'PRICES'}</div>`) : null;
  const side = o.side ? big(u, o.side.html, { size: o.side.size || 110 }) : null; if (o.brakeAt) { cue(o.brakeAt, 'thud', .5); cue(o.brakeAt + .1, 'whoosh_low', .35); }
  return { tk, dashes, props, gauge, side, nd: gauge && gauge.querySelector('.nd') };
}, (s, lt, t) => { const ba = o.brakeAt ?? 1e9; const v = t < ba ? 1 : lerp(1, o.slow ?? .25, E.outC(prog(t, ba, ba + 2.4))); const dist = (t - a) * 9 * (t < ba ? 1 : 1) - Math.max(0, t - ba) * 9 * (1 - (o.slow ?? .25)) * .6;
  s.dashes.forEach((m, i) => { m.position.x = ((i * 4 - dist) % 120 + 120) % 120 - 60; }); s.props.forEach((m, i) => { m.position.x = ((-60 + i * 8 - dist * .9) % 128 + 128) % 128 - 64; });
  s.tk.wheels.forEach(w => { w.rotation.y = -dist * 2.2; }); s.tk.brake.forEach(m => { m.material.emissiveIntensity = t > ba ? 3 : 0; }); s.tk.group.position.y = .02 * Math.sin(t * 9 * v); s.tk.group.rotation.z = t > ba ? .03 * E.outC(prog(t, ba, ba + .4)) * (1 - prog(t, ba + .4, ba + 1.4)) : 0;
  const k = E.ioS(prog(t, a, b + .35)); const c = o.cam === 'rear' ? [[-11, 2.6, 5], [0, 1.4, 0], [-9, 2.2, 6], [0, 1.4, 0]] : [[2, 2.6, 11], [0, 1.6, 0], [-1.5, 2.2, 9.5], [0, 1.6, 0]]; s.S.cam.position.set(...c[0].map((q, i) => lerp(q, c[2][i], k))); s.S.cam.lookAt(...c[1].map((q, i) => lerp(q, c[3][i], k))); GL.drift(s.S.cam, t, .04);
  if (s.gauge) { const gv = lerp(o.gauge.from, o.gauge.to, E.ioC(prog(t, o.gauge.at ?? ba, (o.gauge.at ?? ba) + 2))); s.nd.setAttribute('transform', `rotate(${-90 + 180 * gv + 2 * Math.sin(t * 7)})`); P(s.gauge, { x: o.gauge.x ?? 1540, y: o.gauge.y ?? 260, o: prog(t, a + .1, a + .4) }); }
  if (s.side) P(s.side, { x: o.side.x ?? 960, y: o.side.y ?? 200, o: E.outQu(prog(t, o.side.at ?? a + .3, (o.side.at ?? a + .3) + .5)) });
}); }

/** inflation dial in 3D: a ring from 0 to 8%, the target band glowing; needle to o.value at o.at */
function dial(a, b, o) { return shot3(a, b, Object.assign(pal(o.pal || 'sunset'), o), (S, u, pal) => {
  S.add(floor(pal, { gridA: .3 })); const g = new T.Group(); g.position.set(0, 2.2, 0); S.scene.add(g); const MAX = 8, A0 = Math.PI * 1.15, SP = Math.PI * 1.3; const ang = v => A0 - SP * v / MAX;
  g.add(GL.mesh(new T.TorusGeometry(2.6, .16, 16, 120, SP), GL.M.matte('#3a2a24', .6), { rot: [0, 0, ang(MAX)] }));
  const band = GL.mesh(new T.TorusGeometry(2.6, .2, 16, 60, SP * 2 / MAX), GL.M.glow(GREEN, 2), { cast: false, rot: [0, 0, ang(4)] }); g.add(band);
  for (let v = 0; v <= MAX; v++) { const l = GL.label(v + '%', { size: 60, world: .36, bg: null, color: v >= 2 && v <= 4 ? GREEN : '#fff' }); l.position.set(Math.cos(ang(v)) * 3.25, Math.sin(ang(v)) * 3.25, 0); g.add(l); }
  const nd = new T.Group(); nd.add(GL.mesh(GL.rbox(.12, 2.3, .1, .05, 2), GL.M.plastic(GOLD, .3), { pos: [0, 1.15, .1] })); nd.add(GL.mesh(new T.CylinderGeometry(.3, .3, .2, 30), GL.M.metal('#cfd4da'), { rot: [Math.PI / 2, 0, 0], pos: [0, 0, .1] })); g.add(nd);
  const val = big(u, '', { size: 170, color: GOLD }); const lab = o.label ? big(u, o.label, { size: 48, ls: '.08em' }) : null; const tg = big(u, o.target || 'TARGET 3% ± 1', { size: 50, color: GREEN, ls: '.06em' }); cue(o.at ?? a + .4, 'swoosh_up', .4);
  return { nd, ang, val, lab, tg };
}, (s, lt, t) => { const at = o.at ?? a + .4; const v = lerp(o.from ?? 3, o.value, E.outB(prog(t, at, at + 1.2))) + .05 * Math.sin(t * 3); s.nd.rotation.z = s.ang(v) - Math.PI / 2;
  s.val.innerHTML = v.toFixed(1) + '%'; P(s.val, { x: 960, y: 830, o: prog(t, at, at + .3) }); if (s.lab) P(s.lab, { x: 960, y: 940, o: prog(t, at + .3, at + .6) }); P(s.tg, { x: o.tgx ?? 960, y: 110, o: prog(t, a + .2, a + .5) });
  const k = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(-1.4, 1.2, k), lerp(2.2, 2.5, k), lerp(8.6, 7.6, k)); s.S.cam.lookAt(0, 2.3, 0); GL.drift(s.S.cam, t, .03);
}); }

/** a car on a showroom pedestal, a price tag on a string: o.tag (2D html), o.keys rolling instalment */
function carShot(a, b, o) { return shot3(a, b, Object.assign(pal(o.pal || 'gold'), o), (S, u, pal) => {
  S.add(floor(pal, { gridA: .3 })); S.scene.add(GL.mesh(new T.CylinderGeometry(3.4, 3.6, .3, 64), GL.M.matte('#0d0f13', .4), { pos: [0, .15, 0] })); S.scene.add(GL.mesh(new T.TorusGeometry(3.5, .03, 8, 120), GL.M.glow(GOLD, 2.4), { cast: false, pos: [0, .31, 0], rot: [Math.PI / 2, 0, 0] }));
  const cr = car(o.col || '#d9483b'); cr.group.position.y = .3; S.add(cr); const sp = new T.SpotLight('#fff2d0', 90, 20, .5, .6); sp.position.set(0, 8, 3); sp.target.position.set(0, 1, 0); S.scene.add(sp); S.scene.add(sp.target);
  const meter = o.meter ? big(u, '', { size: o.meter.size || 130, color: '#fff' }) : null; const mlab = o.meter && o.meter.label ? big(u, o.meter.label, { size: 44, ls: '.08em', color: GOLD }) : null; if (o.meter) (o.meter.keys || []).slice(1).forEach(([t]) => cue(t - .5, 'tick', .4));
  const tag = o.tag ? pin2d(u, o.tag.text, GOLD, o.tag.size || 52) : null; if (o.tag) cue(o.tag.at, 'pop', .4); return { cr, meter, mlab, tag };
}, (s, lt, t) => { s.cr.group.rotation.y = (o.ry ?? .6) + t * .12;
  const k = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(-3, 1, k), lerp(2.6, 2.2, k), lerp(9, 7.6, k)); s.S.cam.lookAt(0, 1.2, 0); GL.drift(s.S.cam, t, .03);
  if (s.meter) { const v = rollAt(t, o.meter.keys); s.meter.innerHTML = R(v) + (o.meter.unit || ''); const q = E.outB(prog(t, o.meter.at ?? a + .2, (o.meter.at ?? a + .2) + .5)); P(s.meter, { x: o.meter.x ?? 960, y: o.meter.y ?? 190, o: q }); if (s.mlab) P(s.mlab, { x: o.meter.x ?? 960, y: (o.meter.y ?? 190) + 100, o: q }); }
  if (s.tag) { const q = E.outB(prog(t, o.tag.at, o.tag.at + .4)); P(s.tag, { x: o.tag.x ?? 960, y: o.tag.y ?? 900, o: q, s: .85 + .15 * q }); }
}); }

/** savings jar: coins drop in over time (o.coins [[t, n]]), a counter */
function jarShot(a, b, o) { return shot3(a, b, Object.assign(pal(o.pal || 'cyan'), o), (S, u, pal) => {
  S.add(floor(pal, { gridA: .3 })); const j = jar(); S.add(j); const coins = []; const r = C.rnd(9); for (let i = 0; i < 40; i++) { const c = GL.coin({ r: .32 }); c.userData = { x: (r() - .5) * 1.1, z: (r() - .5) * 1.1, y: .08 + Math.floor(i / 4) * .075, ry: r() * 6 }; S.scene.add(c); coins.push(c); }
  const nt = GL.note({ color: '#2f7d4f', value: 'R10 000' }); nt.scale.setScalar(1.3); nt.position.set(-3, 1.6, 0); S.scene.add(nt);
  const cnt = o.count ? big(u, '', { size: o.count.size || 140, color: GOLD }) : null; const lab = o.label ? big(u, o.label, { size: 46, ls: '.06em' }) : null; (o.drops || []).forEach(([t]) => cue(t, 'coin', .45));
  return { coins, nt, cnt, lab };
}, (s, lt, t) => { const base = o.base ?? 12; let n = base; (o.drops || []).forEach(([t0, k]) => { if (t > t0) n += k; });
  s.coins.forEach((c, i) => { const d = c.userData; let y = d.y; if (i >= base) { const drop = (o.drops || []).reduce((acc, [t0, k], j, arr) => { const st = base + arr.slice(0, j).reduce((x, q) => x + q[1], 0); return i >= st && i < st + k ? t0 + (i - st) * .12 : acc; }, 1e9); y = d.y + 4 * (1 - E.inQ(prog(t, drop - .5, drop))); c.visible = t > drop - .5; } c.position.set(d.x, y, d.z); c.rotation.y = d.ry + (i >= base ? t * 3 : 0); });
  s.nt.rotation.set(-.2, .5 + .2 * Math.sin(t * .6), .1 * Math.sin(t)); s.nt.position.y = 1.6 + .1 * Math.sin(t * 1.2);
  const k = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(1.6, -.4, k), lerp(3.2, 2.8, k), lerp(7.5, 6.5, k)); s.S.cam.lookAt(-.8, 1.2, 0); GL.drift(s.S.cam, t, .03);
  if (s.cnt) { const v = rollAt(t, o.count.keys); s.cnt.innerHTML = (o.count.fmt || R)(v); P(s.cnt, { x: o.count.x ?? 1380, y: o.count.y ?? 300, o: prog(t, a + .1, a + .4) }); } if (s.lab) P(s.lab, { x: o.count ? (o.count.x ?? 1380) : 960, y: (o.count ? (o.count.y ?? 300) : 200) + 110, o: prog(t, a + .3, a + .6) });
}); }

/** a lopsided scale: what you owe (left, heavy) vs what you save (right, light) */
function scale(a, b, o) { return shot3(a, b, Object.assign(pal(o.pal || 'gold'), o), (S, u, pal) => {
  S.add(floor(pal, { gridA: .3 })); S.scene.add(GL.mesh(new T.ConeGeometry(.7, 1.8, 4), GL.M.metal('#8a90a0', .3), { pos: [0, .9, 0] }));
  const beamG = new T.Group(); beamG.position.set(0, 1.85, 0); S.scene.add(beamG); beamG.add(GL.mesh(GL.rbox(8, .16, .5, .05, 2), GL.M.metal('#c9ced6', .3)));
  const L = new T.Group(); L.position.set(-3.6, .1, 0); beamG.add(L); L.add(GL.mesh(GL.rbox(2.6, .12, 2, .04, 2), GL.M.matte('#2a2f3a')));
  const hs = GL.house({ wall: '#f4ead8', roof: '#c0502f', w: 1.4, d: 1.2, h: .8 }); hs.group.position.set(-.5, .06, 0); L.add(hs.group); const cr = car('#d9483b'); cr.group.scale.setScalar(.32); cr.group.position.set(.75, .06, .2); L.add(cr.group);
  const Rr = new T.Group(); Rr.position.set(3.6, .1, 0); beamG.add(Rr); Rr.add(GL.mesh(GL.rbox(2.6, .12, 2, .04, 2), GL.M.matte('#2a2f3a'))); const cs = GL.coinStack(3, { r: .3 }); cs.position.y = .06; Rr.add(cs);
  const l1 = big(u, o.left || 'WHAT YOU OWE', { size: 50, color: RED, ls: '.06em' }), l2 = big(u, o.right || 'WHAT YOU SAVE', { size: 50, color: GREEN, ls: '.06em' }); const side = o.side ? big(u, o.side.html, { size: o.side.size || 96 }) : null; cue(o.at ?? a + .5, 'thud', .5);
  return { beamG, L, Rr, l1, l2, side };
}, (s, lt, t) => { const tilt = .32 * E.outB(prog(t, o.at ?? a + .5, (o.at ?? a + .5) + 1)); s.beamG.rotation.z = tilt + .01 * Math.sin(t * 2); s.L.rotation.z = -tilt; s.Rr.rotation.z = -tilt;
  const k = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(-1.2, 1.2, k), lerp(3.2, 2.8, k), lerp(11, 9.6, k)); s.S.cam.lookAt(0, 1.6, 0); GL.drift(s.S.cam, t, .03);
  const p1 = s.L.localToWorld(V3(0, -.6, 1)), p2 = s.Rr.localToWorld(V3(0, -.6, 1)); const [x1, y1] = GL.toScreen(s.S, p1), [x2, y2] = GL.toScreen(s.S, p2); P(s.l1, { x: x1, y: y1 + 70, o: prog(t, a + .2, a + .5) }); P(s.l2, { x: x2, y: y2 + 70, o: prog(t, a + .3, a + .6) });
  if (s.side) P(s.side, { x: 960, y: o.side.y ?? 170, o: E.outQu(prog(t, o.side.at ?? a + .3, (o.side.at ?? a + .3) + .5)) });
}); }

/** the MPC calendar: 6 pages in a row, one lights up (o.hi index), dates on them */
function calendar(a, b, o) { return shot3(a, b, Object.assign(pal(o.pal || 'night'), o), (S, u, pal) => {
  S.add(floor(pal, { gridA: .4 })); const pages = (o.pages || []).map((pg, i) => { const tx = GL.canvasTex(400, 460, (c, w, h) => { c.fillStyle = '#f4f0e6'; GL.rr(c, 0, 0, w, h, 28); c.fill(); c.fillStyle = i === o.hi ? RED : '#2a2f3a'; GL.rr(c, 0, 0, w, 120, 28); c.fill(); c.fillRect(0, 60, w, 60);
      c.fillStyle = '#fff'; c.font = '800 76px "Barlow Condensed"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(pg[0], w / 2, 64); c.fillStyle = '#1b1f24'; c.font = '800 200px "Barlow Condensed"'; c.fillText(pg[1], w / 2, 290); c.font = '700 40px "Barlow"'; c.fillStyle = '#6b6f76'; c.fillText(pg[2] || '', w / 2, 415); });
    const m = GL.mesh(GL.rbox(1.6, 1.84, .06, .06, 2), [GL.M.matte('#ddd'), GL.M.matte('#ddd'), GL.M.matte('#ddd'), GL.M.matte('#ddd'), new T.MeshStandardMaterial({ map: tx.tex, roughness: .7 }), GL.M.matte('#ddd')]); S.scene.add(m); cue(a + .15 + i * .14, 'paper', .3); return m; });
  const side = o.side ? big(u, o.side.html, { size: o.side.size || 110 }) : null; return { pages, side };
}, (s, lt, t) => { const n = s.pages.length; s.pages.forEach((m, i) => { const q = E.outB(prog(t, a + .1 + i * .14, a + .6 + i * .14)); const hi = i === o.hi ? E.outB(prog(t, o.hiAt ?? a + 1.2, (o.hiAt ?? a + 1.2) + .5)) : 0; m.position.set((i - (n - 1) / 2) * 1.95, 1.6 + hi * .5 + (1 - q) * -2, hi * 1.2); m.rotation.set(-.05, (1 - q) * 1.4 + .05 * Math.sin(t + i), 0); m.scale.setScalar(Math.max(.001, q * (1 + hi * .25))); });
  const k = E.ioS(prog(t, a, b + .35)); const far = Math.max(1, n / 4.6); s.S.cam.position.set(lerp(-1.5, 1.5, k), 2.6, lerp(10, 8.8, k) * far); s.S.cam.lookAt(0, 1.7, 0); GL.drift(s.S.cam, t, .02);
  if (s.side) P(s.side, { x: 960, y: o.side.y ?? 220, o: E.outQu(prog(t, o.side.at ?? a + .3, (o.side.at ?? a + .3) + .5)) });
}); }

/** a bond statement on paper, lines highlighted in turn: o.rows [[label, value]], o.marks [[rowIndex, t]] */
function statement(a, b, o) { return shot3(a, b, Object.assign(pal(o.pal || 'network'), o), (S, u, pal) => {
  S.add(floor(pal, { gridA: .3 })); const W2 = 1100, H2 = 1400; const tx = GL.canvasTex(W2, H2); const m = GL.mesh(GL.rbox(3.3, 4.2, .03, .04, 2), [GL.M.matte('#eee'), GL.M.matte('#eee'), GL.M.matte('#eee'), GL.M.matte('#eee'), new T.MeshStandardMaterial({ map: tx.tex, roughness: .85 }), GL.M.matte('#eee')]); m.position.set(0, 2.2, 0); S.scene.add(m);
  const pen = GL.mesh(new T.CylinderGeometry(.06, .06, 2.2, 16), GL.M.plastic('#1d3a8a', .3), { pos: [2.1, 1.2, .6], rot: [0, 0, .9] }); S.scene.add(pen);
  const draw = t => tx.draw((c, w, h) => { c.fillStyle = '#fbf8f1'; c.fillRect(0, 0, w, h); c.fillStyle = '#1b2333'; c.fillRect(0, 0, w, 150); c.fillStyle = GOLD; c.font = '800 70px "Barlow Condensed"'; c.textBaseline = 'middle'; c.fillText(o.head || 'HOME LOAN STATEMENT', 60, 78);
    c.fillStyle = '#6b6f76'; c.font = '600 40px "Barlow"'; c.fillText(o.sub || 'Account holder: N. Mokoena', 60, 220);
    (o.rows || []).forEach(([l, v], i) => { const y = 340 + i * 150; const mk = (o.marks || []).find(q => q[0] === i); const k = mk ? clamp((t - mk[1]) / .5) : 0; if (k > 0) { c.fillStyle = 'rgba(247,190,51,.85)'; c.fillRect(40, y - 56, (w - 80) * E.ioC(k), 112); }
      c.fillStyle = '#1b1f24'; c.font = '600 50px "Barlow"'; c.fillText(l, 60, y); c.font = '800 64px "Barlow Condensed"'; c.textAlign = 'right'; c.fillText(v, w - 60, y); c.textAlign = 'left'; c.fillStyle = '#d8d2c4'; c.fillRect(60, y + 66, w - 120, 3); }); }, Math.round(t * 10));
  (o.marks || []).forEach(([, t]) => cue(t, 'swish', .35)); const side = o.side ? big(u, o.side.html, { size: o.side.size || 100 }) : null; return { m, draw, pen, side };
}, (s, lt, t) => { s.draw(t); const q = E.outB(prog(t, a, a + .5)); s.m.rotation.set(-.15 + .03 * Math.sin(t * .5), -.18 + .06 * Math.sin(t * .4), .02); s.m.position.y = 2.2 - (1 - q) * 3; s.pen.rotation.z = .9 + .05 * Math.sin(t);
  const k = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(-.6, .4, k) + (o.camX || 0), lerp(2.6, 2.3, k), lerp(6.6, 5.6, k)); s.S.cam.lookAt(o.camX || 0, 2.25, 0); GL.drift(s.S.cam, t, .02);
  if (s.side) P(s.side, { x: o.side.x ?? 1500, y: o.side.y ?? 540, o: E.outQu(prog(t, o.side.at ?? a + .3, (o.side.at ?? a + .3) + .5)) });
}); }

/** a credit card under a glowing legal ceiling that moves with repo: o.ceil [[t, '21.25%']] */
function ceiling(a, b, o) { return shot3(a, b, Object.assign(pal(o.pal || 'steel'), o), (S, u, pal) => {
  S.add(floor(pal, { gridA: .3 })); const cd = cardMesh(); cd.group.position.set(0, 1.8, 0); S.add(cd);
  const cl = GL.mesh(new T.BoxGeometry(9, .08, 4), GL.M.glow(RED, 1.6), { cast: false, pos: [0, 4.0, -.5] }); S.scene.add(cl); const lab = big(u, '', { size: 70, color: '#fff' });
  const side = o.side ? big(u, o.side.html, { size: o.side.size || 64, color: RED }) : null; (o.ceil || []).slice(1).forEach(([t]) => cue(t, 'swoosh_up', .4)); return { cd, cl, lab, side };
}, (s, lt, t) => { let y = 4.0, txt = o.ceil[0][1]; (o.ceil || []).forEach(([t0, tx], i) => { if (i && t > t0 - .3) { y = 4.0 + .45 * i * E.outB(prog(t, t0 - .3, t0 + .4)); txt = t > t0 ? tx : txt; } }); s.cl.position.y = y;
  s.cd.group.rotation.set(-.25 + .05 * Math.sin(t * .7), .4 * Math.sin(t * .4), .06); s.cd.group.position.y = 1.8 + .12 * Math.sin(t * 1.3);
  const k = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(-1, 1, k), lerp(2.6, 2.8, k), lerp(8.4, 7.4, k)); s.S.cam.lookAt(0, 2.6, 0); GL.drift(s.S.cam, t, .03);
  const [x, yy] = GL.toScreen(s.S, V3(0, y + .15, -.5)); s.lab.innerHTML = (o.capText || 'LEGAL MAXIMUM ') + S0 + txt + '</span>'; P(s.lab, { x: 960, y: yy - 50, o: prog(t, a + .2, a + .5) });
  if (s.side) P(s.side, { x: 960, y: o.side.y ?? 960, o: E.outQu(prog(t, o.side.at ?? a + .3, (o.side.at ?? a + .3) + .5)) });
}); }

/** the 240 months of a 20-year bond as glowing tiles; o.cut months fall away at o.cutAt */
function months(a, b, o) { return shot3(a, b, Object.assign(pal(o.pal || 'cyan'), o), (S, u, pal) => {
  S.add(floor(pal, { gridA: .2 })); const n = 240, cols = 24; const im = new T.InstancedMesh(GL.rbox(.32, .32, .1, .04, 2), new T.MeshStandardMaterial({ roughness: .5, emissive: '#000' }), n); im.frustumCulled = false; S.scene.add(im);
  const cnt = big(u, '', { size: 140, color: '#fff' }); const lab = big(u, o.label || '', { size: 46, ls: '.06em', color: GOLD }); if (o.cutAt) cue(o.cutAt, 'swoosh_up', .45); return { im, n, cols, cnt, lab };
}, (s, lt, t) => { const m4 = new T.Matrix4(), cc = new T.Color(); const cut = o.cut || 0; const ca = o.cutAt ?? 1e9;
  for (let i = 0; i < s.n; i++) { const x = (i % s.cols - (s.cols - 1) / 2) * .4, y = 3.9 - Math.floor(i / s.cols) * .4; const appear = prog(t, a + i * .006, a + i * .006 + .3); const gone = i >= s.n - cut ? E.inQ(prog(t, ca + (s.n - 1 - i) * .03, ca + (s.n - 1 - i) * .03 + .5)) : 0;
    m4.makeTranslation(x, y + gone * 3, gone * 2); m4.scale(V3(Math.max(.001, appear * (1 - gone)), Math.max(.001, appear * (1 - gone)), 1)); s.im.setMatrixAt(i, m4); cc.set(i >= s.n - cut && t > ca - .2 ? GREEN : GOLD).multiplyScalar(.6 + .4 * Math.sin(t * 2 + i * .3)); s.im.setColorAt(i, cc); }
  s.im.instanceMatrix.needsUpdate = true; s.im.instanceColor.needsUpdate = true;
  const left = Math.round(s.n - (t > ca ? cut * E.ioC(prog(t, ca, ca + 1.2)) : 0)); s.cnt.innerHTML = left + ' <span style="font-size:60px;color:' + GOLD + '">MONTHS</span>'; P(s.cnt, { x: 960, y: 900, o: prog(t, a + .2, a + .5) }); P(s.lab, { x: 960, y: 990, o: prog(t, a + .4, a + .7) });
  const k = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(-1.2, 1.2, k), lerp(2.6, 2.4, k), lerp(9.4, 8.4, k)); s.S.cam.lookAt(0, 2.0, 0); GL.drift(s.S.cam, t, .02);
}); }

/** the committee: a round table with six generic figures, a glowing rate in the middle */
function committee(a, b, o) { return shot3(a, b, Object.assign(pal(o.pal || 'night'), o), (S, u, pal) => {
  S.add(floor(pal, { gridA: .3 })); S.scene.add(GL.mesh(new T.CylinderGeometry(2.6, 2.6, .14, 64), GL.M.matte('#3a2a20', .5), { pos: [0, 1.0, 0] })); S.scene.add(GL.mesh(new T.CylinderGeometry(.3, .5, 1, 20), GL.M.matte('#2a1d14'), { pos: [0, .5, 0] }));
  const cols = ['#2c4a8a', '#5a3a6a', '#2f6f5a', '#7a3a2a', '#3a3f4a', '#6a5a2a'], skins = ['#6b3f26', '#8a5a3b', '#4a2c1a', '#a06a45', '#e0b48a', '#5a3420']; for (let i = 0; i < 6; i++) { const an = i / 6 * Math.PI * 2 + .5; const p = person(cols[i], skins[i], { hair: i % 2 ? false : true }); p.group.position.set(Math.cos(an) * 3.2, 0, Math.sin(an) * 3.2); p.group.lookAt(0, 0, 0); S.add(p); }
  const rt = GL.text3d(o.text || '7.25%', { size: .8, depth: .3, color: GOLD, side: '#6a4a10', emissive: GOLD, ei: .2 }); rt.position.set(0, 2.2, 0); S.scene.add(rt); const side = o.side ? big(u, o.side.html, { size: o.side.size || 90 }) : null;
  return { rt, side };
}, (s, lt, t) => { s.rt.position.y = 2.2 + .1 * Math.sin(t * 1.4); const k = E.ioS(prog(t, a, b + .35)); const an = lerp(-.4, .4, k); s.S.cam.position.set(Math.sin(an) * 9, lerp(5.6, 4.6, k), Math.cos(an) * 9); s.rt.lookAt(s.S.cam.position.x, 2.2, s.S.cam.position.z); s.S.cam.lookAt(0, 1.4, 0); GL.drift(s.S.cam, t, .03);
  if (s.side) P(s.side, { x: 960, y: o.side.y ?? 150, o: E.outQu(prog(t, o.side.at ?? a + .3, (o.side.at ?? a + .3) + .5)) });
}); }

/** banking-app screen on a smartphone (our own drawing): o.app {title, rows:[[label, value]], big: keys}, used via T3.phone screenFn */
function appScreen(o) { return (g, w, h, t) => { const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#16213e'); bg.addColorStop(1, '#070b18'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = '#fff'; g.font = `600 ${w * .045}px "Barlow"`; g.textBaseline = 'middle'; g.fillText('09:41', w * .07, h * .03); g.fillStyle = GOLD; g.font = `800 ${w * .08}px "Barlow Condensed"`; g.fillText(o.title || 'MY HOME LOAN', w * .07, h * .1);
  g.fillStyle = 'rgba(247,190,51,.14)'; GL.rr(g, w * .06, h * .15, w * .88, h * .2, w * .05); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; g.font = `600 ${w * .05}px "Barlow"`; g.fillText(o.bigLabel || 'Monthly instalment', w * .11, h * .19);
  const v = o.bigKeys ? rollAt(t, o.bigKeys) : 0; g.fillStyle = '#fff'; g.font = `800 ${w * .16}px "Barlow Condensed"`; g.fillText(o.bigFmt ? o.bigFmt(v) : R(v), w * .11, h * .28);
  (o.rows || []).forEach(([l, val, at], i) => { if (at && t < at) return; const y = h * (.42 + i * .1); g.fillStyle = 'rgba(255,255,255,.07)'; GL.rr(g, w * .06, y - h * .04, w * .88, h * .08, w * .03); g.fill(); g.fillStyle = 'rgba(255,255,255,.8)'; g.font = `600 ${w * .062}px "Barlow"`; g.fillText(l, w * .11, y); g.fillStyle = typeof val === 'function' ? GOLD : '#fff'; g.font = `800 ${w * .08}px "Barlow Condensed"`; g.textAlign = 'right'; g.fillText(typeof val === 'function' ? val(t) : val, w * .89, y); g.textAlign = 'left'; });
}; }

/** a 3D equation: parts appear on their words: o.parts [{text, at, col}], laid out in a row (or o.rows: 2 lines) */
function equation(a, b, o) { return shot3(a, b, Object.assign(pal(o.pal || 'cyan'), o), (S, u, pal) => {
  S.add(floor(pal, { gridA: .45 })); const lines = o.rows || [o.parts]; const ms = []; lines.forEach((row, li) => { const items = row.map(p => { const m = GL.text3d(p.text, { size: p.size || 1.0, depth: .32, color: p.col || '#f2f2f2', side: H.PROPS && p.col ? '#5a3a10' : '#8a8f9a', emissive: p.col || '#000', ei: p.col ? .12 : 0 }); S.scene.add(m); cue(p.at, p.col ? 'impact' : 'pop', .35); return { p, m, w: m.userData.w || 1 }; });
    const gap = .45; const tot = items.reduce((s, x) => s + x.w, 0) + gap * (items.length - 1); const fit = Math.min(1, (o.maxW || 6.8) / tot); let x = -tot / 2; items.forEach(it => { it.x = (x + it.w / 2) * fit; it.fit = fit; x += it.w + gap; it.y = 2.0 + (lines.length - 1) * .75 - li * 1.5; ms.push(it); }); });
  const coins = GL.coinStack(9, { r: .35 }); coins.position.set(o.coinX ?? 4.6, 0, -2.4); S.scene.add(coins); const lab = o.label ? big(u, o.label, { size: 50, ls: '.08em', color: GOLD }) : null; return { ms, coins, lab };
}, (s, lt, t) => { s.ms.forEach(it => { const q = E.outB(prog(t, it.p.at, it.p.at + .5)); it.m.position.set(it.x, it.y + (1 - q) * 1.2, (1 - q) * 1.5); it.m.scale.setScalar(Math.max(.001, q * it.fit)); it.m.rotation.y = .06 * Math.sin(t * .7 + it.x); it.m.rotation.x = (1 - q) * -1; });
  s.coins.rotation.y = t * .3; const k = E.ioS(prog(t, a, b + .35)); s.S.cam.position.set(lerp(1, -1, k), lerp(2.3, 2.6, k), lerp(9.4, 8.2, k)); s.S.cam.lookAt(0, 2, 0); GL.drift(s.S.cam, t, .03);
  if (s.lab) P(s.lab, { x: 960, y: o.labelY ?? 860, o: prog(t, a + .3, a + .6) });
}); }
H.PROPS.car = o => car(o.col || '#d9483b'); H.PROPS.card = () => cardMesh(); H.PROPS.jar = () => { const j = jar(); const cs = GL.coinStack(6, { r: .3 }); cs.position.y = .06; j.group.add(cs); return j; };

// ================= global: intro disclaimer corner (first 45 s) =================
{ const disc = el('div', { class: 'abs' }, C.stage, 'General information, not financial advice'); disc.style.cssText += "font:600 22px/1 Barlow;color:rgba(255,255,255,.75);white-space:nowrap;z-index:9003;text-shadow:0 2px 8px rgba(0,0,0,.6)";
  const R0 = window.renderAt; window.renderAt = t => { R0(t); P(disc, { x: 54, y: 1040, anchor: 'tl', o: prog(t, .6, 1.2) * (1 - prog(t, 43.5, 44.5)) }); }; }

const cuts = []; const add = (start, type, fn) => cuts.push([start, fn, type]);
const NAL = 'NALEDI · FIRST-TIME HOME OWNER';
const bondApp = (keys, rows, extra) => appScreen(Object.assign({ title: 'MY HOME LOAN', bigKeys: keys, rows }, extra || {}));
const ph = (a, b, o) => T3.phone(a, b, Object.assign({ smart: true, phoneOpts: { resW: 540, resH: 1080, glow: 1.15 }, phoneScale: 1.45 }, o, { palx: PALX }));
const T3p = (fn, name) => (a, b, o) => T3[fn](a, b, Object.assign({}, o, { palx: Object.assign({}, PALX, o.palx || {}) }));
const title = T3p('title'), number = T3p('number'), receipt = T3p('receipt'), versus = T3p('versus'), trio = T3p('trio'), bars = T3p('bars'), pile = T3p('pile'), crowd = T3p('crowd'), map = T3p('map'), dotMap = T3p('dotMap');

// ======================= COLD OPEN (dawn) =======================
add(0, 'street', (a, b) => street(a, b, { cam: 'wide', tags: [{ text: NAL, at: .5, x: 1340, y: 760 }], tr: { in: 'fade', tin: .4 } }));
add(X('last month she', 2.0), 'map', (a, b) => map(a, b, { pal: 'dawn', landCol: '#2a2550', edgeCol: '#6a5aa0', hl: { ZAF: GOLD }, raise: [['ZAF', a + .2, .3]], focus: [26, -27], dist: 6.5, push: .75,
  pins: [{ lon: 28.05, lat: -26.2, text: 'JOHANNESBURG', at: N('johannesburg', 4.1) - .2, size: 40 }], kicker: 'HER FIRST HOME', tr: { in: 'zoom' } }));
add(X('her bond is', 5.7), 'number', (a, b) => number(a, b, { pal: 'dawn', text: 'R1.2 MILLION', at: N('12 million', 6.1) - .1, label: 'HER BOND', props: 'notes', noteCol: '#2f7d4f', noteVal: 'R', maxW: 6.6, tr: { in: 'whip' } }));
add(X('and she pays 12183', 7.9), 'phone', (a, b) => ph(a, b, { pal: 'dawn', cam: 'right', screenFn: bondApp([[a, 12183]], [['Bond', 'R1 200 000'], ['Term', '20 years'], ['Rate today', 'PRIME 10.75%', N('every month', 10.8)]]),
  side: { html: 'R12 183<br><span style="color:#f7be33">EVERY MONTH</span>', at: N('12183', 8.5), x: 640, size: 120 }, tr: { in: 'whip' } }));
add(X('this thursday the', 12.4), 'calendar', (a, b) => calendar(a, b, { pal: 'dawn', pages: [['MON', '16', 'NOV'], ['TUE', '17', 'NOV'], ['WED', '18', 'NOV'], ['THU', '19', 'NOV'], ['FRI', '20', 'NOV']], hi: 3, hiAt: N('19th of november', 13.1), tr: { in: 'whip' } }));
add(X('the reserve bank in pretoria', 14.5), 'sarb', (a, b) => sarb(a, b, { pal: 'night', rates: [[N('one number', 16.6), '7.25%']], side: { html: 'THE RESERVE BANK · <span style="color:#f7be33">PRETORIA</span>', at: N('pretoria', 15.4), size: 64, y: 960 }, tr: { in: 'zoom' } }));
add(X('naledi wont be', 17.8), 'committee', (a, b) => committee(a, b, { pal: 'night', text: '7.25%', side: { html: 'NALEDI DOESN\'T <span style="color:#ff5d5d">GET A VOTE</span>', at: N('doesnt get a vote', 19.7), size: 84 }, tr: { in: 'whip' } }));
add(X('but if that number', 21.0), 'number', (a, b) => number(a, b, { pal: 'dawn', text: '+0.25%', at: N('a quarter of one', 22.6) - .2, label: 'A QUARTER OF ONE PERCENT', props: 'coins', tr: { in: 'flash', tin: .2 } }));
add(X('her bond goes up', 24.4), 'street', (a, b) => street(a, b, { cam: 'roof', meter: { keys: [[a, 12183], [N('12386', 25.4) + .4, 12386]], label: 'NALEDI\'S BOND, EVERY MONTH', at: a + .1, y: 230 }, tr: { in: 'zoom' } }));
add(X('thats about 204', 28.3), 'equation', (a, b) => equation(a, b, { pal: 'dawn', parts: [{ text: '+R204', at: N('204', 28.8) - .1, col: GOLD, size: 1.6 }], rows: null, label: 'MORE EVERY MONTH · FOR 20 YEARS', tr: { in: 'whip' } }));
add(X('and its not just', 33.0), 'crowd', (a, b) => crowd(a, b, { pal: 'dawn', lit: [[1, a + .2, GOLD]], value: 'NOT JUST NALEDI', valueSize: 130, tr: { in: 'zoom' } }));
add(X('if you have a bond', 34.7), 'trio', (a, b) => trio(a, b, { pal: 'dawn', gap: 2.75, items: [{ prop: 'house', scale: .62, label: 'A BOND', at: N('a bond', 35.2) }, { prop: 'car', scale: .42, label: 'A CAR LOAN', at: N('a car loan', 35.9) }, { prop: 'card', scale: .45, y: 1.2, label: 'A CREDIT CARD', at: N('a credit card', 36.7) }, { prop: 'jar', scale: .6, label: 'SAVINGS', at: N('a savings account', 37.6), col: GREEN }],
  title: 'THE SAME NUMBER <mark>REACHES YOU</mark>', titleAt: N('reaches you', 39.7), tr: { in: 'whip' } }));
add(X('so heres the answer', 41.3), 'title', (a, b) => title(a, b, { pal: 'gold', kicker: 'UP FRONT', lines: ['THE', 'ANSWER'], size: 1.3, tr: { in: 'flash', tin: .2 } }));
add(X('a quarter of a percent on', 43.3), 'number', (a, b) => number(a, b, { pal: 'gold', text: '+R200', at: N('about 200', 45.6) - .1, label: 'A MONTH ON A R1.2 MILLION BOND', sub: 'from +0.25% on the repo rate', props: 'notes', noteCol: '#2f7d4f', noteVal: 'R', tr: { in: 'zoom' } }));
add(X('about 53 rand', 49.5), 'carShot', (a, b) => carShot(a, b, { pal: 'gold', tag: { text: '+R53 A MONTH · BIG CAR LOAN', at: N('53', 49.9), y: 880 }, tr: { in: 'whip' } }));
add(X('and only about 25', 52.1), 'jar', (a, b) => jarShot(a, b, { pal: 'gold', drops: [[N('25 rand a year', 52.9), 3]], count: { keys: [[a, 10000], [N('25 rand a year', 52.9) + .3, 10025]], x: 1380 }, label: 'ONLY +R25 A YEAR ON SAVINGS', tr: { in: 'zoom' } }));
add(X('in this video', 56.4), 'trio', (a, b) => trio(a, b, { pal: 'cyan', items: [{ prop: 'bank', scale: .45, label: 'WHY IT MOVES', at: N('see why', 57.4) }, { prop: 'smart', scale: 1, y: 1.4, label: 'YOUR NUMBER IN 10 S', at: N('your own number', 59.0) }, ], tr: { in: 'whip' } }));
add(X('and five things', 61.0), 'calendar', (a, b) => calendar(a, b, { pal: 'cyan', pages: [['MON', '16', 'NOV'], ['TUE', '17', 'NOV'], ['WED', '18', 'NOV'], ['THU', '19', 'NOV']], hi: 3, hiAt: N('before thursday', 62.3), side: { html: '5 THINGS TO DO <span style="color:#f7be33">BEFORE THURSDAY</span>', at: a + .3, size: 80, y: 220 }, tr: { in: 'zoom' } }));
add(X('and stay for the last', 63.7), 'months', (a, b) => months(a, b, { pal: 'cyan', label: 'ONE SMALL HABIT: MORE THAN R100 000 SAVED', cut: 13, cutAt: N('more than 100000', 67.5), tr: { in: 'zoom' } }));
add(X('lets start from zero', 70.0), 'title', (a, b) => title(a, b, { pal: 'night', lines: ['LET\'S START', 'FROM ZERO'], accentLine: 1, size: 1.1, prop: 'coins', propOpts: { n: 12, pos: [3.8, 0, -3], scale: 2 }, tr: { in: 'bands', colors: [GOLD, '#fff', '#1c1850'] } }));

// ======================= CH1: WHAT IS THE REPO RATE (night) =======================
add(X('first what is', 71.5), 'sarb', (a, b) => sarb(a, b, { pal: 'night', cam: 'low', rates: [[a + .4, 'REPO RATE?']], side: { html: 'WHAT IS THE <span style="color:#f7be33">REPO RATE?</span>', at: a + .2, size: 100, y: 940 }, tr: { in: 'flash', tin: .2 } }));
add(X('banks borrow money', 74.0), 'journey', (a, b) => journey(a, b, { pal: 'night', focus: 1, hits: [[a, 1]], labels: [null, 'NEEDS CASH'], showAll: true, title: 'BANKS <mark>BORROW TOO</mark>', titleAt: N('borrow money too', 74.4), tr: { in: 'whip' } }));
add(X('it can borrow from', 76.8), 'sarb', (a, b) => sarb(a, b, { pal: 'night', rates: [[N('charges interest', 80.3), 'INTEREST']], side: { html: 'BANKS BORROW FROM <span style="color:#f7be33">THE RESERVE BANK</span>', at: N('south african reserve', 77.8), size: 70, y: 960 }, tr: { in: 'zoom' } }));
add(X('the rate it charges', 81.5), 'equation', (a, b) => equation(a, b, { pal: 'night', rows: [[{ text: 'THE RATE IT CHARGES', at: a + .1, size: .8 }], [{ text: '= THE REPO RATE', at: N('is the repo', 82.6), col: GOLD, size: 1.1 }]], tr: { in: 'whip' } }));
add(X('the reserve bank now', 84.0), 'receipt', (a, b) => receipt(a, b, { pal: 'night', source: 'SARB · What we do: monetary policy', lines: ['“Monetary policy is implemented by', 'setting the SPR. This instrument was', 'previously known as the ‘repo rate’”'], mark: 'previously known as the ‘repo rate’”', markAt: N('policy rate', 85.8), foot: 'SPR = SARB Policy Rate · resbank.co.za, read 15 Nov 2026', tr: { in: 'whip' } }));
add(X('right now its', 89.0), 'number', (a, b) => number(a, b, { pal: 'night', text: '7.25%', at: N('725', 89.8) - .2, label: 'THE REPO RATE TODAY', sub: 'since 25 September 2026 · SARB', props: 'coins', tr: { in: 'zoom' } }));
add(X('before may it', 92.0), 'bars', (a, b) => bars(a, b, { pal: 'night', items: [{ label: 'BEFORE MAY', value: 6.75, at: N('675', 92.9), col: '#8a90c8', text: '6.75%' }, { label: 'MAY 2026', value: 7.0, at: N('in may and', 96.6), col: GOLD, text: '7.00%' }, { label: 'SEPTEMBER 2026', value: 7.25, at: N('september', 98.2) - .2, col: GOLD, text: '7.25%' }], fmt: v => v.toFixed(2) + '%', title: 'UP <mark>TWICE</mark> THIS YEAR', titleAt: N('went up twice', 95.0), src: 'SARB MPC statements, 28 May and 23 Sep 2026', tr: { in: 'whip' } }));
add(X('who decides', 99.0), 'committee', (a, b) => committee(a, b, { pal: 'night', side: { html: 'THE <span style="color:#f7be33">MONETARY POLICY COMMITTEE</span>', at: N('monetary policy committee', 102.0), size: 72 }, tr: { in: 'zoom' } }));
add(X('they announce a decision', 103.8), 'calendar', (a, b) => calendar(a, b, { pal: 'night', pages: [['NOV', '19', '2026'], ['JAN', '28', '2027'], ['MAR', '18', '2027'], ['MAY', '27', '2027'], ['JUL', '22', '2027'], ['SEP', '29', '2027']], hi: 0, hiAt: N('this thursday', 107.0),
  side: { html: '6 DECISIONS A YEAR · <span style="color:#ff5d5d">NEXT: THIS THURSDAY</span>', at: N('six times a year', 105.0), size: 64, y: 230 }, src: 'SARB MPC statement, 23 Sep 2026', tr: { in: 'whip' } }));
add(X('heres the thing', 108.3), 'versus', (a, b) => versus(a, b, { pal: 'night', left: { prop: 'bank', scale: .45, label: 'BANKS BORROW AT 7.25%', at: a + .2 }, right: { prop: 'person', opts: { col: NALEDI.col, skin: NALEDI.skin }, scale: 1.4, y: .2, label: 'YOU NEVER DO', at: N('you never borrow', 109.7), col: PINK }, tr: { in: 'zoom' } }));
add(X('so why does it touch', 111.5), 'map', (a, b) => map(a, b, { pal: 'night', landCol: '#1b1a4a', edgeCol: '#4a4aa0', hl: { ZAF: '#2a2870' }, focus: [28, -26], dist: 3.2, push: .8, tilt: 1.0,
  pins: [{ lon: 28.19, lat: -25.75, text: 'PRETORIA', at: a + .3, size: 38, dy: 80 }, { lon: 28.05, lat: -26.2, text: 'YOUR BOND', at: N('touch your bond', 112.2), size: 38, col: PINK, dy: -40 }], arcs: [{ from: [28.19, -25.75], to: [28.05, -26.2], at: N('a short trip', 114.4), col: GOLD, h: .4, r: .03 }],
  title: 'A SHORT TRIP · <mark>THREE STOPS</mark>', titleAt: N('three stops', 116.0), tr: { in: 'whip' } }));

// ======================= CH2: THREE STOPS (network) =======================
add(X('stop one the', 117.0), 'journey', (a, b) => journey(a, b, { pal: 'network', focus: 0, hits: [[a, 0], [N('to the banks at', 119.2) + .4, 1]], labels: ['REPO 7.25%', 'BANKS BORROW AT 7.25%'], kicker: 'STOP 1', tr: { in: 'zoom' } }));
add(X('stop two the', 122.0), 'stairs', (a, b) => stairs(a, b, { pal: 'network', kicker: 'STOP 2', blocks: [{ h: 7.25, label: 'REPO 7.25%', at: a + .2 }, { h: 3.5, label: '+ 3.5% FIXED', sub: 'the banks add it', col: CYAN, at: N('fixed 35', 123.9) }], tr: { in: 'whip' } }));
add(X('that gives the prime', 126.0), 'journey', (a, b) => journey(a, b, { pal: 'network', focus: 1, hits: [[a, 1]], labels: [null, 'PRIME LENDING RATE'], showAll: true, title: 'THE BANKS\' <mark>STARTING POINT</mark>', titleAt: N('starting point', 129.1), tr: { in: 'zoom' } }));
add(X('today prime is', 130.5), 'number', (a, b) => number(a, b, { pal: 'network', text: '10.75%', at: N('1075', 131.5) - .2, label: 'PRIME TODAY = 7.25% + 3.5%', sub: 'SARB current market rates, 13 Nov 2026', props: 'coins', tr: { in: 'whip' } }));
add(X('when repo moves by', 133.4), 'stairs', (a, b) => stairs(a, b, { pal: 'network', blocks: [{ h: 7.25, label: 'REPO', at: a + .1 }, { h: 3.5, label: '+ 3.5%', col: CYAN, at: a + .25 }, { h: 1.6, label: '+ 0.25%', sub: 'prime moves the same', col: RED, at: N('by a quarter prime', 134.7) }], total: { html: 'PRIME <span style="color:#f7be33">11.00%</span>', at: N('every time', 137.0), x: 560, y: 220 }, tr: { in: 'zoom' } }));
add(X('stop three you', 138.2), 'journey', (a, b) => journey(a, b, { pal: 'network', focus: 2, hits: [[a, 1], [N('you your loan', 139.2) + .2, 2]], labels: [null, null, 'YOUR BOND: PRICED FROM PRIME'], kicker: 'STOP 3', tr: { in: 'whip' } }));
add(X('look at your bond', 142.0), 'statement', (a, b) => statement(a, b, { pal: 'network', camX: -1.5, rows: [['Interest rate type', 'Variable'], ['Linked to', 'PRIME'], ['Your margin', '− 0.50%'], ['Your rate today', '10.25%']], marks: [[1, N('like prime', 144.8) + .3]], side: { html: 'PRIME<br>PRIME − 0.5%<br>PRIME + 2%', at: N('prime minus half', 146.4), x: 1440, y: 520, size: 84 }, tr: { in: 'zoom' } }));
add(X('or prime plus two', 148.2), 'versus', (a, b) => versus(a, b, { pal: 'network', left: { prop: 'house', scale: .9, label: 'BOND: PRIME − 0.5%', at: a + .1 }, right: { prop: 'car', scale: .6, label: 'CAR: PRIME + 2%', at: N('prime plus two', 148.6), col: CYAN }, mid: { html: 'YOUR DEAL', at: N('your deal with', 151.7), size: 110 }, tr: { in: 'whip' } }));
add(X('say your bond is', 153.4), 'phone', (a, b) => ph(a, b, { pal: 'network', cam: 'left', screenFn: bondApp([[a, 10.25]], [['Prime', '10.75%'], ['Your deal', '− 0.50%', N('prime minus half', 154.5)], ['Your rate', '10.25%', N('today thats', 156.7)]], { bigLabel: 'Your interest rate', bigFmt: v => v.toFixed(2) + '%' }),
  side: { html: 'PRIME − 0.5%<br><span style="color:#f7be33">= 10.25%</span>', at: N('today thats', 156.7), x: 1300, size: 120 }, tr: { in: 'zoom' } }));
add(X('the prime part moves', 159.7), 'versus', (a, b) => versus(a, b, { pal: 'network', left: { prop: 'bank', scale: .45, label: 'PRIME: MOVES', at: a + .1 }, right: { prop: 'person', opts: { col: NALEDI.col, skin: NALEDI.skin }, scale: 1.4, y: .2, label: 'YOUR DEAL: STAYS', at: N('your deal stays', 162.5), col: PINK }, link: 'beam', linkAt: a + .4, tr: { in: 'whip' } }));
add(X('even the legal limits', 164.4), 'ceiling', (a, b) => ceiling(a, b, { pal: 'steel', ceil: [[a, 'REPO + 14%']], capText: 'LEGAL MAXIMUM: ', side: { html: 'CREDIT CARDS · STORE CARDS', at: N('a credit card or store', 167.4), y: 960, size: 60 }, tr: { in: 'zoom' } }));
add(X('is the repo rate plus', 169.9), 'receipt', (a, b) => receipt(a, b, { pal: 'steel', source: 'National Credit Regulations · reg 42', lines: ['Credit facilities: RR + 14% per year', 'Mortgage agreements: RR + 12% per year', 'Unsecured credit: RR + 21% per year'], mark: 'Credit facilities: RR + 14% per year', markAt: N('plus 14', 171.1), foot: 'RR = the repo rate · Table A, as amended 2015', tr: { in: 'whip' } }));
add(X('today thats 2125', 173.2), 'ceiling', (a, b) => ceiling(a, b, { pal: 'steel', ceil: [[a, '21.25%'], [N('that ceiling moves', 177.6), '21.50%']], capText: 'MAXIMUM: ', side: { html: 'IF REPO GOES UP 0.25%, THE CEILING DOES TOO', at: N('when repo moves', 176.3), y: 960, size: 54 }, tr: { in: 'zoom' } }));
add(X('so one decision in', 179.6), 'journey', (a, b) => journey(a, b, { pal: 'network', hits: [[a, 0], [N('your payslip', 182.7), 2]], labels: ['7.25%', '10.75%', 'YOUR PAYSLIP'], reveal: 0, title: 'ONE DECISION, <mark>ALL THE WAY TO YOU</mark>', titleAt: N('travels all the way', 181.4), tr: { in: 'whip' } }));
add(X('but why would the', 184.0), 'title', (a, b) => title(a, b, { pal: 'sunset', lines: ['WHY MAKE LOANS', 'MORE EXPENSIVE?'], accentLine: 1, size: .95, prop: 'house', propOpts: { pos: [3.9, 0, -3], scale: 1.2 }, tr: { in: 'bands', colors: [GOLD, '#ff7a3d', '#6a2208'] } }));

// ======================= CH3: WHY: THE BRAKE (sunset) =======================
add(X('think of the repo', 189.2), 'brake', (a, b) => brake(a, b, { pal: 'sunset', side: { html: 'THE REPO RATE = <span style="color:#f7be33">THE BRAKE PEDAL</span>', at: N('brake pedal', 191.1), size: 90, y: 180 }, tr: { in: 'zoom' } }));
add(X('the reserve banks job', 192.9), 'dial', (a, b) => dial(a, b, { pal: 'sunset', from: 2, value: 3, at: a + .3, label: 'KEEP PRICES STEADY', tr: { in: 'whip' } }));
add(X('its target is inflation', 196.5), 'receipt', (a, b) => receipt(a, b, { pal: 'sunset', source: 'SARB · What we do: monetary policy', lines: ['“South Africa’s inflation target is 3%,', 'with a tolerance band of plus or', 'minus 1 percentage point”'], mark: 'inflation target is 3%,', markAt: N('inflation of 3', 197.6), foot: 'Set by the Minister of Finance with the SARB Governor (MTBPS, 12 Nov 2025)', tr: { in: 'zoom' } }));
add(X('when prices rise too', 201.6), 'brake', (a, b) => brake(a, b, { pal: 'sunset', cam: 'rear', brakeAt: N('presses the brake', 204.4) + .3, gauge: { from: .82, to: .6, label: 'PRICES', at: N('presses the brake', 204.4) + .3 }, side: { html: 'PRICES TOO FAST? <span style="color:#ff5d5d">BRAKE.</span>', at: a + .3, size: 84, y: 160 }, tr: { in: 'whip' } }));
add(X('loans cost more people', 205.5), 'pile', (a, b) => pile(a, b, { pal: 'sunset', from: 200, to: 200, at: a + .1, dur: .1, clear: N('spend a little less', 208.6) - .3, clearDur: 1.6, noteCol: '#2f7d4f', noteVal: 'R', count: { from: 0, to: 0, fmt: () => 'LOANS COST MORE' }, countSize: 120, label: 'PEOPLE BORROW AND SPEND A LITTLE LESS', tr: { in: 'zoom' } }));
add(X('and over time prices', 209.9), 'dial', (a, b) => dial(a, b, { pal: 'sunset', from: 5.2, value: 3.4, at: a + .2, label: 'OVER TIME, PRICES COOL DOWN', tr: { in: 'whip' } }));
add(X('dearer loans arent', 212.6), 'title', (a, b) => title(a, b, { pal: 'sunset', lines: ['NOT A SIDE EFFECT:', 'THAT\'S THE BRAKE'], accentLine: 1, size: .85, tr: { in: 'flash', tin: .2 } }));
add(X('thats what happened this', 216.5), 'dial', (a, b) => dial(a, b, { pal: 'sunset', from: 3, value: 4.5, at: N('45', 220.2) - .3, label: 'INFLATION · SEPTEMBER 2026', src: 'Stats SA CPI, released 21 Oct 2026 (via SAnews)', tr: { in: 'zoom' } }));
add(X('and fuel prices', 221.7), 'receipt', (a, b) => receipt(a, b, { pal: 'sunset', source: 'SARB · MPC statement · 23 Sep 2026', lines: ['“we have raised our near-term', 'forecasts. This is mainly because', 'of higher fuel prices.”'], mark: 'of higher fuel prices.”', markAt: N('pushing it higher', 222.9), tr: { in: 'whip' } }));
add(X('so the reserve bank pressed', 224.3), 'brake', (a, b) => brake(a, b, { pal: 'sunset', brakeAt: N('pressed the brake', 225.7) + .2, side: { html: 'SEPTEMBER: <span style="color:#ff5d5d">BRAKE</span>', at: a + .2, size: 90, y: 180 }, tr: { in: 'zoom' } }));
add(X('from 7 to', 226.9), 'sarb', (a, b) => sarb(a, b, { pal: 'sunset', cam: 'low', rates: [[a + .15, '7%'], [N('to 725', 227.5) + .7, '7.25%']], side: { html: '23 SEPTEMBER 2026 · <span style="color:#f7be33">+0.25%</span>', at: N('to 725', 227.5) + .7, size: 70, y: 960 }, tr: { in: 'whip' } }));
add(X('but a brake on', 231.0), 'brake', (a, b) => brake(a, b, { pal: 'sunset', cam: 'rear', brakeAt: a + .4, slow: .55, side: { html: 'A HEAVY TRUCK <span style="color:#f7be33">TAKES TIME</span>', at: N('takes time', 233.0), size: 90, y: 160 }, tr: { in: 'zoom' } }));
add(X('the reserve bank says', 234.0), 'receipt', (a, b) => receipt(a, b, { pal: 'sunset', source: 'SARB · What we do: monetary policy', lines: ['“Policy changes are transmitted', 'over roughly 12 to 24 months”'], fs: 76, mark: 'over roughly 12 to 24 months”', markAt: N('12 to 24', 236.5), tr: { in: 'whip' } }));
add(X('thats why it moves', 240.0), 'stairs', (a, b) => stairs(a, b, { pal: 'sunset', blocks: [{ h: 4, label: '6.75%', at: a + .1 }, { h: 2.4, label: '+0.25% · MAY', col: '#ffcf3a', at: N('small steps', 241.5) }, { h: 2.4, label: '+0.25% · SEPTEMBER', col: '#ff7a3d', at: N('a quarter at a', 243.2) }], total: { html: 'SMALL <span style="color:#f7be33">STEPS</span>', at: a + .3, x: 520, y: 200 }, tr: { in: 'zoom' } }));
add(X('and when inflation is', 244.6), 'brake', (a, b) => brake(a, b, { pal: 'dawn', side: { html: 'UNDER CONTROL? <span style="color:#2fd27f">EASE OFF</span>', at: N('ease off', 246.9), size: 90, y: 160 }, tr: { in: 'whip' } }));
add(X('a cut works exactly', 248.1), 'versus', (a, b) => versus(a, b, { pal: 'dawn', left: { prop: 'coins', opts: { n: 14 }, scale: 2.6, label: 'HIKE: LOANS COST MORE', at: a + .1, col: RED }, right: { prop: 'coins', opts: { n: 6 }, scale: 2.6, label: 'CUT: LOANS COST LESS', at: N('same way', 249.9), col: GREEN }, mid: { html: 'SAME WAY, IN REVERSE', at: N('in reverse', 251.0), size: 80 }, tr: { in: 'zoom' } }));
add(X('so what happens this', 252.3), 'calendar', (a, b) => calendar(a, b, { pal: 'dawn', pages: [['MON', '16', 'NOV'], ['TUE', '17', 'NOV'], ['WED', '18', 'NOV'], ['THU', '19', 'NOV'], ['FRI', '20', 'NOV']], hi: 3, hiAt: N('this thursday', 253.6), side: { html: 'THIS THURSDAY?', at: a + .3, size: 110, y: 200 }, tr: { in: 'whip' } }));
add(X('economists are split', 254.6), 'versus', (a, b) => versus(a, b, { pal: 'dawn', left: { prop: 'person', opts: { col: '#2c4a8a' }, scale: 1.4, y: .2, label: 'SOME: +0.25%', at: N('some expect', 257.0), col: RED }, right: { prop: 'person', opts: { col: '#2f6f5a', skin: '#8a5a3b' }, scale: 1.4, y: .2, label: 'OTHERS: NO CHANGE', at: N('others expect', 259.8), col: CYAN }, mid: { html: 'ECONOMISTS ARE SPLIT', at: N('are split', 255.9), size: 90, y: 180 }, src: 'BusinessTech, 27 Oct 2026', tr: { in: 'zoom' } }));
add(X('nobody knows for', 261.1), 'crowd', (a, b) => crowd(a, b, { pal: 'dawn', lit: [[1, N('know your number', 265.3) - .6, GOLD]], value: 'KNOW YOUR NUMBER', valueSize: 130, label: 'EITHER WAY', tr: { in: 'whip' } }));
add(X('so what does one', 267.3), 'street', (a, b) => street(a, b, { pal: 'gold', cam: 'door', tags: [{ text: 'BACK TO NALEDI', at: N('back to naledi', 271.5), x: 1340, y: 300 }], tr: { in: 'bands', colors: [GOLD, '#fff', '#2e1a5a'] } }));

// ======================= CH4: THE WORKED EXAMPLE (gold) =======================
add(X('naledi has three', 273.1), 'trio', (a, b) => trio(a, b, { pal: 'gold', items: [{ prop: 'house', scale: .85, label: 'HOME LOAN', at: N('a home loan', 276.0) }, { prop: 'car', scale: .6, label: 'CAR LOAN', at: N('a car loan', 276.8), col: CYAN }, { prop: 'jar', scale: .8, label: 'SAVINGS', at: N('some savings', 277.9), col: GREEN }], tr: { in: 'whip' } }));
add(X('to keep it simple', 279.0), 'stairs', (a, b) => stairs(a, b, { pal: 'gold', blocks: [{ h: 7.25, label: 'REPO 7.25%', at: a + .1 }, { h: 3.5, label: '+ 3.5%', col: CYAN, at: a + .3 }], total: { html: 'BOTH LOANS AT <span style="color:#f7be33">PRIME 10.75%</span>', at: N('at prime', 281.2), x: 600, y: 210, size: 92 }, tr: { in: 'zoom' } }));
add(X('her bond 12', 282.4), 'street', (a, b) => street(a, b, { pal: 'gold', cam: 'high', meter: { keys: [[a, 1200000]], label: 'HER BOND · 20 YEARS', at: N('12 million rand over', 283.7) }, tr: { in: 'whip' } }));
add(X('at 1075 she pays', 286.6), 'phone', (a, b) => ph(a, b, { pal: 'gold', cam: 'right', screenFn: bondApp([[a, 12183]], [['Bond', 'R1 200 000'], ['Term', '20 years'], ['Rate', '10.75%']]), side: { html: '10.75%<br><span style="color:#f7be33">R12 183</span>', at: N('12183', 289.3), x: 640, size: 120, sub: 'A MONTH', subAt: N('a month if', 291.6) }, tr: { in: 'zoom' } }));
add(X('if prime goes to', 292.6), 'versus', (a, b) => versus(a, b, { pal: 'gold', left: { prop: 'house', scale: .9, label: '10.75% → R12 183', at: a + .1 }, right: { prop: 'house', opts: { wall: '#ffe9b0' }, scale: .9, label: '11% → R12 386', at: N('12386', 295.4), col: GOLD }, link: 'beam', linkAt: N('goes to 11', 293.4), tr: { in: 'whip' } }));
add(X('thats 204 rand', 298.1), 'pile', (a, b) => pile(a, b, { pal: 'gold', to: 120, at: a + .1, dur: 4, noteCol: '#2f7d4f', noteVal: 'R', count: { from: 204, to: 2440, fmt: v => v < 250 ? '+R204 A MONTH' : (v > 2430 ? '≈ +R2 440' : '+' + R(v)) + ' A YEAR' }, label: 'FROM ONE QUARTER OF ONE PERCENT', tr: { in: 'zoom' } }));
add(X('her car 413000', 304.6), 'carShot', (a, b) => carShot(a, b, { pal: 'gold', col: '#2f6fd6', tag: { text: 'CAR LOAN R413 000 · 6 YEARS', at: N('413000', 306.0) }, tr: { in: 'whip' } }));
add(X('about what an average', 309.1), 'receipt', (a, b) => receipt(a, b, { pal: 'gold', source: 'TransUnion South Africa · Q1 2026 report', lines: ['average new vehicle loan amount: about', 'R299,000 in Q1 2020, an estimated', 'R413,000 by Q4 2025'], mark: 'R413,000 by Q4 2025', markAt: N('average new car loan', 310.4), foot: 'TransUnion SA, Vehicle Pulse / industry insights, Q1 2026', tr: { in: 'zoom' } }));
add(X('at 1075 7808', 312.8), 'carShot', (a, b) => carShot(a, b, { pal: 'gold', col: '#2f6fd6', ry: 2.2, meter: { keys: [[a, 7808]], label: 'A MONTH AT 10.75%', at: N('7808', 314.8) }, tr: { in: 'whip' } }));
add(X('at 11 7861', 317.9), 'bars', (a, b) => bars(a, b, { pal: 'gold', items: [{ label: 'AT 10.75%', value: 7808, at: a + .1, col: '#8a90c8', text: 'R7 808' }, { label: 'AT 11%', value: 7861, at: N('7861', 319.3), col: GOLD, text: 'R7 861' }], fmt: v => R(v), title: 'HER CAR: <mark>+R53 A MONTH</mark>', titleAt: N('53 rand more', 321.9), tr: { in: 'zoom' } }));
add(X('her credit card', 323.8), 'ceiling', (a, b) => ceiling(a, b, { pal: 'steel', ceil: [[a, '21.25%'], [N('a quarter percent more', 328.2) + .3, '21.50%']], capText: 'R20 000 AT ', side: { html: '+R4 A MONTH', at: N('about 4 rand', 330.0), y: 960, size: 90 }, tr: { in: 'zoom' } }));
add(X('add it up', 331.6), 'bars', (a, b) => bars(a, b, { pal: 'gold', items: [{ label: 'BOND', value: 204, at: a + .3, col: GOLD, text: '+R204' }, { label: 'CAR', value: 53, at: a + .6, col: CYAN, text: '+R53' }, { label: 'CARD', value: 4, at: a + .9, col: PINK, text: '+R4' }, { label: 'TOTAL', value: 260, at: N('about 260', 333.0), col: '#ffffff', text: '≈ R260' }], gap: 2.6, fmt: v => 'R' + Math.round(v), title: 'EVERY MONTH, FROM <mark>+0.25%</mark>', titleAt: N('one quarter of one', 336.9), tr: { in: 'whip' } }));
add(X('now her savings', 338.8), 'jar', (a, b) => jarShot(a, b, { pal: 'cyan', count: { keys: [[a, 10000]], x: 1380 }, label: 'NALEDI\'S SAVINGS', tr: { in: 'zoom' } }));
add(X('if her bank passes', 343.2), 'phone', (a, b) => ph(a, b, { pal: 'cyan', cam: 'left', screenFn: appScreen({ title: 'MY SAVINGS', bigLabel: 'Balance', bigKeys: [[a, 10000]], rows: [['Rate', '+0.25%', N('full quarter percent', 344.6)], ['Extra interest', '+R25 a year', N('25 rand more', 346.2)]] }), side: { html: '+R25', at: N('25 rand more', 346.2), x: 1300, size: 200, sub: 'IF THE BANK PASSES IT ON', subAt: N('25 rand more', 346.2) + .3 }, tr: { in: 'whip' } }));
add(X('not a month', 348.0), 'equation', (a, b) => equation(a, b, { pal: 'cyan', rows: [[{ text: 'NOT A MONTH.', at: a + .1, size: 1.1 }], [{ text: 'A YEAR.', at: N('a year thats', 349.0), col: GOLD, size: 1.4 }]], tr: { in: 'flash', tin: .2 } }));
add(X('thats the lopsided', 350.2), 'scale', (a, b) => scale(a, b, { pal: 'gold', at: N('lopsided', 351.3), side: { html: 'A HIKE COSTS YOU <span style="color:#ff5d5d">FAR MORE</span> THAN IT PAYS YOU', at: N('costs you far more', 355.2), size: 66 }, tr: { in: 'zoom' } }));
add(X('and if the rate is cut', 358.4), 'sarb', (a, b) => sarb(a, b, { pal: 'dawn', rates: [[a + .1, '7.25%'], [N('cut by a quarter', 359.7) + .3, '7.00%']], side: { html: 'IF IT\'S <span style="color:#2fd27f">CUT</span> INSTEAD', at: N('cut by a quarter', 359.7), size: 90, y: 950 }, tr: { in: 'whip' } }));
add(X('naledi pays about 202', 360.9), 'street', (a, b) => street(a, b, { pal: 'dawn', cam: 'roof', meter: { keys: [[a, 12183], [N('202 rand less', 362.6) + .4, 11981]], label: 'ABOUT R202 LESS A MONTH', at: a + .1 }, tags: [{ text: 'SAME MATHS, IN REVERSE', at: N('same maths', 365.0), x: 960, y: 900, col: GREEN }], tr: { in: 'zoom' } }));
add(X('but small steps add', 367.2), 'stairs', (a, b) => stairs(a, b, { pal: 'gold', blocks: [{ h: 4.5, label: 'PRIME 10.25% · BEFORE MAY', at: a + .1 }, { h: 2.4, label: '+0.25% · MAY', col: '#ffcf3a', at: N('since may', 369.7) + .3 }, { h: 2.4, label: '+0.25% · SEPTEMBER', col: '#ff7a3d', at: N('half a percent', 371.6) }], tr: { in: 'whip' } }));
add(X('on naledis bond', 372.9), 'pile', (a, b) => pile(a, b, { pal: 'gold', to: 160, at: a + .1, dur: 2.6, noteCol: '#2f7d4f', noteVal: 'R', count: { from: 0, to: 403, fmt: v => '+R' + Math.round(v) }, label: 'MORE A MONTH SINCE MAY', tr: { in: 'zoom' } }));

// ======================= CH5: FIVE STEPS (cyan) =======================
add(X('so how do you work', 377.7), 'title', (a, b) => title(a, b, { pal: 'cyan', kicker: 'YOUR NUMBER', lines: ['5 STEPS'], size: 1.7, prop: 'smart', propOpts: { pos: [3.8, 1.6, -3], scale: 1.4 }, tr: { in: 'bands', colors: [CYAN, '#fff', '#06304a'] } }));
add(X('step one find', 380.9), 'trio', (a, b) => trio(a, b, { pal: 'cyan', kicker: 'STEP 1 · FIND YOUR RATE', items: [{ prop: 'house', scale: .85, label: 'BOND', at: a + .2 }, { prop: 'car', scale: .6, label: 'CAR', at: N('car or credit', 384.6), col: CYAN }, { prop: 'card', scale: .55, y: 1.3, label: 'CREDIT CARD', at: N('credit card statement', 385.1), col: PINK }], tr: { in: 'whip' } }));
add(X('and look for prime', 386.4), 'statement', (a, b) => statement(a, b, { pal: 'cyan', rows: [['Interest rate type', 'Variable'], ['Linked to', 'PRIME'], ['Your margin', '+ or −']], marks: [[1, N('for prime', 386.9) + .2], [2, N('plus or minus something', 387.9)]], tr: { in: 'zoom' } }));
add(X('if it says fixed', 389.6), 'number', (a, b) => number(a, b, { pal: 'cyan', text: 'FIXED?', at: N('fixed', 390.3) - .1, label: 'YOUR RATE WON\'T MOVE FOR NOW', props: 'coins', tr: { in: 'whip' } }));
add(X('step two work', 393.0), 'months', (a, b) => months(a, b, { pal: 'cyan', kicker: 'STEP 2 · WORK OUT YOUR NUMBER', label: 'A 20-YEAR BOND = 240 MONTHLY PAYMENTS', tr: { in: 'zoom' } }));
add(X('on a twentyyear bond', 396.9), 'equation', (a, b) => equation(a, b, { pal: 'cyan', parts: [{ text: '+0.25%', at: N('every quarter percent', 398.0) }, { text: '≈', at: N('is about 17', 399.8) }, { text: 'R17', at: N('17 rand a month', 400.4), col: GOLD }], label: 'A MONTH ON A 20-YEAR BOND (R16.96, OUR CALCULATION)', tr: { in: 'whip' } }));
add(X('for every 100000', 401.6), 'pile', (a, b) => pile(a, b, { pal: 'cyan', to: 100, at: a + .1, dur: 1.6, noteCol: '#2f7d4f', noteVal: 'R', count: { from: 0, to: 100000, fmt: v => R(v) }, label: 'FOR EVERY R100 000 YOU OWE', tr: { in: 'zoom' } }));
add(X('owe 800000', 404.4), 'phone', (a, b) => ph(a, b, { pal: 'cyan', cam: 'right', screenFn: appScreen({ title: 'YOUR NUMBER', bigLabel: 'Bond owed', bigKeys: [[a, 800000]], rows: [['Per R100 000', '× 8', N('eight times', 405.8)], ['Each 0.25%', '8 × R17', N('17 rand about', 406.5)], ['About', 'R136 a month', N('136', 409.0)]] }), side: { html: 'OWE R800 000?<br><span style="color:#f7be33">≈ R136</span>', at: N('136', 409.0) - .3, x: 640, size: 110, sub: 'A MONTH PER 0.25%', subAt: N('136', 409.0) }, tr: { in: 'zoom' } }));
add(X('on a sixyear car', 410.9), 'carShot', (a, b) => carShot(a, b, { pal: 'cyan', col: '#d9483b', tag: { text: '6-YEAR CAR LOAN: ≈ R13 PER R100 000', at: N('13 rand per', 412.9), size: 50 }, tr: { in: 'whip' } }));
add(X('so a 300000', 415.6), 'equation', (a, b) => equation(a, b, { pal: 'cyan', parts: [{ text: '3', at: a + .2 }, { text: '×', at: a + .35 }, { text: 'R12.78', at: a + .5 }, { text: '≈', at: N('about 38', 418.7) - .2 }, { text: 'R38', at: N('38', 419.0), col: GOLD }], label: 'A R300 000 CAR LOAN', tr: { in: 'zoom' } }));
add(X('step three build', 420.2), 'jar', (a, b) => jarShot(a, b, { pal: 'cyan', kicker: 'STEP 3 · BUILD A BUFFER', base: 0, drops: [[N('put that number aside', 424.0), 10]], count: { keys: [[a, 0], [N('put that number aside', 424.0) + .6, 204]], x: 1380 }, label: 'SET ASIDE BEFORE THURSDAY', tr: { in: 'whip' } }));
add(X('for naledi thats', 428.0), 'pile', (a, b) => pile(a, b, { pal: 'cyan', to: 60, at: a + .1, dur: 1.2, noteCol: '#2f7d4f', noteVal: 'R', count: { from: 0, to: 204, fmt: v => R(v) }, label: 'NALEDI\'S BUFFER, EVERY MONTH', tr: { in: 'zoom' } }));
add(X('if it doesnt go up', 430.9), 'calendar', (a, b) => calendar(a, b, { pal: 'cyan', pages: [['WED', '18', 'NOV'], ['THU', '19', 'NOV'], ['FRI', '20', 'NOV']], hi: 1, hiAt: a + .6, side: { html: 'NO HIKE? <span style="color:#2fd27f">YOU\'VE SAVED IT</span>', at: N('youve saved it', 432.2), size: 90, y: 210 }, tr: { in: 'zoom' } }));
add(X('step four pay', 433.3), 'stairs', (a, b) => stairs(a, b, { pal: 'steel', kicker: 'STEP 4 · PAY THE EXPENSIVE DEBT FIRST', blocks: [{ h: 3.6, label: 'REPO 7.25%', at: a + .2 }, { h: 7, label: '+ 14%', col: RED, at: N('expensive debt', 434.9) }], total: { html: 'UP TO <span style="color:#ff5d5d">21.25%</span>', at: N('expensive debt first', 435.2) + .3, x: 560, y: 200 }, tr: { in: 'whip' } }));
add(X('credit cards and store', 436.6), 'ceiling', (a, b) => ceiling(a, b, { pal: 'steel', ceil: [[a, '21.25%']], capText: 'CREDIT & STORE CARDS: UP TO ', tr: { in: 'zoom' } }));
add(X('every rand you pay', 441.7), 'scale', (a, b) => scale(a, b, { pal: 'steel', at: a + .3, left: 'CARD DEBT: UP TO 21.25%', right: 'A SAVINGS ACCOUNT', side: { html: 'PAYING IT OFF <span style="color:#f7be33">BEATS SAVING</span>', at: N('beats almost any', 443.6), size: 80 }, tr: { in: 'zoom' } }));
add(X('step five make', 445.9), 'jar', (a, b) => jarShot(a, b, { pal: 'cyan', kicker: 'STEP 5 · MAKE THE RATE WORK FOR YOU', drops: [[a + .5, 4], [a + 1.4, 4]], label: 'YOUR SAVINGS', tr: { in: 'whip' } }));
add(X('when rates rise check', 449.2), 'trio', (a, b) => trio(a, b, { pal: 'cyan', items: [{ prop: 'coins', opts: { n: 4 }, scale: 1.4, label: 'ACCOUNT A', at: a + .2 }, { prop: 'coins', opts: { n: 9 }, scale: 1.4, label: 'ACCOUNT B', at: N('compare accounts', 451.1) + .3, col: CYAN }, { prop: 'coins', opts: { n: 15 }, scale: 1.4, label: 'ACCOUNT C', at: N('compare accounts', 451.1) + .6, col: GREEN }], title: 'COMPARE WHAT YOUR <mark>SAVINGS EARN</mark>', titleAt: N('check what your savings', 449.8), tr: { in: 'zoom' } }));
add(X('and heres the habit', 455.4), 'phone', (a, b) => ph(a, b, { pal: 'gold', cam: 'left', screenFn: bondApp([[a, 12183], [N('12386', 458.5) + .3, 12386]], [['Rate', '10.75%'], ['Due', 'R12 183'], ['Naledi pays', 'R12 386', N('12386', 458.5)]], { bigLabel: 'Naledi pays each month' }), side: { html: 'THE HABIT:<br><span style="color:#f7be33">PAY THE HIGHER AMOUNT</span>', at: N('the higher amount', 457.5), x: 1300, size: 84 }, tr: { in: 'bands', colors: [GOLD, '#fff', '#2e1a5a'] } }));
add(X('even while her rate', 460.8), 'statement', (a, b) => statement(a, b, { pal: 'gold', rows: [['Your rate', '10.75%'], ['Instalment due', 'R12 183'], ['Naledi pays', 'R12 386'], ['Extra each month', 'R204']], marks: [[0, N('still 1075', 462.5)], [2, a + 1.8], [3, a + 2.6]], tr: { in: 'zoom' } }));
add(X('her bond is paid', 465.3), 'months', (a, b) => months(a, b, { pal: 'gold', label: 'PAID OFF ABOUT A YEAR EARLY (227 MONTHS)', cut: 13, cutAt: N('about a year early', 466.6), tr: { in: 'whip' } }));
add(X('and she saves more', 468.0), 'pile', (a, b) => pile(a, b, { pal: 'gold', to: 220, at: a + .1, dur: 2.8, noteCol: '#2f7d4f', noteVal: 'R', count: { from: 0, to: 112000, fmt: v => v > 111990 ? 'MORE THAN R112 000' : R(v) }, label: 'LESS INTEREST', tr: { in: 'zoom' } }));
add(X('all from paying', 472.1), 'equation', (a, b) => equation(a, b, { pal: 'gold', rows: [[{ text: 'ALL FROM', at: a + .1, size: .9 }], [{ text: 'R204', at: N('204 rand extra', 473.6), col: GOLD, size: 1.4 }, { text: 'A MONTH', at: N('extra a month', 474.3), size: 1.0 }]], tr: { in: 'whip' } }));

// ======================= RECAP (night) =======================
add(X('lets recap', 475.8), 'title', (a, b) => title(a, b, { pal: 'night', lines: ['RECAP'], size: 2, tr: { in: 'bands', colors: [GOLD, '#fff', '#1c1850'] } }));
add(X('the repo rate is what', 477.0), 'journey', (a, b) => journey(a, b, { pal: 'night', hits: [[a, 0], [N('to get prime', 481.5), 1]], labels: ['REPO 7.25%', '+3.5% = PRIME'], tr: { in: 'zoom' } }));
add(X('your loans are priced', 483.9), 'statement', (a, b) => statement(a, b, { pal: 'night', rows: [['Linked to', 'PRIME'], ['Your deal', '± your margin']], marks: [[0, a + .4], [1, a + 1.2]], tr: { in: 'whip' } }));
add(X('a quarter percent on a 12', 486.0), 'street', (a, b) => street(a, b, { pal: 'night', cam: 'wide', meter: { keys: [[a, 12183], [N('204 rand a month your', 488.9), 12386]], label: '+R204 A MONTH ON R1.2 MILLION', at: a + .1 }, tr: { in: 'whip' } }));
add(X('your rule of thumb', 491.6), 'crowd', (a, b) => crowd(a, b, { pal: 'night', lit: [[.17, a + .3, GOLD]], value: 'R17', valueSize: 220, label: 'PER R100 000 OWED · EVERY 0.25%', tr: { in: 'zoom' } }));
add(X('if you owe more than you save a hike', 495.7), 'scale', (a, b) => scale(a, b, { pal: 'night', at: a + .3, side: { html: 'OWE MORE THAN YOU SAVE? <span style="color:#ff5d5d">HIKES COST YOU</span>', at: a + .4, size: 70 }, tr: { in: 'zoom' } }));
add(X('pay the expensive debt first and', 500.0), 'months', (a, b) => months(a, b, { pal: 'night', label: 'EXPENSIVE DEBT FIRST · A LITTLE EXTRA ON THE BOND', cut: 13, cutAt: N('a little extra', 503.5), tr: { in: 'whip' } }));
add(X('and whatever happens on', 505.1), 'calendar', (a, b) => calendar(a, b, { pal: 'night', pages: [['THU', '19', 'NOV']], hi: 0, hiAt: a + .4, side: { html: 'UP, DOWN OR NO CHANGE: <span style="color:#f7be33">YOU KNOW YOUR NUMBER</span>', at: N('you now know', 509.1), size: 62, y: 230 }, tr: { in: 'zoom' } }));
// end card
add(X('if this helped', 511.2), 'endcard', (a, b) => title(a, b, { pal: 'gold', lines: ['MONEY', 'FROM ZERO'], accentLine: 1, size: 1.1, prop: 'coins', propOpts: { n: 14, pos: [3.8, 0, -3], scale: 2 },
  ui: { build: u => { const s = C.subscribe(u, {}); const d = el('div', { class: 'abs' }, u, 'General information, not financial advice'); d.style.cssText += "font:600 34px/1 Barlow;color:rgba(255,255,255,.85);white-space:nowrap"; const nx = el('div', { class: 'abs' }, u, 'NEW SHORTS EVERY DAY · A FULL GUIDE EVERY WEEK'); nx.style.cssText += "font:800 44px/1 'Barlow Condensed';letter-spacing:.08em;color:#f7be33;white-space:nowrap"; return { s, d, nx }; },
    update: (q, t) => { const tS = N('subscribe to money', 511.9); q.s.set(t, tS); P(q.s.el, { x: 1420, y: 880, o: E.outC(prog(t, tS - .5, tS - .1)) }); P(q.nx, { x: 960, y: 975, o: prog(t, N('new shorts', 514.1) - .2, N('new shorts', 514.1) + .2) }); P(q.d, { x: 960, y: 1035, o: prog(t, N('this is general', 517.8) - .3, N('this is general', 517.8)) }); } }, tr: { in: 'bands', colors: [GOLD, '#fff', '#2e1a5a'] } }));
{ const tS = N('subscribe to money', 511.9); cue(tS + .75, 'click', .8); cue(tS + .8, 'chime', .45); }

cuts.sort((p, q) => p[0] - q[0]);
cuts.forEach(([a], i) => { if (i) cue(a, ['whoosh', 'swish', 'whoosh_low'][i % 3], .28); });
cuts.forEach(([a, fn], i) => fn(a, i + 1 < cuts.length ? cuts[i + 1][0] : END + 2.6));
window.DURATION = END + 2.6;
console.warn('CUTS ' + JSON.stringify(cuts.map(([a, , ty], i) => [+a.toFixed(2), +(i + 1 < cuts.length ? cuts[i + 1][0] : END + 2.6).toFixed(2), ty])));
