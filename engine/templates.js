/* CINE shot templates: one call = one finished, moving, sound-cued shot at v2 density.
   Use them to build long videos fast, and mix with hand-written shots for the story moments.
   Every template: T.name(a, b, opts) registers a shot from a to b (seconds). Times inside opts are absolute seconds
   (get them from the voice: at('word', after)). Theme colours come from CINE.TH (mfz or fluxr). */
'use strict';
(() => {
const C = window.CINE; const { shot, cue, E, prog, clamp, lerp, kf, noise1, sv, G, P, el, pop } = C;
const TT = () => C.TH; const isM = () => C.TH === C.THEMES.mfz;
const DARK = () => isM() ? '#121214' : '#0d372b';
const uiSvg = u => { const s = C.svgBox(1920, 1080, u); return { svg: s, defs: sv('defs', {}, s) }; };
function bg(w, { glyphs = null, warm = false } = {}) {
  const L = w.layer(4, { w: 3000, h: 1900 }); const m = isM();
  C.studio(L, m ? { c1: warm ? '#3a2a1c' : '#26262c', c2: '#08080a', key: '#ffd9a0' } : { c1: '#14513e', c2: '#04140e', key: '#85ed70' });
  const ups = [C.blobs(L, { colors: m ? (warm ? ['#5a3a1c', '#2a1c12', '#7a4a1c'] : ['#3a3326', '#1c1c22', '#4a3c1c']) : ['#1f6f4a', '#0b3f2f', '#2f8a5a'], o: .5 }), C.dotGrid(L, { o: .06 })];
  if (glyphs) ups.push(C.glyphs(L, { chars: glyphs, color: m ? TT().gold : TT().green, o: [.03, .09] }));
  // always-moving depth: drifting bokeh and a soft light band sweeping across (Rodney 11 Nov 2026: "non-stop motion")
  ups.push(C.bokeh(L, { n: 18, color: m ? '#ffe2b0' : '#d6ffd0', size: [10, 34], alpha: [.04, .13], area: [0, 0, L.w, L.h], drift: 30, seed: 11 }));
  const sw = sv('rect', { x: -900, y: -400, width: 700, height: L.h + 800, fill: C.grad(L.defs, [[0, '#ffffff', 0], [.5, '#ffffff', m ? .05 : .06], [1, '#ffffff', 0]], { x1: 0, y1: 0, x2: 1, y2: 0 }) }, L.svg);
  ups.push(t => sw.setAttribute('transform', `translate(${(((t * 260) % (L.w + 1800)) - 200).toFixed(1)},0) rotate(14)`));
  return { L, set: t => ups.forEach(f => f(t)) };
}
function tag(parent, text, color) { return el('div', { class: 'abs' }, parent, `<div style="display:inline-flex;align-items:center;gap:14px;font:800 36px/1 'Barlow Condensed';letter-spacing:.12em;color:#fff;background:rgba(10,10,12,.72);padding:12px 22px 12px 14px;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.3)"><span style="width:10px;height:40px;background:${color || TT().gold};border-radius:3px"></span>${text}</div>`); }
const src = (parent, text) => { const e = el('div', { class: 'abs' }, parent, text); e.style.cssText += "font:600 22px/1 Barlow;color:rgba(255,255,255,.62);white-space:nowrap"; return e; };
const once = (s, list) => { if (!s.__c) { s.__c = 1; list.filter(Boolean).forEach(c => cue(...c)); } };
const acc = () => isM() ? TT().gold : TT().green;
const hl = (u, html, size = 84) => C.highlight(u, html, { size, mark: acc(), markInk: DARK() });
const T = {};
const tr = (o, d) => Object.assign({ in: d || 'zoom', tin: .35 }, o.tr || {});

/** split-flap chapter title: {kicker, lines:[..], icon, flag, sub} */
T.flapTitle = (a, b, o) => shot(a, b + .35, ({ root, world }) => { const w = world(); const g = bg(w, { glyphs: o.glyphs || (isM() ? ['R'] : null) }); const u = C.ui(root); const us = uiSvg(u);
  const fl = (o.lines || []).map((l, i) => C.flapText(u, l, { size: i ? 110 : 130, accent: i === (o.accentLine ?? -1) }));
  const k = o.kicker ? tag(u, o.kicker) : null; const ic = o.icon ? C.icon(us.svg, us.defs, o.icon, { r: 60, bg: acc(), fg: DARK() }) : null; const fg = o.flag ? C.flag(us.svg, us.defs, o.flag, { r: 52 }) : null;
  const sub = o.sub ? hl(u, o.sub, 56) : null; const sp = C.sparkles(us.svg, { n: 14, color: acc(), area: [300, 200, 1320, 600] }); return { w, g, fl, k, ic, fg, sub, sp };
}, (s, lt, t) => { s.g.set(t); s.sp(t); const n = s.fl.length; const fast = b - a < 2.6; s.fl.forEach((f, i) => { f.set(t, a + .1 + i * (fast ? .18 : .35), fast ? .028 : .045); P(f.el, { x: 960, y: 540 - (n - 1) * 85 + i * 170 });
    // keep the headline alive: a slow 3D tilt and a glint that runs along the letters (motion v3)
    f.el.style.transform += ` perspective(1400px) rotateY(${(Math.sin(t * .55 + i * 1.3) * 7).toFixed(2)}deg) rotateX(${(Math.cos(t * .45 + i) * 5).toFixed(2)}deg)`;
    const kids = f.el.children, ph = ((t - a) * .5 + i * .18) % 1.8 - .4; for (let j = 0; j < kids.length; j++) { const d = j / Math.max(1, kids.length - 1) - ph; const bump = Math.exp(-d * d * 50); kids[j].style.filter = bump > .03 ? `brightness(${(1 + .7 * bump).toFixed(3)})` : ''; } });
  if (s.k) P(s.k, { x: 960, y: 200, o: prog(t, a + .1, a + .4) }); const wMax = Math.max(...(o.lines || ['']).map((l, i) => l.length * (i ? 110 : 130) * .82)); const icx = Math.max(110, Math.min(300, 960 - wMax / 2 - 110));
  if (s.ic) { pop(s.ic.g, icx, 540 - (n - 1) * 85, t, a + .2, { spin: -30 }); s.ic.draw(prog(t, a + .2, a + .8)); }
  if (s.fg) pop(s.fg, 1920 - icx, 540 - (n - 1) * 85, t, a + .4, { spin: 30 }); if (s.sub) { s.sub.set(t, (o.subAt || a + .9)); P(s.sub.el, { x: 960, y: 540 + (n - 1) * 85 + 170, o: prog(t, (o.subAt || a + .9) - .3, (o.subAt || a + .9)) }); }
  s.w.camera({ zoom: 1 + (t - a) * .03, rot: lerp(-1, .6, prog(t, a, b)) }); once(s, [[a + .15, 'flaps', .6], o.icon && [a + .2, 'pop', .4], o.flag && [a + .4, 'pop', .4]]);
}, tr(o, 'bands'));

/** big counting number: {value, prefix, suffix, dec, label, icon, flag, src, at, dur, title, kicker} */
T.stat = (a, b, o) => shot(a, b + .35, ({ root, world }) => { const w = world(); const g = bg(w, { glyphs: o.glyphs }); const u = C.ui(root); const us = uiSvg(u);
  const digits = Math.max(1, Math.floor(Math.log10(Math.max(1, o.value))) + 1); const od = C.odometer(u, { digits, size: o.size || 200, color: acc(), prefix: o.prefix || '' });
  const suf = o.suffix ? el('div', { class: 'abs' }, u, o.suffix) : null; if (suf) suf.style.cssText += `font:800 ${(o.size || 200) * .5}px/1 'Barlow Condensed';color:${acc()};white-space:nowrap`;
  const lab = el('div', { class: 'abs' }, u, o.label || ''); lab.style.cssText += "font:800 56px/1 'Barlow Condensed';letter-spacing:.2em;color:#fff;white-space:nowrap";
  const ic = o.icon ? C.icon(us.svg, us.defs, o.icon, { r: 64, bg: acc(), fg: DARK() }) : null; const fg = o.flag ? C.flag(us.svg, us.defs, o.flag, { r: 46 }) : null;
  const qm = (o.at ?? a + .3) > a + .6 ? el('div', { class: 'abs' }, u, '?') : null; if (qm) qm.style.cssText += `font:800 ${(o.size || 200) * 1.35}px/1 'Barlow Condensed';color:${acc()};text-shadow:0 0 40px ${acc()}66`;
  const br = C.burst(us.svg, 960, 470, { n: 16, r0: 260, r1: 480, color: acc(), width: 4 }); const ti = o.title ? hl(u, o.title, 64) : null; const sr = o.src ? src(u, o.src) : null; const k = o.kicker ? tag(u, o.kicker) : null;
  return { w, g, od, suf, lab, ic, fg, br, ti, sr, k, digits, qm };
}, (s, lt, t) => { s.g.set(t); const at = o.at ?? a + .3, dur = o.dur ?? 1.4; const q = E.outE(prog(t, at, at + dur)); const v = (o.from || 0) + (o.value - (o.from || 0)) * q;
  s.od.set(o.dec ? v * Math.pow(10, o.dec) : v); P(s.od.el, { x: 960, y: 480, o: prog(t, at - .1, at + .1), s: 1 + .04 * Math.max(0, 1 - Math.abs(t - at - dur) * 4) });
  // until the number is spoken, a pulsing "?" holds its place (anticipation, and no made-up number is ever on screen)
  if (s.qm) { const vis = prog(t, a + .1, a + .35) * (1 - prog(t, at - .15, at + .05)); P(s.qm, { x: 960, y: 480, o: vis, s: 1 + .06 * Math.sin(t * 5), blur: (1 - vis) * 6 }); }
  if (o.dec) s.od.el.style.letterSpacing = '0'; if (s.suf) P(s.suf, { x: 960 + (s.digits + 1.5) * (o.size || 200) * .3 + 40, y: 510, o: prog(t, at + dur * .6, at + dur) });
  P(s.lab, { x: 960, y: 640, o: s.qm ? E.outC(prog(t, a + .3, a + .7)) : E.outC(prog(t, at + .2, at + .6)) }); s.br(prog(t, at + dur - .1, at + dur + .8));
  if (s.ic) { pop(s.ic.g, 960, 250, t, a + .15); s.ic.draw(prog(t, a + .15, a + .7)); } if (s.fg) pop(s.fg, 1080, 205, t, a + .35); if (s.ti) { s.ti.set(t, o.titleAt || at + .4); P(s.ti.el, { x: 960, y: 800, o: prog(t, a, a + .3) }); }
  if (s.k) P(s.k, { x: 960, y: 130, o: prog(t, a, a + .3) }); if (s.sr) P(s.sr, { x: 960, y: 1030, o: prog(t, at + .5, at + 1) });
  s.w.camera({ zoom: 1.02 + (t - a) * .02, rot: noise1(t * .2, 3) * .3 }); once(s, [[a, 'swish', .4], [at, 'riser', .25], [at + dur, 'impact', .35], o.icon && [a + .15, 'pop', .4]]);
}, tr(o));

/** from -> to comparison with arrow: {title, left:{value,label,prefix,at}, right:{...}, icon} */
/** from one number to another on two big cards that flip over as each number is spoken (motion v3, 12 Nov 2026: the old
 *  version left two small numbers on a mostly empty frame). Options as before: {title, titleAt, left:{value,label,at,prefix},
 *  right:{...}, iconL, iconR, mult, multAt} */
T.fromTo = (a, b, o) => shot(a, b + .35, ({ root, world }) => { const w = world(); const g = bg(w, {}); const u = C.ui(root); const us = uiSvg(u);
  const CW = 540, CH = 500;
  const card = (hot) => { const c = C.card3d(u, CW, CH, { persp: 1600, sheenA: .22 }); const S = c.svg, D = c.defs;
    sv('rect', { x: 0, y: 0, width: CW, height: CH, rx: 36, fill: C.grad(D, hot ? [[0, C.lt(acc(), .12)], [1, C.dk(acc(), .18)]] : [[0, '#ffffff'], [1, '#dfe7e3']], { x1: 0, y1: 0, x2: .4, y2: 1 }) }, S);
    sv('rect', { x: 10, y: 10, width: CW - 20, height: CH - 20, rx: 28, fill: 'none', stroke: hot ? '#ffffff' : acc(), 'stroke-width': 3, opacity: .35 }, S);
    const back = sv('g', {}, S); sv('rect', { x: 0, y: 0, width: CW, height: CH, rx: 36, fill: C.grad(D, [[0, C.lt(DARK(), .1)], [1, C.dk(DARK(), .2)]], { x1: 0, y1: 0, x2: .4, y2: 1 }) }, back);
    sv('rect', { x: 10, y: 10, width: CW - 20, height: CH - 20, rx: 28, fill: 'none', stroke: acc(), 'stroke-width': 3, opacity: .45 }, back);
    const qm = C.T(back, '?', { x: CW / 2, y: CH / 2, 'font-size': 240, fill: acc(), 'font-family': 'Barlow Condensed', 'font-weight': 800 }); qm.setAttribute('transform', `translate(${CW},0) scale(-1,1)`);
    return { c, back }; };
  const cL = card(false), cR = card(true);
  const mk = side => { const d = Math.max(1, Math.floor(Math.log10(Math.max(1, side.value))) + 1); const od = C.odometer(u, { digits: d, size: 160, color: DARK(), prefix: side.prefix || '' }); const l = el('div', { class: 'abs' }, u, side.label); l.style.cssText += `font:800 34px/1.15 'Barlow Condensed';letter-spacing:.06em;color:${DARK()};white-space:nowrap;text-align:center`; return { od, l }; };
  const L = mk(o.left), R = mk(o.right); const top = uiSvg(u); /* icons above the cards (top), the arrow between them */ const arrow = sv('g', {}, us.svg); sv('path', { d: 'M -60 0 L 50 0 M 15 -38 L 58 0 L 15 38', stroke: acc(), 'stroke-width': 16, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, arrow);
  const ti = o.title ? hl(u, o.title, 72) : null; const mult = o.mult ? el('div', { class: 'abs' }, u, o.mult) : null; if (mult) mult.style.cssText += `font:800 54px/1 'Barlow Condensed';color:${DARK()};background:${acc()};padding:10px 20px;border-radius:12px`;
  const icL = C.icon(top.svg, top.defs, o.iconL || 'clock', { r: 44, bg: DARK(), fg: '#fff' }), icR = C.icon(top.svg, top.defs, o.iconR || o.iconL || 'clock', { r: 44, bg: DARK(), fg: acc() });
  return { w, g, L, R, cL, cR, arrow, ti, mult, icL, icR };
}, (s, lt, t) => { s.g.set(t); const la = Math.max(o.left.at ?? a + .2, a + .3), ra = Math.max(o.right.at ?? a + 1.2, la + .4); const yc = 560;
  const side = (cd, sd, ic, x, at, i, val, dur) => { const ent = E.outC(prog(t, a + .05 + i * .12, a + .5 + i * .12)); const q = E.outB(prog(t, at - .15, at + .45)); const ry0 = 180 * (1 - q); const bob = Math.sin(t * 1.1 + i * 2) * 10; const lift = Math.sin(Math.PI * clamp(prog(t, at - .15, at + .45))) * 30;
    cd.back.setAttribute('opacity', ry0 > 90 ? 1 : 0); cd.c.set({ x, y: yc + (1 - ent) * 160 + bob - lift, ry: ry0 + Math.sin(t * .7 + i) * 5, rx: Math.cos(t * .6 + i) * 3, rz: Math.sin(t * .5 + i) * 1, s: .96 + .04 * ent, o: clamp(ent * 1.6) });
    const fo = clamp((q - .5) * 3); sd.od.set(val * E.outE(prog(t, at, at + dur))); P(sd.od.el, { x, y: yc + 10 + bob - lift, o: fo }); P(sd.l, { x, y: yc + 135 + bob - lift, o: fo }); pop(ic.g, x, yc - 150 + bob - lift, t, at + .1, { s: 1, idle: 0 }); ic.draw(prog(t, at + .1, at + .6)); };
  side(s.cL, s.L, s.icL, 500, la, 0, o.left.value, .9); side(s.cR, s.R, s.icR, 1420, ra, 1, o.right.value, 1.3);
  pop(s.arrow, 960 + Math.sin(t * 3) * 8, yc, t, ra - .3, { s: 1.2, idle: 0 });
  if (s.ti) { s.ti.set(t, o.titleAt || ra + .5); P(s.ti.el, { x: 960, y: 150, o: prog(t, a, a + .3) }); } if (s.mult) P(s.mult, { x: 960, y: 900, o: E.outC(prog(t, o.multAt || ra + 1, (o.multAt || ra + 1) + .3)), s: E.outB(prog(t, o.multAt || ra + 1, (o.multAt || ra + 1) + .4)) });
  s.w.camera({ zoom: 1.03 + (t - a) * .015 }); once(s, [[a, 'swish', .4], [la, 'pop', .4], [ra - .3, 'swoosh_up', .35], [ra + 1.3, 'thud', .45], o.mult && [o.multAt || ra + 1, 'pop', .45]]);
}, tr(o));

/** animated bars: {title, items:[{label, value, at, color, icon, flag}], fmt, max, src} */
T.bars = (a, b, o) => shot(a, b + .35, ({ root, world }) => { const w = world(); const g = bg(w, {}); const L = w.layer(1, { w: 1920, h: 1080 }); const n = o.items.length; const m = o.max || Math.max(...o.items.map(i => i.value));
  const bw = Math.min(220, 1300 / n * .6); const x0 = 960 - (n - 1) * 1300 / n / 2; const base = 880, H = 560;
  const bars = o.items.map((it, i) => { const x = x0 + i * 1300 / n; const gg = sv('g', {}, L.svg); const c = it.color || acc();
    const r = sv('rect', { x: x - bw / 2, y: base, width: bw, height: 0, rx: 14, fill: C.grad(L.defs, [[0, C.lt(c, .25)], [1, C.dk(c, .25)]]) }, gg); const lab = C.T(gg, it.label, { x, y: base + 50, 'font-size': 34, fill: '#fff', 'font-family': 'Barlow', 'font-weight': 700 });
    const val = C.T(gg, '', { x, 'font-size': 58, fill: c }); const badge = it.flag ? C.flag(gg, L.defs, it.flag, { r: 36 }) : it.icon ? C.icon(gg, L.defs, it.icon, { r: 36, bg: c, fg: DARK() }) : null; if (badge && badge.draw) badge.draw(1); return { x, r, val, badge: badge && (badge.g || badge), it, c }; });
  sv('line', { x1: x0 - bw, y1: base, x2: x0 + (n - 1) * 1300 / n + bw, y2: base, stroke: '#fff', 'stroke-width': 3, opacity: .4 }, L.svg);
  const u = C.ui(root); const ti = o.title ? hl(u, o.title, 70) : null; const sr = o.src ? src(u, o.src) : null; return { w, g, bars, ti, sr, base, H, m };
}, (s, lt, t) => { s.g.set(t); s.bars.forEach((b2, i) => { const at = b2.it.at ?? a + .3 + i * .25; const q = E.outB(prog(t, at, at + .7)); const h = s.H * b2.it.value / s.m * q;
    b2.r.setAttribute('y', s.base - h); b2.r.setAttribute('height', Math.max(0, h)); b2.val.textContent = (o.fmt || (v => Math.round(v)))(b2.it.value * clamp(q)); b2.val.setAttribute('transform', `translate(0,${s.base - h - 34})`); b2.val.setAttribute('opacity', clamp(q * 2));
    if (b2.badge) pop(b2.badge, b2.x, s.base - h - 110, t, at + .2); });
  if (s.ti) { s.ti.set(t, o.titleAt || a + .5); P(s.ti.el, { x: 960, y: 130, o: prog(t, a, a + .3) }); } if (s.sr) P(s.sr, { x: 960, y: 1040, o: prog(t, a + .5, a + 1) });
  s.w.camera({ zoom: 1.04 - (t - a) * .01, y: lerp(30, 0, prog(t, a, b)) }); once(s, [[a, 'swish', .4], ...o.items.map((it, i) => [it.at ?? a + .3 + i * .25, 'pop', .4])]);
}, tr(o));

/** big 3D cards, one per point, flipping in on the spoken words and floating with a light sheen (v3, 11 Nov 2026:
 *  replaces the small row of round icons, which looked sparse and static). Same options as before:
 *  {title, titleAt, items:[{icon | flag, label, at}], kicker, glyphs}. o.style = 'row' brings back the old look. */
T.icons = (a, b, o) => o.style === 'row' ? T.iconRow(a, b, o) : shot(a, b + .35, ({ root, world }) => { const w = world(); const g = bg(w, { glyphs: o.glyphs }); const u = C.ui(root); const n = o.items.length;
  const cw = Math.min(420, Math.floor(1560 / n) - 70), ch = Math.round(cw * 1.16); const gap = Math.min(cw + 90, 1700 / n);
  const wrap = (s, k) => { const ws = String(s).split(' '); const ls = []; let cur = ''; ws.forEach(x => { if ((cur + ' ' + x).trim().length > k && cur) { ls.push(cur); cur = x; } else cur = (cur + ' ' + x).trim(); }); if (cur) ls.push(cur); return ls.slice(0, 3); };
  const cards = o.items.map((it, i) => { const card = C.card3d(u, cw, ch, { persp: 1600, sheenA: .3 }); const hot = i % 2 === 0; const S = card.svg, D = card.defs;
    sv('rect', { x: 0, y: 0, width: cw, height: ch, rx: 34, fill: C.grad(D, hot ? [[0, C.lt(acc(), .12)], [1, C.dk(acc(), .18)]] : [[0, '#ffffff'], [1, '#dfe7e3']], { x1: 0, y1: 0, x2: .4, y2: 1 }) }, S);
    sv('rect', { x: 10, y: 10, width: cw - 20, height: ch - 20, rx: 26, fill: 'none', stroke: hot ? '#ffffff' : acc(), 'stroke-width': 3, opacity: .35 }, S);
    for (let k = 0; k < 5; k++) sv('circle', { cx: cw * (.15 + .18 * k), cy: ch * .12 + (k % 2) * 14, r: 3, fill: hot ? '#ffffff' : DARK(), opacity: .18 }, S);
    const ic = it.flag ? { g: C.flag(S, D, it.flag, { r: cw * .22 }), draw() {} } : C.icon(S, D, it.icon, { r: cw * .22, bg: hot ? DARK() : acc(), fg: hot ? acc() : DARK() });
    ic.g.setAttribute('transform', `translate(${cw / 2},${ch * .36})`);
    // the back of the card (seen until it flips on its word): a question mark in the accent colour, mirrored so it reads right
    const back = sv('g', {}, S); sv('rect', { x: 0, y: 0, width: cw, height: ch, rx: 34, fill: C.grad(D, [[0, C.lt(DARK(), .1)], [1, C.dk(DARK(), .2)]], { x1: 0, y1: 0, x2: .4, y2: 1 }) }, back);
    sv('rect', { x: 10, y: 10, width: cw - 20, height: ch - 20, rx: 26, fill: 'none', stroke: acc(), 'stroke-width': 3, opacity: .45 }, back);
    const qm = C.T(back, '?', { x: cw / 2, y: ch / 2, 'font-size': cw * .5, fill: acc(), 'font-family': 'Barlow Condensed', 'font-weight': 800 }); qm.setAttribute('transform', `translate(${cw},0) scale(-1,1)`);
    const ls = wrap(it.label, cw > 330 ? 15 : 12); const fs = Math.min(54, cw * .13); ls.forEach((l, j) => C.T(S, l, { x: cw / 2, y: ch * .72 + (j - (ls.length - 1) / 2) * fs * 1.08, 'font-size': fs, fill: hot ? DARK() : '#0f1f19', 'font-family': 'Barlow Condensed', 'font-weight': 800, 'letter-spacing': 1 }));
    S.appendChild(back); return { card, ic, it, i, back }; });
  const ti = o.title ? hl(u, o.title, 72) : null; const k = o.kicker ? tag(u, o.kicker) : null; return { w, g, cards, ti, k, ch, gap };
}, (s, lt, t) => { s.g.set(t); const yc = s.ti || s.k ? 600 : 540;
  // every card is on screen from the start, face down; each flips face-up on its spoken word (anticipation, a full frame)
  const n2 = s.cards.length; s.cards.forEach(c => { c.x = 960 + (c.i - (n2 - 1) / 2) * s.gap; });
  s.cards.forEach((c, i) => { const at = Math.max(c.it.at ?? a + .3 + i * .3, a + .35 + i * .12); const ae = a + .05 + i * .1; const qo = E.outC(prog(t, ae, ae + .45)); const q = E.outB(prog(t, at, at + .6)); const ph = i * 1.9;
    const ry0 = 180 * (1 - q); c.back.setAttribute('opacity', ry0 > 90 ? 1 : 0);
    c.card.set({ x: c.x + Math.sin(t * .6 + ph) * 10, y: yc + (1 - qo) * 160 + Math.sin(t * 1.1 + ph) * 12 - Math.sin(Math.PI * clamp(prog(t, at, at + .6))) * 40, ry: ry0 + Math.sin(t * .7 + ph) * 9, rx: Math.cos(t * .8 + ph) * 6, rz: Math.sin(t * .5 + ph) * 1.6, s: lerp(.8, 1, qo) * (1 + .06 * Math.sin(Math.PI * clamp(prog(t, at, at + .6)))), o: clamp(qo * 1.6), light: (((t - at) * .32 + i * .3) % 1.7) - .35 });
    c.ic.draw(prog(t, at + .1, at + .6)); });
  if (s.ti) { s.ti.set(t, o.titleAt || a + .5); P(s.ti.el, { x: 960, y: 150, o: prog(t, a, a + .3) }); } if (s.k) P(s.k, { x: 960, y: 80, o: prog(t, a, a + .3) });
  s.w.camera({ zoom: 1.02 + (t - a) * .02 }); once(s, [[a, 'swish', .35], ...s.cards.map((c, i) => [c.it.at ?? a + .3 + i * .3, 'pop', .45])]);
}, tr(o));

/** the original row of icon badges (kept for o.style = 'row') */
T.iconRow = (a, b, o) => shot(a, b + .35, ({ root, world }) => { const w = world(); const g = bg(w, { glyphs: o.glyphs }); const u = C.ui(root); const us = uiSvg(u); const n = o.items.length;
  const its = o.items.map((it, i) => { const ic = it.flag ? { g: C.flag(us.svg, us.defs, it.flag, { r: 84 }), draw() {} } : C.icon(us.svg, us.defs, it.icon, { r: 84, bg: i % 2 ? '#fff' : acc(), fg: DARK() });
    const l = el('div', { class: 'abs' }, u, it.label); l.style.cssText += "font:800 44px/1.1 'Barlow Condensed';letter-spacing:.06em;color:#fff;text-align:center;width:330px;white-space:normal"; return { ic, l, it, x: 960 + (i - (n - 1) / 2) * Math.min(400, 1600 / n) }; });
  const ti = o.title ? hl(u, o.title, 72) : null; const k = o.kicker ? tag(u, o.kicker) : null; return { w, g, its, ti, k };
}, (s, lt, t) => { s.g.set(t); s.its.forEach((it, i) => { const at = it.it.at ?? a + .3 + i * .3; pop(it.ic.g, it.x, 500 + Math.sin(t * 1.5 + i) * 6, t, at, { spin: -20 }); it.ic.draw(prog(t, at, at + .5)); P(it.l, { x: it.x, y: 680, o: E.outC(prog(t, at + .1, at + .4)) }); });
  if (s.ti) { s.ti.set(t, o.titleAt || a + .5); P(s.ti.el, { x: 960, y: 200, o: prog(t, a, a + .3) }); } if (s.k) P(s.k, { x: 960, y: 110, o: prog(t, a, a + .3) });
  s.w.camera({ zoom: 1.02 + (t - a) * .02 }); once(s, [[a, 'swish', .35], ...s.its.map((it, i) => [it.it.at ?? a + .3 + i * .3, 'pop', .45])]);
}, tr(o));

/** numbered steps appearing one by one: {title, items:[{text, at, icon}], start=1} */
T.steps = (a, b, o) => shot(a, b + .35, ({ root, world }) => { const w = world(); const g = bg(w, {}); const u = C.ui(root); const us = uiSvg(u);
  const rows = o.items.map((it, i) => { const e = el('div', { class: 'abs' }, u, `<div style="display:flex;align-items:center;gap:26px;width:1300px"><div style="flex:none;width:96px;height:96px;border-radius:24px;background:${acc()};color:${DARK()};display:grid;place-items:center;font:800 62px/1 'Barlow Condensed'">${(o.start || 1) + i}</div><div style="font:700 46px/1.15 Barlow;color:#fff">${it.text}</div></div>`); const ic = it.icon ? C.icon(us.svg, us.defs, it.icon, { r: 44, bg: '#fff', fg: DARK() }) : null; return { e, ic, it }; });
  const ti = o.title ? hl(u, o.title, 70) : null; return { w, g, rows, ti };
}, (s, lt, t) => { s.g.set(t); const n = s.rows.length; const gap = Math.min(150, 760 / n); s.rows.forEach((r, i) => { const at = r.it.at ?? a + .3 + i * .5; const q = E.outC(prog(t, at, at + .4)); const active = i === s.rows.reduce((k, rr, j) => t >= (rr.it.at ?? a + .3 + j * .5) ? j : k, -1);
    P(r.e, { x: 280 + (1 - q) * -80, y: 300 + i * gap, anchor: 'tl', o: q * (active ? 1 : .55) }); r.e.style.transform += ' translateY(-50%)'; if (r.ic) { pop(r.ic.g, 1700, 300 + i * gap, t, at + .1); r.ic.draw(prog(t, at + .1, at + .5)); } });
  if (s.ti) { s.ti.set(t, o.titleAt || a + .5); P(s.ti.el, { x: 960, y: 140, o: prog(t, a, a + .3) }); }
  s.w.camera({ zoom: 1.02 + (t - a) * .01 }); once(s, [[a, 'swish', .35], ...o.items.map((it, i) => [it.at ?? a + .3 + i * .5, 'pop', .4])]);
}, tr(o, 'fade'));

/** fee receipt printing line by line: {title, lines:[{label, amount, at}], total:{label, amount, at}, person, sub} */
T.receipt = (a, b, o) => shot(a, b + .35, ({ root, world }) => { const w = world(); const g = bg(w, {}); const L = w.layer(1, { w: 1920, h: 1080 });
  const p = o.person ? new C.Person(L.svg, L.defs, o.person) : null; const hg0 = 120 + (o.lines.length + 1.6) * 64; const slip = C.slip(L.svg, L.defs, { w: 640, title: o.title || 'RECEIPT', lines: Array(Math.ceil((hg0 - 80) / 42)).fill(['']) });
  const u = C.ui(root); const rows = o.lines.map(l => { const e = el('div', { class: 'abs' }, u, `<div style="display:flex;justify-content:space-between;width:560px;font:600 38px/1 'JetBrains Mono',monospace;color:#262626"><span>${l.label}</span><span>${l.amount}</span></div>`); return { e, l }; });
  const tot = o.total ? el('div', { class: 'abs' }, u, `<div style="display:flex;justify-content:space-between;width:560px;font:800 50px/1 'Barlow Condensed';color:#111;border-top:4px dashed #333;padding-top:16px"><span>${o.total.label}</span><span>${o.total.amount}</span></div>`) : null;
  const sub = o.sub ? hl(u, o.sub, 60) : null; return { w, g, p, slip, rows, tot, sub };
}, (s, lt, t) => { s.g.set(t); const n = s.rows.length; const hgt = 120 + (n + 1.6) * 64; const x = o.person ? 1180 : 960;
  s.slip.g.setAttribute('transform', `translate(${x},${120})`); const rev = E.ioS(prog(t, a, (o.total?.at ?? b) + .4)); s.slip.setReveal(1); s.slip.g.style.clipPath = `inset(0 0 ${(100 - rev * 100).toFixed(1)}% 0)`;
  s.rows.forEach((r, i) => P(r.e, { x: x - 280, y: 230 + i * 64, anchor: 'tl', o: E.outC(prog(t, r.l.at, r.l.at + .3)) }));
  if (s.tot) P(s.tot, { x: x - 280, y: 230 + n * 64 + 20, anchor: 'tl', o: E.outC(prog(t, o.total.at, o.total.at + .3)) });
  if (s.p) s.p.set(t, { x: 420, y: 1060, s: 1.15, pose: o.pose || 'phone', expr: o.expr || 'worried', turn: .3, gesture: .2 });
  if (s.sub) { s.sub.set(t, o.subAt || b - 1); P(s.sub.el, { x: 960, y: 1000, o: prog(t, (o.subAt || b - 1) - .3, o.subAt || b - 1) }); }
  s.w.camera({ zoom: 1.03 + (t - a) * .01, x: lerp(-20, 20, prog(t, a, b)) }); once(s, [[a, 'print', .45], ...o.lines.map(l => [l.at, 'tick', .4]), o.total && [o.total.at, 'cash', .45]]);
}, tr(o));

/** a character on a moving backdrop with a headline and icon pops: {char, pose (or keys), expr, title, titleAt, icons:[{icon, at, label}], side:'left'} */
T.person = (a, b, o) => shot(a, b + .35, ({ root, world }) => { const w = world(); const g = bg(w, { glyphs: o.glyphs }); const L = w.layer(1, { w: 1920, h: 1080 }); const p = new C.Person(L.svg, L.defs, o.char);
  const held = o.hold ? C.phone(L.svg, L.defs, { w: 64, h: 128, screenFn: (gg, w2, h2) => sv('rect', { width: w2, height: h2, fill: acc() }, gg) }) : null; if (held) p.hold(1, held.g, { x: -4, y: 8, upright: true });
  const u = C.ui(root); const us = uiSvg(u); const ti = o.title ? hl(u, o.title, o.titleSize || 72) : null;
  const ics = (o.icons || []).map((it, i) => ({ ic: it.flag ? { g: C.flag(us.svg, us.defs, it.flag, { r: 54 }), draw() {} } : C.icon(us.svg, us.defs, it.icon, { r: 54, bg: i % 2 ? '#fff' : acc(), fg: DARK() }), it, lab: it.label ? (() => { const e = el('div', { class: 'abs' }, u, it.label); e.style.cssText += "font:800 36px/1 'Barlow Condensed';letter-spacing:.06em;color:#fff;white-space:nowrap"; return e; })() : null }));
  return { w, g, p, ti, ics };
}, (s, lt, t) => { s.g.set(t); const right = o.side === 'right'; const px = right ? 1450 : 470;
  s.p.set(t, { x: px, y: 1080, s: o.scale || 1.3, pose: o.keys ? C.poseAt(t, o.keys) : (o.pose || 'present'), expr: typeof o.expr === 'function' ? o.expr(t) : (o.expr || 'smile'), turn: right ? -.3 : .3, gesture: o.gesture ?? .7, look: o.look });
  s.ics.forEach((c, i) => { const at = c.it.at ?? a + .5 + i * .4; const n = s.ics.length; const cx = right ? 220 : 980, cy = 560 - (n - 1) * 90 + i * 180; pop(c.ic.g, cx, cy, t, at, { spin: -20 }); c.ic.draw(prog(t, at, at + .5)); if (c.lab) { P(c.lab, { x: cx + 74, y: cy, anchor: 'tl', o: E.outC(prog(t, at + .1, at + .4)) }); c.lab.style.transform += ' translateY(-50%)'; } });
  if (s.ti) { s.ti.set(t, o.titleAt || a + .6); P(s.ti.el, { x: right ? 760 : 1160, y: 170, o: prog(t, a, a + .3) }); }
  s.w.camera({ x: lerp(-30, 30, prog(t, a, b)), zoom: lerp(1.08, 1.02, prog(t, a, b)), focus: 1, dof: .4 }); once(s, [[a, 'swish', .35], ...(o.icons || []).map((it, i) => [it.at ?? a + .5 + i * .4, 'pop', .4])]);
}, tr(o, 'whip'));

/** map of a country with pins popping and labelled cities: {iso:'ZAF', title, pins:{n, at, dur, color}, labels:[{lon, lat, text, at}], flag, kicker} */
T.map = (a, b, o) => shot(a, b + .35, ({ root, world }) => { const w = world(); const g = bg(w, {}); const L = w.layer(1, { w: 1920, h: 1080 }); const iso = o.iso || 'ZAF';
  const map = C.africaMap(L.svg, L.defs, isM() ? { land: '#2a2a30', stroke: '#3a3a41' } : { land: '#1d4d3c', stroke: '#3f7f63' }); G(map.g, 455, 30); map.highlight(iso, acc(), .3);
  const bb = map.A[iso].b; const R = C.rnd(o.seed || 7); const pins = []; let tries = 0; while (pins.length < (o.pins?.n || 0) && tries++ < 6000) { const x = bb[0] + R() * (bb[2] - bb[0]), y = bb[1] + R() * (bb[3] - bb[1]); if (!C.inCountry(iso, x, y)) continue; const pg = sv('g', {}, map.top); sv('circle', { r: 4.5, fill: o.pins.color || acc(), stroke: '#111', 'stroke-width': 1 }, pg); pins.push({ pg, x, y, d: R() }); }
  const labs = (o.labels || []).map(l => { const p = map.proj(l.lon, l.lat); const pu = map.pin(p, { color: acc(), label: l.text, size: 12 }); return { pu, l }; });
  const cx = pins.length ? pins.reduce((s2, q) => s2 + q.x, 0) / pins.length : (bb[0] + bb[2]) / 2, cy = pins.length ? pins.reduce((s2, q) => s2 + q.y, 0) / pins.length : (bb[1] + bb[3]) / 2;
  const u = C.ui(root); const us = uiSvg(u); const ti = o.title ? hl(u, o.title, 64) : null; const fg = o.flag ? C.flag(us.svg, us.defs, o.flag, { r: 46 }) : null; const k = o.kicker ? tag(u, o.kicker) : null;
  const cnt = o.count ? C.odometer(u, { digits: String(o.count.value).length, size: 120, color: acc() }) : null; const cl = o.count ? el('div', { class: 'abs' }, u, o.count.label) : null; if (cl) cl.style.cssText += "font:800 40px/1 'Barlow Condensed';letter-spacing:.18em;color:#fff;white-space:nowrap";
  return { w, g, pins, labs, cx, cy, ti, fg, k, cnt, cl };
}, (s, lt, t) => { s.g.set(t); const pa = o.pins?.at ?? a + .3, pd = o.pins?.dur ?? 1.2; s.pins.forEach(p => { const q = E.outB(prog(t, pa + p.d * pd, pa + p.d * pd + .3)); p.pg.setAttribute('transform', `translate(${p.x},${p.y}) scale(${Math.max(.001, q)})`); });
  s.labs.forEach(l => { l.pu(t); }); const z = kf(t, [[a, o.z0 || 2.6], [b, o.z1 || 3.6]], E.ioC); s.w.camera({ x: s.cx - 505 + (o.dx || 0), y: s.cy - 510 + (o.dy || 0), zoom: z, rot: lerp(-1.5, 1, prog(t, a, b)) });
  if (s.ti) { s.ti.set(t, o.titleAt || a + .5); P(s.ti.el, { x: 960, y: 130, o: prog(t, a, a + .3) }); } if (s.fg) pop(s.fg, 140, 140, t, a + .2); if (s.k) P(s.k, { x: 960, y: 1000, o: prog(t, a + .2, a + .5) });
  if (s.cnt) { s.cnt.set(o.count.value * E.outE(prog(t, pa, pa + pd + .3))); P(s.cnt.el, { x: 1580, y: 520, o: prog(t, pa - .1, pa + .1) }); P(s.cl, { x: 1580, y: 620, o: prog(t, pa + .2, pa + .5) }); }
  if (!s.__c) { s.__c = 1; cue(a, 'whoosh_low', .5); for (let i = 0; i < 10; i++) cue(pa + i * pd / 10, 'tick', .3); }
}, tr(o, 'fade'));

/** timeline: {title, events:[{label, sub, at}], color} */
T.timeline = (a, b, o) => shot(a, b + .35, ({ root, world }) => { const w = world(); const g = bg(w, {}); const L = w.layer(1, { w: 1920, h: 1080 }); const n = o.events.length;
  const tl = C.timeline(L.svg, L.defs, { x: 220, y: 600, w: 1480, color: o.color || acc(), events: o.events.map((e, i) => ({ k: n === 1 ? .5 : .06 + i * .88 / (n - 1), label: e.label, sub: e.sub })) });
  const u = C.ui(root); const ti = o.title ? hl(u, o.title, 70) : null; return { w, g, tl, ti, n };
}, (s, lt, t) => { s.g.set(t); const ks = o.events.map((e, i) => [e.at, (s.n === 1 ? .5 : .06 + i * .88 / (s.n - 1)) + .02]); ks.unshift([a, 0]); s.tl.set(kf(t, ks, E.ioC));
  if (s.ti) { s.ti.set(t, o.titleAt || a + .5); P(s.ti.el, { x: 960, y: 150, o: prog(t, a, a + .3) }); } s.w.camera({ zoom: 1.04 - (t - a) * .006, x: lerp(-30, 30, prog(t, a, b)) });
  once(s, [[a, 'swish', .35], ...o.events.map(e => [e.at, 'pop', .4])]);
}, tr(o, 'bands'));

/** balance scale comparing two sides: {title, left:{label, coins}, right:{label, coins}, at} */
T.compare = (a, b, o) => shot(a, b + .35, ({ root, world }) => { const w = world(); const g = bg(w, {}); const L = w.layer(1, { w: 1920, h: 1080 }); const bl = C.balance(L.svg, L.defs, { w: 900, h: 560 }); G(bl.g, 960, 1010, 0, .9);
  const lc = C.coinPile(bl.left, L.defs, { n: o.left.coins || 16, r: 30, seed: 3 }), rc = C.coinPile(bl.right, L.defs, { n: o.right.coins || 8, r: 30, seed: 5 });
  const u = C.ui(root); const mk = txt => { const e = el('div', { class: 'abs' }, u, txt); e.style.cssText += "font:800 44px/1 'Barlow Condensed';letter-spacing:.1em;color:#fff;background:rgba(12,12,14,.72);padding:10px 18px;border-radius:10px;white-space:nowrap"; return e; };
  const ti = o.title ? hl(u, o.title, 80) : null; return { w, g, bl, lc, rc, l1: mk(o.left.label), l2: mk(o.right.label), ti };
}, (s, lt, t) => { s.g.set(t); const at = o.at ?? a + .8; const dir = (o.left.coins || 16) > (o.right.coins || 8) ? -1 : 1; const ang = dir * 13 * E.outB(prog(t, at, at + .7)) + Math.sin(t * 4) * .6; s.bl.set(ang);
  s.lc.setAttribute('opacity', prog(t, a + .1, a + .4)); s.rc.setAttribute('opacity', prog(t, at - .3, at)); const r = ang * Math.PI / 180;
  P(s.l1, { x: 960 - 405 * Math.cos(r), y: 806 - 405 * Math.sin(r), o: prog(t, a + .1, a + .4) }); P(s.l2, { x: 960 + 405 * Math.cos(r), y: 806 + 405 * Math.sin(r), o: prog(t, at - .3, at) });
  if (s.ti) { s.ti.set(t, o.titleAt || at); P(s.ti.el, { x: 960, y: 150, o: prog(t, a, a + .3) }); } s.w.camera({ zoom: lerp(1.06, 1, prog(t, a, b)) }); once(s, [[a, 'coins', .4], [at, 'thud', .5]]);
}, tr(o));

/** numbered trap / warning card: {n, title, sub, icon, at} */
T.trap = (a, b, o) => shot(a, b + .35, ({ root, world }) => { const w = world(); const g = bg(w, { warm: true }); const u = C.ui(root); const us = uiSvg(u); const red = TT().red;
  const num = el('div', { class: 'abs' }, u, `TRAP ${o.n}`); num.style.cssText += `font:800 64px/1 'Barlow Condensed';letter-spacing:.2em;color:${C.dk ? '#fff' : '#fff'};background:${red};padding:12px 28px;border-radius:12px`;
  const ti = el('div', { class: 'abs' }, u, o.title); ti.style.cssText += "font:800 104px/1.02 'Barlow Condensed';color:#fff;text-align:center;width:1500px;text-shadow:0 8px 30px rgba(0,0,0,.5)";
  const sub = o.sub ? el('div', { class: 'abs' }, u, o.sub) : null; if (sub) sub.style.cssText += "font:700 42px/1.25 Barlow;color:rgba(255,255,255,.82);text-align:center;width:1300px";
  const ic = C.icon(us.svg, us.defs, o.icon || 'cross', { r: 90, bg: red, fg: '#fff' }); const st = C.stampMark(us.svg, us.defs, 'AVOID', { color: red, size: 54, rot: -10 }); return { w, g, num, ti, sub, ic, st };
}, (s, lt, t) => { s.g.set(t); pop(s.ic.g, 960, 270, t, a + .1, { spin: -30 }); s.ic.draw(prog(t, a + .1, a + .6)); P(s.num, { x: 960, y: 420, o: E.outC(prog(t, a + .2, a + .5)), s: E.outB(prog(t, a + .2, a + .55)) });
  P(s.ti, { x: 960, y: 560, o: E.outC(prog(t, a + .35, a + .7)), y: 560 + (1 - E.outC(prog(t, a + .35, a + .8))) * 40 }); if (s.sub) P(s.sub, { x: 960, y: 760, o: E.outC(prog(t, (o.subAt || a + 1), (o.subAt || a + 1) + .4)) });
  G(s.st.g, 1560, 300); s.st.set(prog(t, o.stampAt || b - 1.2, (o.stampAt || b - 1.2) + .2));
  s.w.camera({ zoom: 1.02 + (t - a) * .02, rot: noise1(t * .3, 9) * .4 }); once(s, [[a, 'whoosh', .45], [a + .1, 'thud', .5], [o.stampAt || b - 1.2, 'stamp', .55]]);
}, tr(o, 'flash'));

/** crowd + counter: {value, label, src, at} */
T.crowd = (a, b, o) => shot(a, b + .35, ({ root, world }) => { const w = world(); const g = bg(w, {}); const L = w.layer(1, { w: 2600, h: 1500 }); const cr = C.crowd(L.svg, L.defs, { cols: 16, rows: 6, x: 1300, y: 900, dx: 150, dy: 80, s: .42, seed: o.seed || 9 });
  const u = C.ui(root); const od = C.odometer(u, { digits: String(Math.round(o.value)).length, size: 170, color: acc() }); const lab = el('div', { class: 'abs' }, u, o.label); lab.style.cssText += "font:800 52px/1 'Barlow Condensed';letter-spacing:.22em;color:#fff;white-space:nowrap";
  const sr = o.src ? src(u, o.src) : null; return { w, g, cr, od, lab, sr };
}, (s, lt, t) => { s.g.set(t); const at = o.at ?? a + .5; s.cr.set(t, prog(t, a, at + .8), { expr: 'smile' }); s.od.set(o.value * E.outE(prog(t, at, at + 1.6))); P(s.od.el, { x: 960, y: 140, o: prog(t, at - .1, at + .1) }); P(s.lab, { x: 960, y: 250, o: prog(t, at + .3, at + .7) });
  if (s.sr) P(s.sr, { x: 960, y: 1035, o: prog(t, at + .6, at + 1) }); s.w.camera({ zoom: kf(t, [[a, 1.9], [b, .95]], E.ioC), y: kf(t, [[a, 300], [b, 60]]) }); once(s, [[a, 'whoosh_low', .5], [at + .1, 'riser', .3], [at + 1.4, 'impact', .4]]);
}, tr(o));

/** quote card: {text (html with <mark>), who} */
T.quote = (a, b, o) => shot(a, b + .35, ({ root, world }) => { const w = world(); const g = bg(w, {}); const u = C.ui(root);
  const q = el('div', { class: 'abs' }, u, `<div style="font:800 280px/1 Georgia,serif;color:${acc()};opacity:.9;margin-bottom:-120px">“</div>`); const tx = hl(u, o.text, 76); const who = el('div', { class: 'abs' }, u, o.who || ''); who.style.cssText += "font:700 36px/1 Barlow;color:rgba(255,255,255,.75);white-space:nowrap";
  return { w, g, q, tx, who };
}, (s, lt, t) => { s.g.set(t); P(s.q, { x: 960, y: 330, o: prog(t, a, a + .3), s: E.outB(prog(t, a, a + .4)) }); s.tx.set(t, o.markAt || a + 1); P(s.tx.el, { x: 960, y: 520, o: prog(t, a + .2, a + .5) }); P(s.who, { x: 960, y: 660, o: prog(t, a + .6, a + 1) });
  s.w.camera({ zoom: 1.02 + (t - a) * .02 }); once(s, [[a, 'swish', .35], [o.markAt || a + 1, 'ding', .35]]);
}, tr(o, 'circle'));

/** end card for either channel */
T.endCard = (a, b, o = {}) => shot(a, b, ({ root, world }) => { const w = world(); const g = bg(w, { glyphs: isM() ? ['R'] : null }); const u = C.ui(root);
  const f = C.flapText(u, isM() ? 'MONEY FROM ZERO' : 'FLUXR EXPLAINS', { size: 110 }); const s1 = el('div', { class: 'abs' }, u, o.line || 'New Shorts every day, a full guide every week'); s1.style.cssText += "font:700 44px/1 Barlow;color:#fff;white-space:nowrap";
  const sub = C.subscribe(u, {}); const disc = o.disclaimer === false ? null : src(u, 'General information, not financial advice'); return { w, g, f, s1, sub, disc };
}, (s, lt, t) => { s.g.set(t); s.f.set(t, a + .1, .04); P(s.f.el, { x: 960, y: 380 }); P(s.s1, { x: 960, y: 560, o: E.outC(prog(t, a + .8, a + 1.2)) }); s.sub.set(t, a + 1.7); P(s.sub.el, { x: 960, y: 740, o: E.outC(prog(t, a + 1.1, a + 1.5)) }); if (s.disc) P(s.disc, { x: 960, y: 1030, o: prog(t, a + .5, a + .9) });
  once(s, [[a + .1, 'flaps', .6], [a + 2.45, 'click', .8], [a + 2.5, 'chime', .4]]);
}, { in: 'fade', tin: .4 });

C.T8 = T; C.tpl = { bg, tag, src, hl, uiSvg, once };
})();
