import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from 'remotion';
import { CHAPTERS, HITS, STEMS } from '../genesis/Genesis';
import { RgbDefs, Scanlines } from '../genesis/engine';
import { G, Glitch, WARP_LEN } from '../genesis/scenes';
import { STAGE, StageGrain } from '../launch/kit';
import { clamp } from '../theme';
import { Chrome } from './chrome';
import { InfoLayers } from './layers';

export const INTERFACE_DURATION = G.end;

// UI cues for the interface layer, on top of the v3 score.
const UI: Array<{ at: number; src: string; vol: number }> = [
  { at: 8, src: 'sfx/ui-confirm-tone.mp3', vol: 0.35 },
  { at: 20, src: 'sfx/ui-popup-dry.mp3', vol: 0.3 },
  { at: 30, src: 'sfx/ui-popup-dry.mp3', vol: 0.3 },
  { at: G.reveal + 22, src: 'sfx/ui-confirm-tone.mp3', vol: 0.4 },
  { at: G.xray + 4, src: 'sfx/typewriter-digital.mp3', vol: 0.18 },
  { at: G.data + 8, src: 'sfx/ui-popup-dry.mp3', vol: 0.3 },
  { at: G.data + 98, src: 'sfx/ui-popup-dry.mp3', vol: 0.3 },
  ...Array.from({ length: 8 }, (_, i) => ({ at: G.warp + i * WARP_LEN + 17, src: 'sfx/ui-message-pop.mp3', vol: 0.22 })),
  { at: G.orbit + 14, src: 'sfx/ui-popup-dry.mp3', vol: 0.3 },
  { at: G.finale + 4, src: 'sfx/ui-confirm-tone.mp3', vol: 0.35 },
  ...[60, 68, 76, 84, 92, 100, 108].map((d) => ({ at: G.finale + d, src: 'sfx/switch-click-quick.mp3', vol: 0.3 })),
];

/** v4: the v3 picture, wrapped in a live HUD/FUI and per-chapter information layers. */
export const Interface: React.FC = () => (
  <AbsoluteFill style={{ background: STAGE }}>
    <RgbDefs />
    {CHAPTERS.map(({ from, to, C }) => (
      <Sequence key={from} from={from} durationInFrames={to - from}>
        <Glitch>
          <C />
        </Glitch>
      </Sequence>
    ))}
    <InfoLayers />
    <Scanlines opacity={0.7} />
    <Chrome />
    <StageGrain />
    {STEMS.map((s) => (
      <Audio key={s.src} src={staticFile(`audio/genesis-${s.src}.wav`)} volume={(f) => s.vol * interpolate(f, [0, 6, G.end - 30, G.end], [0, 1, 1, 0], clamp)} />
    ))}
    {[...HITS, ...UI].map((h, i) => (
      <Sequence key={i} from={Math.max(0, h.at)} durationInFrames={150}>
        <Audio src={staticFile(h.src)} volume={h.vol} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
