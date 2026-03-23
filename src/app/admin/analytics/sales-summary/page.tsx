import { getSalesSummary } from "@/services/reports";
import { defaultReportRange } from "@/lib/date-range";
import { ReportBanner } from "@/components/admin/report-banner";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { ReportDateRangeFiltersSuspense } from "@/components/admin/report-date-range-filters";
import { SalesSummaryReport } from "@/components/reports/SalesSummaryReport";

export default async function SalesSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; groupBy?: string }>;
}) {
  const params = await searchParams;
  const dr = defaultReportRange();
  const to = params.to ?? dr.to;
  const from = params.from ?? dr.from;
  const groupBy = (params.groupBy as "day" | "week" | "month") ?? "day";
  const { byPeriod, total } = await getSalesSummary({ from, to, groupBy });
  const chartData = Object.entries(byPeriod)
    .map(([name, value]) => ({ name, ventas: value }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const monthLabel = `${new Date(from + "T12:00:00").toLocaleDateString("es-HN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })} – ${new Date(to + "T12:00:00").toLocaleDateString("es-HN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;

  const exportRows = [
    ...chartData.map((row) => ({
      Periodo: row.name,
      "Ventas (L.)": row.ventas.toFixed(2),
    })),
    { Periodo: "TOTAL", "Ventas (L.)": total.toFixed(2) },
  ];

  return (
    <div className="space-y-6">
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <ReportExportButtons title="Resumen de Ventas" rows={exportRows} from={from} to={to} />
          </div>
          <ReportBanner title="Resumen de Ventas" subtitle={monthLabel} />
        </div>

      <div className="rounded-xl border border-primary/10 bg-card p-4">
        <ReportDateRangeFiltersSuspense from={from} to={to} formFieldNames={["groupBy"]} submitLabel="Actualizar">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Agrupar</label>
            <select name="groupBy" defaultValue={groupBy} className="rounded-lg border border-input px-2 py-2 text-sm">
              <option value="day">Día</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
            </select>
          </div>
        </ReportDateRangeFiltersSuspense>
      </div>

      <SalesSummaryReport chartData={chartData} total={total} monthLabel={monthLabel} />
    </div>
  );
}
