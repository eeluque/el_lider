"use client";

import { Button } from "@/components/ui/button";

/** Botones de exportación (scaffold: impresión / descarga futura) */
export function ExportToolbar({ className }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ""}`}>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="bg-secondary/90"
        onClick={() => window.print()}
      >
        PDF
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-brand-green/50 text-brand-green hover:bg-brand-green/10"
        onClick={() => alert("Exportación Excel: conectar en una fase posterior (CSV/Sheet).")}
      >
        EXCEL
      </Button>
    </div>
  );
}
