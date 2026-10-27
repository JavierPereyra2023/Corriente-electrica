import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {laserGeometry,beamPointAtDistance,LASER_TIMING} from '../src/lentes-laser-geometria.mjs';

const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.resolve(project,'../..');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} difiere de ${b}`);
const geometry=[];
for(const kind of ['convergente','divergente']){
  const g=laserGeometry(kind);
  const [a,b]=g.beams;
  // Intersección independiente de las dos rectas emergentes.
  const crossX=(b.lens.y-a.lens.y+a.slope*a.lens.x-b.slope*b.lens.x)/(a.slope-b.slope);
  const crossY=a.lens.y+(crossX-a.lens.x)*a.slope;
  near(crossX,g.focus.x);near(crossY,g.layout.axisY);
  assert.equal(crossX>g.layout.lensX,kind==='convergente');
  for(const beam of g.beams){
    near(beam.source.y,beam.lens.y);
    assert.ok(beam.source.x<beam.lens.x&&beam.exit.x>beam.lens.x);
    assert.ok(beam.exit.y>=g.layout.minRayY&&beam.exit.y<=g.layout.maxRayY);
    if(kind==='convergente')assert.ok(beam.exit.x>crossX,'Los haces deben continuar después de cruzarse.');
    const end=beamPointAtDistance(beam,beam.totalLength);
    near(end.x,beam.exit.x);near(end.y,beam.exit.y);
    for(let d=0;d<=beam.totalLength;d+=5){
      const p=beamPointAtDistance(beam,d);
      assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
      if(d<=beam.incomingLength)near(p.y,beam.source.y);
      else near(p.y,beam.lens.y+(p.x-beam.lens.x)*beam.slope);
    }
  }
  assert.ok(fs.existsSync(path.join(root,`assets/lentes/video-${kind}.png`)));
  geometry.push({kind,intersection:{x:crossX,y:crossY}});
}
const ffprobe=path.join(project,'node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe');
const video=path.join(root,'assets/lentes/lentes-laser.mp4');
const media=JSON.parse(execFileSync(ffprobe,['-v','error','-show_streams','-show_format','-of','json',video],{encoding:'utf8'}));
const stream=media.streams.find(s=>s.codec_type==='video');
assert.equal(stream.codec_name,'h264');
// FFprobe denomina yuvj420p al 4:2:0 de 8 bits cuando Remotion marca rango completo.
assert.ok(['yuv420p','yuvj420p'].includes(stream.pix_fmt),'Se requiere 4:2:0 de 8 bits para reproducción web.');
assert.equal(stream.bits_per_raw_sample,'8');
assert.equal(stream.width,1536);assert.equal(stream.height,1024);
assert.equal(stream.avg_frame_rate,'30/1');
near(Number(media.format.duration),LASER_TIMING.sceneSeconds*2);
assert.equal(Number(stream.nb_frames),960);
assert.ok(fs.statSync(video).size<40*1024*1024,'Revisar peso para publicar el recurso.');
const html=fs.readFileSync(path.join(root,'clases/lentes.html'),'utf8');
assert.ok(html.includes('src="../assets/lentes/lentes-laser.mp4"'));
assert.ok(html.includes('poster="../assets/lentes/lentes-laser-poster.png"'));
assert.ok(fs.existsSync(path.join(root,'assets/lentes/lentes-laser-poster.png')));
assert.ok(!/<video[^>]*\bautoplay\b/.test(html),'El video debe iniciarse de forma manual.');
console.log(JSON.stringify({geometry,video:{codec:stream.codec_name,pixelFormat:stream.pix_fmt,colorRange:stream.color_range,width:stream.width,height:stream.height,fps:stream.avg_frame_rate,frames:Number(stream.nb_frames),seconds:Number(media.format.duration),bytes:fs.statSync(video).size},integration:'correcta'},null,2));
