# Potencia y energía: tablero de dos pilas

Entrega principal: **infografía de una sola lámina animada**, descargable en MP4 (1920 × 1080, 30 fps) y GIF (1280 × 720, 15 fps). Duración: 20 s; ciclo cerrado con diez segundos de funcionamiento y reinicio explícito de la medición. Composición: `InfografiaPotenciaEnergia`.

Archivos finales: `../../assets/potencia-energia/infografia-potencia-energia-1080p.mp4` y `infografia-potencia-energia.gif`. El GIF lleva repetición infinita; para repetir el MP4 hay que activar el bucle en el reproductor. El archivo sin el sufijo `1080p` es la exportación intermedia de Remotion; la versión final conserva el video sin recodificar y retira la pista de audio silenciosa.

Se conserva como material complementario la secuencia didáctica de 72 s y la guía web. Todas las ilustraciones y fórmulas son vectores/texto; no hay recursos remotos, APIs de imágenes ni voz sintética.

## Archivos

- `src/scene.mjs`: dibujo, referencias, contenido y modelo temporal compartidos.
- `src/index.jsx`: composiciones de Remotion.
- `scripts/build-web.mjs`: genera el reproductor independiente con controles y guía de armado en `../../assets/potencia-energia/index.html`.
- `../../clases/potencia-electrica.html`: apunte al que acompaña.

## Comandos desde esta carpeta

```powershell
npm.cmd run build:web
npm.cmd run studio
npm.cmd run still -- --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"
npm.cmd run render -- --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

La vista previa imprime su URL local. La exportación H.264 usa 4 procesos para acotar consumo de recursos. La composición vertical se llama `PotenciaEnergiaVertical`; se puede elegir en Studio y renderizar con la CLI de Remotion.

## Contrato didáctico y temporal

La lámina principal mantiene todas las fórmulas a la vista. La llave cierra de 2 a 2,6 s, el foco funciona de 2,6 a 12,6 s y transforma 6 J; al abrir conserva ese registro. A los 18 s aparece «Nueva medición desde cero» y a los 19 s reinicia el contador. La equivalencia de una hora en kWh es un cálculo de referencia permanente, independiente del contador de diez segundos.

La siguiente secuencia corresponde al material complementario de 72 s:

1. 0–9 s: tablero y piezas numeradas.
2. 9–20 s: la llave gira entre 10–11 s y hace contacto al llegar a 11 s. Corriente convencional del + al − por el circuito externo.
3. 20–30 s: ejemplo ideal, 3 V y 0,20 A estables dan 0,60 W. No inferir esa corriente a partir de las pilas.
4. 30–44 s: nueva medición, 10 s reales de encendido entre 30–40 s. Energía de 0 a 6 J; pausa de lectura.
5. 44–60 s: el reloj avanza de 10 s a 3600 s entre 44–56 s con rótulo explícito de aceleración; 4 s de lectura del resultado. No se simula la descarga real de las pilas.
6. 60–72 s: la llave se abre, I y P bajan a cero. La energía acumulada conserva 2160 J = 0,60 Wh = 0,00060 kWh. El breve enfriamiento visual no agrega energía eléctrica al contador.

En modo libre, el contador integra 0,60 W solo cuando los contactos están cerrados. La llave se anima durante medio segundo. Se puede acelerar el reloj ×60; los valores del modelo son independientes del ritmo de los dibujos de las flechas.

La modulación de brillo es ilustrativa: pilas y contactos estables no producen ese parpadeo. Las ondas naranjas representan radiación infrarroja invisible; conducción y convección se explican en la guía. El foquito es incandescente para 3 V, no un LED conectado directamente.

Los assets generados permanecen dentro de `assets/`. Este trabajo no publica ni despliega el sitio.
