import { getCancelledOrders } from "@/services/reports";

export default async function CancelledOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; reason?: string }>;
}) {
  const params = await searchParams;
  const from = params.from ? params.from + "T00:00:00" : undefined;
  const to = params.to ? params.to + "T23:59:59" : undefined;
  const orders = await getCancelledOrders({ from, to, reason: params.reason });

  return (
    <div>
      <h1 className="text-2xl font-bold">Pedidos cancelados</h1>
      <p className="mt-1 text-neutral-600">Análisis de cancelaciones.</p>
      <form className="mt-4 flex flex-wrap gap-2">
        <input type="date" name="from" defaultValue={params.from} className="rounded border px-2 py-1" />
        <input type="date" name="to" defaultValue={params.to} className="rounded border px-2 py-1" />
        <input type="text" name="reason" placeholder="Motivo" defaultValue={params.reason} className="rounded border px-2 py-1" />
        <button type="submit" className="rounded bg-neutral-800 px-3 py-1 text-white">Filtrar</button>
      </form>
      <div className="mt-4 overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-neutral-50">
              <th className="p-2 text-left">Nº</th>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Cliente</th>
              <th className="p-2 text-left">Motivo</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: { id: string; order_number: string; created_at: string; customer_name: string; cancellation_reason: string | null; total_price: number }) => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="p-2 font-mono">{o.order_number}</td>
                <td className="p-2">{new Date(o.created_at).toLocaleString("es-HN")}</td>
                <td className="p-2">{o.customer_name}</td>
                <td className="p-2">{o.cancellation_reason ?? "—"}</td>
                <td className="p-2 text-right">L {Number(o.total_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
