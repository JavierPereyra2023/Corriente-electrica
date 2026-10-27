import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {renderLensSVG} from '../src/lentes-geometria.mjs';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = path.resolve(project, '../../assets/lentes');
const source = fs.readFileSync(path.join(project, 'src/lentes-geometria.mjs'), 'utf8').replace(/^export /gm, '');
const htmlPath = path.join(assets, 'trazado-interactivo.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const start = html.indexOf('// Geometría paraxial original.');
const end = html.indexOf('const stage=', start);
if (start < 0 || end < 0) throw new Error('No se encontró el bloque geométrico del reproductor.');
fs.writeFileSync(htmlPath, html.slice(0, start) + source + '\n' + html.slice(end));
for (const [name, kind] of [
  ['rayos-convergente.svg', 'convergente'],
  ['rayos-divergente.svg', 'divergente'],
  ['imagen-convergente.svg', 'convergente'],
  ['imagen-lupa.svg', 'lupa'],
]) fs.writeFileSync(path.join(assets, name), renderLensSVG(kind, 299) + '\n');
console.log('Geometría sincronizada: cuatro SVG y reproductor HTML.');
