# Dashboard Command Center UI

## Status

- Branch: `feature/dashboard-command-center-ui`
- Date: `2026-05-20`
- PR: `pendiente`

## Goal

Redesign the main dashboard into the Financial Command Center while keeping the current Money Flux identity and consuming real data from `useDashboardSummary(month)`.

## What Changed

### 1. Command center composition

- Replaced the old dashboard card composition with a hero-first command center layout.
- Kept the primary CTA as `Nuevo movimiento`.
- Added loading, error and empty states that do not depend on mock data.
- Preserved the existing global shell, sidebar and mobile dock.

Primary files

- `src/pages/DashboardPage.tsx`
- `src/components/dashboard/DashboardHeader.tsx`
- `src/components/dashboard/FinancialStatusHero.tsx`
- `src/components/dashboard/SafeToSpendCard.tsx`
- `src/components/dashboard/UpcomingFixedExpenseCard.tsx`
- `src/components/dashboard/MonthlyRhythmCard.tsx`
- `src/components/dashboard/RecommendedActionCard.tsx`
- `src/components/dashboard/CashflowProjectionCard.tsx`
- `src/components/dashboard/WatchCategoriesCard.tsx`
- `src/components/dashboard/RecentMovementsCard.tsx`
- `src/components/dashboard/FinancialStreakCard.tsx`

## Impacto en base de datos

### Sin cambio de esquema

- Esta feature no agrega migraciones SQL.
- No modifica tablas, columnas, enums, políticas RLS, triggers ni funciones.

## Procedimientos ejecutados en base de datos

- Ninguno.

## Why This Exists

The dashboard should tell the user how the month is going, what can be spent safely today, which fixed payment is coming next and what concrete action to take.

## Behavior After This Feature

- The dashboard uses the real `DashboardSummary` API contract through `useDashboardSummary`.
- Desktop uses a two-column grid after the hero.
- Mobile uses a single stacked column without horizontal overflow.
- New users see a real empty state instead of demo data.

## Known Boundaries

- This phase does not add offline dashboard snapshot caching.
- Category budget quality depends on the backend summary contract.
- The previous dashboard adapter remains available for tests and compatibility, but `DashboardPage` now renders directly from `DashboardSummary`.

## Follow-up Candidates

- Add Playwright viewport checks for mobile overflow.
- Add richer category budget controls once the backend exposes per-category budgets.
- Cache the latest dashboard summary in IndexedDB for a stronger offline read experience.

## Verification

```bash
npm test
npm run build
```
