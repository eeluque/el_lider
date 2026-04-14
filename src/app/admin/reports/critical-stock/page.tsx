import { Suspense } from "react";
import { ReportBanner } from "@/components/admin/report-banner";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { ReportPagination } from "@/components/admin/report-pagination";
import { Button } from "@/components/ui/button";
import { formatCentralDate, todayRange } from "@/lib/date-range";
import { paginateSlice, parseReportPage, REPORT_PAGE_SIZE } from "@/lib/report-pagination";
import { getIngredients } from "@/services/inventory";

export default async function CriticalStockPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseReportPage(params.page);

  const ingredients = await getIngredients(true);
  const sorted = [...ingredients].sort((a, b) => {
    const aCurrent = Number(a.current_stock);
    const aMinimum = Number(a.minimum_stock);
    const bCurrent = Number(b.current_stock);
    const bMinimum = Number(b.minimum_stock);
    const aLow = aCurrent <= aMinimum;
    const bLow = bCurrent <= bMinimum;

    if (aLow && !bLow) return -1;
    if (!aLow && bLow) return 1;
    return aCurrent - bCurrent;
  });

  const paged = paginateSlice(sorted, page, REPORT_PAGE_SIZE);
  const exportRows = sorted.map((ingredient) => {
    const current = Number(ingredient.current_stock);
    const minimum = Number(ingredient.minimum_stock);
    const low = current <= minimum;

    return {
      Ingrediente: ingredient.name,
      Unidad: ingredient.unit,
      "Stock actual": current,
      "Stock mínimo": minimum,
      Estado: low ? "Bajo - reponer" : "OK",
    };
  });

  const today = todayRange().from;

  return (
    <div className="space-y-3">
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <ReportExportButtons
          title="Lista de insumos"
          rows={exportRows}
          from={today}
          to={today}
          subtitlePrefix="Hoy"
        />
      </div>
      <ReportBanner
        title="Lista de insumos"
        subtitle={formatCentralDate(new Date(), {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      />

      <div className="overflow-hidden rounded-xl border border-primary/15 bg-card shadow-sm">
        <div className="border-b border-primary/10 bg-card px-5 py-4">
          <h2 className="font-serif text-lg font-semibold text-foreground">Stock crítico</h2>
          <p className="mt-1 text-sm text-muted-foreground">Insumos con existencias iguales o por debajo del mínimo definido.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[rgb(117,59,25)] text-left text-xs font-semibold uppercase text-white">
                <th className="p-3 text-center">Ingrediente</th>
                <th className="p-3 text-center">Unidad</th>
                <th className="p-3 text-center">Stock actual</th>
                <th className="p-3 text-center">Stock mínimo</th>
                <th className="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((ingredient, index) => {
                const current = Number(ingredient.current_stock);
                const minimum = Number(ingredient.minimum_stock);
                const low = current <= minimum;

                return (
                  <tr
                    key={ingredient.id}
                    className={`border-b border-border/60 last:border-0 ${
                      low ? "bg-red-50/50 dark:bg-red-950/20" : index % 2 === 1 ? "bg-muted/40" : "bg-card"
                    }`}
                  >
                    <td className={`p-3 font-medium ${low ? "text-destructive" : "text-foreground"}`}>{ingredient.name}</td>
                    <td className="p-3 text-muted-foreground">{ingredient.unit}</td>
                    <td className="p-3 text-right tabular-nums">{current}</td>
                    <td className="p-3 text-right tabular-nums">{minimum}</td>
                    <td className="p-3 text-center">
                      {low ? (
                        <Button type="button" size="sm" variant="destructive" className="text-xs">
                          Reponer
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No hay insumos críticos en este momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Suspense fallback={null}>
          <ReportPagination totalItems={sorted.length} pageSize={REPORT_PAGE_SIZE} />
        </Suspense>
      </div>
    </div>
  );
}
