# Dashboard Frontend

## Data Source

`DashboardPage` reads from `useDashboardSummary(month, period)`.
The hook fetches `GET /v1/dashboard/summary?month=YYYY-MM` through the authenticated API client and composes it with local IndexedDB data only to reflect pending offline changes.

The dashboard does not import runtime mock data.

## States

The page handles:

- loading
- API error
- empty user with no movements
- users with income only
- users with expenses and no budget
- pending fixed expenses
- missing optional `recommendedAction`
- empty `insights`, `categoriesToWatch`, `recentMovements`
- missing `nextFixedExpense`

## safeToSpendToday

The UI displays `safeToSpendToday` as the amount the user can spend today without leaving the current plan. Negative or non-finite values are rendered as `0` by shared formatters.

## Recommended Action

`RecommendedActionCard` renders the backend-provided action when present.
If it is missing, the card falls back to a safe local action that points to `/new`.

Secondary insights are shown in `FinancialInsightsCard`, capped to three items after the primary action.

## Regression Tests

Run:

```bash
npm test
```

Relevant tests:

- `src/pages/DashboardPage.test.tsx`

The tests cover loading, error, empty state, healthy state, danger recommended action, missing optional dashboard lists and the three-insight display limit.
