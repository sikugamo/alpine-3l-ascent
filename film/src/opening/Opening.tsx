import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Canvas, expo, smooth } from '../genesis/engine';
import { Aurora, BLUE, ICE, Motes, Product, STAGE, StageGrain, img } from '../launch/kit';
import { EXPO, clamp, rnd } from '../theme';

/* 10 s text-free opening, timed to the voiceover:
   0-3.5 s   "…using just a few photos of a garment?"  → a few real product photos land on a dark surface
   3.5-6.5 s "I shared my idea with Claude,"           → the photos stream into a glowing core of light
   6.5-10 s  "and this is the video it produced."       → the core unfolds into a screen; we push through it
   It ends on the near-black stage that v4 opens on, so the two cut together seamlessly. */

export const OPENING_DURATION = 300;

const DEPART = 105;
const GAP = 9;
const FLIGHT = 28;
const BLOOM = 195;
const CORE: [number, number] = [960, 520];

type Shot = { src: string; x: number; y: number; w: number; h: number; rot: number; tint: [number, number, number] };

// Print layout on the "table" (screen-space centres). Tints drive each photo's particle trail.
const PRINTS: Shot[] = [
  { src: 'front', x: 700, y: 470, w: 250, h: 330, rot: -8, tint: [140, 200, 245] },
  { src: 'main-zip', x: 1150, y: 410, w: 330, h: 260, rot: 6, tint: [110, 180, 240] },
  { src: 'shell-blue', x: 1440, y: 650, w: 280, h: 280, rot: -5, tint: [80, 160, 240] },
  { src: 'back', x: 500, y: 740, w: 240, h: 315, rot: 11, tint: [140, 200, 245] },
  { src: 'hood-toggle', x: 970, y: 730, w: 330, h: 250, rot: -3, tint: [170, 210, 240] },
  { src: 'black-reinforce', x: 1250, y: 880, w: 300, h: 230, rot: 8, tint: [150, 170, 190] },
];

const landAt = (i: number) => 6 + i * 11;
const departAt = (i: number) => DEPART + i * GAP;
const PRINT_SCALE = 1.25;

/** Screen position of print i at flight progress q (0 on the table, 1 inside the core), on a curved path. */
const flightPos = (i: number, q: number): [number, number] => {
  const p = PRINTS[i];
  const dx = CORE[0] - p.x;
  const dy = CORE[1] - p.y;
  const len = Math.hypot(dx, dy) || 1;
  const bend = Math.sin(Math.PI * q) * 140 * (i % 2 ? 1 : -1);
  return [p.x + dx * q + (-dy / len) * bend, p.y + dy * q + (dx / len) * bend];
};

const Print: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const p = PRINTS[i];
  const pw = p.w * PRINT_SCALE;
  const ph = p.h * PRINT_SCALE;
  const land = expo((f - landAt(i)) / 14);
  if (land <= 0) return null;
  const q = smooth((f - departAt(i)) / FLIGHT);
  if (q >= 1) return null;
  const [x, y] = flightPos(i, q);
  // On the table the prints lie tilted back; in flight they turn to face us, spin and shrink into the core.
  const tilt = 32 * (1 - q);
  const rot = p.rot + q * 200 * (i % 2 ? 1 : -1);
  const scale = (1.35 - 0.35 * land) * (1 - q * 0.96);
  const lift = (1 - land) * -90;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - pw / 2,
        top: y - ph / 2 + lift,
        width: pw,
        height: ph,
        opacity: land * interpolate(q, [0.8, 1], [1, 0], clamp),
        filter: `blur(${(1 - land) * 8}px) brightness(${1 + q * 0.8})`,
        transform: `perspective(1400px) rotateX(${tilt}deg) rotate(${rot}deg) scale(${scale})`,
      }}
    >
      {/* A white-bordered print with a soft contact shadow. */}
      <div style={{ position: 'absolute', inset: 0, background: '#ECEFF2', padding: 10, paddingBottom: 26, boxShadow: `0 ${30 * land * (1 - q)}px ${60 * land}px rgba(0,0,0,0.65)`, borderRadius: 3 }}>
        <Img src={img(p.src)} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, transparent 40%)', borderRadius: 3 }} />
    </div>
  );
};

/** Particle trails shed by each print in flight. */
const Trails: React.FC = () => (
  <Canvas
    draw={(ctx, f) => {
      ctx.globalCompositeOperation = 'lighter';
      PRINTS.forEach((p, i) => {
        const q = (f - departAt(i)) / FLIGHT;
        if (q <= 0 || q > 1.5) return;
        for (let k = 0; k < 90; k++) {
          const qk = Math.min(1, q) - k * 0.011;
          if (qk <= 0) continue;
          const [x, y] = flightPos(i, smooth(qk));
          const spread = 6 + k * 0.9;
          const a = (1 - k / 90) * 0.85 * interpolate(q, [1, 1.5], [1, 0], clamp);
          const [r, g, b] = p.tint;
          ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
          const s = 1.2 + rnd(k, i) * 2.4;
          ctx.fillRect(x + (rnd(k, i + 10) - 0.5) * spread, y + (rnd(k, i + 20) - 0.5) * spread, s, s);
        }
      });
    }}
  />
);

