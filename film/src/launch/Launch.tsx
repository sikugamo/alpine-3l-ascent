import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { clamp } from '../theme';
import { Frame, L, STAGE, Shot, StageGrain } from './kit';
import { LaunchBento, LaunchEndcard, LaunchFinale, LaunchIntro, LaunchLayers, LaunchNumbers, LaunchReel, LaunchTitle } from './scenes';

export const LAUNCH_DURATION = L.end;

// Every cut sits on a bar line of the 120 BPM score (1 bar = 60 frames).
const SHOTS = [
  { from: L.intro, to: L.title, C: LaunchIntro, chapter: '00 — PROLOGUE' },
  { from: L.title, to: L.layers, C: LaunchTitle, chapter: '01 — INTRODUCING' },
  { from: L.layers, to: L.numbers, C: LaunchLayers, chapter: '02 — ARCHITECTURE' },
  { from: L.numbers, to: L.reel, C: LaunchNumbers, chapter: '03 — PERFORMANCE' },
  { from: L.reel, to: L.bento, C: LaunchReel, chapter: '04 — DETAILS' },
  { from: L.bento, to: L.finale, C: LaunchBento, chapter: '05 — SPECIFICATIONS' },
  { from: L.finale, to: L.endcard, C: LaunchFinale, chapter: '06 — ALPINE 3L' },
  { from: L.endcard, to: L.end, C: LaunchEndcard, chapter: '' },
];

const STEMS: Array<{ src: string; vol: number }> = [
  { src: 'kick', vol: 0.8 },
  { src: 'hats', vol: 0.55 },
  { src: 'bass', vol: 0.42 },
  { src: 'arp', vol: 0.9 },
  { src: 'pad', vol: 1 },
  { src: 'riser', vol: 0.7 },
];

const HITS: Array<{ at: number; src: string; vol: number }> = [
  { at: L.title, src: 'sfx/impact-cine-big.mp3', vol: 0.7 },
  { at: L.layers - 6, src: 'sfx/whoosh-fast.mp3', vol: 0.35 },
  { at: L.layers + 150, src: 'audio/thump.wav', vol: 0.8 },
  { at: L.numbers, src: 'sfx/bass-hit-short.mp3', vol: 0.5 },
  { at: L.numbers + 90, src: 'sfx/bass-hit-short.mp3', vol: 0.5 },
  { at: L.reel - 4, src: 'sfx/whoosh-fast.mp3', vol: 0.35 },
  { at: L.bento - 6, src: 'sfx/air-woosh-deep.mp3', vol: 0.45 },
  { at: L.finale, src: 'sfx/impact-cine-big.mp3', vol: 0.55 },
  { at: L.endcard, src: 'sfx/impact-cine-big.mp3', vol: 0.75 },
  { at: L.endcard + 2, src: 'audio/bell.wav', vol: 0.5 },
];

export const Launch: React.FC = () => {
  const frame = useCurrentFrame();
  const shot = SHOTS.findIndex((s) => frame >= s.from && frame < s.to);
  const hud = interpolate(frame, [L.layers - 10, L.layers + 10, L.endcard - 10, L.endcard], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: STAGE }}>
      {SHOTS.map(({ from, to, C }) => (
        <Sequence key={from} from={from} durationInFrames={to - from + 10}>
          <Shot len={to - from}>
            <C />
          </Shot>
        </Sequence>
      ))}
      <Frame chapter={SHOTS[Math.max(0, shot)].chapter} index={Math.max(0, shot - 1)} total={6} opacity={hud} />
      <StageGrain />
      {STEMS.map((s) => (
        <Audio key={s.src} src={staticFile(`audio/launch-${s.src}.wav`)} volume={(f) => s.vol * interpolate(f, [0, 10, L.end - 30, L.end], [0, 1, 1, 0], clamp)} />
      ))}
      {HITS.map((h, i) => (
        <Sequence key={i} from={h.at} durationInFrames={150}>
          <Audio src={staticFile(h.src)} volume={h.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
