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

## [2026-05-16] OAuth social auth

**Environment:**
- Frontend repo plus sibling API repo
- Linked Supabase project

**Reason:**
- Execute the API-owned migration required for OAuth account linking.

**SQL executed:**

```sql
-- No SQL executed from the frontend repo.
-- The migration was executed from the sibling API repo with Supabase CLI.
```

**Source migration:**

```txt
../financial-management-api/src/db/migrations/003_auth_accounts.sql
../financial-management-api/supabase/migrations/20260516190000_auth_accounts.sql
```

**Procedure executed from API repo:**

```bash
supabase db push --dry-run --include-all
supabase db push --include-all
supabase migration list
supabase db lint --linked
```

**Result:**
- Migration `20260516190000_auth_accounts.sql` applied successfully.
- Supabase DB lint reported no schema errors.
- Frontend still does not connect directly to PostgreSQL or Supabase.

## [2026-05-16] Fixed expenses forecast

**Environment:**
- Frontend repo plus sibling API repo
- Linked Supabase project

**Reason:**
- Execute the API-owned migration required for fixed expenses, occurrences and forecast sync.

**SQL executed:**

```sql
-- No SQL executed from the frontend repo.
-- The migration was executed from the sibling API repo with Supabase CLI.
```

**Source migration:**

```txt
../financial-management-api/src/db/migrations/002_fixed_expenses.sql
../financial-management-api/supabase/migrations/20260516170000_fixed_expenses_forecast.sql
```

**Procedure executed from API repo:**

```bash
supabase db push --dry-run --include-all
supabase db push --include-all
supabase migration list
supabase db lint --linked
```

**Result:**
- Migration `20260516170000_fixed_expenses_forecast.sql` applied successfully.
- Supabase DB lint reported no schema errors.
- Frontend still does not connect directly to PostgreSQL or Supabase.

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
- Linked Supabase project

**Reason:**
- Prepare and execute the Node.js API migration required for PostgreSQL sync.

**SQL executed:**

```sql
-- No SQL executed from the frontend repo.
-- The migration was executed from the sibling API repo with Supabase CLI.
```

**Source migration prepared:**

```txt
../financial-management-api/src/db/migrations/001_initial_schema.sql
../financial-management-api/supabase/migrations/20260516150000_initial_schema.sql
```

**Procedure executed from API repo:**

```bash
supabase db push --include-all
supabase migration list
```

**Result:**
- Migration `20260516150000_initial_schema.sql` applied successfully.
- Frontend still does not connect directly to PostgreSQL or Supabase.
