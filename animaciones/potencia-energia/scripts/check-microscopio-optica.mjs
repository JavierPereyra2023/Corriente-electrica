// Auditoría independiente: soluciones analíticas, continuidad de rayos y casos límite.
// No importa ni usa el renderer SVG.
import assert from 'node:assert/strict';
import {DEFAULT_OPTICS, solveThinLens, solveMicroscope, intersectLines} from '../src/microscopio-optica.mjs';

const RELATIVE_TOLERANCE = 1e-9;
let assertions = 0;
const near = (actual, expected, label = '', tolerance = RELATIVE_TOLERANCE) => {
  assertions++;
  assert.ok(Number.isFinite(actual) && Number.isFinite(expected), `${label}: valor no finito ${actual}/${expected}`);
  assert.ok(Math.abs(actual-expected) <= tolerance*Math.max(1,Math.abs(actual),Math.abs(expected)), `${label}: ${actual} != ${expected}`);
};
const check = (condition, label) => { assertions++; assert.ok(condition,label); };
const same = (actual, expected, label) => { assertions++; assert.equal(actual,expected,label); };

function finiteTree(value, path='modelo') {
  if(typeof value==='number') check(Number.isFinite(value),`${path}: NaN/Infinity no controlado`);
  else if(Array.isArray(value)) value.forEach((v,i)=>finiteTree(v,`${path}[${i}]`));
  else if(value && typeof value==='object') Object.entries(value).forEach(([k,v])=>finiteTree(v,`${path}.${k}`));
}

// Referencia obtenida por avance de un rayo, independiente de solveThinLens y ABCD.
function directTrace(config,height,slope) {
  const objectiveY=height+config.s1*slope;
  const objectiveSlope=slope-objectiveY/config.f1;
  const eyepieceY=objectiveY+config.L*objectiveSlope;
  const finalSlope=objectiveSlope-eyepieceY/config.f2;
  return {objectiveY,objectiveSlope,eyepieceY,finalSlope};
}

function independentSystem(config) {
  // Bases altura/pendiente: evita usar las expresiones ABCD del motor.
  const byHeight=directTrace(config,1,0), bySlope=directTrace(config,0,1);
  return {A:byHeight.eyepieceY,B:bySlope.eyepieceY,C:byHeight.finalSlope,D:bySlope.finalSlope};
}

function independentIntersection(a,b) {
  const difference=a.slope-b.slope;
  if(difference===0) return null;
  const x=(b.point.y-a.point.y+a.point.x*a.slope-b.point.x*b.slope)/difference;
  return {x,y:a.point.y+(x-a.point.x)*a.slope};
}

function verifyFiniteLens(lens,label) {
  if(!Number.isFinite(lens.s)||!Number.isFinite(lens.sPrime)||lens.s===0||lens.sPrime===0) return;
  near(1/lens.f,1/lens.s+1/lens.sPrime,`${label} ecuación de lentes`);
  near(lens.m,-lens.sPrime/lens.s,`${label} aumento lateral`);
}

