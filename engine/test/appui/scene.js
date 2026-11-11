const C = CINE; const { shot, sv, G, prog } = C;
C.setTheme('fluxr'); C.initFX({ grain: .03, vignette: .3 });
shot(0, 6, ({ root, world }) => { const w = world(); const L = w.layer(1, { w: 1920, h: 1080 });
  sv('rect', { width: 1920, height: 1080, fill: '#0d372b' }, L.svg);
  const mk = (name, x) => { let ui; const ph = C.phone(L.svg, L.defs, { w: 330, h: 680, screenFn: (g, w2, h2, d) => { ui = C.appUI(g, w2, h2, d || L.defs, name); } }); G(ph.g, x, 540); return ui; };
  return { a: mk('home', 400), b: mk('redeem', 960), c: mk('airtime', 1520) };
}, (s, lt, t) => { s.a.set(t, { balance: 250, from: 0, at: .5, dur: 1.2, tap: 1, tapAt: 3 }); s.b.set(t, { typeAt: 1, typeDur: 1.6, doneAt: 3.2 }); s.c.set(t, { selAt: 2 }); });
window.DURATION = 6;
