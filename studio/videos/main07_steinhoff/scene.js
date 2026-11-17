/* Money From Zero main07: the Steinhoff story (Look v5, bright flat 2D). One cut() per shot, timed with N(phrase, near).
   Elsie is an illustration. No real people are drawn (the CEO is an empty chair), no logos, no real banknotes. */
const C = window.CINE, L5 = C.L5, { cue, E, clamp, lerp, sv, el } = C;
const BASE = '/home/claude/mfz-media/studio/videos/main07_steinhoff/';
const WORDS = C.loadJSON(BASE + 'words_all.json');
const VW = WORDS.map(w => ({ w: w[0].toLowerCase().replace(/[^a-z0-9]/g, ''), a: w[1], b: w[2] }));
/** start time of the occurrence of phrase whose start is closest to near (only occurrences at or after min) */
function N(phrase, near = 0, min = -1) {
  const k = phrase.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(Boolean); let best = null;
  for (let i = 0; i < VW.length; i++) { if (VW[i].a < min) continue; let ok = true; for (let j = 0; j < k.length; j++) if (!VW[i + j] || VW[i + j].w !== k[j]) { ok = false; break; } if (ok && (!best || Math.abs(VW[i].a - near) < Math.abs(best.a - near))) best = VW[i]; }
  if (!best) { console.warn('word not found: ' + phrase + ' near ' + near); return near; } return best.a;
}
C.initFX({ grain: .06, vignette: .32 });
const ACC = L5.accent(); const GOLD = ACC;
const CUTS = [];
/** cut(start, pal, setOpts, build(S, at, a), update(st, lt, t, k), opts) ; at(phrase, off) = local time of a phrase inside the shot */
function cut(a, pal, so, build, upd, opts = {}) { CUTS.push({ a, pal, so, build, upd, opts }); }
const TR = ['zoom', 'fade', 'whip', 'iris', 'zoom', 'fade'];
// ---------- shared pieces ----------
const elsie = (L, o = {}) => L5.figure(L, Object.assign({ female: true, elder: true, shirt: '#ff5fa2', pants: '#3b2a6e', skin: '#8a5a3c', seed: 3, glasses: true }, o));
const hq = (L, o = {}) => { const g = L5.tower(L, Object.assign({ col: '#3a4fd0', w: 340, h: 560, win: '#ffd84a' }, o)); if (o.name !== '') { const t = L5.txt(g, o.name || 'STEINHOFF', { x: 0, y: -(o.h || 560) - 16, 'font-size': o.fs || 44, fill: '#fff', 'letter-spacing': 3 }); g.label = t; } return g; };
const screenBalance = (title, fn, sub = '') => (g, d, w, h) => { sv('rect', { x: 0, y: 0, width: w, height: 110, fill: '#3a4fd0' }, g); L5.txt(g, title, { x: w / 2, y: 76, 'font-size': 40, fill: '#fff' });
  const v = L5.txt(g, '', { x: w / 2, y: h * .44, 'font-size': w * .3, fill: '#1b1533' }); const s = L5.txt(g, sub, { x: w / 2, y: h * .56, 'font-size': 38, fill: '#e0245e', 'font-family': 'Barlow' });
  for (let i = 0; i < 3; i++) sv('rect', { x: 30, y: h * .66 + i * 62, width: w - 60, height: 44, rx: 12, fill: '#e6e9fb' }, g); return t => fn(t, v, s); };
const fmt = n => 'R' + Math.round(n).toLocaleString('en-ZA').replace(/[, ]/g, ' ');
const coinRain = (S, n, seed, area = [0, -200, 1920, 100], col = GOLD) => { const r = C.rnd(seed); const cs = []; for (let i = 0; i < n; i++) { const g = L5.coin(S.sub, { x: 0, y: 0, r: 30 + r() * 20, col }); cs.push({ g, x: area[0] + r() * area[2], y: area[1] + r() * area[3], d: r() * 1.5, sp: .8 + r() * .6, rot: r() * 360 }); } return lt => cs.forEach(c => { const tt = Math.max(0, lt - c.d); L5.T(c.g, c.x + Math.sin(tt * 2 + c.rot) * 30, c.y + 420 * tt * tt * c.sp, c.rot + tt * 200, 1); c.g.setAttribute('opacity', lt > c.d ? 1 : 0); }); };
const once = (st, key, fn) => { if (!st[key]) { st[key] = 1; fn(); } };

// =====================================================================================================
// COLD OPEN (night over Paarl's mountains; ember for the crash; teal for the pension fund)
// =====================================================================================================
cut(0, 'night', { ground: 'mountains', cam: { z0: 1.18, z1: 1.0, y0: -60, y1: 10 }, stars: 120 }, (S, at, a) => {
  const moon = L5.grp(S.sub, 1460, 250, 1); sv('circle', { cx: 0, cy: 0, r: 230, fill: L5.orbFill(S.sub.defs, '#fff3c4', .5) }, moon); sv('circle', { cx: 0, cy: 0, r: 110, fill: L5.ballFill(S.sub.defs, '#fff3c4') }, moon);
  const cal = L5.grp(S.sub, 760, 560, 1.15); sv('rect', { x: -230, y: -260, width: 460, height: 520, rx: 40, fill: '#fff8ec' }, cal); sv('rect', { x: -230, y: -260, width: 460, height: 130, rx: 40, fill: '#e0245e' }, cal); sv('rect', { x: -230, y: -170, width: 460, height: 40, fill: '#e0245e' }, cal);
  L5.txt(cal, 'DECEMBER 2017', { x: 0, y: -180, 'font-size': 56, fill: '#fff', 'letter-spacing': 3 }); L5.txt(cal, '5', { x: 0, y: 140, 'font-size': 300, fill: '#1b1533' }); L5.txt(cal, 'TUESDAY', { x: 0, y: 220, 'font-size': 52, fill: '#7a6bb0', 'letter-spacing': 6 });
  [-120, 120].forEach(x => sv('rect', { x: x - 16, y: -290, width: 32, height: 70, rx: 16, fill: '#c9cbe8' }, cal));
  cue(a + .3, 'paper'); return { moon, cal };
}, (s, lt) => { L5.pop(s.cal, lt, .25, { r: -4, sway: 1.5 }); L5.T(s.moon, 1460, 250 + Math.sin(lt) * 6, 0, 1); });

cut(N('meet elsie', 4.5) - .1, 'night', { ground: 'mountains', cam: { z0: 1.0, z1: 1.12, x0: -40, x1: 60 } }, (S, at, a) => {
  const h = L5.house(S.sub, { x: 1300, y: 930, s: 1.35, col: '#ff9a4a' }); const e = elsie(S.sub, { x: 700, y: 960, s: 1.45 });
  const t1 = L5.tag(S.ui, 'ELSIE, 58', { x: 700, y: 200, size: 56, bg: GOLD }); const t2 = L5.tag(S.ui, 'PAARL', { x: 1300, y: 300, size: 48 });
  cue(a + .2, 'pop'); cue(a + at('paarl'), 'pop'); return { h, e, t1, t2, k1: at('fiftyeight'), k2: at('paarl') };
}, (s, lt, t) => { s.h.tick(t); s.e.set(t, { pose: lt > .3 && lt < 2.6 ? 'wave' : 'stand', expr: 'smile' }); s.t1.set(lt, Math.max(.2, s.k1 - .2)); s.t2.set(lt, s.k2); }, { in: 'fade' });

cut(N('and she has saved', 9), 'night', { ground: 'none', cam: { z0: 1.1, z1: 1.0 } }, (S, at, a) => {
  const j = L5.jar(S.sub, { x: 760, y: 900, s: 1.5 }); const n = L5.big(S.ui, '', { x: 1360, y: 470, size: 190, color: GOLD }); const y = L5.tag(S.ui, 'SAVED OVER 30 YEARS', { x: 1360, y: 640, size: 46 });
  for (let i = 0; i < 6; i++) cue(a + .3 + i * .45, 'coin', .7); return { j, n, y, ky: at('thirty') };
}, (s, lt) => { const q = clamp(lt / 3); s.j.level(q); L5.pop(s.j, lt, 0, { bob: 3 }); s.n.innerHTML = fmt(100000 * E.outC(q)); s.n.set(lt, 0); s.y.set(lt, s.ky - .2); }, { in: 'zoom' });

cut(N('all of it sits', 12.5), 'navy', { ground: 'city', cam: { z0: 1.0, z1: 1.08, x0: -40, x1: 40 } }, (S, at, a) => {
  const j = L5.jar(S.sub, { x: 420, y: 900, s: .95 }); j.level(1); const t = hq(S.sub, { x: 1350, y: 960, s: 1.0, name: '?', fs: 80 });
  const ln = L5.link(S.sub, 520, 560, 1220, 420, { col: GOLD, n: 6, bend: -200 }); const tg = L5.tag(S.ui, 'ALL OF IT, IN ONE COMPANY', { x: 960, y: 150, size: 54, bg: GOLD });
  cue(a + .4, 'whoosh'); return { j, t, ln, tg };
}, (s, lt, tt) => { s.t.tick(tt); L5.pop(s.t, lt, 0, { bob: 2 }); s.ln.set(tt, clamp(lt / .6), .6); s.tg.set(lt, .3); s.j.level(1 - clamp(lt / 2.2) * .8); }, { in: 'whip' });

cut(N('the company that owns', 14.7), 'sunset', { ground: 'hills', cam: { z0: 1.12, z1: 1.0, x0: 80, x1: -60 } }, (S, at, a) => {
  const sh = L5.shop(S.sub, { x: 1150, y: 940, s: 1.35, sign: 'CLOTHING', col: '#ff8f3a', aw: ['#ffd84a', '#3fe6c8'] }); const e = elsie(S.sub, { x: 300, y: 960, s: 1.15 });
  const tg = L5.tag(S.ui, 'THE STORE DOWN HER ROAD', { x: 1150, y: 190, size: 46 }); cue(a + .5, 'shopbell'); return { sh, e, tg };
}, (s, lt, t) => { s.sh.tick(t); s.e.set(t, { x: 300 + lt * 120, walk: t * 6, pose: 'stand' }); s.tg.set(lt, .4); }, { in: 'fade' });

cut(N('steinhoff', 17.8, 17), 'night', { ground: 'city', cam: { z0: 1.25, z1: 1.02, y0: -80, y1: 0 }, stars: 100 }, (S, at, a) => {
  const t = hq(S.sub, { x: 960, y: 1080, s: 1.1, name: '' }); const w = L5.big(S.ui, 'STEINHOFF', { x: 960, y: 170, size: 210, color: '#fff' }); cue(a + .15, 'impact'); return { t, w };
}, (s, lt, tt) => { s.t.tick(tt); s.w.set(lt, .1); }, { in: 'zoom' });

cut(N('that night one share', 19), 'navy', { ground: 'none', cam: { z0: 1.0, z1: 1.1 } }, (S, at, a) => {
  const c = L5.shareCard(S.sub, { x: 960, y: 520, s: 1.45, name: 'ONE SHARE', price: 'R46', col: '#3a4fd0' }); const tg = L5.tag(S.ui, '5 DEC 2017: ABOUT R46', { x: 960, y: 930, size: 44 });
  cue(a + .2, 'pop'); cue(a + at('46'), 'ding'); return { c, tg, k: at('46') };
}, (s, lt) => { L5.pop(s.c, lt, .1, { r: -3, sway: 1.5 }); s.tg.set(lt, s.k); }, { in: 'iris' });

cut(N('two days later it costs', 22.8), 'ember', { ground: 'none', cam: { z0: 1.12, z1: 1.0 }, stars: 40 }, (S, at, a) => {
  const c = L5.shareCard(S.sub, { x: 720, y: 520, s: 1.3, name: 'ONE SHARE', price: 'R46', col: '#c22a5a' }); const st = L5.stamp(S.ui, '−78%', { x: 1440, y: 520, size: 170 });
  const arr = L5.grp(S.sub, 1440, 820, 1); sv('path', { d: 'M-40,-160 L40,-160 L40,0 L90,0 L0,110 L-90,0 L-40,0Z', fill: L5.fill(S.sub.defs, '#ff3d5a') }, arr);
  const k = at('10'); cue(a + k, 'stamp'); cue(a + .3, 'swoosh_up', .6); return { c, st, arr, k };
}, (s, lt) => { L5.pop(s.c, lt, 0, { r: 3 }); const q = clamp((lt - s.k + .8) / .8); s.c.price.textContent = 'R' + Math.round(lerp(46, 10, E.ioC(q))); s.st.set(lt, s.k + .1); L5.pop(s.arr, lt, s.k - .6, { bob: 10 }); }, { in: 'flash' });

cut(N('elsies 100000', 25.6), 'ember', { ground: 'none', cam: { z0: 1.0, z1: 1.14 } }, (S, at, a) => {
  const k1 = at('now worth'); const p = L5.phone(S.sub, { x: 1000, y: 540, s: 1.15, w: 340, h: 620, glow: '#ff9a6a', screen: screenBalance('MY SHARES', (t, v, s) => { const q = clamp((t - a - k1) / 2.2); v.textContent = fmt(lerp(100000, 21900, E.ioC(q))); v.setAttribute('font-size', 96); s.textContent = q > 0 ? '▼ ' + Math.round(78 * q) + '%' : ''; }) });
  const e = elsie(S.sub, { x: 330, y: 1000, s: 1.05 }); cue(a + k1, 'swoosh_up', .5); return { p, e };
}, (s, lt, t) => { s.p.tick(t); L5.pop(s.p, lt, 0, { bob: 4 }); s.e.set(t, { pose: lt > 3 ? 'shock' : 'phone', poseK: clamp((lt - 3) / .4), from: 'phone', expr: lt > 3 ? 'shock' : 'smile' }); }, { in: 'zoom' });

cut(N('she didnt spend', 31.4), 'night', { ground: 'mountains', cam: { z0: 1.15, z1: 1.02 } }, (S, at, a) => {
  const e = elsie(S.sub, { x: 960, y: 1000, s: 1.6 }); const t1 = L5.tag(S.ui, 'SPENT: R0', { x: 560, y: 330, size: 54 }); const t2 = L5.tag(S.ui, 'DID NOTHING WRONG', { x: 1380, y: 420, size: 50, bg: GOLD });
  return { e, t1, t2, k2: at('anything wrong') };
}, (s, lt, t) => { s.e.set(t, { pose: 'sad', expr: 'sad' }); s.t1.set(lt, .3); s.t2.set(lt, s.k2 - .3); }, { in: 'fade' });

cut(N('remember that number', 35.4), 'purple', { ground: 'none', cam: { z0: 1.2, z1: 1.0 }, stars: 90 }, (S, at, a) => {
  const ring = L5.grp(S.sub, 960, 500, 1); sv('circle', { cx: 0, cy: 0, r: 420, fill: L5.orbFill(S.sub.defs, GOLD, .45) }, ring);
  const n = L5.big(S.ui, 'R21 900', { x: 960, y: 480, size: 260, color: GOLD }); const tg = L5.tag(S.ui, "WE'LL COME BACK TO IT", { x: 960, y: 720, size: 46 }); cue(a + at('21900'), 'impact', .8);
  return { ring, n, tg, k: at('21900'), k2: at('come back') };
}, (s, lt) => { L5.T(s.ring, 960, 500, lt * 20, 1 + .05 * Math.sin(lt * 2)); s.n.set(lt, s.k - .2); s.tg.set(lt, s.k2 - .2); }, { in: 'zoom' });

cut(N('and it wasnt just elsie', 40.8), 'teal', { ground: 'hills', cam: { z0: 1.0, z1: 1.1, x0: -60, x1: 60 } }, (S, at, a) => {
  const fs = []; const cols = ['#ff5fa2', '#ffd84a', '#ff8f3a', '#3fe6c8', '#a98bff', '#ff6a6a', '#6fd0ff'];
  for (let i = 0; i < 7; i++) fs.push(i === 3 ? elsie(S.sub, { x: 960, y: 980, s: 1.2 }) : L5.figure(S.sub, { x: 240 + i * 240, y: 960 + (i % 2) * 30, s: .95 + (i % 2) * .1, shirt: cols[i], seed: 10 + i, female: i % 3 === 0 }));
  for (let i = 0; i < 7; i++) cue(a + .1 + Math.abs(i - 3) * .18, 'pop', .5); return { fs };
}, (s, lt, t) => s.fs.forEach((f, i) => { const d = Math.abs(i - 3) * .18; const k = E.outB(clamp((lt - d) / .4)); const x = i === 3 ? 960 : 240 + i * 240; f.set(t, { x, y: (i === 3 ? 980 : 960 + (i % 2) * 30) + (1 - k) * 300, o: clamp(k * 3), pose: i === 3 ? 'stand' : 'stand' }); }), { in: 'whip' });

cut(N('the pension fund for', 42.6), 'teal', { ground: 'city', cam: { z0: 1.08, z1: 1.0 } }, (S, at, a) => {
  const h = L5.hall(S.sub, { x: 640, y: 960, s: 1.15, label: 'PENSION FUND', roof: '#0a7a8c', col: '#e8fffb' });
  const pie = L5.grp(S.sub, 1420, 470, 1); const R = 210; sv('circle', { cx: 0, cy: 0, r: R + 40, fill: L5.orbFill(S.sub.defs, '#8affea', .4) }, pie); sv('circle', { cx: 0, cy: 0, r: R, fill: L5.ballFill(S.sub.defs, '#3a4fd0') }, pie);
  const sl = sv('path', { fill: L5.fill(S.sub.defs, GOLD) }, pie); const lab = L5.big(S.ui, '9%', { x: 1420, y: 820, size: 130, color: GOLD }); const tg = L5.tag(S.ui, 'OF STEINHOFF', { x: 1420, y: 940, size: 40 });
  const tg2 = L5.tag(S.ui, 'GOVERNMENT WORKERS', { x: 640, y: 190, size: 44, bg: GOLD }); cue(a + at('nine'), 'pop'); return { pie, sl, lab, tg, tg2, k: at('nine'), R };
}, (s, lt) => { const q = E.outC(clamp((lt - s.k + .2) / .7)); const an = q * .091 * Math.PI * 2; const R = s.R; s.sl.setAttribute('d', `M0,0 L0,${-R} A${R},${R} 0 ${an > Math.PI ? 1 : 0} 1 ${(Math.sin(an) * R).toFixed(1)},${(-Math.cos(an) * R).toFixed(1)}Z`); L5.T(s.sl, 0, 0, 0, 1 + .04 * q); L5.pop(s.pie, lt, .1, { bob: 4, y: 470 }); s.lab.set(lt, s.k); s.tg.set(lt, s.k + .3); s.tg2.set(lt, .3); }, { in: 'fade' });

cut(N('teachers', 47.9), 'teal', { ground: 'hills', cam: { z0: 1.12, z1: 1.0 } }, (S, at, a) => {
  const ks = [at('teachers'), at('nurses'), at('police')]; const xs = [480, 960, 1440]; const cols = ['#ff8f3a', '#ffffff', '#2a4fd0']; const labs = ['TEACHERS', 'NURSES', 'POLICE OFFICERS'];
  const fs = xs.map((x, i) => L5.figure(S.sub, { x, y: 980, s: 1.25, shirt: cols[i], seed: 20 + i, female: i === 1, cap: i === 2 ? '#1b2a6e' : null }));
  const book = sv('g', {}, S.sub.svg); sv('rect', { x: -40, y: -30, width: 80, height: 60, rx: 8, fill: '#e0245e' }, book); fs[0].hold(1, book);
  const tg = labs.map((l, i) => L5.tag(S.ui, l, { x: xs[i], y: 330, size: 44, bg: i === 1 ? GOLD : '#fff' })); ks.forEach(k => cue(a + k, 'pop')); return { fs, tg, ks };
}, (s, lt, t) => s.fs.forEach((f, i) => { const k = E.outB(clamp((lt - s.ks[i] + .25) / .45)); f.set(t, { x: [480, 960, 1440][i], y: 980 + (1 - k) * 400, o: clamp(k * 3), pose: i === 1 ? 'wave' : i === 0 ? 'hold' : 'stand' }); s.tg[i].set(lt, s.ks[i]); }), { in: 'zoom' });

cut(N('on paper their fund', 50.8), 'ember', { ground: 'none', cam: { z0: 1.0, z1: 1.12 } }, (S, at, a) => {
  const h = L5.hall(S.sub, { x: 960, y: 1080, s: 1.0, label: 'PENSION FUND', roof: '#7d1830', col: '#ffe9e0' }); const rain = coinRain(S, 26, 5, [560, 520, 800, 60]);
  const n = L5.big(S.ui, '−R20 BILLION', { x: 960, y: 260, size: 190, color: '#ffd23a' }); const tg = L5.tag(S.ui, 'ON PAPER · NOV 2017 → JAN 2018', { x: 960, y: 420, size: 40 });
  cue(a + at('20'), 'impact'); cue(a + .3, 'coins', .7); return { h, rain, n, tg, k: at('20') };
}, (s, lt) => { s.rain(lt * .9); s.n.set(lt, s.k - .2); s.tg.set(lt, s.k + .3); }, { in: 'whip' });

