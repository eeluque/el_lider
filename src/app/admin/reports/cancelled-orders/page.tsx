import Image from "next/image";
import { Suspense } from "react";
import { InsightCard } from "@/components/admin/insight-card";
import { ReportBanner } from "@/components/admin/report-banner";
import { ReportDateRangeFiltersSuspense } from "@/components/admin/report-date-range-filters";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { ReportPagination } from "@/components/admin/report-pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { defaultReportRange, formatCentralDateTime, formatCentralRangeLabel } from "@/lib/date-range";
import { paginateSlice, parseReportPage, REPORT_PAGE_SIZE } from "@/lib/report-pagination";
import { getCancelledOrders } from "@/services/reports";

function computeInsights(
  orders: {
    cancellation_reason: string | null;
    total_price: number;
    order_items?: { menu_item?: { name: string } }[];
  }[]
) {
  const total = orders.length;
  const impact = orders.reduce((sum, order) => sum + Number(order.total_price), 0);
  const byReason: Record<string, number> = {};
  const byDish: Record<string, number> = {};

  for (const order of orders) {
    const reason = (order.cancellation_reason || "Sin motivo").trim();
    byReason[reason] = (byReason[reason] ?? 0) + 1;

    for (const line of order.order_items ?? []) {
      const name = line.menu_item?.name ?? "—";
      byDish[name] = (byDish[name] ?? 0) + 1;
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
    topDish: topDish
      ? { name: topDish[0], count: topDish[1], pct: total ? Math.round((topDish[1] / total) * 100) : 0 }
      : null,
  };
}

export default async function CancelledOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; page?: string }>;
}) {
  const params = await searchParams;
  const range = defaultReportRange();
  const from = params.from ?? range.from;
  const to = params.to ?? range.to;
  const page = parseReportPage(params.page);

  const orders = (await getCancelledOrders({ from, to })) as {
    id: string;
    order_number: string;
    created_at: string;
    customer_name: string;
    cancellation_reason: string | null;
    total_price: number;
    order_items?: { menu_item?: { name: string } }[];
  }[];

  const insights = computeInsights(orders);
  const pagedOrders = paginateSlice(orders, page, REPORT_PAGE_SIZE);
  const periodLabel = formatCentralRangeLabel(from, to);

  const exportRows = orders.map((order) => ({
    Pedido: order.order_number,
    Fecha: formatCentralDateTime(order.created_at),
    Cliente: order.customer_name,
    Platillos: order.order_items?.map((item) => item.menu_item?.name).filter(Boolean).join(", ") ?? "—",
    Motivo: order.cancellation_reason ?? "—",
    Importe: `L. ${Number(order.total_price).toFixed(2)}`,
  }));

  const clockIcon = <Image src="/icons/hourglass.png" alt="" width={28} height={28} />;
  const dishIcon = <Image src="/icons/dish.png" alt="" width={28} height={28} />;

  return (
    <div className="space-y-6 print:space-y-4">
      <ReportBanner
        title="Pedidos cancelados"
        subtitle={periodLabel}
        right={<ReportExportButtons title="Pedidos cancelados" rows={exportRows} from={from} to={to} />}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <InsightCard
          label="Motivo principal"
          value={insights.topReason?.text ?? "—"}
          subtext={insights.topReason ? `${insights.topReason.count} cancelaciones (${insights.topReason.pct}%)` : undefined}
          icon={clockIcon}
        />
        <InsightCard
          label="Platillo más afectado"
          value={insights.topDish?.name ?? "—"}
          subtext={insights.topDish ? `${insights.topDish.count} líneas (${insights.topDish.pct}%)` : undefined}
          icon={dishIcon}
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
        <div className="border-b border-primary/10 bg-card px-5 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-serif text-lg font-semibold text-foreground">Detalle de cancelaciones</h2>
            <p className="text-sm font-medium text-muted-foreground">Total impactado: L. {insights.impact.toFixed(2)}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="outfit w-full text-sm">
            <thead>
              <tr className="bg-primary/15 text-left text-xs font-semibold uppercase text-[rgb(117,59,25)]">
                <th className="p-3">N.º pedido</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Ítems</th>
                <th className="p-3">Motivo</th>
                <th className="p-3 text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              {pagedOrders.map((order) => (
                <tr key={order.id} className="border-b border-border/60 last:border-0 odd:bg-muted/30">
                  <td className="p-3 font-mono text-xs">{order.order_number}</td>
                  <td className="whitespace-nowrap p-3 text-muted-foreground">{formatCentralDateTime(order.created_at)}</td>
                  <td className="p-3">{order.customer_name}</td>
                  <td className="max-w-[200px] p-3 text-xs text-muted-foreground">
                    {order.order_items?.map((item) => item.menu_item?.name).filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="p-3">
                    <Badge variant="destructive" className="font-normal">
                      {order.cancellation_reason ?? "—"}
                    </Badge>
                  </td>
                  <td className="column-money-amount p-3 text-right font-medium">L. {Number(order.total_price).toFixed(2)}</td>
                </tr>
              ))}
              {pagedOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    No hay pedidos cancelados en este período.
                  </td>
                </tr>
              )}
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
