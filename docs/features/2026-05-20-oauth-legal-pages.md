# OAuth Legal Pages

## Status

Implemented.

## Goal

Expose public Money Flux legal pages required for Google OAuth branding and consent screen configuration.

## What Changed

- Added public `/privacy-policy` page with Money Flux branding and privacy content.
- Added public `/terms-of-service` page with Money Flux branding and usage terms.
- Added legal links to the auth shell so login and register screens reference both public pages.
- Registered both routes outside `AuthGuard` so Google review and unauthenticated users can access them.

## Primary Files

- `src/pages/PrivacyPolicyPage.tsx`
- `src/pages/TermsOfServicePage.tsx`
- `src/pages/LoginPage.tsx`
- `src/app/router.tsx`

## Database Impact

None.

## Procedures Executed

None.

## Google OAuth Console Values

Use deployed production URLs, not localhost:

- App name: `Money Flux`
- Homepage URL: `https://<money-flux-domain>/`
- Privacy Policy URL: `https://<money-flux-domain>/privacy-policy`
- Terms of Service URL: `https://<money-flux-domain>/terms-of-service`

For the Google OAuth client used by Supabase Auth, the authorized redirect URI should point to the Supabase callback:

```text
https://kvsrsbwhfkbuaxmlwudd.supabase.co/auth/v1/callback
```

For local development, keep the local frontend origin in authorized JavaScript origins when needed:

```text
http://localhost:5173
```

## Verification

```bash
npm test
npm run build
```
