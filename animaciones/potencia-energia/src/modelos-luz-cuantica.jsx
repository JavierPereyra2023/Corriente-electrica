import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

// Clase 15 · infografía editable. Todos los rótulos, diagramas y partículas
// se dibujan en SVG a partir del fotograma; no hay texto incrustado en imágenes.
const W = 1920, H = 1080;
const C = {
  paper: '#f7f2e7', white: '#fffdf8', ink: '#173747', muted: '#526b75',
  line: '#d8d2c5', navy: '#163746', teal: '#087f86', cyan: '#41c8d2',
  blue: '#2c7dad', gold: '#dfa933', orange: '#d45f34', violet: '#7956ac',
  red: '#b95b4c', green: '#39866f', silver: '#b7c6ca',
};
const clamp = (v) => Math.max(0, Math.min(1, v));
const reveal = (f, a, b = a + 22) => interpolate(f, [a, b], [0, 1], {
  extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
});
const opacityWindow = (f, a, b) => clamp((f - a) / 14) * clamp((b - f) / 14);

const Text = ({x, y, children, size = 30, color = C.ink, weight = 400, anchor = 'start', opacity = 1, letter = 0}) =>
  <text x={x} y={y} fill={color} fontSize={size} fontWeight={weight} textAnchor={anchor} opacity={opacity} letterSpacing={letter}>{children}</text>;

const Arrow = ({x1, y1, x2, y2, color = C.ink, width = 5, tip = 13, opacity = 1}) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const bx = x2 - tip * Math.cos(angle), by = y2 - tip * Math.sin(angle);
  const perpX = Math.sin(angle) * tip * .48, perpY = -Math.cos(angle) * tip * .48;
  return <g opacity={opacity} stroke={color} fill={color} strokeLinecap="round">
    <line x1={x1} y1={y1} x2={bx} y2={by} strokeWidth={width}/>
    <path d={`M${x2} ${y2} L${bx + perpX} ${by + perpY} L${bx - perpX} ${by - perpY} Z`}/>
  </g>;
};

const Header = ({number, title, subtitle}) => <>
  <Text x={80} y={78} size={25} color={C.teal} weight={800} letter={2}>LUZ · CLASE 15 · {number}</Text>
  <Text x={80} y={156} size={59} weight={750}>{title}</Text>
  <Text x={82} y={207} size={28} color={C.muted}>{subtitle}</Text>
</>;

const Footer = ({chapter}) => <>
  <line x1="80" y1="992" x2="1840" y2="992" stroke="#b79558" strokeWidth="2"/>
  <Text x={82} y={1034} size={23} color={C.muted}>Sistemas Multi Física · Profesor Javier Pereyra</Text>
  <Text x={1836} y={1034} size={23} color={C.teal} weight={700} anchor="end">{chapter}</Text>
</>;

const Base = ({children, label, chapter}) => <AbsoluteFill style={{backgroundColor: C.paper}}>
  <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" fontFamily="Arial, Helvetica, sans-serif" role="img" aria-label={label}>
    <defs>
      <pattern id="paperdots" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="#b6aa91" opacity=".35"/></pattern>
      <linearGradient id="carddark" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#163746"/><stop offset="1" stopColor="#224f5d"/></linearGradient>
      <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#8199a0"/><stop offset=".5" stopColor="#eef3ef"/><stop offset="1" stopColor="#748991"/></linearGradient>
      <linearGradient id="beamviolet" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#9677c8" stopOpacity=".05"/><stop offset="1" stopColor="#9677c8" stopOpacity=".5"/></linearGradient>
      <filter id="softglow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="11"/></filter>
    </defs>
    <rect width={W} height={H} fill={C.paper}/><rect width={W} height={H} fill="url(#paperdots)" opacity=".5"/>
    <rect width={W} height="9" fill={C.teal}/>
    {children}
    <Footer chapter={chapter}/>
  </svg>
</AbsoluteFill>;

