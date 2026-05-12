#!/bin/bash
ids=(8328590 37424683 31246143 36602424 36625704)
for id in "${ids[@]}"; do
  for res in "hd_1920_1080_24fps" "hd_1920_1080_30fps" "hd_1920_1080_25fps" "hd_1920_1080_60fps" "hd_1280_720_24fps" "hd_1280_720_30fps" "hd_1280_720_25fps" "hd_1280_720_60fps" "hd_854_480_24fps" "hd_854_480_30fps" "hd_640_360_24fps" "hd_640_360_30fps" "uhd_2560_1440_24fps" "uhd_2560_1440_30fps" "uhd_3840_2160_24fps" "uhd_3840_2160_30fps" "uhd_3840_2160_60fps" "uhd_30fps" "uhd_24fps" "hd_30fps" "hd_24fps" "hd_25fps" "hd_60fps"; do
    url="https://videos.pexels.com/video-files/${id}/${id}-${res}.mp4"
    code=$(curl -sI "$url" 2>/dev/null | head -1 | awk '{print $2}')
    if [ "$code" = "200" ]; then
      echo "FOUND $code $url"
      break
    fi
  done
  # Also try without resolution suffix
  url="https://videos.pexels.com/video-files/${id}/${id}.mp4"
  code=$(curl -sI "$url" 2>/dev/null | head -1 | awk '{print $2}')
  if [ "$code" = "200" ]; then
    echo "FOUND $code $url"
  fi
  # Try just id/uhd_fps pattern
  for fps in "24fps" "25fps" "30fps" "60fps"; do
    url="https://videos.pexels.com/video-files/${id}/uhd_${fps}.mp4"
    code=$(curl -sI "$url" 2>/dev/null | head -1 | awk '{print $2}')
    if [ "$code" = "200" ]; then
      echo "FOUND $code $url"
      break
    fi
  done
  # Try hd pattern
  for fps in "24fps" "25fps" "30fps" "60fps"; do
    url="https://videos.pexels.com/video-files/${id}/hd_${fps}.mp4"
    code=$(curl -sI "$url" 2>/dev/null | head -1 | awk '{print $2}')
    if [ "$code" = "200" ]; then
      echo "FOUND $code $url"
      break
    fi
  done
done
