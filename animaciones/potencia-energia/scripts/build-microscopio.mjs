import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderMicroscopeSVG,namespaceMicroscopeSVG} from '../src/microscopio-render.mjs';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const assets=path.resolve(project,'../../assets/microscopios');
const read=rel=>fs.readFileSync(path.join(project,rel),'utf8');
const scriptSource=rel=>read(rel).replace(/^import[^\n]*\n/gm,'').replace(/^export\s+(?=(?:const|let|function|class)\b)/gm,'');
const svg=renderMicroscopeSVG(719);
let html=read('templates/microscopio-interactivo.html');
for(const [marker,value]of Object.entries({__INITIAL_SVG__:svg,__PRINT_SVG__:namespaceMicroscopeSVG(svg,'print-'),__OPTICS_SOURCE__:scriptSource('src/microscopio-optica.mjs'),__RENDER_SOURCE__:scriptSource('src/microscopio-render.mjs'),__UI_SOURCE__:scriptSource('src/microscopio-controles.mjs')}))html=html.replace(marker,()=>value);
if(/__(?:INITIAL_SVG|PRINT_SVG|OPTICS_SOURCE|RENDER_SOURCE|UI_SOURCE)__/.test(html))throw new Error('Marcador de compilación sin reemplazar.');
const outputs=[['rayos-interactivos.html',html],['microscopio-rayos.svg',svg+'\n']];
for(const [file,contents]of outputs){const target=path.join(assets,file);if(process.argv.includes('--check')){if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==contents)throw new Error(file+' no está actualizado; ejecutar build-microscopio.mjs.');}else fs.writeFileSync(target,contents);}
console.log(process.argv.includes('--check')?'HTML/SVG coinciden con el motor y renderer fuente.':'Construidos HTML autónomo y SVG desde la misma fuente física.');
