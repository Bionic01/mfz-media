# CINE: the code-built cinematic video engine

Shared by **Money From Zero** and **Fluxr Explains** (from 10 Nov 2026). Rodney's brief: "10 times our animations... real concepts, human figures and bank and money... up close... full production", and "11 Labs should just be for voice. Use your code to code the highest level of video... benchmark, highest of the highest."

- **ElevenLabs is for the voice only.** Never generate images, video, music or sound effects there.
- Everything you see and every sound except the voice is made in code: HTML/SVG scenes rendered frame by frame (`render.py`) and synthesized music and effects (`audio.py`).
- The look is a "3D film" made of flat-shaded vector art: a virtual camera with depth layers (parallax), depth-of-field blur, soft shadows, light rays, bokeh, film grain, vignette and light leaks; rigged characters; real CSS 3D for hero props (the banknote shot).

Working samples (copy these when starting a video). **Use the v2 demos** (`demo/fluxr_zim_v2/`, `demo/mfz_capitec_v2/`): Rodney judged v1 "just 2x" and asked for flags, more motion graphics and much higher density (10 Nov 2026, 22:24). v1 is kept only for comparison.
- `demo/fluxr_zim/scene.js`: Fluxr theme. Market with vendor and customer, doubling bar chart, wheelbarrow street tracking shot, 3D banknote macro, notes blowing away, Africa map with arcs, logo reveal, spaza voucher purchase, USSD dialling synced to the spoken digits, split screen, end card.
- `demo/mfz_capitec/scene.js`: MFZ theme. Dawn street and bank opening, counters with icon grids, "tiny vs the big four" pull-back, clocks, workers walking in, kinetic words, map with pins, 26-million crowd, fees and a coin jar, compare bars, end card.

## Files
| File | What it is |
|---|---|
| `shell.html` | Page that loads the engine and then your scene (`?scene=/abs/path/scene.js&theme=mfz|fluxr`). |
| `cine.js` | Core: easing, keyframes, noise, `World` (camera + depth layers + DOF), `shot()` timeline with transitions, `cue()` for sound effects, FX (grain, vignette, flash, light leak), kinetic text (`kTitle`, `flapText`, `counter`, `pill`, `lowerThird`), particles (`bokeh`, `rays`, `fall`), charts (`barChart`, `lineChart`), `voice()` word timing, `card3d()` (real CSS 3D), `ui()` overlay. |
| `chars.js` | `Person`: rigged SVG character (pose library, blending, walk cycle, side/front view, head turn, blink, talk, expressions, hold props). `crowd()`. |
| `props.js` | Money (`note`, `noteStack`, `coin`, `coinPile`), devices (`phone`, `featurePhone`, `bankCard`, `slip`), `clock`, buildings (`bankHall`, `branch`, `spaza`, `stall`, `house`, `skyline`, `taxi`), nature (`cloud`, `acacia`), `lamp`, `tower`, `chalkboard`, `bread`, `wheelbarrow`, `img`, `africaMap` (countries, `highlight`, `arc`, `pin`). |
| `mograph.js` | Motion graphics: `flag(code)` circular flag badges (za, zw, us, mw, mz, bw, ke, et, ng, cd, ls, so, pk, zm, tz, ug, gh, sz, ao, gb, cn, in, ae, eu), `flagPole` (waving), `icon(name)` 40+ line icons in badges with draw-on (`C.IC` lists them), `pop()` overshoot entrances, `callout` (leader line + label), `highlight` (marker sweep text), `odometer` (rolling digits), `statCard`, `timeline`, `flyer` (icon flying along an arc with a trail), `dashArc`, `burst`, `sparkles`, animated backgrounds (`blobs`, `dotGrid`, `glyphs`), `haze` (depth fog layer), `lightBeam`, `toast` (phone notification), `keycap`, `subscribe` (button + cursor click). |
| `templates.js` | Shot templates `C.T8` for long videos: one call = one finished, cued shot. `flapTitle`, `stat`, `fromTo`, `bars`, `icons`, `steps`, `receipt`, `person`, `map`, `timeline`, `compare`, `trap`, `crowd`, `quote`, `endCard`; each takes `(a, b, opts)` with absolute times and `opts.tr` to change the transition. Helpers in `C.tpl` (`bg`, `tag`, `src`, `hl`, `uiSvg`, `once`). Example: `studio/videos/main04_capitec/scene.js` (8.5-minute video, 97 shots, built from a cut list with `N(phrase, near)` word timing). |
| `props2.js` | `printingPress`, `balance` (scale with pans), `sack` (money bag), `basket` (groceries), `cashBox`, `calendarPage` (flip), `phoneHand` (close-up hand with moving thumb), `stampMark`, `priceTag` (swinging), `dayArc` (sun moving morning → afternoon), `meter`. |
| `assets/flags/`, `assets/app/` | Flag SVGs; approved Fluxr Play Store graphics (use the in-graphic phone screen via the `appScreen` helper in the Fluxr v2 demo). |
| `worlds.js` | Environments: `sky`, `sun`, `hills`, `ground`, `floor`, `studio` (dark product-shot backdrop), `bankInterior`, `road`, `shaft`, `wash`. |
| `assets/africa.js` | Projected Africa outlines (`window.AFRICA[ISO]`, `AFRICA_PROJ(lon, lat)`). Keys: ISO3 for the main countries (ZAF, ZWE, MWI, MOZ, BWA, ZMB, LSO, SWZ, NAM, KEN, ETH, NGA, COD, TZA, AGO, UGA, GHA, EGY, MDG), uppercase names for the rest. |
| `render.py` | Renderer: `snap` (stills + contact sheet), `cues` (sound cue list), `video` (parallel workers, frames piped into x264; no frames on disk). |
| `audio.py` | Music bed (styles `doc`, `amapiano`, `tension`) + 40 synthesized effects, ducked under the voice, mastered to -14 LUFS. |
| `fonts/` | Barlow / Barlow Condensed (OFL), loaded by `cine.css`, so a fresh machine renders the same. |

