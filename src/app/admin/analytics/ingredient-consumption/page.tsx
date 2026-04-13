import { IngredientConsumptionPanels } from "@/components/reports/IngredientConsumptionPanels";
import { ReportBanner } from "@/components/admin/report-banner";
import { ReportDateRangeFiltersSuspense } from "@/components/admin/report-date-range-filters";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { defaultReportRange } from "@/lib/date-range";
import { getIngredientConsumption } from "@/services/reports";

export default async function IngredientConsumptionPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const range = defaultReportRange();
  const to = params.to ?? range.to;
  const from = params.from ?? range.from;
  const consumption = await getIngredientConsumption({ from, to });
  const monthLabel = `${new Date(`${from}T12:00:00`).toLocaleDateString("es-HN", {
    month: "long",
    year: "numeric",
  })} (${from} – ${to})`;

  const exportRows = consumption.map((item, index) => ({
    "#": index + 1,
    Insumo: item.name,
    "Consumo en el período": Number(item.consumption.toFixed(4)),
    "Rotación por entradas": Number(item.turnover.toFixed(4)),
  }));

  return (
    <div className="space-y-6">
      <div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <ReportExportButtons title="Consumo de insumos y rotación" rows={exportRows} from={from} to={to} />
        </div>
        <ReportBanner title="Consumo de insumos y rotación" subtitle={monthLabel} />
      </div>

      <div className="rounded-xl border border-primary/10 bg-card p-4">
        <ReportDateRangeFiltersSuspense from={from} to={to} submitLabel="Actualizar" />
      </div>

      <IngredientConsumptionPanels items={consumption} />
    </div>
  );
}
