#!/usr/bin/env bash
# Renders the film in resumable chunks (muted) plus one audio pass, then muxes.
set -e
. ~/.local/opt/env.sh
cd "$(dirname "$0")"
# COMP=AlpineAscent (v1, default) or COMP=AlpineLaunch (v2)
COMP=${COMP:-AlpineAscent}
export COMP
if [ "$COMP" = AlpineLaunch ]; then RANGES="0-479 480-959 960-1439"; NAME=alpine-3l-launch; else RANGES="0-459 460-919 920-1379"; NAME=alpine-3l-ascent; fi
C=out/chunks/$COMP
mkdir -p $C
for r in $RANGES; do
  f=$C/v_$r.mp4
  [ -s "$f" ] && { echo "skip $r"; continue; }
  node render.mjs $C/tmp_$r.mp4 $r > $C/log_$r.txt 2>&1
  mv $C/tmp_$r.mp4 "$f"; echo "done $r"
done
[ -s $C/audio.wav ] || { node render.mjs $C/tmp_audio.wav audio > $C/log_audio.txt 2>&1; mv $C/tmp_audio.wav $C/audio.wav; echo "done audio"; }
: > $C/list.txt; for r in $RANGES; do echo "file 'v_$r.mp4'" >> $C/list.txt; done
ffmpeg -v error -y -f concat -safe 0 -i $C/list.txt -i $C/audio.wav -map 0:v -map 1:a -c:v copy -af "alimiter=limit=0.84:level=false:attack=2:release=60" -c:a aac -b:a 256k -movflags +faststart -shortest out/$NAME.mp4
echo "muxed"
