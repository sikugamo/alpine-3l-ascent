#!/usr/bin/env bash
# Synthesizes the original score stems (no samples) into public/audio.
set -e
. ~/.local/opt/env.sh
A="$(dirname "$0")/../public/audio"; mkdir -p "$A"
D=48; Q="-v error -y"
# Rain: pink noise, band-limited, with a slow irregular swell.
ffmpeg $Q -f lavfi -i "anoisesrc=d=$D:c=pink:r=48000:a=0.5" -af "highpass=f=500,lowpass=f=9000,tremolo=f=0.23:d=0.25,aecho=0.6:0.5:40:0.25,volume=12dB" -ac 2 "$A/rain.wav"
# Wind: brown noise through two drifting band filters.
ffmpeg $Q -f lavfi -i "anoisesrc=d=$D:c=brown:r=48000:a=0.8" -af "lowpass=f=1200,highpass=f=120,tremolo=f=0.11:d=0.6,flanger=delay=8:depth=6:speed=0.1,volume=8dB" -ac 2 "$A/wind.wav"
# Pad: D minor add9 that resolves to D major add9 at 35s (the summit).
M="clip((t-35)/2\\,0\\,1)"
ffmpeg $Q -f lavfi -i "aevalsrc=d=$D:s=48000:c=stereo:exprs=\
(0.30*sin(2*PI*73.42*t)+0.22*sin(2*PI*110.0*t)+0.16*sin(2*PI*220.6*t)+0.10*sin(2*PI*329.63*t)\
+0.12*(1-$M)*sin(2*PI*174.61*t)+0.12*$M*sin(2*PI*185.0*t)+0.08*$M*sin(2*PI*440.0*t)+0.06*$M*sin(2*PI*659.3*t))*(0.75+0.25*sin(2*PI*0.09*t))\
|(0.30*sin(2*PI*73.6*t)+0.22*sin(2*PI*110.2*t)+0.16*sin(2*PI*219.6*t)+0.10*sin(2*PI*330.1*t)\
+0.12*(1-$M)*sin(2*PI*174.9*t)+0.12*$M*sin(2*PI*185.3*t)+0.08*$M*sin(2*PI*440.5*t)+0.06*$M*sin(2*PI*660.0*t))*(0.75+0.25*sin(2*PI*0.11*t+1))" \
  -af "lowpass=f=2400,aecho=0.8:0.7:180|260:0.35|0.25,volume=0.5" "$A/pad.wav"
# Thump: pitched-down sub hit used as a footstep at every camp.
ffmpeg $Q -f lavfi -i "aevalsrc=d=1.2:s=48000:c=stereo:exprs=sin(2*PI*(46+90*exp(-25*t))*t)*exp(-5*t)*0.9|sin(2*PI*(46+90*exp(-25*t))*t)*exp(-5*t)*0.9" "$A/thump.wav"
# Shimmer: soft high bell for the summit/final card.
ffmpeg $Q -f lavfi -i "aevalsrc=d=5:s=48000:c=stereo:exprs=(0.3*sin(2*PI*1174.7*t)+0.2*sin(2*PI*1479.98*t)+0.15*sin(2*PI*1760*t))*exp(-1.1*t)|(0.3*sin(2*PI*1175.5*t)+0.2*sin(2*PI*1480.6*t)+0.15*sin(2*PI*1761*t))*exp(-1.1*t)" -af "aecho=0.8:0.6:120|210:0.4|0.3" "$A/bell.wav"
echo "stems ready"
