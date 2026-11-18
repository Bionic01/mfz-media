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
- **From 17 Nov 2026 every video is made in Look v5: bright flat 2D in the Kurzgesagt manner** (engine/README.md "Look v5", `engine/look5.js`, worked example `engine/demo/look_v5/`, first full video `videos/main07_steinhoff/scene.js`). Rodney, 16 Nov 2026 22:57: "we need to adopt that kind of style. I think simple yet so engaging" ... "let's just do this like bright color... the white visual [in the] other videos [is] not as good" ... "take your time with the 2D [scenes], make them perfect." It replaces the lit 3D of Look v4. Adopt the techniques; never copy Kurzgesagt's characters (such as their birds), artwork or exact palettes.
  - Flat vector shapes, rounded, no outlines; soft gradients, glow and rim light so things look round and lit; long soft shadows; a faint grain.
  - Bright, saturated colour: deep backgrounds (navy, purple, teal, magenta) with vivid foregrounds (orange, pink, yellow, cyan). Never a plain white, cream or pale-grey background. One palette per chapter; the channel's gold as the accent.
  - Depth without 3D: 3-5 parallax layers, the camera always drifting, pushing in or panning, with particles and background details moving at different speeds.
  - Everything alive: secondary motion in every shot (bobbing, blinking, small loops, pulsing lights); no frame is ever frozen.
  - Simple, friendly generic figures (round heads, no detailed faces, never a real person; a real executive is an empty chair with a nameplate) and the money world up close: people, phones with readable screens, banks, shops, wallets, coins and stylised notes (never real banknotes), maps.
  - One idea per shot and one hero subject filling the frame. Very little text: big bold words only for key numbers and stamp words. A new picture every 2-5 s, with smooth eased transitions (match cuts, iris, zoom-throughs).
  - Receipts: source cards and real free-licence photos sit inside the 2D world as framed cards with the key words highlighted; photos never become the whole look.
  - 3D (`C.T3`) only if it clearly matches the flat style, and only a few per video. The split-flap counter stays only as the channel's logo sting.
  - **ElevenLabs is for the voice only** (Rodney, 10 Nov: "11 Labs should just be for voice. You need to use your code to code the highest level of video"). No ElevenLabs (or other AI) images, video, music or sound effects. Music and effects come from `engine/audio.py`.
