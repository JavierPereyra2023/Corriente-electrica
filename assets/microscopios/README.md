# Clase 20 · Microscopios

- Apunte: `../../clases/microscopios.html`.
- Recurso autónomo: `rayos-interactivos.html`. Funciona localmente sin dependencias externas; empieza completo y detenido. Incluye pasos, pausa, reinicio, deslizador y esquema para impresión.
- Geometría común: `../../animaciones/potencia-energia/src/microscopio-geometria.mjs`.
- Composición Remotion: `MicroscopioRayos`, 1400 × 820, 30 fps, 720 fotogramas (24 segundos), sin audio.

## Abrir la composición editable

Desde `animaciones/potencia-energia`, con las dependencias existentes:

```powershell
.\node_modules\.bin\remotion.cmd studio src/microscopio-entry.jsx --no-open --port=4871
```

Abrir `http://localhost:4871/MicroscopioRayos`. No se exportó MP4: el apunte incluye el recurso interactivo autónomo y queda disponible el proyecto editable.

## Modelo óptico

Dos lentes delgadas convergentes en aproximación paraxial. Coordenadas de dibujo, no dimensiones de fabricación: objeto (380,302), objetivo x=460, f=60; imagen real (700,374); ocular x=860, f=200; imagen virtual (60,590). Eje y=320. Las dos trayectorias coinciden en ambas imágenes. No es un diagrama de todos los componentes de un objetivo moderno corregido al infinito.

Las líneas continuas representan rayos y las discontinuas coloreadas sus prolongaciones. El eje discontinuo gris es una referencia. La secuencia anima la construcción del esquema, no el tiempo de viaje de la luz.

## Fuentes y créditos

`fuentes-imagenes.md` y `fotografias-metadata.json` conservan la procedencia de las seis fotografías de instrumentos; `fuentes-historia.md`, las fuentes históricas y la lámina de Hooke. `portada-prompt.md` documenta la ilustración generada con Imagegen. Los archivos de imagen se conservaron sin editar.
