import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {model} from '../src/scene.mjs';

const require=createRequire(import.meta.url);
const {chromium}=require(process.argv[2]||'playwright');
const out=new URL('../../../assets/potencia-energia/revision/',import.meta.url);
await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:3124/assets/potencia-energia/');
 const overflow=[];
 for(const seconds of [0,12,25,40,56,64]){
   await page.evaluate(s=>window.tablero.seekTo(s),seconds);
   const checks=await page.evaluate(()=>{
     const svg=document.querySelector('#stage svg');
     const root=svg.getBoundingClientRect();
     return [...svg.querySelectorAll('text')].flatMap(t=>{
       const b=t.getBoundingClientRect();const panel=t.closest('#explanation');const limit=panel?panel.getBoundingClientRect():root;
       return b.right>limit.right+1||b.left<limit.left-1||b.bottom>limit.bottom+1?[{text:t.textContent,b:{left:b.left,right:b.right,bottom:b.bottom},limit:{left:limit.left,right:limit.right,bottom:limit.bottom}}]:[];
     });
   });
   if(checks.length)overflow.push({seconds,checks});
   await page.locator('#stage').screenshot({path:fileURLToPath(new URL(`paso-${seconds}.png`,out))});
 }
 await page.getByRole('button',{name:'Probar la llave',exact:true}).click();
 await page.getByRole('button',{name:'Cerrar llave',exact:true}).click();
 await page.waitForTimeout(1200);
 const running=await page.evaluate(()=>window.tablero.getState());
 assert(running.contact===1&&running.energy>0,'Closed contact must accumulate energy');
 await page.getByRole('button',{name:'Abrir llave',exact:true}).click();
 await page.waitForTimeout(650);
 const stopped=await page.evaluate(()=>window.tablero.getState());
 await page.waitForTimeout(600);
 const held=await page.evaluate(()=>window.tablero.getState());
 assert.equal(held.energy,stopped.energy,'Opening must preserve and freeze energy');
 assert.equal(held.contact,0);
 await page.getByRole('button',{name:'Cerrar llave',exact:true}).click();
 await page.waitForTimeout(900);
 assert((await page.evaluate(()=>window.tablero.getState())).energy>held.energy,'Reclosing must resume');
 await page.getByRole('button',{name:'Poner contador en cero',exact:true}).click();
 await page.getByRole('button',{name:'Reiniciar',exact:true}).click();
 await page.getByRole('button',{name:'Reproducir',exact:true}).click();
 await page.waitForTimeout(350);
 await page.getByRole('button',{name:'Pausar',exact:true}).click();
 const paused=await page.evaluate(()=>window.tablero.getState().frame);
 await page.waitForTimeout(200);
 assert.equal(await page.evaluate(()=>window.tablero.getState().frame),paused);
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>window.tablero.seekTo(56));
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile horizontal overflow');
 await page.locator('#stage').screenshot({path:fileURLToPath(new URL('movil.png',out))});
 await page.emulateMedia({media:'print'});
 assert.equal(await page.locator('.controls').evaluate(el=>getComputedStyle(el).display),'none');
 assert.equal(model(10*30).on,false);assert.equal(model(11*30).on,true);
 assert.equal(model(40*30).energy,6);assert.equal(model(56*30).energy,2160);
 assert.equal(model(64*30).power,0);assert.equal(model(64*30).energy,2160);
 const result={browserErrors:errors,overflow,desktop:'1440px',mobile:'390px',interaction:'open,close,hold,resume,pause,restart passed',model:'6 J in 10 s; 2160 J in 1 h; open circuit P=0 passed'};
 await writeFile(new URL('verification.json',out),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result,null,2));assert.deepEqual(errors,[]);assert.deepEqual(overflow,[]);
}finally{await browser.close();}
