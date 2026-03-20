import { getPendingOrders } from "@/services/orders";
import { PendingOrdersTable } from "./pending-orders-table";

export default async function EmployeeOrdersPage() {
  const orders = await getPendingOrders();

  return (
    <div>
      <h1 className="text-2xl font-bold">Pedidos pendientes</h1>
      <p className="mt-1 text-neutral-600">Órdenes por preparar o entregar.</p>
      <PendingOrdersTable orders={orders} />
    </div>
  );
}
