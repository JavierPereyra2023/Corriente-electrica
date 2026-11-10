// Motor paraxial de lentes delgadas. Unidades: mm; +x = propagación; +y = arriba.
// s>0: objeto a la izquierda; s'>0: imagen a la derecha; f>0: convergente.
// Las tolerancias de comprobación NO se usan para convertir imágenes lejanas en infinito.
export const OPTICS_TOLERANCE = 1e-9;
export const SINGULAR_ULPS = 4;
export const DEFAULT_OPTICS = Object.freeze({f1:6, f2:20, L:40, s1:8, h:0.6});

function finite(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`${name} debe ser un número finito.`);
  return value;
}
function positive(value, name) {
  finite(value,name);
  if (value <= 0) throw new RangeError(`${name} debe ser mayor que cero.`);
  return value;
}
function atNumericalZero(value, scale) {
  return Math.abs(value) <= SINGULAR_ULPS * Number.EPSILON * Math.max(Number.MIN_VALUE,scale);
}
function calculated(value, name) {
  if (!Number.isFinite(value)) throw new RangeError(`${name} excede la capacidad numérica del modelo.`);
  return Object.is(value,-0) ? 0 : value;
}

/** Conjugación de una lente, incluyendo objetos virtuales (s<0).
 * null denota una cantidad no definida/finita: nunca se devuelve Infinity o NaN.
 * En s=0, la conjugación es degenerada: s'=0 y m=-s'/s no está definido.
 */
export function solveThinLens(s, f) {
  finite(s,'s'); positive(f,'f');
  if (s === 0) return {s,f,sPrime:0,m:null,limitingM:1,kind:'degenerate'};
  const denominator = s-f;
  if (atNumericalZero(denominator,Math.max(Math.abs(s),f))) {
    return {s,f,sPrime:null,m:null,kind:'infinity'};
  }
  const sPrime = calculated(f*(s/denominator),"s'");
  const m = calculated(-f/denominator,'m');
  return {s,f,sPrime,m,kind:sPrime>0?'real':'virtual'};
}

export function propagateRay(point, slope, x) {
  finite(point.x,'x inicial'); finite(point.y,'y inicial'); finite(slope,'pendiente'); finite(x,'x final');
  return {x,y:calculated(point.y+slope*(x-point.x),'altura del rayo')};
}

export function refractSlope(slope, height, f) {
  finite(slope,'pendiente'); finite(height,'altura'); positive(f,'f');
  return calculated(slope-height/f,'pendiente refractada');
}

/** Intersección algebraica. Las pendientes casi iguales conservan una intersección
 * lejana si la diferencia es representable; sólo igualdad exacta => paralelas.
 */
export function intersectLines(a,b) {
  const p=a.point, q=b.point;
  [p.x,p.y,q.x,q.y,a.slope,b.slope].forEach((v)=>finite(v,'recta'));
  const delta=a.slope-b.slope;
  if (delta===0) {
    const separation=q.y-p.y-a.slope*(q.x-p.x);
    const coincident=atNumericalZero(separation,Math.max(Math.abs(p.y),Math.abs(q.y),Math.abs(a.slope*(q.x-p.x))));
    return {kind:coincident?'coincident':'parallel',x:null,y:null};
  }
  // Centrar en p evita restar grandes ordenadas al origen.
  const dx=((q.y-p.y)-b.slope*(q.x-p.x))/delta;
  const x=calculated(p.x+dx,'intersección x');
  const y=calculated(p.y+a.slope*dx,'intersección y');
  return {kind:'point',x,y};
}

function imageAt(lensX, solution, objectHeight) {
  return {kind:solution.kind,
    x:solution.sPrime===null?null:calculated(lensX+solution.sPrime,'posición imagen'),
    y:solution.m===null?null:calculated(solution.m*objectHeight,'altura imagen')};
}
function foci(x,f) {return {object:{x:x-f,y:0},image:{x:x+f,y:0}};}

function completeRay(inputs,id,family,lensHeight) {
  const {s1,h,f1,f2,L}=inputs;
  const origin={x:-s1,y:h};
  const atObjective={x:0,y:calculated(lensHeight,'altura objetivo')};
  const incomingSlope=calculated((lensHeight-h)/s1,'pendiente incidente');
  // Forma estable de u1=u0−H/f1. Cerca de s1=f1, H puede ser enorme;
  // restar dos pendientes grandes destruiría la pequeña pendiente resultante.
  const a1=(f1-s1)/f1;
  const afterObjectiveSlope=calculated((a1*lensHeight-h)/s1,'pendiente tras objetivo');
  const atEyepiece=propagateRay(atObjective,afterObjectiveSlope,L);
  const afterEyepieceSlope=refractSlope(afterObjectiveSlope,atEyepiece.y,f2);
  return {id,family,origin,atObjective,atEyepiece,incomingSlope,afterObjectiveSlope,afterEyepieceSlope};
}

