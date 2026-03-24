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
    "Total consumo": Number(c.total.toFixed(4)),
  }));

  return (
    <div className="space-y-6">
      <div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <ReportExportButtons title="Consumo de Insumos y Rotación" rows={exportRows} from={from} to={to} />
        </div>
        <ReportBanner title="Consumo de Insumos y Rotación" subtitle={monthLabel} />
      </div>

      <div className="rounded-xl border border-primary/10 bg-card p-4">
        <ReportDateRangeFiltersSuspense from={from} to={to} submitLabel="Actualizar" />
      </div>

      <IngredientConsumptionPanels items={consumption} />
    </div>
  );
}
