// Pruebas del reflector newtoniano: node --test tmp/telescopios/newton.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { traceNewton, primarySurface, reflect, dot, add, sc, unit } from "./optica.mjs";
import { buildNewton, NEWTON_DEFAULTS, NEWTON_LAYOUT } from "./generar-svg.mjs";

const EPS = 1e-9;
// SVG redondeado a 0,1 unidad: error de posición ≤ 0,05·√2; en tramos ≥ 50 unidades el error angular es ≤ ~0,002 rad.
const PIX = 0.08, ANG_SVG = 0.12 * Math.PI / 180;
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b} (tol ${tol})`);
const angleTo = (v, n) => Math.acos(Math.min(1, Math.abs(dot(unit(v), n))));   // ángulo respecto de la normal
const sub2 = (a, b) => [a[0] - b[0], a[1] - b[1]];
const CONFIGS = [NEWTON_DEFAULTS, { ...NEWTON_DEFAULTS, f: 420, xS: 610, secHalf: 70 }, { ...NEWTON_DEFAULTS, heights: [60, 20, -20, -60] }];
const rayPaths = (svg) => [...svg.matchAll(/class="ray" d="M([^"]+)"/g)].map((m) => m[1].split("L").map((q) => q.trim().split(/\s+/).map(Number)));

test("1. Rayos incidentes paralelos al eje", () => {
  for (const c of CONFIGS) for (const r of traceNewton(c).rays) assert.deepEqual(r.d0, [1, 0]);
  for (const pts of rayPaths(buildNewton().svg)) near(pts[0][1], pts[1][1], EPS, "tramo de entrada horizontal en el SVG");
});

test("2. Impacto sobre la superficie del primario (modelo y dibujo)", () => {
  for (const c of CONFIGS) for (const r of traceNewton(c).rays) near(r.P[0], c.xV - (r.h * r.h) / (4 * c.f), EPS, "x = xV − y²/4f");
  // el dibujo del primario es la Bézier cuadrática (xEdge, A−h)·(xCtl, A)·(xEdge, A+h) = la misma parábola
  const n = buildNewton(), { A, mirrorHalf: h } = NEWTON_LAYOUT;
  const m = n.svg.match(/M([\d.]+) ([\d.]+)Q([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)L[^"]*" fill="url\(#mirror\)"/).slice(1).map(Number);
  for (const pts of rayPaths(n.svg)) {
    const t = (pts[1][1] - m[1]) / (m[5] - m[1]);
    const xs = (1 - t) ** 2 * m[0] + 2 * t * (1 - t) * m[2] + t * t * m[4];
    near(pts[1][0], xs, PIX, "el rayo se refleja sobre la cara dibujada del espejo");
  }
  near(m[1], A - h, EPS, "borde superior"); near(m[5], A + h, EPS, "borde inferior");
});

test("3. Ley de reflexión en el primario: θi = θr y d_r − d_i ∥ n̂", () => {
  for (const c of CONFIGS) for (const r of traceNewton(c).rays) {
    near(angleTo(sc(-1, r.d0), r.n), angleTo(r.d1, r.n), 1e-12, "θi = θr");
    const diff = sub2(r.d1, r.d0); near(Math.abs(diff[0] * r.n[1] - diff[1] * r.n[0]), 0, 1e-12, "cambio solo en la normal");
    assert.ok(r.d1[0] < 0, "vuelve hacia el interior del tubo");
  }
  // la misma ley medida en el SVG, con normal analítica en el punto dibujado
  const n = buildNewton();
  for (const pts of rayPaths(n.svg)) {
    const y = NEWTON_LAYOUT.A - pts[1][1], nn = primarySurface("parabola", NEWTON_DEFAULTS.xV, NEWTON_DEFAULTS.f, y).n;
    const di = sub2(pts[1], pts[0]), dr = sub2(pts[2], pts[1]);
    const toC = (v) => [v[0], -v[1]];                          // pantalla → cartesiano
    near(angleTo(sc(-1, toC(di)), nn), angleTo(toC(dr), nn), ANG_SVG, "θi = θr en el SVG");
  }
});

test("4. Convergencia: parábola exacta en F = (xV − f, 0); esfera solo paraxial", () => {
  for (const c of CONFIGS) {
    const T = traceNewton(c);
    for (const r of T.rays) {           // la recta reflejada pasa por F
      const w = sub2(T.F, r.P); near(Math.abs(w[0] * r.d1[1] - w[1] * r.d1[0]), 0, 1e-9, "pasa por el foco");
    }
  }
  // esfera con R = 2f: el foco paraxial está en f, pero el rayo marginal cruza antes (aberración esférica)
  const cross = (h) => { const { P, n } = primarySurface("sphere", 846, 396, h), d = reflect([1, 0], n); return P[0] - P[1] * d[0] / d[1]; };
  near(846 - cross(1e-3), 396, 1e-4, "foco paraxial de la esfera = R/2");
  const lsa = cross(80) - (846 - 396);
  assert.ok(lsa > 1.5 && lsa < 2.5, `aberración esférica longitudinal a h = 80: ${lsa.toFixed(3)} unidades`);
});

test("5. Todos los rayos tocan la superficie útil del secundario", () => {
  for (const c of CONFIGS) for (const r of traceNewton(c).rays) {
    near(dot(sub2(r.Q, [c.xS, 0]), r.nS), 0, 1e-9, "Q sobre el plano del secundario");
    assert.ok(r.onSecondary, `impacto a ${r.along.toFixed(2)} del centro (semilongitud ${c.secHalf.toFixed(2)})`);
  }
  // si el secundario es demasiado chico para el haz, el modelo lo detecta (no se fuerza la trayectoria)
  assert.ok(traceNewton({ ...NEWTON_DEFAULTS, f: 420, xS: 610 }).rays.some((r) => !r.onSecondary), "secundario insuficiente detectado");
  const n = buildNewton(), [s1, s2] = n.secondary;
  for (const pts of rayPaths(n.svg)) {
    const t = (pts[2][0] - s1[0]) / (s2[0] - s1[0]);
    assert.ok(t > 0 && t < 1, "dentro del segmento dibujado");
    near(pts[2][1], s1[1] + t * (s2[1] - s1[1]), PIX, "sobre el segmento dibujado");
  }
});

test("6. Ley de reflexión en el secundario y ausencia de potencia óptica", () => {
  for (const c of CONFIGS) {
    const rays = traceNewton(c).rays;
    for (const r of rays) near(angleTo(sc(-1, r.d1), r.nS), angleTo(r.d2, r.nS), 1e-12, "θi = θr");
    // un espejo plano conserva el ángulo entre rayos: no cambia la convergencia del haz
    for (let i = 0; i < rays.length; i++) for (let j = i + 1; j < rays.length; j++)
      near(dot(rays[i].d1, rays[j].d1), dot(rays[i].d2, rays[j].d2), 1e-12, "ángulo entre rayos conservado");
  }
});

test("7. Desviación hacia el ocular lateral", () => {
  for (const c of CONFIGS) {
    const T = traceNewton(c);
    const axis = reflect([-1, 0], unit([1, 1]));
    near(axis[0], 0, EPS, "eje desviado vertical"); near(axis[1], 1, EPS, "hacia arriba");
    for (const r of T.rays) assert.ok(r.d2[1] > 0 && r.E[1] > r.Q[1], "sube hacia el ocular");
  }
});

test("8. Imagen real: F′ en el camino desviado, con f = L1 + L2, antes del ocular", () => {
  for (const c of CONFIGS) {
    const T = traceNewton(c);
    near(T.L1 + T.L2, c.f, EPS, "f = L1 + L2");
    near(T.Fp[0], c.xS, EPS, "F′ sobre el eje desviado");
    for (const r of T.rays) {
      near(r.missF, 0, 1e-9, "el rayo pasa por F′");
      assert.ok(r.Q[1] < T.Fp[1] && T.Fp[1] < T.yLens, "secundario → imagen → ocular");
    }
  }
  const n = buildNewton(), c = n.svg.match(/<circle cx="([\d.]+)" cy="([\d.]+)" r="5"/);
  near(+c[1], n.trace.Fp[0], PIX, "x del punto imagen"); near(+c[2], NEWTON_LAYOUT.A - n.trace.Fp[1], PIX, "y del punto imagen");
  for (const pts of rayPaths(n.svg)) { near(pts[3][0], +c[1], PIX, "los rayos se cruzan allí"); near(pts[3][1], +c[2], PIX, ""); }
});

test("9. Trayectorias continuas y en el sentido de propagación", () => {
  const n = buildNewton();
  const paths = rayPaths(n.svg);
  assert.equal(paths.length, NEWTON_DEFAULTS.heights.length, "un trazo continuo por rayo");
  paths.forEach((pts, i) => {
    assert.equal(pts.length, 6, "entrada, primario, secundario, imagen, ocular, salida");
    const r = n.trace.rays[i], dirs = [r.d0, r.d1, r.d2, r.d2, [r.m2, 1]];
    for (let k = 0; k < 5; k++) assert.ok(dot([pts[k + 1][0] - pts[k][0], -(pts[k + 1][1] - pts[k][1])], dirs[k]) > 0, `tramo ${k + 1} en el sentido de la luz`);
  });
});

test("10. Motor óptico ↔ coordenadas SVG, ocular afocal", () => {
  for (const c of [{}, { f: 420, xS: 610, secHalf: 70 }]) {
    const n = buildNewton(c), paths = rayPaths(n.svg);
    paths.forEach((pts, i) => pts.forEach((q, k) => {
      near(q[0], n.screen[i][k][0], PIX, "x"); near(q[1], n.screen[i][k][1], PIX, "y");
    }));
    for (const r of n.trace.rays) near(r.m2, 0, 1e-12, "salida paralela al eje desviado (imagen en el foco del ocular)");
    const lens = n.svg.match(/class="lensV" d="M[\d.]+ ([\d.]+)Q/);
    near(+lens[1], NEWTON_LAYOUT.A - n.trace.yLens, PIX, "ocular a f_e de la imagen");
    near(n.trace.yLens - n.trace.Fp[1], n.params.fe, EPS, "distancia imagen-ocular = f_e");
  }
});

// ---- Pruebas agregadas en la corrección final ----
test("11. Cada rayo toca el secundario en un punto distinto (sin presuponer un impacto común)", () => {
  for (const c of CONFIGS) {
    const rays = traceNewton(c).rays;
    for (let i = 0; i < rays.length; i++) for (let j = i + 1; j < rays.length; j++)
      assert.ok(Math.hypot(rays[i].Q[0] - rays[j].Q[0], rays[i].Q[1] - rays[j].Q[1]) > 1, "impactos distintos");
  }
});

test("12. Ocular: los rayos cambian de dirección en la lente y emergen paralelos (u′₁ ≈ u′₂ ≈ …)", () => {
  for (const c of CONFIGS) {
    const T = traceNewton(c);
    assert.ok(c.fe > 0, "ocular convergente");
    for (const r of T.rays) {
      const m = r.d2[0] / r.d2[1];
      assert.ok(Math.abs(m - r.m2) > 1e-3, "la lente modifica la pendiente");
      near(r.m2, T.rays[0].m2, 1e-12, "pendientes emergentes iguales (modelo)");
    }
  }
  // medido en el SVG publicado: tramos de salida de ~54 unidades, redondeo 0,1 → |Δu| ≤ 0,2/54 ≈ 0,004
  const us = rayPaths(buildNewton().svg).map((p) => (p[5][0] - p[4][0]) / (p[5][1] - p[4][1]));
  for (const u of us) near(u, us[0], 0.004, "u′ medidas en el SVG");
});

test("13. Etiquetas: un punto de la imagen, rayos de un mismo punto lejano", () => {
  const s = buildNewton().svg;
  assert.ok(/data-etiqueta="punto-imagen">Punto de la imagen real intermedia</.test(s));
  assert.ok(/data-etiqueta="un-punto">Los rayos provienen de un mismo punto lejano\.</.test(s));
  assert.ok(!/>Imagen real</.test(s) && !s.includes("en el plano focal</text>"), "se quitó la etiqueta anterior");
  for (const n of [1, 2, 3, 4, 5]) assert.ok(new RegExp(`fill:#fff">${n}</text>`).test(s), `paso ${n} presente`);
});
