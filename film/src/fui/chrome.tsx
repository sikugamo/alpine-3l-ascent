import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { G } from '../genesis/scenes';
import { ICE } from '../launch/kit';
import { CJK, EXPO, MONO, clamp, rnd } from '../theme';

/* v4 "Interface": persistent FUI chrome, driven by absolute film time.
   Everything here lives in the frame's margins so the v3 picture underneath stays readable. */

export const AMBER = '#FFB547';
export const LINE = 'rgba(127,216,255,0.55)';
export const FAINT = 'rgba(127,216,255,0.22)';

export const CHAPTER_NAMES = ['GENESIS', 'REVEAL', 'X-RAY', 'PERFORMANCE', 'DETAILS', 'SPECS', 'FINALE'];
const STARTS = [G.genesis, G.reveal, G.xray, G.data, G.warp, G.orbit, G.finale, G.end];

export const chapterAt = (f: number) => Math.max(0, STARTS.findIndex((s, i) => f >= s && f < STARTS[i + 1]));

const ease = (f: number, at: number, dur = 20) => interpolate(f - at, [0, dur], [0, 1], { ...clamp, easing: EXPO });

/** Boot (draw-on) and shutdown envelope for the whole interface. */
export const power = (f: number) => ease(f, 0, 40) * interpolate(f, [G.end - 34, G.end - 8], [1, 0], clamp);

const txt = (size = 12, color = ICE, spacing = '0.22em'): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, letterSpacing: spacing, color, whiteSpace: 'nowrap' });

/* ------------------------------------------------------------------ frame */

/** Chamfered panel outline: drawn on from the top-left corner as `p` goes 0→1. */
export const Panel: React.FC<{ x: number; y: number; w: number; h: number; p: number; title?: string; children?: React.ReactNode; accent?: string }> = ({
  x,
  y,
  w,
  h,
  p,
  title,
  children,
  accent = ICE,
}) => {
  const c = 12;
  const d = `M${c},0 L${w},0 L${w},${h - c} L${w - c},${h} L0,${h} L0,${c} Z`;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h }}>
      <svg width={w} height={h} style={{ position: 'absolute', overflow: 'visible' }}>
        <path d={d} fill="rgba(5,14,22,0.55)" fillOpacity={p} stroke={LINE} strokeWidth={1} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
        <path d={`M0,${c} L${c},0 L${c + 40},0`} fill="none" stroke={accent} strokeWidth={2.5} opacity={p} />
        <rect x={w - 8} y={h - c - 18} width={3} height={12} fill={accent} opacity={p} />
      </svg>
      {title && <div style={{ position: 'absolute', left: 18, top: 9, ...txt(11, accent), opacity: p }}>{title}</div>}
      <div style={{ position: 'absolute', inset: 0, opacity: interpolate(p, [0.6, 1], [0, 1], clamp) }}>{children}</div>
    </div>
  );
};

