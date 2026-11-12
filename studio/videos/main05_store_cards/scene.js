/* Money From Zero main05: Black Friday and store cards. CINE engine, motion v3 (12 Nov 2026). Voice = voice_master.m4a, LEAD 0.
   Built from a cut list timed to the voice with N(phrase, near), plus hand-made story shots in a shop, at the till, a year of
   months, and a phone statement. Thandi is the person we follow. */
const C = CINE; const T = C.T8; const { shot, cue, E, prog, clamp, lerp, kf, noise1, sv, G, P, el, Person, SKIN, pop } = C;
const BASE = window.SCENE.replace(/[^/]+$/, '');
const V = C.voice(C.loadJSON(BASE + 'words_all.json'), 0);
function N(txt, near) { const k = txt.toLowerCase().replace(/[^a-z0-9#* ]/g, '').split(' '); const W = V.words; let best = null;
  for (let i = 0; i < W.length; i++) { let ok = true; for (let j = 0; j < k.length; j++) if (!W[i + j] || W[i + j].w !== k[j]) { ok = false; break; } if (ok && (best === null || Math.abs(W[i].a - near) < Math.abs(best - near))) best = W[i].a; }
  if (best === null || Math.abs(best - near) > 3) console.error('N miss: ' + txt + ' @' + near + ' -> ' + best); return best ?? near; }
const X = (txt, near) => N(txt, near) - .12;
C.setTheme('mfz'); const GOLD = '#f7be33', GREEN = '#2fd27f', BG = '#121214', RED = '#ff5d5d', BLUE = '#6cb4ff', INK = '#f4eedf';
const END = V.end;
C.initFX({ grain: .05, vignette: .5 });
el('div', { class: 'bug' }, C.stage, `<span class="z">0</span>MONEY FROM ZERO`);
const { tpl } = C;
const uiSvg = u => { const s = C.svgBox(1920, 1080, u); return { svg: s, defs: sv('defs', {}, s) }; };
const thandi = { skin: SKIN.brown, hair: 'braids', female: true, shirt: '#e2603a', pants: '#1f2a36', earrings: true, seed: 57 };
const clerk = { skin: SKIN.dark, hair: 'short', shirt: '#ffffff', jacket: '#1d1d22', tie: GOLD, pants: '#1d1d22', seed: 34 };
const fmtR = v => 'R' + Math.round(v).toLocaleString('en-ZA').replace(/[, ]/g, ' ');

// ---------- props made for this video ----------
// a flat-screen TV with a living picture (stylised landscape that moves)
function tvSet(parent, defs, { w = 520, h = 300, stand = true } = {}) {
  const g = sv('g', {}, parent); const x = -w / 2, y = -h;
  sv('rect', { x: x + 10, y: y + 26, width: w, height: h, rx: 14, fill: '#000', opacity: .35, filter: C.blurFilter ? C.blurFilter(defs, 16) : null }, g);
  if (stand) { sv('rect', { x: -14, y: 0, width: 28, height: h * .16, fill: '#2a2d36' }, g); sv('rect', { x: -w * .2, y: h * .15, width: w * .4, height: 12, rx: 6, fill: '#2a2d36' }, g); }
  sv('rect', { x, y, width: w, height: h, rx: 14, fill: '#14161c' }, g);
  const cid = 'tvc' + (tvSet.n = (tvSet.n || 0) + 1);
  const cp = sv('clipPath', { id: cid }, defs); sv('rect', { x: x + 12, y: y + 12, width: w - 24, height: h - 24, rx: 6 }, cp);
  const scr = sv('g', { 'clip-path': `url(#${cid})` }, g);
  const sky = sv('rect', { x: x + 12, y: y + 12, width: w - 24, height: h - 24, fill: C.grad(defs, [[0, '#2e4c86'], [.6, '#e48a58'], [1, '#f7c98c']]) }, scr);
  const sun = sv('circle', { r: h * .12, fill: '#ffe1a6' }, scr);
  const hills = sv('path', { d: '', fill: '#2c5a3c' }, scr); const hills2 = sv('path', { d: '', fill: '#1d3d29' }, scr);
  sv('rect', { x: x + 12, y: y + 12, width: w - 24, height: h - 24, fill: C.grad(defs, [[0, '#fff', .18], [.4, '#fff', 0]], { x1: 0, y1: 0, x2: 1, y2: 1 }) }, g);
  const hill = (ph, amp, base) => { let d = `M ${x} ${y + h}`; for (let i = 0; i <= 24; i++) { const px = x + i / 24 * w; d += ` L ${px.toFixed(1)} ${(y + h * base + Math.sin(i * .6 + ph) * amp).toFixed(1)}`; } return d + ` L ${x + w} ${y + h} Z`; };
  return { g, set(t) { sun.setAttribute('cx', x + w * (.25 + .5 * ((t * .04) % 1))); sun.setAttribute('cy', y + h * .38 + Math.sin(t * .3) * 8); hills.setAttribute('d', hill(t * .5, h * .05, .68)); hills2.setAttribute('d', hill(t * .9 + 2, h * .04, .82)); } };
}
// the shop interior: banner wall, shelves of TVs, haze, floor
function shopWorld(w, { banner = 'BLACK FRIDAY' } = {}) {
  const L5 = w.layer(5, { w: 3600, h: 2200 }), L3 = w.layer(2.4, { w: 3000, h: 1800 }), Lh = w.layer(1.8, { w: 2800, h: 1600 }), L1 = w.layer(1, { w: 2400, h: 1200 });
  sv('rect', { x: 0, y: 0, width: 3600, height: 2200, fill: C.grad(L5.defs, [[0, '#17171d'], [.7, '#24232b'], [1, '#121214']]) }, L5.svg);
  const lights = []; for (let i = 0; i < 26; i++) { const c = sv('circle', { cx: 120 + i * 135, cy: 300 + Math.sin(i) * 30, r: 10, fill: i % 2 ? GOLD : '#fff' }, L5.svg); lights.push(c); }
  sv('path', { d: Array.from({ length: 27 }, (_, i) => (i ? 'L' : 'M') + (120 + i * 135) + ' ' + (300 + Math.sin(i) * 30)).join(' '), stroke: '#555', 'stroke-width': 3, fill: 'none' }, L5.svg);
  const bn = sv('g', { opacity: banner ? 1 : 0 }, L5.svg); sv('rect', { x: 900, y: 560, width: 1800, height: 260, rx: 20, fill: '#0b0b0d', stroke: GOLD, 'stroke-width': 8 }, bn);
  C.T(bn, banner || '', { x: 1800, y: 700, 'font-size': 170, fill: GOLD, 'font-family': 'Barlow Condensed', 'font-weight': 800, 'letter-spacing': 14 });
  const shelf = sv('g', {}, L3.svg); const tvs = []; for (let r = 0; r < 2; r++) { sv('rect', { x: 0, y: 760 + r * 330, width: 3000, height: 26, fill: '#3a3b44' }, shelf); for (let i = 0; i < 9; i++) { const tv = tvSet(shelf, L3.defs, { w: 250, h: 150, stand: false }); G(tv.g, 160 + i * 340 + r * 120, 750 + r * 330); tvs.push(tv); } }
  C.haze(Lh, { color: '#3a2a1c', o: .45, from: .3, to: .95 });
  sv('rect', { x: 0, y: 900, width: 2400, height: 300, fill: C.grad(L1.defs, [[0, '#3b3a42'], [1, '#1b1b20']]) }, L1.svg);
  for (let i = 0; i < 14; i++) sv('line', { x1: i * 200 - 300, y1: 1200, x2: 1200 + (i - 7) * 60, y2: 900, stroke: '#fff', 'stroke-width': 2, opacity: .05 }, L1.svg);
  return { L1, L3, tvs, lights, set(t) { tvs.forEach((tv, i) => tv.set(t + i * .7)); lights.forEach((c, i) => c.setAttribute('opacity', .35 + .65 * (.5 + .5 * Math.sin(t * 3 + i * 1.3)))); } };
}
// a plinth with the hero TV and a swinging price tag
function heroTV(L1, x, y, s = 1) { const g = sv('g', {}, L1.svg); sv('rect', { x: -300, y: 0, width: 600, height: 230, rx: 10, fill: C.grad(L1.defs, [[0, '#ece6da'], [1, '#b9b2a4']]) }, g); sv('rect', { x: -300, y: 0, width: 600, height: 20, fill: '#fff', opacity: .5 }, g);
  const tv = tvSet(g, L1.defs, { w: 640, h: 370 }); G(tv.g, 0, -60); const tag = C.priceTag(g, L1.defs, { w: 300, h: 130, color: GOLD }); G(tag.g, 390, -230);
  G(g, x, y, 0, s); return { g, tv, tag }; }

// ---------- hand-made story shots ----------
/** H1: Thandi in front of the Black Friday TV; the tag drops from R6 250 to R5 000 */
function shopShot(a, b, { title, titleAt, priceAt, saleAt, saveAt, zoomIn = true, tr = { in: 'fade', tin: .4 } } = {}) { shot(a, b + .35, ({ root, world }) => { const w = world(); const s = shopWorld(w, { banner: title ? '' : 'BLACK FRIDAY' });
  const h = heroTV(s.L1, 1250, 900); const p = new Person(s.L1.svg, s.L1.defs, thandi); h.tag.label.textContent = 'R6 250';
  const strike = sv('line', { x1: -150, y1: 22, x2: 110, y2: 0, stroke: RED, 'stroke-width': 10, 'stroke-linecap': 'round', pathLength: 1 }, h.tag.g); strike.style.strokeDasharray = '1 1';
  const u = C.ui(root); const us = uiSvg(u); const sale = C.flapText(u, 'R5 000', { size: 120, accent: true }); const save = el('div', { class: 'abs' }, u, 'SAVE R1 250'); save.style.cssText += `font:800 56px/1 'Barlow Condensed';color:${BG};background:${GREEN};padding:12px 24px;border-radius:14px;letter-spacing:.06em`;
  const pct = C.icon(us.svg, us.defs, 'percent', { r: 60, bg: RED, fg: '#fff' }); const ti = title ? tpl.hl(u, title, 70) : null; const br = C.burst(us.svg, 1480, 330, { n: 16, r0: 120, r1: 260, color: GOLD });
  return { w, s, h, p, strike, sale, save, pct, ti, br };
}, (s, lt, t) => { s.s.set(t); s.h.tv.set(t); s.h.tag.set(t); const pa = priceAt ?? a + .4, sa = saleAt ?? a + 1.4, va = saveAt ?? sa + .8;
  s.strike.style.strokeDashoffset = 1 - E.ioC(prog(t, sa - .3, sa)); s.sale.set(t, sa, .05); P(s.sale.el, { x: 1480, y: 330, o: prog(t, sa - .05, sa + .1) }); s.br(prog(t, sa, sa + .8));
  pop(s.pct.g, 1090, 330, t, sa + .1, { spin: -30 }); s.pct.draw(prog(t, sa + .1, sa + .6)); P(s.save, { x: 1480, y: 450, o: E.outC(prog(t, va, va + .3)), s: E.outB(prog(t, va, va + .45)) });
  const look = t > sa ? 'happy' : 'focus'; s.p.set(t, { x: 640, y: 1110, s: 1.25, pose: C.poseAt(t, [[0, 'think'], [sa, 'celebrate'], [sa + 1.6, 'point']]), expr: look, turn: .6, look: [1, -.3], gesture: .3 });
  if (s.ti) { s.ti.set(t, titleAt || a + .5); P(s.ti.el, { x: 960, y: 110, o: prog(t, a, a + .3) }); }
  const z = zoomIn ? lerp(1.0, 1.18, E.ioS(prog(t, a, b))) : lerp(1.15, 1.0, E.ioS(prog(t, a, b))); s.w.camera({ x: lerp(-40, 60, prog(t, a, b)), y: 40, zoom: z, focus: 1, dof: .8, rot: noise1(t * .2, 5) * .4 });
  tpl.once(s, [[a + .1, 'shopbell', .35], [pa, 'tick', .3], [sa - .3, 'swish', .4], [sa, 'flaps', .5], [sa + .1, 'pop', .45], [va, 'cash', .4]]);
}, tr); }

/** H2: at the till; the clerk offers the store card, it's tapped, a slip prints "PAY LATER" */
function tillShot(a, b, { title, titleAt, offerAt, tapAt, bubble: btxt = '“Put it on your store card?”', stamp, stampAt, banner = 'PAY LATER?', tr = { in: 'whip', tin: .35, dir: 1 } } = {}) { shot(a, b + .35, ({ root, world }) => { const w = world(); const s = shopWorld(w, { banner: title ? '' : banner });
  const L1 = s.L1; const ck = new Person(L1.svg, L1.defs, clerk); const counter = sv('g', {}, L1.svg); sv('rect', { x: 1150, y: 760, width: 900, height: 340, rx: 14, fill: C.grad(L1.defs, [[0, '#2b2d36'], [1, '#17181d']]) }, counter); sv('rect', { x: 1150, y: 760, width: 900, height: 26, fill: GOLD }, counter);
  const term = sv('g', {}, L1.svg); sv('rect', { x: -70, y: -140, width: 140, height: 220, rx: 18, fill: '#22252d' }, term); const scr = sv('rect', { x: -52, y: -122, width: 104, height: 70, rx: 6, fill: '#0e1116' }, term); const ok = C.T(term, '', { y: -84, 'font-size': 26, fill: GREEN, 'font-family': 'Barlow', 'font-weight': 800 }); G(term, 1400, 760);
  const card = C.bankCard(L1.svg, L1.defs, { w: 300, h: 190, c1: '#5a1e1e', c2: '#d9483b', name: 'STORE CARD', num: '•••• 2711' }); const p = new Person(L1.svg, L1.defs, thandi);
  const u = C.ui(root); const us = uiSvg(u); const ti = title ? tpl.hl(u, title, 70) : null; const bubble = el('div', { class: 'abs' }, u, btxt); const st = stamp ? C.stampMark(us.svg, us.defs, stamp, { size: 80 }) : null; bubble.style.cssText += `font:700 44px/1.1 Barlow;color:${BG};background:#fff;padding:18px 28px;border-radius:26px 26px 26px 6px;box-shadow:0 18px 40px rgba(0,0,0,.3);white-space:nowrap`;
  const ic = C.icon(us.svg, us.defs, 'card', { r: 54, bg: GOLD, fg: BG }); return { w, s, ck, p, card, term, ok, ti, bubble, ic, st };
}, (s, lt, t) => { s.s.set(t); const oa = offerAt ?? a + .5, ta = tapAt ?? oa + 1.6;
  s.ck.set(t, { x: 1680, y: 1000, s: 1.1, pose: C.poseAt(t, [[0, 'present'], [oa, 'give'], [ta + .6, 'present']]), expr: 'smile', turn: -.4, talk: t > oa && t < oa + 1.2 ? .8 : 0, gesture: .4 });
  s.p.set(t, { x: 820, y: 1110, s: 1.2, pose: C.poseAt(t, [[0, 'phone'], [oa + .6, 'receive'], [ta, 'give']]), expr: t > oa ? 'surprised' : 'smile', turn: .6, gesture: .3 });
  const k = E.ioC(prog(t, ta - .6, ta)); s.card.setAttribute('transform', `translate(${lerp(1000, 1380, k)},${lerp(780, 700, k) - Math.sin(Math.PI * k) * 60}) rotate(${lerp(-14, 8, k)}) scale(${lerp(.9, .7, k)})`);
  s.ok.textContent = t > ta + .15 ? 'APPROVED' : ''; P(s.bubble, { x: 1130, y: 300, o: E.outC(prog(t, oa, oa + .3)) * (1 - prog(t, ta + .8, ta + 1.1)), s: E.outB(prog(t, oa, oa + .4)) }); pop(s.ic.g, 1260, 560, t, stamp ? 1e9 : ta + .2, { spin: 20 }); s.ic.draw(prog(t, ta + .2, ta + .7));
  if (s.st) { G(s.st.g, 1060, 600); s.st.set(prog(t, stampAt, stampAt + .2)); }
  if (s.ti) { s.ti.set(t, titleAt || a + .5); P(s.ti.el, { x: 960, y: 110, o: prog(t, a, a + .3) }); }
  s.w.camera({ x: lerp(-80, 40, prog(t, a, b)), y: 60, zoom: lerp(1.12, 1.24, E.ioS(prog(t, a, b))), focus: 1, dof: .8 });
  tpl.once(s, [[oa, 'pop', .35], [ta - .5, 'swish', .35], [ta, 'tap', .5], [ta + .15, 'ding', .35], [ta + .2, 'pop', .4], stamp && [stampAt, 'stamp', .5]]);
}, tr); }

/** H3: months tear off a calendar; each month an instalment flies from Thandi's wallet into the shop's till; the total counts up */
function monthsShot(a, b, { months = 12, monthly = 548, total, title, titleAt, totalAt, startY = 2026, m0 = 10, label = 'PAID SO FAR', per: per0, noCount = false, save = false, tr = { in: 'bands', tin: .5 } } = {}) { shot(a, b + .35, ({ root, world }) => { const w = world(); const g = tpl.bg(w, {}); const L = w.layer(1, { w: 1920, h: 1080 });
  const cal = C.calendarPage(L.svg, L.defs, { w: 330, h: 380, accent: RED }); G(cal.g, 960, 470);
  const wal = C.icon(L.svg, L.defs, 'wallet', { r: 90, bg: '#fff', fg: BG }); wal.draw(1); G(wal.g, 330, 520); const shop = C.icon(L.svg, L.defs, save ? 'bag' : 'shop', { r: 90, bg: save ? GREEN : GOLD, fg: BG }); shop.draw(1); G(shop.g, 1590, 520);
  const arcs = C.dashArc(L.svg, L.defs, [400, 470], [1520, 470], { lift: .55, color: GOLD, width: 5 });
  const flyers = Array.from({ length: 6 }, () => { const n = C.coin(L.svg, L.defs, { r: 34, label: 'R' }); return C.flyer(L.svg, n.g, [400, 470], [1520, 470], { lift: .55, color: GOLD, trail: 8 }); });
  const u = C.ui(root); const od = C.odometer(u, { digits: 4, size: 150, color: GOLD, prefix: 'R' }); const lab = el('div', { class: 'abs' }, u, label); lab.style.cssText += "font:800 44px/1 'Barlow Condensed';letter-spacing:.2em;color:#fff";
  const per = el('div', { class: 'abs' }, u, per0 || `${fmtR(monthly)} A MONTH`); per.style.cssText += `font:800 46px/1 'Barlow Condensed';color:${BG};background:${GOLD};padding:10px 22px;border-radius:12px;letter-spacing:.06em`;
  const ti = title ? tpl.hl(u, title, 66) : null; const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']; return { w, g, cal, wal, shop, arcs, flyers, od, lab, per, ti, MON };
}, (s, lt, t) => { s.g.set(t); const t0 = a + .5, t1 = (totalAt ?? b - 1.2); const k = clamp((t - t0) / (t1 - t0)); const m = Math.min(months, Math.floor(k * months + 1e-6)); const fk = (k * months) % 1;
  const mi = (m0 + m) % 12; const yr = startY + Math.floor((m0 + m) / 12); s.cal.set(s.MON[mi], String(yr), k < 1 && months > 1 ? E.inQ(clamp((fk - .72) / .28)) : 0); pop(s.cal.g, 960, 470, t, a + .1, { s: 1 });
  pop(s.wal.g, 330, 520, t, a + .15, { spin: -20 }); pop(s.shop.g, 1590, 520, t, a + .3, { spin: 20 }); s.arcs(prog(t, a + .3, a + .9), t);
  s.flyers.forEach((f, i) => { const ph = ((k * months) - i / s.flyers.length * 1.0); f(k < 1 && t > t0 ? ((ph % 1) + 1) % 1 : 0); });
  const tot = total ?? monthly * months; s.od.set(tot * E.ioS(k)); P(s.od.el, { x: 960, y: 820, o: noCount ? 0 : prog(t, a + .2, a + .5), s: 1 + .05 * Math.max(0, 1 - Math.abs(t - t1) * 4) }); P(s.lab, { x: 960, y: noCount ? 840 : 920, o: prog(t, a + .3, a + .6), s: noCount ? 1.4 : 1 }); P(s.per, { x: 960, y: 205, o: E.outC(prog(t, a + .4, a + .7)) });
  if (s.ti) { s.ti.set(t, titleAt || a + .5); P(s.ti.el, { x: 960, y: 105, o: prog(t, a, a + .3) }); }
  s.w.camera({ zoom: lerp(1.0, 1.08, E.ioS(prog(t, a, b))), rot: noise1(t * .2, 7) * .4 });
  if (!s.__c) { s.__c = 1; cue(a, 'swish', .35); for (let i = 0; i < Math.min(months, 14); i++) { const tt = t0 + (i + .5) / months * (t1 - t0); if (months <= 14 || i % 2 === 0) cue(tt, 'coin', .25); } if (!noCount) cue(t1, 'impact', .35); }
}, tr); }

/** H4: one TV, then a second slides in: "nearly two TVs" */
function twoTVShot(a, b, { secondAt, title, titleAt, tr = { in: 'zoom', tin: .35 } } = {}) { shot(a, b + .35, ({ root, world }) => { const w = world(); const s = shopWorld(w, { banner: title ? '' : '36 MONTHS' }); const t1 = tvSet(s.L1.svg, s.L1.defs, { w: 560, h: 320 }), t2 = tvSet(s.L1.svg, s.L1.defs, { w: 560, h: 320 });
  const u = C.ui(root); const l1 = el('div', { class: 'abs' }, u, 'R5 000'), l2 = el('div', { class: 'abs' }, u, '+ R4 747'); [l1, l2].forEach((e, i) => e.style.cssText += `font:800 70px/1 'Barlow Condensed';color:${i ? BG : '#fff'};background:${i ? RED : 'rgba(10,10,12,.75)'};padding:10px 24px;border-radius:14px`);
  const ti = title ? tpl.hl(u, title, 72) : null; return { w, s, t1, t2, l1, l2, ti };
}, (s, lt, t) => { s.s.set(t); s.t1.set(t); s.t2.set(t + 3); const sa = secondAt ?? a + 1.2; const k = E.outB(prog(t, sa, sa + .6)); const mv = E.ioC(prog(t, sa - .2, sa + .4));
  G(s.t1.g, lerp(1200, 900, mv), 820); s.t2.g.setAttribute('transform', `translate(${lerp(2300, 1520, k)},820)`); s.t2.g.setAttribute('opacity', t > sa - .1 ? 1 : 0);
  P(s.l1, { x: lerp(960, 680, mv), y: 900, o: prog(t, a + .2, a + .5) }); P(s.l2, { x: 1290, y: 900, o: prog(t, sa + .3, sa + .6) });
  if (s.ti) { s.ti.set(t, titleAt || sa + .4); P(s.ti.el, { x: 960, y: 140, o: prog(t, a, a + .3) }); } s.w.camera({ zoom: lerp(1.22, 1.06, E.ioS(prog(t, a, b))), y: 80, focus: 1, dof: .8 });
  tpl.once(s, [[a, 'whoosh_low', .4], [sa, 'swoosh_up', .4], [sa + .5, 'thud', .45]]);
}, tr); }

/** H5: a phone close-up: a store-card statement (interest, fee, credit life) or a reminder toast */
function phoneShot(a, b, { mode = 'statement', title, titleAt, lineAts = [], toastAt, tr = { in: 'zoom', tin: .35 } } = {}) { shot(a, b + .35, ({ root, world }) => { const w = world(); const g = tpl.bg(w, {}); const L = w.layer(1, { w: 1920, h: 1080 });
  const rows = mode === 'statement' ? [['TV (sale)', 'R5 000.00'], ['Interest', 'R88.54'], ['Service fee', 'R69.00'], ['Credit life', 'R22.50'], ['New balance', 'R5 180.04']] : [['Nov', 'Interest-free offer'], ['Ends', 'Read the terms'], ['Balance', 'Clear it in time']];
  const ph = C.phone(L.svg, L.defs, { w: 380, h: 740, screenFn: (gg, sw, sh) => { sv('rect', { width: sw, height: sh, fill: '#f4f1ea' }, gg); sv('rect', { width: sw, height: 130, fill: mode === 'statement' ? '#d9483b' : '#1d1d22' }, gg);
    C.T(gg, mode === 'statement' ? 'STORE CARD' : 'REMINDERS', { x: sw / 2, y: 78, 'font-size': 38, fill: '#fff', 'font-family': 'Barlow Condensed', 'font-weight': 800, 'letter-spacing': 4 }); } });
  G(ph.g, 960, 520); const u = C.ui(root); const rr = rows.map(r => { const e = el('div', { class: 'abs' }, u, `<div style="display:flex;justify-content:space-between;width:300px;font:700 27px/1 Barlow;white-space:nowrap;color:#222;border-bottom:2px solid #ddd;padding:14px 0"><span>${r[0]}</span><span style="font-weight:800">${r[1]}</span></div>`); return e; });
  const tst = C.toast(u, mode === 'statement' ? { title: 'First month: R180 on top', sub: 'interest + fee + credit life', color: '#d9483b', iconTxt: '!' } : { title: 'Clear the store card', sub: 'before the offer ends', color: '#2f8a4a', iconTxt: '⏰' });
  const ti = title ? tpl.hl(u, title, 66) : null; return { w, g, ph, rr, tst, ti };
}, (s, lt, t) => { s.g.set(t); pop(s.ph.g, 960, 520, t, a + .05, { s: 1 }); s.ph.g.setAttribute('transform', s.ph.g.getAttribute('transform') + ` rotate(${(Math.sin(t * .6) * 2).toFixed(2)})`);
  s.rr.forEach((e, i) => { const at = lineAts[i] ?? a + .4 + i * .35; P(e, { x: 960, y: 370 + i * 92, o: E.outC(prog(t, at, at + .3)) }); });
  const ta = toastAt === null ? 1e9 : (toastAt ?? b - 1.6); P(s.tst, { x: 960, y: lerp(-80, 95, E.outB(prog(t, ta, ta + .5))), o: prog(t, ta, ta + .2) });
  if (s.ti) { s.ti.set(t, titleAt || a + .5); P(s.ti.el, { x: 960, y: 1000, o: prog(t, a, a + .3) }); } s.w.camera({ zoom: lerp(1.0, 1.1, E.ioS(prog(t, a, b))) });
  tpl.once(s, [[a, 'swish', .35], ...s.rr.map((r, i) => [lineAts[i] ?? a + .4 + i * .35, 'tick', .35]), toastAt !== null && [ta, 'notif', .45]]);
}, tr); }

// every shot shows something within 0.3 s of starting (VIDEO_REVIEWS next bar): the first item of a template is never held back
(() => { const early = (k, key) => { const f = T[k]; T[k] = (a, b, o) => { const L = o[key]; if (L && L.length && (L[0].at ?? a) > a + .35) L[0].at = a + .3; return f(a, b, o); }; };
  early('steps', 'items'); early('iconRow', 'items'); early('timeline', 'events'); early('bars', 'items'); early('person', 'icons'); early('icons', 'items'); })();

// ================= global: intro disclaimer corner (first 45 s) =================
{ const disc = el('div', { class: 'abs' }, C.stage, 'General information, not financial advice'); disc.style.cssText += "font:600 22px/1 Barlow;color:rgba(255,255,255,.7);white-space:nowrap;z-index:9003;text-shadow:0 2px 8px rgba(0,0,0,.6)";
  const R0 = window.renderAt; window.renderAt = t => { R0(t); P(disc, { x: 54, y: 1040, anchor: 'tl', o: prog(t, .6, 1.2) * (1 - prog(t, 43.5, 44.5)) }); }; }

const cuts = []; const add = (start, fn) => cuts.push([start, fn]);
const thandiP = thandi;

// ================= COLD OPEN =================
add(0, (a, b) => shopShot(a, b, { priceAt: N('thandi saved', .5), saleAt: N('1250', 1.6) - .3, saveAt: N('1250', 1.6) + .2 }));
add(X('twelve months later', 5.5), (a, b) => monthsShot(a, b, { months: 12, monthly: 548, total: 6573, totalAt: N('6570', 8.3) + .3, title: '12 MONTHS <mark>LATER</mark>', titleAt: a + .3, tr: { in: 'whip', tin: .35 } }));
add(X("thats more than the full", 10.5), (a, b) => T.bars(a, b, { title: 'MORE THAN THE <mark>FULL PRICE</mark>', titleAt: N('full price', 11.5), items: [{ label: 'FULL PRICE', value: 6250, color: BLUE, icon: 'tv', at: a + .3 }, { label: 'SHE PAID', value: 6573, color: RED, icon: 'card', at: N('full price', 11.5) }], fmt: fmtR, max: (6573) * 1.2, tr: { in: 'bands' } }));
add(X("she didnt do", 13.6), (a, b) => T.person(a, b, { char: thandiP, keys: [[0, 'shrug'], [N('millions', 16.2), 'present'], [N('store card', 20.3), 'phone']], title: 'NOTHING <mark>STRANGE</mark>', titleAt: N('strange', 14.6), icons: [{ flag: 'za', label: 'MILLIONS OF SOUTH AFRICANS', at: N('millions', 16.2) }, { icon: 'calendar', label: 'FRIDAY 27 NOVEMBER', at: N('27th', 18.3) }] }));
add(X('she put it on', 19.8), (a, b) => tillShot(a, b, { offerAt: a + .1, tapAt: N('store card', 20.6) + .1, tr: { in: 'whip', tin: .3, dir: 1 } }));
add(X("if youre planning", 21.8), (a, b) => T.flapTitle(a, b, { kicker: 'BUYING ON CREDIT THIS MONTH?', lines: ['SAVE', 'HUNDREDS OF RAND'], accentLine: 1, icon: 'coins', tr: { in: 'bands' } }));
add(X('so where did', 27.5), (a, b) => T.flapTitle(a, b, { lines: ['WHERE DID', 'THE MONEY GO?'], icon: 'wallet', tr: { in: 'flash', tin: .25 } }));
add(X('in this video', 29.4), (a, b) => T.icons(a, b, { kicker: 'IN THIS VIDEO', items: [{ icon: 'receipt', label: 'WHERE EVERY RAND WENT', at: N('every rand', 31.6) }, { icon: 'shop', label: 'THE COSTS AT THE TILL', at: N('nobody tells', 33.2) }] }));
add(X('and the five traps', 35.6), (a, b) => T.stat(a, b, { value: 5, label: 'TRAPS TO DODGE', icon: 'fire', kicker: 'BEFORE YOU SWIPE', at: N('five traps', 36.3) - .2, dur: .5, tr: { in: 'whip' } }));
add(X('and stay to', 38.6), (a, b) => twoTVShot(a, b, { secondAt: N('double', 42.9) - .4, title: 'STAY TO THE END: <mark>ALMOST DOUBLE</mark>', titleAt: N('almost double', 42.4), tr: { in: 'zoom', tin: .35 } }));
add(X("lets start from", 43.4), (a, b) => T.flapTitle(a, b, { lines: ["LET'S START", 'FROM ZERO'], accentLine: 1, tr: { in: 'bands' } }));

// ================= CH1: WHAT A STORE CARD IS =================
add(X('first what is', 45), (a, b) => T.flapTitle(a, b, { kicker: 'CHAPTER 1 · THE CARD', lines: ['WHAT IS A', 'STORE CARD?'], icon: 'card' }));
add(X('a store card is a loan', 47.4), (a, b) => T.person(a, b, { char: clerk, keys: [[0, 'present'], [N('lender working', 49.6), 'point']], title: 'A <mark>LOAN</mark>', titleAt: N('loan', 48.4), icons: [{ icon: 'shop', label: 'FROM THE SHOP', at: N('from the shop', 48.7) }, { icon: 'bank', label: 'OR A LENDER WORKING WITH IT', at: N('lender working', 49.6) }], side: 'right' }));
add(X('you get a limit', 52), (a, b) => T.stat(a, b, { value: 8000, prefix: 'R', label: 'YOUR LIMIT (EXAMPLE)', icon: 'card', at: N('8000', 53.6) - .3, dur: .8 }));
add(X('you can buy up', 54.8), (a, b) => T.timeline(a, b, { title: 'BUY NOW, <mark>PAY LATER</mark>', titleAt: N('pay it back', 56.6), events: [{ label: 'NOW', sub: 'buy up to your limit', at: N('buy up', 55.3) }, { label: 'LATER', sub: 'pay back a bit every month', at: N('pay it back', 56.6) }], tr: { in: 'whip' } }));
add(X('the law calls', 59.5), (a, b) => T.quote(a, b, { text: 'The law calls it a <mark>credit facility</mark>', who: 'National Credit Act', markAt: N('credit facility', 60.9) }));
add(X('it works like', 62.1), (a, b) => T.iconRow(a, b, { title: 'LIKE A <mark>CREDIT CARD</mark>…', titleAt: N('credit card', 63.3), items: [{ icon: 'card', label: 'WORKS LIKE A CREDIT CARD', at: N('credit card', 63.3) }, { icon: 'shop', label: 'ONLY AT THAT SHOP', at: N('only use', 64.6) }, { icon: 'bag', label: 'OR ITS GROUP OF SHOPS', at: N('group of', 66.2) }], tr: { in: 'bands' } }));
add(X('why do shops', 68), (a, b) => T.flapTitle(a, b, { lines: ['WHY SHOPS', 'LIKE THEM'], icon: 'shop', tr: { in: 'flash', tin: .25 } }));
add(X('because with a store', 70), (a, b) => tillShot(a, b, { title: "THE SALE DOESN'T <mark>END AT THE TILL</mark>", titleAt: N('end at the till', 72.2), offerAt: a + .2, tapAt: a + 1.9 }));
add(X('every month you take', 73.7), (a, b) => monthsShot(a, b, { months: 6, monthly: 0, noCount: true, per: 'EVERY MONTH YOU TAKE TO PAY', label: 'THE LENDER EARNS INTEREST + FEES', title: "THAT'S <mark>THE BUSINESS</mark>", titleAt: N('business', 78.4), totalAt: b - .4 }));
add(X("and its why the card", 79), (a, b) => T.person(a, b, { char: thandiP, keys: [[0, 'celebrate'], [N('at the till', 80.6), 'phone']], expr: 'happy', title: 'OFFERED WHEN YOU\'RE <mark>EXCITED</mark>', titleAt: N('excited', 82), icons: [{ icon: 'card', label: 'AT THE TILL', at: N('at the till', 80.6) }, { icon: 'star', label: 'RIGHT AT THE DEAL', at: N('excited', 82) }], tr: { in: 'whip' } }));
add(X("and heres the part", 83.8), (a, b) => T.flapTitle(a, b, { lines: ['WHAT MOST', 'PEOPLE MISS'], icon: 'receipt', tr: { in: 'bands' } }));
add(X('the price on the shelf', 86.1), (a, b) => T.compare(a, b, { title: 'SHELF PRICE ≠ <mark>WHAT YOU PAY</mark>', titleAt: N('the price you pay', 87.9), left: { label: 'WHAT YOU PAY', coins: 18 }, right: { label: 'SHELF PRICE', coins: 9 }, at: N('the price you pay', 87.9) - .2 }));
add(X('when you pay later', 89.4), (a, b) => T.icons(a, b, { title: 'THE COST HAS <mark>3 PARTS</mark>', titleAt: N('three parts', 94.8), items: [{ icon: 'tv', label: 'THE SHELF PRICE', at: N('shelf price plus', 91.2) }, { icon: 'coins', label: '+ THE COST OF BORROWING', at: N('cost of borrowing', 92.3) }], tr: { in: 'whip' } }));

// ================= CH2: THE THREE COSTS =================
add(X('part one', 96.2), (a, b) => T.flapTitle(a, b, { kicker: 'CHAPTER 2 · THE COSTS', lines: ['PART 1:', 'INTEREST'], accentLine: 1, icon: 'percent' }));
add(X('interest is the price', 98), (a, b) => T.person(a, b, { char: thandiP, keys: [[0, 'think'], [N('percentage', 100.5), 'count']], expr: 'focus', title: 'THE PRICE OF <mark>BORROWING</mark>', titleAt: N('borrowing money', 99.4), icons: [{ icon: 'percent', label: 'A % OF WHAT YOU OWE', at: N('percentage', 100.5) }, { icon: 'calendar', label: 'EVERY YEAR', at: N('every year', 102.3) }] }));
add(X('the national credit act', 103), (a, b) => T.iconRow(a, b, { kicker: 'NATIONAL CREDIT ACT', title: 'THE LEGAL <mark>MAXIMUM</mark>', titleAt: N('maximum for', 104.6), items: [{ icon: 'bank', label: "RESERVE BANK'S REPO RATE", at: N('repo rate plus', 106.8) }, { icon: 'up', label: '+ 14% A YEAR', at: N('plus 14', 108) }], tr: { in: 'whip' } }));
add(X('right now the repo', 109.6), (a, b) => T.flapTitle(a, b, { kicker: 'REPO RATE · SINCE 25 SEPTEMBER 2026', lines: ['REPO RATE', '7.25%'], accentLine: 1, flag: 'za', tr: { in: 'flash', tin: .25 } }));
add(X('so the maximum is', 113), (a, b) => T.bars(a, b, { title: 'STORE-CARD MAXIMUM: <mark>21.25% A YEAR</mark>', titleAt: N('2125', 114.6) + .3, items: [{ label: 'REPO RATE', value: 7.25, color: BLUE, icon: 'bank', at: a + .3 }, { label: '+ THE LAW', value: 14, color: '#b9b3a8', icon: 'up', at: a + .8 }, { label: 'STORE-CARD MAX', value: 21.25, color: GOLD, icon: 'card', at: N('2125', 114.6) }], max: 25.5, fmt: v => v.toFixed(2) + '%', src: 'SARB, Sept 2026 · NCA regulations, reg 42' }));
add(X('to feel that', 116.9), (a, b) => T.receipt(a, b, { title: 'A YEAR OF WAITING', person: thandiP, pose: 'worried', lines: [{ label: 'You owe', amount: 'R5 000', at: Math.min(N('5000', 118.8), a + .4) }, { label: 'For', amount: '12 months', at: N('whole year', 119.9) }, { label: 'Payments', amount: 'R0', at: N('without paying', 120.6) }], total: { label: 'INTEREST', amount: '?', at: N('without paying', 120.6) + .6 } }));
add(X('and the interest alone', 121.7), (a, b) => T.stat(a, b, { value: 1060, prefix: 'R', label: 'INTEREST IN ONE YEAR', kicker: 'MORE THAN', icon: 'percent', at: N('1060', 123.6) - .3, dur: .8, title: 'Just for <mark>waiting</mark>', titleAt: N('waiting', 125.9), tr: { in: 'zoom' } }));
add(X('and because the cap', 126.8), (a, b) => T.flapTitle(a, b, { lines: ['THE CAP', 'MOVES'], accentLine: 1, icon: 'up', sub: 'It moves with the <mark>repo rate</mark>', subAt: N('repo rate it', 128.7), tr: { in: 'bands' } }));
add(X('the next decision', 131.6), (a, b) => T.timeline(a, b, { title: 'NEXT RATE DECISION: <mark>19 NOVEMBER</mark>', titleAt: N('19th', 133.6), events: [{ label: '19 NOV', sub: 'Reserve Bank decision', at: N('19th', 133.6) }, { label: '27 NOV', sub: 'Black Friday, 8 days later', at: N('eight days', 135) }], tr: { in: 'whip' } }));
add(X('part two', 136.7), (a, b) => T.flapTitle(a, b, { lines: ['PART 2:', 'SERVICE FEE'], accentLine: 1, icon: 'calendar', tr: { in: 'bands' } }));
add(X('many store cards charge', 139.4), (a, b) => phoneShot(a, b, { title: 'A FEE FOR <mark>HAVING THE ACCOUNT</mark>', titleAt: N('having the account', 141.4), lineAts: [a + .3, a + .5, N('just for having', 140.9), a + 1.6], toastAt: null }));
add(X('the legal maximum is 69', 142.5), (a, b) => T.stat(a, b, { value: 69, prefix: 'R', label: 'A MONTH, INCLUDING VAT', kicker: 'LEGAL MAXIMUM', icon: 'receipt', at: N('69', 144) - .3, dur: .7, src: 'NCA fee limits (R60 + VAT)' }));
add(X('at the maximum thats', 146.6), (a, b) => monthsShot(a, b, { months: 12, monthly: 69, total: 828, label: 'SERVICE FEES IN A YEAR', title: 'UP TO <mark>R828 A YEAR</mark>', titleAt: N('828', 148.4), totalAt: N('828', 148.4) + .2, tr: { in: 'whip', tin: .35 } }));
add(X('part three', 150.1), (a, b) => T.flapTitle(a, b, { lines: ['PART 3:', 'CREDIT LIFE'], accentLine: 1, icon: 'lock', tr: { in: 'bands' } }));
add(X('it covers what', 152.7), (a, b) => T.icons(a, b, { title: 'IT COVERS <mark>WHAT YOU OWE</mark>', titleAt: N('what you owe if', 153.6), items: [{ icon: 'person', label: 'IF YOU DIE', at: N('die', 155) }, { icon: 'lock', label: 'IF YOU BECOME DISABLED', at: N('disabled', 156) }, { icon: 'bag', label: 'IF YOU LOSE YOUR JOB', at: N('lose your job', 157) }] }));
add(X('the cap is 4', 158), (a, b) => T.stat(a, b, { value: 4, prefix: 'R', suffix: '.50', label: 'A MONTH PER R1 000 OWED', kicker: 'LEGAL MAXIMUM', icon: 'lock', at: N('4 rand 50', 158.9) - .3, dur: .6, src: 'Credit Life Insurance Regulations, 2017', tr: { in: 'zoom' } }));
add(X('it can be useful', 162.9), (a, b) => T.bars(a, b, { title: 'MORE DEBT = <mark>MORE COVER COST</mark>', titleAt: N('the more you owe', 166.4), items: [{ label: 'OWE R1 000', value: 4.5, color: GREEN, at: a + .4 }, { label: 'OWE R5 000', value: 22.5, color: GOLD, at: N('the more you owe', 166.4) - 1 }, { label: 'OWE R8 000', value: 36, color: RED, at: N('the more you owe', 166.4) }], max: 43, fmt: v => 'R' + v.toFixed(2), src: 'Credit life a month, at the R4.50 per R1 000 cap', tr: { in: 'whip' } }));
add(X('the longer you owe', 168.9), (a, b) => T.flapTitle(a, b, { lines: ['THE LONGER', 'YOU OWE…'], accentLine: 1, icon: 'clock', sub: '…the more <mark>you pay</mark>', subAt: N('the more you pay', 170.6), tr: { in: 'flash', tin: .25 } }));
add(X('and if you open', 171.8), (a, b) => T.person(a, b, { char: clerk, keys: [[0, 'present'], [N('initiation', 175.6), 'give']], title: 'A <mark>NEW ACCOUNT?</mark>', titleAt: N('brand new', 173.3), icons: [{ icon: 'card', label: 'BRAND NEW ACCOUNT', at: N('brand new', 173.3) }, { icon: 'receipt', label: 'ONCE-OFF INITIATION FEE', at: N('initiation', 175.6) }], side: 'right' }));
add(X('up to 1207', 177), (a, b) => T.stat(a, b, { value: 1207, prefix: 'R', suffix: '.50', label: 'MAXIMUM INITIATION FEE', kicker: 'ONCE-OFF · NEW ACCOUNTS', icon: 'receipt', at: N('1207', 177.4) - .2, dur: .9, src: 'NCA fee limits (R1 050 + VAT)', tr: { in: 'whip' } }));
add(X('small numbers', 180.7), (a, b) => T.iconRow(a, b, { title: 'NOW WATCH THEM <mark>ADD UP</mark>', titleAt: N('together', 184.2), items: [{ icon: 'percent', label: 'INTEREST', at: a + .3 }, { icon: 'receipt', label: 'SERVICE FEE', at: a + .7 }, { icon: 'lock', label: 'CREDIT LIFE', at: a + 1.1 }], tr: { in: 'bands' } }));

// ================= CH3: THANDI'S TV =================
add(X('back to thandi', 185.7), (a, b) => shopShot(a, b, { title: "CHAPTER 3 · <mark>THANDI'S TV</mark>", titleAt: a + .4, priceAt: N('6250', 188.5), saleAt: N('5000', 192.6) - .2, saveAt: N('5000', 192.6) + 1, tr: { in: 'bands', tin: .5 } }));
add(X("thats 20 off", 194.6), (a, b) => T.fromTo(a, b, { title: '20% OFF: <mark>SHE "SAVES" R1 250</mark>', titleAt: N('1250', 198.2) + .3, left: { value: 6250, prefix: 'R', label: 'WAS', at: a + .3 }, right: { value: 5000, prefix: 'R', label: 'BLACK FRIDAY', at: N('20 off', 195) + .4 }, iconL: 'tv', iconR: 'tv', mult: 'SAVE R1 250', multAt: N('1250', 198.2) }));
add(X('she already has', 200.5), (a, b) => tillShot(a, b, { title: 'ON THE CARD, <mark>OVER 12 MONTHS</mark>', titleAt: N('twelve months', 205.3), offerAt: a + .2, tapAt: N('puts it on', 202.6) + .3, bubble: '“Twelve months?”' }));
add(X('lets say her card', 206.5), (a, b) => T.steps(a, b, { title: 'AT THE <mark>LEGAL MAXIMUM</mark>', titleAt: N('maximum the law', 207.8), items: [{ text: '21.25% interest a year', at: a + .3, icon: 'percent' }, { text: 'R69 service fee a month', at: a + .9, icon: 'receipt' }, { text: 'R4.50 credit life per R1 000', at: a + 1.5, icon: 'lock' }] }));
add(X('her instalment', 210.2), (a, b) => T.stat(a, b, { value: 466, prefix: 'R', label: 'INSTALMENT A MONTH', kicker: 'PRICE + INTEREST, 12 MONTHS', icon: 'calendar', at: N('466', 212.8) - .3, dur: .8 }));
add(X('add the 69', 215.3), (a, b) => T.receipt(a, b, { title: "THANDI'S MONTH", person: thandiP, pose: 'phone', lines: [{ label: 'Instalment', amount: 'R466.17', at: a + .2 }, { label: 'Service fee', amount: 'R69.00', at: N('69 rand service', 215.6) + .3 }, { label: 'Credit life (avg)', amount: 'R12.58', at: N('credit life', 217.8) }], total: { label: 'A MONTH', amount: 'R547.75', at: N('548', 220.4) }, sub: 'About <mark>R548 a month</mark>', subAt: N('548', 220.4) + .4 }));
add(X('after twelve months', 223), (a, b) => monthsShot(a, b, { months: 12, monthly: 548, total: 6573, title: 'AFTER <mark>12 MONTHS</mark>', titleAt: a + .4, totalAt: N('6570', 225.6) + .3 }));
add(X("thats about 1570", 227.8), (a, b) => T.bars(a, b, { title: '<mark>R1 570 MORE</mark> THAN THE SALE PRICE', titleAt: N('1570', 228.4) + .5, items: [{ label: 'SALE PRICE', value: 5000, color: GREEN, icon: 'tv', at: a + .3 }, { label: 'SHE PAID', value: 6573, color: RED, icon: 'card', at: N('1570', 228.4) }], fmt: fmtR, max: (6573) * 1.2, tr: { in: 'whip' } }));
add(X('her 1250', 232.7), (a, b) => T.compare(a, b, { title: 'DISCOUNT GONE: MORE THAN <mark>FULL PRICE</mark>', titleAt: N('full price on', 236.8), left: { label: 'SHE PAID R6 573', coins: 20 }, right: { label: 'FULL PRICE R6 250', coins: 17 }, at: N('full price on', 236.8) - .3 }));
add(X('and remember that', 239.6), (a, b) => T.flapTitle(a, b, { kicker: 'THE OTHER VERSION', lines: ['ALMOST', 'DOUBLE'], accentLine: 1, icon: 'fire', tr: { in: 'flash', tin: .25 } }));
add(X('the salesperson says', 243.6), (a, b) => tillShot(a, b, { banner: '36 MONTHS?', bubble: '“Make it 36 months: only R271!”', offerAt: N('make it', 245.3), tapAt: N('it sounds cheaper', 249.4), stamp: 'NOT CHEAPER', stampAt: N('it isnt', 251.6), title: 'IT SOUNDS <mark>CHEAPER</mark>', titleAt: N('sounds cheaper', 249.7) }));
add(X('over thirtysix months the', 252.9), (a, b) => monthsShot(a, b, { months: 36, monthly: 271, total: 9747, title: 'OVER <mark>36 MONTHS</mark>', titleAt: a + .4, totalAt: N('9750', 259.4) + .3 }));
add(X('for a 5000 rand tv', 261.9), (a, b) => twoTVShot(a, b, { secondAt: N('nearly two', 264.5) - .1, title: 'NEARLY <mark>TWO TVs</mark>', titleAt: N('nearly two', 264.5) + .3 }));
add(X("heres why", 270.2), (a, b) => T.stat(a, b, { value: 2484, prefix: 'R', label: 'IN SERVICE FEES ALONE', kicker: '36 MONTHS × R69', icon: 'receipt', at: N('2484', 275.5) - .3, dur: .9, tr: { in: 'zoom' } }));
add(X("thats half the tv", 278.3), (a, b) => T.bars(a, b, { title: 'HALF THE TV <mark>AGAIN</mark>', titleAt: N('half the tv', 278.9), items: [{ label: 'THE TV', value: 5000, color: BLUE, icon: 'tv', at: a + .3 }, { label: 'FEES ALONE', value: 2484, color: RED, icon: 'receipt', at: N('half the tv', 278.9) + .3 }], fmt: fmtR, max: (5000) * 1.2, src: 'Before a cent of interest' }));
add(X('lets put them', 282.1), (a, b) => T.flapTitle(a, b, { lines: ['SIDE BY', 'SIDE'], accentLine: 1, icon: 'scale', tr: { in: 'bands' } }));
add(X('cash', 284.1), (a, b) => T.bars(a, b, { title: 'SAME TV, <mark>DIFFERENT PRICES</mark>', titleAt: N('6570', 287.6) + .4, items: [{ label: 'CASH', value: 5000, color: GREEN, icon: 'wallet', at: N('5000', 284.9) }, { label: '12 MONTHS', value: 6573, color: GOLD, icon: 'calendar', at: N('6570', 287.6) }], max: 11000, fmt: fmtR, tr: { in: 'whip' } }));
add(X('thirtysix months almost', 290.4), (a, b) => T.stat(a, b, { value: 9750, prefix: 'R', label: 'OVER 36 MONTHS', kicker: 'ALMOST', icon: 'calendar', at: N('9750', 292.2) - .3, dur: .9, tr: { in: 'zoom' } }));
add(X('same tv', 294.8), (a, b) => T.iconRow(a, b, { items: [{ icon: 'tv', label: 'SAME TV', at: N('same tv', 294.8) }, { icon: 'shop', label: 'SAME SHOP', at: N('same shop', 295.9) }, { icon: 'calendar', label: 'SAME BLACK FRIDAY', at: N('same black', 296.9) }], tr: { in: 'bands' } }));
add(X('your card may', 298.5), (a, b) => phoneShot(a, b, { title: 'CHECK YOUR OWN <mark>STATEMENT</mark>', titleAt: N('statement', 301.5), toastAt: null }));
add(X('but the pattern', 302.5), (a, b) => T.bars(a, b, { title: 'THE LONGER, <mark>THE MORE YOU PAY</mark>', titleAt: N('the more you pay', 306.3), items: [{ label: '12 MONTHS', value: 6573, color: GOLD, at: a + .3 }, { label: '24 MONTHS', value: 8137, color: '#ff9a52', at: N('longer you take', 305.2) }, { label: '36 MONTHS', value: 9747, color: RED, at: N('the more you pay', 306.3) }], max: 11700, fmt: fmtR, src: 'R5 000 at the legal maximums', tr: { in: 'whip' } }));

// ================= CH4: THE FIVE TRAPS =================
add(X('so here are the five', 307.5), (a, b) => T.flapTitle(a, b, { kicker: 'CHAPTER 4 · THE TRAPS', lines: ['THE 5', 'TRAPS'], accentLine: 1, icon: 'fire', tr: { in: 'flash', tin: .25 } }));
add(X('number five', 311.1), (a, b) => T.person(a, b, { char: thandiP, keys: [[0, 'worried']], expr: 'worried', title: 'TRAP 5 KEEPS YOU PAYING FOR <mark>YEARS</mark>', titleAt: N('years', 314.6) - .6, icons: [{ icon: 'calendar', label: 'FOR YEARS', at: N('years', 314.6) - .4 }] }));
add(X('trap one', 315.4), (a, b) => T.trap(a, b, { n: 1, title: 'ONLY LOOKING AT THE MONTHLY AMOUNT', sub: '"Only R271 a month" hides the total.', icon: 'calendar', subAt: N('only 271', 318.6) }));
add(X('always ask', 322.5), (a, b) => T.quote(a, b, { text: 'What will I pay <mark>in total?</mark>', who: 'Always ask', markAt: N('in total', 324.5), tr: { in: 'whip' } }));
add(X('trap two', 325.7), (a, b) => T.trap(a, b, { n: 2, title: 'THE FAKE DISCOUNT', sub: 'A "was" price isn\'t always what it really sold for.', icon: 'percent', subAt: N('was price', 328.3), tr: { in: 'whip', tin: .3 } }));
add(X('check what it cost', 332.3), (a, b) => T.timeline(a, b, { title: 'CHECK THE <mark>EARLIER PRICE</mark>', titleAt: N('few weeks ago', 333.4), events: [{ label: 'WEEKS BEFORE', sub: 'what did it cost?', at: N('few weeks ago', 333.4) - .3 }, { label: 'BLACK FRIDAY', sub: 'is it really cheaper?', at: N('few weeks ago', 333.4) + .4 }] }));
add(X('trap three', 334.5), (a, b) => T.trap(a, b, { n: 3, title: 'A HIGHER LIMIT', sub: 'Around sales, you may be offered more credit.', icon: 'up', subAt: N('around sales', 336.8), tr: { in: 'whip', tin: .3 } }));
add(X('a bigger limit', 339.8), (a, b) => T.compare(a, b, { title: 'A BIGGER LIMIT = <mark>MORE DEBT</mark>', titleAt: N('more debt', 342.2), left: { label: 'MORE DEBT', coins: 18 }, right: { label: 'MORE MONEY', coins: 3 }, at: N('more debt', 342.2) - .3 }));
add(X('trap four', 344.1), (a, b) => T.trap(a, b, { n: 4, title: "THE INSURANCE YOU DIDN'T CHOOSE", sub: 'You can use your own policy, with the same cover.', icon: 'lock', subAt: N('own policy', 348.6), tr: { in: 'whip', tin: .3 } }));
add(X('if you already have', 352.3), (a, b) => T.person(a, b, { char: thandiP, keys: [[0, 'phoneEar']], hold: true, expr: 'focus', title: 'ALREADY COVERED? <mark>ASK.</mark>', titleAt: N('ask', 354.4) - .3, icons: [{ icon: 'lock', label: 'YOUR OWN POLICY', at: a + .3 }, { icon: 'check', label: 'SAME COVER', at: a + .8 }], side: 'right' }));
add(X('trap five', 355.2), (a, b) => T.trap(a, b, { n: 5, title: 'PAYING ONLY THE MINIMUM', sub: "It keeps the account open. It doesn't clear the debt.", icon: 'down', subAt: N('the minimum keeps', 358.5) }));
add(X('interest keeps running', 362.7), (a, b) => monthsShot(a, b, { months: 8, monthly: 0, noCount: true, per: 'ONLY THE MINIMUM, MONTH AFTER MONTH', label: 'INTEREST ON EVERYTHING YOU STILL OWE', title: 'INTEREST <mark>KEEPS RUNNING</mark>', titleAt: N('keeps running', 363.5), totalAt: b - .3 }));

// ================= CH5: HOW TO SHOP WITHOUT THE TRAP =================
add(X('heres how to shop', 366.7), (a, b) => T.flapTitle(a, b, { kicker: 'CHAPTER 5 · STEP BY STEP', lines: ['SHOP WITHOUT', 'THE TRAP'], accentLine: 1, icon: 'check', tr: { in: 'bands' } }));
add(X('step one', 370.3), (a, b) => T.steps(a, b, { title: 'STEP 1: <mark>MAKE A LIST</mark>', titleAt: N('make a list', 371.4), items: [{ text: 'What you actually need', at: N('actually need', 374.6), icon: 'cart' }, { text: "The most you'll spend", at: N('most youll', 375.8), icon: 'wallet' }] }));
add(X('step two', 377.2), (a, b) => T.iconRow(a, b, { kicker: 'STEP 2', title: 'CHECK THE <mark>REAL PRICE</mark>', titleAt: N('real price', 378.6), items: [{ icon: 'calendar', label: 'A FEW WEEKS BEFORE', at: N('few weeks before', 380.6) }, { icon: 'shop', label: 'SHOP 1', at: N('compare', 382.3) }, { icon: 'shop', label: 'SHOP 2', at: N('two or three', 382.7) }, { icon: 'shop', label: 'SHOP 3', at: N('three shops', 383.2) }], tr: { in: 'whip' } }));
add(X('step three', 384.5), (a, b) => T.person(a, b, { char: thandiP, keys: [[0, 'count'], [N('start saving', 388.2), 'celebrate']], expr: 'happy', title: 'STEP 3: <mark>PAY CASH</mark>', titleAt: N('pay cash', 385.8), icons: [{ icon: 'wallet', label: 'PAY CASH IF YOU CAN', at: N('pay cash', 385.8) }, { icon: 'coins', label: 'START SAVING NOW', at: N('start saving', 388.2) }] }));
add(X('if thandi had', 389.8), (a, b) => monthsShot(a, b, { months: 10, monthly: 548, total: 5480, save: true, startY: 2027, m0: 0, label: 'SAVED', per: 'R548 A MONTH, SAVED', title: 'SAVE FIRST: <mark>R5 480</mark>', titleAt: N('5480', 393.5) + .4, totalAt: N('5480', 393.5) + .2, tr: { in: 'bands', tin: .5 } }));
add(X('enough for the tv', 397), (a, b) => T.fromTo(a, b, { title: 'THE TV <mark>IN CASH</mark>, NO INTEREST', titleAt: N('no interest', 400.2), left: { value: 5480, prefix: 'R', label: 'SAVED', at: a + .3 }, right: { value: 5000, prefix: 'R', label: 'THE TV, IN CASH', at: N('in cash', 398.4) }, iconL: 'bag', iconR: 'tv', mult: 'R480 TO SPARE', multAt: N('to spare', 399.3) }));
add(X("thats the black friday deal", 401.9), (a, b) => T.flapTitle(a, b, { kicker: 'THE BLACK FRIDAY DEAL', lines: ['NOBODY', 'ADVERTISES'], accentLine: 1, icon: 'star', tr: { in: 'flash', tin: .25 } }));
add(X('step four', 405.2), (a, b) => T.person(a, b, { char: clerk, keys: [[0, 'present'], [N('in writing', 408.4), 'give']], title: 'STEP 4: <mark>ASK IN WRITING</mark>', titleAt: N('in writing', 408.4), icons: [{ icon: 'receipt', label: 'THE FULL COST', at: N('full cost', 407.9) }, { icon: 'check', label: 'BEFORE YOU SIGN', at: N('before you sign', 409.2) }], side: 'right' }));
add(X('the instalment the', 411), (a, b) => T.receipt(a, b, { title: 'BEFORE YOU SIGN', person: thandiP, pose: 'think', expr: 'focus', lines: [{ label: 'Instalment', amount: '✓', at: N('the instalment', 411.1) + .2 }, { label: 'Fees', amount: '✓', at: N('the fees', 411.7) + .2 }, { label: 'Insurance', amount: '✓', at: N('the insurance', 412.4) + .2 }], total: { label: 'TOTAL', amount: '✓', at: N('the total', 413.4) + .1 }, tr: { in: 'whip' } }));
add(X('step five', 415), (a, b) => T.steps(a, b, { title: 'STEP 5: <mark>SHORTEST TERM</mark>', titleAt: N('shortest term', 416.3), items: [{ text: 'Choose the shortest term you can afford', at: N('shortest term', 416.3), icon: 'clock' }, { text: 'Pay more than the minimum every month', at: N('pay more than', 418), icon: 'up' }] }));
add(X('and if theres an', 420.8), (a, b) => phoneShot(a, b, { mode: 'reminder', title: 'INTEREST-FREE? <mark>READ THE TERMS</mark>', titleAt: N('read the terms', 421.9), lineAts: [N('interestfree offer', 421.3), N('read the terms', 421.9), N('clear it in time', 425.5)], toastAt: N('put a reminder', 427), tr: { in: 'zoom', tin: .35 } }));
add(X('and if your store cards', 428.7), (a, b) => T.person(a, b, { char: thandiP, keys: [[0, 'worried'], [N('dont add', 431.8), 'push']], expr: 'worried', title: "TOO MUCH ALREADY? <mark>DON'T ADD</mark>", titleAt: N('dont add', 431.8), icons: [{ icon: 'card', label: 'CARDS ALREADY FULL', at: N('already more', 429.5) }, { icon: 'cross', label: "DON'T ADD TO THEM", at: N('dont add', 431.8) }] }));
add(X('speak to the lender', 433), (a, b) => T.steps(a, b, { title: 'GET <mark>HELP EARLY</mark>', titleAt: N('early', 434.3), items: [{ text: 'Speak to the lender early', at: N('speak to', 433.1), icon: 'phone' }, { text: 'Or a registered debt counsellor', at: N('registered debt', 435.3), icon: 'person' }, { text: 'The National Credit Regulator lists them', at: N('national credit regulator', 437), icon: 'globe' }], tr: { in: 'whip' } }));

// ================= CH6: RECAP =================
add(X("lets recap", 439.9), (a, b) => T.flapTitle(a, b, { lines: ['RECAP'], icon: 'check', sub: 'A store card is <mark>a loan</mark>', subAt: N('a loan', 441.5), tr: { in: 'bands' } }));
add(X('what you pay is', 443), (a, b) => T.icons(a, b, { title: 'WHAT YOU <mark>REALLY PAY</mark>', items: [{ icon: 'tv', label: 'THE PRICE', at: N('the price plus', 444.2) }, { icon: 'percent', label: '+ INTEREST', at: N('plus interest', 445.1) }, { icon: 'receipt', label: '+ FEES', at: N('plus fees', 446.1) }, { icon: 'lock', label: '+ INSURANCE', at: N('plus insurance', 446.9) }], tr: { in: 'whip' } }));
add(X('the legal maximums', 448), (a, b) => T.steps(a, b, { title: 'THE LEGAL <mark>MAXIMUMS</mark> TODAY', titleAt: N('maximums today', 449.3), items: [{ text: '21.25% interest a year', at: N('2125', 451) - .1, icon: 'percent' }, { text: 'R69 a month in service fees', at: N('69 rand a month in', 452.1), icon: 'receipt' }] }));
add(X('and 4 rand 50 a month', 454.7), (a, b) => T.stat(a, b, { value: 4, prefix: 'R', suffix: '.50', label: 'A MONTH PER R1 000 · CREDIT LIFE', icon: 'lock', at: a + .3, dur: .6, tr: { in: 'zoom' } }));
add(X('for thandi a', 459.9), (a, b) => T.bars(a, b, { title: "THANDI'S <mark>R5 000 TV</mark>", titleAt: N('5000 rand tv', 460.5), items: [{ label: 'CASH', value: 5000, color: GREEN, icon: 'wallet', at: N('5000 rand tv', 460.5) }, { label: '12 MONTHS', value: 6573, color: GOLD, icon: 'calendar', at: N('6570', 462.6) }], max: 9747 * 1.2, fmt: fmtR, tr: { in: 'bands' } }));
add(X('and almost 9750', 466), (a, b) => twoTVShot(a, b, { secondAt: N('9750', 466.4) + .2, title: '36 MONTHS: <mark>ALMOST R9 750</mark>', titleAt: N('9750', 466.4) + .6 }));
add(X("thandis lesson", 470.7), (a, b) => T.compare(a, b, { title: 'THE REAL PRICE: <mark>WHAT YOU PAID AT THE END</mark>', titleAt: N('at the end', 474.2), left: { label: 'PAID AT THE END', coins: 19 }, right: { label: 'ON THE SHELF', coins: 10 }, at: N('at the end', 474.2) - .3, tr: { in: 'whip' } }));
add(X('so before you swipe', 476.9), (a, b) => tillShot(a, b, { banner: 'ASK FIRST', bubble: '“What will this cost me in total?”', offerAt: N('what will this', 480.1) - .2, tapAt: b + 5, title: 'BEFORE YOU <mark>SWIPE</mark>', titleAt: N('swipe', 478.2) }));
add(X('this video is general', 482.3), (a, b) => T.flapTitle(a, b, { lines: ['GENERAL', 'INFORMATION'], icon: 'lock', sub: 'Not financial advice. Check <mark>your own statement</mark>', subAt: N('own statement', 488), tr: { in: 'fade' } }));
add(X('if this helped', 490.1), (a, b) => T.endCard(a, END + 2.6, { line: 'New Shorts every day, a full guide every week' }));

cuts.sort((p, q) => p[0] - q[0]);
cuts.forEach(([a, fn], i) => fn(a, i + 1 < cuts.length ? cuts[i + 1][0] : END + 2.6));
window.DURATION = END + 2.6;
window.META = { music: { style: 'doc', drop: N('lets start from', 43.4), end: END + 2.5, breaks: [[N('and remember that', 239.6) - .3, N('the salesperson', 243.6)]] } };
console.warn('CUTS ' + JSON.stringify(cuts.map((c, i) => [+c[0].toFixed(2), +(i + 1 < cuts.length ? cuts[i + 1][0] : END + 2.6).toFixed(2)])));
