# Infografía mejorada de Maxwell a Einstein

Fuente editable: `animaciones/potencia-energia/src/modelos-luz-visual.jsx`.
Composición `ModelosLuzCuantica`: 1200 × 1200, 30 fps, 720 fotogramas (24 s).

La nueva versión apila las comparaciones para que ambos casos se vean en celular. Se mantienen los colores de las imágenes de la clase y se usan planos de campo, iluminación de la placa, haces tenues y símbolos diferenciados. La emisión se inicia después de cada absorción en la cara iluminada del metal. Las cantidades y trayectorias son esquemáticas; no representan una medición ni eficiencia cuántica.

Tres escenas de ocho segundos: campos de Maxwell, umbral de Einstein e intensidad a frecuencia fija. La imagen para impresión corresponde al fotograma 615. Los fotogramas auxiliares `modelos-luz-campos.png` y `modelos-luz-umbral.png` documentan las otras dos etapas.

La fuente anterior `modelos-luz-cuantica.jsx` se conserva como antecedente. La composición del índice utiliza la nueva fuente.

Exportación desde `animaciones/potencia-energia`:

```powershell
npm.cmd run render:luz-cuantica -- --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe" --log=error
npm.cmd run still:luz-cuantica -- --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe" --log=error
```
