# Database Documentation

Este directorio registra el estado y los cambios de base de datos.

## Archivos

- `schema.md`: referencia del esquema remoto activo cuando exista Supabase/backend.
- `modifications_log.md`: cambios de esquema o impactos de features sobre persistencia.
- `procedures_log.md`: SQL/procedimientos ejecutados manualmente o por migración.

## Regla

No ejecutar ni asumir cambios de base de datos sin actualizar estos documentos.

En esta fase el proyecto no tiene base remota conectada. La persistencia financiera vive en IndexedDB.
