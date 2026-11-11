# Money From Zero: production playbook

Read this whole file, and `STRATEGY.md` (goals, monetisation rules, learnings), before making or posting anything for the channel. Learnings in STRATEGY.md override the defaults here.

**Schedule:**
- Long videos go out **Mon, Wed and Fri at 16:00**. The production runs are Sun, Tue and Thu evening, and each schedules the next day's video.
- Shorts go out **daily at 18:00**. A morning run makes and schedules that day's Short.
- A weekly growth review runs on Sunday morning and updates STRATEGY.md and BACKLOG.md.

## The channel
- **Name:** Money From Zero
- **Handle:** @MoneyFZero
- **YouTube channel ID:** UCWFk-_iHuFs4RbTk32OqoFg (verified)
- **Owner:** Rodney (rmjesiman@gmail.com), Africa/Johannesburg time zone.
- **What it is:** beginner money how-tos for South Africans. Plain English, real rand examples, and every fact checked against SARS, National Treasury or other primary sources.
- **Goal:** grow to the YouTube Partner Programme and earn from it long-term, while genuinely teaching viewers.
- **Cadence the owner asked for:** 3 main videos a week, plus Shorts.
- **Owner's standing rules:**
  - Everything is automatic.
  - Posts go straight to the schedule, with no review step.
  - One voice take per video (no extra takes).
  - Maximum quality (4K). With the engine (10 Nov 2026) the 95 MB file limit usually means 1080p; upscale to 4K only when the file still fits.
- **Metricool brand:** "Money From Zero", id **7906209**, with YouTube connected. Fluxr is a separate brand (7157206); never post channel content there.

## Look and sound
- **From 10 Nov 2026, long videos are made with the CINE engine (`engine/`, read `engine/README.md`), not manim.** Rodney (10 Nov): users say the videos "are fine, but they are not engaging... Need to 10 times our animations... real concepts, maybe human figures and bank and money... up close... full production"; and "11 Labs should just be for voice. You need to use your code to code the highest level of video that you can possibly achieve. Benchmark, highest of the highest." So:
  - **ElevenLabs is for the voice only.** No ElevenLabs (or other AI) images, video, music or sound effects. Music and effects come from `engine/audio.py`.
  - Every 3–6 seconds a new picture that **shows** the idea: people (rigged characters), money (notes, coins, cards, phones), places (banks, shops, streets, maps), up close, with a moving camera, depth of field and sound effects. Kinetic text only for the key number or phrase. No slides of text.
  - Template: `engine/demo/mfz_capitec_v2/scene.js` (copy its patterns; build new shots for each topic).
  - For a full 8–9 minute video, build most shots with the shot templates in `engine/templates.js` (`C.T8`) and a cut list timed to the voice, like `studio/videos/main04_capitec/scene.js` (97 shots, a new composition every 2–6 s). Add 3–5 hand-made story shots (streets, people, buildings) between them. Snap every shot near its end and fix overlaps before rendering.
  - Meet the README's "density bar" (Rodney, 10 Nov 22:24: "small flags, more motion graphics... Can you 10 times what you've done"; "the video itself has to be engaging"): flag and icon badges, callouts, odometers, timelines, money flying along arcs, moving backgrounds with haze, characters that act, intentional transitions, a sound cue for every pop. A new composition every 2–4 seconds.
  - The split-flap brand stays: `flapText` headlines, the gold "0" bug, the colours below.
- **Brand kit:** `studio/lib/mfz_brand.py` (manim, still used by the Shorts). The style is a split-flap "departure board" in charcoal, with a gold zero and green accents.
  - BG #121214, TEXT #F4EEDF, MUTED #B9B3A8, GREEN #2FD27F, GOLD #F7BE33, RED #FF5D5D, BLUE #6CB4FF.
  - Fonts: Barlow Condensed (headings) and Barlow (labels and body). They are in `studio/fonts`; install them with `mkdir -p ~/.fonts && cp studio/fonts/*.ttf ~/.fonts && fc-cache -f`.
- **Backgrounds:** `studio/lib/bg_board_16x9.png` (3840x2160) for long videos, and `studio/lib/bg_board.png` (2160x3840) for Shorts.
- **Voice:** ElevenLabs voice "Darius", voice_id `fyDgymp89lRTiPu6iLkM`, model `eleven_v4`, `generations_count: 1`.
  - Audio tags such as [serious], [warmly] and [softly] work, but use them sparingly.
  - **Write amounts as "20,000 rand", not "R20,000", in the text you send to the voice.** `build_voice.py` and `make_srt.py` convert them back to "R20,000" on screen and in subtitles.
  - The cost is about 1 credit per character. A long video is about 7,000 credits; a 60-second Short is about 900.

