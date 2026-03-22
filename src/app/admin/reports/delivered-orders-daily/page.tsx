import { getDeliveredOrdersDaily } from "@/services/reports";
import { ReportBanner } from "@/components/admin/report-banner";
import { ExportToolbar } from "@/components/admin/export-toolbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function DeliveredOrdersDailyPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const date = params.date ?? new Date().toISOString().slice(0, 10);
  const orders = await getDeliveredOrdersDaily(date);
  const label = new Date(date + "T12:00:00").toLocaleDateString("es-HN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ReportBanner title="Pedidos entregados del día" subtitle={label} />
        <ExportToolbar />
      </div>

      <form className="flex flex-wrap items-end gap-2">
        <input type="date" name="date" defaultValue={date} className="rounded-lg border border-input px-2 py-2 text-sm" />
        <button type="submit" className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
          Ver fecha
        </button>
      </form>

      {orders.length === 0 ? (
        <p className="text-center text-muted-foreground">No hay pedidos entregados en esta fecha.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(orders as { id: string; order_number: string; customer_name: string; total_price: number; created_at: string; order_items?: { quantity: number; menu_item?: { name: string } }[] }[]).map((o) => (
            <Card key={o.id} className="border-primary/15 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="font-mono text-sm font-semibold">#{o.order_number}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground">{o.customer_name}</p>
                <ul className="mt-2 space-y-1 border-t border-border pt-2">
                  {o.order_items?.map((i, idx) => (
                    <li key={`${o.id}-${idx}`} className="flex justify-between">
                      <span>
                        ×{i.quantity} {i.menu_item?.name ?? "—"}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-right font-semibold text-foreground">Total L. {Number(o.total_price).toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
