#!/bin/sh
cd /home/claude/mfz-media/studio/videos/main06_repo_rate
for i in 1 2 3 4 5 6 7 8 9 10; do
  python3 ../../../engine/render_long.py scene.js video_silent.mp4 --theme mfz --chunk 1800 --workers 1 --budget 105 > render_run$i.log 2>&1
  if grep -q DONE render_run$i.log; then echo DONE > render_status.txt; exit 0; fi
  echo "run $i ended" >> render_status.txt
done
