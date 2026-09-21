import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

const W = 1500, H = 2100;
const C = {paper:'#f7f2e6', ink:'#17384a', muted:'#526772', teal:'#087a80', line:'#d8d2c4', deep:'#142b38',
  blue:'#2274a8', red:'#c0392b'};
const COLORS = [
  ['Violeta', 400, '#7c3aed', 9.4],
  ['Azul', 450, '#2c9ed6', 5.9],
  ['Cian', 490, '#17b6c4', 4.2],
  ['Verde', 530, '#3fae4a', 3.0],
  ['Amarillo', 580, '#e8c13a', 2.1],
  ['Naranja', 610, '#e8863a', 1.7],
  ['Rojo', 700, '#d63b2e', 1.0],
];

const Text = ({x, y, size = 28, fill = C.ink, weight = 400, anchor = 'start', italic = false, children}) =>
  <text x={x} y={y} fontSize={size} fill={fill} fontWeight={weight} textAnchor={anchor} fontStyle={italic ? 'italic' : 'normal'}>{children}</text>;

const loop = (frame, len) => frame % len;

const Card = ({x, y, w, h, children}) =>
  <g>
    <rect x={x} y={y} width={w} height={h} rx="18" fill="#fffdf7" stroke={C.line} strokeWidth="2.5" />
    {children}
  </g>;

