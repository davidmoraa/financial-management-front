# Dashboard Summary Frontend Integration

## Status

Implemented.

## Goal

Connect the current dashboard view to the real API endpoint:

```text
GET /v1/dashboard/summary?month=YYYY-MM
```

This is Phase 2 of the Financial Command Center. The page keeps the existing visual composition and consumes the backend summary contract through a small adapter.

## What Changed

- Added frontend dashboard summary types compatible with the API contract.
- Updated `dashboardApi` to use the new response shape.
- Added `useDashboardSummary(month)` to load the summary from the API.
- Added an adapter that maps API summary data to the props expected by the existing dashboard cards.
- Updated `DashboardPage` to stop deriving dashboard metrics directly from Zustand/Dexie stores.
- Added loading, error and empty states.
- Updated recent movements rendering to support the API summary movement shape.
- Added tests for the dashboard page and adapter.

## Mock/Data Source Cleanup

No runtime mock data was found in the dashboard page during this phase.

The removed runtime dependency was local dashboard composition from:

- `transactionStore`
- `fixedExpenseStore`
- `forecastEngine`

Those remain in the app for offline flows and other screens, but the dashboard summary now comes from the API endpoint.

## Primary Files

- `src/pages/DashboardPage.tsx`
- `src/hooks/useDashboardSummary.ts`
- `src/services/dashboardApi.ts`
- `src/types/dashboard.ts`
- `src/lib/dashboard/dashboardSummaryAdapter.ts`
- `src/components/dashboard/RecentTransactions.tsx`

## Database Impact

None.

## Procedures Executed

None.

## Verification

```bash
npm test
npm run build
```

Both passed.

## Phase 3 Pending

- Redesign the dashboard composition around recommended action, spending power and next fixed expense.
- Decide whether dashboard snapshots should be cached in IndexedDB for richer offline reads.
- Add category budget support once the API has per-category budget data.
