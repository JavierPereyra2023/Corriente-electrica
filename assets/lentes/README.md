# Clase 18 · Lentes

`lentes-aula.png`: ilustración de contexto creada con la herramienta integrada Imagegen. No es una fotografía de un experimento ni un trazado óptico de precisión. No se usaron claves ni scripts de API de imágenes.

Prompt de la imagen: ilustración editorial de un banco óptico de aula secundaria argentina, horizontal 3:2, luz suave, tonos marfil, azul oscuro y dorado; lente biconvexa gruesa en el centro y lente bicóncava delgada en el centro, separadas en soportes; una lupa sobre un dibujo de una hoja. Materiales de vidrio realistas, sin personas, sin láser, sin concentración de luz solar, sin etiquetas, fórmulas, logotipos ni diagramas de rayos.

Los cuatro SVG son dibujos vectoriales originales calculados con el modelo paraxial de lente delgada. Se dibujan rayos reales continuos y prolongaciones discontinuas. Las coordenadas son unidades del dibujo, no medidas de un experimento. El color identifica cada construcción, no distintas frecuencias de luz.

`trazado-interactivo.html` funciona localmente sin dependencias ni conexión: tres casos, cinco etapas y controles manuales. Comparte la geometría con la composición Remotion `LentesRayos` de 30 segundos, registrada en `animaciones/potencia-energia/src/index.jsx`. La sucesión de trazos es un recurso didáctico, no el tiempo de viaje de la luz.

Fuente geométrica: `animaciones/potencia-energia/src/lentes-geometria.mjs`. Después de editarla, sincronizar los SVG y el reproductor desde la raíz del repositorio:

```powershell
node animaciones/potencia-energia/scripts/build-lentes.mjs
```

La clase está en `clases/lentes.html`. Las fórmulas de esa clase utilizan MathJax desde el CDN habitual del proyecto. No se exportó MP4; la composición queda editable y el trazado se puede reproducir directamente en el HTML.

Autoría del material: Sistemas Multi Física - Profesor Javier Pereyra.
