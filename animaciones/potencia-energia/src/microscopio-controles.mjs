import {DEFAULT_OPTICS, solveMicroscope} from './microscopio-optica.mjs';
import {renderMicroscopeSVG, microscopeStage, createMicroscopeView, namespaceMicroscopeSVG} from './microscopio-render.mjs';

const stage=document.getElementById('stage'),play=document.getElementById('play'),restart=document.getElementById('restart'),seek=document.getElementById('seek'),time=document.getElementById('time'),status=document.getElementById('status');
const printStage=document.getElementById('print-stage'),errorBox=document.getElementById('input-error'),configuration=document.getElementById('configuration'),readouts=document.getElementById('readouts');
let frame=719,playing=false,origin=0,request=0,lastStatus='',labModel=solveMicroscope(),validInputs=true;
const duration=720,rate=30,reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const parameters=['f1','f2','L','s1','h'];
function labFormat(value,unit=''){if(value===null||value===undefined)return 'No definido';const text=Math.abs(value)>1e6||(value!==0&&Math.abs(value)<1e-4)?value.toExponential(5):Number(value.toPrecision(9)).toLocaleString('es-AR',{maximumFractionDigits:9});return text+(unit?' '+unit:'');}
function labOptions(){return {model:labModel,family:document.getElementById('family').value,rays:['parallel','center','focus'].filter(key=>document.getElementById('ray-'+key).checked),extensions:document.getElementById('extensions').checked,fitAll:document.getElementById('fit-all').checked};}
function pause(){playing=false;cancelAnimationFrame(request);play.textContent='Reproducir';play.setAttribute('aria-pressed','false');}
function draw(){
  const opts=labOptions();stage.innerHTML=renderMicroscopeSVG(frame,opts);stage.dataset.status=labModel.status;stage.dataset.finalKind=labModel.finalImage.kind;
  seek.value=String(frame);time.textContent='0:'+String(Math.round(frame/rate)).padStart(2,'0')+' / 0:24';
  const info=microscopeStage(frame,labModel),nextStatus=info.join('. ');if(nextStatus!==lastStatus){status.textContent=nextStatus;lastStatus=nextStatus;}
  const step=frame<90?0:frame<210?1:frame<360?2:frame<510?3:4;document.querySelectorAll('[data-frame]').forEach((b,i)=>{if(i===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
}
function readoutCard(title,rows){const card=document.createElement('div');card.className='readout';const heading=document.createElement('strong');heading.textContent=title;card.append(heading);for(const [label,value]of rows){const row=document.createElement('p');row.textContent=label+': ';const strong=document.createElement('span');strong.className='value';strong.textContent=value;row.append(strong);card.append(row);}return card;}
function updateResults(){
  const m=labModel,a=m.objective,b=m.eyepiece;
  const imageName=kind=>({real:'Real',virtual:'Virtual',infinity:'En el infinito',degenerate:'En el plano de la lente'}[kind]);
  const distance=(lens)=>lens.image.kind==='infinity'?'En el infinito':labFormat(lens.sPrime,'mm');
  const orientation=m.totalLateral===null?'Sin aumento lateral finito':m.totalLateral<0?'Invertida respecto de la muestra':'Derecha respecto de la muestra';
  readouts.replaceChildren(readoutCard('Objetivo',[["s₁",labFormat(a.s,'mm')],["s′₁",distance(a)],["m₁ lateral",labFormat(a.m)],["Imagen",imageName(a.image.kind)],["Altura intermedia",labFormat(a.image.y,'mm')]]),readoutCard('Ocular',[["s₂",labFormat(b.s,'mm')],["s′₂",distance(b)],["m₂ lateral",labFormat(b.m)],["Imagen final",imageName(m.finalImage.kind)],["Altura final",labFormat(m.finalImage.y,'mm')]]),readoutCard('Sistema completo',[["M lateral",labFormat(m.totalLateral)],["Orientación",orientation],["x final",labFormat(m.finalImage.x,'mm')],["Aumento angular",'No calculado'],["Salida",{parallel:'Rayos paralelos',diverging:'Rayos divergentes',converging:'Rayos convergentes','at-plane':'Cruce en el plano ocular'}[m.emergence]]]));
  configuration.textContent=m.messages.join(' ');
  document.getElementById('ray-note').textContent=m.rayNotes.join(' ');
  const view=createMicroscopeView(m,document.getElementById('fit-all').checked),outside=[['La imagen intermedia',a.image],['La imagen final',m.finalImage]].filter(([,p])=>p.x!==null&&p.y!==null&&!view.contains(p)).map(([name])=>name+' queda fuera del encuadre.').join(' ');
  document.getElementById('view-note').textContent=(outside?outside+' Activá «Ajustar todo el campo» para incluirla. ':'')+'Escala uniforme: 100 px = '+labFormat(100/view.scale,'mm')+'. El encuadre no modifica las posiciones físicas.'+(document.getElementById('fit-all').checked&&Math.abs(view.map({x:m.inputs.L,y:0}).x-view.map({x:0,y:0}).x)<45?' Las lentes casi coinciden en pantalla a esta escala porque la imagen está muy lejos; desactivá el ajuste completo para estudiar el montaje.':'');
  printStage.innerHTML=namespaceMicroscopeSVG(renderMicroscopeSVG(719,labOptions()),'print-');
}
function updatePhysical(){
  pause();
  try{
    const config={};for(const key of parameters){const field=document.getElementById(key+'-number');if(field.value.trim()==='')throw new Error('Completá todas las magnitudes.');const value=Number(field.value);if(!Number.isFinite(value))throw new Error('Usá números finitos.');config[key]=value;document.querySelector('[data-range="'+key+'"]').value=String(value);}
    const next=solveMicroscope(config);labModel=next;validInputs=true;play.disabled=false;errorBox.hidden=true;frame=719;updateResults();draw();
  }catch(error){validInputs=false;play.disabled=true;errorBox.hidden=false;errorBox.textContent=error.message+' Se conserva el último esquema válido; corregí la entrada para actualizarlo.';}
}
function setParameters(config){for(const key of parameters)document.getElementById(key+'-number').value=String(config[key]);updatePhysical();}
const studyPresets={normal:{...DEFAULT_OPTICS},'objective-focus':{...DEFAULT_OPTICS,s1:6},'inside-objective':{...DEFAULT_OPTICS,s1:4},'ocular-focus':{...DEFAULT_OPTICS,L:44},'outside-ocular':{...DEFAULT_OPTICS,L:50},'on-ocular':{...DEFAULT_OPTICS,L:24},'before-intermediate':{...DEFAULT_OPTICS,L:18},'near-focus':{...DEFAULT_OPTICS,L:44.00001}};
document.querySelectorAll('[data-param]').forEach(input=>input.addEventListener('input',()=>{document.getElementById('preset').selectedIndex=-1;updatePhysical();}));
document.querySelectorAll('[data-range]').forEach(input=>input.addEventListener('input',()=>{document.getElementById(input.dataset.range+'-number').value=input.value;document.getElementById('preset').selectedIndex=-1;updatePhysical();}));
document.getElementById('preset').addEventListener('change',event=>{if(studyPresets[event.target.value])setParameters(studyPresets[event.target.value]);});
document.getElementById('defaults').addEventListener('click',()=>{document.getElementById('preset').value='normal';setParameters(DEFAULT_OPTICS);});
document.querySelectorAll('.options input,.options select').forEach(input=>input.addEventListener('change',()=>{pause();frame=719;updateResults();draw();}));
function tick(now){if(!playing)return;frame=Math.min(duration-1,Math.floor((now-origin)*rate/1000));draw();if(frame>=duration-1){pause();return;}request=requestAnimationFrame(tick);}
play.addEventListener('click',()=>{if(!validInputs)return;if(playing){pause();return;}if(frame>=duration-1)frame=0;playing=true;play.textContent='Pausar';play.setAttribute('aria-pressed','true');origin=performance.now()-frame*1000/rate;request=requestAnimationFrame(tick);});
restart.addEventListener('click',()=>{pause();frame=0;draw();});
document.getElementById('analyze').addEventListener('click',()=>{pause();frame=719;draw();});
seek.addEventListener('input',()=>{pause();frame=Number(seek.value);draw();});
document.querySelectorAll('[data-frame]').forEach(button=>button.addEventListener('click',()=>{pause();frame=Number(button.dataset.frame);draw();}));
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
reducedMotion.addEventListener('change',()=>{pause();frame=719;draw();});
updateResults();draw();
let reportedHeight=0;
function reportLabHeight(){const height=Math.ceil(document.body.getBoundingClientRect().height)+4;if(height!==reportedHeight){reportedHeight=height;if(window.parent!==window)window.parent.postMessage({type:'microscope-lab-height',height},'*');}}
new ResizeObserver(reportLabHeight).observe(document.body);
window.addEventListener('load',reportLabHeight);