function verifyRays(model,label) {
  const c=model.inputs;
  const all=[];
  for(const family of ['objective','eyepiece']) {
    const rays=model.rayFamilies[family];
    check(Array.isArray(rays),`${label}: familia ${family}`);
    check(rays.length<=3,`${label}: solo tres rayos principales por familia`);
    for(const r of rays) {
      all.push(r);
      const expected=directTrace(c,c.h,r.incomingSlope);
      near(r.origin.x,-c.s1,`${label}: origen x`);
      near(r.origin.y,c.h,`${label}: origen y`);
      near(r.atObjective.x,0,`${label}: objetivo x`);
      near(r.atEyepiece.x,c.L,`${label}: ocular x`);
      near(r.atObjective.y,expected.objectiveY,`${label}: incidencia objetivo`);
      // Comparar la ecuación sin restar dos pendientes enormes para intentar
      // obtener una pendiente emergente casi nula en el oráculo de prueba.
      near(r.incomingSlope-r.afterObjectiveSlope,r.atObjective.y/c.f1,`${label}: refracción objetivo`);
      near(r.atEyepiece.y,r.atObjective.y+c.L*r.afterObjectiveSlope,`${label}: propagación entre lentes`);
      near(r.afterObjectiveSlope-r.afterEyepieceSlope,r.atEyepiece.y/c.f2,`${label}: refracción ocular`);
      if(family==='objective') {
        if(r.id==='parallel') near(r.incomingSlope,0,`${label}: rayo paralelo objetivo`);
        if(r.id==='center') near(r.atObjective.y,0,`${label}: centro objetivo`);
        if(r.id==='focus') near(r.afterObjectiveSlope,0,`${label}: foco objeto objetivo`);
      } else {
        if(r.id==='parallel') near(r.afterObjectiveSlope,0,`${label}: rayo paralelo ocular`);
        if(r.id==='center') near(r.atEyepiece.y,0,`${label}: centro ocular`);
        if(r.id==='focus') near(r.afterEyepieceSlope,0,`${label}: foco objeto ocular`);
      }
      const firstImage=model.objective.image;
      if(firstImage.kind!=='infinity') {
        near(r.atObjective.y+firstImage.x*r.afterObjectiveSlope,firstImage.y,`${label}: rayo pasa por imagen intermedia`,2e-8);
      }
      const final=model.finalImage;
      if(final.kind!=='infinity') {
        near(r.atEyepiece.y+(final.x-c.L)*r.afterEyepieceSlope,final.y,`${label}: rayo o extensión pasa por imagen final`,2e-8);
      }
    }
  }
  if(model.objective.image.kind==='infinity' && all.length>1) {
    all.slice(1).forEach(r=>near(r.afterObjectiveSlope,all[0].afterObjectiveSlope,`${label}: haz objetivo paralelo`));
  }
  if(model.finalImage.kind==='infinity' && all.length>1) {
    all.slice(1).forEach(r=>near(r.afterEyepieceSlope,all[0].afterEyepieceSlope,`${label}: haz final paralelo`));
  }
  // Intersecciones calculadas sin recurrir a intersectLines del motor.
  for(let i=0;i<all.length;i++) for(let j=i+1;j<all.length;j++) {
    const a=all[i],b=all[j];
    if(Math.abs(a.afterEyepieceSlope-b.afterEyepieceSlope)<1e-8)continue;
    const intersection=independentIntersection({point:a.atEyepiece,slope:a.afterEyepieceSlope},{point:b.atEyepiece,slope:b.afterEyepieceSlope});
    if(model.finalImage.kind!=='infinity') {
      near(intersection.x,model.finalImage.x,`${label}: intersección independiente x`,2e-8);
      near(intersection.y,model.finalImage.y,`${label}: intersección independiente y`,2e-8);
    }
    if(model.finalImage.kind==='virtual') {
      const distanceNow=Math.abs(a.atEyepiece.y-b.atEyepiece.y);
      const distanceLater=Math.abs(a.atEyepiece.y+10*a.afterEyepieceSlope-b.atEyepiece.y-10*b.afterEyepieceSlope);
      check(distanceLater>distanceNow,`${label}: el haz virtual debe divergir después del ocular`);
    }
  }
}

function verifyModel(config,label,{rays=true}={}) {
  const model=solveMicroscope(config);
  finiteTree(model,label);
  const matrix=independentSystem(model.inputs);
  for(const key of ['A','B','C','D']) near(model.matrix[key],matrix[key],`${label}: matriz ${key}`);
  near(model.matrix.A*model.matrix.D-model.matrix.B*model.matrix.C,1,`${label}: determinante`);
  verifyFiniteLens(model.objective,`${label} objetivo`);
  verifyFiniteLens(model.eyepiece,`${label} ocular`);
  if(model.objective.image.kind!=='infinity') {
    near(model.objective.image.x,model.objective.sPrime,`${label}: coordenada intermedia`);
    near(model.objective.image.y,model.objective.m*model.inputs.h,`${label}: altura intermedia`);
    near(model.eyepiece.s,model.inputs.L-model.objective.sPrime,`${label}: objeto ocular`);
  }
  if(model.finalImage.kind!=='infinity') {
    // No invertir una D obtenida por restas en el oráculo independiente cuando
    // el sistema está casi afocal: allí se usan soluciones analíticas abajo.
    if(Math.abs(matrix.D)>1e-7) {
      near(model.finalImage.x,model.inputs.L-matrix.B/matrix.D,`${label}: imagen final matriz independiente`,2e-8);
      near(model.finalImage.y,model.inputs.h/matrix.D,`${label}: altura final matriz independiente`,2e-8);
      near(model.totalLateral,1/matrix.D,`${label}: M lateral combinado`,2e-8);
    }
    if(model.objective.m!==null&&model.eyepiece.m!==null)near(model.totalLateral,model.objective.m*model.eyepiece.m,`${label}: M=m1m2`,2e-8);
  } else same(model.totalLateral,null,`${label}: aumento lateral infinito no finito`);
  if(rays)verifyRays(model,label);
  return model;
}

