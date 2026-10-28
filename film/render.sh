#!/usr/bin/env bash
# Renders the film in resumable chunks (muted) plus one audio pass, then muxes.
set -e
. ~/.local/opt/env.sh
cd "$(dirname "$0")"
mkdir -p out/chunks
RANGES="0-459 460-919 920-1379"
for r in $RANGES; do
  f=out/chunks/v_$r.mp4
  [ -s "$f" ] && { echo "skip $r"; continue; }
  node render.mjs out/chunks/tmp_$r.mp4 $r > out/chunks/log_$r.txt 2>&1
  mv out/chunks/tmp_$r.mp4 "$f"; echo "done $r"
done
[ -s out/chunks/audio.wav ] || { node render.mjs out/chunks/tmp_audio.wav audio > out/chunks/log_audio.txt 2>&1; mv out/chunks/tmp_audio.wav out/chunks/audio.wav; echo "done audio"; }
: > out/chunks/list.txt; for r in $RANGES; do echo "file 'v_$r.mp4'" >> out/chunks/list.txt; done
ffmpeg -v error -y -f concat -safe 0 -i out/chunks/list.txt -i out/chunks/audio.wav -map 0:v -map 1:a -c:v copy -af "alimiter=limit=0.84:level=false:attack=2:release=60" -c:a aac -b:a 256k -movflags +faststart -shortest out/alpine-3l-ascent.mp4
echo "muxed"
