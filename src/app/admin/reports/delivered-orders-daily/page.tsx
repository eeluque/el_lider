import { getDeliveredOrdersInRange } from "@/services/reports";
import { defaultReportRange } from "@/lib/date-range";
import { ReportBanner } from "@/components/admin/report-banner";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { ReportDateRangeFiltersSuspense } from "@/components/admin/report-date-range-filters";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function DeliveredOrdersDailyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const dr = defaultReportRange();
  const from = params.from ?? dr.from;
  const to = params.to ?? dr.to;

  const orders = await getDeliveredOrdersInRange(from, to);
  const periodLabel = `${new Date(from + "T12:00:00").toLocaleDateString("es-HN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })} – ${new Date(to + "T12:00:00").toLocaleDateString("es-HN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;

  const exportRows = (
    orders as {
      order_number: string;
      created_at: string;
      customer_name: string;
      total_price: number;
      order_items?: { quantity: number; menu_item?: { name: string } }[];
    }[]
  ).map((o) => ({
    Pedido: o.order_number,
    Fecha: new Date(o.created_at).toLocaleString("es-HN"),
    Cliente: o.customer_name,
    Detalle:
      o.order_items?.map((i) => `×${i.quantity} ${i.menu_item?.name ?? "—"}`).join("; ") ?? "—",
    Total: `L. ${Number(o.total_price).toFixed(2)}`,
  }));

  return (
    <div className="space-y-6">
      <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
            <ReportExportButtons title="Pedidos Entregados" rows={exportRows} from={from} to={to} />
          </div>
          <ReportBanner title="Pedidos Entregados" subtitle={periodLabel} />
      </div>

      <div className="rounded-xl border border-primary/10 bg-card p-4">
        <ReportDateRangeFiltersSuspense from={from} to={to} submitLabel="Actualizar" />
      </div>

      {orders.length === 0 ? (
        <p className="text-center text-muted-foreground">No hay pedidos entregados en este periodo.</p>
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
