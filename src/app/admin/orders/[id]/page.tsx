import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/services/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pedido {order.order_number}</h1>
        <Link href="/admin/orders">
          <Button variant="outline">Volver</Button>
        </Link>
      </div>
      <div className="mt-4 space-y-4 rounded-lg border bg-white p-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <p><span className="text-neutral-500">Cliente:</span> {order.customer_name}</p>
          <p><span className="text-neutral-500">Teléfono:</span> {order.customer_phone}</p>
          <p><span className="text-neutral-500">Fecha:</span> {new Date(order.created_at).toLocaleString("es-HN")}</p>
          <p><span className="text-neutral-500">Estado:</span> <Badge>{STATUS_LABELS[order.status] ?? order.status}</Badge></p>
          {order.cancellation_reason && (
            <p className="sm:col-span-2"><span className="text-neutral-500">Motivo cancelación:</span> {order.cancellation_reason}</p>
          )}
        </div>
        <div>
          <h3 className="font-medium">Ítems</h3>
          <ul className="mt-2 space-y-1">
            {order.order_items?.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span>{item.menu_item?.name ?? "—"} × {item.quantity}</span>
                <span>L {Number(item.subtotal).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 font-medium">Total: L {Number(order.total_price).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