const baseline=verifyModel({...DEFAULT_OPTICS},'configuración inicial');
near(baseline.objective.sPrime,24,'s1 prima conocida');
near(baseline.objective.m,-3,'m1 conocida');
near(baseline.eyepiece.s,16,'s2 conocida');
near(baseline.eyepiece.sPrime,-80,'s2 prima conocida');
near(baseline.eyepiece.m,5,'m2 conocida');
near(baseline.finalImage.x,-40,'posición final conocida');
near(baseline.finalImage.y,-9,'altura final conocida');
near(baseline.totalLateral,-15,'M lateral conocido');
same(baseline.finalImage.kind,'virtual','imagen final inicial virtual');
same(baseline.rayFamilies.objective.length,3,'tres principales objetivo inicial');
same(baseline.rayFamilies.eyepiece.length,3,'tres principales ocular inicial');
check(baseline.objective.m< -1,'entre f y2f produce imagen intermedia aumentada e invertida');

const twice=verifyModel({...DEFAULT_OPTICS,s1:12},'objeto en 2f objetivo');
near(twice.objective.sPrime,12,'2f: distancia de imagen');
near(twice.objective.m,-1,'2f: imagen de igual tamaño invertida');
near(twice.finalImage.x,110,'2f: imagen final real');
same(twice.finalImage.kind,'real','2f final real');
check(twice.totalLateral>0,'dos inversiones dan orientación derecha');

const inside=verifyModel({...DEFAULT_OPTICS,s1:3},'objeto dentro del foco objetivo');
near(inside.objective.sPrime,-6,'intermedia virtual conocida');
near(inside.objective.m,2,'intermedia virtual derecha');
near(inside.finalImage.x,40+460/13,'posición final con intermedia virtual');
near(inside.totalLateral,-20/13,'M con intermedia virtual');
same(inside.objective.image.kind,'virtual','no forzar intermedia real');
same(inside.finalImage.kind,'real','ocular puede producir final real');

const focalObjective=verifyModel({...DEFAULT_OPTICS,s1:6},'muestra en foco objetivo');
same(focalObjective.objective.image.kind,'infinity','intermedia en infinito');
same(focalObjective.objective.image.x,null,'infinito sin coordenada arbitraria');
near(focalObjective.finalImage.x,60,'ocular enfoca haz paralelo a f2');
near(focalObjective.finalImage.y,-2,'altura conocida con objetivo en foco');
near(focalObjective.totalLateral,-10/3,'M matricial finito con intermedia infinita');
same(focalObjective.finalImage.kind,'real','final real con objetivo en foco');

const focalEyepiece=verifyModel({...DEFAULT_OPTICS,L:44},'intermedia en foco ocular');
same(focalEyepiece.finalImage.kind,'infinity','final infinito');
same(focalEyepiece.finalImage.x,null,'no dibujar virtual finita en infinito');
same(focalEyepiece.finalImage.y,null,'altura infinita no falsa');

const onEyepiece=verifyModel({...DEFAULT_OPTICS,L:24},'imagen en plano del ocular');
same(onEyepiece.finalImage.kind,'degenerate','imagen en plano propio ocular');
near(onEyepiece.finalImage.x,24,'posición imagen degenerada');
near(onEyepiece.finalImage.y,-1.8,'altura imagen degenerada');
near(onEyepiece.totalLateral,-3,'M combinado finito en degeneración secuencial');

const virtualObject=verifyModel({...DEFAULT_OPTICS,L:12},'objeto virtual para ocular');
near(virtualObject.eyepiece.s,-12,'distancia objeto ocular virtual');
near(virtualObject.eyepiece.sPrime,7.5,'imagen tras ocular con objeto virtual');
near(virtualObject.finalImage.x,19.5,'posición final convergencia interceptada');
same(virtualObject.finalImage.kind,'real','objeto virtual ocular produce real');

for(const h of [0,-0.6,0.001])verifyModel({...DEFAULT_OPTICS,h},`altura ${h}`);

// Los datos físicos no deben depender de una escala de dibujo ni de la unidad elegida.
for(const scale of [.001,1000]) {
  const config=Object.fromEntries(Object.entries(DEFAULT_OPTICS).map(([k,v])=>[k,v*scale]));
  const model=verifyModel(config,`covariancia longitud x${scale}`);
  near(model.finalImage.x,baseline.finalImage.x*scale,'posición escala');
  near(model.finalImage.y,baseline.finalImage.y*scale,'altura escala');
  near(model.totalLateral,baseline.totalLateral,'aumento independiente unidad');
}