const wavePoints = (phase, color, projection = 'E') => {
  const pts = [];
  for (let i = 0; i <= 180; i++) {
    const x = 255 + i * 7.1;
    const s = Math.sin(i * .105 - phase);
    const env = Math.min(1, i / 12, (180 - i) / 13);
    const a = 117 * Math.max(0, env) * s;
    pts.push(projection === 'E' ? `${x},${566-a}` : `${x + a*.52},${566+a*.37}`);
  }
  return <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={projection === 'E' ? 8 : 7} strokeLinecap="round" strokeLinejoin="round"/>;
};

const MaxwellScene = ({frame}) => {
  const phase = frame * .09;
  const energy = reveal(frame, 15);
  const vectors = [25, 53, 81, 109, 137, 165].map((i) => {
    const x = 255 + i * 7.1, a = 117 * Math.sin(i * .105 - phase);
    return <g key={i} opacity=".65">
      <line x1={x} y1="566" x2={x} y2={566-a} stroke={C.orange} strokeWidth="3"/>
      <line x1={x} y1="566" x2={x+a*.52} y2={566+a*.37} stroke={C.cyan} strokeWidth="3"/>
      <circle cx={x} cy="566" r="5" fill={C.white}/>
    </g>;
  });
  return <Base label="Modelo electromagnético de Maxwell: campos E y B perpendiculares entre sí y a la propagación" chapter="01 / 03 · Modelo electromagnético">
    <Header number="01" title="Maxwell: la luz es una onda electromagnética" subtitle="Los campos eléctrico y magnético oscilan juntos y avanzan incluso en el vacío."/>
    <rect x="80" y="262" width="1760" height="566" rx="27" fill="url(#carddark)"/>
    <g opacity={energy}>
      <path d="M240 566 H1570" stroke="#cbd8d9" strokeWidth="3" strokeDasharray="13 13"/>
      <path d="M250 566 L405 675 M395 566 L550 675 M540 566 L695 675 M685 566 L840 675 M830 566 L985 675 M975 566 L1130 675 M1120 566 L1275 675 M1265 566 L1420 675" stroke="#61b0b2" strokeWidth="2" opacity=".25"/>
      <path d="M250 566 L250 368 M390 566 L390 368 M530 566 L530 368 M670 566 L670 368 M810 566 L810 368 M950 566 L950 368 M1090 566 L1090 368 M1230 566 L1230 368 M1370 566 L1370 368" stroke="#e8ac69" strokeWidth="2" opacity=".18"/>
      {vectors}
      {wavePoints(phase, C.orange, 'E')}
      {wavePoints(phase, C.cyan, 'B')}
      <Arrow x1={1570} y1={566} x2={1700} y2={566} color="#e6edef" width={6} tip={18}/>
      <Text x={1530} y={527} size={30} color="#e6edef" weight={700}>avance</Text>
      <Text x={1640} y={352} size={23} color="#c9d9d9" anchor="end">vista oblicua</Text>
      <Arrow x1={245} y1={566} x2={245} y2={414} color={C.orange} width={5}/>
      <Text x={266} y={418} size={38} color="#f1ad80" weight={800}>E</Text>
      <Arrow x1={245} y1={566} x2={322} y2={620} color={C.cyan} width={5}/>
      <Text x={306} y={651} size={38} color="#82e1e3" weight={800}>B</Text>
      <rect x="545" y="716" width="830" height="77" rx="18" fill="#f3f7f3" opacity=".96"/>
      <Text x={960} y={767} size={34} color={C.navy} weight={800} anchor="middle">E ⟂ B ⟂ dirección de avance</Text>
    </g>
    <rect x="94" y="854" width="550" height="88" rx="18" fill={C.white} stroke={C.line} strokeWidth="3"/>
    <Text x={369} y={910} size={31} color={C.teal} weight={700} anchor="middle">En el vacío: c = λ f</Text>
    <rect x="666" y="854" width="1160" height="88" rx="18" fill={C.white} stroke={C.line} strokeWidth="3"/>
    <Text x={1246} y={910} size={28} color={C.muted} anchor="middle">Explica interferencia, difracción y polarización.</Text>
  </Base>;
};

