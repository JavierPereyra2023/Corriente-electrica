import http from 'node:http';
import {createReadStream, existsSync} from 'node:fs';
import {extname, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const mime = {'.html':'text/html; charset=utf-8','.mp4':'video/mp4','.png':'image/png','.svg':'image/svg+xml','.js':'text/javascript'};
http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  const target = resolve(root, `.${pathname}`);
  if (!target.startsWith(`${root}${sep}`) || !existsSync(target)) { response.writeHead(404); response.end('No encontrado'); return; }
  response.writeHead(200, {'Content-Type': mime[extname(target)] || 'application/octet-stream', 'Cache-Control':'no-store'});
  createReadStream(target).pipe(response);
}).listen(3127, '127.0.0.1', () => console.log('Clase de ondas: http://127.0.0.1:3127/clases/propagacion-de-ondas.html'));
