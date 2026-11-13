/* GL3D: lit, shadowed 3D sets for CINE shots (three.js r170, vendor/three-r170.bundle.js). Look v4, 12 Nov 2026.
   One shared WebGL renderer + bloom composer; each shot gets its own scene/camera and a 2D canvas that receives the frame,
   so two 3D shots can overlap in a transition. Everything is a pure function of t (no Math.random, no timers).
   Usage inside a shot build:  const S = C.GL.stage(root, { bg: '#05080c', fog: ['#05080c', 8, 40] });
                               const ph = C.GL.featurePhone(); S.scene.add(ph.group);   ...   update: S.cam.position.set(...); S.render(t);
   See README "Look v4" for the rules. */
'use strict';
(() => {
const C = window.CINE, T = window.THREE, { clamp, lerp, E, prog, noise1, rnd, kf, el } = C;
const W = 1920, H = 1080;
let R = null, comp, rp, bloomP, filmP, ENV = null, HOLD = null; const STAGES = []; const PRE = [];
const FONTS = {};

const QS = new URLSearchParams(location.search);
/** render settings (speed vs quality); a scene may set window.GLCFG before shots build. res = internal resolution scale */
const CFG = Object.assign({ res: +(QS.get('glres') || .8), bloom: QS.get('glbloom') !== '0', fxaa: QS.get('glfxaa') !== '0', shadows: QS.get('glshadow') !== '0', physical: QS.get('glphys') !== '0', lite: QS.get('gllite') === '1', env: QS.get('glenv') !== '0', direct: QS.get('gldirect') !== '0', nogl: QS.get('nogl') === '1',
  /* colour (13 Nov 2026, Rodney on USSD v6: "the graphics are whitish"): ACES pushed every bright colour toward white and the
     screen-blended light leaks lifted two corners of every frame. Neutral tone mapping keeps the palette's colours; no leaks.
     tone: 'neutral' | 'aces' | 'agx'; leak/grain: film pass strengths; envK scales every stage's environment reflections */
  tone: QS.get('gltone') || 'neutral', leak: +(QS.get('glleak') ?? 0), grain: +(QS.get('glgrain') ?? .03), envK: +(QS.get('glenvk') ?? .6) }, window.GLCFG || {});
function init() {
  if (R) return R; Object.assign(CFG, window.GLCFG || {}); M._lite();
  const RW = Math.round(W * CFG.res), RH = Math.round(H * CFG.res);
  // speed (SwiftShader is software GL): no MSAA (FXAA pass instead), plain PCF shadows, bloom at quarter resolution
  R = new T.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  R.setPixelRatio(1); R.setSize(RW, RH, false);
  R.shadowMap.enabled = CFG.shadows; R.shadowMap.type = T.PCFShadowMap;
  R.toneMapping = CFG.tone === 'aces' ? T.ACESFilmicToneMapping : CFG.tone === 'agx' ? T.AgXToneMapping : T.NeutralToneMapping; R.outputColorSpace = T.SRGBColorSpace;
  comp = new T.EffectComposer(R); comp.setSize(RW, RH);
  rp = new T.RenderPass(new T.Scene(), new T.PerspectiveCamera()); comp.addPass(rp);
  bloomP = new T.UnrealBloomPass(new T.Vector2(RW / 2, RH / 2), .6, .45, .82); if (CFG.bloom) { comp.addPass(bloomP); bloomP.setSize(RW / 2, RH / 2); }
  comp.addPass(new T.OutputPass());
  if (CFG.fxaa) { const fxaa = new T.ShaderPass(T.FXAAShader); fxaa.material.uniforms.resolution.value.set(1 / RW, 1 / RH); comp.addPass(fxaa); }
  // film look inside GL (vignette, static grain, drifting light leak): the CSS blend overlays cost ~1 s a frame in the software compositor
  filmP = new T.ShaderPass({ uniforms: { tDiffuse: { value: null }, uT: { value: 0 }, uVig: { value: .42 }, uGrain: { value: CFG.grain }, uLeak: { value: CFG.leak } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uT, uVig, uGrain, uLeak; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 q = vUv - .5; q.x *= 1.25; float v = smoothstep(.75, .25, length(q)); c.rgb *= mix(1.0 - uVig, 1.0, v);
        float lx = .12 + .06 * sin(uT * .25); vec3 leak = vec3(1.0, .62, .32) * smoothstep(.55, .0, length((vUv - vec2(lx, .82)) * vec2(1.6, 1.2))) + vec3(.35, .6, 1.0) * .6 * smoothstep(.5, .0, length((vUv - vec2(.92, .15)) * vec2(1.6, 1.2)));
        c.rgb = 1.0 - (1.0 - c.rgb) * (1.0 - leak * uLeak);
        float g = h(floor(vUv * vec2(${RW}.0, ${RH}.0) / 1.5)) - .5; c.rgb += g * uGrain; gl_FragColor = c; }` });
  comp.addPass(filmP);
  const pm = new T.PMREMGenerator(R); ENV = pm.fromScene(new T.RoomEnvironment(), .04).texture; pm.dispose();
  return R;
}

/** free GPU memory of stages that are far from the current time (they re-upload automatically if rendered again) */
function gc(t) {
  for (const s of STAGES) if (s.live && (t < s.lastT - 2 || t > s.lastT + 2)) {
    s.scene.traverse(o => { if (o.geometry) o.geometry.dispose(); const m = o.material; (Array.isArray(m) ? m : m ? [m] : []).forEach(mm => { for (const k in mm) if (mm[k] && mm[k].isTexture) mm[k].dispose(); mm.dispose(); }); });
    s.cv.width = 1; s.cv.height = 1; s.live = false;
  }
}

/**
 * stage(root, opts) -> { scene, cam, render(t), add(...objs), key, rim, fill }
 * opts: bg (colour or [top, bottom] gradient), fog [colour, near, far], env (environment intensity), exposure,
 *       bloom [strength, radius, threshold], fov, lights: 'studio' | 'night' | 'day' | 'none', key/rim colours, shadow (bool)
 */
function stage(root, o = {}) {
  init();
  const cv = el('canvas', { width: W, height: H, class: 'abs gl3d' }, root); cv.style.cssText += 'left:0;top:0;width:1920px;height:1080px;z-index:0';
  if (root.firstChild !== cv) root.insertBefore(cv, root.firstChild);
  const g2 = cv.getContext('2d');
  const scene = new T.Scene();
  if (Array.isArray(o.bg)) scene.background = gradTex(o.bg[0], o.bg[1], o.bg[2]);
  else scene.background = new T.Color(o.bg || '#05080c');
  if (o.fog) scene.fog = new T.Fog(o.fog[0], o.fog[1], o.fog[2]);
  if (CFG.env && !CFG.lite) { scene.environment = ENV; scene.environmentIntensity = (o.env ?? .45) * CFG.envK; }
  const cam = new T.PerspectiveCamera(o.fov || 35, W / H, .05, 800);
  const S = { scene, cam, cv, g2, live: true, lastT: 0, bloom: o.bloom || [.55, .45, .82], exposure: o.exposure || 1,
    add(...a) { a.forEach(x => scene.add(x.group || x)); return S; },
    render(t) {
      if (CFG.nogl) return; // cue/info passes only need the timeline, not pictures
      if (!S.live) { cv.width = W; cv.height = H; S.live = true; }
      S.lastT = t; gc(t);
      rp.scene = scene; rp.camera = cam; bloomP.strength = S.bloom[0]; bloomP.radius = S.bloom[1]; bloomP.threshold = S.bloom[2];
      R.toneMappingExposure = S.exposure; filmP.uniforms.uT.value = t;
      if (CFG.direct) {
        // the live WebGL canvas sits in this shot (no copy: ~40% faster). If another 3D shot already drew this frame
        // (a transition), freeze its frame into its own 2D canvas first.
        if (HOLD && HOLD !== S && HOLD.lastT === t && HOLD.live) { HOLD.g2.drawImage(R.domElement, 0, 0, W, H); HOLD.cv.style.display = 'block'; }
        comp.render(); const d = R.domElement; if (d.parentNode !== cv.parentNode) { d.style.cssText = 'position:absolute;left:0;top:0;width:1920px;height:1080px;z-index:0'; cv.parentNode.insertBefore(d, cv); }
        cv.style.display = 'none'; HOLD = S;
      } else { comp.render(); g2.drawImage(R.domElement, 0, 0, W, H); }
    } };
  const L = o.lights || 'studio';
  if (L !== 'none') {
    const key = new T.DirectionalLight(o.key || '#fff4e6', L === 'night' ? 1.0 : L === 'day' ? 2.2 : 1.65);
    key.position.set(...(o.keyPos || [5, 9, 6])); key.castShadow = o.shadow !== false;
    key.shadow.mapSize.set(o.shadowSize || 1024, o.shadowSize || 1024); const sc = o.shadowExtent || 8;
    Object.assign(key.shadow.camera, { left: -sc, right: sc, top: sc, bottom: -sc, near: .5, far: 60 }); key.shadow.bias = -.0004; key.shadow.normalBias = .02;
    scene.add(key); scene.add(key.target); S.key = key;
    const rim = new T.DirectionalLight(o.rim || '#7fd4ff', L === 'day' ? .6 : 1.4); rim.position.set(-6, 4, -7); scene.add(rim); S.rim = rim;
    const hemi = new T.HemisphereLight(o.sky || '#9fc6ff', o.groundCol || '#1a140e', L === 'night' ? .25 : L === 'day' ? .9 : .45); scene.add(hemi); S.fill = hemi;
  }
  STAGES.push(S); return S;
}

// ---------------- textures & materials ----------------
function canvasTex(w, h, draw) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
  const tex = new T.CanvasTexture(cv); tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 8;
  const o = { cv, g, tex, w, h, key: null, draw(fn, key) { if (key !== undefined && key === o.key) return o; o.key = key; g.clearRect(0, 0, w, h); fn(g, w, h); tex.needsUpdate = true; return o; } };
  if (draw) o.draw(draw); return o;
}
function gradTex(top, bot, mid) {
  return canvasTex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); if (mid) gr.addColorStop(.55, mid); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, w, h); }).tex;
}
// lite mode (speed): Phong/Lambert shading instead of PBR, no environment map. Looks flatter, closer to Kurzgesagt, ~2x cheaper in SwiftShader.
const LITE = { plastic: (c, r = .45, extra = {}) => new T.MeshPhongMaterial(Object.assign({ color: c, shininess: 60 * (1 - r) + 8, specular: '#555' }, extra)),
  matte: (c, r = .8, extra = {}) => new T.MeshLambertMaterial(Object.assign({ color: c }, extra)),
  metal: (c = '#b9c2cc', r = .3) => new T.MeshPhongMaterial({ color: c, shininess: 80, specular: '#aaa' }),
  gold: () => new T.MeshPhongMaterial({ color: '#f2b84b', shininess: 90, specular: '#fff2c0', emissive: '#3a2400' }) };
const M = {
  plastic: (c, r = .45, extra = {}) => CFG.physical ? new T.MeshPhysicalMaterial(Object.assign({ color: c, roughness: r, metalness: 0, clearcoat: .6, clearcoatRoughness: .25 }, extra)) : new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r * .8, metalness: 0 }, extra)),
  matte: (c, r = .8, extra = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: 0 }, extra)),
  metal: (c = '#b9c2cc', r = .3) => new T.MeshStandardMaterial({ color: c, roughness: r, metalness: .9 }),
  gold: () => new T.MeshStandardMaterial({ color: '#f2b84b', roughness: .25, metalness: 1, emissive: '#3a2400', emissiveIntensity: .25 }),
  glass: (c = '#9fd7ff') => new T.MeshPhysicalMaterial({ color: c, roughness: .05, metalness: 0, transmission: 0, transparent: true, opacity: .25, clearcoat: 1 }),
  glow: (c, i = 2.5) => new T.MeshStandardMaterial({ color: '#000', emissive: c, emissiveIntensity: i, roughness: 1 }),
  basic: (c, extra = {}) => new T.MeshBasicMaterial(Object.assign({ color: c }, extra)),
  _lite() { if (!CFG.lite) return; Object.assign(M, LITE);
    const strip = (o = {}) => { const q = Object.assign({}, o); ['roughness', 'metalness', 'clearcoat', 'clearcoatRoughness', 'transmission', 'envMapIntensity', 'ior', 'thickness'].forEach(k => delete q[k]); if (q.shininess === undefined) q.shininess = 40; return q; };
    const Ph = T.MeshPhongMaterial; T.MeshStandardMaterial = function (o) { return new Ph(strip(o)); }; T.MeshPhysicalMaterial = function (o) { return new Ph(strip(o)); }; },
  screen: (tex, i = .9) => new T.MeshStandardMaterial({ color: '#000', emissive: '#fff', emissiveMap: tex, emissiveIntensity: i, roughness: .25, metalness: 0 }),
};
const rbox = (w, h, d, r = .05, seg = 4) => new T.RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2.01, h / 2.01, d / 2.01));
function mesh(geo, mat, { cast = true, receive = true, pos, rot, scale } = {}) {
  const m = new T.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = receive;
  if (pos) m.position.set(...pos); if (rot) m.rotation.set(...rot); if (scale) (typeof scale === 'number' ? m.scale.setScalar(scale) : m.scale.set(...scale)); return m;
}
function group(...kids) { const g = new T.Group(); kids.forEach(k => g.add(k)); return g; }

/** rounded-rect path helper for 2D canvas */
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function fitText(g, text, maxW, size, weight = 800, family = 'Barlow Condensed') { let s = size; do { g.font = `${weight} ${s}px "${family}"`; s -= 2; } while (g.measureText(text).width > maxW && s > 8); return s + 2; }

// ---------------- screens ----------------
/** classic feature-phone LCD: { title, lines[], input, cursor(bool), hi (highlighted line index), bars, battery } */
function lcdScreen(g, w, h, s = {}) {
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, s.bg0 || '#c8e6a0'); bg.addColorStop(1, s.bg1 || '#9fc77a'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = s.ink || '#13230c'; const pad = w * .06; let y = h * .1;
  // status bar
  g.font = `700 ${h * .07}px "Barlow"`; g.textBaseline = 'middle';
  for (let i = 0; i < 4; i++) g.fillRect(pad + i * w * .028, h * .095 - i * h * .012, w * .018, h * .03 + i * h * .012);
  g.fillText(s.clock || '', w * .42, h * .085); g.strokeStyle = g.fillStyle; g.lineWidth = 3; g.strokeRect(w - pad - w * .1, h * .06, w * .09, h * .05); g.fillRect(w - pad - w * .09, h * .07, w * .065, h * .03);
  y = h * .2; g.textBaseline = 'top';
  if (s.input !== undefined && !(s.lines && s.lines.length) && !s.title) { // dialling: big digits, like a real dial screen
    g.fillStyle = s.ink || '#13230c'; const txt = s.input + (s.cursor ? '|' : ''); const fs = fitText(g, txt || ' ', w - 2 * pad, h * .3, 800, 'Barlow'); g.textBaseline = 'middle'; g.fillText(txt, pad, h * .52);
    if (s.soft) { g.font = `800 ${h * .075}px "Barlow"`; g.textBaseline = 'bottom'; g.fillText(s.soft[0] || '', pad, h - h * .03); const r = s.soft[1] || ''; g.fillText(r, w - pad - g.measureText(r).width, h - h * .03); } return; }
  if (s.title) { const fs = fitText(g, s.title, w - 2 * pad, h * .1, 800); g.fillText(s.title, pad, y); y += fs * 1.25; g.fillRect(pad, y - fs * .1, w - 2 * pad, 3); y += h * .02; }
  const lines = s.lines || []; const lh = Math.min(h * .105, (h * .78 - y) / Math.max(lines.length + (s.input !== undefined ? 1.2 : 0), 1));
  lines.forEach((ln, i) => { const fs = lh * .82; g.font = `700 ${fs}px "Barlow"`;
    if (s.hi === i) { g.fillStyle = s.ink || '#13230c'; g.fillRect(pad - 6, y - 2, w - 2 * pad + 12, lh); g.fillStyle = s.bg0 || '#c8e6a0'; } else g.fillStyle = s.ink || '#13230c';
    g.fillText(ln, pad, y + lh * .06, w - 2 * pad); y += lh; });
  if (s.input !== undefined) { g.fillStyle = s.ink || '#13230c'; y += lh * .2; g.lineWidth = 3; g.strokeRect(pad, y, w - 2 * pad, lh * 1.05); g.font = `800 ${lh * .8}px "Barlow"`; g.fillText(s.input + (s.cursor ? '|' : ''), pad + 10, y + lh * .14); }
  if (s.soft) { g.font = `800 ${h * .075}px "Barlow"`; g.fillStyle = s.ink || '#13230c'; g.textBaseline = 'bottom'; g.fillText(s.soft[0] || '', pad, h - h * .03); const r = s.soft[1] || ''; g.fillText(r, w - pad - g.measureText(r).width, h - h * .03); }
}
/** smartphone USSD popup (Android style) over a dimmed home screen: { lines[], input, buttons: ['CANCEL','SEND'], press (0..1 on SEND), dim } */
function popupScreen(g, w, h, s = {}) {
  const bg = g.createLinearGradient(0, 0, w, h); bg.addColorStop(0, s.wall0 || '#1b3a5a'); bg.addColorStop(1, s.wall1 || '#0b1626'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  // faint app grid
  g.globalAlpha = .35; for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) { g.fillStyle = ['#4fa3ff', '#ffb347', '#7ee07a', '#ff6b8b'][(r + c) % 4]; rr(g, w * (.1 + c * .21), h * (.2 + r * .13), w * .14, w * .14, w * .035); g.fill(); }
  g.globalAlpha = 1; g.fillStyle = `rgba(0,0,0,${s.dim ?? .55})`; g.fillRect(0, 0, w, h);
  if (s.status !== false) { g.fillStyle = '#fff'; g.font = `600 ${w * .045}px "Barlow"`; g.textBaseline = 'middle'; g.fillText(s.clock || '09:41', w * .07, h * .03); }
  if (s.dialer !== undefined) { g.fillStyle = '#0b0e14'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; const txt = s.dialer || ' '; const fs = fitText(g, txt, w * .86, w * .16, 600, 'Barlow'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h * .25);
    const K = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']; K.forEach((k, i) => { const x = w * (.22 + (i % 3) * .28), y = h * (.42 + Math.floor(i / 3) * .1); const on = s.hiKey === k; g.fillStyle = on ? '#4ff0ff' : 'rgba(255,255,255,.1)'; g.beginPath(); g.arc(x, y, w * .1, 0, 7); g.fill(); g.fillStyle = on ? '#001018' : '#fff'; g.font = `600 ${w * .08}px "Barlow"`; g.fillText(k, x, y); });
    g.fillStyle = '#2fbf71'; g.beginPath(); g.arc(w / 2, h * .86, w * .1, 0, 7); g.fill(); g.textAlign = 'left'; return; }
  if (!s.lines) return;
  const lines = s.lines; const pw = w * .86, px = (w - pw) / 2; const fs = w * .058; const lh = fs * 1.32;
  const ph = lh * lines.length + fs * 1.4 + (s.input !== undefined ? lh * 1.6 : 0) + fs * 2.6; const py = (h - ph) / 2 + (s.dy || 0);
  g.fillStyle = '#ffffff'; rr(g, px, py, pw, ph, w * .045); g.fill();
  g.fillStyle = '#121417'; g.textBaseline = 'top'; let y = py + fs * .9;
  lines.forEach((ln, i) => { g.font = `${i === 0 && s.boldFirst !== false ? 800 : 600} ${fs}px "Barlow"`; g.fillStyle = s.hi === i ? '#0a7d3b' : '#121417'; g.fillText(ln, px + fs * .8, y, pw - fs * 1.6); y += lh; });
  if (s.input !== undefined) { y += lh * .25; g.strokeStyle = '#0a7d3b'; g.lineWidth = w * .006; g.beginPath(); g.moveTo(px + fs * .8, y + lh * 1.05); g.lineTo(px + pw - fs * .8, y + lh * 1.05); g.stroke(); g.font = `700 ${fs * 1.05}px "Barlow"`; g.fillStyle = '#121417'; g.fillText(s.input + (s.cursor ? '|' : ''), px + fs * .8, y + lh * .1); y += lh * 1.35; }
  const bts = s.buttons || ['CANCEL', 'SEND']; g.font = `800 ${fs * .95}px "Barlow"`; g.textBaseline = 'middle';
  const by = py + ph - fs * 1.35; const p = s.press || 0;
  if (p > 0) { g.fillStyle = `rgba(10,125,59,${.22 * Math.sin(Math.PI * Math.min(p, 1))})`; rr(g, px + pw - fs * 5.6, by - fs * .9, fs * 4.9, fs * 1.8, fs * .4); g.fill(); }
  g.fillStyle = '#0a7d3b'; g.fillText(bts[1] || '', px + pw - fs * .9 - g.measureText(bts[1] || '').width, by); g.fillText(bts[0] || '', px + pw - fs * 6.4 - g.measureText(bts[0] || '').width, by);
}

// ---------------- devices ----------------
/** classic candybar phone with a live LCD and pressable keys. Units: metres-ish (phone ~1.1 x 2.5). */
function featurePhone(o = {}) {
  const body = o.color || '#262b33', accent = o.accent || '#3a414c';
  const g = new T.Group(); const sw = .9, sh = .78;
  g.add(mesh(rbox(1.12, 2.55, .26, .16, 6), M.plastic(body, .38)));
  g.add(mesh(rbox(1.0, 2.4, .04, .12, 4), M.plastic(accent, .3), { pos: [0, 0, .125] }));
  // screen frame + LCD
  g.add(mesh(rbox(sw + .1, sh + .1, .03, .04, 3), M.plastic('#0c0e11', .2), { pos: [0, .66, .145] }));
  const scr = canvasTex(o.res || 720, Math.round((o.res || 720) * sh / sw));
  const lcd = mesh(new T.PlaneGeometry(sw, sh), M.screen(scr.tex, o.glow ?? .95), { cast: false, pos: [0, .66, .162] }); g.add(lcd);
  g.add(mesh(rbox(.36, .05, .02, .02, 2), M.matte('#0a0b0d'), { pos: [0, 1.15, .14] })); // earpiece
  // keys: 0..11 = 1-9,*,0,#   12 call, 13 end, 14 nav
  const labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']; const keys = [];
  const keyMat = (lab, col = '#3a414b', ink = '#eef2f6') => { const t = canvasTex(160, 100, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); c.fillStyle = ink; c.font = `800 ${lab.length > 1 ? 40 : 66}px "Barlow"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(lab, w / 2, h / 2 + 3); });
    return new T.MeshPhysicalMaterial({ map: t.tex, roughness: .35, clearcoat: .5, emissive: '#000', emissiveIntensity: 1 }); };
  labels.forEach((lab, i) => { const k = mesh(rbox(.28, .17, .07, .05, 3), keyMat(lab), { pos: [-.33 + (i % 3) * .33, -.28 - Math.floor(i / 3) * .23, .16] }); k.userData.z0 = .16; g.add(k); keys.push(k); });
  const call = mesh(rbox(.3, .14, .07, .05, 3), keyMat('CALL', '#2fbf71', '#fff'), { pos: [-.33, .05, .16] }); call.userData.z0 = .16; g.add(call); keys.push(call);
  const end = mesh(rbox(.3, .14, .07, .05, 3), keyMat('END', '#e2474b', '#fff'), { pos: [.33, .05, .16] }); end.userData.z0 = .16; g.add(end); keys.push(end);
  const nav = mesh(new T.CylinderGeometry(.13, .13, .07, 28), M.plastic('#c9cfd6', .3), { pos: [0, .07, .16], rot: [Math.PI / 2, 0, 0] }); nav.userData.z0 = .16; g.add(nav); keys.push(nav);
  const KEYI = { '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5, '7': 6, '8': 7, '9': 8, '*': 9, '0': 10, '#': 11, call: 12, end: 13, ok: 14 };
  return { group: g, screen: scr, lcd, keys, KEYI,
    /** press[key] = 0..1 amount; glow colour */
    press(map = {}, col = '#85ed70') { keys.forEach(k => { k.position.z = k.userData.z0; k.material.emissive && k.material.emissive.set('#000'); });
      for (const kk in map) { const k = keys[KEYI[kk]]; if (!k) continue; const a = clamp(map[kk]); k.position.z = k.userData.z0 - .035 * a; k.material.emissive.set(col); k.material.emissiveIntensity = a * .9; } },
    draw(fn, key) { scr.draw(fn, key); } };
}
/** keys pressed over time from spoken digits: seq = [[t, '1'], ...] -> press map at time t */
function pressAt(t, seq, dur = .22) { const m = {}; for (const [a, k] of seq) { const q = t - a; if (q >= -.02 && q < dur) m[k] = Math.max(m[k] || 0, Math.sin(Math.PI * clamp((q + .02) / dur))); } return m; }
/** typed string up to time t from seq */
function typedAt(t, seq) { return seq.filter(([a]) => t >= a).map(([, k]) => k).join(''); }

/** modern smartphone, screen is a canvas texture (portrait 1080x2160 by default) */
function smartphone(o = {}) {
  const g = new T.Group(); const w = 1.15, h = 2.36;
  g.add(mesh(rbox(w, h, .1, .16, 8), M.metal(o.frame || '#2b2f36', .28)));
  g.add(mesh(rbox(w - .04, h - .04, .102, .15, 8), M.plastic('#050608', .12)));
  const scr = canvasTex(o.resW || 720, o.resH || 1440, (g, w, h) => popupScreen(g, w, h, { dim: 0 }));
  const s = mesh(new T.PlaneGeometry(w - .1, h - .1), M.screen(scr.tex, o.glow ?? .72), { cast: false, pos: [0, 0, .053] }); g.add(s);
  g.add(mesh(new T.CylinderGeometry(.025, .025, .01, 16), M.matte('#000'), { pos: [0, h / 2 - .1, .056], rot: [Math.PI / 2, 0, 0] }));
  return { group: g, screen: scr, draw(fn, key) { scr.draw(fn, key); } };
}

// ---------------- network ----------------
/** lattice cell tower with panel antennas and a red beacon. height ~ 9 units */
function tower(o = {}) {
  const g = new T.Group(); const h = o.h || 9, b = o.base || 1.1, top = o.top || .35; const steel = M.metal(o.steel || '#aab3bc', .35);
  const geos = []; const legP = (i, y) => { const a = i * Math.PI * 2 / 3 + Math.PI / 6; const r = lerp(b, top, y / h); return new T.Vector3(Math.cos(a) * r, y, Math.sin(a) * r); };
  const strut = (p, q, r = .035) => { const d = q.clone().sub(p); const len = d.length(); const c = new T.CylinderGeometry(r, r, len, 6); c.translate(0, len / 2, 0); const m = new T.Matrix4(); const qq = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), d.clone().normalize()); m.compose(p, qq, new T.Vector3(1, 1, 1)); c.applyMatrix4(m); geos.push(c); };
  for (let i = 0; i < 3; i++) strut(legP(i, 0), legP(i, h), .06);
  const N = o.sections || 10; for (let s = 0; s < N; s++) { const y0 = s * h / N, y1 = (s + 1) * h / N; for (let i = 0; i < 3; i++) { const j = (i + 1) % 3; strut(legP(i, y0), legP(j, y1), .025); strut(legP(j, y0), legP(i, y1), .025); strut(legP(i, y1), legP(j, y1), .025); } }
  g.add(mesh(T.BufferGeometryUtils.mergeGeometries(geos), steel));
  // antenna platform + 3 panel antennas (+ dish)
  const ant = M.plastic('#eef1f4', .5);
  for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; const p = mesh(rbox(.32, 1.3, .14, .05, 2), ant, { pos: [Math.cos(a) * .62, h - .9, Math.sin(a) * .62] }); p.rotation.y = -a + Math.PI / 2; g.add(p); }
  g.add(mesh(new T.TorusGeometry(.6, .04, 6, 24), steel, { pos: [0, h - 1.55, 0], rot: [Math.PI / 2, 0, 0] }));
  const dish = mesh(new T.SphereGeometry(.42, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.6), M.plastic('#f2f4f6', .45, { side: T.DoubleSide }), { pos: [.25, h - 2.6, .3], rot: [-Math.PI / 2, 0, 0] }); dish.rotation.set(Math.PI / 2 - .2, 0, -.6); g.add(dish);
  const beacon = mesh(new T.SphereGeometry(.1, 16, 12), M.glow('#ff3b30', 4), { cast: false, pos: [0, h + .12, 0] }); g.add(beacon);
  g.add(mesh(new T.CylinderGeometry(.03, .03, .5, 6), steel, { pos: [0, h - .1, 0] }));
  return { group: g, beacon, height: h, top: new T.Vector3(0, h - .9, 0), blink(t) { const on = (t * 1.2) % 1 < .5; beacon.material.emissiveIntensity = on ? 5 : .3; } };
}

