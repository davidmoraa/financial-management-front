# Offline-First PWA Persistence

## Status
- Branch: `feature/offline-first-pwa`
- Base commit: `c56f828`
- Feature commit: `641b0de`
- Date: `2026-05-16`
- PR: `https://github.com/davidmoraa/financial-management-front/pull/new/feature/offline-first-pwa`

## Goal

Convertir la app en una PWA offline-first para que el usuario pueda registrar ingresos y gastos sin internet, persistirlos localmente y dejar preparada una cola de sincronización para una futura integración con Supabase o backend.

## What Changed

### 1. PWA installable
- Se agregó `vite-plugin-pwa`.
- La build genera `manifest.webmanifest`, `sw.js` y `registerSW.js`.
- Se agregó icono placeholder en `public/icons/icon.svg`.

Primary files
- `vite.config.ts`
- `public/icons/icon.svg`

### 2. Persistencia local en IndexedDB
- Se agregó Dexie.
- Se crearon tablas locales:
  - `transactions`
  - `categories`
  - `settings`
  - `syncQueue`

Primary files
- `src/lib/offline/db.ts`
- `src/lib/offline/transactionRepository.ts`
- `src/lib/offline/syncQueueRepository.ts`

### 3. Cola de sincronización
- Cada creación, edición y soft delete de movimiento agrega una operación a `syncQueue`.
- Cada movimiento tiene `syncStatus`.
- El motor inicial de sync simula éxito y queda listo para conectar Supabase/API después.

Primary files
- `src/lib/offline/syncEngine.ts`
- `src/hooks/useOfflineSync.ts`
- `src/stores/transactionStore.ts`

### 4. UI offline/sync
- Header y ajustes muestran estado de sincronización.
- El formulario permite guardar sin conexión.
- El historial permite filtrar por estado de sincronización.
- Cada movimiento muestra su estado de sync de forma discreta.

Primary files
- `src/components/sync/SyncStatusBadge.tsx`
- `src/components/transactions/TransactionForm.tsx`
- `src/components/transactions/TransactionItem.tsx`
- `src/pages/HistoryPage.tsx`
- `src/pages/SettingsPage.tsx`

### 5. Tests
- Se agregaron pruebas para repositorios, cola, store, formulario offline y badge.

Primary files
- `src/lib/offline/transactionRepository.test.ts`
- `src/lib/offline/syncQueueRepository.test.ts`
- `src/stores/transactionStore.test.ts`
- `src/pages/NewTransactionPage.test.tsx`
- `src/components/sync/SyncStatusBadge.test.tsx`

## Impacto en base de datos

### Sin cambio de esquema remoto
- Esta feature no agrega migraciones SQL.
- No modifica tablas, columnas, enums, políticas RLS, triggers ni funciones en Supabase.
- No conecta backend ni autenticación.

### Persistencia local
- Se crea una base local IndexedDB llamada `financial-management-offline-db`.
- Esta base vive en el dispositivo del usuario.
- No reemplaza el futuro esquema remoto.

## Procedimientos ejecutados en base de datos

- Ninguno en base de datos remota.
- No se ejecutó SQL.
- No se ejecutaron procedimientos Supabase.

## Why This Exists

La app debe registrar movimientos financieros aunque el usuario no tenga internet. La fuente inmediata de verdad para la UI pasa a ser IndexedDB, con una cola que permitirá sincronizar después.

## Behavior After This Feature

- La app puede abrir offline después de haber cargado una vez.
- Los movimientos se guardan localmente.
- Dashboard e historial leen datos locales.
- Los movimientos pendientes se marcan como `pending`.
- La cola queda lista para procesar operaciones cuando vuelva la conexión.

## Known Boundaries

- La sincronización remota todavía es mock.
- No hay resolución real de conflictos con servidor.
- No hay Supabase, backend ni autenticación.
- El icono PWA es placeholder.

## Follow-up Candidates

- Conectar `processSyncItem` con Supabase o API.
- Diseñar contrato remoto idempotente por `client id`.
- Agregar resolución de conflictos basada en `serverUpdatedAt`.
- Agregar migraciones/versionado de IndexedDB cuando cambie el modelo local.

## Verification

```bash
npm test
npm run build
```

Resultado:
- `npm test`: 5 archivos, 9 tests pasan.
- `npm run build`: pasa y genera assets PWA.