## Workflow for one video
1. **Script and voice** as before (facts.md, script.md, ElevenLabs voice, scribe word timings). Save the words as `words_min.json` (`[[text, start, end], ...]`) next to `scene.js`. If the voice is several parts, join them into one track first and offset the word times to match the joined file.
2. **Write `scene.js`.** Start from the closest demo. Rules:
   - Time every beat to the words: `const V = C.voice(C.loadJSON(BASE + 'words_min.json'), LEAD)`, then `at('word', after)` gives the word's start time in the final mix (LEAD = silence before the voice). Use the `after` argument whenever a word repeats ("buy", "in", "its", "so"). A missing word logs `word not found` in the console.
   - One shot per beat, **a new picture every 3–6 seconds**: `shot(a, b + overlap, build, update, { in: 'fade'|'whip'|'zoom'|'flash'|'iris', tin })`. Let each shot run ~0.3 s past the next one's start so transitions overlap.
   - Every shot moves: the camera always drifts or pushes (`w.camera({x, y, zoom, rot, focus, dof})`), characters breathe/blink automatically, props have motion.
   - Use depth: background layers at depth 3–6 (blurred by DOF), subject at 1, foreground at 0.5–0.7. Make far layers bigger than the screen (`w.layer(3, {w: 2600, h: 1600})`), since they scale less with zoom.
   - Show the concept with people, money and places, up close. Use kinetic text only for the key number or phrase.
   - Add sound cues in the shot (`cue(t, 'whoosh')`, guarded by `if (!s.c) { s.c = 1; ... }`) or in `build`. Effect names: whoosh, swish, whoosh_low, swoosh_up, pop, bloop, tick, tock, click, dtmf0–9/dtmf*/dtmf#, tap, thud, impact, boom, stamp, riser (ends at t), swell (ends at t), cash, coin, coins, paper, flutter, wind, notif, chime, ding, shopbell, sparkle, print, buzz, flap, flaps, step, lights, type, shutter, heartbeat.
   - Set `window.META = { music: { style, drop, end, breaks } }` and `window.DURATION`.
   - `C.initFX({ grain, vignette })`: grain is a static texture by default (`grainMode: 'film'` animates it, but that roughly triples the file size).
   - Things are deterministic: no `Math.random()` (use `C.rnd(seed)`), no timers, no CSS animations. Everything is a function of `t`.
