import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

// 24 s · 30 fps. Posiciones de energía lineales dentro de cada escala.
// El cambio de nivel es discreto: nunca se interpola la posición del electrón.
const ink = '#19394a';
const gold = '#ac803d';
const red = '#d9584d';
const levels = [2, 3, 4, 5, 6];
const energy = n => -13.6 / (n * n);
const energyY = n => 265 - 150 * energy(n);
const labelY = {2: 775, 3: 492, 4: 393, 5: 347, 6: 317};
const balmer = [
  {n: 3, nm: '656,3', ev: '1,889', color: red},
  {n: 4, nm: '486,1', ev: '2,550', color: '#168ca7'},
  {n: 5, nm: '434,0', ev: '2,856', color: '#4757c4'},
  {n: 6, nm: '410,2', ev: '3,022', color: '#8950c0'},
];
const T = ({x, y, size = 32, fill = ink, bold = false, anchor = 'start', children}) =>
  <text x={x} y={y} fontSize={size} fill={fill} fontWeight={bold ? 700 : 400} textAnchor={anchor}>{children}</text>;

function EnergyDiagram({phase, local}) {
  const active = phase === 1 ? (local >= 80 ? 3 : 2) : phase === 2 ? (local >= 50 ? 2 : 3) : 2;
  const arrowOpacity = phase === 1 || phase === 2 ? interpolate(local, [0, 24], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'}) : 0;
  return <g>
    <T x={90} y={280} size={30} bold>Escala completa</T>
    <line x1="150" y1="775" x2="150" y2="325" stroke={gold} strokeWidth="3" markerEnd="url(#bohr-gold-arrow)"/>
    <line x1="130" y1="345" x2="290" y2="345" stroke={ink} strokeWidth="3" strokeDasharray="7 6"/>
    <T x={165} y={333} size={27}>0 eV</T>
    <line x1="130" y1={345 + 3.4 * 30} x2="290" y2={345 + 3.4 * 30} stroke={ink} strokeWidth="3"/>
    <T x={165} y={482} size={26}>n = 2</T>
    <T x={165} y={515} size={26}>−3,40 eV</T>
    <line x1="130" y1="753" x2="290" y2="753" stroke={ink} strokeWidth="4"/>
    <T x={165} y={717} size={26}>n = 1</T>
    <T x={165} y={789} size={26}>−13,60 eV</T>
    <T x={115} y={573} size={27} anchor="middle">E</T>
    <path d="M294 438 L330 410 L360 410" fill="none" stroke={gold} strokeWidth="2" strokeDasharray="5 6"/>
    <T x={380} y={280} size={30} bold>Ampliación lineal: n ≥ 2</T>
    <line x1="360" y1="780" x2="360" y2="309" stroke={gold} strokeWidth="3" markerEnd="url(#bohr-gold-arrow)"/>
    {levels.map(n => <g key={n} opacity={phase === 3 || n < 4 ? 1 : 0.32}>
      <line x1="380" y1={energyY(n)} x2="710" y2={energyY(n)} stroke={n === active && phase !== 3 ? gold : ink} strokeWidth={n === active && phase !== 3 ? 5 : 3}/>
      {n === 6 && <path d={`M710 ${energyY(n)} L727 ${labelY[n] - 10}`} stroke={ink} strokeWidth="2" fill="none"/>}
      <T x={737} y={labelY[n]} size={27} bold>n = {n}</T>
      {n < 5 && <T x={737} y={labelY[n] + 32} size={25}>{energy(n).toFixed(2).replace('.', ',')} eV</T>}
    </g>)}
    {phase !== 3 && <g>
      <circle cx="652" cy={energyY(active)} r="14" fill="#176e96" stroke="#fff" strokeWidth="3"/>
      <path d={`M646 ${energyY(active)} h12`} stroke="#fff" strokeWidth="2"/>
    </g>}
    {phase === 1 && <line x1="510" y1={energyY(2) - 28} x2="510" y2={energyY(3) + 24} stroke={red} strokeWidth="7" markerEnd="url(#bohr-red-arrow)" opacity={arrowOpacity}/>}
    {phase === 2 && <line x1="510" y1={energyY(3) + 24} x2="510" y2={energyY(2) - 28} stroke={red} strokeWidth="7" markerEnd="url(#bohr-red-arrow)" opacity={arrowOpacity}/>}
    {(phase === 1 || phase === 2) && <g opacity={arrowOpacity}>
      <rect x="384" y="569" width="241" height="63" rx="12" fill="#f7f0e2"/>
      <T x={504} y={610} size={29} anchor="middle" fill={red} bold>ΔE = 1,889 eV</T>
    </g>}
    {phase === 3 && balmer.map((b, i) => <line key={b.n} x1={420 + i * 75} x2={420 + i * 75} y1={energyY(b.n) + 17} y2={energyY(2) - 24} stroke={b.color} strokeWidth="6" markerEnd={`url(#bohr-balmer-${b.n})`} opacity={interpolate(local, [i * 25, i * 25 + 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}/>)}
    <T x={90} y={833} size={26}>Más arriba: mayor energía (menos negativa).</T>
  </g>;
}

function HistoricalAtom({absorption, local}) {
  const changed = absorption ? local >= 80 : local >= 50;
  const n = absorption ? (changed ? 3 : 2) : (changed ? 2 : 3);
  const electronX = n === 2 ? 340 : 390;
  const photonVisible = absorption ? local < 80 : local >= 50 && local < 125;
  const photonX = absorption
    ? interpolate(local, [5, 80], [725, 340], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.linear})
    : interpolate(local, [50, 125], [390, 750], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.linear});
  return <g transform="translate(1000 353)">
    <circle cx="250" cy="175" r="140" fill="none" stroke="#a1b7bf" strokeWidth="3"/>
    <circle cx="250" cy="175" r="90" fill="none" stroke="#a1b7bf" strokeWidth="3"/>
    <circle cx="250" cy="175" r="22" fill={gold}/>
    <T x={250} y={185} size={30} fill="#fff9ed" bold anchor="middle">+</T>
    <line x1={absorption ? 703 : 444} y1="130" x2={absorption ? 453 : 709} y2="130" stroke={red} strokeWidth="3" markerEnd="url(#bohr-red-arrow)"/>
    <T x={585} y={112} fill={red} anchor="middle" size={28} bold>Fotón {absorption ? 'entrante' : 'saliente'}</T>
    {photonVisible && <g transform={`translate(${photonX} 175)`}>
      <ellipse rx="31" ry="20" fill={red} opacity=".12"/>
      <path d="M-30 0 Q-24 -19 -18 0 T-6 0 T6 0 T18 0 T30 0" fill="none" stroke={red} strokeWidth="6"/>
    </g>}
    <circle cx={electronX} cy="175" r="15" fill="#176e96" stroke="#fff" strokeWidth="3"/>
    <path d={`M${electronX - 7} 175 h14`} stroke="#fff" strokeWidth="3"/>
    {changed && local < (absorption ? 96 : 66) && <circle cx={electronX} cy="175" r="29" fill="none" stroke={gold} strokeWidth="3"/>}
    <rect x="179" y="250" width="142" height="44" rx="8" fill="#fbf6ec"/>
    <T x={250} y={281} size={30} bold anchor="middle">n = {n}</T>
    <T x={250} y={340} size={26} anchor="middle">Modelo histórico, sin escala espacial</T>
  </g>;
}

export const SaltosCuanticosBohr = () => {
  const frame = useCurrentFrame();
  const phase = frame < 150 ? 0 : frame < 330 ? 1 : frame < 510 ? 2 : 3;
  const local = frame - [0, 150, 330, 510][phase];
  const titles = ['Energías permitidas en el hidrógeno', 'Absorción: el átomo recibe energía', 'Emisión: el átomo entrega energía', 'Serie de Balmer: una huella de luz'];
  return <AbsoluteFill style={{backgroundColor: '#f8f3e8'}}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" fontFamily="Arial, sans-serif" aria-label="Saltos cuánticos, absorción, emisión y espectro de Balmer del hidrógeno">
      <defs>
        <marker id="bohr-gold-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill={gold}/></marker>
        <marker id="bohr-red-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill={red}/></marker>
        {balmer.map(b => <marker key={b.n} id={`bohr-balmer-${b.n}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill={b.color}/></marker>)}
        <pattern id="bohr-paper" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M0 36 H36" stroke="#b69a68" strokeWidth="1" opacity=".07"/></pattern>
      </defs>
      <rect width="1920" height="1080" fill="url(#bohr-paper)"/>
      <rect width="1920" height="10" fill={gold}/>
      <T x={60} y={65} size={28} fill={gold} bold>CLASE 16 · BOHR, FOTONES Y ESPECTROS</T>
      <T x={60} y={141} size={61} bold>{titles[phase]}</T>
      {['1 · Niveles', '2 · Absorción', '3 · Emisión', '4 · Balmer'].map((label, i) => <g key={label}>
        <rect x={60 + i * 465} y="177" width="438" height="53" rx="9" fill={i === phase ? ink : '#e9e2d4'}/>
        <T x={279 + i * 465} y={213} size={29} anchor="middle" fill={i === phase ? '#fff8e9' : '#6a7779'} bold>{label}</T>
      </g>)}
      <rect x="60" y="246" width="860" height="614" rx="20" fill="#fffaf0" stroke="#ddceb5"/>
      <rect x="950" y="246" width="910" height="614" rx="20" fill="#eef1ea"/>
      <EnergyDiagram phase={phase} local={local}/>
      {phase === 0 && <g style={{opacity: interpolate(local, [0, 18], [0, 1], {extrapolateRight: 'clamp', extrapolateLeft: 'clamp'})}}>
        <T x={993} y={313} size={43} bold>El electrón tiene estados permitidos</T>
        <T x={993} y={378} size={34}>El modelo de Bohr asigna a cada n</T>
        <T x={993} y={424} size={34}>una energía definida. Entre niveles,</T>
        <T x={993} y={470} size={34}>no hay estados estacionarios del modelo.</T>
        <rect x="993" y="518" width="824" height="123" rx="15" fill={ink}/>
        <T x={1405} y={597} size={62} fill="#fff8e9" bold anchor="middle">Eₙ = −13,6 eV / n²</T>
        <T x={993} y={701} size={33} bold>n = 1 es el estado fundamental.</T>
        <T x={993} y={751} size={32}>E = 0 corresponde al umbral de ionización.</T>
        <T x={993} y={805} size={29}>Las separaciones de energía no son iguales.</T>
      </g>}
      {(phase === 1 || phase === 2) && <g>
        <T x={993} y={307} size={43} bold>{phase === 1 ? 'n = 2 → n = 3' : 'n = 3 → n = 2'}</T>
        <T x={993} y={351} size={31}>{phase === 1 ? 'Debe absorber la energía de la diferencia.' : 'Emite un fotón con la energía de la diferencia.'}</T>
        <HistoricalAtom absorption={phase === 1} local={local}/>
        <T x={993} y={753} size={34} bold>E del fotón = |E₃ − E₂| = 1,889 eV</T>
        <T x={993} y={804} size={31}>λ ≈ 656,5 nm · vacío (h·c ≈ 1240 eV·nm)</T>
      </g>}
      {phase === 3 && <g>
        <T x={993} y={309} size={43} bold>Distintos saltos terminan en n = 2</T>
        <T x={993} y={358} size={31}>Cada diferencia de energía produce una línea.</T>
        <T x={995} y={408} size={27} fill="#596d75" bold>TRANSICIÓN</T>
        <T x={1270} y={408} size={27} fill="#596d75" bold>ENERGÍA (BOHR)</T>
        <T x={1580} y={408} size={27} fill="#596d75" bold>λ EN AIRE</T>
        {balmer.map((b, i) => <g key={b.n} opacity={interpolate(local, [i * 25, i * 25 + 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}>
          <rect x="986" y={425 + i * 54} width="832" height="49" rx="6" fill={i % 2 ? '#e0e7df' : '#f9faf4'}/>
          <circle cx="1014" cy={450 + i * 54} r="8" fill={b.color}/>
          <T x={1043} y={460 + i * 54} size={31} bold>{b.n} → 2</T>
          <T x={1270} y={460 + i * 54} size={31}>{b.ev} eV</T>
          <T x={1580} y={460 + i * 54} size={31}>{b.nm} nm</T>
        </g>)}
        <rect x="993" y="676" width="824" height="62" rx="8" fill="#122734"/>
        {balmer.map((b, i) => <line key={b.n} x1={1012 + ((Number(b.nm.replace(',', '.')) - 400) / 300) * 786} x2={1012 + ((Number(b.nm.replace(',', '.')) - 400) / 300) * 786} y1="684" y2="730" stroke={b.color} strokeWidth="7" opacity={interpolate(local, [i * 25, i * 25 + 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}/>)}
        <T x={1012} y={777} size={27}>400 nm</T><T x={1798} y={777} size={27} anchor="end">700 nm</T>
        <T x={1405} y={777} size={27} anchor="middle">Longitud de onda en aire →</T>
        <T x={993} y={824} size={27}>Líneas de referencia en aire; Bohr calcula λ en vacío.</T>
      </g>}
      <rect x="60" y="881" width="1800" height="122" rx="15" fill={ink}/>
      <T x={90} y={930} size={38} fill="#fff8e9" bold>{phase === 0 ? 'Un fotón conecta dos energías permitidas.' : phase === 1 ? 'Absorción: aumenta la energía del átomo.' : phase === 2 ? 'Emisión: disminuye la energía del átomo.' : 'Un espectro de líneas revela la estructura energética del átomo.'}</T>
      <T x={90} y={976} size={30} fill="#dfebea">{phase === 3 ? 'Kirchhoff y Bunsen relacionaron las líneas espectrales con los elementos químicos.' : 'E del fotón = h · f = h · c / λ = |E final − E inicial| · Cambio discreto de estado.'}</T>
      <T x={60} y={1047} size={25} fill="#617278">Sistemas Multi Física · Profesor Javier Pereyra</T>
      <T x={1860} y={1047} size={25} fill="#617278" anchor="end">Hidrógeno · modelo histórico · tiempos esquemáticos</T>
    </svg>
  </AbsoluteFill>;
};
