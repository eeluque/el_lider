import { getKardexWithBalance } from "@/services/reports";
import { getIngredients } from "@/services/inventory";
import { ReportBanner } from "@/components/admin/report-banner";
import { ExportToolbar } from "@/components/admin/export-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function InventoryKardexPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; ingredientId?: string }>;
}) {
  const params = await searchParams;
  const ingredients = await getIngredients(true);
  const firstId = ingredients[0]?.id;
  const ingredientId = params.ingredientId || firstId || "";
  const from = params.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const to = params.to ?? new Date().toISOString().slice(0, 10);
  const fromIso = from + "T00:00:00";
  const toIso = to + "T23:59:59";

  const data = ingredientId ? await getKardexWithBalance(ingredientId, fromIso, toIso) : { ingredient: null, movements: [] };
  const ing = data.ingredient as { name: string; unit: string; current_stock: number } | null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ReportBanner
          title="Kárdex de movimientos de insumos"
          subtitle={`Periodo: ${from} – ${to}`}
        />
        <ExportToolbar />
      </div>

      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <form className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Desde</label>
              <input type="date" name="from" defaultValue={from} className="rounded-lg border border-input px-2 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Hasta</label>
              <input type="date" name="to" defaultValue={to} className="rounded-lg border border-input px-2 py-2 text-sm" />
            </div>
            <div className="min-w-[200px]">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Ingrediente</label>
              <select name="ingredientId" defaultValue={ingredientId} className="w-full rounded-lg border border-input px-2 py-2 text-sm" required>
                {ingredients.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="secondary">
              Filtrar
            </Button>
          </form>
        </CardContent>
      </Card>

      {ing && (
        <div className="overflow-hidden rounded-xl border border-primary/20 shadow-sm">
          <div className="flex flex-col justify-between gap-2 bg-[rgb(117,59,25)] px-4 py-3 text-white sm:flex-row sm:items-center">
            <div>
              <p className="font-serif text-lg font-semibold">{ing.name}</p>
              <p className="text-sm text-white/80">
                Unidad: {ing.unit} · Stock actual: {Number(ing.current_stock)} {ing.unit}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary/20 text-left text-xs font-semibold uppercase text-[rgb(117,59,25)]">
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Detalle / motivo</th>
                  <th className="p-3 text-right">Entrada</th>
                  <th className="p-3 text-right">Salida</th>
                  <th className="p-3 text-right">Saldo (período)</th>
                </tr>
              </thead>
              <tbody>
                {data.movements.map(
                  (m: {
                    id: string;
                    created_at: string;
                    movement_type: string;
                    quantity: number;
                    reason: string | null;
                    balance: number;
                  }) => {
                    const isOut = m.movement_type === "OUT";
                    const q = Number(m.quantity);
                    return (
                      <tr key={m.id} className="border-b border-border/50 odd:bg-muted/20">
                        <td className="p-3 whitespace-nowrap text-muted-foreground">
                          {new Date(m.created_at).toLocaleString("es-HN")}
                        </td>
                        <td className="p-3">
                          {isOut ? (
                            <Badge className="bg-secondary/25 text-secondary-foreground">Salida</Badge>
                          ) : m.movement_type === "ADJUSTMENT" ? (
                            <Badge variant="outline">Ajuste</Badge>
                          ) : (
                            <Badge className="bg-brand-green/20 text-brand-green">Entrada</Badge>
                          )}
                        </td>
                        <td className="p-3">{m.reason ?? "—"}</td>
                        <td className="p-3 text-right font-medium text-brand-green">
                          {!isOut ? `+${q}` : "—"}
                        </td>
                        <td className="p-3 text-right font-medium text-secondary">
                          {isOut ? `-${q}` : "—"}
                        </td>
                        <td className="p-3 text-right font-semibold">{m.balance}</td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
