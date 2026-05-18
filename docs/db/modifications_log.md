# Database Modification Log

This document tracks all changes made to database schema or persistence behavior, including the executed SQL queries and the rationale behind them.

## [2026-05-18] Income Cadence Forecast

**Status:**
- Frontend does not execute SQL
- Frontend does not connect directly to PostgreSQL or Supabase
- Local IndexedDB settings cache extended
- Remote migration executed from sibling API repo

**Rationale:**
- Dashboard planning needs expected income even before the user records a real income transaction.
- Users can receive income monthly, biweekly or weekly.

**Frontend persistence impact:**
- No IndexedDB version change
- Added local `settings` keys:
  - `expectedIncomeAmount`
  - `incomeCadence`
  - `expectedMonthlyIncome`
- `monthlyBudget` remains a local planning value derived from income cadence.

**Remote schema impact:**
- See API repo docs:
  - `../financial-management-api/docs/db/schema.md`
  - `../financial-management-api/docs/db/modifications_log.md`
  - `../financial-management-api/docs/db/procedures_log.md`

**Procedures executed:**
- None from the frontend repo
- Supabase migration executed from `../financial-management-api`

**Remote migration executed from API repo:**

```txt
../financial-management-api/supabase/migrations/20260518193000_income_cadence_profile.sql
```

## [2026-05-16] OAuth Social Auth

**Status:**
- Frontend does not execute SQL
- Frontend does not connect directly to PostgreSQL or Supabase
- Auth token still persists in localStorage for MVP
- Remote migration executed from sibling API repo

**Rationale:**
- The API owns provider token validation and internal JWT issuance.
- Local IndexedDB data must survive login/logout.
- The frontend needs provider linking UI without treating email as primary identity.

**Frontend persistence impact:**
- No IndexedDB schema change
- No financial data deletion on login/logout
- Development seed data is skipped when an auth token exists

**Remote schema impact:**
- See API repo docs:
  - `../financial-management-api/docs/db/schema.md`
  - `../financial-management-api/docs/db/modifications_log.md`
  - `../financial-management-api/docs/db/procedures_log.md`

**Procedures executed:**
- None from the frontend repo
- Supabase migration executed from `../financial-management-api`

**Remote migration executed from API repo:**

```txt
../financial-management-api/supabase/migrations/20260516190000_auth_accounts.sql
```

## [2026-05-16] Fixed Expenses Forecast

**Status:**
- Frontend does not execute SQL
- Frontend does not connect directly to PostgreSQL or Supabase
- Local IndexedDB schema extended
- Remote migration executed from sibling API repo

**Rationale:**
- Fixed monthly commitments must exist separately from real transactions.
- The app must support paid/skipped monthly occurrences offline.
- Forecast and warnings must work from local data first.

**Frontend schema impact:**
- IndexedDB database `financial-management-offline-db` upgraded to version 2
- Added local tables:
  - `fixedExpenses`
  - `fixedExpenseOccurrences`
- Extended local `transactions` with optional:
  - `fixedExpenseId`
  - `fixedExpenseOccurrenceId`
- Extended local `syncQueue` entity support:
  - `fixed_expense`
  - `fixed_expense_occurrence`

**Remote schema impact:**
- See API repo docs:
  - `../financial-management-api/docs/db/schema.md`
  - `../financial-management-api/docs/db/modifications_log.md`
  - `../financial-management-api/docs/db/procedures_log.md`

**Procedures executed:**
- None from the frontend repo
- Supabase migration executed from `../financial-management-api`

**Remote migration executed from API repo:**

```txt
../financial-management-api/supabase/migrations/20260516170000_fixed_expenses_forecast.sql
```

## [2026-05-16] Initial Frontend Foundation

**Status:**
- No remote database connected
- No schema migration executed
- No SQL executed

**Rationale:**
- The initial frontend phase uses mock/local state only.
- Supabase, backend and authentication are intentionally out of scope.

**Schema impact:**
- None

**Procedures executed:**
- None

## [2026-05-16] Offline-First PWA Persistence

**Status:**
- No remote schema migration executed
- No SQL file added
- Local IndexedDB persistence added

**Rationale:**
- Users must be able to register income and expenses without internet.
- The app needs a local queue that can later synchronize with Supabase or a backend.

**Remote schema impact:**
- None
- No Supabase table, column, enum, policy, trigger or function was created, removed or altered.

**Local persistence impact:**
- Added IndexedDB database `financial-management-offline-db`
- Added local tables:
  - `transactions`
  - `categories`
  - `settings`
  - `syncQueue`

**Procedures executed:**
- None against a remote database
- No SQL executed

**Files implementing the persistence behavior:**
- `src/lib/offline/db.ts`
- `src/lib/offline/transactionRepository.ts`
- `src/lib/offline/syncQueueRepository.ts`
- `src/lib/offline/syncEngine.ts`
- `src/stores/transactionStore.ts`

## [2026-05-16] API Sync Foundation

**Status:**
- Frontend does not execute SQL
- Frontend does not connect directly to PostgreSQL or Supabase
- Initial remote schema was executed from the sibling API repo

**API repo:**

```txt
../financial-management-api
```

**Migration source:**

```txt
../financial-management-api/src/db/migrations/001_initial_schema.sql
```

**Frontend schema impact:**
- None

**Remote schema impact:**
- See API repo docs:
  - `../financial-management-api/docs/db/schema.md`
  - `../financial-management-api/docs/db/modifications_log.md`
  - `../financial-management-api/docs/db/procedures_log.md`

**Procedures executed:**
- None from the frontend repo
- Supabase migration executed from `../financial-management-api`

**Remote migration executed from API repo:**

```txt
../financial-management-api/supabase/migrations/20260516150000_initial_schema.sql
```