/** The core of light: it brightens with every photo it absorbs. */
const Core: React.FC = () => {
  const f = useCurrentFrame();
  const absorbed = PRINTS.reduce((n, _, i) => n + smooth((f - departAt(i) - FLIGHT * 0.8) / 8), 0) / PRINTS.length;
  const appear = interpolate(f, [92, 112], [0, 1], clamp);
  const bloomFade = interpolate(f, [BLOOM, BLOOM + 20], [1, 0], clamp);
  const pulse = 0.85 + 0.15 * Math.sin(f / 3.5);
  const r = 18 + absorbed * 46;
  if (appear <= 0 || bloomFade <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: appear * bloomFade }}>
      <div
        style={{
          position: 'absolute',
          left: CORE[0] - r * 5,
          top: CORE[1] - r * 5,
          width: r * 10,
          height: r * 10,
          borderRadius: '50%',
          background: `radial-gradient(circle, #FFFFFF 0%, ${ICE} 8%, rgba(62,155,234,0.45) 22%, rgba(62,155,234,0.12) 45%, transparent 70%)`,
          transform: `scale(${pulse})`,
        }}
      />
      {/* Thin orbit rings spin up as the core charges. */}
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        {[1.8, 2.6].map((k, j) => (
          <ellipse key={k} cx={CORE[0]} cy={CORE[1]} rx={r * k * 1.6} ry={r * k * 0.5} fill="none" stroke={ICE} strokeOpacity={0.35 * absorbed} strokeDasharray="3 9" transform={`rotate(${(j ? -1 : 1) * f * 2.5} ${CORE[0]} ${CORE[1]})`} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/** The core unfolds into a screen showing the jacket, then the camera pushes through it into the film. */
const Screen: React.FC = () => {
  const f = useCurrentFrame();
  if (f < BLOOM) return null;
  const w = 1280 * expo((f - BLOOM) / 18);
  const h = Math.max(3, 720 * expo((f - BLOOM - 12) / 18));
  const content = interpolate(f, [BLOOM + 26, BLOOM + 46], [0, 1], clamp);
  const push = interpolate(f, [252, 292], [0, 1], { ...clamp, easing: (t) => t * t * t });
  const flare = interpolate(f, [BLOOM, BLOOM + 6, BLOOM + 30], [0, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ transform: `scale(${1 + push * 2.4})`, transformOrigin: `${CORE[0]}px ${CORE[1]}px`, filter: `blur(${interpolate(push, [0.4, 1], [0, 18], clamp)}px)` }}>
      <div
        style={{
          position: 'absolute',
          left: CORE[0] - w / 2,
          top: CORE[1] - h / 2,
          width: w,
          height: h,
          borderRadius: 18,
          overflow: 'hidden',
          background: STAGE,
          boxShadow: `0 0 0 1.5px rgba(127,216,255,0.7), 0 0 80px rgba(62,155,234,0.55), 0 0 200px rgba(62,155,234,0.25)`,
        }}
      >
        <AbsoluteFill style={{ opacity: content }}>
          <Aurora intensity={1} />
          <Product src="front" x={640 - 220} y={360 - 290 + (1 - content) * 30} w={440} h={580} reflect={0.15} />
          <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0 1px, transparent 1px 3px)' }} />
        </AbsoluteFill>
      </div>
      {/* Horizontal lens flare as the screen snaps open. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: CORE[1] - 1, height: 2, opacity: flare, background: `linear-gradient(90deg, transparent, ${ICE}, #fff, ${ICE}, transparent)`, boxShadow: `0 0 30px ${ICE}, 0 0 80px ${BLUE}` }} />
    </AbsoluteFill>
  );
};

/** A low, warm light falling across the "table" while the prints are down. */
const TableLight: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 30, DEPART + 40, BLOOM], [0, 1, 1, 0], clamp);
  const drift = Math.sin(f / 60) * 40;
  return (
    <AbsoluteFill
      style={{
        opacity: o,
        background: `radial-gradient(ellipse 55% 45% at ${50 + drift / 40}% 58%, rgba(120,160,200,0.20) 0%, transparent 70%), linear-gradient(180deg, #05080C 0%, #0A1118 60%, #070B10 100%)`,
      }}
    />
  );
};

export const Opening: React.FC = () => {
  const f = useCurrentFrame();
  // Slow dolly across the table while the photos land.
  const dolly = interpolate(f, [0, DEPART + 60], [0, 1], { ...clamp, easing: EXPO });
  const end = interpolate(f, [284, 299], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: STAGE }}>
      <AbsoluteFill style={{ opacity: end }}>
        <TableLight />
        <Aurora intensity={interpolate(f, [90, 190], [0.2, 0.8], clamp)} />
        <AbsoluteFill style={{ transform: `translate(${20 - dolly * 40}px, ${10 - dolly * 20}px) scale(${1.06 - dolly * 0.06})` }}>
          {PRINTS.map((_, i) => (
            <Print key={i} i={i} />
          ))}
        </AbsoluteFill>
        <Trails />
        <Core />
        <Screen />
        <Motes n={60} opacity={0.7} />
      </AbsoluteFill>
      <StageGrain />
      <Audio src={staticFile('audio/opening-pad.wav')} volume={(t) => interpolate(t, [0, 20], [0, 0.9], clamp)} />
      <Audio src={staticFile('audio/opening-plucks.wav')} volume={0.8} />
      <Audio src={staticFile('audio/opening-rise.wav')} volume={0.6} />
      {PRINTS.map((_, i) => (
        <Sequence key={i} from={departAt(i) - 2} durationInFrames={60}>
          <Audio src={staticFile('sfx/swoosh-quick.mp3')} volume={0.14} />
        </Sequence>
      ))}
      <Sequence from={BLOOM - 4} durationInFrames={100}>
        <Audio src={staticFile('sfx/shimmer-sparkle-sweep.mp3')} volume={0.3} />
      </Sequence>
      <Sequence from={250} durationInFrames={50}>
        <Audio src={staticFile('sfx/air-woosh-deep.mp3')} volume={0.3} />
      </Sequence>
    </AbsoluteFill>
  );
};