## Long video pipeline (one folder per video, e.g. `studio/videos/main03_<topic>/`)
1. **Topic:** pick the next topic from `studio/BACKLOG.md`. Prefer timely topics, for example tax season, Black Friday, or the February TFSA and RA deadlines.
2. **Research:** write `facts.md` with every number labelled by source (primary sources first). **Current names and facts (Rodney, 11 Nov 2026: "make sure that you have the most up-to-date information"):** before writing, web-search every company, brand and product the video names for its current name, owner, status and latest figures (e.g. TymeBank became **GoTyme Bank** in early 2026). Use the current name; mention the old one only where the story needs it. Check the logo matches the current brand too.
   - Verify current figures on the web on the day you make the video.
   - Never state a figure you couldn't verify.
   - Mark proposals as proposals.
3. **Script:** write `script.md` with `[chapter_key]` markers, about 1,250–1,350 words. That gives 8–9 minutes, which is over 8 minutes so mid-roll ads are possible.
   - Open with a hook built on a concrete rand figure.
   - Say "Let's start from zero" at the end of the intro.
   - Then chapters, a worked example with real 2026/27 numbers, traps, step-by-step how-to, and a recap.
   - End with: "If this helped, subscribe to Money From Zero. New Shorts every day, and a full guide like this every week."
4. **Split:** run `python3 ../../tools/split_script.py` to get parts.json, part1-3.txt and spoken.txt. Then make the TTS versions (R-amounts written as "rand"), as in `build_voice.py: to_tts`.
5. **Voice:**
   - `creative_create_flow`, then `creative_generate_speech` for each part (one take each).
   - Poll `creative_get_flow_run_status` and download each mp3 into `audio/partN.mp3`.
   - Word timings: run `creative_transcribe_audio` with `connect_from` set to the TTS node (free). It returns forced-aligned words; save them as `words_partN_raw.json` in the form `[[text, start, end], ...]`. If the status result is too big, read it from the saved file with python.
6. **Join and master:** `python3 ../../tools/build_voice.py` gives voice_master.m4a (-14 LUFS, 48 kHz AAC 320k), words_all.json and timeline.json.
7. **Animate with the CINE engine** (from 10 Nov 2026; read `engine/README.md` first). Write `scene.js` in the video folder, copying patterns from `engine/demo/mfz_capitec_v2/scene.js`.
   - Timing: `C.voice(C.loadJSON(BASE + 'words_all.json'), 0)` (words_all.json is already in voice_master time, so LEAD is 0). Every shot starts on a spoken word with `at('word', after)`.
   - Plan the shots first in `shots.md`: one line per shot (time, words, what we SEE, camera move, sound). About 80–120 shots for 8–9 minutes, a new picture every 3–6 seconds. Each chapter needs at least one "world" shot with characters (street, bank, shop, home, office), not only charts.
   - Chapter titles: a split-flap headline (`flapText`) over a moving scene, not a static card.
   - The worked example: show it with people and money (notes leaving a wallet, coins in a jar, a payslip, a phone app screen) plus the key rand figure as kinetic text; re-run the arithmetic in python.
   - Disclaimer "general information, not financial advice" on screen (end card and intro corner).
   - Check stills of every shot: `python3 ../../../engine/render.py snap scene.js <times> --theme mfz` and look at `snaps/sheet.jpg`. Nothing cut off, no text over faces, text readable on a phone, the picture matches the words. Fix and repeat until every shot passes.
