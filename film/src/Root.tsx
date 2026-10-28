import React from 'react';
import { Composition } from 'remotion';
import { DURATION, Film } from './Film';

export const Root: React.FC = () => (
  <Composition id="AlpineAscent" component={Film} durationInFrames={DURATION} fps={30} width={1920} height={1080} />
);
