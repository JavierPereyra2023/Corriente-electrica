import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

// Electrones aproximadamente libres y en reposo antes de la interacción.
// No hay órbitas, saltos atómicos ni ondas sinusoidales viajando como objetos.
// En coordenadas físicas: p=(p,0), p'=(0,p'), p_e=(p,-p').
// El eje vertical de SVG apunta hacia abajo: el electrón retrocede abajo/derecha.
const ink = '#19394a';
const gold = '#ac803d';
const incoming = '#2087ae';
const outgoing = '#ae7a29';
const electronColor = '#bb514b';
const lambda = 0.071;
const lambdaC = 0.00242631;
const lambdaPrime = lambda + lambdaC;
const momentumRatio = lambda / lambdaPrime;
const hc = 1.239841984; // keV·nm
const energy = hc / lambda;
const energyPrime = hc / lambdaPrime;
const kinetic = energy - energyPrime;
const format = (number, digits = 3) => number.toFixed(digits).replace('.', ',');
const T = ({x, y, size = 32, fill = ink, bold = false, anchor = 'start', children}) =>
  <text x={x} y={y} fontSize={size} fill={fill} fontWeight={bold ? 700 : 400} textAnchor={anchor}>{children}</text>;
const Arrow = ({x1, y1, x2, y2, color = ink, dashed = false, width = 6}) =>
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeDasharray={dashed ? '10 10' : undefined} markerEnd={`url(#compton-arrow-${color.replace('#', '')})`}/>;
const Photon = ({x, y, color, label}) => <g>
  <circle cx={x} cy={y} r="24" fill={color} opacity=".12"/>
  <circle cx={x} cy={y} r="11" fill={color} stroke="#fff" strokeWidth="3"/>
  {label && <T x={x} y={y - 36} size={30} fill={color} anchor="middle" bold>γ</T>}
</g>;
const Electron = ({x, y}) => <g>
  <circle cx={x} cy={y} r="17" fill={electronColor} stroke="#fff" strokeWidth="3"/>
  <path d={`M${x - 7} ${y} h14`} stroke="#fff" strokeWidth="3"/>
</g>;

function ScatteringDiagram({phase, local}) {
  const dynamic = phase === 1;
  const after = dynamic && local >= 90;
  const travel = dynamic ? Math.min(90, Math.max(0, local)) : 0;
  const photonX = 280 + travel * 4;
  // Luz: idéntica rapidez antes/después. La animación se congela tras 50 frames.
  // Retroceso: longitud de trayecto ampliada ×10 para poder verlo (se indica).
  const age = after ? Math.min(50, local - 90) : 0;
  const recoilSpeed = 4 * 0.047484 * 10;
  const recoilAngle = Math.atan(momentumRatio);
  const recoilX = 640 + age * recoilSpeed * Math.cos(recoilAngle);
  const recoilY = 570 + age * recoilSpeed * Math.sin(recoilAngle);
  return <g>
    <T x={90} y={305} size={39} bold>Fotón de rayos X + electrón</T>
    <T x={90} y={354} size={31}>Electrón inicialmente en reposo y aproximadamente libre.</T>
    <Arrow x1={240} y1={570} x2={610} y2={570} color={incoming}/>
    <Arrow x1={640} y1={545} x2={640} y2={398} color={outgoing} dashed={!after}/>
    <Arrow x1={666} y1={595} x2={865} y2={570 + 225 * momentumRatio} color={electronColor} dashed={!after}/>
    <line x1="643" y1="570" x2="794" y2="570" stroke="#82979e" strokeWidth="2" strokeDasharray="6 8"/>
    <path d="M640 493 A77 77 0 0 1 717 570" stroke={gold} strokeWidth="3" fill="none"/>
    <T x={728} y={499} size={33} bold>θ = 90°</T>
    <rect x="112" y="431" width="378" height="88" rx="13" fill="#e3edf0"/>
    <T x={135} y={470} size={32} fill={incoming} bold>Fotón incidente</T>
    <T x={135} y={505} size={30}>λ = 0,071 nm</T>
    <rect x="771" y="371" width="400" height="93" rx="13" fill="#f0e5ce"/>
    <T x={790} y={411} size={31} fill={outgoing} bold>Fotón dispersado</T>
    <T x={790} y={449} size={30}>λ′ = 0,07342631 nm</T>
    <T x={850} y={670} size={32} fill={electronColor} bold>Electrón de retroceso</T>
    <T x={850} y={716} size={31}>φ ≈ 44,04° hacia abajo</T>
    <T x={after ? 545 : 640} y={668} size={30} anchor="middle" bold>{after ? 'Después' : 'Antes: electrón en reposo'}</T>
    {!after && <Photon x={dynamic ? photonX : 280} y={570} color={incoming} label/>}
    {after && <Photon x={640} y={570 - age * 4} color={outgoing}/>}
    <Electron x={after ? recoilX : 640} y={after ? recoilY : 570}/>
    {after && local < 103 && <circle cx="640" cy="570" r={22 + (local - 90) * 3} stroke={gold} strokeWidth="3" fill="none" opacity={1 - (local - 90) / 13}/>}
    <T x={90} y={836} size={30}>Trayecto del electrón ampliado ×10; tiempos ilustrativos.</T>
  </g>;
}