const Photon = ({x, y, color, r = 19, label = false}) => <g>
  <circle cx={x} cy={y} r={r*2.0} fill={color} opacity=".22" filter="url(#softglow)"/>
  <circle cx={x} cy={y} r={r} fill={color} stroke="#fff" strokeWidth="3"/>
  <path d={`M${x-r*.68} ${y} Q${x-r*.34} ${y-r*.7} ${x} ${y} T${x+r*.68} ${y}`} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
  {label && <Text x={x} y={y-31} size={24} color={color} weight={700} anchor="middle">fotón</Text>}
</g>;

const Electron = ({x, y, r = 17}) => <g><circle cx={x} cy={y} r={r} fill={C.cyan} stroke={C.navy} strokeWidth="3"/><line x1={x-8} x2={x+8} y1={y} y2={y} stroke={C.navy} strokeWidth="3"/></g>;

const ExperimentCard = ({x, title, freq, result, color, active, frame}) => {
  const begin = active ? 214 : 190;
  const travel = (frame - begin) * 9;
  const photonX = x + 132 + (travel % 490);
  const impact = active && frame >= 234;
  const electronX = x + 585 + ((frame - 234) * 8 % 190);
  return <g>
    <rect x={x} y="329" width="820" height="496" rx="25" fill={C.white} stroke={C.line} strokeWidth="3"/>
    <rect x={x} y="329" width="820" height="88" rx="25" fill={active ? '#ece8f6' : '#f7ebe4'}/>
    <rect x={x} y="390" width="820" height="27" fill={active ? '#ece8f6' : '#f7ebe4'}/>
    <Text x={x+410} y={386} size={31} color={active ? C.violet : C.red} weight={800} anchor="middle">{title}</Text>
    <circle cx={x+120} cy="576" r="56" fill={color} opacity=".17"/>
    <circle cx={x+120} cy="576" r="34" fill={color} stroke={C.navy} strokeWidth="3"/>
    <path d={`M${x+85} 620 L${x+65} 669 M${x+155} 620 L${x+175} 669`} stroke={C.navy} strokeWidth="5"/>
    <Text x={x+120} y={707} size={25} color={C.muted} anchor="middle">luz {active ? 'violeta' : 'roja'}</Text>
    <path d={`M${x+185} 576 H${x+585}`} stroke={color} opacity=".35" strokeWidth="10" strokeLinecap="round"/>
    {frame >= begin && frame < 356 && <Photon x={Math.min(x+581, photonX)} y={576} color={color} r={17}/>}
    <rect x={x+585} y="489" width="54" height="174" rx="7" fill="url(#metal)" stroke={C.navy} strokeWidth="3"/>
    <Text x={x+612} y={707} size={25} color={C.muted} anchor="middle">metal</Text>
    {impact && <><Arrow x1={x+652} y1={576} x2={x+755} y2={576} color={C.teal} width={4} opacity={.75}/><Electron x={Math.min(x+755, electronX)} y={576}/></>}
    {!active && <Text x={x+714} y={586} size={42} color={C.red} weight={700} anchor="middle">×</Text>}
    <rect x={x+44} y="744" width="732" height="58" rx="12" fill={active ? '#e8f4f0' : '#fbeee8'}/>
    <Text x={x+410} y={783} size={28} color={active ? C.green : C.red} weight={700} anchor="middle">{freq} · {result}</Text>
  </g>;
};

