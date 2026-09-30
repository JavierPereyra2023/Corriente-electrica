const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {createCanvas} = require('C:/Users/javie/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas');
const html=fs.readFileSync('clases/modelos-de-la-luz.html','utf8');
const code=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
const results=[];
for(const width of [600,320,390]) {
  const elements={},handlers={},resize=[];
  for(const id of ['em-lab','em-frequency','em-amplitude','em-show-e','em-show-b','em-pause','em-e','em-b','em-de','em-db','em-frequency-value','em-wavelength']) {
    elements[id]={value:id==='em-frequency'?'1':'45',checked:true,textContent:'',attrs:{},addEventListener(event,fn){handlers[id+event]=fn;},setAttribute(k,v){this.attrs[k]=v;}};
  }
  for(const id of ['em-fields','em-radiation']) {elements[id]=createCanvas(1,1);elements[id].clientWidth=width;}
  let next;
  const context={document:{getElementById:id=>elements[id]},window:{devicePixelRatio:2,matchMedia:()=>({matches:false}),addEventListener(){}},requestAnimationFrame:fn=>{next=fn;},ResizeObserver:class{constructor(fn){resize.push(fn);}observe(){}},IntersectionObserver:class{observe(){}}};
  vm.runInNewContext(code,context);
  for(let frame=0;frame<=20;frame++)next(frame*1000/60);
  assert(elements['em-wavelength'].textContent.includes('240 u'));
  elements['em-frequency'].value='2';handlers['em-frequencyinput']();next(400);
  assert(elements['em-wavelength'].textContent.includes('120 u'));
  handlers['em-pauseclick']();next(416);
  const paused=elements['em-e'].textContent;next(432);assert.equal(elements['em-e'].textContent,paused);
  assert.equal(elements['em-pause'].textContent,'Reanudar');
  elements['em-show-e'].checked=false;handlers['em-show-einput']();next(448);
  elements['em-show-b'].checked=false;handlers['em-show-binput']();next(464);
  elements['em-show-e'].checked=true;elements['em-show-b'].checked=true;elements['em-frequency'].value='1';handlers['em-frequencyinput']();next(480);
  elements['em-fields'].clientWidth=width-10;resize[0]();next(496);
  assert.equal(elements['em-fields'].width,(width-10)*2);
  for(const id of ['em-e','em-b','em-de','em-db'])assert(Number.isFinite(Number(elements[id].textContent.replace(',','.'))));
  const output=createCanvas((width-10)*2,1024),out=output.getContext('2d');
  out.fillStyle='#f6f8f6';out.fillRect(0,0,output.width,output.height);
  out.drawImage(elements['em-fields'],0,0);out.drawImage(elements['em-radiation'],0,540);
  fs.writeFileSync(`output/playwright/campos-carga-${width}.png`,output.toBuffer('image/png'));
  results.push({width,inputs:true,pause:true,visibility:true,resize:true,finiteReadings:true});
}
console.log(JSON.stringify({type:'Verificacion de JavaScript y canvas en Node; no es una prueba de navegador',results},null,2));
