#!/usr/bin/env bash
# Preview stills at given times -> check/s_<t>.png, then a contact sheet.
cd "$(dirname "$0")"
for t in "$@"; do
  PREVIEW=1 STOP=$t manim -s --disable_caching --media_dir /tmp/claude-0/mfz012_prev mfz_bf_discount.py MFZ_BF_DISCOUNT >/dev/null 2>/tmp/claude-0/mfz012_err.txt || { tail -20 /tmp/claude-0/mfz012_err.txt; exit 1; }
  cp "$(find /tmp/claude-0/mfz012_prev -name 'MFZ_BF_DISCOUNT*.png' -newer mfz_bf_discount.py | head -1)" check/s_$t.png
  rm -f $(find /tmp/claude-0/mfz012_prev -name 'MFZ_BF_DISCOUNT*.png')
done
python3 contact.py check/contact.png
