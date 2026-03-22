import { getIngredientConsumption } from "@/services/reports";
import { defaultReportRange } from "@/lib/date-range";
import { ReportBanner } from "@/components/admin/report-banner";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { ReportDateRangeFiltersSuspense } from "@/components/admin/report-date-range-filters";
import { IngredientConsumptionPanels } from "@/components/reports/IngredientConsumptionPanels";

export default async function IngredientConsumptionPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const dr = defaultReportRange();
  const to = params.to ?? dr.to;
  const from = params.from ?? dr.from;
  const consumption = await getIngredientConsumption({ from, to });
  const monthLabel = `${new Date(from + "T12:00:00").toLocaleDateString("es-HN", {
    month: "long",
    year: "numeric",
  })} (${from} – ${to})`;

  const exportRows = consumption.map((c, i) => ({
    "#": i + 1,
    Insumo: c.name,
    "Total salidas": c.total,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ReportBanner title="Reporte de consumo de insumos y rotación" subtitle={monthLabel} />
        <ReportExportButtons title="Consumo de insumos" rows={exportRows} from={from} to={to} />
      </div>

      <div className="rounded-xl border border-primary/10 bg-card p-4">
        <ReportDateRangeFiltersSuspense from={from} to={to} submitLabel="Actualizar" />
      </div>

      <IngredientConsumptionPanels items={consumption} />
    </div>
  );
}
