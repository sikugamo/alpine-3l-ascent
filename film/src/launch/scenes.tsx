import React from 'react';
import { AbsoluteFill, Img, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { CJK, MONO, SANS, SNAP, clamp } from '../theme';
import { Aurora, BLUE, BlurText, Brackets, DIM, ICE, L, Motes, Product, REEL_LEN, STAGE, Spotlight, Sweep, ease, focusIn, iceText, img, metal } from './kit';

const mono = (size = 16, color = DIM, spacing = '0.3em'): React.CSSProperties => ({ fontFamily: MONO, fontSize: size, letterSpacing: spacing, color });

/* ------------------------------------------------------------------ A · intro */

export const LaunchIntro: React.FC = () => {
  const f = useCurrentFrame();
  const line = ease(f, 6, 40);
  const lineFade = interpolate(f, [120, 170], [1, 0], clamp);
  // The horizon line lifts and becomes the light that reveals the silhouette.
  const reveal = ease(f, 100, 70);
  return (
    <AbsoluteFill style={{ background: STAGE }}>
      <Aurora intensity={reveal * 0.8} />
      <div
        style={{
          position: 'absolute',
          left: 960 - 700 * line,
          top: 540 - reveal * 140,
          width: 1400 * line,
          height: 1.5,
          opacity: lineFade,
          background: `linear-gradient(90deg, transparent, ${ICE}, #FFFFFF, ${ICE}, transparent)`,
          boxShadow: `0 0 24px ${ICE}, 0 0 60px ${BLUE}`,
        }}
      />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 590, opacity: interpolate(f, [96, 116], [1, 0], clamp) }}>
        <BlurText text="风暴，只是测试环境。" at={34} stagger={2} style={{ fontFamily: CJK, fontSize: 64, color: '#EEF6FC', letterSpacing: '0.12em' }} />
        <div style={{ ...mono(16, DIM, '0.6em'), textAlign: 'center', marginTop: 22, opacity: ease(f, 56, 30) }}>THE STORM IS JUST A TEST ENVIRONMENT</div>
      </div>
      <Product
        src="front"
        x={960 - 340}
        y={150}
        w={680}
        h={896}
        reflect={0}
        style={{ opacity: reveal * 0.85, filter: `brightness(${0.25 + reveal * 0.45}) contrast(1.15)`, transform: `scale(${1.1 - reveal * 0.1})` }}
      />
      <Motes n={50} opacity={0.4 + reveal * 0.6} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ B · title */

export const LaunchTitle: React.FC = () => {
  const f = useCurrentFrame();
  const flash = interpolate(f, [0, 2, 8], [0.6, 0.35, 0], clamp);
  const spread = ease(f, 0, 50);
  const push = interpolate(f, [0, 130], [1, 1.05]);
  return (
    <AbsoluteFill style={{ background: STAGE }}>
      <Aurora intensity={1} />
      <Spotlight opacity={ease(f, 0, 20)} floorY={960} />
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${push})` }}>
        {/* Wordmark sits behind the product, like a stage backdrop. */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 34,
            textAlign: 'center',
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 240,
            lineHeight: 1,
            letterSpacing: `${0.4 - spread * 0.36}em`,
            opacity: 0.95 * spread,
            ...metal('#FFFFFF', '#3A4B5C'),
          }}
        >
          ALPINE 3L
        </div>
        <Product src="front" x={960 - 290} y={235} w={580} h={740} style={{ ...focusIn(f, 6, 30, 24) }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 990, textAlign: 'center' }}>
        <BlurText text="高性能三层硬壳冲锋衣" at={30} stagger={1.5} style={{ fontFamily: CJK, fontSize: 30, color: '#DDEBF6', letterSpacing: '0.5em' }} />
      </div>
      <AbsoluteFill style={{ background: '#FFFFFF', opacity: flash }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ C · layers */

const LAYERS = [
  { src: 'knit-20d', no: '03', name: 'LINER', spec: '20D 聚酯针织底布', note: '100% 聚酯纤维' },
  { src: 'pu-membrane-alpha.png', no: '02', name: 'MEMBRANE', spec: '聚醚 PU 防水透湿膜', note: '亲水型 · 防风' },
  { src: 'shell-blue', no: '01', name: 'SHELL', spec: '70D 高密度尼龙', note: 'Mini Ripstop 防撕裂' },
];

export const LaunchLayers: React.FC = () => {
  const f = useCurrentFrame();
  const sep = interpolate(f, [10, 60, 130, 150], [0, 1, 1, 0], { ...clamp, easing: SNAP });
  const spin = interpolate(f, [0, 180], [-56, -30]);
  const tilt = interpolate(f, [0, 180], [62, 54]);
  const fused = interpolate(f, [150, 154, 172], [0, 1, 0.25], clamp);
  const cx = 1180;
  const cy = 560;
  const gap = 140;
  return (
    <AbsoluteFill style={{ background: STAGE }}>
      <Aurora intensity={0.9} hue="deep" />
      <div style={{ position: 'absolute', left: cx - 260, top: cy - 260, width: 520, height: 520, perspective: 2400 }}>
        {LAYERS.map((l, i) => {
          const depth = Math.abs(1 - i) * sep;
          return (
            <div
              key={l.src}
              style={{
                position: 'absolute',
                inset: 0,
                transform: `translateY(${(1 - i) * gap * sep}px) rotateX(${tilt}deg) rotateZ(${spin}deg)`,
                filter: `blur(${i === 0 ? depth * 2.5 : 0}px)`,
              }}
            >
              <Img src={img(l.src)} style={{ width: 520, height: 520, objectFit: 'cover', borderRadius: 14 }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: 14, border: `1.5px solid rgba(127,216,255,${0.25 + fused * 0.7})`, boxShadow: `0 0 ${30 + fused * 60}px rgba(127,216,255,${0.25 + fused * 0.5})` }} />
            </div>
          );
        })}
      </div>
      {LAYERS.map((l, i) => {
        const y = cy + (1 - i) * gap * sep - 18;
        const p = ease(f, 46 + (2 - i) * 8, 20) * interpolate(f, [124, 136], [1, 0], clamp);
        return (
          <div key={l.no} style={{ position: 'absolute', left: 1460, top: y - 30, opacity: p, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: ICE, boxShadow: `0 0 12px ${ICE}` }} />
            <div style={{ width: 60 * p, height: 1, background: `linear-gradient(90deg, ${ICE}, transparent)` }} />
            <div>
              <div style={mono(14, ICE)}>
                {l.no} · {l.name}
              </div>
              <div style={{ fontFamily: CJK, fontSize: 30, color: '#F2F8FC', marginTop: 4, whiteSpace: 'nowrap' }}>{l.spec}</div>
              <div style={{ fontFamily: CJK, fontSize: 18, color: DIM, marginTop: 2 }}>{l.note}</div>
            </div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 140, top: 330 }}>
        <div style={{ ...mono(16, ICE), ...focusIn(f, 6) }}>3-LAYER LAMINATE</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 210, lineHeight: 1, marginTop: 18, ...metal(), ...focusIn(f, 10, 26) }}>3 → 1</div>
        <div style={{ fontFamily: CJK, fontSize: 46, color: '#EEF6FC', marginTop: 26, letterSpacing: '0.1em', ...focusIn(f, 18) }}>三层复合，一体压合。</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 40, ...focusIn(f, 152, 20) }}>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 72, ...iceText }}>185</span>
          <span style={mono(20, '#DDEBF6', '0.1em')}>g/㎡ · 复合面料克重</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ D · numbers */

const BigNumber: React.FC<{ value: number; at: number; label: string; unit: string; line: string; en: string }> = ({ value, at, label, unit, line, en }) => {
  const f = useCurrentFrame();
  const count = Math.round(value * ease(f, at, 36)).toLocaleString('en-US');
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center' }}>
      <div style={{ ...mono(18, ICE, '0.5em'), ...focusIn(f, at) }}>{label}</div>
      <div style={{ position: 'relative', display: 'inline-block', overflow: 'hidden', marginTop: 10, ...focusIn(f, at, 26) }}>
        <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: 180, lineHeight: 1.05, marginRight: 8, color: '#BFCFDC' }}>≥</span>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 300, lineHeight: 1.05, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', ...metal() }}>{count}</span>
        <Sweep at={at + 34} dur={26} strength={0.5} />
      </div>
      <div style={{ ...mono(28, '#DDEBF6', '0.2em'), marginTop: 4, ...focusIn(f, at + 8) }}>{unit}</div>
      <div style={{ fontFamily: CJK, fontSize: 40, color: '#EEF6FC', marginTop: 44, letterSpacing: '0.1em', ...focusIn(f, at + 30) }}>{line}</div>
      <div style={{ ...mono(15, DIM, '0.4em'), marginTop: 14, ...focusIn(f, at + 36) }}>{en}</div>
    </div>
  );
};

export const LaunchNumbers: React.FC = () => {
  const f = useCurrentFrame();
  const second = f >= 90;
  const local = second ? f - 90 : f;
  const push = interpolate(local, [0, 90], [1.25, 1.12]);
  return (
    <AbsoluteFill style={{ background: STAGE }}>
      <AbsoluteFill style={{ opacity: interpolate(local, [0, 12, 80, 90], [0, 1, 1, 0.4], clamp) }}>
        {second ? (
          <Img src={img('pu-membrane-alpha.png')} style={{ position: 'absolute', left: 260, top: -160, width: 1400, height: 1400, opacity: 0.35, transform: `scale(${push}) rotate(${local * 0.1}deg)`, filter: 'blur(4px)' }} />
        ) : (
          <Img src={img('dwr-beads')} style={{ position: 'absolute', inset: 0, width: 1920, height: 1080, objectFit: 'cover', opacity: 0.42, transform: `scale(${push})`, filter: 'blur(5px) saturate(1.2)' }} />
        )}
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 55% at 50% 50%, rgba(3,5,8,0.35) 0%, ${STAGE} 100%)` }} />
      </AbsoluteFill>
      {second ? (
        <>
          <Motes n={90} rise={3.2} opacity={0.9} />
          <Sequence from={90} layout="none">
            <BigNumber value={15000} at={0} label="透湿指数 · BREATHABILITY" unit="g/㎡·24h · JIS B-1" line="湿气，持续向外排出。" en="VAPOUR OUT. ALL DAY." />
          </Sequence>
        </>
      ) : (
        <BigNumber value={20000} at={0} label="防水指数 · WATERPROOF" unit="mm H₂O" line="相当于 20 米水柱的压力，挡在门外。" en="A 20-METRE WATER COLUMN. HELD BACK." />
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ E · feature reel */

const REEL = [
  { src: 'main-zip', w: 1100, h: 904, title: '防泼水反装主拉链', en: 'WATER-REPELLENT REVERSE ZIP' },
  { src: 'seam-tape', w: 1500, h: 884, title: '全压胶接缝', en: 'FULLY TAPED SEAMS' },
  { src: 'shell-blue', w: 1500, h: 760, title: '无氟 DWR · 洗前 ≥4 级', en: 'PFC-FREE DWR FINISH' },
  { src: 'black-reinforce', w: 1500, h: 834, title: '100D 耐磨尼龙 · 肩肘加强', en: '100D ABRASION ZONES' },
  { src: 'hood-toggle', w: 1640, h: 582, title: '三维立体可调节风帽', en: '3D ADJUSTABLE HOOD' },
  { src: 'cuff-velcro', w: 1640, h: 588, title: '魔术贴袖口', en: 'HOOK-AND-LOOP CUFFS' },
  { src: 'hem-cord', w: 1640, h: 607, title: '隐藏式下摆抽绳', en: 'HIDDEN HEM DRAWCORD' },
  { src: 'sleeve-pocket', w: 1340, h: 900, title: '双胸袋 · 侧袋 · 袖部功能袋', en: 'MULTI-POCKET SYSTEM' },
];

const ReelShot: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const r = REEL[i];
  const w = r.w * 0.86;
  const h = Math.min(r.h * 0.86, 720);
  const inP = ease(f, 0, 14);
  const outP = interpolate(f, [REEL_LEN - 6, REEL_LEN], [0, 1], clamp);
  const dir = i % 2 ? 1 : -1;
  const rotY = dir * (10 - inP * 10) + dir * -outP * 8;
  const zoom = interpolate(f, [0, REEL_LEN], [1.14, 1.04]);
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - outP), perspective: 2200 }}>
      <div
        style={{
          position: 'absolute',
          left: 960 - w / 2,
          top: 470 - h / 2,
          width: w,
          height: h,
          transform: `rotateY(${rotY}deg) translateX(${dir * (1 - inP) * -80 + outP * dir * 60}px)`,
          filter: `blur(${(1 - inP) * 10 + outP * 8}px)`,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 22, boxShadow: '0 50px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)' }}>
          <Img src={img(r.src)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})` }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(3,5,8,0) 55%, rgba(3,5,8,0.55) 100%)' }} />
          <Sweep at={6} dur={30} strength={0.22} />
        </div>
        <Brackets w={w} h={h} opacity={0.6 * inP} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 470 + h / 2 + 36, textAlign: 'center' }}>
        <BlurText text={r.title} at={4} stagger={0.8} style={{ fontFamily: CJK, fontSize: 44, color: '#F2F8FC', letterSpacing: '0.08em' }} />
        <div style={{ ...mono(14, ICE, '0.45em'), marginTop: 12, opacity: ease(f, 10, 14) }}>
          {String(i + 1).padStart(2, '0')} / 08 — {r.en}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const LaunchReel: React.FC = () => (
  <AbsoluteFill style={{ background: STAGE }}>
    <Aurora intensity={0.7} />
    {REEL.map((_, i) => (
      <Sequence key={i} from={i * REEL_LEN} durationInFrames={REEL_LEN}>
        <ReelShot i={i} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ F · spec bento */

type Tile = { col: number; row: number; span?: number; label: string; value: string; unit?: string; note: string; bg?: string; accent?: boolean };
const TILES: Tile[] = [
  { col: 0, row: 0, span: 2, label: 'WATERPROOF', value: '≥20,000', unit: 'mm', note: '防水指数 · 20 米水柱', bg: 'dwr-beads', accent: true },
  { col: 2, row: 0, label: 'BREATHABILITY', value: '≥15,000', unit: 'g', note: '透湿 g/㎡·24h · JIS B-1' },
  { col: 3, row: 0, label: 'WEIGHT', value: '620', unit: 'g', note: '成衣重量 · M 码 ±40g' },
  { col: 0, row: 1, label: 'LAMINATE', value: '3L', note: '三层复合硬壳' },
  { col: 1, row: 1, label: 'FABRIC', value: '185', unit: 'g/㎡', note: '复合面料克重' },
  { col: 2, row: 1, label: 'REINFORCED', value: '100D', note: '肩部 · 肘部耐磨尼龙', bg: 'black-reinforce' },
  { col: 3, row: 1, label: 'DWR · PFC-FREE', value: '≥4', unit: '级', note: '无氟防泼水 · 洗后 ≥3 级' },
];

export const LaunchBento: React.FC = () => {
  const f = useCurrentFrame();
  const W = 1680;
  const H = 680;
  const gap = 20;
  const cw = (W - gap * 3) / 4;
  const rh = (H - gap) / 2;
  const tiltX = interpolate(f, [0, 60], [18, 0], { ...clamp, easing: SNAP });
  const drift = interpolate(f, [0, 180], [-12, 12]);
  return (
    <AbsoluteFill style={{ background: STAGE }}>
      <Aurora intensity={0.8} hue="deep" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center' }}>
        <div style={{ ...mono(16, ICE, '0.5em'), ...focusIn(f, 2) }}>SPECIFICATIONS</div>
        <BlurText text="每一个参数，都为山野而定。" at={6} stagger={1} style={{ fontFamily: CJK, fontSize: 46, color: '#F2F8FC', marginTop: 16, letterSpacing: '0.08em' }} />
      </div>
      <div style={{ position: 'absolute', left: 120, top: 290, width: W, height: H, perspective: 2400 }}>
        <div style={{ position: 'absolute', inset: 0, transform: `rotateX(${tiltX}deg) translateX(${drift}px)`, transformOrigin: '50% 0%' }}>
          {TILES.map((t, k) => {
            const at = 14 + k * 4;
            const p = ease(f, at, 22);
            const w = cw * (t.span ?? 1) + gap * ((t.span ?? 1) - 1);
            return (
              <div
                key={t.label}
                style={{
                  position: 'absolute',
                  left: t.col * (cw + gap),
                  top: t.row * (rh + gap),
                  width: w,
                  height: rh,
                  borderRadius: 26,
                  overflow: 'hidden',
                  opacity: p,
                  transform: `translateY(${(1 - p) * 50}px) scale(${0.94 + p * 0.06})`,
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                  boxShadow: `inset 0 0 0 1px rgba(255,255,255,${t.accent ? 0.2 : 0.1})`,
                }}
              >
                {t.bg && <Img src={img(t.bg)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.32 }} />}
                {t.bg && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(3,5,8,0.85) 0%, rgba(3,5,8,0.2) 100%)' }} />}
                <div style={{ position: 'absolute', left: 30, top: 26, ...mono(13, t.accent ? ICE : DIM, '0.3em') }}>{t.label}</div>
                <div style={{ position: 'absolute', left: 28, bottom: 64, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: t.span ? 120 : 76, lineHeight: 1, letterSpacing: '-0.02em', ...(t.accent ? iceText : metal()) }}>{t.value}</span>
                  {t.unit && <span style={{ fontFamily: CJK, fontSize: t.span ? 32 : 24, color: '#BFD3E2' }}>{t.unit}</span>}
                </div>
                <div style={{ position: 'absolute', left: 30, bottom: 26, fontFamily: CJK, fontSize: 19, color: '#B4C4D2' }}>{t.note}</div>
                <Sweep at={at + 14} dur={30} strength={0.12} />
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1000, textAlign: 'center', ...mono(13, DIM, '0.2em'), opacity: ease(f, 60, 20) }}>
        耐磨性能 ≥20,000 次为研发目标 · ABRASION FIGURE IS AN R&amp;D TARGET
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ G · finale */

export const LaunchFinale: React.FC = () => {
  const f = useCurrentFrame();
  const turn = (a: number) => interpolate(f, [a, a + 6, a + 7, a + 13], [1, 0.02, 0.02, 1], { ...clamp, easing: SNAP });
  const showBack = f >= 33 && f < 78;
  const sx = f < 55 ? turn(27) : turn(72);
  const orbit = f * 0.9;
  return (
    <AbsoluteFill style={{ background: STAGE }}>
      <Aurora intensity={1} />
      <Spotlight floorY={985} />
      {/* Orbit ring on the floor. */}
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <ellipse cx={960} cy={985} rx={420} ry={52} fill="none" stroke={ICE} strokeOpacity={0.35} strokeWidth={1.5} />
        <ellipse cx={960} cy={985} rx={420} ry={52} fill="none" stroke={ICE} strokeWidth={3} strokeDasharray="120 2520" strokeDashoffset={-orbit * 8} style={{ filter: `drop-shadow(0 0 8px ${ICE})` }} />
      </svg>
      <Product src={showBack ? 'back' : 'front'} x={960 - 310} y={150} w={620} h={830} style={{ transform: `scaleX(${sx})`, ...focusIn(f, 0, 20) }} />
      <div style={{ position: 'absolute', left: 140, top: 420, ...focusIn(f, 14) }}>
        <div style={mono(14, ICE)}>COLOURWAY</div>
        {[
          ['冰川蓝', 'GLACIER BLUE', '#5DA9E4'],
          ['深岩黑', 'ROCK BLACK', '#1E2126'],
        ].map(([n, en, c]) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 26 }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: c, boxShadow: `0 0 0 1px rgba(255,255,255,0.3), 0 0 24px ${c}88` }} />
            <div>
              <div style={{ fontFamily: CJK, fontSize: 30, color: '#F2F8FC' }}>{n}</div>
              <div style={mono(12, DIM, '0.25em')}>{en}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', right: 140, top: 420, textAlign: 'right', ...focusIn(f, 22) }}>
        <div style={mono(14, ICE)}>FIT</div>
        <div style={{ fontFamily: CJK, fontSize: 30, color: '#F2F8FC', marginTop: 26 }}>立体运动剪裁</div>
        <div style={{ fontFamily: CJK, fontSize: 20, color: DIM, marginTop: 6 }}>适度宽松 · 无内胆，自由叠穿</div>
      </div>
      <Motes n={60} />
    </AbsoluteFill>
  );
};

export const LaunchEndcard: React.FC = () => {
  const f = useCurrentFrame();
  const flash = interpolate(f, [0, 2, 10], [0.7, 0.4, 0], clamp);
  const glow = 0.6 + 0.4 * Math.sin(f / 12);
  return (
    <AbsoluteFill style={{ background: STAGE }}>
      <Aurora intensity={0.6} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 40% 30% at 50% 46%, rgba(62,155,234,${0.22 * glow}) 0%, transparent 70%)` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block', overflow: 'hidden', ...focusIn(f, 2, 30, 30) }}>
          <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 210, letterSpacing: `${0.2 - ease(f, 2, 60) * 0.14}em`, lineHeight: 1.1, ...metal() }}>ALPINE 3L</span>
          <Sweep at={24} dur={36} strength={0.55} />
        </div>
        <BlurText text="把风暴，挡在外面。" at={20} stagger={2} style={{ fontFamily: CJK, fontSize: 56, color: '#EEF6FC', marginTop: 30, letterSpacing: '0.16em' }} />
        <div style={{ ...mono(16, ICE, '0.6em'), marginTop: 20, opacity: ease(f, 40, 20) }}>BUILT FOR THE STORM</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 56, opacity: ease(f, 52, 20) }}>
          {['登山', '徒步', '露营', '户外旅行'].map((t) => (
            <span key={t} style={{ fontFamily: CJK, fontSize: 22, color: '#DDEBF6', padding: '8px 24px', borderRadius: 30, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.04)' }}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', ...mono(13, DIM, '0.2em'), opacity: ease(f, 62, 20) }}>
        产品标准目标 GB/T 32614-2023 Ⅰ级
      </div>
      <AbsoluteFill style={{ background: '#FFFFFF', opacity: flash }} />
    </AbsoluteFill>
  );
};

