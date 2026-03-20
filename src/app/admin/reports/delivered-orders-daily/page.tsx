import { getDeliveredOrdersDaily } from "@/services/reports";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function DeliveredOrdersDailyPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const date = params.date ?? new Date().toISOString().slice(0, 10);
  const orders = await getDeliveredOrdersDaily(date);

  return (
    <div>
      <h1 className="text-2xl font-bold">Entregados del día</h1>
      <p className="mt-1 text-neutral-600">Pedidos entregados. Fecha: {date}</p>
      <form className="mt-4 flex gap-2">
        <input type="date" name="date" defaultValue={date} className="rounded border px-2 py-1" />
        <button type="submit" className="rounded bg-neutral-800 px-3 py-1 text-white">Filtrar</button>
      </form>
      {orders.length === 0 ? (
        <p className="mt-4 text-neutral-500">No hay pedidos entregados en esta fecha.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {orders.map((o: { id: string; order_number: string; customer_name: string; total_price: number; created_at: string; order_items?: { quantity: number; menu_item?: { name: string } }[] }) => (
            <Card key={o.id}>
              <CardHeader className="pb-1">
                <span className="font-mono">{o.order_number}</span> — {o.customer_name}
              </CardHeader>
              <CardContent className="text-sm">
                Ítems: {o.order_items?.map((i) => `${i.menu_item?.name ?? "—"} × ${i.quantity}`).join(", ") ?? "—"}
                <br />
                Total: L {Number(o.total_price).toFixed(2)} — {new Date(o.created_at).toLocaleString("es-HN")}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
