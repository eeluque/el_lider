"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { buildReportFileBaseName, exportToPDF, exportToExcel } from "@/lib/export";

export type ExportRow = Record<string, string | number | null | undefined>;

type Props = {
  title: string;
  rows: ExportRow[];
  /** YYYY-MM-DD — incluido en el nombre del archivo .pdf / .xlsx */
  from?: string;
  to?: string;
  className?: string;
};

/**
 * Mismos botones que el reporte Kárdex: Excel (verde) y PDF (rojo), exportación real.
 */
export function ReportExportButtons({ title, rows, from, to, className }: Props) {
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport(type: "pdf" | "excel") {
    setError(null);
    if (type === "pdf") setLoadingPDF(true);
    else setLoadingExcel(true);

    try {
      if (rows.length === 0) {
        throw new Error("No hay datos para exportar en este periodo.");
      }
      const fileBaseName =
        from && to ? buildReportFileBaseName(title, from, to) : undefined;
      const fileOpts = fileBaseName ? { fileBaseName } : undefined;
      if (type === "pdf") await exportToPDF(title, rows, fileOpts);
      else await exportToExcel(title, rows, fileOpts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al exportar.");
    } finally {
      if (type === "pdf") setLoadingPDF(false);
      else setLoadingExcel(false);
    }
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2" style={{ gap: 8 }}>
        <button
          type="button"
          onClick={() => handleExport("excel")}
          disabled={loadingExcel || loadingPDF}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: loadingExcel ? "#aaa" : "#1D6F42",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 13,
            fontFamily: "Outfit, system-ui, sans-serif",
            fontWeight: 600,
            cursor: loadingExcel ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          <FileSpreadsheet size={15} />
          {loadingExcel ? "Exportando..." : "Excel"}
        </button>

        <button
          type="button"
          onClick={() => handleExport("pdf")}
          disabled={loadingPDF || loadingExcel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: loadingPDF ? "#aaa" : "#C1121F",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 13,
            fontFamily: "Outfit, system-ui, sans-serif",
            fontWeight: 600,
            cursor: loadingPDF ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          <FileText size={15} />
          {loadingPDF ? "Exportando..." : "PDF"}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-xs text-amber-700" style={{ fontFamily: "Outfit, system-ui, sans-serif" }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}
