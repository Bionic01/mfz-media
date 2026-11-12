/* Fluxr Explains 02: How USSD works. v6 (12 Nov 2026): rebuilt in Look v4 (engine README): lit 3D sets (gl3d.js +
   templates3d.js), a Kurzgesagt colour script (one palette per chapter), Fireship pace (a new picture every 2-5 s,
   receipts, stamp words). Rodney 12 Nov 20:49: "It's still mid... you can take 10 hours generating a single video",
   20:54: "research... learn. Then let's go and redo the video", 21:15: "much Kurzgesagt... also like Fireship".
   Voice = the existing take (voice_master.m4a, words_all.json, LEAD 0). Theme: fluxr. */
const C = CINE; const T3 = C.T3; const GL = C.GL; const { shot, cue, E, prog, clamp, lerp, el, P } = C;
const BASE = window.SCENE.replace(/[^/]+$/, ''); const KIT = '/home/claude/fluxr-posts/kit/';
const V = C.voice(C.loadJSON(BASE + 'words_all.json'), 0);
function N(txt, near) { const k = txt.toLowerCase().replace(/[^a-z0-9#* ]/g, '').split(' '); const W = V.words; let best = null;
  for (let i = 0; i < W.length; i++) { let ok = true; for (let j = 0; j < k.length; j++) if (!W[i + j] || W[i + j].w !== k[j]) { ok = false; break; } if (ok && (best === null || Math.abs(W[i].a - near) < Math.abs(best - near))) best = W[i].a; }
  if (best === null || Math.abs(best - near) > 3) console.error('N miss: ' + txt + ' @' + near + ' -> ' + best); return best ?? near; }
const X = (txt, near) => N(txt, near) - .12;
C.setTheme('fluxr'); const LIME = '#85ed70', GOLD = '#ffcf3a', CYAN = '#4ff0ff', PINK = '#ff7ad9', RED = '#ff4f7a';
const END = V.end;
window.META = { music: { style: 'amapiano', drop: 44.0, end: END + 2.5, breaks: [[374.2, 376.9]] } };
C.initFX({ grain: 0, vignette: 0 }); GL.noCssFx(); // the film look (vignette, grain, leak) runs inside the GL pass
el('div', { class: 'bug' }, C.stage, `<img src="${KIT}logos/fluxr-white.png" style="height:34px"> <span style="opacity:.8">EXPLAINS</span>`);
GL.loadTex('fluxr', KIT + 'logos/fluxr-white.png');
[['v1', '1voucher.png'], ['ott', 'ott-voucher.png'], ['blu', 'blu-voucher.png'], ['fnb', 'fnb-voucher.png'], ['4all', '4all-voucher.png']].forEach(([k, f]) => GL.loadTex(k, KIT + 'logos/' + f));

// digits spoken in order -> [[t, key]]
function digits(list, after) { const ev = []; let af = after; list.forEach(([wd, ch]) => { const tt = V.at(wd, af); af = tt + .01; ev.push([tt, ch]); }); return ev; }
const LCD = (lines, title, extra = {}) => Object.assign({ title, lines, soft: ['Back', 'Reply'] }, extra);
const MENU = LCD(['1 Check balance', '2 Buy a bundle', '3 Send money', '4 My account'], 'MENU');

const cuts = []; const add = (start, fn) => cuts.push([start, fn]);

// ======================= COLD OPEN (night: indigo + cyan) =======================
const D1 = digits([['star', '*'], ['one', '1'], ['five', '5'], ['one', '1'], ['hash', '#']], 0);
const D2 = digits([['star', '*'], ['three', '3'], ['three', '3'], ['four', '4'], ['hash', '#']], D1[4][0] + .1);
add(0, (a, b) => T3.phone(a, b, { pal: 'night', cam: 'macro', dial: D1, send: D1[4][0] + .15,
  screen: t => t < D1[4][0] + .35 ? { input: GL.typedAt(t, D1), cursor: Math.floor(t * 3) % 2 === 0, soft: ['', 'Call'] } : LCD(['1 Send money', '2 Buy airtime', '3 Pay a bill', '4 My wallet'], 'ECOCASH'),
  tags: [{ text: 'ZIMBABWE · ECOCASH', at: D1[4][0] + .2, anchor: [0, .66, 0], dx: 420 }], tr: { in: 'fade', tin: .5 } }));
add(D2[0][0] - .35, (a, b) => T3.phone(a, b, { pal: 'night', smart: true, cam: 'right', phoneScale: 1.3, send: D2[4][0] + .15, phoneOpts: { resW: 540, resH: 1080 },
  screen: t => t < D2[4][0] + .35 ? { dialer: GL.typedAt(t, D2), hiKey: (D2.filter(([q]) => t >= q && t < q + .2).pop() || [])[1] } : { lines: ['M-PESA', '1 Send money', '2 Withdraw cash', '3 Buy airtime', '4 Pay bill'], hi: -1, buttons: ['CANCEL', 'SEND'] },
  key: t => (t < D2[4][0] + .35 ? GL.typedAt(t, D2) + (D2.filter(([q]) => t >= q && t < q + .2).pop() || [])[1] : 'menu'), dial: D2,
  side: { html: '<span style="color:#4ff0ff">*334#</span>', at: D2[4][0] + .1, x: 640, size: 170, sub: 'KENYA · M-PESA', subAt: D2[4][0] + .35 }, tr: { in: 'whip' } }));
add(X('across africa', 6.6), (a, b) => T3.map(a, b, { pal: 'night', landCol: '#1b1a4a', edgeCol: '#4a4aa0', hl: { ZWE: '#4ff0ff', KEN: GOLD }, raise: [['ZWE', a + .3], ['KEN', a + .6]], focus: [27, -9], dist: 12, push: .78,
  codes: [{ lon: 30, lat: -19, text: '*151#', at: a + .4, col: CYAN }, { lon: 38, lat: 0.5, text: '*334#', at: a + .8, col: GOLD }],
  title: 'CODES THAT OPEN THE DOOR TO <mark>PEOPLE\'S MONEY</mark>', titleAt: N('the door', 9.2), tr: { in: 'zoom' } }));
add(X('subsaharan africa now', 11.3), (a, b) => T3.dotMap(a, b, { pal: 'gold', isos: null, n: 7000, at: a + .2, dur: 2.6, value: '1 BILLION+', label: 'MOBILE MONEY ACCOUNTS', vx: 1440, vy: 380, src: 'GSMA, State of the Industry Report on Mobile Money 2025 (Sub-Saharan Africa, 2024)', tr: { in: 'flash', tin: .25 } }));
add(X('and a few years ago', 16.9), (a, b) => T3.receipt(a, b, { pal: 'cyan', source: 'GSMA · State of the Industry Report on Mobile Money 2018', lines: ['In Africa, “over 90 per cent of', 'mobile money transactions are', 'still driven by USSD”'], mark: 'over 90 per cent of', markAt: N('ninety percent', 20.4), foot: 'Page 22', tr: { in: 'whip' } }));
add(X('were still driven', 23.5), (a, b) => T3.number(a, b, { pal: 'cyan', text: '>90%', at: a + .15, label: 'DRIVEN BY ONE TECHNOLOGY', props: 'phones', tr: { in: 'zoom' } }));
add(X('not apps', 26.8), (a, b) => T3.phone(a, b, { pal: 'steel', smart: true, cam: 'left', phoneOpts: { resW: 540, resH: 1080 }, screen: t => ({ dim: .1 }), key: () => 'apps',
  side: { html: '<s style="text-decoration-thickness:10px;text-decoration-color:#ff4f7a">NOT APPS</s>', at: N('not apps', 26.8), x: 1260, sub: '<s style="text-decoration-color:#ff4f7a">NOT THE INTERNET</s>', subAt: N('not the internet', 27.8) }, tr: { in: 'flash', tin: .2 } }));
add(X('short codes that', 29.1), (a, b) => T3.phone(a, b, { pal: 'night', cam: 'low', dial: [[a + .25, '*'], [a + .9, '#']], screen: t => ({ input: t > a + .9 ? '*  #' : t > a + .25 ? '*' : '', soft: ['', 'Call'] }), key: t => (t > a + .9) * 2 + (t > a + .25),
  side: { html: 'SHORT CODES<br><span style="color:#4ff0ff">YOU DIAL</span>', at: a + .2, x: 1350, size: 130 }, tr: { in: 'whip', dir: -1 } }));
add(X('in nigeria those', 31.4), (a, b) => T3.versus(a, b, { pal: 'purple', left: { prop: 'bank', label: 'BANKS', at: N('banks and phone', 34.6), scale: .55 }, right: { prop: 'tower', opts: { h: 5 }, label: 'PHONE NETWORKS', at: N('phone networks argued', 35.3) },
  link: 'beam', linkAt: N('argued', 36.2), mid: { html: '4 YEARS', at: N('four years', 37.4), size: 120 }, kicker: 'NIGERIA', title: 'WHO SHOULD <mark>PAY FOR THE CODES?</mark>', titleAt: N('who should pay', 38.3), tr: { in: 'bands', colors: [PINK, GOLD, '#2a1442'] } }));
add(X('a bill that grew', 40.3), (a, b) => T3.pile(a, b, { pal: 'purple', to: 210, at: a + .1, dur: 2.6, noteCol: '#3f7f5a', noteVal: '₦1000', count: { from: 0, to: 300, fmt: v => '≈ ₦' + Math.round(v) + ' BILLION' }, label: 'THE BILL', src: 'Nigeria CommunicationsWeek; Nairametrics', tr: { in: 'zoom' } }));
add(X('the technology is called', 44.1), (a, b) => T3.title(a, b, { pal: 'cyan', kicker: 'THE TECHNOLOGY', lines: ['USSD'], size: 2.4, prop: 'phone', propOpts: { scale: 1.4, pos: [3.6, 1.8, -3.6] }, tr: { in: 'flash', tin: .25 } }));
add(X('in 1995', 49.3) - .25, (a, b) => T3.number(a, b, { pal: 'cyan', text: '1995', at: a + .1, label: 'WRITTEN INTO THE MOBILE PHONE STANDARD', props: 'phones', tr: { in: 'whip' } }));
add(X('so how does a code', 51.5), (a, b) => T3.title(a, b, { pal: 'night', lines: ['A 90s CODE', 'STILL MOVES MONEY?'], accentLine: 1, size: .95, prop: 'coins', propOpts: { n: 14, pos: [0, 0, -3.4], scale: 2.2 }, tr: { in: 'zoom' } }));
add(X('lets find out', 56.7), (a, b) => T3.title(a, b, { pal: 'night', lines: ['LET\'S', 'FIND OUT'], accentLine: 1, size: 1.4, prop: 'tower', propOpts: { h: 7, pos: [4.6, 0, -5] }, tr: { in: 'flash', tin: .2 } }));

// ======================= CH1: WHAT IS USSD (cyan) =======================
add(X('ussd stands for', 58.2), (a, b) => T3.title(a, b, { pal: 'cyan', kicker: 'WHAT IS USSD?', lines: ['UNSTRUCTURED', 'SUPPLEMENTARY', 'SERVICE DATA'], size: .8, accentLine: 2, tr: { in: 'bands', colors: [CYAN, '#fff', '#06304a'] } }));
add(X('its a mouthful', 63.0), (a, b) => T3.person(a, b, { pal: 'cyan', env: 'room', char: { col: '#2fbf71', skin: '#6b3f26', hairCol: '#1a1210' }, screen: () => LCD([], ''), side: { html: 'IN REAL LIFE?', at: N('real life', 65.4), size: 120 }, tr: { in: 'whip' } }));
const TS = N('a star', 68.6) + .1, TH = N('a hash', 69.9) + .1; const D3 = [[TS, '*'], [TS + .25, '1'], [TS + .45, '2'], [TS + .65, '0'], [TH, '#']]; const TMENU = N('a little menu', 70.7) + .3;
add(X('when you dial a code', 66.6), (a, b) => T3.phone(a, b, { pal: 'cyan', cam: 'left', dial: D3, send: TH + .1,
  screen: t => t < TMENU ? { input: GL.typedAt(t, D3), cursor: Math.floor(t * 3) % 2 === 0, soft: ['', 'Call'] } : MENU,
  tags: [{ text: 'STARTS WITH *', at: TS, anchor: [-.33, -.97, .1], dx: 560, dy: -30, side: 1, col: CYAN }, { text: 'ENDS WITH #', at: TH, anchor: [.33, -.97, .1], dx: 420, dy: 60, side: 1, col: GOLD }],
  side: { html: '<span style="color:#4ff0ff">= USSD</span>', at: N('thats ussd', 73.4), x: 1420, y: 300, size: 150 }, tr: { in: 'zoom' } }));
const B1 = N('check your balance', 75.2), B2 = N('buy a bundle', 76.6), B3 = N('send money', 77.7);
add(X('check your balance', 75.2), (a, b) => T3.phone(a, b, { pal: 'cyan', smart: true, cam: 'right', phoneScale: 1.3, phoneOpts: { resW: 540, resH: 1080 },
  screen: t => ({ lines: ['MENU', '1 Check balance', '2 Buy a bundle', '3 Send money'], hi: t >= B3 ? 3 : t >= B2 ? 2 : 1, buttons: ['CANCEL', 'SEND'] }), key: t => (t >= B3 ? 3 : t >= B2 ? 2 : 1),
  side: { html: 'CHECK<br>YOUR BALANCE', at: B1, x: 640, size: 120 }, tr: { in: 'whip' } }));
const R1 = N('press one', 78.8), R2 = N('press reply', 79.8), R3 = N('done', 81.0);
add(X('press one press', 78.8), (a, b) => T3.phone(a, b, { pal: 'cyan', cam: 'macro', dial: [[R1 + .1, '1'], [R2 + .15, 'ok']],
  screen: t => t < R1 + .1 ? MENU : t < R3 ? { input: '1', soft: ['Back', 'Reply'], title: 'MENU', lines: ['Reply with a number'] } : LCD(['Done!', 'Your bundle is on', 'its way.'], 'MENU', { soft: ['', 'OK'] }),
  key: t => (t < R1 + .1 ? 0 : t < R3 ? 1 : 2), side: { html: '<span style="color:#ffcf3a">DONE</span>', at: R3, x: 1460, size: 170 }, tr: { in: 'zoom' } }));
add(X('ussd was standardised', 81.9), (a, b) => T3.number(a, b, { pal: 'cyan', text: '1995', at: N('in 1995', 84.2) - .2, label: 'STANDARDISED · GSM PHASE 2', sub: 'GSM 02.90 and 03.90 (ETSI, 1995)', props: 'phones', tr: { in: 'whip' } }));
add(X('the set of rules', 86.6), (a, b) => T3.receipt(a, b, { pal: 'cyan', source: 'ETSI · European Telecommunications Standards Institute', lines: ['GSM 02.90 · ETS 300 625', 'Unstructured Supplementary', 'Service Data (USSD), Stage 1'], mark: 'Unstructured Supplementary', markAt: N('european telecommunications', 89.6), foot: 'Published January 1995 · GSM Phase 2', tr: { in: 'zoom' } }));
add(X('for the gsm mobile', 93.4), (a, b) => T3.dotMap(a, b, { pal: 'cyan', n: 5000, at: a + .1, dur: 1.6, value: 'GSM', label: 'MOBILE NETWORKS ACROSS MOST OF THE WORLD', valueSize: 210, tr: { in: 'whip', dir: -1 } }));
add(X('those same gsm', 96.6), (a, b) => T3.title(a, b, { pal: 'night', lines: ['TRY IT', 'RIGHT NOW'], accentLine: 1, prop: 'phone', propOpts: { scale: 1.3, pos: [-3.8, 1.8, -3.4] }, tr: { in: 'flash', tin: .2 } }));
const D4 = digits([['star', '*'], ['hash', '#'], ['zero', '0'], ['six', '6'], ['hash', '#']], N('dial star hash', 101.8) - .1); const TIMEI = D4[4][0] + .5;
add(X('dial star hash', 101.8), (a, b) => T3.phone(a, b, { pal: 'night', cam: 'hero', dial: D4,
  screen: t => t < TIMEI ? { input: GL.typedAt(t, D4), cursor: true, soft: ['', 'Call'] } : LCD(['35 209906', '123456 7'], 'IMEI', { soft: ['', 'OK'] }), key: t => (t < TIMEI ? GL.typedAt(t, D4) : 'imei'),
  tags: [{ text: 'EVEN WITH NO SIM CARD', at: N('no sim card', 106.8), anchor: [0, -.4, 0], dx: 420, col: GOLD }], tr: { in: 'whip' } }));
add(X('and it shows', 109.3), (a, b) => T3.phone(a, b, { pal: 'night', cam: 'left', screen: () => LCD(['35 209906', '123456 7'], 'IMEI', { soft: ['', 'OK'] }), key: () => 'imei',
  side: { html: 'IMEI', at: N('called the imei', 112.7), x: 1450, size: 190, sub: 'YOUR PHONE\'S UNIQUE SERIAL NUMBER', subAt: N('unique serial', 111) }, tr: { in: 'zoom' } }));

// ======================= CH2: THE JOURNEY (network: navy + lime) =======================
add(X('so what actually', 114.6), (a, b) => T3.title(a, b, { pal: 'network', kicker: 'WHAT HAPPENS WHEN YOU DIAL', lines: ['YOU PRESS', 'DIAL...'], accentLine: 1, prop: 'tower', propOpts: { h: 7, pos: [4.5, 0, -5] }, tr: { in: 'bands', colors: [LIME, CYAN, '#0c2244'] } }));
const J1 = N('nearest cell tower', 119.6), J2 = N('switching centre', 122.0), J3 = N('home register', 125.6), J4 = N('ussd gateway', 130.6), J5 = N('whoever runs', 133.3);
add(X('your code goes', 117.8), (a, b) => T3.network(a, b, { hits: [[a, 0], [J1 + .3, 1], [J2 + .3, 2]], code: '*120#', tr: { in: 'zoom' } }));
add(X('and then to the home', 123.9), (a, b) => T3.network(a, b, { hits: [[a, 2], [J3 + .3, 3]], revealMin: .4, camSide: 2 }));
add(X('the network then hands', 129.1), (a, b) => T3.network(a, b, { hits: [[a, 3], [J4 + .3, 4], [J5 + .4, 5]], revealMin: .6, camSide: -1 }));
add(X('your network your bank', 136.0), (a, b) => T3.trio(a, b, { pal: 'network', items: [{ prop: 'tower', opts: { h: 4.2 }, label: 'YOUR NETWORK', at: N('your network', 136.6) }, { prop: 'bank', scale: .45, label: 'YOUR BANK', at: N('your bank', 137.6), col: GOLD }, { prop: 'rack', opts: { h: 2.6 }, label: 'A SERVICE LIKE OURS', at: N('a service like', 138.4), col: CYAN }], tr: { in: 'whip' } }));
add(X('the answer travels', 140.3), (a, b) => T3.network(a, b, { hits: [[a, 5], [N('a menu appears', 144.6) - .2, 0]], back: true, wide: true, showAll: true, menuAt: N('a menu appears', 144.6), title: 'THE ANSWER <mark>COMES BACK</mark>', titleAt: N('the answer travels', 140.3) + .4, tr: { in: 'zoom' } }));
add(X('two things make', 146.1), (a, b) => T3.title(a, b, { pal: 'network', lines: ['2 THINGS MAKE', 'IT SPECIAL'], accentLine: 1, size: 1.0, tr: { in: 'flash', tin: .2 } }));
add(X('first its a live', 148.2), (a, b) => T3.versus(a, b, { pal: 'network', left: { prop: 'envelope', label: 'SMS: STORED, THEN SENT', at: N('an sms is', 150.6), scale: 1.3, y: 1.6, col: GOLD }, right: { prop: 'phone', opts: {}, scale: .8, y: 1.3, label: 'USSD: A LIVE SESSION', at: N('live session', 149.4), screen: () => MENU },
  title: '1. A <mark>LIVE SESSION</mark>', titleAt: N('live session', 149.4), tr: { in: 'whip' } }));
add(X('a ussd session stays', 153.8), (a, b) => T3.phone(a, b, { pal: 'network', cam: 'left', send: a + .3, screen: t => t < N('read and reply', 156.6) ? MENU : t < N('a bit like', 158.4) ? { input: '3', soft: ['Back', 'Reply'], title: 'MENU', lines: ['Reply with a number'] } : LCD(['Send to:', '077 123 4567'], 'SEND MONEY'), key: t => (t < N('read and reply', 156.6) ? 0 : t < N('a bit like', 158.4) ? 1 : 2),
  side: { html: 'A SHORT CALL<br><span style="color:#7dff6a">MADE OF TEXT</span>', at: N('made of text', 159.6), x: 1300, size: 120 }, tr: { in: 'zoom' } }));
add(X('second it travels', 161.1), (a, b) => T3.lanes(a, b, { at: N('signalling channels', 163), title: '2. THE NETWORK\'S <mark>SIGNALLING LANES</mark>', titleAt: N('signalling channels', 163), tr: { in: 'whip' } }));
add(X('thats why ussd doesnt', 168.5), (a, b) => T3.phone(a, b, { pal: 'network', cam: 'right', screen: () => LCD(['Mobile data: OFF', 'Signal: ●●●●'], 'STATUS'), key: () => 's', send: N('ordinary mobile signal', 173.4),
  side: { html: '<s style="text-decoration-color:#ff4f7a">NO DATA</s>', at: N('need data', 170), x: 640, size: 140, sub: 'JUST AN ORDINARY MOBILE SIGNAL', subAt: N('ordinary mobile signal', 173.4) }, tr: { in: 'zoom' } }));

// ======================= CH3: THE LIMITS (magenta / steel) =======================
add(X('of course there are', 175.5), (a, b) => T3.title(a, b, { pal: 'steel', lines: ['THE', 'LIMITS'], accentLine: 1, prop: 'clock', propOpts: { pos: [3.8, 2.2, -3.4], scale: 1.3 }, tr: { in: 'flash', tin: .2 } }));
add(X('each ussd message', 177.5), (a, b) => T3.number(a, b, { pal: 'steel', text: '182', at: N('one hundred and eightytwo', 180.3) - .3, label: 'CHARACTERS PER MESSAGE, AT MOST', props: 'phones', src: '3GPP TS 23.038', tr: { in: 'whip' } }));
add(X('thats why the menus', 183.4), (a, b) => T3.phone(a, b, { pal: 'steel', cam: 'macro', screen: () => LCD(['1 Balance', '2 Bundles', '3 Send', '4 More'], 'MENU'), key: () => 'm',
  tags: [{ text: 'SHORT MENUS', at: a + .3, anchor: [0, .9, 0], dx: 360, col: RED }, { text: 'NUMBERS TO PRESS', at: N('numbers to press', 186.3), anchor: [0, .45, 0], dx: 380, col: GOLD }], tr: { in: 'zoom' } }));
add(X('and sessions dont', 187.7), (a, b) => T3.phone(a, b, { pal: 'steel', cam: 'left', screen: t => LCD(['1 Balance', '2 Send money'], 'MENU', { soft: ['', String(Math.max(0, 120 - Math.floor((t - a) * 9))).padStart(3, ' ') + ' s'] }), key: t => Math.floor((t - a) * 9),
  side: { html: 'SESSIONS<br><span style="color:#ff4f7a">TIME OUT</span>', at: a + .2, x: 1320, size: 130 }, tr: { in: 'whip' } }));
add(X('the standard allows', 190.2), (a, b) => T3.versus(a, b, { pal: 'steel', gap: 3.3, left: { prop: 'clock', y: 2.2, label: '600 s · THE STANDARD', at: N('six hundred seconds', 191.6) - .3, k: t => prog(t, N('six hundred seconds', 191.6), N('six hundred seconds', 191.6) + 3) },
  right: { prop: 'clock', opts: { col: GOLD }, y: 2.2, label: '≈120 s · MOST NETWORKS', at: N('one hundred and twenty seconds', 197) - .4, col: GOLD, k: t => prog(t, N('one hundred and twenty seconds', 197), N('one hundred and twenty seconds', 197) + 1.4) },
  tr: { in: 'zoom' } }));
add(X('but according to the itu', 194.0), (a, b) => T3.receipt(a, b, { pal: 'steel', source: 'ITU-T Focus Group on Digital Financial Services, 2017', lines: ['“120 seconds being the typical', 'maximum time allowed for the', 'entire USSD session by MNOs”'], mark: '“120 seconds being the typical', markAt: N('one hundred and twenty seconds', 197) - .2, foot: 'MNOs: mobile network operators', tr: { in: 'whip' } }));
add(X('take too long', 200.3), (a, b) => T3.phone(a, b, { pal: 'steel', cam: 'hero', screen: t => t < N('back at the', 202.8) ? { title: 'ENTER PIN', lines: [], input: '••', cursor: Math.floor(t * 3) % 2 === 0, soft: ['Back', 'OK'] } : LCD(['Session expired.', 'Please try again.'], 'USSD', { soft: ['', 'OK'] }), key: t => (t < N('back at the', 202.8) ? 'pin' + (Math.floor(t * 3) % 2) : 'x'),
  side: { html: '<span style="color:#ff4f7a">BACK TO<br>THE START</span>', at: N('back at the', 202.8), x: 1420, size: 120 }, tr: { in: 'zoom' } }));
add(X('there are no pictures', 204.1), (a, b) => T3.lineup(a, b, { pal: 'steel', codeAt: a + .1, stamps: [{ html: 'NO PICTURES', at: N('no pictures', 204.6), color: RED, y: 150 }, { html: 'NO LOGOS', at: N('no logos', 205.7), color: RED, y: 255, r: 3 }, { html: 'NO BUTTONS', at: N('no buttons', 206.6), color: RED, y: 360 }, { html: 'JUST TEXT', at: N('just text', 208.3), color: '#ffffff', y: 900, size: 120, r: 0 }], tr: { in: 'whip' } }));
add(X('but that simplicity', 209.7), (a, b) => T3.title(a, b, { pal: 'gold', lines: ['SIMPLE =', 'SUPERPOWER'], accentLine: 1, size: 1.1, tr: { in: 'bands', colors: [GOLD, '#fff', '#2e1a5a'] } }));

// ======================= CH4: WHY AFRICA STILL DIALS (sunset) =======================
add(X('heres why', 214.0), (a, b) => T3.village(a, b, { people: [[-1.5, 2.5, '#e4572e', N('mobile internet', 221.6)], [1.2, 1.5, '#2fbf71', N('mobile internet', 221.6) + .4]], kicker: 'WHY AFRICA STILL DIALS', title: 'IN 2024, ONLY ABOUT <mark>A QUARTER</mark>…', titleAt: N('a quarter', 218.6), tr: { in: 'bands', colors: [GOLD, '#ff7a3d', '#6a2208'] } }));
add(X('in subsaharan africa used', 220.2), (a, b) => T3.crowd(a, b, { pal: 'sunset', lit: .25, at: a + .1, value: '≈ 1 IN 4', label: 'USED MOBILE INTERNET IN 2024', src: 'GSMA, State of Mobile Internet Connectivity 2025', tr: { in: 'zoom' } }));
add(X('and the main problem', 223.8), (a, b) => T3.village(a, b, { title: 'THE PROBLEM <mark>ISN\'T COVERAGE</mark>', titleAt: N('isnt coverage', 225.2), camKeys: [[a, [8, 9, 14], [6, 5, -9]], [b + .35, [5, 7, 11], [6, 6, -9]]], tr: { in: 'whip' } }));
add(X('only about ten', 226.3), (a, b) => T3.crowd(a, b, { pal: 'sunset', lit: [[.10, N('ten percent', 227.5), RED]], value: '≈10%', label: 'OUTSIDE MOBILE BROADBAND COVERAGE', tr: { in: 'zoom' } }));
add(X('a much bigger group', 231.8), (a, b) => T3.crowd(a, b, { pal: 'sunset', lit: [[.10, a - 2, RED], [.65, N('sixtyfive percent', 233), GOLD]], value: '65%', label: 'COVERED, BUT NOT USING IT', seed: 5, tr: { in: 'cut' } }));
add(X('the reasons the gsma', 239.1), (a, b) => T3.trio(a, b, { pal: 'sunset', items: [{ prop: 'smart', label: 'COST OF SMARTPHONES', at: N('cost of smartphones', 242.2), scale: 1.1, y: 1.4 }, { prop: 'notes', opts: { n: 10, color: '#3d8f5a' }, label: 'COST OF DATA', at: N('and data and', 243.4), col: GOLD, scale: 1.2, y: .25 }, { prop: 'person', opts: { col: '#7a5cff' }, label: 'DIGITAL SKILLS', at: N('digital skills', 245.0), col: '#ff5f8a', scale: 1.3, y: .2 }], tr: { in: 'whip' } }));
add(X('smartphones are growing', 245.9), (a, b) => T3.lineup(a, b, { pal: 'sunset', codeAt: 1e9, stamps: [{ html: 'SMARTPHONES ARE GROWING FAST', at: a + .2, color: GOLD, y: 160, size: 90, r: 0 }], tr: { in: 'whip' } }));
add(X('but in 2022', 248.0), (a, b) => T3.bars(a, b, { pal: 'sunset', items: [{ label: 'SMARTPHONES', value: 51, at: N('about half', 250.3), col: CYAN }, { label: 'BASIC + FEATURE PHONES', value: 49, at: N('the rest were', 253.4), col: GOLD }], unit: '%', title: 'MOBILE CONNECTIONS, <mark>2022</mark>', titleAt: N('in 2022', 248.6), src: 'GSMA, The Mobile Economy Sub-Saharan Africa 2023', tr: { in: 'zoom' } }));
add(X('ussd works on all', 256.3), (a, b) => T3.lineup(a, b, { pal: 'sunset', codeAt: a + .4, stamps: [{ html: 'WORKS ON ALL OF THEM', at: N('all of them', 257.4), color: GOLD, y: 150, size: 96, r: 0 }, { html: 'NO APP', at: N('no app to', 259.2), color: '#fff', y: 880, x: 520 }, { html: 'NO DATA', at: N('no data bundle', 260.8), color: '#fff', y: 880, x: 960 }, { html: 'NO STORAGE', at: N('no storage', 262.6), color: '#fff', y: 880, x: 1420 }], tr: { in: 'whip' } }));
add(X('if your phone can make', 264.4), (a, b) => T3.phone(a, b, { pal: 'sunset', cam: 'left', screen: t => t < N('it can dial', 266.6) ? { title: 'CALLING…', lines: ['Mama'], soft: ['', 'End'] } : { input: '*151#', soft: ['', 'Call'] }, key: t => +(t < N('it can dial', 266.6)),
  side: { html: 'MAKES CALLS?<br><span style="color:#ffcf3a">DIALS CODES.</span>', at: a + .2, x: 1300, size: 120 }, tr: { in: 'flash', tin: .2 } }));

// ======================= CH5: THE CODES THAT MOVE MONEY (sunset → gold) =======================
add(X('thats how a few', 267.9), (a, b) => T3.trio(a, b, { pal: 'sunset', items: [{ prop: 'door', label: '*151#', at: a + .2, labelSize: 80, top: 2.9 }, { prop: 'door', label: '*334#', at: a + .45, labelSize: 80, col: CYAN, top: 2.9 }, { prop: 'door', label: '*99#', at: a + .7, labelSize: 80, col: PINK, top: 2.9 }], title: 'FRONT DOORS TO <mark>WHOLE MONEY SYSTEMS</mark>', titleAt: N('front doors', 270.4), tr: { in: 'zoom' } }));
add(X('in zimbabwe ecocash', 272.8), (a, b) => T3.map(a, b, { hl: { ZWE: CYAN }, raise: [['ZWE', a + .2, .45]], focus: [30, -15.5], dist: 6.5, push: .72, codes: [{ lon: 30, lat: -19, text: '*151#', at: N('star one five one', 276.6), col: CYAN, h: 1.1 }],
  pins: [{ lon: 31.05, lat: -17.83, text: 'HARARE', at: a + .5, size: 34, dx: 160, dy: 10 }], kicker: 'ZIMBABWE · ECOCASH', title: 'SIMPLIFIED IN <mark>2014</mark>', titleAt: N('back in 2014', 279.0), tr: { in: 'whip' } }));
add(X('in kenya mpesa', 280.4), (a, b) => T3.map(a, b, { hl: { KEN: GOLD }, raise: [['KEN', a + .2, .45]], focus: [37.5, 0], dist: 6.5, push: .7, yaw: .3, codes: [{ lon: 37.5, lat: .5, text: 'FIRST: A SIM CARD MENU', at: N('sim card menu', 282.8), col: '#ffffff', h: 1.1, world: .38 }],
  pins: [{ lon: 36.82, lat: -1.29, text: 'NAIROBI', at: a + .5, size: 34 }], kicker: 'KENYA · M-PESA', tr: { in: 'whip' } }));
const K1 = digits([['star', '*'], ['three', '3'], ['three', '3'], ['four', '4'], ['hash', '#']], N('star three three four', 288.6) - .2);
add(X('and in 2020', 284.4), (a, b) => T3.phone(a, b, { pal: 'sunset', smart: true, cam: 'right', phoneScale: 1.3, phoneOpts: { resW: 540, resH: 1080 }, dial: K1, send: K1[4][0] + .1,
  screen: t => t < K1[4][0] + .3 ? { dialer: GL.typedAt(t, K1), hiKey: (K1.filter(([q]) => t >= q && t < q + .2).pop() || [])[1] } : { lines: ['M-PESA', '1 Send money', '2 Withdraw cash', '3 Buy airtime', '4 Lipa na M-PESA'], buttons: ['CANCEL', 'SEND'] }, key: t => (t < K1[4][0] + .3 ? GL.typedAt(t, K1) + (K1.filter(([q]) => t >= q && t < q + .2).pop() || [])[1] : 'm'),
  side: { html: '<span style="color:#ffcf3a">*334#</span>', at: K1[4][0], x: 640, size: 190, sub: 'ALL M-PESA SERVICES · 2020', subAt: N('all of its', 287.4) }, kicker: 'KENYA · SAFARICOM', tr: { in: 'zoom' } }));
add(X('in india the', 291.4), (a, b) => T3.number(a, b, { pal: 'gold', text: '*99#', at: N('star nine nine', 294.4) - .2, label: 'INDIA · 2012 · BANK FROM ANY PHONE', sub: 'National Payments Corporation of India', props: 'phones', tr: { in: 'zoom' } }));
add(X('and the numbers are huge', 299.7), (a, b) => T3.title(a, b, { pal: 'gold', lines: ['THE NUMBERS', 'ARE HUGE'], accentLine: 1, size: 1.1, prop: 'coins', propOpts: { n: 16, pos: [0, 0, -3.6], scale: 2.4 }, tr: { in: 'flash', tin: .2 } }));
add(X('according to the gsma there', 301.9), (a, b) => T3.bars(a, b, { pal: 'gold', items: [{ label: 'WORLD', value: 2.1, at: N('two point one', 303.4), col: CYAN, text: '2.1 BN' }, { label: 'SUB-SAHARAN AFRICA', value: 1.05, at: N('more than one billion', 310.0), col: GOLD, text: '1 BN+' }], fmt: v => v.toFixed(1) + ' BN', title: 'MOBILE MONEY ACCOUNTS, <mark>2024</mark>', titleAt: N('in 2024 and', 307.6), src: 'GSMA, State of the Industry Report on Mobile Money 2025', tr: { in: 'zoom' } }));
add(X('that year the region', 313.2), (a, b) => T3.number(a, b, { pal: 'gold', text: 'US$1.1 TRILLION', at: N('one point one trillion', 316.0) - .3, label: 'MOBILE MONEY PROCESSED IN SUB-SAHARAN AFRICA, 2024', props: 'coins', maxW: 6.4, tr: { in: 'zoom' } }));

// ======================= THE FLUXR PART (brand green) =======================
add(X('in south africa the 2022', 319.4), (a, b) => T3.map(a, b, { pal: 'brand', landCol: '#16244a', edgeCol: '#3a5a9a', hl: { ZAF: LIME }, raise: [['ZAF', a + .2, .3]], focus: [25, -27], dist: 7.5, push: .8,
  pins: [{ lon: 28.05, lat: -26.2, text: 'JOHANNESBURG', at: a + .5, size: 32 }, { lon: 18.42, lat: -33.92, text: 'CAPE TOWN', at: a + .8, size: 32 }, { lon: 31.02, lat: -29.86, text: 'DURBAN', at: a + 1.1, size: 32 }],
  kicker: 'SOUTH AFRICA · CENSUS 2022', title: '≈ <mark>2.4 MILLION</mark> BORN IN ANOTHER COUNTRY', titleAt: N('two point four', 322.6), src: 'Statistics South Africa, Census 2022', tr: { in: 'bands', colors: [LIME, '#fff', '#123a66'] } }));
add(X('many of them send', 327.0), (a, b) => T3.map(a, b, { pal: 'brand', landCol: '#16244a', edgeCol: '#3a5a9a', hl: { ZAF: LIME, ZWE: GOLD, MWI: GOLD, MOZ: GOLD, LSO: GOLD }, focus: [30, -22], dist: 9, push: .85,
  arcs: [{ from: [28, -26.2], to: [31, -17.8], at: a + .3, col: GOLD }, { from: [28, -26.2], to: [33.8, -13.9], at: a + .6, col: GOLD }, { from: [28, -26.2], to: [32.6, -25.9], at: a + .9, col: GOLD }, { from: [28, -26.2], to: [27.5, -29.4], at: a + 1.2, col: GOLD, h: .6 }],
  title: 'MANY SEND <mark>SUPPORT HOME</mark>', titleAt: N('support home', 328.6), tr: { in: 'zoom' } }));
add(X('and many do it', 329.4), (a, b) => T3.versus(a, b, { pal: 'brand', left: { prop: 'notes', opts: { n: 14, color: '#2f7d4f', value: 'R100' }, label: 'CASH', at: N('with cash', 330.6), scale: 1.4, y: .3, col: GOLD }, right: { prop: 'phone', opts: {}, scale: .8, y: 1.3, label: 'A PHONE WITH NO DATA', at: N('no data', 332.6), screen: () => ({ input: '*130*', soft: ['', 'Call'] }) }, tr: { in: 'whip' } }));
add(X('a voucher and a code', 333.6), (a, b) => T3.vouchers(a, b, { cards: [{ tex: 'v1', at: a + .15 }], kicker: 'A VOUCHER, AND A CODE YOU CAN DIAL', tr: { in: 'zoom' } }));
add(X('thats exactly why', 337.3), (a, b) => T3.logo(a, b, { line: 'THAT\'S EXACTLY WHY WE BUILT <mark>FLUXR</mark>', at: a + .2, tr: { in: 'flash', tin: .25 } }));
add(X('this story is brought', 339.85), (a, b) => T3.title(a, b, { pal: 'brand', kicker: 'A WORD FROM FLUXR', lines: ['BROUGHT TO YOU', 'BY FLUXR'], accentLine: 1, size: 1.0, tr: { in: 'bands', colors: [LIME, '#fff', '#123a66'] } }));
add(X('from south africa', 342.6), (a, b) => T3.map(a, b, { pal: 'brand', landCol: '#16244a', edgeCol: '#3a5a9a', hl: { ZAF: LIME, ZWE: GOLD }, focus: [29, -19], dist: 8, arcs: [{ from: [28, -26.2], to: [31, -17.8], at: N('send airtime', 343.9), col: GOLD }],
  codes: [{ lon: 31, lat: -17.8, text: 'AIRTIME + DATA', at: N('airtime and data', 344.4), col: GOLD, h: .55, world: .5 }], kicker: 'FROM SOUTH AFRICA', title: 'SEND AIRTIME AND DATA <mark>HOME</mark>', titleAt: N('data home', 345.2), tr: { in: 'zoom' } }));
const VA = [N('1voucher', 346.8), N('ott voucher', 347.8), N('blu voucher', 348.8), N('fnb voucher', 349.6), N('for all voucher', 350.6)];
add(X('buy a 1voucher', 346.3), (a, b) => T3.vouchers(a, b, { cards: [{ tex: 'v1', at: VA[0] }, { tex: 'ott', at: VA[1] }, { tex: 'blu', at: VA[2] }, { tex: 'fnb', at: VA[3] }, { tex: '4all', at: VA[4] }], kicker: 'IN SOUTH AFRICA: BUY A VOUCHER AT YOUR LOCAL STORE', ky: 200, tr: { in: 'whip' } }));
const FD = digits([['star', '*'], ['one', '1'], ['three', '3'], ['zero', '0'], ['star', '*'], ['three', '3'], ['one', '1'], ['zero', '0'], ['two', '2'], ['six', '6'], ['star', '*']], N('then dial star', 353.9));
const FPIN = N('your voucher pin', 359.4), FH = N('hash', FPIN + 1);
add(X('then dial star', 353.9), (a, b) => T3.phone(a, b, { pal: 'brand', cam: 'left', dial: [...FD, [FPIN + .1, '1'], [FPIN + .25, '2'], [FPIN + .4, '3'], [FPIN + .55, '4'], [FH, '#'], [FH + .35, 'call']], send: FH + .4,
  screen: t => ({ input: GL.typedAt(t, FD) + (t > FPIN + .1 ? '1234…' : '') + (t > FH ? '#' : ''), cursor: true, soft: ['', 'Call'] }), key: t => GL.typedAt(t, FD) + (t > FPIN + .1) + (t > FH),
  side: { html: '<span style="font-size:46px;letter-spacing:.08em;color:#cfe">IN SOUTH AFRICA? DIAL</span><br>*130*31026*<br><span style="color:#85ed70">VoucherPIN</span>#', at: FD[0][0], x: 1340, y: 470, size: 108 }, tr: { in: 'zoom' } }));
add(X('it works on any phone', 361.9), (a, b) => T3.lineup(a, b, { pal: 'brand', codeAt: a, stamps: [{ html: 'ANY PHONE', at: N('any phone', 363.0), color: LIME, y: 150, size: 110, r: 0 }, { html: 'NO DATA NEEDED', at: N('no data needed', 363.6), color: '#fff', y: 900, size: 96, r: 0 }], tr: { in: 'whip' } }));
const AP1 = N('turn your voucher', 368.0), AP2 = N('then buy airtime', 370.4);
add(X('or get the', 365.1), (a, b) => T3.phone(a, b, { smart: true, pal: 'brand', cam: 'left', phoneOpts: { resW: 540, resH: 1080 }, modes: [[a, 'home'], [AP1, 'redeem'], [AP2, 'airtime']],
  side: { html: 'THE FLUXR APP', at: a + .2, x: 1300, y: 330, size: 110, sub: 'on Google Play', subAt: a + .4 }, tags: [{ text: 'VOUCHER → WALLET CREDIT', at: AP1 + .2, anchor: [0, 0, 0], dx: 640, dy: 90, col: LIME }, { text: 'AIRTIME · DATA · ELECTRICITY', at: AP2 + .2, anchor: [0, 0, 0], dx: 640, dy: 200, col: GOLD }], tr: { in: 'zoom' } }));
add(X('now back to', 374.4), (a, b) => T3.title(a, b, { pal: 'purple', lines: ['BACK TO', 'THE STORY'], accentLine: 1, tr: { in: 'bands', colors: [PINK, GOLD, '#40126a'] } }));

// ======================= CH6: WHO PAYS? (purple + gold) =======================
add(X('because ussd has', 377.0), (a, b) => T3.title(a, b, { pal: 'purple', kicker: 'ONE BIG QUESTION', lines: ['WHO', 'PAYS?'], accentLine: 1, size: 1.6, prop: 'coins', propOpts: { n: 12, pos: [3.6, 0, -3], scale: 2 }, tr: { in: 'flash', tin: .2 } }));
add(X('every session uses', 383.2), (a, b) => T3.phone(a, b, { pal: 'purple', cam: 'right', screen: () => MENU, key: () => 'm', send: a + .2, side: { html: 'EVERY SESSION<br><span style="color:#ff7ad9">USES THE NETWORK</span>', at: a + .2, x: 640, size: 100 }, tr: { in: 'whip' } }));
add(X('in nigeria banks built', 385.8), (a, b) => T3.versus(a, b, { pal: 'purple', left: { prop: 'bank', label: 'BANKS BUILT THE CODES', at: N('banks built', 386.6), scale: .55, col: GOLD }, right: { prop: 'tower', opts: { h: 5 }, label: 'NETWORKS BILLED THEM', at: N('billed the banks', 390.6) }, link: 'beam', linkAt: N('billed the banks', 390.6), kicker: 'NIGERIA', tr: { in: 'zoom' } }));
add(X('the banks didnt', 393.5), (a, b) => T3.pile(a, b, { pal: 'purple', to: 200, from: 30, at: a + .1, dur: 3.6, noteCol: '#3f7f5a', noteVal: '₦1000', count: { from: 40, to: 250, fmt: v => '₦' + Math.round(v) + ' BN' }, label: 'AND THE BILL KEPT GROWING', tr: { in: 'whip' } }));
add(X('by 2024 it was', 397.7), (a, b) => T3.number(a, b, { pal: 'purple', text: 'N250–300 BN', at: N('two hundred and fifty', 400.5) - .2, label: 'THE USSD BILL BY 2024 (ESTIMATES)', props: 'notes', noteCol: '#3f7f5a', noteVal: '₦', maxW: 6.4, src: 'Nigeria CommunicationsWeek', tr: { in: 'zoom' } }));
add(X('in march 2025', 405.2), (a, b) => T3.receipt(a, b, { pal: 'purple', source: 'NCC · Determination of USSD Pricing · 13 March 2025', lines: ['₦6.98 per banking transaction,', 'for a USSD session of up to', '120 seconds.'], mark: '₦6.98 per banking transaction,', markAt: N('six naira', 410.8), foot: 'Nigerian Communications Commission', tr: { in: 'whip' } }));
add(X('six naira', 410.8) + 1.6, (a, b) => T3.number(a, b, { pal: 'purple', text: 'N6.98', at: a + .1, label: 'PER BANKING SESSION, UP TO 120 SECONDS', props: 'coins', tr: { in: 'zoom' } }));
add(X('it also allowed', 418.0), (a, b) => T3.phone(a, b, { pal: 'purple', smart: true, cam: 'left', phoneScale: 1.3, phoneOpts: { resW: 540, resH: 1080 }, screen: t => ({ lines: ['A fee of ₦6.98 will be', 'charged to your airtime.', '1 Accept', '2 Cancel'], hi: t > N('with their consent', 422.3) ? 2 : -1, buttons: ['CANCEL', 'SEND'], press: prog(t, N('with their consent', 422.3) + .2, N('with their consent', 422.3) + .7) }), key: t => Math.round(t * 10),
  side: { html: 'CHARGED TO<br><span style="color:#ff7ad9">CUSTOMERS\' AIRTIME</span>', at: N('customers airtime', 421.4), x: 1320, size: 100, sub: 'WITH THEIR CONSENT · FROM JUNE 2025', subAt: N('with their consent', 422.3) }, tr: { in: 'whip' } }));
add(X('in february 2026', 427.2), (a, b) => T3.receipt(a, b, { pal: 'purple', source: 'ALTON chair, 19 February 2026 (via Nairametrics)', lines: ['“Today, there is no', 'outstanding USSD debt.”'], fs: 84, mark: 'outstanding USSD debt.”', markAt: N('no outstanding', 431.8), tr: { in: 'zoom' } }));
add(X('nearly three hundred', 435.2), (a, b) => T3.pile(a, b, { pal: 'purple', from: 200, to: 200, at: a + .1, dur: .1, clear: N('finally cleared', 439.6) - .2, clearDur: 1.4, noteCol: '#3f7f5a', noteVal: '₦1000', count: { from: 300, to: 300, fmt: () => '≈ ₦300 BN · CLEARED' }, label: 'BUILT UP OVER FOUR YEARS', tr: { in: 'whip' } }));
add(X('the lesson', 441.7), (a, b) => T3.title(a, b, { pal: 'gold', kicker: 'THE LESSON', lines: ['SIMPLE.', 'NOT FREE.'], accentLine: 1, size: 1.3, tr: { in: 'bands', colors: [GOLD, '#fff', '#2e1a5a'] } }));
add(X('someone has to', 447.3), (a, b) => T3.trio(a, b, { pal: 'gold', items: [{ prop: 'bank', scale: .45, label: 'THE BANK', at: N('the bank the', 449.3) }, { prop: 'person', opts: { col: '#e4572e' }, scale: 1.4, y: .2, label: 'THE CUSTOMER', at: N('the customer', 450.0), col: PINK }, { prop: 'rack', opts: { h: 2.6 }, label: 'THE SERVICE YOU\'RE USING', at: N('the service', 451.0), col: CYAN }], title: 'SOMEONE <mark>CARRIES IT</mark>', titleAt: N('carry it', 448.3), tr: { in: 'zoom' } }));

// ======================= CH7: IS USSD DYING? (dawn) =======================
add(X('so is ussd dying', 453.2), (a, b) => T3.title(a, b, { pal: 'dawn', lines: ['IS USSD', 'DYING?'], accentLine: 1, size: 1.3, prop: 'phone', propOpts: { scale: 1.2, pos: [3.8, 1.6, -3.2] }, tr: { in: 'flash', tin: .2 } }));
add(X('smartphones are coming', 456.2), (a, b) => T3.crowd(a, b, { pal: 'dawn', lit: [[.88, N('eightyeight percent', 460.2) - .5, CYAN]], value: '≈ 88%', label: 'SMARTPHONES · SUB-SAHARAN AFRICA BY 2030', src: 'GSMA forecast, The Mobile Economy Sub-Saharan Africa 2023', tr: { in: 'whip' } }));
add(X('and apps can do', 465.4), (a, b) => T3.phone(a, b, { smart: true, pal: 'dawn', cam: 'right', phoneOpts: { resW: 540, resH: 1080 }, modes: [[a, 'home'], [N('receipts', 470.3), 'airtime']],
  side: { html: 'PICTURES · HISTORY<br>RECEIPTS', at: N('pictures history', 468.9), x: 640, size: 100, sub: 'MUCH EASIER MENUS', subAt: N('much easier', 471.2) }, tr: { in: 'zoom' } }));
add(X('but a code still', 473.4), (a, b) => T3.title(a, b, { pal: 'dawn', lines: ['A CODE STILL', 'HAS ITS PLACE'], accentLine: 1, size: .95, tr: { in: 'bands', colors: [PINK, CYAN, '#25447a'] } }));
add(X('when the data runs', 476.0), (a, b) => T3.versus(a, b, { pal: 'dawn', left: { prop: 'smart', scale: .8, y: 1.3, label: 'WHEN THE DATA RUNS OUT', at: N('data runs out', 476.3), col: '#ff4f7a' }, right: { prop: 'phone', opts: { color: '#4a3a2a' }, scale: .8, y: 1.3, label: 'WHEN THE PHONE IS OLD', at: N('phone is old', 477.9), screen: () => ({ input: '*120#', soft: ['', 'Call'] }) }, tr: { in: 'whip' } }));
add(X('when the person', 479.2), (a, b) => T3.person(a, b, { pal: 'sunset', env: 'village', char: { col: '#5aa8ff', skin: '#4a2c1a', scarf: '#c0392b', hair: false, legs: '#1d3557' }, screen: () => MENU, side: { html: 'NEVER DOWNLOADED<br><span style="color:#ffcf3a">AN APP</span>', at: N('never downloaded', 482.2), size: 100 }, tr: { in: 'zoom' } }));
add(X('so the future', 485.0), (a, b) => T3.versus(a, b, { pal: 'dawn', left: { prop: 'smart', scale: .8, y: 1.3, label: 'APPS', at: a + .2, col: CYAN }, right: { prop: 'phone', scale: .8, y: 1.3, label: 'USSD', at: a + .35, screen: () => MENU }, mid: { html: 'OR?', at: N('or apps', 487.6), size: 140 }, tr: { in: 'flash', tin: .2 } }));
add(X('its both', 489.2), (a, b) => T3.versus(a, b, { pal: 'brand', left: { prop: 'smart', scale: .8, y: 1.3, label: 'AN APP · FOR PEOPLE WITH DATA', at: N('an app for', 490.5) }, right: { prop: 'phone', scale: .8, y: 1.3, label: 'A CODE · FOR EVERYONE ELSE', at: N('a code for', 492.4), col: GOLD, screen: () => MENU }, link: 'beam', linkAt: a + .2, mid: { html: 'BOTH', at: a + .1, size: 170, color: '#85ed70' }, tr: { in: 'zoom' } }));

// ======================= RECAP (mixed) =======================
add(X('lets recap', 495.3), (a, b) => T3.title(a, b, { pal: 'night', lines: ['RECAP'], size: 2, tr: { in: 'bands', colors: [CYAN, '#fff', '#1c1850'] } }));
add(X('ussd was standardised in', 496.7), (a, b) => T3.number(a, b, { pal: 'cyan', text: '1995', at: N('in 1995', 499) - .2, label: 'USSD JOINS THE GSM STANDARD', props: 'phones', tr: { in: 'whip' } }));
add(X('it opens a live', 500.7), (a, b) => T3.network(a, b, { hits: [[a, 0], [b - .6, 5]], wide: true, showAll: true, back: true, title: 'A LIVE SESSION ON <mark>SIGNALLING CHANNELS</mark>', titleAt: N('signalling channels so', 503.5), tr: { in: 'zoom' } }));
add(X('each screen holds', 508.2), (a, b) => T3.versus(a, b, { pal: 'steel', left: { prop: 'phone', scale: .8, y: 1.3, label: '182 CHARACTERS A SCREEN', at: a + .3, screen: () => MENU }, right: { prop: 'clock', y: 2.2, opts: { col: GOLD }, label: '≈ 2 MINUTES A SESSION', at: N('two minutes', 513.4) - .3, col: GOLD, k: t => prog(t, N('two minutes', 513.4), N('two minutes', 513.4) + 1.6) }, tr: { in: 'whip' } }));
add(X('in a region where', 516.0), (a, b) => T3.crowd(a, b, { pal: 'sunset', lit: .25, at: N('a quarter of', 517.5), value: '1 IN 4', label: 'USE MOBILE INTERNET', tr: { in: 'zoom' } }));
add(X('that made ussd', 520.4), (a, b) => T3.map(a, b, { pal: 'night', landCol: '#1b1a4a', edgeCol: '#4a4aa0', hl: { ZWE: CYAN, KEN: GOLD }, focus: [30, -9], dist: 11, codes: [{ lon: 30, lat: -19, text: 'ECOCASH *151#', at: N('from ecocash', 523.9), col: CYAN }, { lon: 37.5, lat: .5, text: 'M-PESA *334#', at: N('to mpesa', 524.8), col: GOLD }], title: 'THE FRONT DOOR TO <mark>MOBILE MONEY</mark>', titleAt: N('front door', 521.5), tr: { in: 'whip' } }));
add(X('and in nigeria it', 526.3), (a, b) => T3.pile(a, b, { pal: 'purple', from: 200, to: 200, at: a, dur: .1, noteCol: '#3f7f5a', noteVal: '₦1000', count: { from: 0, to: 0, fmt: () => 'A SIMPLE CODE, A REAL COST' }, countSize: 110, label: 'NIGERIA', tr: { in: 'zoom' } }));
// end card
add(X('if you enjoyed', 531.8), (a, b) => T3.phone(a, b, { smart: true, pal: 'brand', cam: 'right', phoneOpts: { resW: 540, resH: 1080 }, modes: [[a, 'home']],
  side: { html: `<img src="${KIT}logos/fluxr-white.png" style="height:120px"><br><span style="font-size:40px;letter-spacing:.08em;color:#cfe">IN SOUTH AFRICA? DIAL</span><br>*130*31026*<span style="color:#85ed70">VoucherPIN</span>#`, at: a + .1, x: 700, y: 400, size: 86, sub: 'Or get the Fluxr app on Google Play · www.fluxr.co.za', subAt: a + .5, subDy: 230 },
  ui: { build: u => C.subscribe(u, {}), update: (sb, t) => { const tS = N('subscribe for the', 533.4); sb.set(t, tS); P(sb.el, { x: 700, y: 880, o: E.outC(prog(t, tS - .5, tS - .1)) }); } }, tr: { in: 'bands', colors: [LIME, '#fff', '#123a66'] } }));
{ const tS = N('subscribe for the', 533.4); cue(tS + .75, 'click', .8); cue(tS + .8, 'chime', .45); }

cuts.sort((p, q) => p[0] - q[0]);
// a soft transition sound on every cut (levels are low in audio.py)
cuts.forEach(([a], i) => { if (i) cue(a, ['whoosh', 'swish', 'whoosh_low'][i % 3], .28); });
cuts.forEach(([a, fn], i) => fn(a, i + 1 < cuts.length ? cuts[i + 1][0] : END + 2.6));
window.DURATION = END + 2.6; console.warn('CUTS ' + JSON.stringify(cuts.map(c => +c[0].toFixed(2))));
