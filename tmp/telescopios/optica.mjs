// Óptica paraxial de lentes delgadas con matrices ABCD.
// Convención: z a lo largo del eje (sentido de propagación, origen en el objetivo),
// y hacia ARRIBA, estado del rayo = [y, u] con u = dy/dz ≈ ángulo (rad), f > 0 convergente.

export const P = (d) => [[1, d], [0, 1]];          // propagación libre
export const L = (f) => [[1, 0], [-1 / f, 1]];     // lente delgada
export const mul = (A, B) => [
  [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
  [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
];
export const apply = (M, [y, u]) => [M[0][0] * y + M[0][1] * u, M[1][0] * y + M[1][1] * u];

/** Matriz total del Kepler afocal, M = L(fe)·P(d)·L(fo), con d = fo + fe. */
export function keplerMatrix(fo, fe) {
  return mul(L(fe), mul(P(fo + fe), L(fo)));
}

/**
 * Traza rayos de un mismo punto lejano (ángulo theta) que llegan al objetivo a alturas `heights`.
 * Devuelve, por rayo, los vértices [z, y] en: entrada (zIn < 0), objetivo, plano focal, ocular, salida (zOut),
 * y las pendientes de cada tramo. Los rayos solo cambian de dirección en z = 0 y z = d.
 */
export function traceKepler({ fo, fe, theta, heights, zIn, zOut }) {
  if (!(fo > 0 && fe > 0)) throw new Error("Kepler requiere fo > 0 y fe > 0");
  const d = fo + fe;
  return heights.map((h) => {
    const s0 = [h, theta];                                   // justo antes del objetivo
    const sIn = apply(P(zIn), s0);                           // retroceso hasta la entrada (zIn < 0)
    const s1 = apply(L(fo), s0);                             // después del objetivo
    const sF = apply(P(fo), s1);                             // en el plano focal compartido
    const s2 = apply(P(d), s1);                              // llegando al ocular
    const s3 = apply(L(fe), s2);                             // después del ocular
    const sOut = apply(P(zOut - d), s3);
    return {
      h,
      points: [[zIn, sIn[0]], [0, h], [fo, sF[0]], [d, s2[0]], [zOut, sOut[0]]],
      slopes: { incident: theta, between: s1[1], emergent: s3[1] },
    };
  });
}

/** Valores teóricos para comparar: altura de la imagen y ángulo emergente. */
export const keplerTheory = (fo, fe, theta) => ({ yf: fo * theta, M: -fo / fe, thetaOut: (-fo / fe) * theta, d: fo + fe });

/**
 * Galileo afocal: objetivo convergente (fo > 0) y ocular divergente (fe < 0), d = fo + fe = fo − |fe|.
 * Rayos reales: entrada, objetivo (z = 0), ocular (z = d), salida. Además, la prolongación
 * hipotética de cada rayo hasta el plano focal del objetivo (z = fo), que la luz NO recorre.
 */
export function traceGalileo({ fo, fe, theta, heights, zIn, zOut }) {
  if (!(fo > 0)) throw new Error("Galileo requiere objetivo convergente: fo > 0");
  if (!(fe < 0)) throw new Error("Galileo requiere ocular divergente: fe < 0");
  const d = fo + fe;
  if (!(d > 0)) throw new Error("Galileo requiere |fe| < fo para que d > 0");
  return heights.map((h) => {
    const s0 = [h, theta];
    const sIn = apply(P(zIn), s0);
    const s1 = apply(L(fo), s0);              // después del objetivo
    const s2 = apply(P(d), s1);               // llegando al ocular (antes del foco)
    const s3 = apply(L(fe), s2);              // después del ocular
    const sOut = apply(P(zOut - d), s3);
    const sF = apply(P(fo), s1);              // objetivo aislado: punto de reunión hipotético
    return {
      h,
      points: [[zIn, sIn[0]], [0, h], [d, s2[0]], [zOut, sOut[0]]],
      hypothetical: [[d, s2[0]], [fo, sF[0]]],
      slopes: { incident: theta, between: s1[1], emergent: s3[1] },
    };
  });
}

/** Matriz total de dos lentes delgadas separadas d = fo + fe (vale para Kepler y Galileo). */
export const afocalMatrix = (fo, fe) => mul(L(fe), mul(P(fo + fe), L(fo)));
export const galileoTheory = (fo, fe, theta) => ({ yF: fo * theta, M: -fo / fe, thetaOut: (-fo / fe) * theta, d: fo + fe });

// ======================= Newton: trazado vectorial exacto en 2D =======================
// Marco cartesiano: x a lo largo del eje del tubo (la luz entra hacia +x), y hacia ARRIBA, eje del tubo en y = 0.
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const sc = (k, a) => [k * a[0], k * a[1]];
export const unit = (a) => sc(1 / Math.hypot(a[0], a[1]), a);
/** Ley vectorial de reflexión: d_r = d_i − 2 (d_i·n̂) n̂ */
export const reflect = (d, n) => add(d, sc(-2 * dot(d, n), n));
/** Reflexión de un punto respecto de una recta (plano del secundario) que pasa por c con normal n̂. */
export const mirrorPoint = (p, c, n) => add(p, sc(-2 * dot(add(p, sc(-1, c)), n), n));

/** Superficie del primario: punto de impacto de un rayo horizontal a altura h y normal unitaria (hacia la luz). */
export function primarySurface(shape, xV, f, h) {
  if (shape === "parabola") {                 // x = xV − y²/(4f): foco exacto en (xV − f, 0)
    return { P: [xV - (h * h) / (4 * f), h], n: unit([-1, -h / (2 * f)]) };
  }
  if (shape === "sphere") {                   // R = 2f, centro en (xV − R, 0): f ≈ R/2 solo paraxialmente
    const R = 2 * f, c = [xV - R, 0], P = [c[0] + Math.sqrt(R * R - h * h), h];
    return { P, n: unit(add(c, sc(-1, P))) };
  }
  throw new Error("forma de primario desconocida");
}

/**
 * Newtoniano: primario cóncavo (vértice xV, focal f), secundario plano a 45° centrado en (xS, 0),
 * imagen en el foco desviado F′ y ocular de lente delgada fe a continuación (salida afocal).
 */
export function traceNewton({ shape = "parabola", xV, f, xS, secHalf, heights, xIn, fe, yOut }) {
  const nS = unit([1, 1]), tS = unit([1, -1]), S0 = [xS, 0];       // espejo a 45°, cara reflectora hacia el primario
  const F = [xV - f, 0], Fp = mirrorPoint(F, S0, nS);               // foco del primario y su imagen en el secundario
  const yLens = Fp[1] + fe;                                          // ocular perpendicular al eje desviado (vertical)
  return {
    F, Fp, yLens, L1: xV - xS, L2: Fp[1] - 0,
    rays: heights.map((h) => {
      const d0 = [1, 0];
      const { P, n } = primarySurface(shape, xV, f, h);
      const d1 = reflect(d0, n);
      const s = -dot(add(P, sc(-1, S0)), nS) / dot(d1, nS);         // intersección con la recta del secundario
      const Q = add(P, sc(s, d1)), along = dot(add(Q, sc(-1, S0)), tS);
      const d2 = reflect(d1, nS);
      // punto del rayo más cercano a F′ (para un primario parabólico pasa exactamente por F′)
      const k = dot(add(Fp, sc(-1, Q)), d2), C = add(Q, sc(k, d2));
      // ocular: lente delgada en y = yLens; pendiente local m = dx/dy respecto del eje desviado x = Fp[0]
      const tE = (yLens - Q[1]) / d2[1], E = add(Q, sc(tE, d2));
      const m = d2[0] / d2[1], m2 = m - (E[0] - Fp[0]) / fe;
      const O = [E[0] + m2 * (yOut - yLens), yOut];
      return { h, P, n, d0, d1, Q, along, onSecondary: Math.abs(along) <= secHalf, nS, d2, C, missF: Math.hypot(C[0] - Fp[0], C[1] - Fp[1]), E, m2, O,
        points: [[xIn, h], P, Q, C, E, O] };
    }),
  };
}
