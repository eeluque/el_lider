import { getDeliveredOrdersInRange } from "@/services/reports";
import { defaultReportRange } from "@/lib/date-range";
import { ReportBanner } from "@/components/admin/report-banner";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { ReportDateRangeFiltersSuspense } from "@/components/admin/report-date-range-filters";
import { Badge } from "@/components/ui/badge";

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
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const dr = defaultReportRange();
  const from = params.from ?? dr.from;
  const to = params.to ?? dr.to;

  const orders = (await getDeliveredOrdersInRange(from, to)) as OrderRow[];
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <ReportBanner title="Pedidos entregados" subtitle={periodLabel} />
        <ReportExportButtons title="Pedidos entregados" rows={exportRows} from={from} to={to} />
      </div>

      <div className="rounded-xl border border-primary/10 bg-card p-4">
        <ReportDateRangeFiltersSuspense from={from} to={to} submitLabel="Actualizar" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-primary/15 bg-card shadow-md">
        {/* Cabecera del bloque tabular */}
        <div className="flex flex-col gap-3 border-b border-primary/10 bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-serif text-lg font-semibold text-[rgb(117,59,25)]">Pedidos entregados</h2>
          <p className="text-right text-base font-semibold tabular-nums text-[rgb(117,59,25)]">
            Total:{" "}
            <span className="text-foreground">
              L. {totalImport.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </p>
        </div>

        {n === 0 ? (
          <p className="px-5 py-12 text-center text-muted-foreground">No hay pedidos entregados en este periodo.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="bg-[rgb(250,243,230)] text-left text-xs font-semibold uppercase tracking-wide text-[rgb(139,110,75)]">
                    <th className="border-b border-[rgb(232,213,176)] px-4 py-3">N° pedido</th>
                    <th className="border-b border-[rgb(232,213,176)] px-4 py-3">Cliente</th>
                    <th className="border-b border-[rgb(232,213,176)] px-4 py-3">Productos</th>
                    <th className="border-b border-[rgb(232,213,176)] px-4 py-3 text-right">Importe</th>
                    <th className="border-b border-[rgb(232,213,176)] px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, idx) => (
                    <tr
                      key={o.id}
                      className={`border-b border-border/50 ${idx % 2 === 1 ? "bg-muted/25" : "bg-card"}`}
                    >
                      <td className="px-4 py-4 align-top font-mono text-sm font-bold text-[rgb(117,59,25)]">
                        #{o.order_number}
                      </td>
                      <td className="px-4 py-4 align-top font-semibold text-foreground">{o.customer_name}</td>
                      <td className="max-w-[280px] px-4 py-4 align-top text-muted-foreground">{formatProducts(o.order_items)}</td>
                      <td className="px-4 py-4 align-top text-right font-bold tabular-nums text-foreground">
                        L. {Number(o.total_price).toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <Badge
                          className="rounded-full border border-brand-green/30 bg-brand-green/15 px-3 py-1 text-xs font-medium text-brand-green"
                          variant="outline"
                        >
                          ✓ Entregado
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-primary/10 bg-muted/20 px-5 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>
                Mostrando {n > 0 ? `1-${n}` : "0"} de {n} {n === 1 ? "registro" : "registros"}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Página</span>
                <span
                  className="inline-flex min-w-8 items-center justify-center rounded-md border border-primary/40 bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground shadow-sm"
                  aria-current="page"
                >
                  1
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
