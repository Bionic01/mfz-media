/* main06 thumbnail, Look v4: Naledi's street at dusk in 3D, the rise on her bond in huge type, the SARB logo (Rodney's file) on a white card. */
window.DURATION = 2;
street(0, 2, { pal: 'dawn', cam: 'wide', ui: { build: u => {
  const h = el('div', { class: 'abs' }, u, `<div style="font:800 70px/1 'Barlow Condensed';letter-spacing:.05em;color:#fff;text-shadow:0 6px 30px rgba(0,0,0,.7)">REPO RATE <span style="color:#ff5d5d">+0.25%</span></div>
    <div style="font:800 300px/.9 'Barlow Condensed';color:#f7be33;text-shadow:0 12px 60px rgba(0,0,0,.75)">+R204</div>
    <div style="margin-top:10px;font:800 76px/1 'Barlow Condensed';letter-spacing:.03em;color:#fff;background:#ff5d5d;display:inline-block;padding:10px 26px;border-radius:14px;transform:rotate(-2deg)">A MONTH ON A R1.2M BOND</div>`);
  const lg = el('div', { class: 'abs' }, u, `<div style="background:#fff;border-radius:22px;padding:22px 30px;box-shadow:0 14px 44px rgba(0,0,0,.5)"><img src="${BASE}logo_sarb.png" style="height:150px;display:block"></div>`);
  return { h, lg }; }, update: (s, t) => { P(s.h, { x: 640, y: 560 }); P(s.lg, { x: 1580, y: 220 }); } } });