cut(N('so how does a company', 55), 'ember', { ground: 'city', cam: { z0: 1.0, z1: 1.15, y0: 0, y1: -40 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 960, y: 1080, s: 1.2, name: 'STEINHOFF', col: '#5a3ad0' }); const n = L5.tag(S.ui, 'WORTH ALMOST R200 BILLION', { x: 960, y: 140, size: 50, bg: GOLD });
  const crack = sv('path', { d: 'M960,180 L930,330 L990,470 L920,620 L1000,800', stroke: '#ffd23a', 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round' }, S.sub.svg); const len = 900; crack.style.strokeDasharray = len;
  const k = at('collapse'); cue(a + k, 'boom', .8); return { t, n, crack, k, len };
}, (s, lt, tt) => { s.t.tick(tt); const sh = lt > s.k ? Math.sin(lt * 50) * 6 * Math.exp(-(lt - s.k) * 2) : 0; L5.T(s.t, 960 + sh, 1080 + (lt > s.k ? (lt - s.k) * 40 : 0), sh * .3, 1.2); s.n.set(lt, .4); s.crack.style.strokeDashoffset = s.len * (1 - E.outC(clamp((lt - s.k) / .6))); }, { in: 'fade' });

cut(N('and how do you make sure', 60.8), 'purple', { ground: 'hills', cam: { z0: 1.0, z1: 1.1 } }, (S, at, a) => {
  const e = elsie(S.sub, { x: 640, y: 980, s: 1.35 }); const q = L5.big(S.ui, '?', { x: 1300, y: 420, size: 420, color: GOLD }); const tg = L5.tag(S.ui, 'YOUR MONEY', { x: 1300, y: 760, size: 52 });
  cue(a + .4, 'pop'); return { e, q, tg, k: at('your money') };
}, (s, lt, t) => { s.e.set(t, { pose: 'think', expr: 'worried' }); s.q.set(lt, .3); s.tg.set(lt, s.k - .2); }, { in: 'zoom' });

cut(N('heres the answer', 65.3), 'navy', { ground: 'none', cam: { z0: 1.1, z1: 1.0 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 960, y: 1000, s: .9, name: 'ONE COMPANY', fs: 50 }); const pile = L5.grp(S.sub, 960, 860, 1); for (let i = 0; i < 9; i++) L5.coin(S.sub, { parent: pile, x: -160 + (i % 5) * 80, y: -Math.floor(i / 5) * 70, r: 44 });
  const no = L5.stamp(S.ui, 'NEVER ALL IN ONE', { x: 960, y: 170, size: 100, rot: -4 }); const k = at('never'); cue(a + k + .2, 'stamp'); return { t, pile, no, k };
}, (s, lt, tt) => { s.t.tick(tt); L5.pop(s.pile, lt, 0, { bob: 3 }); s.no.set(lt, s.k + .2); }, { in: 'iris' });

cut(N('spread it out', 70.7), 'mint', { ground: 'hills', cam: { z0: 1.0, z1: 1.12, y0: -20, y1: 20 } }, (S, at, a) => {
  const ts = []; for (let i = 0; i < 10; i++) { const x = 220 + (i % 5) * 370, y = 560 + Math.floor(i / 5) * 360; ts.push({ g: L5.tower(S.sub, { x, y, s: .34, col: ['#3a4fd0', '#ff5fa2', '#ff8f3a', '#a98bff', '#3fe6c8'][i % 5], w: 300, h: 560 }), x, y }); }
  const cs = []; for (let i = 0; i < 10; i++) cs.push(L5.coin(S.sub, { x: 960, y: 540, r: 36 }));
  const w = L5.big(S.ui, 'SPREAD IT OUT', { x: 960, y: 150, size: 140, color: '#fff', glow: GOLD }); cue(a + .1, 'whoosh'); return { ts, cs, w };
}, (s, lt, t) => { s.ts.forEach((o, i) => { L5.pop(o.g, lt, .1 + i * .05, { s: .34, bob: 3, ph: i }); o.g.tick(t); }); s.cs.forEach((c, i) => { const q = E.ioC(clamp((lt - .2 - i * .06) / .8)); const o = s.ts[i]; L5.T(c, lerp(960, o.x, q), lerp(540, o.y - 240, q) - Math.sin(q * Math.PI) * 200, 0, 1); }); s.w.set(lt, .05); }, { in: 'zoom' });

cut(N('and the warning signs', 75.1), 'teal', { ground: 'waves', cam: { z0: 1.12, z1: 1.0, x0: -80, x1: 80 } }, (S, at, a) => {
  const ws = [0, 1, 2, 3].map(i => L5.warn(S.sub, { x: 360 + i * 400, y: 560, s: .7, label: String(i + 1) })); const l = L5.lens(S.sub, { x: 960, y: 560, s: 1.1 });
  const tg = L5.tag(S.ui, 'THE WARNING SIGNS', { x: 960, y: 900, size: 54, bg: GOLD }); const k = at('warning signs'); [0, 1, 2, 3].forEach(i => cue(a + k - .3 + i * .2, 'pop', .6)); return { ws, l, tg, k };
}, (s, lt, t) => { s.ws.forEach((w, i) => L5.pop(w, lt, s.k - .3 + i * .2, { s: .7, bob: 5, ph: i })); L5.T(s.l, 960 + Math.sin(lt * 1.2) * 520, 560 + Math.cos(lt * 2) * 40, -10, 1.1); s.tg.set(lt, s.k); }, { in: 'fade' });

cut(N('lets start from zero', 78.4), 'sunset', { ground: 'none', cam: { z0: 1.2, z1: 1.0 }, stars: 60 }, (S, at, a) => {
  const c = L5.coin(S.sub, { x: 960, y: 430, r: 190, label: '0' }); const f = C.flapText(S.ui, "LET'S START FROM ZERO", { size: 92 }); f.el.style.left = '960px'; f.el.style.top = '760px'; f.el.style.transform = 'translate(-50%,-50%)';
  cue(a + .2, 'flaps', .6); return { c, f, a };
}, (s, lt, t) => { L5.T(s.c, 960, 430 + Math.sin(lt * 2) * 8, 0, 1, Math.cos(lt * 3)); s.f.set(t, s.a + .1, .022); }, { in: 'zoom' });

// =====================================================================================================
// CH1 THE RISE (sunset gold: growth)
// =====================================================================================================
cut(N('steinhoff started as', 80.1), 'sunset', { ground: 'hills', cam: { z0: 1.0, z1: 1.1, x0: 40, x1: -40 } }, (S, at, a) => {
  const sofa = L5.grp(S.sub, 1180, 860, 1.3); const d = S.sub.defs; sv('rect', { x: -260, y: -200, width: 520, height: 150, rx: 50, fill: L5.fill(d, '#ff5fa2') }, sofa); sv('rect', { x: -300, y: -110, width: 600, height: 120, rx: 50, fill: L5.fill(d, '#e0245e') }, sofa);
  [-300, 240].forEach(x => sv('rect', { x, y: -170, width: 60, height: 190, rx: 30, fill: L5.fill(d, '#c21a50') }, sofa)); [-240, 220].forEach(x => sv('rect', { x, y: 10, width: 24, height: 50, rx: 8, fill: '#3b1a2a' }, sofa)); L5.groundShadow(sofa, d, 0, 60, 330);
  const f = L5.figure(S.sub, { x: 560, y: 960, s: 1.25, shirt: '#3fe6c8', seed: 31, hair: 'short' }); const tg = L5.tag(S.ui, 'A SMALL FURNITURE BUSINESS', { x: 960, y: 190, size: 50, bg: GOLD }); cue(a + .3, 'pop');
  return { sofa, f, tg };
}, (s, lt, t) => { L5.pop(s.sofa, lt, .2, { bob: 2, s: 1.3 }); s.f.set(t, { pose: 'present', expr: 'smile' }); s.tg.set(lt, .4); }, { in: 'fade' });

cut(N('by 2016 it was run', 83.2), 'sunset', { ground: 'mountains', cam: { z0: 1.05, z1: 1.0 } }, (S, at, a) => {
  const p = L5.photo(S.ui, BASE + 'img/Stellenbosch_aerial__s.jpg', { x: 900, y: 500, w: 1060, h: 640, credit: 'Stellenbosch · CJJ2501, CC0', rot: -2 });
  const pin = L5.grp(S.sub, 1490, 330, 1); sv('path', { d: 'M0,0 C-70,-80 -60,-170 0,-170 C60,-170 70,-80 0,0Z', fill: L5.fill(S.sub.defs, '#ff3d5a') }, pin); sv('circle', { cx: 0, cy: -112, r: 26, fill: '#fff' }, pin);
  const tg = L5.tag(S.ui, 'STELLENBOSCH', { x: 1500, y: 390, size: 52, bg: GOLD }); const k = at('stellenbosch'); cue(a + k, 'pop'); return { p, pin, tg, k };
}, (s, lt) => { s.p.set(lt, 0); L5.pop(s.pin, lt, s.k - .2, { bob: 10 }); s.tg.set(lt, s.k); }, { in: 'iris' });

cut(N('and it was everywhere', 86.5), 'navy', { ground: 'none', cam: { z0: 1.0, z1: 1.15 }, stars: 120 }, (S, at, a) => {
  const g = L5.globe(S.sub, { x: 960, y: 560, s: 1.15, r: 330 }); const pins = []; const P = [[-180, -120], [80, -160], [200, 40], [-60, 120], [-260, 60], [150, -40], [20, -60]];
  P.forEach(([x, y], i) => { const p = L5.grp(S.sub, 960 + x * 1.15, 560 + y * 1.15, .55); sv('path', { d: 'M0,0 C-70,-80 -60,-170 0,-170 C60,-170 70,-80 0,0Z', fill: L5.fill(S.sub.defs, GOLD) }, p); sv('circle', { cx: 0, cy: -112, r: 26, fill: '#fff' }, p); pins.push(p); cue(a + .2 + i * .2, 'pop', .5); });
  return { g, pins };
}, (s, lt, t) => { s.g.tick(t); s.pins.forEach((p, i) => L5.pop(p, lt, .2 + i * .2, { s: .55, bob: 6, ph: i })); }, { in: 'zoom' });

const buyShot = (phrase, near, name, place, big, pal, extra) => cut(N(phrase, near), pal, { ground: 'city', cam: { z0: 1.0, z1: 1.1, x0: -30, x1: 30 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 560, y: 1000, s: .95, name: 'STEINHOFF', col: '#5a3ad0' }); const n = L5.node(S.sub, { x: 1450, y: 560, s: 1.4, col: '#ff8f3a', label: name, w: 300 });
  const ln = L5.link(S.sub, 1300, 560, 720, 430, { col: GOLD, n: 5, bend: -160 }); const tg = L5.tag(S.ui, place, { x: 1450, y: 300, size: 46, bg: GOLD }); const b = big ? L5.big(S.ui, big, { x: 1450, y: 870, size: 120, color: '#fff' }) : null;
  cue(a + .3, 'whoosh', .7); cue(a + 1.1, 'cash', .7); return { t, n, ln, tg, b, kb: big ? at(extra || 'billion') : 0 };
}, (s, lt, tt) => { s.t.tick(tt); const q = E.ioC(clamp((lt - 1.2) / 1.6)); L5.pop(s.n, lt, .1, { x: lerp(1450, 1200, q), s: 1.4 * (1 - .25 * q) }); s.ln.set(tt, clamp((lt - .4) / .5), .7); s.tg.set(lt, .3); if (s.b) s.b.set(lt, s.kb - .3); }, { in: 'whip' });
buyShot('it bought pep and', 88.2, 'PEPKOR', 'PEP + ACKERMANS · 2015', null, 'sunset');
buyShot('it bought poundland', 92.4, 'POUNDLAND', 'BRITAIN · 2016', null, 'magenta');
buyShot('it bought mattress firm', 94.3, 'MATTRESS FIRM', 'AMERICA · 2016', '$3.8 BILLION', 'purple', 'billion dollars');

cut(N('by 2016 it had', 99.3), 'sunset', { ground: 'hills', cam: { z0: 1.15, z1: 1.0 } }, (S, at, a) => {
  const shops = []; const r = C.rnd(9); for (let i = 0; i < 14; i++) shops.push({ g: L5.shop(S.sub, { x: 140 + (i % 7) * 275, y: 560 + Math.floor(i / 7) * 330, s: .42, col: ['#ff8f3a', '#ff5fa2', '#3fe6c8', '#a98bff'][i % 4], sign: '', aw: ['#ffd84a', '#ffffff'] }), d: r() * 1.2 });
  const n = L5.big(S.ui, '', { x: 960, y: 900, size: 170, color: GOLD }); const tg = L5.tag(S.ui, 'STORES', { x: 960, y: 1015, size: 44 }); shops.forEach(o => cue(a + o.d, 'pop', .3)); return { shops, n, tg, k: at('six and a half') };
}, (s, lt, t) => { s.shops.forEach(o => { L5.pop(o.g, lt, o.d, { s: .42, bob: 2 }); o.g.tick(t); }); s.n.innerHTML = Math.round(6500 * E.outC(clamp((lt - s.k + .5) / 1.6))).toLocaleString('en-ZA').replace(/[, ]/g, ' '); s.n.set(lt, s.k - .5); s.tg.set(lt, s.k); }, { in: 'fade' });

cut(N('forty brands', 103), 'navy', { ground: 'none', cam: { z0: 1.0, z1: 1.12 }, stars: 120 }, (S, at, a) => {
  const g = L5.globe(S.sub, { x: 1320, y: 560, s: 1, r: 300, land: '#ffd84a' }); const b1 = L5.big(S.ui, '40 BRANDS', { x: 560, y: 420, size: 140, color: '#fff' }); const b2 = L5.big(S.ui, '30 COUNTRIES', { x: 560, y: 620, size: 140, color: GOLD });
  const k1 = at('forty'), k2 = at('thirty countries'); cue(a + k1, 'pop'); cue(a + k2, 'pop'); return { g, b1, b2, k1, k2 };
}, (s, lt, t) => { s.g.tick(t); s.b1.set(lt, s.k1 - .2); s.b2.set(lt, s.k2 - .2); }, { in: 'whip' });

const buyers = (phrase, near, who, kind, pal) => cut(N(phrase, near), pal, { ground: 'city', cam: { z0: 1.08, z1: 1.0 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 1430, y: 1000, s: .9, name: 'STEINHOFF', col: '#5a3ad0' }); let src;
  if (kind === 'hall') src = L5.hall(S.sub, { x: 500, y: 960, s: .9, label: who, roof: '#a3305e' }); else if (kind === 'node') src = L5.node(S.sub, { x: 500, y: 640, s: 1.5, label: who, col: '#3fe6c8', w: 320 });
  else { src = sv('g', {}, S.sub.svg); src.fs = [0, 1, 2, 3, 4].map(i => i === 2 ? elsie(S.sub, { x: 500, y: 980, s: 1.1 }) : L5.figure(S.sub, { x: 230 + i * 135, y: 950 + (i % 2) * 40, s: .8, shirt: ['#ff8f3a', '#3fe6c8', '', '#a98bff', '#ffd84a'][i], seed: 40 + i })); }
  const ln = L5.link(S.sub, 680, 520, 1300, 420, { col: GOLD, n: 6, bend: -140 }); const tg = L5.tag(S.ui, kind === 'crowd' ? 'BECAUSE EVERYONE ELSE HAD' : who + ' BOUGHT IT', { x: 960, y: 170, size: 48, bg: GOLD });
  cue(a + .3, 'coins', .6); return { t, src, ln, tg, kind, kb: kind === 'crowd' ? at('everyone') : .3 };
}, (s, lt, tt) => { s.t.tick(tt); s.ln.set(tt, clamp((lt - .2) / .5), .8); s.tg.set(lt, s.kb - .2); if (s.src.fs) s.src.fs.forEach((f, i) => f.set(tt, { pose: i === 2 ? 'give' : 'stand' })); else L5.pop(s.src, lt, 0, { bob: 2, s: s.kind === 'node' ? 1.5 : .9 }); }, { in: 'fade' });
buyers('big pension funds bought', 105.8, 'PENSION FUNDS', 'hall', 'sunset');
buyers('unit trusts bought', 107.7, 'UNIT TRUSTS', 'node', 'magenta');
buyers('ordinary people like elsie', 109.3, 'ORDINARY PEOPLE', 'crowd', 'sunset');

cut(N('to an investor like', 113.5), 'sunset', { ground: 'hills', cam: { z0: 1.0, z1: 1.1, x0: -40, x1: 30 } }, (S, at, a) => {
  const e = elsie(S.sub, { x: 560, y: 990, s: 1.45 }); const p = L5.phone(S.sub, { x: 1300, y: 540, s: 1.2, w: 330, h: 600, glow: '#ffd59a', screen: (g, d, w, h) => { sv('rect', { x: 0, y: 0, width: w, height: 110, fill: '#3a4fd0' }, g); L5.txt(g, 'STEINHOFF', { x: w / 2, y: 76, 'font-size': 40 });
    const ch = L5.chart({ svg: g, defs: d }, [10, 14, 13, 19, 24, 23, 31, 38, 44, 46], { x: 30, y: h * .78, w: w - 60, h: h * .5, col: '#1fb86a', width: 9 }); const v = L5.txt(g, 'R46', { x: w / 2, y: h * .92, 'font-size': 60, fill: '#1fb86a' }); return t => ch.draw(clamp((t - a) / 2.5)); } });
  const tg = L5.tag(S.ui, 'LOOKED PERFECT', { x: 1300, y: 140, size: 50, bg: GOLD }); return { e, p, tg, k: at('perfect') };
}, (s, lt, t) => { s.e.set(t, { pose: 'phone', expr: 'smile' }); s.p.tick(t); L5.pop(s.p, lt, 0, { bob: 4 }); s.tg.set(lt, s.k - .3); }, { in: 'zoom' });

cut(N('profits going up', 116.9), 'mint', { ground: 'none', cam: { z0: 1.12, z1: 1.0 } }, (S, at, a) => {
  const ch = L5.chart(S.sub, [8, 12, 11, 17, 22, 21, 29, 36, 44], { x: 300, y: 860, w: 1320, h: 560, col: '#ffd84a' }); const tg = L5.tag(S.ui, 'PROFITS ↑', { x: 560, y: 220, size: 64, bg: GOLD }); cue(a + .1, 'swoosh_up', .6); return { ch, tg };
}, (s, lt) => { s.ch.draw(E.ioC(clamp(lt / 1.1))); s.tg.set(lt, .1); }, { in: 'whip' });

cut(N('a famous boss', 118.1), 'purple', { ground: 'none', cam: { z0: 1.0, z1: 1.1 } }, (S, at, a) => {
  const d = S.sub.defs; const beam = sv('path', { d: 'M860,-40 L1060,-40 L1260,900 L660,900Z', fill: L5.orbFill(d, '#fff3c4', .35) }, S.sub.svg); const chair = L5.grp(S.sub, 960, 900, 1.2);
  sv('rect', { x: -130, y: -420, width: 260, height: 300, rx: 60, fill: L5.fill(d, '#2a1a5a') }, chair); sv('rect', { x: -160, y: -150, width: 320, height: 80, rx: 30, fill: L5.fill(d, '#3a2a7a') }, chair); sv('rect', { x: -14, y: -70, width: 28, height: 70, fill: '#1a1230' }, chair); sv('rect', { x: -110, y: -10, width: 220, height: 20, rx: 10, fill: '#1a1230' }, chair);
  const plate = L5.tag(S.ui, 'THE CEO', { x: 960, y: 260, size: 56, bg: GOLD }); cue(a + .1, 'lights'); return { chair, plate, beam };
}, (s, lt) => { L5.pop(s.chair, lt, 0, { bob: 2, s: 1.2 }); s.beam.setAttribute('opacity', (.8 + .2 * Math.sin(lt * 3)).toFixed(2)); s.plate.set(lt, .2); }, { in: 'iris' });

cut(N('shops she could', 119.4), 'sunset', { ground: 'city', cam: { z0: 1.0, z1: 1.08, x0: -60, x1: 40 } }, (S, at, a) => {
  const sh = L5.shop(S.sub, { x: 1100, y: 940, s: 1.25, sign: 'CLOTHING', col: '#ff5fa2' }); const fs = [0, 1, 2].map(i => i === 1 ? elsie(S.sub, { x: 200, y: 980, s: 1 }) : L5.figure(S.sub, { x: 200, y: 970, s: .95, shirt: ['#ffd84a', '', '#3fe6c8'][i], seed: 50 + i }));
  cue(a + .4, 'shopbell'); return { sh, fs };
}, (s, lt, t) => { s.sh.tick(t); s.fs.forEach((f, i) => f.set(t, { x: -100 + i * 220 + lt * 210, walk: t * 6 + i, pose: 'stand' })); }, { in: 'fade' });

