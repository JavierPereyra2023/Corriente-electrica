// Pruebas del telescopio de Galileo: node --test tmp/telescopios/galileo.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { traceGalileo, galileoTheory, afocalMatrix } from "./optica.mjs";
import { buildGalileo, GALILEO_DEFAULTS, GALILEO_LAYOUT } from "./generar-svg.mjs";

const EPS = 1e-9, PIX = 0.06;          // PIX: el SVG redondea a 0,1 px
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b} (tol ${tol})`);
const slope = ([x1, y1], [x2, y2]) => (y2 - y1) / (x2 - x1);
const CASES = [[40, -10], [40, -5], [100, -2.5], [30, -12], [12.3, -4.1]];   // cm
const THETAS = [-0.08, -0.01, 0.03];
const HEIGHTS = [8, 3, 0, -5, -8];
const run = (fo, fe, theta) => traceGalileo({ fo, fe, theta, heights: HEIGHTS, zIn: -10, zOut: fo + fe + 40 });
const svgPaths = (svg, cls) => [...svg.matchAll(new RegExp(`class="${cls}" d="M([^"]+)"`, "g"))]
  .map((m) => m[1].split("L").map((q) => q.trim().split(/\s+/).map(Number)));

test("1. Rayos incidentes paralelos", () => {
  for (const [fo, fe] of CASES) for (const th of THETAS) for (const r of run(fo, fe, th)) {
    near(r.slopes.incident, th, EPS, "pendiente"); near(slope(r.points[0], r.points[1]), th, EPS, "tramo de entrada");
  }
});

test("2. Convergencia hipotética del objetivo aislado en (f_o, f_o·θ)", () => {
  for (const [fo, fe] of CASES) for (const th of THETAS) for (const r of run(fo, fe, th)) {
    const [zF, yF] = r.hypothetical[1];
    near(zF, fo, EPS, "z_F"); near(yF, fo * th, 1e-9 * fo, "y_F = f_o·θ");
  }
});

test("3. El ocular está en z = d = f_o + f_e, antes del foco del objetivo", () => {
  for (const [fo, fe] of CASES) for (const r of run(fo, fe, -0.05)) {
    near(r.points[2][0], fo + fe, EPS, "posición del ocular");
    assert.ok(r.points[2][0] < r.hypothetical[1][0], "el ocular intercepta antes del plano focal");
  }
});

test("4. Sin imagen real intermedia: los rayos reales no se cruzan entre las lentes", () => {
  for (const [fo, fe] of CASES) for (const th of [-0.08, 0.03]) {
    const rays = run(fo, fe, th), d = fo + fe;
    // dos rayos y1 + u1 z = y2 + u2 z se cortan en z = −(y1−y2)/(u1−u2); debe caer fuera de (0, d]
    for (let i = 0; i < rays.length; i++) for (let j = i + 1; j < rays.length; j++) {
      const a = rays[i], b = rays[j];
      const zc = -(a.h - b.h) / (a.slopes.between - b.slopes.between);
      assert.ok(zc > d + EPS, `cruce en z = ${zc}, después del ocular (solo prolongación)`);
    }
    // después del ocular son paralelos: nunca se cruzan
    near(rays[0].slopes.emergent, rays.at(-1).slopes.emergent, EPS, "sin cruce posterior");
  }
});

test("5. Rayos emergentes paralelos, independientes de la altura de incidencia", () => {
  for (const [fo, fe] of CASES) for (const th of THETAS) {
    const t = galileoTheory(fo, fe, th);
    for (const r of run(fo, fe, th)) {
      near(r.slopes.emergent, t.thetaOut, 1e-12, `pendiente emergente (h = ${r.h})`);
      near(slope(r.points[2], r.points[3]), t.thetaOut, 1e-9, "tramo de salida");
    }
  }
});

test("6. Aumento angular positivo M = −f_o/f_e > 0 (imagen derecha) y matriz ABCD afocal", () => {
  for (const [fo, fe] of CASES) {
    const M = afocalMatrix(fo, fe);
    assert.ok(-fo / fe > 0);
    near(M[1][0], 0, 1e-12, "C = 0 (afocal)"); near(M[1][1], -fo / fe, 1e-12, "D = M_θ");
    near(M[0][0] * M[1][1] - M[0][1] * M[1][0], 1, 1e-12, "det = 1");
    for (const th of THETAS) for (const r of run(fo, fe, th)) if (th !== 0) assert.equal(Math.sign(r.slopes.emergent), Math.sign(th), "θ y θ′ con igual signo");
  }
  assert.throws(() => traceGalileo({ fo: 40, fe: 10, theta: 0, heights: [0], zIn: -1, zOut: 60 }), /divergente/);
  assert.throws(() => traceGalileo({ fo: -40, fe: -10, theta: 0, heights: [0], zIn: -1, zOut: 60 }), /convergente/);
  assert.throws(() => traceGalileo({ fo: 10, fe: -40, theta: 0, heights: [0], zIn: -1, zOut: 60 }), /d > 0/);
});

