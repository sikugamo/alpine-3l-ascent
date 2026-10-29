import React, { useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { rnd } from '../theme';

/* v3 "Genesis" motion engine: particle targets sampled from images/text, a frame-driven canvas,
   decoding text, RGB-split glitch, warp streaks, a perspective grid floor and scanlines. */

export type Pt = { x: number; y: number; r: number; g: number; b: number };

const cache = new Map<string, Pt[]>();

/** Resolves particle targets once per tab, holding the render until they exist. */
const usePoints = (key: string, make: () => Promise<Pt[]>) => {
  const [pts, setPts] = useState<Pt[] | null>(() => cache.get(key) ?? null);
  const [handle] = useState(() => (cache.has(key) ? null : delayRender(`points ${key}`, { timeoutInMilliseconds: 60000 })));
  useLayoutEffect(() => {
    if (pts) return;
    make()
      .then((p) => {
        cache.set(key, p);
        setPts(p);
        if (handle !== null) continueRender(handle);
      })
      .catch((err) => cancelRender(err));
    // Runs once per key; `make` is a fresh closure every render by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return pts;
};

/** Even subsample so every target set stays under `max` points. */
const thin = (pts: Pt[], max: number) => {
  if (pts.length <= max) return pts;
  const k = pts.length / max;
  return Array.from({ length: max }, (_, i) => pts[Math.floor(i * k)]);
};

/** Points of a product photo: pixels that stand out from the dark backdrop, centred on (0,0), sized to `height`. */
export const useImagePoints = (name: string, height: number, step = 2, max = 9000) =>
  usePoints(`img:${name}:${height}`, async () => {
    const im = new Image();
    im.src = staticFile(`img/${name}.jpg`);
    await im.decode();
    const h = Math.round(height / step);
    const w = Math.round((im.width / im.height) * h);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(im, 0, 0, w, h);
    const d = ctx.getImageData(0, 0, w, h).data;
    const out: Pt[] = [];
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const [r, g, b] = [d[i], d[i + 1], d[i + 2]];
        // The backdrop is ~#0E1620; keep anything brighter or noticeably bluer than that.
        if (r + g + b > 95 || b - r > 40) out.push({ x: (x - w / 2) * step, y: (y - h / 2) * step, r, g, b });
      }
    return thin(out, max);
  });

/** Points of a line of text rendered in `font`, centred on (0,0). */
export const useTextPoints = (text: string, font: string, step = 4, max = 7000) =>
  usePoints(`txt:${text}:${font}:${step}`, async () => {
    await document.fonts.load(font);
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d')!;
    ctx.font = font;
    const m = ctx.measureText(text);
    const w = Math.ceil(m.width) + 20;
    const h = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + 20;
    c.width = w;
    c.height = h;
    ctx.font = font;
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(text, 10, 10 + m.actualBoundingBoxAscent);
    const d = ctx.getImageData(0, 0, w, h).data;
    const out: Pt[] = [];
    for (let y = 0; y < h; y += step)
      for (let x = 0; x < w; x += step) if (d[(y * w + x) * 4 + 3] > 128) out.push({ x: x - w / 2, y: y - h / 2, r: 235, g: 246, b: 255 });
    return thin(out, max);
  });

/** Full-frame canvas redrawn for every frame (before paint, so the screenshot always has it). */
export const Canvas: React.FC<{ draw: (ctx: CanvasRenderingContext2D, frame: number) => void; style?: React.CSSProperties }> = ({ draw, style }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 1920, 1080);
    ctx.save();
    draw(ctx, frame);
    ctx.restore();
  });
  return <canvas ref={ref} width={1920} height={1080} style={{ position: 'absolute', inset: 0, ...style }} />;
};

export const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
export const expo = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

/* ------------------------------------------------------------------ text */

const GLYPHS = '01<>/\\#*+=-_[]{}ΔΣΩ░▒▓';

/** Text that decodes left to right out of cycling glyphs. */
export const Decode: React.FC<{ text: string; at: number; dur?: number; style?: React.CSSProperties }> = ({ text, at, dur = 18, style }) => {
  const f = useCurrentFrame();
  const chars = Array.from(text);
  const p = (f - at) / dur;
  if (p <= 0) return <span style={{ ...style, opacity: 0 }}>{text}</span>;
  return (
    <span style={style}>
      {chars.map((c, i) => {
        const done = p * chars.length * 1.2 - i > 1;
        const shown = done || c === ' ' ? c : p * chars.length * 1.2 - i > -2 ? GLYPHS[Math.floor(rnd(i, f) * GLYPHS.length)] : ' ';
        return (
          <span key={i} style={{ opacity: done ? 1 : 0.65 }}>
            {shown}
          </span>
        );
      })}
    </span>
  );
};