cut(N('what could go wrong', 121.8), 'night', { ground: 'city', cam: { z0: 1.0, z1: 1.18 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 960, y: 1100, s: 1.0, name: 'STEINHOFF' }); const w = L5.big(S.ui, 'WHAT COULD GO WRONG?', { x: 960, y: 160, size: 120, color: '#fff' }); cue(a + .2, 'riser', .5);
  return { t, w };
}, (s, lt, tt) => { s.t.tick(tt); s.w.set(lt, .1); }, { in: 'zoom' });

cut(N('but heres the question', 123.3), 'purple', { ground: 'none', cam: { z0: 1.0, z1: 1.12, x0: 60, x1: -60 } }, (S, at, a) => {
  const ch = L5.chart(S.sub, [8, 12, 11, 17, 22, 21, 29, 36, 44], { x: 300, y: 860, w: 1320, h: 560, col: '#ffd84a' }); ch.draw(1); const l = L5.lens(S.sub, { x: 900, y: 560, s: 1.4 });
  const q = L5.big(S.ui, 'THE QUESTION', { x: 960, y: 170, size: 140, color: GOLD }); return { l, q, k: .5 };
}, (s, lt) => { L5.T(s.l, 600 + lt * 160, 560 + Math.sin(lt * 2) * 60, -12, 1.4); s.q.set(lt, s.k - .2); }, { in: 'fade' });

// =====================================================================================================
// CH2 THE TRICK (purple)
// =====================================================================================================
cut(N('imagine you run', 130.2), 'purple', { ground: 'hills', cam: { z0: 1.15, z1: 1.0 } }, (S, at, a) => {
  const sh = L5.shop(S.sub, { x: 1150, y: 940, s: 1.3, sign: 'SPAZA', col: '#3fe6c8', aw: ['#ff5fa2', '#ffd84a'] }); const f = L5.figure(S.sub, { x: 520, y: 980, s: 1.35, shirt: '#ffd84a', seed: 61, cap: '#e0245e' });
  const tg = L5.tag(S.ui, 'YOU', { x: 520, y: 280, size: 56, bg: GOLD }); cue(a + .2, 'shopbell'); return { sh, f, tg };
}, (s, lt, t) => { s.sh.tick(t); s.f.set(t, { pose: 'present', expr: 'smile' }); s.tg.set(lt, .3); }, { in: 'zoom' });

cut(N('business is slow', 132.3), 'purple', { ground: 'hills', cam: { z0: 1.0, z1: 1.06 } }, (S, at, a) => {
  const f = L5.figure(S.sub, { x: 960, y: 1000, s: 1.5, shirt: '#ffd84a', seed: 61, cap: '#e0245e' }); const clk = L5.grp(S.sub, 1460, 420, 1); sv('circle', { cx: 0, cy: 0, r: 150, fill: L5.ballFill(S.sub.defs, '#fff8ec') }, clk);
  const hand = sv('rect', { x: -6, y: -120, width: 12, height: 120, rx: 6, fill: '#1b1533' }, clk); const tg = L5.tag(S.ui, 'BUSINESS IS SLOW', { x: 520, y: 330, size: 52 }); cue(a + .2, 'tick', .6); cue(a + .9, 'tock', .6); return { f, clk, hand, tg };
}, (s, lt, t) => { s.f.set(t, { pose: 'sad', expr: 'worried' }); s.hand.setAttribute('transform', `rotate(${(lt * 120).toFixed(1)})`); L5.pop(s.clk, lt, 0, { bob: 3 }); s.tg.set(lt, .1); }, { in: 'fade' });

cut(N('so you sell', 133.6), 'purple', { ground: 'hills', cam: { z0: 1.05, z1: 1.0, x0: -40, x1: 40 } }, (S, at, a) => {
  const s1 = L5.shop(S.sub, { x: 470, y: 920, s: .95, sign: 'YOURS', col: '#3fe6c8' }); const s2 = L5.shop(S.sub, { x: 1450, y: 920, s: .95, sign: "COUSIN'S", col: '#ff8f3a' });
  const box = L5.grp(S.sub, 600, 700, 1); sv('rect', { x: -80, y: -70, width: 160, height: 140, rx: 18, fill: L5.fill(S.sub.defs, '#c98a4a') }, box); sv('rect', { x: -80, y: -16, width: 160, height: 20, fill: '#a86a34' }, box);
  const tg = L5.tag(S.ui, '“SOLD”: R1 000 OF STOCK', { x: 960, y: 220, size: 52, bg: GOLD }); cue(a + .5, 'whoosh'); return { s1, s2, box, tg, k: at('thousand') };
}, (s, lt, t) => { s.s1.tick(t); s.s2.tick(t); const q = E.ioC(clamp((lt - .5) / 2)); L5.T(s.box, lerp(600, 1320, q), 700 - Math.sin(q * Math.PI) * 220, q * 360, 1); s.tg.set(lt, s.k - .3); }, { in: 'whip' });

cut(N('you write it down', 138.2), 'purple', { ground: 'none', cam: { z0: 1.12, z1: 1.0 } }, (S, at, a) => {
  const d = L5.doc(S.sub, { x: 960, y: 470, s: 1.2, title: 'MY BOOKS', w: 420, h: 520, accentC: '#5a24a8' }); const pr = L5.big(S.ui, '+R1 000 PROFIT', { x: 960, y: 900, size: 120, color: '#1fb86a', glow: '#1fb86a' }); cue(a + .5, 'type'); return { d, pr };
}, (s, lt) => { L5.pop(s.d, lt, 0, { s: 1.2, bob: 3, r: -2 }); s.pr.set(lt, .5); }, { in: 'zoom' });

cut(N('your books look great', 140.1), 'mint', { ground: 'hills', cam: { z0: 1.0, z1: 1.08 } }, (S, at, a) => {
  const f = L5.figure(S.sub, { x: 640, y: 1000, s: 1.4, shirt: '#ffd84a', seed: 61, cap: '#e0245e' }); const ch = L5.chart(S.sub, [5, 9, 14, 22, 30], { x: 1000, y: 820, w: 700, h: 480, col: '#ffd84a' });
  const st = L5.stamp(S.ui, 'LOOKS GREAT', { x: 1350, y: 220, size: 80, col: '#ffd84a', rot: 6 }); cue(a + .6, 'stamp', .6); return { f, ch, st };
}, (s, lt, t) => { s.f.set(t, { pose: 'cheer', expr: 'smile' }); s.ch.draw(E.ioC(clamp(lt / 1.2))); s.st.set(lt, .6); }, { in: 'fade' });

cut(N('next year to hide', 141.9), 'magenta', { ground: 'hills', cam: { z0: 1.0, z1: 1.12 } }, (S, at, a) => {
  const d = S.sub.defs; const hole = sv('ellipse', { cx: 960, cy: 900, rx: 340, ry: 70, fill: '#12051a' }, S.sub.svg); const hl = L5.tag(S.ui, 'THE HOLE', { x: 960, y: 1010, size: 42 });
  const box = L5.grp(S.sub, 960, 600, 1); sv('rect', { x: -170, y: -150, width: 340, height: 300, rx: 30, fill: L5.fill(d, '#c98a4a') }, box); sv('rect', { x: -170, y: -30, width: 340, height: 40, fill: '#a86a34' }, box); L5.txt(box, 'R5 000', { x: 0, y: 120, 'font-size': 64, fill: '#fff' });
  const st = L5.stamp(S.ui, 'AGAIN, BIGGER', { x: 960, y: 200, size: 110, col: '#ffd23a', rot: -4 }); const k = at('again'); cue(a + k, 'stamp'); return { hole, hl, box, st, k };
}, (s, lt) => { const q = E.outB(clamp((lt - s.k + .5) / .6)); L5.T(s.box, 960, 600 + Math.sin(lt * 2) * 6, 0, .4 + .6 * q); s.hole.setAttribute('rx', (340 + lt * 30).toFixed(0)); s.hl.set(lt, .2); s.st.set(lt, s.k); }, { in: 'zoom' });

cut(N('but your cousin never pays', 146.2), 'purple', { ground: 'hills', cam: { z0: 1.06, z1: 1.0 } }, (S, at, a) => {
  const inv = L5.doc(S.sub, { x: 760, y: 560, s: 1.25, title: 'INVOICE', w: 400, h: 500, accentC: '#e0245e' }); const st = L5.stamp(S.ui, 'UNPAID', { x: 760, y: 600, size: 120, rot: -12 });
  const f = L5.figure(S.sub, { x: 1480, y: 1000, s: 1.2, shirt: '#ff8f3a', seed: 72 }); const tg = L5.tag(S.ui, 'YOUR COUSIN', { x: 1480, y: 330, size: 46 }); cue(a + .9, 'stamp'); return { inv, st, f, tg };
}, (s, lt, t) => { L5.pop(s.inv, lt, 0, { s: 1.25, r: 3 }); s.st.set(lt, .9); s.f.set(t, { pose: 'shrug', expr: 'smile' }); s.tg.set(lt, .2); }, { in: 'whip' });

cut(N('and your cousins shop', 148.3), 'magenta', { ground: 'hills', cam: { z0: 1.12, z1: 1.0, y0: -40, y1: 0 } }, (S, at, a) => {
  const sh = L5.shop(S.sub, { x: 1250, y: 960, s: 1.05, sign: "COUSIN'S", col: '#ff8f3a' }); const f = L5.figure(S.sub, { x: 420, y: 980, s: 1.25, shirt: '#ffd84a', seed: 61, cap: '#e0245e' });
  const strings = [0, 1, 2].map(i => sv('path', { stroke: '#ffd84a', 'stroke-width': 5, fill: 'none', 'stroke-dasharray': '1400', 'stroke-linecap': 'round' }, S.sub.svg));
  const st = L5.stamp(S.ui, 'YOU CONTROL IT', { x: 1250, y: 220, size: 100, col: '#ffd84a', rot: 5 }); const k = at('secretly'); cue(a + k, 'stamp'); return { sh, f, strings, st, k };
}, (s, lt, t) => { s.sh.tick(t); s.f.set(t, { pose: 'hold', expr: 'smile' }); const q = E.ioC(clamp((lt - s.k + .4) / .8)); s.strings.forEach((p, i) => { p.setAttribute('d', `M${470 + i * 10},${700} Q${800},${300 + i * 60} ${1060 + i * 190},${560 + Math.sin(t * 3 + i) * 12}`); p.style.strokeDashoffset = 1400 * (1 - q); }); s.st.set(lt, s.k + .2); }, { in: 'fade' });

window.__CUTS1 = CUTS.length;

cut(N('that in very simple terms', 152), 'purple', { ground: 'city', cam: { z0: 1.3, z1: 1.0 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 960, y: 1060, s: 1.15, name: 'STEINHOFF', col: '#5a3ad0' }); const tg = L5.tag(S.ui, 'THE SAME TRICK, AT GIANT SIZE', { x: 960, y: 140, size: 50, bg: GOLD }); cue(a + .2, 'whoosh_low');
  return { t, tg };
}, (s, lt, tt) => { s.t.tick(tt); s.tg.set(lt, .6); }, { in: 'zoom' });

cut(N('in 2019 the forensic', 157), 'navy', { ground: 'none', cam: { z0: 1.0, z1: 1.1 } }, (S, at, a) => {
  const d = L5.doc(S.sub, { x: 820, y: 560, s: 1.5, title: 'FORENSIC REPORT', w: 440, h: 540, accentC: '#3a4fd0' }); const l = L5.lens(S.sub, { x: 900, y: 500, s: 1.1 });
  const tg = L5.tag(S.ui, 'PWC · PUBLISHED MARCH 2019', { x: 1420, y: 300, size: 44, bg: GOLD }); cue(a + .3, 'paper'); return { d, l, tg };
}, (s, lt) => { L5.pop(s.d, lt, 0, { s: 1.5, r: -2 }); L5.T(s.l, 760 + Math.sin(lt * 1.3) * 160, 520 + Math.cos(lt * 1.7) * 120, -10, 1.1); s.tg.set(lt, .5); }, { in: 'fade' });

cut(N('over nine years', 161.9), 'navy', { ground: 'none', cam: { z0: 1.0, z1: 1.08, x0: -40, x1: 40 } }, (S, at, a) => {
  const bars = []; for (let i = 0; i < 9; i++) { const g = L5.grp(S.sub, 290 + i * 168, 820, 1); const r = sv('rect', { x: -55, y: 0, width: 110, height: 0, rx: 18, fill: L5.fill(S.sub.defs, i % 2 ? '#ff5fa2' : '#a98bff') }, g); L5.txt(g, String(2009 + i), { x: 0, y: 60, 'font-size': 40 }); bars.push({ g, r, h: 90 + i * 40 }); }
  const tg = L5.tag(S.ui, 'FICTITIOUS OR IRREGULAR DEALS', { x: 960, y: 190, size: 52, bg: GOLD }); bars.forEach((b, i) => cue(a + .2 + i * .22, 'tick', .4)); return { bars, tg, k: at('fictitious') };
}, (s, lt) => { s.bars.forEach((b, i) => { const q = E.outB(clamp((lt - .2 - i * .22) / .5)); b.r.setAttribute('y', -b.h * q); b.r.setAttribute('height', b.h * q); }); s.tg.set(lt, s.k - .3); }, { in: 'whip' });

cut(N('worth about 65', 165.5), 'purple', { ground: 'none', cam: { z0: 1.15, z1: 1.0 }, stars: 90 }, (S, at, a) => {
  const pile = L5.grp(S.sub, 960, 900, 1); const r = C.rnd(4); for (let i = 0; i < 30; i++) { const row = Math.floor(i / 8); L5.coin(S.sub, { parent: pile, x: -330 + (i % 8) * 92 + row * 40, y: -row * 64, r: 50, col: i % 3 ? GOLD : '#ffd84a' }); }
  const b = L5.big(S.ui, '€6.5 BILLION', { x: 960, y: 330, size: 210, color: '#fff' }); cue(a + .3, 'coins'); return { pile, b, k: at('65') };
}, (s, lt) => { L5.pop(s.pile, lt, 0, { bob: 3 }); s.b.set(lt, s.k - .3); }, { in: 'zoom' });

cut(N('thats more than 100', 168.8), 'sunset', { ground: 'none', cam: { z0: 1.0, z1: 1.14 }, stars: 60 }, (S, at, a) => {
  const ring = L5.grp(S.sub, 960, 520, 1); sv('circle', { cx: 0, cy: 0, r: 460, fill: L5.orbFill(S.sub.defs, GOLD, .5) }, ring); const b = L5.big(S.ui, 'R100 BILLION+', { x: 960, y: 520, size: 230, color: GOLD });
  const tg = L5.tag(S.ui, 'MORE THAN', { x: 960, y: 330, size: 50 }); cue(a + .2, 'impact', .8); return { ring, b, tg };
}, (s, lt) => { L5.T(s.ring, 960, 520, 0, 1 + .06 * Math.sin(lt * 3)); s.b.set(lt, .1); s.tg.set(lt, 0); }, { in: 'flash' });

cut(N('the deals were with', 171.5), 'teal', { ground: 'waves', cam: { z0: 1.0, z1: 1.06 } }, (S, at, a) => {
  const r = L5.receipt(S.ui, { source: 'Steinhoff: overview of the PwC investigation', date: '15 Mar 2019', quote: '…said to be, and made to appear to be, third party entities independent of the Steinhoff Group…', hl: ['made to appear to be'], w: 1300 });
  cue(a + .2, 'paper'); return { r, k: at('made to appear') };
}, (s, lt) => s.r.set(lt, .1, { hlAt: [s.k] }), { in: 'iris' });

cut(N('but they were linked', 176.4), 'purple', { ground: 'none', cam: { z0: 1.12, z1: 1.0 }, stars: 80 }, (S, at, a) => {
  const P = [[360, 300], [1560, 300], [300, 760], [1620, 760], [960, 200]]; const ns = P.map(([x, y], i) => L5.node(S.sub, { x, y, s: .9, col: ['#ff5fa2', '#ff8f3a', '#3fe6c8', '#a98bff', '#ffd84a'][i], label: 'CO. ' + 'ABCDE'[i] }));
  const ls = P.map(([x, y]) => L5.link(S.sub, x, y, 960, 640, { col: GOLD, n: 3, bend: 0 })); const grp3 = [0, 1, 2].map(i => L5.figure(S.sub, { x: 860 + i * 100, y: 820, s: .62, shirt: '#1b1533', pants: '#1b1533', seed: 80 + i, hairC: '#000' }));
  const ring = sv('circle', { cx: 960, cy: 700, r: 210, fill: L5.orbFill(S.sub.defs, '#ffd84a', .35) }, S.sub.svg); S.sub.svg.insertBefore(ring, S.sub.svg.firstChild);
  const tg = L5.tag(S.ui, 'THE SAME SMALL GROUP', { x: 960, y: 1000, size: 48, bg: GOLD }); cue(a + .3, 'whoosh'); return { ns, ls, grp3, tg, k: at('small group') };
}, (s, lt, t) => { s.ns.forEach((n, i) => L5.pop(n, lt, i * .12, { s: .9, bob: 4, ph: i })); s.ls.forEach(l => l.set(t, clamp((lt - .6) / .6), .5)); s.grp3.forEach(f => f.set(t, { pose: 'hips', expr: 'smile' })); s.tg.set(lt, s.k - .2); }, { in: 'zoom' });

cut(N('some documents were created', 179.8), 'navy', { ground: 'none', cam: { z0: 1.0, z1: 1.1 } }, (S, at, a) => {
  const d = L5.doc(S.sub, { x: 960, y: 580, s: 1.4, title: 'AGREEMENT', w: 460, h: 520, accentC: '#3a4fd0' }); const dt = L5.big(S.ui, '2017', { x: 960, y: 640, size: 120, color: '#1b1533', glow: '#ffffff' });
  const st = L5.stamp(S.ui, 'BACKDATED', { x: 1180, y: 300, size: 110, rot: 8 }); const k = at('backdated'); cue(a + k, 'stamp'); return { d, dt, st, k };
}, (s, lt) => { L5.pop(s.d, lt, 0, { s: 1.4, r: 2 }); s.dt.set(lt, .2); s.dt.innerHTML = lt < s.k - .6 ? '2017' : '<s style="color:#e0245e">2017</s> 2015'; s.st.set(lt, s.k); }, { in: 'fade' });

cut(N('so the profits looked real', 183.7), 'mint', { ground: 'hills', cam: { z0: 1.08, z1: 1.0 } }, (S, at, a) => {
  const ch = L5.chart(S.sub, [8, 12, 11, 17, 22, 21, 29, 36, 44], { x: 260, y: 820, w: 800, h: 460, col: '#ffd84a' }); const sh = L5.shop(S.sub, { x: 1450, y: 900, s: .95, sign: 'CLOTHING', col: '#ff5fa2' });
  const t1 = L5.tag(S.ui, 'PROFITS: LOOKED REAL', { x: 660, y: 200, size: 46 }); const t2 = L5.tag(S.ui, 'SHOPS: REAL', { x: 1450, y: 260, size: 46, bg: GOLD }); return { ch, sh, t1, t2, k2: at('shops') };
}, (s, lt, t) => { s.ch.draw(E.ioC(clamp(lt / 1))); s.sh.tick(t); L5.pop(s.sh, lt, s.k2 - .3, { s: .95, bob: 2 }); s.t1.set(lt, .2); s.t2.set(lt, s.k2); }, { in: 'whip' });

cut(N('the money', 187.3, 186), 'ember', { ground: 'none', cam: { z0: 1.0, z1: 1.15 } }, (S, at, a) => {
  const pile = L5.grp(S.sub, 960, 760, 1.3); for (let i = 0; i < 12; i++) L5.coin(S.sub, { parent: pile, x: -250 + (i % 6) * 100, y: -Math.floor(i / 6) * 80, r: 56 });
  const st = L5.stamp(S.ui, 'NOT REAL', { x: 960, y: 300, size: 140, rot: -6 }); const k = at('wasnt'); cue(a + k, 'stamp'); return { pile, st, k };
}, (s, lt) => { const q = clamp((lt - s.k) / .9); s.pile.setAttribute('opacity', 1 - .75 * q); L5.T(s.pile, 960, 760 + q * 30, 0, 1.3); s.st.set(lt, s.k); }, { in: 'zoom' });

