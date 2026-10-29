import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Frame, STAGE, StageGrain } from '../launch/kit';
import { clamp } from '../theme';
import { RgbDefs, Scanlines } from './engine';
import { G, GenData, GenFinale, GenGenesis, GenOrbit, GenReveal, GenWarp, GenXray, Glitch } from './scenes';

export const GENESIS_DURATION = G.end;

// Hard cuts on bar lines (120 BPM, 60 frames per bar); each chapter enters through a glitch.
const CHAPTERS = [
  { from: G.genesis, to: G.reveal, C: GenGenesis, label: '00 — GENESIS' },
  { from: G.reveal, to: G.xray, C: GenReveal, label: '01 — REVEAL' },
  { from: G.xray, to: G.data, C: GenXray, label: '02 — X-RAY' },
  { from: G.data, to: G.warp, C: GenData, label: '03 — PERFORMANCE' },
  { from: G.warp, to: G.orbit, C: GenWarp, label: '04 — DETAILS' },
  { from: G.orbit, to: G.finale, C: GenOrbit, label: '05 — SPECIFICATIONS' },
  { from: G.finale, to: G.end, C: GenFinale, label: '06 — ALPINE 3L' },
];

const STEMS: Array<{ src: string; vol: number }> = [
  { src: 'kick', vol: 0.8 },
  { src: 'hats', vol: 0.5 },
  { src: 'bass', vol: 0.55 },
  { src: 'arp', vol: 0.85 },
  { src: 'blips', vol: 1 },
  { src: 'pad', vol: 1 },
  { src: 'fx', vol: 0.75 },
];

const HITS: Array<{ at: number; src: string; vol: number }> = [
  { at: G.reveal, src: 'sfx/impact-cine-big.mp3', vol: 0.75 },
  { at: G.xray, src: 'sfx/sweep-digital.mp3', vol: 0.4 },
  { at: G.xray + 92, src: 'sfx/air-zoom-vacuum.mp3', vol: 0.45 },
  { at: G.xray + 106, src: 'audio/thump.wav', vol: 0.8 },
  { at: G.data, src: 'sfx/bass-hit-short.mp3', vol: 0.5 },
  { at: G.data + 90, src: 'sfx/bass-hit-short.mp3', vol: 0.5 },
  ...Array.from({ length: 8 }, (_, i) => ({ at: G.warp + i * 45 - 3, src: 'sfx/zoom-swipe-fast.mp3', vol: 0.28 })),
  { at: G.orbit, src: 'sfx/air-woosh-deep.mp3', vol: 0.45 },
  { at: G.finale, src: 'sfx/impact-cine-big.mp3', vol: 0.5 },
  { at: G.finale + 120, src: 'sfx/impact-cine-big.mp3', vol: 0.85 },
  { at: G.finale + 122, src: 'audio/bell.wav', vol: 0.5 },
];

export const Genesis: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = CHAPTERS.findIndex((c) => frame >= c.from && frame < c.to);
  const hud = interpolate(frame, [G.reveal, G.reveal + 20, G.finale + 110, G.finale + 120], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: STAGE }}>
      <RgbDefs />
      {CHAPTERS.map(({ from, to, C }) => (
        <Sequence key={from} from={from} durationInFrames={to - from}>
          <Glitch>
            <C />
          </Glitch>
        </Sequence>
      ))}
      <Scanlines opacity={0.7} />
      <Frame chapter={CHAPTERS[Math.max(0, idx)].label} index={Math.max(0, idx - 1)} total={6} opacity={hud} />
      <StageGrain />
      {STEMS.map((s) => (
        <Audio key={s.src} src={staticFile(`audio/genesis-${s.src}.wav`)} volume={(f) => s.vol * interpolate(f, [0, 6, G.end - 30, G.end], [0, 1, 1, 0], clamp)} />
      ))}
      {HITS.map((h, i) => (
        <Sequence key={i} from={Math.max(0, h.at)} durationInFrames={150}>
          <Audio src={staticFile(h.src)} volume={h.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
