import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { CJK, EXPO, FOG, GLACIER, H, MONO, SANS, SNOW, T, W, clamp, rnd } from './theme';

/* ------------------------------------------------------------------ altitude */

// The film climbs from the trailhead to a fictional 5,200 m summit; each scene is a waypoint.
const ALT_KEYS: Array<[number, number]> = [
  [T.storm, 0],
  [T.title, 1200],
  [T.anatomy, 1850],
  [T.barrier, 2600],
  [T.camps, 3100],
  [T.camps + 90, 3600],
  [T.camps + 180, 4100],
  [T.camps + 270, 4550],
  [T.summit, 5200],
];
export const SUMMIT_ALT = 5200;
export const CAMP_ALTS = [3100, 3600, 4100, 4550];

export const altitudeAt = (frame: number) => {
  let alt = 0;
  for (let i = 1; i < ALT_KEYS.length; i++) {
    const [f, v] = ALT_KEYS[i];
    const prev = ALT_KEYS[i - 1][1];
    if (frame >= f) alt = prev + (v - prev) * interpolate(frame - f, [0, 34], [0, 1], { ...clamp, easing: EXPO });
  }
  return alt;
};

/* ------------------------------------------------------------------ weather */

const rainLevel = (f: number) =>
  interpolate(f, [0, 20, T.title, T.anatomy, T.barrier - 10, T.barrier, T.camps, T.camps + 200], [0.5, 1, 1, 0.55, 0.45, 0, 0.35, 0], clamp);
const windLevel = (f: number) =>
  interpolate(f, [T.camps + 80, T.camps + 270, T.summit + 120, T.whiteout, T.whiteout + 30], [0, 1, 1, 0.4, 0], clamp);
const snowLevel = (f: number) =>
  interpolate(f, [T.camps + 200, T.summit, T.summit + 100, T.whiteout - 10, T.whiteout + 20, T.whiteout + 40], [0, 0.35, 0.8, 1, 1, 0.25], clamp);

const RAIN_N = 170;
const SNOW_N = 260;
const WIND_N = 46;

/** Procedural weather pinned to absolute film time so it flows across cuts. */
export const Weather: React.FC = () => {
  const f = useCurrentFrame();
  const rain = rainLevel(f);
  const wind = windLevel(f);
  const snow = snowLevel(f);
  const lightBg = f >= T.whiteout + 30;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        {rain > 0 &&
          Array.from({ length: Math.round(RAIN_N * rain) }, (_, i) => {
            const speed = 42 + rnd(i, 2) * 30;
            const len = 40 + rnd(i, 3) * 70;
            const span = H + 300;
            const y = ((rnd(i, 1) * span + f * speed) % span) - 200;
            const x = rnd(i) * (W + 300) - 150 - y * 0.16;
            const near = rnd(i, 4);
            return (
              <line key={i} x1={x} y1={y} x2={x + len * 0.16} y2={y + len} stroke="#CFE6FA" strokeWidth={0.8 + near * 1.6} strokeLinecap="round" opacity={(0.12 + near * 0.4) * Math.min(1, rain * 1.4)} />
            );
          })}
        {wind > 0 &&
          Array.from({ length: Math.round(WIND_N * wind) }, (_, i) => {
            const speed = 70 + rnd(i, 6) * 60;
            const len = 180 + rnd(i, 7) * 420;
            const span = W + 900;
            const x = ((rnd(i, 5) * span + f * speed) % span) - 600;
            const y = rnd(i, 8) * H + Math.sin(f / 14 + i) * 18;
            return <line key={i} x1={x} y1={y} x2={x + len} y2={y - len * 0.05} stroke="#DCEBF7" strokeWidth={1 + rnd(i, 9) * 1.2} opacity={(0.05 + rnd(i, 10) * 0.16) * wind} strokeLinecap="round" />;
          })}
        {snow > 0 &&
          Array.from({ length: Math.round(SNOW_N * snow) }, (_, i) => {
            const near = rnd(i, 13);
            const fall = 1.4 + near * 3.2;
            const drift = (5 + near * 14) * (1 + wind * 1.5);
            const span = H + 80;
            const y = ((rnd(i, 11) * span + f * fall) % span) - 40;
            const x = ((rnd(i, 12) * (W + 400) + f * drift + Math.sin(f / 20 + i) * 30) % (W + 400)) - 200;
            return <circle key={i} cx={x} cy={y} r={1 + near * 4.5} fill={lightBg ? '#AFC0CF' : '#F4F8FB'} opacity={(0.25 + near * 0.65) * Math.min(1, snow * 1.3)} />;
          })}
      </svg>
    </AbsoluteFill>
  );
};

