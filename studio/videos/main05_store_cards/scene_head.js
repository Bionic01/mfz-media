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
