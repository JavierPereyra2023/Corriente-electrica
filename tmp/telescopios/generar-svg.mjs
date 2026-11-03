// Genera los planos ópticos de la clase 19 (telescopios) con geometría paraxial calculada.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { traceKepler, keplerTheory, traceGalileo, galileoTheory, traceNewton } from "./optica.mjs";

const MAIN = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
const OUT = MAIN ? process.argv[2] : null;
const save = (name, content) => { if (OUT) writeFileSync(join(OUT, name), content); };
const NAVY = "#1d3557", RAY = "#c8640f", MUTED = "#5c6b75", GOLD = "#f2c230";
const f = (n) => Math.round(n * 10) / 10;

const defs = `<defs>
<pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#1d3557" stroke-opacity=".05"/></pattern>
<linearGradient id="glass" x1="0" x2="1"><stop offset="0" stop-color="#f7fcff"/><stop offset=".5" stop-color="#bcdcea"/><stop offset="1" stop-color="#f7fcff"/></linearGradient>
<linearGradient id="glassV" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f7fcff"/><stop offset=".5" stop-color="#bcdcea"/><stop offset="1" stop-color="#f7fcff"/></linearGradient>
<linearGradient id="mirror" x1="0" x2="1"><stop offset="0" stop-color="#e9eef2"/><stop offset=".45" stop-color="#9fb0bd"/><stop offset="1" stop-color="#4b5d6b"/></linearGradient>
<linearGradient id="tube" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1d3557" stop-opacity=".09"/><stop offset=".5" stop-color="#1d3557" stop-opacity=".025"/><stop offset="1" stop-color="#1d3557" stop-opacity=".09"/></linearGradient>
<style>
text{font-family:"Segoe UI",Arial,sans-serif;fill:${NAVY};font-size:18px}
.t{font-size:23px;font-weight:700}.b{font-weight:700}.s{font-size:16px;fill:${MUTED}}.i{font-style:italic}
.pill{font-size:15px;font-weight:700;fill:#7a4b06}.g{font-family:Georgia,serif;font-style:italic;font-size:21px}
.axis{stroke:#8795a0;stroke-width:1.4;stroke-dasharray:10 7}
.ray{fill:none;stroke:${RAY};stroke-width:2.6;stroke-linejoin:round;stroke-linecap:round}
.ghost{fill:none;stroke:${RAY};stroke-width:1.8;stroke-dasharray:5 6;stroke-opacity:.55}
.beam{fill:${GOLD};fill-opacity:.2}
.lens{fill:url(#glass);stroke:${NAVY};stroke-width:2.4}
.lensV{fill:url(#glassV);stroke:${NAVY};stroke-width:2.4}
.lead{fill:none;stroke:${NAVY};stroke-width:1.3}
.ref{stroke:${MUTED};stroke-width:1.3;stroke-dasharray:4 4}
.arc{fill:none;stroke:${NAVY};stroke-width:2}
.plane{stroke:${NAVY};stroke-width:1.6;stroke-dasharray:3 6;stroke-opacity:.7}
.tube{fill:url(#tube);stroke:${NAVY};stroke-opacity:.35;stroke-width:1.5}
.dim{stroke:${NAVY};stroke-width:1.6;fill:none}
</style></defs>`;

