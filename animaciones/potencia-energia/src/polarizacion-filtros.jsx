import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

const C={paper:'#f7f2e6',card:'#fffdf7',ink:'#17384a',muted:'#536976',teal:'#087a80',blue:'#2674a8',gold:'#e3ae32',coral:'#d85a2a',line:'#d8d2c4',deep:'#142b38'};
const fade=(frame,start,end)=>interpolate(frame,[start,end],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.inOut(Easing.cubic)});
const Text=({x,y,size=30,fill=C.ink,weight=400,anchor='start',opacity=1,children})=><text x={x} y={y} fontSize={size} fill={fill} fontWeight={weight} textAnchor={anchor} opacity={opacity}>{children}</text>;

const Wave=({x1,x2,y,amplitude=74,phase=0,color=C.coral,opacity=1})=>{
  const points=Array.from({length:121},(_,i)=>{
    const x=x1+(x2-x1)*i/120;
    const value=Math.sin(i/120*Math.PI*6-phase);
    return `${i?'L':'M'}${x},${y-amplitude*value}`;
  }).join(' ');
  return <path d={points} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" opacity={opacity}/>;
};

const Polarizer=({id,x,y,axis='vertical',active=1,label,subLabel})=>{
  const vertical=axis==='vertical';
  return <g opacity={active}>
    <defs><clipPath id={id}><ellipse cx={x} cy={y} rx="54" ry="154"/></clipPath></defs>
    <ellipse cx={x} cy={y} rx="54" ry="154" fill="#8eb8c7" stroke={vertical?C.coral:C.gold} strokeWidth="6"/>
    <g clipPath={`url(#${id})`} stroke="#dce9ed" strokeWidth="7" opacity=".8">
      {vertical
        ?Array.from({length:5},(_,i)=><line key={i} x1={x-36+i*18} y1={y-145} x2={x-36+i*18} y2={y+145}/>)
        :Array.from({length:9},(_,i)=><line key={i} x1={x-52} y1={y-128+i*32} x2={x+52} y2={y-128+i*32}/>) }
    </g>
    <line x1={vertical?x:x-43} y1={vertical?y-112:y} x2={vertical?x:x+43} y2={vertical?y+112:y} stroke="#fff" strokeWidth="11" strokeLinecap="round"/>
    <path d={vertical?`M${x-10} ${y-96} L${x} ${y-116} L${x+10} ${y-96} M${x-10} ${y+96} L${x} ${y+116} L${x+10} ${y+96}`:`M${x-28} ${y-10} L${x-48} ${y} L${x-28} ${y+10} M${x+28} ${y-10} L${x+48} ${y} L${x+28} ${y+10}`} fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
    <Text x={x} y={y+205} size={30} fill={vertical?C.coral:'#b57a00'} weight={700} anchor="middle">{label}</Text>
    <Text x={x} y={y+244} size={26} fill={C.muted} anchor="middle">{subLabel}</Text>
  </g>;
};

