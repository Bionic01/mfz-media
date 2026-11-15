#!/usr/bin/env bash
# Preview stills at given times -> check/s_<t>.png, then a contact sheet.
cd "$(dirname "$0")"
for t in "$@"; do
  PREVIEW=1 STOP=$t manim -s --disable_caching --media_dir /tmp/mfz011_prev mfz_storecard_r271.py MFZ_STORECARD_R271 >/dev/null 2>/tmp/mfz011_err.txt || { tail -20 /tmp/mfz011_err.txt; exit 1; }
  cp "$(find /tmp/mfz011_prev -name 'MFZ_STORECARD_R271*.png' -newer mfz_storecard_r271.py | head -1)" check/s_$t.png
  rm -f $(find /tmp/mfz011_prev -name 'MFZ_STORECARD_R271*.png')
done
python3 contact.py check/contact.png
