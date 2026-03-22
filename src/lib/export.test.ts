import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  savePdf: vi.fn(),
}));

vi.mock("jspdf-autotable", () => ({
  default: vi.fn(),
}));

vi.mock("jspdf", () => ({
  default: class MockPdf {
    internal = { pageSize: { getWidth: () => 200, getHeight: () => 300 } };
    setFillColor = vi.fn();
    rect = vi.fn();
    setFont = vi.fn();
    setFontSize = vi.fn();
    setTextColor = vi.fn();
    text = vi.fn();
    setDrawColor = vi.fn();
    setLineWidth = vi.fn();
    line = vi.fn();
    save = mocks.savePdf;
  },
}));

import { buildReportFileBaseName, exportToExcel, exportToPDF, formatReportPeriodSubtitle } from "./export";

describe("export", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("buildReportFileBaseName con un día o rango", () => {
    expect(buildReportFileBaseName("Mi / Reporte", "2025-01-01", "2025-01-01")).toBe("Mi_Reporte_2025-01-01");
    expect(buildReportFileBaseName("Ventas", "2025-01-01", "2025-01-31")).toBe("Ventas_2025-01-01_a_2025-01-31");
  });

  it("formatReportPeriodSubtitle", () => {
    expect(formatReportPeriodSubtitle("2025-03-08", "2025-03-08")).toMatch(/^Periodo:/);
    expect(formatReportPeriodSubtitle("2025-01-01", "2025-01-31")).toContain("–");
  });

  it("exportToPDF con rango de fechas (subtítulo) no lanza", async () => {
    mocks.savePdf.mockClear();
    await exportToPDF("Informe", [{ A: 1 }], {
      fileBaseName: "Inf",
      from: "2025-06-01",
      to: "2025-06-15",
    });
    expect(mocks.savePdf).toHaveBeenCalledWith("Inf.pdf");
  });

  it("exportToPDF genera archivo con nombre por defecto", async () => {
    mocks.savePdf.mockClear();
    await exportToPDF("Título", [{ A: 1, B: 2 }]);
    expect(mocks.savePdf).toHaveBeenCalledWith("Título.pdf");
  });

  it("exportToPDF usa fileBaseName en opciones", async () => {
    mocks.savePdf.mockClear();
    await exportToPDF("Título", [{ A: 1 }], { fileBaseName: "mi_archivo_2025-01-01" });
    expect(mocks.savePdf).toHaveBeenCalledWith("mi_archivo_2025-01-01.pdf");
  });

  it("exportToPDF propaga error genérico si save falla", async () => {
    mocks.savePdf.mockImplementationOnce(() => {
      throw new Error("disk full");
    });
    await expect(exportToPDF("X", [{ a: 1 }])).rejects.toThrow("No se pudo generar el PDF");
  });

  async function getXlsxApi() {
    const xlsxMod = (await import("xlsx-js-style")) as { default?: { writeFile: (...args: unknown[]) => void } };
    return xlsxMod.default ?? (xlsxMod as unknown as { writeFile: (...args: unknown[]) => void });
  }

  it("exportToExcel escribe xlsx", async () => {
    const XLSX = await getXlsxApi();
    const spy = vi.spyOn(XLSX, "writeFile").mockImplementation(() => {});
    await exportToExcel("Rep", [{ Col1: "a", Col2: "b" }]);
    expect(spy).toHaveBeenCalled();
    const name = spy.mock.calls[0][1] as string;
    expect(name).toMatch(/^Rep\.xlsx$/);
  });

  it("exportToExcel usa fileBaseName", async () => {
    const XLSX = await getXlsxApi();
    const spy = vi.spyOn(XLSX, "writeFile").mockImplementation(() => {});
    await exportToExcel("Rep", [{ x: 1 }], { fileBaseName: "Rep_2025-01-01_a_2025-01-02" });
    expect(spy).toHaveBeenCalledWith(expect.anything(), "Rep_2025-01-01_a_2025-01-02.xlsx");
  });

  it("exportToExcel con from/to incluye subtítulo en hoja", async () => {
    const XLSX = await getXlsxApi();
    const spy = vi.spyOn(XLSX, "writeFile").mockImplementation(() => {});
    await exportToExcel("Rep", [{ x: 1 }], {
      fileBaseName: "R",
      from: "2025-01-01",
      to: "2025-01-31",
    });
    expect(spy).toHaveBeenCalled();
    const wb = spy.mock.calls[0][0] as { Sheets?: { [k: string]: { A2?: { v?: string } } } };
    const sheet = Object.values(wb.Sheets ?? {})[0];
    expect(sheet?.A2?.v).toContain("Periodo:");
  });

  it("exportToExcel falla si writeFile lanza", async () => {
    const XLSX = await getXlsxApi();
    vi.spyOn(XLSX, "writeFile").mockImplementationOnce(() => {
      throw new Error("fail");
    });
    await expect(exportToExcel("E", [{ a: 1 }])).rejects.toThrow("No se pudo generar el Excel");
  });
});
