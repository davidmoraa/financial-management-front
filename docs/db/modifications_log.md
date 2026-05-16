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
