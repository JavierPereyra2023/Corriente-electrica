import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {renderMicroscopeSVG} from './microscopio-geometria.mjs';
import {DEFAULT_OPTICS} from './microscopio-optica.mjs';

export function MicroscopioRayos({f1=DEFAULT_OPTICS.f1,f2=DEFAULT_OPTICS.f2,L=DEFAULT_OPTICS.L,s1=DEFAULT_OPTICS.s1,h=DEFAULT_OPTICS.h}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const referenceFrame = frame * 30 / fps;
  return <AbsoluteFill style={{backgroundColor:'#fffdf7'}}>
    <div style={{width:'100%',height:'100%'}} dangerouslySetInnerHTML={{__html:renderMicroscopeSVG(referenceFrame,{config:{f1,f2,L,s1,h}})}}/>
  </AbsoluteFill>;
}
