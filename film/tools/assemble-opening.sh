#!/usr/bin/env bash
# Joins an opening and the v4 film into one file.
#   ./tools/assemble-opening.sh       → out/alpine-3l-interface-with-opening.mp4     (opening v1)
#   OPENING=v2 ./tools/assemble-opening.sh → out/alpine-3l-interface-with-opening-v2.mp4 (opening v2)
# Needs the opening render (COMP=AlpineOpening[V2] ./render.sh) and out/alpine-3l-interface.mp4.
set -e
. ~/.local/opt/env.sh
cd "$(dirname "$0")/.."
SUFFIX=""
[ "${OPENING:-v1}" = v2 ] && SUFFIX="-v2"
ffmpeg -v error -y -i out/alpine-3l-opening$SUFFIX.mp4 -i out/alpine-3l-interface.mp4 \
  -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -c:a aac -b:a 256k -ar 48000 -movflags +faststart \
  out/alpine-3l-interface-with-opening$SUFFIX.mp4
echo "assembled out/alpine-3l-interface-with-opening$SUFFIX.mp4"
