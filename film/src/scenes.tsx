import React from 'react';
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { CAMP_ALTS, Contours } from './fx';
import { CAMP_LEN, CJK, EXPO, FOG, GLACIER, GLACIER_SOFT, H, INK, MONO, NIGHT, NIGHT_2, SANS, SNAP, SNOW, W, clamp, rnd } from './theme';

/* ------------------------------------------------------------------ helpers */

const img = (name: string) => staticFile(name.endsWith('.png') ? `img/${name}` : `img/${name}.jpg`);

const rise = (frame: number, at: number, dist = 40, dur = 24) => {
  const p = interpolate(frame - at, [0, dur], [0, 1], { ...clamp, easing: EXPO });
  return { opacity: p, transform: `translateY(${(1 - p) * dist}px)` };
};

const fadeOut = (frame: number, start: number, dur = 12) => interpolate(frame, [start, start + dur], [1, 0], clamp);

/** Text that appears character by character, like a weather teleprinter. */
const Typed: React.FC<{ text: string; at: number; cps?: number; style?: React.CSSProperties }> = ({ text, at, cps = 1.4, style }) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.floor((frame - at) * cps));
  if (n <= 0) return null;
  const caret = n < text.length && frame % 8 < 5;
  return (
    <div style={style}>
      {text.slice(0, n)}
      {caret ? '▍' : ''}
    </div>
  );
};

/** Masked line that slides up into view. */
const Wipe: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; dur?: number }> = ({ at, children, style, dur = 26 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - at, [0, dur], [0, 1], { ...clamp, easing: EXPO });
  return (
    <div style={{ overflow: 'hidden', ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 105}%)` }}>{children}</div>
    </div>
  );
};

const counter = (frame: number, at: number, to: number, dur = 40) =>
  Math.round(to * interpolate(frame - at, [0, dur], [0, 1], { ...clamp, easing: EXPO })).toLocaleString('en-US');

const Backdrop: React.FC<{ glow?: string }> = ({ glow = 'rgba(93,179,238,0.10)' }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 62% 40%, ${glow} 0%, transparent 55%), linear-gradient(180deg, ${NIGHT_2} 0%, ${NIGHT} 70%)` }} />
);

/* ------------------------------------------------------------------ 1 · storm */

const FORECAST = [
  ['降水 PRECIP', '暴雨 HEAVY'],
  ['风力 WIND', '强阵风 GUSTING'],
  ['目标 TARGET', '海拔 5,200 m'],
];