const ThresholdScene = ({frame}) => <Base label="Efecto fotoeléctrico: por debajo de la frecuencia umbral no salen electrones; por encima sí" chapter="02 / 03 · Umbral fotoeléctrico">
  <Header number="02" title="Einstein: un fotón entrega energía hf" subtitle="Para este metal, el fotón debe aportar al menos W (energía de extracción) para liberar un electrón."/>
  <ExperimentCard x={80} title="POR DEBAJO DEL UMBRAL" freq="f < f₀" result="no salen electrones" color={C.red} active={false} frame={frame}/>
  <ExperimentCard x={1020} title="POR ENCIMA DEL UMBRAL" freq="f > f₀" result="sí salen electrones" color={C.violet} active={true} frame={frame}/>
  <rect x="314" y="853" width="1292" height="92" rx="19" fill={C.navy}/>
  <Text x={960} y={911} size={37} color="#fffdf7" weight={800} anchor="middle">Umbral: h f₀ = W   ·   Por encima: Kₘₐₓ = h f − W</Text>
</Base>;

const BeamComparison = ({x, photons, frame, title, caption}) => {
  const count = photons;
  return <g>
    <rect x={x} y="370" width="804" height="395" rx="24" fill={C.white} stroke={C.line} strokeWidth="3"/>
    <Text x={x+402} y={432} size={33} color={C.navy} weight={800} anchor="middle">{title}</Text>
    <path d={`M${x+82} 569 H${x+599}`} stroke={C.violet} strokeWidth="8" opacity=".2"/>
    {Array.from({length: count}, (_, i) => {
      const phase = ((frame * 7 + i * 140) % 455);
      const px = x + 100 + phase;
      return <Photon key={i} x={px} y={525 + (i%3-1)*45} color={C.violet} r={16}/>;
    })}
    <rect x={x+597} y="478" width="49" height="174" rx="6" fill="url(#metal)" stroke={C.navy} strokeWidth="3"/>
    {Array.from({length: count}, (_, i) => {
      const phase = ((frame * 7 + i * 140 + 95) % 455);
      return phase > 310 ? <Electron key={i} x={x+646+((phase-310)*.92)} y={525+(i%3-1)*45} r={13}/> : null;
    })}
    <rect x={x+42} y="681" width="720" height="60" rx="13" fill="#e8f4f0"/>
    <Text x={x+402} y={721} size={29} color={C.teal} weight={700} anchor="middle">{caption}</Text>
  </g>;
};

const IntensityScene = ({frame}) => <Base label="A igual frecuencia por encima del umbral, mayor intensidad aporta más fotones y libera más electrones; la energía cinética máxima no cambia" chapter="03 / 03 · Modelos complementarios">
  <Header number="03" title="Más intensidad: más fotones, más electrones" subtitle="Con la frecuencia fija y por encima del umbral, no aumenta la energía de cada fotón."/>
  <rect x="80" y="268" width="1760" height="82" rx="17" fill={C.navy}/>
  <Text x={960} y={321} size={33} color={C.white} weight={800} anchor="middle">MISMA FRECUENCIA f &gt; f₀   ·   MISMO METAL   ·   MISMO Kₘₐₓ</Text>
  <BeamComparison x={80} photons={2} frame={frame} title="MENOR INTENSIDAD" caption="Llegan menos fotones → salen menos e⁻"/>
  <BeamComparison x={1036} photons={5} frame={frame} title="MAYOR INTENSIDAD" caption="Llegan más fotones → salen más e⁻"/>
  <rect x="80" y="795" width="1760" height="143" rx="20" fill="#e9f0ef" stroke="#aec8c5" strokeWidth="2"/>
  <Text x={960} y={849} size={36} color={C.navy} weight={800} anchor="middle">Dos modelos que se complementan</Text>
  <Text x={960} y={904} size={29} color={C.muted} anchor="middle">La onda describe propagación e interferencia; el fotón explica la entrega de energía al metal.</Text>
</Base>;

export const ModelosLuzCuantica = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill>
    <AbsoluteFill style={{opacity: opacityWindow(f, -14, 178)}}><MaxwellScene frame={f}/></AbsoluteFill>
    <AbsoluteFill style={{opacity: opacityWindow(f, 166, 359)}}><ThresholdScene frame={f}/></AbsoluteFill>
    <AbsoluteFill style={{opacity: opacityWindow(f, 347, 555)}}><IntensityScene frame={f}/></AbsoluteFill>
  </AbsoluteFill>;
};
