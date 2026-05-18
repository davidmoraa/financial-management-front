# Git Branching Standards — financial-management-front

## Regla fundamental

`main` representa el frontend listo para producción. No se integra a `main` código que no compile o que rompa login, offline-first, PWA, IndexedDB o navegación principal.

## Estructura de ramas

```txt
main          <- producción / production-ready
develop       <- integración y staging local
feature/*     <- nuevas funcionalidades, sale de develop y vuelve a develop
fix/*         <- correcciones no urgentes, sale de develop y vuelve a develop
hotfix/*      <- correcciones críticas, sale de main y vuelve a main + develop
docs/*        <- documentación/proceso cuando no cambia runtime
```

## Flujo normal

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nombre-descriptivo

npm test
npm run build

git push origin feature/nombre-descriptivo
```

Integración esperada:

```txt
feature/* -> develop -> main
```

`develop` debe recibir features ya verificadas. `main` recibe batches completos listos para release.

## Convención de commits

Usar Conventional Commits:

```txt
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación únicamente
test: pruebas
refactor: cambio interno sin cambio funcional
style: ajustes visuales
chore: mantenimiento
build: cambios de build/config
```

## Tracking obligatorio

Cada feature relevante debe actualizar:

```txt
docs/features/YYYY-MM-DD-nombre-de-feature.md
docs/features/FEATURES_LOG.md
```

Si toca persistencia, IndexedDB, syncQueue, API contract o base remota, documentar el impacto aunque no haya SQL en frontend.

## Build y deploy

El `dist/` del frontend no se commitea. Está en `.gitignore`.

Antes de integrar a `main`:

```bash
npm test
npm run build
```

## Variables de entorno

Nunca commitear `.env` con valores reales. Mantener solo ejemplos seguros.

Variables esperadas:

```txt
VITE_API_BASE_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Checklist antes de cerrar una feature

- [ ] Documento de feature creado o actualizado.
- [ ] `FEATURES_LOG.md` actualizado.
- [ ] Sin mocks como fuente runtime.
- [ ] `npm test` pasa.
- [ ] `npm run build` pasa.
- [ ] No hay datos sensibles en commits.
- [ ] No se revierte trabajo no relacionado.
