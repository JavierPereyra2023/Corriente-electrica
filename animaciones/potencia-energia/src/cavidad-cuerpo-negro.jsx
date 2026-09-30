import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';

// Rayos de óptica geométrica: la opacidad representa intensidad de un haz,
// no la pérdida gradual de energía de un fotón individual.
const C={paper:'#f8f3e8',ink:'#19394a',muted:'#546c76',gold:'#b48b43',red:'#ff9660',cyan:'#73dcd9'};
const T=({x,y,children,size=32,color=C.ink,bold=false,anchor='start'})=><text x={x} y={y} fill={color} fontSize={size} fontWeight={bold?700:400} textAnchor={anchor}>{children}</text>;
const points=[[115,617.5],[340,550],[900,382],[860,370],[340,526],[900,694],[713.333,750],[340,638]];
const pathLengths=points.slice(1).map((v,i)=>Math.hypot(v[0]-points[i][0],v[1]-points[i][1]));
const pathTotal=pathLengths.reduce((a,b)=>a+b,0);
const reachedPoint=(index,progress)=>progress*pathTotal>=pathLengths.slice(0,index).reduce((a,b)=>a+b,0);
const posOnPath=(pts,p)=>{
  const lengths=pts.slice(1).map((v,i)=>Math.hypot(v[0]-pts[i][0],v[1]-pts[i][1]));
  let distance=p*lengths.reduce((a,b)=>a+b,0);
  for(let i=0;i<lengths.length;i++){
    if(distance<=lengths[i]){const q=distance/lengths[i];return {x:pts[i][0]+q*(pts[i+1][0]-pts[i][0]),y:pts[i][1]+q*(pts[i+1][1]-pts[i][1]),segment:i};}
    distance-=lengths[i];
  }
  return {x:pts.at(-1)[0],y:pts.at(-1)[1],segment:lengths.length-1};
};
// Radiancia espectral B_lambda: SI antes de normalizar por un único valor común.
const radiance=(um,temp)=>{const l=um*1e-6;return 2*6.62607015e-34*299792458**2/(l**5*Math.expm1(6.62607015e-34*299792458/(l*1.380649e-23*temp)));};
const max5000=radiance(2897.771955/5000,5000);
const plot=(temp)=>Array.from({length:301},(_,i)=>{const um=.1+i*2.9/300;return `${185+um/3*880},${820-radiance(um,temp)/max5000*440}`;}).join(' ');