test("7. Separación d = f_o − |f_e| y caso de referencia 40 cm / −10 cm", () => {
  for (const [fo, fe] of CASES) near(galileoTheory(fo, fe, 0).d, fo - Math.abs(fe), EPS, "d");
  const t = galileoTheory(40, -10, -0.08);
  near(t.d, 30, EPS, "d = 30 cm"); near(t.M, 4, EPS, "M = +4"); near(t.yF, -3.2, EPS, "y_F = −3,2 cm");
  assert.deepEqual([GALILEO_DEFAULTS.fo, GALILEO_DEFAULTS.fe], [40, -10], "el SVG publicado usa el caso de referencia");
});

test("8. SVG: rayos continuos, sin saltos, dentro de las lentes", () => {
  for (const params of [{}, { fe: -8 }, { fo: 35 }]) {
    const g = buildGalileo(params), paths = svgPaths(g.svg, "ray");
    assert.equal(paths.length, g.params.heights.length);
    paths.forEach((pts, i) => {
      assert.equal(pts.length, 4, "entrada, objetivo, ocular, salida en un solo trazo");
      pts.forEach((pt, j) => { near(pt[0], g.screen[i][j][0], PIX, "x"); near(pt[1], g.screen[i][j][1], PIX, "y"); });
      for (let j = 0; j < 3; j++) assert.ok(pts[j + 1][0] > pts[j][0], "avanza hacia la derecha");
      // la prolongación arranca exactamente donde el rayo toca el ocular
      const gh = svgPaths(g.svg, "ghost")[i];
      near(gh[0][0], pts[2][0], PIX, "prolongación continua x"); near(gh[0][1], pts[2][1], PIX, "prolongación continua y");
      near(slope(gh[0], gh[1]), slope(pts[1], pts[2]), 1e-3, "prolongación colineal con el tramo real");
    });
    for (const r of g.rays) {
      assert.ok(GALILEO_LAYOUT.K * Math.abs(r.points[1][1]) < GALILEO_LAYOUT.objectiveHalf, "dentro del objetivo");
      assert.ok(GALILEO_LAYOUT.K * Math.abs(r.points[2][1]) < GALILEO_LAYOUT.eyepieceHalf, "dentro del ocular");
    }
  }
});

test("9. Foco hipotético dibujado en (x_o + f_o, y_F) con y hacia abajo en el SVG", () => {
  for (const params of [{}, { fe: -8 }, { fo: 35, theta: -0.06 }]) {
    const g = buildGalileo(params), { XO, AX, K } = GALILEO_LAYOUT, { fo, theta } = g.params;
    const c = g.svg.match(/<circle cx="([\d.]+)" cy="([\d.]+)" r="5.5"/);
    near(+c[1], XO + K * fo, PIX, "x_F = x_o + f_o");
    near(+c[2], AX - K * fo * theta, PIX, "Y_F = AX − K·f_o·θ (signo invertido por la y de pantalla)");
    for (const gh of svgPaths(g.svg, "ghost")) { near(gh[1][0], +c[1], PIX, "prolongaciones al foco x"); near(gh[1][1], +c[2], PIX, "prolongaciones al foco y"); }
    const plane = g.svg.match(/class="plane" x1="([\d.]+)"/);
    near(+plane[1], XO + K * fo, PIX, "plano focal del objetivo");
    assert.ok(g.svg.includes('stroke-dasharray:5 6') && /class="ghost"/.test(g.svg), "prolongaciones discontinuas");
  }
});

