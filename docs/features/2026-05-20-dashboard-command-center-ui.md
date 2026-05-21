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

### 2. Local pending data consistency

- Dashboard summary now overlays real local IndexedDB records on top of the remote API summary.
- Fixed expense payments created locally count immediately as real expenses in the dashboard while they are still pending sync.
- Paid fixed expenses are excluded from `nextFixedExpense` so they do not keep appearing as pending payments.
- Date-only values such as `2026-05-20` are parsed as local calendar dates to avoid showing the previous day.

### 3. Period views and registration reward

- Added dashboard period views for monthly, current biweekly period and current week.
- Period views prorate expected income and budget, then filter local movements and fixed expense windows to the active range.
- Added a richer transaction save reward animation with amount/category feedback and progress copy.
- Transaction form now clears the amount immediately after a successful save.

### 4. Financial streak incentive model

- Financial streak now calculates from local transaction dates instead of staying fixed at the remote/default value.
- The streak remains visible but marked as at risk when yesterday had activity and today does not.
- Added progressive milestones at 3, 7, 14, 30, 60 and 100 days.
- Added progress-to-next-milestone and days remaining to make the habit more motivating.

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
- `src/components/dashboard/DashboardPeriodSelector.tsx`
- `src/hooks/useDashboardSummary.ts`
- `src/lib/dashboard/dashboardPeriod.ts`
- `src/lib/dashboard/localDashboardSummary.ts`
- `src/lib/formatters.ts`
- `src/components/feedback/SuccessPulse.tsx`
- `src/components/transactions/TransactionForm.tsx`

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
- Unsynced local fixed expense payments are reflected immediately in dashboard metrics and upcoming payment state.
- The user can switch dashboard scope between month, current biweekly period and current week.
- Saving a transaction clears the capture form and shows a more rewarding confirmation animation.
- The financial streak updates from real local records and shows the next milestone to encourage consistent use.
- Desktop uses a two-column grid after the hero.
- Mobile uses a single stacked column without horizontal overflow.
- New users see a real empty state instead of demo data.

## Known Boundaries

- This phase does not add offline dashboard snapshot caching.
- Category budget quality depends on the backend summary contract.
- The previous dashboard adapter remains available for tests and compatibility, but `DashboardPage` now renders directly from `DashboardSummary`.
- The dashboard still needs a product decision for how visibly to label summaries that include unsynced local records.

## Follow-up Candidates

- Add Playwright viewport checks for mobile overflow.
- Add richer category budget controls once the backend exposes per-category budgets.
- Cache the latest dashboard summary in IndexedDB for a stronger offline read experience.

## Verification

```bash
npm test
npm run build
```
