import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Canvas, expo, smooth } from '../genesis/engine';
import { Aurora, BLUE, ICE, Motes, STAGE, StageGrain, img } from '../launch/kit';
import { clamp, rnd } from '../theme';
import { Screen } from './Opening';

/* Opening v2: the same voiceover beats as v1, with a new photo presentation.
   0-3.5 s   a 3D carousel of six photo panels steps round on the beat; each photo tears open from a slit of light
   3.5-6.5 s the carousel spins up, motion-blurs and collapses into the core of light as a particle vortex
   6.5-10 s  unchanged from v1: the core unfolds into a screen and the camera pushes through into v4 */

export const OPENING_V2_DURATION = 300;

const PANELS = ['front', 'main-zip', 'back', 'shell-blue', 'hero', 'dwr-beads'];
const N = PANELS.length;
const STEP = 360 / N;
const PW = 500;
const PH = 660;
const R = 820;
const CORE: [number, number] = [960, 520];

const revealAt = (i: number) => 6 + i * 11; // lands on the v1 pluck grid
const SPIN_FROM = 72;
const COLLAPSE = 108;
const COLLAPSE_LEN = 52;

/** Drum angle in degrees: stepped snaps on the beat, then an accelerating spin. */
const drumAngle = (f: number) => {
  let a = 0;
  for (let i = 1; i < N; i++) a -= STEP * expo((f - (revealAt(i) - 5)) / 9);
  const t = Math.max(0, f - SPIN_FROM);
  return a - 0.09 * t * t - 0.0016 * t * t * t;
};
const spinSpeed = (f: number) => Math.abs(drumAngle(f + 1) - drumAngle(f));

const Panel: React.FC<{ i: number; angle: number }> = ({ i, angle }) => {
  const f = useCurrentFrame();
  // The tear starts as the panel swings in and completes as it lands front-centre (on the flash),
  // so the front of the carousel is never an empty frame.
  const r = expo((f - (revealAt(i) - 9)) / 10);
  const world = (((i * STEP + angle) % 360) + 360) % 360;
  const facing = Math.cos((world * Math.PI) / 180);
  const light = 0.3 + 0.7 * Math.max(0, facing);
  // Motion blur only once the carousel spins up; the beat-steps stay crisp.
  const blur = f > SPIN_FROM ? Math.min(10, Math.max(0, spinSpeed(f) - 6) * 0.35) : 0;
  const flash = interpolate(f - revealAt(i), [0, 2, 10], [0, 1, 0], clamp);
  const slit = (1 - r) * 50;
  return (
    <div
      style={{
        position: 'absolute',
        left: -PW / 2,
        top: -PH / 2,
        width: PW,
        height: PH,
        transform: `rotateY(${i * STEP}deg) translateZ(${R}px)`,
        WebkitBoxReflect: 'below 14px linear-gradient(transparent 62%, rgba(255,255,255,0.22))',
      }}
    >
      {/* Unrevealed: a glass frame waiting for its photo. */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 16, background: 'rgba(127,216,255,0.04)', boxShadow: `inset 0 0 0 1.5px rgba(127,216,255,${0.25 + 0.35 * light})` }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: 16, overflow: 'hidden', clipPath: `inset(${slit}% 0 ${slit}% 0)`, filter: `brightness(${light + flash * 0.8}) blur(${blur}px)` }}>
        <Img src={img(PANELS[i])} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.15 - r * 0.15})` }} />
        {/* Specular sheen that slides across as the panel swings through the light. */}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(105deg, transparent ${30 + world * 0.2}%, rgba(255,255,255,0.22) ${40 + world * 0.2}%, transparent ${52 + world * 0.2}%)`, mixBlendMode: 'screen' }} />
      </div>
      {/* The tear: two bright edges racing apart from the centre line. */}
      {r > 0 && r < 0.98 && (
        <>
          {[slit, 100 - slit].map((y, k) => (
            <div key={k} style={{ position: 'absolute', left: -20, right: -20, top: `${y}%`, height: 2, background: '#fff', boxShadow: `0 0 18px ${ICE}, 0 0 40px ${BLUE}`, opacity: 1 - r }} />
          ))}
        </>
      )}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 16, boxShadow: `0 0 0 1.5px rgba(127,216,255,${0.5 * r * light}), 0 0 ${50 * light}px rgba(62,155,234,${0.35 * r * light})` }} />
    </div>
  );
};

