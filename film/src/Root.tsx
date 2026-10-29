import React from 'react';
import { Composition } from 'remotion';
import { DURATION, Film } from './Film';
import { INTERFACE_DURATION, Interface } from './fui/Interface';
import { OPENING_DURATION, Opening } from './opening/Opening';
import { OPENING_V2_DURATION, OpeningV2 } from './opening/OpeningV2';
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
    {/* v4: "Interface" — v3 wrapped in HUD/FUI overlays and animated information layers. */}
    <Composition id="AlpineInterface" component={Interface} durationInFrames={INTERFACE_DURATION} fps={30} width={1920} height={1080} />
    {/* 10 s text-free opening for the voiceover; tools/assemble-opening.sh joins it to v4. */}
    <Composition id="AlpineOpening" component={Opening} durationInFrames={OPENING_DURATION} fps={30} width={1920} height={1080} />
    {/* Opening v2: same voiceover beats, photos presented on a stepping 3D carousel. */}
    <Composition id="AlpineOpeningV2" component={OpeningV2} durationInFrames={OPENING_V2_DURATION} fps={30} width={1920} height={1080} />
  </>
);
