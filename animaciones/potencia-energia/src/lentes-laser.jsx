import React from 'react';
import {AbsoluteFill,Img,Sequence,interpolate,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {laserGeometry,LASER_TIMING} from './lentes-laser-geometria.mjs';

const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'};
const LaserBeam=({beam,frame,fps,start,filterId})=>{
  const progress=interpolate(frame,[start*fps,(start+LASER_TIMING.drawSeconds)*fps],[0,1],clamp);
  if(progress<=0)return null;
  const reveal={pathLength:1,strokeDasharray:1,strokeDashoffset:1-progress};
  const atGlass=progress*beam.totalLength>=beam.incomingLength;
  return <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={beam.path} {...reveal} stroke={beam.color} strokeWidth="9" opacity=".26" filter={`url(#${filterId}-halo)`}/>
    <path d={beam.path} {...reveal} stroke={beam.color} strokeWidth="3.4" opacity=".92" filter={`url(#${filterId}-soft)`}/>
    <path d={beam.path} {...reveal} stroke={beam.core} strokeWidth="1.2" opacity=".98"/>
    <circle cx={beam.source.x} cy={beam.source.y} r="4" fill={beam.color} opacity=".75" filter={`url(#${filterId}-soft)`}/>
    {atGlass&&<circle cx={beam.lens.x} cy={beam.lens.y} r="4.2" fill={beam.color} opacity=".7" filter={`url(#${filterId}-soft)`}/>}
  </g>;
};

const LensLaserScene=({kind})=>{
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const {layout,focus,beams}=laserGeometry(kind);
  const divergent=kind==='divergente';
  const guideOpacity=interpolate(frame,[LASER_TIMING.axisStart*fps,(LASER_TIMING.axisStart+.65)*fps],[0,.82],clamp);
  const focusOpacity=interpolate(frame,[LASER_TIMING.focusStart*fps,(LASER_TIMING.focusStart+.8)*fps],[0,1],clamp);
  const summaryOpacity=interpolate(frame,[LASER_TIMING.summaryStart*fps,(LASER_TIMING.summaryStart+.5)*fps],[0,1],clamp);
  const title=divergent?'Lente divergente':'Lente convergente';
  const id=`laser-${kind}`;
  const explanation=divergent?'Los rayos se separan al salir de la lente.':'Los rayos paralelos se reúnen después de la lente.';
  const conclusion=divergent?'Sus prolongaciones se encuentran en el foco virtual.':'Se cruzan en el foco real y continúan su recorrido.';
  const focusLabelY=divergent?370:focus.y+64;
  const sceneOpacity=interpolate(frame,[0,.3*fps,15.7*fps,16*fps],[0,1,1,0],clamp);
  return <AbsoluteFill style={{backgroundColor:'#06090c',opacity:sceneOpacity,fontFamily:'Arial,sans-serif',color:'#f6f8fa'}}>
    <Img src={staticFile(`lentes/video-${kind}.png`)} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'fill'}}/>
    <svg viewBox={`0 0 ${layout.width} ${layout.height}`} width="100%" height="100%" style={{position:'absolute',inset:0}} aria-label={`${title}: dos haces paralelos, verde y azul, y ubicación del foco`}>
      <defs>
        <filter id={`${id}-halo`} x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="4.5"/></filter>
        <filter id={`${id}-soft`} x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="1.25"/></filter>
        <marker id={`${id}-arrow`} viewBox="0 0 12 12" refX="6" refY="6" markerWidth="11" markerHeight="11" orient="auto"><path d="M1 1 L11 6 L1 11" fill="none" stroke="#e5eaf0" strokeWidth="1.5"/></marker>
      </defs>
      <g opacity={guideOpacity}>
        <path d={`M305 ${layout.axisY} H1460`} fill="none" stroke="#b7c5d3" strokeWidth="1.5" strokeDasharray="10 13"/>
        <text x="1280" y={layout.axisY-22} fill="#e4ebf3" fontSize="25">eje principal</text>
        <line x1={layout.lensX} y1={layout.axisY-178} x2={layout.lensX} y2={layout.axisY+178} stroke="#d1dce5" strokeWidth="1" strokeDasharray="4 8" opacity=".48"/>
      </g>
      <LaserBeam beam={beams[0]} frame={frame} fps={fps} start={LASER_TIMING.greenStart} filterId={id}/>
      <LaserBeam beam={beams[1]} frame={frame} fps={fps} start={LASER_TIMING.blueStart} filterId={id}/>
      {divergent&&<g opacity={focusOpacity}>
        {beams.map(beam=><path key={beam.key} d={`M${focus.x} ${focus.y} L${beam.lens.x} ${beam.lens.y}`} fill="none" stroke={beam.color} strokeWidth="2" strokeDasharray="9 10" opacity=".62"/>)}
      </g>}
      <g opacity={focusOpacity}>
        <circle cx={focus.x} cy={focus.y} r="10" fill="#101b23" fillOpacity=".65" stroke="#f7e4a9" strokeWidth="2"/>
        <line x1={focus.x} y1={divergent?focus.y-14:focus.y+14} x2={focus.x} y2={divergent?focusLabelY+49:focusLabelY-2} stroke="#f7e4a9" strokeWidth="1.7"/>
        <rect x={focus.x-114} y={focusLabelY} width="228" height="47" rx="7" fill="#091017" fillOpacity=".88" stroke="#f7e4a9" strokeOpacity=".35"/>
        <text x={focus.x} y={focusLabelY+32} textAnchor="middle" fill="#ffedbd" fontSize="29" fontWeight="700">{divergent?'F · foco virtual':'F · foco real'}</text>
      </g>
      <g opacity={guideOpacity} fill="#f1f5f9" fontSize="27">
        <text x={layout.lensX} y="744" textAnchor="middle">{divergent?'Más delgada en el centro':'Más gruesa en el centro'}</text>
        <text x="70" y={beams[0].source.y-30} fill="#86ffa5" fontSize="25">VERDE</text>
        <text x="70" y={beams[1].source.y+52} fill="#95c5ff" fontSize="25">AZUL</text>
        <path d={`M440 ${beams[0].source.y-14} H487`} stroke="#e5eaf0" strokeWidth="1.5" markerEnd={`url(#${id}-arrow)`}/>
        <path d={`M440 ${beams[1].source.y+15} H487`} stroke="#e5eaf0" strokeWidth="1.5" markerEnd={`url(#${id}-arrow)`}/>
      </g>
    </svg>
    <div style={{position:'absolute',left:0,right:0,top:0,padding:'40px 64px 32px',background:'linear-gradient(#050a10f5,#050a10da 75%,#050a1000)'}}>
      <div style={{fontSize:20,fontWeight:700,letterSpacing:3,color:'#e7d6a5',marginBottom:12}}>ÓPTICA · GEOMETRÍA DE RAYOS</div>
      <div style={{fontSize:60,fontWeight:700,lineHeight:1.1}}>{title}</div>
      <div style={{fontSize:30,color:'#dae3ed',marginTop:16}}>Dos haces paralelos al eje: uno verde y otro azul.</div>
    </div>
    <div style={{position:'absolute',left:0,right:0,bottom:0,padding:'28px 64px 27px',background:'linear-gradient(#050a1000,#050a10ed 20%,#050a10fa)'}}>
      <div style={{height:100,opacity:summaryOpacity}}>
        <div style={{fontSize:34,fontWeight:700,lineHeight:1.3}}>{explanation}</div>
        <div style={{fontSize:29,color:'#e9ddb9',marginTop:6}}>{conclusion}</div>
      </div>
      <div style={{fontSize:22,color:'#bdcad9',marginTop:12}}>Simulación · lente delgada ideal · sin dispersión cromática.</div>
      <div style={{fontSize:22,color:'#bdcad9',marginTop:5}}>Haces visibles como recurso didáctico. Trazado por etapas; no representa tiempo real.</div>
      <div style={{fontSize:18,color:'#8495a8',marginTop:14}}>Sistemas Multi Física · Profesor Javier Pereyra</div>
    </div>
  </AbsoluteFill>;
};

export const LentesLaserRealista=()=>{
  const {fps}=useVideoConfig();
  return <AbsoluteFill style={{backgroundColor:'#06090c'}}>
    <Sequence name="Convergente · foco real" from={0} durationInFrames={16*fps} premountFor={fps}><LensLaserScene kind="convergente"/></Sequence>
    <Sequence name="Divergente · foco virtual" from={16*fps} durationInFrames={16*fps} premountFor={fps}><LensLaserScene kind="divergente"/></Sequence>
  </AbsoluteFill>;
};
