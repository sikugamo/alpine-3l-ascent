import React from 'react';
import { AbsoluteFill, Img, interpolate, useCurrentFrame } from 'remotion';
import { G, WARP_LEN } from '../genesis/scenes';
import { ICE, img } from '../launch/kit';
import { CJK, EXPO, MONO, SNAP, clamp } from '../theme';
import { AMBER, FAINT, LINE, Panel } from './chrome';

/* v4 information layers: one animated data overlay per chapter, timed in absolute frames and kept
   to the free space around each v3 shot. Every figure shown comes from the spec sheet. */

const ease = (f: number, at: number, dur = 20) => interpolate(f - at, [0, dur], [0, 1], { ...clamp, easing: EXPO });
const win = (f: number, a: number, b: number, fade = 8) => interpolate(f, [a, a + fade, b - fade, b], [0, 1, 1, 0], clamp);
const txt = (size = 12, color = ICE, spacing = '0.2em'): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, letterSpacing: spacing, color, whiteSpace: 'nowrap' });

// Same product geometry as the v3 scenes.
const JX = 960;
const JY = 560;
const JH = 800;
const JW = Math.round((777 / 1024) * JH);

/* ------------------------------------------------------------------ genesis: assembly ring */

const Assembly: React.FC<{ f: number }> = ({ f }) => {
  const o = win(f, 56, G.reveal - 2, 10);
  if (!o) return null;
  const prog = interpolate(f, [72, 150], [0, 1], clamp);
  const r = 430;
  const arc = 2 * Math.PI * r;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', opacity: o }}>
      <circle cx={JX} cy={JY} r={r} fill="none" stroke={FAINT} strokeWidth={1} />
      <circle cx={JX} cy={JY} r={r} fill="none" stroke={ICE} strokeWidth={3} strokeDasharray={`${arc * prog} ${arc}`} transform={`rotate(-90 ${JX} ${JY})`} style={{ filter: `drop-shadow(0 0 6px ${ICE})` }} />
      {Array.from({ length: 72 }, (_, i) => {
        const a = (i / 72) * Math.PI * 2 - Math.PI / 2;
        const on = i / 72 <= prog;
        return <line key={i} x1={JX + Math.cos(a) * (r + 10)} y1={JY + Math.sin(a) * (r + 10)} x2={JX + Math.cos(a) * (r + (i % 6 ? 16 : 26))} y2={JY + Math.sin(a) * (r + (i % 6 ? 16 : 26))} stroke={on ? ICE : FAINT} strokeWidth={1} />;
      })}
      <text x={JX + r * 0.72 + 24} y={JY - r * 0.72} fontFamily="JetBrains Mono" fontSize={13} fill={ICE} letterSpacing="0.2em">
        ASSEMBLY
      </text>
      <text x={JX + r * 0.72 + 24} y={JY - r * 0.72 + 34} fontFamily="Inter" fontWeight={800} fontSize={34} fill="#EAF6FF">
        {Math.round(prog * 100)}%
      </text>
      <text x={JX + r * 0.72 + 24} y={JY - r * 0.72 + 56} fontFamily="JetBrains Mono" fontSize={11} fill="rgba(234,246,255,0.55)" letterSpacing="0.15em">
        {Math.round(prog * 9000).toLocaleString('en-US')} / 9,000 PTS
      </text>
    </svg>
  );
};

/* ------------------------------------------------------------------ reveal: target acquired */

