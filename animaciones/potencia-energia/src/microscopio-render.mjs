import {DEFAULT_OPTICS, solveMicroscope} from './microscopio-optica.mjs';

// Esta capa sólo transforma y recorta la geometría calculada; no resuelve lentes.
export function createMicroscopeView(model, fitAll=false) {
  const {s1,L,f1,f2,h}=model.inputs;
  const plot={left:66,right:1334,top:238,bottom:616};
  let xMin=Math.min(-s1-0.2*L,-1.2*L,-f1),xMax=Math.max(L+1.5*f2,1.5*L);
  const images=[model.objective.image,model.finalImage].filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));
  let ys=[0,h,-Math.max(1,Math.abs(h)*2),Math.max(1,Math.abs(h)*2)];
  if(fitAll) {
    for(const p of images){xMin=Math.min(xMin,p.x);xMax=Math.max(xMax,p.x);ys.push(p.y);}
  } else {
    for(const p of images)if(p.x>=xMin&&p.x<=xMax&&Math.abs(p.y)<(xMax-xMin)/2)ys.push(p.y);
  }
  const padX=(xMax-xMin)*0.04;xMin-=padX;xMax+=padX;
  const yMin=Math.min(...ys),yMax=Math.max(...ys),cx=(xMin+xMax)/2,cy=(yMin+yMax)/2;
  const scale=Math.min((plot.right-plot.left)/(xMax-xMin),(plot.bottom-plot.top)/(Math.max(1e-6,yMax-yMin)*1.35));
  const px=(plot.left+plot.right)/2,py=(plot.top+plot.bottom)/2;
  const bounds={xMin:cx-(plot.right-plot.left)/2/scale,xMax:cx+(plot.right-plot.left)/2/scale,yMin:cy-(plot.bottom-plot.top)/2/scale,yMax:cy+(plot.bottom-plot.top)/2/scale};
  const map=p=>({x:px+(p.x-cx)*scale,y:py-(p.y-cy)*scale});
  const contains=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=bounds.xMin&&p.x<=bounds.xMax&&p.y>=bounds.yMin&&p.y<=bounds.yMax;
  return {plot,bounds,scale,map,contains,fitAll};
}

function microEscape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function microNumber(value){return Number.isFinite(value)?Number(value.toPrecision(9)).toString():'—';}
function microWrap(value,limit=92){const lines=[''];for(const word of String(value).split(/\s+/)){if((lines.at(-1)+' '+word).length>limit&&lines.at(-1))lines.push(word);else lines[lines.length-1]+=(lines.at(-1)?' ':'')+word;}return lines;}

export function namespaceMicroscopeSVG(svg,prefix){return svg.replace(/id="([^"]+)"/g,(_,id)=>`id="${prefix}${id}"`).replace(/url\(#([^)]+)\)/g,(_,id)=>`url(#${prefix}${id})`).replace(/aria-labelledby="([^"]+)"/g,(_,ids)=>`aria-labelledby="${ids.split(' ').map(id=>prefix+id).join(' ')}"`);}

export function microscopeStage(frame=719,model=solveMicroscope()) {
  if(frame<90)return ['1 · La muestra',`Distancia al objetivo: ${microNumber(model.inputs.s1)} mm. La punta de la muestra origina los rayos.`];
  if(frame<210)return ['2 · El objetivo convergente','Cada trayectoria cambia de pendiente en el plano de la lente, según su distancia focal.'];
  if(frame<360){
    const image=model.objective.image;
    if(image.kind==='infinity')return ['3 · Imagen intermedia en el infinito','El objetivo deja un haz paralelo para cada punto de la muestra.'];
    if(image.intercepted)return ['3 · Imagen del objetivo aislado','El ocular intercepta la luz antes de que llegue a ese cruce; no es una imagen formada en el sistema.'];
    return [image.kind==='real'?'3 · Imagen real intermedia':'3 · Imagen virtual del objetivo',image.kind==='real'?'Los rayos se encuentran en la posición calculada; la orientación depende del signo del aumento.':'No hay un cruce real tras el objetivo; se encuentran las prolongaciones de sus rayos.'];
  }
  if(frame<510)return ['4 · El ocular convergente',model.eyepiece.s===null?'Recibe el haz paralelo del objetivo y lo enfoca.':`Su distancia objeto es s₂ = ${microNumber(model.eyepiece.s)} mm; el signo también admite un objeto virtual.`];
  const final=model.finalImage;
  if(final.kind==='infinity')return ['5 · Imagen final en el infinito','Los rayos emergentes son paralelos; no existe una posición final finita que dibujar.'];
  if(final.kind==='degenerate')return ['5 · Conjugación en el plano del ocular','No es la configuración habitual: el aumento del ocular por separado es indeterminado.'];
  return [final.kind==='virtual'?'5 · Imagen virtual final':'5 · Imagen real final',final.kind==='virtual'?'Las prolongaciones de los rayos emergentes coinciden en la imagen calculada.':'Los rayos emergentes convergen; la imagen final es real, no virtual.'];
}