cut(N('now you might think', 190), 'night', { ground: 'mountains', cam: { z0: 1.0, z1: 1.08 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 960, y: 1050, s: 1.1, name: 'STEINHOFF' }); const fog = sv('rect', { x: 0, y: 0, width: 1920, height: 1080, fill: L5.orbFill(S.sub.defs, '#c8d4ff', .8) }, S.sub.svg);
  const w = L5.big(S.ui, 'INVISIBLE?', { x: 960, y: 200, size: 160, color: '#fff' }); const no = L5.stamp(S.ui, 'NO', { x: 1450, y: 480, size: 150, col: '#ffd23a', rot: 10 }); const k = at('it wasnt'); cue(a + k, 'stamp');
  return { t, fog, w, no, k };
}, (s, lt, tt) => { s.t.tick(tt); s.fog.setAttribute('opacity', (.85 - .8 * clamp((lt - s.k + .3) / .6)).toFixed(3)); s.w.set(lt, .3); s.no.set(lt, s.k); }, { in: 'fade' });

cut(N('the warning signs were there', 194.7), 'teal', { ground: 'waves', cam: { z0: 1.15, z1: 1.0, x0: -120, x1: 120 } }, (S, at, a) => {
  const road = sv('path', { d: 'M-100,860 Q960,700 2020,860', stroke: '#06566c', 'stroke-width': 90, fill: 'none' }, S.sub.svg);
  const ws = [0, 1, 2, 3].map(i => L5.warn(S.sub, { x: 300 + i * 440, y: 560 - Math.sin((i + .5) / 4 * Math.PI) * 60, s: .75, label: String(i + 1) })); const yrs = ['2007', '2015', '2017', 'ALWAYS'].map((y, i) => L5.tag(S.ui, y, { x: 300 + i * 440, y: 820, size: 40 }));
  [0, 1, 2, 3].forEach(i => cue(a + .3 + i * .45, 'pop', .6)); return { ws, yrs };
}, (s, lt) => { s.ws.forEach((w, i) => L5.pop(w, lt, .3 + i * .45, { s: .75, bob: 6, ph: i })); s.yrs.forEach((y, i) => y.set(lt, .5 + i * .45)); }, { in: 'zoom' });

cut(N('and one of them you can', 197.4), 'teal', { ground: 'hills', cam: { z0: 1.0, z1: 1.1 } }, (S, at, a) => {
  const f = L5.figure(S.sub, { x: 560, y: 990, s: 1.35, shirt: '#ff8f3a', seed: 91, female: true }); const p = L5.phone(S.sub, { x: 1300, y: 540, s: 1.15, w: 330, h: 600, screen: (g, d, w, h) => { sv('rect', { x: 0, y: 0, width: w, height: 110, fill: '#0a7a8c' }, g); L5.txt(g, 'CHECK', { x: w / 2, y: 76, 'font-size': 44 });
    const r = []; for (let i = 0; i < 4; i++) { sv('rect', { x: 26, y: 150 + i * 110, width: w - 52, height: 86, rx: 18, fill: '#e6f7f6' }, g); r.push(L5.txt(g, '', { x: 66, y: 210 + i * 110, 'font-size': 52, fill: '#1fb86a' })); sv('rect', { x: 110, y: 184 + i * 110, width: w - 170, height: 18, rx: 9, fill: '#b9dcdc' }, g); } return t => r.forEach((e, i) => e.textContent = t - a > 1 + i * .5 ? '✓' : ''); } });
  const tg = L5.tag(S.ui, '5 MINUTES', { x: 1300, y: 140, size: 52, bg: GOLD }); const k = at('five minutes'); for (let i = 0; i < 4; i++) cue(a + 1 + i * .5, 'tap', .6); return { f, p, tg, k };
}, (s, lt, t) => { s.f.set(t, { pose: 'point', expr: 'smile' }); s.p.tick(t); L5.pop(s.p, lt, 0, { bob: 4 }); s.tg.set(lt, s.k - .3); }, { in: 'fade' });

// =====================================================================================================
// CH3 WARNING SIGNS (teal / navy; each sign gets its own picture)
// =====================================================================================================
const signCard = (phrase, near, n, label, pal) => cut(N(phrase, near), pal, { ground: 'waves', cam: { z0: 1.2, z1: 1.0 }, stars: 60 }, (S, at, a) => {
  const w = L5.warn(S.sub, { x: 620, y: 540, s: 1.35, label: String(n) }); const t = L5.big(S.ui, label, { x: 1300, y: 560, size: 120, color: '#fff', width: 1100 }); const k = L5.tag(S.ui, 'WARNING SIGN ' + n, { x: 1300, y: 400, size: 44, bg: GOLD });
  cue(a + .1, 'swoosh_up', .6); cue(a + .4, 'ding'); return { w, t, k };
}, (s, lt) => { L5.pop(s.w, lt, .05, { s: 1.35, bob: 6, sway: 2 }); s.t.set(lt, .5); s.k.set(lt, .2); }, { in: 'zoom' });
signCard('warning sign one', 203.1, 1, 'HARD TO FOLLOW', 'teal');

cut(N('as far back as', 207.1), 'navy', { ground: 'city', cam: { z0: 1.0, z1: 1.08, x0: 40, x1: -40 } }, (S, at, a) => {
  const d = L5.doc(S.sub, { x: 1180, y: 560, s: 1.3, title: 'ACCOUNTS', w: 420, h: 520, accentC: '#3a4fd0' }); const q = L5.txt(d, 'REVENUE: ?', { x: 0, y: 200, 'font-size': 56, fill: '#e0245e' });
  const fs = [0, 1].map(i => L5.figure(S.sub, { x: 380 + i * 240, y: 990, s: 1.1, shirt: ['#3fe6c8', '#ffd84a'][i], seed: 100 + i, glasses: true, female: i === 1 })); const l = L5.lens(S.sub, { x: 1180, y: 680, s: .9 });
  const tg = L5.tag(S.ui, '2007 · ANALYSTS ASK', { x: 520, y: 330, size: 46, bg: GOLD }); cue(a + .3, 'pop'); return { d, fs, l, tg, kq: at('revenue') };
}, (s, lt, t) => { L5.pop(s.d, lt, 0, { s: 1.3, r: -2 }); s.fs.forEach((f, i) => f.set(t, { pose: i ? 'think' : 'point', expr: 'worried' })); L5.T(s.l, 1180 + Math.sin(lt * 1.5) * 90, 700 + Math.cos(lt) * 40, -8, .9); s.tg.set(lt, .2); }, { in: 'whip' });

cut(N('steinhoff pushed back', 214.6), 'magenta', { ground: 'none', cam: { z0: 1.1, z1: 1.0 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 600, y: 1060, s: 1.0, name: 'STEINHOFF' }); const d = L5.doc(S.sub, { x: 1300, y: 520, s: 1, title: 'QUESTIONS', w: 360, h: 440, accentC: '#3fa0c8' });
  const st = L5.stamp(S.ui, 'PUSHED BACK', { x: 1300, y: 200, size: 100, rot: -5 }); cue(a + .5, 'whoosh'); cue(a + .6, 'stamp'); return { t, d, st };
}, (s, lt, tt) => { s.t.tick(tt); const q = E.outC(clamp((lt - .4) / .6)); L5.T(s.d, 1100 + q * 380, 520 - q * 60, q * 25, 1); s.st.set(lt, .6); }, { in: 'fade' });

signCard('warning sign two', 216.6, 2, 'DEALS WITH INSIDERS', 'purple');

cut(N('money moved between', 220.3), 'purple', { ground: 'city', cam: { z0: 1.0, z1: 1.1 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 960, y: 1020, s: .9, name: 'STEINHOFF' }); const P = [[330, 520], [1590, 520], [520, 880], [1400, 880]];
  const ns = P.map(([x, y], i) => L5.node(S.sub, { x, y, s: .85, col: ['#ff5fa2', '#ff8f3a', '#3fe6c8', '#a98bff'][i], label: 'LINKED' }));
  const ls = P.map(([x, y], i) => L5.link(S.sub, 960, 520, x, y - 60, { col: i % 2 ? '#ffd84a' : '#3fe6c8', n: 4, bend: -120 })); const tg = L5.tag(S.ui, "LINKED TO ITS OWN PEOPLE", { x: 960, y: 130, size: 48, bg: GOLD });
  cue(a + .3, 'coins', .6); return { t, ns, ls, tg, k: at('linked') };
}, (s, lt, tt) => { s.t.tick(tt); s.ns.forEach((n, i) => L5.pop(n, lt, i * .15, { s: .85, bob: 4, ph: i })); s.ls.forEach((l, i) => l.set(tt + i * .3, clamp((lt - .5) / .5), i % 2 ? .6 : -.6 + 1.2)); s.tg.set(lt, s.k - .3); }, { in: 'zoom' });

signCard('warning sign three', 225, 3, 'THE POLICE', 'navy');

cut(N('in november 2015', 227.9), 'night', { ground: 'city', cam: { z0: 1.12, z1: 1.0 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 1250, y: 1000, s: .95, name: 'EUROPEAN OFFICE', fs: 40, col: '#2a4fd0' }); const lights = [0, 1].map(i => sv('circle', { cx: 300 + i * 260, cy: 520, r: 380, fill: L5.orbFill(S.sub.defs, i ? '#ff3d5a' : '#3d7aff', .55) }, S.sub.svg));
  const boxes = [0, 1, 2].map(i => { const g = L5.grp(S.sub, 0, 0, 1); sv('rect', { x: -70, y: -60, width: 140, height: 120, rx: 14, fill: L5.fill(S.sub.defs, '#c98a4a') }, g); L5.txt(g, 'FILES', { x: 0, y: 14, 'font-size': 34 }); return g; });
  const tg = L5.tag(S.ui, 'GERMANY · NOVEMBER 2015', { x: 600, y: 200, size: 48, bg: GOLD }); const st = L5.stamp(S.ui, 'RAID', { x: 600, y: 400, size: 150, col: '#ff3d5a', rot: -8 });
  const k = at('raided'); cue(a + k, 'stamp'); cue(a + .3, 'buzz', .4); return { t, lights, boxes, tg, st, k };
}, (s, lt, tt) => { s.t.tick(tt); s.lights.forEach((l, i) => l.setAttribute('opacity', (Math.sin(lt * 8 + i * Math.PI) > 0 ? .9 : .15))); s.boxes.forEach((b, i) => { const q = clamp((lt - 1 - i * .7) / 2.5); L5.T(b, lerp(1200, 300, q), 900 - Math.abs(Math.sin(q * 9)) * 30, 0, 1); b.setAttribute('opacity', q > 0 && q < 1 ? 1 : 0); }); s.tg.set(lt, .2); s.st.set(lt, s.k); }, { in: 'whip' });

cut(N('over suspected accounting', 232.2), 'navy', { ground: 'none', cam: { z0: 1.0, z1: 1.12 } }, (S, at, a) => {
  const d = L5.doc(S.sub, { x: 960, y: 600, s: 1.3, title: 'INVESTIGATION', w: 520, h: 520, accentC: '#2a4fd0' }); const b = L5.big(S.ui, 'SUSPECTED ACCOUNTING FRAUD', { x: 960, y: 150, size: 100, color: '#fff' }); return { d, b };
}, (s, lt) => { L5.pop(s.d, lt, 0, { s: 1.3, r: -1 }); s.b.set(lt, .1); }, { in: 'fade' });

cut(N('in august 2017', 235.4), 'magenta', { ground: 'none', cam: { z0: 1.12, z1: 1.0 } }, (S, at, a) => {
  const mag = L5.grp(S.sub, 760, 560, 1.15); const d = S.sub.defs; sv('rect', { x: -250, y: -330, width: 500, height: 660, rx: 20, fill: '#000', opacity: .3, transform: 'translate(20,24)' }, mag); sv('rect', { x: -250, y: -330, width: 500, height: 660, rx: 20, fill: L5.fill(d, '#ff5fa2') }, mag);
  L5.txt(mag, 'MAGAZINE', { x: 0, y: -240, 'font-size': 80, fill: '#fff', 'letter-spacing': 6 }); L5.txt(mag, 'AUGUST 2017', { x: 0, y: -180, 'font-size': 34, fill: '#ffe0ef' }); sv('rect', { x: -200, y: -130, width: 400, height: 260, rx: 16, fill: '#7a0f63' }, mag);
  L5.txt(mag, 'UNDER', { x: 0, y: 220, 'font-size': 80, fill: '#ffd84a' }); L5.txt(mag, 'INVESTIGATION', { x: 0, y: 290, 'font-size': 62, fill: '#ffd84a' }); sv('circle', { cx: 0, cy: 0, r: 70, fill: '#ff8fc5' }, mag); sv('rect', { x: -70, y: 60, width: 140, height: 70, rx: 30, fill: '#ff8fc5' }, mag);
  const tg = L5.tag(S.ui, 'A GERMAN MAGAZINE REPORTS', { x: 1400, y: 300, size: 46, bg: GOLD }); const t2 = L5.tag(S.ui, 'THE BOSS HIMSELF', { x: 1400, y: 440, size: 46 }); cue(a + .3, 'paper'); return { mag, tg, t2, k: at('boss') };
}, (s, lt) => { L5.pop(s.mag, lt, 0, { s: 1.15, r: -3, sway: 1 }); s.tg.set(lt, .3); s.t2.set(lt, s.k); }, { in: 'zoom' });

cut(N('the share price dipped', 242.1), 'teal', { ground: 'none', cam: { z0: 1.0, z1: 1.1 } }, (S, at, a) => {
  const ch = L5.chart(S.sub, [30, 34, 38, 41, 44, 38, 41, 44, 46], { x: 280, y: 860, w: 1360, h: 520, col: '#3fe6c8', max: 50 }); const t1 = L5.tag(S.ui, 'DIPPED', { x: 1000, y: 440, size: 46, bg: '#ff5fa2', color: '#fff' }); const t2 = L5.tag(S.ui, 'CARRIED ON', { x: 1500, y: 260, size: 46, bg: GOLD });
  cue(a + .1, 'swoosh_up', .5); return { ch, t1, t2, k: at('carried') };
}, (s, lt) => { s.ch.draw(E.ioC(clamp(lt / 2.6))); s.t1.set(lt, 1.2); s.t2.set(lt, s.k); }, { in: 'whip' });

signCard('and warning sign four', 245.4, 4, 'TOO FAST TO EXPLAIN', 'sunset');

cut(N('steinhoff grew by buying', 252.1), 'sunset', { ground: 'city', cam: { z0: 1.0, z1: 1.1, x0: -60, x1: 60 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 1450, y: 1000, s: .9, name: 'STEINHOFF', col: '#5a3ad0' }); const ns = []; for (let i = 0; i < 7; i++) ns.push(L5.node(S.sub, { x: 0, y: 0, s: .7, col: ['#ff5fa2', '#ff8f3a', '#3fe6c8', '#a98bff'][i % 4], label: '' }));
  const tg = L5.tag(S.ui, 'COMPANY AFTER COMPANY', { x: 700, y: 180, size: 50, bg: GOLD }); for (let i = 0; i < 7; i++) cue(a + .4 + i * .7 + .6, 'pop', .5); return { t, ns, tg };
}, (s, lt, tt) => { s.t.tick(tt); s.t.setAttribute('transform', `translate(1450,1000) scale(${(.9 + .02 * Math.floor(clamp((lt - .4) / .7, 0, 7))).toFixed(3)})`); s.ns.forEach((n, i) => { const q = clamp((lt - .4 - i * .7) / 1.2); L5.T(n, lerp(-150, 1400, E.ioC(q)), 600 - Math.sin(q * Math.PI) * 200, 0, .7 * (1 - .6 * E.inC(q))); n.setAttribute('opacity', q > 0 && q < 1 ? 1 : 0); }); s.tg.set(lt, .2); }, { in: 'fade' });

cut(N('if you cant explain', 258), 'navy', { ground: 'hills', cam: { z0: 1.08, z1: 1.0 } }, (S, at, a) => {
  const f = L5.figure(S.sub, { x: 520, y: 990, s: 1.35, shirt: '#3fe6c8', seed: 111 }); const bub = L5.grp(S.sub, 1180, 420, 1); sv('rect', { x: -480, y: -150, width: 960, height: 300, rx: 70, fill: '#ffffff' }, bub); sv('path', { d: 'M-380,120 L-480,250 L-260,140Z', fill: '#fff' }, bub);
  L5.txt(bub, 'HOW DOES IT MAKE MONEY?', { x: 0, y: -30, 'font-size': 60, fill: '#1b1533' }); L5.txt(bub, 'ONE SENTENCE.', { x: 0, y: 60, 'font-size': 60, fill: '#e0245e' }); return { f, bub };
}, (s, lt, t) => { s.f.set(t, { pose: 'think', expr: 'worried', talk: 0 }); L5.pop(s.bub, lt, .2, { bob: 4 }); }, { in: 'zoom' });

cut(N('thats your sign to slow', 262), 'ember', { ground: 'waves', cam: { z0: 1.2, z1: 1.0 } }, (S, at, a) => {
  const sg = L5.grp(S.sub, 960, 520, 1); sv('circle', { cx: 0, cy: 0, r: 380, fill: L5.orbFill(S.sub.defs, '#ff3d5a', .45) }, sg); sv('circle', { cx: 0, cy: 0, r: 260, fill: L5.ballFill(S.sub.defs, '#ff3d5a') }, sg); sv('circle', { cx: 0, cy: 0, r: 215, fill: 'none', stroke: '#fff', 'stroke-width': 20 }, sg);
  L5.txt(sg, 'SLOW', { x: 0, y: -10, 'font-size': 150 }); L5.txt(sg, 'DOWN', { x: 0, y: 120, 'font-size': 120 }); cue(a + .2, 'impact', .7); return { sg };
}, (s, lt) => L5.pop(s.sg, lt, .05, { bob: 5, sway: 2 }), { in: 'flash' });

cut(N('elsie didnt see', 264.7), 'night', { ground: 'mountains', cam: { z0: 1.0, z1: 1.1, x0: 60, x1: -40 } }, (S, at, a) => {
  const ws = [0, 1, 2, 3].map(i => L5.warn(S.mid, { x: 600 + i * 480, y: 500, s: .7, label: String(i + 1) })); const e = elsie(S.sub, { x: 960, y: 1000, s: 1.5 });
  const p = L5.phone(S.sub, { x: 0, y: 0, s: .22, w: 300, h: 560, screen: (g, d, w, h) => { L5.txt(g, 'R46', { x: w / 2, y: h * .5, 'font-size': 130, fill: '#1fb86a' }); } }); e.hold(1, p);
  const tg = L5.tag(S.ui, 'MOST PEOPLE DIDN’T SEE IT', { x: 960, y: 170, size: 48 }); return { ws, e, tg, k: at('most people') };
}, (s, lt, t) => { s.ws.forEach((w, i) => L5.pop(w, lt, .2 + i * .15, { s: .7, bob: 6, ph: i })); s.e.set(t, { pose: 'phone', expr: 'smile' }); s.tg.set(lt, s.k - .2); }, { in: 'fade' });

cut(N('the share price was still', 268.5), 'sunset', { ground: 'none', cam: { z0: 1.12, z1: 1.0 }, stars: 60 }, (S, at, a) => {
  const c = L5.shareCard(S.sub, { x: 960, y: 500, s: 1.4, name: 'STILL HIGH', price: 'R46', col: '#a3305e' }); const w = L5.big(S.ui, 'HIGH PRICE ≠ PROOF', { x: 960, y: 900, size: 120, color: GOLD });
  const k = at('proof'); cue(a + k, 'ding'); return { c, w, k };
}, (s, lt) => { L5.pop(s.c, lt, 0, { s: 1.4, r: -2, sway: 1 }); s.w.set(lt, s.k - .4); }, { in: 'zoom' });

cut(N('then came december', 273.6), 'ember', { ground: 'mountains', cam: { z0: 1.25, z1: 1.0 }, stars: 90 }, (S, at, a) => {
  const cal = L5.grp(S.sub, 960, 540, 1.2); sv('rect', { x: -230, y: -260, width: 460, height: 520, rx: 40, fill: '#fff8ec' }, cal); sv('rect', { x: -230, y: -260, width: 460, height: 130, rx: 40, fill: '#c22a2a' }, cal); sv('rect', { x: -230, y: -170, width: 460, height: 40, fill: '#c22a2a' }, cal);
  L5.txt(cal, 'DECEMBER', { x: 0, y: -180, 'font-size': 60, fill: '#fff', 'letter-spacing': 4 }); L5.txt(cal, '2017', { x: 0, y: 120, 'font-size': 220, fill: '#1b1533' }); cue(a + .2, 'whoosh_low'); cue(a + .5, 'heartbeat', .7); return { cal };
}, (s, lt) => L5.pop(s.cal, lt, .1, { s: 1.2, r: 3, sway: 1.5 }), { in: 'zoom' });