/** Los tres rayos principales de cada lente son selecciones distintas del MISMO
 * haz. La familia ocular se retropropaga por el objetivo hasta la muestra real;
 * nunca se crea luz que nace en una imagen virtual o en una imagen interceptada.
 */
export function solveMicroscope(config = {}) {
  const inputs={...DEFAULT_OPTICS,...config};
  const {f1,f2,L,s1,h}=inputs;
  positive(f1,'f1');positive(f2,'f2');positive(L,'L');positive(s1,'s1');finite(h,'h');
  const first=solveThinLens(s1,f1);
  const objective={...first,x:0,image:imageAt(0,first,h),foci:foci(0,f1)};
  const intermediateRealized=first.kind==='real'&&first.sPrime<=L;
  objective.image.realized=intermediateRealized;
  objective.image.intercepted=first.kind==='real'&&first.sPrime>L;

  // Matriz desde el plano de la muestra hasta inmediatamente DESPUÉS del ocular.
  // [y2,u2]^T = [[A,B],[C,D]] [h,u0]^T, con determinante 1.
  const a1=(f1-s1)/f1;
  const A=1-L/f1;
  const C=-1/f1-A/f2;
  const s2=first.sPrime===null?null:calculated(L-first.sPrime,'s2');
  const second=s2===null?{s:null,f:f2,sPrime:f2,m:null,kind:'real'}:solveThinLens(s2,f2);
  // Formas algebraicamente equivalentes que evitan restar términos casi iguales
  // al aproximarse al foco del ocular. Los resultados regulares se conservan
  // desde solveThinLens, en lugar de mezclar dos evaluaciones cancelativas.
  const B=s2===null?f1:a1*s2;
  let D=s2===null?-f1/f2:a1*((f2-s2)/f2);
  // Normalizar el cero analítico sólo al nivel de redondeo de máquina.
  // La prueba s2=f2 emplea el denominador físico, no una tolerancia visual.
  if (second.kind==='infinity') D=0;
  const matrix={A,B,C,D};
  Object.values(matrix).forEach((value)=>calculated(value,'matriz'));
  let finalImage, totalLateral, finalDistance;
  if (second.kind==='infinity') {
    finalDistance=null;totalLateral=null;
    finalImage={kind:'infinity',x:null,y:null};
  } else {
    finalDistance=second.kind==='degenerate'?0:second.sPrime;
    totalLateral=first.kind==='infinity'?calculated(-f2/f1,'aumento combinado')
      :second.kind==='degenerate'?first.m:calculated(first.m*second.m,'aumento lateral total');
    const y=calculated(totalLateral*h,'altura final');
    const atOcular=second.kind==='degenerate';
    finalImage={kind:atOcular?'degenerate':finalDistance>0?'real':'virtual',x:calculated(L+finalDistance,'posición final'),y};
  }
  // El límite combinado también cubre s1=f1 y s2=0, donde no se puede
  // sustituir sin más en m1*m2. En casos regulares conservamos ese producto;
  // equivale a 1/D sin la cancelación numérica de la matriz expandida.
  const eyepiece={...second,x:L,sPrime:finalDistance,image:{...finalImage},foci:foci(L,f2)};
  const rayNotes=[];
  const objectiveRays=[completeRay(inputs,'parallel','objective',h),completeRay(inputs,'center','objective',0)];
  if (first.kind!=='infinity') {
    objectiveRays.push(completeRay(inputs,'focus','objective',h/a1));
  } else rayNotes.push('Rayo principal del foco objeto del objetivo no definido: muestra en su plano focal. Se conservan los otros rayos.');

  const eyepieceRays=[];
  if (s2!==null&&second.kind!=='degenerate') {
    // Selección desde la muestra real por las condiciones de cada principal.
    // No restar yi+s2*u cuando ambos términos crecen cerca del foco objetivo.
    eyepieceRays.push(completeRay(inputs,'parallel','eyepiece',h/a1));
    eyepieceRays.push(completeRay(inputs,'center','eyepiece',L*h/B));
    if(second.kind!=='infinity') {
      const objectiveHeight=calculated((L-f2)*h/(B-f2*a1),'rayo focal ocular en objetivo');
      eyepieceRays.push(completeRay(inputs,'focus','eyepiece',objectiveHeight));
    } else rayNotes.push('Rayo que se dirige al foco objeto del ocular no definido: la imagen intermedia está en ese plano focal.');
  } else rayNotes.push(s2===null?'Objetivo afocal para la muestra: el ocular recibe un haz paralelo inclinado, sin objeto intermedio finito.':'La imagen intermedia coincide con el plano del ocular: sus tres rayos principales convencionales no constituyen una construcción regular.');

  // Un rayo principal casi vertical puede exigir coordenadas tan grandes que
  // su origen o su cruce no son recuperables con números de doble precisión.
  // No inventar una trayectoria: omitir SOLAMENTE el rayo que falla y explicar
  // su mal condicionamiento. La solución física de imágenes no se modifica.
  const representable=(ray)=>{
    const sourceY=ray.atObjective.y-ray.incomingSlope*s1;
    let residual=Math.abs(sourceY-h)/Math.max(1,Math.abs(h));
    if(finalImage.x!==null&&finalImage.y!==null) {
      const crossingY=ray.atEyepiece.y+ray.afterEyepieceSlope*(finalImage.x-L);
      residual=Math.max(residual,Math.abs(crossingY-finalImage.y)/Math.max(1,Math.abs(finalImage.y)));
    }
    if(residual<=OPTICS_TOLERANCE) return true;
    rayNotes.push(`Rayo ${ray.family}/${ray.id} omitido por mal condicionamiento numérico cerca de una singularidad: residuo relativo ${residual.toExponential(2)} mayor que ${OPTICS_TOLERANCE}. Las posiciones de las imágenes se conservan.`);
    return false;
  };
  const stableObjectiveRays=objectiveRays.filter(representable);
  const stableEyepieceRays=eyepieceRays.filter(representable);

  let status;
  const messages=[];
  if(first.kind==='infinity') {
    status='objective-at-focus';
    messages.push('La muestra está en el foco del objetivo: el haz que sale del objetivo es paralelo para cada punto. La imagen intermedia está en el infinito.');
    messages.push('El ocular vuelve a reunir ese haz en una imagen REAL a una distancia f2 detrás de él. No hay imagen virtual final en esta configuración.');
  } else if(second.kind==='degenerate') {
    status='intermediate-at-eyepiece';
    messages.push('La imagen intermedia cae en el propio plano del ocular. El cociente −s′2/s2 es 0/0: no define un aumento del ocular.');
    messages.push('El trazado combinado conserva un cruce en el plano del ocular. No es el ajuste usual de observación con imagen virtual final.');
  } else if(second.kind==='infinity') {
    status='final-at-infinity';
    messages.push('La imagen intermedia está en el foco objeto del ocular: los rayos emergentes son paralelos. La imagen final está en el infinito; no se dibuja una imagen virtual finita.');
  } else if(first.kind==='virtual') {
    status='objective-inside-focus';
    messages.push('La muestra está dentro de la distancia focal del objetivo: su imagen es virtual y derecha. No se forma la imagen real intermedia del microscopio compuesto habitual.');
  } else if(s2<0) {
    status='virtual-object-eyepiece';
    messages.push('El objetivo por sí solo enfocaría detrás del ocular. El ocular intercepta el haz antes de ese cruce: la imagen intermedia prevista actúa como objeto virtual para el ocular.');
  } else if(finalImage.kind==='virtual') {
    status='virtual-final';
    messages.push('La imagen intermedia está entre el foco objeto y el ocular. Los rayos emergentes divergen y sus prolongaciones coinciden en una imagen virtual final finita.');
  } else {
    status='real-final';
    messages.push('La imagen intermedia queda fuera de la distancia focal del ocular. El ocular reúne los rayos en una imagen real final: no es el ajuste con imagen virtual esperado.');
  }
  if(first.kind==='real'&&s1>f1&&s1<2*f1) messages.push('Entre f1 y 2f1, el objetivo por sí solo forma una imagen real, invertida y aumentada.');
  if(first.kind==='virtual'&&finalImage.kind!=='infinity') messages.push(finalImage.kind==='virtual'?'El sistema completo aún puede dar una imagen virtual, pero sin la etapa real intermedia habitual.':'El sistema completo da una imagen real final, sin la etapa real intermedia habitual.');
  const allRays=[...stableObjectiveRays,...stableEyepieceRays];
  const maxSlope=Math.max(0,...allRays.flatMap(r=>[Math.abs(r.incomingSlope),Math.abs(r.afterObjectiveSlope),Math.abs(r.afterEyepieceSlope)]));
  const paraxialWarning=maxSlope>0.15;
  if(paraxialWarning) messages.push('Algunos rayos tienen inclinación grande: las ecuaciones siguen mostrando el modelo paraxial ideal, cuya precisión física disminuye fuera de ángulos pequeños.');
  const emergence=finalImage.kind==='infinity'?'parallel':finalImage.kind==='degenerate'?'at-plane':finalDistance<0?'diverging':'converging';
  return {inputs,objective,eyepiece,totalLateral,finalImage,matrix,status,messages,
    rayFamilies:{objective:stableObjectiveRays,eyepiece:stableEyepieceRays},rayNotes,
    intermediateRealized,emergence,maxSlope,paraxialWarning,
    units:'mm',tolerance:OPTICS_TOLERANCE};
}