// Recorte de segmentos en el plano físico: no se cambian puntos imagen para encajarlos.
function clipMicroSegment(a,b,bounds){
  let lo=0,hi=1;const dx=b.x-a.x,dy=b.y-a.y;
  const p=[-dx,dx,-dy,dy],q=[a.x-bounds.xMin,bounds.xMax-a.x,a.y-bounds.yMin,bounds.yMax-a.y];
  for(let i=0;i<4;i++){if(p[i]===0){if(q[i]<0)return null;}else{const t=q[i]/p[i];if(p[i]<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);if(lo>hi)return null;}}
  return [{x:a.x+lo*dx,y:a.y+lo*dy},{x:a.x+hi*dx,y:a.y+hi*dy}];
}

export function renderMicroscopeSVG(frame=719,options={}) {
  const model=options.model||solveMicroscope(options.config||DEFAULT_OPTICS),view=createMicroscopeView(model,options.fitAll===true),{plot,bounds,map,contains}=view;
  const enabled=options.rays||['parallel','center','focus'],showExtensions=options.extensions!==false,family=options.family||'objective';
  const colors={parallel:'#a85d12',center:'#176d7c',focus:'#7955a2'};
  const clamp=v=>Math.max(0,Math.min(1,v)),progress=(a,b)=>clamp((frame-a)/(b-a));
  const incoming=progress(90,200),through=progress(210,345),outgoing=progress(360,500),extensions=progress(510,620);
  const [title,explanation]=microscopeStage(frame,model);
  const point=p=>{const q=map(p);return `${microNumber(q.x)} ${microNumber(q.y)}`;};
  const line=(a,b,color,p=1,style='real')=>{
    if(p<=0)return '';
    const pair=clipMicroSegment(a,b,bounds);if(!pair)return '';
    const [start,end]=pair;const dashed=style==='virtual'?'stroke-dasharray="11 8"':style==='reference'?'stroke-dasharray="3 7"':'';
    return `<path d="M${point(start)}L${point(end)}" fill="none" stroke="${color}" stroke-width="${style==='real'?3.2:2.2}" ${dashed} ${style==='real'?`pathLength="100" stroke-dasharray="100" stroke-dashoffset="${microNumber((1-p)*100)}" marker-end="url(#m-${color.slice(1)})"`:''} opacity="${microNumber(style==='real'?1:p)}"/>`;
  };
  const raySets=family==='both'?[...model.rayFamilies.objective,...model.rayFamilies.eyepiece]:model.rayFamilies[family]||[];
  let rayMarkup='';
  for(const r of raySets.filter(r=>enabled.includes(r.id))){
    const color=colors[r.id],exit={x:Math.max(bounds.xMax,model.inputs.L),y:r.atEyepiece.y+r.afterEyepieceSlope*(Math.max(bounds.xMax,model.inputs.L)-r.atEyepiece.x)};
    rayMarkup+=line(r.origin,r.atObjective,color,incoming)+line(r.atObjective,r.atEyepiece,color,through)+line(r.atEyepiece,exit,color,outgoing);
    if(showExtensions&&frame>=210){
      const im=model.objective.image;
      if(im.kind==='virtual')rayMarkup+=line(im,r.atObjective,color,through,'virtual');
      if(im.intercepted)rayMarkup+=line(r.atEyepiece,im,'#697c8e',through,'reference');
    }
    if(showExtensions&&model.finalImage.kind==='virtual')rayMarkup+=line(model.finalImage,r.atEyepiece,color,extensions,'virtual');
  }
  const axis=map({x:0,y:0}).y;
  const occupiedBadges=[];
  const imageArrow=(p,label,detail,phase,role,number)=>{
    if(phase<=0||p.x===null||p.y===null)return '';
    if(!contains(p))return '';
    const tip=map(p),base=map({x:p.x,y:0});
    const screenBase=Math.max(plot.top,Math.min(plot.bottom,base.y));
    const dash=role==='reference'?'stroke-dasharray="4 5"':'';
    let badge;
    for(const [dx,dy]of [[13,-27],[-35,-27],[13,8],[-35,8],[13,-52],[-35,-52]]){const candidate={x:Math.max(plot.left,Math.min(plot.right-23,tip.x+dx)),y:Math.max(plot.top,Math.min(plot.bottom-23,tip.y+dy))};if(!occupiedBadges.some(b=>Math.abs(b.x-candidate.x)<26&&Math.abs(b.y-candidate.y)<26)){badge=candidate;break;}}
    badge=badge||{x:Math.max(plot.left,Math.min(plot.right-23,tip.x+13)),y:plot.top+occupiedBadges.length*26};occupiedBadges.push(badge);
    const head=Math.min(7,Math.abs(screenBase-tip.y)/2),headY=tip.y+(tip.y<screenBase?head:-head);
    return `<g opacity="${microNumber(phase)}"><line x1="${microNumber(tip.x)}" y1="${microNumber(screenBase)}" x2="${microNumber(tip.x)}" y2="${microNumber(tip.y)}" stroke="${role==='reference'?'#697c8e':'#1d3557'}" stroke-width="3" ${dash}/>${head>0?`<path d="M${microNumber(tip.x)} ${microNumber(tip.y)}L${microNumber(tip.x-head/2)} ${microNumber(headY)}L${microNumber(tip.x+head/2)} ${microNumber(headY)}Z" fill="#1d3557"/>`:''}<circle cx="${microNumber(tip.x)}" cy="${microNumber(tip.y)}" r="2.5" fill="${role==='reference'?'#fffdf7':'#1d3557'}" stroke="#1d3557"/><line x1="${microNumber(tip.x)}" y1="${microNumber(tip.y)}" x2="${microNumber(badge.x+11)}" y2="${microNumber(badge.y+11)}" stroke="#697c8e" stroke-width="1"/><rect x="${microNumber(badge.x)}" y="${microNumber(badge.y)}" width="23" height="23" rx="3" fill="#fffdf7" stroke="#1d3557"/><text x="${microNumber(badge.x+11.5)}" y="${microNumber(badge.y+17)}" text-anchor="middle" font-size="17" font-weight="bold">${number}</text><title>${microEscape(label)}: x=${microNumber(p.x)} mm; y=${microNumber(p.y)} mm. ${microEscape(detail)}</title></g>`;
  };
  // Etiquetas en carriles fijos: no se colocan sobre las trayectorias variables.
  const tag=(x,title,value,color='#1d3557')=>`<text x="${x}" y="647" font-size="20" font-weight="bold" fill="${color}">${microEscape(title)}</text>${microWrap(value,39).slice(0,2).map((text,i)=>`<text x="${x}" y="${673+23*i}" font-size="18">${microEscape(text)}</text>`).join('')}`;
  const imageText=(im)=>im.kind==='infinity'?'En el infinito':`x=${microNumber(im.x)} mm; y=${microNumber(im.y)} mm${!contains(im)?' · fuera de vista':''}`;
  const intermediate=model.objective.image;
  const annotations=tag(46,'① Muestra',`x = −${microNumber(model.inputs.s1)} mm; h = ${microNumber(model.inputs.h)} mm`)+
    tag(470,intermediate.intercepted?'② Objetivo solo (no llega a formarse)':`② Intermedia ${intermediate.kind==='real'?'real':intermediate.kind==='virtual'?'virtual':'en infinito'}`,frame>=210?imageText(intermediate):'Se estudia en la etapa 3')+
    tag(925,`③ Final ${model.finalImage.kind==='virtual'?'virtual':model.finalImage.kind==='real'?'real':model.finalImage.kind==='degenerate'?'en plano ocular':'en infinito'}`,frame>=510?imageText(model.finalImage):'Se estudia en la etapa 5');
  const closeLensLabels=map({x:model.inputs.L,y:0}).x-map({x:0,y:0}).x<300;
  const lens=(physicalX,name,f)=>{
    const x=map({x:physicalX,y:0}).x;if(x<plot.left||x>plot.right)return '';
    const labelX=closeLensLabels?(physicalX===0?455:945):Math.max(plot.left+120,Math.min(plot.right-120,x));
    return `<path d="M${microNumber(x)} ${plot.top+5}Q${microNumber(x+18)} ${(plot.top+plot.bottom)/2} ${microNumber(x)} ${plot.bottom-5}Q${microNumber(x-18)} ${(plot.top+plot.bottom)/2} ${microNumber(x)} ${plot.top+5}Z" fill="#dcebf2" fill-opacity=".7" stroke="#1d3557" stroke-width="2.5"/><line x1="${microNumber(labelX)}" x2="${microNumber(x)}" y1="212" y2="233" stroke="#1d3557"/><text x="${microNumber(labelX)}" y="179" text-anchor="middle" font-size="23" font-weight="bold">${name}</text><text x="${microNumber(labelX)}" y="207" text-anchor="middle" font-size="20">f = ${microNumber(f)} mm</text>`;
  };
  const focalPoints=[['F₁',model.objective.foci.object],['F′₁',model.objective.foci.image],['F₂',model.eyepiece.foci.object],['F′₂',model.eyepiece.foci.image]];
  const focalGroups=[];
  for(const [label,p]of focalPoints.filter(([,p])=>contains(p)).sort((a,b)=>a[1].x-b[1].x)){const q=map(p),last=focalGroups.at(-1);if(last&&q.x-last.x<20){last.labels.push(label);last.points.push(q);}else focalGroups.push({x:q.x,labels:[label],points:[q]});}
  const focals=focalGroups.map((g,i)=>{const q=g.points[0],offset=(axis>plot.bottom-80?-1:1)*(25+(i%3)*22),label=g.labels.join('/');return g.points.map(p=>`<circle cx="${microNumber(p.x)}" cy="${microNumber(p.y)}" r="4" fill="#657580"/>`).join('')+`<text x="${microNumber(g.x)}" y="${microNumber(q.y+offset)}" text-anchor="middle" font-size="18">${label}</text>`;}).join('');
  const rulers=[[-model.inputs.s1,0,'s₁'],[0,model.inputs.L,'L']].map(([a,b,label])=>{const x1=map({x:a,y:0}).x,x2=map({x:b,y:0}).x;if(x2-x1<45)return '';return `<path d="M${microNumber(x1)} 224H${microNumber(x2)}M${microNumber(x1)} 220V228M${microNumber(x2)} 220V228" fill="none" stroke="#7a8790"/><text x="${microNumber((x1+x2)/2)}" y="219" text-anchor="middle" font-size="16">${label} = ${microNumber(b-a)} mm</text>`;}).join('');
  const explanationLines=microWrap(explanation);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 820" role="img" aria-labelledby="micro-title micro-desc"><title id="micro-title">${microEscape(title)}</title><desc id="micro-desc">Modelo calculado de lentes delgadas. ${microEscape(model.messages.join(' '))} Los trazos continuos son luz; las prolongaciones virtuales no son luz que retrocede.</desc><defs><clipPath id="micro-clip"><rect x="${plot.left}" y="${plot.top}" width="${plot.right-plot.left}" height="${plot.bottom-plot.top}"/></clipPath>${Object.values(colors).map(color=>`<marker id="m-${color.slice(1)}" markerWidth="5" markerHeight="5" refX="4.5" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5Z" fill="${color}"/></marker>`).join('')}</defs><style>text{font-family:Arial,sans-serif;fill:#1d3557}</style><rect width="1400" height="820" rx="14" fill="#fffdf7"/><rect x="28" y="24" width="1344" height="119" rx="8" fill="#edf3f7"/><text x="50" y="64" font-size="29" font-weight="bold">${microEscape(title)}</text>${explanationLines.slice(0,2).map((s,i)=>`<text x="50" y="${100+i*27}" font-size="23">${microEscape(s)}</text>`).join('')}<g clip-path="url(#micro-clip)"><line x1="${plot.left}" y1="${microNumber(axis)}" x2="${plot.right}" y2="${microNumber(axis)}" stroke="#87949c" stroke-dasharray="9 7"/>${lens(0,'Objetivo',model.inputs.f1).split('<line')[0]}${lens(model.inputs.L,'Ocular',model.inputs.f2).split('<line')[0]}${rayMarkup}${focals}${imageArrow({x:-model.inputs.s1,y:model.inputs.h},'Muestra','',1,'object',1)}${imageArrow(intermediate,'Imagen intermedia','',through,intermediate.intercepted?'reference':'image',2)}${imageArrow(model.finalImage,'Imagen final','',extensions,'image',3)}</g>${lens(0,'Objetivo',model.inputs.f1).substring(lens(0,'Objetivo',model.inputs.f1).indexOf('<line'))}${lens(model.inputs.L,'Ocular',model.inputs.f2).substring(lens(model.inputs.L,'Ocular',model.inputs.f2).indexOf('<line'))}${rulers}${annotations}<rect x="28" y="710" width="1344" height="86" rx="8" fill="#fff4cf" stroke="#d6c9af"/><text x="50" y="741" font-size="20"><tspan fill="#a85d12">1 Paralelo</tspan> · <tspan fill="#176d7c">2 Centro</tspan> · <tspan fill="#7955a2">3 Foco</tspan> · continuas: luz; discontinuas: prolongaciones virtuales.</text><text x="50" y="769" font-size="18">Punteado gris: eje o referencia hipotética. Misma escala en ambos ejes: 100 px = ${microNumber(100/view.scale)} mm.</text><text x="50" y="791" font-size="17">Secuencia explicativa: no representa la velocidad de la luz. Las lentes son símbolos de sus planos ópticos.</text></svg>`;
}