const Drum: React.FC = () => {
  const f = useCurrentFrame();
  const angle = drumAngle(f);
  const collapse = smooth((f - COLLAPSE) / COLLAPSE_LEN);
  if (collapse >= 1) return null;
  const tilt = interpolate(f, [0, COLLAPSE], [14, 6], clamp) + collapse * 30;
  // Camera sits close; each reveal lands with a small zoom punch.
  const punch = PANELS.reduce((m, _, i) => Math.max(m, interpolate(f - revealAt(i), [0, 2, 10], [0, 1, 0], clamp)), 0);
  const scale = (1.12 + 0.08 * expo(f / 60) + punch * 0.035) * (1 - collapse);
  const y = 560 + (CORE[1] - 560) * collapse;
  return (
    <AbsoluteFill style={{ perspective: 1800, perspectiveOrigin: `50% ${y - 80}px`, opacity: interpolate(f, [0, 10], [0, 1], clamp) * interpolate(collapse, [0.85, 1], [1, 0], clamp) }}>
      <div style={{ position: 'absolute', left: 960, top: y, transformStyle: 'preserve-3d', transform: `scale(${scale}) translateZ(${-R}px) rotateX(${-tilt}deg) rotateY(${angle}deg)` }}>
        {PANELS.map((_, i) => (
          <Panel key={i} i={i} angle={angle} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** Particle vortex spiralling from the drum's rim into the core. */
const Vortex: React.FC = () => (
  <Canvas
    draw={(ctx, f) => {
      const o = interpolate(f, [COLLAPSE - 10, COLLAPSE + 10, COLLAPSE + COLLAPSE_LEN, COLLAPSE + COLLAPSE_LEN + 25], [0, 1, 1, 0], clamp);
      if (o <= 0) return;
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 1400; i++) {
        // Each particle falls inward on its own clock, winding faster as it nears the centre.
        const life = (rnd(i, 1) + (f - COLLAPSE + 10) * (0.012 + rnd(i, 2) * 0.01)) % 1;
        const rad = (1 - life) * (520 + rnd(i, 3) * 260);
        const a = rnd(i, 4) * Math.PI * 2 + life * 7 + f * 0.05;
        const x = CORE[0] + Math.cos(a) * rad * 1.35;
        const y = CORE[1] + Math.sin(a) * rad * 0.45;
        ctx.fillStyle = `rgba(${150 + rnd(i, 5) * 80},${210 + rnd(i, 6) * 40},255,${o * (0.25 + life * 0.75)})`;
        const s = 1 + life * 2;
        ctx.fillRect(x, y, s, s);
      }
    }}
  />
);

/** Core of light: charges as the carousel collapses into it, then hands over to the v1 screen. */
const Core: React.FC = () => {
  const f = useCurrentFrame();
  const charge = smooth((f - COLLAPSE) / (COLLAPSE_LEN + 10));
  const appear = interpolate(f, [COLLAPSE - 6, COLLAPSE + 12], [0, 1], clamp);
  const fade = interpolate(f, [195, 215], [1, 0], clamp);
  if (appear <= 0 || fade <= 0) return null;
  const r = 18 + charge * 48;
  const pulse = 0.85 + 0.15 * Math.sin(f / 3.5);
  return (
    <div
      style={{
        position: 'absolute',
        left: CORE[0] - r * 5,
        top: CORE[1] - r * 5,
        width: r * 10,
        height: r * 10,
        borderRadius: '50%',
        opacity: appear * fade,
        transform: `scale(${pulse})`,
        background: `radial-gradient(circle, #FFFFFF 0%, ${ICE} 8%, rgba(62,155,234,0.45) 22%, rgba(62,155,234,0.12) 45%, transparent 70%)`,
      }}
    />
  );
};

/** Back-light and glossy floor line for the carousel stage. */
const Stage: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 20, COLLAPSE + 20, 190], [0, 1, 1, 0], clamp);
  const beat = Math.max(0, ...PANELS.map((_, i) => interpolate(f - revealAt(i), [0, 3, 14], [0, 1, 0], clamp)));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 45% 55% at 50% 42%, rgba(62,155,234,${0.16 + beat * 0.14}) 0%, transparent 70%)` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 930, height: 1.5, background: `linear-gradient(90deg, transparent, rgba(127,216,255,0.45), transparent)` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 930, height: 150, background: 'linear-gradient(180deg, rgba(62,155,234,0.08), transparent)' }} />
    </AbsoluteFill>
  );
};

export const OpeningV2: React.FC = () => {
  const f = useCurrentFrame();
  const end = interpolate(f, [284, 299], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: STAGE }}>
      <AbsoluteFill style={{ opacity: end }}>
        <Aurora intensity={interpolate(f, [0, 60, 190], [0.3, 0.6, 0.8], clamp)} />
        <Stage />
        <Drum />
        <Vortex />
        <Core />
        <Screen />
        <Motes n={60} opacity={0.6} />
      </AbsoluteFill>
      <StageGrain />
      <Audio src={staticFile('audio/opening-pad.wav')} volume={(t) => interpolate(t, [0, 20], [0, 0.9], clamp)} />
      <Audio src={staticFile('audio/opening-plucks.wav')} volume={0.8} />
      <Audio src={staticFile('audio/opening-rise.wav')} volume={0.6} />
      {PANELS.map((_, i) => (
        <Sequence key={i} from={revealAt(i)} durationInFrames={40}>
          <Audio src={staticFile('sfx/camera-shutter-hard.mp3')} volume={0.22} />
        </Sequence>
      ))}
      {PANELS.slice(1).map((_, i) => (
        <Sequence key={`s${i}`} from={revealAt(i + 1) - 5} durationInFrames={30}>
          <Audio src={staticFile('sfx/transition-snap.mp3')} volume={0.12} />
        </Sequence>
      ))}
      <Sequence from={COLLAPSE - 8} durationInFrames={90}>
        <Audio src={staticFile('sfx/air-zoom-vacuum.mp3')} volume={0.35} />
      </Sequence>
      <Sequence from={191} durationInFrames={100}>
        <Audio src={staticFile('sfx/shimmer-sparkle-sweep.mp3')} volume={0.3} />
      </Sequence>
      <Sequence from={250} durationInFrames={50}>
        <Audio src={staticFile('sfx/air-woosh-deep.mp3')} volume={0.3} />
      </Sequence>
    </AbsoluteFill>
  );
};
