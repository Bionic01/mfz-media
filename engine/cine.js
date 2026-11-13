/* CINE ENGINE v1 — code-only cinematic explainer animation (1920x1080, deterministic).
   Every frame is a pure function of time: window.renderAt(t). No CSS animations, no timers.
   Shared by Money From Zero and Fluxr Explains. See engine/README.md. */
'use strict';
(() => {
const W = 1920, H = 1080, FPS = 30;
const QS = new URLSearchParams(location.search);

// ---------------- math ----------------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const E = {
  lin: t => t, inQ: t => t * t, outQ: t => 1 - (1 - t) * (1 - t), ioQ: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  outC: t => 1 - Math.pow(1 - t, 3), inC: t => t * t * t, ioC: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  outQu: t => 1 - Math.pow(1 - t, 5), ioQu: t => t < .5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2,
  outE: t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t), inE: t => t <= 0 ? 0 : Math.pow(2, 10 * t - 10),
  ioE: t => t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  outB: t => { const s = 1.70158; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); },
  inB: t => { const s = 1.70158; return (s + 1) * t * t * t - s * t * t; },
  ioS: t => t * t * (3 - 2 * t),
};
const prog = (t, a, b) => clamp((t - a) / (b - a));
const tw = (t, a, b, v0, v1, e = E.ioC) => lerp(v0, v1, e(prog(t, a, b)));
/** damped spring 0->1 starting at a */
const spr = (t, a, damp = 7, freq = 12) => { if (t <= a) return 0; const x = t - a; return 1 - Math.exp(-damp * x) * Math.cos(freq * x); };
/** keyframe interpolation: keys = [[t, value], ...], value number or array */
function kf(t, keys, e = E.ioC) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1] = keys[i]; const k = e(prog(t, t0, t1));
      return Array.isArray(v0) ? v0.map((v, j) => lerp(v, v1[j], k)) : lerp(v0, v1, k);
    }
  }
  return keys[keys.length - 1][1];
}
function rnd(seed) { let s = (seed >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
/** smooth 1D value noise in [-1,1], deterministic */
function noise1(x, seed = 1) {
  const h = n => { let v = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return (v - Math.floor(v)) * 2 - 1; };
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(h(i), h(i + 1), u);
}
const fmtR = (n, d = 0) => 'R' + Number(n).toLocaleString('en-ZA', { minimumFractionDigits: d, maximumFractionDigits: d }).replace(/,/g, ' ');

// ---------------- DOM ----------------
const NS = 'http://www.w3.org/2000/svg';
const stage = document.getElementById('stage');
function el(tag, attrs = {}, parent = null, html = '') {
  const e = document.createElement(tag);
  for (const k in attrs) { if (k === 'style' && typeof attrs[k] === 'object') Object.assign(e.style, attrs[k]); else e.setAttribute(k, attrs[k]); }
  if (html) e.innerHTML = html; if (parent) parent.appendChild(e); return e;
}
function sv(tag, attrs = {}, parent = null) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e;
}
/** an absolutely positioned SVG layer of size w x h (viewBox in same units) */
function svgBox(w, h, parent, extra = {}) {
  const s = sv('svg', Object.assign({ width: w, height: h, viewBox: `0 0 ${w} ${h}`, overflow: 'visible' }, extra), parent);
  s.style.position = 'absolute'; s.style.left = '0'; s.style.top = '0'; s.style.overflow = 'visible'; return s;
}
let _gid = 0; const uid = p => `${p}${++_gid}`;
function grad(defs, stops, { x1 = 0, y1 = 0, x2 = 0, y2 = 1, radial = false, cx = .5, cy = .5, r = .5, fx, fy } = {}) {
  const id = uid('g'); const g = radial ? sv('radialGradient', { id, cx, cy, r, fx: fx ?? cx, fy: fy ?? cy }, defs) : sv('linearGradient', { id, x1, y1, x2, y2 }, defs);
  stops.forEach(([o, c, a = 1]) => sv('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, g)); return `url(#${id})`;
}
function blurFilter(defs, sd) { const id = uid('f'); const f = sv('filter', { id, x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs); sv('feGaussianBlur', { stdDeviation: sd }, f); return `url(#${id})`; }
/** place a DOM element: centre-based by default */
function P(e, o) {
  if (!e) return; const x = o.x || 0, y = o.y || 0;
  let tr = o.anchor === 'tl' ? '' : 'translate(-50%,-50%) ';
  tr += `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
  if (o.rx) tr += ` rotateX(${o.rx}deg)`; if (o.ry) tr += ` rotateY(${o.ry}deg)`; if (o.r) tr += ` rotate(${o.r}deg)`;
  const s = o.s ?? 1; const sx = (o.sx ?? 1) * s, sy = (o.sy ?? 1) * s; if (sx !== 1 || sy !== 1) tr += ` scale(${sx},${sy})`;
  e.style.transform = tr; const op = clamp(o.o ?? 1); e.style.opacity = op; e.style.visibility = op <= .001 ? 'hidden' : 'visible';
  if (o.blur !== undefined) e.style.filter = o.blur > .05 ? `blur(${o.blur.toFixed(2)}px)` : 'none';
}
/** set SVG group transform */
const G = (g, x = 0, y = 0, r = 0, s = 1, sy) => g.setAttribute('transform', `translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${r.toFixed(2)}) scale(${s.toFixed(4)},${(sy ?? s).toFixed(4)})`);

// ---------------- theme ----------------
const THEMES = {
  mfz: { bg: '#121214', ink: '#f4eedf', gold: '#f7be33', green: '#2fd27f', red: '#ff5d5d', blue: '#6cb4ff', dim: '#b9b3a8', font: "'Barlow', 'Inter', sans-serif", display: "'Barlow Condensed', 'Barlow', sans-serif", brand: 'MONEY FROM ZERO' },
  fluxr: { bg: '#0d372b', ink: '#ffffff', gold: '#ffc94d', green: '#85ed70', red: '#ff6b5a', blue: '#6ec6ff', dim: '#a9c4b8', font: "'Barlow', 'Inter', sans-serif", display: "'Barlow Condensed', 'Barlow', sans-serif", brand: 'FLUXR EXPLAINS' },
};
let TH = THEMES[QS.get('theme') || window.THEME || 'mfz'] || THEMES.mfz;
function setTheme(name) { TH = THEMES[name]; document.documentElement.style.setProperty('--ink', TH.ink); document.documentElement.style.setProperty('--gold', TH.gold); document.documentElement.style.setProperty('--green', TH.green); }

// ---------------- world, layers, camera ----------------
/**
 * A World is a set of depth layers seen by a virtual camera.
 * depth d: 1 = subject plane, >1 further back (moves less, blurs with DOF), <1 nearer (foreground, moves more).
 * camera: {x, y, zoom, rot, focus(depth in focus), dof(blur strength), shake}
 */
class World {
  constructor(parent = stage) { this.root = el('div', { class: 'world' }, parent); this.layers = []; this.cam = { x: 0, y: 0, zoom: 1, rot: 0, focus: 1, dof: 0 }; }
  layer(depth = 1, { name = '', w = W, h = H } = {}) {
    const d = el('div', { class: 'layer', 'data-name': name }, this.root); d.style.width = w + 'px'; d.style.height = h + 'px';
    d.style.zIndex = String(Math.round(1000 - depth * 100)); const L = { el: d, depth, w, h, svg: null };
    L.svg = svgBox(w, h, d); L.defs = sv('defs', {}, L.svg); this.layers.push(L); return L;
  }
  camera(c) { Object.assign(this.cam, c); this.apply(); }
  apply() {
    const c = this.cam;
    for (const L of this.layers) {
      const p = 1 / L.depth; const s = 1 + (c.zoom - 1) * p;
      const x = -c.x * p * s, y = -c.y * p * s;
      L.el.style.transform = `translate(${(W / 2).toFixed(1)}px,${(H / 2).toFixed(1)}px) rotate(${(c.rot * p).toFixed(3)}deg) translate(${x.toFixed(2)}px,${y.toFixed(2)}px) scale(${s.toFixed(4)}) translate(${(-L.w / 2).toFixed(1)}px,${(-L.h / 2).toFixed(1)}px)`;
      const b = c.dof * Math.abs(p - 1 / c.focus) * 6; L.el.style.filter = b > .15 ? `blur(${b.toFixed(2)}px)` : 'none';
    }
  }
  show(v) { this.root.style.display = v ? 'block' : 'none'; }
}

// ---------------- timeline / shots ----------------
const SHOTS = []; const CUES = []; window.CUES = CUES; window.__SHOTS = SHOTS;
/** cue a sound effect at absolute time t: types see engine/audio.py */
function cue(t, type, gain = 1, extra = {}) { if (CUES.some(c => c.type === type && Math.abs(c.t - t) < .002)) return; CUES.push(Object.assign({ t: +t.toFixed(3), type, gain }, extra)); }
/**
 * shot(a, b, build, update, opts)
 *  build(ctx) -> state  (called once, lazily). ctx = {root, world(), a, b, d}
 *  update(state, lt, t, k) each frame while visible. lt = local time (s from a), k = 0..1 progress.
 *  opts.in: 'cut' | 'fade' | 'whip' | 'zoom' | 'flash' | 'iris' ; opts.tin = transition length (s)
 */
function shot(a, b, build, update, opts = {}) { SHOTS.push({ a, b, build, update, opts, st: null, root: null }); }
function _ensure(S) {
  if (S.root) return; S.root = el('div', { class: 'shot' }, stage); S.root.style.display = 'none';
  const ctx = { root: S.root, a: S.a, b: S.b, d: S.b - S.a, world: () => new World(S.root) }; S.st = S.build(ctx) || {};
}
const fx = {}; // overlays filled by initFX
function initFX({ grain = .07, vignette = .55, bars = false, grade = '', grainMode = 'static' } = {}) {
  fx.grainMode = grainMode; // 'static' keeps files small (moving grain costs ~3x the bitrate); 'film' changes every frame
  fx.vig = el('div', { class: 'fx-vig' }, stage); fx.vig.style.opacity = vignette;
  fx.flash = el('div', { class: 'fx-flash' }, stage);
  fx.leak = el('div', { class: 'fx-leak' }, stage);
  if (bars) { fx.barT = el('div', { class: 'fx-bar top' }, stage); fx.barB = el('div', { class: 'fx-bar bot' }, stage); }
  // film grain: 6 pre-baked noise tiles, swapped per frame
  fx.grain = el('canvas', { class: 'fx-grain', width: 480, height: 270 }, stage); fx.grain.style.opacity = grain; fx.grainTiles = [];
  const cx = fx.grain.getContext('2d'); const r = rnd(7);
  for (let i = 0; i < 6; i++) { const im = cx.createImageData(480, 270); for (let p = 0; p < im.data.length; p += 4) { const v = 110 + r() * 146 | 0; im.data[p] = im.data[p + 1] = im.data[p + 2] = v; im.data[p + 3] = 255; } fx.grainTiles.push(im); }
  if (grade) stage.style.filter = grade;
}
function _fxFrame(t) {
  if (fx.grain) { const i = fx.grainMode === 'film' ? Math.floor(t * FPS) % 6 : 0; if (fx._gi !== i) { fx.grain.getContext('2d').putImageData(fx.grainTiles[i], 0, 0); fx._gi = i; } }
}
/** brand bug in the corner (channel name) */
function brandBug() {
  const b = el('div', { class: 'bug' }, stage, TH === THEMES.mfz ? `<span class="z">0</span>${TH.brand}` : `<span class="fx">F</span>${TH.brand}`); return b;
}
let DUR = 10;
window.ready = () => { if (window.SETUP) window.SETUP(); DUR = window.DURATION || Math.max(...SHOTS.map(s => s.b), 1); window.DURATION = DUR; return true; };
window.renderAt = (t) => {
  window.CINE.now = t; let active = [];
  for (const S of SHOTS) {
    const tin = S.opts.tin ?? (S.opts.in && S.opts.in !== 'cut' ? .5 : 0);
    if (t >= S.a - 1e-6 && t < S.b + (S.opts.tout ?? 0) + 1e-6) active.push(S);
    else if (S.root) S.root.style.display = 'none';
  }
  // only keep the latest shot plus the previous one while a transition runs
  active.sort((x, y) => x.a - y.a);
  for (let i = 0; i < active.length; i++) {
    const S = active[i]; _ensure(S); const lt = t - S.a, k = clamp(lt / (S.b - S.a));
    const tin = S.opts.tin ?? (S.opts.in && S.opts.in !== 'cut' ? .5 : 0);
    const next = active[i + 1];
    if (next && t >= next.a + (next.opts.tin ?? .5)) { S.root.style.display = 'none'; continue; }
    S.root.style.display = 'block'; S.root.style.zIndex = String(10 + i);
    S.update(S.st, lt, t, k);
    // transition in
    const q = tin > 0 ? clamp(lt / tin) : 1; const m = S.opts.in || 'cut';
    let tr = '', op = 1, fl = '';
    if (q < 1) {
      if (m === 'fade') op = E.ioS(q);
      else if (m === 'whip') { tr = `translateX(${((1 - E.outE(q)) * W * (S.opts.dir || 1)).toFixed(1)}px)`; fl = `blur(${((1 - q) * 30).toFixed(1)}px)`; }
      else if (m === 'zoom') { op = E.ioS(q); tr = `scale(${lerp(1.35, 1, E.outC(q)).toFixed(4)})`; fl = `blur(${((1 - q) * 16).toFixed(1)}px)`; }
      else if (m === 'iris') { S.root.style.clipPath = `circle(${(E.ioC(q) * 120).toFixed(2)}% at ${S.opts.ix || 50}% ${S.opts.iy || 50}%)`; }
      else if (m === 'flash') { op = 1; }
      else if (m === 'bands' || m === 'circle') { op = q > .45 ? 1 : 0; }
    } else if (m === 'iris') S.root.style.clipPath = 'none';
    // living camera (Rodney 11 Nov 2026: "high quality, non-stop motion"): every shot keeps drifting and pushing in or
    // pulling out, on top of its own camera, so nothing ever sits still. opts.live: false turns it off; a number scales it.
    let live = '';
    if (S.opts.live !== false) { const amp = typeof S.opts.live === 'number' ? S.opts.live : 1; const d = Math.max(.5, S.b - S.a); const kk = E.ioS(clamp((t - S.a) / d)); const ph = S.a * 1.37;
      const dir = Math.floor(S.a * 3.1) % 2 ? 1 : -1; const sc = 1 + amp * .05 * (dir > 0 ? kk : 1 - kk);
      const dx = amp * (noise1(t * .21 + ph, 11) * 16 + lerp(-10, 10, kk) * dir), dy = amp * noise1(t * .17 + ph, 13) * 10, rot = amp * noise1(t * .13 + ph, 17) * .45;
      live = `translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px) rotate(${rot.toFixed(3)}deg) scale(${sc.toFixed(4)})`; }
    S.root.style.opacity = op; S.root.style.transform = (tr ? tr + ' ' : '') + live; S.root.style.filter = fl;
  }
  // shape transitions (bands / circle) drawn in a stage overlay
  if (!fx.tov) { fx.tov = el('div', { class: 'abs' }, stage); fx.tov.style.cssText += 'width:1920px;height:1080px;z-index:8995;pointer-events:none;overflow:hidden'; fx.tb = [0, 1, 2].map(i => { const d = el('div', { class: 'abs' }, fx.tov); d.style.cssText += 'width:1500px;height:2800px;left:0;top:-860px'; return d; }); fx.tc = el('div', { class: 'abs' }, fx.tov); fx.tc.style.cssText += 'width:100px;height:100px;border-radius:50%;left:0;top:0'; }
  let bandK = -1, circK = -1, bcol = null, cx0 = 960, cy0 = 540;
  for (const S of SHOTS) { const tin = S.opts.tin ?? .5; const d = t - S.a; if (d >= 0 && d < tin) { if (S.opts.in === 'bands') { bandK = d / tin; bcol = S.opts.colors; } if (S.opts.in === 'circle') { circK = d / tin; bcol = S.opts.colors; cx0 = (S.opts.ix ?? 50) * 19.2; cy0 = (S.opts.iy ?? 50) * 10.8; } } }
  const cols = bcol || [TH.green, TH.gold, TH.ink];
  fx.tb.forEach((b, i) => { if (bandK < 0) { b.style.display = 'none'; return; } b.style.display = 'block'; b.style.background = cols[i % cols.length]; const k = E.ioC(clamp(bandK * 1.25 - i * .1)); b.style.transform = `translateX(${lerp(-2300, 2700, k).toFixed(1)}px) rotate(18deg)`; });
  if (circK < 0) fx.tc.style.display = 'none'; else { fx.tc.style.display = 'block'; fx.tc.style.background = cols[0]; const k = circK < .5 ? E.ioC(circK * 2) : 1 - E.ioC((circK - .5) * 2); const r = k * 2300; fx.tc.style.width = fx.tc.style.height = (r * 2).toFixed(0) + 'px'; fx.tc.style.transform = `translate(${(cx0 - r).toFixed(1)}px,${(cy0 - r).toFixed(1)}px)`; }
  // global flash on 'flash' transitions
  let fla = 0; for (const S of SHOTS) if (S.opts.in === 'flash') { const d = t - S.a; if (d > -0.12 && d < .45) fla = Math.max(fla, d < 0 ? (d + .12) / .12 : 1 - d / .45); }
  // flash = brightness pop via overlay blend (cine.css), hidden when idle so the blend costs nothing between flashes.
  // Was a plain white veil at .85, which read as "whitish", and at .5 as a grey blink (USSD v6 feedback, 13 Nov 2026).
  if (fx.flash) { const fo = clamp(fla) * .9; fx.flash.style.opacity = fo; fx.flash.style.display = fo > .001 ? 'block' : 'none'; }
  if (fx.leak) { const lk = .18 + .12 * noise1(t * .25, 3); fx.leak.style.opacity = lk; fx.leak.style.transform = `translateX(${(noise1(t * .1, 9) * 200).toFixed(1)}px)`; }
  _fxFrame(t);
  if (window.AFTER) window.AFTER(t);
};

// ---------------- text / type ----------------
/** kinetic title: words rise from a mask, staggered */
function kTitle(parent, html, { size = 96, weight = 800, color = TH.ink, font = TH.display, align = 'center', ls = '.01em', width = 1600, shadow = true } = {}) {
  const box = el('div', { class: 'ktitle' }, parent); box.style.cssText += `font:${weight} ${size}px/${1.02} ${font};color:${color};text-align:${align};width:${width}px;letter-spacing:${ls};` + (shadow ? 'text-shadow:0 6px 30px rgba(0,0,0,.45);' : '');
  box.innerHTML = html.split(/(<[^>]+>[^<]*<\/[^>]+>|\s+)/).filter(s => s && !/^\s+$/.test(s)).map(w => `<span class="km"><span class="kw">${w}</span></span>`).join(' ');
  const words = [...box.querySelectorAll('.kw')];
  return { el: box, set(t, a, step = .07, dur = .5, out = 1e9) {
    words.forEach((w, i) => { const q = E.outQu(prog(t, a + i * step, a + i * step + dur)); const o = 1 - E.inC(prog(t, out, out + .35));
      w.style.transform = `translateY(${((1 - q) * 110 + (1 - o) * -60).toFixed(1)}%)`; w.style.opacity = Math.min(q * 1.4, o); });
  } };
}
/** big counting number */
function counter(parent, { size = 180, color = TH.gold, prefix = 'R', font = TH.display, dec = 0 } = {}) {
  const e = el('div', { class: 'counter' }, parent); e.style.cssText += `font:800 ${size}px/1 ${font};color:${color};`;
  return { el: e, set(v) { e.textContent = prefix + Number(v).toLocaleString('en-ZA', { minimumFractionDigits: dec, maximumFractionDigits: dec }).replace(/,/g, ' '); } };
}
/** label pill */
function pill(parent, text, { bg = 'rgba(0,0,0,.55)', color = TH.ink, size = 34, border = TH.gold } = {}) {
  const e = el('div', { class: 'pill' }, parent, text); e.style.cssText += `background:${bg};color:${color};font:700 ${size}px/1.1 ${TH.font};border:3px solid ${border};`; return e;
}
/** lower third: name + sub */
function lowerThird(parent, title, sub = '') {
  const e = el('div', { class: 'l3' }, parent, `<div class="l3a">${title}</div>${sub ? `<div class="l3b">${sub}</div>` : ''}`); return e;
}
/** chapter card overlay text (split-flap for mfz, slab for fluxr) */
function flapText(parent, text, { size = 84, color = TH.ink, accent = false } = {}) {
  const box = el('div', { class: 'flaps' }, parent);
  [...text].forEach(ch => { const f = el('span', { class: 'flap' + (ch === ' ' ? ' sp' : '') }, box, ch === ' ' ? '&nbsp;' : ch); f.style.fontSize = size + 'px'; if (accent) f.style.color = TH.gold; });
  const fl = [...box.children]; const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789R';
  return { el: box, set(t, a, step = .045) { fl.forEach((f, i) => { if (f.classList.contains('sp')) return; const s = a + i * step; const q = prog(t, s, s + .32);
    f.textContent = q >= 1 ? text[i] : (q <= 0 ? '' : chars[Math.floor((t * 30 + i * 7) % chars.length)]); f.style.opacity = q > 0 ? 1 : 0; f.style.transform = `rotateX(${((1 - E.outB(q)) * 90).toFixed(1)}deg)`; }); } };
}

// ---------------- particles & light ----------------
/** dust motes / bokeh in a layer (svg): returns update(t) */
function bokeh(L, { n = 26, color = '#fff2c8', seed = 5, size = [6, 26], alpha = [.05, .22], area = [0, 0, W, H], drift = 18 } = {}) {
  // soft edges come from a radial gradient, not a blur filter: blur on moving circles made renders about 2x slower (12 Nov 2026)
  const r = rnd(seed); const f = grad(L.defs, [[0, color, 1], [.55, color, .8], [1, color, 0]], { radial: true }); const items = [];
  for (let i = 0; i < n; i++) { const c = sv('circle', { r: lerp(size[0], size[1], r()) * 1.25, fill: f, opacity: lerp(alpha[0], alpha[1], r()) }, L.svg); items.push({ c, x: area[0] + r() * area[2], y: area[1] + r() * area[3], ph: r() * 100, sp: .3 + r() }); }
  return t => items.forEach(p => { p.c.setAttribute('cx', p.x + noise1(t * .2 * p.sp + p.ph, 2) * drift * 3); p.c.setAttribute('cy', p.y - ((t * drift * p.sp) % 200) + noise1(t * .15 + p.ph, 4) * drift); });
}
/** god rays from (x,y) in an svg layer */
function rays(L, x, y, { n = 7, len = 1600, color = '#fff3c4', alpha = .10, spread = 70, angle = 110, seed = 2 } = {}) {
  const r = rnd(seed); const g = sv('g', { style: 'mix-blend-mode:screen' }, L.svg); const fi = blurFilter(L.defs, 14);
  const items = []; for (let i = 0; i < n; i++) { const a = angle - spread / 2 + r() * spread; const w = 30 + r() * 90; const p = sv('polygon', { fill: color, opacity: alpha, filter: fi }, g); items.push({ p, a, w, ph: r() * 10 }); }
  return t => items.forEach(it => { const a = (it.a + noise1(t * .2 + it.ph, 7) * 4) * Math.PI / 180; const w = it.w; const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len; const nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
    it.p.setAttribute('points', `${x},${y} ${ex + nx},${ey + ny} ${ex - nx},${ey - ny}`); it.p.setAttribute('opacity', (it.a ? 1 : 1) * (.6 + .4 * noise1(t * .5 + it.ph, 3)) * alpha); });
}
/** confetti / falling items: maker(i) returns an svg node; returns update(t) where t is time since burst */
function fall(L, maker, { n = 30, seed = 3, area = [0, -200, W, 0], g = 520, spin = 300 } = {}) {
  const r = rnd(seed); const items = [];
  for (let i = 0; i < n; i++) { const node = maker(i, r); L.svg.appendChild(node); items.push({ node, x: area[0] + r() * area[2], y: area[1] + r() * area[3], vx: (r() - .5) * 120, vy: r() * 80, rs: (r() - .5) * spin, sw: r() * 6, delay: r() * .8 }); }
  return lt => items.forEach(p => { const tt = Math.max(0, lt - p.delay); const x = p.x + p.vx * tt + Math.sin(tt * 2 + p.sw) * 40, y = p.y + p.vy * tt + .5 * g * tt * tt * .35;
    p.node.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${(p.rs * tt).toFixed(1)}) scale(1,${Math.cos(tt * 4 + p.sw).toFixed(3)})`); p.node.setAttribute('opacity', lt > p.delay ? 1 : 0); });
}

