import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

// Infografía de clase 15. SVG generado por JavaScript; movimiento determinista.
// Cada electrón comienza después de la absorción de un fotón en la cara iluminada.
const C={paper:'#f8f3e8',ink:'#19394a',muted:'#536b76',gold:'#b48b43',cyan:'#6be0db',orange:'#ffaf76',violet:'#ad9bff',red:'#f58d83'};
const T=({x,y,children,size=32,color=C.ink,bold=false,anchor='start'})=><text x={x} y={y} fill={color} fontSize={size} fontWeight={bold?700:400} textAnchor={anchor}>{children}</text>;
const Arrow=({x1,y1,x2,y2,color=C.cyan})=>{const a=Math.atan2(y2-y1,x2-x1);return <g stroke={color} strokeWidth="4" fill={color}><line x1={x1} y1={y1} x2={x2} y2={y2}/><path d={`M${x2} ${y2}l${-16*Math.cos(a)+7*Math.sin(a)} ${-16*Math.sin(a)-7*Math.cos(a)}l${-14*Math.sin(a)} ${14*Math.cos(a)}Z`}/></g>;};

const Experiment=({y,frame,intensity=1,emits=true,title,threshold=false})=>{
  const color=emits?C.violet:C.red;
  const period=intensity===1?54:14;
  const marks=[];
  for(let born=0;born<=frame;born+=period){
    const age=frame-born, lane=(Math.floor(born/period)%3)-1,hit=620+lane*28;
    if(age<50){const p=age/50;const x=350+(hit-350)*p,py=y+104+110*p;
      marks.push(<g key={`p${born}`} transform={`translate(${x} ${py}) rotate(23)`}><ellipse rx="25" ry="15" fill={color} opacity=".15"/><path d="M-23 0q6 -13 12 0t12 0t12 0" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"/></g>);
    }
    if(age>=50&&age<60)marks.push(<circle key={`impact${born}`} cx={hit} cy={y+214} r={8+(age-50)*2} fill="none" stroke={color} strokeWidth="3" opacity={1-(age-50)/10}/>);
    if(emits&&age>=50&&age<100){const p=(age-50)/50,x=hit+300*p,py=y+205-85*p;
      marks.push(<g key={`e${born}`}><line x1={x-25} y1={py+7} x2={x-8} y2={py+2} stroke={C.cyan} strokeWidth="3" opacity=".4"/><circle cx={x} cy={py} r="18" fill={C.cyan} opacity=".13"/><circle cx={x} cy={py} r="10" fill={C.cyan}/><path d={`M${x-4} ${py}h8`} stroke="#173b48" strokeWidth="3"/></g>);
    }
  }
  return <g>
    <rect x="70" y={y} width="1060" height="302" rx="22" fill="url(#visual-dark)"/>
    <rect x="70" y={y} width="7" height="302" rx="3" fill={color}/>
    <T x={105} y={y+46} size={36} color="#fff5df" bold>{title}</T>
    <T x={105} y={y+128} size={33} color={color} bold>{threshold?(emits?'450 nm':'650 nm'):'450 nm'}</T>
    <T x={105} y={y+168} size={27} color="#d4e2e7">{emits?'E = 2,76 eV':'E = 1,91 eV'}</T>
    <path d={`M350 ${y+104}L485 ${y+214}H710Z`} fill={color} opacity={intensity===1?.065:.15}/>
    <g transform={`translate(318 ${y+91}) rotate(23)`}><rect x="-46" y="-24" width="72" height="48" rx="7" fill="url(#visual-metal)"/><ellipse cx="29" rx="9" ry="24" fill={color}/><ellipse cx="31" rx="5" ry="16" fill="#fff" opacity=".3"/></g>
    <path d={`M485 ${y+240}H800L782 ${y+256}H502Z`} fill="#365a69"/>
    <rect x="485" y={y+214} width="315" height="26" rx="4" fill="url(#visual-metal)"/>
    <line x1="499" y1={y+216} x2="785" y2={y+216} stroke="#f7fbf1" opacity=".65"/>
    {marks}
    <T x={643} y={y+286} size={26} color="#d3e3e8" anchor="middle">Mismo metal · W = 2,20 eV</T>
    <T x={817} y={y+211} size={29} color={emits?C.cyan:C.red} bold>{emits?'Salen electrones':'Sin emisión'}</T>
    <T x={817} y={y+253} size={27} color="#d3e3e8">{emits?'Kₘáₓ ≈ 0,56 eV':'E < W'}</T>
  </g>;
};

const Wave=({frame})=>{
  const phase=frame*.09;
  const curve=(kind)=>Array.from({length:221},(_,i)=>{
    const x=210+i*3.65,a=105*Math.sin(i*.066-phase);
    return kind==='E'?`${x},${568-a}`:`${x+a*.42},${568+a*.52}`;
  }).join(' ');
  return <>
    <rect x="70" y="308" width="1060" height="530" rx="24" fill="url(#visual-dark)"/>
    <path d="M183 568H1074" stroke="#a9c7d1" strokeWidth="2" strokeDasharray="9 12" opacity=".6"/>
    {[0,1,2,3,4,5].map(i=><path key={i} d={`M${210+i*142} 568l90 105v-200l-90 -105v200`} fill="none" stroke="#b1d2d8" opacity=".09"/>)}
    {Array.from({length:16},(_,i)=>{const x=210+i*49,a=105*Math.sin(i*49/3.65*.066-phase);return <g key={i}><line x1={x} y1="568" x2={x} y2={568-a} stroke={C.orange} opacity=".42" strokeWidth="3"/><line x1={x} y1="568" x2={x+a*.42} y2={568+a*.52} stroke={C.cyan} opacity=".42" strokeWidth="3"/></g>;})}
    <polyline points={curve('E')} fill="none" stroke={C.orange} strokeWidth="16" opacity=".09"/>
    <polyline points={curve('B')} fill="none" stroke={C.cyan} strokeWidth="16" opacity=".09"/>
    <polyline points={curve('E')} fill="none" stroke={C.orange} strokeWidth="6"/>
    <polyline points={curve('B')} fill="none" stroke={C.cyan} strokeWidth="6"/>
    <Arrow x1={1055} y1={568} x2={1098} y2={568} color="#e4eeee"/>
    <T x={105} y={357} size={32} color={C.orange} bold>Campo eléctrico E</T>
    <T x={1100} y={357} size={32} color={C.cyan} bold anchor="end">Campo magnético B</T>
    <T x={1045} y={712} size={26} color="#e0ecef" anchor="end">Avance →</T>
    <rect x="215" y="741" width="770" height="67" rx="12" fill="#e9f1ed"/>
    <T x={600} y={786} size={34} anchor="middle" bold>E ⟂ B ⟂ dirección de propagación</T>
    <rect x="70" y="872" width="1060" height="195" rx="18" fill="#e6ece7"/>
    <T x={105} y={925} size={36} bold>En el vacío: c = λ f</T>
    <T x={105} y={974} size={30}>Los campos oscilan en fase. La onda transporta energía.</T>
    <T x={105} y={1022} size={28}>Las curvas muestran valores del campo, no caminos de partículas.</T>
  </>;
};

export const ModelosLuzCuantica=()=>{
  const frame=useCurrentFrame(),stage=Math.min(2,Math.floor(frame/240)),local=frame%240;
  return <AbsoluteFill style={{backgroundColor:C.paper}}>
    <svg width="100%" height="100%" viewBox="0 0 1200 1200" fontFamily="Arial, sans-serif" aria-label="Comparación animada de los modelos de Maxwell y Einstein">
      <defs>
        <linearGradient id="visual-dark" x2="1" y2="1"><stop stopColor="#214a5a"/><stop offset="1" stopColor="#0c2435"/></linearGradient>
        <linearGradient id="visual-metal" x2="0" y2="1"><stop stopColor="#f1f5ed"/><stop offset=".25" stopColor="#bccdd0"/><stop offset=".6" stopColor="#6d8d9a"/><stop offset="1" stopColor="#d4e2dd"/></linearGradient>
      </defs>
      <rect width="1200" height="10" fill={C.gold}/>
      <T x={70} y={65} size={25} color="#816331" bold>LUZ · CLASE 15 · MODELOS QUE SE COMPLEMENTAN</T>
      <T x={70} y={130} size={50} bold>{['Maxwell: una onda de campos','Einstein: la energía de un fotón','Más intensidad, más emisiones'][stage]}</T>
      <T x={70} y={181} size={29}>{['La luz se propaga incluso en el vacío.','La frecuencia determina la energía: E = hf.','Misma frecuencia, mismo metal y misma energía cinética máxima.'][stage]}</T>
      {['1 · Campos E y B','2 · Frecuencia umbral','3 · Intensidad'].map((s,i)=><g key={s}><rect x={70+i*358} y="212" width="340" height="55" rx="9" fill={i===stage?C.ink:'#e9e3d5'}/><T x={240+i*358} y={249} size={27} color={i===stage?'#fff9ed':C.muted} anchor="middle" bold>{s}</T></g>)}
      {stage===0?<Wave frame={local}/>:<>
        <Experiment y={303} frame={local} emits={stage===2} threshold={stage===1} title={stage===1?'POR DEBAJO DEL UMBRAL':'MENOR INTENSIDAD'} intensity={1}/>
        <Experiment y={627} frame={local} emits threshold={stage===1} title={stage===1?'POR ENCIMA DEL UMBRAL':'MAYOR INTENSIDAD'} intensity={stage===1?1:4}/>
        <rect x="70" y="955" width="1060" height="119" rx="16" fill="#e6ece7"/>
        <T x={105} y={1000} size={32} bold>{stage===1?'Un fotón debe aportar suficiente energía para liberar un electrón.':'Más fotones por segundo → más electrones por segundo.'}</T>
        <T x={105} y={1046} size={29}>{stage===1?'Por encima del umbral: Kₘáₓ = hf − W.':'La intensidad no aumenta la energía de cada fotón ni Kₘáₓ.'}</T>
      </>}
      <T x={70} y={1113} size={23} color={C.muted}>Símbolos y cantidades esquemáticos · modelo de absorción de un fotón</T>
      <line x1="70" y1="1136" x2="1130" y2="1136" stroke={C.gold}/>
      <T x={70} y={1174} size={23} color={C.muted}>Sistemas Multi Física · Profesor Javier Pereyra</T>
      <T x={1130} y={1174} size={23} color={C.muted} anchor="end">{stage+1} / 3</T>
    </svg>
  </AbsoluteFill>;
};
