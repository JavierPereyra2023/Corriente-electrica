// El motor se audita por separado en check-microscopio-optica.mjs.
// Esta prueba comprueba que el SVG representa los resultados sin deformarlos.
import assert from 'node:assert/strict';
import {DEFAULT_OPTICS,solveMicroscope} from '../src/microscopio-optica.mjs';
import {createMicroscopeView,renderMicroscopeSVG,namespaceMicroscopeSVG} from '../src/microscopio-render.mjs';

let assertions=0,svgCases=0,realSegments=0;
function check(value,message){assertions++;assert.ok(value,message);}
function near(a,b,label,tol=3e-7){assertions++;assert.ok(Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=tol*Math.max(1,Math.abs(a),Math.abs(b)),`${label}: ${a} != ${b}`);}
const configurations=[
  {...DEFAULT_OPTICS},
  {...DEFAULT_OPTICS,s1:6},
  {...DEFAULT_OPTICS,s1:4},
  {...DEFAULT_OPTICS,L:44},
  {...DEFAULT_OPTICS,L:50},
  {...DEFAULT_OPTICS,L:24},
  {...DEFAULT_OPTICS,L:18},
  {...DEFAULT_OPTICS,L:44.00001},
  {...DEFAULT_OPTICS,s1:6+1e-10},
  {...DEFAULT_OPTICS,L:44-1e-10},
  {...DEFAULT_OPTICS,L:14},
  {...DEFAULT_OPTICS,h:0},
  {...DEFAULT_OPTICS,h:-.6},
];
const colors={parallel:'#a85d12',center:'#176d7c',focus:'#7955a2'};
const attr=(tag,key)=>new RegExp(`\\b${key}="([^"]*)"`).exec(tag)?.[1];

for(const [index,config] of configurations.entries()) {
  const model=solveMicroscope(config),before=JSON.stringify(model);
  for(const fitAll of [false,true]) {
    const view=createMicroscopeView(model,fitAll);
    const p0=view.map({x:0,y:0}),px=view.map({x:1,y:0}),py=view.map({x:0,y:1});
    near(px.x-p0.x,p0.y-py.y,'misma escala horizontal/vertical',1e-9);
    near(px.y,p0.y,'horizontal físico');near(py.x,p0.x,'vertical físico');
    if(fitAll)for(const image of [model.objective.image,model.finalImage]) {
      if(image.x!==null&&image.y!==null)check(view.contains(image),'ajustar campo incluye imagen finita');
    }
    for(const family of ['objective','eyepiece'])for(const frame of [0,200,350,500,719]) {
      const svg=renderMicroscopeSVG(frame,{model,fitAll,family});svgCases++;
      check(!/NaN|Infinity|undefined/.test(svg),`SVG finito config${index}, frame${frame}`);
      check(!/\b(?:d|cx|cy|x|y|x1|x2|y1|y2)="[^"]*—/.test(svg),'sin coordenadas sustituidas por guiones');
      check(svg.startsWith('<svg ')&&svg.endsWith('</svg>'),'contenedor SVG íntegro');
      const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
      check(ids.length===new Set(ids).size,'sin identificadores SVG duplicados');
      const named=namespaceMicroscopeSVG(svg,'test-');
      check(!/url\(#(?:micro-|m-)/.test(named),'referencias de máscara/marcador con namespace');
      if(frame===719) {
        // Verificar que cada imagen visible conserve sus coordenadas físicas.
        const circles=[...svg.matchAll(/<circle\b[^>]*>/g)].map(m=>({x:Number(attr(m[0],'cx')),y:Number(attr(m[0],'cy'))}));
        for(const point of [{x:-config.s1,y:config.h},model.objective.image,model.finalImage]) {
          if(point.x===null||point.y===null||!view.contains(point))continue;
          const expected=view.map(point);
          check(circles.some(p=>Math.abs(p.x-expected.x)<1e-5&&Math.abs(p.y-expected.y)<1e-5),'imagen dibujada en la posición que calculó el motor');
        }
        // Recuperar cada segmento luminoso SVG y volver al plano físico.
        for(const tag of svg.match(/<path\b[^>]*>/g)||[]) {
          const marker=attr(tag,'marker-end');if(!marker)continue;
          const color=attr(tag,'stroke');const rayId=Object.keys(colors).find(key=>colors[key]===color);if(!rayId)continue;
          const ray=model.rayFamilies[family].find(r=>r.id===rayId);check(Boolean(ray),'segmento asociado a rayo existente');
          const d=attr(tag,'d');const match=/^M([-+.\deE]+) ([-+.\deE]+)L([-+.\deE]+) ([-+.\deE]+)$/.exec(d);
          check(Boolean(match),'trayectoria real es segmento calculable');
          const [x1,y1,x2,y2]=match.slice(1).map(Number);
          const physical=p=>({x:(p.x-p0.x)/view.scale,y:(p0.y-p.y)/view.scale});
          const a=physical({x:x1,y:y1}),b=physical({x:x2,y:y2});
          check(b.x>=a.x-1e-6,'la flecha de luz real avanza hacia +x');
          // Distancia perpendicular, no residuo vertical: para una recta casi
          // vertical el redondeo subpíxel de x amplifica artificialmente y.
          // En encuadres de imágenes enormes, las dos lentes pueden coincidir
          // al redondeo SVG; se reconoce la recta por colinealidad, no por x.
          const candidates=[[ray.origin,ray.incomingSlope],[ray.atObjective,ray.afterObjectiveSlope],[ray.atEyepiece,ray.afterEyepieceSlope]];
          const mismatch=Math.min(...candidates.map(([point,slope])=>Math.max(...[a,b].map(p=>Math.abs(p.y-point.y-(p.x-point.x)*slope)/Math.hypot(1,slope)*view.scale))));
          check(mismatch<2e-5,`segmento SVG fuera de recta física c${index} ${family}/${rayId} fit${fitAll}: ${mismatch} px`);
          realSegments++;
        }
      }
    }
    const off=renderMicroscopeSVG(719,{model,fitAll,rays:[],extensions:false});
    check(!off.includes('marker-end="url(#m-'),'opción apagar rayos elimina trazos luminosos');
    check(!off.includes('stroke-dasharray="11 8"'),'opción apagar prolongaciones elimina sus trazos');
  }
  check(JSON.stringify(model)===before,'renderizar no modifica el modelo físico');
}
console.log(JSON.stringify({result:'PASS',assertions,svgCases,realSegments,configurations:configurations.length,checks:['transformación uniforme','imágenes calculadas','segmentos físicos','dirección de luz','casos límite','finitud','namespace','opciones','sin mutaciones']},null,2));
