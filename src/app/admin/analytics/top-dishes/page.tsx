import { getTopDishes } from "@/services/reports";
import { defaultReportRange } from "@/lib/date-range";
import { ReportBanner } from "@/components/admin/report-banner";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { ReportDateRangeFiltersSuspense } from "@/components/admin/report-date-range-filters";
import { TopDishesReport } from "@/components/reports/TopDishesReport";
import { ReportPagination } from "@/components/admin/report-pagination";
import { paginateSlice, parseReportPage, REPORT_PAGE_SIZE } from "@/lib/report-pagination";
import { Suspense } from "react";

export default async function TopDishesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; page?: string }>;
}) {
  const params = await searchParams;
  const dr = defaultReportRange();
  const to = params.to ?? dr.to;
  const from = params.from ?? dr.from;
  const page = parseReportPage(params.page);
  const dishes = await getTopDishes({ from, to });
  const pagedDishes = paginateSlice(dishes, page, REPORT_PAGE_SIZE);

  const monthLabel = `${new Date(from + "T12:00:00").toLocaleDateString("es-HN", {
    month: "long",
    year: "numeric",
  })} (${from} – ${to})`;

  const exportRows = dishes.map((d, i) => ({
    "#": i + 1,
    Platillo: d.name,
    Categoría: d.category,
    Unidades: d.quantity,
    "Ingreso (aprox.)": d.revenue.toFixed(2),
  }));

  return (
    <div className="space-y-6">
      <div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <ReportExportButtons title="Platillos más Vendidos" rows={exportRows} from={from} to={to} />
        </div>
        <ReportBanner title="Platillos más Vendidos" subtitle={monthLabel} />
      </div>

      <div className="rounded-xl border border-primary/10 bg-card p-4">
        <ReportDateRangeFiltersSuspense from={from} to={to} submitLabel="Actualizar" />
      </div>

      {dishes.length === 0 ? (
        <p className="text-center text-muted-foreground">No hay ventas en el periodo seleccionado.</p>
      ) : (
        <>
          <TopDishesReport dishes={dishes} />

          <div className="mt-15 overflow-hidden rounded-xl border border-primary/15 bg-card shadow-sm">
            <div className="border-b border-primary/10 bg-[rgb(117,59,25)] px-4 py-3">
              <h2 className="font-semibold text-white">Listado completo</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary/15 text-left text-xs font-semibold uppercase text-[rgb(117,59,25)]">
                    <th className="p-3">#</th>
                    <th className="p-3">Platillo</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3 text-right">Unidades</th>
                    <th className="p-3 text-right">Ingreso (L.)</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedDishes.map((d, idx) => {
                    const rank = (page - 1) * REPORT_PAGE_SIZE + idx + 1;
                    return (
                      <tr key={d.id} className="border-b border-border/60 last:border-0 odd:bg-muted/30">
                        <td className="p-3 tabular-nums text-muted-foreground">{rank}</td>
                        <td className="p-3 font-medium">{d.name}</td>
                        <td className="p-3 text-muted-foreground">{d.category}</td>
                        <td className="p-3 text-right tabular-nums">{d.quantity}</td>
                        <td className="p-3 text-right tabular-nums column-money-amount">L. {d.revenue.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Suspense fallback={null}>
              <ReportPagination totalItems={dishes.length} pageSize={REPORT_PAGE_SIZE} />
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
}
