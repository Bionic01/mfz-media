/* CINE characters: rigged SVG people. Forward kinematics, pose blending, face rig, walk cycle.
   Local coords: origin on the ground between the feet, y up is negative. Adult height ~560 units at s=1.
   Angles: 0 = limb pointing straight down, +90 = pointing to screen-right, 180 = up. */
'use strict';
(() => {
const { sv, lerp, clamp, noise1, E, uid } = window.CINE;
const hex = c => { c = c.replace('#', ''); if (c.length === 3) c = [...c].map(x => x + x).join(''); return [0, 2, 4].map(i => parseInt(c.substr(i, 2), 16)); };
const toHex = a => '#' + a.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
const mix = (a, b, k) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => lerp(v, B[i], k))); };
const dk = (c, k = .2) => mix(c, '#140c10', k), lt = (c, k = .15) => mix(c, '#fff6e8', k);
window.CINE.mix = mix; window.CINE.dk = dk; window.CINE.lt = lt;

const SKIN = { deep: '#4a2c1d', dark: '#6b4128', brown: '#8a5636', medium: '#a8714a', tan: '#c98e62', light: '#e2b08a', pale: '#f0cdb0' };
const HAIR = { black: '#1d1716', dark: '#2e211c', brown: '#5a3a26', grey: '#9a948f', white: '#d9d4cf' };
const R = Math.PI / 180;
const dir = a => [Math.sin(a * R), Math.cos(a * R)];

// ---------------- poses ----------------
// lean/head in degrees (positive = clockwise). arm/leg = [upper angle, bend]. A = screen-left limb, B = screen-right limb.
const POSES = {
  // Elbow sign: for arm B (screen-right) a NEGATIVE bend brings the hand toward the body centre; for arm A a POSITIVE bend does.
  stand:     { lean: 0, head: 0, aA: [-8, 4], aB: [8, -4], lA: [-3, 0], lB: [3, 0] },
  relaxed:   { lean: -1, head: 3, aA: [-10, 10], aB: [6, -16], lA: [-5, 0], lB: [2, 0] },
  handsHips: { lean: 0, head: -2, aA: [-40, 84], aB: [40, -84], lA: [-6, 0], lB: [6, 0] },
  wave:      { lean: -2, head: 4, aA: [-8, 6], aB: [140, 34], lA: [-3, 0], lB: [3, 0] },
  point:     { lean: 3, head: 6, aA: [-10, 6], aB: [96, -4], lA: [-4, 0], lB: [4, 0] },
  pointUp:   { lean: -2, head: -6, aA: [-10, 6], aB: [150, -10], lA: [-3, 0], lB: [3, 0] },
  pointL:    { lean: -3, head: -6, aA: [-96, 4], aB: [10, -6], lA: [-4, 0], lB: [4, 0] },
  present:   { lean: 0, head: 4, aA: [-48, -30], aB: [66, 26], lA: [-4, 0], lB: [4, 0] },
  phone:     { lean: 2, head: 12, aA: [-6, 6], aB: [18, -142], lA: [-3, 0], lB: [3, 0], look: [-.2, .9] },
  phoneTwo:  { lean: 3, head: 14, aA: [-18, 142], aB: [18, -142], lA: [-3, 0], lB: [3, 0], look: [0, .9] },
  phoneEar:  { lean: -1, head: 8, aA: [-8, 6], aB: [58, 146], lA: [-3, 0], lB: [3, 0] },
  count:     { lean: 4, head: 14, aA: [-20, 128], aB: [20, -128], lA: [-3, 0], lB: [3, 0], look: [0, 1] },
  give:      { lean: 4, head: 2, aA: [-8, 6], aB: [74, -8], lA: [-3, 0], lB: [3, 0] },
  receive:   { lean: 2, head: 6, aA: [-50, 30], aB: [50, -30], lA: [-3, 0], lB: [3, 0] },
  shrug:     { lean: 0, head: -8, aA: [-55, -70], aB: [55, 70], lA: [-4, 0], lB: [4, 0], sh: -10 },
  think:     { lean: 1, head: -10, aA: [-10, 162], aB: [12, -100], lA: [-3, 0], lB: [3, 0], look: [.6, -.7] },
  worried:   { lean: 2, head: 8, aA: [-18, 166], aB: [18, -166], lA: [-4, 0], lB: [4, 0] },
  facepalm:  { lean: 6, head: 14, aA: [-8, 6], aB: [12, -172], lA: [-4, 0], lB: [4, 0] },
  celebrate: { lean: -3, head: -8, aA: [-150, -20], aB: [150, 20], lA: [-8, 0], lB: [8, 0], bob: -10 },
  fist:      { lean: -2, head: -4, aA: [-8, 6], aB: [60, 120], lA: [-5, 0], lB: [5, 0] },
  arms:      { lean: 0, head: 2, aA: [-22, 112], aB: [22, -112], lA: [-5, 0], lB: [5, 0] },
  carry:     { lean: 3, head: 2, aA: [-16, 84], aB: [16, -84], lA: [-6, 0], lB: [6, 0] },
  hold:      { lean: 2, head: 8, aA: [-8, 6], aB: [22, -104], lA: [-3, 0], lB: [3, 0], look: [-.3, .5] },
  push:      { lean: 18, head: -8, aA: [60, 30], aB: [70, 30], lA: [-14, 8], lB: [16, 4] },
  sit:       { lean: -2, head: 4, aA: [-14, 60], aB: [14, -60], lA: [80, -86], lB: [86, -92], bob: 96 },
};
function mixPose(a, b, k) {
  if (typeof a === 'string') a = POSES[a]; if (typeof b === 'string') b = POSES[b];
  const o = {}; for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const va = a[key] ?? (Array.isArray(b[key]) ? b[key].map(() => 0) : 0), vb = b[key] ?? va;
    o[key] = Array.isArray(va) ? va.map((v, i) => lerp(v, vb[i], k)) : lerp(va, vb, k);
  } return o;
}
/** pose timeline: keys = [[t, 'pose' or object], ...], each transition takes `dur` s, eased */
function poseAt(t, keys, dur = .45) {
  let cur = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [tk, p] = keys[i]; if (t < tk) break; const k = E.ioC(clamp((t - tk) / dur));
    cur = mixPose(cur, p, k);
  }
  return typeof cur === 'string' ? POSES[cur] : cur;
}

