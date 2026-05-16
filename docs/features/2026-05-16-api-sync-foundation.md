# API Sync Foundation

## Status
- Branch: `feature/api-sync-foundation`
- Date: `2026-05-16`
- Depends on: `feature/offline-first-pwa`
- API repo: `../financial-management-api`

## Goal

Conectar el frontend offline-first con una API Node.js independiente para autenticación y sincronización, manteniendo IndexedDB como fuente local y evitando escrituras directas del frontend a PostgreSQL.

## What Changed

### 1. API client
- Se agregó cliente HTTP con `VITE_API_BASE_URL`.
- Agrega `Authorization: Bearer` si existe sesión.
- Normaliza errores JSON de la API.

Primary files
- `src/lib/api/client.ts`

### 2. Auth frontend
- `authStore` con login, register, logout y loadSession.
- Token MVP en localStorage.
- Rutas públicas `/login` y `/register`.
- `AuthGuard` para rutas principales.

Primary files
- `src/stores/authStore.ts`
- `src/components/auth/AuthGuard.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/RegisterPage.tsx`
- `src/app/router.tsx`

### 3. Remote sync client
- `pushSyncOperations`
- `pullRemoteChanges`

Primary files
- `src/lib/remote/syncApi.ts`

### 4. Sync engine real
- Envía operaciones pendientes a `POST /v1/sync/push`.
- Hace pull de cambios remotos con `GET /v1/sync/pull`.
- Acepta remoto si no hay operación local pendiente.
- Marca conflicto si hay cambio remoto y operación local pendiente.
- No borra datos locales cuando la API falla.

Primary files
- `src/lib/offline/syncEngine.ts`
- `src/lib/offline/transactionRepository.ts`
- `src/lib/offline/syncQueueRepository.ts`
- `src/lib/offline/db.ts`

## Impacto en base de datos

### Frontend
- No escribe directo en PostgreSQL.
- No usa Supabase client.
- Mantiene IndexedDB local y syncQueue.

### Backend/API
- El esquema remoto y migración inicial viven en el repo:

```txt
../financial-management-api
```

Migration:

```txt
../financial-management-api/src/db/migrations/001_initial_schema.sql
```

## Procedimientos ejecutados en base de datos

- Ninguno contra base de datos viva en esta sesión.
- La migración SQL fue creada pero no ejecutada.

## Verification

Frontend:

```bash
npm test
npm run build
```

API:

```bash
cd ../financial-management-api
npm test
npm run build
```

## Known Boundaries

- Token MVP usa localStorage.
- No hay refresh token.
- La migración no se ejecutó contra una base real en esta sesión.
- Conflictos se marcan localmente; no hay resolución automática.
