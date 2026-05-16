# Project Tracking Standards

## Objetivo

Mantener el mismo nivel de trazabilidad usado en Jomi Matcha:

- Cada feature relevante debe tener un documento propio.
- Cada cambio de base de datos debe quedar en bitácora.
- Cada procedimiento ejecutado en base de datos debe registrarse con fecha, motivo y SQL.
- Si una feature no toca base de datos, también debe decirlo explícitamente.

## Documentos obligatorios por feature

Para cada `feature/*`, `fix/*` relevante o `hotfix/*`, crear un documento en:

```txt
docs/features/YYYY-MM-DD-nombre-de-feature.md
```

El documento debe incluir:

- Status
- Goal
- What Changed
- Primary files
- Impacto en base de datos
- Procedimientos ejecutados en base de datos
- Why This Exists
- Behavior After This Feature
- Known Boundaries
- Follow-up Candidates
- Verification

## Logs obligatorios

Cada feature debe actualizar:

```txt
docs/features/FEATURES_LOG.md
```

Si toca persistencia remota, Supabase, SQL, políticas, triggers, funciones o migraciones, también debe actualizar:

```txt
docs/db/modifications_log.md
docs/db/procedures_log.md
docs/db/schema.md
```

## Reglas de base de datos

- No ejecutar SQL sin registrarlo.
- No cambiar tablas, columnas, enums, políticas RLS, triggers o funciones sin documentar:
  - motivo
  - SQL ejecutado
  - archivo fuente si existe migración
  - fecha
  - verificación
- Si una operación se ejecuta manualmente en consola, debe copiarse tal cual en `docs/db/procedures_log.md`.
- Si no hubo cambios de esquema, documentar `Sin cambio de esquema`.
- Cuando exista backend o Supabase, `docs/db/schema.md` será la referencia del esquema activo.

## Formato de commits

Usar Conventional Commits:

```txt
docs: add project tracking standards
docs: document offline-first PWA feature
docs: update database modification log
feat: add transaction budgets
fix: preserve pending sync queue on reload
```

## Checklist antes de cerrar una feature

- [ ] Documento de feature creado o actualizado.
- [ ] `FEATURES_LOG.md` actualizado.
- [ ] Impacto en BD documentado.
- [ ] Procedimientos SQL ejecutados documentados.
- [ ] `docs/db/schema.md` actualizado si cambió el esquema.
- [ ] `npm test` ejecutado si hay lógica cubierta por tests.
- [ ] `npm run build` limpio.
