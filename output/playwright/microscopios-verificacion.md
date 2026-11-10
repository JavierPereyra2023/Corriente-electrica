# Verificación · Clase 20

Revisión local del 10 de noviembre de 2026, con Playwright CLI y Google Chrome en sesión aislada.

- Clase numerada como 20, después de telescopios (19); enlace agregado al índice.
- Nueve imágenes existentes y cargadas: portada, lámina histórica, seis fotos de instrumentos y esquema estático para impresión.
- Diez preguntas de comprensión respondibles desde el texto, revisadas junto con la historia y los datos técnicos.
- 13 contenedores MathJax renderizados; cero errores MathJax.
- Escritorio de 1280 × 900 y celular de 390 × 844: sin desbordamiento horizontal del documento. Tablas y esquema tienen desplazamiento interno donde corresponde.
- Controles de animación comprobados: reinicio a fotograma 0; reproducción, pausa en fotograma 22; salto final a 719; deslizador a 300; etapa de imagen real a 350.
- Estilos de impresión emulados: recurso interactivo oculto y esquema estático visible. No se comprobó paginación mediante impresión física ni PDF.
- Geometría paraxial comprobada con Node: imagen real en (700,374) y virtual en (60,590); coincidencia exacta de ambos rayos; SVG estático coincide con el renderer común.
- Vista de Remotion abierta y composición `MicroscopioRayos` visible. Fuente editable de 24 segundos; sin exportar MP4.
- Consola de clase y recurso interactivo: sin errores. El índice solicitó un favicon no servido por el servidor de revisión; no afecta la navegación. Studio informó que no pudo consultar actualizaciones por certificado, sin impedir cargar la composición.
- JavaScript y SVG válidos; delimitadores MathJax, enlaces locales, alt, pares de etiquetas y `git diff --check` revisados.

Se corrigieron durante la revisión una etiqueta que cruzaba prolongaciones en el diagrama y el contraste del primer botón de etapas.

Las capturas de esta verificación se llaman `microscopios-*.png`. Los registros de fotografías y licencias están en `assets/microscopios/`.
