# Pruebas y cobertura de reportes

## Comandos

| Comando | Descripción |
|--------|-------------|
| `npm run test` | Ejecuta Vitest (servicios de reportes, `date-range`, export). |
| `npm run test:coverage` | Igual + informe de cobertura (V8). |
| `npm run test:watch` | Modo watch durante desarrollo. |

## Alcance

- **`src/services/reports.ts`**: funciones de datos (pedidos entregados, cancelados, kardex, consumo, ventas, top platos, etc.) con **mock de Supabase** (`src/test/vitest-setup.ts` + cola en `src/test/supabase-queue.ts`).
- **`src/lib/date-range.ts`**: rangos de fechas (hoy, 7 días, semana actual).
- **`src/lib/export.ts`**: PDF/Excel (jspdf mockeado; Excel usa el paquete real y se espía `writeFile` en el objeto `default`).

**Líneas / sentencias / funciones: 100%** en esos archivos. Las **ramas** (~74% global) incluyen opcionales en export y comparadores de ordenación; el umbral mínimo de ramas está en **70%** en `vitest.config.mjs`.

## Datos reales en Supabase (manual / QA)

1. Base inicial: `npm run seed`
2. Extra para reportes: `npm run seed:report-fixtures`  
   Inserta pedidos `delivered`, `ready`, `cancelled` con ítems y movimientos de inventario (IN/OUT/ADJUSTMENT) con fechas recientes. Requiere al menos un usuario **admin** para los movimientos.

## Corrección Excel (`export.ts`)

El módulo `xlsx-js-style` expone la API en **`default`**. El código usa `const XLSX = xlsxMod.default ?? xlsxMod` para compatibilidad ESM/Next.
