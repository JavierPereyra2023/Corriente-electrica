import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

const W = 1920;
const H = 1080;
const C = {paper: '#f7f2e6', ink: '#18374a', muted: '#526772', teal: '#087a80', blue: '#2d6fa8', gold: '#c49335', coral: '#d85a2a', line: '#d8d2c4'};
const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const fade = (frame, from, to) => interpolate(frame, [from, from + 18, to - 18, to], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(.16, 1, .3, 1)});
const wavePath = (x0, x1, y, amp, wavelength, phase) => {
  const points = [];
  for (let x = x0; x <= x1; x += 8) points.push(`${x},${y + amp * Math.sin((2 * Math.PI * (x - x0) / wavelength) - phase)}`);
  return `M${points.join(' L')}`;
};
const Text = ({x, y, children, size = 30, fill = C.ink, weight = 400, anchor = 'start'}) => <text x={x} y={y} fontSize={size} fill={fill} fontWeight={weight} textAnchor={anchor}>{children}</text>;
const Arrow = ({x1, y1, x2, y2, color = C.coral, dash = false}) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="5" strokeDasharray={dash ? '12 10' : undefined} markerEnd={`url(#arrow-${color === C.gold ? 'gold' : color === C.blue ? 'blue' : 'coral'})`}/>;

function Transverse({frame}) {
  const phase = frame * 0.22;
  const x0 = 150, x1 = 1110, mid = 500, amplitude = 118, lambda = 320;
  const points = Array.from({length: 31}, (_, i) => {
    const x = x0 + i * 31;
    const y = mid + amplitude * Math.sin((2 * Math.PI * (x - x0) / lambda) - phase);
    return <circle key={i} cx={x} cy={y} r="10" fill={C.blue} opacity=".95"/>;
  });
  return <g>
    <Text x={84} y={102} size={28} fill={C.teal} weight={700}>01 · UNA ONDA MECÁNICA</Text>
    <Text x={84} y={170} size={58} weight={700}>La perturbación avanza;</Text>
    <Text x={84} y={232} size={58} weight={700}>el medio solo oscila.</Text>
    <Text x={88} y={286} size={29} fill={C.muted}>Ejemplo: una sacudida en una soga tensa.</Text>
    <rect x="72" y="338" width="1130" height="398" rx="24" fill="#fffdf7" stroke={C.line} strokeWidth="2"/>
    <line x1={x0} y1={mid} x2={x1} y2={mid} stroke="#b9c4c7" strokeWidth="3" strokeDasharray="10 9"/>
    <path d={wavePath(x0, x1, mid, amplitude, lambda, phase)} fill="none" stroke={C.blue} strokeWidth="7" strokeLinecap="round"/>
    {points}
    <Arrow x1={1220} y1={500} x2={1510} y2={500} color={C.coral}/>
    <Text x={1365} y={458} size={28} fill={C.coral} weight={700} anchor="middle">propagación</Text>
    <Text x={170} y={680} size={28} fill={C.muted}>Cada punto azul sube y baja alrededor de su equilibrio.</Text>
    <rect x="1280" y="610" width="500" height="126" rx="18" fill="#eaf3f3"/>
    <Text x={1310} y={653} size={27} fill={C.teal} weight={700}>Transporta energía e información</Text>
    <Text x={1310} y={696} size={25} fill={C.ink}>No transporta el material de la soga</Text>
  </g>;
}

