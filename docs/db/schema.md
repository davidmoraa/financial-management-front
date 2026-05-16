# Database Schema Reference

## Status

No remote database schema is connected yet.

## Current persistence

The app currently uses IndexedDB for local offline-first persistence.

Local database:

```txt
financial-management-offline-db
```

Local tables:

```txt
transactions
categories
settings
syncQueue
```

## Do not drift

When Supabase or a backend is introduced:

- Document the live remote schema here.
- Do not add, remove or rename tables/columns without updating this file.
- Record every SQL procedure in `docs/db/procedures_log.md`.
- Record every schema-impacting change in `docs/db/modifications_log.md`.
