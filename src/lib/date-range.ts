/** Fecha local YYYY-MM-DD (evita desfaces por UTC). */
export function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Día de hoy (inicio y fin el mismo día). */
export function todayRange(): { from: string; to: string } {
  const s = toLocalDateString(new Date());
  return { from: s, to: s };
}

/** Incluye hoy y los 6 días anteriores (7 días en total). */
export function last7DaysRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 6);
  return { from: toLocalDateString(from), to: toLocalDateString(to) };
}

/**
 * Semana calendario actual: lunes → domingo (o hoy si el domingo aún no llega).
 */
export function currentWeekRange(): { from: string; to: string } {
  const now = new Date();
  const day = now.getDay(); // 0 domingo … 6 sábado
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const end = sunday > now ? now : sunday;
  return { from: toLocalDateString(monday), to: toLocalDateString(end) };
}

/** Rango por defecto al entrar sin query (últimos 7 días). */
export function defaultReportRange(): { from: string; to: string } {
  return last7DaysRange();
}

export function startOfDayIso(dateYmd: string): string {
  return `${dateYmd}T00:00:00`;
}

export function endOfDayIso(dateYmd: string): string {
  return `${dateYmd}T23:59:59`;
}
