# Daily Spending Envelope UI + Analytics Page

## Status

- Branch: `feature/daily-spending-envelope`
- Base commit: `9ace431`
- Date: `2026-05-28`
- PR: `merged`
- **Estado:** `Implemented`

---

## Goal

Mostrar el "sobre de hoy" en el dashboard — cuánto puede gastar el usuario hoy y cómo afecta los días siguientes — y agregar una página de Analytics con métricas históricas de ingresos y gastos.

---

## What Changed

### 1. Daily Envelope en FinancialStatusHero

- `FinancialStatusHero` muestra el `dailyEnvelope` del summary como protagonista.
- Cuando `spentToday = 0`: muestra "Hoy puedes gastar" con el allowance completo.
- Cuando `remainingToday > 0`: muestra "Hoy te quedan" con el restante del día.
- Cuando `isOverDailyAllowance`: muestra el exceso y el delta de impacto en días siguientes.

### 2. Analytics Page

- Nueva página `AnalyticsPage` en `/analytics`.
- Consume `useAnalyticsSummary()` que llama a `GET /v1/analytics/summary`.
- Muestra `FinancialPieChartsCard` con distribución de gastos fijos vs variables.
- Muestra `FinancialPulseSection` con histórico mensual de ingresos y gastos.
- Maneja estados de loading, error y datos vacíos.

### 3. Hardening del envelope

- `FinancialStatusHero` tolera `dailyEnvelope = undefined` sin lanzar excepciones.
- Los valores numéricos se normalizan a 0 si son `undefined` o `NaN`.

### Primary files

- `src/components/dashboard/FinancialStatusHero.tsx`
- `src/pages/AnalyticsPage.tsx`
- `src/components/dashboard/FinancialPieChartsCard.tsx`
- `src/components/dashboard/FinancialPulseSection.tsx`
- `src/services/analyticsApi.ts`
- `src/hooks/useAnalyticsSummary.ts`

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
| Front — Component | `dashboard/FinancialStatusHero.test.tsx` | 7 tests | ✅ Passing |
| Front — Page | `pages/AnalyticsPage.test.tsx` | incluidos | ✅ Passing |
| Front — Service | `services/analyticsApi.test.ts` | 1 test | ✅ Passing |

### Escenarios cubiertos

- `spentToday = 0` → muestra "Hoy puedes gastar" con el allowance.
- `remainingToday > 0` → `remainingToday` como monto protagonista.
- `remainingToday = 0` sin exceso → muestra "margen agotado".
- `overspentToday > 0` → muestra el exceso con el delta de días siguientes.
- `dailyEnvelope = undefined` → no rompe el componente.
- Página Analytics renderiza gráficas e insights con datos reales.
- Página Analytics renderiza estado de error correctamente.

### Comandos para correr tests

```bash
npm test -- --reporter=verbose FinancialStatusHero
npm test -- --reporter=verbose AnalyticsPage
```

---

## Feedback del usuario

### Sesión: 2026-06-03

**Estado de la funcionalidad según el usuario:** `Pendiente de revisión`

**Observaciones:**
- Feature integrada. Revisión de la UI con el usuario pendiente.

---

## Why This Exists

El dashboard mostraba el disponible diario como un promedio del mes, no como el real de hoy. El sobre cierra esa brecha y hace el dashboard más accionable en el día a día.

---

## Behavior After This Feature

- El hero del dashboard siempre muestra la lectura del día — no el promedio mensual.
- La página de Analytics consolida métricas históricas para tener perspectiva de largo plazo.

---

## Known Boundaries

- La página de Analytics requiere conexión para cargar datos del API.
- No hay vista offline de Analytics.

---

## Follow-up Candidates

- Cache offline del summary de Analytics.
- Filtros por período en Analytics (semanal, quincenal, mensual).

---

## Verification

```bash
npm test
npm run build
```
