import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {MicroscopioRayos} from './microscopio-rayos.jsx';

export function MicroscopioRoot() {
  return <Composition id="MicroscopioRayos" component={MicroscopioRayos} durationInFrames={720} fps={30} width={1400} height={820}/>;
}

registerRoot(MicroscopioRoot);