export const PolarizacionFiltros=()=>{
  const frame=useCurrentFrame();
  const phase=frame*.22;
  const stage=frame<60?0:frame<120?1:frame<180?2:3;
  const firstFocus=.28+.72*fade(frame,52,76);
  const selected=fade(frame,88,118);
  const secondFocus=.22+.78*fade(frame,166,192);
  const blocked=fade(frame,192,218);
  const sceneOpacity=interpolate(frame,[0,12,228,239],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const steps=[
    ['1 · Luz no polarizada','El campo eléctrico llega con muchas orientaciones transversales.'],
    ['2 · Primer Polaroid','Su eje vertical selecciona la componente paralela.'],
    ['3 · Luz polarizada','Después del primer filtro, E oscila solo en dirección vertical.'],
    ['4 · Analizador cruzado','El segundo eje está a 90°: idealmente no transmite luz.']
  ];
  const rays=[0,45,90,135];
  return <AbsoluteFill style={{backgroundColor:C.paper}}><svg viewBox="0 0 1920 1080" width="100%" height="100%" fontFamily="Arial, sans-serif" role="img" aria-label="Secuencia animada de luz no polarizada, un Polaroid vertical y un segundo Polaroid cruzado">
    <rect width="1920" height="1080" fill={C.paper}/><rect width="1920" height="10" fill={C.teal}/>
    <g opacity={sceneOpacity}>
      <Text x="80" y="76" size={25} fill={C.teal} weight={700}>ONDAS DE LUZ · CLASE 14 · POLARIZACIÓN</Text>
      <Text x="80" y="150" size={58} weight={700}>Dos Polaroid: seleccionar y bloquear</Text>
      <Text x="82" y="205" size={29} fill={C.muted}>La curva representa el campo eléctrico E; la luz se propaga horizontalmente hacia la derecha.</Text>
      <rect x="80" y="265" width="1760" height="575" rx="26" fill={C.card} stroke={C.line} strokeWidth="3"/>
      <rect x="110" y="292" width="1700" height="72" rx="16" fill={C.deep}/>
      <circle cx="150" cy="328" r="20" fill={C.gold}/><Text x="150" y="338" size={25} weight={800} anchor="middle">{stage+1}</Text>
      <Text x="190" y="324" size={31} fill="#fff" weight={700}>{steps[stage][0]}</Text>
      <Text x="190" y="352" size={22} fill="#dce8e7">{steps[stage][1]}</Text>

      <defs>
        <marker id="pol-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="12" markerHeight="12" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill={C.deep}/></marker>
        <marker id="e-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10Z" fill={C.blue}/></marker>
      </defs>
      <line x1="205" y1="520" x2="1490" y2="520" stroke="#9fb2bb" strokeWidth="3" strokeDasharray="12 10"/>
      <Text x="950" y="400" size={25} fill={C.muted} anchor="middle">dirección de propagación</Text>
      <line x1="790" y1="420" x2="1110" y2="420" stroke={C.deep} strokeWidth="4" markerEnd="url(#pol-arrow)"/>

      <g opacity={stage===0?1:.62}>
        <circle cx="245" cy="520" r="92" fill="#edf6f8" stroke={C.blue} strokeWidth="4"/>
        {rays.map((angle)=><line key={angle} x1={245-58*Math.cos(angle*Math.PI/180)} y1={520-58*Math.sin(angle*Math.PI/180)} x2={245+58*Math.cos(angle*Math.PI/180)} y2={520+58*Math.sin(angle*Math.PI/180)} stroke={C.blue} strokeWidth="5" markerStart="url(#e-arrow)" markerEnd="url(#e-arrow)"/>)}
        <circle cx="245" cy="520" r="7" fill={C.coral}/>
        <Text x="245" y="656" size={30} fill={C.blue} weight={700} anchor="middle">luz no polarizada</Text>
        <Text x="245" y="694" size={25} fill={C.muted} anchor="middle">vista transversal de E</Text>
      </g>

      <g opacity={stage===0?1:.58}>
        <line x1="338" y1="520" x2="570" y2="520" stroke={C.gold} strokeWidth="14" opacity=".22"/>
        <line x1="338" y1="520" x2="570" y2="520" stroke={C.gold} strokeWidth="5"/>
      </g>

      <Polarizer id="pol-vertical" x={650} y={520} axis="vertical" active={stage===0?.35:firstFocus} label="1.er Polaroid" subLabel="eje vertical"/>

      <Wave x1={728} x2={1172} y={520} phase={phase} opacity={.12+.88*selected} />
      <g opacity={selected}>
        <line x1="950" y1="430" x2="950" y2="610" stroke={C.coral} strokeWidth="4" markerStart="url(#e-arrow)" markerEnd="url(#e-arrow)"/>
        <Text x="950" y="676" size={31} fill={C.coral} weight={700} anchor="middle">E vertical</Text>
        <Text x="950" y="714" size={25} fill={C.muted} anchor="middle">una sola dirección de oscilación</Text>
      </g>

      <Polarizer id="pol-horizontal" x={1265} y={520} axis="horizontal" active={stage<3?.28:secondFocus} label="2.º Polaroid" subLabel="eje horizontal · 90°"/>

      <g opacity={blocked}>
        <path d="M1338 520 C1372 448 1405 592 1438 520 C1454 486 1470 512 1480 520" fill="none" stroke={C.coral} strokeWidth="7" opacity=".32"/>
        <line x1="1495" y1="430" x2="1495" y2="610" stroke={C.deep} strokeWidth="10" strokeLinecap="round"/>
        <circle cx="1495" cy="520" r="16" fill="#0e1720"/>
        <rect x="1550" y="424" width="230" height="192" rx="18" fill={C.deep}/>
        <Text x="1665" y="478" size={27} fill="#dce8e7" weight={700} anchor="middle">LEY DE MALUS</Text>
        <Text x="1665" y="532" size={31} fill="#fff" weight={700} anchor="middle">I = I₀ cos²φ</Text>
        <Text x="1665" y="580" size={30} fill={C.gold} weight={700} anchor="middle">φ = 90° → I = 0</Text>
        <Text x="1510" y="690" size={30} fill={C.gold} weight={700} anchor="middle">idealmente, no pasa luz</Text>
      </g>

      <g>
        {steps.map((_,i)=><g key={i}><circle cx={330+i*420} cy="905" r="15" fill={stage===i?C.gold:'#93a3aa'}/><Text x={360+i*420} y="916" size={25} fill={stage===i?C.ink:C.muted} weight={stage===i?700:400}>{['muchas direcciones','selecciona vertical','sale polarizada','bloquea a 90°'][i]}</Text></g>)}
      </g>
      <line x1="80" y1="990" x2="1840" y2="990" stroke="#b79454" strokeWidth="2"/>
      <Text x="82" y="1034" size={24} fill={C.muted}>Sistemas Multi Física · Profesor Javier Pereyra</Text>
      <Text x="1835" y="1034" size={24} fill={C.teal} weight={700} anchor="end">observar → comparar → explicar</Text>
    </g>
  </svg></AbsoluteFill>;
};
