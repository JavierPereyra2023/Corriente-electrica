import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {renderSVG} from '../src/scene.mjs';

// This build embeds the shared source so the classroom artifact also works offline.
const target=new URL('../../../assets/potencia-energia/',import.meta.url);
await mkdir(target,{recursive:true});
const source=(await readFile(new URL('../src/scene.mjs',import.meta.url),'utf8')).replace(/^export /gm,'');
const html=String.raw`<!doctype html>
<html lang="es-AR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="Tablero animado e interactivo con dos pilas, llave y lamparita. Potencia, energía y consumo en kWh.">
<title>Potencia y energía · Tablero de dos pilas</title>
<style>
:root{--ink:#18374a;--teal:#087a80;--paper:#f6f2e8;--line:#d8d2c4}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Arial,sans-serif}button,a,input{touch-action:manipulation}button{font:inherit;cursor:pointer;border:1px solid var(--line);border-radius:8px;background:#fffdf7;color:var(--ink);padding:11px 16px}button:hover{background:#e9efe9}button[aria-pressed=true],button.primary{background:var(--ink);color:#fff}button:focus-visible,a:focus-visible,input:focus-visible{outline:3px solid #b37915;outline-offset:3px}a{color:var(--teal)}.toolbar{max-width:1600px;margin:auto;display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:14px 24px}.toolbar>a:first-child{margin-right:auto;font-size:14px}.frame{max-width:1720px;margin:auto;line-height:0}.frame svg{width:100%;height:auto}.controls{max-width:1540px;margin:0 auto;padding:16px 24px 25px;border-bottom:1px solid var(--line)}.transport{display:flex;gap:12px;align-items:center;flex-wrap:wrap}.transport input{flex:1;min-width:160px;accent-color:var(--teal)}.time{font-variant-numeric:tabular-nums}.chapters{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}.chapters button{font-size:14px}.mode-note{font-size:14px;color:#526772;margin:16px 0 0;line-height:1.5}.guide{max-width:1140px;margin:45px auto;padding:0 24px 60px;line-height:1.65}.guide h1{font-family:Georgia,serif;font-size:36px}.guide h2{font-family:Georgia,serif;font-size:25px;margin-top:35px}.guide .lead{font-size:20px}.guide ol li{padding:5px 0}.guide p,.guide li{max-width:900px}.equations{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.equation{background:#fffdf7;border:1px solid var(--line);border-radius:12px;padding:20px;font-size:17px}.equation b{display:block;font-size:27px;margin-bottom:8px}.note{padding:18px 22px;background:#eee5ce;border-radius:12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:28px}table{border-collapse:collapse;width:100%;background:#fffdf7}th,td{padding:12px;text-align:left;border-bottom:1px solid var(--line)}th{background:#e9efe9}details{margin-top:18px}summary{cursor:pointer;font-weight:bold}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0)}.free-tools{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.free-tools[hidden]{display:none}.credit{font-size:14px;border-top:1px solid var(--line);padding-top:22px}.frame:fullscreen{background:var(--paper);display:grid;place-items:center;max-width:none}.frame:fullscreen svg{width:100%;height:100%;object-fit:contain}
@media(max-width:760px){.toolbar{padding:12px 16px}.toolbar button{font-size:13px;padding:9px}.toolbar>a:first-child{width:100%;margin-bottom:5px}.controls{padding:12px 16px 20px}.guide{margin-top:25px;padding:0 20px 40px}.guide h1{font-size:29px}.equations,.grid{grid-template-columns:1fr}.transport input{order:4;flex-basis:100%}.chapters{display:grid;grid-template-columns:1fr 1fr}.chapters button{text-align:left;font-size:13px;padding:10px}.frame svg{display:block}.guide table{font-size:14px}td,th{padding:8px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
@page{size:A4;margin:12mm}@media print{.toolbar,.controls,.no-print{display:none}.frame{break-inside:avoid}.guide{margin:0;padding:0;font-size:10pt}.guide h1{font-size:22pt}.guide h2{font-size:16pt}.guide .lead{font-size:12pt}.equations{grid-template-columns:repeat(3,1fr)}.equation{font-size:10pt;padding:10px}.equation b{font-size:16pt}.grid{grid-template-columns:1fr 1fr}table,.equations,.note{break-inside:avoid}.guide h2{break-after:avoid}}
</style></head>
<body>
<nav class="toolbar" aria-label="Recursos de la clase">
<a href="../../clases/potencia-electrica.html">← Volver al apunte de potencia y energía</a>
<a href="#guia">Guía para armar</a><button id="full">Pantalla completa</button><button id="print">Imprimir guía</button>
</nav>
<main>
<div id="stage" class="frame" aria-label="Infografía animada de potencia y energía">__POSTER__</div>
<section class="controls" aria-label="Controles de la infografía">
<div class="transport"><button id="play" class="primary">Reproducir</button><button id="restart">Reiniciar</button><label class="sr-only" for="seek">Tiempo de la animación</label><input id="seek" type="range" min="0" max="2159" step="1" value="0"><output id="clock" class="time">0:00 / 1:12</output><button id="free" aria-pressed="false">Probar la llave</button></div>
<div id="chapters" class="chapters" aria-label="Saltar a un tema"></div>
<div id="free-tools" class="free-tools" hidden><button id="switch" aria-pressed="false">Cerrar llave</button><button id="reset-meter">Poner contador en cero</button><label for="speed">Reloj:</label><select id="speed"><option value="1">Tiempo real</option><option value="60">Acelerado ×60</option></select><output id="meter" aria-live="off">P = 0 W · E = 0 J</output></div>
<p id="mode-note" class="mode-note">La animación dura 72 segundos. Podés pausarla en cualquier momento o elegir un tema. El reloj se acelera únicamente cuando se indica en pantalla.</p>
</section>
<article id="guia" class="guide">
<h1>Un circuito que vamos a construir</h1>
<p class="lead">La potencia cuenta cuánta energía se transforma cada segundo. La energía acumulada depende de cuánto tiempo estuvo encendida la lamparita.</p>
<div class="equations">
<div class="equation"><b>P = V × I</b>Potencia eléctrica recibida.<br>V: tensión en volt (V).<br>I: corriente en ampere (A).<br>P: potencia en watt (W).</div>
<div class="equation"><b>P = E / t</b>Rapidez media de transformación.<br>1 W = 1 J/s.<br>E: energía en joule (J).<br>t: tiempo en segundo (s).</div>
<div class="equation"><b>E = P × t</b>Para potencia constante.<br>W × s = J<br>W × h = Wh<br>kW × h = kWh</div>
</div>
<h2>1. Referencias del tablero</h2>
<p><strong>① Portapilas:</strong> dos pilas AA alcalinas de 1,5 V en serie, 3 V nominales en total. El puente metálico une el positivo de una con el negativo de la otra. Los dos extremos libres alimentan el circuito.</p>
<p><strong>② Llave:</strong> el brazo metálico con mango aislante cierra el contacto. Al separarlo, se interrumpe la corriente. <strong>③ Lamparita:</strong> incandescente para 3 V, con portalámparas compatible. Los cables completan el recorrido.</p>
<p><strong>Flechas sobre los cables:</strong> corriente convencional del positivo al negativo por el circuito externo; no representan electrones. <strong>Ondas naranjas:</strong> radiación infrarroja (IR), que no vemos. También hay transferencia de energía por conducción y convección, omitidas en el dibujo.</p>
<p class="note">El suave pulso luminoso ayuda a localizar el foquito. Es un recurso gráfico: una lámpara alimentada con pilas y contactos firmes se mantiene encendida. Las cargas no se consumen al atravesarla.</p>
<h2>2. Materiales y armado</h2>
<div class="grid"><div><strong>Materiales por grupo</strong><ul><li>Base aislante de madera o cartón rígido.</li><li>Portapilas para 2 AA y dos pilas nuevas del mismo tipo.</li><li>Lamparita incandescente de 3 V y portalámparas.</li><li>Llave didáctica con mango aislante.</li><li>Cables aislados y bornes o pinzas adecuadas.</li></ul></div><div><strong>Orden de conexión</strong><ol><li>Con las pilas retiradas, fijá las piezas a la base.</li><li>Uní el positivo del portapilas a un borne del portalámparas.</li><li>Conectá el otro borne a la llave.</li><li>Uní el otro contacto de la llave al negativo del portapilas.</li><li>Pedí al docente que revise las conexiones; colocá las pilas con la llave abierta y luego cerrala.</li></ol></div></div>
<p class="note"><strong>Solo baja tensión:</strong> nunca conectar este tablero a la red domiciliaria. No unir directamente los bornes del portapilas. No tocar el bulbo caliente. Abrir la llave si se calientan pilas o cables; retirar las pilas al guardar. No recargar pilas alcalinas.</p>
<h2>3. El ejemplo completo</h2>
<p>Suponemos una tensión de <strong>3 V</strong> en la lámpara y una corriente estable de <strong>0,20 A</strong>. La corriente es un dato del ejemplo, no un resultado garantizado por usar dos pilas. Despreciamos pérdidas en cables y fuente.</p>
<p><strong>P = 3 V × 0,20 A = 0,60 W.</strong> La lámpara transforma 0,60 J cada segundo. Esta potencia incluye la energía que sale como luz y la asociada al calentamiento; no es solamente potencia luminosa.</p>
<table><caption>Energía transformada a potencia constante de 0,60 W</caption><thead><tr><th>Tiempo encendida</th><th>Cálculo</th><th>Energía</th></tr></thead><tbody><tr><td>1 s</td><td>0,60 W × 1 s</td><td>0,60 J</td></tr><tr><td>5 s</td><td>0,60 W × 5 s</td><td>3 J</td></tr><tr><td>10 s</td><td>0,60 W × 10 s</td><td>6 J</td></tr><tr><td>1 h = 3600 s</td><td>0,60 W × 3600 s</td><td>2160 J</td></tr></tbody></table>
<p>Para calcular en kilowatt-hora: <strong>0,60 W ÷ 1000 = 0,00060 kW</strong>. Entonces, en 1 h:<br><strong>E = 0,00060 kW × 1 h = 0,00060 kWh = 0,60 Wh = 2160 J.</strong></p>
<p><strong>1 Wh = 3600 J. &nbsp; 1 kWh = 3 600 000 J.</strong> Se escribe kWh (kilowatt-hora): potencia multiplicada por tiempo. El kW mide potencia y el kWh mide energía.</p>
<p>En la animación comenzamos una medición al llegar al paso 4: primero transcurren 10 segundos a velocidad real; luego aceleramos el reloj hasta completar una hora. Es una predicción ideal: las pilas reales se descargan y la resistencia del filamento varía con su temperatura.</p>
<h2>4. Probá, registrá y explicá</h2>
<ol><li>Antes de cerrar la llave, anticipá qué valores tendrán I y P. Comprobalo.</li><li>En «Probar la llave», dejá el foquito encendido 10 s y luego abrí la llave. ¿Qué valor de energía queda registrado?</li><li>Volvé a cerrar durante otros 10 s. ¿Qué cambia y qué se mantiene?</li><li>Calculá la energía para 30 s y para 2 h de encendido. Expresá el segundo resultado en Wh y kWh.</li><li>¿Por qué el contador no vuelve a cero al abrir la llave? ¿Está guardando energía el foquito?</li><li>En el tablero real, dibujá el recorrido y señalá los dos contactos que deben unirse para encender.</li></ol>
<details><summary>Orientaciones para el docente</summary><p>Llave abierta: I = 0 A y P = 0 W en el modelo. A los 10 s, E = 6 J; tras otros 10 s encendida, E = 12 J. Para 30 s: 18 J. Para 2 h: 1,20 Wh = 0,00120 kWh. El contador conserva el registro de lo transformado: no mide energía almacenada en el bulbo. Evaluar si el grupo distingue circuito/corriente y potencia/energía, interpreta las unidades y justifica su predicción.</p><p>En el circuito real puede persistir emisión térmica brevemente después de abrir. No interpretamos el encendido como una resistencia constante: el ejemplo numérico corresponde al funcionamiento estable. Una medición de corriente requiere amperímetro en serie y supervisión docente; no conectarlo directamente entre los bornes de las pilas.</p></details>
<h2>5. Referencia de estudio</h2><p>Esta infografía acompaña el <a href="../../clases/potencia-electrica.html">apunte «Potencia eléctrica y energía eléctrica»</a>, especialmente las secciones de potencia, unidades y energía. Los valores del tablero son un ejemplo didáctico declarado, no mediciones experimentales.</p>
<p class="credit">Sistemas Multi Física · Profesor Javier Pereyra<br>Ilustración vectorial original. Animación realizada con Remotion. Reproductor y guía disponibles sin conexión.</p>
</article></main>
<script>
__SOURCE__
const stage=document.getElementById('stage'),seek=document.getElementById('seek'),clock=document.getElementById('clock'),play=document.getElementById('play');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let frame=0,playing=false,last=0,free=false,closed=false,contact=0,elapsed=0,freeFrame=600;
const portrait=()=>innerWidth<760;
const buttons=CHAPTERS.map(c=>{const b=document.createElement('button');b.textContent=c.title;b.onclick=()=>{exitFree();frame=c.at*FPS;playing=false;draw();};document.getElementById('chapters').append(b);return b;});
function draw(){
 const manual=free?{free:true,chapter:3,on:closed&&contact>=.999,contact,elapsed,energy:elapsed*.6,current:closed&&contact>=.999?.2:0,power:closed&&contact>=.999?.6:0}:null;
 stage.innerHTML=renderSVG(free?freeFrame:frame,portrait()?'vertical':'wide',manual);
 seek.value=Math.floor(frame);const t=Math.floor(frame/FPS);clock.textContent=Math.floor(t/60)+':'+String(t%60).padStart(2,'0')+' / 1:12';
 play.textContent=playing?'Pausar':'Reproducir';buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(!free&&model(frame).chapter===i)));
 if(free) document.getElementById('meter').textContent='P = '+decimal(manual.power)+' W · E = '+decimal(manual.energy)+' J';
}
function exitFree(){free=false;document.getElementById('free').setAttribute('aria-pressed','false');document.getElementById('free-tools').hidden=true;document.getElementById('chapters').hidden=false;document.getElementById('mode-note').textContent='Elegí un tema o reproducí la secuencia. El contador de la medición comienza en el paso 4.';seek.disabled=false;}
play.onclick=()=>{exitFree();if(frame>=DURATION*FPS-1)frame=0;playing=!playing;draw();};
document.getElementById('restart').onclick=()=>{exitFree();frame=0;playing=false;draw();};
seek.oninput=()=>{exitFree();frame=Number(seek.value);playing=false;draw();};
document.getElementById('free').onclick=()=>{if(free){exitFree();draw();return;}free=true;playing=false;closed=false;contact=0;elapsed=0;freeFrame=600;document.getElementById('free').setAttribute('aria-pressed','true');document.getElementById('free-tools').hidden=false;document.getElementById('chapters').hidden=true;document.getElementById('switch').textContent='Cerrar llave';document.getElementById('switch').setAttribute('aria-pressed','false');document.getElementById('mode-note').textContent='Tablero libre: accioná la llave. El contador suma únicamente el tiempo encendida y conserva el resultado al abrir. El selector permite acelerar el reloj ×60.';seek.disabled=true;draw();};
document.getElementById('switch').onclick=()=>{closed=!closed;document.getElementById('switch').textContent=closed?'Abrir llave':'Cerrar llave';document.getElementById('switch').setAttribute('aria-pressed',String(closed));draw();};
document.getElementById('reset-meter').onclick=()=>{elapsed=0;draw();};
document.getElementById('full').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else stage.requestFullscreen?.();};
document.getElementById('print').onclick=()=>window.print();
window.addEventListener('resize',draw);
window.addEventListener('beforeprint',()=>{stage.innerHTML=renderSVG(1680,'wide');});
window.addEventListener('afterprint',draw);
document.addEventListener('visibilitychange',()=>{last=0;});
function tick(now){const dt=last?Math.min((now-last)/1000,.1):0;last=now;
 if(free){const prior=contact;contact=clamp(contact+(closed?1:-1)*dt*2);if(closed&&prior>=.999)elapsed+=dt*Number(document.getElementById('speed').value);if(!reduce)freeFrame+=dt*FPS;draw();}
 else if(playing){frame=Math.min(DURATION*FPS-1,frame+dt*FPS);if(frame>=DURATION*FPS-1)playing=false;draw();}
 requestAnimationFrame(tick);
}
// Diagnostic snapshot and seeking are also useful to the teacher during preview.
window.tablero={getState:()=>({frame,playing,free,closed,contact,elapsed,energy:elapsed*.6}),seekTo:seconds=>{exitFree();frame=clamp(seconds,0,DURATION-1/FPS)*FPS;playing=false;draw();}};
draw();requestAnimationFrame(tick);
</script></body></html>`;
await writeFile(new URL('index.html',target),html.replace('__SOURCE__',()=>source).replace('__POSTER__',()=>renderSVG(0)),'utf8');
console.log('Infografía offline: '+fileURLToPath(new URL('index.html',target)));
