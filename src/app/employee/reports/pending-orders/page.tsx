import { getPendingOrders } from "@/services/orders";
import { PendingOrdersTable } from "@/app/employee/orders/pending-orders-table";

export default async function PendingOrdersReportPage() {
  const orders = await getPendingOrders();
  return (
    <div>
      <h1 className="text-2xl font-bold">Reporte: Pedidos pendientes</h1>
      <p className="mt-1 text-neutral-600">Órdenes no entregadas.</p>
      <PendingOrdersTable orders={orders} />
    </div>
  );
}
