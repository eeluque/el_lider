import { describe, expect, it, vi } from "vitest";
import {
  currentWeekRange,
  defaultReportRange,
  endOfDayIso,
  last7DaysRange,
  startOfDayIso,
  todayRange,
  toLocalDateString,
} from "./date-range";

describe("date-range", () => {
  it("toLocalDateString formatea YYYY-MM-DD local", () => {
    expect(toLocalDateString(new Date(2025, 2, 8))).toBe("2025-03-08");
  });

  it("todayRange usa la fecha fijada", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 10, 15, 0, 0));
    expect(todayRange()).toEqual({ from: "2025-06-10", to: "2025-06-10" });
    vi.useRealTimers();
  });

  it("last7DaysRange son 7 días incluyendo hoy", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 6, 20, 12, 0, 0));
    const r = last7DaysRange();
    expect(r.to).toBe("2025-07-20");
    expect(r.from).toBe("2025-07-14");
    vi.useRealTimers();
  });

  it("currentWeekRange de lunes a hoy si el domingo es futuro", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 6, 16, 12, 0, 0));
    const r = currentWeekRange();
    expect(r.from).toBe("2025-07-14");
    expect(r.to).toBe("2025-07-16");
    vi.useRealTimers();
  });

  it("currentWeekRange cuando hoy es domingo (rama domingo de la semana)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 2, 9, 12, 0, 0));
    const r = currentWeekRange();
    expect(r.from).toBe("2025-03-03");
    expect(r.to).toBe("2025-03-09");
    vi.useRealTimers();
  });

  it("defaultReportRange delega a last7DaysRange", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 0, 15, 12, 0, 0));
    expect(defaultReportRange()).toEqual(last7DaysRange());
    vi.useRealTimers();
  });

  it("startOfDayIso y endOfDayIso", () => {
    expect(startOfDayIso("2025-01-05")).toBe("2025-01-05T00:00:00");
    expect(endOfDayIso("2025-01-05")).toBe("2025-01-05T23:59:59");
  });
});