function Measures({frame}) {
  const phase = frame * 0.22;
  const x0 = 116, x1 = 1150, mid = 505, amp = 122, lambda = 345;
  return <g>
    <Text x={84} y={102} size={28} fill={C.teal} weight={700}>02 · MEDIR UNA ONDA</Text>
    <Text x={84} y={170} size={59} weight={700}>Amplitud, longitud,</Text>
    <Text x={84} y={232} size={59} weight={700}>período, frecuencia y velocidad</Text>
    <rect x="72" y="312" width="1210" height="470" rx="24" fill="#fffdf7" stroke={C.line} strokeWidth="2"/>
    <line x1={x0} y1={mid} x2={x1} y2={mid} stroke="#b9c4c7" strokeWidth="3" strokeDasharray="10 9"/>
    <path d={wavePath(x0, x1, mid, amp, lambda, phase)} fill="none" stroke={C.blue} strokeWidth="7"/>
    <line x1="290" y1={mid} x2="290" y2={mid - amp} stroke={C.coral} strokeWidth="5" markerEnd="url(#arrow-coral)"/>
    <Text x="307" y="433" size="30" fill={C.coral} weight={700}>A · amplitud</Text>
    <line x1="463" y1="704" x2={463 + lambda} y2="704" stroke={C.gold} strokeWidth="5" markerStart="url(#arrow-gold-start)" markerEnd="url(#arrow-gold)"/>
    <Text x="635" y="750" size="31" fill={C.gold} weight={700} anchor="middle">λ · longitud de onda</Text>
    <circle cx="635" cy={mid - amp} r="10" fill={C.gold}/><Text x="635" y="357" size="27" fill={C.muted} anchor="middle">cresta</Text>
    <circle cx="808" cy={mid + amp} r="10" fill={C.gold}/><Text x="808" y="679" size="27" fill={C.muted} anchor="middle">valle</Text>
    <rect x="1330" y="324" width="500" height="458" rx="24" fill="#193848"/>
    <Text x="1380" y="380" size="30" fill="#f7f2e6" weight={700}>Relaciones clave</Text>
    <Text x="1380" y="458" size="43" fill="#fff" weight={700}>f = 1 / T</Text>
    <Text x="1380" y="524" size="43" fill="#fff" weight={700}>v = λ · f</Text>
    <Text x="1380" y="590" size="43" fill="#fff" weight={700}>v = λ / T</Text>
    <Text x="1380" y="664" size="25" fill="#dce8e7">T: una oscilación completa (s)</Text>
    <Text x="1380" y="706" size="25" fill="#dce8e7">f: oscilaciones por segundo (Hz)</Text>
    <Text x="1380" y="748" size="25" fill="#dce8e7">v: rapidez de propagación (m/s)</Text>
  </g>;
}

function Sound({frame}) {
  const phase = frame * .17;
  const dots = Array.from({length: 55}, (_, i) => {
    const x = 122 + i * 20;
    const compression = 9 * Math.sin((i * .56) - phase);
    return <circle key={i} cx={x + compression} cy={510 + 40 * Math.sin(i * 2.3)} r="7" fill={C.blue} opacity=".9"/>;
  });
  const speaker = 110 + 12 * Math.sin(phase);
  return <g>
    <Text x={84} y={102} size={28} fill={C.teal} weight={700}>03 · EJEMPLO: EL SONIDO</Text>
    <Text x={84} y={170} size={59} weight={700}>Un parlante hace vibrar el aire.</Text>
    <Text x={84} y={232} size={30} fill={C.muted}>Es una onda mecánica longitudinal: las partículas oscilan en la dirección de propagación.</Text>
    <rect x="72" y="312" width="1748" height="470" rx="24" fill="#fffdf7" stroke={C.line} strokeWidth="2"/>
    <rect x="125" y="425" width="145" height="172" rx="15" fill="#263f4a"/><circle cx="198" cy="511" r="55" fill="#0d2029"/><circle cx="198" cy="511" r={speaker} fill="#8ca7ad"/>
    <Text x="198" y="648" size="28" fill={C.ink} weight={700} anchor="middle">parlante</Text>
    {dots}
    <Arrow x1="330" y1="678" x2="1135" y2="678" color={C.coral}/>
    <Text x="735" y="726" size="29" fill={C.coral} weight={700} anchor="middle">dirección de propagación</Text>
    <path d="M440 448 V576 M790 448 V576" stroke={C.gold} strokeWidth="4" strokeDasharray="9 8"/>
    <Text x="470" y="405" size="31" fill={C.gold} weight={700}>compresión</Text>
    <Text x="870" y="405" size="31" fill={C.blue} weight={700}>rarefacción</Text>
    <rect x="1265" y="390" width="490" height="270" rx="18" fill="#eaf3f3"/>
    <Text x="1302" y="448" size="31" fill={C.teal} weight={700}>En aire a 20 °C:</Text>
    <Text x="1302" y="514" size="46" fill={C.ink} weight={700}>v ≈ 343 m/s</Text>
    <Text x="1302" y="568" size="27" fill={C.muted}>La frecuencia es del emisor.</Text>
    <Text x="1302" y="610" size="27" fill={C.muted}>La rapidez depende del medio.</Text>
  </g>;
}

