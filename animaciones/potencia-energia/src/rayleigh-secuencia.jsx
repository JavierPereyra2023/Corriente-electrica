import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

const W=1920,H=1080;
const Text=({x,y,size=30,fill='#17384a',weight=400,anchor='start',children})=><text x={x} y={y} fontSize={size} fill={fill} fontWeight={weight} textAnchor={anchor}>{children}</text>;
const arrow=(x1,y1,x2,y2,color='#43bde8',opacity=1)=><g opacity={opacity}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="3" strokeLinecap="round"/><path d={`M${x2-10} ${y2-5} L${x2} ${y2} L${x2-8} ${y2+8}`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"/></g>;
const particle=(x,y,color,opacity=1,r=7)=><g opacity={opacity}><circle cx={x} cy={y} r={r} fill={color}/><circle cx={x} cy={y} r={r+7} fill={color} opacity=".18"/></g>;
const eyeX=1300, eyeY=760;
const eyeIcon=(x,y)=><g><ellipse cx={x} cy={y} rx="34" ry="20" fill="#fff" stroke="#24475b" strokeWidth="3"/><circle cx={x} cy={y} r="11" fill="#24475b"/><circle cx={x-3} cy={y-3} r="3" fill="#fff"/></g>;

export const RayleighSecuencia=()=>{
  const f=useCurrentFrame();
  const phase=f*.22;
  const blueScatter=interpolate(f,[60,150],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.out(Easing.cubic)});
  const sunset=interpolate(f,[220,280],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)});
  const step=f<60?0:f<180?1:f<280?2:3;
  const titles=['La atmósfera recibe luz blanca','Las moléculas dispersan más el azul','El cielo se ve azul','Al atardecer, domina el rojo'];
  const notes=['La luz solar contiene muchas longitudes de onda.','Las ondas cortas interactúan más con las moléculas del aire.','La luz azul llega a nuestros ojos desde muchas direcciones.','El recorrido atmosférico es largo: parte del azul se dispersa antes de llegar.'];
  const sunX=145, sunY=520;
  const horizon=720;
  const beamEnd=step<3?1130:1660;
  return <AbsoluteFill style={{backgroundColor:'#f7f2e6'}}><svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" fontFamily="Arial, sans-serif">
    <defs>
      <linearGradient id="rayleighSky" x1="0" y1="0" x2="0" y2="1"><stop stopColor={step<3?'#79c9ef':'#e6b0a0'}/><stop offset="1" stopColor={step<3?'#e8f3fa':'#f4c08c'}/></linearGradient>
      <filter id="rayleighGlow"><feGaussianBlur stdDeviation="6"/></filter>
      <marker id="rayleighArrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#1c9fd2"/></marker>
    </defs>
    <rect width={W} height="10" fill="#087a80"/><Text x="80" y="78" size={27} fill="#087a80" weight={700}>CLASE 14 · DISPERSIÓN DE RAYLEIGH</Text><Text x="80" y="154" size={60} weight={700}>Por qué el cielo es azul</Text><Text x="82" y="208" size={30} fill="#526772">La atmósfera redistribuye con mayor eficacia las longitudes de onda cortas.</Text>
    <rect x="80" y="275" width="1330" height="570" rx="25" fill="url(#rayleighSky)" stroke="#d8d2c4" strokeWidth="3"/><rect x="80" y={horizon} width="1330" height="125" fill={step<3?'#78a65e':'#8d6f59'}/><path d={`M80 ${horizon} Q380 690 710 ${horizon} T1410 ${horizon}`} fill="none" stroke="#668050" strokeWidth="8" opacity=".7"/>
    <g opacity={sunset*.8}><circle cx="980" cy="610" r="180" fill="#f4873d" opacity=".22" filter="url(#rayleighGlow)"/><circle cx="980" cy="610" r="42" fill="#ffd45b"/></g>
    <g opacity={1-sunset}><circle cx={sunX} cy={sunY} r="35" fill="#fff5c8"/><circle cx={sunX} cy={sunY} r="70" fill="#fff5c8" opacity=".2" filter="url(#rayleighGlow)"/></g>
    <Text x="130" y="340" size={27} fill="#24475b" weight={700}>atmósfera</Text>
    {eyeIcon(eyeX,eyeY)}<Text x={eyeX-56} y={eyeY+46} size={24} fill="#24475b" weight={700}>observador</Text>
    <g opacity={1-sunset}><line x1={sunX+40} y1={sunY} x2={beamEnd} y2={sunY} stroke="#fff5d1" strokeWidth="16" opacity=".25" filter="url(#rayleighGlow)"/><line x1={sunX+40} y1={sunY} x2={beamEnd} y2={sunY} stroke="#fff8df" strokeWidth="5" strokeLinecap="round"/><Text x={sunX+100} y={sunY-50} size={23} fill="#7a6a3d" weight={700}>luz solar (blanca)</Text><circle cx={sunX+108} cy={sunY-28} r="7" fill="#e64b3b"/><circle cx={sunX+130} cy={sunY-28} r="7" fill="#57bb69"/><circle cx={sunX+152} cy={sunY-28} r="7" fill="#2c9ed6"/><Text x={sunX+168} y={sunY-23} size={19} fill="#7a6a3d">= mezcla de todos los colores</Text></g>
    <g opacity={sunset}><line x1="235" y1={sunY} x2="980" y2="610" stroke="#ffcf94" strokeWidth="16" opacity=".22" filter="url(#rayleighGlow)"/><line x1="235" y1={sunY} x2="980" y2="610" stroke="#ffb27a" strokeWidth="5" strokeLinecap="round"/><line x1="980" y1="610" x2={eyeX-30} y2={eyeY-24} stroke="#ffcf94" strokeWidth="16" opacity=".22" filter="url(#rayleighGlow)"/><line x1="980" y1="610" x2={eyeX-30} y2={eyeY-24} stroke="#f2793f" strokeWidth="6" strokeLinecap="round" markerEnd="url(#rayleighArrow)"/><Text x="1050" y="660" size={24} fill="#9b542b" weight={700}>solo el rojo llega hasta vos</Text></g>
    <g opacity={blueScatter*(1-sunset)}>{[540,760,980].map((sx,i)=><g key={i}><path d={`M${sx-16} ${sunY} Q${sx} ${sunY-13} ${sx+16} ${sunY}`} fill="none" stroke="#e64b3b" strokeWidth="2.5" opacity=".5"/><path d={`M${sx-16} ${sunY} Q${sx} ${sunY-28} ${sx+16} ${sunY}`} fill="none" stroke="#57bb69" strokeWidth="2.5" opacity=".55"/>{particle(sx,sunY,'#2c9ed6',1,7)}<path d={`M${sx} ${sunY} Q${(sx+eyeX)/2} ${(sunY+eyeY)/2+20} ${eyeX-28} ${eyeY-26}`} fill="none" stroke="#1c9fd2" strokeWidth="4" markerEnd="url(#rayleighArrow)"/></g>)}<Text x="560" y="392" size={25} fill="#1c6e99" weight={700}>el azul se dispersa mucho y te llega desde el cielo</Text><Text x="560" y="425" size={20} fill="#526772">(el rojo y el verde casi no se desvían: apenas se nota el bulto)</Text></g>
    <g opacity={sunset}>{[300,430,560].map((sx,i)=><g key={i}>{particle(sx,sunY-6,'#2c9ed6',1,7)}<path d={`M${sx} ${sunY-6} Q${sx+30} ${sunY-95} ${sx+80} ${sunY-155}`} fill="none" stroke="#1c9fd2" strokeWidth="4" markerEnd="url(#rayleighArrow)"/></g>)}<Text x="300" y="330" size={24} fill="#1c6e99" weight={700}>el azul se dispersa antes: no llega a tus ojos</Text></g>
    <rect x="80" y="875" width="1330" height="115" rx="18" fill="#18394a"/><Text x="120" y="920" size={31} fill="#f6ce59" weight={700}>{titles[step]}</Text><Text x="120" y="963" size={25} fill="#e4edf0">{notes[step]}</Text>
    <rect x="1470" y="275" width="370" height="715" rx="24" fill="#18394a"/><Text x="1510" y="340" size={29} fill="#fff" weight={700}>Lectura guiada</Text><circle cx="1518" cy="390" r="10" fill="#f6ce59"/><Text x="1545" y="400" size={23} fill="#f6ce59" weight={700}>azul</Text><Text x="1510" y="435" size={22} fill="#cfe4eb">λ corta → dispersión</Text><circle cx="1518" cy="490" r="10" fill="#ef7041"/><Text x="1545" y="500" size={23} fill="#ef9e70" weight={700}>rojo</Text><Text x="1510" y="535" size={22} fill="#cfe4eb">λ larga → sigue más recto</Text><Text x="1510" y="635" size={25} fill="#fff" weight={700}>I ∝ 1 / λ⁴</Text><Text x="1510" y="678" size={21} fill="#cfe4eb">Relación cualitativa:</Text><Text x="1510" y="712" size={21} fill="#cfe4eb">si λ disminuye,</Text><Text x="1510" y="746" size={21} fill="#cfe4eb">la dispersión crece.</Text><Text x="1510" y="855" size={21} fill="#cfe4eb">Animación conceptual:</Text><Text x="1510" y="890" size={21} fill="#cfe4eb">las partículas no están a escala.</Text>
    <Text x="80" y="1040" size={23} fill="#526772">Sistemas Multi Física · Profesor Javier Pereyra</Text>
  </svg></AbsoluteFill>;
};
