import { getCancelledOrders } from "@/services/reports";
import { defaultReportRange } from "@/lib/date-range";
import { ReportBanner } from "@/components/admin/report-banner";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { ReportDateRangeFiltersSuspense } from "@/components/admin/report-date-range-filters";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    topReason: topReason
      ? { text: topReason[0], count: topReason[1], pct: total ? Math.round((topReason[1] / total) * 100) : 0 }
      : null,
    topDish: topDish ? { name: topDish[0], count: topDish[1], pct: total ? Math.round((topDish[1] / total) * 100) : 0 } : null,
  };
}

export default async function CancelledOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; reason?: string }>;
}) {
  const params = await searchParams;
  const dr = defaultReportRange();
  const from = params.from ?? dr.from;
  const to = params.to ?? dr.to;

  const orders = await getCancelledOrders({
    from,
    to,
    reason: params.reason,
  });
  const insights = computeInsights(orders as Parameters<typeof computeInsights>[0]);
  const periodLabel = `${from} – ${to}`;

  const exportRows = (
    orders as {
      order_number: string;
      created_at: string;
      customer_name: string;
      cancellation_reason: string | null;
      total_price: number;
      order_items?: { menu_item?: { name: string } }[];
    }[]
  ).map((o) => ({
    Pedido: o.order_number,
    Fecha: new Date(o.created_at).toLocaleString("es-HN"),
    Cliente: o.customer_name,
    Platillos: o.order_items?.map((i) => i.menu_item?.name).filter(Boolean).join(", ") ?? "—",
    Motivo: o.cancellation_reason ?? "—",
    Importe: `L. ${Number(o.total_price).toFixed(2)}`,
  }));

  return (
    <div className="space-y-6 print:space-y-4">
      <div>
  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
    <ReportExportButtons title="Reporte de pedidos cancelados" rows={exportRows} from={from} to={to} />
  </div>

  {/* ── Banner café estilo imagen ── */}
  <div style={{
    background: "#753B19",
    borderRadius: 0,
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }}>
    {/* Izquierda: título + subtítulo */}
    <div>
      <h1 style={{
        color: "#fff",
        fontFamily: "'Playfair Display', serif",
        fontWeight: 700,
        fontSize: 20,
        margin: 0,
      }}>
        Reporte de Pedidos Cancelados
      </h1>
      <p style={{ color: "#e8c87a", fontSize: 12, margin: "4px 0 0", fontWeight: 400 }}>
        Análisis por fecha, motivo y platillo · {periodLabel}
      </p>
    </div>

    {/* Derecha: métricas con separador */}
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
          {insights.total}
        </div>
        <div style={{ color: "#e8c87a", fontSize: 11, marginTop: 2 }}>cancelaciones</div>
      </div>

      {/* Línea separadora vertical */}
      <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.25)" }} />

      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#fff", fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
          L. {insights.impact.toFixed(2)}
        </div>
        <div style={{ color: "#e8c87a", fontSize: 11, marginTop: 2 }}>impacto</div>
      </div>
    </div>
  </div>

  {/* ── Línea dorada ── */}
  <div style={{ borderTop: "15px solid #F1B53E", margin: "0px 0 0 0" }} />
</div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="pb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Motivo principal</p>
          </CardHeader>
          <CardContent>
            <p className="font-serif text-lg font-semibold text-foreground">{insights.topReason?.text ?? "—"}</p>
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
        <CardContent className="space-y-4">
          <ReportDateRangeFiltersSuspense from={from} to={to} formFieldNames={["reason"]} submitLabel="Filtrar">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Motivo</label>
              <input
                type="text"
                name="reason"
                placeholder="Todos"
                defaultValue={params.reason}
                className="rounded-lg border border-input bg-background px-2 py-2 text-sm"
              />
            </div>
          </ReportDateRangeFiltersSuspense>
          <a href="/admin/reports/cancelled-orders" className="text-sm text-secondary underline">
            Limpiar filtros
          </a>
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
                    <td className="p-3 whitespace-nowrap text-muted-foreground">{new Date(o.created_at).toLocaleString("es-HN")}</td>
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
