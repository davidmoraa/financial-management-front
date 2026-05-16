# Fixed Expenses Forecast

## Status
- Branch: `feature/fixed-expenses-forecast`
- Date: `2026-05-16`
- State: implemented.

## Goal

Agregar gastos fijos mensuales offline-first, ocurrencias pagadas/omitidas y forecast mensual sin que el frontend escriba directo en PostgreSQL.

## What Changed

### 1. Local persistence
- Added IndexedDB tables:
  - `fixedExpenses`
  - `fixedExpenseOccurrences`
- Extended `syncQueue` entities:
  - `fixed_expense`
  - `fixed_expense_occurrence`

### 2. Offline repositories
- `fixedExpenseRepository`
- `fixedExpenseOccurrenceRepository`

`markFixedExpensePaid` creates:
- one local real transaction
- one local paid occurrence
- pending sync operations for both

### 3. Forecast engine
- Calculates pending fixed expenses
- Avoids double counting paid fixed expenses
- Calculates safe daily spend
- Emits budget warnings

### 4. UI
- Added `/fixed-expenses`
- Added fixed expense form
- Added fixed expense cards
- Added mark-paid dialog
- Added dashboard forecast cards and warnings

## Remote Database Impact

No SQL is executed from the frontend repo.

Remote migration is owned by sibling API repo:

```txt
../financial-management-api/supabase/migrations/20260516170000_fixed_expenses_forecast.sql
```

## Verification

```bash
npm test
npm run build
```

Current result:
- `npm test`: 11 files, 19 tests passed.
- `npm run build`: passed.
