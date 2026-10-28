import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { EXPO, MONO, clamp, rnd } from '../theme';

/* v2 "Launch": a dark keynote stage. Light does the design work: spotlights, glows, sweeps and reflections. */

export const BEAT = 15; // 120 BPM at 30 fps
export const BAR = 60;

export const L = {
  intro: 0,
  title: 180,
  layers: 300,
  numbers: 480,
  reel: 660,
  bento: 1020,
  finale: 1200,
  endcard: 1320,
  end: 1440,
} as const;
export const REEL_LEN = 45;

export const STAGE = '#030508';
export const ICE = '#7FD8FF';
export const BLUE = '#3E9BEA';
export const DIM = '#7E8C99';

export const img = (name: string) => staticFile(name.endsWith('.png') ? `img/${name}` : `img/${name}.jpg`);

/** Chrome-like gradient fill for display type. */
export const metal = (from = '#FFFFFF', to = '#8DA3B6'): React.CSSProperties => ({
  background: `linear-gradient(180deg, ${from} 10%, ${to} 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
});

export const iceText: React.CSSProperties = {
  background: `linear-gradient(100deg, #FFFFFF 0%, ${ICE} 45%, ${BLUE} 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

/** 0→1 eased progress from `at` over `dur` frames. */
export const ease = (frame: number, at: number, dur = 20, easing = EXPO) => interpolate(frame - at, [0, dur], [0, 1], { ...clamp, easing });

/** Out-of-focus pull: blur, scale and opacity resolve together. */
export const focusIn = (frame: number, at: number, dur = 22, blur = 18): React.CSSProperties => {
  const p = ease(frame, at, dur);
  return { opacity: p, filter: `blur(${(1 - p) * blur}px)`, transform: `scale(${1.06 - p * 0.06})` };
};

/** Text that resolves from a wide, blurred state; each glyph lands slightly after the last. */
export const BlurText: React.FC<{ text: string; at: number; stagger?: number; style?: React.CSSProperties; glyph?: React.CSSProperties }> = ({
  text,
  at,
  stagger = 1.5,
  style,
  glyph,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: 'flex', justifyContent: 'center', whiteSpace: 'pre', ...style }}>
      {Array.from(text).map((c, i) => {
        const p = ease(frame, at + i * stagger, 24);
        return (
          <span key={i} style={{ display: 'inline-block', opacity: p, filter: `blur(${(1 - p) * 14}px)`, transform: `translateY(${(1 - p) * 18}px)`, ...glyph }}>
            {c}
          </span>
        );
      })}
    </div>
  );
};

/** Slowly drifting colour fields behind everything. Pure gradients: cheap to render on CPU. */
export const Aurora: React.FC<{ intensity?: number; hue?: 'ice' | 'deep' }> = ({ intensity = 1, hue = 'ice' }) => {
  const f = useCurrentFrame();
  const a = hue === 'ice' ? 'rgba(62,155,234,0.30)' : 'rgba(40,70,160,0.30)';
  const b = hue === 'ice' ? 'rgba(127,216,255,0.16)' : 'rgba(110,80,220,0.16)';
  const x1 = 30 + Math.sin(f / 90) * 12;
  const y1 = 30 + Math.cos(f / 110) * 10;
  const x2 = 72 + Math.cos(f / 80) * 10;
  const y2 = 70 + Math.sin(f / 70) * 8;
  return (
    <AbsoluteFill
      style={{
        opacity: intensity,
        background: `radial-gradient(ellipse 45% 40% at ${x1}% ${y1}%, ${a} 0%, transparent 70%), radial-gradient(ellipse 40% 45% at ${x2}% ${y2}%, ${b} 0%, transparent 70%)`,
      }}
    />
  );
};

/** Overhead spotlight cone + floor pool. */
export const Spotlight: React.FC<{ x?: number; opacity?: number; floorY?: number }> = ({ x = 960, opacity = 1, floorY = 900 }) => (
  <AbsoluteFill style={{ opacity }}>
    <div
      style={{
        position: 'absolute',
        left: x - 520,
        top: -100,
        width: 1040,
        height: floorY + 100,
        clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)',
        background: 'linear-gradient(180deg, rgba(190,225,255,0.20) 0%, rgba(190,225,255,0.05) 70%, transparent 100%)',
      }}
    />
    <div style={{ position: 'absolute', left: x - 560, top: floorY - 70, width: 1120, height: 140, background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(127,216,255,0.22) 0%, transparent 70%)' }} />
  </AbsoluteFill>
);

/** Product shot standing on a glossy floor: masked edges plus a faded mirror image. */
export const Product: React.FC<{ src: string; x: number; y: number; w: number; h: number; style?: React.CSSProperties; reflect?: number }> = ({
  src,
  x,
  y,
  w,
  h,
  style,
  reflect = 0.22,
}) => {
  const mask = 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 64%, transparent 100%)';
  const shot = <Img src={img(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, ...style }}>
      <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: mask, maskImage: mask }}>{shot}</div>
      {reflect > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: h * 0.9,
            width: w,
            height: h,
            transform: 'scaleY(-1)',
            transformOrigin: 'top',
            opacity: reflect,
            WebkitMaskImage: 'linear-gradient(0deg, #000 0%, transparent 32%)',
            maskImage: 'linear-gradient(0deg, #000 0%, transparent 32%)',
            filter: 'blur(3px)',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, WebkitMaskImage: mask, maskImage: mask }}>{shot}</div>
        </div>
      )}
    </div>
  );
};

