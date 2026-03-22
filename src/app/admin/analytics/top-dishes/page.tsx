import { getTopDishes } from "@/services/reports";
import { defaultReportRange } from "@/lib/date-range";
import { ReportBanner } from "@/components/admin/report-banner";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { ReportDateRangeFiltersSuspense } from "@/components/admin/report-date-range-filters";
import { TopDishesReport } from "@/components/reports/TopDishesReport";

export default async function TopDishesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const dr = defaultReportRange();
  const to = params.to ?? dr.to;
  const from = params.from ?? dr.from;
  const dishes = await getTopDishes({ from, to });
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ReportBanner title="Platillos más vendidos" subtitle={`Top · ${monthLabel}`} />
        <ReportExportButtons title="Platillos más vendidos" rows={exportRows} from={from} to={to} />
      </div>

      <div className="rounded-xl border border-primary/10 bg-card p-4">
        <ReportDateRangeFiltersSuspense from={from} to={to} submitLabel="Actualizar" />
      </div>

      {dishes.length === 0 ? (
        <p className="text-center text-muted-foreground">No hay ventas en el periodo seleccionado.</p>
      ) : (
        <TopDishesReport dishes={dishes} />
      )}
    </div>
  );
}
