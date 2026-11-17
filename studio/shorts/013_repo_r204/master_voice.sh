#!/usr/bin/env bash
# voice.mp3 -> voice_master.m4a: 150 ms lead (matches build_timing LEAD), two-pass loudnorm to -14 LUFS, padded to timings duration.
set -euo pipefail
cd "$(dirname "$0")"
DUR=$(python3 -c "import json;print(json.load(open('timings.json'))['duration']+0.5)")
ffmpeg -y -hide_banner -loglevel error -i audio/voice.mp3 -af "adelay=150:all=1,apad" -t "$DUR" -ar 48000 -ac 2 _v.wav
JS=$(ffmpeg -hide_banner -i _v.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
g(){ echo "$JS" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -hide_banner -loglevel error -i _v.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -ar 48000 -c:a aac -b:a 320k voice_master.m4a
rm -f _v.wav
ffmpeg -hide_banner -i voice_master.m4a -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