/** A band of light crossing its parent once, from `at` over `dur` frames. Parent needs overflow hidden. */
export const Sweep: React.FC<{ at: number; dur?: number; strength?: number }> = ({ at, dur = 28, strength = 0.35 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - at, [0, dur], [-0.4, 1.4], clamp);
  if (p <= -0.4 || p >= 1.4) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
        background: `linear-gradient(105deg, transparent ${p * 100 - 14}%, rgba(255,255,255,${strength}) ${p * 100}%, transparent ${p * 100 + 14}%)`,
      }}
    />
  );
};

/** Viewfinder corner brackets around a box. */
export const Brackets: React.FC<{ w: number; h: number; size?: number; color?: string; opacity?: number }> = ({ w, h, size = 26, color = ICE, opacity = 0.8 }) => {
  const s = { position: 'absolute' as const, width: size, height: size, borderColor: color, borderStyle: 'solid', opacity };
  return (
    <>
      <div style={{ ...s, left: -12, top: -12, borderWidth: '1.5px 0 0 1.5px' }} />
      <div style={{ ...s, left: w - size + 12, top: -12, borderWidth: '1.5px 1.5px 0 0' }} />
      <div style={{ ...s, left: -12, top: h - size + 12, borderWidth: '0 0 1.5px 1.5px' }} />
      <div style={{ ...s, left: w - size + 12, top: h - size + 12, borderWidth: '0 1.5px 1.5px 0' }} />
    </>
  );
};

/** Floating dust caught in the stage light. */
export const Motes: React.FC<{ n?: number; opacity?: number; rise?: number }> = ({ n = 70, opacity = 1, rise = 0.4 }) => {
  const f = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none' }}>
      {Array.from({ length: n }, (_, i) => {
        const near = rnd(i, 51);
        const y = (((rnd(i, 52) * 1180 - f * rise * (0.4 + near)) % 1180) + 1180) % 1180 - 50;
        const x = rnd(i, 53) * 1920 + Math.sin(f / 40 + i) * 20;
        return <circle key={i} cx={x} cy={y} r={0.6 + near * 2.2} fill="#CFEFFF" opacity={0.1 + near * 0.45} />;
      })}
    </svg>
  );
};

/** Persistent fine-line HUD: frame ticks, chapter index, product code. */
export const Frame: React.FC<{ chapter: string; index: number; total: number; opacity?: number }> = ({ chapter, index, total, opacity = 1 }) => {
  const f = useCurrentFrame();
  const label: React.CSSProperties = { fontFamily: MONO, fontSize: 14, letterSpacing: '0.3em', color: DIM };
  const tc = `${String(Math.floor(f / 30)).padStart(2, '0')}:${String(f % 30).padStart(2, '0')}`;
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 56, top: 48, ...label }}>A3L / HARDSHELL SYSTEM</div>
      <div style={{ position: 'absolute', right: 56, top: 48, ...label, display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ width: 7, height: 7, borderRadius: 4, background: ICE, boxShadow: `0 0 10px ${ICE}`, opacity: 0.5 + 0.5 * Math.sin(f / 5) }} />
        LIVE · {tc}
      </div>
      <div style={{ position: 'absolute', left: 56, bottom: 44, ...label }}>{chapter}</div>
      <div style={{ position: 'absolute', right: 56, bottom: 44, display: 'flex', gap: 6, alignItems: 'center' }}>
        {Array.from({ length: total }, (_, i) => (
          <div key={i} style={{ width: i === index ? 34 : 12, height: 2, background: i === index ? ICE : 'rgba(255,255,255,0.25)' }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** Film grain + vignette for the whole stage. */
export const StageGrain: React.FC = () => {
  const f = useCurrentFrame();
  const seed = f % 5;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.7) 100%)' }} />
      <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.06, mixBlendMode: 'overlay' }}>
        <filter id={`lg${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed + 10} />
        </filter>
        <rect width="100%" height="100%" filter={`url(#lg${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Scene wrapper: focus-pull in, push-through out. Scenes overlap by `xfade` frames. */
export const Shot: React.FC<{ len: number; children: React.ReactNode; xfade?: number }> = ({ len, children, xfade = 10 }) => {
  const frame = useCurrentFrame();
  const inP = ease(frame, 0, 18);
  const outP = interpolate(frame, [len - 2, len + xfade], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        opacity: inP * (1 - outP),
        filter: `blur(${(1 - inP) * 16 + outP * 12}px)`,
        transform: `scale(${1.04 - inP * 0.04 + outP * 0.08})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
