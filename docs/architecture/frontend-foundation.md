# Frontend Foundation

## Estado

Base inicial implementada con datos mock en memoria.

## Alcance

- React + TypeScript + Vite.
- Tailwind CSS con componentes UI locales estilo shadcn/ui.
- Zustand para estado de UI y cache local hidratada desde IndexedDB.
- React Hook Form + Zod para validación del formulario de movimientos.
- date-fns para fechas.
- lucide-react para iconografía.
- Motion para microinteracciones.

## Decisiones

- No se conecta Supabase, backend ni localStorage para movimientos financieros en esta fase.
- Los movimientos viven en IndexedDB y se reflejan en Zustand para la UI.
- La app está configurada como PWA offline-first con service worker y manifest.
- El dashboard calcula métricas desde estado estable con `useMemo` para evitar selectores derivados inestables en Zustand v5.
- `dist/` queda fuera de git siguiendo el estándar frontend de Jomi Matcha.

## Verificación

```bash
npm run build
```

## Siguiente fase sugerida

- Agregar tests de componentes críticos.
- Definir persistencia y contrato de datos antes de conectar backend o Supabase.
- Documentar cualquier cambio de modelo en `docs/db/` cuando exista almacenamiento real.