window.__CUTS2 = CUTS.length;

// =====================================================================================================
// CH4 THE CRASH (ember, then night; sunset for the twist)
// =====================================================================================================
cut(N('on the evening of', 276.3), 'ember', { ground: 'city', cam: { z0: 1.0, z1: 1.1 } }, (S, at, a) => {
  const d = L5.doc(S.sub, { x: 1180, y: 560, s: 1.35, title: '2017 RESULTS', w: 440, h: 520, accentC: '#c22a2a' }); const sig = sv('path', { d: 'M-150,170 q40,-50 70,0 t70,0 t70,0', stroke: '#c9cbe8', 'stroke-width': 6, fill: 'none', 'stroke-dasharray': '6 10' }, d);
  const f = L5.figure(S.sub, { x: 460, y: 990, s: 1.3, shirt: '#3fe6c8', seed: 121, glasses: true }); const tg = L5.tag(S.ui, 'THE AUDITORS', { x: 460, y: 300, size: 48, bg: GOLD });
  const st = L5.stamp(S.ui, 'NOT SIGNED', { x: 1180, y: 300, size: 100, rot: -6 }); const k = at('wouldnt sign'); cue(a + k + .3, 'stamp'); return { d, f, tg, st, k };
}, (s, lt, t) => { L5.pop(s.d, lt, 0, { s: 1.35, r: 2 }); s.f.set(t, { pose: lt > s.k ? 'shrug' : 'think', expr: 'worried' }); s.tg.set(lt, .3); s.st.set(lt, s.k + .3); }, { in: 'fade' });

cut(N('the results were postponed', 282.2), 'ember', { ground: 'none', cam: { z0: 1.12, z1: 1.0 } }, (S, at, a) => {
  const clk = L5.grp(S.sub, 960, 520, 1.3); sv('circle', { cx: 0, cy: 0, r: 330, fill: L5.orbFill(S.sub.defs, '#ff9a6a', .4) }, clk); sv('circle', { cx: 0, cy: 0, r: 220, fill: L5.ballFill(S.sub.defs, '#fff8ec') }, clk);
  const h1 = sv('rect', { x: -9, y: -170, width: 18, height: 170, rx: 9, fill: '#1b1533' }, clk); const h2 = sv('rect', { x: -12, y: -110, width: 24, height: 110, rx: 12, fill: '#c22a2a' }, clk);
  const st = L5.stamp(S.ui, 'POSTPONED', { x: 960, y: 900, size: 120, rot: 3 }); cue(a + .6, 'stamp'); return { clk, h1, h2, st };
}, (s, lt) => { s.h1.setAttribute('transform', `rotate(${(lt * 220).toFixed(1)})`); s.h2.setAttribute('transform', `rotate(${(lt * 20).toFixed(1)})`); L5.pop(s.clk, lt, 0, { s: 1.3, bob: 3 }); s.st.set(lt, .6); }, { in: 'whip' });

cut(N('and the ceo', 284.1), 'night', { ground: 'none', cam: { z0: 1.0, z1: 1.14 } }, (S, at, a) => {
  const d = S.sub.defs; sv('rect', { x: 260, y: 760, width: 1400, height: 60, rx: 20, fill: L5.fill(d, '#3a2a7a') }, S.sub.svg); const chair = L5.grp(S.sub, 960, 760, 1.15);
  sv('rect', { x: -130, y: -420, width: 260, height: 300, rx: 60, fill: L5.fill(d, '#2a1a5a') }, chair); sv('rect', { x: -160, y: -150, width: 320, height: 80, rx: 30, fill: L5.fill(d, '#3a2a7a') }, chair);
  const plate = L5.grp(S.sub, 960, 740, 1); sv('rect', { x: -170, y: -60, width: 340, height: 80, rx: 12, fill: L5.fill(d, GOLD) }, plate); L5.txt(plate, 'CEO', { x: 0, y: 0, 'font-size': 56, fill: '#3a2a10' });
  const tg = L5.tag(S.ui, 'CEO MARKUS JOOSTE RESIGNS · 5 DEC 2017', { x: 960, y: 180, size: 46, bg: GOLD }); const k = at('resigned'); cue(a + k, 'whoosh'); return { chair, plate, tg, k };
}, (s, lt) => { const q = E.inC(clamp((lt - s.k) / 1)); L5.T(s.chair, 960 + q * 900, 760, q * 30, 1.15); s.tg.set(lt, .5); L5.pop(s.plate, lt, .1, { bob: 0 }); }, { in: 'fade' });

const crashShot = (phrase, near, pts, from, to, pct, day) => cut(N(phrase, near), 'ember', { ground: 'city', cam: { z0: 1.06, z1: 1.0, x0: 40, x1: -40 } }, (S, at, a) => {
  const ch = L5.chart(S.sub, pts, { x: 240, y: 880, w: 1300, h: 600, col: '#ffd23a', max: 50 }); const pr = L5.big(S.ui, '', { x: 1560, y: 230, size: 140, color: '#fff' }); const st = L5.stamp(S.ui, pct, { x: 1060, y: 330, size: 130 });
  const tg = L5.tag(S.ui, day, { x: 420, y: 150, size: 46, bg: GOLD }); const k = at(pct === '−61%' ? 'sixtyone' : 'fortythree'); cue(a + k, 'stamp'); cue(a + .4, 'whoosh_low'); return { ch, pr, st, tg, k, from, to };
}, (s, lt) => { const q = E.ioC(clamp(lt / 2.2)); s.ch.draw(q); const v = lerp(s.from, s.to, E.ioC(clamp((lt - 1) / 1.6))); s.pr.innerHTML = 'R' + v.toFixed(2).replace('.', ','); s.pr.set(lt, .4); s.st.set(lt, s.k); s.tg.set(lt, .1); }, { in: 'whip' });
crashShot('wednesday morning', 287.8, [44, 45, 46, 45.65, 17.61], 45.65, 17.61, '−61%', 'WEDNESDAY 6 DEC');
crashShot('thursday another', 293.4, [45.65, 30, 17.61, 14, 10], 17.61, 10, '−43%', 'THURSDAY 7 DEC');

cut(N('about eighty percent gone', 297.4), 'ember', { ground: 'none', cam: { z0: 1.2, z1: 1.0 }, stars: 60 }, (S, at, a) => {
  const ring = L5.grp(S.sub, 960, 500, 1); sv('circle', { cx: 0, cy: 0, r: 470, fill: L5.orbFill(S.sub.defs, '#ff3d5a', .5) }, ring); const b = L5.big(S.ui, '−80%', { x: 960, y: 470, size: 330, color: '#fff', glow: '#ff3d5a' }); const tg = L5.tag(S.ui, 'ABOUT 80% IN TWO DAYS', { x: 960, y: 760, size: 52, bg: GOLD });
  cue(a + .2, 'boom', .7); return { ring, b, tg };
}, (s, lt) => { L5.T(s.ring, 960, 500, 0, 1 + .05 * Math.sin(lt * 4)); s.b.set(lt, .15); s.tg.set(lt, .7); }, { in: 'flash' });

cut(N('roughly ten billion', 300.6), 'ember', { ground: 'city', cam: { z0: 1.0, z1: 1.12, y0: 0, y1: -30 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 960, y: 1060, s: 1.0, name: 'STEINHOFF', col: '#5a3ad0' }); const rain = coinRain(S, 30, 7, [500, 200, 900, 200]); const b = L5.big(S.ui, '€10 BILLION', { x: 960, y: 160, size: 160, color: GOLD }); const tg = L5.tag(S.ui, 'WIPED OUT', { x: 960, y: 300, size: 50 });
  cue(a + .3, 'coins'); return { t, rain, b, tg, k: at('wiped') };
}, (s, lt, tt) => { s.t.tick(tt); s.t.setAttribute('opacity', (1 - .7 * clamp((lt - 1) / 2.5)).toFixed(3)); s.rain(lt); s.b.set(lt, .1); s.tg.set(lt, s.k - .2); }, { in: 'zoom' });

cut(N('well over 100', 304.5), 'sunset', { ground: 'none', cam: { z0: 1.0, z1: 1.12 }, stars: 60 }, (S, at, a) => {
  const b = L5.big(S.ui, 'R100 BILLION+', { x: 960, y: 520, size: 240, color: GOLD }); const tg = L5.tag(S.ui, 'WELL OVER', { x: 960, y: 330, size: 50 }); cue(a + .2, 'impact', .7); return { b, tg };
}, (s, lt) => { s.b.set(lt, .1); s.tg.set(lt, 0); }, { in: 'zoom' });

cut(N('on thursday elsie checks', 307.6), 'night', { ground: 'mountains', cam: { z0: 1.0, z1: 1.12 } }, (S, at, a) => {
  const e = elsie(S.sub, { x: 560, y: 1000, s: 1.45 }); const h = L5.house(S.sub, { x: 1500, y: 930, s: .9, col: '#ff9a4a' }); const tg = L5.tag(S.ui, 'THURSDAY: HER STATEMENT', { x: 960, y: 170, size: 48, bg: GOLD });
  const p = L5.phone(S.sub, { x: 0, y: 0, s: .22, w: 300, h: 560, screen: (g, d, w, h) => { L5.txt(g, 'R21 900', { x: w / 2, y: h * .5, 'font-size': 76, fill: '#e0245e' }); } }); e.hold(1, p); return { e, h, tg };
}, (s, lt, t) => { s.e.set(t, { pose: 'phone', expr: lt > 1.4 ? 'shock' : 'neutral' }); s.h.tick(t); s.tg.set(lt, .2); }, { in: 'fade' });

cut(N('21900 rand thirty', 310.5), 'ember', { ground: 'none', cam: { z0: 1.0, z1: 1.18 } }, (S, at, a) => {
  const p = L5.phone(S.sub, { x: 960, y: 540, s: 1.2, w: 340, h: 620, glow: '#ff6a3a', screen: screenBalance('MY SHARES', (t, v, s) => { v.textContent = 'R21 900'; v.setAttribute('font-size', 92); v.setAttribute('fill', '#e0245e'); s.textContent = 'was R100 000'; }) });
  cue(a + .2, 'notif'); return { p };
}, (s, lt, t) => { s.p.tick(t); L5.pop(s.p, lt, 0, { s: 1.2, bob: 3, r: -2 }); }, { in: 'zoom' });

cut(N('thirty years of saving', 313.6), 'night', { ground: 'none', cam: { z0: 1.08, z1: 1.0 } }, (S, at, a) => {
  const j = L5.jar(S.sub, { x: 960, y: 960, s: 1.2 }); const tg = L5.tag(S.ui, '30 YEARS OF SAVING', { x: 960, y: 140, size: 54, bg: GOLD }); const b = L5.big(S.ui, 'NEARLY 80% GONE', { x: 960, y: 290, size: 110, color: '#fff' });
  cue(a + 1, 'coins', .5); return { j, tg, b, k: at('nearly') };
}, (s, lt) => { s.j.level(1 - .78 * E.ioC(clamp((lt - s.k + .3) / 1.6))); L5.pop(s.j, lt, 0, { s: 1.2, bob: 2 }); s.tg.set(lt, .1); s.b.set(lt, s.k); }, { in: 'whip' });

cut(N('who lost', 318.9), 'teal', { ground: 'city', cam: { z0: 1.0, z1: 1.08 } }, (S, at, a) => {
  const h = L5.hall(S.sub, { x: 540, y: 960, s: .85, label: 'BIG FUNDS', roof: '#0a7a8c' }); const fs = [0, 1, 2, 3].map(i => i === 1 ? elsie(S.sub, { x: 1300, y: 990, s: 1 }) : L5.figure(S.sub, { x: 1080 + i * 160, y: 970 + (i % 2) * 30, s: .9, shirt: ['#ff8f3a', '', '#ffd84a', '#a98bff'][i], seed: 130 + i }));
  const t1 = L5.tag(S.ui, 'BIG FUNDS', { x: 540, y: 250, size: 46, bg: GOLD }); const t2 = L5.tag(S.ui, 'ORDINARY PEOPLE', { x: 1400, y: 330, size: 46, bg: GOLD }); const q = L5.big(S.ui, 'WHO LOST?', { x: 960, y: 120, size: 110 });
  return { h, fs, t1, t2, q, k1: at('big funds'), k2: at('ordinary') };
}, (s, lt, t) => { s.fs.forEach(f => f.set(t, { pose: 'sad', expr: 'sad' })); s.q.set(lt, 0); s.t1.set(lt, s.k1); s.t2.set(lt, s.k2); }, { in: 'fade' });

cut(N('the government workers fund', 322.7), 'teal', { ground: 'none', cam: { z0: 1.12, z1: 1.0 } }, (S, at, a) => {
  const h = L5.hall(S.sub, { x: 960, y: 1000, s: 1.15, label: 'PENSION FUND', roof: '#0a7a8c', col: '#e8fffb' }); const b = L5.big(S.ui, '−R20 BILLION', { x: 960, y: 200, size: 170, color: GOLD });
  cue(a + at('20'), 'impact', .7); return { h, b, k: at('20') };
}, (s, lt) => { L5.pop(s.h, lt, 0, { s: 1.15, bob: 2 }); s.b.set(lt, s.k - .3); }, { in: 'zoom' });

