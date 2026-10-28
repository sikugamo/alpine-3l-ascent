import React from 'react';
import { AbsoluteFill, Img, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { Aurora, BLUE, Brackets, DIM, ICE, Product, STAGE, Sweep, ease, focusIn, iceText, img, metal } from '../launch/kit';
import { CJK, MONO, SANS, SNAP, clamp, rnd } from '../theme';
import { Canvas, Decode, GridFloor, Pt, Slices, Warp, expo, rgb, smooth, useImagePoints, useTextPoints } from './engine';

export const G = {
  genesis: 0,
  reveal: 180,
  xray: 300,
  data: 480,
  warp: 660,
  orbit: 1020,
  finale: 1200,
  end: 1440,
} as const;
export const WARP_LEN = 45;

/** Metallic text fill with a bright band at position p (0..1 across the word).
    Uses backgroundImage, not the `background` shorthand: React re-applies only changed keys, and
    re-setting the shorthand every frame would silently reset background-clip to the whole box. */
const shine = (p: number): React.CSSProperties => ({
  backgroundImage: `linear-gradient(100deg, #8DA3B6 0%, #FFFFFF ${(p - 0.12) * 100}%, #FFFFFF ${p * 100}%, #CFEFFF ${p * 100 + 2}%, #8DA3B6 ${(p + 0.14) * 100}%, #8DA3B6 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
});

const mono = (size = 16, color = DIM, spacing = '0.3em'): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, letterSpacing: spacing, color });

// Product photo geometry shared by every scene that shows the front of the jacket.
const JACKET_H = 800;
const JACKET_W = Math.round((777 / 1024) * JACKET_H);
const JX = 960;
const JY = 560;

/** Particles flying from a per-particle source to their targets, glowing additively. */
const drawSwarm = (
  ctx: CanvasRenderingContext2D,
  pts: Pt[],
  ox: number,
  oy: number,
  progress: (i: number, p: Pt) => number,
  source: (i: number, p: Pt) => [number, number],
  opts: { size?: number; tint?: number; alpha?: number; jitter?: number; frame?: number } = {},
) => {
  const { size = 2, tint = 0, alpha = 1, jitter = 0, frame = 0 } = opts;
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const t = progress(i, p);
    const [sx, sy] = source(i, p);
    const jx = jitter ? Math.sin(frame / 7 + i) * jitter : 0;
    const jy = jitter ? Math.cos(frame / 9 + i * 1.3) * jitter : 0;
    const x = sx + (ox + p.x - sx) * t + jx;
    const y = sy + (oy + p.y - sy) * t + jy;
    // Ice-white in flight, true colour on arrival.
    const k = Math.min(1, t * (1 - tint) + tint);
    const r = Math.round(150 + (p.r - 150) * k);
    const g = Math.round(215 + (p.g - 215) * k);
    const b = Math.round(255 + (p.b - 255) * k);
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha * (0.35 + 0.65 * t)})`;
    ctx.fillRect(x, y, size, size);
  }
};

/** Glitchy entrance used by every chapter: RGB split and band jitter for the first frames. */
export const Glitch: React.FC<{ len?: number; children: React.ReactNode }> = ({ len = 9, children }) => {
  const f = useCurrentFrame();
  const g = interpolate(f, [0, len], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ filter: rgb(g * 22) }}>
      <Slices amount={g > 0.3 ? g : 0}>{children}</Slices>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 1 · genesis */

export const GenGenesis: React.FC = () => {
  const f = useCurrentFrame();
  const pts = useImagePoints('front', JACKET_H, 3, 9000);
  const build = (i: number, p: Pt) => expo((f - 72 - ((p.y + JACKET_H / 2) / JACKET_H) * 60 - rnd(i, 3) * 14) / 34);
  const scanY = JY - JACKET_H / 2 + interpolate(f, [72, 140], [0, JACKET_H], clamp);
  const photo = interpolate(f, [150, 178], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: STAGE }}>
      <Aurora intensity={ease(f, 40, 80) * 0.7} />
      {pts && (
        <Canvas
          style={{ opacity: 1 - photo * 0.7 }}
          draw={(ctx) =>
            drawSwarm(
              ctx,
              pts,
              JX,
              JY,
              build,
              (i) => {
                // A rotating galaxy disc that fades up from nothing.
                const r = 120 + rnd(i, 1) * 820;
                const a = rnd(i, 2) * Math.PI * 2 + f * (0.012 + (1 - r / 940) * 0.03);
                return [JX + Math.cos(a) * r * 1.3, JY + Math.sin(a) * r * 0.42];
              },
              { size: 2.2, alpha: ease(f, 0, 40) },
            )
          }
        />
      )}
      {/* Laser scanline that "prints" the jacket top to bottom. */}
      <div
        style={{
          position: 'absolute',
          left: JX - 520,
          top: scanY,
          width: 1040,
          height: 2,
          opacity: interpolate(f, [70, 76, 136, 146], [0, 1, 1, 0], clamp),
          background: `linear-gradient(90deg, transparent, ${ICE}, #fff, ${ICE}, transparent)`,
          boxShadow: `0 0 18px ${ICE}, 0 0 50px ${BLUE}`,
        }}
      />
      <Product src="front" x={JX - JACKET_W / 2} y={JY - JACKET_H / 2} w={JACKET_W} h={JACKET_H} reflect={0} style={{ opacity: photo }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: interpolate(f, [14, 24, 60, 72], [0, 1, 1, 0], clamp) }}>
        <div style={{ fontFamily: CJK, fontSize: 70, color: '#F2F8FC', letterSpacing: '0.2em' }}>
          <Decode text="从风暴中，生成。" at={14} dur={26} />
        </div>
        <div style={{ ...mono(15, ICE, '0.6em'), marginTop: 20 }}>
          <Decode text="BORN FROM THE STORM" at={24} dur={22} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 64, bottom: 60, ...mono(13, DIM, '0.18em'), lineHeight: 2 }}>
        {['> INIT  A3L.SHELL', '> SAMPLE  9,000 PTS', '> BUILD  LAYER 01..03', '> STATUS  READY'].map((l, i) => (
          <div key={l}>
            <Decode text={l} at={30 + i * 26} dur={14} />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 2 · reveal */

// Tracking callouts pinned to features on the front photo (fractions of width/height).
const PINS = [
  { u: 0.5, v: 0.08, side: -1, dy: -40, en: 'ADJ. 3D HOOD', zh: '三维立体风帽' },
  { u: 0.27, v: 0.24, side: -1, dy: 40, en: '100D ZONE', zh: '肩部耐磨加强' },
  { u: 0.6, v: 0.36, side: 1, dy: -50, en: 'CHEST POCKET', zh: '防水拉链胸袋' },
  { u: 0.86, v: 0.4, side: 1, dy: 70, en: 'SLEEVE POCKET', zh: '袖部功能袋' },
];

export const GenReveal: React.FC = () => {
  const f = useCurrentFrame();
  const flash = interpolate(f, [0, 3, 12], [0.85, 0.4, 0], clamp);
  const sway = Math.sin(f / 30) * 4;
  const x0 = JX - JACKET_W / 2;
  const y0 = JY - JACKET_H / 2 + 20;
  return (
    <AbsoluteFill style={{ background: STAGE }}>
      <Aurora intensity={1} />
      <GridFloor horizon={700} speed={0.012} />
      <Glitch len={12}>
        <div style={{ position: 'absolute', inset: 0, transform: `perspective(2000px) rotateY(${sway}deg)` }}>
          <Product src="front" x={x0} y={y0} w={JACKET_W} h={JACKET_H} />
        </div>
      </Glitch>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 46, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 150, letterSpacing: '0.12em', lineHeight: 1, ...metal() }}>
        <Decode text="ALPINE 3L" at={6} dur={26} />
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        {PINS.map((p, i) => {
          const at = 40 + i * 12;
          const t = ease(f, at, 18);
          const px = x0 + p.u * JACKET_W;
          const py = y0 + p.v * JACKET_H;
          const ex = px + p.side * 240 * t;
          const ey = py + p.dy * t;
          const lx = p.side > 0 ? 1560 : 360;
          return (
            <g key={p.en} opacity={t}>
              <circle cx={px} cy={py} r={7} fill="none" stroke={ICE} strokeWidth={1.5} />
              <circle cx={px} cy={py} r={7 + ((f - at) % 30) * 0.9} fill="none" stroke={ICE} strokeOpacity={1 - ((f - at) % 30) / 30} />
              <circle cx={px} cy={py} r={2.5} fill="#fff" />
              <polyline points={`${px},${py} ${ex},${ey} ${ex + (lx - ex) * t},${ey}`} fill="none" stroke={ICE} strokeWidth={1} strokeOpacity={0.8} />
            </g>
          );
        })}
      </svg>
      {PINS.map((p, i) => {
        const at = 46 + i * 12;
        const py = y0 + p.v * JACKET_H + p.dy;
        return (
          <div key={p.en} style={{ position: 'absolute', top: py - 52, ...(p.side > 0 ? { left: 1580 } : { right: 1920 - 340 }), textAlign: p.side > 0 ? 'left' : 'right', opacity: ease(f, at, 10) }}>
            <div style={mono(13, ICE, '0.25em')}>
              <Decode text={`${String(i + 1).padStart(2, '0')} · ${p.en}`} at={at} dur={14} />
            </div>
            <div style={{ fontFamily: CJK, fontSize: 26, color: '#F2F8FC', marginTop: 6 }}>
              <Decode text={p.zh} at={at + 4} dur={14} />
            </div>
          </div>
        );
      })}
      <AbsoluteFill style={{ background: '#FFFFFF', opacity: flash }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 3 · x-ray → layers */

// Monochrome cyan 'thermal' pass: keeps the backdrop dark while the fabric glows.
const XRAY = 'grayscale(1) contrast(1.9) brightness(1.15) sepia(1) hue-rotate(165deg) saturate(4.5)';
const SCAN_READOUT = [
  ['LAYER 01', 'SHELL', '70D NYLON 6 · MINI RIPSTOP'],
  ['LAYER 02', 'MEMBRANE', 'HYDROPHILIC PU · WINDPROOF'],
  ['LAYER 03', 'LINER', '20D POLYESTER KNIT'],
  ['SEAMS', 'SEALED', 'FULLY TAPED'],
];
const SLABS = [
  { src: 'knit-20d', zh: '内层 · 20D 聚酯针织底布' },
  { src: 'pu-membrane-alpha.png', zh: '中层 · 聚醚 PU 防水透湿膜' },
  { src: 'shell-blue', zh: '外层 · 70D 高密度尼龙' },
];

export const GenXray: React.FC = () => {
  const f = useCurrentFrame();
  const scan = interpolate(f, [6, 86], [0, 1], { ...clamp, easing: SNAP });
  const top = JY - JACKET_H / 2;
  const barY = top + scan * JACKET_H;
  const dive = interpolate(f, [90, 112], [0, 1], { ...clamp, easing: (t) => t * t * t });
  const slabs = f >= 106;
  return (
    <AbsoluteFill style={{ background: STAGE }}>
      {!slabs && (
        <AbsoluteFill style={{ transform: `scale(${1 + dive * 7})`, transformOrigin: `${JX}px ${JY - 60}px`, filter: `blur(${dive * 14}px)`, opacity: 1 - dive * 0.6 }}>
          <Aurora intensity={0.6} hue="deep" />
          <Product src="front" x={JX - JACKET_W / 2} y={top} w={JACKET_W} h={JACKET_H} reflect={0} />
          {/* Scanned region shows the x-ray pass. */}
          <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 0 ${1080 - barY}px 0)` }}>
            <Product src="front" x={JX - JACKET_W / 2} y={top} w={JACKET_W} h={JACKET_H} reflect={0} style={{ filter: XRAY }} />
            <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(127,216,255,0.07) 0 1px, transparent 1px 6px)' }} />
          </div>
          <div style={{ position: 'absolute', left: JX - 480, top: barY - 1, width: 960, height: 3, background: '#fff', boxShadow: `0 0 20px ${ICE}, 0 0 60px ${BLUE}`, opacity: scan > 0 && scan < 1 ? 1 : 0 }} />
          <div style={{ position: 'absolute', left: JX - 480, top: barY - 120, width: 960, height: 120, background: `linear-gradient(0deg, rgba(127,216,255,0.22), transparent)`, opacity: scan > 0 && scan < 1 ? 1 : 0 }} />
          <div style={{ position: 'absolute', left: 1360, top: 300, width: 470 }}>
            <div style={mono(14, ICE)}>
              <Decode text="X-RAY · LAMINATE SCAN" at={4} dur={16} />
            </div>
            {SCAN_READOUT.map(([a, b, c], i) => {
              const at = 14 + i * 16;
              return (
                <div key={a} style={{ marginTop: 26, opacity: ease(f, at, 8), borderLeft: `2px solid ${ICE}`, paddingLeft: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', ...mono(13, DIM, '0.2em') }}>
                    <Decode text={a} at={at} dur={10} />
                    <span style={{ color: '#7CF2B0' }}>{f > at + 12 ? 'OK' : '..'}</span>
                  </div>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: '#F2F8FC', marginTop: 4 }}>
                    <Decode text={b} at={at + 2} dur={10} />
                  </div>
                  <div style={mono(13, '#AFC3D3', '0.12em')}>
                    <Decode text={c} at={at + 4} dur={12} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ position: 'absolute', left: 120, top: 300, ...mono(14, DIM, '0.2em'), lineHeight: 2.1 }}>
            <div style={{ color: ICE }}>SCAN</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 96, color: '#F2F8FC', letterSpacing: 0, lineHeight: 1.1 }}>{Math.round(scan * 100)}%</div>
            <div>DEPTH 3L · 185 g/㎡</div>
          </div>
        </AbsoluteFill>
      )}
      {slabs && <Slabs f={f - 106} />}
    </AbsoluteFill>
  );
};

/** Inside the fabric: three holographic slabs fly apart in depth, then lock back together. */
const Slabs: React.FC<{ f: number }> = ({ f }) => {
  const open = interpolate(f, [0, 22, 56, 70], [0, 1, 1, 0.15], { ...clamp, easing: SNAP });
  const spin = interpolate(f, [0, 74], [-50, -28]);
  const lock = interpolate(f, [62, 66, 74], [0, 1, 0.3], clamp);
  return (
    <AbsoluteFill style={{ filter: rgb(interpolate(f, [0, 6], [18, 0], clamp)) }}>
      <Aurora intensity={1} hue="deep" />
      <Warp speed={() => 0.15} n={200} opacity={0.6} />
      <div style={{ position: 'absolute', left: 960 - 270, top: 560 - 270, width: 540, height: 540, perspective: 1800, transform: `scale(${1.6 - ease(f, 0, 24) * 0.6})` }}>
        {SLABS.map((s, i) => (
          <div key={s.src} style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - i) * 170 * open}px) rotateX(60deg) rotateZ(${spin + (1 - i) * 8 * open}deg)` }}>
            <Img src={img(s.src)} style={{ width: 540, height: 540, objectFit: 'cover', borderRadius: 16, opacity: 0.92 }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: 16, border: `2px solid rgba(127,216,255,${0.4 + lock * 0.6})`, boxShadow: `0 0 ${40 + lock * 80}px rgba(127,216,255,${0.35 + lock * 0.5}), inset 0 0 40px rgba(127,216,255,0.25)` }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: 16, background: 'repeating-linear-gradient(90deg, rgba(127,216,255,0.10) 0 1px, transparent 1px 18px)' }} />
          </div>
        ))}
      </div>
      {SLABS.map((s, i) => (
        <div key={s.zh} style={{ position: 'absolute', left: 1330, top: 560 + (1 - i) * 170 * open - 20, opacity: ease(f, 18 + (2 - i) * 5, 10) * interpolate(f, [54, 62], [1, 0], clamp), fontFamily: CJK, fontSize: 28, color: '#F2F8FC', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 40, height: 1, background: ICE }} />
          <Decode text={s.zh} at={18 + (2 - i) * 5} dur={14} />
        </div>
      ))}
      <div style={{ position: 'absolute', left: 140, top: 420, opacity: ease(f, 6, 14) }}>
        <div style={mono(15, ICE)}>
          <Decode text="3-LAYER LAMINATE" at={6} dur={14} />
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 150, lineHeight: 1.05, marginTop: 10, ...metal() }}>3 → 1</div>
        <div style={{ fontFamily: CJK, fontSize: 34, color: '#EEF6FC', marginTop: 10, letterSpacing: '0.1em', opacity: ease(f, 62, 10) }}>一体压合 · 185 g/㎡</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 4 · particle numbers */