export const SceneStorm: React.FC = () => {
  const frame = useCurrentFrame();
  // Two lightning strokes; the jacket is glimpsed only by their light.
  const flash = interpolate(frame, [44, 46, 49, 52, 54, 62], [0, 1, 0.25, 0.8, 0.5, 0], clamp);
  const out = fadeOut(frame, 136, 14);
  return (
    <AbsoluteFill style={{ background: '#05090D', opacity: out }}>
      <AbsoluteFill style={{ opacity: flash * 0.55 }}>
        <Img src={img('front')} style={{ position: 'absolute', left: W / 2 - 520, top: -60, height: 1300, filter: 'grayscale(0.4) contrast(1.4) brightness(1.3)' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: '#DCEBFA', opacity: flash * 0.35, mixBlendMode: 'screen' }} />
      <div style={{ position: 'absolute', left: 96, top: 90, fontFamily: MONO, fontSize: 20, letterSpacing: '0.12em', color: FOG, opacity: fadeOut(frame, 70, 16) }}>
        <Typed text="// FORECAST · 山区天气预报" at={4} style={{ color: GLACIER, marginBottom: 18 }} />
        {FORECAST.map(([k, v], i) => (
          <Typed key={k} text={`${k.padEnd(14, '·')} ${v}`} at={14 + i * 12} cps={2} style={{ marginBottom: 8 }} />
        ))}
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', fontFamily: CJK, fontWeight: 700, fontSize: 132, color: '#F2F7FB', letterSpacing: '0.04em' }}>
          <Wipe at={72}>天气，</Wipe>
          <Wipe at={84}>
            才是真正的<span style={{ color: GLACIER }}>考场</span>。
          </Wipe>
        </div>
        <div style={{ ...rise(frame, 100, 20), fontFamily: MONO, fontSize: 24, letterSpacing: '0.42em', color: FOG, marginTop: 26 }}>THE WEATHER IS THE TEST</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 2 · title */

export const SceneTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 120], [1.3, 1.16]);
  const inP = interpolate(frame, [0, 18], [0, 1], clamp);
  const out = fadeOut(frame, 108, 12);
  return (
    <AbsoluteFill style={{ background: NIGHT, opacity: out }}>
      <AbsoluteFill style={{ opacity: inP }}>
        <Img src={img('shell-blue')} style={{ position: 'absolute', width: W, height: W, top: (H - W) / 2, objectFit: 'cover', transform: `scale(${zoom}) rotate(-4deg)`, filter: 'brightness(0.55) saturate(1.15)' }} />
        <AbsoluteFill style={{ background: `linear-gradient(90deg, ${NIGHT}F2 0%, ${NIGHT}B0 45%, transparent 85%)` }} />
      </AbsoluteFill>
      <Contours x={1500} y={560} scale={1.1} draw={interpolate(frame, [6, 90], [0, 1], clamp)} opacity={0.28} />
      <div style={{ position: 'absolute', left: 140, top: 330 }}>
        <div style={{ ...rise(frame, 10, 16), fontFamily: MONO, fontSize: 22, letterSpacing: '0.3em', color: GLACIER }}>3-LAYER HARDSHELL · 专业户外三层硬壳</div>
        <div style={{ display: 'flex', fontFamily: SANS, fontWeight: 800, fontSize: 250, lineHeight: 1.05, letterSpacing: '-0.02em', color: '#F4F8FB', marginTop: 10 }}>
          {'ALPINE'.split('').map((c, i) => (
            <Wipe key={i} at={14 + i * 3} dur={30}>
              {c}
            </Wipe>
          ))}
          <Wipe at={40} dur={30} style={{ marginLeft: 40 }}>
            <span style={{ color: GLACIER }}>3L</span>
          </Wipe>
        </div>
        <div style={{ ...rise(frame, 46, 24), fontFamily: CJK, fontWeight: 700, fontSize: 64, color: '#EAF4FC', letterSpacing: '0.12em', marginTop: 8 }}>高性能登山冲锋衣</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 3 · anatomy */

const LAYERS = [
  { src: 'knit-20d', no: '03', name: '内层 LINER', spec: '20D 聚酯针织底布', note: '100% 聚酯纤维 · 贴肤顺滑' },
  { src: 'pu-membrane-alpha.png', no: '02', name: '中层 MEMBRANE', spec: '聚醚 PU 防水透湿膜', note: '亲水型 · 挡住雨水 · 放走湿气', screen: true },
  { src: 'shell-blue', no: '01', name: '外层 SHELL', spec: '70D 高密度尼龙 6', note: 'Mini Ripstop 防撕裂结构' },
];
const MIX = [
  { label: '尼龙 Nylon', pct: 65, color: GLACIER },
  { label: 'PU', pct: 12, color: '#E8EEF3' },
  { label: '聚酯 Poly', pct: 23, color: '#6E7A86' },
];

export const SceneAnatomy: React.FC = () => {
  const frame = useCurrentFrame();
  const sep = interpolate(frame, [12, 60, 150, 172], [0, 1, 1, 0], { ...clamp, easing: SNAP });
  const enter = interpolate(frame, [0, 26], [0, 1], { ...clamp, easing: EXPO });
  const out = fadeOut(frame, 198, 12);
  const cx = 1050;
  const cy = 560;
  const gap = 150;
  // After the stack slams shut, the whole sandwich pulses once.
  const slam = interpolate(frame, [172, 176, 190], [0, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <Contours x={cx} y={cy} scale={1.3} opacity={0.12} />
      <div style={{ position: 'absolute', left: 120, top: 250 }}>
        <div style={{ ...rise(frame, 4), fontFamily: SANS, fontWeight: 800, fontSize: 260, lineHeight: 0.9, color: 'transparent', WebkitTextStroke: `3px ${GLACIER}` }}>3L</div>
        <div style={{ ...rise(frame, 10), fontFamily: CJK, fontWeight: 700, fontSize: 58, color: '#F2F7FB', marginTop: 24 }}>三层复合，一体压合</div>
        <div style={{ ...rise(frame, 16), fontFamily: MONO, fontSize: 20, letterSpacing: '0.2em', color: FOG, marginTop: 16 }}>3-LAYER LAMINATE</div>
      </div>
      <div style={{ position: 'absolute', left: cx - 300, top: cy - 300, width: 600, height: 600, perspective: 2600, opacity: enter, transform: `scale(${0.85 * (0.9 + enter * 0.1 + slam * 0.03)})` }}>
        {LAYERS.map((l, i) => (
          <div
            key={l.src}
            style={{
              position: 'absolute',
              inset: 0,
              transform: `translateY(${(1 - i) * gap * sep}px) rotateX(58deg) rotateZ(-42deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            <Img src={img(l.src)} style={{ width: 600, height: 600, objectFit: 'cover', borderRadius: 10, boxShadow: l.screen ? 'none' : '0 40px 80px rgba(0,0,0,0.55)', filter: 'none' }} />
          </div>
        ))}
      </div>
      {LAYERS.map((l, i) => {
        const y = cy + (1 - i) * gap * sep - 20;
        const at = 52 + (2 - i) * 12;
        const p = interpolate(frame - at, [0, 20], [0, 1], { ...clamp, easing: EXPO }) * fadeOut(frame, 146, 10);
        return (
          <div key={l.no} style={{ position: 'absolute', left: 1420, top: y - 40, whiteSpace: 'nowrap', opacity: p, display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 70 * p, height: 1.5, background: GLACIER, marginRight: 20 }} />
            <div>
              <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: '0.16em', color: GLACIER }}>
                {l.no} · {l.name}
              </div>
              <div style={{ fontFamily: CJK, fontWeight: 700, fontSize: 34, color: '#F2F7FB', marginTop: 4 }}>{l.spec}</div>
              <div style={{ fontFamily: CJK, fontSize: 22, color: FOG, marginTop: 2 }}>{l.note}</div>
            </div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 1440, top: 330, width: 400, ...rise(frame, 176, 30) }}>
        <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: '0.16em', color: GLACIER }}>复合面料克重 FABRIC WEIGHT</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 120, color: '#F4F8FB', lineHeight: 1.05 }}>
          185<span style={{ fontSize: 44, color: FOG }}> g/㎡</span>
        </div>
        <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', marginTop: 18 }}>
          {MIX.map((m, i) => (
            <div key={m.label} style={{ width: `${m.pct * interpolate(frame - 182 - i * 4, [0, 16], [0, 1], clamp)}%`, background: m.color }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 15, color: FOG, marginTop: 12, whiteSpace: 'nowrap' }}>
          {MIX.map((m) => (
            <span key={m.label}>
              <span style={{ color: m.color }}>■</span> {m.label} {m.pct}%
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 4 · barrier */

const MEMBRANE_Y = 560;

export const SceneBarrier: React.FC = () => {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [0, 24], [0, 1], { ...clamp, easing: EXPO });
  const out = fadeOut(frame, 198, 12);
  const fill = interpolate(frame, [26, 96], [0, 1], { ...clamp, easing: EXPO });
  const tubeTop = 170;
  const tubeBot = MEMBRANE_Y - 30;
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, #0A121A 0%, #101B26 ${(MEMBRANE_Y / H) * 100}%, #1A1714 100%)` }} />
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="above">
            <rect x={0} y={0} width={W} height={MEMBRANE_Y - 4} />
          </clipPath>
          <linearGradient id="mem" x1="0" x2="1">
            <stop offset="0" stopColor={GLACIER} stopOpacity={0} />
            <stop offset="0.5" stopColor={GLACIER_SOFT} stopOpacity={1} />
            <stop offset="1" stopColor={GLACIER} stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Rain: stopped dead at the membrane. */}
        <g clipPath="url(#above)" opacity={interpolate(frame, [8, 24], [0, 1], clamp)}>
          {Array.from({ length: 120 }, (_, i) => {
            const speed = 40 + rnd(i, 2) * 26;
            const len = 40 + rnd(i, 3) * 60;
            const span = MEMBRANE_Y + 260;
            const y = ((rnd(i, 1) * span + frame * speed) % span) - 200;
            const x = rnd(i) * (W + 200) - 100 - y * 0.14;
            return <line key={i} x1={x} y1={y} x2={x + len * 0.14} y2={y + len} stroke="#CFE6FA" strokeWidth={1 + rnd(i, 4) * 1.4} opacity={0.2 + rnd(i, 4) * 0.4} strokeLinecap="round" />;
          })}
        </g>
        {/* Splashes along the surface. */}
        {frame > 12 &&
          Array.from({ length: 34 }, (_, j) => {
            const P = 16;
            const t = frame + rnd(j, 20) * P;
            const age = t % P;
            const x = rnd(j, Math.floor(t / P) + 40) * W;
            return <ellipse key={j} cx={x} cy={MEMBRANE_Y - 6} rx={3 + age * 2.6} ry={1 + age * 0.55} fill="none" stroke="#CFE6FA" strokeWidth={1.2} opacity={(1 - age / P) * 0.7} />;
          })}
        {/* Body vapour: passes straight through and keeps rising. */}
        {Array.from({ length: 90 }, (_, i) => {
          const at = 64;
          const speed = 2.2 + rnd(i, 30) * 2.8;
          const span = H - 220;
          const y = H - (((rnd(i, 31) * span + Math.max(0, frame - at) * speed) % span) + 60);
          const x = rnd(i, 32) * W + Math.sin(frame / 18 + i) * 14;
          const vis = interpolate(frame, [at, at + 20], [0, 1], clamp) * interpolate(y, [180, 420], [0, 1], clamp);
          return <circle key={i} cx={x} cy={y} r={2 + rnd(i, 33) * 5} fill="#F6E9D8" opacity={vis * (0.18 + rnd(i, 34) * 0.4)} />;
        })}
        <rect x={0} y={MEMBRANE_Y - 3} width={W * line} height={6} fill="url(#mem)" />
        <rect x={0} y={MEMBRANE_Y - 18} width={W * line} height={36} fill={GLACIER} opacity={0.07} />
        {/* Water column gauge: 20,000 mm is a 20 m column of water pressing on the fabric. */}
        <g opacity={interpolate(frame, [20, 36], [0, 1], clamp)}>
          <rect x={1590} y={tubeTop} width={70} height={tubeBot - tubeTop} rx={10} fill="none" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={2} />
          <rect x={1596} y={tubeBot - (tubeBot - tubeTop - 12) * fill} width={58} height={(tubeBot - tubeTop - 12) * fill + 6} rx={6} fill={GLACIER} opacity={0.75} />
          {[0, 5, 10, 15, 20].map((m) => {
            const yy = tubeBot - 6 - ((tubeBot - tubeTop - 12) * m) / 20;
            return (
              <g key={m}>
                <line x1={1670} x2={1690} y1={yy} y2={yy} stroke="#FFFFFF" strokeOpacity={0.5} />
                <text x={1700} y={yy + 6} fontFamily="JetBrains Mono" fontSize={17} fill="#FFFFFF" fillOpacity={0.6}>
                  {m} m
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      <div style={{ position: 'absolute', right: W - 1560, top: tubeTop - 8, textAlign: 'right', ...rise(frame, 70, 16) }}>
        <div style={{ fontFamily: CJK, fontSize: 24, color: '#EAF4FC' }}>≈ 20 米静水柱压力</div>
        <div style={{ fontFamily: MONO, fontSize: 16, color: FOG, letterSpacing: '0.12em' }}>20 m WATER COLUMN</div>
      </div>
      <div style={{ position: 'absolute', left: 120, top: 190 }}>
        <div style={{ ...rise(frame, 18), fontFamily: MONO, fontSize: 20, letterSpacing: '0.18em', color: GLACIER }}>防水指数 WATERPROOF</div>
        <div style={{ ...rise(frame, 20), fontFamily: SANS, fontWeight: 800, fontSize: 150, lineHeight: 1, color: '#F4F8FB', fontVariantNumeric: 'tabular-nums' }}>
          ≥{counter(frame, 22, 20000, 50)}
          <span style={{ fontSize: 46, color: FOG }}> mm H₂O</span>
        </div>
        <div style={{ ...rise(frame, 40), fontFamily: CJK, fontWeight: 700, fontSize: 52, color: '#EAF4FC', marginTop: 10 }}>雨，进不来。</div>
      </div>
      <div style={{ position: 'absolute', left: 120, top: 620 }}>
        <div style={{ ...rise(frame, 84), fontFamily: MONO, fontSize: 20, letterSpacing: '0.18em', color: '#F2C99A' }}>透湿指数 BREATHABILITY · JIS B-1</div>
        <div style={{ ...rise(frame, 86), fontFamily: SANS, fontWeight: 800, fontSize: 150, lineHeight: 1, color: '#F4F8FB', fontVariantNumeric: 'tabular-nums' }}>
          ≥{counter(frame, 88, 15000, 50)}
          <span style={{ fontSize: 46, color: FOG }}> g/㎡·24h</span>
        </div>
        <div style={{ ...rise(frame, 106), fontFamily: CJK, fontWeight: 700, fontSize: 52, color: '#EAF4FC', marginTop: 10 }}>汗，出得去。</div>
      </div>
      <div style={{ position: 'absolute', right: 80, top: MEMBRANE_Y + 22, fontFamily: MONO, fontSize: 16, letterSpacing: '0.16em', color: GLACIER_SOFT, opacity: interpolate(frame, [30, 46], [0, 1], clamp) }}>
        ── 亲水型聚醚 PU 膜 · 防风型复合膜结构
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 5 · camps */

type Card = { src: string; x: number; y: number; w: number; h: number; cap?: string; chip?: string };
type Camp = { title: string; en: string; line: string; cards: Card[]; stat?: { big: string; unit: string; note: string } };

const CAMPS: Camp[] = [
  {
    title: '封住每一滴雨',
    en: 'STORMPROOF',
    line: '三道防线，从拉链到接缝。',
    cards: [
      { src: 'main-zip', x: 780, y: 190, w: 520, h: 428, cap: '01  防泼水反装尼龙主拉链' },
      { src: 'seam-tape', x: 1330, y: 190, w: 510, h: 300, cap: '02  全压胶接缝 · 热压防水胶条' },
      { src: 'dwr-beads', x: 1330, y: 552, w: 510, h: 290, cap: '03  无氟 DWR · 洗前≥4级 / 洗后≥3级' },
    ],
  },
  {
    title: '扛得住岩壁',
    en: 'ABRASION ARMOR',
    line: '高磨损部位，换上更硬的料。',
    cards: [
      { src: 'black-reinforce', x: 780, y: 190, w: 640, h: 356, cap: '100D 耐磨尼龙 · 肩部 / 肘部加强' },
      { src: 'black-100d', x: 1450, y: 190, w: 390, h: 356 },
    ],
    stat: { big: '≥20,000', unit: '次', note: '耐磨性能 · 研发目标 R&D TARGET' },
  },
  {
    title: '锁住体温',
    en: 'SEAL THE GAPS',
    line: '风帽、袖口、下摆，三处可调。',
    cards: [
      { src: 'hood-toggle', x: 1080, y: 160, w: 760, h: 236, chip: '三维立体可调节风帽 · 抽绳调节扣' },
      { src: 'cuff-velcro', x: 1080, y: 412, w: 760, h: 236, chip: '魔术贴袖口调节' },
      { src: 'hem-cord', x: 1080, y: 664, w: 760, h: 236, chip: '隐藏式下摆抽绳' },
    ],
  },
  {
    title: '装得下所需',
    en: 'CARRY WHAT MATTERS',
    line: '双胸袋 · 侧袋 · 袖部功能袋。',
    cards: [
      { src: 'side-pocket', x: 780, y: 250, w: 520, h: 348, cap: '侧边收纳口袋' },
      { src: 'sleeve-pocket', x: 1320, y: 250, w: 520, h: 348, cap: '袖部拉链功能袋' },
    ],
  },
];

const CampCard: React.FC<{ c: Card; at: number }> = ({ c, at }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - at, [0, 22], [0, 1], { ...clamp, easing: EXPO });
  const zoom = interpolate(frame, [0, CAMP_LEN], [1.12, 1.02]);
  return (
    <div style={{ position: 'absolute', left: c.x, top: c.y - (1 - p) * 60, width: c.w, opacity: p }}>
      <div style={{ width: c.w, height: c.h, overflow: 'hidden', borderRadius: 6, boxShadow: '0 30px 60px rgba(0,0,0,0.5)', position: 'relative' }}>
        <Img src={img(c.src)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})` }} />
        {c.chip && (
          <div style={{ position: 'absolute', left: 18, bottom: 16, padding: '6px 14px', background: 'rgba(8,14,20,0.72)', borderLeft: `3px solid ${GLACIER}`, fontFamily: CJK, fontSize: 24, color: '#F2F7FB' }}>{c.chip}</div>
        )}
      </div>
      {c.cap && <div style={{ fontFamily: CJK, fontSize: 23, color: '#DCE7F0', marginTop: 12, letterSpacing: '0.02em' }}>{c.cap}</div>}
    </div>
  );
};

/** One waypoint of the climb. The camera moves up, so each camp drops in from above and leaves downward. */
const CampView: React.FC<{ i: number; alt: number }> = ({ i, alt }) => {
  const frame = useCurrentFrame();
  const camp = CAMPS[i];
  const enter = interpolate(frame, [0, 20], [0, 1], { ...clamp, easing: EXPO });
  const exit = interpolate(frame, [CAMP_LEN - 10, CAMP_LEN], [0, 1], { ...clamp, easing: SNAP });
  const shift = (1 - enter) * -140 + exit * 220;
  return (
    <AbsoluteFill style={{ transform: `translateY(${shift}px)`, opacity: Math.min(enter, 1 - exit) }}>
      <div style={{ position: 'absolute', left: 110, top: 230, width: i === 2 ? 900 : 620 }}>
        <div style={{ ...rise(frame, 2, 20), fontFamily: MONO, fontSize: 20, letterSpacing: '0.18em', color: GLACIER }}>
          CAMP 0{i + 1} — {alt.toLocaleString('en-US')} m
        </div>
        <div style={{ ...rise(frame, 5, 30), fontFamily: CJK, fontWeight: 700, fontSize: 84, color: '#F4F8FB', marginTop: 12, lineHeight: 1.1 }}>{camp.title}</div>
        <div style={{ ...rise(frame, 8, 30), fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.3em', color: FOG, marginTop: 12 }}>{camp.en}</div>
        <div style={{ ...rise(frame, 12, 30), width: 64, height: 3, background: GLACIER, margin: '30px 0 26px' }} />
        <div style={{ ...rise(frame, 14, 30), fontFamily: CJK, fontSize: 30, color: '#DCE7F0', lineHeight: 1.5, width: i === 2 ? 900 : 600 }}>{camp.line}</div>
      </div>
      {camp.cards.map((c, k) => (
        <CampCard key={c.src} c={c} at={8 + k * 7} />
      ))}
      {camp.stat && (
        <div style={{ position: 'absolute', left: 780, top: 640, display: 'flex', alignItems: 'baseline', gap: 22, ...rise(frame, 26, 30) }}>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 150, color: '#F4F8FB', lineHeight: 1 }}>{camp.stat.big}</span>
          <span style={{ fontFamily: CJK, fontWeight: 700, fontSize: 52, color: GLACIER }}>{camp.stat.unit}</span>
          <span style={{ fontFamily: MONO, fontSize: 20, color: FOG, letterSpacing: '0.1em', marginLeft: 12, whiteSpace: 'nowrap' }}>{camp.stat.note}</span>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const SceneCamps: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Backdrop glow="rgba(93,179,238,0.07)" />
      {/* Contours drift downward continuously: we are climbing past them. */}
      <Contours x={1300} y={560 + frame * 1.6} scale={1.5} opacity={0.1} />
      {CAMPS.map((_, i) => (
        <Sequence key={i} from={i * CAMP_LEN} durationInFrames={CAMP_LEN}>
          <CampView i={i} alt={CAMP_ALTS[i]} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 6 · summit */

const SWATCHES = [
  { name: '冰川蓝', en: 'GLACIER BLUE', color: '#5DA9E4' },
  { name: '深岩黑', en: 'ROCK BLACK', color: '#1E2126' },
];

export const SceneSummit: React.FC = () => {
  const frame = useCurrentFrame();
  // Turntable: front → back → front, faked with a horizontal squash through the edge-on moment.
  const turn = (a: number) => interpolate(frame, [a, a + 7, a + 8, a + 15], [1, 0.02, 0.02, 1], { ...clamp, easing: SNAP });
  const showBack = frame >= 66 && frame < 124;
  const sx = frame < 100 ? turn(58) : turn(116);
  const enter = interpolate(frame, [0, 30], [0, 1], { ...clamp, easing: EXPO });
  const bob = Math.sin(frame / 22) * 6;
  const mask = 'radial-gradient(ellipse 48% 50% at 50% 50%, #000 62%, transparent 100%)';
  return (
    <AbsoluteFill>
      <Backdrop glow="rgba(169,214,245,0.16)" />
      <Contours x={960} y={560} scale={1.4} opacity={0.14} draw={interpolate(frame, [0, 60], [0.3, 1], clamp)} />
      <div
        style={{
          position: 'absolute',
          left: 960 - 330,
          top: 120 + bob + (1 - enter) * 80,
          width: 660,
          height: 870,
          opacity: enter,
          transform: `scaleX(${sx})`,
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        <Img src={img(showBack ? 'back' : 'front')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ position: 'absolute', left: 110, top: 200 }}>
        <Wipe at={6}>
          <div style={{ fontFamily: CJK, fontWeight: 700, fontSize: 128, color: '#F4F8FB', lineHeight: 1.15 }}>登顶。</div>
        </Wipe>
        <div style={{ ...rise(frame, 16, 20), fontFamily: MONO, fontSize: 22, letterSpacing: '0.3em', color: GLACIER }}>SUMMIT · 5,200 m</div>
      </div>
      <div style={{ position: 'absolute', left: 110, top: 520, display: 'flex', flexDirection: 'column', gap: 34 }}>
        {[
          ['620 g', '成衣重量 ±40g（M码）'],
          ['立体剪裁', '运动版型 · 适度宽松'],
          ['无内胆', '纯硬壳 · 自由叠穿'],
        ].map(([a, b], k) => (
          <div key={a} style={rise(frame, 34 + k * 8, 24)}>
            <div style={{ fontFamily: CJK, fontWeight: 700, fontSize: 46, color: '#F4F8FB' }}>{a}</div>
            <div style={{ fontFamily: CJK, fontSize: 22, color: FOG, marginTop: 2 }}>{b}</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', right: 110, top: 300, display: 'flex', flexDirection: 'column', gap: 30, alignItems: 'flex-end' }}>
        <div style={{ ...rise(frame, 52, 20), fontFamily: MONO, fontSize: 18, letterSpacing: '0.2em', color: FOG }}>COLOURWAY · 配色</div>
        {SWATCHES.map((s, k) => (
          <div key={s.name} style={{ ...rise(frame, 58 + k * 8, 24), display: 'flex', alignItems: 'center', gap: 22 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: CJK, fontWeight: 700, fontSize: 40, color: '#F4F8FB' }}>{s.name}</div>
              <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: '0.16em', color: FOG }}>{s.en}</div>
            </div>
            <div style={{ width: 74, height: 74, borderRadius: '50%', background: s.color, border: '2px solid rgba(255,255,255,0.35)' }} />
          </div>
        ))}
        <div style={{ ...rise(frame, 82, 24), display: 'flex', gap: 10, marginTop: 20 }}>
          {['3L', '全压胶', '无氟 DWR', '防风'].map((t) => (
            <span key={t} style={{ fontFamily: CJK, fontSize: 21, color: GLACIER_SOFT, border: `1px solid ${GLACIER}88`, padding: '6px 14px', borderRadius: 40 }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 7 · end card */

export const SceneEnd: React.FC = () => {
  const frame = useCurrentFrame();
  const heroIn = interpolate(frame, [4, 50], [0, 1], { ...clamp, easing: EXPO });
  const mask = 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 70%, transparent 100%)';
  return (
    <AbsoluteFill style={{ background: SNOW }}>
      <Contours x={1440} y={560} scale={1.3} opacity={0.18} color="#8AA4BA" draw={interpolate(frame, [0, 80], [0, 1], clamp)} />
      <div style={{ position: 'absolute', left: 1020, top: 40, width: 800, height: 1000, opacity: heroIn, transform: `scale(${1.06 - heroIn * 0.06})`, WebkitMaskImage: mask, maskImage: mask }}>
        <Img src={img('hero')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ position: 'absolute', left: 130, top: 210 }}>
        <div style={{ ...rise(frame, 14, 16), fontFamily: MONO, fontSize: 20, letterSpacing: '0.24em', color: '#3D7FB3' }}>ALPINE 3L · 高性能登山冲锋衣</div>
        <div style={{ fontFamily: CJK, fontWeight: 700, fontSize: 112, color: INK, lineHeight: 1.22, marginTop: 22 }}>
          <Wipe at={20}>风雨在外，</Wipe>
          <Wipe at={30}>
            你在<span style={{ color: '#2F86C8' }}>山上</span>。
          </Wipe>
        </div>
        <div style={{ ...rise(frame, 44, 16), fontFamily: MONO, fontSize: 22, letterSpacing: '0.34em', color: '#5B6B79', marginTop: 20 }}>LEAVE THE WEATHER OUTSIDE.</div>
        <div style={{ ...rise(frame, 56, 16), display: 'flex', gap: 12, marginTop: 48 }}>
          {['登山', '徒步', '露营', '户外旅行'].map((t) => (
            <span key={t} style={{ fontFamily: CJK, fontSize: 26, color: INK, border: `1.5px solid ${INK}`, padding: '8px 22px', borderRadius: 40 }}>
              {t}
            </span>
          ))}
        </div>
        <div style={{ ...rise(frame, 66, 12), fontFamily: MONO, fontSize: 18, color: '#4A5865', marginTop: 46, lineHeight: 1.8, letterSpacing: '0.04em' }}>
          3L · ≥20,000 mm 防水 · ≥15,000 g/㎡·24h 透湿 · 620 g
          <br />
          产品标准目标 GB/T 32614-2023 Ⅰ级
        </div>
      </div>
    </AbsoluteFill>
  );
};

