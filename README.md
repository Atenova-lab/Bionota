# BioNota · Bodygram a Historia Clínica

Aplicación web de apoyo documental para profesionales de Endocrinología y Nutrición Clínica.

Convierte informes PDF de Bodygram HBO en notas de parámetros por línea listas para revisar y copiar en la historia clínica. Incluye plantillas editables por profesional, puntos de corte informativos, Hydragram (TBW/FFM), OCR local y corrección de compatibilidad Android.

## Privacidad y seguridad

- El procesamiento del PDF ocurre en el navegador, sin enviar informes a servidores.
- Este repositorio no incluye informes reales ni datos identificativos de pacientes.
- Antes de incorporar la nota a la HC, un profesional debe contrastar valores y unidades con el PDF original.
- Los puntos de corte son referencias orientativas, no diagnósticos automáticos.

## Ejecución

El sitio es estático. Sirve el directorio `dist/` con un servidor HTTP local o un alojamiento web con soporte para archivos WASM.

La versión alojada en ChatGPT Sites se mantiene independiente de esta copia de código.

## Pruebas

```bash
node tests/mobile-pdf-compat.cjs
node tests/parser-smoke.cjs
node tests/template-editor-smoke.cjs
node tests/pwa-smoke.cjs
```

**Versión del código:** BioNota v1.4.