import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';

// Distances and wavelength share drawing units; equal-amplitude ideal model.
const wavelength=80, slitX=480, screenX=1250, upper=450, lower=610;
const difference=y=>Math.hypot(screenX-slitX,y-upper)-Math.hypot(screenX-slitX,y-lower);
let low=530, high=850;
for(let i=0;i<40;i++){const mid=(low+high)/2;if(difference(mid)<wavelength/2)low=mid;else high=mid;}
const darkY=(low+high)/2;
const Text=({x,y,size=30,fill='#18394a',children,...props})=><text x={x} y={y} fontSize={size} fill={fill} {...props}>{children}</text>;
export const YoungDobleRendija=()=>{
  const frame=useCurrentFrame();
  const phase=frame*2*Math.PI/40;
  const started=Math.max(0,frame-35);
  const fronts=Math.min(1150,started*4);
  const pattern=interpolate(frame,[220,250],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const stage=frame<250?0:frame<350?1:2;
  const pointY=stage===2?darkY:530;
  const delta=stage===2?Math.PI:0;
  const wave=(baseline,which)=>Array.from({length:141},(_,i)=>{
    const a=Math.sin(i/140*4*Math.PI-phase),b=Math.sin(i/140*4*Math.PI-phase+delta);
    return `${i?'L':'M'}${1400+i*2.8},${baseline-18*(which===0?a:which===1?b:a+b)}`;
  }).join(' ');
  return <AbsoluteFill style={{backgroundColor:'#f7f2e6'}}><svg viewBox="0 0 1920 1080" fontFamily="Arial, sans-serif">
    <rect width="1920" height="10" fill="#087a80"/>
    <Text x={80} y={80} size={28} fill="#087a80" fontWeight="bold">CLASE 14 · EXPERIMENTO DE YOUNG</Text>
    <Text x={80} y={155} size={60} fontWeight="bold">Dos rendijas, un patrón de interferencia</Text>
    <Text x={80} y={215} size={31}>{stage===0?'Los frentes de onda avanzan y se superponen.':stage===1?'En el centro, las ondas llegan en fase: se refuerzan.':'En un mínimo, llegan en oposición de fase: se cancelan.'}</Text>
    <rect x="80" y="275" width="1240" height="580" rx="22" fill="#fffdf7" stroke="#d8d2c4"/>
    <defs><clipPath id="young-waves"><rect x="480" y="330" width="770" height="470"/></clipPath><clipPath id="young-input"><rect x="120" y="330" width="338" height="470"/></clipPath></defs>
    <g clipPath="url(#young-input)" stroke="#dca82c" strokeWidth="4" opacity=".7">
      {Array.from({length:7},(_,i)=><line key={i} x1={120+((frame*4+i*80)%400)} y1="340" x2={120+((frame*4+i*80)%400)} y2="790"/>)}</g>
    <Text x={120} y={315} size={27}>Luz coherente →</Text>
    <rect x="458" y="330" width="22" height="470" fill="#18394a"/>
    {[upper,lower].map((y,i)=><g key={y}><rect x="458" y={y-9} width="22" height="18" fill="#fffdf7"/><Text x={407} y={y+9} size={28}>{i?'S₂':'S₁'}</Text></g>)}
    <Text x={370} y={315} size={27}>Doble rendija</Text>
    <g clipPath="url(#young-waves)" fill="none">
      {[upper,lower].map((y,j)=>Array.from({length:16},(_,i)=>{
        const r=(started*4)%wavelength+i*wavelength;
        return r<=fronts?<circle key={`${j}-${i}`} cx={slitX} cy={y} r={r} stroke={j?'#bc6c35':'#277e9e'} strokeWidth="3" opacity=".45"/>:null;
      }))}
    </g>
    <rect x="1250" y="330" width="38" height="470" fill="#17212d"/>
    {Array.from({length:235},(_,i)=>{
      const y=330+i*2; const intensity=Math.cos(Math.PI*difference(y)/wavelength)**2;
      return <rect key={i} x="1250" y={y} width="38" height="2.1" fill="#ffd953" opacity={intensity*pattern}/>;
    })}
    <Text x={1160} y={315} size={27}>Pantalla</Text>
    {stage>0&&<g><line x1={slitX} y1={upper} x2={screenX} y2={pointY} stroke="#277e9e" strokeWidth="4" strokeDasharray="10 6"/><line x1={slitX} y1={lower} x2={screenX} y2={pointY} stroke="#bc6c35" strokeWidth="4" strokeDasharray="10 6"/><circle cx="1269" cy={pointY} r="15" fill="none" stroke={stage===1?'#fff':'#de583b'} strokeWidth="5"/></g>}
    <rect x="1360" y="275" width="480" height="580" rx="22" fill="#18394a"/>
    <Text x={1390} y={325} size={29} fill="#f6ce59" fontWeight="bold">{stage===0?'Una fuente, dos rendijas':stage===1?'Punto claro · máximo':'Punto oscuro · mínimo'}</Text>
    {stage===0?<g><Text x={1390} y={398} size={29} fill="white">Ambas rendijas originan</Text><Text x={1390} y={438} size={29} fill="white">ondas de igual frecuencia</Text><Text x={1390} y={478} size={29} fill="white">y fase inicial.</Text><Text x={1390} y={560} size={28} fill="#b6d8e4">Los arcos son frentes</Text><Text x={1390} y={600} size={28} fill="#b6d8e4">de onda, no trayectorias.</Text><Text x={1390} y={704} size={28} fill="white">La pantalla registra</Text><Text x={1390} y={744} size={28} fill="white">la intensidad resultante.</Text></g>:<g>
      <Text x={1390} y={377} size={25} fill="#b6d8e4">Campo eléctrico en ese punto</Text>
      {[450,550,680].map((y,i)=><g key={y}><line x1="1395" y1={y} x2="1800" y2={y} stroke="#58727f"/><path d={wave(y,i)} stroke={i===0?'#66c0dc':i===1?'#efa574':'#f6ce59'} strokeWidth="4" fill="none"/><Text x={1390} y={y-43} size={24} fill="white">{['Onda de S₁','Onda de S₂','Suma de los campos'][i]}</Text></g>)}
      <Text x={1390} y={770} size={32} fill="#f6ce59">{stage===1?'Δ = 0 → se refuerzan':'Δ = λ/2 → se cancelan'}</Text>
      <Text x={1390} y={815} size={23} fill="white">Oscilación mostrada en cámara lenta.</Text>
    </g>}
    <Text x={80} y={918} size={30}>Máximos: Δ = mλ     ·     Mínimos: Δ = (m + ½)λ     ·     Δ = |r₂ − r₁|</Text>
    <Text x={80} y={965} size={25} fill="#526772">Modelo ideal: igual amplitud; se omite la envolvente de difracción. Escala espacial y temporal ilustrativa.</Text>
    <Text x={80} y={1030} size={23} fill="#526772">Sistemas Multi Física · Profesor Javier Pereyra</Text>
  </svg></AbsoluteFill>;
};