// ---------------- the person ----------------
class Person {
  constructor(parent, defs, o = {}) {
    this.o = o = Object.assign({ skin: SKIN.brown, hair: 'short', hairColor: HAIR.black, shirt: '#3b82c4', pants: '#2b2f3a', shoes: '#1c1c22', sleeves: 'short',
      build: 1, h: 1, female: false, beard: false, glasses: false, scarf: '#d9483b', scarf2: '#f2b632', jacket: null, tie: null, skirt: null, apron: null, collar: true,
      elder: false, child: false, seed: 1, lashes: undefined, earrings: false, cap: '#c0392b', socks: null }, o);
    if (o.lashes === undefined) o.lashes = o.female;
    this.defs = defs; this.seed = o.seed;
    this.g = sv('g', {}, parent); this.inner = sv('g', {}, this.g);
    const skin = o.skin, sd = dk(skin, .22);
    this.c = { skin, sd, hi: lt(skin, .1), shirt: o.shirt, shirtSd: dk(o.shirt, .25), pants: o.pants, pantsSd: dk(o.pants, .28), hair: o.hairColor, lip: mix(skin, '#7a2a2a', .35) };
    this._build();
  }
  _clip(d) { const id = uid('cp'); const c = sv('clipPath', { id }, this.defs); sv('path', { d }, c); return `url(#${id})`; }
  _build() {
    const o = this.o, c = this.c, g = this.inner;
    this.shadow = sv('ellipse', { cx: 0, cy: 0, rx: 120 * o.build, ry: 18, fill: '#000', opacity: .22, filter: CINE.blurFilter(this.defs, 6) }, g);
    // back hair (braids/afro behind head) lives in a group drawn before body
    this.gBackHair = sv('g', {}, g);
    // legs
    this.gLegs = sv('g', {}, g);
    const legW = 40 * o.build, pc = o.skirt ? c.skin : o.pants;
    this.leg = ['A', 'B'].map(() => ({
      th: sv('path', { fill: 'none', stroke: o.skirt ? c.skin : pc, 'stroke-width': o.skirt ? legW * .72 : legW, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, this.gLegs),
      hl: sv('path', { fill: 'none', stroke: lt(pc, .14), 'stroke-width': legW * .22, 'stroke-linecap': 'round', opacity: .55 }, this.gLegs),
      shoe: sv('path', { fill: o.shoes }, this.gLegs),
      sole: sv('path', { fill: dk(o.shoes, .4) }, this.gLegs),
    }));
    // torso group (rotates by lean around hip)
    this.gTorso = sv('g', {}, g);
    this.gArmBack = sv('g', {}, this.gTorso);
    this.gBody = sv('g', {}, this.gTorso);
    this.gNeck = sv('g', {}, this.gBody);
    this.gHead = sv('g', {}, this.gTorso);
    this.gArmFront = sv('g', {}, this.gTorso);
    this._buildBody(); this._buildHead();
    this.arm = [this.gArmBack, this.gArmFront].map((par, i) => this._buildArm(par, i));
    this.held = [null, null];
  }
  _buildBody() {
    const o = this.o, c = this.c, b = o.build; const sw = 64 * b, ww = 50 * b; // half widths
    const d = `M ${-sw} -385 C ${-sw - 6} -330 ${-ww - 6} -262 ${-ww} -214 L ${ww} -214 C ${ww + 6} -262 ${sw + 6} -330 ${sw} -385 C ${sw * .55} -404 ${-sw * .55} -404 ${-sw} -385 Z`;
    this.torsoD = d;
    // neck
    sv('path', { d: 'M -15 -430 L -15 -392 Q 0 -380 15 -392 L 15 -430 Z', fill: c.sd }, this.gNeck);
    const top = o.skirt ? o.shirt : o.shirt;
    const base = sv('path', { d, fill: c.shirtSd }, this.gBody);
    const cl = sv('g', { 'clip-path': this._clip(d) }, this.gBody);
    sv('path', { d, fill: c.shirt, transform: 'translate(-14,-6)' }, cl);
    sv('path', { d: `M ${-sw - 20} -300 L ${sw + 20} -300 L ${sw + 20} -180 L ${-sw - 20} -180 Z`, fill: '#000', opacity: .07 }, cl); // lower-body AO
    if (o.jacket) { // open jacket panels
      const j = o.jacket, jd = dk(j, .25);
      sv('path', { d: `M ${-sw} -385 C ${-sw - 6} -330 ${-ww - 6} -262 ${-ww} -214 L -14 -214 L -10 -330 L -26 -392 Z`, fill: j }, cl);
      sv('path', { d: `M ${sw} -385 C ${sw + 6} -330 ${ww + 6} -262 ${ww} -214 L 14 -214 L 10 -330 L 26 -392 Z`, fill: jd }, cl);
      sv('path', { d: 'M -26 -392 L -10 -330 L -34 -350 Z', fill: dk(j, .4) }, cl); sv('path', { d: 'M 26 -392 L 10 -330 L 34 -350 Z', fill: dk(j, .5) }, cl);
    }
    if (o.apron) { sv('path', { d: `M -38 -330 L 38 -330 L 46 -214 L -46 -214 Z`, fill: o.apron }, cl); sv('path', { d: 'M -38 -330 L -30 -392 M 38 -330 L 30 -392', stroke: dk(o.apron, .2), 'stroke-width': 6 }, cl);
      sv('rect', { x: -22, y: -290, width: 44, height: 28, rx: 5, fill: dk(o.apron, .12) }, cl); }
    if (o.tie) { sv('path', { d: 'M -8 -392 L 8 -392 L 5 -380 L 12 -300 L 0 -286 L -12 -300 L -5 -380 Z', fill: o.tie }, cl); }
    if (o.collar && !o.jacket) { sv('path', { d: 'M -24 -396 Q 0 -372 24 -396 L 16 -400 Q 0 -386 -16 -400 Z', fill: dk(o.shirt, .38) }, this.gBody); }
    if (o.collar && o.jacket) { sv('path', { d: 'M -22 -398 L -6 -360 L 0 -380 L 6 -360 L 22 -398 Q 0 -388 -22 -398 Z', fill: '#f4f1ea' }, this.gBody); }
    // belt / waist
    if (!o.skirt) sv('rect', { x: -ww - 1, y: -222, width: ww * 2 + 2, height: 12, rx: 4, fill: dk(o.pants, .35) }, this.gBody);
    if (o.skirt) { const sk = o.skirt; const sdk = `M ${-ww} -220 L ${ww} -220 L ${ww + 30} -112 Q 0 -100 ${-ww - 30} -112 Z`;
      sv('path', { d: sdk, fill: dk(sk, .25) }, this.gBody); const scl = sv('g', { 'clip-path': this._clip(sdk) }, this.gBody); sv('path', { d: sdk, fill: sk, transform: 'translate(-12,0)' }, scl);
      if (o.skirtPattern) for (let i = 0; i < 5; i++) sv('path', { d: `M ${-90 + i * 40} -230 L ${-70 + i * 46} -100`, stroke: o.skirtPattern, 'stroke-width': 7, opacity: .7 }, scl); }
  }
  _buildArm(parent, i) {
    const o = this.o, c = this.c; const aw = 31 * o.build; const long = o.sleeves === 'long' || o.jacket;
    const sleeveC = o.jacket ? (i ? o.jacket : dk(o.jacket, .2)) : (i ? c.shirt : c.shirtSd);
    const g = sv('g', {}, parent);
    const up = sv('path', { fill: 'none', stroke: sleeveC, 'stroke-width': aw + 6, 'stroke-linecap': 'round' }, g);
    const fo = sv('path', { fill: 'none', stroke: long ? sleeveC : (i ? c.skin : c.sd), 'stroke-width': long ? aw + 2 : aw - 4, 'stroke-linecap': 'round' }, g);
    const uphi = sv('path', { fill: 'none', stroke: '#fff', 'stroke-width': aw * .22, 'stroke-linecap': 'round', opacity: .12 }, g);
    const holdG = sv('g', {}, g);
    const hand = sv('g', {}, g);
    sv('ellipse', { cx: 0, cy: 6, rx: 17 * o.build, ry: 19 * o.build, fill: i ? c.skin : c.sd }, hand);
    sv('ellipse', { cx: -9, cy: 0, rx: 7, ry: 11, fill: i ? c.skin : c.sd, transform: 'rotate(30 -9 0)' }, hand);
    if (long) sv('ellipse', { cx: 0, cy: -10, rx: 18 * o.build, ry: 7, fill: dk(sleeveC, .25) }, hand);
    return { g, up, fo, uphi, hand, holdG };
  }
  _buildHead() {
    const o = this.o, c = this.c, h = this.gHead;
    const rx = 64, ry = 72; this.headR = [rx, ry];
    const hd = `M 0 ${-ry} C ${rx * .62} ${-ry} ${rx} ${-ry * .55} ${rx} ${-ry * .02} C ${rx} ${ry * .5} ${rx * .55} ${ry} 0 ${ry} C ${-rx * .55} ${ry} ${-rx} ${ry * .5} ${-rx} ${-ry * .02} C ${-rx} ${-ry * .55} ${-rx * .62} ${-ry} 0 ${-ry} Z`;
    this.headD = hd;
    this.gHair0 = sv('g', {}, h);           // behind head
    this.ears = [-1, 1].map(s => { const e = sv('g', {}, h); sv('ellipse', { cx: 0, cy: 0, rx: 13, ry: 18, fill: c.sd }, e); sv('ellipse', { cx: s * -2, cy: 1, rx: 6, ry: 10, fill: dk(c.skin, .35) }, e);
      if (o.earrings) sv('circle', { cx: 0, cy: 20, r: 5, fill: '#f2c14e' }, e); return e; });
    sv('path', { d: hd, fill: c.sd }, h);
    const hc = sv('g', { 'clip-path': this._clip(hd) }, h); this.headClip = hc;
    this.lit = sv('path', { d: hd, fill: c.skin }, hc);
    sv('ellipse', { cx: -22, cy: -30, rx: 26, ry: 18, fill: '#fff', opacity: .07 }, hc);
    this.face = sv('g', {}, h);
    const f = this.face;
    // cheeks
    this.cheeks = [-1, 1].map(s => sv('ellipse', { cx: s * 36, cy: 22, rx: 13, ry: 8, fill: '#e2504f', opacity: o.female ? .18 : .1 }, f));
    // eyes
    this.eyes = [-1, 1].map(s => { const e = sv('g', {}, f); const w = sv('g', {}, e);
      sv('ellipse', { cx: 0, cy: 0, rx: 12, ry: 14, fill: '#fbf7f2' }, w); const pu = sv('g', {}, w);
      sv('circle', { cx: 0, cy: 1, r: 8.2, fill: '#2a1a12' }, pu); sv('circle', { cx: 0, cy: 1, r: 4, fill: '#0c0605' }, pu); sv('circle', { cx: -3, cy: -3, r: 2.6, fill: '#fff' }, pu);
      const lid = sv('path', { d: 'M -14 -2 Q 0 -18 14 -2 L 14 -20 L -14 -20 Z', fill: c.sd }, e);
      if (o.lashes) sv('path', { d: `M ${s * 11} -9 l ${s * 7} -5`, stroke: '#1a1110', 'stroke-width': 3, 'stroke-linecap': 'round' }, w);
      return { e, w, pu, lid, s }; });
    // brows
    this.brows = [-1, 1].map(s => sv('path', { d: 'M -13 0 Q 0 -6 13 0', fill: 'none', stroke: o.elder ? HAIR.grey : dk(c.hair, .1), 'stroke-width': o.female ? 5 : 7, 'stroke-linecap': 'round' }, f));
    // nose
    this.nose = sv('path', { d: 'M -7 18 Q 0 25 7 18', fill: 'none', stroke: dk(c.skin, .3), 'stroke-width': 4.5, 'stroke-linecap': 'round' }, f);
    // mouth
    this.mouth = sv('g', {}, f);
    this.mOpen = sv('path', { fill: '#3a1418' }, this.mouth);
    this.mTeeth = sv('path', { fill: '#fbf7f2' }, this.mouth);
    this.mLine = sv('path', { fill: 'none', stroke: o.female ? mix(c.lip, '#8a2b33', .5) : dk(c.skin, .45), 'stroke-width': o.female ? 6 : 5, 'stroke-linecap': 'round' }, this.mouth);
    if (o.beard) { this.beard = sv('path', { d: `M ${-rx + 6} 4 C ${-rx + 4} 50 -30 ${ry + 8} 0 ${ry + 8} C 30 ${ry + 8} ${rx - 4} 50 ${rx - 6} 4 C 44 40 26 34 0 32 C -26 34 -44 40 ${-rx + 6} 4 Z`, fill: c.hair, opacity: .92 }, h); }
    if (o.glasses) { const gl = sv('g', { fill: 'none', stroke: '#1d1a19', 'stroke-width': 4 }, f); this.glasses = gl;
      [-1, 1].forEach(s => sv('rect', { x: s * 25 - 17, y: -18, width: 34, height: 28, rx: 9, fill: 'rgba(200,230,255,.12)' }, gl)); sv('path', { d: 'M -8 -6 Q 0 -10 8 -6' }, gl); }
    this.gHair1 = sv('g', {}, h);           // in front of head
    this._buildHair();
  }
  _buildHair() {
    const o = this.o, c = this.c, [rx, ry] = this.headR; const hc = o.elder && o.hair !== 'scarf' ? HAIR.grey : c.hair; const hsd = dk(hc, .3);
    const front = this.gHair1, back = this.gHair0;
    const cap = (y0 = -8, top = -ry - 14) => `M ${-rx - 3} ${y0} C ${-rx - 6} ${top * .6} ${-rx * .6} ${top} 0 ${top} C ${rx * .6} ${top} ${rx + 6} ${top * .6} ${rx + 3} ${y0} C ${rx - 8} -36 ${rx * .5} -54 4 -50 C -20 -48 ${-rx * .55} -44 ${-rx + 6} -26 Z`;
    switch (o.hair) {
      case 'short': sv('path', { d: cap(-10, -ry - 10), fill: hc }, front); sv('path', { d: `M -30 ${-ry - 4} Q 0 ${-ry - 12} 30 ${-ry - 4}`, stroke: lt(hc, .12), 'stroke-width': 5, fill: 'none', opacity: .5 }, front); break;
      case 'fade': sv('path', { d: cap(-18, -ry - 6), fill: hc }, front); break;
      case 'afro': { const r = CINE.rnd(this.seed); const g = sv('g', {}, back); sv('ellipse', { cx: 0, cy: -34, rx: rx + 26, ry: ry + 8, fill: hc }, g);
        for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; sv('circle', { cx: Math.cos(a) * (rx + 14), cy: -34 + Math.sin(a) * (ry - 6), r: 22 + r() * 8, fill: i % 3 ? hc : hsd }, g); }
        sv('path', { d: cap(-14, -ry - 22), fill: hc }, front); break; }
      case 'bun': sv('circle', { cx: 0, cy: -ry - 26, r: 30, fill: hc }, back); sv('path', { d: cap(-6, -ry - 8), fill: hc }, front); break;
      case 'braids': { const g = sv('g', {}, back); for (let i = -4; i <= 4; i++) { if (Math.abs(i) < 2) continue; sv('path', { d: `M ${i * 14} -40 C ${i * 18} 40 ${i * 20} 100 ${i * 21} 150`, stroke: i % 2 ? hc : hsd, 'stroke-width': 14, 'stroke-linecap': 'round', fill: 'none' }, g); }
        sv('path', { d: cap(-4, -ry - 10), fill: hc }, front); for (let i = -3; i <= 3; i++) sv('path', { d: `M ${i * 16} ${-ry - 6} Q ${i * 20} -50 ${i * 26} -30`, stroke: hsd, 'stroke-width': 3, fill: 'none', opacity: .6 }, front); break; }
      case 'scarf': { const s1 = o.scarf, s2 = o.scarf2; const sd = dk(s1, .25);
        const wrap = `M ${-rx - 8} -6 C ${-rx - 18} -70 ${-rx + 4} ${-ry - 60} 0 ${-ry - 64} C ${rx - 4} ${-ry - 60} ${rx + 18} -70 ${rx + 8} -6 C ${rx - 6} -38 ${rx * .5} -48 0 -46 C ${-rx * .5} -48 ${-rx + 6} -38 ${-rx - 8} -6 Z`;
        sv('path', { d: wrap, fill: sd }, front); const cl = sv('g', { 'clip-path': this._clip(wrap) }, front); sv('path', { d: wrap, fill: s1, transform: 'translate(-10,-6)' }, cl);
        for (let i = -3; i <= 3; i++) sv('path', { d: `M ${i * 30 - 40} ${-ry - 70} L ${i * 30 + 30} -20`, stroke: s2, 'stroke-width': 9, opacity: .85 }, cl);
        for (let i = 0; i < 3; i++) sv('path', { d: `M ${-rx + 4} ${-30 - i * 22} Q 0 ${-ry - 10 - i * 26} ${rx - 4} ${-30 - i * 22}`, stroke: dk(s1, .35), 'stroke-width': 3, fill: 'none', opacity: .45 }, cl);
        // knot
        const k = sv('g', { transform: `translate(${rx * .35},${-ry - 50}) rotate(18)` }, front); sv('ellipse', { cx: 0, cy: 0, rx: 30, ry: 20, fill: s1 }, k); sv('ellipse', { cx: 22, cy: -14, rx: 20, ry: 13, fill: sd, transform: 'rotate(-30 22 -14)' }, k); sv('ellipse', { cx: -22, cy: -12, rx: 18, ry: 12, fill: lt(s1, .1), transform: 'rotate(30 -22 -12)' }, k);
        sv('path', { d: 'M -10 -8 L 10 8 M -14 4 L 6 -10', stroke: s2, 'stroke-width': 6 }, k); break; }
      case 'cap': { const cc = o.cap; sv('path', { d: cap(-14, -ry - 12), fill: hc }, front);
        sv('path', { d: `M ${-rx - 4} -24 C ${-rx - 6} -80 ${-rx * .5} ${-ry - 22} 0 ${-ry - 22} C ${rx * .5} ${-ry - 22} ${rx + 6} -80 ${rx + 4} -24 Z`, fill: cc }, front);
        sv('path', { d: `M ${-rx - 2} -26 Q 0 -10 ${rx + 2} -26 Q ${rx * .6} 4 0 6 Q ${-rx * .6} 4 ${-rx - 2} -26 Z`, fill: dk(cc, .3) }, front); sv('circle', { cx: 0, cy: -ry - 20, r: 6, fill: dk(cc, .2) }, front); break; }
      case 'long': { sv('path', { d: `M ${-rx - 10} -20 C ${-rx - 20} 60 ${-rx - 6} 120 ${-rx + 10} 150 L ${rx - 10} 150 C ${rx + 6} 120 ${rx + 20} 60 ${rx + 10} -20 Z`, fill: hc }, back);
        sv('path', { d: `M ${-rx - 6} 30 C ${-rx - 14} -60 ${-rx * .6} ${-ry - 18} 0 ${-ry - 18} C ${rx * .6} ${-ry - 18} ${rx + 14} -60 ${rx + 6} 30 C ${rx - 10} -10 ${rx - 14} -44 10 -52 C -18 -40 ${-rx + 8} -30 ${-rx - 6} 30 Z`, fill: hc }, front); break; }
      case 'bald': sv('ellipse', { cx: -18, cy: -ry + 14, rx: 22, ry: 10, fill: '#fff', opacity: .1 }, front); break;
      case 'side': sv('path', { d: cap(-12, -ry - 8), fill: hc }, front); sv('path', { d: `M -50 -50 Q -10 ${-ry - 14} 40 -60`, stroke: lt(hc, .12), 'stroke-width': 4, fill: 'none', opacity: .5 }, front); break;
    }
  }
  /** put an SVG node into hand 0 (back/A) or 1 (front/B). opts: {x,y,r,s} offset in hand space */
  hold(i, node, opts = {}) { const a = this.arm[i]; while (a.holdG.firstChild) a.holdG.removeChild(a.holdG.firstChild); if (node) a.holdG.appendChild(node); this.held[i] = node ? Object.assign({ x: 0, y: 0, r: 0, s: 1, upright: false }, opts) : null; }
  /**
   * set(t, st): st = {x, y, s, flip, pose(object or name), side(0..1), turn(-1..1), look:[x,y], talk(0..1), expr, walk(phase or null), stride, blink(true), o}
   */
  set(t, st = {}) {
    const o = this.o; const P = typeof st.pose === 'string' ? POSES[st.pose] : (st.pose || POSES.stand);
    const s = (st.s ?? 1) * (o.child ? .66 : 1) * o.h; const flip = st.flip ? -1 : 1; const side = st.side ?? 0;
    const breath = Math.sin(t * 2.2 + this.seed) * 1.2;
    let bob = (P.bob || 0); let walkLegs = null, walkArms = null, wph = st.walk;
    if (wph !== undefined && wph !== null) { const a = Math.sin(wph * 2 * Math.PI); const st0 = st.stride ?? 26; walkLegs = [a * st0, -a * st0]; walkArms = [-a * st0 * .8, a * st0 * .8]; bob += -Math.abs(Math.cos(wph * 2 * Math.PI)) * 9 + 4; }
    const lean = (P.lean || 0) + noise1(t * .4, this.seed) * 1.2;
    this.g.setAttribute('transform', `translate(${(st.x || 0).toFixed(1)},${(st.y || 0).toFixed(1)}) scale(${(s * flip).toFixed(4)},${s.toFixed(4)})`);
    this.g.setAttribute('opacity', st.o ?? 1);
    // legs (from hip)
    const hipY = -220 + bob; const hx = 26 * o.build * (1 - .7 * side);
    this.leg.forEach((L, i) => {
      const sgn = i ? 1 : -1; let [ua, bend] = P[i ? 'lB' : 'lA'];
      if (walkLegs) { ua = walkLegs[i] * (side ? 1 : .35); bend = Math.max(0, Math.sin(((st.walk + (i ? .5 : 0)) % 1) * 2 * Math.PI)) * -38 * (side ? 1 : .4); }
      const [dx1, dy1] = dir(ua); const k = [sgn * hx + dx1 * 105, hipY + dy1 * 105];
      const [dx2, dy2] = dir(ua + bend * (side ? 1 : 1)); const an = [k[0] + dx2 * 100, k[1] + dy2 * 100];
      const hipP = [sgn * hx, hipY];
      const d = `M ${hipP[0].toFixed(1)} ${hipP[1].toFixed(1)} L ${k[0].toFixed(1)} ${k[1].toFixed(1)} L ${an[0].toFixed(1)} ${an[1].toFixed(1)}`;
      L.th.setAttribute('d', d); L.hl.setAttribute('d', `M ${(hipP[0] - 10).toFixed(1)} ${(hipP[1] + 10).toFixed(1)} L ${(k[0] - 10).toFixed(1)} ${k[1].toFixed(1)}`);
      // shoe: points out sideways a bit in front view, forward in side view
      const fw = side > .5 ? 1 : sgn * .4; const len = 26 + 22 * side;
      L.shoe.setAttribute('d', `M ${an[0] - 22 + (fw < 0 ? fw * len : 0)} ${an[1] + 12} Q ${an[0] - 22 + (fw < 0 ? fw * len : 0)} ${an[1] - 14} ${an[0]} ${an[1] - 12} Q ${an[0] + 22 + (fw > 0 ? fw * len : 0)} ${an[1] - 6} ${an[0] + 22 + (fw > 0 ? fw * len : 0)} ${an[1] + 12} Z`);
      L.sole.setAttribute('d', `M ${an[0] - 24 + (fw < 0 ? fw * len : 0)} ${an[1] + 10} L ${an[0] + 24 + (fw > 0 ? fw * len : 0)} ${an[1] + 10} L ${an[0] + 24 + (fw > 0 ? fw * len : 0)} ${an[1] + 16} L ${an[0] - 24 + (fw < 0 ? fw * len : 0)} ${an[1] + 16} Z`);
    });
    this.shadow.setAttribute('rx', (110 * o.build * (1 - .3 * side)).toFixed(1));
    // torso
    const sx = 1 - .28 * side; this.gTorso.setAttribute('transform', `translate(0 ${hipY + 220}) rotate(${lean.toFixed(2)} 0 -220)`);
    this.gBody.setAttribute('transform', `translate(0 -220) scale(${sx.toFixed(3)},${(1 + breath * .006).toFixed(4)}) translate(0 220)`);
    // arms: in front view both arms sit in front of the torso; in side view arm A goes behind
    if (side < .5 && this.arm[0].g.parentNode !== this.gArmFront) this.gArmFront.insertBefore(this.arm[0].g, this.arm[1].g);
    if (side >= .5 && this.arm[0].g.parentNode !== this.gArmBack) this.gArmBack.appendChild(this.arm[0].g);
    const shY = -382 + (P.sh || 0) * .3 + breath * .8; const shx = 54 * o.build * (1 - .62 * side);
    this.handPos = [];
    this.arm.forEach((A, i) => {
      const sgn = i ? 1 : -1; let [ua, el] = P[i ? 'aB' : 'aA'];
      if (walkArms) { ua = lerp(ua, walkArms[i] * (side ? 1 : .5) + sgn * 6, st.walkArms ?? 1); el = lerp(el, (side ? 18 : sgn * 10), st.walkArms ?? 1); }
      ua += noise1(t * .5 + i * 9, this.seed + 3) * 2.5;
      const sh = [sgn * shx, shY + (P.sh && i === 1 ? P.sh : 0)];
      const [d1x, d1y] = dir(ua); const e = [sh[0] + d1x * 90, sh[1] + d1y * 90];
      const [d2x, d2y] = dir(ua + el); const w = [e[0] + d2x * 84, e[1] + d2y * 84];
      A.up.setAttribute('d', `M ${sh[0].toFixed(1)} ${sh[1].toFixed(1)} L ${e[0].toFixed(1)} ${e[1].toFixed(1)}`);
      A.uphi.setAttribute('d', `M ${(sh[0] - 6).toFixed(1)} ${(sh[1] + 4).toFixed(1)} L ${(e[0] - 6).toFixed(1)} ${e[1].toFixed(1)}`);
      A.fo.setAttribute('d', `M ${e[0].toFixed(1)} ${e[1].toFixed(1)} L ${w[0].toFixed(1)} ${w[1].toFixed(1)}`);
      const ha = -(ua + el); // hand rotation in svg degrees
      A.hand.setAttribute('transform', `translate(${w[0].toFixed(1)},${w[1].toFixed(1)}) rotate(${ha.toFixed(1)}) scale(${i ? 1 : -1},1)`);
      const H = this.held[i]; if (H) { const r = H.upright ? -lean + (H.r || 0) : ha + (H.r || 0); A.holdG.setAttribute('transform', `translate(${(w[0] + H.x).toFixed(1)},${(w[1] + H.y).toFixed(1)}) rotate(${r.toFixed(1)}) scale(${H.s / (st.flip && H.unflip ? -1 : 1)},${H.s})`); }
      this.handPos.push(w);
    });
    // head
    const turn = clamp((st.turn ?? 0) + side * (st.turn === undefined ? 1 : 0), -1, 1);
    const hy = -472 + breath * .5, hr = (P.head || 0) + noise1(t * .35, this.seed + 7) * 2.5 + (st.nod ? Math.sin(t * 9) * st.nod * 5 : 0);
    this.gHead.setAttribute('transform', `translate(${(turn * 4).toFixed(1)} ${hy.toFixed(1)}) rotate(${hr.toFixed(2)})`);
    this.gNeck.setAttribute('transform', `translate(${(turn * 3).toFixed(1)} 0)`);
    const fx = turn * 22; this.face.setAttribute('transform', `translate(${fx.toFixed(1)} 0)`);
    this.lit.setAttribute('transform', `translate(${(-12 + turn * 6).toFixed(1)},-8)`);
    this.ears[0].setAttribute('transform', `translate(${(-62 + turn * 16).toFixed(1)} 8)`); this.ears[1].setAttribute('transform', `translate(${(62 + turn * 16).toFixed(1)} 8)`);
    this.ears[0].style.display = turn > .75 ? 'none' : ''; this.ears[1].style.display = turn < -.75 ? 'none' : '';
    this.gHair1.setAttribute('transform', `translate(${(turn * -3).toFixed(1)} 0)`);
    // eyes, look, blink
    const look = st.look || P.look || [0, 0];
    let bl = 1; if (st.blink !== false) { const per = 3.4 + (this.seed % 5) * .37; const ph = (t + this.seed * 1.7) % per; if (ph < .16) bl = Math.abs(ph - .08) / .08; }
    if (st.eyesClosed) bl = .08;
    const expr = st.expr || 'neutral';
    const EX = { neutral: { b: 0, bt: 0, m: 'smile', mk: .35, lid: 0 }, smile: { b: -2, bt: 0, m: 'smile', mk: 1, lid: .1 }, happy: { b: -6, bt: -4, m: 'grin', mk: 1, lid: .25 },
      surprised: { b: -10, bt: 0, m: 'o', mk: 1, lid: -.2 }, worried: { b: -4, bt: 10, m: 'frown', mk: .7, lid: .1 }, sad: { b: 0, bt: 12, m: 'frown', mk: 1, lid: .3 },
      angry: { b: 2, bt: -14, m: 'flat', mk: 1, lid: .3 }, focus: { b: 2, bt: -6, m: 'flat', mk: .6, lid: .25 }, shock: { b: -12, bt: 4, m: 'o', mk: 1.4, lid: -.3 } }[expr];
    this.eyes.forEach((E2, i) => {
      E2.e.setAttribute('transform', `translate(${E2.s * 25} -6)`);
      E2.w.setAttribute('transform', `scale(1,${(bl * (1 - Math.max(0, EX.lid) * .4)).toFixed(3)})`);
      E2.pu.setAttribute('transform', `translate(${(look[0] * 4 + turn * 2).toFixed(1)},${(look[1] * 4).toFixed(1)})`);
      E2.lid.setAttribute('transform', `translate(0 ${(-6 + EX.lid * 12 - (1 - bl) * -14).toFixed(1)})`); E2.lid.setAttribute('opacity', EX.lid > 0 || bl < 1 ? 1 : 0);
    });
    this.brows.forEach((b, i) => { const sg = i ? 1 : -1; b.setAttribute('transform', `translate(${sg * 26} ${(-30 + EX.b).toFixed(1)}) rotate(${(sg * EX.bt).toFixed(1)})`); });
    this.nose.setAttribute('transform', `translate(${(turn * 8).toFixed(1)} 0)`);
    // mouth
    const talk = st.talk ? clamp(.25 + .75 * Math.abs(noise1(t * 11, this.seed + 1)) * 1.4) * st.talk : 0;
    const my = 40, mw = 20;
    let line = '', open = '', teeth = '';
    if (talk > .05) { const oh = 4 + talk * 20, ow = mw * (1 - talk * .25); open = `M ${-ow} ${my} Q 0 ${my - 6} ${ow} ${my} Q ${ow * .8} ${my + oh} 0 ${my + oh} Q ${-ow * .8} ${my + oh} ${-ow} ${my} Z`; teeth = `M ${-ow * .8} ${my - 1} Q 0 ${my - 5} ${ow * .8} ${my - 1} L ${ow * .7} ${my + 4} Q 0 ${my + 2} ${-ow * .7} ${my + 4} Z`; }
    else if (EX.m === 'smile') { const k = EX.mk * 10; line = `M ${-mw} ${my - k * .3} Q 0 ${my + k} ${mw} ${my - k * .3}`; }
    else if (EX.m === 'grin') { open = `M ${-mw - 4} ${my - 4} Q 0 ${my - 2} ${mw + 4} ${my - 4} Q ${mw} ${my + 22} 0 ${my + 22} Q ${-mw} ${my + 22} ${-mw - 4} ${my - 4} Z`; teeth = `M ${-mw} ${my - 3} Q 0 ${my - 1} ${mw} ${my - 3} L ${mw - 3} ${my + 5} Q 0 ${my + 7} ${-mw + 3} ${my + 5} Z`; }
    else if (EX.m === 'o') { const r = 8 * EX.mk; open = `M ${-r} ${my + 4} a ${r} ${r * 1.2} 0 1 0 ${2 * r} 0 a ${r} ${r * 1.2} 0 1 0 ${-2 * r} 0`; }
    else if (EX.m === 'frown') { const k = EX.mk * 8; line = `M ${-mw * .8} ${my + k * .6} Q 0 ${my - k} ${mw * .8} ${my + k * .6}`; }
    else if (EX.m === 'flat') line = `M ${-mw * .7} ${my + 2} L ${mw * .7} ${my + 2}`;
    this.mLine.setAttribute('d', line || 'M 0 0'); this.mLine.style.display = line ? '' : 'none';
    this.mOpen.setAttribute('d', open || 'M 0 0'); this.mTeeth.setAttribute('d', teeth || 'M 0 0');
    this.mouth.setAttribute('transform', `translate(${(turn * 6).toFixed(1)} 0)`);
    return this;
  }
}
/** a crowd of small people for "millions of customers" shots: returns {g, set(t,k)} with k = fraction visible */
function crowd(parent, defs, { cols = 12, rows = 5, x = 0, y = 0, dx = 120, dy = 70, s = .32, seed = 4, palette } = {}) {
  const r = CINE.rnd(seed); const g = sv('g', {}, parent); const ppl = [];
  const skins = Object.values(SKIN), shirts = palette || ['#e4572e', '#29335c', '#f3a712', '#2fbf71', '#4c9be8', '#a23b72', '#f2f2f2', '#16a085', '#d35400', '#8e44ad'];
  const hairs = ['short', 'fade', 'afro', 'bun', 'scarf', 'cap', 'braids', 'bald', 'side', 'long'];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const fem = r() < .5; const p = new Person(g, defs, { skin: skins[Math.floor(r() * skins.length)], shirt: shirts[Math.floor(r() * shirts.length)], pants: ['#2b2f3a', '#3d4b66', '#5b4636', '#1f2a36'][Math.floor(r() * 4)],
      hair: fem ? ['bun', 'scarf', 'braids', 'long', 'afro'][Math.floor(r() * 5)] : ['short', 'fade', 'cap', 'bald', 'side'][Math.floor(r() * 5)], female: fem, seed: 1 + Math.floor(r() * 50), scarf: shirts[Math.floor(r() * shirts.length)], skirt: fem && r() < .4 ? shirts[Math.floor(r() * shirts.length)] : null });
    ppl.push({ p, x: x + (i - (cols - 1) / 2) * dx + (j % 2) * dx * .5 + (r() - .5) * 20, y: y + j * dy, s: s * (1 + j * .06), d: r(), pose: ['stand', 'relaxed', 'phone', 'wave', 'handsHips'][Math.floor(r() * 5)] });
  }
  ppl.sort((a, b) => a.y - b.y); ppl.forEach(q => g.appendChild(q.p.g));
  return { g, ppl, set(t, k = 1, opts = {}) { ppl.forEach((q, i) => { const on = clamp((k * 1.3 - q.d * 1.0) / .3); const pop = E.outB(on);
    q.p.set(t, { x: q.x, y: q.y + (1 - pop) * 30, s: q.s * Math.max(.001, pop), pose: opts.pose || q.pose, expr: opts.expr || 'smile', turn: noise1(t * .2 + i, 2) * .4, o: on > 0 ? 1 : 0 }); }); } };
}
window.CINE.Person = Person; window.CINE.POSES = POSES; window.CINE.mixPose = mixPose; window.CINE.poseAt = poseAt; window.CINE.SKIN = SKIN; window.CINE.HAIR = HAIR; window.CINE.crowd = crowd;
})();
