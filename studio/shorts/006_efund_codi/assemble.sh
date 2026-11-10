#!/usr/bin/env bash
# Final assembly: 4K60 animation + burnt-in captions + mastered narration -> upload master and a 1080p review copy.
set -euo pipefail
cd "$(dirname "$0")"
SILENT=$(find media_4k -name "MFZ_EFUND_CODI.mp4" | head -1)
OUT=MoneyFromZero_006_EmergencyFund_CODI_4K.mp4
REVIEW=MoneyFromZero_006_EmergencyFund_CODI_review_1080p.mp4

ffmpeg -y -hide_banner -loglevel error -i "$SILENT" \
  -vf "subtitles=captions.ass:fontsdir=$HOME/.fonts" \
  -c:v libx264 -preset slow -crf 14 -profile:v high -level 5.2 -pix_fmt yuv420p -r 60 -g 120 _v4k.mp4
ffmpeg -y -hide_banner -loglevel error -i _v4k.mp4 -i voice_master.m4a -map 0:v -map 1:a -c copy -shortest -movflags +faststart "$OUT"
ffmpeg -y -hide_banner -loglevel error -i "$OUT" -vf "scale=1080:1920:flags=lanczos" \
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$REVIEW"
rm -f _v4k.mp4
for f in "$OUT" "$REVIEW"; do
  ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration,size -of compact "$f"
done