/** The whiteout: snow thickens until the frame is pure white, then the end card resolves out of it. */
export const Whiteout: React.FC = () => {
  const f = useCurrentFrame();
  const o = interpolate(f, [T.whiteout - 40, T.whiteout - 4, T.whiteout + 10, T.whiteout + 38], [0, 1, 1, 0], clamp);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, #FFFFFF 0%, ${SNOW} 70%)`, opacity: o }} />;
};

/* ------------------------------------------------------------------ contours */

const ringPath = (k: number, cx: number, cy: number, base: number, step: number) => {
  const r0 = base + k * step;
  const pts: string[] = [];
  for (let a = 0; a <= 144; a++) {
    const t = (a / 144) * Math.PI * 2;
    const r = r0 * (1 + 0.16 * Math.sin(3 * t + k * 0.42) + 0.09 * Math.sin(5 * t + 1.3 + k * 0.21) + 0.05 * Math.sin(9 * t + k * 0.9));
    pts.push(`${(cx + Math.cos(t) * r * 1.25).toFixed(1)},${(cy + Math.sin(t) * r).toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
};
const RINGS = Array.from({ length: 18 }, (_, k) => ringPath(k, 0, 0, 30, 62));

/** Topographic contour rings of an invented peak; `draw` 0→1 strokes them on from the summit outward. */
export const Contours: React.FC<{ x?: number; y?: number; scale?: number; draw?: number; opacity?: number; color?: string }> = ({
  x = W / 2,
  y = H / 2,
  scale = 1,
  draw = 1,
  opacity = 0.22,
  color = GLACIER,
}) => {
  const f = useCurrentFrame();
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity }}>
      <g transform={`translate(${x} ${y}) rotate(${f * 0.04}) scale(${scale})`}>
        {RINGS.map((d, k) => {
          const p = interpolate(draw * 18 - k * 0.6, [0, 3], [0, 1], clamp);
          return (
            <path key={k} d={d} fill="none" stroke={color} strokeWidth={k % 5 === 4 ? 1.8 : 0.9} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} opacity={k % 5 === 4 ? 1 : 0.6} />
          );
        })}
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ HUD */

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

const PROFILE_X0 = 140;
const PROFILE_X1 = 1780;
const PROFILE_Y = 1010;
const ridge = (x: number) => {
  const u = (x - PROFILE_X0) / (PROFILE_X1 - PROFILE_X0);
  return PROFILE_Y - (Math.pow(u, 1.35) * 70 + Math.sin(u * 23) * 5 * u + Math.sin(u * 61) * 2);
};
const RIDGE = Array.from({ length: 165 }, (_, i) => {
  const x = PROFILE_X0 + ((PROFILE_X1 - PROFILE_X0) * i) / 164;
  return `${x.toFixed(1)},${ridge(x).toFixed(1)}`;
});

const weatherWord = (f: number) => (f < T.camps + 120 ? '暴雨 RAIN' : f < T.summit - 40 ? '大风 GALE' : '降雪 SNOW');

/** Altimeter, temperature and route profile — the film's running "instrument panel". */
export const Hud: React.FC = () => {
  const f = useCurrentFrame();
  const vis = interpolate(f, [T.title + 10, T.title + 40, T.whiteout - 30, T.whiteout - 10], [0, 1, 1, 0], clamp);
  if (vis <= 0) return null;
  const alt = altitudeAt(f);
  const temp = Math.round(12 - alt * 0.0058);
  const u = alt / SUMMIT_ALT;
  const mx = PROFILE_X0 + (PROFILE_X1 - PROFILE_X0) * u;
  const done = RIDGE.slice(0, Math.max(2, Math.round(u * 164) + 1));
  const label: React.CSSProperties = { fontFamily: MONO, fontSize: 17, letterSpacing: '0.14em', color: FOG };
  return (
    <AbsoluteFill style={{ opacity: vis, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 72, top: 54, display: 'flex', alignItems: 'baseline', gap: 18 }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 24, letterSpacing: '0.2em', color: '#EAF4FC' }}>ALPINE 3L</span>
        <span style={label}>/ HARDSHELL</span>
      </div>
      <div style={{ position: 'absolute', right: 72, top: 46, display: 'flex', gap: 46, alignItems: 'flex-end' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={label}>TEMP</div>
          <div style={{ fontFamily: MONO, fontSize: 30, color: '#EAF4FC' }}>{temp > 0 ? '+' : ''}{temp}°C</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={label}>WX</div>
          <div style={{ fontFamily: CJK, fontSize: 26, color: '#EAF4FC', lineHeight: '38px' }}>{weatherWord(f)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={label}>ALT</div>
          <div style={{ fontFamily: MONO, fontSize: 44, color: GLACIER, lineHeight: 1 }}>
            {fmt(alt).padStart(5, ' ')}
            <span style={{ fontSize: 22, color: FOG }}> m</span>
          </div>
        </div>
      </div>
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <polyline points={RIDGE.join(' ')} fill="none" stroke="#FFFFFF" strokeOpacity={0.18} strokeWidth={1.5} />
        <polyline points={done.join(' ')} fill="none" stroke={GLACIER} strokeWidth={2.5} />
        {CAMP_ALTS.map((a, i) => {
          const cx = PROFILE_X0 + (PROFILE_X1 - PROFILE_X0) * (a / SUMMIT_ALT);
          const reached = alt >= a - 1;
          return (
            <g key={a}>
              <line x1={cx} x2={cx} y1={ridge(cx) - 6} y2={ridge(cx) - 22} stroke={reached ? GLACIER : '#FFFFFF'} strokeOpacity={reached ? 1 : 0.3} strokeWidth={1.5} />
              <text x={cx} y={ridge(cx) - 30} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={14} fill={reached ? GLACIER : '#FFFFFF'} fillOpacity={reached ? 1 : 0.35}>
                C{i + 1}
              </text>
            </g>
          );
        })}
        <text x={PROFILE_X1} y={ridge(PROFILE_X1) - 30} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={14} fill="#FFFFFF" fillOpacity={0.5}>
          ▲ {fmt(SUMMIT_ALT)}
        </text>
        <circle cx={mx} cy={ridge(mx)} r={14 + Math.sin(f / 6) * 3} fill={GLACIER} opacity={0.18} />
        <circle cx={mx} cy={ridge(mx)} r={6} fill="#FFFFFF" />
      </svg>
    </AbsoluteFill>
  );
};

/** Vignette + animated grain so photographic and vector layers sit in one world. */
export const Grain: React.FC<{ light?: boolean }> = ({ light }) => {
  const f = useCurrentFrame();
  const seed = f % 6;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill
        style={{
          background: light
            ? 'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(40,60,80,0.10) 100%)'
            : 'radial-gradient(ellipse at 50% 48%, transparent 45%, rgba(0,0,0,0.6) 100%)',
        }}
      />
      <svg width="100%" height="100%" style={{ position: 'absolute', opacity: light ? 0.05 : 0.08, mixBlendMode: 'overlay' }}>
        <filter id={`grain${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
