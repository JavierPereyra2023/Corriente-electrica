import http from 'node:http';
import {readFile} from 'node:fs/promises';
const root=new URL('../../../',import.meta.url);
const routes={
  '/':'assets/potencia-energia/index.html',
  '/assets/potencia-energia/':'assets/potencia-energia/index.html',
  '/assets/potencia-energia/index.html':'assets/potencia-energia/index.html',
  '/assets/potencia-energia/infografia-potencia-energia-1080p.mp4':'assets/potencia-energia/infografia-potencia-energia-1080p.mp4',
  '/assets/potencia-energia/infografia-potencia-energia.gif':'assets/potencia-energia/infografia-potencia-energia.gif',
  '/assets/potencia-energia/infografia-potencia-energia.png':'assets/potencia-energia/infografia-potencia-energia.png',
  '/assets/potencia-energia/potencia-energia-circuito.mp4':'assets/potencia-energia/potencia-energia-circuito.mp4',
  '/assets/potencia-energia/potencia-energia-poster.png':'assets/potencia-energia/potencia-energia-poster.png',
  '/clases/potencia-electrica.html':'clases/potencia-electrica.html',
  '/assets/circuito_simple.png':'assets/circuito_simple.png',
  '/assets/watt.jpg':'assets/watt.jpg',
};
const mime={html:'text/html; charset=utf-8',mp4:'video/mp4',png:'image/png',jpg:'image/jpeg',gif:'image/gif'};
http.createServer(async(req,res)=>{
  const key=new URL(req.url,'http://127.0.0.1').pathname;
  const file=routes[key];
  if(!file){res.writeHead(404);res.end('No encontrado');return;}
  try{const data=await readFile(new URL(file,root));res.writeHead(200,{'Content-Type':mime[file.split('.').pop()],'Cache-Control':'no-store'});res.end(data);}
  catch{res.writeHead(404);res.end('Archivo todavía no generado');}
}).listen(3124,'127.0.0.1',()=>console.log('Infografía: http://127.0.0.1:3124/assets/potencia-energia/'));
