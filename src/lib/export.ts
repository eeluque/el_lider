import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ExportRow = Record<string, string | number | null | undefined>;

/** Nombre seguro para archivo (sin extensión): título + rango YYYY-MM-DD. */
export function buildReportFileBaseName(title: string, from: string, to: string): string {
  const safe = title
    .replace(/[/\\?%*:|"<>[\]]/g, "")
    .trim()
    .replace(/\s+/g, "_");
  const range = from === to ? from : `${from}_a_${to}`;
  return `${safe}_${range}`;
}

function sanitizeTitleFallback(title: string): string {
  const s = title.replace(/[/\\?%*:|"<>[\]]/g, "").trim().replace(/\s+/g, "_");
  return s || "reporte";
}

/** Texto de subtítulo para PDF/Excel (rango del reporte). */
export function formatReportPeriodSubtitle(from: string, to: string): string {
  const fd = new Date(from.slice(0, 10) + "T12:00:00");
  const td = new Date(to.slice(0, 10) + "T12:00:00");
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const a = fd.toLocaleDateString("es-HN", opts);
  const b = td.toLocaleDateString("es-HN", opts);
  return from.slice(0, 10) === to.slice(0, 10) ? `Periodo: ${a}` : `Periodo: ${a} – ${b}`;
}

export type ExportFileOptions = {
  /** Sin extensión; si no se envía, se usa el título sanitizado. */
  fileBaseName?: string;
  /** YYYY-MM-DD — muestra subtítulo con el rango del reporte en PDF y Excel. */
  from?: string;
  to?: string;
};

export async function exportToPDF(title: string, rows: ExportRow[], options?: ExportFileOptions): Promise<void> {
  try {
    const headers = Object.keys(rows[0] ?? {});
    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const periodSubtitle =
      options?.from && options?.to ? formatReportPeriodSubtitle(options.from, options.to) : null;
    const headerBottom = periodSubtitle ? 36 : 28;

    doc.setFillColor(241, 181, 62);
    doc.rect(0, 0, pageWidth, headerBottom, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(title, pageWidth / 2, 12, { align: "center" });

    if (periodSubtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80, 50, 30);
      doc.text(periodSubtitle, pageWidth / 2, 22, { align: "center" });
    }

    const fecha = new Date().toLocaleDateString("es-HN", {
      day: "2-digit", month: "long", year: "numeric",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generado el ${fecha}`, pageWidth - 10, pageHeight - 6, { align: "right" });

    doc.setDrawColor(209, 140, 30);
    doc.setLineWidth(1);
    doc.line(0, headerBottom, pageWidth, headerBottom);

    autoTable(doc, {
      head: [headers],
      body: rows.map((r) => headers.map((h) => r[h] ?? "")),
      startY: headerBottom + 4,
      styles: { font: "helvetica", fontSize: 9, cellPadding: 4, textColor: [42, 31, 15] },
      headStyles: { fillColor: [241, 181, 62], textColor: [107, 80, 48], fontStyle: "bold", fontSize: 8 },
      alternateRowStyles: { fillColor: [255, 250, 243] },
      tableLineColor: [232, 213, 176],
      tableLineWidth: 0.3,
    });


    const fileBase = options?.fileBaseName ?? sanitizeTitleFallback(title);
    doc.save(`${fileBase}.pdf`);
  } catch (error) {
    console.error("Error al exportar PDF:", error);
    throw new Error("No se pudo generar el PDF. Intenta de nuevo.");
  }
}

export async function exportToExcel(title: string, rows: ExportRow[], options?: ExportFileOptions): Promise<void> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const xlsxMod = await import("xlsx-js-style") as any;
    const XLSX = xlsxMod.default ?? xlsxMod;
    const headers = Object.keys(rows[0] ?? {});
    const colCount = headers.length;

    const ws: Record<string, unknown> = {};

    const periodSubtitle =
      options?.from && options?.to ? formatReportPeriodSubtitle(options.from, options.to) : "";

    ws["A1"] = {
      v: title, t: "s", s: {
        font: { bold: true, sz: 14, color: { rgb: "000000" } },
        fill: { fgColor: { rgb: "F1B53E" } },
        alignment: { horizontal: "center", vertical: "center" },
      }
    };

    ws["A2"] = {
      v: periodSubtitle,
      t: "s",
      s: {
        font: { sz: 11, color: { rgb: "4A3820" } },
        fill: { fgColor: { rgb: "FFF8E8" } },
        alignment: { horizontal: "center", vertical: "center" },
      },
    };

    headers.forEach((h, i) => {
      const cell = XLSX.utils.encode_cell({ r: 2, c: i });
      ws[cell] = {
        v: h, t: "s", s: {
          font: { bold: true, color: { rgb: "6B5030" } },
          fill: { fgColor: { rgb: "F1B53E" } },
          alignment: { horizontal: "center" },
        }
      };
    });

    rows.forEach((row, rowIdx) => {
      headers.forEach((h, colIdx) => {
        const cell = XLSX.utils.encode_cell({ r: rowIdx + 3, c: colIdx });
        ws[cell] = { v: row[h] ?? "", t: "s" };
      });
    });

    ws["!ref"] = XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: rows.length + 3, c: colCount - 1 },
    });

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } },
    ];

    ws["!cols"] = headers.map(() => ({ wch: 18 }));

    const wb = XLSX.utils.book_new();
    const sheetName = sanitizeTitleFallback(title).slice(0, 31) || "Hoja1";
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const fileBase = options?.fileBaseName ?? sanitizeTitleFallback(title);
    XLSX.writeFile(wb, `${fileBase}.xlsx`);
  } catch (error) {
    console.error("Error al exportar Excel:", error);
    throw new Error("No se pudo generar el Excel. Intenta de nuevo.");
  }
}