8. **Render** in the background with `run_in_background`: `python3 ../../../engine/render.py video scene.js video_silent.mp4 --workers 2 --theme mfz` (about 8 seconds of render per second of video on 2 cores, so roughly 70 minutes for 9 minutes). Then the sound: `python3 ../../../engine/render.py cues scene.js cues.json --theme mfz` and `python3 ../../../engine/audio.py cues.json mix.wav --voice voice_master.m4a --lead 0` (music + effects ducked under the voice, -14 LUFS).
9. **Mux (HEVC, so 9 minutes fit under 95 MB):** `ffmpeg -i video_silent.mp4 -i mix.wav -map 0:v -map 1:a -c:v libx265 -preset medium -crf 26 -tag:v hvc1 -pix_fmt yuv420p -x265-params log-level=error -c:a aac -b:a 160k -movflags +faststart out.mp4` (run it in the background; about 10–15 minutes). Then check frames and the audio.
   - Keep each file under 95 MB (the GitHub limit is 100 MB): raise the CRF by 1–2 if it's bigger. Engine videos move all the time, so H.264 at the same size looks worse (measured 10 Nov: 15 s of the v2 demo was 2.1 MB in HEVC CRF 26 vs 3.0 MB in x264 CRF 24 at the same look). 1080p.
   - If Metricool or YouTube ever rejects the HEVC file, fall back to `-c:v libx264 -preset slow -crf 27 -tune animation` and note it in STRATEGY.md.
10. **Thumbnail:** HTML plus Playwright at 1920x1080 (see `videos/*/thumb.html`). **Brand logo rule (Rodney, 11 Nov 2026: "All videos that include brand names... attach that brand's logo on the thumbnail. It's a rule that I'm setting."):** when a video names a brand (bank, network, company, product), put that brand's logo on the thumbnail, on a white card. Use only logo files Rodney supplies: the Google Drive folder "Brand logos for thumbnails" (folder id 1gKV2GIAuqecagaW6xVtNLcngsTRHlaWY); Capitec example: `videos/main04_capitec/thumb_logo.html` (local only). Never download a logo from the web or draw one. If the logo isn't there, use the brand name in big type and list the missing logo in the run's report to Rodney so he can drop it in before the publish date. Keep supplied logo files out of public repos; only the finished thumbnail is published. Logo files in that Drive folder (11 Nov 2026): steinhoff-icon.png, steinhoff-old-wordmark.png, vbs.png, shoprite.png, eskom.png, pep.png, mrprice.png, mrp.png (check which Mr Price mark is current), africanbank.png, gotyme-formerly-tymebank.png, gotyme-cyan.png, tymebank.png, takealot.png, capitec.png.
    - One huge rand figure on flip tiles, at most 6 words, and a gold badge with the topic.
    - Check it at 640x360.
11. **Subtitles:** `python3 ../../tools/make_srt.py <name>.en.srt`.
12. **Metadata:** write `youtube_description.txt`:
    - Title of at most 100 characters, starting with the search phrase.
    - Description with the basics, chapters (first one at 0:00), notes on the example, sources, and the disclaimer.
    - 13 tags.
13. **Publish:** see below. Then add a line to `studio/LOG.md`.

## Shorts pipeline (`studio/shorts/<nnn>_<topic>/`)
- 1080x1920 or more (rendered at 2160x3840, 60 fps). 45–60 seconds, one idea, with the hook in the first 2 seconds.
- Burned-in word-synced captions (ASS) and a loop-friendly ending.
- Template: `shorts/001_tfsa/` (`mfz_tfsa.py`, `make_captions.py`, `assemble.sh`).
- **Timing files:** `words_*.json` holds the word timings, as `[[text, start, end], ...]` from the free transcription of the TTS node. `timings.json` lists one entry per spoken line: `{key, start, end, n, text}` plus the `duration`.
- **Animation:** cue it with `CUE[key]`.
- **Captions:** `make_captions.py` writes word-synced ASS captions: Barlow ExtraBold 96, at most 16 characters per line, amounts in gold, MarginV 400.
- **Assembly:** `assemble.sh` burns in the captions at CRF 14 and muxes the voice. If the result is over 95 MB, raise the CRF.
- Title of at most 60 characters ending in one hashtag, plus 3 hashtags in the description.
- A good Short cuts down one chapter of the latest long video and points viewers to the full guide.
- **Topic rotation (added 8 Nov 2026):** don't post more than 3 Shorts in a row on the same topic. Once a new long guide goes live, the next Shorts point to it. This is a test, because the first 4 Shorts were all TFSA. Review it once per-Short views exist.
- **Timely Shorts:** after a SARB rate decision or an official fuel-price announcement, a Short that day or the next may replace the planned one. Use only the official figures (SARB statement, DMPR media release), never forecasts presented as fact.

## Publishing (automatic, no review step)
1. Copy the final mp4, thumbnail.png and srt into `media/<video_folder>/` in this repo, then commit and push.
2. Build a raw URL that is pinned to the commit SHA:
   `https://raw.githubusercontent.com/Bionic01/mfz-media/<sha>/media/<folder>/<file>`
