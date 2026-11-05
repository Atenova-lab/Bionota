# BioNota · Bodygram a Historia Clínica

Aplicación web de apoyo documental para profesionales de Endocrinología y Nutrición Clínica.

Convierte informes PDF de Bodygram HBO en notas de parámetros por línea listas para revisar y copiar en la historia clínica. Incluye plantillas editables por profesional, detección automática de tablas históricas y notas evolutivas por fecha y hora, puntos de corte opcionales (sin cortes del IMC), Hydragram (TBW/FFM), OCR local y compatibilidad Android.

## Privacidad y seguridad

- El procesamiento del PDF ocurre en el navegador, sin enviar informes a servidores.
- Este repositorio no incluye informes reales ni datos identificativos de pacientes.
- Antes de incorporar la nota a la HC, un profesional debe contrastar valores y unidades con el PDF original.
- Los puntos de corte son referencias orientativas, no diagnósticos automáticos.

## Ejecución

El sitio es estático. Sirve el directorio `dist/` con un servidor HTTP local o un alojamiento web con soporte para archivos WASM.

La versión alojada en ChatGPT Sites se publica desde el mismo código estático.

## Pruebas

```bash
node tests/mobile-pdf-compat.cjs
node tests/parser-smoke.cjs
node tests/template-editor-smoke.cjs
node tests/pwa-smoke.cjs
node tests/evolution.cjs
node tests/history.cjs
```

**Versión del código:** BioNota v1.4.
## Nota evolutiva automática

Al cargar un informe Bodygram con la tabla «Análisis de composición corporal de la base de datos», se detectan sus filas y columnas y se leen sus mediciones automáticamente. La nota cambia a **Evolutivo**, incluye los parámetros históricos disponibles y los ordena por fecha y hora. Dos mediciones del mismo día se conservan si tienen horas diferentes.

Los valores se escriben por parámetro con flechas: `SMI: 6,9 → 7 → 8,1 kg/m²`. Los parámetros presentes únicamente en el resultado actual aparecen como valores únicos. Los datos ausentes o dudosos no se completan ni se desplazan a otra fecha. La lectura de celdas dudosas se repite conservando su posición; las relaciones impresas ayudan a comprobar decimales, sin inventar valores.

Se pueden editar y eliminar mediciones. La entrada manual queda como opción secundaria. Los registros viven solo en memoria; no se guardan al recargar o cerrar. Cargar un nuevo PDF sustituye el histórico anterior para no mezclar pacientes. El PDF de prueba y sus datos no forman parte del repositorio.
