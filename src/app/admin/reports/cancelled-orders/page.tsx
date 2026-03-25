import { getCancelledOrders } from "@/services/reports";
import { defaultReportRange } from "@/lib/date-range";
import { ReportBanner } from "@/components/admin/report-banner";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { ReportDateRangeFiltersSuspense } from "@/components/admin/report-date-range-filters";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InsightCard } from "@/components/admin/insight-card";
import { ReportPagination } from "@/components/admin/report-pagination";
import { paginateSlice, parseReportPage, REPORT_PAGE_SIZE } from "@/lib/report-pagination";
import { Suspense } from "react";

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
  searchParams: Promise<{ from?: string; to?: string; page?: string }>;
}) {
  const params = await searchParams;
  const dr = defaultReportRange();
  const from = params.from ?? dr.from;
  const to = params.to ?? dr.to;
  const page = parseReportPage(params.page);

  const orders = (await getCancelledOrders({
    from,
    to,
  })) as {
    id: string;
    order_number: string;
    created_at: string;
    customer_name: string;
    cancellation_reason: string | null;
    total_price: number;
    order_items?: { menu_item?: { name: string } }[];
  }[];

  const insights = computeInsights(orders);
  const periodLabel = `${from} – ${to}`;

  const pagedOrders = paginateSlice(orders, page, REPORT_PAGE_SIZE);

  const exportRows = orders.map((o) => ({
    Pedido: o.order_number,
    Fecha: new Date(o.created_at).toLocaleString("es-HN"),
    Cliente: o.customer_name,
    Platillos: o.order_items?.map((i) => i.menu_item?.name).filter(Boolean).join(", ") ?? "—",
    Motivo: o.cancellation_reason ?? "—",
    Importe: `L. ${Number(o.total_price).toFixed(2)}`,
  }));

  const ClockIcon = <img src="/icons/hourglass.png" alt="" width={28} height={28} />;

  const DishIcon = <img src="/icons/dish.png" alt="" width={28} height={28} />;

  return (
    <div className="space-y-6 print:space-y-4">
      <div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <ReportExportButtons title="Reporte de pedidos cancelados" rows={exportRows} from={from} to={to} />
        </div>

        <div
          style={{
            background: "#753B19",
            borderRadius: 0,
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1
              style={{
                color: "#fff",
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: 20,
                margin: 0,
              }}
            >
              Reporte de Pedidos Cancelados
            </h1>
            <p style={{ color: "#e8c87a", fontSize: 12, margin: "4px 0 0", fontWeight: 400 }}>
              Análisis por fecha y platillo · {periodLabel}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  color: "#fff",
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 28,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {insights.total}
              </div>
              <div style={{ color: "#e8c87a", fontSize: 11, marginTop: 2 }}>cancelaciones</div>
            </div>

            <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.25)" }} />

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  color: "#fff",
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 28,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                L. {insights.impact.toFixed(2)}
              </div>
              <div style={{ color: "#e8c87a", fontSize: 11, marginTop: 2 }}>impacto</div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "15px solid #F1B53E", margin: "0px 0 0 0" }} />
      </div>
      <div className="flex gap-4">
        <InsightCard
          label="Motivo principal"
          value={insights.topReason?.text ?? "—"}
          subtext={insights.topReason ? `${insights.topReason.count} cancelaciones (${insights.topReason.pct}%)` : undefined}
          icon={ClockIcon}
        />
        <InsightCard
          label="Platillo más afectado"
          value={insights.topDish?.name ?? "—"}
          subtext={insights.topDish ? `${insights.topDish.count} líneas (${insights.topDish.pct}%)` : undefined}
          icon={DishIcon}
        />
      </div>

      <Card className="border-primary/15">
        <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-wide text-[rgb(117,59,25)]">Filtrar por fechas</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <ReportDateRangeFiltersSuspense from={from} to={to} submitLabel="Filtrar" />
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
          <table className="outfit w-full text-sm">
            <thead>
              <tr className="bg-primary/15 text-left text-xs font-semibold uppercase text-[rgb(117,59,25)]">
                <th className="p-3">Nº pedido</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Productos</th>
                <th className="p-3">Motivo</th>
                <th className="p-3 text-left">Importe</th>
              </tr>
            </thead>
            <tbody>
              {pagedOrders.map((o) => (
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
                  <td className="column-money-amount p-3 text-right font-medium">L. {Number(o.total_price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Suspense fallback={null}>
          <ReportPagination totalItems={orders.length} pageSize={REPORT_PAGE_SIZE} />
        </Suspense>
      </div>
    </div>
  );
}
