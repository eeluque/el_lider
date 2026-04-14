import { Suspense } from "react";

import { getDeliveredOrdersInRange } from "@/services/reports";
import { todayRange } from "@/lib/date-range";
import { ReportBanner } from "@/components/admin/report-banner";
import { ReportDateRangeFiltersSuspense } from "@/components/admin/report-date-range-filters";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { ReportPagination } from "@/components/admin/report-pagination";
import { defaultReportRange, formatCentralRangeLabel } from "@/lib/date-range";
import { paginateSlice, parseReportPage, REPORT_PAGE_SIZE } from "@/lib/report-pagination";

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  total_price: number;
  created_at: string;
  order_items?: { quantity: number; menu_item?: { name: string } }[];
};

function formatProducts(items: OrderRow["order_items"]) {
  if (!items?.length) return "—";

  return items
    .map((item) => {
      const name = item.menu_item?.name ?? "—";
      return item.quantity > 1 ? `${item.quantity}× ${name}` : name;
    })
    .join(", ");
}

export default async function DeliveredOrdersDailyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; page?: string }>;
}) {
  const params = await searchParams;
  const today = todayRange();
  const from = params.from ?? today.from;
  const to = params.to ?? today.to;
  const page = parseReportPage(params.page);

  const orders: OrderRow[] =
  from && to ? ((await getDeliveredOrdersInRange(from, to)) as OrderRow[]) : [];
  const pagedOrders = paginateSlice(orders, page, REPORT_PAGE_SIZE);

const isSameDay = from === to;

const formatDate = (dateStr: string) =>
  new Date(dateStr + "T12:00:00").toLocaleDateString("es-HN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const periodLabel =
  !from && !to
    ? "Selecciona un rango de fechas"
    : isSameDay
      ? formatDate(from)
      : `${formatDate(from)} – ${formatDate(to)}`;

  const totalImport = orders.reduce((sum, order) => sum + Number(order.total_price), 0);

  const exportRows = orders.map((order) => ({
    "N.º pedido": order.order_number,
    Cliente: order.customer_name,
    Productos: formatProducts(order.order_items),
    Importe: `L. ${Number(order.total_price).toFixed(2)}`,
    Estado: "Entregado",
  }));

  return (
    <div className="space-y-6">
      <div style={{ display: "flex", justifyContent: "flex-end", margin: "0 0 10px" }}>
      <ReportExportButtons title="Pedidos entregados" rows={exportRows} from={from} to={to} />
    </div>
    <ReportBanner
      title="Pedidos entregados"
      subtitle={periodLabel}
    />

      <div className="rounded-xl border border-primary/10 bg-card p-4 flex items-center justify-between gap-4 flex-wrap self-center">
        <ReportDateRangeFiltersSuspense from={from} to={to} submitLabel="Actualizar" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-primary/15 bg-card shadow-md">
        <div className="report-table-header flex flex-col gap-3 border-b border-primary/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="outfit font-serif text-lg font-semibold">Pedidos entregados</h2>
          <p className="report-table-header-total text-right text-base font-semibold tabular-nums">
            Total: <span>L. {totalImport.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
        </div>

        {orders.length === 0 ? (
          <p className="px-5 py-12 text-center text-muted-foreground">No hay pedidos entregados en este período.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="outfit report-table w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="report-table-columns text-left text-xs font-semibold uppercase tracking-wide">
                    <th className="border-b border-[rgb(232,213,176)] px-4 py-3">N.º pedido</th>
                    <th className="border-b border-[rgb(232,213,176)] px-4 py-3">Cliente</th>
                    <th className="border-b border-[rgb(232,213,176)] px-4 py-3">Productos</th>
                    <th className="border-b border-[rgb(232,213,176)] px-4 py-3 text-right">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedOrders.map((order, index) => (
                    <tr key={order.id} className={`border-b border-border/50 ${index % 2 === 1 ? "bg-muted/25" : "bg-card"}`}>
                      <td className="px-4 py-4 align-top font-mono text-sm font-bold text-[rgb(117,59,25)]">#{order.order_number}</td>
                      <td className="px-4 py-4 align-top font-semibold text-foreground">{order.customer_name}</td>
                      <td className="max-w-[280px] px-4 py-4 align-top text-muted-foreground">{formatProducts(order.order_items)}</td>
                      <td className="column-money-amount px-4 py-4 align-top text-right font-bold tabular-nums text-foreground">
                        L. {Number(order.total_price).toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Suspense fallback={null}>
              <ReportPagination totalItems={orders.length} pageSize={REPORT_PAGE_SIZE} />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}
