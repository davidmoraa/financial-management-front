# Database Modification Log

This document tracks all changes made to database schema or persistence behavior, including the executed SQL queries and the rationale behind them.

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