function MomentumDiagram() {
  const origin = {x: 260, y: 430};
  const tip = {x: 610, y: 430};
  const recoil = {x: 610, y: 430 + 350 * momentumRatio};
  return <g>
    <T x={90} y={305} size={39} bold>El momento se suma como vector</T>
    <T x={90} y={354} size={31}>Las flechas usan una misma escala de momento.</T>
    <Arrow x1={origin.x} y1={origin.y} x2={tip.x} y2={tip.y} color={incoming}/>
    <Arrow x1={origin.x} y1={origin.y} x2={recoil.x} y2={recoil.y} color={electronColor}/>
    <Arrow x1={recoil.x} y1={recoil.y} x2={tip.x} y2={tip.y} color={outgoing}/>
    <T x={435} y={405} size={38} fill={incoming} bold anchor="middle">p</T>
    <T x={650} y={621} size={38} fill={outgoing} bold>p′</T>
    <T x={249} y={634} size={38} fill={electronColor} bold>pₑ</T>
    <rect x="812" y="440" width="365" height="167" rx="15" fill="#e7eee9"/>
    <T x={994} y={487} size={33} anchor="middle" bold>p = h / λ</T>
    <T x={994} y={537} size={32} anchor="middle">p′ / p = λ / λ′</T>
    <T x={994} y={581} size={32} anchor="middle" bold>≈ 0,96696</T>
    <T x={812} y={661} size={31}>El electrón equilibra</T>
    <T x={812} y={704} size={31}>el cambio de momento</T>
    <T x={812} y={747} size={31}>del fotón.</T>
    <T x={90} y={835} size={34} bold>Vectorialmente: p = p′ + pₑ</T>
  </g>;
}

function AngleGraph({local}) {
  const focus = local < 70 ? 0 : local < 140 ? 90 : 180;
  const graphX = angle => 198 + angle / 180 * 860;
  const graphY = deltaPm => 765 - deltaPm / (2 * lambdaC * 1000) * 340;
  const points = Array.from({length: 91}, (_, i) => {
    const angle = i * 2;
    return `${graphX(angle)},${graphY(lambdaC * 1000 * (1 - Math.cos(angle * Math.PI / 180)))}`;
  }).join(' ');
  const delta = lambdaC * 1000 * (1 - Math.cos(focus * Math.PI / 180));
  return <g>
    <T x={90} y={305} size={39} bold>Más desvío, mayor corrimiento</T>
    <T x={90} y={356} size={31}>Δλ (pm): aumento de la longitud de onda del fotón.</T>
    <Arrow x1={198} y1={765} x2={1096} y2={765} color={ink} width={3}/>
    <Arrow x1={198} y1={765} x2={198} y2={398} color={ink} width={3}/>
    {[0, 1, 2, 3, 4].map(tick => <g key={tick}>
      <line x1="188" y1={graphY(tick)} x2="1058" y2={graphY(tick)} stroke="#becbc5" strokeWidth="1" strokeDasharray="5 8"/>
      <T x={172} y={graphY(tick) + 10} size={30} anchor="end">{tick}</T>
    </g>)}
    <T x={126} y={400} size={31} bold>Δλ</T>
    {[0, 90, 180].map(angle => <g key={angle}>
      <line x1={graphX(angle)} x2={graphX(angle)} y1="765" y2="776" stroke={ink} strokeWidth="2"/>
      <T x={graphX(angle)} y={810} size={30} anchor="middle">{angle}°</T>
    </g>)}
    <polyline points={points} fill="none" stroke={incoming} strokeWidth="6"/>
    <line x1={graphX(focus)} x2={graphX(focus)} y1={graphY(delta)} y2="765" stroke={gold} strokeWidth="3" strokeDasharray="7 9"/>
    <circle cx={graphX(focus)} cy={graphY(delta)} r="11" fill={gold} stroke="#fff" strokeWidth="3"/>
    <T x={680} y={845} size={30} anchor="middle">Ángulo de dispersión θ del fotón</T>
  </g>;
}

