const C = window.CINE, T3 = C.T3, GL = C.GL; C.setTheme('fluxr'); C.initFX({ grain: .05, vignette: .45 });
window.DURATION = 30;
const dial = [[.4, '*'], [.7, '1'], [.95, '5'], [1.2, '1'], [1.5, '#']];
T3.phone(0, 3, { pal: 'night', dial, send: 1.8, cam: 'hero', screen: t => t < 2 ? { input: GL.typedAt(t, dial), cursor: true, soft: ['', 'Call'] } : { title: 'EcoCash', lines: ['1 Send Money', '2 Buy Airtime', '3 Pay Bill', '4 My Account'], soft: ['Back', 'Reply'] },
  tags: [{ text: 'ZIMBABWE · ECOCASH', at: 2.1, anchor: [0, .66, 0], side: 1 }] });
T3.number(3, 6, { pal: 'gold', text: '1 BILLION', at: 3.3, label: 'MOBILE MONEY ACCOUNTS · SUB-SAHARAN AFRICA', props: 'phones', src: 'GSMA, State of the Industry Report on Mobile Money 2025' });
T3.map(6, 9, { hl: { ZWE: '#85ed70', KEN: '#ffc94d', NGA: '#c78bff' }, raise: [['ZWE', 6.3], ['KEN', 6.6], ['NGA', 6.9]], codes: [{ lon: 30, lat: -19, text: '*151#', at: 6.4 }, { lon: 38, lat: 0, text: '*334#', at: 6.8 }, { lon: 8, lat: 9, text: '*737#', at: 7.2 }], focus: [24, -5], dist: 11, title: 'CODES THAT <mark>OPEN THE DOOR</mark>' });
T3.versus(9, 12, { pal: 'purple', left: { prop: 'bank', label: 'BANKS', at: 9.2, scale: .55 }, right: { prop: 'tower', opts: { h: 5 }, label: 'PHONE NETWORKS', at: 9.5 }, link: 'beam', linkAt: 10, mid: { html: '4 YEARS', at: 10.5 }, title: 'AN ARGUMENT OVER <mark>WHO PAYS</mark>' });
T3.crowd(12, 15, { pal: 'sunset', lit: .25, at: 12.5, value: '≈ 1 IN 4', label: 'USED MOBILE INTERNET IN 2024' });
T3.network(15, 18, { hits: [[15.2, 0], [16.4, 1], [17.6, 2]] });
T3.title(18, 21, { pal: 'steel', lines: ['THE', 'LIMITS'], accentLine: 1, prop: 'clock', kicker: 'CHAPTER 3' });
T3.pile(21, 24, { pal: 'purple', to: 180, at: 21.2, dur: 2.4, noteCol: '#3f7f5a', noteVal: '₦1000', count: { from: 0, to: 300, fmt: v => '₦' + Math.round(v) + ' BN' }, label: 'THE BILL, BY 2024' });
T3.village(24, 30, { people: [[-1, 2, '#e4572e', 25], [1.2, 1, '#2fbf71', 26]], title: 'COVERAGE <mark>IS THERE</mark>' });
