#!/bin/bash
ids=(8328590 37424683 8733007 31246143 6026115 13866390 36602424 36625704)
for id in "${ids[@]}"; do
  for res in "hd_1920_1080_24fps" "hd_1920_1080_30fps" "hd_1920_1080_25fps" "hd_1280_720_24fps" "hd_1280_720_30fps" "hd_1280_720_25fps" "hd_1280_720_60fps" "uhd_2560_1440_24fps" "uhd_2560_1440_30fps" "uhd_3840_2160_24fps" "uhd_3840_2160_30fps"; do
    url="https://videos.pexels.com/video-files/${id}/${id}-${res}.mp4"
    code=$(curl -sI "$url" 2>/dev/null | head -1 | awk '{print $2}')
    if [ "$code" = "200" ]; then
      echo "FOUND $code $url"
      break
    fi
  done
done
