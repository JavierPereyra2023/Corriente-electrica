# Laboratorio fotoeléctrico · Clase 15

Infografía animada editable en Remotion. Cuatro escenas de seis segundos: 650 nm con intensidad relativa 1 y 5, seguidas por 450 nm con intensidad 1 y 5. Material hipotético con W = 2,20 eV.

Los fotones se absorben en la superficie. En el modelo de un fotón, solo hay emisión si la energía supera el trabajo de extracción. Las cantidades y trayectorias son esquemáticas; no representan una medición de corriente ni una eficiencia cuántica. La intensidad cambia la frecuencia de llegada de fotones, y la energía cinética máxima se conserva al mantener la longitud de onda.

- Fuente: `animaciones/potencia-energia/src/laboratorio-fotoelectrico.jsx`.
- Composición: `LaboratorioFotoelectrico`, 1200 × 1200, 30 fps, 720 fotogramas.
- Video: `laboratorio-fotoelectrico.mp4`.
- Imagen para impresión: `laboratorio-fotoelectrico.png`, fotograma 615.

Desde `animaciones/potencia-energia`, usando las dependencias existentes:

```powershell
.\node_modules\.bin\remotion.cmd render src/index.jsx LaboratorioFotoelectrico ../../assets/luz-cuantica/laboratorio-fotoelectrico.mp4 --codec=h264 --crf=19 --concurrency=4 --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe" --log=error
.\node_modules\.bin\remotion.cmd still src/index.jsx LaboratorioFotoelectrico ../../assets/luz-cuantica/laboratorio-fotoelectrico.png --frame=615 --browser-executable="C:\Program Files\Google\Chrome\Application\chrome.exe" --log=error
```
