// Renders half-size stills at the given absolute frames into out/qa for visual review.
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';

const frames = process.argv.slice(2).map(Number);
const browserExecutable = process.env.CHS;
const chromiumOptions = { gl: 'swangle' };
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const id = process.env.COMP ?? 'AlpineAscent';
const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions, timeoutInMilliseconds: 120000 });
for (const frame of frames) {
  const output = `out/qa/${id}/f${String(frame).padStart(4, "0")}.jpg`;
  await renderStill({ composition, serveUrl, browserExecutable, chromiumOptions, timeoutInMilliseconds: 120000, frame, output, imageFormat: 'jpeg', jpegQuality: 80, scale: 0.5 });
  console.log('rendered', frame);
}