3. Call Metricool `createScheduledPost` on brand 7906209:
   - network youtube
   - `youtubeData`:
     - title
     - type "video" (or "short")
     - privacy "public"
     - tags
     - category "EDUCATION"
     - madeForKids false
     - isAiGeneratedContent true
     - notifySubscribers true
     - videoThumbnailUrl = raw thumbnail URL
   - The text is the description.
   - Times are Africa/Johannesburg; check `getBestTimeToPostByNetwork`.
   - Default slots: long videos at **16:00** on Mon/Wed/Fri; Shorts at **18:00** daily. These match the schedule at the top of this file and the 6 Nov best-time data; the earlier 17:00 and 12:30/18:30 defaults were out of date (fixed 8 Nov 2026).
4. After the post goes live, upload the SRT in YouTube Studio (Subtitles → English → Upload file → With timing) if a browser is available.
5. Never post channel content to any other brand. Never delete anything.

## Better every video, and keep the channel monetisable (Rodney, 11 Nov 2026)
His words (11 Nov 2026, 23:36): "you're supposed to self-heal, always improving every video, step ahead, engaging, perfection, always improving better than the previous one. Everything, iteration, check. We have to make sure that we keep the monetization when it comes in. on both channels."

1. **Before you start:** read the last entry in `studio/VIDEO_REVIEWS.md`. Its "Next bar" list is the minimum for this video: do every item and say how in this video's entry.
2. **While building:** snap every shot near its start and its end; every shot must show something within about 0.3 s of starting (no title-less shot waiting for its first icon).
3. **Before publishing:** run `python3 ../../../engine/qa.py <final.mp4>` (Shorts too) and look at `qa/qa_sheet.jpg` and `qa/qa_flags.jpg`. Fix every FLAG (dead air over 1 s, loudness off -14 LUFS, true peak over -1 dBTP, size): re-render only the bad shots with `render.py video scene.js segN.mp4 --from A --to B --theme ...` (A and B = shot start/end rounded to whole frames, frame/30), splice them in with separate trimmed inputs of video_silent.mp4 (not one input split into many trims: that runs out of memory), re-mux, and run qa.py again until it says OK. Then watch the first 30 seconds, the brand part and the last 20 seconds at full size.
4. **After publishing:** add an entry to `studio/VIDEO_REVIEWS.md`: what is better than the last video, what is still weak (be honest: hook, slow or empty moments, repeated shot types, sound), and a "Next bar" list of 2 or 3 concrete upgrades for the next video.
5. **Sunday review:** add the numbers (average view duration, where viewers drop, click-through rate) to the entries and turn them into the next bar.
6. **Monetisation safety, every video, both channels:**
   - Original work only: our own research, script, voice and animation. Never reuse another video's shots or re-skin a template with new words (YouTube's inauthentic-content rule refuses ads on mass-produced or repetitive videos).
   - Nothing we don't own: music and effects are made in code; no clips, photos, footage or songs from anyone else. Brand logos only on thumbnails, small, from Rodney's files, to name the topic, never so it looks like the brand made, sponsors or endorses the video.
   - Honest packaging: the title and thumbnail promise only what the video delivers.
   - Advertiser-friendly: no swearing, shocking or graphic images; hard stories (fraud, collapse, debt) told factually with sources.
   - Disclosures as set: isAiGeneratedContent true for Money From Zero; the "general information, not financial advice" disclaimer on screen and in the description. See also the monetisation rules in STRATEGY.md.
   - Every number from a source checked on the day; sources in the description.
7. **Sound level (Rodney, 11 Nov 2026 23:38: "reduce the volume for all the tones and music by 50%. I find it kind of irritating"):** music and effects are now at half the 10 Nov level in `engine/audio.py` (music .03, effects .09375). Never raise them; go lower with `--music`/`--sfx` below 1 if a mix still sounds busy.

## Quality bar (check every time)
- **Visual bar (from 10 Nov 2026):** the engine look, not slides. Every shot moves, most shots show people, money or places, a new picture every 3–6 seconds, and nothing is AI-generated except the voice.
- Every number matches `facts.md`. The arithmetic is re-run in python.
- No text overlaps or runs off the screen; check the stills.
- Audio is around -14 LUFS with no clipping; spot-check a few seconds of every part.
- Disclaimer: "general information, not financial advice", on screen and in the description.
- Don't make claims about products or providers you can't back up. Name providers only as sources of statistics.
