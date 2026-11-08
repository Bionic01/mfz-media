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
  - Maximum quality (4K).
- **Metricool brand:** "Money From Zero", id **7906209**, with YouTube connected. Fluxr is a separate brand (7157206); never post channel content there.

## Look and sound
- **Brand kit:** `studio/lib/mfz_brand.py`. The style is a split-flap "departure board" in charcoal, with a gold zero and green accents.
  - BG #121214, TEXT #F4EEDF, MUTED #B9B3A8, GREEN #2FD27F, GOLD #F7BE33, RED #FF5D5D, BLUE #6CB4FF.
  - Fonts: Barlow Condensed (headings) and Barlow (labels and body). They are in `studio/fonts`; install them with `mkdir -p ~/.fonts && cp studio/fonts/*.ttf ~/.fonts && fc-cache -f`.
- **Backgrounds:** `studio/lib/bg_board_16x9.png` (3840x2160) for long videos, and `studio/lib/bg_board.png` (2160x3840) for Shorts.
- **Voice:** ElevenLabs voice "Darius", voice_id `fyDgymp89lRTiPu6iLkM`, model `eleven_v4`, `generations_count: 1`.
  - Audio tags such as [serious], [warmly] and [softly] work, but use them sparingly.
  - **Write amounts as "20,000 rand", not "R20,000", in the text you send to the voice.** `build_voice.py` and `make_srt.py` convert them back to "R20,000" on screen and in subtitles.
  - The cost is about 1 credit per character. A long video is about 7,000 credits; a 60-second Short is about 900.

## Long video pipeline (one folder per video, e.g. `studio/videos/main03_<topic>/`)
1. **Topic:** pick the next topic from `studio/BACKLOG.md`. Prefer timely topics, for example tax season, Black Friday, or the February TFSA and RA deadlines.
2. **Research:** write `facts.md` with every number labelled by source (primary sources first).
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
7. **Animate:** first copy `studio/lib/*` and `studio/tools/still.sh` into the video folder, because the scene imports `mfz_brand` and loads the background from its own folder. Then write the manim scene by copying the latest `videos/main02_two_pot/mfz_main02.py` as the template. Its helpers are `chapter_in`, `clear`, `at(cue(...))`, `fit` and `para`.
   - Every visual must sync to a spoken cue.
   - Check every chapter with stills (`still.sh <seconds>`, rendered at 1080p) before the 4K render. Fix overlaps and text running off the screen.
8. **Render:** `manim --disable_caching --media_dir media_4k <scene>.py <Class>` in the background.
   - Expect about 1.5–2.5 hours at 4K30 on 2 cores. Use `run_in_background` and don't use nohup.
9. **Mux:** encode the final file, then check frames:
   ```
   ffmpeg -i video -i voice_master.m4a -filter_complex "[0:v]tpad=stop_mode=clone:stop_duration=3[v]" -map "[v]" -map 1:a -c:v libx264 -preset slow -crf 16 -tune animation -pix_fmt yuv420p -c:a copy -movflags +faststart out.mp4
   ```
   Keep each file under 95 MB (the GitHub limit is 100 MB); raise the CRF if it's bigger.
10. **Thumbnail:** HTML plus Playwright at 1920x1080 (see `videos/*/thumb.html`).
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

## Quality bar (check every time)
- Every number matches `facts.md`. The arithmetic is re-run in python.
- No text overlaps or runs off the screen; check the stills.
- Audio is around -14 LUFS with no clipping; spot-check a few seconds of every part.
- Disclaimer: "general information, not financial advice", on screen and in the description.
- Don't make claims about products or providers you can't back up. Name providers only as sources of statistics.