const NUM_FONT = "800 290px Inter";

const ParticleNumber: React.FC<{ text: string; mode: 'rain' | 'vapour'; label: string; unit: string; line: string }> = ({ text, mode, label, unit, line }) => {
  const f = useCurrentFrame();
  const pts = useTextPoints(text, NUM_FONT, 4, 6500);
  const settle = (i: number, p: Pt) => expo((f - 4 - rnd(i, 9) * 22 - (mode === 'rain' ? 0 : (1 - (p.y + 150) / 300) * 8)) / 26);
  // Leaving: rain-number shatters downward, vapour-number lifts away.
  const leave = interpolate(f, [78, 90], [0, 1], clamp);
  return (
    <AbsoluteFill>
      {pts && (
        <Canvas
          draw={(ctx) => {
            drawSwarm(
              ctx,
              pts,
              960,
              470 + (mode === 'rain' ? 1 : -1) * leave * leave * 500,
              settle,
              (i, p) => (mode === 'rain' ? [960 + p.x + (rnd(i, 4) - 0.5) * 60, -100 - rnd(i, 5) * 900] : [960 + p.x + (rnd(i, 6) - 0.5) * 300, 1180 + rnd(i, 7) * 500]),
              { size: 2.6, tint: 0, alpha: 1 - leave, jitter: 0.6, frame: f },
            );
          }}
        />
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', ...mono(18, ICE, '0.5em'), opacity: 1 - leave }}>
        <Decode text={label} at={2} dur={18} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', opacity: ease(f, 30, 14) * (1 - leave) }}>
        <div style={mono(28, '#DDEBF6', '0.25em')}>{unit}</div>
        <div style={{ fontFamily: CJK, fontSize: 40, color: '#EEF6FC', marginTop: 34, letterSpacing: '0.1em' }}>
          <Decode text={line} at={36} dur={22} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const GenData: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: STAGE }}>
      <Aurora intensity={0.7} />
      {/* A membrane line the rain bounces off and the vapour passes through. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 880, height: 2, background: `linear-gradient(90deg, transparent, ${ICE}, transparent)`, boxShadow: `0 0 20px ${ICE}`, opacity: 0.6 + 0.2 * Math.sin(f / 6) }} />
      <Sequence durationInFrames={90}>
        <ParticleNumber text="≥20,000" mode="rain" label="WATERPROOF · 防水指数" unit="mm H₂O" line="20 米水柱的压力，挡在门外。" />
      </Sequence>
      <Sequence from={90} durationInFrames={90}>
        <ParticleNumber text="≥15,000" mode="vapour" label="BREATHABILITY · 透湿指数" unit="g/㎡·24h · JIS B-1" line="湿气，持续向外排出。" />
      </Sequence>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 5 · warp reel */

const REEL = [
  { src: 'main-zip', ar: 842 / 1024, zh: '防泼水反装主拉链', en: 'REVERSE-COIL WATER-REPELLENT ZIP' },
  { src: 'seam-tape', ar: 603 / 1024, zh: '全压胶接缝', en: 'FULLY TAPED SEAMS' },
  { src: 'shell-blue', ar: 0.6, zh: '无氟 DWR · 洗前 ≥4 级', en: 'PFC-FREE DWR' },
  { src: 'black-reinforce', ar: 569 / 1024, zh: '100D 耐磨尼龙 · 肩肘加强', en: '100D ABRASION ZONES' },
  { src: 'hood-toggle', ar: 363 / 1024, zh: '三维立体可调节风帽', en: '3D ADJUSTABLE HOOD' },
  { src: 'cuff-velcro', ar: 367 / 1024, zh: '魔术贴袖口', en: 'HOOK-AND-LOOP CUFFS' },
  { src: 'hem-cord', ar: 379 / 1024, zh: '隐藏式下摆抽绳', en: 'HIDDEN HEM DRAWCORD' },
  { src: 'sleeve-pocket', ar: 687 / 1024, zh: '双胸袋 · 侧袋 · 袖部功能袋', en: 'MULTI-POCKET SYSTEM' },
];

const WarpPanel: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const r = REEL[i];
  const w = 1180;
  const h = Math.min(w * r.ar, 640);
  const z = interpolate(f, [0, 12], [-2400, 0], { ...clamp, easing: (t) => expo(t) }) + interpolate(f, [37, 45], [0, 1400], { ...clamp, easing: (t) => t * t });
  const tilt = (i % 2 ? 1 : -1) * interpolate(f, [0, 45], [6, -3]);
  const fade = interpolate(f, [0, 4, 39, 45], [0, 1, 1, 0], clamp);
  const split = interpolate(f, [0, 8], [20, 0], clamp) + interpolate(f, [38, 45], [0, 16], clamp);
  return (
    <AbsoluteFill style={{ perspective: 1400, opacity: fade }}>
      <div style={{ position: 'absolute', left: 960 - w / 2, top: 450 - h / 2, width: w, height: h, transform: `translateZ(${z}px) rotateY(${tilt}deg) rotateX(${tilt * -0.4}deg)`, filter: rgb(split) }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 18, boxShadow: `0 0 0 1px rgba(127,216,255,0.35), 0 0 60px rgba(62,155,234,0.35), 0 60px 120px rgba(0,0,0,0.8)` }}>
          <Img src={img(r.src)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.1 - f * 0.002})` }} />
          <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 1px, transparent 1px 4px)' }} />
          <Sweep at={8} dur={26} strength={0.3} />
        </div>
        <Brackets w={w} h={h} size={34} />
        <div style={{ position: 'absolute', left: 0, top: -34, ...mono(12, ICE, '0.25em') }}>
          <Decode text={`FEATURE ${String(i + 1).padStart(2, '0')}/08`} at={4} dur={10} />
        </div>
        <div style={{ position: 'absolute', right: 0, top: -34, ...mono(12, DIM, '0.2em') }}>
          X {(0.2 + rnd(i, f >> 2) * 0.6).toFixed(3)} · Y {(0.2 + rnd(i + 9, f >> 2) * 0.6).toFixed(3)}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 450 + h / 2 + 40, textAlign: 'center' }}>
        <div style={{ fontFamily: CJK, fontSize: 46, color: '#F2F8FC', letterSpacing: '0.08em' }}>
          <Decode text={r.zh} at={6} dur={16} />
        </div>
        <div style={{ ...mono(14, ICE, '0.45em'), marginTop: 12 }}>
          <Decode text={r.en} at={10} dur={16} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Warp surges hardest across each cut.
const warpSpeed = (f: number) => {
  const local = f % WARP_LEN;
  return 0.2 + 0.8 * Math.max(interpolate(local, [0, 10], [1, 0], clamp), interpolate(local, [36, 45], [0, 1], clamp));
};

export const GenWarp: React.FC = () => (
  <AbsoluteFill style={{ background: STAGE }}>
    <Warp speed={warpSpeed} />
    <AbsoluteFill style={{ background: 'radial-gradient(circle at 50% 45%, rgba(62,155,234,0.18) 0%, transparent 50%)' }} />
    {REEL.map((_, i) => (
      <Sequence key={i} from={i * WARP_LEN} durationInFrames={WARP_LEN}>
        <WarpPanel i={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ 6 · spec orbit */

const SPECS = [
  { v: '≥20,000', u: 'mm', k: '防水指数' },
  { v: '≥15,000', u: 'g/㎡·24h', k: '透湿指数' },
  { v: '620', u: 'g', k: '成衣重量 M 码' },
  { v: '185', u: 'g/㎡', k: '复合面料克重' },
  { v: '100D', u: '', k: '肩肘耐磨加强' },
  { v: '≥4', u: '级', k: '无氟 DWR · 洗前' },
];

export const GenOrbit: React.FC = () => {
  const f = useCurrentFrame();
  const R = 660;
  const P = 1700;
  const spin = f * 0.9 + 20;
  const items = SPECS.map((s, i) => {
    const a = ((spin + (i * 360) / SPECS.length) * Math.PI) / 180;
    const x = Math.sin(a) * R;
    const z = Math.cos(a) * R;
    const s3 = P / (P - z);
    // Tilted orbit: the far side rides high behind the jacket, the near side passes low in front.
    return { s, i, x: 960 + x * s3, y: 600 + z * 0.24, scale: s3 * 0.9, z, front: z > 0 };
  }).sort((a, b) => a.z - b.z);
  const appear = ease(f, 0, 30);
  const tag = (it: (typeof items)[number]) => {
    const vis = interpolate(it.z, [-R, 0, R], [0.12, 0.55, 1]) * appear;
    return (
      <div
        key={it.s.k}
        style={{
          position: 'absolute',
          left: it.x - 150,
          top: it.y - 60,
          width: 300,
          height: 120,
          transform: `scale(${it.scale * (0.6 + appear * 0.4)})`,
          opacity: vis,
          borderRadius: 18,
          background: 'linear-gradient(160deg, rgba(127,216,255,0.16), rgba(255,255,255,0.03))',
          boxShadow: `inset 0 0 0 1px rgba(127,216,255,${0.25 + (it.front ? 0.35 : 0)}), 0 0 30px rgba(62,155,234,${it.front ? 0.3 : 0.1})`,
          padding: '18px 22px',
          filter: it.front ? undefined : `blur(${(1 - vis) * 4}px)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, lineHeight: 1, ...iceText }}>{it.s.v}</span>
          <span style={{ fontFamily: CJK, fontSize: 18, color: '#BFD3E2' }}>{it.s.u}</span>
        </div>
        <div style={{ fontFamily: CJK, fontSize: 18, color: '#B4C4D2', marginTop: 12 }}>{it.s.k}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ background: STAGE }}>
      <Aurora intensity={0.9} hue="deep" />
      <GridFloor horizon={720} speed={0.006} opacity={0.7} />
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <ellipse cx={960} cy={600} rx={R} ry={R * 0.24} fill="none" stroke={ICE} strokeOpacity={0.25} strokeDasharray="4 10" />
      </svg>
      {items.filter((it) => !it.front).map(tag)}
      <Product src="front" x={960 - 250} y={260} w={500} h={660} style={{ ...focusIn(f, 0, 20) }} />
      {items.filter((it) => it.front).map(tag)}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 96, textAlign: 'center' }}>
        <div style={mono(16, ICE, '0.5em')}>
          <Decode text="SPECIFICATIONS" at={4} dur={16} />
        </div>
        <div style={{ fontFamily: CJK, fontSize: 44, color: '#F2F8FC', marginTop: 14, letterSpacing: '0.1em' }}>
          <Decode text="每一个参数，都为山野而定。" at={10} dur={24} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 56, textAlign: 'center', ...mono(13, DIM, '0.2em'), opacity: ease(f, 40, 20) }}>
        耐磨 ≥20,000 次为研发目标 · ABRASION FIGURE IS AN R&amp;D TARGET
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 7 · finale */

