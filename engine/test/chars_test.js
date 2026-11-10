const { World, shot, initFX, Person, SKIN, HAIR, sv, grad, W, H } = CINE;
document.getElementById('stage').style.background = '#2a2f3a';
shot(0, 4, ({ root, world }) => {
  const w = world(); const L = w.layer(1);
  sv('rect', { x: 0, y: 0, width: W, height: H, fill: grad(L.defs, [[0, '#f6d7a7'], [1, '#e9a46b']]) }, L.svg);
  sv('rect', { x: 0, y: 820, width: W, height: 260, fill: '#c97b4a' }, L.svg);
  const ppl = [
    new Person(L.svg, L.defs, { skin: SKIN.dark, hair: 'short', shirt: '#2f6fd1', pants: '#2b2f3a', seed: 2 }),
    new Person(L.svg, L.defs, { skin: SKIN.brown, hair: 'scarf', female: true, shirt: '#f2b632', skirt: '#1f7a5a', skirtPattern: '#f6e27f', scarf: '#d9483b', seed: 3, earrings: true }),
    new Person(L.svg, L.defs, { skin: SKIN.medium, hair: 'afro', female: true, shirt: '#e4572e', pants: '#29335c', seed: 4 }),
    new Person(L.svg, L.defs, { skin: SKIN.deep, hair: 'fade', shirt: '#ffffff', jacket: '#24324a', tie: '#c0392b', pants: '#24324a', seed: 5, beard: true }),
    new Person(L.svg, L.defs, { skin: SKIN.tan, hair: 'cap', cap: '#16a085', shirt: '#8e44ad', pants: '#3d4b66', seed: 6 }),
    new Person(L.svg, L.defs, { skin: SKIN.light, hair: 'bun', female: true, elder: true, glasses: true, shirt: '#7aa6c2', skirt: '#5b4636', seed: 7 }),
  ];
  return { ppl };
}, (s, lt, t) => {
  const poses = ['handsHips', 'phoneEar', 'phone', 'think', 'count', 'arms'];
  const ex = ['smile', 'happy', 'neutral', 'surprised', 'worried', 'happy'];
  s.ppl.forEach((p, i) => p.set(t, { x: 200 + i * 300, y: 900, s: .95, pose: poses[i], expr: ex[i], talk: i === 1 ? 1 : 0, turn: [0, .3, -.2, 0, .5, -.4][i] }));
});
