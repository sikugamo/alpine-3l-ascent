import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Grain, Hud, Weather, Whiteout } from './fx';
import { SceneAnatomy, SceneBarrier, SceneCamps, SceneEnd, SceneStorm, SceneSummit, SceneTitle } from './scenes';
import { CAMP_LEN, NIGHT, T, clamp } from './theme';

export const DURATION = T.end;

const SHOTS = [
  { from: T.storm, to: T.title, C: SceneStorm },
  { from: T.title, to: T.anatomy, C: SceneTitle },
  { from: T.anatomy, to: T.barrier, C: SceneAnatomy },
  { from: T.barrier, to: T.camps, C: SceneBarrier },
  { from: T.camps, to: T.summit, C: SceneCamps },
  { from: T.summit, to: T.whiteout, C: SceneSummit },
  { from: T.whiteout, to: T.end, C: SceneEnd },
];

// Original score stems (tools/make-audio.sh), ridden against the climb.
const BEDS: Array<{ src: string; keys: number[]; vols: number[] }> = [
  { src: 'audio/rain.wav', keys: [0, 12, T.barrier, T.camps, T.camps + 150, T.camps + 210], vols: [0, 0.9, 0.9, 0.65, 0.15, 0] },
  { src: 'audio/wind.wav', keys: [T.camps + 60, T.camps + 270, T.summit, T.whiteout - 20, T.whiteout + 10, T.end], vols: [0, 0.45, 0.7, 0.85, 0.12, 0.04] },
  { src: 'audio/pad.wav', keys: [0, 90, T.summit, T.summit + 30, T.end - 40, T.end], vols: [0, 0.5, 0.55, 0.8, 0.8, 0] },
];

// Footsteps: one sub thump per waypoint of the ascent.
const THUMPS = [T.title, T.anatomy + 172, ...[0, 1, 2, 3].map((i) => T.camps + i * CAMP_LEN), T.summit, T.whiteout + 4];

const SFX: Array<{ at: number; src: string; vol: number; dur?: number }> = [
  { at: 4, src: 'sfx/typewriter-digital.mp3', vol: 0.18, dur: 55 },
  { at: 44, src: 'sfx/impact-cine-big.mp3', vol: 0.55 },
  { at: T.title - 8, src: 'sfx/whoosh-fast.mp3', vol: 0.4 },
  { at: T.anatomy + 12, src: 'sfx/sweep-digital.mp3', vol: 0.3 },
  { at: T.barrier + 20, src: 'sfx/sweep-digital.mp3', vol: 0.22 },
  ...[0, 1, 2, 3].map((i) => ({ at: T.camps + i * CAMP_LEN - 6, src: 'sfx/swoosh-quick.mp3', vol: 0.35 })),
  { at: T.summit - 10, src: 'sfx/air-woosh-deep.mp3', vol: 0.5 },
  { at: T.summit + 58, src: 'sfx/switch-click-quick.mp3', vol: 0.3 },
  { at: T.summit + 116, src: 'sfx/switch-click-quick.mp3', vol: 0.3 },
  { at: T.whiteout - 30, src: 'sfx/shimmer-sparkle-sweep.mp3', vol: 0.35 },
  { at: T.whiteout + 6, src: 'audio/bell.wav', vol: 0.55 },
];

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: NIGHT }}>
      {SHOTS.map(({ from, to, C }) => (
        <Sequence key={from} from={from} durationInFrames={to - from}>
          <C />
        </Sequence>
      ))}
      <Weather />
      <Hud />
      <Whiteout />
      <Grain light={frame >= T.whiteout} />
      {BEDS.map((b) => (
        <Audio key={b.src} src={staticFile(b.src)} volume={(f) => interpolate(f, b.keys, b.vols, clamp)} />
      ))}
      {THUMPS.map((at) => (
        <Sequence key={`t${at}`} from={at} durationInFrames={40}>
          <Audio src={staticFile('audio/thump.wav')} volume={0.8} />
        </Sequence>
      ))}
      {SFX.map((s, i) => (
        <Sequence key={i} from={Math.max(0, s.at)} durationInFrames={s.dur ?? 150}>
          <Audio src={staticFile(s.src)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
