"use client";

import { useState } from "react";
import { buildReportFileBaseName, exportToPDF, exportToExcel } from "@/lib/export";

export type ExportRow = Record<string, string | number | null | undefined>;

type Props = {
  title: string;
  rows: ExportRow[];
  from?: string;
  to?: string;
  ingredientLabel?: string;  
  ingredientUnit?: string;  
  className?: string;
};

function PdfIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 4a3 3 0 0 1 3-3h18l12 12v31a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V4z" fill="#f04e3e"/>
      <path d="M29 1l12 12H29V1z" fill="#b53228"/>
      <rect x="4" y="24" width="28" height="16" rx="2" fill="#c0392b"/>
      <text x="18" y="36" fontSize="9" fontWeight="bold" fill="white" fontFamily="helvetica" textAnchor="middle">PDF</text>
    </svg>
  );
}

function ExcelIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      {/* Documento base verde */}
      <path d="M28 4H12a3 3 0 0 0-3 3v34a3 3 0 0 0 3 3h28a3 3 0 0 0 3-3V16L28 4z" fill="#1e6e42"/>
      {/* Esquina doblada */}
      <path d="M28 4l12 12H28V4z" fill="#145230"/>
      {/* Panel derecho con grilla */}
      <rect x="22" y="18" width="17" height="22" rx="1" fill="white" fillOpacity="0.15"/>
      {/* Líneas horizontales grilla */}
      <line x1="22" y1="23" x2="39" y2="23" stroke="white" strokeWidth="0.8" strokeOpacity="0.5"/>
      <line x1="22" y1="28" x2="39" y2="28" stroke="white" strokeWidth="0.8" strokeOpacity="0.5"/>
      <line x1="22" y1="33" x2="39" y2="33" stroke="white" strokeWidth="0.8" strokeOpacity="0.5"/>
      {/* Línea vertical grilla */}
      <line x1="30" y1="18" x2="30" y2="40" stroke="white" strokeWidth="0.8" strokeOpacity="0.5"/>
      {/* X grande blanca a la izquierda */}
      <text x="9" y="38" fontSize="22" fontWeight="900" fill="white" fontFamily="helvetica, Arial, sans-serif">X</text>
    </svg>
  );
}

// ─── colores base ─────────────────────────────────────────────
// #F1B53E con 60% opacidad sobre fondo blanco ≈ rgb(244, 198, 111)
// Usamos rgba directamente para respetar el fondo del botón
const PDF_COLOR   = "rgba(241, 181, 62, 0.60)";   // dorado 60%
const PDF_HOVER   = "rgba(241, 181, 62, 0.80)";
const EXCEL_COLOR = "rgba(241, 181, 62, 0.60)";   // mismo tono dorado 60%
const EXCEL_HOVER = "rgba(241, 181, 62, 0.80)";
const DISABLED    = "rgba(180, 180, 180, 0.50)";

export function ReportExportButtons({ title, rows, from, to, ingredientLabel, ingredientUnit, className }: Props) {
  const [loadingPDF, setLoadingPDF]     = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [hoverPDF, setHoverPDF]         = useState(false);
  const [hoverExcel, setHoverExcel]     = useState(false);
  const [error, setError]               = useState<string | null>(null);

  async function handleExport(type: "pdf" | "excel") {
    setError(null);
    if (type === "pdf") setLoadingPDF(true);
    else setLoadingExcel(true);

    try {
      if (rows.length === 0) throw new Error("No hay datos para exportar en este periodo.");
      const fileOpts = from && to ? {
  fileBaseName: buildReportFileBaseName(title, from, to),
  from,
  to,
  ingredientLabel,  
  ingredientUnit,   
} : undefined;
      if (type === "pdf") await exportToPDF(title, rows, fileOpts);
      else await exportToExcel(title, rows, fileOpts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al exportar.");
    } finally {
      if (type === "pdf") setLoadingPDF(false);
      else setLoadingExcel(false);
    }
  }

  const btnBase: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 7,
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 15,
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.18s, opacity 0.18s",
    color: "#753B19",
    letterSpacing: "0.01em",
  };

  return (
    <div className={className}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>

        {/* ── PDF (izquierda / primero) ── */}
        <button
          type="button"
          onClick={() => handleExport("pdf")}
          disabled={loadingPDF || loadingExcel}
          onMouseEnter={() => setHoverPDF(true)}
          onMouseLeave={() => setHoverPDF(false)}
          style={{
            ...btnBase,
            background: loadingPDF || loadingExcel ? DISABLED : hoverPDF ? PDF_HOVER : PDF_COLOR,
            cursor: loadingPDF || loadingExcel ? "not-allowed" : "pointer",
          }}
        >
          <PdfIcon size={16} />
          {loadingPDF ? "Exportando..." : "PDF"}
        </button>

        {/* ── Excel (derecha / segundo) ── */}
        <button
          type="button"
          onClick={() => handleExport("excel")}
          disabled={loadingExcel || loadingPDF}
          onMouseEnter={() => setHoverExcel(true)}
          onMouseLeave={() => setHoverExcel(false)}
          style={{
            ...btnBase,
            background: loadingExcel || loadingPDF ? DISABLED : hoverExcel ? EXCEL_HOVER : EXCEL_COLOR,
            cursor: loadingExcel || loadingPDF ? "not-allowed" : "pointer",
          }}
        >
          <ExcelIcon size={16} />
          {loadingExcel ? "Exportando..." : "Excel"}
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