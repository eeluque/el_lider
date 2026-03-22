import { getSalesSummary } from "@/services/reports";
import { ReportBanner } from "@/components/admin/report-banner";
import { ExportToolbar } from "@/components/admin/export-toolbar";
import { SalesSummaryReport } from "@/components/reports/SalesSummaryReport";

export default async function SalesSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; groupBy?: string }>;
}) {
  const params = await searchParams;
  const to = params.to ?? new Date().toISOString().slice(0, 10);
  const from = params.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const groupBy = (params.groupBy as "day" | "week" | "month") ?? "day";
  const { byPeriod, total } = await getSalesSummary({ from, to, groupBy });
  const chartData = Object.entries(byPeriod)
    .map(([name, value]) => ({ name, ventas: value }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const monthLabel = new Date(from + "T12:00:00").toLocaleDateString("es-HN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ReportBanner title="Resumen de ventas" subtitle={monthLabel} />
        <ExportToolbar />
      </div>

      <form className="flex flex-wrap items-end gap-2 rounded-xl border border-primary/10 bg-card p-4">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Desde</label>
          <input type="date" name="from" defaultValue={from} className="rounded-lg border border-input px-2 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Hasta</label>
          <input type="date" name="to" defaultValue={to} className="rounded-lg border border-input px-2 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Agrupar</label>
          <select name="groupBy" defaultValue={groupBy} className="rounded-lg border border-input px-2 py-2 text-sm">
            <option value="day">Día</option>
            <option value="week">Semana</option>
            <option value="month">Mes</option>
          </select>
        </div>
        <button type="submit" className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
          Actualizar
        </button>
      </form>

      <SalesSummaryReport chartData={chartData} total={total} monthLabel={monthLabel} />
    </div>
  );
}