cut(N('its pensions werent cut', 326.4), 'mint', { ground: 'hills', cam: { z0: 1.0, z1: 1.08, x0: -40, x1: 40 } }, (S, at, a) => {
  const f = L5.figure(S.sub, { x: 560, y: 990, s: 1.35, shirt: '#ff8f3a', seed: 141, elder: true }); const cal = L5.grp(S.sub, 1350, 480, 1); sv('rect', { x: -200, y: -220, width: 400, height: 440, rx: 34, fill: '#fff8ec' }, cal); sv('rect', { x: -200, y: -220, width: 400, height: 100, rx: 34, fill: '#0a7a8c' }, cal);
  const mon = L5.txt(cal, 'JAN', { x: 0, y: -150, 'font-size': 50, fill: '#fff' }); L5.txt(cal, 'PAID ✓', { x: 0, y: 90, 'font-size': 96, fill: '#1fb86a' }); const tg = L5.tag(S.ui, 'PENSIONS KEPT PAYING', { x: 1350, y: 850, size: 46, bg: GOLD });
  const t2 = L5.tag(S.ui, 'IT PROMISES A SET PENSION', { x: 960, y: 140, size: 46 }); return { f, cal, mon, tg, t2, k: at('because') };
}, (s, lt, t) => { s.f.set(t, { pose: 'stand', expr: 'smile' }); s.mon.textContent = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'][Math.floor(lt / .8) % 6]; L5.pop(s.cal, lt, 0, { bob: 4 }); s.tg.set(lt, .5); s.t2.set(lt, s.k); }, { in: 'fade' });

cut(N('years later in 2022', 332.6), 'navy', { ground: 'city', cam: { z0: 1.0, z1: 1.1 } }, (S, at, a) => {
  const h = L5.hall(S.sub, { x: 960, y: 1000, s: 1.15, label: 'COURT', roof: '#3a4fd0' }); const gv = L5.grp(S.sub, 1500, 420, 1); const d = S.sub.defs;
  sv('rect', { x: -40, y: -10, width: 230, height: 40, rx: 20, fill: L5.fill(d, '#c98a4a'), transform: 'rotate(-30)' }, gv); sv('rect', { x: -110, y: -60, width: 150, height: 90, rx: 30, fill: L5.fill(d, '#a86a34'), transform: 'rotate(-30)' }, gv);
  const tg = L5.tag(S.ui, 'SETTLEMENT APPROVED · 2022', { x: 700, y: 180, size: 48, bg: GOLD }); cue(a + .8, 'thud'); return { h, gv, tg };
}, (s, lt) => { const sw = lt < .8 ? -30 * (1 - lt / .8) : Math.sin((lt - .8) * 10) * 4 * Math.exp(-(lt - .8) * 3); L5.T(s.gv, 1500, 420, sw, 1); s.tg.set(lt, .3); }, { in: 'whip' });

cut(N('settlement of 143', 336.5), 'navy', { ground: 'none', cam: { z0: 1.1, z1: 1.0 }, stars: 90 }, (S, at, a) => {
  const b1 = L5.big(S.ui, '€1.43 BILLION', { x: 960, y: 380, size: 190, color: '#fff' }); const b2 = L5.big(S.ui, '≈ R25 BILLION', { x: 960, y: 640, size: 150, color: GOLD }); return { b1, b2, k2: at('about 25') };
}, (s, lt) => { s.b1.set(lt, .1); s.b2.set(lt, s.k2 - .2); }, { in: 'zoom' });

cut(N('more than 43000', 341.4), 'purple', { ground: 'none', cam: { z0: 1.0, z1: 1.1 } }, (S, at, a) => {
  const docs = []; for (let i = 0; i < 12; i++) docs.push(L5.doc(S.sub, { x: 0, y: 0, s: .5, title: 'CLAIM', w: 360, h: 440, accentC: ['#ff5fa2', '#a98bff', '#3fe6c8'][i % 3] }));
  const n = L5.big(S.ui, '', { x: 1400, y: 440, size: 170, color: GOLD }); const tg = L5.tag(S.ui, 'CLAIMS · WORTH ABOUT €3.2 BILLION', { x: 1400, y: 620, size: 42 }); for (let i = 0; i < 6; i++) cue(a + .2 + i * .3, 'paper', .5); return { docs, n, tg, k: at('worth') };
}, (s, lt) => { s.docs.forEach((d, i) => { const q = E.outB(clamp((lt - i * .18) / .5)); L5.T(d, 600 + (i % 3) * 30 - 30, 980 - i * 52 - (1 - q) * 300, (i % 2 ? 4 : -4), .5); d.setAttribute('opacity', q > 0 ? 1 : 0); }); s.n.innerHTML = Math.round(43000 * E.outC(clamp(lt / 1.8))).toLocaleString('en-ZA').replace(/[, ]/g, ' ') + '+'; s.n.set(lt, 0); s.tg.set(lt, s.k - .3); }, { in: 'fade' });

cut(N('so most people got back', 347.2), 'purple', { ground: 'none', cam: { z0: 1.12, z1: 1.0 } }, (S, at, a) => {
  const pie = L5.grp(S.sub, 960, 540, 1.2); const R = 280; sv('circle', { cx: 0, cy: 0, r: R + 60, fill: L5.orbFill(S.sub.defs, '#ff9ef0', .35) }, pie); sv('circle', { cx: 0, cy: 0, r: R, fill: L5.ballFill(S.sub.defs, '#5a24a8') }, pie);
  const sl = sv('path', { fill: L5.fill(S.sub.defs, GOLD) }, pie); const t1 = L5.tag(S.ui, 'WHAT THEY LOST', { x: 500, y: 300, size: 44 }); const t2 = L5.tag(S.ui, 'WHAT CAME BACK: A SMALL PART', { x: 1400, y: 880, size: 44, bg: GOLD }); cue(a + .6, 'pop');
  return { pie, sl, R, t1, t2 };
}, (s, lt) => { const an = E.outC(clamp((lt - .5) / .8)) * .55; const R = s.R; s.sl.setAttribute('d', `M0,0 L0,${-R} A${R},${R} 0 0 1 ${(Math.sin(an) * R).toFixed(1)},${(-Math.cos(an) * R).toFixed(1)}Z`); L5.pop(s.pie, lt, 0, { s: 1.2, bob: 3 }); s.t1.set(lt, .2); s.t2.set(lt, .8); }, { in: 'zoom' });

cut(N('the shares of steinhoff international', 353.4), 'night', { ground: 'waves', cam: { z0: 1.0, z1: 1.06 } }, (S, at, a) => {
  const r = L5.receipt(S.ui, { source: 'Steinhoff notice to shareholders (JSE SENS)', date: '13 Oct 2023', quote: 'SIHNV and its shares have now ceased to exist.', hl: ['ceased to exist'], w: 1250, y: 470 });
  const tg = L5.tag(S.ui, 'SIHNV = STEINHOFF INTERNATIONAL HOLDINGS N.V.', { x: 960, y: 800, size: 36 }); cue(a + .2, 'paper'); return { r, tg, k: at('ceased') };
}, (s, lt) => { s.r.set(lt, .1, { hlAt: [s.k] }); s.tg.set(lt, 1.2); }, { in: 'iris' });

cut(N('what happened to the people', 357.9), 'night', { ground: 'city', cam: { z0: 1.0, z1: 1.12, y0: 30, y1: -30 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 960, y: 1180, s: 1.0, name: 'STEINHOFF' }); const top = L5.grp(S.sub, 960, 520, 1); sv('circle', { cx: 0, cy: 0, r: 200, fill: L5.orbFill(S.sub.defs, GOLD, .5) }, top);
  const w = L5.big(S.ui, 'THE PEOPLE AT THE TOP?', { x: 960, y: 170, size: 120, color: '#fff' }); return { t, top, w };
}, (s, lt, tt) => { s.t.tick(tt); s.w.set(lt, .4); }, { in: 'fade' });

cut(N('jooste was banned', 360.1), 'night', { ground: 'none', cam: { z0: 1.0, z1: 1.1 } }, (S, at, a) => {
  const d = S.sub.defs; const chair = L5.grp(S.sub, 760, 900, 1.15); sv('rect', { x: -130, y: -420, width: 260, height: 300, rx: 60, fill: L5.fill(d, '#2a1a5a') }, chair); sv('rect', { x: -160, y: -150, width: 320, height: 80, rx: 30, fill: L5.fill(d, '#3a2a7a') }, chair); sv('rect', { x: -14, y: -70, width: 28, height: 70, fill: '#1a1230' }, chair);
  const tg = L5.tag(S.ui, 'JSE: BANNED AS A DIRECTOR', { x: 1350, y: 330, size: 46, bg: GOLD }); const st = L5.stamp(S.ui, '20-YEAR BAN', { x: 1350, y: 560, size: 120, rot: -6 }); const k = at('twenty'); cue(a + k, 'stamp'); return { chair, tg, st, k };
}, (s, lt) => { L5.pop(s.chair, lt, 0, { s: 1.15, bob: 1 }); s.tg.set(lt, .3); s.st.set(lt, s.k); }, { in: 'whip' });

cut(N('a record 475', 367.3), 'magenta', { ground: 'none', cam: { z0: 1.15, z1: 1.0 }, stars: 80 }, (S, at, a) => {
  const b = L5.big(S.ui, 'R475 MILLION', { x: 960, y: 470, size: 230, color: GOLD }); const tg = L5.tag(S.ui, 'RECORD FINE · FSCA · 20 MARCH 2024', { x: 960, y: 700, size: 46 }); const k = at('record'); cue(a + k, 'impact', .8); return { b, tg, k };
}, (s, lt) => { s.b.set(lt, s.k - .2); s.tg.set(lt, s.k + .3); }, { in: 'zoom' });

cut(N('he died the next day', 371), 'night', { ground: 'mountains', cam: { z0: 1.0, z1: 1.06 }, stars: 140, motes: 8 }, (S, at, a) => {
  const cal = L5.grp(S.sub, 960, 520, 1); sv('rect', { x: -200, y: -230, width: 400, height: 460, rx: 34, fill: '#eef0ff' }, cal); sv('rect', { x: -200, y: -230, width: 400, height: 110, rx: 34, fill: '#26408f' }, cal);
  L5.txt(cal, 'MARCH 2024', { x: 0, y: -158, 'font-size': 50, fill: '#fff' }); L5.txt(cal, '21', { x: 0, y: 130, 'font-size': 240, fill: '#26408f' }); const tg = L5.tag(S.ui, 'BEFORE ANY CRIMINAL TRIAL', { x: 960, y: 880, size: 46 }); return { cal, tg, k: at('before') };
}, (s, lt) => { L5.pop(s.cal, lt, 0, { bob: 3 }); s.tg.set(lt, s.k - .2); }, { in: 'fade' });

cut(N('since then several', 375.1), 'navy', { ground: 'city', cam: { z0: 1.0, z1: 1.1 } }, (S, at, a) => {
  const h = L5.hall(S.sub, { x: 760, y: 1000, s: 1.0, label: 'COURT', roof: '#3a4fd0' }); const ts = ['CONVICTED', 'CONVICTED', 'CONVICTED'].map((x, i) => L5.stamp(S.ui, x, { x: 1450, y: 300 + i * 190, size: 70, rot: -4 + i * 3, col: ['#ffd23a', '#ff5fa2', '#3fe6c8'][i] }));
  const tg = L5.tag(S.ui, 'SEVERAL FORMER EXECUTIVES', { x: 760, y: 170, size: 46, bg: GOLD }); [0, 1, 2].forEach(i => cue(a + .8 + i * .5, 'stamp', .6)); return { h, ts, tg };
}, (s, lt) => { s.ts.forEach((t, i) => t.set(lt, .8 + i * .5)); s.tg.set(lt, .2); }, { in: 'whip' });

cut(N('the former finance boss', 378.8), 'navy', { ground: 'none', cam: { z0: 1.12, z1: 1.0 } }, (S, at, a) => {
  const b = L5.big(S.ui, '5 YEARS', { x: 960, y: 450, size: 260, color: '#fff' }); const tg = L5.tag(S.ui, 'FORMER CFO · EFFECTIVE SENTENCE · OCT 2024', { x: 960, y: 700, size: 44, bg: GOLD });
  const bars = []; for (let i = 0; i < 9; i++) bars.push(sv('rect', { x: 300 + i * 150, y: -60, width: 36, height: 1200, rx: 18, fill: '#6fd0ff', opacity: .16 }, S.sub.svg)); cue(a + .3, 'thud'); return { b, tg };
}, (s, lt) => { s.b.set(lt, .2); s.tg.set(lt, .6); }, { in: 'zoom' });

cut(N('and heres the twist', 383.4), 'sunset', { ground: 'hills', cam: { z0: 1.15, z1: 1.0 } }, (S, at, a) => {
  const sh = L5.shop(S.sub, { x: 960, y: 950, s: 1.4, sign: 'CLOTHING', col: '#ff5fa2', aw: ['#ffd84a', '#3fe6c8'] }); const w = L5.big(S.ui, 'THE TWIST', { x: 960, y: 150, size: 130, color: GOLD }); const tg = L5.tag(S.ui, 'THE SHOPS WERE FINE', { x: 960, y: 290, size: 50 });
  cue(a + .2, 'swoosh_up', .6); return { sh, w, tg, k: at('shops were fine') };
}, (s, lt, t) => { s.sh.tick(t); s.w.set(lt, .1); s.tg.set(lt, s.k - .2); }, { in: 'iris' });

cut(N('pep is still open', 386.6), 'sunset', { ground: 'city', cam: { z0: 1.0, z1: 1.08, x0: -80, x1: 80 } }, (S, at, a) => {
  const shops = [0, 1, 2].map(i => L5.shop(S.sub, { x: 380 + i * 580, y: 940, s: .85, sign: ['CLOTHING', 'SHOES', 'HOME'][i], col: ['#ff5fa2', '#ff8f3a', '#3fe6c8'][i] })); const fs = [0, 1, 2, 3].map(i => L5.figure(S.sub, { x: 0, y: 1000, s: .8, shirt: ['#ffd84a', '#a98bff', '#ff8f3a', '#3fe6c8'][i], seed: 150 + i }));
  const tg = L5.tag(S.ui, 'STILL OPEN', { x: 960, y: 170, size: 54, bg: GOLD }); cue(a + .3, 'shopbell'); return { shops, fs, tg };
}, (s, lt, t) => { s.shops.forEach(x => x.tick(t)); s.fs.forEach((f, i) => f.set(t, { x: 100 + i * 480 + lt * 90 * (i % 2 ? -1 : 1), walk: t * 6 + i, flip: !!(i % 2) })); s.tg.set(lt, .2); }, { in: 'fade' });

cut(N('pepkor is still listed', 388.3), 'sunset', { ground: 'none', cam: { z0: 1.08, z1: 1.0 }, stars: 60 }, (S, at, a) => {
  const ch = L5.chart(S.sub, [10, 14, 13, 18, 22, 26, 31], { x: 300, y: 900, w: 1320, h: 380, col: '#3fe6c8' }); const b = L5.big(S.ui, '6 500+ STORES', { x: 960, y: 300, size: 170, color: GOLD }); const tg = L5.tag(S.ui, 'PEPKOR · STILL LISTED ON THE JSE', { x: 960, y: 460, size: 46 });
  const k = at('six and a half'); cue(a + k, 'pop'); return { ch, b, tg, k };
}, (s, lt) => { s.ch.draw(E.ioC(clamp(lt / 2.5))); s.b.set(lt, s.k - .3); s.tg.set(lt, .3); }, { in: 'whip' });

cut(N('in july 2025', 393), 'navy', { ground: 'city', cam: { z0: 1.0, z1: 1.08 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 600, y: 1000, s: .95, name: 'STEINHOFF', col: '#5a3ad0' }); const tg = L5.tag(S.ui, 'WHAT’S LEFT · JULY 2025', { x: 600, y: 140, size: 46, bg: GOLD }); const nw = L5.big(S.ui, 'NOW: IBEX', { x: 1400, y: 450, size: 150, color: '#fff' });
  const k = at('ibex'); cue(a + k, 'swoosh_up', .6); return { t, tg, nw, k };
}, (s, lt, tt) => { s.t.tick(tt); if (lt > s.k && s.t.label.textContent !== 'IBEX') s.t.label.textContent = 'IBEX'; s.tg.set(lt, .2); s.nw.set(lt, s.k - .1); }, { in: 'fade' });

cut(N('sold its whole pepkor', 397.3), 'navy', { ground: 'city', cam: { z0: 1.06, z1: 1.0 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 420, y: 1000, s: .8, name: 'IBEX', col: '#5a3ad0' }); const n = L5.node(S.sub, { x: 1000, y: 600, s: 1.2, label: 'PEPKOR STAKE', col: '#ff8f3a', w: 360 }); const bank = L5.hall(S.sub, { x: 1520, y: 980, s: .7, label: 'CREDITORS', roof: '#a3305e' });
  const l1 = L5.link(S.sub, 1150, 560, 520, 440, { col: GOLD, n: 5, bend: -150 }); const l2 = L5.link(S.sub, 520, 600, 1500, 700, { col: '#3fe6c8', n: 5, bend: 120 });
  const b = L5.big(S.ui, '≈ R27 BILLION', { x: 1000, y: 230, size: 150, color: GOLD }); const tg = L5.tag(S.ui, 'TO PAY ITS DEBTS', { x: 1500, y: 470, size: 44 }); cue(a + at('27'), 'cash'); return { t, n, l1, l2, b, tg, k: at('27'), kd: at('to pay') };
}, (s, lt, tt) => { s.t.tick(tt); L5.pop(s.n, lt, 0, { s: 1.2, bob: 3 }); s.l1.set(tt, clamp((lt - s.k + .5) / .5), .7); s.l2.set(tt, clamp((lt - s.kd) / .5), .7); s.b.set(lt, s.k - .3); s.tg.set(lt, s.kd); }, { in: 'zoom' });

cut(N('the shops were real the accounts', 403.9), 'magenta', { ground: 'hills', cam: { z0: 1.0, z1: 1.1 } }, (S, at, a) => {
  const sh = L5.shop(S.sub, { x: 560, y: 930, s: 1.0, sign: 'CLOTHING', col: '#ff8f3a' }); const d = L5.doc(S.sub, { x: 1380, y: 560, s: 1.15, title: 'ACCOUNTS', w: 400, h: 500, accentC: '#7a0f63' });
  const t1 = L5.tag(S.ui, 'REAL ✓', { x: 560, y: 260, size: 60, bg: '#3fe6c8' }); const t2 = L5.stamp(S.ui, 'NOT REAL', { x: 1380, y: 560, size: 100, rot: -10 }); const k = at('accounts'); cue(a + k + .4, 'stamp'); return { sh, d, t1, t2, k };
}, (s, lt, t) => { s.sh.tick(t); L5.pop(s.d, lt, 0, { s: 1.15, r: 2 }); s.t1.set(lt, .3); s.t2.set(lt, s.k + .4); }, { in: 'whip' });

cut(N('and the people who paid', 407.3), 'night', { ground: 'city', cam: { z0: 1.0, z1: 1.12, y0: 40, y1: -20 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 960, y: 760, s: .8, name: 'ONE COMPANY' }); const fs = []; for (let i = 0; i < 7; i++) fs.push(i === 3 ? elsie(S.sub, { x: 960, y: 1060, s: .85 }) : L5.figure(S.sub, { x: 360 + i * 200, y: 1050, s: .75, shirt: ['#ff8f3a', '#3fe6c8', '#ffd84a', '', '#a98bff', '#ff6a6a', '#6fd0ff'][i], seed: 160 + i }));
  const tg = L5.tag(S.ui, 'TRUSTED ONE COMPANY WITH EVERYTHING', { x: 960, y: 120, size: 46, bg: GOLD }); return { t, fs, tg, k: at('trusted') };
}, (s, lt, tt) => { s.t.tick(tt); s.fs.forEach(f => f.set(tt, { pose: 'sad', expr: 'sad' })); s.tg.set(lt, s.k - .2); }, { in: 'fade' });

window.__CUTS3 = CUTS.length;

// =====================================================================================================
// CH5 WHAT THIS MEANS FOR YOU (mint / navy: calm, clear)
// =====================================================================================================
cut(N('so what does this mean', 413.4), 'mint', { ground: 'hills', cam: { z0: 1.2, z1: 1.0 } }, (S, at, a) => {
  const f = L5.figure(S.sub, { x: 1380, y: 1000, s: 1.5, shirt: GOLD, seed: 171, female: true }); const w = L5.big(S.ui, 'WHAT THIS MEANS<br>FOR YOU', { x: 720, y: 470, size: 150, color: '#fff' }); w.style.lineHeight = '1.0'; w.style.whiteSpace = 'normal';
  cue(a + .2, 'swoosh_up', .6); return { f, w };
}, (s, lt, t) => { s.f.set(t, { pose: 'pointL', expr: 'smile' }); s.w.set(lt, .1); }, { in: 'zoom' });

cut(N('lets go back to elsie', 415.8), 'mint', { ground: 'mountains', cam: { z0: 1.0, z1: 1.1, x0: -40, x1: 40 } }, (S, at, a) => {
  const e = elsie(S.sub, { x: 420, y: 1000, s: 1.3 }); const j = L5.jar(S.sub, { x: 860, y: 940, s: .9 }); j.level(1); const t = hq(S.sub, { x: 1500, y: 1000, s: .8, name: 'ONE COMPANY', col: '#3a4fd0' });
  const ln = L5.link(S.sub, 920, 560, 1420, 400, { col: GOLD, n: 5, bend: -140 }); const tg = L5.tag(S.ui, 'R100 000 IN ONE COMPANY', { x: 960, y: 150, size: 50, bg: GOLD }); return { e, j, t, ln, tg, k: at('one company') };
}, (s, lt, tt) => { s.e.set(tt, { pose: 'give', expr: 'smile' }); s.t.tick(tt); s.ln.set(tt, clamp((lt - s.k + .5) / .5), .7); s.tg.set(lt, s.k - .4); }, { in: 'fade' });

cut(N('two days later she had', 420.9), 'ember', { ground: 'none', cam: { z0: 1.15, z1: 1.0 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 1450, y: 1000, s: .8, name: 'STEINHOFF', col: '#5a3ad0' }); const b = L5.big(S.ui, 'R21 900', { x: 700, y: 480, size: 240, color: '#fff', glow: '#ff3d5a' }); const st = L5.stamp(S.ui, '−78%', { x: 700, y: 760, size: 110 });
  cue(a + at('21900'), 'stamp'); return { t, b, st, k: at('21900') };
}, (s, lt, tt) => { s.t.tick(tt); s.t.setAttribute('opacity', .6); s.b.set(lt, s.k - .3); s.st.set(lt, s.k + .3); }, { in: 'whip' });

const GRID = (S) => { const ts = []; for (let i = 0; i < 20; i++) { const x = 250 + (i % 10) * 158, y = 600 + Math.floor(i / 10) * 300; ts.push({ g: L5.tower(S.sub, { x, y, s: .24, col: ['#3a4fd0', '#ff5fa2', '#ff8f3a', '#a98bff', '#0fa3a8'][i % 5], w: 420, h: 760, crown: false }), x, y }); } return ts; };
cut(N('now imagine she split', 425.2), 'navy', { ground: 'none', cam: { z0: 1.12, z1: 1.0 }, stars: 80 }, (S, at, a) => {
  const ts = GRID(S); const cs = ts.map(() => L5.coin(S.sub, { x: 960, y: 540, r: 26 })); const w = L5.big(S.ui, '20 COMPANIES', { x: 960, y: 140, size: 130, color: '#fff' });
  for (let i = 0; i < 5; i++) cue(a + .4 + i * .3, 'coin', .5); return { ts, cs, w, k: at('twenty') };
}, (s, lt, t) => { s.ts.forEach((o, i) => { L5.pop(o.g, lt, .1 + i * .04, { s: .2, bob: 2, ph: i }); o.g.tick(t); }); s.cs.forEach((c, i) => { const q = E.ioC(clamp((lt - .5 - i * .05) / .9)); const o = s.ts[i]; L5.T(c, lerp(960, o.x, q), lerp(1000, o.y - 180, q) - Math.sin(q * Math.PI) * 180, 0, 1); }); s.w.set(lt, s.k - .3); }, { in: 'zoom' });

cut(N('5000 rand each', 428.6), 'navy', { ground: 'none', cam: { z0: 1.0, z1: 1.06 }, stars: 80 }, (S, at, a) => {
  const ts = GRID(S); ts.forEach(o => L5.coin(S.sub, { x: o.x, y: o.y - 180, r: 26 })); const tg = L5.tag(S.ui, 'R5 000 EACH', { x: 960, y: 140, size: 64, bg: GOLD }); cue(a + .2, 'pop');
  const st = L5.tag(S.ui, 'ONE OF THEM: STEINHOFF', { x: 330, y: 300, size: 40, bg: '#ff3d5a', color: '#fff' }); const ring = sv('circle', { cx: 250, cy: 470, r: 140, fill: 'none', stroke: '#ff3d5a', 'stroke-width': 10 }, S.sub.svg);
  return { ts, tg, st, ring, k: at('one of them') };
}, (s, lt, t) => { s.ts.forEach((o, i) => { L5.pop(o.g, lt, -1, { s: .2, bob: 2, ph: i }); o.g.tick(t); }); s.tg.set(lt, .1); s.st.set(lt, s.k); s.ring.setAttribute('opacity', lt > s.k ? 1 : 0); s.ring.setAttribute('r', (140 + Math.sin(lt * 4) * 8).toFixed(1)); }, { in: 'fade' });

cut(N('same crash her steinhoff', 432.2), 'navy', { ground: 'none', cam: { z0: 1.45, z1: 1.6, x0: -500, x1: -560, y0: -140, y1: -160 }, stars: 80 }, (S, at, a) => {
  const ts = GRID(S); const tg = L5.tag(S.ui, 'R5 000', { x: 720, y: 540, size: 64, bg: '#ff3d5a', color: '#fff' }); const st = L5.stamp(S.ui, 'SAME CRASH', { x: 1350, y: 230, size: 110, col: '#ffd23a' });
  cue(a + .2, 'stamp'); cue(a + at('drops'), 'whoosh_low'); return { ts, tg, st, k: at('drops') };
}, (s, lt, t) => { s.ts.forEach((o, i) => { if (i === 0) { const q = E.inC(clamp((lt - s.k) / 1.2)); L5.T(o.g, o.x + Math.sin(lt * 40) * 4 * q, o.y + q * 120, q * 18, .2); o.g.setAttribute('opacity', 1 - .6 * q); } else { L5.pop(o.g, lt, -1, { s: .2, bob: 2, ph: i }); } o.g.tick(t); }); s.st.set(lt, .2); s.tg.innerHTML = lt > s.k + .8 ? 'R1 100' : 'R5 000'; s.tg.set(lt, .4); }, { in: 'zoom' });

cut(N('the other nineteen', 438.2), 'mint', { ground: 'none', cam: { z0: 1.06, z1: 1.0 }, stars: 60 }, (S, at, a) => {
  const ts = GRID(S); ts[0].g.setAttribute('opacity', .3); const tg = L5.tag(S.ui, 'THE OTHER 19: FINE', { x: 960, y: 140, size: 56, bg: GOLD }); for (let i = 0; i < 4; i++) cue(a + .3 + i * .2, 'pop', .4); return { ts, tg };
}, (s, lt, t) => { s.ts.forEach((o, i) => { if (i) { L5.T(o.g, o.x, o.y - Math.abs(Math.sin(lt * 4 + i)) * 18, 0, .2); o.g.tick(t); } else L5.T(o.g, o.x, o.y + 120, 18, .2); }); s.tg.set(lt, .1); }, { in: 'whip' });

cut(N('she still has about', 440.3), 'mint', { ground: 'hills', cam: { z0: 1.12, z1: 1.0 } }, (S, at, a) => {
  const e = elsie(S.sub, { x: 420, y: 1000, s: 1.35 }); const b = L5.big(S.ui, 'R96 100', { x: 1200, y: 460, size: 250, color: GOLD }); const tg = L5.tag(S.ui, 'STILL HERS', { x: 1200, y: 690, size: 50 }); cue(a + at('96100'), 'ding'); return { e, b, tg, k: at('96100') };
}, (s, lt, t) => { s.e.set(t, { pose: 'cheer', expr: 'smile' }); s.b.set(lt, s.k - .3); s.tg.set(lt, s.k + .3); }, { in: 'zoom' });