export const GenFinale: React.FC = () => {
  const f = useCurrentFrame();
  const jacket = useImagePoints('front', JACKET_H, 3, 9000);
  const logo = useTextPoints('ALPINE 3L', "800 200px Inter", 4, 6000);
  // 0-60 hero · 60-90 implode to a point · 90-120 charged singularity · 120 shockwave + logo forms.
  const photo = interpolate(f, [0, 16, 56, 64], [0, 1, 1, 0], clamp);
  const implode = (i: number) => smooth((f - 60 - rnd(i, 21) * 12) / 22);
  const charge = interpolate(f, [86, 120], [0, 1], clamp);
  const boom = f - 120;
  const logoP = (i: number) => expo((boom - rnd(i, 23) * 18) / 30);
  const realLogo = ease(f, 168, 20);
  return (
    <AbsoluteFill style={{ background: STAGE }}>
      <Aurora intensity={f < 120 ? 1 - charge * 0.6 : 0.4 + ease(boom, 0, 60) * 0.5} />
      {f < 120 && (
        <>
          <Product src="front" x={JX - JACKET_W / 2} y={JY - JACKET_H / 2} w={JACKET_W} h={JACKET_H} reflect={0} style={{ opacity: photo }} />
          {[
            ['冰川蓝', 'GLACIER BLUE', '#5DA9E4', 260],
            ['深岩黑', 'ROCK BLACK', '#1E2126', 1500],
          ].map(([n, en, c, x], k) => (
            <div key={n as string} style={{ position: 'absolute', left: x as number, top: 500, display: 'flex', alignItems: 'center', gap: 16, opacity: ease(f, 14 + k * 6, 14) * interpolate(f, [50, 60], [1, 0], clamp) }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: c as string, boxShadow: `0 0 0 1px rgba(255,255,255,0.35), 0 0 24px ${c}` }} />
              <div>
                <div style={{ fontFamily: CJK, fontSize: 28, color: '#F2F8FC' }}>{n}</div>
                <div style={mono(12, DIM, '0.25em')}>{en}</div>
              </div>
            </div>
          ))}
          {jacket && f >= 56 && (
            <Canvas
              draw={(ctx) => {
                // Reverse genesis: every particle spirals into the centre point.
                ctx.globalCompositeOperation = 'lighter';
                for (let i = 0; i < jacket.length; i++) {
                  const p = jacket[i];
                  const t = implode(i);
                  const a = Math.atan2(p.y, p.x) + t * 4;
                  const d = Math.hypot(p.x, p.y) * (1 - t);
                  ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${0.5 + t * 0.5})`;
                  ctx.fillRect(JX + Math.cos(a) * d, JY + Math.sin(a) * d, 2.2, 2.2);
                }
              }}
            />
          )}
          <div style={{ position: 'absolute', left: JX - 300, top: JY - 300, width: 600, height: 600, borderRadius: 300, background: `radial-gradient(circle, #FFFFFF 0%, ${ICE} ${6 + charge * 10}%, rgba(62,155,234,0.3) ${20 + charge * 20}%, transparent 60%)`, opacity: interpolate(f, [70, 90], [0, 1], clamp) * (0.8 + 0.2 * Math.sin(f * 1.3)), transform: `scale(${0.3 + charge * 0.7})` }} />
        </>
      )}
      {f >= 120 && (
        <>
          {/* Shockwave rings. */}
          <svg width={1920} height={1080} style={{ position: 'absolute' }}>
            {[0, 6, 12].map((d) => {
              const t = Math.max(0, boom - d) / 40;
              return <ellipse key={d} cx={960} cy={540} rx={t * 1400} ry={t * 1400 * 0.35} fill="none" stroke={ICE} strokeWidth={6 * (1 - Math.min(1, t))} opacity={Math.max(0, 1 - t)} style={{ filter: `drop-shadow(0 0 12px ${ICE})` }} />;
            })}
          </svg>
          {logo && (
            <Canvas
              style={{ opacity: 1 - realLogo * 0.85 }}
              draw={(ctx) =>
                drawSwarm(
                  ctx,
                  logo,
                  960,
                  440,
                  logoP,
                  (i) => {
                    // Burst outward from the singularity first, then home in on the letters.
                    const a = rnd(i, 24) * Math.PI * 2;
                    const d = 200 + rnd(i, 25) * 900;
                    return [960 + Math.cos(a) * d, 440 + Math.sin(a) * d * 0.6];
                  },
                  { size: 2.4, jitter: 0.5, frame: f },
                )
              }
            />
          )}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 440 - 115, textAlign: 'center', opacity: realLogo }}>
            {/* The highlight travels inside the letterforms, so nothing shows outside the glyphs. */}
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 200, lineHeight: 1.15, ...shine(interpolate(f, [176, 214], [-0.3, 1.3], clamp)) }}>ALPINE 3L</span>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center' }}>
            <div style={{ fontFamily: CJK, fontSize: 54, color: '#EEF6FC', letterSpacing: '0.18em' }}>
              <Decode text="把风暴，挡在外面。" at={150} dur={28} />
            </div>
            <div style={{ ...mono(16, ICE, '0.6em'), marginTop: 20 }}>
              <Decode text="BUILT FOR THE STORM" at={160} dur={22} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 48, opacity: ease(f, 186, 16) }}>
              {['登山', '徒步', '露营', '户外旅行'].map((t) => (
                <span key={t} style={{ fontFamily: CJK, fontSize: 22, color: '#DDEBF6', padding: '8px 24px', borderRadius: 30, boxShadow: 'inset 0 0 0 1px rgba(127,216,255,0.35)', background: 'rgba(127,216,255,0.06)' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', ...mono(13, DIM, '0.2em'), opacity: ease(f, 196, 16) }}>
            产品标准目标 GB/T 32614-2023 Ⅰ级
          </div>
          <AbsoluteFill style={{ background: '#FFFFFF', opacity: interpolate(boom, [0, 2, 10], [0.9, 0.5, 0], clamp) }} />
        </>
      )}
    </AbsoluteFill>
  );
};

