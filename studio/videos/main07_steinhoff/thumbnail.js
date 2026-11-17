/* main07 thumbnail: one whole bright 2D scene (Look v5). Logo from Rodney's Drive file (logo_steinhoff.png, local only). */
const C = window.CINE, L5 = C.L5, { sv } = C; const BASE = '/home/claude/mfz-media/studio/videos/main07_steinhoff/';
C.initFX({ grain: .05, vignette: .28 });
C.shot(0, 2, ctx => {
  const S = L5.set(ctx, 'ember', { ground: 'city', cam: { z0: 1.0, z1: 1.0 }, stars: 60, seed: 11, motes: 10 });
  const d = S.sub.defs; const g = S.sub.svg;
  sv('circle', { cx: 600, cy: 520, r: 520, fill: L5.orbFill(d, '#ffb03a', .55) }, g);
  const t = L5.tower(S.sub, { x: 600, y: 1080, s: 1.18, w: 380, h: 760, col: '#5a3ad0', win: '#ffd84a' });
  const crack = sv('path', { d: 'M640,190 L590,360 L660,520 L570,700 L650,900', stroke: '#fff3c4', 'stroke-width': 16, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  sv('path', { d: 'M640,190 L590,360 L660,520 L570,700 L650,900', stroke: '#ffd23a', 'stroke-width': 46, fill: 'none', opacity: .35, 'stroke-linecap': 'round' }, g);
  const r = C.rnd(5); for (let i = 0; i < 16; i++) L5.coin(S.sub, { x: 330 + r() * 600, y: 640 + r() * 420, r: 34 + r() * 26 }).setAttribute('transform', `translate(${(330 + r() * 600).toFixed(0)},${(560 + r() * 470).toFixed(0)}) rotate(${(r() * 90 - 45).toFixed(0)})`);
  const arr = L5.grp(S.sub, 930, 300, 1.0); sv('path', { d: 'M-50,-190 L50,-190 L50,0 L115,0 L0,135 L-115,0 L-50,0Z', fill: L5.fill(d, '#ff3d5a') }, arr);
  const box = C.el('div', { class: 'abs' }, S.ui); box.style.cssText += "left:1080px;top:250px;width:690px;font:800 196px/0.9 'Barlow Condensed';color:#ffd23a;text-shadow:0 0 50px rgba(255,190,60,.55),0 12px 0 rgba(0,0,0,.25);letter-spacing:-.01em;";
  box.innerHTML = 'R100<br>BILLION<br><span style="color:#fff">GONE</span>';
  const card = C.el('div', { class: 'abs' }, S.ui); card.style.cssText += `left:1090px;top:850px;width:560px;height:150px;background:#fff;border-radius:26px;box-shadow:0 18px 50px rgba(0,0,0,.45);display:grid;place-items:center;`;
  card.innerHTML = `<img src="${BASE}logo_steinhoff.png" style="max-width:500px;max-height:118px;display:block">`;
  return { S };
}, (st, lt, tt, k) => st.S.tick(0, 0, 0), { live: false });
window.DURATION = 2;