function Phenomena({frame}) {
  const phase = frame * .24;
  return <g>
    <Text x={84} y={102} size={28} fill={C.teal} weight={700}>04 · CUANDO LA ONDA ENCUENTRA ALGO</Text>
    <Text x={84} y={170} size={57} weight={700}>Reflexión, refracción y difracción</Text>
    <rect x="72" y="230" width="852" height="370" rx="22" fill="#fffdf7" stroke={C.line} strokeWidth="2"/>
    <Text x="114" y="285" size="31" fill={C.teal} weight={700}>Reflexión</Text>
    <line x1="605" y1="324" x2="605" y2="530" stroke={C.ink} strokeWidth="12"/>
    <path d={wavePath(120, 580, 425, 42, 150, phase)} fill="none" stroke={C.blue} strokeWidth="5"/>
    <path d={wavePath(300, 580, 487, 42, 150, -phase)} fill="none" stroke={C.coral} strokeWidth="5"/>
    <Text x="670" y="438" size="26" fill={C.muted}>rebota en un límite</Text>
    <rect x="968" y="230" width="852" height="370" rx="22" fill="#fffdf7" stroke={C.line} strokeWidth="2"/>
    <Text x="1010" y="285" size="31" fill={C.teal} weight={700}>Refracción y difracción</Text>
    <rect x="1020" y="328" width="330" height="190" fill="#dceeed"/><rect x="1350" y="328" width="390" height="190" fill="#f6e6c1"/>
    <path d="M1060 360 l220 0 M1060 400 l220 0 M1060 440 l220 0 M1060 480 l220 0" stroke={C.blue} strokeWidth="5"/>
    <path d="M1380 360 l330 0 M1380 400 l330 0 M1380 440 l330 0 M1380 480 l330 0" stroke={C.coral} strokeWidth="5"/>
    <Text x="1035" y="554" size="24" fill={C.muted}>cambia de medio → cambia v y λ</Text>
    <Text x="1390" y="554" size="24" fill={C.muted}>una abertura curva los frentes</Text>
    <rect x="72" y="642" width="1748" height="302" rx="22" fill="#193848"/>
    <Text x="110" y="704" size="33" fill="#f7f2e6" weight={700}>Leer qué cambia cuando la onda encuentra una situación nueva</Text>
    <path d={wavePath(110, 610, 798, 42, 160, phase)} fill="none" stroke={C.gold} strokeWidth="6"/>
    <Text x="675" y="779" size="28" fill="#fff" weight={700}>REFLEXIÓN</Text><Text x="675" y="824" size="24" fill="#dce8e7">cambia la dirección</Text>
    <Text x="1070" y="779" size="28" fill="#fff" weight={700}>REFRACCIÓN</Text><Text x="1070" y="824" size="24" fill="#dce8e7">cambian v y λ</Text>
    <Text x="1460" y="779" size="28" fill="#fff" weight={700}>DIFRACCIÓN</Text><Text x="1460" y="824" size="24" fill="#dce8e7">la onda se abre</Text>
    <Text x="110" y="904" size="25" fill="#dce8e7">La interferencia se estudia aparte: requiere analizar la superposición de dos o más ondas.</Text>
  </g>;
}

export function OndasMecanicas() {
  const frame = useCurrentFrame();
  const local = frame % 720;
  const scene = local < 180 ? <Transverse frame={local}/> : local < 360 ? <Measures frame={local - 180}/> : local < 540 ? <Sound frame={local - 360}/> : <Phenomena frame={local - 540}/>;
  return <AbsoluteFill style={{backgroundColor: C.paper, opacity: interpolate(frame, [0, 16, 704, 719], [0, 1, 1, 0], {extrapolateLeft:'clamp', extrapolateRight:'clamp', easing:Easing.bezier(.16,1,.3,1)})}}>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-label="Infografía animada sobre ondas mecánicas, sonido y fenómenos ondulatorios" fontFamily="Arial, sans-serif">
      <defs><marker id="arrow-coral" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={C.coral}/></marker><marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={C.blue}/></marker><marker id="arrow-gold" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={C.gold}/></marker><marker id="arrow-gold-start" markerWidth="10" markerHeight="10" refX="2" refY="5" orient="auto"><path d="M10,0 L0,5 L10,10 Z" fill={C.gold}/></marker></defs>
      <rect width={W} height={H} fill={C.paper}/><rect width={W} height="10" fill={C.teal}/>
      {scene}
      <line x1="82" y1="1000" x2="1838" y2="1000" stroke="#b79454" strokeWidth="2"/>
      <Text x="84" y="1045" size="25" fill={C.muted}>Ondas mecánicas · Clase 13 · Sistemas Multi Física · Profesor Javier Pereyra</Text>
      <Text x="1830" y="1045" size="24" fill={C.teal} weight={700} anchor="end">La fuente fija f; el medio condiciona v.</Text>
    </svg>
  </AbsoluteFill>;
}