// Cerca de ambos polos: no redondear una solución finita a imagen en infinito.
for(const offset of [-1e-7,1e-7]) {
  const nearObjective=verifyModel({...DEFAULT_OPTICS,s1:6+offset},`cerca de f1 ${offset}`,{rays:false});
  check(nearObjective.objective.sPrime!==null,'distancia intermedia muy grande pero finita');
  check(nearObjective.finalImage.kind!=='infinity','final finita cerca de f1');
  near(nearObjective.finalImage.x,60,'límite final cerca de f1',1e-6);
  const nearOcular=verifyModel({...DEFAULT_OPTICS,L:44+offset},`cerca de f2 ${offset}`,{rays:false});
  check(nearOcular.finalImage.kind!=='infinity','distancia final enorme pero finita');
  check(Math.abs(nearOcular.finalImage.x)>1e8,'se conserva posición sin clamp');
  const delta=nearOcular.inputs.L-44;
  near(nearOcular.eyepiece.sPrime,20*(20+delta)/delta,'solución analítica cerca de foco ocular');
  near(nearOcular.totalLateral,60/delta,'aumento analítico cerca de foco ocular');
}

// Auditar también los rayos cerca de singularidades, donde puede haber líneas
// numéricamente mal condicionadas. Un rayo omitido debe quedar diagnosticado.
for(const offset of [-1e-10,1e-10,1e-14]) {
  const model=solveMicroscope({...DEFAULT_OPTICS,s1:6+offset});
  finiteTree(model,`rayos cerca de f1 ${offset}`);
  verifyRays(model,`rayos cerca de f1 ${offset}`);
  if(model.rayFamilies.objective.length<3||model.rayFamilies.eyepiece.length<3) {
    check(model.rayNotes.length>0,'la omisión de rayos cerca de polos debe explicarse');
  }
}
for(const offset of [-1e-10,1e-10]) {
  const model=solveMicroscope({...DEFAULT_OPTICS,L:44+offset});
  finiteTree(model,`rayos cerca de f2 ${offset}`);
  verifyRays(model,`rayos cerca de f2 ${offset}`);
  if(model.rayFamilies.eyepiece.length<3)check(model.rayNotes.length>0,'omisión cerca de foco ocular diagnosticada');
}

// Barrido determinista de configuraciones ordinarias; sin librerías ni red.
let seed=271828;
const random=()=>((seed=(1664525*seed+1013904223)>>>0)/2**32);
let randomCases=0;
for(let i=0;i<180;i++) {
  const config={f1:2+10*random(),f2:8+24*random(),L:8+70*random(),s1:1+30*random(),h:-1+2*random()};
  const matrix=independentSystem(config);
  if(Math.abs(matrix.D)<.003||Math.abs(config.s1-config.f1)<.003)continue;
  verifyModel(config,`barrido ${i}`);randomCases++;
}

for(const invalid of [{f1:0},{f1:-2},{f2:0},{L:0},{s1:0},{s1:-1},{h:NaN},{f1:Infinity},{L:'40'}]) {
  assertions++;assert.throws(()=>solveMicroscope({...DEFAULT_OPTICS,...invalid}),undefined,`rechazar ${JSON.stringify(invalid)}`);
}
for(const s of [3,8,12,-12]) {
  const lens=solveThinLens(s,6);verifyFiniteLens(lens,`lente aislada s=${s}`);finiteTree(lens);
}
same(solveThinLens(6,6).kind,'infinity','lente aislada en foco');
same(solveThinLens(0,6).kind,'degenerate','lente aislada plano propio');
const cross=intersectLines({point:{x:0,y:1},slope:2},{point:{x:0,y:5},slope:0});
same(cross.kind,'point','intersección');near(cross.x,2,'intersección x');near(cross.y,5,'intersección y');
same(intersectLines({point:{x:0,y:1},slope:2},{point:{x:2,y:6},slope:2}).kind,'parallel','paralelas');
same(intersectLines({point:{x:0,y:1},slope:2},{point:{x:2,y:5},slope:2}).kind,'coincident','coincidentes');

console.log(JSON.stringify({result:'PASS',relativeTolerance:RELATIVE_TOLERANCE,assertions,randomCases,analyticalSystemCases:7,isolatedLensCases:6,nearSingularRayCases:5,checks:['ecuaciones','aumentos','ABCD independiente','continuidad de rayos','rayos principales','intersecciones','divergencia/paralelismo','singularidades','escala','inputs inválidos','finitud']},null,2));
