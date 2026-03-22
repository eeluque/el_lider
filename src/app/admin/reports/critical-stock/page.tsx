import { getIngredients } from "@/services/inventory";
import { ReportBanner } from "@/components/admin/report-banner";
import { ExportToolbar } from "@/components/admin/export-toolbar";
import { Button } from "@/components/ui/button";

export default async function ListaInsumosPage() {
  const ingredients = await getIngredients(true);
  const today = new Date().toLocaleDateString("es-HN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ReportBanner title="Lista de insumos" subtitle={`Hoy, ${today}`} />
        <div className="flex gap-2">
          <ExportToolbar />
        </div>
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