function arrow(x, y, dx, dy, color = RAY, size = 11) {
  const L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
  const bx = x - ux * size, by = y - uy * size, w = size * 0.48;
  return `<path d="M${f(x)} ${f(y)}L${f(bx - uy * w)} ${f(by + ux * w)}L${f(bx + uy * w)} ${f(by - ux * w)}Z" fill="${color}"/>`;
}
function ray(pts) {
  let s = `<path class="ray" d="M${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join("L")}"/>`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    if (Math.hypot(x2 - x1, y2 - y1) > 70) s += arrow(x1 + (x2 - x1) * 0.55, y1 + (y2 - y1) * 0.55, x2 - x1, y2 - y1);
  }
  return s;
}
const poly = (pts, cls = "beam") => `<path class="${cls}" d="M${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join("L")}Z"/>`;
function angle(x, y, slope, r, label, lx, ly, refLen = r + 30) {
  const a = Math.atan(slope), ex = x + r * Math.cos(a), ey = y + r * Math.sin(a);
  return `<line class="ref" x1="${f(x)}" y1="${f(y)}" x2="${f(x + refLen)}" y2="${f(y)}"/>` +
    `<path class="arc" d="M${f(x + r)} ${f(y)}A${r} ${r} 0 0 ${a > 0 ? 1 : 0} ${f(ex)} ${f(ey)}"/>` +
    `<text class="g" x="${lx}" y="${ly}">${label}</text>`;
}
function pill(x, y, text, w) {
  return `<rect x="${x}" y="${y}" width="${w}" height="28" rx="14" fill="#fff6d8" stroke="#e0b84a"/><text class="pill" x="${x + w / 2}" y="${y + 19}" text-anchor="middle">${text}</text>`;
}
function star(cx, cy, r = 13) {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
    d += `${i ? "L" : "M"}${f(cx + rr * Math.cos(a))} ${f(cy + rr * Math.sin(a))}`;
  }
  return `<path d="${d}Z" fill="${GOLD}" stroke="#b17a10" stroke-width="1.5"/>`;
}
const convex = (x, y, h, b = 32) => `<path class="lens" d="M${x} ${y - h}Q${x + b} ${y} ${x} ${y + h}Q${x - b} ${y} ${x} ${y - h}Z"/>`;
const concave = (x, y, h, w = 17, c = 5) => `<path class="lens" d="M${x - w} ${y - h}L${x + w} ${y - h}Q${x + 2 * c - w} ${y} ${x + w} ${y + h}L${x - w} ${y + h}Q${x - 2 * c + w} ${y} ${x - w} ${y - h}Z"/>`;
function dimension(x1, x2, y, label, lx) {
  return `<path class="dim" d="M${x1} ${y}H${x2}M${x1} ${y - 8}V${y + 8}M${x2} ${y - 8}V${y + 8}"/>` +
    arrow(x1, y, -1, 0, NAVY, 9) + arrow(x2, y, 1, 0, NAVY, 9) +
    `<text class="b" x="${lx}" y="${y + 27}" text-anchor="middle">${label}</text>`;
}
const svg = (h, title, desc, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 ${h}" role="img" aria-labelledby="title desc">
<title id="title">${title}</title>
<desc id="desc">${desc}</desc>
${defs}
<rect width="1000" height="${h}" rx="14" fill="#fffdf7"/><rect width="1000" height="${h}" rx="14" fill="url(#grid)"/>
<rect x="0" y="0" width="8" height="${h}" fill="${GOLD}"/>
${body}
</svg>
`;

// ---------- Geometría común de refractores ----------
const AX = 280, XO = 200, FO = 400, S = 0.08;      // eje, objetivo, focal objetivo, pendiente entrante
const H = [-80, 0, 80];                             // alturas en el objetivo
const IMG = [XO + FO, AX + FO * S];                 // punto imagen (600, 312)
const X0 = 40;
const inc = H.map((h) => [[X0, AX + h - (XO - X0) * S], [XO, AX + h]]);
const yAt = (h, x) => AX + h + (x - XO) * ((IMG[1] - AX - h) / FO); // recta objetivo -> punto imagen

function header(title, pills) {
  let s = `<text class="t" x="34" y="46">${title}</text>`;
  let x = 966;
  for (const [t, w] of pills.slice().reverse()) { x -= w; s += pill(x, 26, t, w); x -= 10; }
  return s;
}
function incoming(labelY = 132) {
  return star(48, labelY - 6) + `<text class="b" x="70" y="${labelY}">Luz de un mismo punto lejano</text>` +
    `<text class="s" x="70" y="${labelY + 21}">rayos paralelos entre sí, inclinados</text>`;
}

// ---------- Galileo (calculado con matrices ABCD, ver optica.mjs) ----------
// Unidades ópticas en cm; mapeo a pantalla: X = XO + K·z, Y = AX − K·y (K = 10 px/cm, igual en ambos ejes).
export const GALILEO_DEFAULTS = { fo: 40, fe: -10, theta: -0.08, heights: [8, 0, -8], zIn: -16, zOut: 68 };
export const GALILEO_LAYOUT = { XO, AX, K: 10, objectiveHalf: 128, eyepieceHalf: 64 };

export function buildGalileo(params = {}) {
  const p = { ...GALILEO_DEFAULTS, ...params };
  const { fo, fe, theta } = p, K = GALILEO_LAYOUT.K;
  const T = galileoTheory(fo, fe, theta);
  const rays = traceGalileo(p);
  const toS = ([z, y]) => [XO + K * z, AX - K * y];
  const R = rays.map((r) => r.points.map(toS));
  const HY = rays.map((r) => r.hypothetical.map(toS));
  const XE = XO + K * T.d, XF = XO + K * fo, F = HY[1][1];
  const num = (n) => String(Math.round(n * 100) / 100).replace(".", ",").replace("-", "−");
  const mTxt = (T.M > 0 ? "+" : "−") + num(Math.abs(T.M));
  const sub = (t, fs = 14) => `<tspan baseline-shift="sub" font-size="${fs}">${t}</tspan>`;
  const top = R[0], bot = R[R.length - 1];
  const uOut = rays[0].slopes.emergent;

  let b = header("Galileo: el ocular divergente intercepta la luz", [["imagen derecha", 150], ["sin imagen real intermedia", 236]]);
  b += `<path class="tube" d="M178 168H${XE - 28}V214H${XE + 34}V346H${XE - 28}V392H178Z"/>`;
  b += `<line class="axis" x1="28" y1="${AX}" x2="975" y2="${AX}"/><text class="s" x="905" y="${AX - 9}">eje óptico</text>`;
  // plano focal del objetivo: referencia geométrica, no luz
  b += `<line class="plane" x1="${XF}" y1="176" x2="${XF}" y2="398"/><text class="b" x="${XF + 8}" y="166" style="font-size:16px">Plano focal del objetivo</text><text class="g" x="${XF + 8}" y="192" style="font-size:18px" data-etiqueta="yF">y${sub("f", 12)} = f${sub("o", 12)}θ</text>`;
  b += poly([top[0], top[1], bot[1], bot[0]]) + poly([top[1], top[2], bot[2], bot[1]]) + poly([top[2], top[3], bot[3], bot[2]]);
  // prolongaciones hipotéticas (la luz no las recorre)
  b += HY.map(([a, c]) => `<path class="ghost" d="M${f(a[0])} ${f(a[1])}L${f(c[0])} ${f(c[1])}"/>`).join("");
  b += `<path d="M${XF} ${AX}V${f(F[1])}" stroke="${NAVY}" stroke-width="1.6" stroke-dasharray="3 3"/>`;
  b += `<circle cx="${f(F[0])}" cy="${f(F[1])}" r="5.5" fill="#fffdf7" stroke="${RAY}" stroke-width="2"/>`;
  b += `<path class="lead" d="M${f(F[0] + 4)} ${f(F[1] - 6)}L${f(F[0] + 26)} 256"/><text class="s" x="${f(F[0] + 12)}" y="248" data-etiqueta="foco">Sin ocular, los rayos se reunirían aquí</text>`;
  b += R.map((pts) => ray(pts)).join("");
  b += convex(XO, AX, GALILEO_LAYOUT.objectiveHalf) + concave(XE, AX, GALILEO_LAYOUT.eyepieceHalf);
  b += `<text class="b" x="${XO + 24}" y="130">Objetivo convergente</text><text class="g" x="${XO + 24}" y="156">f${sub("o")} &gt; 0</text>`;
  b += `<text class="b" x="${XE + 10}" y="114" text-anchor="middle">Ocular divergente</text><text class="g" x="${XE + 10}" y="140" text-anchor="middle">f${sub("e")} &lt; 0</text><path class="lead" d="M${XE} 150V${AX - GALILEO_LAYOUT.eyepieceHalf - 6}"/>`;
  b += incoming(84);
  // θ en el rayo incidente superior; θ′ en el emergente superior (referencias horizontales)
  const yA = top[0][1] + (60 - top[0][0]) * -theta;
  b += angle(60, yA, -theta, 96, "θ", 168, yA + 2);
  const xB = 690, yB = top[2][1] + (xB - top[2][0]) * -uOut;
  b += angle(xB, yB, -uOut, 92, "θ′", xB + 100, yB + 20);
  b += `<text class="b" x="735" y="${f(yB - 50)}">Haz emergente paralelo</text>`;
  b += `<text class="g" x="735" y="${f(yB - 22)}" data-relacion="angulo">θ′ ≈ −(f${sub("o")}/f${sub("e")}) θ = ${mTxt}θ</text>`;
  // cotas: f_o hasta el plano focal, |f_e| y la separación d
  b += `<path class="dim" d="M${XO} 420H${XF}M${XO} 412V428M${XE} 414V426M${XF} 412V428"/>` + arrow(XO, 420, -1, 0, NAVY, 9) + arrow(XF, 420, 1, 0, NAVY, 9);
  b += `<text class="b" x="${XO + 180}" y="413" text-anchor="middle">f${sub("o", 13)} = ${num(fo)} cm</text><text class="g" x="${(XE + XF) / 2}" y="413" text-anchor="middle" style="font-size:18px">|f${sub("e", 12)}|</text>`;
  b += dimension(XO, XE, 452, `d = f${sub("o", 13)} − |f${sub("e", 13)}| = ${num(T.d)} cm`, (XO + XE) / 2);
  b += `<text class="s i" x="34" y="508" data-escala="${K}">Horizontal a escala: 1 cm = ${K} unidades del dibujo (en pantalla, los px dependen del ancho de la figura).</text>`;
  b += `<text class="s i" x="34" y="530">Ángulos positivos hacia arriba: θ y θ′ &lt; 0, igual signo → imagen derecha. Ángulos exagerados.</text>`;
  const svgText = svg(545,
    "Telescopio galileano: objetivo convergente y ocular divergente",
    `Tres rayos paralelos de un mismo punto lejano llegan al objetivo convergente, de focal ${num(fo)} cm, con inclinación θ. El objetivo los dirige hacia un punto de su plano focal situado a f sub o por θ del eje, pero el ocular divergente, de focal ${num(fe)} cm y ubicado a ${num(T.d)} cm, los intercepta antes. Líneas punteadas muestran dónde se reunirían sin ocular. Salen paralelos con θ′ = ${mTxt}θ, del mismo signo: imagen derecha y sin imagen real intermedia.`, b);
  return { svg: svgText, rays, screen: R, hypothetical: HY, theory: T, params: p, focus: F, XE, XF };
}

save("galileo-rayos.svg", buildGalileo().svg);

// ---------- Kepler (calculado con matrices ABCD, ver optica.mjs) ----------
// Mapeo a pantalla: X = XO + z, Y = AX − y (en el SVG la y crece hacia abajo). Escala 1:1 en ambos ejes
// (unidad = 1 px; equivale a fo = 40 cm y fe = 10 cm con 1 cm = 10 px). Por usar la misma escala horizontal
// y vertical, las pendientes del SVG son las del modelo con signo invertido: la exageración de θ es coherente.
export const KEPLER_DEFAULTS = { fo: 400, fe: 100, theta: -0.10, heights: [80, 0, -80], zIn: -160, zOut: 745 };
export const KEPLER_LAYOUT = { XO, AX, objectiveHalf: 128, eyepieceHalf: 88 };

export function buildKepler(params = {}) {
  const p = { ...KEPLER_DEFAULTS, ...params };
  const { fo, fe, theta } = p;
  const T = keplerTheory(fo, fe, theta);
  const rays = traceKepler(p);
  const toS = ([z, y]) => [XO + z, AX - y];
  const R = rays.map((r) => r.points.map(toS));                 // vértices en pantalla
  const XE = XO + T.d, XF = XO + fo;
  const IMGs = R[1][2];                                           // punto imagen (todos los rayos coinciden; ver pruebas)
  const M = T.M, mTxt = String(Math.abs(M)).replace(".", ",");
  const sub = (t, fs = 14) => `<tspan baseline-shift="sub" font-size="${fs}">${t}</tspan>`;
  const top = R[0], bot = R[R.length - 1];

  let b = header("Kepler: la luz se cruza antes del ocular", [["imagen invertida", 160], ["imagen real intermedia", 206]]);
  b += `<path class="tube" d="M178 168H${XE - 52}V${AX - 94}H${XE + 36}V${AX + 94}H${XE - 52}V392H178Z"/>`;
  b += `<line class="axis" x1="28" y1="${AX}" x2="975" y2="${AX}"/><text class="s" x="905" y="${AX + 24}">eje óptico</text>`;
  b += `<line class="plane" x1="${XF}" y1="150" x2="${XF}" y2="410"/>`;
  b += poly([top[0], top[1], bot[1], bot[0]]) + poly([top[1], IMGs, bot[1]]) + poly([IMGs, top[3], bot[3]]) + poly([top[3], top[4], bot[4], bot[3]]);
  b += R.map((pts) => ray(pts)).join("");
  // altura de la imagen intermedia: y_f = f_o·θ (negativa: debajo del eje)
  b += `<path d="M${XF} ${AX}V${f(IMGs[1] - 2)}" stroke="${NAVY}" stroke-width="3.2"/>` + arrow(XF, IMGs[1] + 4, 0, 1, NAVY, 10);
  b += `<circle cx="${f(IMGs[0])}" cy="${f(IMGs[1])}" r="5" fill="${NAVY}"/>`;
  b += `<text class="g" x="${XF - 10}" y="${AX - 9}" text-anchor="end" style="font-size:18px">y${sub("f", 12)} = f${sub("o", 12)}θ</text>`;
  b += convex(XO, AX, KEPLER_LAYOUT.objectiveHalf) + convex(XE, AX, KEPLER_LAYOUT.eyepieceHalf, 26);
  b += `<text class="b" x="${XO + 24}" y="130">Objetivo convergente</text><text class="g" x="${XO + 24}" y="156">f${sub("o")} &gt; 0</text>`;
  b += `<text class="b" x="${XE}" y="114" text-anchor="middle">Ocular convergente</text><text class="g" x="${XE}" y="140" text-anchor="middle">f${sub("e")} &gt; 0</text><path class="lead" d="M${XE} 150V${AX - KEPLER_LAYOUT.eyepieceHalf - 2}"/>`;
  b += `<text class="b" x="290" y="384" data-etiqueta="punto-imagen">Punto de la imagen real intermedia</text><text class="s" x="290" y="405" data-etiqueta="un-punto">Los tres rayos forman la imagen</text><text class="s" x="290" y="424">de un único punto del objeto.</text><path class="lead" d="M562 366L${XF - 6} ${f(IMGs[1] + 6)}"/>`;
  b += `<text class="s" x="${XF}" y="430" text-anchor="middle">plano focal compartido</text>`;
  b += incoming(84);
  // θ: en el rayo incidente superior, respecto de una horizontal (θ < 0: baja)
  const yA = top[0][1] + (60 - top[0][0]) * -theta;
  b += angle(60, yA, -theta, 96, "θ", 168, yA + 2);
  // θ′: donde el rayo emergente superior cruza el eje (el eje es la referencia)
  const uOut = rays[rays.length - 1].slopes.emergent;
  const zCross = T.d - rays[rays.length - 1].points[3][1] / uOut;
  b += angle(XO + zCross, AX, -uOut, 92, "θ′", XO + zCross + 98, AX - 12, 0);
  b += `<text class="b" x="760" y="${AX + 92}">Sale paralelo,</text><text class="s" x="760" y="${AX + 113}">inclinado al revés:</text>`;
  b += `<text class="g" x="760" y="${AX + 143}" data-relacion="angulo">θ′ ≈ −(f${sub("o")}/f${sub("e")}) θ = −${mTxt}θ</text>`;
  b += `<path class="dim" d="M${XO} 462H${XE}M${XO} 454V470M${XF} 456V468M${XE} 454V470"/>` + arrow(XO, 462, -1, 0, NAVY, 9) + arrow(XE, 462, 1, 0, NAVY, 9);
  b += `<text class="g" x="${(XO + XF) / 2}" y="455" text-anchor="middle">f${sub("o")}</text><text class="g" x="${(XF + XE) / 2}" y="455" text-anchor="middle">f${sub("e")}</text>`;
  b += `<text class="b" x="${(XO + XE) / 2}" y="492" text-anchor="middle">d = f${sub("o", 13)} + f${sub("e", 13)}</text>`;
  b += `<text class="s i" x="34" y="526">Ángulos positivos hacia arriba: θ &lt; 0 y θ′ &gt; 0. Ángulos exagerados para que se vean: no está a escala.</text>`;
  const svgText = svg(545,
    "Telescopio kepleriano: dos lentes convergentes y plano focal compartido",
    `Tres rayos paralelos de un mismo punto lejano llegan al objetivo convergente con inclinación θ. Se cruzan en un único punto del plano focal compartido, a una altura f sub o por θ debajo del eje: es un punto de la imagen real intermedia. Los tres rayos forman la imagen de un único punto del objeto. Siguen en línea recta hasta el ocular convergente y salen paralelos con inclinación θ′ = −${mTxt}θ, en sentido opuesto.`, b);
  return { svg: svgText, rays, screen: R, theory: T, params: p, image: IMGs };
}

save("kepler-rayos.svg", buildKepler().svg);


// ---------- Newton (trazado vectorial exacto, ver traceNewton en optica.mjs) ----------
// Marco cartesiano del motor (y hacia arriba, eje del tubo en y = 0) → pantalla: X = x, Y = A − y. Unidades = unidades del SVG.
export const NEWTON_DEFAULTS = { shape: "parabola", xV: 846, f: 396, xS: 600, secHalf: 43 * Math.SQRT2, heights: [80, -80], xIn: 30, fe: 50, yOut: 254 };
export const NEWTON_LAYOUT = { A: 330, mirrorHalf: 125, mirrorThick: 15 };

export function buildNewton(params = {}) {
  const p = { ...NEWTON_DEFAULTS, ...params }, { A, mirrorHalf: hM, mirrorThick: th } = NEWTON_LAYOUT;
  const T = traceNewton(p);
  const toS = ([x, y]) => [x, A - y];
  const R = T.rays.map((r) => r.points.map(toS));
  const [XS, YF] = toS(T.Fp), YE = A - T.yLens, YO = A - p.yOut;
  const r1 = R[0], r2 = R[1];
  const step = (n, x, y) => `<circle cx="${x}" cy="${y}" r="13" fill="${NAVY}"/><text x="${x}" y="${y + 5.5}" text-anchor="middle" font-size="15" font-weight="700" fill="#fff" style="fill:#fff">${n}</text>`;
  // primario parabólico: la parábola x = xV − y²/(4f) es exactamente una Bézier cuadrática
  const xEdge = p.xV - (hM * hM) / (4 * p.f), xCtl = p.xV + (hM * hM) / (4 * p.f);
  // secundario: segmento de semilongitud secHalf a 45°, centrado en (xS, 0)
  const s1 = toS([p.xS - p.secHalf / Math.SQRT2, p.secHalf / Math.SQRT2]), s2 = toS([p.xS + p.secHalf / Math.SQRT2, -p.secHalf / Math.SQRT2]);
  const P = (pts) => pts.map((q) => `${f(q[0])} ${f(q[1])}`).join("L");
  let b = `<text class="t" x="34" y="46">Newton: el primario reúne, el secundario desvía</text>` + pill(796, 26, "reflector", 110);
  b += `<path class="tube" d="M110 215H880V450H110Z"/><path d="M110 215H880V450H110" fill="none" stroke="${NAVY}" stroke-width="3" stroke-opacity=".55"/>`;
  b += `<path class="tube" d="M${f(XS - 30)} 215V146H${f(XS + 30)}V215"/>`;
  b += `<line class="axis" x1="28" y1="${A}" x2="${f(xEdge - 6)}" y2="${A}"/><line class="axis" x1="${f(XS)}" y1="${A}" x2="${f(XS)}" y2="150"/>`;
  b += poly([r1[0], r1[1], r2[1], r2[0]]) + poly([r1[1], r1[2], r2[2], r2[1]]) + poly([r1[2], r1[3], r2[2]]) + poly([r1[3], r1[4], r2[4]]) + poly([r2[4], r1[4], r1[5], r2[5]]);
  // halo color papel bajo el haz desviado: se distingue donde cruza el haz que entra
  b += R.map((pts) => `<path d="M${P(pts.slice(2))}" fill="none" stroke="#fffdf7" stroke-width="7" stroke-opacity=".9" stroke-linejoin="round"/>`).join("");
  b += R.map((pts) => ray(pts)).join("");
  b += R.map((pts) => arrow(pts[5][0], (pts[4][1] + pts[5][1]) / 2 - 4, 0, -1)).join("");   // salida hacia el ojo
  b += `<path d="M${f(xEdge)} ${A - hM}Q${f(xCtl)} ${A} ${f(xEdge)} ${A + hM}L${f(xEdge + th)} ${A + hM}Q${f(xCtl + th)} ${A} ${f(xEdge + th)} ${A - hM}Z" fill="url(#mirror)" stroke="${NAVY}" stroke-width="2" data-primario="parabola"/>`;
  b += `<path d="M${f(s1[0])} ${f(s1[1])}L${f(s2[0])} ${f(s2[1])}" stroke="#4b5d6b" stroke-width="8" stroke-linecap="round"/><path d="M${f(s1[0])} ${f(s1[1])}L${f(s2[0])} ${f(s2[1])}" stroke="#e9eef2" stroke-width="2" stroke-linecap="round" data-secundario="1"/>`;
  b += `<path class="lensV" d="M${f(XS - 44)} ${f(YE)}Q${f(XS)} ${f(YE - 19)} ${f(XS + 44)} ${f(YE)}Q${f(XS)} ${f(YE + 19)} ${f(XS - 44)} ${f(YE)}Z"/>`;
  b += `<line class="plane" x1="${f(XS - 52)}" y1="${f(YF)}" x2="${f(XS + 52)}" y2="${f(YF)}"/><circle cx="${f(XS)}" cy="${f(YF)}" r="5" fill="${NAVY}"/>`;
  b += step(1, 46, 178) + `<text class="b" x="68" y="172">Entra la luz</text><text class="s" x="68" y="193">de un objeto lejano</text>`;
  b += step(2, 930, A) + `<text class="b" x="702" y="486" >Primario cóncavo</text><text class="s" x="702" y="507">refleja y hace converger</text><path class="lead" d="M792 470L${f(xEdge + 4)} ${A + hM - 3}"/>`;
  b += step(3, 556, 392) + `<text class="b" x="330" y="486">Secundario plano a 45°</text><text class="s" x="330" y="507">solo cambia la dirección</text><path class="lead" d="M520 468L548 404"/>`;
  b += step(4, 520, YF) + `<text class="b" x="498" y="112" text-anchor="end" data-etiqueta="punto-imagen">Punto de la imagen real intermedia</text><text class="s" x="498" y="133" text-anchor="end" data-etiqueta="un-punto">Los rayos provienen de un mismo punto lejano.</text><path class="lead" d="M488 142L510 169"/>`;
  b += step(5, 680, YE) + `<text class="b" x="702" y="${f(YE - 2)}">Ocular lateral</text><text class="s" x="702" y="${f(YE + 19)}">el ojo se ubica arriba</text>`;
  b += `<text class="s i" x="34" y="530">Primario parabólico ideal y ocular como lente delgada. Se omiten soportes, sombra del secundario y ajuste de enfoque.</text>`;
  const svgText = svg(550,
    "Reflector newtoniano: recorrido de la luz hasta el ocular lateral",
    "Pasos numerados: 1, la luz de un objeto lejano entra por la boca del tubo; 2, el espejo primario cóncavo del fondo, parabólico, la refleja convergente; 3, un espejo secundario plano a cuarenta y cinco grados la desvía hacia arriba sin cambiar su convergencia; 4, los rayos se cruzan en un punto de la imagen real intermedia, en el plano focal; los rayos provienen de un mismo punto lejano; 5, el ocular lateral los hace salir paralelos hacia el ojo.", b);
  return { svg: svgText, trace: T, screen: R, params: p, mirror: { xEdge, xCtl }, secondary: [s1, s2] };
}

save("newton-rayos.svg", buildNewton().svg);
if (MAIN) console.log("ok");
