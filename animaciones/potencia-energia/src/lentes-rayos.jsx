import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {renderLensSVG} from './lentes-geometria.mjs';

const LensScene=({kind})=>{
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  return <AbsoluteFill style={{backgroundColor:'#fffdf7',justifyContent:'center'}}>
    <div style={{width:'100%'}} dangerouslySetInnerHTML={{__html:renderLensSVG(kind,frame,fps).replace('width="900" height="440"','width="100%" height="100%"')}}/>
  </AbsoluteFill>;
};
export const LentesRayos=()=>{
  const {fps}=useVideoConfig();
  return <>
    <Sequence name="Convergente: imagen real" from={0} durationInFrames={10*fps} premountFor={fps}><LensScene kind="convergente"/></Sequence>
    <Sequence name="Divergente: imagen virtual" from={10*fps} durationInFrames={10*fps} premountFor={fps}><LensScene kind="divergente"/></Sequence>
    <Sequence name="Lupa: objeto dentro del foco" from={20*fps} durationInFrames={10*fps} premountFor={fps}><LensScene kind="lupa"/></Sequence>
  </>;
};