const Acquire: React.FC<{ f: number }> = ({ f }) => {
  const l = f - G.reveal;
  const o = win(f, G.reveal + 2, G.xray - 2, 10);
  if (!o) return null;
  const k = 1 - ease(l, 4, 18);
  const x0 = JX - JW / 2 - 30 - k * 160;
  const x1 = JX + JW / 2 + 30 + k * 160;
  const y0 = JY - JH / 2 + 40 - k * 80;
  const y1 = JY + JH / 2 - 10 + k * 80;
  const c = 36;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        {[
          [x0, y0, 1, 1],
          [x1, y0, -1, 1],
          [x0, y1, 1, -1],
          [x1, y1, -1, -1],
        ].map(([x, y, sx, sy], i) => (
          <path key={i} d={`M${x},${y + sy * c} L${x},${y} L${x + sx * c},${y}`} fill="none" stroke={ICE} strokeWidth={2} />
        ))}
        <line x1={x0} x2={x1} y1={y0 + (y1 - y0) * ((l * 0.012) % 1)} y2={y0 + (y1 - y0) * ((l * 0.012) % 1)} stroke={ICE} strokeOpacity={0.25} />
      </svg>
      <div style={{ position: 'absolute', left: x0, top: y1 + 12, opacity: ease(l, 20, 10) }}>
        <div style={txt(12, ICE)}>{l % 20 < 14 ? '■ TARGET ACQUIRED' : '□ TARGET ACQUIRED'}</div>
        <div style={txt(11, 'rgba(234,246,255,0.6)', '0.14em')}>CLASS 3L HARDSHELL · 冰川蓝 / 深岩黑</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ x-ray: scan depth ruler */

const ScanRuler: React.FC<{ f: number }> = ({ f }) => {
  const l = f - G.xray;
  const o = win(f, G.xray + 4, G.xray + 92, 6);
  const slabs = win(f, G.xray + 108, G.data - 2, 8);
  const scan = interpolate(l, [6, 86], [0, 1], { ...clamp, easing: SNAP });
  const top = JY - JH / 2;
  const y = top + scan * JH;
  return (
    <>
      {o > 0 && (
        <svg width={1920} height={1080} style={{ position: 'absolute', opacity: o }}>
          <line x1={JX - 470} x2={JX - 470} y1={top} y2={top + JH} stroke={FAINT} />
          {Array.from({ length: 41 }, (_, i) => (
            <line key={i} x1={JX - 470} x2={JX - 470 - (i % 5 ? 6 : 14)} y1={top + (i / 40) * JH} y2={top + (i / 40) * JH} stroke={top + (i / 40) * JH <= y ? LINE : FAINT} />
          ))}
          <path d={`M${JX - 466},${y} l14,-8 l0,16 z`} fill={ICE} />
          <text x={JX - 490} y={y + 4} textAnchor="end" fontFamily="JetBrains Mono" fontSize={11} fill={ICE} letterSpacing="0.15em">
            Y {String(Math.round(scan * 1000)).padStart(4, '0')}
          </text>
        </svg>
      )}
      {slabs > 0 && (
        <svg width={1920} height={1080} style={{ position: 'absolute', opacity: slabs }}>
          <g transform={`translate(960 560) rotate(${f * 0.8})`}>
            <circle r={420} fill="none" stroke={ICE} strokeOpacity={0.35} strokeDasharray="2 14" />
            <circle r={455} fill="none" stroke={ICE} strokeOpacity={0.2} strokeDasharray="60 30" />
          </g>
          <text x={960} y={1000} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={12} fill={ICE} letterSpacing="0.3em">
            {f - G.xray > 168 ? 'BOND · LOCKED' : 'LAYER SEPARATION · 3'}
          </text>
        </svg>
      )}
    </>
  );
};

/* ------------------------------------------------------------------ performance: spec charts */

const Chart: React.FC<{ f: number; at: number; x: number; title: string; value: string; curve: 'rise' | 'flow' }> = ({ f, at, x, title, value, curve }) => {
  const l = f - at;
  const p = ease(l, 0, 18) * interpolate(l, [80, 90], [1, 0], clamp);
  if (p <= 0) return null;
  const w = 440;
  const h = 160;
  const gx = 18;
  const gy = 40;
  const gw = w - 36;
  const gh = 92;
  const thr = gy + gh * 0.2;
  const draw = interpolate(l, [6, 56], [0, 1], { ...clamp, easing: EXPO });
  const pts = Array.from({ length: 61 }, (_, i) => {
    const u = i / 60;
    // Purely illustrative trace that climbs to (and holds at) the spec threshold.
    const v = curve === 'rise' ? Math.min(1, Math.pow(u * 1.25, 1.6)) : Math.min(1, u * 1.4) * (0.94 + 0.06 * Math.sin(u * 30 + l / 4));
    return `${gx + u * gw},${gy + gh - v * (gh - (thr - gy))}`;
  }).slice(0, Math.max(2, Math.round(draw * 61)));
  return (
    <Panel x={x} y={696} w={w} h={h} p={p} title={title}>
      <svg width={w} height={h} style={{ position: 'absolute' }}>
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1={gx} x2={gx + gw} y1={gy + (i * gh) / 4} y2={gy + (i * gh) / 4} stroke={FAINT} strokeDasharray="2 6" />
        ))}
        <line x1={gx} x2={gx + gw} y1={thr} y2={thr} stroke={AMBER} strokeDasharray="6 4" />
        <text x={gx + gw} y={thr - 6} textAnchor="end" fontFamily="JetBrains Mono" fontSize={11} fill={AMBER} letterSpacing="0.12em">
          SPEC {value}
        </text>
        <polyline points={pts.join(' ')} fill="none" stroke={ICE} strokeWidth={2} style={{ filter: `drop-shadow(0 0 4px ${ICE})` }} />
      </svg>
    </Panel>
  );
};

