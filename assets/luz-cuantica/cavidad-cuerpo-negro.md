# Planck y la cavidad de cuerpo negro

Fuente editable: `animaciones/potencia-energia/src/cavidad-cuerpo-negro.jsx`.
Composición: `CavidadCuerpoNegro`, 1200 × 1200, 30 fps, 720 fotogramas (24 s).

Tres etapas de ocho segundos:

1. Un haz entra sin cambiar de dirección al atravesar el orificio. Las reflexiones siguen la geometría de una cavidad rectangular. La opacidad decreciente representa intensidad de un haz; no pérdida gradual de energía de un fotón.
2. Paredes mantenidas a temperatura uniforme emiten radiación propia; algunos rayos salen por el orificio. Los colores son esquemáticos y representan un espectro continuo.
3. Curvas calculadas con la ley de Planck para radiancia por longitud de onda a 3000 K y 5000 K, divididas por una referencia común (máximo a 5000 K). Picos aproximados: 0,966 µm y 0,580 µm. Se usan constantes SI exactas h, c y k; no datos experimentales de la institución.

Fuente conceptual: [OpenStax, radiación de cuerpo negro](https://openstax.org/books/university-physics-volume-3/pages/6-1-blackbody-radiation).

## Retrato

`max-planck.png`, generado con la herramienta integrada Imagegen. Recreación histórica; no fotografía de archivo.

Prompt usado:

Use case: historical-scene. Generate a high quality archival studio portrait recreation of German physicist Max Planck in his mature years circa 1910-1920. Vertical 3:4 bust portrait, head and shoulders, recognizable long narrow face, high bald forehead, neat small moustache, round wire rim spectacles, period dark suit, waistcoat and tie. Quiet dignified expression, photographic realism, warm sepia monochrome, finely detailed skin, soft side lighting, plain subtly mottled warm ivory gray studio background. Elegant historical photographic quality to match textbook scientist portraits. Crop with generous head room, no decorative border, no letters, no signatures, no equations, no watermark. This is a generated historical recreation for a Spanish physics lesson, not an authentic historical photograph.

## Exportación local

Desde `animaciones/potencia-energia`, con dependencias existentes:

```powershell
.\node_modules\.bin\remotion.cmd render src/index.jsx CavidadCuerpoNegro ../../assets/luz-cuantica/cavidad-cuerpo-negro.mp4 --codec=h264 --crf=19 --concurrency=4 --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe" --log=error
.\node_modules\.bin\remotion.cmd still src/index.jsx CavidadCuerpoNegro ../../assets/luz-cuantica/cavidad-cuerpo-negro.png --frame=350 --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe" --log=error
.\node_modules\.bin\remotion.cmd still src/index.jsx CavidadCuerpoNegro ../../assets/luz-cuantica/espectro-cuerpo-negro.png --frame=710 --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe" --log=error
```