export const ComptonDispersion = () => {
  const frame = useCurrentFrame();
  const phase = frame < 150 ? 0 : frame < 360 ? 1 : frame < 540 ? 2 : 3;
  const local = frame - [0, 150, 360, 540][phase];
  const focusAngle = local < 70 ? 0 : local < 140 ? 90 : 180;
  const titles = ['Un fotón también transporta momento', 'Dispersión Compton: interacción y retroceso', 'La energía y el momento se conservan', 'El ángulo determina el corrimiento'];
  return <AbsoluteFill style={{backgroundColor: '#f8f3e8'}}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" fontFamily="Arial, sans-serif" aria-label="Animación didáctica del efecto Compton y conservación de energía y momento">
      <defs>
        {[ink, incoming, outgoing, electronColor].map(color => <marker key={color} id={`compton-arrow-${color.replace('#', '')}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill={color}/></marker>)}
        <pattern id="compton-paper" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M0 36H36" stroke="#b69a68" strokeWidth="1" opacity=".07"/></pattern>
      </defs>
      <rect width="1920" height="1080" fill="url(#compton-paper)"/>
      <rect width="1920" height="10" fill={gold}/>
      <T x={60} y={65} size={30} fill={gold} bold>FOTONES · EFECTO COMPTON · RAYOS X</T>
      <T x={60} y={143} size={58} bold>{titles[phase]}</T>
      {['1 · Montaje', '2 · Dispersión', '3 · Conservación', '4 · Ángulo'].map((label, i) => <g key={label}>
        <rect x={60 + i * 465} y="177" width="438" height="53" rx="9" fill={i === phase ? ink : '#e9e2d4'}/>
        <T x={279 + i * 465} y={213} size={30} anchor="middle" fill={i === phase ? '#fff8e9' : '#6a7779'} bold>{label}</T>
      </g>)}
      <rect x="60" y="246" width="1160" height="621" rx="20" fill="#fffaf0" stroke="#ddceb5"/>
      <rect x="1250" y="246" width="610" height="621" rx="20" fill="#eef1ea"/>
      {phase < 2 && <ScatteringDiagram phase={phase} local={local}/>}
      {phase === 2 && <MomentumDiagram/>}
      {phase === 3 && <AngleGraph local={local}/>}
      {phase === 0 && <g style={{opacity: interpolate(local, [0, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1)})}}>
        <T x={1285} y={310} size={38} bold>La idea de Compton</T>
        <T x={1285} y={374} size={32}>El fotón entrega parte</T>
        <T x={1285} y={417} size={32}>de su energía y momento</T>
        <T x={1285} y={460} size={32}>al electrón.</T>
        <rect x="1285" y="509" width="540" height="133" rx="14" fill={ink}/>
        <T x={1555} y={562} size={37} fill="#fff8e9" bold anchor="middle">E = h·c / λ</T>
        <T x={1555} y={614} size={37} fill="#fff8e9" bold anchor="middle">p = h / λ</T>
        <T x={1285} y={706} size={31}>γ representa un fotón,</T>
        <T x={1285} y={748} size={31}>sin dibujar una trayectoria</T>
        <T x={1285} y={790} size={31}>sinusoidal.</T>
      </g>}
      {phase === 1 && <g>
        <T x={1285} y={310} size={38} bold>Después de dispersarse</T>
        <T x={1285} y={375} size={32} fill={outgoing} bold>{'λ′ > λ · E′ < E · p′ < p'}</T>
        <T x={1285} y={427} size={32}>El fotón continúa a rapidez c.</T>
        <rect x="1285" y="475" width="540" height="157" rx="14" fill="#e3eae3"/>
        <T x={1310} y={521} size={31} bold>Δλ = λ′ − λ</T>
        <T x={1310} y={567} size={31}>= 0,00242631 nm</T>
        <T x={1310} y={608} size={31}>= 2,42631 pm</T>
        <T x={1285} y={691} size={32}>El electrón gana</T>
        <T x={1285} y={735} size={32}>energía cinética y momento.</T>
        <T x={1285} y={800} size={31} bold>El fotón se dispersa; no se absorbe.</T>
      </g>}
      {phase === 2 && <g>
        <T x={1285} y={310} size={38} bold>Balance de energía</T>
        <T x={1285} y={367} size={32}>La energía de reposo</T>
        <T x={1285} y={409} size={32}>del electrón está a ambos lados.</T>
        <rect x="1285" y="452" width="540" height="81" rx="13" fill={ink}/>
        <T x={1555} y={505} size={39} anchor="middle" fill="#fff8e9" bold>E = E′ + Kₑ</T>
        <T x={1285} y={593} size={32} fill={incoming} bold>E = {format(energy)} keV</T>
        <T x={1285} y={644} size={32} fill={outgoing} bold>E′ = {format(energyPrime)} keV</T>
        <T x={1285} y={695} size={32} fill={electronColor} bold>Kₑ = {format(kinetic)} keV</T>
        <T x={1285} y={757} size={31}>La masa en reposo del electrón</T>
        <T x={1285} y={799} size={31}>permanece igual.</T>
      </g>}
      {phase === 3 && <g>
        <T x={1285} y={310} size={38} bold>Fórmula de Compton</T>
        <rect x="1285" y="350" width="540" height="91" rx="13" fill={ink}/>
        <T x={1555} y={408} size={36} anchor="middle" fill="#fff8e9" bold>Δλ = λ<tspan baselineShift="sub" fontSize="25">C</tspan> (1 − cos θ)</T>
        <T x={1285} y={497} size={31}>λ<tspan baselineShift="sub" fontSize="23">C</tspan> = h / (mₑ c) ≈ 2,42631 pm</T>
        {[0, 90, 180].map((angle, i) => <g key={angle}>
          <rect x="1285" y={533 + i * 73} width="540" height="65" rx="9" fill={focusAngle === angle ? '#dacbaa' : '#e4ebe3'}/>
          <T x={1305} y={576 + i * 73} size={33} bold>{angle}°</T>
          <T x={1805} y={576 + i * 73} size={33} anchor="end">{format(lambdaC * 1000 * (1 - Math.cos(angle * Math.PI / 180)))} pm</T>
        </g>)}
        <T x={1285} y={803} size={31}>180°: corrimiento máximo, 2λ<tspan baselineShift="sub" fontSize="23">C</tspan>.</T>
      </g>}
      <rect x="60" y="890" width="1800" height="113" rx="15" fill={ink}/>
      <T x={90} y={937} size={36} fill="#fff8e9" bold>{phase === 0 ? 'La luz intercambia energía y momento con la materia.' : phase === 1 ? 'El fotón dispersado pierde energía; el electrón gana energía cinética.' : phase === 2 ? 'La conservación simultánea de energía y momento explica el corrimiento.' : 'Δλ depende del ángulo; para un electrón libre, no depende de la λ incidente.'}</T>
      <T x={90} y={981} size={30} fill="#dfebea">{phase === 3 ? 'En θ = 0°, Δλ = 0; en 90°, Δλ = λC; en 180°, Δλ = 2λC.' : 'Modelo de dispersión con electrón libre inicialmente en reposo · Rayos X: λ = 0,071 nm.'}</T>
      <T x={60} y={1047} size={30} fill="#617278">Sistemas Multi Física · Profesor Javier Pereyra</T>
      <T x={1860} y={1047} size={30} fill="#617278" anchor="end">Esquema educativo · sin escala espacial</T>
    </svg>
  </AbsoluteFill>;
};
