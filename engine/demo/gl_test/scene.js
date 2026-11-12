const C = window.CINE, GL = C.GL, T = GL.T, { E, prog, clamp, lerp } = C;
C.initFX({ grain: .05, vignette: .5 });
window.DURATION = 12;
// shot 1: hero feature phone with a readable USSD menu, dialled on time
C.shot(0, 6, ({ root }) => {
  const S = GL.stage(root, { bg: ['#0b1d33', '#02060c'], fog: ['#02060c', 10, 30], bloom: [.45, .5, .85], keyPos: [4, 8, 7] });
  S.add(GL.ground({ color: '#0a1420', grid: 1, gridCol: '#16324d', gridA: .5 }));
  const ph = GL.featurePhone(); ph.group.position.set(0, 1.45, 0); S.add(ph);
  const tw = GL.tower({ h: 8 }); tw.group.position.set(5, 0, -6); S.add(tw);
  const bm = GL.beam([[0, 2.6, 0], [1.5, 5, -2], [5, 7.2, -6]], { color: '#7fe3ff', r: .045 }); S.add(bm);
  const dust = GL.dust({ n: 250, box: [24, 9, 24], color: '#9fd0ff' }); S.add(dust);
  const seq = [[.6, '*'], [.9, '1'], [1.15, '5'], [1.4, '1'], [1.7, '#'], [2.1, 'call']];
  return { S, ph, tw, bm, dust, seq };
}, (s, lt, t) => {
  const typed = GL.typedAt(t, s.seq.filter(x => x[1] !== 'call'));
  const menu = t > 2.6;
  s.ph.draw((g, w, h) => GL.lcdScreen(g, w, h, menu ? { title: 'EcoCash', lines: ['1 Send Money', '2 Buy Airtime', '3 Pay Bill', '4 My Account'], hi: t > 4.2 ? 0 : -1, soft: ['Back', 'Reply'] } : { lines: [], input: typed, cursor: Math.floor(t * 2) % 2 === 0, soft: ['', 'Call'] }), menu + '|' + typed + (t > 4.2) + Math.floor(t * 2) % 2);
  s.ph.press(GL.pressAt(t, s.seq));
  s.ph.group.rotation.y = -.35 + .2 * Math.sin(t * .4); s.ph.group.rotation.x = -.08;
  s.tw.blink(t); s.dust.set(t);
  s.bm.set(clamp((t - 2.1) / .8), clamp((t - 2.5) / 1.2) * 1.2);
  GL.camKeys(s.S.cam, t, [[0, [0.4, 1.7, 3.0], [0, 1.55, 0]], [3, [0.9, 2.0, 4.2], [0.3, 1.7, -0.5]], [6, [2.2, 3.4, 7.5], [2.2, 3.5, -3]]]);
  s.S.render(t);
}, { live: false });
// shot 2: Africa in 3D with an arc
C.shot(6, 12, ({ root }) => {
  const S = GL.stage(root, { bg: ['#2a1206', '#080302'], fog: ['#080302', 14, 40], bloom: [.6, .5, .8], key: '#ffd7a8', rim: '#ff9a4d', shadowExtent: 10 });
  const af = GL.africa({ color: '#3b2a1e', edge: '#a0745a', hl: { ZAF: '#e9b44c', ZWE: '#85ed70' } }); S.add(af);
  const p = af.xy(28, -26), q = af.xy(31, -17.8); const a = GL.arc(p, q, { color: '#ffd36b', h: 1.2, r: .03 }); S.add(a);
  const t3 = GL.text3d('1 BILLION', { size: .9, depth: .3, color: '#ffffff' }); t3.position.set(0, 2.2, 2); S.add(t3);
  return { S, af, a, t3 };
}, (s, lt, t) => {
  s.a.set(clamp(lt / 1.5), (lt * .6) % 1.2); s.af.raise('ZWE', E.outB(clamp(lt / 1)) , .25);
  s.t3.rotation.y = .3 * Math.sin(t * .5); s.t3.position.y = 2.2 + .1 * Math.sin(t);
  GL.camKeys(s.S.cam, t, [[6, [2, 7, 9], [1, 0, 0]], [12, [4, 5, 6], [3, 0, 1]]]);
  s.S.render(t);
}, { in: 'flash', live: false });