const EdgeFrame: React.FC<{ f: number; p: number }> = ({ f, p }) => {
  const inset = 26;
  const W = 1920 - inset * 2;
  const H = 1080 - inset * 2;
  const shift = (f * 1.5) % 20;
  const ticks = (x0: number, x1: number, y: number, dir: number) =>
    Array.from({ length: Math.floor((x1 - x0) / 20) }, (_, i) => {
      const x = x0 + i * 20 + shift;
      const major = (i + Math.floor((f * 1.5) / 20)) % 5 === 0;
      return <line key={i} x1={x} x2={x} y1={y} y2={y + dir * (major ? 12 : 6)} stroke={major ? LINE : FAINT} strokeWidth={1} />;
    });
  const chapter = chapterAt(f);
  const prog = (f - STARTS[chapter]) / (STARTS[chapter + 1] - STARTS[chapter]);
  const railY = 220 + prog * 640;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', opacity: p }}>
      {/* Corner brackets grow out of each corner during boot. */}
      {[
        [inset, inset, 1, 1],
        [inset + W, inset, -1, 1],
        [inset, inset + H, 1, -1],
        [inset + W, inset + H, -1, -1],
      ].map(([x, y, sx, sy], i) => (
        <path key={i} d={`M${x},${y + sy * 70 * p} L${x},${y} L${x + sx * 70 * p},${y}`} fill="none" stroke={ICE} strokeWidth={2} />
      ))}
      <g opacity={p}>
        {ticks(560, 1360, inset, 1)}
        {ticks(560, 1360, inset + H, -1)}
        {/* Side rails: a marker slides down each rail as the chapter plays. */}
        <line x1={inset + 8} x2={inset + 8} y1={220} y2={860} stroke={FAINT} />
        <line x1={inset + W - 8} x2={inset + W - 8} y1={220} y2={860} stroke={FAINT} />
        {Array.from({ length: 17 }, (_, i) => (
          <g key={i}>
            <line x1={inset + 8} x2={inset + 16} y1={220 + i * 40} y2={220 + i * 40} stroke={FAINT} />
            <line x1={inset + W - 8} x2={inset + W - 16} y1={220 + i * 40} y2={220 + i * 40} stroke={FAINT} />
          </g>
        ))}
        <path d={`M${inset + 8},${railY} l12,-7 l0,14 z`} fill={ICE} />
        <path d={`M${inset + W - 8},${railY} l-12,-7 l0,14 z`} fill={ICE} />
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ corner modules */

const Ident: React.FC<{ f: number; p: number }> = ({ f, p }) => {
  const s = Math.floor(f / 30);
  const tc = `T+00:${String(s).padStart(2, '0')}:${String(f % 30).padStart(2, '0')}`;
  return (
    <Panel x={56} y={52} w={330} h={104} p={p} title="A3L · HARDSHELL FUI v4.0">
      <div style={{ position: 'absolute', left: 18, top: 34, ...txt(20, '#EAF6FF', '0.12em') }}>{CHAPTER_NAMES[chapterAt(f)]}</div>
      <div style={{ position: 'absolute', left: 18, top: 66, ...txt(11, 'rgba(234,246,255,0.6)') }}>{tc}</div>
      {/* Level meter that breathes with the score. */}
      <div style={{ position: 'absolute', right: 18, top: 40, display: 'flex', gap: 3, alignItems: 'flex-end', height: 40 }}>
        {Array.from({ length: 12 }, (_, i) => {
          const beat = Math.exp(-((f % 15) / 5));
          const h = 6 + (0.3 + 0.7 * rnd(i, Math.floor(f / 2))) * 30 * (0.5 + 0.5 * beat);
          return <div key={i} style={{ width: 4, height: h, background: i > 9 ? AMBER : ICE, opacity: 0.85 }} />;
        })}
      </div>
    </Panel>
  );
};

const TELEMETRY: Array<[string, string, number]> = [
  ['H₂O HEAD', '≥20,000 mm', 0.9],
  ['MVTR', '≥15,000 g/㎡·24h', 0.75],
  ['MASS · M', '620 g ±40', 0.45],
];

const Telemetry: React.FC<{ f: number; p: number }> = ({ f, p }) => (
  <Panel x={1920 - 56 - 360} y={52} w={360} h={134} p={p} title="TELEMETRY · SPEC">
    {TELEMETRY.map(([k, v, fill], i) => {
      const live = ease(f, 30 + i * 8, 30) * (0.96 + 0.04 * Math.sin(f / 4 + i * 2));
      return (
        <div key={k} style={{ position: 'absolute', left: 18, right: 18, top: 36 + i * 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', ...txt(11, 'rgba(234,246,255,0.65)', '0.14em') }}>
            <span>{k}</span>
            <span style={{ color: '#EAF6FF' }}>{v}</span>
          </div>
          <div style={{ height: 3, background: FAINT, marginTop: 5 }}>
            <div style={{ width: `${fill * live * 100}%`, height: 3, background: ICE, boxShadow: `0 0 6px ${ICE}` }} />
          </div>
        </div>
      );
    })}
  </Panel>
);

const Radar: React.FC<{ f: number; p: number }> = ({ f, p }) => {
  const cx = 128;
  const cy = 940;
  const r = 66;
  const sweep = (f * 4) % 360;
  const a = (sweep * Math.PI) / 180;
  const blips = Array.from({ length: 6 }, (_, i) => ({ ang: rnd(i, 70) * 360, d: 0.3 + rnd(i, 71) * 0.6 }));
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', opacity: p }}>
      <defs>
        <radialGradient id="radarFade">
          <stop offset="0" stopColor={ICE} stopOpacity={0.35} />
          <stop offset="1" stopColor={ICE} stopOpacity={0} />
        </radialGradient>
      </defs>
      {[1, 0.66, 0.33].map((k) => (
        <circle key={k} cx={cx} cy={cy} r={r * k} fill="none" stroke={FAINT} />
      ))}
      <line x1={cx - r} x2={cx + r} y1={cy} y2={cy} stroke={FAINT} />
      <line x1={cx} x2={cx} y1={cy - r} y2={cy + r} stroke={FAINT} />
      <path d={`M${cx},${cy} L${cx + Math.cos(a) * r},${cy + Math.sin(a) * r} A${r},${r} 0 0 0 ${cx + Math.cos(a - 0.7) * r},${cy + Math.sin(a - 0.7) * r} Z`} fill="url(#radarFade)" />
      <line x1={cx} y1={cy} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r} stroke={ICE} strokeWidth={1.5} />
      {blips.map((b, i) => {
        // A blip flares as the sweep passes it, then fades.
        const since = (((sweep - b.ang) % 360) + 360) % 360;
        const o = Math.max(0, 1 - since / 200);
        const ba = (b.ang * Math.PI) / 180;
        return <circle key={i} cx={cx + Math.cos(ba) * r * b.d} cy={cy + Math.sin(ba) * r * b.d} r={2.5} fill={i === 2 ? AMBER : ICE} opacity={o} />;
      })}
      <text x={cx + r + 14} y={cy - 40} fontFamily="JetBrains Mono" fontSize={11} fill={ICE} letterSpacing="0.2em">
        SCAN
      </text>
      <text x={cx + r + 14} y={cy - 22} fontFamily="JetBrains Mono" fontSize={18} fill="#EAF6FF">
        {String(Math.round(sweep)).padStart(3, '0')}°
      </text>
      <text x={cx + r + 14} y={cy - 4} fontFamily="JetBrains Mono" fontSize={10} fill="rgba(234,246,255,0.55)" letterSpacing="0.15em">
        WX · STORM CELL
      </text>
    </svg>
  );
};

// System log: each entry is pinned to the frame of the on-screen event it reports.
const LOG: Array<[number, string]> = [
  [0, 'BOOT SEQUENCE OK'],
  [50, 'SAMPLING SHELL GEOMETRY'],
  [112, 'PARTICLE FIELD STABLE'],
  [G.reveal + 10, 'TARGET LOCK · A3L'],
  [G.reveal + 50, 'CALLOUTS 04 PINNED'],
  [G.xray + 6, 'X-RAY PASS STARTED'],
  [G.xray + 92, 'LAYERS 3/3 RESOLVED'],
  [G.xray + 166, 'LAMINATE BONDED'],
  [G.data + 20, 'H2O HEAD ≥20,000 MM'],
  [G.data + 110, 'MVTR ≥15,000 G'],
  [G.warp + 20, 'FEATURE SCAN 01-04'],
  [G.warp + 200, 'FEATURE SCAN 05-08'],
  [G.warp + 340, 'ZONES 8/8 VERIFIED'],
  [G.orbit + 20, 'ORBIT SPEC SHEET'],
  [G.orbit + 70, 'MIX 65/12/23 CONFIRMED'],
  [G.finale + 6, 'ALL SYSTEMS NOMINAL'],
  [G.finale + 62, 'CORE COLLAPSE'],
  [G.finale + 120, 'SHOCKWAVE · REFORM'],
  [G.finale + 170, 'A3L ONLINE'],
  [G.end - 32, 'END OF TRANSMISSION'],
];

const Console: React.FC<{ f: number; p: number }> = ({ f, p }) => {
  const n = LOG.filter(([at]) => f >= at).length;
  const rows = LOG.slice(Math.max(0, n - 5), n);
  return (
    <Panel x={1920 - 56 - 360} y={870} w={360} h={150} p={p} title="SYS.LOG">
      {rows.map(([at, l], i) => {
        const idx = Math.max(0, n - 5) + i;
        const fresh = idx === n - 1;
        const chars = Math.floor((f - at) * 1.6);
        const warn = l.startsWith('CORE');
        return (
          <div key={idx} style={{ position: 'absolute', left: 18, top: 32 + i * 22, ...txt(11, warn ? AMBER : fresh ? '#EAF6FF' : 'rgba(234,246,255,0.5)', '0.12em') }}>
            {`[${String(idx).padStart(2, '0')}] `}
            {l.slice(0, chars)}
            {fresh && chars < l.length && f % 8 < 4 ? '█' : ''}
          </div>
        );
      })}
    </Panel>
  );
};

const HexStream: React.FC<{ f: number; p: number }> = ({ f, p }) => {
  const rows = 30;
  const off = Math.floor(f / 2);
  return (
    <div style={{ position: 'absolute', right: 62, top: 230, width: 40, opacity: p * 0.45, ...txt(9, ICE, '0.05em'), lineHeight: '21px', textAlign: 'right' }}>
      {Array.from({ length: rows }, (_, i) => {
        const v = Math.floor(rnd(i + off, 80) * 0xffff);
        return <div key={i}>{v.toString(16).toUpperCase().padStart(4, '0')}</div>;
      })}
    </div>
  );
};

const Timeline: React.FC<{ f: number; p: number }> = ({ f, p }) => {
  const x0 = 520;
  const w = 880;
  const seg = (w - 6 * 6) / 7;
  const cur = chapterAt(f);
  return (
    <div style={{ position: 'absolute', left: x0, top: 1032, width: w, height: 22, opacity: p }}>
      {CHAPTER_NAMES.map((n, i) => {
        const fill = i < cur ? 1 : i > cur ? 0 : (f - STARTS[i]) / (STARTS[i + 1] - STARTS[i]);
        return (
          <div key={n} style={{ position: 'absolute', left: i * (seg + 6), top: 0, width: seg }}>
            <div style={{ height: 3, background: FAINT }}>
              <div style={{ width: `${fill * 100}%`, height: 3, background: i === cur ? ICE : 'rgba(127,216,255,0.6)' }} />
            </div>
            <div style={{ marginTop: 5, ...txt(9, i === cur ? ICE : 'rgba(234,246,255,0.35)', '0.2em') }}>
              {String(i).padStart(2, '0')} {n}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ reticle */

// Point of interest per chapter; the reticle glides between them and re-locks.
const TARGETS: Array<[number, number, string]> = [
  [960, 560, 'ASSEMBLY'],
  [960, 270, 'HOOD'],
  [960, 520, 'LAMINATE'],
  [960, 330, 'H₂O HEAD'],
  [960, 450, 'FEATURE'],
  [960, 560, 'SPEC ORBIT'],
  [960, 560, 'CORE'],
];

const Reticle: React.FC<{ f: number; p: number }> = ({ f, p }) => {
  const c = chapterAt(f);
  const prev = TARGETS[Math.max(0, c - 1)];
  const cur = TARGETS[c];
  const t = ease(f, STARTS[c], 18);
  const x = prev[0] + (cur[0] - prev[0]) * t;
  const y = prev[1] + (cur[1] - prev[1]) * t;
  // Brackets snap in from wide to tight on each new lock.
  const s = 90 - 50 * ease(f, STARTS[c] + 6, 14);
  const spin = f * 1.2;
  const warn = c === 6 && f > G.finale + 60 && f < G.finale + 120;
  const col = warn ? AMBER : ICE;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', opacity: p * 0.75 }}>
      <g transform={`translate(${x} ${y})`}>
        <circle r={s * 0.7} fill="none" stroke={col} strokeOpacity={0.5} strokeDasharray="6 10" transform={`rotate(${spin})`} />
        {[0, 90, 180, 270].map((r) => (
          <path key={r} d={`M${s},${-s + 14} L${s},${-s} L${s - 14},${-s}`} fill="none" stroke={col} strokeWidth={1.8} transform={`rotate(${r})`} />
        ))}
        <line x1={-8} x2={8} y1={0} y2={0} stroke={col} />
        <line x1={0} x2={0} y1={-8} y2={8} stroke={col} />
        <text x={s + 10} y={-s + 10} fontFamily="JetBrains Mono" fontSize={11} fill={col} letterSpacing="0.2em">
          {warn ? '⚠ CORE COLLAPSE' : `LOCK · ${cur[2]}`}
        </text>
        <text x={s + 10} y={-s + 26} fontFamily="JetBrains Mono" fontSize={10} fill="rgba(234,246,255,0.55)" letterSpacing="0.1em">
          X{String(Math.round(x)).padStart(4, '0')} Y{String(Math.round(y)).padStart(4, '0')}
        </text>
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ assembled */

export const Chrome: React.FC = () => {
  const f = useCurrentFrame();
  const p = power(f);
  if (p <= 0) return null;
  const mod = (delay: number) => ease(f, delay, 26) * interpolate(f, [G.end - 34, G.end - 8], [1, 0], clamp);
  // The radar sits where the Genesis boot log is, so it powers up once that log is gone.
  const radarP = ease(f, G.reveal, 24) * interpolate(f, [G.end - 34, G.end - 8], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <EdgeFrame f={f} p={p} />
      <Ident f={f} p={mod(10)} />
      <Telemetry f={f} p={mod(18)} />
      <Console f={f} p={mod(26)} />
      <Radar f={f} p={radarP} />
      <HexStream f={f} p={mod(34)} />
      <Timeline f={f} p={mod(30)} />
      <Reticle f={f} p={ease(f, 40, 20) * interpolate(f, [G.finale + 116, G.finale + 124], [1, 0], clamp)} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 930, textAlign: 'center', fontFamily: CJK, fontSize: 14, letterSpacing: '0.6em', color: ICE, opacity: interpolate(f, [G.end - 30, G.end - 20, G.end - 6, G.end], [0, 1, 1, 0], clamp) }}>
        {f % 10 < 6 ? 'SESSION END' : ''}
      </div>
    </AbsoluteFill>
  );
};
