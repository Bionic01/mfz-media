/* Fluxr app screens drawn in vector (11 Nov 2026). Replaces the cropped Play Store graphics, which had a phone,
   badges and pop-out cards baked in and came out cut off and off-centre inside our phones (Rodney: "not straight
   in the middle... some BS"). Drawn from the real app's layout; sharp at any zoom and animatable.

   const ui = C.appUI(g, w, h, defs, 'home' | 'redeem' | 'airtime', opts)   // draw into a phone screen group
   ui.set(t, state)                                                            // call every frame from the shot's update
     home:    { balance, from, at, dur, tap (tile index 0..7), tapAt }        balance counts from `from` to `balance`
     redeem:  { typeAt, typeDur, doneAt }                                     PIN types in, button lights, toast slides up
     airtime: { selAt }                                                        the Zimbabwe row lifts and glows
   Never draw the Bank eWallet cash-out screen or any customer data. */
'use strict';
(() => {
const C = window.CINE; const { sv, clamp, lerp, E, prog } = C;
const LIME = '#85ed70', INK = '#0d2a1f', BG0 = '#11251d', BG1 = '#0a1712', CARD = '#132a21', LINE = '#1f3d30', GREY = '#93a89e', WHITE = '#f2f7f4';
const TX = (g, s, x, y, o = {}) => { const e = sv('text', Object.assign({ x, y, fill: WHITE, 'font-family': 'Barlow', 'font-weight': 600, 'font-size': 12, 'text-anchor': 'start', 'dominant-baseline': 'alphabetic' }, o), g); e.textContent = s; return e; };
const icon = (g, name, x, y, size, color) => { const p = sv('path', { d: C.IC[name] || C.IC.star, fill: 'none', stroke: color, 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: `translate(${x},${y}) scale(${size / 48}) translate(-24,-24)` }, g); return p; };
const pill = (g, x, y, w, h, o = {}) => sv('rect', Object.assign({ x, y, width: w, height: h, rx: h / 2 }, o), g);

function statusBar(g) {
  TX(g, '9:41', 24, 24, { 'font-size': 12, 'font-weight': 700 });
  const r = sv('g', { transform: 'translate(292,15)' }, g);
  [3, 5.5, 8, 10.5].forEach((hh, i) => sv('rect', { x: i * 4.2, y: 10.5 - hh, width: 2.8, height: hh, rx: .8, fill: WHITE }, r));
  sv('path', { d: 'M21 4.5 Q27 -0.5 33 4.5 M23.2 7 Q27 3.8 30.8 7', stroke: WHITE, 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round' }, r); sv('circle', { cx: 27, cy: 9.3, r: 1.3, fill: WHITE }, r);
  sv('rect', { x: 38, y: 1.5, width: 20, height: 10, rx: 3, fill: 'none', stroke: WHITE, 'stroke-width': 1.3, opacity: .9 }, r); sv('rect', { x: 40, y: 3.5, width: 14, height: 6, rx: 1.5, fill: WHITE }, r);
}
function header(g, title) { sv('path', { d: 'M28 58 L22 64 L28 70', stroke: WHITE, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); TX(g, title, 40, 70, { 'font-size': 18, 'font-weight': 700 }); }
function caps(g, s, x, y, o = {}) { return TX(g, s, x, y, Object.assign({ 'font-size': 9.5, fill: GREY, 'font-weight': 700, 'letter-spacing': 1.4 }, o)); }

// ---------------- home ----------------
const TILES = [['phone', 'Topups', '#1d3d4a'], ['phone', 'Airtime', '#1d3d4a'], ['wifi', 'Data', '#1b4a4a'], ['bolt', 'Electricity', '#47431c'], ['voucher', 'Vouchers', '#23324e'], ['receipt', 'Pay Bills', '#45283a'], ['tv', 'DStv', '#1d3d4a'], ['flag:zw', 'Zim Services', '#1d3d2d']];
function home(g, defs, o) {
  TX(g, 'Good afternoon,', 22, 58, { 'font-size': 11, fill: GREY, 'font-weight': 500 }); TX(g, o.name || 'Thandi', 22, 80, { 'font-size': 18, 'font-weight': 700 });
  sv('circle', { cx: 322, cy: 66, r: 17, fill: '#1c4636' }, g); TX(g, 'TM', 322, 70.5, { 'font-size': 12, fill: LIME, 'font-weight': 800, 'text-anchor': 'middle' });
  caps(g, 'WALLET BALANCE', 22, 112);
  const bal = TX(g, 'R 0.00', 20, 152, { 'font-size': 38, 'font-weight': 800, 'font-family': 'Barlow', 'letter-spacing': -.5 });
  const eye = sv('g', { transform: 'translate(232,140)' }, g); sv('path', { d: 'M-9 0 Q0 -8 9 0 Q0 8 -9 0 Z', fill: 'none', stroke: GREY, 'stroke-width': 1.6 }, eye); sv('circle', { r: 2.6, fill: GREY }, eye);
  TX(g, 'Updated today at 16:57', 22, 172, { 'font-size': 10, fill: GREY, 'font-weight': 500 });
  const add = sv('g', {}, g); pill(add, 20, 186, 156, 38, { fill: LIME }); TX(add, '+  Add credit', 98, 210, { 'font-size': 14, fill: INK, 'font-weight': 700, 'text-anchor': 'middle' });
  pill(g, 184, 186, 156, 38, { fill: '#10241b', stroke: '#2a5543', 'stroke-width': 1.4 }); TX(g, '➤  Send', 262, 210, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
  caps(g, 'QUICK ACCESS', 22, 252); TX(g, 'Shortcuts', 338, 252, { 'font-size': 9.5, fill: GREY, 'text-anchor': 'end', 'font-weight': 500 });
  let cx = 20; [['voucher', 'Vouchers', 78], ['phone', 'Airtime', 70], ['wifi', 'Data', 56], ['phone', 'Topups', 70]].forEach(([n, l, w]) => { const c = sv('g', {}, g); pill(c, cx, 262, w, 28, { fill: 'none', stroke: '#2a5543', 'stroke-width': 1.2 }); icon(c, n, cx + 14, 276, 12, LIME); TX(c, l, cx + 24, 280, { 'font-size': 11, 'font-weight': 600 }); cx += w + 6; });
  caps(g, 'SERVICES', 22, 318); const tg = sv('g', { transform: 'translate(300,304)' }, g); pill(tg, 0, 0, 40, 20, { fill: '#173328', stroke: '#2a5543', 'stroke-width': 1 }); sv('rect', { x: 3, y: 3, width: 16, height: 14, rx: 7, fill: '#24503d' }, tg);
  const tiles = TILES.map(([n, l, col], i) => { const x = 20 + (i % 3) * 110, y = 328 + Math.floor(i / 3) * 106; const tgp = sv('g', { transform: `translate(${x + 50},${y + 48})` }, g);
    const card = sv('rect', { x: -50, y: -48, width: 100, height: 96, rx: 16, fill: CARD, stroke: LINE, 'stroke-width': 1 }, tgp);
    sv('rect', { x: -17, y: -32, width: 34, height: 34, rx: 10, fill: col }, tgp);
    if (n.startsWith('flag:')) { const f = C.flag(tgp, defs, n.slice(5), { r: 11, ringW: 1.5, shadow: false, gloss: false }); f.setAttribute('transform', 'translate(0,-15)'); }
    else icon(tgp, n, 0, -15, 18, WHITE);
    TX(tgp, l, 0, 24, { 'font-size': 11.5, 'font-weight': 600, 'text-anchor': 'middle' }); return { g: tgp, card, x: x + 50, y: y + 48 }; });
  const ripple = sv('circle', { r: 0, fill: LIME, opacity: 0 }, g);
  return { set(t, st = {}) {
    const v = lerp(st.from ?? 0, st.balance ?? 250, E.outE(prog(t, st.at ?? -1e9, (st.at ?? -1e9) + (st.dur ?? 1.2))));
    const [ip, fp] = v.toFixed(2).split('.'); bal.textContent = 'R ' + ip.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + '.' + fp;
    tiles.forEach((tl, i) => { const on = st.tap === i ? prog(t, st.tapAt, st.tapAt + .12) * (1 - prog(t, st.tapAt + .35, st.tapAt + .6)) : 0; tl.g.setAttribute('transform', `translate(${tl.x},${tl.y}) scale(${(1 - .06 * on).toFixed(3)})`); tl.card.setAttribute('stroke', on > .01 ? LIME : LINE); tl.card.setAttribute('stroke-width', 1 + on * 1.5); });
    if (st.tap != null) { const tl = tiles[st.tap]; const k = prog(t, st.tapAt, st.tapAt + .5); ripple.setAttribute('cx', tl.x); ripple.setAttribute('cy', tl.y); ripple.setAttribute('r', 10 + 60 * E.outC(k)); ripple.setAttribute('opacity', k > 0 && k < 1 ? .35 * (1 - k) : 0); }
    if (st.addAt != null) { const k = prog(t, st.addAt, st.addAt + .12) * (1 - prog(t, st.addAt + .3, st.addAt + .5)); add.setAttribute('transform', `translate(98,205) scale(${(1 - .05 * k).toFixed(3)}) translate(-98,-205)`); }
  } };
}

// ---------------- redeem ----------------
function redeem(g, defs, o) {
  header(g, 'Redeem a voucher');
  const logos = [['1', '#f26522', '#fff', '1Voucher'], ['OTT', '#1c9b4a', '#fff', 'OTT'], ['Blu', '#ffffff', '#2b3a8f', 'Blu'], ['FNB', '#00a0af', '#fff', 'FNB'], ['4ALL', '#101010', LIME, '4ALL']];
  logos.forEach(([s, bg, fg], i) => { const x = 20 + i * 64; sv('rect', { x, y: 88, width: 56, height: 52, rx: 13, fill: CARD, stroke: LINE }, g); sv('rect', { x: x + 10, y: 98, width: 36, height: 32, rx: 9, fill: bg }, g); TX(g, s, x + 28, 119.5, { 'font-size': s.length > 2 ? 11.5 : 17, 'font-weight': 800, fill: fg, 'text-anchor': 'middle', 'font-family': 'Barlow Condensed' }); });
  TX(g, '1Voucher, OTT, BluVoucher, FNB Voucher & 4ALL Voucher:', 22, 162, { 'font-size': 9.5, fill: GREY, 'font-weight': 500 }); TX(g, "we'll detect yours automatically.", 22, 175, { 'font-size': 9.5, fill: GREY, 'font-weight': 500 });
  TX(g, 'Voucher PIN', 22, 204, { 'font-size': 11, fill: GREY, 'font-weight': 600 });
  const box = sv('rect', { x: 20, y: 212, width: 272, height: 48, rx: 13, fill: '#0e1f18', stroke: '#2a5543', 'stroke-width': 1.6 }, g);
  const digits = TX(g, '', 34, 243, { 'font-size': 17, 'font-family': "'JetBrains Mono', monospace", 'font-weight': 700, 'letter-spacing': .5 });
  const caret = sv('rect', { x: 34, y: 228, width: 2, height: 20, fill: LIME }, g);
  sv('rect', { x: 300, y: 212, width: 40, height: 48, rx: 13, fill: CARD, stroke: LINE }, g); const cam = sv('g', { transform: 'translate(320,236)' }, g); sv('rect', { x: -9, y: -6, width: 18, height: 13, rx: 3, fill: 'none', stroke: LIME, 'stroke-width': 1.6 }, cam); sv('circle', { r: 3.4, fill: 'none', stroke: LIME, 'stroke-width': 1.6 }, cam);
  TX(g, '12–16 digits, or take a picture of the voucher.', 22, 278, { 'font-size': 9.5, fill: GREY, 'font-weight': 500 });
  const btn = pill(g, 20, 292, 320, 44, { fill: '#1a3328' }); const btxt = TX(g, 'Redeem voucher', 180, 319, { 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: '#6f8a7e' });
  const toast = sv('g', {}, g); pill(toast, 0, -21, 236, 42, { fill: '#ffffff' }); sv('circle', { cx: 22, cy: 0, r: 11, fill: '#2fb35a' }, toast); sv('path', { d: 'M16.5 0 L20.5 4 L27.5 -4', stroke: '#fff', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, toast); TX(toast, 'Credit in your wallet', 42, 5, { 'font-size': 14, 'font-weight': 700, fill: INK });
  const PIN = (o.pin || '4821 0937 5512 6604');
  return { set(t, st = {}) {
    const ta = st.typeAt ?? -1e9, td = st.typeDur ?? 1.6; const nd = Math.floor(16 * clamp(prog(t, ta, ta + td)) + 1e-6); let shown = '', c = 0; for (const ch of PIN) { if (ch === ' ') { if (c < nd) shown += ' '; continue; } if (c++ < nd) shown += ch; }
    digits.textContent = shown; const cw = shown.length * 10.6; caret.setAttribute('x', 35 + cw); caret.setAttribute('opacity', (Math.floor(t * 2.4) % 2 === 0 || (t > ta && t < ta + td)) && nd < 16 ? 1 : 0);
    box.setAttribute('stroke', t > ta - .2 ? LIME : '#2a5543'); const done = st.doneAt ?? 1e9; const on = prog(t, done - .4, done - .2);
    btn.setAttribute('fill', on > .5 ? LIME : '#1a3328'); btxt.setAttribute('fill', on > .5 ? INK : '#6f8a7e'); const pr = prog(t, done - .15, done) * (1 - prog(t, done + .1, done + .25)); btn.setAttribute('transform', `translate(180,314) scale(${(1 - .04 * pr).toFixed(3)}) translate(-180,-314)`);
    const q = E.outB(prog(t, done, done + .45)); toast.setAttribute('transform', `translate(62,${(560 - 140 * q).toFixed(1)})`); toast.setAttribute('opacity', clamp(q * 2));
  } };
}

// ---------------- airtime ----------------
function airtime(g, defs) {
  header(g, 'Buy airtime'); caps(g, 'SOUTH AFRICA', 22, 104);
  [['MTN', '#ffcb05'], ['Vodacom', '#e60000'], ['Cell C', '#f26722'], ['Telkom', '#0099ff']].forEach(([n, c], i) => { const x = 20 + (i % 2) * 164, y = 114 + Math.floor(i / 2) * 58; sv('rect', { x, y, width: 156, height: 50, rx: 13, fill: CARD, stroke: LINE }, g); sv('circle', { cx: x + 24, cy: y + 25, r: 11, fill: c }, g); TX(g, n, x + 44, y + 30, { 'font-size': 13, 'font-weight': 700 }); sv('path', { d: `M${x + 138} ${y + 20} L${x + 143} ${y + 25} L${x + 138} ${y + 30}`, stroke: GREY, 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round' }, g); });
  caps(g, 'INTERNATIONAL', 22, 258);
  const zr = sv('g', {}, g); const zc = sv('rect', { x: 20, y: 268, width: 320, height: 74, rx: 15, fill: CARD, stroke: LINE, 'stroke-width': 1 }, zr);
  const zf = C.flag(zr, defs, 'zw', { r: 15, ringW: 2, shadow: false, gloss: false }); zf.setAttribute('transform', 'translate(48,292)'); TX(zr, 'Zimbabwe Airtime', 74, 297, { 'font-size': 14, 'font-weight': 700 });
  [['Econet', '#2fb35a'], ['Telecel', '#e23b3b'], ['NetOne', '#2f6fe0']].forEach(([n, c], i) => { const x = 74 + i * 72; pill(zr, x, 310, 66, 20, { fill: '#0f2219', stroke: c, 'stroke-width': 1.2 }); sv('circle', { cx: x + 11, cy: 320, r: 4, fill: c }, zr); TX(zr, n, x + 19, 324, { 'font-size': 10, 'font-weight': 600 }); });
  sv('path', { d: 'M322 300 L327 305 L322 310', stroke: GREY, 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round' }, zr);
  sv('rect', { x: 20, y: 352, width: 320, height: 58, rx: 15, fill: CARD, stroke: LINE }, g); sv('circle', { cx: 48, cy: 381, r: 15, fill: '#1d3d4a' }, g); icon(g, 'globe', 48, 381, 17, WHITE); TX(g, 'Global Airtime', 74, 378, { 'font-size': 14, 'font-weight': 700 }); TX(g, 'Choose any country', 74, 395, { 'font-size': 10, fill: GREY, 'font-weight': 500 });
  return { set(t, st = {}) { const k = E.outB(prog(t, st.selAt ?? 1e9, (st.selAt ?? 1e9) + .4)); zr.setAttribute('transform', `translate(180,305) scale(${(1 + .045 * k).toFixed(4)}) translate(-180,-305)`); zc.setAttribute('stroke', k > .05 ? LIME : LINE); zc.setAttribute('stroke-width', 1 + k * 1.6); } };
}

// ---------------- list helpers for the other screens ----------------
const chev = (g, x, y) => sv('path', { d: `M${x} ${y - 5} L${x + 5} ${y} L${x} ${y + 5}`, stroke: GREY, 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round' }, g);
function rowCard(g, defs, y, { title, sub, flag, icon: ic, color = '#1d3d4a', h = 62 } = {}) {
  const rg = sv('g', {}, g); const card = sv('rect', { x: 20, y, width: 320, height: h, rx: 15, fill: CARD, stroke: LINE, 'stroke-width': 1 }, rg);
  if (flag) { const f = C.flag(rg, defs, flag, { r: 16, ringW: 2, shadow: false, gloss: false }); f.setAttribute('transform', `translate(50,${y + h / 2})`); }
  else { sv('circle', { cx: 50, cy: y + h / 2, r: 16, fill: color }, rg); icon(rg, ic || 'star', 50, y + h / 2, 18, WHITE); }
  TX(rg, title, 78, y + h / 2 - (sub ? 2 : -5), { 'font-size': 14, 'font-weight': 700 }); if (sub) TX(rg, sub, 78, y + h / 2 + 15, { 'font-size': 10, fill: GREY, 'font-weight': 500 }); chev(rg, 322, y + h / 2);
  return { g: rg, card, cy: y + h / 2 };
}
const glow = (r, k) => { r.card.setAttribute('stroke', k > .05 ? LIME : LINE); r.card.setAttribute('stroke-width', 1 + k * 1.6); r.g.setAttribute('transform', `translate(180,${r.cy}) scale(${(1 + .04 * k).toFixed(4)}) translate(-180,${-r.cy})`); };

// ---------------- Zim Services ----------------
function zim(g, defs) {
  const f = C.flag(g, defs, 'zw', { r: 11, ringW: 1.5, shadow: false, gloss: false }); f.setAttribute('transform', 'translate(48,64)');
  sv('path', { d: 'M28 58 L22 64 L28 70', stroke: WHITE, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g); TX(g, 'Zim Services', 66, 70, { 'font-size': 18, 'font-weight': 700 });
  TX(g, 'Everything for Zimbabwe in one place: pay in rand,', 22, 98, { 'font-size': 10, fill: GREY, 'font-weight': 500 }); TX(g, 'delivered in-country.', 22, 111, { 'font-size': 10, fill: GREY, 'font-weight': 500 });
  const tiles = [['phone', 'Airtime', 'Econet · NetOne · Telecel'], ['wifi', 'Bundles', 'Data · voice · SMS'], ['bolt', 'ZESA', 'Prepaid electricity tokens'], ['tv', 'DStv Zim', 'USD accounts · live rate']].map(([n, l, sub], i) => {
    const x = 20 + (i % 2) * 164, y = 126 + Math.floor(i / 2) * 104; const tg = sv('g', {}, g); const card = sv('rect', { x, y, width: 156, height: 96, rx: 15, fill: CARD, stroke: LINE }, tg);
    sv('rect', { x: x + 14, y: y + 14, width: 30, height: 30, rx: 9, fill: '#1d3d2d' }, tg); icon(tg, n, x + 29, y + 29, 16, LIME); TX(tg, l, x + 14, y + 64, { 'font-size': 14, 'font-weight': 700 }); TX(tg, sub, x + 14, y + 81, { 'font-size': 9, fill: GREY, 'font-weight': 500 });
    return { g: tg, card, cy: y + 48, cx: x + 78 }; });
  return { set(t, st = {}) { tiles.forEach((tl, i) => { const k = st.sel === i ? E.outB(prog(t, st.selAt ?? 1e9, (st.selAt ?? 1e9) + .4)) : 0; tl.card.setAttribute('stroke', k > .05 ? LIME : LINE); tl.card.setAttribute('stroke-width', 1 + k * 1.6); tl.g.setAttribute('transform', `translate(${tl.cx},${tl.cy}) scale(${(1 + .05 * k).toFixed(4)}) translate(${-tl.cx},${-tl.cy})`); }); } };
}
// ---------------- Buy electricity ----------------
function power(g, defs) {
  header(g, 'Buy electricity');
  const r1 = rowCard(g, defs, 92, { title: 'Eskom', sub: 'South Africa · prepaid meters', flag: 'za' });
  const r2 = rowCard(g, defs, 164, { title: 'ZESA Token', sub: 'Zimbabwe · minimum $5', flag: 'zw' });
  const r3 = rowCard(g, defs, 236, { title: 'Global Electricity', sub: 'Kenya · Malawi · Mozambique', icon: 'globe' });
  return { set(t, st = {}) { [r1, r2, r3].forEach((r, i) => glow(r, (st.sel ?? 1) === i ? E.outB(prog(t, st.selAt ?? 1e9, (st.selAt ?? 1e9) + .4)) : 0)); } };
}
// ---------------- Buy vouchers ----------------
function vouchers(g) {
  header(g, 'Buy vouchers'); pill(g, 20, 88, 320, 34, { fill: '#0e1f18', stroke: '#2a5543', 'stroke-width': 1.2 }); icon(g, 'globe', 40, 105, 12, GREY); TX(g, 'Search brands', 54, 109, { 'font-size': 11, fill: GREY, 'font-weight': 500 });
  const sec = (title, y, items) => { caps(g, title, 22, y); return items.map(([n, c], i) => { const x = 20 + (i % 2) * 164, yy = y + 10 + Math.floor(i / 2) * 44; const rg = sv('g', {}, g); const card = sv('rect', { x, y: yy, width: 156, height: 38, rx: 11, fill: CARD, stroke: LINE }, rg); sv('rect', { x: x + 9, y: yy + 8, width: 22, height: 22, rx: 6, fill: c }, rg); TX(rg, n, x + 38, yy + 24, { 'font-size': 11, 'font-weight': 600 }); return { g: rg, card, cx: x + 78, cy: yy + 19 }; }); };
  const all = [...sec('PAYMENTS', 142, [['1Voucher', '#f26522'], ['BluVoucher', '#2b3a8f'], ['EasyLoad Voucher', '#d4a017'], ['FNB Voucher', '#00a0af'], ['Flash Token', '#2fb35a'], ['OTT Voucher', '#1c9b4a']]),
    ...sec('MOBILE', 300, [['Eezi Voucher', '#e04f8a'], ['Ringas Voucher', '#e23b3b']]), ...sec('SHOPPING', 370, [['Amazon Gift Card', '#ff9900'], ['Takealot Voucher', '#0b79bf']]), ...sec('RIDES & FOOD', 440, [['Uber', '#000000']])];
  return { set(t, st = {}) { all.forEach((r, i) => { const k = st.sel === i ? E.outB(prog(t, st.selAt ?? 1e9, (st.selAt ?? 1e9) + .4)) : 0; r.card.setAttribute('stroke', k > .05 ? LIME : LINE); r.card.setAttribute('stroke-width', 1 + k * 1.6); r.g.setAttribute('transform', `translate(${r.cx},${r.cy}) scale(${(1 + .06 * k).toFixed(4)}) translate(${-r.cx},${-r.cy})`); }); } };
}
// ---------------- Pay bills ----------------
function bills(g) {
  header(g, 'Pay Bills');
  const big = [['Pay@', 'Any Pay@ bill or account', '#e23b3b'], ['EasyPay', 'Any EasyPay bill or account', '#2f6fe0']].map(([n, sub, c], i) => { const x = 20 + i * 164; const rg = sv('g', {}, g); const card = sv('rect', { x, y: 88, width: 156, height: 84, rx: 15, fill: CARD, stroke: LINE }, rg); sv('rect', { x: x + 14, y: 100, width: 30, height: 26, rx: 7, fill: c }, rg); TX(rg, n, x + 14, 146, { 'font-size': 14, 'font-weight': 700 }); TX(rg, sub, x + 14, 161, { 'font-size': 8.5, fill: GREY, 'font-weight': 500 }); return { g: rg, card, cx: x + 78, cy: 130 }; });
  caps(g, 'ACCOUNTS & TRAVEL', 22, 196);
  ['African Bank', 'Avon', 'City of Ekurhuleni', 'SABC', 'Eskom', 'Herotel', 'HomeChoice', 'StarTimes', 'Telkom', 'Vumatel'].forEach((n, i) => { const x = 20 + (i % 3) * 110, y = 206 + Math.floor(i / 3) * 70; sv('rect', { x, y, width: 100, height: 62, rx: 13, fill: CARD, stroke: LINE }, g); sv('circle', { cx: x + 50, cy: y + 22, r: 11, fill: '#1d3d4a' }, g); TX(g, n, x + 50, y + 49, { 'font-size': 9, 'font-weight': 600, 'text-anchor': 'middle' }); });
  pill(g, 20, 494, 320, 36, { fill: CARD, stroke: LINE }); TX(g, 'Other bills', 40, 517, { 'font-size': 12, 'font-weight': 600 }); chev(g, 322, 512);
  return { set(t, st = {}) { big.forEach((r, i) => { const k = (st.sel ?? 0) === i ? E.outB(prog(t, st.selAt ?? 1e9, (st.selAt ?? 1e9) + .4)) : 0; r.card.setAttribute('stroke', k > .05 ? LIME : LINE); r.card.setAttribute('stroke-width', 1 + k * 1.6); r.g.setAttribute('transform', `translate(${r.cx},${r.cy}) scale(${(1 + .05 * k).toFixed(4)}) translate(${-r.cx},${-r.cy})`); }); } };
}

const SCREENS = { home, redeem, airtime, zim, power, vouchers, bills };
C.APP_FILES = { 'phone-01-home.png': 'home', 'phone-02-redeem.png': 'redeem', 'phone-03-airtime.png': 'airtime', 'phone-04-zim.png': 'zim', 'phone-05-power.png': 'power', 'phone-06-vouchers.png': 'vouchers', 'phone-07-bills.png': 'bills' };
/** draw an app screen into g (the phone's screen group, w x h). Content is laid out on a 360-wide grid and scaled to fit. */
function appUI(g, w, h, defs, screen = 'home', opts = {}) {
  const s = w / 360; const root = sv('g', { transform: `scale(${s.toFixed(5)})` }, g); const H = h / s;
  sv('rect', { x: 0, y: 0, width: 360, height: H, fill: C.grad(defs, [[0, BG0], [1, BG1]], { x1: 0, y1: 0, x2: 0, y2: 1 }) }, root);
  sv('circle', { cx: 330, cy: -40, r: 190, fill: LIME, opacity: .05 }, root);
  statusBar(root); const ctl = (SCREENS[screen] || home)(root, defs, opts);
  // home indicator
  sv('rect', { x: 130, y: H - 14, width: 100, height: 4.5, rx: 2.25, fill: WHITE, opacity: .55 }, root);
  ctl.set(0, {}); // a sensible still picture even if the shot never calls set()
  return ctl;
}
C.appUI = appUI;
})();
