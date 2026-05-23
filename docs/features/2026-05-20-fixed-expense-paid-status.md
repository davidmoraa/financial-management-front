# Fixed Expense Paid Status Consistency

## Status

Implemented.

## Goal

Keep fixed expense payment status consistent between the fixed expenses page, dashboard forecast and local offline data after marking a fixed expense as paid.

## What Changed

- Fixed expense local mutations now refresh UI state from IndexedDB immediately instead of re-reading remote data before sync.
- Monthly forecast now treats a fixed expense as paid when a real linked transaction exists for that month, even if the occurrence cache has not refreshed yet.
- Fixed expense cards now receive the forecast status directly, so their badge and action state match dashboard calculations.
- Pending button copy now says `Marcar pagado` until the item is actually paid.

## Primary Files

- `src/stores/fixedExpenseStore.ts`
- `src/lib/finance/forecastEngine.ts`
- `src/components/fixed-expenses/FixedExpenseCard.tsx`
- `src/pages/FixedExpensesPage.tsx`

## Database Impact

None.

## Procedures Executed

None.

## Verification

```bash
npm test
npm run build
```
