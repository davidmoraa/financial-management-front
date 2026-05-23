# Income Cadence Forecast

## Status

Implemented.

## Goal

Reflect the user's expected income in the dashboard and allow setup by monthly, biweekly or weekly cadence.

## What Changed

- The first setup dialog now asks for expected income per period and cadence.
- The dashboard uses expected monthly income for planning when real income transactions have not been registered yet.
- Monthly balance now uses `max(real income, expected monthly income) - expenses`.
- The income card shows expected income when it is higher than real income captured.
- Added a visual distribution card with CSS pie charts:
  - income vs spending;
  - fixed vs variable spending.
- Settings displays expected income and cadence.

## Primary Files

- `src/components/auth/MonthlyBudgetSetupDialog.tsx`
- `src/components/dashboard/FinancialPieChartsCard.tsx`
- `src/pages/DashboardPage.tsx`
- `src/stores/authStore.ts`
- `src/stores/transactionStore.ts`
- `src/lib/finance/incomeCadence.ts`

## Database Impact

No direct database writes from frontend. The API owns the profile schema and persistence.

Local IndexedDB settings cache now stores:

- `expectedIncomeAmount`
- `incomeCadence`
- `expectedMonthlyIncome`
- `monthlyBudget`

## Procedures Executed

None from frontend.

## Behavior After This Feature

- A user paid monthly can enter the monthly income amount.
- A user paid biweekly can enter the amount per paycheck; the app normalizes it to monthly expectation with `amount * 26 / 12`.
- A user paid weekly can enter the weekly amount; the app normalizes it with `amount * 52 / 12`.
- Real income transactions still count when they exceed the expected value.

## Known Boundaries

- This is single expected income configuration, not multiple income sources.
- Current cycle forecasting by next payday is not implemented yet.
- Pie charts are lightweight CSS charts, not a full analytics module.

## Verification

```bash
npm test
npm run build
```

Both passed.

## Follow-up Candidates

- Add multiple income sources.
- Add current pay-cycle view.
- Add category-level spending breakdown chart.
