import { getDeliveredOrdersInRange } from "@/services/reports";
import { defaultReportRange } from "@/lib/date-range";
import { ReportBanner } from "@/components/admin/report-banner";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { ReportDateRangeFiltersSuspense } from "@/components/admin/report-date-range-filters";
import { Badge } from "@/components/ui/badge";
import { ReportPagination } from "@/components/admin/report-pagination";
import { paginateSlice, parseReportPage, REPORT_PAGE_SIZE } from "@/lib/report-pagination";
import { Suspense } from "react";

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
    .map((i) => {
      const n = i.menu_item?.name ?? "—";
      return i.quantity > 1 ? `${i.quantity}× ${n}` : n;
    })
    .join(", ");
}

export default async function DeliveredOrdersDailyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; page?: string }>;
}) {
  const params = await searchParams;
  const dr = defaultReportRange();
  const from = params.from ?? dr.from;
  const to = params.to ?? dr.to;
  const page = parseReportPage(params.page);

  const orders = (await getDeliveredOrdersInRange(from, to)) as OrderRow[];
  const pagedOrders = paginateSlice(orders, page, REPORT_PAGE_SIZE);

  const periodLabel = `${new Date(from + "T12:00:00").toLocaleDateString("es-HN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })} – ${new Date(to + "T12:00:00").toLocaleDateString("es-HN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;

  const totalImport = orders.reduce((s, o) => s + Number(o.total_price), 0);
  const n = orders.length;

  const exportRows = orders.map((o) => ({
    "N° pedido": o.order_number,
    Cliente: o.customer_name,
    Productos: formatProducts(o.order_items),
    Importe: `L. ${Number(o.total_price).toFixed(2)}`,
    Estado: "Entregado",
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

      <div className="overflow-hidden rounded-2xl border border-primary/15 bg-card shadow-md">
        <div className="report-table-header flex flex-col gap-3 border-b border-primary/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="outfit font-serif text-lg font-semibold">Pedidos Entregados</h2>
          <p className="report-table-header-total text-right text-base font-semibold tabular-nums">
            Total:{" "}
            <span>L. {totalImport.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
        </div>

        {n === 0 ? (
          <p className="px-5 py-12 text-center text-muted-foreground">No hay pedidos entregados en este periodo.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="outfit report-table w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="report-table-columns text-left text-xs font-semibold uppercase tracking-wide">
                    <th className="border-b border-[rgb(232,213,176)] px-4 py-3">N° pedido</th>
                    <th className="border-b border-[rgb(232,213,176)] px-4 py-3">Cliente</th>
                    <th className="border-b border-[rgb(232,213,176)] px-4 py-3">Productos</th>
                    <th className="border-b border-[rgb(232,213,176)] px-4 py-3 text-right">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedOrders.map((o, idx) => (
                    <tr key={o.id} className={`border-b border-border/50 ${idx % 2 === 1 ? "bg-muted/25" : "bg-card"}`}>
                      <td className="px-4 py-4 align-top font-mono text-sm font-bold text-[rgb(117,59,25)]">#{o.order_number}</td>
                      <td className="px-4 py-4 align-top font-semibold text-foreground">{o.customer_name}</td>
                      <td className="max-w-[280px] px-4 py-4 align-top text-muted-foreground">{formatProducts(o.order_items)}</td>
                      <td className="column-money-amount px-4 py-4 align-top text-right font-bold tabular-nums text-foreground">
                        L. {Number(o.total_price).toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Suspense fallback={null}>
              <ReportPagination totalItems={n} pageSize={REPORT_PAGE_SIZE} />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}
