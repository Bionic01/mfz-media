const C = CINE; const { shot, sv, G, prog } = C;
C.setTheme('fluxr'); C.initFX({ grain: .03, vignette: .3 });
const NAMES = ['home', 'redeem', 'airtime', 'zim', 'power', 'vouchers', 'bills'];
shot(0, 6, ({ root, world }) => { const w = world(); const L = w.layer(1, { w: 1920, h: 1080 });
  sv('rect', { width: 1920, height: 1080, fill: '#0d372b' }, L.svg);
  const uis = NAMES.map((name, i) => { let ui; const ph = C.phone(L.svg, L.defs, { w: 250, h: 520, screenFn: (g, w2, h2, d) => { ui = C.appUI(g, w2, h2, d || L.defs, name); } }); G(ph.g, 150 + i * 270, 540); return ui; });
  return { uis };
}, (s, lt, t) => { s.uis.forEach((u, i) => u.set(t, { balance: 250, from: 0, at: .5, dur: 1.2, tap: 1, tapAt: 3, typeAt: 1, typeDur: 1.6, doneAt: 3.2, selAt: 2, sel: i === 5 ? 9 : 1 })); });
window.DURATION = 6;
