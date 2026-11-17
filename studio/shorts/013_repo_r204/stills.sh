#!/usr/bin/env bash
# Preview stills at given times -> check/s_<t>.png, then a contact sheet.
cd "$(dirname "$0")"
for t in "$@"; do
  PREVIEW=1 STOP=$t manim -s --disable_caching --media_dir /tmp/claude-0/mfz013_prev mfz_repo_r204.py MFZ_REPO_R204 >/dev/null 2>/tmp/claude-0/mfz013_err.txt || { tail -20 /tmp/claude-0/mfz013_err.txt; exit 1; }
  f=$(find /tmp/claude-0/mfz013_prev -name 'MFZ_REPO_R204*.png' | head -1); cp "$f" check/s_$t.png; rm -f "$f"
done
python3 contact.py check/contact.png