// ---------------- simple charts (svg) ----------------
function barChart(L, data, { x = 260, y = 820, w = 1400, h = 520, color = TH.gold, labelColor = TH.ink, fmt = v => v, max } = {}) {
  const g = sv('g', {}, L.svg); const m = max || Math.max(...data.map(d => d.v)); const bw = w / data.length * .62; const bars = [];
  data.forEach((d, i) => { const bx = x + (i + .5) * w / data.length - bw / 2; const fill = grad(L.defs, [[0, d.color || color], [1, d.color || color, .55]]);
    const r = sv('rect', { x: bx, y, width: bw, height: 0, rx: 10, fill }, g); const lab = sv('text', { x: bx + bw / 2, y: y + 54, 'text-anchor': 'middle', fill: labelColor, 'font-size': 34, 'font-family': 'Barlow', 'font-weight': 700 }, g); lab.textContent = d.label;
    const val = sv('text', { x: bx + bw / 2, y, 'text-anchor': 'middle', fill: d.color || color, 'font-size': 46, 'font-family': 'Barlow Condensed', 'font-weight': 800 }, g); bars.push({ r, val, d, bx }); });
  return (t, a = 0, step = .18) => bars.forEach((b, i) => { const q = E.outC(prog(t, a + i * step, a + i * step + .9)); const bh = h * b.d.v / m * q; b.r.setAttribute('y', y - bh); b.r.setAttribute('height', bh); b.val.setAttribute('y', y - bh - 18); b.val.textContent = fmt(b.d.v * q); b.val.setAttribute('opacity', q); });
}
function lineChart(L, pts, { x = 200, y = 860, w = 1500, h = 560, color = TH.green, width = 10, glow = true, maxY } = {}) {
  const g = sv('g', {}, L.svg); const m = maxY || Math.max(...pts); const P2 = pts.map((v, i) => [x + i / (pts.length - 1) * w, y - v / m * h]);
  const d = P2.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = sv('path', { d: d + ` L${x + w} ${y} L${x} ${y} Z`, fill: grad(L.defs, [[0, color, .35], [1, color, 0]]) }, g);
  if (glow) sv('path', { d, fill: 'none', stroke: color, 'stroke-width': width * 3, opacity: .25, filter: blurFilter(L.defs, 10), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  const line = sv('path', { d, fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  const dot = sv('circle', { r: width * 1.6, fill: '#fff' }, g); const len = line.getTotalLength();
  line.style.strokeDasharray = len; return (q) => { line.style.strokeDashoffset = len * (1 - q); const p = line.getPointAtLength(len * q); dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); dot.setAttribute('opacity', q > .001 ? 1 : 0); area.setAttribute('opacity', q);
    g.querySelectorAll('path')[1].style.strokeDasharray = len; g.querySelectorAll('path')[1].style.strokeDashoffset = len * (1 - q); return p; };
}

window.CINE = { get TH() { return TH; }, uid, stage, W, H, FPS, clamp, lerp, E, prog, tw, spr, kf, rnd, noise1, fmtR, el, sv, svgBox, grad, blurFilter, P, G, THEMES, setTheme, World, shot, cue, initFX, brandBug, kTitle, counter, pill, lowerThird, flapText, bokeh, rays, fall, barChart, lineChart };
// ---------------- voice timing ----------------
/** words: [[text, start, end], ...] (scribe output). lead: seconds of silence before the voice in the final mix. */
function voice(words, lead = 0) {
  const W2 = words.map(([w, a, b]) => ({ w: w.toLowerCase().replace(/[^a-z0-9#*]/g, ''), a: a + lead, b: b + lead, raw: w }));
  const find = (txt, after = 0) => { const k = txt.toLowerCase().replace(/[^a-z0-9#* ]/g, '').split(' ');
    for (let i = 0; i < W2.length; i++) { if (W2[i].a < after - 1e-6) continue; let ok = true; for (let j = 0; j < k.length; j++) if (!W2[i + j] || W2[i + j].w !== k[j]) { ok = false; break; } if (ok) return [W2[i], W2[i + k.length - 1]]; }
    console.warn('word not found: ' + txt + ' after ' + after); return [{ a: after, b: after }, { a: after, b: after }]; };
  return { words: W2, end: W2.length ? W2[W2.length - 1].b : 0, at: (t, after) => find(t, after)[0].a, to: (t, after) => find(t, after)[1].b };
}
function loadJSON(path) { const x = new XMLHttpRequest(); x.open('GET', path, false); x.send(); return JSON.parse(x.responseText); }
/** a DOM card holding an SVG, transformable in real CSS 3D (rotateX/Y with perspective) */
function card3d(parent, w, h, { persp = 1400, sheenA = .55 } = {}) {
  const wrap = el('div', { class: 'abs' }, parent); wrap.style.cssText += `width:${w}px;height:${h}px;perspective:${persp}px;`;
  const inner = el('div', { class: 'card3d' }, wrap); inner.style.width = w + 'px'; inner.style.height = h + 'px';
  const s = svgBox(w, h, inner); const defs = sv('defs', {}, s);
  const sheen = el('div', { class: 'abs' }, inner); sheen.style.cssText += `width:${w}px;height:${h}px;border-radius:10px;mix-blend-mode:screen;pointer-events:none;`;
  return { wrap, inner, svg: s, defs, sheen, w, h, set({ x = 0, y = 0, rx = 0, ry = 0, rz = 0, s = 1, o = 1, light = null, blur = 0 }) {
    wrap.style.transform = `translate(${(x - w / 2).toFixed(1)}px,${(y - h / 2).toFixed(1)}px)`; wrap.style.opacity = o;
    inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`; inner.style.filter = blur > .1 ? `blur(${blur}px)` : 'none';
    if (light !== null) sheen.style.background = `linear-gradient(105deg, rgba(255,255,255,0) ${light * 100 - 18}%, rgba(255,255,255,${sheenA}) ${light * 100}%, rgba(255,255,255,0) ${light * 100 + 18}%)`; } };
}
/** UI overlay layer that does not move with the camera */
function ui(parent) { return el('div', { class: 'ui' }, parent); }
Object.assign(window.CINE, { voice, loadJSON, card3d, ui });

})();
