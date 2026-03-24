import { getIngredients } from "@/services/inventory";
import { ReportBanner } from "@/components/admin/report-banner";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { Button } from "@/components/ui/button";
import { ReportPagination } from "@/components/admin/report-pagination";
import { paginateSlice, parseReportPage, REPORT_PAGE_SIZE } from "@/lib/report-pagination";
import { Suspense } from "react";

export default async function CriticalStockPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseReportPage(params.page);

  const ingredients = await getIngredients(true);

  const sorted = [...ingredients].sort((a, b) => {
  const currA = Number(a.current_stock);
  const minA = Number(a.minimum_stock);
  const lowA = currA <= minA;

  const currB = Number(b.current_stock);
  const minB = Number(b.minimum_stock);
  const lowB = currB <= minB;

  if (lowA && !lowB) return -1;
  if (!lowA && lowB) return 1;

  return currA - currB;
});

  const paged = paginateSlice(sorted, page, REPORT_PAGE_SIZE);

  const exportRows = sorted.map((i) => {
    const curr = Number(i.current_stock);
    const min = Number(i.minimum_stock);
    const low = curr <= min;
    return {
      Ingrediente: i.name,
      Unidad: i.unit,
      "Stock actual": curr,
      "Stock mínimo": min,
      Estado: low ? "Bajo — reponer" : "OK",
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <ReportExportButtons title="Lista de Insumos" rows={exportRows} />
        </div>
        <ReportBanner
          title="Lista de Insumos"
          subtitle={new Date().toLocaleDateString("es-HN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-primary/15 bg-card shadow-sm">
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
              {paged.map((i, idx) => {
                const curr = Number(i.current_stock);
                const min = Number(i.minimum_stock);
                const low = curr <= min;
                return (
                  <tr
                    key={i.id}
                    className={`border-b border-border/60 last:border-0 ${low ? "bg-red-50/50 dark:bg-red-950/20" : idx % 2 === 1 ? "bg-muted/40" : "bg-card"
                      }`}
                  >
                    <td className={`p-3 font-medium ${low ? "text-destructive" : "text-foreground"}`}>{i.name}</td>
                    <td className="p-3 text-muted-foreground">{i.unit}</td>
                    <td className="p-3 text-right tabular-nums">{curr}</td>
                    <td className="p-3 text-right tabular-nums">{min}</td>
                    <td className="p-3 text-right">
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
