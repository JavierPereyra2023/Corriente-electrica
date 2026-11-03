// Pruebas del telescopio de Kepler: node --test tmp/telescopios/
import { test } from "node:test";
import assert from "node:assert/strict";
import { P, L, mul, keplerMatrix, traceKepler, keplerTheory } from "./optica.mjs";
import { buildKepler, KEPLER_DEFAULTS, KEPLER_LAYOUT } from "./generar-svg.mjs";

const EPS = 1e-9;      // cálculo en coordenadas ópticas
const PIX = 0.06;      // el SVG redondea coordenadas a 0,1 px
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b} (tol ${tol})`);
const slope = ([x1, y1], [x2, y2]) => (y2 - y1) / (x2 - x1);
const CASES = [[400, 100], [400, 50], [1000, 50], [300, 120], [250, 250], [123.4, 7.8]];
const THETAS = [-0.1, -0.02, 0.05];

test("1. Rayos incidentes paralelos entre sí", () => {
  for (const [fo, fe] of CASES) for (const theta of THETAS) {
    const rays = traceKepler({ fo, fe, theta, heights: [30, 0, -30], zIn: -100, zOut: fo + fe + 200 });
    for (const r of rays) {
      near(r.slopes.incident, theta, EPS, "pendiente incidente");
      near(slope(r.points[0], r.points[1]), theta, EPS, "tramo de entrada");
    }
  }
});

test("2. Intersección única en el plano focal compartido, fuera del eje: y_f = f_o·θ", () => {
  for (const [fo, fe] of CASES) for (const theta of THETAS) {
    const rays = traceKepler({ fo, fe, theta, heights: [40, 10, -25], zIn: -50, zOut: fo + fe + 100 });
    for (const r of rays) {
      near(r.points[2][0], fo, EPS, "z del plano focal del objetivo");
      near(r.points[2][1], fo * theta, EPS * fo, "altura de la imagen");
      // ese punto es también el foco objeto del ocular: z = d − f_e
      near(r.points[3][0] - r.points[2][0], fe, EPS, "la imagen está a f_e del ocular: plano focal objeto del ocular");
    }
    assert.notEqual(Math.sign(rays[0].points[2][1]), 0, "con θ ≠ 0 la imagen no queda sobre el eje");
  }
});

test("3. Rayos emergentes paralelos con θ′ = −(f_o/f_e)·θ", () => {
  for (const [fo, fe] of CASES) for (const theta of THETAS) {
    const rays = traceKepler({ fo, fe, theta, heights: [50, 0, -50], zIn: -10, zOut: fo + fe + 300 });
    const t = keplerTheory(fo, fe, theta);
    for (const r of rays) {
      near(r.slopes.emergent, t.thetaOut, 1e-12, "pendiente emergente");
      near(slope(r.points[3], r.points[4]), t.thetaOut, 1e-9, "tramo de salida");
    }
  }
});

test("4. Trayectoria rectilínea entre lentes: el rayo atraviesa la imagen sin desviarse", () => {
  for (const [fo, fe] of CASES) {
    const rays = traceKepler({ fo, fe, theta: -0.1, heights: [60, 0, -60], zIn: -10, zOut: fo + fe + 50 });
    for (const r of rays) {
      near(slope(r.points[1], r.points[2]), r.slopes.between, 1e-9, "objetivo → imagen");
      near(slope(r.points[2], r.points[3]), r.slopes.between, 1e-9, "imagen → ocular");
    }
  }
});

test("5. Matriz ABCD: sistema afocal (C = 0) y A = 1/D = −f_e/f_o", () => {
  for (const [fo, fe] of CASES) {
    const M = keplerMatrix(fo, fe);
    near(M[1][0], 0, 1e-12, "C");
    near(M[1][1], -fo / fe, 1e-12, "D = aumento angular");
    near(M[0][0], -fe / fo, 1e-12, "A");
    near(M[0][0] * M[1][1] - M[0][1] * M[1][0], 1, 1e-12, "det = 1");
    const Mm = mul(L(fe), mul(P(fo + fe), L(fo)));
    assert.deepEqual(M, Mm);
  }
});

test("6. Valores no positivos se rechazan (Kepler necesita f_o, f_e > 0)", () => {
  assert.throws(() => traceKepler({ fo: 400, fe: -100, theta: 0.1, heights: [0], zIn: -1, zOut: 400 }));
  assert.throws(() => traceKepler({ fo: 0, fe: 100, theta: 0.1, heights: [0], zIn: -1, zOut: 400 }));
});

test("7. SVG: rayos continuos, sin saltos, y dentro de las lentes", () => {
  for (const [fo, fe] of [[400, 100], [400, 80], [350, 100]]) {
    const k = buildKepler({ fo, fe });
    const paths = [...k.svg.matchAll(/class="ray" d="M([^"]+)"/g)].map((m) => m[1].split("L").map((q) => q.trim().split(/\s+/).map(Number)));
    assert.equal(paths.length, k.params.heights.length, "un trazo por rayo");
    paths.forEach((pts, i) => {
      assert.equal(pts.length, 5, "entrada, objetivo, imagen, ocular, salida en un solo trazo");
      pts.forEach((pt, j) => { near(pt[0], k.screen[i][j][0], PIX, "x del vértice"); near(pt[1], k.screen[i][j][1], PIX, "y del vértice"); });
      for (let j = 0; j < 4; j++) assert.ok(pts[j + 1][0] > pts[j][0], "la luz avanza siempre hacia la derecha");
    });
    // todos los rayos pasan por el mismo punto imagen dibujado
    const c = k.svg.match(/<circle cx="([\d.]+)" cy="([\d.]+)" r="5"/);
    paths.forEach((pts) => { near(pts[2][0], +c[1], PIX, "x imagen"); near(pts[2][1], +c[2], PIX, "y imagen"); });
    // los rayos atraviesan el vidrio, no pasan por fuera de las lentes
    for (const r of k.rays) {
      assert.ok(Math.abs(r.points[1][1]) < KEPLER_LAYOUT.objectiveHalf, "dentro del objetivo");
      assert.ok(Math.abs(r.points[3][1]) < KEPLER_LAYOUT.eyepieceHalf, "dentro del ocular");
    }
    // contorno de las lentes cerrado (sin discontinuidades)
    for (const m of k.svg.matchAll(/class="lens" d="M([\d.]+) ([\d.]+)Q[^"]*?([\d.]+) ([\d.]+)Z"/g)) {
      near(+m[1], +m[3], 1e-9, "contorno cerrado x"); near(+m[2], +m[4], 1e-9, "contorno cerrado y");
    }
  }
});

test("8. Etiquetas y cotas coinciden con los parámetros", () => {
  for (const [fo, fe] of [[400, 100], [400, 80]]) {
    const k = buildKepler({ fo, fe });
    const { XO, AX } = KEPLER_LAYOUT;
    const rel = k.svg.match(/data-relacion="angulo">([^<]*(?:<[^>]+>[^<]*)*?)<\/text>/)[1].replace(/<[^>]+>/g, "");
    const mTxt = String(fo / fe).replace(".", ",");
    assert.ok(rel.endsWith(`= −${mTxt}θ`), `etiqueta del aumento: «${rel}»`);
    assert.ok(rel.includes("−(fo/fe)"), "relación con signo");
    near(k.image[0], XO + fo, PIX, "imagen en z = f_o");
    near(AX - k.image[1], fo * k.params.theta, PIX, "y_f = f_o·θ");
    assert.ok(k.image[1] > AX, "imagen debajo del eje para θ < 0 (invertida)");
    // cotas de distancias focales: marcas en XO, XO+fo, XO+fo+fe
    const dim = k.svg.match(/class="dim" d="M(\d+) 462H(\d+)M\d+ 454V470M(\d+) 456V468/);
    assert.deepEqual([+dim[1], +dim[3], +dim[2]], [XO, XO + fo, XO + fo + fe]);
    assert.ok(k.svg.includes(`θ′ = −${mTxt}θ`), "descripción accesible coherente");
  }
  assert.equal(KEPLER_DEFAULTS.fo / KEPLER_DEFAULTS.fe, 4, "el dibujo publicado usa aumento 4×");
});

// ---- Pruebas agregadas en la corrección final ----
const svgPts = (svg, cls) => [...svg.matchAll(new RegExp(`class="${cls}" d="M([^"]+)"`, "g"))]
  .map((m) => m[1].split("L").map((q) => q.trim().split(/\s+/).map(Number)));