/* ------------------------------------------------------------------ glitch */

const RGB_LEVELS = 24;

/** SVG filter bank: rgb{k} splits red left and blue right by k px. Mount once per composition. */
export const RgbDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: 'absolute' }}>
    <defs>
      {Array.from({ length: RGB_LEVELS + 1 }, (_, k) => (
        <filter key={k} id={`rgb${k}`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset in="r" dx={-k} result="r2" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
          <feOffset in="b" dx={k} result="b2" />
          <feBlend in="r2" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b2" mode="screen" />
        </filter>
      ))}
    </defs>
  </svg>
);

/** CSS filter value for an RGB split of `amount` px (0 → none). */
export const rgb = (amount: number) => {
  const k = Math.max(0, Math.min(RGB_LEVELS, Math.round(amount)));
  return k === 0 ? undefined : `url(#rgb${k})`;
};

/** Children cut into horizontal bands that jitter sideways while `amount` > 0. */
export const Slices: React.FC<{ amount: number; bands?: number; children: React.ReactNode }> = ({ amount, bands = 9, children }) => {
  const f = useCurrentFrame();
  if (amount <= 0.01) return <AbsoluteFill>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill>
      {Array.from({ length: bands }, (_, i) => {
        const top = (i / bands) * 100;
        const dx = (rnd(i, f) - 0.5) * 120 * amount * (rnd(i, f + 7) > 0.4 ? 1 : 0);
        return (
          <AbsoluteFill key={i} style={{ clipPath: `inset(${top}% 0 ${100 - top - 100 / bands}% 0)`, transform: `translateX(${dx}px)` }}>
            {children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ space */

/** Hyperspace streaks radiating from the centre; `speed` 0 = still stars, 1 = full warp. */
export const Warp: React.FC<{ speed: (f: number) => number; n?: number; opacity?: number }> = ({ speed, n = 420, opacity = 1 }) => (
  <Canvas
    style={{ opacity }}
    draw={(ctx, f) => {
      const s = speed(f);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < n; i++) {
        const a = rnd(i, 61) * Math.PI * 2;
        // Each star slides outward along its ray; distance grows exponentially like perspective.
        const z = (rnd(i, 62) + f * (0.004 + s * 0.03)) % 1;
        const d0 = 20 + Math.pow(z, 2.2) * 1300;
        const len = 2 + s * Math.pow(z, 2) * 420;
        const x0 = 960 + Math.cos(a) * d0;
        const y0 = 540 + Math.sin(a) * d0 * 0.75;
        const x1 = 960 + Math.cos(a) * (d0 + len);
        const y1 = 540 + Math.sin(a) * (d0 + len) * 0.75;
        ctx.strokeStyle = `rgba(170,225,255,${(0.15 + z * 0.85) * (0.35 + s * 0.65)})`;
        ctx.lineWidth = 0.6 + z * 1.8;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
    }}
  />
);

/** Perspective grid floor scrolling toward the camera. */
export const GridFloor: React.FC<{ horizon?: number; opacity?: number; speed?: number }> = ({ horizon = 640, opacity = 1, speed = 0.02 }) => (
  <Canvas
    style={{ opacity }}
    draw={(ctx, f) => {
      const vpX = 960;
      const depth = 1080 - horizon;
      const grad = ctx.createLinearGradient(0, horizon, 0, 1080);
      grad.addColorStop(0, 'rgba(127,216,255,0)');
      grad.addColorStop(1, 'rgba(127,216,255,0.45)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      for (let i = -24; i <= 24; i++) {
        ctx.beginPath();
        ctx.moveTo(vpX + i * 6, horizon);
        ctx.lineTo(vpX + i * 160, 1080 + 200);
        ctx.stroke();
      }
      for (let k = 0; k < 18; k++) {
        const z = (k / 18 + f * speed) % 1;
        const y = horizon + Math.pow(z, 2.4) * depth * 1.2;
        ctx.globalAlpha = Math.pow(z, 1.2);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1920, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      const glow = ctx.createRadialGradient(vpX, horizon, 0, vpX, horizon, 700);
      glow.addColorStop(0, 'rgba(62,155,234,0.35)');
      glow.addColorStop(1, 'rgba(62,155,234,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, horizon - 200, 1920, 600);
    }}
  />
);

/** CRT-style scanlines plus a slow bright roll bar. */
export const Scanlines: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const f = useCurrentFrame();
  const roll = ((f * 9) % 1400) - 200;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity }}>
      <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: roll, height: 160, background: 'linear-gradient(180deg, transparent, rgba(127,216,255,0.035), transparent)' }} />
    </AbsoluteFill>
  );
};
