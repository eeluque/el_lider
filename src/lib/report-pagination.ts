/** Tamaño de página por defecto para tablas de reportes en pantalla y exportación. */
export const REPORT_PAGE_SIZE = 15;

/** Filas de datos por hoja en Excel al exportar (evita hojas enormes). */
export const EXPORT_ROWS_PER_SHEET = 25;

export function parseReportPage(raw: string | undefined): number {
  const n = parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export function paginateSlice<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function totalReportPages(totalItems: number, pageSize: number): number {
  if (totalItems <= 0) return 0;
  return Math.ceil(totalItems / pageSize);
}
