import { getOrders } from "@/services/orders";
import { OrderTable } from "./order-table";

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div>
      <h1 className="text-2xl font-bold">Pedidos</h1>
      <p className="mt-1 text-neutral-600">Todos los pedidos. Actualiza estado o cancela.</p>
      <OrderTable orders={orders} />
    </div>
  );
}