export const CavidadCuerpoNegro=()=>{
  const frame=useCurrentFrame(),scene=Math.min(2,Math.floor(frame/240)),local=frame%240;
  const hot=scene===1;
  const progress=interpolate(local,[0,170],[0,1],{extrapolateRight:'clamp'});
  return <AbsoluteFill style={{backgroundColor:C.paper}}>
    <svg width="100%" height="100%" viewBox="0 0 1200 1200" fontFamily="Arial, sans-serif" aria-label="Cavidad de cuerpo negro: absorción, emisión térmica y espectro de Planck">
      <defs>
        <linearGradient id="shell" x2="0" y2="1"><stop stopColor="#aec3c9"/><stop offset=".45" stopColor="#476878"/><stop offset="1" stopColor="#274655"/></linearGradient>
        <radialGradient id="heat"><stop stopColor="#713e2b"/><stop offset="1" stopColor="#1b2731"/></radialGradient>
        <pattern id="hatch" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M0 12L12 0" stroke="#dde6e4" opacity=".2"/></pattern>
      </defs>
      <rect width="1200" height="10" fill={C.gold}/>
      <T x={70} y={65} size={25} color="#816331" bold>CLASE 15 · MAX PLANCK · RADIACIÓN TÉRMICA</T>
      <T x={70} y={130} size={52} bold>{['Una cavidad que absorbe','La cavidad caliente emite','El espectro cambia con T'][scene]}</T>
      <T x={70} y={181} size={29}>{['La luz entra por un orificio pequeño y encuentra muchas paredes.','Las paredes emiten radiación propia, aun sin luz que entre.','Mismos ejes y misma escala para comparar ambas temperaturas.'][scene]}</T>
      {['1 · Absorción','2 · Emisión térmica','3 · Espectro'].map((s,i)=><g key={s}><rect x={70+i*358} y="208" width="340" height="55" rx="8" fill={i===scene?C.ink:'#e9e3d5'}/><T x={240+i*358} y={244} anchor="middle" size={28} color={i===scene?'#fff9ed':C.muted} bold>{s}</T></g>)}
      {scene<2?<>
        <rect x="70" y="283" width="1060" height="590" rx="22" fill="#102c3c"/>
        <T x={105} y={329} size={29} color="#f5e7c7" bold>{hot?'Radiación que sale':'Haz incidente'}</T>
        <T x={615} y={329} size={28} color="#f5e7c7">Cavidad · vista en corte</T>
        <rect x="312" y="342" width="616" height="436" rx="18" fill="url(#shell)"/>
        <rect x="312" y="342" width="616" height="436" rx="18" fill="url(#hatch)"/>
        <rect x="340" y="370" width="560" height="380" fill={hot?'url(#heat)':'#091c27'}/>
        <rect x="310" y="530" width="32" height="40" fill="#102c3c"/>
        {hot?<>
          <path d="M340 530V370H900V750H340V570" fill="none" stroke={C.red} strokeWidth="8" opacity=".7"/>
          {Array.from({length:8},(_,i)=>{
            const a=(local+i*26)%135/135;
            const paths=[[[890,490],[340,550],[105,576]],[[600,380],[340,550],[105,704]],[[690,742],[340,550],[105,421]]];
            const pts=paths[i%3],p=posOnPath(pts,a);
            return <g key={i}><polyline points={pts.map(v=>v.join(',')).join(' ')} fill="none" stroke={i%2?C.red:C.cyan} opacity=".1" strokeWidth="2"/><circle cx={p.x} cy={p.y} r="7" fill={i%2?C.red:C.cyan}/><circle cx={p.x} cy={p.y} r="16" fill={i%2?C.red:C.cyan} opacity=".1"/></g>;
          })}
          {[0,1,2].map(i=><path key={i} d={`M${470+i*150} 822 q-22 -14 0 -28 t0 -28`} fill="none" stroke="#ffb67a" strokeWidth="4" opacity={.5+.3*Math.sin(local/10+i)}/>)}
          <T x={610} y={853} size={25} anchor="middle" color="#f9dbb8">Paredes mantenidas a temperatura uniforme T</T>
        </>:<>
          {points.slice(1).map((v,i)=>{
            const a=points[i];
            return <line key={i} x1={a[0]} y1={a[1]} x2={v[0]} y2={v[1]} stroke="#f3ca68" strokeWidth={5} opacity={reachedPoint(i,progress)?Math.pow(.70,i):.06}/>;
          })}
          {local<190&&(()=>{const p=posOnPath(points,progress);return <g><circle cx={p.x} cy={p.y} r="10" fill="#ffda7d" opacity={Math.pow(.7,p.segment)}/><circle cx={p.x} cy={p.y} r="23" fill="#ffda7d" opacity={.2*Math.pow(.7,p.segment)}/></g>;})()}
          {points.slice(2).map((v,i)=><circle key={i} cx={v[0]} cy={v[1]} r={10} fill="#f5a96b" opacity={reachedPoint(i+2,progress)?.7:0}/>)}
          <T x={610} y={844} size={27} anchor="middle" color="#ead7aa">Cada encuentro aumenta la posibilidad de absorción</T>
        </>}
        <T x={102} y={765} size={27} color="#dae6e8">Orificio</T>
        <T x={102} y={801} size={27} color="#dae6e8">pequeño</T>
        <path d="M175 729L310 574" fill="none" stroke="#8dabb8" strokeWidth="2"/>
        <rect x="70" y="898" width="1060" height="174" rx="14" fill="#e6ece7"/>
        <T x={95} y={942} size={30} bold>{hot?'La radiación emitida depende de la temperatura.':'El orificio se aproxima a un absorbedor ideal.'}</T>
        <T x={95} y={984} size={28}>{hot?'Solo una parte sale por el orificio; el resto interactúa con las paredes.':'En cada encuentro se absorbe parte de la intensidad del haz.'}</T>
        <T x={95} y={1026} size={28}>{hot?'Los rayos de colores representan un espectro continuo.':'Un fotón individual se absorbe completo o sigue propagándose.'}</T>
      </>:<>
        <rect x="70" y="283" width="1060" height="605" rx="22" fill="#fffdf8" stroke="#d5d0c5"/>
        <T x={185} y={327} size={27} bold>Radiancia espectral relativa</T>
        {[0,.25,.5,.75,1].map(v=><g key={v}><line x1="185" y1={820-v*440} x2="1065" y2={820-v*440} stroke="#ded9ce"/><T x={164} y={830-v*440} size={23} anchor="end" color={C.muted}>{v.toString().replace('.',',')}</T></g>)}
        {[0,.5,1,1.5,2,2.5,3].map(v=><g key={v}><line x1={185+v/3*880} y1="370" x2={185+v/3*880} y2="820" stroke="#e8e3d9"/><T x={185+v/3*880} y={854} size={23} anchor="middle" color={C.muted}>{v.toString().replace('.',',')}</T></g>)}
        <path d="M185 363V820H1077" fill="none" stroke={C.ink} strokeWidth="3"/>
        <polyline points={plot(3000)} fill="none" stroke="#bb6347" strokeWidth="5"/>
        <polyline points={plot(5000)} fill="none" stroke="#247eaa" strokeWidth="5" strokeDasharray="3000" strokeDashoffset={3000*(1-progress)}/>
        <T x={605} y={882} size={26}>Longitud de onda λ (µm)</T>
        <T x={520} y={419} size={32} bold color="#247eaa">5000 K · pico ≈ 0,580 µm</T>
        <T x={600} y={690} size={30} bold color="#bb6347">3000 K · pico ≈ 0,966 µm</T>
        <line x1="355" y1="380" x2="355" y2="818" stroke="#247eaa" strokeDasharray="5 8" opacity=".35"/>
        <line x1="468" y1="788" x2="468" y2="818" stroke="#bb6347" strokeDasharray="5 8"/>
        <rect x="70" y="905" width="1060" height="167" rx="14" fill="#e6ece7"/>
        <T x={95} y={950} size={31} bold>Al aumentar T: mayor emisión total y un pico hacia menor λ.</T>
        <T x={95} y={997} size={29}>Planck explicó la forma del espectro mediante cuantos de energía.</T>
        <T x={95} y={1040} size={27}>Escala común: ambas curvas se dividen por el pico a 5000 K.</T>
      </>}
      <T x={70} y={1112} size={24} color={C.muted}>Modelo visual: rayos esquemáticos; no son órbitas ni una medición escolar.</T>
      <line x1="70" y1="1136" x2="1130" y2="1136" stroke={C.gold}/>
      <T x={70} y={1174} size={23} color={C.muted}>Sistemas Multi Física · Profesor Javier Pereyra</T>
      <T x={1130} y={1174} size={23} color={C.muted} anchor="end">{scene+1} / 3</T>
    </svg>
  </AbsoluteFill>;
};
