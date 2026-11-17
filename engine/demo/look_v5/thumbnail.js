/* Look v5 thumbnail example: one whole bright 2D scene, one hero subject, 2-4 huge words in one block, everything inside
   the centre 3:2 safe area (x 150-1770). No split-flap tiles, no panels, nothing cut by an edge. A brand logo, when the
   video names a brand, goes on a white card from Rodney's Drive file (see studio/videos/main07_steinhoff/thumbnail.js). */
const C = window.CINE, L5 = C.L5, { sv } = C;
C.initFX({ grain: .05, vignette: .28 });
C.shot(0, 2, ctx => {
  const S = L5.set(ctx, 'teal', { ground: 'hills', stars: 50, seed: 4, motes: 8 }); const d = S.sub.defs, g = S.sub.svg;
  sv('circle', { cx: 620, cy: 560, r: 480, fill: L5.orbFill(d, '#ffd84a', .5) }, g);
  const j = L5.jar(S.sub, { x: 620, y: 960, s: 1.6 }); j.level(.85);
  const box = C.el('div', { class: 'abs' }, S.ui); box.style.cssText += "left:1060px;top:260px;width:700px;font:800 190px/0.9 'Barlow Condensed';color:#ffd84a;text-shadow:0 0 50px rgba(255,200,60,.5),0 12px 0 rgba(0,0,0,.25);";
  box.innerHTML = 'R200<br>A MONTH<br><span style="color:#fff">ADDS UP</span>'; return { S };
}, st => st.S.tick(0, 0, 0), { live: false });
window.DURATION = 2;
