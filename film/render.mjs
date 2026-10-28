// Renders one frame range (or the audio track) via the renderer API, bypassing the CLI progress bar.
// Usage: node render.mjs <out-file> <start-end|audio>
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'node:path';

const [output, range] = process.argv.slice(2);
const browserExecutable = process.env.CHS;
const chromiumOptions = { gl: 'swangle' };
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const id = process.env.COMP ?? 'AlpineAscent';
const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions, timeoutInMilliseconds: 120000 });
const audio = range === 'audio';
let last = -10;
await renderMedia({
  composition,
  serveUrl,
  browserExecutable,
  chromiumOptions,
  outputLocation: output,
  codec: audio ? 'wav' : 'h264',
  ...(audio ? {} : { muted: true, crf: 16, frameRange: range.split('-').map(Number) }),
  concurrency: 2,
  timeoutInMilliseconds: 120000,
  onProgress: ({ progress }) => {
    if (progress - last >= 0.1) { last = progress; console.log(`${output} ${Math.round(progress * 100)}%`); }
  },
});
console.log('done', output);
