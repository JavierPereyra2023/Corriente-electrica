// Coordenadas en píxeles del encuadre 1536 × 1024. Los fondos no contienen rayos.
// Ajustar este único objeto al registrar las aperturas y el centro de la lente.
export const LASER_LAYOUT = {
  width:1536,
  height:1024,
  lensX:790,
  axisY:447,
  focalLength:560,
  exitX:1460,
  minRayY:210,
  maxRayY:780,
  green:{sourceX:368,y:309,color:'#45ff75',core:'#d1ffdb',name:'Verde'},
  blue:{sourceX:368,y:550,color:'#499dff',core:'#cfedff',name:'Azul'},
};

// Se pueden ajustar por separado las fotografías sin alterar la ley geométrica.
export const LASER_CASE_LAYOUTS = {
  convergente:{},
  divergente:{},
};

export function laserGeometry(kind='convergente'){
  const layout={...LASER_LAYOUT,...LASER_CASE_LAYOUTS[kind]};
  const f=(kind==='divergente'?-1:1)*layout.focalLength;
  const focus={x:layout.lensX+f,y:layout.axisY};
  const beams=['green','blue'].map(key=>{
    const emitter=layout[key];
    const source={x:emitter.sourceX,y:emitter.y};
    const lens={x:layout.lensX,y:emitter.y};
    const slope=-(emitter.y-layout.axisY)/f;
    let exitX=layout.exitX;
    if(slope<0)exitX=Math.min(exitX,layout.lensX+(layout.minRayY-emitter.y)/slope);
    if(slope>0)exitX=Math.min(exitX,layout.lensX+(layout.maxRayY-emitter.y)/slope);
    const exit={x:exitX,y:emitter.y+(exitX-layout.lensX)*slope};
    const incomingLength=lens.x-source.x;
    const outgoingLength=Math.hypot(exit.x-lens.x,exit.y-lens.y);
    return {key,...emitter,source,lens,exit,slope,incomingLength,outgoingLength,
      totalLength:incomingLength+outgoingLength,
      path:`M${source.x},${source.y} L${lens.x},${lens.y} L${exit.x},${exit.y}`};
  });
  return {kind,layout,f,focus,beams};
}

// Longitud recorrida en el trazado: velocidad constante sobre ambos segmentos.
export function beamPointAtDistance(beam,distance){
  const d=Math.max(0,Math.min(beam.totalLength,distance));
  if(d<=beam.incomingLength)return {x:beam.source.x+d,y:beam.source.y};
  const t=(d-beam.incomingLength)/beam.outgoingLength;
  return {x:beam.lens.x+t*(beam.exit.x-beam.lens.x),
    y:beam.lens.y+t*(beam.exit.y-beam.lens.y)};
}

export const LASER_TIMING={greenStart:2.2,blueStart:5.5,drawSeconds:2.6,axisStart:8.4,focusStart:10.2,summaryStart:12,sceneSeconds:16};
