# Feature Tracking

Este directorio lleva el registro de features trabajadas en el proyecto.

## Convención

Un documento por feature:

```txt
docs/features/YYYY-MM-DD-nombre-de-feature.md
```

Mantener también el índice:

```txt
docs/features/FEATURES_LOG.md
```

## Template

```md
# Nombre de Feature

## Status
- Branch: `feature/nombre`
- Base commit: `hash`
- Date: `YYYY-MM-DD`
- PR: `pendiente`

## Goal
Qué problema resuelve esta feature.

## What Changed
### 1. Cambio principal
- Detalle concreto.

Primary files
- `src/...`

## Impacto en base de datos
### Sin cambio de esquema
- Esta feature no agrega migraciones SQL.
- No modifica tablas, columnas, enums, políticas RLS, triggers ni funciones.

O, si sí hubo cambios:

### Cambios de esquema
- Tabla/columna/política afectada.
- Migración o procedimiento asociado.

## Procedimientos ejecutados en base de datos
- Ninguno.

O listar:

```sql
-- SQL ejecutado
```

## Why This Exists
Contexto y razón de negocio/técnica.

## Behavior After This Feature
Comportamiento esperado después del cambio.

## Known Boundaries
Límites conocidos.

## Follow-up Candidates
Trabajo posterior recomendado.

## Verification
```bash
npm test
npm run build
```
```
