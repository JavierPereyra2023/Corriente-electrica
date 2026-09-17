// Shared, deterministic artwork for Remotion and the offline classroom player.
// Text remains editable; all artwork is original vector geometry.
export const FPS = 30;
export const DURATION = 72;
export const CHAPTERS = [
  {at: 0, title: '01 · El tablero'},
  {at: 9, title: '02 · Cerrar la llave'},
  {at: 20, title: '03 · Potencia'},
  {at: 30, title: '04 · Energía en J'},
  {at: 44, title: '05 · Energía en kWh'},
  {at: 60, title: '06 · Abrir y pensar'},
];
const C = {ink:'#18374a',muted:'#526772',teal:'#087a80',gold:'#c49335',heat:'#d85a2a',paper:'#f6f2e8',line:'#d8d2c4'};
const clamp = (n,min=0,max=1) => Math.max(min,Math.min(max,n));
const smooth = n => {const t=clamp(n); return t*t*(3-2*t);};
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export const decimal = (n,d=2) => n.toFixed(d).replace('.',',');
export function model(frame, manual = null) {
  const sec=frame/FPS;
  const closing=smooth((sec-10)/1);
  const opening=smooth((sec-60)/0.8);
  const contact=closing*(1-opening);
  const on=sec>=11 && sec<=60;
  // A fresh measurement begins at chapter 4. Its first ten seconds are real time.
  const elapsed=sec<30?0:sec<40?sec-30:sec<44?10:sec<56?10+(sec-44)/12*3590:3600;
  const chapter=CHAPTERS.reduce((v,c,i)=>sec>=c.at?i:v,0);
  return {sec,chapter,contact,on,elapsed,power:on?0.6:0,current:on?0.2:0,
    energy:elapsed*0.6, ...manual};
}
function text(x,y,s,size=30,fill=C.ink,weight=400,extra='') {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" ${extra}>${esc(s)}</text>`;
}
function lines(x,y,items,size=30,gap=40,fill=C.ink,weight=400) {
  return items.map((s,i)=>text(x,y+i*gap,s,size,fill,weight)).join('');
}
function rect(x,y,w,h,fill,rx=16,stroke='none') {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`;
}
function number(x,y,n) {
  return `<circle cx="${x}" cy="${y}" r="20" fill="${C.ink}"/>${text(x,y+8,n,24,'#fff',700,'text-anchor="middle"')}`;
}
function screw(x,y) {
  return `<circle cx="${x}" cy="${y}" r="12" fill="url(#metal)" stroke="#4c5960" stroke-width="2"/><path d="M${x-6},${y+6} l12,-12" stroke="#49565e" stroke-width="3"/>`;
}
function wire(d,color) {
  return `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="17" transform="translate(0 4)"/><path d="${d}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".24" stroke-width="3" stroke-linecap="round" transform="translate(-1 -2)"/>`;
}
function arrows(points,frame,on) {
  if(!on)return '';
  const segments=points.slice(1).map((p,i)=>({a:points[i],b:p,len:Math.hypot(p[0]-points[i][0],p[1]-points[i][1])}));
  const total=segments.reduce((s,p)=>s+p.len,0);
  const count=Math.floor(total/120);
  return Array.from({length:count},(_,i)=>{
    let dist=(i*total/count+frame*2.4)%total;
    let segment=segments[segments.length-1];
    for(const candidate of segments){if(dist<=candidate.len){segment=candidate;break;}dist-=candidate.len;}
    const ratio=dist/segment.len;
    const x=segment.a[0]+(segment.b[0]-segment.a[0])*ratio;
    const y=segment.a[1]+(segment.b[1]-segment.a[1])*ratio;
    const angle=Math.atan2(segment.b[1]-segment.a[1],segment.b[0]-segment.a[0])*180/Math.PI;
    return `<path d="M-7,-6 L1,0 L-7,6" transform="translate(${x} ${y}) rotate(${angle})" fill="none" stroke="#d9ffff" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  }).join('');
}
function board(s,frame) {
  const glow=s.on?0.96+0.04*Math.sin(frame/FPS*Math.PI):Math.max(0,1-(s.sec-60)*2)*(s.sec>=60?1:0);
  const angle=-48*(1-s.contact);
  const red='M210 190 L210 130 L620 130 L620 330 L715 330';
  const dark='M865 330 L1020 330 L1020 495 L660 495';
  const back='M535 495 L410 495 L410 190 L306 190';
  const current=arrows([[210,190],[210,130],[620,130],[620,330],[715,330]],frame,s.on)+
    arrows([[865,330],[1020,330],[1020,495],[660,495]],frame,s.on)+
    arrows([[660,495],[535,495],[410,495],[410,190],[306,190]],frame,s.on);
  const radiant=Array.from({length:7},(_,i)=>{
    const a=(-162+i*24)*Math.PI/180;
    const phase=(frame/48+i/7)%1;
    const radius=70+phase*15;
    const x=790+Math.cos(a)*radius,y=225+Math.sin(a)*radius;
    return `<path d="M0 0 q4 -5 8 0 t8 0 t8 0" transform="translate(${x} ${y}) rotate(${a*180/Math.PI})" fill="none" stroke="${C.heat}" stroke-width="4" opacity="${glow*(1-phase)*.9}"/>`;
  }).join('');
  return `<g id="board">
    ${rect(0,0,1080,650,'url(#wood)',24,'#cab997')}
    <path d="M20 175 Q360 160 1050 175 M20 390 Q510 405 1060 390 M20 570 Q520 560 1060 575" stroke="#9e7d45" stroke-opacity=".09" fill="none" stroke-width="2"/>
    ${[ [24,24],[1056,24],[24,626],[1056,626] ].map(p=>screw(...p)).join('')}
    ${text(40,58,'TABLERO DE BAJA TENSIÓN',27,C.ink,700)}
    ${rect(746,26,290,49,s.on?'#d9ebe2':'#e6e2d9',24)}
    <circle cx="771" cy="50" r="7" fill="${s.on?C.teal:'#7c837f'}"/>
    ${text(790,59,s.on?'CIRCUITO CERRADO':'CIRCUITO ABIERTO',20,C.ink,700)}
    ${wire(red,'#bb3e33')}${wire(dark,'#344653')}${wire(back,'#344653')}
    ${rect(139,177,235,307,'#00000018',20)}
    ${rect(133,170,235,307,'#24323c',18,'#111e27')}
    ${rect(148,186,205,272,'#13232c',9)}
    ${[210,306].map((x,i)=>`<g>
      ${rect(x-35,217,70,215,'url(#cell)',11)}
      ${rect(x-35,i===0?217:355,70,77,'url(#copper)',9)}
      ${rect(x-26,i===0?207:427,52,10,'url(#metal)',3)}
      <path d="M${x-25} 201 l10 -5 l-10 -5 l10 -5" fill="none" stroke="#afb7b6" stroke-width="3"/>
      <path d="M${x-25} 450 l10 -5 l-10 -5 l10 -5" fill="none" stroke="#afb7b6" stroke-width="3"/>
      ${text(x,250,i===0?'+':'−',31,i===0?'#31190c':'#fff',700,'text-anchor="middle"')}
      ${text(x,395,i===0?'−':'+',31,i===0?'#fff':'#31190c',700,'text-anchor="middle"')}
      ${text(x,320,'1,5 V',24,'#fff',700,'text-anchor="middle"')}
      ${text(x,350,'AA',20,'#d7dfdf',400,'text-anchor="middle"')}
      <path d="M${x} 190 V217 M${x} 432 V463" stroke="#c2c6c4" stroke-width="7"/>
    </g>`).join('')}
    <path d="M210 442 V463 H306 V442" fill="none" stroke="#c1bfab" stroke-width="6"/>
    ${text(182,172,'+',29,'#a33028',700)}${text(320,174,'−',29,C.ink,700)}
    <path d="M172 484 V513 H88" fill="none" stroke="${C.muted}" stroke-width="2"/>
    ${number(61,544,1)}${text(92,551,'PORTAPILAS',27,C.ink,700)}
    ${text(92,587,'1,5 V + 1,5 V = 3 V',29,C.ink,600)}
    ${text(92,620,'Pilas en serie · tensión nominal',22,C.muted)}
    <circle cx="790" cy="225" r="145" fill="url(#halo)" opacity="${glow}"/>
    ${radiant}
    ${rect(693,301,200,82,'#00000018',30)}
    ${rect(689,290,200,82,'#ede7d6',30,'#a9a28f')}
    <ellipse cx="790" cy="328" rx="56" ry="25" fill="#323b40"/>
    <path d="M756 273 L824 273 L817 320 Q790 335 763 320 Z" fill="url(#metal)" stroke="#5e686c" stroke-width="2"/>
    <path d="M760 285 H821 M762 298 H819 M763 309 H817" stroke="#616c72" stroke-width="3"/>
    <path d="M764 278 C766 260 731 254 731 218 C731 146 849 146 849 218 C849 254 814 260 816 278 Z" fill="${s.on?'#fff0a5':'#e6f0ec'}" fill-opacity=".77" stroke="#ac9a70" stroke-width="3"/>
    <path d="M751 220 Q743 188 773 180" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M778 276 L768 228 L778 234 L786 223 L794 234 L802 223 L812 229 L801 276" fill="none" stroke="${s.on?'#ffb226':'#687174'}" stroke-width="${s.on?4.5:2.5}"/>
    <path d="M768 228 L778 234 L786 223 L794 234 L802 223 L812 229" fill="none" stroke="#fff" stroke-width="2" opacity="${glow}"/>
    ${screw(715,330)}${screw(865,330)}
    ${number(720,412,3)}${text(751,420,'LAMPARITA · 3 V',28,C.ink,700)}
    ${text(750,452,'Incandescente',24,C.muted)}
    ${rect(495,465,205,62,'#efe6d0',9,'#a18e6b')}
    <path d="M522 495 H548 M650 495 H676" stroke="#9b7337" stroke-width="15" stroke-linecap="round"/>
    <g id="switch-blade" transform="rotate(${angle} 535 495)">
      <path d="M535 495 H660" stroke="#00000020" stroke-width="17" stroke-linecap="round"/>
      <path d="M535 491 H660" stroke="url(#metal)" stroke-width="12" stroke-linecap="round"/>
      ${rect(566,479,55,24,'#ad4b30',6,'#75331f')}
    </g>
    ${screw(535,495)}${screw(660,495)}
    ${number(536,565,2)}${text(568,573,'LLAVE MÓVIL',28,C.ink,700)}
    ${text(568,610,'Une o separa los contactos',23,C.muted)}
    ${current}
    ${text(433,111,s.on?'I = 0,20 A →':'I = 0 A',28,s.on?C.teal:C.muted,700)}
    ${s.on?`${text(720,105,'Luz + radiación IR',23,C.heat,600)}`:''}
  </g>`;
}
function formula(y,main,sub) {
  return `${rect(30,y,600,106,'#e9efe9',14)}${text(50,y+47,main,43,C.ink,600)}${text(50,y+82,sub,24,C.muted)}`;
}
function panel(s) {
  const head=(n,title,subtitle)=>`${text(32,42,`PASO ${n} / 6`,22,C.teal,700)}${text(30,104,title,47,C.ink,700)}${text(32,148,subtitle,27,C.muted)}`;
  let content='';
  if(s.chapter===0)content=head('1','Armamos el circuito','Un único recorrido para la corriente.')+
    `${number(51,211,1)}${lines(88,218,['Dos pilas en un portapilas','3 V nominales en total'],30,40,C.ink,600)}
    ${number(51,325,2)}${lines(88,332,['Llave con mango aislante','Abre o cierra el recorrido'],30,40,C.ink,600)}
    ${number(51,439,3)}${lines(88,446,['Foquito de 3 V y su base','Transforma energía en luz','y energía térmica'],30,40,C.ink,600)}
    ${rect(30,560,600,65,'#f3e8ce',12)}${text(50,601,'Antes de armar: retirar las pilas.',27,C.ink,600)}`;
  if(s.chapter===1)content=head('2','La llave hace contacto','El recorrido queda cerrado.')+
    `${rect(30,181,600,86,'#e9efe9',14)}${text(52,236,'+  →  lámpara  →  llave  →  −',33,C.teal,700)}
    ${lines(32,316,['Las flechas indican el sentido','de la corriente convencional.'],31,42)}
    ${lines(32,424,['Las cargas circulan por todo','el circuito. En la lámpara','se transforma energía.'],31,42)}
    ${rect(30,561,600,65,'#f3e8ce',12)}${text(50,602,'El circuito debe estar completo.',28,C.ink,600)}`;
  if(s.chapter===2)content=head('3','¿Cuánta por segundo?','La potencia mide esa rapidez.')+
    formula(181,'P = V × I','P: potencia · V: tensión · I: corriente')+
    `${text(32,347,'3 V × 0,20 A = 0,60 W',41,C.ink,600)}
    ${rect(30,389,600,127,'#18374a',16)}${text(54,441,'0,60 W = 0,60 J/s',40,'#fff',600)}${text(54,484,'Cada segundo transforma 0,60 J.',28,'#dde9e8')}
    ${lines(32,570,['Ejemplo: suponemos I = 0,20 A.','La corriente real depende del foquito.'],26,36,C.muted)}`;
  if(s.chapter===3)content=head('4','La energía se acumula','Comienza una nueva medición: t = 0.')+
    formula(181,'E = P × t','Potencia constante · W × s = J')+
    `${text(32,343,`0,60 W × ${decimal(s.elapsed,1)} s`,40,C.ink,600)}
    ${rect(30,373,600,122,'#18374a',16)}${text(52,425,`${decimal(s.energy)} J`,52,'#fff',700)}${text(54,468,'Energía eléctrica transformada',27,'#dce8e7')}
    ${rect(32,522,596,12,'#d9ded5',6)}${rect(32,522,596*clamp(s.elapsed/10),12,C.teal,6)}
    ${lines(32,579,['1 s → 0,60 J  ·  5 s → 3 J',s.sec>=40?'10 s → 6 J  ·  Pausa para leer':'10 s → 6 J'],29,40,C.ink,600)}`;
  if(s.chapter===4){const hours=s.elapsed/3600;content=head('5','La misma energía, en kWh','Usamos kilowatts y horas.')+
    formula(181,'0,60 W ÷ 1000 = 0,00060 kW','Conversión de potencia: 1 kW = 1000 W')+
    `${text(32,333,`t = ${decimal(hours,2)} h`,39,C.ink,600)}${text(32,384,'E = 0,00060 kW × t',38,C.ink,600)}
    ${rect(30,409,600,106,'#18374a',16)}${text(50,457,`${decimal(0.0006*hours,5)} kWh`,45,'#fff',700)}${text(52,495,`${decimal(0.6*hours)} Wh = ${Math.round(s.energy)} J`,27,'#dce8e7')}
    ${rect(30,540,600,40,'#f3e8ce',8)}${text(49,568,s.sec<56?'RELOJ ACELERADO · llegamos a 1 h':'PAUSA PARA LEER · 1 h de encendido',23,C.ink,700)}
    ${text(32,625,'kW: potencia.  kWh: energía.',30,C.teal,700)}`;}
  if(s.chapter===5)content=head('6','Abrimos la llave','La corriente se interrumpe.')+
    formula(181,'I = 0 A     P = 0 W','La lámpara deja de recibir energía eléctrica.')+
    `${rect(30,312,600,106,'#18374a',16)}${text(52,358,'E = 0,00060 kWh',40,'#fff',700)}${text(52,396,'Lo ya transformado permanece registrado.',24,'#dce8e7')}
    ${lines(32,466,['Para pensar antes de armar:'],30,40,C.teal,700)}
    ${lines(32,516,['¿Qué pasa con E si duplicamos','el tiempo con la misma potencia?'],30,41)}
    ${text(32,621,'Más tiempo encendido → más energía.',27,C.ink,700)}`;
  if(s.free) content=head('—','Probá la llave','El tiempo cuenta solo al estar encendida.')+
    formula(181,`P = ${decimal(s.power)} W     I = ${decimal(s.current)} A`,'V nominal = 3 V · modelo ideal')+
    `${text(32,338,`Tiempo encendida: ${decimal(s.elapsed,1)} s`,35,C.ink,600)}
    ${text(32,391,'E = 0,60 W × tiempo encendida',32,C.ink,600)}
    ${rect(30,421,600,106,'#18374a',16)}${text(52,468,`${decimal(s.energy)} J`,45,'#fff',700)}${text(52,507,`${decimal(s.energy/3600000,7)} kWh acumulados`,27,'#dce8e7')}
    ${lines(32,576,[s.on?'La energía acumulada aumenta.':'La energía acumulada se conserva.', 'Abrí y cerrá la llave para comprobarlo.'],27,39,C.teal,600)}`;
  if(s.free) content=head('—','Probá la llave','El tiempo cuenta solo al estar encendida.')+
    formula(181,`P = ${decimal(s.power)} W     I = ${decimal(s.current)} A`,'V nominal = 3 V · modelo ideal')+
    `${text(32,338,`Tiempo encendida: ${decimal(s.elapsed,1)} s`,35,C.ink,600)}
    ${text(32,391,'E = 0,60 W × tiempo encendida',32,C.ink,600)}
    ${rect(30,421,600,106,'#18374a',16)}${text(52,468,`${decimal(s.energy)} J`,45,'#fff',700)}${text(52,507,`${decimal(s.energy/3600000,7)} kWh acumulados`,27,'#dce8e7')}
    ${lines(32,576,[s.on?'La energía acumulada aumenta.':'La energía acumulada se conserva.', 'Abrí y cerrá la llave para comprobarlo.'],27,39,C.teal,600)}`;
  return `<g id="explanation">${rect(0,0,660,650,'#fffdf7',22,C.line)}${content}</g>`;
}
function definitions() {
  return `<defs>
    <linearGradient id="wood" x2="0" y2="1"><stop stop-color="#efe5ce"/><stop offset=".5" stop-color="#e7d8b9"/><stop offset="1" stop-color="#f0e5cf"/></linearGradient>
    <linearGradient id="cell"><stop stop-color="#283d4b"/><stop offset=".45" stop-color="#526a76"/><stop offset=".75" stop-color="#283d4b"/><stop offset="1" stop-color="#162934"/></linearGradient>
    <linearGradient id="copper"><stop stop-color="#986032"/><stop offset=".45" stop-color="#ecbc7e"/><stop offset=".8" stop-color="#b47d44"/><stop offset="1" stop-color="#825132"/></linearGradient>
    <linearGradient id="metal"><stop stop-color="#66747a"/><stop offset=".45" stop-color="#e4e8e6"/><stop offset=".65" stop-color="#b2bcbe"/><stop offset="1" stop-color="#5c6e76"/></linearGradient>
    <radialGradient id="halo"><stop stop-color="#ffd35f" stop-opacity=".8"/><stop offset=".45" stop-color="#ffc344" stop-opacity=".3"/><stop offset="1" stop-color="#ffb126" stop-opacity="0"/></radialGradient>
  </defs>`;
}
export function renderSVG(frame,format='wide',manual=null) {
  const s=model(frame,manual);
  // Freeze the drawing as well as the clock during the two reading pauses.
  const boardFrame=manual?frame:s.sec>=40&&s.sec<44?1200:s.sec>=56&&s.sec<60?1680:frame;
  const vertical=format==='vertical';
  const width=vertical?1080:1920,height=vertical?1920:1080;
  const chapter=CHAPTERS[s.chapter];
  const progress=clamp(s.sec/DURATION);
  const header=vertical?
    `${text(60,68,'FÍSICA EN EL TABLERO',24,C.teal,700)}${text(60,133,'Potencia y energía',64,C.ink,700)}${text(60,184,'Dos pilas. Una llave. Una transformación.',28,C.muted)}`:
    `${text(80,72,'FÍSICA EN EL TABLERO',27,C.teal,700)}${text(80,155,'Potencia y energía',76,C.ink,700)}${text(82,206,'Dos pilas. Una llave. Una transformación que podemos medir.',31,C.muted)}${text(1835,89,'01',54,C.gold,500,'text-anchor="end"')}${text(1835,135,'LABORATORIO ESCOLAR',22,C.muted,600,'text-anchor="end"')}`;
  const legend=vertical?
    `<g transform="translate(60 1740)">${lines(0,0,['→ Corriente convencional   ∿ Radiación infrarroja','IR invisible: ondas simbólicas. Brillo pulsante ilustrativo.','Modelo ideal: tensión y potencia constantes al encender.'],24,34,C.muted)}${text(0,122,'Sistemas Multi Física · Profesor Javier Pereyra',23,C.ink,600)}</g>`:
    `<g transform="translate(80 948)"><path d="M0 0 H43 m-10 -6 l10 6 l-10 6" fill="none" stroke="${C.teal}" stroke-width="3"/>${text(58,8,'Corriente convencional',26,C.ink,600)}<path d="M405 0 q7 -9 14 0 t14 0 t14 0" fill="none" stroke="${C.heat}" stroke-width="3"/>${text(463,8,'Radiación infrarroja: invisible, aquí representada',25,C.ink)}${text(1760,8,chapter.title,25,C.teal,700,'text-anchor="end"')}${text(0,52,'Brillo pulsante ilustrativo. Modelo ideal: tensión y potencia constantes durante el encendido.',24,C.muted)}${text(1760,89,'Sistemas Multi Física · Profesor Javier Pereyra',23,C.ink,500,'text-anchor="end"')}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${esc(chapter.title)}: circuito de dos pilas, llave móvil y lamparita; explicación de potencia y energía" font-family="Arial, sans-serif" shape-rendering="geometricPrecision">
    ${definitions()}${rect(0,0,width,height,C.paper,0)}${rect(0,0,width,9,C.teal,0)}
    ${header}
    <g transform="${vertical?'translate(38 227) scale(.93)':'translate(80 250)'}">${board(s,boardFrame)}</g>
    <g transform="${vertical?'translate(210 876)':'translate(1190 250)'}">${panel(s)}</g>
    ${vertical?`${text(60,1591,'P = E / t      E = P × t',38,C.ink,600)}${text(60,1640,'1 W = 1 J/s      1 kWh = 3 600 000 J',30,C.muted)}`:''}
    ${legend}${rect(0,height-7,width,7,'#ddd8cb',0)}${rect(0,height-7,width*progress,7,C.gold,0)}
  </svg>`;
}

// A single animated infographic, rather than a slide sequence or a webpage.
// Twenty seconds: switch closes, ten real seconds on, opens, holds, new trial.
export function loopModel(frame) {
  const sec=((frame%600)+600)%600/FPS;
  const contact=smooth((sec-2)/.6)*(1-smooth((sec-12.6)/.6));
  const on=sec>=2.6&&sec<=12.6;
  const resetting=sec>=18&&sec<19.5;
  const elapsed=sec>=19?0:clamp(sec-2.6,0,10);
  return {sec,contact,on,elapsed,energy:elapsed*.6,power:on?.6:0,current:on?.2:0,resetting};
}
export function renderInfographic(frame) {
  const s=loopModel(frame);
  // Adapt the brief afterglow to this loop's opening, not the long lesson timeline.
  const lampState={...s,sec:s.sec>=12.6&&s.sec<13.1?60+s.sec-12.6:s.sec};
  const glow=s.on?1:0;
  const resetOpacity=s.resetting?Math.min(smooth((s.sec-18)/.2),1-smooth((s.sec-19.2)/.3)):0;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080" font-family="Arial, sans-serif" role="img" aria-label="Infografía animada: potencia y energía de un circuito con dos pilas y llave">
    ${definitions()}${rect(0,0,1920,1080,'#f6f1e4',0)}
    <path d="M55 39 H1865 M55 1042 H1865" stroke="#b79454" stroke-width="2"/>
    ${text(65,89,'EXPERIMENTAR · OBSERVAR · CALCULAR',23,C.teal,700)}
    ${text(62,172,'Potencia y energía de un foquito',70,C.ink,700)}
    ${text(65,218,'Dos pilas en serie → corriente eléctrica → luz y energía térmica',31,C.muted)}
    <g transform="translate(64 250) scale(.93)">${board(lampState,frame)}</g>
    <path d="M1160 255 V821" stroke="#c8b98e" stroke-width="2"/>
    ${text(1210,289,'POTENCIA',31,C.teal,700)}
    ${text(1210,326,'Energía transformada por segundo',28,C.muted)}
    ${text(1205,398,'P = V × I',64,C.ink,600)}
    ${text(1210,448,'3 V × 0,20 A = 0,60 W',39,C.ink,600)}
    ${text(1210,490,'Con la llave cerrada: 0,60 J cada segundo.',27,C.muted)}
    <path d="M1208 518 H1855" stroke="#c8b98e" stroke-width="2"/>
    ${text(1210,559,'ENERGÍA ACUMULADA',31,C.teal,700)}
    ${text(1205,631,'E = P × t',62,C.ink,600)}
    ${text(1210,678,`t encendida = ${decimal(s.elapsed,1)} s`,32,C.muted)}
    ${text(1207,750,`${decimal(s.energy)} J`,65,C.teal,700)}
    ${text(1850,746,`P ahora: ${decimal(s.power)} W`,30,C.ink,600,'text-anchor="end"')}
    <path d="M1210 774 H1850" stroke="#dbd5c3" stroke-width="10" stroke-linecap="round"/>
    <path d="M1210 774 H${1210+640*s.elapsed/10}" stroke="${C.teal}" stroke-width="10" stroke-linecap="round"/>
    ${text(1210,819,'Al abrir: P = 0; la energía queda registrada.',27,C.muted)}
    <g opacity="${resetOpacity}">${rect(1430,645,435,54,'#f6f1e4',0)}${text(1440,681,'↻ Nueva medición desde cero',26,C.heat,700)}</g>
    <path d="M64 901 H1856" stroke="#b79454" stroke-width="2"/>
    ${text(66,887,'→ Corriente convencional',24,C.teal,600)}
    ${text(471,887,'∿ Radiación IR: invisible, aquí representada',24,C.heat,600)}
    ${text(1209,887,'P: potencia · E: energía · t: tiempo',25,C.muted)}
    ${text(64,943,'¿Y SI QUEDA ENCENDIDA 1 HORA?',26,C.teal,700)}
    ${text(64,989,'0,60 W = 0,00060 kW',37,C.ink,600)}
    ${text(638,944,'E = 0,00060 kW × 1 h',36,C.ink,600)}
    ${text(638,992,'= 0,00060 kWh = 0,60 Wh = 2160 J',38,C.ink,700)}
    ${text(65,1067,'Ejemplo ideal: 3 V y 0,20 A estables. Brillo pulsante ilustrativo. kWh = unidad de energía.',22,C.muted)}
    ${text(1854,1067,'Profesor Javier Pereyra · Sistemas Multi Física',20,C.ink,600,'text-anchor="end"')}
  </svg>`;
}
