"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { exportToPDF, exportToExcel } from "@/lib/export";

type ExportRow = Record<string, string | number | null | undefined>;

type Props = {
  title: string;
  rows: ExportRow[];
  ingredientLabel?: string;
  ingredientUnit?: string;
  currentStock?: number;
};

export default function ExportButtons({ title, rows, ingredientLabel, ingredientUnit, currentStock }: Props) {
  // ...
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport(type: "pdf" | "excel") {
    setError(null);
    if (type === "pdf") setLoadingPDF(true);
    else setLoadingExcel(true);

    try {
      if (type === "pdf") await exportToPDF(title, rows);
      else await exportToExcel(title, rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al exportar.");
    } finally {
      if (type === "pdf") setLoadingPDF(false);
      else setLoadingExcel(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => handleExport("excel")}
          disabled={loadingExcel || loadingPDF}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: loadingExcel ? "#aaa" : "#1D6F42",
            color: "#fff", border: "none", borderRadius: 8,
            padding: "8px 16px", fontSize: 13,
            fontFamily: "Outfit, sans-serif", fontWeight: 600,
            cursor: loadingExcel ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          <FileSpreadsheet size={15} />
          {loadingExcel ? "Exportando..." : "Excel"}
        </button>

        <button
          onClick={() => handleExport("pdf")}
          disabled={loadingPDF || loadingExcel}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: loadingPDF ? "#aaa" : "#C1121F",
            color: "#fff", border: "none", borderRadius: 8,
            padding: "8px 16px", fontSize: 13,
            fontFamily: "Outfit, sans-serif", fontWeight: 600,
            cursor: loadingPDF ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          <FileText size={15} />
          {loadingPDF ? "Exportando..." : "PDF"}
        </button>
      </div>

      {error && (
        <p style={{ color: "#c05a10", fontSize: 12, marginTop: 6, fontFamily: "Outfit, sans-serif" }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}