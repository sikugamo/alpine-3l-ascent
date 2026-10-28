import { Easing, cancelRender, continueRender, delayRender, staticFile } from 'remotion';

// Latin faces are self-hosted from public/fonts; CJK uses the system Noto Sans CJK SC (Regular + Bold).
const FACES: Array<[string, string, string]> = [
  ['Inter', 'fonts/inter.woff2', '400 800'],
  ['JetBrains Mono', 'fonts/mono.woff2', '400 500'],
];
const fontHandle = delayRender('Loading fonts', { timeoutInMilliseconds: 60000, retries: 2 });
Promise.all(
  FACES.map(async ([family, file, weight]) => {
    const face = await new FontFace(family, `url(${staticFile(file)}) format('woff2')`, { weight }).load();
    document.fonts.add(face);
  }),
)
  .then(() => document.fonts.load("700 40px 'Noto Sans CJK SC'"))
  .then(() => continueRender(fontHandle))
  .catch((err) => cancelRender(err));

export const SANS = "'Inter', 'Noto Sans CJK SC', sans-serif";
export const CJK = "'Noto Sans CJK SC', 'Inter', sans-serif";
export const MONO = "'JetBrains Mono', 'Noto Sans CJK SC', monospace";

// Palette pulled from the product photography: night backdrop, glacier blue body, rock black panels.
export const NIGHT = '#0D151E';
export const NIGHT_2 = '#14202C';
export const GLACIER = '#5DB3EE';
export const GLACIER_SOFT = '#A9D6F5';
export const ROCK = '#1C1F24';
export const SNOW = '#EBEBEB';
export const INK = '#0E1318';
export const FOG = '#8FA3B5';

export const FPS = 30;
export const W = 1920;
export const H = 1080;

/** Scene table (absolute frames). The whole film is one continuous ascent. */
export const T = {
  storm: 0,
  title: 150,
  anatomy: 270,
  barrier: 480,
  camps: 690,
  summit: 1050,
  whiteout: 1230,
  end: 1380,
} as const;
export const CAMP_LEN = 90;

export const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
export const SNAP = Easing.bezier(0.7, 0, 0.2, 1);
export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Deterministic pseudo-random in [0,1) for particle layouts. */
export const rnd = (i: number, salt = 0) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
