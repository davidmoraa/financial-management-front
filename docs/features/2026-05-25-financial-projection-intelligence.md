# Financial Projection Intelligence UI

## Status

- Branch: `feature/financial-projection-intelligence`
- Base commit: `6fdc787`
- Date: `2026-05-25`
- PR: `merged`
- **Estado:** `Implemented`

---

## Goal

Integrar el simulador de proyecciones financieras en el dashboard, permitiendo al usuario evaluar el impacto de gastos extra, ingresos extra, pausas de metas de ahorro y compras con tarjeta antes de realizarlos.

---

## What Changed

### 1. ProjectionSimulatorCard

- Nuevo componente `ProjectionSimulatorCard` en el dashboard.
- Formulario con campos opcionales: monto de gasto, monto de ingreso, tarjeta de crédito, metas a pausar.
- Llama a `projectionsApi.simulateProjection()` y muestra la comparativa before/after de `safeToSpendToday` y `projectedEndOfMonth`.
- Muestra el texto explicativo generado por la API.

### 2. API service y tipos

- `src/services/projectionsApi.ts` — función `simulateProjection(input)`.
- `src/types/projections.ts` — tipos `ProjectionScenario`, `ProjectionSimulationRequest`, `ProjectionSimulation`, `ProjectionSimulationResponse`.

### Primary files

- `src/components/dashboard/ProjectionSimulatorCard.tsx`
- `src/services/projectionsApi.ts`
- `src/types/projections.ts`

---

## Impacto en base de datos

### Sin cambio de esquema

- Esta feature no agrega migraciones SQL ni cambios en IndexedDB.

### Procedimientos ejecutados en base de datos

- Ninguno.

---

## Tests unitarios

### Estado de cobertura

| Capa | Archivo | Tests | Estado |
|---|---|---|---|
| Front — Component | `components/dashboard/ProjectionSimulatorCard.test.tsx` | 3 tests | ✅ Passing |

### Escenarios cubiertos

- **Renderiza el card vacío** sin errores.
- **Muestra resultado de simulación** con valores before/after al recibir respuesta de la API.
- **Muestra estado de carga** mientras la API responde.

### Escenarios no cubiertos

- Validación de montos negativos en el formulario.
- Comportamiento con tarjetas desactivadas.

### Comandos para correr tests

```bash
npm test -- --reporter=verbose ProjectionSimulatorCard
```

---

## Feedback del usuario

### Sesión: 2026-06-03

**Estado de la funcionalidad según el usuario:** `Pendiente de revisión`

**Observaciones:**
- Feature integrada en dashboard. Revisión con el usuario pendiente.

---

## Why This Exists

El dashboard es el lugar natural para tomar decisiones financieras informadas. El simulador cierra el ciclo: el usuario ve su estado actual y puede preguntar "¿y si…?" sin comprometer sus datos reales.

---

## Behavior After This Feature

- El dashboard muestra el `ProjectionSimulatorCard` debajo de los cards principales.
- El usuario puede ingresar un escenario y ver el impacto estimado en segundos.
- Cualquier combinación de campos es válida; los campos no usados se ignoran.

---

## Known Boundaries

- La simulación no guarda estado — cada apertura del card empieza vacía.
- Requiere conexión para llamar a la API de simulación.
- No funciona en modo offline.

---

## Follow-up Candidates

- Caché local de la última simulación para consulta offline.
- Validaciones de UI más ricas (montos máximos, advertencias).

---

## Verification

```bash
npm test
npm run build
```