- **Images and clips:** use the topic's folder in fluxr-posts `assets/upcoming/mfz/<topic-slug>/` when it can be reached, and download any extra free-to-use files yourself (Wikimedia Commons, Pexels, Pixabay, Unsplash, government or company pages that allow reuse) with the User-Agent "FluxrExplainsBot/1.0 (https://www.fluxr.co.za)". Licence: CC0, public domain, CC BY, CC BY-SA or the site's own free licence; never NC, ND or editorial-only. Check the licence on the file page (the Commons API `extmetadata` LicenseShortName). Keep the files out of this repo (gitignore the video's `img/`), log each in the video's SOURCES.md and credit CC BY/BY-SA files in the description. No identifiable faces, no real banknotes, no betting brands, no logos from the web (a photo with a company's sign on it counts as a logo: skip it).
- **Brand kit:** gold #F7BE33 accent; the split-flap "departure board" style of `studio/lib/mfz_brand.py` is now only the logo sting and the manim Shorts' legacy. Fonts: Barlow Condensed (headings) and Barlow (labels and body). They are in `studio/fonts`; install them with `mkdir -p ~/.fonts && cp studio/fonts/*.ttf ~/.fonts && fc-cache -f`.
- **Voice (from 18 Nov 2026): ElevenLabs "Sizwe – South African Professional", voice_id `qp5KnBkVXn1iOyKYgIDA`, model `eleven_v4`, `generations_count: 1` per part.** Rodney, 18 Nov: "let's just use a man's voice... a different man voice... I don't think when talking about finance... a woman's voice sounds serious. I think maybe a man's voice sounds a little bit serious and also welcoming in terms of like teaching." So write for a serious but warm teacher: calm authority, clear explanations, conversational, questions to the viewer, no hype. Never go back to Darius (`fyDgymp89lRTiPu6iLkM`, Rodney didn't like it) or Thandi (`BcpjRWrYhDBHmOnetmBl`, used 17–18 Nov; he wants a man's voice). Never use Sekou (`ddNwxTGW1Qc7ZuSevaHF`): that is the Fluxr Explains voice. Note "voice: Sizwe" in each video's VIDEO_REVIEWS.md entry and LOG.md line.
  - Audio tags such as [serious], [warmly] and [softly] work, but use them sparingly. Spell out what the voice might misread (PwC as "P W C").
  - **Write amounts as "20,000 rand", not "R20,000", in the text you send to the voice.** `build_voice.py` and `make_srt.py` convert them back to "R20,000" on screen and in subtitles.
  - The cost is about 1 credit per character. A long video is about 7,500 credits; a 45-second Short is about 700.

## Long video pipeline (one folder per video, e.g. `studio/videos/main03_<topic>/`)

**Real assets, not drawn ones (Rodney, 14 Nov 2026):** show the real thing wherever it exists: buildings, logos (Drive folder "Brand logos for thumbnails", fluxr-posts kit/logos/brands, or the topic's assets/upcoming/mfz/<slug>/logos/ filled on full go; never committed here), official documents and report covers. Faces only from photos Rodney supplies. **Real rand notes and coins need the SARB's written permission** (SARB currency image policy 2026, s5.1; only news media are exempt), so rand notes stay stylised unless approval arrives. Before each video, update studio/ASSETS_WANTED.md (what I get myself, what I need from Rodney) and send him the list. End story videos on where things stand today, checked on the day. **Monetisation first** (Rodney, 14 Nov 2026: "protect monetisation at all costs"): never use anything that could hurt monetisation or draw a copyright claim (no news-agency or TV photos/clips, no photo whose source we can't name, no betting brands, no real rand notes); if in doubt, leave it out. Rodney drops photos and clips in the chat; I upload them to his Drive ("Video images/<video>", logos to "Brand logos for thumbnails") and check those folders before each video; if an asset isn't there on the day, make the video without it. Full rules and lists: ASSETS_WANTED.md.
1. **Topic:** pick the next topic from `studio/BACKLOG.md`. Prefer timely topics, for example tax season, Black Friday, or the February TFSA and RA deadlines.
2. **Research:** write `facts.md` with every number labelled by source (primary sources first). **Current names and facts (Rodney, 11 Nov 2026: "make sure that you have the most up-to-date information"):** before writing, web-search every company, brand and product the video names for its current name, owner, status and latest figures (e.g. TymeBank became **GoTyme Bank** in early 2026). Use the current name; mention the old one only where the story needs it. Check the logo matches the current brand too.
   - Verify current figures on the web on the day you make the video.
   - Never state a figure you couldn't verify.
   - Mark proposals as proposals.
3. **Script:** write `script.md` with `[chapter_key]` markers, about 1,250–1,350 words. That gives 8–9 minutes, which is over 8 minutes so mid-roll ads are possible.
   - Open with a hook built on a concrete rand figure.
   - **Answer the title in the first 30 seconds (15 Nov 2026 review: main02 two-pot averaged 0:28 per view):** one sentence that gives the headline answer ("withdraw R20,000 and you keep about R14,800") before "Let's start from zero"; the rest of the video is the how and the why.
   - Say "Let's start from zero" at the end of the intro.
   - Then chapters, a worked example with real 2026/27 numbers, traps, step-by-step how-to, and a recap.
   - End with: "If this helped, subscribe to Money From Zero. New Shorts every day, and a full guide like this every week."
4. **Split:** run `python3 ../../tools/split_script.py` to get parts.json, part1-3.txt and spoken.txt. Then make the TTS versions (R-amounts written as "rand"), as in `build_voice.py: to_tts`.
5. **Voice:**
   - `creative_create_flow`, then `creative_generate_speech` for each part (one take each).
   - Poll `creative_get_flow_run_status` and download each mp3 into `audio/partN.mp3`.
   - Word timings: run `creative_transcribe_audio` with `connect_from` set to the TTS node (free). It returns forced-aligned words; save them as `words_partN_raw.json` in the form `[[text, start, end], ...]`. If the status result is too big, read it from the saved file with python.
6. **Join and master:** `python3 ../../tools/build_voice.py` gives voice_master.m4a (-14 LUFS, 48 kHz AAC 320k), words_all.json and timeline.json.
7. **Animate with the CINE engine in Look v5** (read `engine/README.md` "Look v5" first). Write `scene.js` in the video folder as a cut list like `videos/main07_steinhoff/scene.js` (one `cut()` per shot timed with `N(phrase, near)`).
   - Timing: `C.voice(C.loadJSON(BASE + 'words_all.json'), 0)` (words_all.json is already in voice_master time, so LEAD is 0). Every shot starts on a spoken word with `at('word', after)`.
   - Plan the shots first in `shots.md`: one line per shot (time, words, what we SEE, camera move, sound). About 80–120 shots for 8–9 minutes, a new picture every 3–6 seconds. Each chapter needs at least one "world" shot with characters (street, bank, shop, home, office), not only charts.
   - Chapter titles: big words or a stamp over a moving scene, not a static card (split-flap only for the "Let's start from zero" sting).
   - The worked example: show it with people and money (notes leaving a wallet, coins in a jar, a payslip, a phone app screen) plus the key rand figure as kinetic text; re-run the arithmetic in python.
   - Disclaimer "general information, not financial advice" on screen (end card and intro corner).
   - Check stills of every shot: `python3 ../../../engine/render.py snap scene.js <times> --theme mfz` and look at `snaps/sheet.jpg`. Nothing cut off, no text over faces, text readable on a phone, the picture matches the words. Fix and repeat until every shot passes.
8. **Render** in the background with `run_in_background`: `python3 ../../../engine/render_long.py scene.js video_silent.mp4 --theme mfz`. Motion v3 renders at about 1.4 frames a second on 2 cores, so a 9-minute video takes about 3 hours, longer than one background job may run (2 hours); render_long.py renders in resumable chunks, stops before 100 minutes and prints MORE: run the same command again (in the background) until it prints DONE. Never run one `render.py video` for the whole video. Then the sound: `python3 ../../../engine/render.py cues scene.js cues.json --theme mfz` and `python3 ../../../engine/audio.py cues.json mix.wav --voice voice_master.m4a --lead 0` (music + effects ducked under the voice, -14 LUFS).
9. **Mux (HEVC, so 9 minutes fit under 95 MB):** `ffmpeg -i video_silent.mp4 -i mix.wav -map 0:v -map 1:a -c:v libx265 -preset medium -crf 26 -tag:v hvc1 -pix_fmt yuv420p -x265-params log-level=error -c:a aac -b:a 160k -movflags +faststart out.mp4` (run it in the background; about 10–15 minutes). Then check frames and the audio.
   - Keep each file under 95 MB (the GitHub limit is 100 MB): raise the CRF by 1–2 if it's bigger. Engine videos move all the time, so H.264 at the same size looks worse (measured 10 Nov: 15 s of the v2 demo was 2.1 MB in HEVC CRF 26 vs 3.0 MB in x264 CRF 24 at the same look). 1080p.
   - If Metricool or YouTube ever rejects the HEVC file, fall back to `-c:v libx264 -preset slow -crf 27 -tune animation` and note it in STRATEGY.md.
10. **Thumbnail:** HTML plus Playwright at 1920x1080 (see `videos/*/thumb.html`). **Brand logo rule (Rodney, 11 Nov 2026: "All videos that include brand names... attach that brand's logo on the thumbnail. It's a rule that I'm setting."):** when a video names a brand (bank, network, company, product), put that brand's logo on the thumbnail, on a white card. Use logo files from the Google Drive folder "Brand logos for thumbnails" (folder id 1gKV2GIAuqecagaW6xVtNLcngsTRHlaWY), fluxr-posts kit/logos/brands, or the topic's fluxr-posts assets/upcoming/mfz/<slug>/logos/ (fetched on full go from the company's own website or Wikimedia Commons, logged in SOURCES.md; Rodney, 18 Nov 2026: "fetch all the elements that we need for the coming videos, all of them"); Capitec example: `videos/main04_capitec/thumb_logo.html` (local only). Never draw a logo. If the logo isn't there, use the brand name in big type and list the missing logo in the run's report to Rodney so he can drop it in before the publish date. **Every logo must fit (Rodney, 15 Nov 2026: "Always resize and cut some logo so they can fit properly in the thumbnail or video"):** trim and resize each logo so the whole mark shows with an even margin (about 16% of its height), never cut by its card, the frame or the image edge; check a file's edges before using it (the old Ackermans tile had the A and S cut off; use ackermans_green/_white/_white_on_green.png). Small or blurry wordmarks get a crisp traced copy first with fluxr-posts kit/logos/tools/trace_logo.py (steps in fluxr-posts kit/logos/brands/README.md). Look at the logo at full size in the finished thumbnail and video. Keep supplied logo files out of public repos; only the finished thumbnail is published. Logo files in that Drive folder (11 Nov 2026): steinhoff-icon.png, steinhoff-old-wordmark.png, vbs.png, shoprite.png, eskom.png, pep.png, mrprice.png, mrp.png (check which Mr Price mark is current), africanbank.png, gotyme-formerly-tymebank.png, gotyme-cyan.png, tymebank.png, takealot.png, capitec.png.
    - **Look v5 thumbnails (Rodney, 16 Nov 2026: "I don't like those thumbnail boards... they're not quite clear. Like things are separated and also cut in half"):** drawn in the same bright 2D look as one clear, whole scene: one hero subject, 2-4 huge words in one block, strong contrast. Never split-flap or departure-board tiles, split letters, separated panels or a grid of pieces; nothing cut in half by an edge or a divider; everything important inside the centre 3:2 safe area (x 150-1770 of 1920). Example: `videos/main07_steinhoff/thumbnail.js` (rendered with `render.py snap thumbnail.js 1`).
    - Check it shrunk to 320 px wide next to the last 3 thumbnails, and redo it until it is clearly the most readable.
11. **Subtitles:** `python3 ../../tools/make_srt.py <name>.en.srt`.
12. **Metadata:** write `youtube_description.txt`:
    - Title of at most 100 characters, starting with the search phrase. Don't end a title on a question mark (vidIQ 2026 title study: question endings ~0.82x average views; observational).
    - Description with the basics, chapters (first one at 0:00), notes on the example, sources, and the disclaimer. **YouTube allows 5,000 characters at most: keep it under 4,800 and check it with python (`len(text)`) before scheduling and after every edit** (Fluxr EcoCash v2, 16 Nov 2026: the longer source list made it 5,671 and Metricool refused the post; Rodney caught it). If it runs long, shorten the source labels (keep every link) before cutting anything else.
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
- **First second and length (15 Nov 2026 review, test until 22 Nov):** Shorts 001–005 were watched for 6–14 s of about 55 s; the best (002, 47 views) put a specific rand number and its consequence in the title. So: the hero number and what it does to the viewer are on screen in frame 1, the first spoken sentence is under 8 words, and the Short runs 35–45 s. Titles: a rand number + a consequence, never a plain topic label.
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
   - **No template look (YouTube inauthentic-content policy, clarified 16 Jul 2026: "looks like it's made with a template"):** no shot template more than 6 times in one long video, never the same template in two shots back to back, and at least one third of shots hand-made for that video. Shorts never share a layout with the previous Short on the same topic.
   - **No AI persona (same policy: AI personas on finance are not monetisable):** the AI voice is a narrator, never presented as a real person, a named adviser or "your financial adviser"; no AI-made face or avatar presents; never give personal advice ("you should buy X"), only general rules with sources and the disclaimer.
   - Original work only: our own research, script, voice and animation. Never reuse another video's shots or re-skin a template with new words (YouTube's inauthentic-content rule refuses ads on mass-produced or repetitive videos).
   - Nothing we don't own or may not use: music and effects are made in code; no songs, clips or footage from other channels. Photos and clips only under the free licences in the image rules (CC0, public domain, CC BY, CC BY-SA, credited). Brand logos follow "Brand logos and real pictures in the video" below.
   - Honest packaging: the title and thumbnail promise only what the video delivers.
   - Advertiser-friendly: no swearing, shocking or graphic images; hard stories (fraud, collapse, debt) told factually with sources.
   - Disclosures as set: isAiGeneratedContent true for Money From Zero; the "general information, not financial advice" disclaimer on screen and in the description. See also the monetisation rules in STRATEGY.md.
   - Every number from a source checked on the day; sources in the description.
7. **Sound level and style (Rodney, 11 Nov 2026 23:38: "reduce the volume for all the tones and music by 50%. I find it kind of irritating"; 18 Nov 2026 14:01: "Reduce the sound effects in the background's volume by a further 25% for the next videos", and make them like Kurzgesagt's, which are "demure... so low, but you can still hear them in the background"):** `engine/audio.py` now has music at .0225 and effects at .0703 (25% below the 11 Nov levels), and it thins the effects: at most one whoosh-family effect (whoosh, swish, whoosh_low, swoosh_up) every 2.5 s and any effect at least 0.4 s after the last (main07's 372 cues would become 243). Never raise them or pass `--dense`. In scene.js, give whooshes only to chapter changes and big reveals; most cuts get no sound or a soft pop/tick; accents (stamp, coin, ding) only on the key numbers. Listen to the first minute at normal volume: the effects should sit under the voice, felt more than heard.
8. **Final check before rendering (Rodney, 18 Nov 2026: "make sure whenever before we start rendering a video that the information that we have is up to date and is correct. You can just do like a final research"):** right before the render, re-check every figure, name, date and company status in facts.md against its source on the day (search, then open the page). If anything changed, fix the script, re-voice only the affected part and re-time, then render. Log "final check: <date>, all current" (or what changed) in facts.md.

**Brand logos and real pictures in the video (Rodney, 18 Nov 2026: "when you are making videos, you should like try to show logos or related pictures or real pictures... to what's being talked about"; on main07 Steinhoff at about 1:30 the voice named Pep, Ackermans, Pepco, Poundland, Mattress Firm and Deloitte with no logos: "I feel like people would relate or like keep engaged when you're showing logos").** When the voice names a company, bank, retailer, auditor, regulator or product, show its logo at that moment (the "Show what you say" rule), and where we have one a free-licensed real photo of its store, building or product. This is allowed and keeps the channel monetisable if:
- **Identify, never imply endorsement.** YouTube's trademark policy treats use as infringing when it is "likely to cause confusion" about who made a product ([YouTube Help: trademark](https://support.google.com/youtube/answer/6154218)). Naming and showing a company's logo to talk about that company is factual, educational use. Never make it look like the brand made, sponsors or endorses the video, and never put a brand logo on our own characters, products or the Fluxr app.
- **Real logo, whole and unchanged.** Show the actual logo on a clean card or chip (a white card or the brand's own colour tile) inside the bright 2D scene, with its margin (kit/logos/brands/README "Every logo must fit"). Never redraw, recolour, distort or morph the logo itself; animate the card, not the mark. On screen only while the sentence is about that company; it never fills the whole frame.
- **Facts only around wrongdoing.** When a brand is linked to a scandal (Steinhoff, its auditor), say only what a court, regulator, official report or the company itself has stated, with its date, and keep the logo next to that sourced line, never next to an insult or a guess.
- **Where logos come from:** fluxr-posts kit/logos/brands, the Drive folder "Brand logos for thumbnails" (1gKV2GIAuqecagaW6xVtNLcngsTRHlaWY), or the topic's fluxr-posts assets/upcoming/mfz/<slug>/logos/ (fetched on full go from the company's own website or Wikimedia Commons and logged in SOURCES.md). Copy them into the video's gitignored img/ folder for the render; never commit a logo file to this public repo. If one is missing, put the brand name in big type on the card and name the missing logo in the message to Rodney.
- **Never** betting brands, logos of companies the video doesn't talk about, or a logo beside a claim the company didn't make.
- **Description line:** "Logos and brand names belong to their owners and are shown only to identify the companies discussed. This video is not sponsored or endorsed by any of them."

**Engagement (Rodney, 11 Nov 2026 23:50: "The goal is to have engagement, very high engagement with the stories"; 23:46: "high quality, non-stop motion, like no errors").** **Money From Zero alternates one how-to and one money story (Rodney, 15 Nov 2026: "1 how to 1 story video").** Story videos must stay on money (his worry: "going off topic like on the capitec video"): each is told for one money lesson, says it by about the 2-minute mark, ends with 2 minutes of "what this means for you" and points to the related how-to. In a how-to, "the story" below means the worked example told through a person with a money problem. The aim is that viewers watch to the end. Every script and every scene must do this:
- **Cold open:** the first 5 seconds show the most surprising picture or number in the story and ask the question the video answers. No logo intro, no "welcome back".
- **Stakes and promise in the first 20 seconds:** why this matters to the viewer, and what they'll understand by the end.
- **Follow a person:** give the story a face (a sender, a shop owner, a grandmother) with a name and a problem, and come back to them; people remember people, not facts.
- **Open loops:** tease a twist early ("but someone had to pay for all this") and pay it off later; keep one loop open at all times, especially right before the Fluxr part so viewers stay through it.
- **Show what you say (Rodney, 12 Nov 2026: "When talking about something try to show it, like screens"):** whenever the voice names a thing (an app screen, a button, a voucher, a brand, a country, a number), that exact thing is on screen at that moment: the app opens the screen being described and taps the tile being named; a list of names (the five vouchers) appears one by one as each is said, each in its own place, never overlapping or hidden behind another.
- **A new picture every 2–4 seconds and a new kind of shot every 20–30 seconds** (map, character scene, number, cards, diagram); never two shots of the same template back to back.
- **Fill the frame:** the subject takes up a large part of the frame; no small icon alone on an empty background. At most two card shots per minute.
- **Non-stop motion:** the engine's living camera, idle motion and moving backgrounds are on by default; qa.py fails any stretch where the picture freezes for 1.5 s or more.
- **Payoff and next step:** end on the answer, a one-line recap and a reason to watch the next video.

## Quality bar (check every time)
- **Visual bar (Look v5, from 17 Nov 2026):** bright flat 2D, never a white or pale background; every shot moves (camera drift + secondary motion), most shots show people, money or places up close, one hero per shot, a new picture every 2–5 seconds (none over ~6 s), and nothing is AI-generated except the voice.
- Every number matches `facts.md`. The arithmetic is re-run in python.
- No text overlaps or runs off the screen; check the stills.
- Audio is around -14 LUFS with no clipping; spot-check a few seconds of every part.
- Disclaimer: "general information, not financial advice", on screen and in the description.
- Don't make claims about products or providers you can't back up. Name providers only as sources of statistics.