3. **Check stills** of every shot: `python3 render.py snap scene.js 3,9.5,14,... --theme mfz` → `snaps/sheet.jpg`. Look at each frame: nothing cut off, no text over faces, text readable, the action matches the words. Fix and repeat.
4. **Cues:** `python3 render.py cues scene.js cues.json --theme mfz`.
5. **Render** (run in the background): `python3 render.py video scene.js video_silent.mp4 --workers 2 --theme mfz`. About 0.5–0.9 s per frame per worker on 2 cores at v2 density: a 9-minute video (16,200 frames) takes roughly 1.5–2 hours. `--from/--to` render a part.
6. **Audio** (music and effects sit well below the first level since 10 Nov 2026: halved at 23:12 ("a little bit too high... tune it down, maybe by like 50%"), then 25% lower again at 23:17 ("reduce the volume by 25% again"); use `--music`/`--sfx` below 1 to go quieter, never above 1 without his say-so): `python3 audio.py cues.json mix.wav --voice voice.mp3 --lead 0.6` (style comes from META; `--music 0.8` to lower the bed).
7. **Mux:** for the upload use HEVC so long videos fit the 95 MB repo limit: `ffmpeg -i video_silent.mp4 -i mix.wav -map 0:v -map 1:a -c:v libx265 -preset medium -crf 26 -tag:v hvc1 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart final.mp4` (about 1.1 Mbps for v2-density 1080p).

## The density bar (v2, from 10 Nov 2026)
Rodney: "These explainers should show like maybe small flags, more motion graphics... better quality. Can you 10 times what you've done" and "the video itself has to be engaging... the highest possible level of motion." So every shot layers several of these, timed to the words:
- a moving background (`blobs` + `dotGrid` + `glyphs`) or a world with **haze layers** between depths, never a flat colour;
- **flag badges** whenever a country is named, **icon badges** for every concept (bread, cart, phone, airtime, data, bank, wallet, calendar...), popping in with `pop()` and drawing on;
- a **callout**, **highlight**, **odometer** or **timeline** for each key fact; money **flying along arcs** (`flyer`, `dashArc`) whenever money or airtime moves;
- characters that act (`gesture`, poses changing on the words, reactions), up close when the story is about a person;
- a transition with intent between scenes: `bands`, `circle`, `whip`, `zoom`, `flash` (not just cuts and fades);
- a sound cue for every pop, swish, stamp, coin and key press.
Cut to a new composition every 2–4 seconds. Production renders are 1080p (v2 density costs about 0.8 s per frame per worker, so a 9-minute video renders in about 2 hours on 2 cores; `--scale` above 1 is not wired into the video capture yet).

## Character cheat sheet
```js
const p = new C.Person(L.svg, L.defs, { skin: C.SKIN.brown, hair: 'scarf'|'short'|'fade'|'afro'|'bun'|'braids'|'cap'|'long'|'bald'|'side',
  female: true, shirt: '#e2603a', pants: '#2b2f3a' | skirt: '#2c4a8a', skirtPattern, jacket, tie, apron, scarf, scarf2, cap, beard, glasses, elder, child, earrings, seed });
p.set(t, { x, y, s, flip, pose: 'phone' | C.poseAt(t, [[0,'stand'], [3.2,'wave']]), side: 0..1 (1 = profile), turn: -1..1,
  look: [x,y], talk: 0..1, gesture: 0..1 (talking hand movement), expr: 'neutral'|'smile'|'happy'|'surprised'|'worried'|'sad'|'angry'|'focus'|'shock', walk: phase, stride, walkArms, nod });
p.hold(1, propGroup, { x, y, r, s, upright: true });   // 0 = screen-left hand, 1 = screen-right hand
```
Poses: stand, relaxed, handsHips, wave, point, pointUp, pointL, present, phone, phoneTwo, phoneEar, count, give, receive, shrug, think, worried, facepalm, celebrate, fist, arms, carry, hold, push, sit. Custom poses are objects `{lean, head, aA:[upper, bend], aB, lA, lB, bob}` (for arm B a negative bend brings the hand to the body; for arm A a positive one). Draw a character before a counter or stall to put it behind it; clip it with `C.clipRect` to show it in a shop window.

## Brand rules
- MFZ (`theme mfz`): background #121214, text #F4EEDF, gold #F7BE33, green #2FD27F, red #FF5D5D; split-flap headlines (`flapText`), the "0" bug. Rand amounts as `R` + space-grouped digits.
- Fluxr (`theme fluxr`): deep green #0d372b, lime #85ED70, white; Fluxr logo from `fluxr-posts/kit/logos/fluxr-white.png`; voucher logos on white cards. The Fluxr part follows PLAYBOOK_YOUTUBE.md (both audiences, USSD + app, end card).
- Never draw real people or copy real logos/banknotes exactly: notes are stylised (value, colour, pattern), company buildings are generic ("BANK"). Partner voucher logos are fine in the Fluxr part. Cite sources on screen for key numbers (`src()` line in the demos).
