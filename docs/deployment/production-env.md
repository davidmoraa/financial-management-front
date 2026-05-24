# Production Environment

Money Flux frontend is a Vite app. Production builds use Vite's `production` mode, so `npm run build:production` loads `.env.production` unless Hostinger environment variables override the same keys.

The frontend API URL must come from environment configuration. Production URLs are not hardcoded in runtime code. `npm run build:production` validates the production env before compiling and fails if the API URL is missing, non-HTTPS, or points to localhost.

## Hostinger build settings

```txt
Framework preset: Vite / React
Branch: main
Node version: 22.x
Root directory: ./
Build command: npm run build:production
Output directory: dist
```

## Required production variables

```txt
VITE_API_BASE_URL=https://api.moneyflux.cloud
VITE_SUPABASE_URL=https://kvsrsbwhfkbuaxmlwudd.supabase.co
VITE_SUPABASE_ANON_KEY=<Supabase anon public key>
VITE_APPLE_CLIENT_ID=<Apple Services ID when Apple login is enabled>
```

`VITE_SUPABASE_ANON_KEY` is public in the browser bundle. API secrets, database credentials, JWT secrets, and Apple private keys must never be added to frontend env files.

## Production env validation

The production build runs:

```txt
node scripts/validate-production-env.mjs
```

This check prevents deploying a bundle compiled against `localhost`.

## OAuth redirect URLs

Supabase Auth:

```txt
Site URL: https://moneyflux.cloud
Redirect URL: https://moneyflux.cloud/auth/callback
Redirect URL: http://localhost:5173/auth/callback
```

Google OAuth client:

```txt
Authorized JavaScript origin: https://moneyflux.cloud
Authorized redirect URI: https://kvsrsbwhfkbuaxmlwudd.supabase.co/auth/v1/callback
```
