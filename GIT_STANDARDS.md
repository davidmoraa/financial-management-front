# Git Branching Standards — financial-management-front

> **Contexto de deploy:** frontend SPA con Vite. Igual que en Jomi Matcha Front, el `dist/` generado no se commitea. `main` representa lo que debería estar en producción.

## Regla fundamental

> **`main` = producción.** Nunca se integra código roto a `main`.

## Estructura de ramas

```txt
main          ← producción
develop       ← integración y staging
feature/*     ← nuevas funcionalidades (sale de develop, vuelve a develop)
fix/*         ← correcciones no urgentes (sale de develop, vuelve a develop)
hotfix/*      ← correcciones críticas (sale de main, va a main + develop)
docs/*        ← documentación únicamente
chore/*       ← mantenimiento/configuración
```

## Flujo normal

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nombre-descriptivo

npm run dev
npm run build

git add .
git commit -m "feat: descripción del cambio"
git push origin feature/nombre-descriptivo
```

Después:

- PR de `feature/*` o `fix/*` hacia `develop`.
- PR de `develop` hacia `main` cuando el batch esté listo para producción.
- Antes de PR a `main`, `npm run build` debe pasar limpio.

## Flujo hotfix

```bash
git checkout main
git pull origin main
git checkout -b hotfix/descripcion-del-bug

npm run build
git commit -m "fix: descripción del bug"
git push origin hotfix/descripcion-del-bug
```

Después del merge a `main`, sincronizar `develop`.

## Convención de commits

Seguir Conventional Commits:

```txt
feat:     nueva funcionalidad o pantalla
fix:      corrección de bug de UI o lógica
chore:    mantenimiento, configuración o dependencias
docs:     documentación únicamente
refactor: refactor sin cambio de comportamiento
style:    cambios visuales/CSS
test:     agregar o modificar tests
build:    cambios de build
ci:       cambios en CI/CD
```

Ejemplos:

```txt
feat: add transaction capture flow
fix: avoid Zustand derived selector render loop
style: refine monthly balance cards
docs: document frontend foundation
chore: configure Vite build ignores
```

## Documentación

- Decisiones de arquitectura: `docs/architecture/*.md`
- Cambios de modelo de datos: `docs/db/*.md` cuando exista persistencia
- Cambios de producto/UX relevantes: documentar alcance, decisión, implementación y verificación
- Features relevantes: `docs/features/YYYY-MM-DD-nombre-de-feature.md`
- Índice de features: `docs/features/FEATURES_LOG.md`
- Procedimientos SQL ejecutados: `docs/db/procedures_log.md`
- Cambios de esquema o impacto de persistencia: `docs/db/modifications_log.md`

Toda feature debe declarar explícitamente su impacto en base de datos, incluso si es `Sin cambio de esquema`.

## Reglas sobre `dist/`

El `dist/` no se commitea.

Por qué:

- Cambia en cada build.
- No aporta valor al historial.
- La fuente de verdad es `src/` más la configuración de build.

## Checklist antes de PR a `main`

- [ ] La rama parte de `develop` o de `main` si es `hotfix/*`.
- [ ] `npm run build` pasa sin errores.
- [ ] No hay `.env` ni secretos commiteados.
- [ ] `dist/` no está incluido.
- [ ] La PR describe qué cambió y cómo probarlo.
- [ ] La documentación se actualizó si cambió arquitectura, flujo o contrato.
