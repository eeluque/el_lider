import { describe, expect, it, vi } from "vitest";
import {
  currentWeekRange,
  defaultReportRange,
  endOfDayIso,
  formatDateInputDisplay,
  last7DaysRange,
  startOfDayIso,
  todayRange,
  toLocalDateString,
} from "./date-range";

describe("date-range", () => {
  it("toLocalDateString formatea YYYY-MM-DD en horario central", () => {
    expect(toLocalDateString(new Date("2025-03-08T08:00:00.000Z"))).toBe("2025-03-08");
  });

  it("todayRange usa la fecha fijada", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-10T15:00:00.000Z"));
    expect(todayRange()).toEqual({ from: "2025-06-10", to: "2025-06-10" });
    vi.useRealTimers();
  });

  it("last7DaysRange son 7 días incluyendo hoy", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-07-20T12:00:00.000Z"));
    const range = last7DaysRange();
    expect(range.to).toBe("2025-07-20");
    expect(range.from).toBe("2025-07-14");
    vi.useRealTimers();
  });

  it("currentWeekRange va de lunes a hoy cuando el domingo aún no llega", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-07-16T12:00:00.000Z"));
    const range = currentWeekRange();
    expect(range.from).toBe("2025-07-14");
    expect(range.to).toBe("2025-07-16");
    vi.useRealTimers();
  });

  it("defaultReportRange delega a last7DaysRange", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-15T12:00:00.000Z"));
    expect(defaultReportRange()).toEqual(last7DaysRange());
    vi.useRealTimers();
  });

  it("startOfDayIso y endOfDayIso usan offset central", () => {
    expect(startOfDayIso("2025-01-05")).toBe("2025-01-05T00:00:00-06:00");
    expect(endOfDayIso("2025-01-05")).toBe("2025-01-05T23:59:59-06:00");
  });

  it("formatDateInputDisplay usa formato dd/mm/yyyy", () => {
    expect(formatDateInputDisplay("2025-01-05")).toBe("05/01/2025");
  });
});