/* ------------------------------------------------------------------ details: mini-map + metadata */

const ZONES = [
  { u: 0.5, v: 0.55, zone: 'FRONT · 前中', spec: '防泼水反装尼龙拉链' },
  { u: 0.34, v: 0.3, zone: 'SEAMS · 接缝', spec: '全压胶防水处理' },
  { u: 0.42, v: 0.62, zone: 'SHELL · 外层', spec: '无氟 DWR · 洗后 ≥3 级' },
  { u: 0.22, v: 0.22, zone: 'SHOULDER · 肩肘', spec: '100D 耐磨尼龙' },
  { u: 0.5, v: 0.07, zone: 'HOOD · 风帽', spec: '三维立体可调节' },
  { u: 0.1, v: 0.94, zone: 'CUFF · 袖口', spec: '魔术贴调节' },
  { u: 0.5, v: 0.97, zone: 'HEM · 下摆', spec: '隐藏式抽绳调节' },
  { u: 0.62, v: 0.36, zone: 'POCKETS · 口袋', spec: '双胸袋 · 侧袋 · 袖袋' },
];

const DetailsInfo: React.FC<{ f: number }> = ({ f }) => {
  const o = win(f, G.warp, G.orbit, 10);
  if (!o) return null;
  const i = Math.min(7, Math.floor((f - G.warp) / WARP_LEN));
  const l = (f - G.warp) % WARP_LEN;
  const z = ZONES[i];
  const mw = 200;
  const mh = Math.round(mw * (1024 / 777));
  const pulse = (l % 15) / 15;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Panel x={70} y={330} w={mw + 36} h={mh + 70} p={ease(f, G.warp, 18)} title="ZONE MAP">
        <div style={{ position: 'absolute', left: 18, top: 36, width: mw, height: mh }}>
          <Img src={img('front')} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) brightness(1.4) sepia(1) hue-rotate(160deg) saturate(3)', opacity: 0.5 }} />
          <svg width={mw} height={mh} style={{ position: 'absolute', inset: 0 }}>
            {ZONES.map((q, k) => (
              <circle key={k} cx={q.u * mw} cy={q.v * mh} r={2.5} fill={k === i ? '#fff' : ICE} opacity={k === i ? 1 : 0.4} />
            ))}
            <circle cx={z.u * mw} cy={z.v * mh} r={6 + pulse * 18} fill="none" stroke={AMBER} opacity={1 - pulse} />
            <circle cx={z.u * mw} cy={z.v * mh} r={7} fill="none" stroke={AMBER} strokeWidth={1.5} />
          </svg>
        </div>
        <div style={{ position: 'absolute', left: 18, bottom: 12, ...txt(10, AMBER, '0.18em') }}>● {z.zone.split(' · ')[0]}</div>
      </Panel>
      <Panel x={1586} y={330} w={226} h={250} p={ease(f, G.warp + 4, 18)} title={`F-${String(i + 1).padStart(2, '0')} · META`}>
        {[
          ['ZONE', z.zone],
          ['SPEC', z.spec],
          ['STATUS', l > 16 ? 'VERIFIED' : 'SCANNING'],
        ].map(([k, v], r) => (
          <div key={k} style={{ position: 'absolute', left: 18, right: 14, top: 40 + r * 66, opacity: ease(l, 4 + r * 4, 8) }}>
            <div style={txt(10, 'rgba(234,246,255,0.5)', '0.2em')}>{k}</div>
            <div style={{ fontFamily: k === 'STATUS' ? MONO : CJK, fontSize: k === 'STATUS' ? 14 : 17, color: k === 'STATUS' ? (l > 16 ? '#7CF2B0' : AMBER) : '#EAF6FF', marginTop: 6, letterSpacing: k === 'STATUS' ? '0.2em' : '0.02em', whiteSpace: 'normal', lineHeight: 1.35 }}>{v}</div>
          </div>
        ))}
      </Panel>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ specs: material mix donut */

