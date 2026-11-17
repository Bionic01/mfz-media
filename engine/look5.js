/* LOOK V5 (17 Nov 2026): bright flat 2D in the Kurzgesagt manner, for Money From Zero and Fluxr Explains.
   Rodney, 16 Nov 2026: "we need to adopt that kind of style. I think simple yet so engaging" ... "bright color".
   Adopt the techniques (flat rounded shapes, no outlines, soft gradients, glow, rim light, long soft shadows, grain,
   3-5 parallax layers, a camera that always drifts, secondary motion everywhere). Never copy Kurzgesagt's characters,
   artwork or exact palettes: the palettes below are our own.
   API: C.L5 (see engine/README.md "Look v5"). Everything is a pure function of time. */
'use strict';
(() => {
const C = window.CINE; const { sv, el, grad, clamp, lerp, E, prog, noise1, rnd, W, H } = C;

// ---------------- colour ----------------
const h2r = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
const r2h = a => '#' + a.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const A = h2r(a), B = h2r(b); return r2h(A.map((v, i) => lerp(v, B[i], t))); };
const lit = (c, t = .25) => mix(c, '#ffffff', t), dk = (c, t = .25) => mix(c, '#000000', t);

// Our own chapter palettes: deep saturated background stops (top, middle, horizon), three depth tones, a glow and accents.
// Never plain white, cream or pale grey backgrounds.
const PAL = {
  navy:    { sky: ['#0a1238', '#16287a', '#2f56c8'], far: '#1d3591', mid: '#152a74', near: '#0d1b52', glow: '#6fd0ff', a: ['#ff8f3a', '#ffd84a', '#ff5fa2', '#3fe6c8'] },
  purple:  { sky: ['#1a0b3d', '#43198a', '#8a3ad0'], far: '#5a24a8', mid: '#3f1885', near: '#2a0f5c', glow: '#ff9ef0', a: ['#ffb238', '#3fe0ff', '#ff5f8f', '#b8ff5a'] },
  teal:    { sky: ['#03263a', '#05607a', '#0fa3a8'], far: '#0a7a8c', mid: '#06566c', near: '#043a4c', glow: '#8affea', a: ['#ffcf3a', '#ff7a4a', '#ff5fa2', '#ffffff'] },
  magenta: { sky: ['#2a0630', '#7a0f63', '#d6347e'], far: '#9c1a72', mid: '#6e1058', near: '#45093c', glow: '#ffb3d9', a: ['#ffd23a', '#47e3ff', '#ff8a3a', '#9dff6a'] },
  sunset:  { sky: ['#2b0f45', '#a3305e', '#ff8a4a'], far: '#7a2a63', mid: '#55204f', near: '#341538', glow: '#ffd59a', a: ['#ffe14a', '#46d6ff', '#ff4f6a', '#8affc4'] },
  ember:   { sky: ['#1c0612', '#5a0d24', '#c22a2a'], far: '#7d1830', mid: '#561024', near: '#350a18', glow: '#ff9a6a', a: ['#ffd23a', '#ff6a3a', '#ff3d5a', '#ffe9c4'] },
  night:   { sky: ['#050b24', '#0f1f5a', '#26408f'], far: '#18306f', mid: '#10224f', near: '#0a1636', glow: '#a6c8ff', a: ['#ffd84a', '#ff7aa8', '#59f0d0', '#ff9a3a'] },
  mint:    { sky: ['#032a2a', '#0a6a5a', '#23b38a'], far: '#108064', mid: '#0a5e4c', near: '#063f34', glow: '#c8ffe4', a: ['#ffd23a', '#ff7a5a', '#4ad0ff', '#ffffff'] },
};
const ACC = { mfz: '#f7be33', fluxr: '#85ed70' };
const accent = () => ACC[(new URLSearchParams(location.search).get('theme')) || window.THEME || 'mfz'] || ACC.mfz;

// ---------------- paint helpers ----------------
/** rim-lit fill: light from the top-left, so a flat shape looks round */
const fill = (defs, c, { ang = 1, k = .22 } = {}) => grad(defs, [[0, lit(c, k)], [.55, c], [1, dk(c, k)]], ang ? { x1: 0, y1: 0, x2: .8, y2: 1 } : { x1: 0, y1: 0, x2: 0, y2: 1 });
const orbFill = (defs, c, a = 1) => grad(defs, [[0, c, a], [.45, c, a * .45], [1, c, 0]], { radial: true });
const ballFill = (defs, c) => grad(defs, [[0, lit(c, .45)], [.5, c], [1, dk(c, .3)]], { radial: true, cx: .5, cy: .5, r: .6, fx: .32, fy: .28 });
const T = (g, x, y, r = 0, s = 1, sy) => g.setAttribute('transform', `translate(${(+x).toFixed(2)},${(+y).toFixed(2)}) rotate(${(+r).toFixed(2)}) scale(${(+s).toFixed(4)},${(+(sy ?? s)).toFixed(4)})`);
const txt = (p, s, o = {}) => { const e = sv('text', Object.assign({ 'font-family': 'Barlow Condensed', 'font-weight': 800, 'text-anchor': 'middle', fill: '#fff' }, o), p); e.textContent = s; return e; };
/** long soft shadow cast to the lower right from a box (x,y,w,h) standing on y+h */
function longShadow(p, defs, x, y, w, h, { len = 260, col = '#000', a = .28 } = {}) {
  const f = grad(defs, [[0, col, a], [1, col, 0]], { x1: 0, y1: 0, x2: 1, y2: .55 });
  return sv('polygon', { points: `${x + w},${y} ${x + w + len},${y + len * .55} ${x + w + len},${y + h + len * .55} ${x + len * .35},${y + h + len * .2} ${x},${y + h}`, fill: f }, p);
}
const groundShadow = (p, defs, x, y, rx, ry = rx * .16, a = .35) => sv('ellipse', { cx: x, cy: y, rx, ry, fill: orbFill(defs, '#000', a) }, p);

// ---------------- the set: sky, parallax layers, camera, particles ----------------
/**
 * L5.set(ctx, pal, opts) builds a bright 2D world in a shot.
 * opts: cam {x0,y0,z0,x1,y1,z1,r0,r1} (eased over the shot) | ground 'hills'|'city'|'mountains'|'waves'|'none' | stars n |
 *       motes n | orbs n | horizon y (0..1) | seed
 * returns S: { w, sky, far, mid, sub, fg, ui, pal, acc, add(fn), tick(lt,t,k) }
 */
function set(ctx, palName = 'navy', o = {}) {
  const pal = typeof palName === 'string' ? PAL[palName] : palName; const acc = accent(); const r = rnd(o.seed || 7);
  const w = ctx.world(); const S = { w, pal, acc, fns: [], d: ctx.d };
  const L = (d, n, ww = 3000, hh = 1900) => w.layer(d, { name: n, w: ww, h: hh });
  S.sky = L(6, 'sky', 3400, 2200); S.far = L(3.2, 'far'); S.mid = L(1.8, 'mid', 2600, 1700); S.sub = L(1, 'sub', 1920, 1080); S.fg = L(.62, 'fg', 2200, 1400);
  const sky = S.sky, sw = 3400, shh = 2200, hz = o.horizon ?? .62;
  sv('rect', { x: 0, y: 0, width: sw, height: shh, fill: grad(sky.defs, [[0, pal.sky[0]], [.55, pal.sky[1]], [1, pal.sky[2]]]) }, sky.svg);
  // big soft glows (a sun or a city glow behind the subject)
  S.orbs = []; const nOrb = o.orbs ?? 3;
  for (let i = 0; i < nOrb; i++) { const c = sv('circle', { cx: sw * (.3 + .4 * r()), cy: shh * (.35 + .3 * r()), r: 500 + 500 * r(), fill: orbFill(sky.defs, i ? pal.a[i % pal.a.length] : pal.glow, i ? .22 : .5) }, sky.svg); S.orbs.push({ c, ph: r() * 9, r0: +c.getAttribute('r') }); }
  // stars / far dust
  S.stars = []; const nS = o.stars ?? 70; const sf = orbFill(sky.defs, '#ffffff', 1);
  for (let i = 0; i < nS; i++) { const c = sv('circle', { cx: r() * sw, cy: r() * shh * hz * 1.1, r: 2 + r() * 5, fill: sf, opacity: .2 + .5 * r() }, sky.svg); S.stars.push({ c, ph: r() * 20, sp: .6 + r() * 2, o: +c.getAttribute('opacity') }); }
  // ground layers
  const g = o.ground ?? 'hills';
  const hillPath = (wid, base, amp, n, seed) => { const rr = rnd(seed); let d = `M0 ${base}`; for (let i = 0; i <= n; i++) { const x = i / n * wid; const y = base - amp * (.4 + .6 * rr()); d += ` Q${x - wid / n / 2} ${y - amp * .5 * rr()} ${x} ${y}`; } return d + ` L${wid} 3000 L0 3000 Z`; };
  if (g === 'hills' || g === 'mountains') {
    const peaks = g === 'mountains';
    const mkM = (Ly, wid, base, amp, n, seed, col) => { if (peaks) { const rr = rnd(seed); let d = `M0 ${base}`; for (let i = 0; i <= n; i++) { const x = i / n * wid; d += ` L${x - wid / n / 2} ${base - amp * (.5 + .5 * rr())} L${x} ${base - amp * .15 * rr()}`; } d += ` L${wid} 3000 L0 3000 Z`; return sv('path', { d, fill: fill(Ly.defs, col, { ang: 0, k: .18 }) }, Ly.svg); } return sv('path', { d: hillPath(wid, base, amp, n, seed), fill: fill(Ly.defs, col, { ang: 0, k: .18 }) }, Ly.svg); };
    mkM(S.far, 3000, 1900 * hz + 80, 260, 7, 3, pal.far); mkM(S.mid, 2600, 1700 * hz + 160, 170, 5, 5, pal.mid);
  } else if (g === 'city') {
    const city = (Ly, wid, base, n, hmax, col, seed, lights) => { const rr = rnd(seed); let x = 0; const gg = sv('g', {}, Ly.svg); const f = fill(Ly.defs, col, { k: .15 }); S.win = S.win || [];
      while (x < wid) { const bw = 90 + rr() * 160, bh = hmax * (.35 + .65 * rr()); sv('rect', { x, y: base - bh, width: bw, height: bh + 1400, rx: 14, fill: f }, gg);
        if (lights) for (let yy = base - bh + 30; yy < base - 20; yy += 46) for (let xx = x + 18; xx < x + bw - 26; xx += 34) if (rr() < .55) S.win.push({ e: sv('rect', { x: xx, y: yy, width: 16, height: 22, rx: 4, fill: pal.a[1], opacity: .7 }, gg), ph: rr() * 30 });
        x += bw + 10 + rr() * 30; } };
    city(S.far, 3000, 1900 * hz + 120, 0, 520, pal.far, 11, true); city(S.mid, 2600, 1700 * hz + 230, 0, 360, pal.mid, 13, false);
  } else if (g === 'waves') {
    sv('path', { d: hillPath(3000, 1900 * hz + 160, 70, 12, 21), fill: fill(S.far.defs, pal.far, { ang: 0 }) }, S.far.svg); sv('path', { d: hillPath(2600, 1700 * hz + 240, 50, 10, 23), fill: fill(S.mid.defs, pal.mid, { ang: 0 }) }, S.mid.svg);
  }
  if (g !== 'none' && o.floor !== false) sv('rect', { x: -400, y: 1080 * (o.floorY ?? .86), width: 2720, height: 900, fill: grad(S.sub.defs, [[0, pal.near], [1, dk(pal.near, .4)]]) }, S.sub.svg);
  // near motes (foreground, out of focus by size, not by blur filters: cheaper)
  S.motes = []; const nM = o.motes ?? 18; const mf = orbFill(S.fg.defs, pal.glow, .9);
  for (let i = 0; i < nM; i++) { const c = sv('circle', { cx: r() * 2200, cy: r() * 1400, r: 6 + r() * 26, fill: mf, opacity: .12 + .25 * r() }, S.fg.svg); S.motes.push({ c, x: +c.getAttribute('cx'), y: +c.getAttribute('cy'), ph: r() * 50, sp: .4 + r() }); }
  S.ui = C.ui(ctx.root);
  const cam = Object.assign({ x0: 0, y0: 0, z0: 1, x1: 0, y1: 0, z1: 1.06, r0: 0, r1: 0 }, o.cam || {});
  S.add = fn => { S.fns.push(fn); return fn; };
  S.tick = (lt, t, k) => {
    const q = E.ioS(clamp(k)); const ph = (ctx.a || 0) * .7;
    w.camera({ x: lerp(cam.x0, cam.x1, q) + noise1(t * .23 + ph, 3) * 22, y: lerp(cam.y0, cam.y1, q) + noise1(t * .19 + ph, 5) * 12, zoom: lerp(cam.z0, cam.z1, q), rot: lerp(cam.r0, cam.r1, q) + noise1(t * .11 + ph, 7) * .4, focus: 1, dof: 0 });
    S.orbs.forEach(b => b.c.setAttribute('r', (b.r0 * (1 + .06 * Math.sin(t * .8 + b.ph))).toFixed(1)));
    S.stars.forEach(s => s.c.setAttribute('opacity', (s.o * (.55 + .45 * Math.sin(t * s.sp + s.ph))).toFixed(3)));
    if (S.win) S.win.forEach(wd => wd.e.setAttribute('opacity', (Math.sin(t * .7 + wd.ph) > -.85 ? .75 : .15)));
    S.motes.forEach(m => { m.c.setAttribute('cx', (m.x + noise1(t * .15 * m.sp + m.ph, 2) * 80).toFixed(1)); m.c.setAttribute('cy', (m.y - ((t * 22 * m.sp) % 300) + noise1(t * .1 + m.ph, 4) * 40).toFixed(1)); });
    S.fns.forEach(fn => fn(lt, t, k));
  };
  return S;
}
/** a group placed in layer L at x,y (layer coordinates: sub layer = screen coordinates) */
const grp = (L, x = 0, y = 0, s = 1) => { const g = sv('g', {}, L.svg); T(g, x, y, 0, s); g._x = x; g._y = y; g._s = s; return g; };
/** place a group with pop-in at time a (overshoot), plus idle bob afterwards */
function pop(g, lt, a, { x = g._x, y = g._y, s = g._s, dur = .55, bob = 6, ph = 0, r = 0, sway = 0 } = {}) {
  const q = clamp((lt - a) / dur); const k = q <= 0 ? 0 : E.outB(q); const ib = Math.sin((lt + ph) * 2.1) * bob * (q >= 1 ? 1 : q);
  T(g, x, y + ib, r + Math.sin((lt + ph) * 1.3) * sway, s * Math.max(0.0001, k)); g.setAttribute('opacity', q <= 0 ? 0 : 1); return k;
}

// ---------------- characters: simple, friendly, generic (round head, no detailed face, never a real person) ----------------
const SK = ['#8a5a3c', '#6b4429', '#b07a52', '#c99470', '#4e3020', '#e0b08a'];
const POSES = { // [left upper angle, left elbow], [right ...]; angles from straight down, positive = outward/up
  stand: [[10, -8], [10, -8]], wave: [[10, -8], [150, 25]], point: [[10, -8], [85, 5]], pointL: [[85, 5], [10, -8]], shock: [[140, 30], [140, 30]],
  cheer: [[165, 5], [165, 5]], sad: [[4, 0], [4, 0]], think: [[12, -40], [35, -140]], phone: [[12, -30], [30, -125]], shrug: [[60, -95], [60, -95]],
  hold: [[25, -95], [25, -95]], give: [[10, -8], [70, -25]], hips: [[35, -130], [35, -130]], present: [[10, -8], [65, 35]] };
function figure(L, o = {}) {
  const seed = o.seed || 1; const r = rnd(seed * 7 + 3); const defs = L.defs;
  const skin = o.skin || SK[seed % SK.length]; const shirt = o.shirt || '#ff8f3a', pants = o.pants || '#22305e', hairC = o.hairC || '#1a1222';
  const g = grp(L, o.x || 0, o.y || 0, o.s || 1); const shad = groundShadow(g, defs, 0, 0, 95, 18, .4);
  const legs = [-22, 22].map(dx => { const lg = sv('g', {}, g); sv('rect', { x: -15, y: -150, width: 30, height: 150, rx: 15, fill: fill(defs, pants) }, lg); sv('ellipse', { cx: dx < 0 ? -8 : 8, cy: -4, rx: 24, ry: 12, fill: dk(pants, .45) }, lg); return { lg, dx }; });
  const body = sv('g', {}, g);
  const torso = sv('path', { d: o.female ? 'M-56,-150 Q-62,-262 -40,-282 L40,-282 Q62,-262 56,-150 Q60,-120 70,-118 L-70,-118 Q-60,-120 -56,-150Z' : 'M-58,-148 Q-62,-262 -42,-284 L42,-284 Q62,-262 58,-148 Z', fill: fill(defs, shirt) }, body);
  sv('path', { d: 'M-40,-282 Q0,-262 40,-282', stroke: dk(shirt, .25), 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, body);
  const arms = [0, 1].map(i => { const a = sv('path', { fill: 'none', stroke: lit(shirt, .08), 'stroke-width': 30, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, body); const hnd = sv('circle', { r: 17, fill: ballFill(defs, skin) }, body); return { a, hnd, i }; });
  const head = sv('g', {}, body);
  sv('rect', { x: -14, y: -312, width: 28, height: 34, rx: 10, fill: dk(skin, .15) }, head);
  if (o.hair === 'bun' || o.female) sv('circle', { cx: 0, cy: -420, r: 34, fill: hairC }, head);
  sv('circle', { cx: 0, cy: -360, r: 62, fill: ballFill(defs, skin) }, head);
  if (o.hair !== 'bald') sv('path', { d: o.hair === 'bun' || o.female ? 'M-64,-360 Q-66,-428 0,-428 Q66,-428 64,-360 Q50,-396 0,-398 Q-50,-396 -64,-360Z' : 'M-62,-366 Q-60,-424 0,-426 Q60,-424 62,-366 Q40,-392 0,-394 Q-40,-392 -62,-366Z', fill: hairC }, head);
  if (o.elder) sv('path', { d: 'M-64,-360 Q-66,-428 0,-428 Q66,-428 64,-360 Q50,-396 0,-398 Q-50,-396 -64,-360Z', fill: '#d8d4e6' }, head);
  if (o.glasses) { sv('circle', { cx: -22, cy: -362, r: 15, fill: 'none', stroke: '#1a1222', 'stroke-width': 4 }, head); sv('circle', { cx: 22, cy: -362, r: 15, fill: 'none', stroke: '#1a1222', 'stroke-width': 4 }, head); }
  const eyes = [-22, 22].map(dx => sv('ellipse', { cx: dx, cy: -362, rx: 6.5, ry: 8.5, fill: '#1a1222' }, head));
  const mouth = sv('path', { fill: 'none', stroke: '#1a1222', 'stroke-width': 5, 'stroke-linecap': 'round' }, head);
  sv('circle', { cx: -36, cy: -340, r: 9, fill: '#ff6a6a', opacity: .25 }, head); sv('circle', { cx: 36, cy: -340, r: 9, fill: '#ff6a6a', opacity: .25 }, head);
  if (o.cap) sv('path', { d: 'M-62,-372 Q-60,-430 0,-430 Q60,-430 62,-372 Z M40,-378 L100,-372 Q90,-360 40,-366Z', fill: o.cap }, head);
  // rim light on the back edge
  sv('path', { d: 'M48,-400 Q70,-360 50,-318', stroke: lit(skin, .5), 'stroke-width': 5, fill: 'none', opacity: .5, 'stroke-linecap': 'round' }, head);
  let prev = POSES.stand; const held = [null, null];
  const F = { g, o, hold(i, node) { const c = sv('g', {}, body); c.appendChild(node); held[i] = c; },
    set(t, { pose = 'stand', x = g._x, y = g._y, s = g._s, flip = false, walk = null, talk = 0, expr = 'smile', look = 0, poseK = 1, from = null, o: op = 1 } = {}) {
      const P0 = POSES[from || pose] || POSES.stand, P1 = POSES[pose] || POSES.stand; const kk = E.ioC(clamp(poseK));
      const bob = Math.sin(t * 2.2 + seed) * 4; const breathe = 1 + Math.sin(t * 1.7 + seed) * .012;
      let lA = 0, lB = 0, wbob = 0; if (walk !== null) { lA = Math.sin(walk) * 22; lB = -lA; wbob = Math.abs(Math.cos(walk)) * 10; }
      legs[0].lg.setAttribute('transform', `translate(${legs[0].dx},0) rotate(${lA.toFixed(2)},0,-150)`); legs[1].lg.setAttribute('transform', `translate(${legs[1].dx},0) rotate(${lB.toFixed(2)},0,-150)`);
      const slump = pose === 'sad' ? 10 : 0;
      body.setAttribute('transform', `translate(0,${(bob * .5 - wbob + slump).toFixed(2)}) scale(1,${breathe.toFixed(4)})`);
      head.setAttribute('transform', `rotate(${(look * 8 + (pose === 'sad' ? 10 : 0) + Math.sin(t * .9 + seed) * 2).toFixed(2)},0,-300)`);
      arms.forEach(({ a, hnd }, i) => { const sgn = i ? 1 : -1; const pa = lerp(P0[i][0], P1[i][0], kk), pb = lerp(P0[i][1], P1[i][1], kk);
        const wav = pose === 'wave' && i === 1 ? Math.sin(t * 9) * 18 : 0; const sw = walk !== null ? -Math.sin(walk) * 20 * sgn : Math.sin(t * 1.6 + i) * 2;
        const th = (pa + sw) * Math.PI / 180, ph2 = (pa + pb + wav + sw) * Math.PI / 180; const sx = sgn * 44, sy = -262;
        const ex = sx + sgn * Math.sin(th) * 72, ey = sy + Math.cos(th) * 72, hx = ex + sgn * Math.sin(ph2) * 66, hy = ey + Math.cos(ph2) * 66;
        a.setAttribute('d', `M${sx},${sy} L${ex.toFixed(1)},${ey.toFixed(1)} L${hx.toFixed(1)},${hy.toFixed(1)}`); hnd.setAttribute('cx', hx.toFixed(1)); hnd.setAttribute('cy', hy.toFixed(1));
        if (held[i]) held[i].setAttribute('transform', `translate(${hx.toFixed(1)},${hy.toFixed(1)})`); });
      const bl = ((t + seed * 1.37) % 3.9) < .13 ? .12 : 1; eyes.forEach(e => e.setAttribute('ry', (8.5 * bl).toFixed(2)));
      const ty = talk > 0 ? Math.abs(Math.sin(t * 13)) * 8 * talk : 0;
      mouth.setAttribute('d', expr === 'shock' || expr === 'o' ? `M-9,-330 Q0,${-312 - ty} 9,-330 Q0,-344 -9,-330` : expr === 'sad' || expr === 'worried' ? `M-14,-326 Q0,${-338 - ty} 14,-326` : `M-16,-334 Q0,${-320 + ty} 16,-334`);
      g.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${(s * (flip ? -1 : 1)).toFixed(4)},${s.toFixed(4)})`); g.setAttribute('opacity', op); } };
  F.set(0, {}); return F;
}

// ---------------- props (flat, rounded, rim-lit; long soft shadows) ----------------
/** phone with a bright readable screen. screen(g, defs, w, h) draws content (screen coords 0..w,0..h) and may return tick(t) */
function phone(L, { x = 960, y = 540, s = 1, w = 300, h = 600, body = '#1b1f3a', screen = null, glow = '#6fd0ff' } = {}) {
  const g = grp(L, x, y, s); const defs = L.defs;
  sv('circle', { cx: 0, cy: 0, r: h * .75, fill: orbFill(defs, glow, .35) }, g);
  sv('rect', { x: -w / 2 - 16, y: -h / 2 - 16, width: w + 32, height: h + 32, rx: 46, fill: fill(defs, body) }, g);
  sv('rect', { x: -w / 2 - 16, y: -h / 2 - 16, width: 10, height: h + 32, rx: 5, fill: lit(body, .35), opacity: .5 }, g);
  const sc = sv('g', {}, g); T(sc, -w / 2, -h / 2); const cp = C.uid('cp'); const cl = sv('clipPath', { id: cp }, defs); sv('rect', { x: 0, y: 0, width: w, height: h, rx: 32 }, cl); sc.setAttribute('clip-path', `url(#${cp})`);
  sv('rect', { x: 0, y: 0, width: w, height: h, fill: grad(defs, [[0, '#f4f7ff'], [1, '#dfe8ff']]) }, sc);
  sv('rect', { x: w * .38, y: 12, width: w * .24, height: 14, rx: 7, fill: '#11142a' }, sc);
  const tick = screen ? screen(sc, defs, w, h) : null; g.tick = t => tick && tick(t); return g;
}
/** generic office tower (company HQ): windows flicker */
function tower(L, { x = 960, y = 900, s = 1, w = 300, h = 640, col = '#3a4fd0', win = '#ffd84a', label = '', crown = true } = {}) {
  const g = grp(L, x, y, s); const defs = L.defs; longShadow(g, defs, -w / 2, -h, w, h, { len: 300 });
  sv('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 18, fill: fill(defs, col) }, g); sv('rect', { x: -w / 2, y: -h, width: 14, height: h, rx: 7, fill: lit(col, .4), opacity: .55 }, g);
  if (crown) sv('rect', { x: -w * .3, y: -h - 60, width: w * .6, height: 64, rx: 14, fill: fill(defs, dk(col, .15)) }, g);
  const wins = []; const rr = rnd(w + h);
  for (let yy = -h + 40; yy < -60; yy += 58) for (let xx = -w / 2 + 30; xx < w / 2 - 40; xx += 52) wins.push({ e: sv('rect', { x: xx, y: yy, width: 30, height: 36, rx: 6, fill: win }, g), ph: rr() * 40 });
  if (label) { sv('rect', { x: -w * .42, y: -h + 8, width: w * .84, height: 0, fill: 'none' }, g); }
  sv('rect', { x: -48, y: -96, width: 96, height: 96, rx: 10, fill: dk(col, .45) }, g);
  g.tick = t => wins.forEach(o => o.e.setAttribute('opacity', Math.sin(t * .5 + o.ph) > -.7 ? .95 : .25)); return g;
}
/** a generic shop with a striped awning (no real logos) */
function shop(L, { x = 960, y = 900, s = 1, w = 520, h = 380, col = '#ff8f3a', aw = ['#ffd84a', '#ff5fa2'], sign = 'STORE', signCol = '#ffffff', lit: lights = true } = {}) {
  const g = grp(L, x, y, s); const defs = L.defs; longShadow(g, defs, -w / 2, -h, w, h, { len: 240 });
  sv('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 16, fill: fill(defs, col) }, g);
  sv('rect', { x: -w / 2 + 20, y: -h + 18, width: w - 40, height: 70, rx: 12, fill: dk(col, .35) }, g); txt(g, sign, { x: 0, y: -h + 72, 'font-size': 52, fill: signCol, 'letter-spacing': 4 });
  const n = 8; for (let i = 0; i < n; i++) sv('path', { d: `M${-w / 2 - 10 + i * (w + 20) / n},${-h + 100} h${(w + 20) / n} v46 q${-(w + 20) / n / 2},26 ${-(w + 20) / n},0Z`, fill: aw[i % 2] }, g);
  const glass = sv('rect', { x: -w / 2 + 34, y: -h + 168, width: w * .52, height: h - 190, rx: 10, fill: grad(defs, [[0, '#bff3ff'], [1, '#6fb6ff']]) }, g);
  sv('rect', { x: w * .14, y: -h + 168, width: w * .26, height: h - 168, rx: 10, fill: dk(col, .4) }, g);
  const shine = sv('rect', { x: -w / 2 + 50, y: -h + 168, width: 30, height: h - 190, fill: '#fff', opacity: .35, transform: 'skewX(-12)' }, g);
  g.tick = t => shine.setAttribute('x', (-w / 2 + 50 + ((t * 60) % (w * .5))).toFixed(1)); return g;
}
/** a coin (rand sign, gold, rim-lit) */
function coin(L, { x = 0, y = 0, s = 1, r = 60, col = '#f7be33', label = 'R', parent = null } = {}) {
  const g = parent ? sv('g', {}, parent) : grp(L, x, y, s); if (parent) T(g, x, y, 0, s); const defs = L.defs;
  sv('circle', { cx: 0, cy: r * .14, r, fill: dk(col, .35) }, g); sv('circle', { cx: 0, cy: 0, r, fill: ballFill(defs, col) }, g); sv('circle', { cx: 0, cy: 0, r: r * .76, fill: 'none', stroke: lit(col, .35), 'stroke-width': r * .07 }, g);
  txt(g, label, { x: 0, y: r * .3, 'font-size': r * .9, fill: dk(col, .45) }); return g;
}
/** a stylised banknote: NOT a real note (no portrait, no real design), just a coloured slip with a value */
function note(L, { x = 0, y = 0, s = 1, w = 260, col = '#2fd27f', val = 'R100', parent = null } = {}) {
  const h = w * .48; const g = parent ? sv('g', {}, parent) : grp(L, x, y, s); if (parent) T(g, x, y, 0, s); const defs = L.defs;
  sv('rect', { x: -w / 2, y: -h / 2 + 8, width: w, height: h, rx: 14, fill: dk(col, .35), opacity: .6 }, g); sv('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 14, fill: fill(defs, col) }, g);
  sv('circle', { cx: w * .22, cy: 0, r: h * .3, fill: lit(col, .3) }, g); txt(g, val, { x: -w * .14, y: h * .16, 'font-size': h * .46, fill: '#fff' }); return g;
}
/** paper document with lines; stamp optional */
function doc(L, { x = 0, y = 0, s = 1, w = 360, h = 460, title = '', col = '#f4f1ff', lines = 7, accentC = '#3a4fd0', parent = null } = {}) {
  const g = parent ? sv('g', {}, parent) : grp(L, x, y, s); if (parent) T(g, x, y, 0, s); const defs = L.defs;
  sv('rect', { x: -w / 2 + 14, y: -h / 2 + 18, width: w, height: h, rx: 16, fill: '#000', opacity: .25 }, g);
  sv('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 16, fill: grad(defs, [[0, '#ffffff'], [1, col]]) }, g);
  sv('rect', { x: -w / 2, y: -h / 2, width: w, height: 70, rx: 16, fill: accentC }, g); sv('rect', { x: -w / 2, y: -h / 2 + 50, width: w, height: 20, fill: accentC }, g);
  if (title) txt(g, title, { x: 0, y: -h / 2 + 50, 'font-size': 38, fill: '#fff' });
  const ls = []; for (let i = 0; i < lines; i++) ls.push(sv('rect', { x: -w / 2 + 34, y: -h / 2 + 104 + i * ((h - 140) / lines), width: (w - 68) * (i % 3 === 2 ? .6 : .95), height: 14, rx: 7, fill: '#c9cbe8' }, g));
  g.lines = ls; return g;
}
/** a company node: rounded block-building with a label (for networks of companies) */
function node(L, { x = 0, y = 0, s = 1, col = '#ff5fa2', label = '', w = 210, h = 170, parent = null } = {}) {
  const g = parent ? sv('g', {}, parent) : grp(L, x, y, s); if (parent) T(g, x, y, 0, s); const defs = L.defs;
  sv('ellipse', { cx: 0, cy: h / 2 + 18, rx: w * .62, ry: 22, fill: '#000', opacity: .3 }, g);
  sv('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 26, fill: fill(defs, col) }, g); sv('rect', { x: -w / 2, y: -h / 2, width: w, height: 16, rx: 8, fill: lit(col, .45), opacity: .6 }, g);
  for (let i = 0; i < 3; i++) sv('rect', { x: -w / 2 + 30 + i * (w - 60) / 3, y: -h / 2 + 40, width: (w - 60) / 3 - 16, height: 40, rx: 8, fill: dk(col, .3) }, g);
  if (label) txt(g, label, { x: 0, y: h / 2 - 22, 'font-size': 40, fill: '#fff' }); return g;
}
/** animated link between two points: a line with travelling dots (money moving) */
function link(L, x1, y1, x2, y2, { col = '#ffd84a', bend = -80, n = 4, width = 8, parent = null } = {}) {
  const g = sv('g', {}, parent || L.svg); const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + bend; const d = `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
  const path = sv('path', { d, fill: 'none', stroke: col, 'stroke-width': width, 'stroke-linecap': 'round', opacity: .55, 'stroke-dasharray': '2 18' }, g);
  const dots = []; for (let i = 0; i < n; i++) dots.push(sv('circle', { r: width * 1.6, fill: orbFill(L.defs, col, 1) }, g));
  const len = path.getTotalLength();
  g.set = (t, q = 1, sp = .35) => { path.setAttribute('stroke-dashoffset', (-t * 40).toFixed(1)); path.style.opacity = q * .55;
    dots.forEach((dd, i) => { const u = ((t * sp + i / n) % 1) * q; const p = path.getPointAtLength(len * u); dd.setAttribute('cx', p.x); dd.setAttribute('cy', p.y); dd.setAttribute('opacity', q > .05 ? 1 : 0); }); };
  return g;
}
/** line chart that draws on, with glow and a moving head dot. pts are values; returns draw(q) -> head point */
function chart(L, pts, { x = 360, y = 820, w = 1200, h = 520, col = '#3fe6c8', width = 14, max = null, min = 0, area = true, parent = null } = {}) {
  const g = sv('g', {}, parent || L.svg); const defs = L.defs; const m = max ?? Math.max(...pts);
  const P = pts.map((v, i) => [x + i / (pts.length - 1) * w, y - (v - min) / (m - min) * h]);
  const d = P.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  for (let i = 0; i <= 4; i++) sv('rect', { x, y: y - h * i / 4 - 2, width: w, height: 4, rx: 2, fill: '#fff', opacity: .08 }, g);
  const ar = area ? sv('path', { d: d + ` L${x + w} ${y} L${x} ${y} Z`, fill: grad(defs, [[0, col, .38], [1, col, 0]]) }, g) : null;
  const glow = sv('path', { d, fill: 'none', stroke: col, 'stroke-width': width * 3.2, opacity: .18, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  const line = sv('path', { d, fill: 'none', stroke: col, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  const head = sv('circle', { r: width * 1.5, fill: '#fff' }, g); const halo = sv('circle', { r: width * 4, fill: orbFill(defs, col, .8) }, g);
  const len = line.getTotalLength(); [line, glow].forEach(p => p.style.strokeDasharray = len);
  const cp = C.uid('cc'); const cl = sv('clipPath', { id: cp }, defs); const cr = sv('rect', { x: x - 20, y: y - h - 200, width: 0, height: h + 400 }, cl); if (ar) ar.setAttribute('clip-path', `url(#${cp})`);
  g.draw = q => { [line, glow].forEach(p => p.style.strokeDashoffset = len * (1 - q)); const p = line.getPointAtLength(len * clamp(q)); head.setAttribute('cx', p.x); head.setAttribute('cy', p.y); halo.setAttribute('cx', p.x); halo.setAttribute('cy', p.y);
    head.setAttribute('opacity', q > .001 ? 1 : 0); halo.setAttribute('opacity', q > .001 ? 1 : 0); cr.setAttribute('width', Math.max(0, p.x - x + 20)); return p; };
  g.P = P; return g;
}
/** a glass jar of coins (savings), fill 0..1 */
function jar(L, { x = 960, y = 800, s = 1, w = 300, h = 380, col = '#f7be33' } = {}) {
  const g = grp(L, x, y, s); const defs = L.defs; groundShadow(g, defs, 0, 0, w * .7);
  const cp = C.uid('jc'); const cl = sv('clipPath', { id: cp }, defs); sv('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 50 }, cl);
  const inner = sv('g', { 'clip-path': `url(#${cp})` }, g); sv('rect', { x: -w / 2, y: -h, width: w, height: h, fill: '#bfe9ff', opacity: .25 }, inner);
  const coins = sv('g', {}, inner); const cs = []; for (let i = 0; i < 26; i++) { const cc = coin(L, { parent: coins, x: -w / 2 + 40 + (i % 5) * (w - 80) / 4 + (Math.floor(i / 5) % 2) * 18, y: -30 - Math.floor(i / 5) * 46, r: 34, col }); cs.push(cc); }
  sv('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 50, fill: 'none', stroke: '#e8f8ff', 'stroke-width': 10, opacity: .7 }, g);
  sv('rect', { x: -w / 2 + 26, y: -h + 40, width: 18, height: h - 90, rx: 9, fill: '#fff', opacity: .45 }, g);
  sv('rect', { x: -w * .42, y: -h - 40, width: w * .84, height: 52, rx: 16, fill: fill(defs, '#ff8f3a') }, g);
  g.level = q => cs.forEach((c, i) => c.setAttribute('opacity', i / cs.length < q ? 1 : 0)); return g;
}
/** a house (Elsie's home) */
function house(L, { x = 960, y = 900, s = 1, w = 420, h = 300, col = '#ff8f3a', roof = '#c2364a', window: wc = '#ffd84a' } = {}) {
  const g = grp(L, x, y, s); const defs = L.defs; longShadow(g, defs, -w / 2, -h, w, h, { len: 200 });
  sv('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 14, fill: fill(defs, col) }, g);
  sv('path', { d: `M${-w / 2 - 40},${-h + 10} L0,${-h - 170} L${w / 2 + 40},${-h + 10}Z`, fill: fill(defs, roof), 'stroke-linejoin': 'round' }, g);
  const wl = sv('rect', { x: -w * .36, y: -h * .72, width: w * .26, height: h * .3, rx: 10, fill: wc }, g); sv('rect', { x: w * .1, y: -h * .62, width: w * .22, height: h * .62, rx: 10, fill: dk(col, .45) }, g);
  sv('circle', { cx: -w * .23, cy: -h * .57, r: w * .3, fill: orbFill(defs, wc, .35) }, g);
  g.tick = t => wl.setAttribute('opacity', (.85 + .15 * Math.sin(t * 3)).toFixed(3)); return g;
}
/** generic "stock exchange / bank" hall with columns (never a real building) */
function hall(L, { x = 960, y = 900, s = 1, w = 640, h = 420, col = '#e9e4ff', roof = '#5a24a8', label = '' } = {}) {
  const g = grp(L, x, y, s); const defs = L.defs; longShadow(g, defs, -w / 2, -h, w, h, { len: 260 });
  sv('rect', { x: -w / 2 - 30, y: -40, width: w + 60, height: 40, rx: 8, fill: fill(defs, dk(col, .1)) }, g);
  for (let i = 0; i < 6; i++) sv('rect', { x: -w / 2 + 20 + i * (w - 40) / 5.6, y: -h + 90, width: 48, height: h - 130, rx: 20, fill: fill(defs, col) }, g);
  sv('path', { d: `M${-w / 2 - 40},${-h + 100} L0,${-h - 60} L${w / 2 + 40},${-h + 100}Z`, fill: fill(defs, roof) }, g);
  if (label) txt(g, label, { x: 0, y: -h + 76, 'font-size': 40, fill: '#fff', 'letter-spacing': 3 }); return g;
}
/** magnifying glass */
function lens(L, { x = 960, y = 540, s = 1, r = 120, col = '#ffd84a' } = {}) {
  const g = grp(L, x, y, s); const defs = L.defs;
  sv('rect', { x: r * .62, y: r * .62, width: r * .32, height: r * 1.2, rx: r * .16, fill: fill(defs, '#ff8f3a'), transform: 'rotate(-45)' }, g);
  sv('circle', { cx: 0, cy: 0, r, fill: '#bff3ff', opacity: .25 }, g); sv('circle', { cx: 0, cy: 0, r, fill: 'none', stroke: col, 'stroke-width': r * .16 }, g);
  sv('path', { d: `M${-r * .55},${-r * .3} A${r * .6},${r * .6} 0 0 1 ${-r * .2},${-r * .62}`, stroke: '#fff', 'stroke-width': r * .08, fill: 'none', 'stroke-linecap': 'round', opacity: .8 }, g); return g;
}
/** warning triangle (sign) */
function warn(L, { x = 960, y = 540, s = 1, col = '#ffd84a', label = '!' } = {}) {
  const g = grp(L, x, y, s); const defs = L.defs; sv('circle', { cx: 0, cy: 0, r: 230, fill: orbFill(defs, col, .45) }, g);
  sv('path', { d: 'M0,-150 Q14,-150 22,-136 L150,96 Q158,114 138,118 L-138,118 Q-158,114 -150,96 L-22,-136 Q-14,-150 0,-150Z', fill: fill(defs, col) }, g);
  txt(g, label, { x: 0, y: 92, 'font-size': 180, fill: '#2a0f2a' }); return g;
}
/** a share certificate / stock card with a price */
function shareCard(L, { x = 960, y = 540, s = 1, w = 520, h = 300, col = '#3a4fd0', name = 'SHARE', price = 'R46' } = {}) {
  const g = grp(L, x, y, s); const defs = L.defs;
  sv('rect', { x: -w / 2 + 16, y: -h / 2 + 22, width: w, height: h, rx: 26, fill: '#000', opacity: .3 }, g);
  sv('rect', { x: -w / 2, y: -h / 2, width: w, height: h, rx: 26, fill: fill(defs, col) }, g); sv('rect', { x: -w / 2 + 18, y: -h / 2 + 18, width: w - 36, height: h - 36, rx: 18, fill: 'none', stroke: lit(col, .4), 'stroke-width': 4, 'stroke-dasharray': '12 10' }, g);
  txt(g, name, { x: 0, y: -h / 2 + 84, 'font-size': 48, fill: lit(col, .7), 'letter-spacing': 6 }); g.price = txt(g, price, { x: 0, y: h / 2 - 50, 'font-size': 150, fill: '#fff' }); return g;
}
/** a padlock / gavel / globe are drawn inline in scenes where needed. Generic world map of pins: */
function globe(L, { x = 960, y = 540, s = 1, r = 300, sea = '#2f56c8', land = '#3fe6c8' } = {}) {
  const g = grp(L, x, y, s); const defs = L.defs; sv('circle', { cx: 0, cy: 0, r: r * 1.35, fill: orbFill(defs, '#6fd0ff', .35) }, g);
  sv('circle', { cx: 0, cy: 0, r, fill: ballFill(defs, sea) }, g); const cp = C.uid('gc'); const cl = sv('clipPath', { id: cp }, defs); sv('circle', { cx: 0, cy: 0, r }, cl);
  const lands = sv('g', { 'clip-path': `url(#${cp})` }, g); const lg = sv('g', {}, lands);
  const blobs = [[-.5, -.35, .38, .3], [-.35, .25, .22, .4], [.15, -.3, .3, .26], [.22, .2, .2, .36], [.6, -.2, .34, .26], [.7, .4, .16, .12]];
  for (let k = -1; k <= 1; k++) blobs.forEach(([bx, by, rx, ry]) => sv('ellipse', { cx: (bx + k * 2) * r, cy: by * r, rx: rx * r, ry: ry * r, fill: fill(defs, land) }, lg));
  sv('circle', { cx: 0, cy: 0, r, fill: grad(defs, [[0, '#000', 0], [.75, '#000', 0], [1, '#000', .35]], { radial: true }) }, g);
  g.tick = t => T(lg, -((t * 40) % (2 * r)), 0); return g;
}

// ---------------- type (HTML overlays): big bold words only for key numbers and stamp words ----------------
const FONT = "'Barlow Condensed', 'Barlow', sans-serif";
function big(ui, html, { x = 960, y = 540, size = 200, color = '#fff', glow = null, weight = 800, ls = '.01em', width = 1700, align = 'center' } = {}) {
  const e = el('div', { class: 'abs' }, ui, html); const gc = glow || accent();
  e.style.cssText += `left:${x}px;top:${y}px;width:${width}px;margin-left:${-width / 2}px;text-align:${align};font:${weight} ${size}px/1 ${FONT};color:${color};letter-spacing:${ls};white-space:nowrap;text-shadow:0 0 40px ${gc}88, 0 10px 0 rgba(0,0,0,.18), 0 18px 40px rgba(0,0,0,.35);transform-origin:50% 50%;`;
  e.style.marginTop = (-size * .5) + 'px';
  e.set = (lt, a, { dur = .5, out = 1e9, dy = 0 } = {}) => { const q = clamp((lt - a) / dur); const k = q <= 0 ? 0 : E.outB(q); const oq = 1 - clamp((lt - out) / .3);
    e.style.opacity = Math.min(q * 2, oq); e.style.transform = `translateY(${((1 - k) * 60 + dy + Math.sin(lt * 1.8) * 4).toFixed(1)}px) scale(${(.7 + .3 * k).toFixed(4)})`; };
  e.style.opacity = 0; return e;
}
/** small label tag (with a leader dot) */
function tag(ui, text, { x = 960, y = 540, bg = '#ffffff', color = '#1a1230', size = 40, dot = null } = {}) {
  const e = el('div', { class: 'abs' }, ui, text); e.style.cssText += `left:${x}px;top:${y}px;transform-origin:0 50%;padding:12px 24px;border-radius:999px;background:${bg};color:${color};font:800 ${size}px/1 ${FONT};letter-spacing:.04em;white-space:nowrap;box-shadow:0 10px 30px rgba(0,0,0,.3);`;
  e.set = (lt, a, out = 1e9) => { const q = clamp((lt - a) / .4); const k = q <= 0 ? 0 : E.outB(q); const oq = 1 - clamp((lt - out) / .3); e.style.opacity = Math.min(q * 2, oq); e.style.transform = `translate(-50%,-50%) scale(${(.5 + .5 * k).toFixed(3)}) translateY(${(Math.sin(lt * 2 + x) * 3).toFixed(1)}px)`; };
  e.style.opacity = 0; return e;
}
/** stamp word: slams in rotated, with a thick rounded border */
function stamp(ui, text, { x = 960, y = 540, size = 120, col = '#ff3d5a', rot = -8, bg = 'rgba(0,0,0,0)' } = {}) {
  const e = el('div', { class: 'abs' }, ui, text); e.style.cssText += `left:${x}px;top:${y}px;padding:10px 34px;border:12px solid ${col};border-radius:28px;color:${col};background:${bg};font:800 ${size}px/1 ${FONT};letter-spacing:.06em;white-space:nowrap;`;
  e.set = (lt, a) => { const q = clamp((lt - a) / .22); const k = q <= 0 ? 0 : 1 - Math.pow(1 - q, 3); e.style.opacity = q > 0 ? 1 : 0; e.style.transform = `translate(-50%,-50%) rotate(${rot}deg) scale(${(2.2 - 1.2 * k + (q >= 1 ? Math.sin((lt - a) * 2) * .01 : 0)).toFixed(4)})`; };
  e.style.opacity = 0; return e;
}
/** receipt: a framed source card inside the world, key words highlighted by a sweeping marker */
function receipt(ui, { x = 960, y = 540, w = 1180, source = '', date = '', quote = '', hl = [], rot = -1.5, col = '#ffd84a' } = {}) {
  const box = el('div', { class: 'abs' }, ui); box.style.cssText += `left:${x}px;top:${y}px;width:${w}px;padding:44px 56px 50px;border-radius:30px;background:linear-gradient(160deg,#fffdf6,#f1ecff);box-shadow:0 30px 80px rgba(0,0,0,.45), 0 0 0 10px rgba(255,255,255,.12);color:#1b1533;transform-origin:50% 50%;`;
  let q = quote; hl.forEach((h, i) => { q = q.replace(h, `<span class="hl" data-i="${i}" style="background-image:linear-gradient(${col},${col});background-repeat:no-repeat;background-size:0% 92%;background-position:0 60%;padding:0 4px;border-radius:6px">${h}</span>`); });
  box.innerHTML = `<div style="font:800 30px/1.1 'Barlow';letter-spacing:.08em;color:#6a5aa8;text-transform:uppercase">${source}<span style="color:#9a92c0;font-weight:600;letter-spacing:.02em;text-transform:none">${date ? '  ·  ' + date : ''}</span></div><div style="margin-top:22px;font:700 58px/1.22 'Barlow';">“${q}”</div>`;
  const hls = [...box.querySelectorAll('.hl')];
  box.set = (lt, a, { hlAt = [], out = 1e9 } = {}) => { const k = clamp((lt - a) / .5); const kk = E.outB(k); const oq = 1 - clamp((lt - out) / .3); box.style.opacity = Math.min(k * 2, oq);
    box.style.transform = `translate(-50%,-50%) rotate(${(rot + Math.sin(lt * .9) * .4).toFixed(2)}deg) scale(${(.85 + .15 * kk).toFixed(4)}) translateY(${((1 - kk) * 80).toFixed(1)}px)`;
    hls.forEach((h, i) => { const ha = hlAt[i] ?? (a + .6 + i * .5); h.style.backgroundSize = `${(E.ioC(clamp((lt - ha) / .55)) * 100).toFixed(1)}% 92%`; }); };
  box.style.opacity = 0; return box;
}
/** framed photo card inside the 2D world (receipts; never the whole look), with credit line */
function photo(ui, src, { x = 960, y = 520, w = 900, h = 560, credit = '', rot = 2, border = '#ffffff' } = {}) {
  const box = el('div', { class: 'abs' }, ui); box.style.cssText += `left:${x}px;top:${y}px;width:${w}px;height:${h}px;padding:16px;border-radius:26px;background:${border};box-shadow:0 30px 70px rgba(0,0,0,.45);transform-origin:50% 50%;`;
  const im = el('div', { class: 'abs' }, box); im.style.cssText += `left:16px;top:16px;width:${w}px;height:${h}px;border-radius:16px;background:url('${src}') center/cover no-repeat;`;
  if (credit) { const c = el('div', { class: 'abs' }, box, credit); c.style.cssText += `left:28px;top:${h - 32}px;font:600 20px/1 'Barlow';color:#fff;background:rgba(10,10,30,.55);padding:6px 12px;border-radius:8px;white-space:nowrap;`; }
  box.set = (lt, a, { zoom = .06 } = {}) => { const k = clamp((lt - a) / .5); const kk = E.outB(k); box.style.opacity = Math.min(1, k * 2);
    box.style.transform = `translate(-50%,-50%) rotate(${(rot + Math.sin(lt * .7) * .5).toFixed(2)}deg) scale(${(.85 + .15 * kk).toFixed(4)})`; im.style.transform = `scale(${(1 + zoom * clamp(lt / 6)).toFixed(4)})`; };
  box.style.opacity = 0; return box;
}
/** the "general information, not financial advice" corner line */
function disclaimer(ui, text = 'General information, not financial advice') {
  const e = el('div', { class: 'abs' }, ui, text); e.style.cssText += `left:56px;top:1012px;font:700 26px/1 'Barlow';color:rgba(255,255,255,.85);background:rgba(10,8,30,.45);padding:9px 16px;border-radius:10px;white-space:nowrap;`; return e;
}

C.L5 = { PAL, ACC, accent, mix, lit, dk, fill, orbFill, ballFill, T, txt, longShadow, groundShadow, set, grp, pop, figure, POSES, SK, phone, tower, shop, coin, note, doc, node, link, chart, jar, house, hall, lens, warn, shareCard, globe, big, tag, stamp, receipt, photo, disclaimer };
})();