cut(N('even if steinhoff went', 443.9), 'navy', { ground: 'none', cam: { z0: 1.0, z1: 1.1 }, stars: 80 }, (S, at, a) => {
  const c = L5.shareCard(S.sub, { x: 560, y: 540, s: 1.1, name: 'STEINHOFF', price: 'R0', col: '#5a3ad0' }); const b = L5.big(S.ui, 'R95 000', { x: 1350, y: 480, size: 220, color: GOLD }); const tg = L5.tag(S.ui, 'EVEN AT ZERO', { x: 1350, y: 690, size: 50 });
  const k = at('95000'); cue(a + k, 'ding'); return { c, b, tg, k };
}, (s, lt) => { L5.pop(s.c, lt, 0, { s: 1.1, r: -4 }); s.c.setAttribute('opacity', (1 - .5 * clamp((lt - 1) / 1)).toFixed(2)); s.b.set(lt, s.k - .3); s.tg.set(lt, .4); }, { in: 'fade' });

cut(N('same company same fraud', 448.6), 'navy', { ground: 'none', cam: { z0: 1.08, z1: 1.0 } }, (S, at, a) => {
  const mk = (x, h, col, lab, sub) => { const g = L5.grp(S.sub, x, 860, 1); const r = sv('rect', { x: -150, y: 0, width: 300, height: 0, rx: 30, fill: L5.fill(S.sub.defs, col) }, g); L5.txt(g, sub, { x: 0, y: 70, 'font-size': 46 }); const t = L5.big(S.ui, lab, { x, y: 860 - h - 90, size: 130, color: '#fff', glow: col }); return { r, h, t }; };
  [640, 1280].forEach(x => sv('rect', { x: x - 150, y: 300, width: 300, height: 560, rx: 30, fill: '#ffffff', opacity: .08 }, S.sub.svg)); L5.tower(S.sub, { x: 640, y: 840, s: .62, w: 380, h: 760, col: '#5a3ad0', crown: false }).setAttribute('opacity', .55); for (let i = 0; i < 20; i++) L5.tower(S.sub, { x: 1175 + (i % 5) * 52, y: 440 + Math.floor(i / 5) * 115, s: .1, w: 380, h: 760, col: ['#3a4fd0', '#ff5fa2', '#ff8f3a', '#0fa3a8'][i % 4], crown: false }).setAttribute('opacity', .7); const hd = L5.big(S.ui, 'SAME COMPANY. SAME FRAUD.', { x: 960, y: 150, size: 100, color: '#fff' }); const A = mk(640, 560, '#ff3d5a', '−78%', 'ALL IN ONE'), B = mk(1280, 30, '#3fe6c8', '−4%', 'SPREAD OVER 20'); cue(a + at('four percent'), 'pop'); cue(a + at('seventyeight'), 'thud'); return { A, B, hd, kB: at('four percent'), kA: at('seventyeight') };
}, (s, lt) => { s.hd.set(lt, .1, { out: s.kA - .5 }); [[s.A, s.kA], [s.B, s.kB]].forEach(([o, k]) => { const q = E.outB(clamp((lt - k + .3) / .6)); o.r.setAttribute('y', -o.h * q); o.r.setAttribute('height', o.h * q); o.t.set(lt, k); }); }, { in: 'zoom' });

cut(N('thats diversification', 454.2), 'mint', { ground: 'hills', cam: { z0: 1.15, z1: 1.0 } }, (S, at, a) => {
  const js = [0, 1, 2, 3, 4].map(i => { const j = L5.jar(S.sub, { x: 300 + i * 330, y: 950, s: .55, col: ['#f7be33', '#ffd84a', '#ff8f3a', '#3fe6c8', '#a98bff'][i] }); j.level(.8); return j; }); const w = L5.big(S.ui, 'DIVERSIFICATION', { x: 960, y: 260, size: 170, color: '#fff', glow: GOLD });
  cue(a + .2, 'chime'); return { js, w };
}, (s, lt) => { s.js.forEach((j, i) => L5.pop(j, lt, i * .1, { s: .55, bob: 4, ph: i })); s.w.set(lt, .05); }, { in: 'iris' });

cut(N('it doesnt stop a fraud', 456.2), 'teal', { ground: 'waves', cam: { z0: 1.0, z1: 1.1 } }, (S, at, a) => {
  const d = S.sub.defs; const sh = L5.grp(S.sub, 960, 560, 1.2); sv('circle', { cx: 0, cy: 0, r: 360, fill: L5.orbFill(d, '#8affea', .45) }, sh); sv('path', { d: 'M0,-250 L210,-170 Q220,120 0,260 Q-220,120 -210,-170Z', fill: L5.fill(d, '#0fa3a8') }, sh);
  const pile = sv('g', {}, sh); for (let i = 0; i < 7; i++) L5.coin(S.sub, { parent: pile, x: -120 + (i % 4) * 80, y: 40 - Math.floor(i / 4) * 66, r: 42 }); const t = L5.tag(S.ui, 'CAN’T WIPE YOU OUT', { x: 960, y: 950, size: 54, bg: GOLD });
  const t0 = L5.tag(S.ui, 'DOESN’T STOP FRAUD', { x: 960, y: 140, size: 46 }); return { sh, t, t0, k: at('makes sure') };
}, (s, lt) => { L5.pop(s.sh, lt, 0, { s: 1.2, bob: 4 }); s.t0.set(lt, .1); s.t.set(lt, s.k); }, { in: 'fade' });

cut(N('and the law already', 461.1), 'navy', { ground: 'city', cam: { z0: 1.0, z1: 1.08 } }, (S, at, a) => {
  const h = L5.hall(S.sub, { x: 960, y: 1000, s: 1.15, label: 'RETIREMENT FUND', roof: '#3a4fd0' }); const tg = L5.tag(S.ui, 'THE LAW ALREADY SPREADS YOUR PENSION', { x: 960, y: 150, size: 48, bg: GOLD }); return { h, tg };
}, (s, lt) => { L5.pop(s.h, lt, 0, { s: 1.15, bob: 2 }); s.tg.set(lt, .2); }, { in: 'whip' });

cut(N('under regulation 28', 463.8), 'navy', { ground: 'none', cam: { z0: 1.06, z1: 1.0 }, stars: 70 }, (S, at, a) => {
  const pie = L5.grp(S.sub, 560, 560, 1.1); const R = 260; sv('circle', { cx: 0, cy: 0, r: R + 50, fill: L5.orbFill(S.sub.defs, '#6fd0ff', .35) }, pie); sv('circle', { cx: 0, cy: 0, r: R, fill: L5.ballFill(S.sub.defs, '#3a4fd0') }, pie);
  L5.txt(pie, 'YOUR', { x: 0, y: -10, 'font-size': 64, fill: '#ffffff' }); L5.txt(pie, 'PENSION FUND', { x: 0, y: 60, 'font-size': 52, fill: '#cfe0ff' }); const sl = sv('path', { fill: L5.fill(S.sub.defs, GOLD) }, pie); const b = L5.big(S.ui, '15% MAX', { x: 1350, y: 420, size: 190, color: GOLD }); const t1 = L5.tag(S.ui, 'IN ONE LISTED COMPANY', { x: 1350, y: 590, size: 46 });
  const t2 = L5.tag(S.ui, 'REGULATION 28 · COMPANIES WORTH R20 BILLION+', { x: 1350, y: 200, size: 38, bg: GOLD }); const k = at('fifteen'); cue(a + k, 'pop'); return { pie, sl, R, b, t1, t2, k };
}, (s, lt) => { const an = E.outC(clamp((lt - s.k + .3) / .7)) * .15 * Math.PI * 2; const R = s.R; s.sl.setAttribute('d', `M0,0 L0,${-R} A${R},${R} 0 0 1 ${(Math.sin(an) * R).toFixed(1)},${(-Math.cos(an) * R).toFixed(1)}Z`); L5.pop(s.pie, lt, 0, { s: 1.1, bob: 3 }); s.b.set(lt, s.k - .2); s.t1.set(lt, s.k + .4); s.t2.set(lt, .2); }, { in: 'zoom' });

cut(N('you can do it too', 472.1), 'mint', { ground: 'hills', cam: { z0: 1.12, z1: 1.0 } }, (S, at, a) => {
  const f = L5.figure(S.sub, { x: 460, y: 1000, s: 1.35, shirt: GOLD, seed: 171, female: true }); const box = L5.grp(S.sub, 1250, 700, 1); const d = S.sub.defs;
  sv('rect', { x: -330, y: -200, width: 660, height: 400, rx: 50, fill: L5.fill(d, '#0a6a5a') }, box); L5.txt(box, 'INDEX FUND', { x: 0, y: -110, 'font-size': 70 }); const mini = []; for (let i = 0; i < 16; i++) mini.push(L5.coin(S.sub, { parent: box, x: -240 + (i % 8) * 68, y: 10 + Math.floor(i / 8) * 80, r: 28, col: ['#f7be33', '#ff8f3a', '#3fe6c8', '#ff5fa2'][i % 4], label: '' }));
  const tg = L5.tag(S.ui, 'YOU CAN DO IT TOO', { x: 460, y: 300, size: 48, bg: GOLD }); cue(a + .3, 'pop'); return { f, box, mini, tg };
}, (s, lt, t) => { s.f.set(t, { pose: 'present', expr: 'smile' }); L5.pop(s.box, lt, .1, { bob: 3 }); s.mini.forEach((m, i) => m.setAttribute('opacity', lt > .4 + i * .08 ? 1 : 0)); s.tg.set(lt, .2); }, { in: 'fade' });

cut(N('one index fund can hold', 475.2), 'navy', { ground: 'none', cam: { z0: 1.0, z1: 1.08 }, stars: 70 }, (S, at, a) => {
  const ts = []; for (let i = 0; i < 40; i++) { const x = 240 + (i % 10) * 160, y = 450 + Math.floor(i / 10) * 165; ts.push(L5.tower(S.sub, { x, y, s: .18, col: ['#3a4fd0', '#ff5fa2', '#ff8f3a', '#a98bff', '#0fa3a8'][i % 5], w: 420, h: 700, crown: false })); }
  const b = L5.big(S.ui, '40 BIGGEST ON THE JSE', { x: 960, y: 150, size: 110, color: '#fff' }); for (let i = 0; i < 8; i++) cue(a + .2 + i * .2, 'tick', .3); return { ts, b, k: at('forty') };
}, (s, lt, t) => { s.ts.forEach((g, i) => { L5.pop(g, lt, .1 + i * .045, { s: .18, bob: 2, ph: i }); g.tick(t); }); s.b.set(lt, s.k - .3); }, { in: 'zoom' });

cut(N('so when it crashed', 483.5), 'navy', { ground: 'none', cam: { z0: 1.06, z1: 1.0 } }, (S, at, a) => {
  const ch = L5.chart(S.sub, [40, 41, 42, 42.5, 43, 42.4, 42.9, 43.5], { x: 280, y: 940, w: 1360, h: 380, col: '#3fe6c8', min: 30, max: 46 }); const t1 = L5.tag(S.ui, 'WHEN STEINHOFF CRASHED', { x: 960, y: 150, size: 48, bg: GOLD });
  const b = L5.big(S.ui, '−1.4%', { x: 1180, y: 330, size: 170, color: '#fff' }); const t2 = L5.tag(S.ui, 'THE INDEX, WHEN IT CRASHED', { x: 1180, y: 470, size: 40 }); const k = at('one point four'); cue(a + k, 'pop'); return { ch, t1, b, t2, k };
}, (s, lt) => { s.ch.draw(E.ioC(clamp(lt / (s.k + .5)))); s.t1.set(lt, .2); s.b.set(lt, s.k - .2); s.t2.set(lt, s.k + .3); }, { in: 'whip' });

cut(N('a taxfree savings account', 488.1), 'mint', { ground: 'hills', cam: { z0: 1.0, z1: 1.1 } }, (S, at, a) => {
  const p = L5.phone(S.sub, { x: 1250, y: 560, s: 1.3, w: 340, h: 620, glow: '#c8ffe4', screen: (g, d, w, h) => { sv('rect', { x: 0, y: 0, width: w, height: 110, fill: '#0a6a5a' }, g); L5.txt(g, 'TAX-FREE SAVINGS', { x: w / 2, y: 74, 'font-size': 38 });
    L5.txt(g, 'R46 000', { x: w / 2, y: h * .36, 'font-size': 96, fill: '#1b1533' }); L5.txt(g, 'a year', { x: w / 2, y: h * .44, 'font-size': 38, fill: '#5a5a7a', 'font-family': 'Barlow' }); sv('rect', { x: 30, y: h * .55, width: w - 60, height: 120, rx: 22, fill: '#d9fbe9' }, g);
    L5.txt(g, 'TAX ON GROWTH: R0', { x: w / 2, y: h * .55 + 76, 'font-size': 40, fill: '#0a6a5a' }); sv('rect', { x: 30, y: h * .8, width: w - 60, height: 80, rx: 40, fill: GOLD }, g); L5.txt(g, 'INDEX FUND', { x: w / 2, y: h * .8 + 54, 'font-size': 40, fill: '#3a2a10' }); return null; } });
  const f = L5.figure(S.sub, { x: 520, y: 1000, s: 1.35, shirt: GOLD, seed: 171, female: true }); const tg = L5.tag(S.ui, 'TFSA', { x: 520, y: 260, size: 64, bg: GOLD }); cue(a + .3, 'notif'); return { p, f, tg };
}, (s, lt, t) => { L5.pop(s.p, lt, 0, { s: 1.3, bob: 4 }); s.f.set(t, { pose: 'point', expr: 'smile' }); s.tg.set(lt, .3); }, { in: 'zoom' });

cut(N('our tfsa guide', 495.8), 'sunset', { ground: 'none', cam: { z0: 1.1, z1: 1.0 }, stars: 60 }, (S, at, a) => {
  const card = L5.grp(S.sub, 960, 520, 1.2); const d = S.sub.defs; sv('rect', { x: -400, y: -230, width: 800, height: 460, rx: 40, fill: L5.fill(d, '#3a4fd0') }, card); sv('circle', { cx: 0, cy: -20, r: 90, fill: '#ff3d5a' }, card); sv('path', { d: 'M-28,-64 L48,-20 L-28,24Z', fill: '#fff' }, card);
  L5.txt(card, 'TFSA GUIDE', { x: 0, y: 160, 'font-size': 80 }); const tg = L5.tag(S.ui, 'STEP BY STEP · ON THIS CHANNEL', { x: 960, y: 900, size: 46, bg: GOLD }); cue(a + .2, 'click'); return { card, tg };
}, (s, lt) => { L5.pop(s.card, lt, 0, { s: 1.2, bob: 4, r: -2 }); s.tg.set(lt, .4); }, { in: 'fade' });

cut(N('and before you ever buy', 500), 'teal', { ground: 'waves', cam: { z0: 1.0, z1: 1.08 } }, (S, at, a) => {
  const dc = L5.doc(S.sub, { x: 960, y: 560, s: 1.55, title: 'THE 4 CHECKS', w: 460, h: 540, accentC: '#0a7a8c', lines: 0 }); const labs = ['ONE SENTENCE?', 'INSIDER DEALS?', 'TOO FAST?', 'LATE OR UNSIGNED?'];
  const rows = labs.map((l, i) => { const g = sv('g', {}, dc); sv('rect', { x: -190, y: -150 + i * 95, width: 60, height: 60, rx: 14, fill: '#e6f7f6', stroke: '#0a7a8c', 'stroke-width': 4 }, g); L5.txt(g, l, { x: 40, y: -105 + i * 95, 'font-size': 40, fill: '#1b1533' }); const tk = L5.txt(g, '✓', { x: -160, y: -100 + i * 95, 'font-size': 56, fill: '#1fb86a' }); return { g, tk }; });
  const ks = [at('explain'), at('insiders'), at('growing'), at('results')]; ks.forEach(k => cue(a + k, 'tick')); return { dc, rows, ks };
}, (s, lt) => { L5.pop(s.dc, lt, 0, { s: 1.55, bob: 3, r: -1 }); s.rows.forEach((r, i) => { r.g.setAttribute('opacity', lt > s.ks[i] - .4 || i === 0 ? 1 : .25); r.tk.setAttribute('opacity', lt > s.ks[i] + .4 ? 1 : 0); }); }, { in: 'zoom' });

cut(N('can i explain', 504.7), 'teal', { ground: 'hills', cam: { z0: 1.12, z1: 1.0 } }, (S, at, a) => {
  const f = L5.figure(S.sub, { x: 500, y: 1000, s: 1.4, shirt: '#ff8f3a', seed: 91, female: true }); const ws = [0, 1].map(i => L5.warn(S.sub, { x: 1150 + i * 420, y: 520, s: .8, label: String(i + 1) }));
  const t1 = L5.tag(S.ui, 'HOW DOES IT MAKE MONEY?', { x: 1150, y: 790, size: 36 }); const t2 = L5.tag(S.ui, 'DEALS WITH INSIDERS?', { x: 1570, y: 870, size: 36, bg: GOLD }); return { f, ws, t1, t2, k2: at('insiders') };
}, (s, lt, t) => { s.f.set(t, { pose: 'think', expr: 'focus' }); L5.pop(s.ws[0], lt, .1, { s: .8, bob: 5 }); L5.pop(s.ws[1], lt, s.k2 - .3, { s: .8, bob: 5, ph: 1 }); s.t1.set(lt, .3); s.t2.set(lt, s.k2); }, { in: 'whip' });

cut(N('is it growing faster', 510.1), 'teal', { ground: 'none', cam: { z0: 1.0, z1: 1.1 } }, (S, at, a) => {
  const ws = [0, 1].map(i => L5.warn(S.sub, { x: 560 + i * 800, y: 480, s: 1, label: String(i + 3) })); const t1 = L5.tag(S.ui, 'TOO FAST TO CHECK?', { x: 560, y: 790, size: 44 }); const t2 = L5.tag(S.ui, 'RESULTS LATE? AUDITOR UNHAPPY?', { x: 1360, y: 790, size: 40, bg: GOLD });
  return { ws, t1, t2, k2: at('results') };
}, (s, lt) => { L5.pop(s.ws[0], lt, .05, { bob: 5 }); L5.pop(s.ws[1], lt, s.k2 - .4, { bob: 5, ph: 1 }); s.t1.set(lt, .3); s.t2.set(lt, s.k2); }, { in: 'zoom' });

cut(N('one company can fail', 516.3), 'ember', { ground: 'city', cam: { z0: 1.0, z1: 1.08 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 960, y: 1040, s: 1, name: 'ONE COMPANY', col: '#5a3ad0' }); const w = L5.big(S.ui, 'EVEN A FAMOUS ONE', { x: 960, y: 160, size: 110, color: '#fff' }); const k = at('even'); cue(a + k + .3, 'thud'); return { t, w, k };
}, (s, lt, tt) => { s.t.tick(tt); const q = E.inC(clamp((lt - s.k - .3) / 1)); L5.T(s.t, 960 + q * 140, 1040 + q * 60, q * 22, 1); s.w.set(lt, s.k - .2); }, { in: 'fade' });

cut(N('twenty companies or forty', 519.5), 'mint', { ground: 'city', cam: { z0: 1.15, z1: 1.0 } }, (S, at, a) => {
  const ts = []; for (let i = 0; i < 20; i++) { const x = 160 + (i % 10) * 178, y = 720 + Math.floor(i / 10) * 260; ts.push(L5.tower(S.sub, { x, y, s: .22, col: ['#3a4fd0', '#ff5fa2', '#ff8f3a', '#a98bff', '#0fa3a8'][i % 5], w: 420, h: 760, crown: false })); }
  const w = L5.big(S.ui, 'ALMOST NEVER ALL FAIL TOGETHER', { x: 960, y: 150, size: 100, color: '#fff' }); return { ts, w, k: at('almost') };
}, (s, lt, t) => { s.ts.forEach((g, i) => { L5.pop(g, lt, i * .03, { s: .22, bob: 3, ph: i }); g.tick(t); }); s.w.set(lt, s.k - .3); }, { in: 'zoom' });

