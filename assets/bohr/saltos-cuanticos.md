# Saltos cuánticos del hidrógeno

Composición editable: `animaciones/potencia-energia/src/saltos-cuanticos.jsx`.
Registro: `SaltosCuanticosBohr` en `src/index.jsx` del mismo proyecto.
Configuración: 1920 × 1080, 30 fps, 720 fotogramas (24 segundos).

## Secuencia didáctica

1. 0–5 s: estados permitidos y energías del hidrógeno. Escala completa y ampliación de estados excitados.
2. 5–11 s: absorción 2→3 por un átomo inicialmente preparado en n=2. El estado cambia discretamente al absorber el fotón.
3. 11–17 s: transición seleccionada de emisión 3→2. Se emite un nuevo fotón; no se afirma que todos los átomos sigan esa secuencia.
4. 17–24 s: distintas emisiones hacia n=2 y cuatro líneas visibles de Balmer.

El electrón no recorre estados intermedios. Las flechas de energía representan cambios de estado. Los círculos representan el modelo histórico de Bohr, sin escala espacial. Tiempos y colores de representación son didácticos.

Con Eₙ≈−13,6/n² eV y hc≈1240 eV·nm, 3→2 da 1,889 eV y aproximadamente 656,5 nm en vacío. El cierre usa posiciones de referencia en aire: 656,3; 486,1; 434,0; 410,2 nm. La composición distingue ambas convenciones.

## Exportar desde animaciones/potencia-energia

```powershell
npm.cmd run render:bohr -- --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"
npm.cmd run still:bohr -- --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

No requiere dependencias nuevas. El video es silencioso y la página incluye controles, guía de lectura y diagramas estáticos para impresión.

## Exportación verificada en este equipo

El FFmpeg incluido en Remotion no pudo ejecutarse en este entorno. Se exportaron los fotogramas con Remotion y se codificaron con el FFmpeg ya instalado:

```powershell
node_modules\.bin\remotion.cmd render src/index.jsx SaltosCuanticosBohr render-frames-bohr --sequence --image-format=png --image-sequence-pattern="bohr-[frame].[ext]" --muted --concurrency=2 --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

Desde la raíz del repositorio:

```powershell
& 'C:\ffmpeg\bin\ffmpeg.exe' -n -framerate 30 -start_number 0 -i 'animaciones/potencia-energia/render-frames-bohr/bohr-%03d.png' -frames:v 720 -an -c:v libx264 -crf 19 -pix_fmt yuv420p -movflags +faststart 'assets/bohr/saltos-cuanticos.mp4'
Copy-Item -LiteralPath 'animaciones/potencia-energia/render-frames-bohr/bohr-425.png' -Destination 'assets/bohr/saltos-cuanticos.png'
```

Metadatos verificados con ffprobe: H.264, 1920 × 1080, 30 fps, 720 fotogramas, duración 24,000 s, sin pista de audio. Los fotogramas intermedios están excluidos de Git.
