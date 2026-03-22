import { getCancelledOrders } from "@/services/reports";
import { ReportBanner } from "@/components/admin/report-banner";
import { ExportToolbar } from "@/components/admin/export-toolbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function computeInsights(
  orders: {
    cancellation_reason: string | null;
    total_price: number;
    order_items?: { menu_item?: { name: string } }[];
  }[]
) {
  const total = orders.length;
  const impact = orders.reduce((s, o) => s + Number(o.total_price), 0);
  const byReason: Record<string, number> = {};
  const byDish: Record<string, number> = {};
  for (const o of orders) {
    const r = (o.cancellation_reason || "Sin motivo").trim();
    byReason[r] = (byReason[r] ?? 0) + 1;
    for (const li of o.order_items ?? []) {
      const n = (li as { menu_item?: { name: string } }).menu_item?.name ?? "—";
      byDish[n] = (byDish[n] ?? 0) + 1;
    }
  }
  const topReason = Object.entries(byReason).sort((a, b) => b[1] - a[1])[0];
  const topDish = Object.entries(byDish).sort((a, b) => b[1] - a[1])[0];
  return {
    total,
    impact,
    topReason: topReason ? { text: topReason[0], count: topReason[1], pct: total ? Math.round((topReason[1] / total) * 100) : 0 } : null,
    topDish: topDish ? { name: topDish[0], count: topDish[1], pct: total ? Math.round((topDish[1] / total) * 100) : 0 } : null,
  };
}

export default async function CancelledOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; reason?: string }>;
}) {
  const params = await searchParams;
  const from = params.from ? params.from + "T00:00:00" : undefined;
  const to = params.to ? params.to + "T23:59:59" : undefined;
  const orders = await getCancelledOrders({ from, to, reason: params.reason });
  const insights = computeInsights(orders as Parameters<typeof computeInsights>[0]);
  const periodLabel =
    params.from && params.to
      ? `${params.from} – ${params.to}`
      : "Todos los registros";

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ReportBanner
          title="Reporte de pedidos cancelados"
          subtitle={`Análisis por fecha, motivo y platillo · ${periodLabel}`}
          right={
            <div className="flex flex-col items-end gap-1 text-right text-sm text-primary-foreground">
              <span className="font-semibold">{insights.total} cancelaciones</span>
              <span>L. {insights.impact.toFixed(2)} impacto</span>
            </div>
          }
        />
        <ExportToolbar />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Motivo principal</p>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-lg font-semibold text-foreground">
              {insights.topReason?.text ?? "—"}
            </p>
            {insights.topReason && (
              <p className="mt-1 text-sm text-muted-foreground">
                {insights.topReason.count} cancelaciones ({insights.topReason.pct}%)
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Platillo más afectado</p>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-lg font-semibold text-foreground">{insights.topDish?.name ?? "—"}</p>
            {insights.topDish && (
              <p className="mt-1 text-sm text-muted-foreground">
                {insights.topDish.count} líneas ({insights.topDish.pct}%)
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/15">
        <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-wide text-[rgb(117,59,25)]">Filtrar cancelaciones</p>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Desde</label>
              <input type="date" name="from" defaultValue={params.from} className="rounded-lg border border-input bg-background px-2 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Hasta</label>
              <input type="date" name="to" defaultValue={params.to} className="rounded-lg border border-input bg-background px-2 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Motivo</label>
              <input type="text" name="reason" placeholder="Todos" defaultValue={params.reason} className="rounded-lg border border-input bg-background px-2 py-2 text-sm" />
            </div>
            <Button type="submit" variant="secondary">
              Filtrar
            </Button>
            <a href="/admin/reports/cancelled-orders" className="text-sm text-secondary underline">
              Limpiar
            </a>
          </form>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-xl border border-primary/15 bg-card shadow-sm">
        <div className="border-b border-primary/10 bg-[rgb(117,59,25)] px-4 py-3">
          <h2 className="font-semibold text-white">Detalle de cancelaciones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary/15 text-left text-xs font-semibold uppercase text-[rgb(117,59,25)]">
                <th className="p-3">Nº pedido</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Ítems</th>
                <th className="p-3">Motivo</th>
                <th className="p-3 text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(
                (o: {
                  id: string;
                  order_number: string;
                  created_at: string;
                  customer_name: string;
                  cancellation_reason: string | null;
                  total_price: number;
                  order_items?: { menu_item?: { name: string } }[];
                }) => (
                  <tr key={o.id} className="border-b border-border/60 last:border-0 odd:bg-muted/30">
                    <td className="p-3 font-mono text-xs">{o.order_number}</td>
                    <td className="p-3 whitespace-nowrap text-muted-foreground">
                      {new Date(o.created_at).toLocaleString("es-HN")}
                    </td>
                    <td className="p-3">{o.customer_name}</td>
                    <td className="max-w-[200px] p-3 text-xs text-muted-foreground">
                      {o.order_items?.map((i) => (i as { menu_item?: { name: string } }).menu_item?.name).filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="p-3">
                      <Badge variant="destructive" className="font-normal">
                        {o.cancellation_reason ?? "—"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-medium">L. {Number(o.total_price).toFixed(2)}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