// =====================================================================================================
// OUTRO (sunset)
// =====================================================================================================
cut(N('so the lesson from', 524.2), 'sunset', { ground: 'hills', cam: { z0: 1.0, z1: 1.08 } }, (S, at, a) => {
  const sh = L5.shop(S.sub, { x: 380, y: 760, s: .7, sign: 'SHOP', col: '#ff8f3a' }); const ch = L5.chart(S.sub, [5, 9, 14, 22, 30], { x: 760, y: 700, w: 400, h: 300, col: '#ffd84a' }); ch.draw(1); const t = hq(S.sub, { x: 1560, y: 800, s: .5, name: 'ONE', fs: 70 });
  const t1 = L5.tag(S.ui, 'SHOPS: REAL', { x: 380, y: 880, size: 44, bg: '#3fe6c8' }); const t2 = L5.tag(S.ui, 'PROFITS: NOT', { x: 960, y: 880, size: 44, bg: '#ff3d5a', color: '#fff' }); const t3 = L5.tag(S.ui, 'ONE COMPANY HELD EVERYTHING', { x: 1500, y: 880, size: 40, bg: GOLD });
  const ks = [at('the shops'), at('the profits'), at('one company')]; ks.forEach(k => cue(a + k, 'pop')); return { sh, t, t1, t2, t3, ks };
}, (s, lt, tt) => { s.sh.tick(tt); s.t.tick(tt); s.t1.set(lt, s.ks[0]); s.t2.set(lt, s.ks[1]); s.t3.set(lt, s.ks[2]); }, { in: 'fade' });

cut(N('spread your money', 531.9), 'sunset', { ground: 'hills', cam: { z0: 1.12, z1: 1.0 } }, (S, at, a) => {
  const e = elsie(S.sub, { x: 380, y: 1000, s: 1.3 }); const js = [0, 1, 2, 3].map(i => { const j = L5.jar(S.sub, { x: 800 + i * 300, y: 960, s: .5, col: ['#f7be33', '#ff8f3a', '#3fe6c8', '#a98bff'][i] }); j.level(.7); return j; });
  const w = L5.big(S.ui, 'SPREAD YOUR MONEY', { x: 1250, y: 240, size: 130, color: '#fff', glow: GOLD }); cue(a + .2, 'chime'); return { e, js, w };
}, (s, lt, t) => { s.e.set(t, { pose: 'cheer', expr: 'smile' }); s.js.forEach((j, i) => L5.pop(j, lt, i * .12, { s: .5, bob: 4, ph: i })); s.w.set(lt, .05); }, { in: 'zoom' });

cut(N('next watch our', 535.1), 'navy', { ground: 'none', cam: { z0: 1.0, z1: 1.1 }, stars: 80 }, (S, at, a) => {
  const card = L5.grp(S.sub, 960, 500, 1.25); const d = S.sub.defs; sv('rect', { x: -400, y: -230, width: 800, height: 460, rx: 40, fill: L5.fill(d, '#0a6a5a') }, card); sv('circle', { cx: 0, cy: -20, r: 90, fill: '#ff3d5a' }, card); sv('path', { d: 'M-28,-64 L48,-20 L-28,24Z', fill: '#fff' }, card);
  L5.txt(card, 'TAX-FREE SAVINGS GUIDE', { x: 0, y: 160, 'font-size': 64 }); const tg = L5.tag(S.ui, 'WATCH NEXT · START WITH A FEW HUNDRED RAND', { x: 960, y: 900, size: 42, bg: GOLD }); cue(a + .3, 'click'); return { card, tg };
}, (s, lt) => { L5.pop(s.card, lt, 0, { s: 1.25, bob: 4, r: 1.5 }); s.tg.set(lt, .5); }, { in: 'iris' });

cut(N('if this helped', 540.6), 'sunset', { ground: 'none', cam: { z0: 1.0, z1: 1.06 }, stars: 80 }, (S, at, a) => {
  const c = L5.coin(S.sub, { x: 960, y: 380, r: 170, label: '0' }); const w = L5.big(S.ui, 'MONEY FROM ZERO', { x: 960, y: 650, size: 130, color: '#fff', glow: GOLD });
  const sub = C.subscribe(S.ui); sub.el.style.left = '780px'; sub.el.style.top = '790px'; const tg = L5.tag(S.ui, 'NEW SHORTS EVERY DAY · A FULL GUIDE EVERY WEEK', { x: 960, y: 960, size: 36 }); cue(a + 1.2, 'click');
  return { c, w, sub, tg, a, k: at('new shorts') };
}, (s, lt, t) => { L5.T(s.c, 960, 380 + Math.sin(lt * 2) * 8, 0, 1, Math.cos(lt * 2.4)); s.w.set(lt, .1); s.sub.set(t, s.a + .6); s.tg.set(lt, s.k - .3); }, { in: 'zoom' });


// ---------- splits so no picture runs over ~6 s ----------
cut(N('by the end of this video', 72), 'purple', { ground: 'hills', cam: { z0: 1.12, z1: 1.0 } }, (S, at, a) => {
  const e = elsie(S.sub, { x: 560, y: 1000, s: 1.35 }); const j = L5.jar(S.sub, { x: 1300, y: 920, s: 1.0 }); j.level(.9); const l = L5.lens(S.sub, { x: 1300, y: 640, s: 1 });
  const w = L5.big(S.ui, 'EXACTLY WHY', { x: 960, y: 170, size: 140, color: '#fff', glow: GOLD }); return { e, j, l, w, k: at('exactly') };
}, (s, lt, t) => { s.e.set(t, { pose: 'think', expr: 'focus' }); L5.T(s.l, 1300 + Math.sin(lt * 1.4) * 80, 640 + Math.cos(lt * 1.9) * 40, -10, 1); s.w.set(lt, s.k - .3); }, { in: 'fade' });

cut(N('where was all that profit', 126.9), 'purple', { ground: 'city', cam: { z0: 1.0, z1: 1.12 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 1300, y: 1000, s: .9, name: 'STEINHOFF', col: '#5a3ad0' }); const qs = [[300, 300], [260, 700], [620, 520]].map(([x, y]) => { const g = L5.grp(S.sub, x, y, 1); sv('rect', { x: -110, y: -90, width: 220, height: 180, rx: 30, fill: 'none', stroke: '#ffd84a', 'stroke-width': 8, 'stroke-dasharray': '22 16' }, g); L5.txt(g, '?', { x: 0, y: 40, 'font-size': 120, fill: '#ffd84a' }); return g; });
  const ls = [[300, 300], [260, 700], [620, 520]].map(([x, y]) => L5.link(S.sub, x + 100, y, 1180, 420, { col: GOLD, n: 3, bend: -100 })); const w = L5.big(S.ui, 'WHERE FROM?', { x: 960, y: 140, size: 140, color: GOLD }); cue(a + .3, 'coins', .5); return { t, qs, ls, w };
}, (s, lt, tt) => { s.t.tick(tt); s.qs.forEach((g, i) => L5.pop(g, lt, i * .2, { bob: 6, ph: i })); s.ls.forEach((l, i) => l.set(tt + i, clamp((lt - .5) / .5), .6)); s.w.set(lt, .1); }, { in: 'zoom' });

cut(N('why the accounts', 210.6), 'navy', { ground: 'none', cam: { z0: 1.15, z1: 1.0 } }, (S, at, a) => {
  const d = L5.doc(S.sub, { x: 960, y: 460, s: 1.25, title: 'ACCOUNTS', w: 460, h: 520, accentC: '#3a4fd0', lines: 5 }); const r = L5.big(S.ui, 'REVENUE FROM: ?', { x: 960, y: 920, size: 110, color: GOLD }); const k = at('revenue'); cue(a + k, 'pop'); return { d, r, k };
}, (s, lt) => { L5.pop(s.d, lt, 0, { s: 1.25, r: -1.5 }); s.r.set(lt, s.k - .2); }, { in: 'zoom' });

cut(N('that the boss himself', 239), 'magenta', { ground: 'none', cam: { z0: 1.0, z1: 1.12 } }, (S, at, a) => {
  const d = S.sub.defs; const beam = sv('path', { d: 'M860,-40 L1060,-40 L1260,900 L660,900Z', fill: L5.orbFill(d, '#fff3c4', .35) }, S.sub.svg); const chair = L5.grp(S.sub, 960, 900, 1.1);
  sv('rect', { x: -130, y: -420, width: 260, height: 300, rx: 60, fill: L5.fill(d, '#2a1a5a') }, chair); sv('rect', { x: -160, y: -150, width: 320, height: 80, rx: 30, fill: L5.fill(d, '#3a2a7a') }, chair); sv('rect', { x: -14, y: -70, width: 28, height: 70, fill: '#1a1230' }, chair);
  const st = L5.stamp(S.ui, 'UNDER INVESTIGATION', { x: 960, y: 250, size: 76, col: '#ffd23a', rot: -4 }); const tg = L5.tag(S.ui, 'THE BOSS · REPORTED AUG 2017 (STEINHOFF REJECTED IT)', { x: 960, y: 980, size: 36 }); const k = at('investigation'); cue(a + k, 'stamp'); return { chair, st, tg, beam, k };
}, (s, lt) => { L5.pop(s.chair, lt, 0, { s: 1.1, bob: 1 }); s.beam.setAttribute('opacity', (.8 + .2 * Math.sin(lt * 3)).toFixed(2)); s.st.set(lt, s.k); s.tg.set(lt, .3); }, { in: 'iris' });

cut(N('growth thats too fast', 249.4), 'sunset', { ground: 'none', cam: { z0: 1.0, z1: 1.12, y0: 40, y1: -40 }, stars: 60 }, (S, at, a) => {
  const ch = L5.chart(S.sub, [2, 3, 4, 6, 9, 15, 24, 38, 50], { x: 300, y: 900, w: 1300, h: 700, col: '#ffd84a', max: 50 }); const w = L5.big(S.ui, 'TOO FAST TO EXPLAIN', { x: 760, y: 220, size: 120, color: '#fff' }); cue(a + .1, 'riser', .5); return { ch, w };
}, (s, lt) => { s.ch.draw(E.inQ(clamp(lt / 2.2))); s.w.set(lt, .5); }, { in: 'whip' });

cut(N('and in october 2023', 351.3), 'night', { ground: 'mountains', cam: { z0: 1.2, z1: 1.0 }, stars: 120 }, (S, at, a) => {
  const c = L5.shareCard(S.sub, { x: 960, y: 560, s: 1.3, name: 'STEINHOFF SHARE', price: '2c', col: '#3a4fd0' }); const tg = L5.tag(S.ui, 'OCTOBER 2023', { x: 960, y: 180, size: 56, bg: GOLD }); const dust = coinRain(S, 14, 3, [700, 700, 500, 60], '#8a98d8'); cue(a + .3, 'wind', .5); return { c, tg, dust };
}, (s, lt) => { L5.pop(s.c, lt, 0, { s: 1.3, r: -2 }); s.c.setAttribute('opacity', (1 - .8 * clamp((lt - .6) / 1.4)).toFixed(3)); s.dust(Math.max(0, lt - .6) * .6); s.tg.set(lt, .1); }, { in: 'fade' });

cut(N('in march 2024 regulators', 364.2), 'magenta', { ground: 'city', cam: { z0: 1.0, z1: 1.1 } }, (S, at, a) => {
  const d = L5.doc(S.sub, { x: 760, y: 560, s: 1.4, title: 'PENALTY', w: 420, h: 520, accentC: '#7a0f63' }); const tg = L5.tag(S.ui, 'THE REGULATOR (FSCA) · MARCH 2024', { x: 1380, y: 200, size: 44, bg: GOLD });
  const gv = L5.grp(S.sub, 1400, 640, 1.2); const dd = S.sub.defs; sv('rect', { x: -40, y: -10, width: 230, height: 40, rx: 20, fill: L5.fill(dd, '#c98a4a'), transform: 'rotate(-30)' }, gv); sv('rect', { x: -110, y: -60, width: 150, height: 90, rx: 30, fill: L5.fill(dd, '#a86a34'), transform: 'rotate(-30)' }, gv);
  cue(a + 1.6, 'thud'); return { d, tg, gv };
}, (s, lt) => { L5.pop(s.d, lt, 0, { s: 1.4, r: 2 }); s.tg.set(lt, .3); const sw = lt < 1.6 ? -30 * (1 - lt / 1.6) : Math.sin((lt - 1.6) * 10) * 4 * Math.exp(-(lt - 1.6) * 3); L5.T(s.gv, 1400, 640, sw, 1.2); }, { in: 'whip' });

cut(N('but the money was gone', 330.6), 'ember', { ground: 'none', cam: { z0: 1.12, z1: 1.0 } }, (S, at, a) => {
  const d = S.sub.defs; const v = L5.grp(S.sub, 960, 560, 1.2); sv('rect', { x: -300, y: -260, width: 600, height: 520, rx: 50, fill: L5.fill(d, '#7d8aa8') }, v); sv('rect', { x: -240, y: -200, width: 480, height: 400, rx: 30, fill: '#1c0612' }, v);
  sv('circle', { cx: 0, cy: 0, r: 60, fill: 'none', stroke: '#c9cbe8', 'stroke-width': 14 }, v); const tg = L5.big(S.ui, 'THE MONEY WAS GONE', { x: 960, y: 150, size: 110, color: '#fff' }); cue(a + .3, 'thud', .6); return { v, tg };
}, (s, lt) => { L5.pop(s.v, lt, 0, { s: 1.2, bob: 2 }); s.tg.set(lt, .2); }, { in: 'fade' });

cut(N('into even the biggest', 469.1), 'navy', { ground: 'city', cam: { z0: 1.0, z1: 1.1, y0: 40, y1: -20 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 760, y: 1040, s: 1.0, name: 'BIGGEST COMPANY', fs: 40, col: '#3a4fd0' }); const gauge = L5.grp(S.sub, 1420, 560, 1); const d = S.sub.defs;
  sv('rect', { x: -70, y: -330, width: 140, height: 660, rx: 70, fill: '#0d1b52' }, gauge); const fillR = sv('rect', { x: -56, y: 316, width: 112, height: 0, rx: 56, fill: L5.fill(d, GOLD) }, gauge); sv('rect', { x: -110, y: 316 - 660 * .15 - 4, width: 220, height: 8, rx: 4, fill: '#ff3d5a' }, gauge);
  const tg = L5.tag(S.ui, 'CAP: 15% OF THE FUND', { x: 1420, y: 140, size: 46, bg: GOLD }); return { t, fillR, tg };
}, (s, lt, tt) => { s.t.tick(tt); const h = 660 * .15 * E.outB(clamp((lt - .3) / .8)); s.fillR.setAttribute('y', 316 - h); s.fillR.setAttribute('height', h); s.tg.set(lt, .2); }, { in: 'zoom' });

cut(N('steinhoff was less than', 479.6), 'navy', { ground: 'none', cam: { z0: 1.12, z1: 1.0 }, stars: 70 }, (S, at, a) => {
  const tiles = []; for (let i = 0; i < 50; i++) { const x = 420 + (i % 10) * 120, y = 330 + Math.floor(i / 10) * 120; tiles.push(sv('rect', { x: x - 48, y: y - 48, width: 96, height: 96, rx: 22, fill: i === 37 ? '#ff3d5a' : ['#3a4fd0', '#5a3ad0', '#0fa3a8', '#2a4fd0'][i % 4] }, S.sub.svg)); }
  const tg = L5.tag(S.ui, 'STEINHOFF: UNDER 2% OF A BIG SA INDEX', { x: 960, y: 960, size: 46, bg: GOLD }); cue(a + .4, 'pop'); return { tiles, tg };
}, (s, lt) => { s.tiles.forEach((r, i) => { const q = E.outB(clamp((lt - i * .015) / .4)); r.setAttribute('opacity', q > 0 ? 1 : 0); if (i === 37) r.setAttribute('transform', `translate(0,${(Math.sin(lt * 6) * 4).toFixed(1)})`); }); s.tg.set(lt, .6); }, { in: 'fade' });

cut(N('with no tax on', 493.8), 'mint', { ground: 'hills', cam: { z0: 1.15, z1: 1.0 } }, (S, at, a) => {
  const j = L5.jar(S.sub, { x: 700, y: 960, s: 1.25 }); const b = L5.big(S.ui, 'TAX: R0', { x: 1350, y: 430, size: 200, color: GOLD }); const tg = L5.tag(S.ui, 'ON THE GROWTH', { x: 1350, y: 620, size: 50 }); cue(a + .4, 'ding'); return { j, b, tg };
}, (s, lt) => { s.j.level(.4 + .6 * E.ioC(clamp(lt / 1.8))); s.b.set(lt, .2); s.tg.set(lt, .5); }, { in: 'zoom' });

cut(N('and one company held', 529.4), 'ember', { ground: 'city', cam: { z0: 1.0, z1: 1.1 } }, (S, at, a) => {
  const t = hq(S.sub, { x: 1250, y: 1040, s: .95, name: 'ONE COMPANY', col: '#5a3ad0' }); const e = elsie(S.sub, { x: 520, y: 1000, s: 1.3 }); const w = L5.big(S.ui, 'HELD EVERYTHING', { x: 760, y: 200, size: 130, color: '#fff' }); return { t, e, w };
}, (s, lt, tt) => { s.t.tick(tt); s.e.set(tt, { pose: 'sad', expr: 'sad' }); s.w.set(lt, .2); }, { in: 'whip' });

cut(N('new shorts every day', 543.5), 'purple', { ground: 'none', cam: { z0: 1.0, z1: 1.08 }, stars: 80 }, (S, at, a) => {
  const p = L5.phone(S.sub, { x: 640, y: 560, s: 1.15, w: 330, h: 600, screen: (g, d, w, h) => { for (let i = 0; i < 3; i++) { sv('rect', { x: 24, y: 40 + i * 185, width: w - 48, height: 165, rx: 22, fill: ['#ffd84a', '#ff8fc5', '#8affea'][i] }, g); L5.txt(g, ['R204', 'R271', 'R21 900'][i], { x: w / 2, y: 140 + i * 185, 'font-size': 64, fill: '#1b1533' }); } return null; } });
  const b1 = L5.big(S.ui, 'SHORTS EVERY DAY', { x: 1360, y: 420, size: 110, color: '#fff' }); const b2 = L5.big(S.ui, 'A FULL GUIDE EVERY WEEK', { x: 1380, y: 620, size: 84, color: GOLD }); return { p, b1, b2, k: at('a full') };
}, (s, lt) => { L5.pop(s.p, lt, 0, { s: 1.15, bob: 4 }); s.b1.set(lt, .1); s.b2.set(lt, s.k - .2); }, { in: 'fade' });

cut(N('this is general', 547.4), 'sunset', { ground: 'none', cam: { z0: 1.06, z1: 1.0 }, stars: 80 }, (S, at, a) => {
  const c = L5.coin(S.sub, { x: 960, y: 360, r: 150, label: '0' }); const w = L5.big(S.ui, 'GENERAL INFORMATION,<br>NOT FINANCIAL ADVICE', { x: 960, y: 700, size: 90, color: '#fff' }); w.style.whiteSpace = 'normal'; w.style.lineHeight = '1.05'; return { c, w };
}, (s, lt) => { L5.T(s.c, 960, 360 + Math.sin(lt * 2) * 8, 0, 1, Math.cos(lt * 2)); s.w.set(lt, .1); }, { in: 'zoom' });

// ---------- build the shots from the cut list ----------
CUTS.sort((x, y) => x.a - y.a);
const END = WORDS[WORDS.length - 1][2] + 2.2;
CUTS.forEach((c, i) => {
  const next = CUTS[i + 1]; const b = next ? next.a + .35 : END; const a = c.a;
  const opts = Object.assign({ tin: .45 }, c.opts); if (i === 0) { opts.in = 'cut'; opts.tin = 0; }
  if (i > 0) cue(a, opts.in === 'whip' ? 'swish' : opts.in === 'zoom' ? 'whoosh' : 'swoosh_up', .35);
  C.shot(a, b, ctx => { const S = L5.set(ctx, c.pal, Object.assign({ seed: i * 7 + 3 }, c.so)); const at = (p, off = 0) => N(p, a + off + .5, a - .2) - a; const st = c.build(S, at, a) || {}; st.S = S; return st; },
    (st, lt, t, k) => { st.S.tick(lt, t, k); if (c.upd) c.upd(st, lt, t, k); }, opts);
});
window.__SHOTLIST = CUTS.map((c, i) => [c.a, CUTS[i + 1] ? CUTS[i + 1].a : END]);
// on-screen disclaimer: first 45 s and the last shot
window.AFTER = t => { if (!window.__dis) { window.__dis = L5.disclaimer(C.stage); window.__dis.style.zIndex = 9005; } window.__dis.style.display = (t < 45 || (t > N('if this helped', 540.6) && t < N('this is general', 547.4))) ? 'block' : 'none'; };
C.brandBug();
window.DURATION = END;
window.META = { music: { style: 'doc', drop: N('lets start from zero', 78.4), end: END, breaks: [[N('then came december', 273.6), N('then came december', 273.6) + 2], [N('so what does this mean', 413.4), N('so what does this mean', 413.4) + 1.8]] } };
