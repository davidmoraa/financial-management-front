# Frontend Foundation

## Estado

Base inicial implementada con datos mock en memoria.

## Alcance

- React + TypeScript + Vite.
- Tailwind CSS con componentes UI locales estilo shadcn/ui.
- Zustand para estado en memoria.
- React Hook Form + Zod para validación del formulario de movimientos.
- date-fns para fechas.
- lucide-react para iconografía.
- Motion para microinteracciones.

## Decisiones

- No se conecta Supabase, backend ni localStorage en esta fase.
- Los movimientos y categorías viven en stores de Zustand.
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
