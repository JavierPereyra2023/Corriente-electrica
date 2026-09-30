import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

// Modelo cualitativo de absorción de un fotón: no simula corriente ni rendimiento.
// Los fotones terminan en la superficie; solo entonces comienza la emisión.
const cases = [
  {nm:650, intensity:1, energy:'1,91', kinetic:'—', color:'#ee776c'},
  {nm:650, intensity:5, energy:'1,91', kinetic:'—', color:'#ee776c'},
  {nm:450, intensity:1, energy:'2,76', kinetic:'0,56', color:'#71abff'},
  {nm:450, intensity:5, energy:'2,76', kinetic:'0,56', color:'#71abff'},
];
const T = ({x,y,children,size=32,fill='#19394a',bold=false,anchor='start'}) => <text x={x} y={y} fill={fill} fontSize={size} fontWeight={bold?700:400} textAnchor={anchor}>{children}</text>;
export const LaboratorioFotoelectrico = () => {
  const frame=useCurrentFrame();
  const scene=Math.min(3,Math.floor(frame/180));
  const local=frame%180;
  const c=cases[scene];
  const emitted=c.nm===450;
  const interval=c.intensity===1?48:12;
  const particles=[];
  for(let born=0;born<=local;born+=interval){
    const age=local-born;
    const lane=(Math.floor(born/interval)%3)-1;
    const hitX=530+lane*30;
    if(age<48){
      const p=age/48;
      const x=230+(hitX-230)*p, y=346+304*p;
      particles.push(<g key={`p${born}`} transform={`translate(${x} ${y}) rotate(45)`}>
        <ellipse rx="30" ry="18" fill={c.color} opacity=".13"/>
        <path d="M-23 0 Q-17 -14 -11 0 T1 0 T13 0 T25 0" fill="none" stroke={c.color} strokeWidth="5"/>
      </g>);
    }
    if(age>=48&&age<59) particles.push(<circle key={`h${born}`} cx={hitX} cy="650" r={8+(age-48)*2} fill="none" stroke={c.color} strokeWidth="3" opacity={1-(age-48)/11}/>);
    if(emitted&&age>=48&&age<96){
      const p=(age-48)/48;
      const x=hitX+330*p, y=643-225*p;
      particles.push(<g key={`e${born}`}><line x1={x-19} y1={y+13} x2={x} y2={y} stroke="#65e0d2" strokeWidth="3" opacity=".4"/><circle cx={x} cy={y} r="12" fill="#65e0d2"/><path d={`M${x-5} ${y}h10`} stroke="#123944" strokeWidth="3"/></g>);
    }
  }
  return <AbsoluteFill style={{backgroundColor:'#f8f3e8'}}>
    <svg width="100%" height="100%" viewBox="0 0 1200 1200" fontFamily="Arial, sans-serif" aria-label="Efecto fotoeléctrico: comparación animada de longitud de onda e intensidad">
      <defs>
        <linearGradient id="lab-bg" x2="1" y2="1"><stop stopColor="#17394c"/><stop offset="1" stopColor="#0b2234"/></linearGradient>
        <linearGradient id="lab-metal" x2="0" y2="1"><stop stopColor="#f2f0df"/><stop offset=".25" stopColor="#a8bdc2"/><stop offset="1" stopColor="#577e8c"/></linearGradient>
        <linearGradient id="lab-lamp"><stop stopColor="#849ba6"/><stop offset=".5" stopColor="#e0e8e9"/><stop offset="1" stopColor="#718a96"/></linearGradient>
      </defs>
      <rect width="1200" height="10" fill="#b48b43"/>
      <T x={60} y={60} size={24} fill="#816331" bold>CLASE 15 · LABORATORIO VISUAL</T>
      <T x={60} y={122} size={51} bold>¿Más luz o más energía?</T>
      <T x={60} y={166} size={28}>Un mismo metal · trabajo de extracción W = 2,20 eV</T>
      {[0,1,2,3].map(i=><g key={i}><rect x={60+i*275} y="191" width="255" height="57" rx="10" fill={i===scene?'#19394a':'#e9e3d5'}/><T x={187+i*275} y={228} anchor="middle" size={25} fill={i===scene?'#fff9ed':'#61737b'} bold>{i+1} · {cases[i].nm} nm / {cases[i].intensity===1?'baja':'alta'}</T></g>)}
      <rect x="60" y="269" width="1080" height="470" rx="24" fill="url(#lab-bg)"/>
      <path d="M225 350 L470 650 L600 650 Z" fill={c.color} opacity={c.intensity===1?.07:.17}/>
      <path d="M560 635 L869 425" fill="none" stroke="#87aaa9" strokeWidth="2" strokeDasharray="6 12" opacity={emitted?.5:.15}/>
      <g transform="translate(193 321) rotate(45)"><rect x="-65" y="-38" width="110" height="76" rx="12" fill="url(#lab-lamp)"/><ellipse cx="45" cy="0" rx="14" ry="38" fill={c.color}/><ellipse cx="45" cy="0" rx="8" ry="26" fill="#fff" opacity=".5"/></g>
      <rect x="330" y="650" width="380" height="36" rx="4" fill="url(#lab-metal)"/><path d="M345 687h350l-25 18H365Z" fill="#385e70"/>
      <line x1="368" y1="654" x2="672" y2="654" stroke="#fff" opacity=".7"/>
      {particles}
      <T x={92} y={308} fill="#f9edce" size={27} bold>Fuente de luz</T>
      <T x={92} y={432} fill={c.color} size={34} bold>λ = {c.nm} nm</T>
      <T x={92} y={470} fill="#dae5e8" size={28}>Intensidad {c.intensity===1?'baja (1)':'alta (5)'}</T>
      <T x={335} y={726} fill="#eef4ef" size={27} bold>Superficie metálica</T>
      <rect x="756" y="299" width="350" height="90" rx="12" fill="#254759"/>
      <T x={778} y={335} fill="#fff9ed" size={29} bold>{emitted?'Hay emisión':'Sin emisión'}</T>
      <T x={778} y={371} fill={emitted?'#65e0d2':'#f7a59d'} size={26}>{emitted?'E > W · salen electrones':'E < W · no alcanza'}</T>
      <T x={754} y={480} fill="#65e0d2" size={27} bold>{emitted?'Electrones emitidos':'No salen electrones'}</T>
      <T x={754} y={521} fill="#dce6e8" size={26}>{emitted?'Kₘáₓ = 0,56 eV':'Aun aumentando la luz'}</T>
      <T x={754} y={584} fill="#f9edce" size={25}>{emitted&&c.intensity===5?'Más electrones por segundo':emitted?'Menos electrones por segundo':'Cada fotón sigue con 1,91 eV'}</T>
      <T x={754} y={624} fill="#dce6e8" size={24}>{emitted?'La energía máxima no cambia':'La energía no se acumula*'}</T>
      <rect x="60" y="757" width="1080" height="88" rx="12" fill="#e5ede9"/>
      <T x={86} y={794} size={29} bold>E por fotón = {c.energy} eV</T>
      <T x={86} y={830} size={26}>{emitted?'2,76 eV = 2,20 eV para salir + 0,56 eV de energía cinética máxima':'1,91 eV < 2,20 eV: aumentar la intensidad no supera el umbral'}</T>
      <T x={60} y={883} size={27} bold>Comparación · mismo material</T>
      <T x={490} y={883} size={25} bold>Emisión</T><T x={790} y={883} size={25} bold>Kₘáₓ</T>
      {cases.map((row,i)=><g key={`row${i}`}><rect x="60" y={897+i*44} width="1080" height="42" rx="6" fill={i===scene?'#dce7e7':i%2?'#efeadd':'#f8f3e8'}/><T x={80} y={926+i*44} size={25}>{row.nm} nm · intensidad {row.intensity}</T><T x={490} y={926+i*44} size={25}>{i<2?'Ninguna':i===2?'Menor cantidad':'Mayor cantidad'}</T><T x={790} y={926+i*44} size={25}>{i<2?'No corresponde':'0,56 eV'}</T></g>)}
      <T x={60} y={1111} size={23} fill="#586b73">* Modelo de un fotón. Trayectorias y cantidades esquemáticas.</T>
      <line x1="60" y1="1137" x2="1140" y2="1137" stroke="#b48b43"/>
      <T x={60} y={1174} size={23} fill="#586b73">Sistemas Multi Física · Profesor Javier Pereyra</T>
      <T x={1140} y={1174} size={23} fill="#586b73" anchor="end">{scene+1} / 4</T>
    </svg>
  </AbsoluteFill>;
};
