// Geometría paraxial original. Compartida por Remotion, HTML y esquemas impresos.
export const LENS_CASES = {
  convergente: {name:'Lente convergente', f:150, d:360, result:'Imagen real, invertida y menor'},
  divergente: {name:'Lente divergente', f:-150, d:300, result:'Imagen virtual, derecha y menor'},
  lupa: {name:'Convergente como lupa', f:150, d:90, result:'Imagen virtual, derecha y mayor'},
};
export const LENS_STEPS = ['Prepará el eje, los focos y el objeto', '1 · Rayo paralelo al eje', '2 · Rayo por el centro óptico', '3 · Rayo focal: comprobá el encuentro', 'Localizá y describí la imagen'];
export function lensGeometry(kind='convergente') {
  const c=LENS_CASES[kind] || LENS_CASES.convergente;
  const x=450,y=250,h=55,di=1/(1/c.f-1/c.d),imageX=x+di,imageY=y+h*di/c.d;
  const ox=x-c.d,oy=y-h, focalTarget=x-c.f;
  const thirdY=oy+(y-oy)*(x-ox)/(focalTarget-ox);
  return {...c,x,y,h,di,imageX,imageY,ox,oy,thirdY};
}
export function lensStep(frame=0,fps=30) {return Math.min(4,Math.max(0,Math.floor(frame/(2*fps))));}
export function renderLensSVG(kind='convergente',frame=299,fps=30) {
  const g=lensGeometry(kind),step=lensStep(frame,fps),id='lens-'+kind;
  const text=(x,y,s,extra='')=>`<text x="${x}" y="${y}" ${extra}>${s}</text>`;
  const line=(x1,y1,x2,y2,color='#75818b',dash=false,arrow=false,width=3)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${dash?'stroke-dasharray="8 6"':''} ${arrow?`marker-end="url(#${id}-${color.slice(1)})"`:''}/>`;
  const ray=(x1,y1,x2,y2,color,dash=false)=>line(x1,y1,x2,y2,color,dash)+(!dash?line(x1+(x2-x1)*.53,y1+(y2-y1)*.53,x1+(x2-x1)*.60,y1+(y2-y1)*.60,color,false,true):'');
  // Keep every emergent segment in the drawing area; endpoints need not be image points.
  const end=(slope,startY)=>{let xe=810;if(slope<0)xe=Math.min(xe,g.x+(95-startY)/slope);if(slope>0)xe=Math.min(xe,g.x+(365-startY)/slope);return [xe,startY+(xe-g.x)*slope];};
  const palette=['#b44b29','#216f98','#588044'];
  let out=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 440" width="900" height="440" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${g.name}: trazado de rayos</title><desc id="${id}-desc">${LENS_STEPS[step]}. ${step===4?g.result:''} Las líneas discontinuas son prolongaciones geométricas, no luz que retrocede.</desc><defs>${[...palette,'#1d3557','#7b4b95'].map(c=>`<marker id="${id}-${c.slice(1)}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0 0 L10 5 L0 10 Z" fill="${c}"/></marker>`).join('')}</defs><rect width="900" height="440" fill="#fffdf7"/><g font-family="Arial,sans-serif" font-size="22" fill="#1d3557">${text(30,32,g.name,'font-weight="700" font-size="26"')}${text(30,65,LENS_STEPS[step],'font-size="22"')}`;
  out+=line(35,g.y,860,g.y,'#79838a',true,false,1.5)+text(715,280,'eje principal','font-size="20"');
  const lens=g.f>0?'M450 100 Q407 235 450 370 Q493 235 450 100Z':'M428 100 Q459 235 428 370 L472 370 Q441 235 472 100Z';
  out+=`<path d="${lens}" fill="#dceef4" fill-opacity=".8" stroke="#527e91" stroke-width="2"/>`;
  out+=line(g.x,100,g.x,370,'#527e91',true,false,1);
  for(const [fx,label] of [[300,'F izq.'],[600,'F der.']])out+=`<circle cx="${fx}" cy="${g.y}" r="4" fill="#1d3557"/>`+text(fx-30,302,label);
  if(kind==='convergente')for(const [fx,label] of [[150,'2F izq.'],[750,'2F der.']])out+=line(fx,g.y-5,fx,g.y+5,'#1d3557',false,false,2)+text(fx-34,350,label,'font-size="20"');
  out+=text(455,280,'O','font-size="20"')+line(g.ox,g.y,g.ox,g.oy,'#1d3557',false,true,5)+text(Math.max(20,g.ox-35),g.oy-16,'objeto','font-weight="700" font-size="20"');
  if(step>=1){const [xe,ye]=end(g.h/g.f,g.oy);out+=ray(g.ox,g.oy,g.x,g.oy,palette[0])+ray(g.x,g.oy,xe,ye,palette[0]);if(g.f<0)out+=ray(300,g.y,g.x,g.oy,palette[0],true);else if(g.di<0&&step>=4)out+=ray(g.imageX,g.imageY,g.x,g.oy,palette[0],true);}
  if(step>=2){const [xe,ye]=end(g.h/g.d,g.y);out+=ray(g.ox,g.oy,g.x,g.y,palette[1])+ray(g.x,g.y,xe,ye,palette[1]);if(g.di<0&&step>=4)out+=ray(g.imageX,g.imageY,g.x,g.y,palette[1],true);}
  if(step>=3){out+=ray(g.ox,g.oy,g.x,g.thirdY,palette[2])+ray(g.x,g.thirdY,810,g.thirdY,palette[2]);if(g.f<0)out+=line(g.x,g.thirdY,600,g.y,palette[2],true,false,1.5);if(kind==='lupa')out+=line(300,g.y,g.ox,g.oy,palette[2],true,false,1.5);if(g.di<0&&step>=4)out+=line(g.imageX,g.imageY,g.x,g.thirdY,palette[2],true);}
  if(step>=4){out+=line(g.imageX,g.y,g.imageX,g.imageY,'#7b4b95',g.di<0,true,5)+text(g.imageX-40,g.imageY+(g.di>0?28:-14),'imagen','font-weight="700" font-size="20"');}
  out+=text(30,408,step===4?g.result:'La luz avanza hacia la derecha. Dibujamos desde la punta del objeto.','font-size="21" font-weight="700"');
  return out+'</g></svg>';
}