/** glowing beam along points with a reveal (0..1) and travelling pulses. uv.x runs along the tube. */
function beam(points, o = {}) {
  const curve = new T.CatmullRomCurve3(points.map(p => p.isVector3 ? p : new T.Vector3(...p)), false, 'catmullrom', o.tension ?? .5);
  const geo = new T.TubeGeometry(curve, o.seg || 160, o.r || .05, 10, false);
  const mat = new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: T.AdditiveBlending,
    uniforms: { uRev: { value: 0 }, uP: { value: -1 }, uP2: { value: -1 }, uCol: { value: new T.Color(o.color || '#85ed70') }, uBase: { value: o.base ?? 1.1 }, uHead: { value: o.head ?? 4 }, uW: { value: o.pulseW || .05 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec2 vUv; uniform float uRev, uP, uP2, uBase, uHead, uW; uniform vec3 uCol;
      void main(){ float x = vUv.x; if (x > uRev) discard; float tip = smoothstep(uRev - .06, uRev, x) * step(uRev, .999);
        float p = exp(-pow((x - uP) / uW, 2.0)) + exp(-pow((x - uP2) / uW, 2.0));
        float edge = 1.0 - abs(vUv.y - .5) * 1.2; float a = uBase * edge + (p + tip) * uHead;
        gl_FragColor = vec4(uCol * a, clamp(a, 0.0, 1.0)); }` });
  const m = new T.Mesh(geo, mat); m.castShadow = false; m.receiveShadow = false; m.frustumCulled = false;
  return { group: m, curve, mat, set(rev = 1, p = -1, p2 = -1) { mat.uniforms.uRev.value = clamp(rev, 0, 1.0001); mat.uniforms.uP.value = p; mat.uniforms.uP2.value = p2; },
    at(k) { return curve.getPointAt(clamp(k)); } };
}
/** a glowing sphere "packet" */
function orb(color = '#b6ff9e', r = .12, i = 4) { const g = new T.Group(); g.add(mesh(new T.SphereGeometry(r, 20, 14), M.glow(color, i), { cast: false })); const l = new T.PointLight(color, 3, 3); g.add(l); return { group: g, light: l }; }
/** expanding signal rings (radio waves) from a point; set(t) */
function waves(color = '#7fe3ff', n = 3, o = {}) {
  const g = new T.Group(); const rings = [];
  for (let i = 0; i < n; i++) { const m = mesh(new T.TorusGeometry(1, o.thick || .02, 6, 64, o.arc || Math.PI * 2), new T.MeshBasicMaterial({ color, transparent: true, blending: T.AdditiveBlending, depthWrite: false }), { cast: false }); if (o.facing !== 'camera') m.rotation.x = Math.PI / 2; g.add(m); rings.push(m); }
  return { group: g, set(t, speed = .8, maxR = o.maxR || 3) { rings.forEach((m, i) => { const k = ((t * speed + i / n) % 1); m.scale.setScalar(.15 + k * maxR); m.material.opacity = (1 - k) * (o.alpha || .9); }); } };
}
/** server rack with blinking LEDs (InstancedMesh). set(t) */
function rack(o = {}) {
  const g = new T.Group(); const h = o.h || 3.2, w = o.w || 1.1, d = o.d || 1.1;
  g.add(mesh(rbox(w, h, d, .03, 2), M.metal('#1c2026', .5), { pos: [0, h / 2, 0] }));
  const face = canvasTex(256, 768, (c, cw, ch) => { c.fillStyle = '#0d1014'; c.fillRect(0, 0, cw, ch); for (let i = 0; i < 16; i++) { const y = 18 + i * 46; c.fillStyle = '#20262e'; c.fillRect(14, y, cw - 28, 38); c.fillStyle = '#2c343e'; for (let k = 0; k < 10; k++) c.fillRect(24 + k * 20, y + 8, 12, 22); } });
  g.add(mesh(new T.PlaneGeometry(w * .9, h * .94), new T.MeshStandardMaterial({ map: face.tex, roughness: .6, metalness: .4 }), { cast: false, pos: [0, h / 2, d / 2 + .005] }));
  const n = o.leds || 48; const led = new T.InstancedMesh(new T.PlaneGeometry(.035, .035), new T.MeshBasicMaterial({ color: '#fff', toneMapped: false }), n); const r = rnd(o.seed || 3); const pos = [];
  const mm = new T.Matrix4(); for (let i = 0; i < n; i++) { const row = i % 16, col = Math.floor(i / 16); const p = [w * .3 + col * .06 - .05, h * .03 + (row + .5) * h * .94 / 16, d / 2 + .01]; pos.push({ p, ph: r() * 10, sp: .5 + r() * 3, col: r() < .7 ? '#7dff6a' : r() < .5 ? '#3fb8ff' : '#ffb03b' }); mm.makeTranslation(...p); led.setMatrixAt(i, mm); }
  g.add(led); const cc = new T.Color();
  return { group: g, set(t) { pos.forEach((q, i) => { const on = noise1(t * q.sp + q.ph, 5) > -.1; cc.set(q.col).multiplyScalar(on ? 2.2 : .15); led.setColorAt(i, cc); }); led.instanceColor.needsUpdate = true; } };
}

// ---------------- places & things ----------------
function ground(o = {}) {
  const m = mesh(new T.PlaneGeometry(o.size || 200, o.size || 200), new T.MeshStandardMaterial({ color: o.color || '#0c1a14', roughness: o.rough ?? .85, metalness: 0 }), { cast: false, rot: [-Math.PI / 2, 0, 0] });
  if (o.grid) { const g = new T.GridHelper(o.size || 200, (o.size || 200) / (o.grid || 2), o.gridCol || '#1f3d31', o.gridCol || '#1f3d31'); g.position.y = .002; g.material.transparent = true; g.material.opacity = o.gridA ?? .35; return group(m, g); }
  return m;
}
/** simple house: walls, pitched roof, door, lit windows (night > 0 lights them) */
function house(o = {}) {
  const g = new T.Group(); const w = o.w || 2, d = o.d || 1.8, h = o.h || 1.3; const wall = M.matte(o.wall || '#e9dcc5', .9);
  g.add(mesh(new T.BoxGeometry(w, h, d), wall, { pos: [0, h / 2, 0] }));
  const roofShape = new T.Shape(); roofShape.moveTo(-w / 2 - .12, 0); roofShape.lineTo(0, o.roofH || .8); roofShape.lineTo(w / 2 + .12, 0); roofShape.closePath();
  const roof = mesh(new T.ExtrudeGeometry(roofShape, { depth: d + .2, bevelEnabled: false }), M.matte(o.roof || '#a8432f', .7), { pos: [0, h, -d / 2 - .1] }); g.add(roof);
  g.add(mesh(new T.BoxGeometry(.38, .7, .04), M.matte(o.door || '#5a3a24'), { pos: [w * .18, .35, d / 2 + .01] }));
  const win = new T.MeshStandardMaterial({ color: '#1a2230', emissive: o.windowCol || '#ffc66b', emissiveIntensity: o.night ? 1.6 : 0, roughness: .3 });
  g.add(mesh(new T.BoxGeometry(.42, .34, .04), win, { pos: [-w * .22, h * .6, d / 2 + .01] }));
  return { group: g, win };
}
function tree(o = {}) { const g = new T.Group(); g.add(mesh(new T.CylinderGeometry(.07, .1, o.h || 1.2, 7), M.matte('#5b3b25'), { pos: [0, (o.h || 1.2) / 2, 0] }));
  const crown = M.matte(o.leaf || '#2f7d3f', .8); g.add(mesh(new T.IcosahedronGeometry(o.r || .7, 1), crown, { pos: [0, (o.h || 1.2) + .3, 0] })); if (o.acacia) { g.children[1].scale.set(1.6, .45, 1.6); } return g; }
/** generic bank building (never a real bank's look) */
function bank(o = {}) {
  const g = new T.Group(); const stone = M.matte(o.stone || '#d4ccbd', .75); const w = o.w || 6, d = o.d || 3.4;
  for (let i = 0; i < 3; i++) g.add(mesh(new T.BoxGeometry(w + 1 - i * .3, .18, d + 1 - i * .3), stone, { pos: [0, .09 + i * .18, 0] }));
  g.add(mesh(new T.BoxGeometry(w - .4, 2.6, d - .6), M.matte('#d9d2c4', .8), { pos: [0, .54 + 1.3, -.2] }));
  const n = o.cols || 6; for (let i = 0; i < n; i++) g.add(mesh(new T.CylinderGeometry(.16, .19, 2.6, 18), stone, { pos: [-w / 2 + .5 + i * (w - 1) / (n - 1), .54 + 1.3, d / 2 - .25] }));
  g.add(mesh(new T.BoxGeometry(w + .2, .35, d + .2), stone, { pos: [0, 3.32, 0] }));
  const sh = new T.Shape(); sh.moveTo(-w / 2 - .1, 0); sh.lineTo(0, 1.1); sh.lineTo(w / 2 + .1, 0); sh.closePath();
  g.add(mesh(new T.ExtrudeGeometry(sh, { depth: d + .2, bevelEnabled: false }), stone, { pos: [0, 3.49, -d / 2 - .1] }));
  const lab = canvasTex(512, 96, (c, cw, ch) => { c.fillStyle = '#d9d2c4'; c.fillRect(0, 0, cw, ch); c.fillStyle = '#4a4436'; c.font = '800 64px "Barlow Condensed"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(o.label || 'BANK', cw / 2, ch / 2 + 4); });
  g.add(mesh(new T.PlaneGeometry(2.4, .45), new T.MeshStandardMaterial({ map: lab.tex, roughness: .8 }), { cast: false, pos: [0, 3.32, d / 2 + .11] }));
  return { group: g };
}
function coin(o = {}) { const m = mesh(new T.CylinderGeometry(o.r || .35, o.r || .35, o.h || .07, 40), M.gold()); return m; }
function coinStack(n = 8, o = {}) { const g = new T.Group(); const r = rnd(o.seed || 4); for (let i = 0; i < n; i++) { const c = coin(o); c.position.set((r() - .5) * .04, i * (o.h || .07) * 1.02 + .035, (r() - .5) * .04); c.rotation.y = r() * 6; g.add(c); } return g; }
/** stylised banknote (generic design: value, colour, pattern; never a copy of a real note) */
function note(o = {}) {
  const t = canvasTex(512, 240, (c, w, h) => { const col = o.color || '#3d8f5a'; c.fillStyle = col; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 3; c.strokeRect(10, 10, w - 20, h - 20);
    for (let i = 0; i < 18; i++) { c.beginPath(); c.arc(w * .72, h * .5, 20 + i * 6, 0, Math.PI * 2); c.strokeStyle = 'rgba(255,255,255,.08)'; c.stroke(); }
    c.fillStyle = '#fff'; c.font = '800 84px "Barlow Condensed"'; c.textBaseline = 'middle'; c.fillText(o.value || '100', 30, h * .5); c.font = '700 26px "Barlow"'; c.fillText(o.label || '', 34, h * .82); });
  return mesh(new T.BoxGeometry(o.w || 1.6, o.h || .75, .006), [M.matte('#ddd'), M.matte('#ddd'), M.matte('#ddd'), M.matte('#ddd'), new T.MeshStandardMaterial({ map: t.tex, roughness: .7 }), new T.MeshStandardMaterial({ map: t.tex, roughness: .7 })]);
}
/** flat label plane (canvas text), faces +z; use .lookAt(camera) to billboard */
function label(text, o = {}) {
  const size = o.size || 64, pad = size * .45; const tmp = document.createElement('canvas').getContext('2d'); tmp.font = `${o.weight || 800} ${size}px "${o.family || 'Barlow Condensed'}"`;
  const tw = Math.ceil(tmp.measureText(text).width + pad * 2), th = Math.ceil(size * 1.5);
  const t = canvasTex(tw, th, (c, w, h) => { if (o.bg !== null) { c.fillStyle = o.bg || 'rgba(8,12,18,.82)'; rr(c, 0, 0, w, h, h * .22); c.fill(); if (o.border) { c.strokeStyle = o.border; c.lineWidth = 6; rr(c, 3, 3, w - 6, h - 6, h * .2); c.stroke(); } }
    c.fillStyle = o.color || '#fff'; c.font = `${o.weight || 800} ${size}px "${o.family || 'Barlow Condensed'}"`; c.textBaseline = 'middle'; c.textAlign = 'center'; c.fillText(text, w / 2, h / 2 + size * .04); });
  const sc = (o.world || .5) / size; const m = mesh(new T.PlaneGeometry(tw * sc, th * sc), new T.MeshBasicMaterial({ map: t.tex, transparent: true, depthWrite: false, toneMapped: false }), { cast: false, receive: false });
  m.renderOrder = 10; return m;
}
/** soft particle field (dust / bokeh) in a box; set(t) drifts them */
function dust(o = {}) {
  const n = o.n || 300, r = rnd(o.seed || 9), box = o.box || [20, 10, 20]; const pos = new Float32Array(n * 3); const base = [];
  for (let i = 0; i < n; i++) { base.push([(r() - .5) * box[0], r() * box[1], (r() - .5) * box[2], r() * 10]); }
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3));
  const spr = canvasTex(64, 64, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.4, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const pts = new T.Points(geo, new T.PointsMaterial({ size: o.size || .08, map: spr.tex, color: o.color || '#cfe8ff', transparent: true, opacity: o.alpha || .6, depthWrite: false, blending: T.AdditiveBlending }));
  if (o.y) pts.position.y = o.y;
  return { group: pts, set(t) { for (let i = 0; i < n; i++) { const b = base[i]; pos[i * 3] = b[0] + noise1(t * .15 + b[3], 2) * .6; pos[i * 3 + 1] = (b[1] + t * (o.rise ?? .08) + noise1(t * .1 + b[3], 3) * .3) % box[1]; pos[i * 3 + 2] = b[2] + noise1(t * .12 + b[3], 4) * .6; } geo.attributes.position.needsUpdate = true; } };
}

// ---------------- maps ----------------
/** parse the M/L/Z path strings of assets/africa.js into THREE.Shapes (x,y in map px; y flipped) */
function pathShapes(d, sc, ox, oy) {
  const shapes = []; let cur = null;
  d.replace(/([MLZ])([^MLZ]*)/gi, (_, cmd, args) => { const n = args.trim().split(/[ ,]+/).filter(Boolean).map(Number);
    if (cmd.toUpperCase() === 'M') { if (cur) shapes.push(cur); cur = new T.Shape(); cur.moveTo((n[0] - ox) * sc, -(n[1] - oy) * sc); for (let i = 2; i < n.length; i += 2) cur.lineTo((n[i] - ox) * sc, -(n[i + 1] - oy) * sc); }
    else if (cmd.toUpperCase() === 'L') { for (let i = 0; i < n.length; i += 2) cur.lineTo((n[i] - ox) * sc, -(n[i + 1] - oy) * sc); }
    else if (cur) { cur.closePath(); } return ''; });
  if (cur) shapes.push(cur); return shapes.filter(s => s.getPoints().length > 3);
}
/** extruded 3D Africa. countries lie flat on the XZ plane (y up). o: { scale, depth, color, edge, hl: {ISO: colour} }
    returns { group, countries: {ISO: mesh}, xy(lon, lat) -> Vector3 on top surface, raise(ISO, k) } */
function africa(o = {}) {
  const A = window.AFRICA, sc = o.scale || .01, ox = 560, oy = 560; const g = new T.Group(); const countries = {};
  const base = M.matte(o.color || '#2a3b34', .85), edgeMat = new T.LineBasicMaterial({ color: o.edge || '#5d7a6d', transparent: true, opacity: .7 });
  for (const iso in A) { const shapes = pathShapes(A[iso].d, sc, ox, oy); if (!shapes.length) continue;
    const geo = new T.ExtrudeGeometry(shapes, { depth: o.depth || .12, bevelEnabled: true, bevelThickness: .015, bevelSize: .012, bevelSegments: 1, curveSegments: 1 });
    geo.rotateX(-Math.PI / 2); const col = o.hl && o.hl[iso]; const m = mesh(geo, col ? M.matte(col, .6) : base); m.userData.iso = iso; g.add(m); countries[iso] = m;
    const eg = new T.EdgesGeometry(geo, 30); const ln = new T.LineSegments(eg, edgeMat); m.add(ln); }
  const xy = (lon, lat) => { const [px, py] = window.AFRICA_PROJ(lon, lat); return new T.Vector3((px - ox) * sc, (o.depth || .12) + .02, (py - oy) * sc); };
  return { group: g, countries, xy, color(iso, c, glow = 0) { const m = countries[iso]; if (!m) return; if (!m.userData.own) { m.material = m.material.clone(); m.userData.own = 1; } m.material.color.set(c); m.material.emissive = new T.Color(c); m.material.emissiveIntensity = glow; },
    raise(iso, k, hmax = .5) { const m = countries[iso]; if (m) { m.position.y = k * hmax; } } };
}
/** arc between two points (Vector3) as a beam rising to height h */
function arc(p, q, o = {}) { const mid = p.clone().add(q).multiplyScalar(.5); mid.y += o.h || p.distanceTo(q) * .35; const pts = []; for (let i = 0; i <= 24; i++) { const k = i / 24; const a = p.clone().lerp(mid, k), b = mid.clone().lerp(q, k); pts.push(a.lerp(b, k)); } return beam(pts, o); }

// ---------------- 3D type ----------------
/** preload a TTF as a three Font (await before rendering). name -> url relative to engine */
function loadFont(name, url) { PRE.push(new Promise(res => new T.TTFLoader().load(url, json => { FONTS[name] = new T.Font(json); res(); }, undefined, () => { console.warn('font failed ' + url); res(); }))); }
/** preload an image as a texture (await before rendering); GL.TEX[name] */
const TEX = {};
function loadTex(name, url) { PRE.push(new Promise(res => new T.TextureLoader().load(url, tx => { tx.colorSpace = T.SRGBColorSpace; tx.anisotropy = 8; TEX[name] = tx; res(); }, undefined, () => { console.warn('texture failed ' + url); res(); }))); }
/** extruded 3D text, centred. o: { font: 'cond', size, depth, color, metal, emissive } */
function text3d(str, o = {}) {
  const f = FONTS[o.font || 'cond']; if (!f) { console.warn('font not loaded'); return new T.Group(); }
  const geo = new T.TextGeometry(str, { font: f, size: o.size || 1, depth: o.depth ?? .25, curveSegments: 4, bevelEnabled: o.bevel !== false, bevelThickness: .03 * (o.size || 1), bevelSize: .02 * (o.size || 1), bevelSegments: 2 });
  geo.computeBoundingBox(); const bb = geo.boundingBox; geo.translate(-(bb.max.x + bb.min.x) / 2, -(bb.max.y + bb.min.y) / 2, -(o.depth ?? .25) / 2);
  const front = o.mat || new T.MeshPhysicalMaterial({ color: o.color || '#ffffff', roughness: o.rough ?? .3, metalness: o.metal ?? .1, clearcoat: .8, emissive: o.emissive || '#000', emissiveIntensity: o.ei || 0 });
  const side = o.sideMat || new T.MeshStandardMaterial({ color: o.side || o.color || '#ffffff', roughness: .5, metalness: o.metal ?? .1 });
  const m = mesh(geo, [front, side]); m.userData.w = bb.max.x - bb.min.x; return m;
}

// ---------------- projection ----------------
const _v = new T.Vector3();
/** world point -> stage pixel [x, y, visible] for anchoring 2D labels to 3D things */
function toScreen(S, p) { _v.copy(p.isVector3 ? p : new T.Vector3(...p)); S.cam.updateMatrixWorld(); _v.project(S.cam); return [(_v.x + 1) / 2 * W, (1 - _v.y) / 2 * H, _v.z < 1]; }

// ---------------- camera helpers ----------------
/** keyframed camera: keys = [[t, [x,y,z], [tx,ty,tz], fov?], ...] (absolute times) */
function camKeys(cam, t, keys, e = E.ioS) {
  const p = kf(t, keys.map(k => [k[0], k[1]]), e), q = kf(t, keys.map(k => [k[0], k[2]]), e);
  cam.position.set(p[0], p[1], p[2]); cam.lookAt(q[0], q[1], q[2]);
  if (keys[0][3]) { cam.fov = kf(t, keys.map(k => [k[0], k[3] || keys[0][3]]), e); cam.updateProjectionMatrix(); }
}
/** slow handheld drift added on top of a camera */
function drift(cam, t, amp = .04, seed = 1) { cam.position.x += noise1(t * .3, seed) * amp; cam.position.y += noise1(t * .27, seed + 1) * amp * .6; cam.rotation.z += noise1(t * .2, seed + 2) * .004; }

// wait for fonts/textures before the first frame
const r0 = window.ready;
window.ready = () => { const fontsP = Promise.all([document.fonts.load('800 40px "Barlow Condensed"'), document.fonts.load('700 40px "Barlow"'), document.fonts.load('800 40px "Barlow"'), document.fonts.load('600 40px "Barlow"')]);
  return Promise.all([fontsP, ...PRE]).then(() => r0()); };
const ENG = (document.currentScript && document.currentScript.src || '').replace(/[^/]*$/, '');
loadFont('cond', ENG + 'fonts/BarlowCondensed-ExtraBold.ttf');

/** turn off the CSS film overlays (the GL film pass replaces them) */
function noCssFx() { document.querySelectorAll('.fx-grain,.fx-vig,.fx-leak').forEach(e => { e.style.display = 'none'; }); }
C.GL = { T, init, noCssFx, stage, canvasTex, gradTex, M, rbox, mesh, group, rr, fitText, lcdScreen, popupScreen, featurePhone, pressAt, typedAt, smartphone, tower, beam, orb, waves, rack,
  ground, house, tree, bank, coin, coinStack, note, label, dust, africa, arc, loadFont, text3d, camKeys, drift, toScreen, loadTex, TEX, FONTS, STAGES, CFG };
})();
