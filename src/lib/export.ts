import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { EXPORT_ROWS_PER_SHEET } from "@/lib/report-pagination";

type ExportRow = Record<string, string | number | null | undefined>;

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

export function formatReportPeriodSubtitle(from: string, to: string, subtitlePrefix?: string): string {
  const fd = new Date(from.slice(0, 10) + "T12:00:00");
  const td = new Date(to.slice(0, 10) + "T12:00:00");
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const a = fd.toLocaleDateString("es-HN", opts);
  const b = td.toLocaleDateString("es-HN", opts);
  const prefix = subtitlePrefix?.trim() ? `${subtitlePrefix.trim()}: ` : "Periodo: ";

  return from.slice(0, 10) === to.slice(0, 10) ? `${prefix}${a}` : `${prefix}${a} – ${b}`;
}

export type ExportFileOptions = {
  fileBaseName?: string;
  from?: string;
  to?: string;
  ingredientLabel?: string;
  ingredientUnit?: string;
  subtitlePrefix?: string;
};

async function getImageBase64(src: string): Promise<string> {
  const res = await fetch(src);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export async function exportToPDF(title: string, rows: ExportRow[], options?: ExportFileOptions): Promise<void> {
  try {
    const headers = Object.keys(rows[0] ?? {});
    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const periodSubtitle =
      options?.from && options?.to
        ? formatReportPeriodSubtitle(options.from, options.to, options.subtitlePrefix)
        : null;
    const hasIngredient = !!options?.ingredientLabel;
    const headerBottom = periodSubtitle ? 36 : 26;
    const cardBottom = headerBottom;

    doc.setFillColor(241, 181, 62);
    doc.rect(0, 0, pageWidth, headerBottom, "F");

    try {
      const logoBase64 = await getImageBase64("/images/logo-el-lider.png");
      const logoH = periodSubtitle ? 31 : 24;
      const logoW = logoH;
      doc.addImage(logoBase64, "PNG", 17, 2, logoW, logoH);
    } catch {
      // Continúa sin el logo si falla la carga.
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(title, pageWidth / 2, periodSubtitle ? 11 : 16, { align: "center" });

    if (periodSubtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 50, 30);
      doc.text(periodSubtitle, pageWidth / 2, 22, { align: "center" });
    }

    doc.setDrawColor(209, 140, 30);
    doc.setLineWidth(1.5);
    doc.line(0, headerBottom, pageWidth, headerBottom);

    const tableHead: Array<Array<string | { content: string; colSpan: number; styles: Record<string, unknown> }>> = [];

    if (hasIngredient) {
      tableHead.push([{
        content: options!.ingredientLabel! + (options?.ingredientUnit ? `  (${options.ingredientUnit})` : ""),
        colSpan: headers.length,
        styles: {
          fillColor: [117, 59, 25],
          textColor: [255, 255, 255],
          fontSize: 11,
          fontStyle: "normal",
          halign: "left",
          cellPadding: { top: 6, bottom: 6, left: 8, right: 8 },
        },
      }]);
    }

    tableHead.push(headers.map((h) => h.toUpperCase()));

    autoTable(doc, {
      head: tableHead,
      body: rows.map((r) => headers.map((h) => r[h] ?? "")),
      startY: cardBottom + 20,
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 4,
        textColor: [42, 31, 15],
      },
      headStyles: {
        fillColor: hasIngredient ? [241, 181, 62] : [117, 59, 25],
        textColor: hasIngredient ? [76, 64, 64] : [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [255, 250, 243],
      },
      tableLineColor: [232, 213, 176],
      tableLineWidth: 0.3,
      columnStyles: {
        [headers.indexOf("Entrada")]: { halign: "right" },
        [headers.indexOf("Salida")]: { halign: "right" },
        [headers.indexOf("Stock")]: { halign: "right" },
      },
      didParseCell: (data) => {
        if (data.section !== "body") return;
        const colName = headers[data.column.index];
        const val = String(data.cell.raw ?? "");

        if (colName === "Entrada" && val !== "—" && val !== "") {
          data.cell.styles.textColor = [88, 143, 61];
        }
        if (colName === "Salida" && val !== "—" && val !== "") {
          data.cell.styles.textColor = [205, 102, 51];
        }

        const estadoVal = String(data.row.cells[headers.indexOf("Estado")]?.raw ?? "");
        if (estadoVal.toLowerCase().includes("bajo")) {
          data.cell.styles.fillColor = [254, 248, 248];
          if (colName === "Estado") {
            data.cell.styles.textColor = [185, 28, 28];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    const internal = doc.internal as { getNumberOfPages?: () => number };
    const pageCount = typeof internal.getNumberOfPages === "function" ? internal.getNumberOfPages() : 1;
    for (let i = 1; i <= pageCount; i++) {
      if (typeof doc.setPage === "function") doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(130, 130, 130);
      doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 5, { align: "center" });
    }

    const fecha = new Date().toLocaleDateString("es-HN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    if (typeof doc.setPage === "function") doc.setPage(pageCount);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generado el ${fecha}`, pageWidth - 10, pageHeight - 6, { align: "right" });

    const fileBase = options?.fileBaseName ?? sanitizeTitleFallback(title);
    doc.save(`${fileBase}.pdf`);
  } catch (error) {
    console.error("Error al exportar PDF:", error);
    throw new Error("No se pudo generar el PDF. Intenta de nuevo.");
  }
}

export async function exportToExcel(title: string, rows: ExportRow[], options?: ExportFileOptions): Promise<void> {
  try {
    const xlsxMod = await import("xlsx-js-style");
    const XLSX = xlsxMod.default ?? xlsxMod;
    const headers = Object.keys(rows[0] ?? {});
    const colCount = headers.length;

    const periodSubtitle =
      options?.from && options?.to
        ? formatReportPeriodSubtitle(options.from, options.to, options.subtitlePrefix)
        : null;

    const chunks: ExportRow[][] = [];
    if (rows.length === 0) {
      chunks.push([]);
    } else {
      for (let i = 0; i < rows.length; i += EXPORT_ROWS_PER_SHEET) {
        chunks.push(rows.slice(i, i + EXPORT_ROWS_PER_SHEET));
      }
    }
    const totalSheets = Math.max(1, chunks.length);

    const wb = XLSX.utils.book_new();

    chunks.forEach((chunk, sheetIdx) => {
      const ws: Record<string, unknown> = {};

      const pageNote =
        totalSheets > 1 ? ` · Hoja ${sheetIdx + 1} de ${totalSheets}` : "";
      const a2Text = `${periodSubtitle ?? ""}${pageNote}`.trim() || " ";

      ws.A1 = {
        v: title,
        t: "s",
        s: {
          font: { bold: true, sz: 14, color: { rgb: "000000" } },
          fill: { fgColor: { rgb: "F1B53E" } },
          alignment: { horizontal: "center", vertical: "center" },
        },
      };

      ws.A2 = {
        v: a2Text,
        t: "s",
        s: {
          font: { sz: 11, color: { rgb: "4A3820" } },
          fill: { fgColor: { rgb: "FFF8E8" } },
          alignment: { horizontal: "center", vertical: "center" },
        },
      };

      const hasIngredient = !!options?.ingredientLabel;

      if (hasIngredient) {
        const labelText =
          options!.ingredientLabel! +
          (options?.ingredientUnit ? `  (${options.ingredientUnit})` : "");

        const ingCell = XLSX.utils.encode_cell({ r: 3, c: 0 });
        ws[ingCell] = {
          v: labelText,
          t: "s",
          s: {
            font: { bold: false, sz: 11, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "753B19" } },
            alignment: { horizontal: "left", vertical: "center", indent: 1 },
          },
        };
      }

      const headersRow = hasIngredient ? 4 : 2;
      headers.forEach((h, i) => {
        const cell = XLSX.utils.encode_cell({ r: headersRow, c: i });
        ws[cell] = {
          v: h,
          t: "s",
          s: {
            font: { bold: true, color: { rgb: "6B5030" } },
            fill: { fgColor: { rgb: "F1B53E" } },
            alignment: { horizontal: "center" },
          },
        };
      });

      const dataStartRow = hasIngredient ? 5 : 3;
      chunk.forEach((row, rowIdx) => {
        headers.forEach((h, colIdx) => {
          const cell = XLSX.utils.encode_cell({ r: rowIdx + dataStartRow, c: colIdx });
          ws[cell] = { v: row[h] ?? "", t: "s" };
        });
      });

      const lastDataRow = chunk.length + dataStartRow - 1;
      ws["!ref"] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: Math.max(dataStartRow, lastDataRow), c: colCount - 1 },
      });

      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } },
        ...(hasIngredient
          ? [{ s: { r: 3, c: 0 }, e: { r: 3, c: colCount - 1 } }]
          : []),
      ];

      ws["!cols"] = headers.map(() => ({ wch: 18 }));

      const sheetName =
        totalSheets > 1
          ? `Página ${sheetIdx + 1}`.slice(0, 31)
          : (sanitizeTitleFallback(title).slice(0, 31) || "Hoja1");
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    const fileBase = options?.fileBaseName ?? sanitizeTitleFallback(title);
    XLSX.writeFile(wb, `${fileBase}.xlsx`);
  } catch (error) {
    console.error("Error al exportar Excel:", error);
    throw new Error("No se pudo generar el Excel. Intenta de nuevo.");
  }
}
