export const CENTRAL_TIME_ZONE = "America/Tegucigalpa";
export const CENTRAL_TIME_OFFSET = "-06:00";

function formatParts(
  date: Date,
  options: Intl.DateTimeFormatOptions
): Record<string, string> {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CENTRAL_TIME_ZONE,
    ...options,
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function getCentralWeekdayIndex(date: Date): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: CENTRAL_TIME_ZONE,
    weekday: "short",
  }).format(date);

  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return map[weekday] ?? 0;
}

export function toLocalDateString(date: Date): string {
  const parts = formatParts(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function parseCentralDate(dateYmd: string): Date {
  return new Date(`${dateYmd}T12:00:00${CENTRAL_TIME_OFFSET}`);
}

export function formatCentralDate(
  value: Date | string,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-HN", {
    timeZone: CENTRAL_TIME_ZONE,
    ...options,
  }).format(date);
}

export function formatCentralDateTime(
  value: Date | string,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
): string {
  return formatCentralDate(value, options);
}

export function formatDateInputDisplay(dateYmd: string): string {
  const [year, month, day] = dateYmd.split("-");
  return `${day}/${month}/${year}`;
}

export function formatCentralRangeLabel(fromYmd: string, toYmd: string): string {
  return `${formatCentralDate(parseCentralDate(fromYmd), {
    day: "numeric",
    month: "long",
    year: "numeric",
  })} – ${formatCentralDate(parseCentralDate(toYmd), {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}

export function todayRange(): { from: string; to: string } {
  const today = toLocalDateString(new Date());
  return { from: today, to: today };
}

export function last7DaysRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 6);
  return { from: toLocalDateString(from), to: toLocalDateString(to) };
}

export function currentWeekRange(): { from: string; to: string } {
  const now = new Date();
  const day = getCentralWeekdayIndex(now);
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const end = sunday > now ? now : sunday;
  return { from: toLocalDateString(monday), to: toLocalDateString(end) };
}

export function defaultReportRange(): { from: string; to: string } {
  return last7DaysRange();
}

export function startOfDayIso(dateYmd: string): string {
  return `${dateYmd}T00:00:00${CENTRAL_TIME_OFFSET}`;
}

export function endOfDayIso(dateYmd: string): string {
  return `${dateYmd}T23:59:59${CENTRAL_TIME_OFFSET}`;
}

export function fillDailySalesSeries(
  fromYmd: string,
  toYmd: string,
  salesByDay: Record<string, number>
): { name: string; ventas: number; dateKey: string }[] {
  const output: { name: string; ventas: number; dateKey: string }[] = [];
  const start = parseCentralDate(fromYmd);
  const end = parseCentralDate(toYmd);

  for (let time = start.getTime(); time <= end.getTime(); time += 86400000) {
    const date = new Date(time);
    const dateKey = toLocalDateString(date);
    const ventas = salesByDay[dateKey] ?? 0;
    const name = formatCentralDate(date, { weekday: "short", day: "numeric", month: "short" });
    output.push({ name, ventas, dateKey });
  }

  return output;
}
