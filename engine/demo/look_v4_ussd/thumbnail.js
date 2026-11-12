/* USSD thumbnail v6, in the Look v4 style: lit 3D phone dialling *151#, indigo + cyan, logos of the brands named (EcoCash, M-Pesa) on white cards. */
const C = CINE, T3 = C.T3, GL = C.GL, { el, P } = C; C.initFX({ grain: 0, vignette: 0 }); GL.noCssFx(); window.DURATION = 2;
const TH = '/home/claude/fluxr-posts/youtube/videos/02_ussd/thumb/';
T3.phone(0, 2, { pal: 'night', cam: 'right', phoneScale: 1.18, send: .2, screen: () => ({ input: '*151#', soft: ['', 'Call'] }), key: () => 'x', bloom: [.6, .5, .82],
  ui: { build: u => {
    const h = el('div', { class: 'abs' }, u, `<div style="font:800 64px/1 'Barlow Condensed';letter-spacing:.06em;color:#4ff0ff;text-shadow:0 6px 30px rgba(0,0,0,.6)">THIS CODE MOVES</div>
      <div style="font:800 190px/.92 'Barlow Condensed';color:#fff;text-shadow:0 10px 50px rgba(0,0,0,.7)">AFRICA'S<br><span style="color:#ffcf3a">MONEY</span></div>
      <div style="margin-top:22px;font:800 58px/1 'Barlow Condensed';letter-spacing:.04em;color:#fff;background:#ff4f7a;display:inline-block;padding:10px 22px;border-radius:12px;transform:rotate(-2deg)">NO APP. NO INTERNET.</div>`);
    const lg = el('div', { class: 'abs' }, u, `<div style="display:flex;gap:22px;align-items:center">
      <div style="background:#fff;border-radius:18px;padding:14px 22px;display:flex;align-items:center;gap:14px;box-shadow:0 12px 40px rgba(0,0,0,.45)"><img src="${TH}ecocash.png" style="height:58px"><span style="font:800 48px 'Barlow Condensed';color:#111">*151#</span></div>
      <div style="background:#fff;border-radius:18px;padding:12px 22px;display:flex;align-items:center;gap:14px;box-shadow:0 12px 40px rgba(0,0,0,.45)"><img src="${TH}mpesa.png" style="height:70px"><span style="font:800 48px 'Barlow Condensed';color:#111">*334#</span></div></div>`);
    const tag = el('div', { class: 'abs' }, u, `<div style="display:flex;align-items:center;gap:16px"><img src="${TH}fluxr-white.png" style="height:56px"><span style="font:800 34px 'Barlow Condensed';letter-spacing:.14em;color:#cfe">EXPLAINS</span></div>`);
    return { h, lg, tag }; }, update: (s, t) => { P(s.h, { x: 560, y: 520 }); P(s.lg, { x: 520, y: 950 }); P(s.tag, { x: 300, y: 90 }); } } });
