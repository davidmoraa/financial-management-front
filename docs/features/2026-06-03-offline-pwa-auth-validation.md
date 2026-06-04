# Offline PWA Auth Validation

## Status

- Branch: `main` (trabajo directo en main — solo tests)
- Base commit: `1e531d1`
- Date: `2026-06-03`
- PR: `merged`
- **Estado:** `Implemented`

---

## Goal

Validar y documentar mediante tests unitarios todos los escenarios posibles de autenticación cuando la PWA se abre sin conexión, asegurando que el usuario nunca sea expulsado a `/login` por tener conexión perdida.

---

## What Changed

### 1. Nuevos tests en `authStore.session.test.ts`

Tres escenarios nuevos que completan la matriz de estados offline:

| Escenario | Resultado esperado |
|---|---|
| Token + sin cache de sesión + offline | `isAuthenticated=true`, sin llamadas a API, token intacto |
| Token + cache vencida (>6h) + offline | `isAuthenticated=true`, user y profile restaurados del cache vencido |
| Sin token + offline | `isAuthenticated=false`, sin llamadas a API |

### 2. Nuevo test en `AuthGuard.test.tsx`

- Valida que `AuthGuard` renderiza el contenido protegido cuando `isAuthenticated=true` aunque `user=null` (caso: token sin cache, app abierta offline).

### Primary files

- `src/stores/authStore.session.test.ts`
- `src/components/auth/AuthGuard.test.tsx`

---

## Impacto en base de datos

### Sin cambio de esquema

- Solo tests — sin cambios de producción ni de esquema.

### Procedimientos ejecutados en base de datos

- Ninguno.

---

## Tests unitarios

### Estado de cobertura

| Capa | Archivo | Tests añadidos | Estado |
|---|---|---|---|
| Front — Store | `stores/authStore.session.test.ts` | 3 nuevos (total 6) | ✅ Passing |
| Front — Component | `components/auth/AuthGuard.test.tsx` | 1 nuevo (total 2) | ✅ Passing |

### Matriz completa de escenarios cubiertos (authStore)

| # | Token | Cache sesión | Online | Resultado |
|---|---|---|---|---|
| 1 | ✅ | ✅ fresca | ❌ | Autenticado, user restaurado, sin API call |
| 2 | ✅ | ✅ fresca | ✅ | Autenticado, sin API call (cache válida) |
| 3 | ✅ | ✅ vencida | ✅ | Revalida contra API, actualiza cache |
| 4 | ✅ | ❌ | ❌ | Autenticado, `user=null`, sin API call |
| 5 | ✅ | ✅ vencida | ❌ | Autenticado, user del cache vencido, sin API call |
| 6 | ❌ | ❌ | ❌ | No autenticado, sin API call |

### Comandos para correr tests

```bash
npm test -- --reporter=verbose authStore.session
npm test -- --reporter=verbose AuthGuard
```

---

## Feedback del usuario

### Sesión: 2026-06-03

**Estado de la funcionalidad según el usuario:** `Funciona`

**Observaciones:**
- El comportamiento offline ya estaba implementado correctamente en producción.
- Esta sesión añadió la cobertura de tests para documentar y garantizar ese comportamiento.

---

## Why This Exists

La PWA debe ser usable sin conexión. El flujo de autenticación offline era correcto en código pero no estaba cubierto por tests — cualquier refactor futuro del `authStore` podría haber roto ese comportamiento sin aviso.

---

## Behavior After This Feature

- La suite de tests garantiza que ninguna modificación futura rompa la autenticación offline.
- El `AuthGuard` permite el acceso con token válido independientemente de si hay cache de sesión.
- El `authStore` nunca llama a la API cuando `navigator.onLine === false`.

---

## Known Boundaries

- El escenario "token sin cache + offline" deja `user=null` en memoria hasta la siguiente conexión.
- Los componentes que lean `user?.displayName` mostrarán vacío en ese escenario edge.

---

## Follow-up Candidates

- Mostrar un indicador UI sutil cuando `user=null` (modo offline sin perfil cargado).
- Test de integración E2E con Playwright verificando el flujo PWA completo.

---

## Verification

```bash
npm test
```
