import { getIngredientConsumption } from "@/services/reports";
import { ReportBanner } from "@/components/admin/report-banner";
import { ExportToolbar } from "@/components/admin/export-toolbar";
import { IngredientConsumptionPanels } from "@/components/reports/IngredientConsumptionPanels";

export default async function IngredientConsumptionPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const to = params.to ?? new Date().toISOString().slice(0, 10);
  const from = params.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const consumption = await getIngredientConsumption({ from, to });
  const monthLabel = new Date(from + "T12:00:00").toLocaleDateString("es-HN", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ReportBanner title="Reporte de consumo de insumos y rotación" subtitle={monthLabel} />
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
        <button type="submit" className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
          Actualizar
        </button>
      </form>

      <IngredientConsumptionPanels items={consumption} />
    </div>
  );
}
