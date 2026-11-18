#!/usr/bin/env bash
# Preview stills at given times -> check/s_<t>.png, then a contact sheet.
cd "$(dirname "$0")"
for t in "$@"; do
  PREVIEW=1 STOP=$t manim -s --disable_caching --media_dir /tmp/claude-0/mfz014_prev mfz_twopot_repeat.py MFZ_TWOPOT_REPEAT >/dev/null 2>/tmp/claude-0/mfz014_err.txt || { tail -20 /tmp/claude-0/mfz014_err.txt; exit 1; }
  f=$(find /tmp/claude-0/mfz014_prev -name 'MFZ_TWOPOT_REPEAT*.png' | head -1); cp "$f" check/s_$t.png; rm -f "$f"
done
python3 contact.py check/contact.png
