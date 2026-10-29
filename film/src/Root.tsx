import React from 'react';
import { Composition } from 'remotion';
import { DURATION, Film } from './Film';
import { GENESIS_DURATION, Genesis } from './genesis/Genesis';
import { LAUNCH_DURATION, Launch } from './launch/Launch';

export const Root: React.FC = () => (
  <>
    {/* v1: "Ascent" — the climb narrative. */}
    <Composition id="AlpineAscent" component={Film} durationInFrames={DURATION} fps={30} width={1920} height={1080} />
    {/* v2: "Launch" — tech product-launch styling. */}
    <Composition id="AlpineLaunch" component={Launch} durationInFrames={LAUNCH_DURATION} fps={30} width={1920} height={1080} />
    {/* v3: "Genesis" — particle-built, holographic motion. */}
    <Composition id="AlpineGenesis" component={Genesis} durationInFrames={GENESIS_DURATION} fps={30} width={1920} height={1080} />
  </>
);
