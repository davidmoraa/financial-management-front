# OAuth Social Auth

## Status
- Branch: `feature/oauth-social-auth`
- Date: `2026-05-16`
- State: implemented.

## Goal

Agregar login con Google y Apple validado por la API, permitir vincular proveedores y mantener el modelo offline-first sin borrar datos locales.

## What Changed

### 1. API client and auth store
- Added `src/lib/api/oauthApi.ts`.
- Added browser OAuth helpers for Google and Apple.
- Extended `authStore` with:
  - `profile`
  - `linkedProviders`
  - `loginWithGoogle`
  - `loginWithApple`
  - `linkGoogle`
  - `linkApple`
  - `unlinkProvider`

### 2. Login and register
- Google and Apple are now primary visual actions.
- Email/password remains available as a secondary option.

### 3. Linked accounts UI
- Settings shows Google and Apple connection status.
- The UI disables unlinking the last provider.

### 4. Local data after login
- Added `LocalDataAfterLoginDialog`.
- If local data exists after login, the app offers to upload it to the account through the existing sync flow.
- The app does not delete IndexedDB on login or logout.

### 5. Development seed control
- Development seed data is no longer inserted when an auth token exists.
- IndexedDB remains the local source of truth.

## Remote Database Impact

No SQL is executed from the frontend repo.

Remote migration is owned by sibling API repo:

```txt
../financial-management-api/supabase/migrations/20260516190000_auth_accounts.sql
```

## Verification

```bash
npm test
npm run build
```

Current result:
- `npm test`: 16 files, 25 tests passed.
- `npm run build`: passed.
