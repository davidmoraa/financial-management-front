# Database Procedures Log

This document tracks every database procedure or SQL statement executed manually or through a migration.

## Rule

If SQL is executed, it must be recorded here.

Required fields:

- Date
- Environment
- Operator
- Reason
- Source file or console/manual execution
- SQL executed
- Verification query/result
- Rollback notes if applicable

## [2026-05-16] No remote database procedures executed

**Environment:**
- Local frontend only

**Reason:**
- The project is still in offline-first frontend setup.
- Supabase/backend are not connected yet.

**SQL executed:**

```sql
-- None
```

**Verification:**
- No remote database exists for this project phase.

## [2026-05-16] API sync foundation

**Environment:**
- Frontend repo plus sibling API repo

**Reason:**
- Prepare Node.js API and migration for future PostgreSQL sync.

**SQL executed:**

```sql
-- None executed against a live database in this work session.
```

**Source migration prepared:**

```txt
../financial-management-api/src/db/migrations/001_initial_schema.sql
```
