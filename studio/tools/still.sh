#!/usr/bin/env bash
# usage: SCENE=mfz_mainNN.py CLASS=MFZMainNN bash still.sh <seconds>  (run from the video folder copy)
t=$1
cd "$(dirname "$0")"
PREVIEW=1 STOP=$t manim -s --disable_caching --media_dir "media_s/$t" $SCENE $CLASS > "check/log_$t.txt" 2>&1
f=$(find "media_s/$t" -name "*.png" | head -1); [ -n "$f" ] && cp "$f" "check/s_$t.png" && echo "ok $t" || { echo "FAIL $t"; tail -5 "check/log_$t.txt"; }
