import React from 'react';
import {Composition} from 'remotion';
import {FPS, VIDEO} from './config';
import {TOTAL_FRAMES} from './timeline';
import {YamYamAd} from './YamYamAd';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="YamYamAd"
    component={YamYamAd}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={VIDEO.width}
    height={VIDEO.height}
  />
);