test("10. Modelo ↔ coordenadas SVG ↔ etiquetas", () => {
  const g = buildGalileo(), { XO, AX, K } = GALILEO_LAYOUT;
  // pendientes del SVG = pendientes del modelo (misma escala K en ambos ejes; y de pantalla invertida)
  svgPaths(g.svg, "ray").forEach((pts, i) => {
    const s = g.rays[i].slopes;
    near(-slope(pts[0], pts[1]), s.incident, 1e-3, "incidente"); near(-slope(pts[1], pts[2]), s.between, 1e-3, "entre lentes");
    near(-slope(pts[2], pts[3]), s.emergent, 1e-3, "emergente");
  });
  near(g.XE - XO, K * 30, PIX, "ocular a 30 cm = 300 px");
  const rel = g.svg.match(/data-relacion="angulo">(.*?)<\/text>/)[1].replace(/<[^>]+>/g, "");
  assert.ok(rel.endsWith("= +4θ") && rel.includes("−(fo/fe)"), `etiqueta «${rel}»`);
  assert.ok(g.svg.replace(/<[^>]+>/g, "").includes("d = fo − |fe| = 30 cm"), "cota d");
  assert.ok(g.svg.replace(/<[^>]+>/g, "").includes("fo = 40 cm"), "cota f_o");
  const dim = g.svg.match(/class="dim" d="M(\d+) 420H(\d+)M\d+ 412V428M(\d+) 414V426/);
  assert.deepEqual([+dim[1], +dim[3], +dim[2]], [XO, XO + K * 30, XO + K * 40], "marcas de f_o, d y |f_e|");
  assert.ok(g.svg.includes("θ′ = +4θ"), "descripción accesible coherente");
  assert.ok(/data-etiqueta="yF"/.test(g.svg), "etiqueta y_F presente");
});

// ---- Pruebas agregadas en el ajuste final ----
test("11. Escala horizontal medida en el SVG = escala declarada (sin duplicar constantes)", () => {
  const g = buildGalileo(), s = g.svg;
  const xObj = +s.match(/class="lens" d="M([\d.]+) /)[1];
  const m = s.match(/class="lens" d="M([\d.]+) [\d.]+L([\d.]+) [\d.]+Q/);       // ocular bicóncavo: centro entre sus bordes
  const xOc = (+m[1] + +m[2]) / 2, xF = +s.match(/<circle cx="([\d.]+)"/)[1];
  const s1 = (xOc - xObj) / galileoTheory(40, -10, 0).d, s2 = (xF - xObj) / 40;
  near(s1, s2, 0.1 / 30, "s por el ocular vs s por el foco");   // tolerancia: 0,1 unidad de redondeo sobre 30 cm
  const declarada = +s.match(/data-escala="([\d.]+)"/)[1];
  near(s1, declarada, 0.1 / 30, "escala declarada en la etiqueta");
  assert.equal(declarada, GALILEO_LAYOUT.K, "la etiqueta se genera desde la misma constante del motor");
  assert.ok(!/1 cm = \d+ px/.test(s), "la etiqueta no habla de px de pantalla");
});

test("12. Haz emergente paralelo medido en el SVG: u′₁ = u′₂ = u′₃ = 4u, mismo signo", () => {
  const g = buildGalileo();
  const paths = svgPaths(g.svg, "ray");
  const u = paths.map((p) => -slope(p[0], p[1])), uOut = paths.map((p) => -slope(p[2], p[3]));
  // tolerancia: tramos de salida de 380 unidades redondeados a 0,1 → error de pendiente ≤ 0,2/380 ≈ 5e-4
  for (const v of uOut) near(v, uOut[0], 5e-4, "pendientes emergentes iguales");
  for (let i = 0; i < 3; i++) {
    near(uOut[i] / u[i], 4, 0.01, "u′/u = M = +4");
    assert.equal(Math.sign(uOut[i]), Math.sign(u[i]), "mismo signo");
  }
  // pendiente u = dy/dz no es el ángulo arctan(u): la relación lineal exacta es entre pendientes
  const th = Math.atan(u[0]), thOut = Math.atan(uOut[0]);
  assert.ok(Math.abs(thOut / th - 4) > 0.05, "arctan(u′)/arctan(u) ≠ 4 fuera del régimen paraxial: por eso se compara u");
  near(thOut / th, 4, 0.2, "θ′ ≈ 4θ en aproximación paraxial");
});

test("13. Etiquetas del plano focal separadas y legibles", () => {
  const s = buildGalileo().svg, plain = s.replace(/<[^>]+>/g, "");
  assert.ok(plain.includes("Plano focal del objetivo"));
  assert.ok(/data-etiqueta="yF">y.*f.*= f.*o.*θ</.test(s), "y_f = f_o·θ junto al plano");
  assert.ok(/data-etiqueta="foco">Sin ocular, los rayos se reunirían aquí</.test(s));
  assert.equal(svgPaths(s, "ghost").length, 3, "se conservan las prolongaciones hipotéticas");
});