test("9. Aumento −4× medido sobre las coordenadas del SVG publicado (θ′ = −4θ, signos opuestos)", () => {
  const k = buildKepler();
  // misma escala en ambos ejes: pendiente_modelo = −pendiente_pantalla
  for (const pts of svgPts(k.svg, "ray")) {
    const th = -slope(pts[0], pts[1]), thOut = -slope(pts[3], pts[4]);
    near(th, -0.1, 1e-3, "θ leído del SVG");
    near(thOut / th, -4, 0.01, "θ′/θ leído del SVG");      // tolerancia: redondeo a 0,1 px sobre tramos ≥ 160 px
    assert.ok(Math.sign(thOut) === -Math.sign(th), "signo opuesto");
  }
});

test("10. Posiciones de objetivo, plano focal compartido y ocular según f_o y f_e", () => {
  for (const [fo, fe] of [[400, 100], [400, 80], [350, 100]]) {
    const k = buildKepler({ fo, fe }), { XO, AX } = KEPLER_LAYOUT;
    const lensX = [...k.svg.matchAll(/class="lens" d="M([\d.]+) /g)].map((m) => +m[1]);
    assert.deepEqual(lensX, [XO, XO + fo + fe], "objetivo en x_o y ocular en x_o + f_o + f_e");
    const plane = +k.svg.match(/class="plane" x1="([\d.]+)"/)[1];
    near(plane, XO + fo, PIX, "plano focal compartido en x_o + f_o");
    near(XO + fo + fe - plane, fe, PIX, "el plano está a f_e del ocular");
    // los tres rayos tocan el plano en el mismo punto, fuera del eje (Y_pantalla = AX − f_o·θ)
    for (const pts of svgPts(k.svg, "ray")) { near(pts[2][0], plane, PIX, "x"); near(pts[2][1], AX - fo * k.params.theta, PIX, "y"); }
    assert.notEqual(AX - fo * k.params.theta, AX, "fuera del eje");
  }
});

test("11. Las etiquetas describen un punto, no la imagen completa", () => {
  const txt = buildKepler().svg;
  assert.ok(/data-etiqueta="punto-imagen">Punto de la imagen real intermedia</.test(txt));
  assert.ok(txt.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").includes("Los tres rayos forman la imagen de un único punto del objeto."));
  assert.ok(!txt.includes("invertida: queda bajo el eje"), "se quitó la afirmación sobre la imagen completa");
  assert.ok(txt.includes("rayos paralelos entre sí, inclinados"), "se conserva la aclaración de entrada");
  assert.equal(svgPts(txt, "ray").length, 3, "sin haces nuevos");
});