export const RayleighDispersion = () => {
  const frame = useCurrentFrame();

  // panel geometry (the horizon illustration)
  const px1 = 60, px2 = 1440, py1 = 300, py2 = 1150;
  const R = 2400, ah = 120;
  const cx = (px1 + px2) / 2;
  const cy = py2 + R - ah;
  const curveY = (x) => cy - Math.sqrt(Math.max(0, R * R - (x - cx) * (x - cx)));

  const obsX = cx, obsY = curveY(cx);
  const sunNoonX = cx, sunNoonY = 420;
  const sunDuskX = 1380, sunDuskY = curveY(1380);

  // continuous traveling light packet (loops every 90 frames)
  const noonT = loop(frame, 90) / 90;
  const noonPX = sunNoonX + (obsX - sunNoonX) * noonT;
  const noonPY = sunNoonY + 40 + (obsY - (sunNoonY + 40)) * noonT;

  const duskT = loop(frame, 130) / 130;
  const duskPX = sunDuskX + (obsX - sunDuskX) * duskT;
  const duskPY = sunDuskY + (obsY - sunDuskY) * duskT;

  // scattering bursts: local t in [0,1) within a repeating cycle, particle flies outward then fades
  const burst = (originX, originY, seed, cycle = 70, dist = 55, color = '#2c9ed6', dir = -1) => {
    const t = loop(frame + seed, cycle) / cycle;
    const ang = -Math.PI / 2 + dir * 0.9 * Math.sin(seed * 1.7);
    const r = t * dist;
    const x = originX + Math.cos(ang) * r;
    const y = originY + Math.sin(ang) * r;
    const op = Math.sin(t * Math.PI);
    return <circle cx={x} cy={y} r={3.5 + 3 * (1 - t)} fill={color} opacity={op * 0.9} />;
  };

  const stars = Array.from({length: 22}, (_, i) => {
    const sx = 100 + (i * 137) % 1300;
    const sy = 310 + (i * 89) % 380;
    const tw = 0.4 + 0.6 * (Math.sin(frame * 0.08 + i * 1.9) * 0.5 + 0.5);
    return <circle key={i} cx={sx} cy={sy} r={i % 4 === 0 ? 2.6 : 1.6} fill="#fff" opacity={tw} />;
  });

  const barMaxW = 900;
  const rowH = 54;

  return (
    <AbsoluteFill style={{backgroundColor: C.paper}}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" fontFamily="Arial, sans-serif">
        <defs>
          <linearGradient id="rd-sky" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3f7fc4" />
            <stop offset=".48" stopColor="#bcd9ec" />
            <stop offset=".56" stopColor="#f6d9b8" />
            <stop offset="1" stopColor="#e8703c" />
          </linearGradient>
          <radialGradient id="rd-sun-noon" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fff7d6" />
            <stop offset="1" stopColor="#ffe17a" />
          </radialGradient>
          <radialGradient id="rd-sun-dusk" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffdca0" />
            <stop offset="1" stopColor="#f4873d" />
          </radialGradient>
          <filter id="rd-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="10" /></filter>
          <clipPath id="rd-panel-clip"><rect x={px1} y={py1} width={px2 - px1} height={py2 - py1} rx="24" /></clipPath>
        </defs>

        {/* header */}
        <rect width={W} height="10" fill={C.teal} />
        <Text x="76" y="86" size="26" fill={C.teal} weight="700">SISTEMAS MULTI FÍSICA · ÓPTICA</Text>
        <Text x="74" y="150" size="52" fill={C.ink} weight="700">Por qué el cielo es azul</Text>
        <Text x="74" y="204" size="52" fill="#c0521f" weight="700">y el atardecer rojo</Text>
        <text x="76" y="240" fontSize="25" fill={C.muted}>
          <tspan x="76" dy="0">La luz del Sol llega blanca. Las moléculas del aire dispersan mucho</tspan>
          <tspan x="76" dy="30">más el azul que el rojo: eso pinta el cielo y, al atardecer, el horizonte.</tspan>
        </text>

        {/* illustration panel */}
        <rect x={px1} y={py1} width={px2 - px1} height={py2 - py1} rx="24" fill="#0d1b2e" />
        <g clipPath="url(#rd-panel-clip)">
          <rect x={px1} y={py1} width={px2 - px1} height={py2 - py1} fill="#0d1b2e" />
          {stars}
          <path d={`M${px1} ${py1} L${px2} ${py1} L${px2} ${curveY(px2).toFixed(1)} ${Array.from({length: 30}, (_, i) => {
            const x = px2 - (i + 1) * (px2 - px1) / 30;
            return `L${x.toFixed(1)} ${curveY(x).toFixed(1)}`;
          }).join(' ')} Z`} fill="url(#rd-sky)" opacity=".9" />
          <path d={`M${px1} ${py2} L${px1} ${curveY(px1).toFixed(1)} ${Array.from({length: 30}, (_, i) => {
            const x = px1 + (i + 1) * (px2 - px1) / 30;
            return `L${x.toFixed(1)} ${curveY(x).toFixed(1)}`;
          }).join(' ')} L${px2} ${py2} Z`} fill="#050b14" />
        </g>

        <Text x={px1 + 24} y={py1 + 56} size="24" fill="#dce8f0" weight="700">Atmósfera · N₂ y O₂</Text>

        {/* noon sun + beam */}
        <circle cx={sunNoonX} cy={sunNoonY} r="70" fill="#fff5c8" opacity=".22" filter="url(#rd-glow)" />
        <circle cx={sunNoonX} cy={sunNoonY} r="42" fill="url(#rd-sun-noon)" />
        {Array.from({length: 8}, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <line key={i} x1={sunNoonX + Math.cos(a) * 52} y1={sunNoonY + Math.sin(a) * 52} x2={sunNoonX + Math.cos(a) * 68} y2={sunNoonY + Math.sin(a) * 68} stroke="#fff3c4" strokeWidth="4" strokeLinecap="round" />;
        })}
        <Text x={sunNoonX + 88} y={sunNoonY + 8} size="24" fill="#fff" weight="700">Sol del mediodía</Text>
        <line x1={sunNoonX} y1={sunNoonY + 44} x2={obsX} y2={obsY} stroke="#fff6da" strokeWidth="3" opacity=".8" />
        <circle cx={noonPX} cy={noonPY} r="8" fill="#fffbe6" opacity=".95" filter="url(#rd-glow)" />
        <circle cx={noonPX} cy={noonPY} r="4.5" fill="#fffbe6" />
        {burst(obsX, obsY - 6, 3, 62, 46, '#2c9ed6', -1)}
        {burst(obsX, obsY - 6, 41, 74, 40, '#2c9ed6', 1)}

        {/* dusk sun + beam */}
        <circle cx={sunDuskX} cy={sunDuskY} r="70" fill="#f4873d" opacity=".22" filter="url(#rd-glow)" />
        <circle cx={sunDuskX} cy={sunDuskY} r="40" fill="url(#rd-sun-dusk)" />
        <Text x={sunDuskX - 55} y={sunDuskY + 8} size="24" fill="#fff" weight="700" anchor="end">Sol en el horizonte</Text>
        <line x1={sunDuskX} y1={sunDuskY} x2={obsX} y2={obsY} stroke="#ffd9ad" strokeWidth="3" opacity=".7" />
        <circle cx={duskPX} cy={duskPY} r="8" fill="#ffdfa8" opacity=".95" filter="url(#rd-glow)" />
        <circle cx={duskPX} cy={duskPY} r="4.5" fill="#ffdfa8" />
        {[0.2, 0.4, 0.6].map((t, i) => {
          const bx = sunDuskX + (obsX - sunDuskX) * t;
          const by = sunDuskY + (obsY - sunDuskY) * t;
          return <React.Fragment key={i}>{burst(bx, by, 7 + i * 13, 55 + i * 9, 60, '#2c9ed6', i % 2 ? 1 : -1)}</React.Fragment>;
        })}

        {/* observer */}
        <circle cx={obsX} cy={obsY} r="5" fill="#fff" stroke="#0d1b2e" strokeWidth="2" />
        <Text x={obsX} y={obsY + 34} size="24" fill="#fff" weight="700" anchor="middle">Vos, mirando</Text>

        {/* pills */}
        <g transform={`translate(${obsX - 220} ${obsY - 130})`}>
          <rect width="150" height="42" rx="21" fill="#0d1b2e" opacity=".85" />
          <Text x="75" y="28" size="21" fill="#8fd1f0" weight="700" anchor="middle">×1 de aire</Text>
        </g>
        <g transform={`translate(${(sunDuskX + obsX) / 2 - 90} ${(sunDuskY + obsY) / 2 - 40})`}>
          <rect width="180" height="42" rx="21" fill="#3a2418" opacity=".88" />
          <Text x="90" y="28" size="21" fill="#ffb37a" weight="700" anchor="middle">×38 de aire</Text>
        </g>

        {/* camino corto / largo cards */}
        <Card x="76" y="1190" w="655" h="150">
          <Text x="106" y="1236" size="27" fill={C.blue} weight="700">Camino corto</Text>
          <text x="106" y="1272" fontSize="21" fill={C.muted}>
            <tspan x="106" dy="0">Poca atmósfera: se desvía poco azul.</tspan>
            <tspan x="106" dy="27">Por eso el cielo se ve celeste.</tspan>
          </text>
        </Card>
        <Card x="765" y="1190" w="655" h="150">
          <Text x="795" y="1236" size="27" fill={C.red} weight="700">Camino largo</Text>
          <text x="795" y="1272" fontSize="21" fill={C.muted}>
            <tspan x="795" dy="0">Rasante, cruza ~38 veces más aire:</tspan>
            <tspan x="795" dy="27">se pierde el azul, queda el rojo.</tspan>
          </text>
        </Card>

        {/* bar chart */}
        <rect x="76" y="1370" width="1344" height="460" rx="18" fill="#fffdf7" stroke={C.line} strokeWidth="2.5" />
        <Text x="106" y="1420" size="30" fill={C.ink} weight="700">Cuánto se dispersa cada color</Text>
        <rect x="1148" y="1392" width="230" height="42" rx="10" fill="#eaf1fb" />
        <Text x="1263" y="1420" size="24" fill={C.blue} weight="700" anchor="middle">I ∝ 1 / λ⁴</Text>
        {COLORS.map(([name, nm, color, mult], i) => {
          const rowY = 1450 + i * rowH;
          const grow = interpolate(loop(frame, 240), [10 + i * 4, 40 + i * 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const w = barMaxW * (mult / 9.4) * grow;
          return (
            <g key={name}>
              <Text x="106" y={rowY + 6} size="21" fill={C.ink} weight="700">{name} <tspan fill={C.muted} fontWeight="400">{nm} nm</tspan></Text>
              <rect x="330" y={rowY - 16} width={barMaxW} height="22" rx="11" fill="#f0ede4" />
              <rect x="330" y={rowY - 16} width={w} height="22" rx="11" fill={color} />
              <Text x={330 + barMaxW + 16} y={rowY + 1} size="20" fill={color} weight="700" opacity={grow}>×{mult.toFixed(1)}</Text>
            </g>
          );
        })}
        <Text x="106" y="1806" size="17" fill={C.muted} italic>Dispersión relativa tomando el rojo (700 nm) como 1. Vale cuando la partícula es mucho más chica que la onda: el caso de las moléculas del aire.</Text>

        {/* three explainer cards */}
        <Card x="76" y="1862" w="430" h="170">
          <Text x="106" y="1906" size="24" fill={C.ink} weight="700">Moléculas diminutas</Text>
          <text x="106" y="1938" fontSize="19" fill={C.muted}>
            <tspan x="106" dy="0">El N₂ y el O₂ miden ~0,3 nm: mil</tspan>
            <tspan x="106" dy="25">veces menos que la onda de luz.</tspan>
            <tspan x="106" dy="25">Ahí vale Rayleigh.</tspan>
          </text>
        </Card>
        <Card x="536" y="1862" w="430" h="170">
          <Text x="566" y="1906" size="24" fill={C.ink} weight="700">El azul gana 5,9 a 1</Text>
          <text x="566" y="1938" fontSize="19" fill={C.muted}>
            <tspan x="566" dy="0">Con 1/λ⁴, el azul (450 nm) se</tspan>
            <tspan x="566" dy="25">dispersa 5,9 veces más que el</tspan>
            <tspan x="566" dy="25">rojo (700 nm).</tspan>
          </text>
        </Card>
        <Card x="996" y="1862" w="424" h="170">
          <Text x="1026" y="1906" size="24" fill={C.ink} weight="700">¿Y el violeta?</Text>
          <text x="1026" y="1938" fontSize="19" fill={C.muted}>
            <tspan x="1026" dy="0">Se dispersa aún más, pero el Sol</tspan>
            <tspan x="1026" dy="25">emite poco y el ojo lo ve peor:</tspan>
            <tspan x="1026" dy="25">promedia al celeste.</tspan>
          </text>
        </Card>

        <line x1="76" y1="2055" x2="1420" y2="2055" stroke={C.line} strokeWidth="2" />
        <Text x="76" y="2078" size="20" fill={C.muted} weight="700">Dispersión de Rayleigh</Text>
        <Text x="1420" y="2078" size="20" fill={C.muted} anchor="end">Sistemas Multi Física · Profesor Javier Pereyra</Text>
      </svg>
    </AbsoluteFill>
  );
};
