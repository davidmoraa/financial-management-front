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
- reduced-motion users

## Daily Envelope

The hero prioritizes `dailyEnvelope` when the backend provides it:

- `remainingToday` is the protagonist while the user is within the daily envelope.
- `overspentToday` is the protagonist when the user exceeds the daily envelope.
- `startingDailyAllowance`, `spentToday`, `remainingToday` and `nextDaysDailyAllowanceAfterTodaySpending` are shown as a compact breakdown.

`safeToSpendToday` remains available for compatibility, simulations and period-level projections. If `dailyEnvelope` is temporarily missing, the hero falls back to `safeToSpendToday` without crashing.

## Recommended Action

`RecommendedActionCard` renders the backend-provided action when present.
If it is missing, the card falls back to a safe local action that points to `/new`.

Secondary insights are shown in `FinancialInsightsCard`, capped to three items after the primary action.

## Habit UX Layer

- `MovementRegisteredFeedback` confirms saves with live-region status copy, registered amount/category and a short projection update.
- `FinancialClarityBadge` summarizes whether the user's records are updated today.
- `DashboardSkeleton` replaces static loading blocks with a calm reduced-motion-aware loading state.
- `MonthlyProgressMicrocopy` turns budget status into brief, actionable habit copy.

The experience avoids sound, heavy celebration effects and game-like badges.

## Regression Tests

Run:

```bash
npm test
```

Relevant tests:

- `src/pages/DashboardPage.test.tsx`
- `src/components/dashboard/FinancialStatusHero.test.tsx`
- `src/components/feedback/MovementRegisteredFeedback.test.tsx`

The tests cover loading, error, empty state, healthy state, danger recommended action, missing optional dashboard lists and the three-insight display limit.
