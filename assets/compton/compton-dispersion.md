# Dispersión Compton · recurso editable

Composición `ComptonDispersion` en `animaciones/potencia-energia/src/compton-dispersion.jsx`, registrada en `src/index.jsx`. Configuración: 1920×1080, 30 fps, 720 fotogramas, 24 s, sin audio.

## Lectura y física

0–5 s: fotón de rayos X y electrón inicialmente en reposo, libre o aproximadamente libre.
5–12 s: dispersión a 90°, fotón hacia arriba y electrón abajo/derecha. La rapidez del fotón permanece en c; el recorrido del electrón se amplía ×10 para verlo.
12–18 s: conservación de energía y triángulo vectorial con una misma escala de momento.
18–24 s: gráfico del desplazamiento y comparación de 0°, 90° y 180°.

λ=0,071 nm; λC≈0,00242631 nm; λ′≈0,07342631 nm; p′/p=λ/λ′≈0,966956. Retroceso del electrón ≈44,04° debajo del haz. E≈17,463 keV; E′≈16,886 keV; K≈0,577 keV. La escala espacial y temporal es didáctica; no se representan saltos atómicos ni superficies del fotón.

## Exportación

Los scripts `render:compton` y `still:compton` están disponibles en el proyecto. En este equipo, el FFmpeg incluido en Remotion falla al codificar; se exportan fotogramas con Chrome instalado y se codifican con FFmpeg local:

```powershell
# Desde animaciones/potencia-energia
node_modules\.bin\remotion.cmd render src/index.jsx ComptonDispersion render-frames-compton --sequence --image-format=png --image-sequence-pattern="compton-[frame].[ext]" --muted --concurrency=2 --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

```powershell
# Desde la raíz del repositorio, para una primera exportación
& 'C:\ffmpeg\bin\ffmpeg.exe' -n -framerate 30 -start_number 0 -i 'animaciones/potencia-energia/render-frames-compton/compton-%03d.png' -frames:v 720 -an -c:v libx264 -crf 19 -pix_fmt yuv420p -movflags +faststart 'assets/compton/compton-dispersion.mp4'
Copy-Item -LiteralPath 'animaciones/potencia-energia/render-frames-compton/compton-420.png' -Destination 'assets/compton/compton-dispersion.png'
```

Los fotogramas intermedios están excluidos de Git. No se agregaron dependencias.

Metadatos verificados con ffprobe: H.264, 1920×1080, 30 fps, 720 fotogramas, 24,000 s, formato yuv420p, sin audio. Reproducción comprobada en Chrome.
