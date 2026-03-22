import { getIngredients } from "@/services/inventory";
import { todayRange } from "@/lib/date-range";
import { ReportBanner } from "@/components/admin/report-banner";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { ReportDateRangeFiltersSuspense } from "@/components/admin/report-date-range-filters";
import { Button } from "@/components/ui/button";

export default async function ListaInsumosPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const t = todayRange();
  const from = params.from ?? t.from;
  const to = params.to ?? t.to;

  const ingredients = await getIngredients(true);
  const periodLabel = `${from === to ? "Corte al " : "Periodo: "}${new Date(to + "T12:00:00").toLocaleDateString("es-HN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;

  const exportRows = ingredients.map((i) => {
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ReportBanner title="Lista de insumos" subtitle={periodLabel} />
        <ReportExportButtons title="Lista de insumos" rows={exportRows} from={from} to={to} />
      </div>

      <div className="rounded-xl border border-primary/10 bg-card p-4">
        <p className="mb-3 text-xs text-muted-foreground">
          El stock es el actual del sistema; el rango de fechas se usa para el contexto del reporte y la exportación.
        </p>
        <ReportDateRangeFiltersSuspense from={from} to={to} submitLabel="Actualizar periodo" />
      </div>

      <div className="overflow-hidden rounded-xl border border-primary/15 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[rgb(117,59,25)] text-left text-xs font-semibold uppercase text-white">
                <th className="p-3">Ingrediente</th>
                <th className="p-3">Unidad</th>
                <th className="p-3 text-right">Stock actual</th>
                <th className="p-3 text-right">Stock mínimo</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((i, idx) => {
                const curr = Number(i.current_stock);
                const min = Number(i.minimum_stock);
                const low = curr <= min;
                return (
                  <tr
                    key={i.id}
                    className={`border-b border-border/60 last:border-0 ${idx % 2 === 1 ? "bg-muted/40" : "bg-card"} ${low ? "bg-red-50/50 dark:bg-red-950/20" : ""}`}
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
      </div>
    </div>
  );
}