const MIX: Array<[string, number, string]> = [
  ['NYLON 尼龙', 65, ICE],
  ['PU', 12, '#EAF6FF'],
  ['POLY 聚酯', 23, '#4C7FA6'],
];

const MixDonut: React.FC<{ f: number }> = ({ f }) => {
  const o = win(f, G.orbit + 10, G.finale, 10);
  if (!o) return null;
  const grow = ease(f, G.orbit + 16, 40);
  const r = 46;
  const C = 2 * Math.PI * r;
  let acc = 0;
  return (
    <Panel x={1586} y={214} w={226} h={250} p={o} title="MASS MIX · 质量配比">
      <svg width={226} height={250} style={{ position: 'absolute' }}>
        <g transform="translate(113 104) rotate(-90)">
          <circle r={r} fill="none" stroke={FAINT} strokeWidth={14} />
          {MIX.map(([k, pct, col]) => {
            const len = (pct / 100) * C * grow;
            const el = <circle key={k} r={r} fill="none" stroke={col} strokeWidth={14} strokeDasharray={`${Math.max(0, len - 2)} ${C}`} strokeDashoffset={-acc} />;
            acc += (pct / 100) * C * grow;
            return el;
          })}
        </g>
        <text x={113} y={110} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={22} fill="#EAF6FF">
          3L
        </text>
      </svg>
      {MIX.map(([k, pct, col], i) => (
        <div key={k} style={{ position: 'absolute', left: 18, right: 18, top: 170 + i * 22, display: 'flex', justifyContent: 'space-between', ...txt(11, 'rgba(234,246,255,0.75)', '0.12em') }}>
          <span>
            <span style={{ color: col }}>■</span> {k}
          </span>
          <span>{Math.round(pct * grow)}%</span>
        </div>
      ))}
    </Panel>
  );
};

/* ------------------------------------------------------------------ finale: status → warning */

const FinaleStatus: React.FC<{ f: number }> = ({ f }) => {
  const l = f - G.finale;
  if (l < 0 || l > 124) return null;
  const nominal = win(l, 4, 60, 8);
  const warn = win(l, 60, 122, 4);
  const blink = l % 8 < 5;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: nominal }}>
        <div style={txt(13, '#7CF2B0', '0.5em')}>● ALL SYSTEMS NOMINAL</div>
      </div>
      {warn > 0 && (
        <AbsoluteFill style={{ opacity: warn }}>
          {/* Hazard frame: amber stripes crawl along the top and bottom edges. */}
          {[0, 1].map((k) => (
            <div key={k} style={{ position: 'absolute', left: 26, right: 26, top: k ? 1080 - 26 - 10 : 26, height: 10, backgroundImage: `repeating-linear-gradient(45deg, ${AMBER} 0 12px, transparent 12px 24px)`, backgroundPositionX: l * 2, opacity: 0.75 }} />
          ))}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center' }}>
            <div style={{ ...txt(30, AMBER, '0.5em'), opacity: blink ? 1 : 0.35, textShadow: `0 0 18px ${AMBER}` }}>⚠ CORE COLLAPSE</div>
            <div style={{ ...txt(12, 'rgba(255,181,71,0.75)', '0.3em'), marginTop: 10 }}>FIELD DENSITY {Math.min(999, Math.round(Math.pow((l - 60) / 60, 3) * 999)).toString().padStart(3, '0')} · HOLD</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ assembled */

export const InfoLayers: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <Assembly f={f} />
      <Acquire f={f} />
      <ScanRuler f={f} />
      <Chart f={f} at={G.data + 6} x={110} title="HYDROSTATIC HEAD · 防水" value="≥20,000 mm" curve="rise" />
      <Chart f={f} at={G.data + 96} x={1370} title="MVTR · 透湿" value="≥15,000 g/㎡·24h" curve="flow" />
      <DetailsInfo f={f} />
      <MixDonut f={f} />
      <FinaleStatus f={f} />
    </AbsoluteFill>
  );
};
