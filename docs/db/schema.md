# Database Schema Reference

## Status

Remote PostgreSQL schema is owned by the sibling API repo. The frontend does not execute SQL and does not connect directly to PostgreSQL or Supabase.

## Current persistence

The app currently uses IndexedDB for local offline-first persistence.

Local database:

```txt
financial-management-offline-db
```

Local tables:

```txt
transactions
fixedExpenses
fixedExpenseOccurrences
categories
settings
syncQueue
```

Important local `settings` keys:

```txt
monthlyBudget
expectedIncomeAmount
incomeCadence
expectedMonthlyIncome
currency
deviceId
lastPulledAt
currentUserId
```

Remote schema reference:

```txt
../financial-management-api/docs/db/schema.md
```

## Do not drift

When Supabase or a backend is introduced:

- Document the live remote schema here.
- Do not add, remove or rename tables/columns without updating this file.
- Record every SQL procedure in `docs/db/procedures_log.md`.
- Record every schema-impacting change in `docs/db/modifications_log.md`.
