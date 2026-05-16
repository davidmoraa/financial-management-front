# Offline-First PWA Architecture

## Estado

Implementado en fase local, sin Supabase, autenticación ni backend.

## Objetivo

Permitir que la app se instale como PWA, abra offline después de la primera carga y registre ingresos/gastos aunque no haya conexión.

## Componentes

- `vite-plugin-pwa` genera manifest, service worker y precache de assets principales.
- `dexie` administra IndexedDB.
- `src/lib/offline/db.ts` define tablas locales:
  - `transactions`
  - `categories`
  - `settings`
  - `syncQueue`
- `transactionRepository` escribe movimientos y agrega operaciones a la cola.
- `syncQueueRepository` administra operaciones pendientes, fallidas y completadas.
- `syncEngine` simula procesamiento exitoso y deja el punto de integración listo para Supabase/API.
- `useOfflineSync` hidrata datos locales, escucha online/offline y dispara sincronización sin loops.

## Reglas de datos

- Los movimientos financieros no usan localStorage.
- Las creaciones, ediciones y eliminaciones escriben primero en IndexedDB.
- Las eliminaciones son soft delete mediante `deletedAt`.
- Cada movimiento tiene `syncStatus`.
- Cada mutación agrega un item a `syncQueue`.
- Un fallo de sincronización no borra ni revierte datos locales.

## Próxima integración remota

`processSyncItem` debe reemplazar el mock por llamadas a Supabase o a un backend. El contrato esperado por operación:

- `create`: insertar movimiento remoto usando `id` de cliente como llave idempotente.
- `update`: aplicar último estado local si no hay conflicto de `serverUpdatedAt`.
- `delete`: marcar eliminado remoto sin borrar el registro local hasta confirmar.

## Verificación

```bash
npm test
npm run build
```
