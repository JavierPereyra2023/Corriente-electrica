# Clase 18 · Lentes

`lentes-aula.png`: ilustración de contexto creada con la herramienta integrada Imagegen. No es una fotografía de un experimento ni un trazado óptico de precisión. No se usaron claves ni scripts de API de imágenes.

Prompt de la imagen: ilustración editorial de un banco óptico de aula secundaria argentina, horizontal 3:2, luz suave, tonos marfil, azul oscuro y dorado; lente biconvexa gruesa en el centro y lente bicóncava delgada en el centro, separadas en soportes; una lupa sobre un dibujo de una hoja. Materiales de vidrio realistas, sin personas, sin láser, sin concentración de luz solar, sin etiquetas, fórmulas, logotipos ni diagramas de rayos.

Los cuatro SVG son dibujos vectoriales originales calculados con el modelo paraxial de lente delgada. Se dibujan rayos reales continuos y prolongaciones discontinuas. Las coordenadas son unidades del dibujo, no medidas de un experimento. El color identifica cada construcción, no distintas frecuencias de luz.

`trazado-interactivo.html` funciona localmente sin dependencias ni conexión: tres casos, cinco etapas y controles manuales. Comparte la geometría con la composición Remotion `LentesRayos` de 30 segundos, registrada en `animaciones/potencia-energia/src/index.jsx`. La sucesión de trazos es un recurso didáctico, no el tiempo de viaje de la luz.

Fuente geométrica: `animaciones/potencia-energia/src/lentes-geometria.mjs`. Después de editarla, sincronizar los SVG y el reproductor desde la raíz del repositorio:

```powershell
node animaciones/potencia-energia/scripts/build-lentes.mjs
```

La clase está en `clases/lentes.html`. Las fórmulas de esa clase utilizan MathJax desde el CDN habitual del proyecto. El trazado interactivo se puede reproducir directamente en el HTML.

## Video realista de láseres

`lentes-laser.mp4`: video Remotion de 32 segundos, 1536 × 1024, 30 fps, H.264, píxeles 4:2:0 de 8 bits en rango completo (FFprobe lo identifica como yuvj420p) y sin audio. Presenta una lente convergente y una divergente con dos haces incidentes paralelos, verde y azul. Incluye foco real, foco virtual, eje y prolongaciones geométricas discontinuas. La reproducción en la clase es manual, con controles y modo de pantalla completa. `lentes-laser-poster.png` corresponde al fotograma 420 de la composición; también se utiliza en impresión.

`video-convergente.png` y `video-divergente.png` son fondos fotorrealistas creados con Imagegen, sin rayos incrustados. El segundo se obtuvo editando exclusivamente el perfil de la lente del primero para conservar el registro del montaje. Prompt: fotografía cenital 3:2 de una mesa óptica oscura, lente vertical vista de perfil, dos módulos láser metálicos a la izquierda, indicador verde arriba y azul abajo; sin personas, texto ni haces. Lente inicial biconvexa y variante bicóncava. Las trayectorias y todos los rótulos se calculan y animan en Remotion.

Es una recreación simulada, no una grabación de laboratorio. Se usa el modelo de lente delgada sin dispersión cromática: el foco común para ambos colores es una idealización, no una medición de vidrio real. Los haces visibles lateralmente y el trazado por etapas son recursos didácticos. Las coordenadas son píxeles de la imagen, no medidas físicas. Las fuentes se registran en (368, 309) y (368, 550), el centro en (790, 447), y la distancia focal del modelo vale +560 o −560 píxeles.

Fuentes editables: `src/lentes-laser.jsx` y `src/lentes-laser-geometria.mjs` dentro de `animaciones/potencia-energia`. Usar `npm.cmd run studio:lentes`, `npm.cmd run render:lentes-laser`, `npm.cmd run still:lentes-laser` y `npm.cmd run check:lentes-laser` desde esa carpeta. Estas tareas reutilizan las dependencias existentes y el directorio `assets/` como directorio público; no requieren nuevas instalaciones ni claves. Para el render de esta entrega se indicó además `--browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe"`.

La verificación comprueba la intersección de ambas rectas emergentes (real o prolongada), alineación de los haces incidentes, continuidad después del foco real, límites del encuadre, resolución, codec, duración, número de cuadros y referencia desde la clase. El video completo también se decodificó con FFmpeg y se revisó en Chrome.

Autoría del material: Sistemas Multi Física - Profesor Javier Pereyra.
