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

export type ExportFileOptions = {
  /** Sin extensión; si no se envía, se usa el título sanitizado. */
  fileBaseName?: string;
};

export async function exportToPDF(title: string, rows: ExportRow[], options?: ExportFileOptions): Promise<void> {
  try {
    const headers = Object.keys(rows[0] ?? {});
    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFillColor(241, 181, 62);
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(title, pageWidth / 2, 13, { align: "center" });

    const fecha = new Date().toLocaleDateString("es-HN", {
      day: "2-digit", month: "long", year: "numeric",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generado el ${fecha}`, pageWidth - 10, pageHeight - 6, { align: "right" });

    doc.setDrawColor(209, 140, 30);
    doc.setLineWidth(1);
    doc.line(0, 28, pageWidth, 28);

    autoTable(doc, {
      head: [headers],
      body: rows.map((r) => headers.map((h) => r[h] ?? "")),
      startY: 32,
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

    ws["A1"] = {
      v: title, t: "s", s: {
        font: { bold: true, sz: 14, color: { rgb: "000000" } },
        fill: { fgColor: { rgb: "F1B53E" } },
        alignment: { horizontal: "center", vertical: "center" },
      }
    };

    ws["A2"] = { v: "", t: "s", s: { fill: { fgColor: { rgb: "D4881A" } } } };

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