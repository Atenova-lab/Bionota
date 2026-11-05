# BioNota · Bodygram a Historia Clínica

Aplicación web de apoyo documental para profesionales de Endocrinología y Nutrición Clínica.

Convierte informes PDF de Bodygram HBO en notas de parámetros por línea listas para revisar y copiar en la historia clínica. Incluye plantillas editables por profesional, notas evolutivas por fecha, puntos de corte opcionales (sin cortes del IMC), Hydragram (TBW/FFM), OCR local y compatibilidad Android.

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
```

**Versión del código:** BioNota v1.4.
## Nota evolutiva

1. Carga un informe o introduce los valores, revisa los datos y asigna la fecha de la medición.
2. Pulsa **Añadir a evolución** y repite con las siguientes visitas del mismo paciente.
3. Selecciona **Evolutivo** para obtener valores en orden cronológico, por ejemplo `SMI: 6,9 → 7 → 8,1 kg/m²`.
4. Puedes editar o retirar visitas. Los parámetros sin valor se omiten; no se rellenan datos ausentes. BCM/h utiliza la talla correspondiente a cada visita.
5. Usa **Vaciar evolución** antes de comenzar con otro paciente. Las mediciones permanecen solo en memoria y desaparecen al recargar o cerrar la pestaña.
