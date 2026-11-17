/* Look v5 worked example (17 Nov 2026): bright flat 2D, parallax, camera drift, secondary motion. */
const C = window.CINE, L5 = C.L5, { shot, cue, E, clamp, lerp } = C;
C.initFX({ grain: .06, vignette: .35 });
const add = (a, b, pal, setOpts, build, upd, opts = {}) => shot(a, b, ctx => { const S = L5.set(ctx, pal, setOpts); const st = build(S, ctx) || {}; st.S = S; return st; }, (st, lt, t, k) => { st.S.tick(lt, t, k); upd && upd(st, lt, t, k); }, opts);
// 1. a person and a house at night, figure waves
add(0, 4.3, 'night', { ground: 'mountains', cam: { z0: 1.12, z1: 1.0, x0: -60, x1: 40 } }, S => {
  const h = L5.house(S.sub, { x: 1250, y: 930, s: 1.2 }); const f = L5.figure(S.sub, { x: 640, y: 950, s: 1.25, shirt: '#ff5fa2', female: true, elder: true, seed: 3 });
  const n = L5.big(S.ui, 'R100 000', { x: 640, y: 220, size: 150, color: S.acc }); return { h, f, n };
}, (s, lt, t) => { s.h.tick(t); s.f.set(t, { pose: lt > 1 ? 'wave' : 'stand', talk: 0 }); s.n.set(lt, .6); });
// 2. phone with a share price
add(4, 8.3, 'purple', { ground: 'none', cam: { z0: 1, z1: 1.1 } }, S => {
  const p = L5.phone(S.sub, { x: 960, y: 560, s: 1.25, screen: (g, d, w, h) => { const v = C.sv('text', { x: w / 2, y: h * .45, 'text-anchor': 'middle', 'font-family': 'Barlow Condensed', 'font-weight': 800, 'font-size': 120, fill: '#1b1533' }, g); const c = C.sv('text', { x: w / 2, y: h * .58, 'text-anchor': 'middle', 'font-family': 'Barlow', 'font-weight': 800, 'font-size': 44, fill: '#e0245e' }, g); return t => { v.textContent = 'R' + (t < 6 ? 46 : Math.round(lerp(46, 10, clamp((t - 6) / 1.5)))); c.textContent = t < 6 ? '' : '▼ ' + Math.round(clamp((t - 6) / 1.5) * 78) + '%'; }; } });
  return { p };
}, (s, lt, t) => s.p.tick(t), { in: 'zoom' });
// 3. chart crash + stamp
add(8, 12.5, 'ember', { ground: 'city', cam: { z0: 1.05, z1: 1.0, x0: 30, x1: -30 } }, S => {
  const ch = L5.chart(S.sub, [20, 26, 31, 38, 42, 46, 45, 46, 17, 10], { x: 260, y: 860, w: 1400, h: 560, col: '#ffd23a', max: 50 });
  const st = L5.stamp(S.ui, '-78%', { x: 1420, y: 640, size: 150 }); return { ch, st };
}, (s, lt) => { s.ch.draw(E.ioC(clamp(lt / 2.6))); s.st.set(lt, 2.7); if (lt > 2.7 && !s.c) { s.c = 1; cue(8 + 2.7, 'stamp'); } }, { in: 'whip' });
// 4. receipt card
add(12.2, 16.5, 'teal', { ground: 'waves' }, S => ({ r: L5.receipt(S.ui, { source: 'Example source card', date: '17 Nov 2026', quote: 'Key words get a highlighter sweep, inside the 2D world.', hl: ['highlighter sweep'] }) }), (s, lt) => s.r.set(lt, .2), { in: 'iris' });
window.DURATION = 16.5; window.META = { music: { style: 'doc' } };
