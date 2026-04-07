import { getActiveMenuItems } from "@/services/menu";
import { getOrdersWithItemsInRange } from "@/services/orders";
import { CreateManualOrderForm } from "./create-manual-order-form";
import { OrdersTodayClient } from "./orders-today-client";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const currentDate = params.date ?? new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Tegucigalpa",
  });
  const from = `${currentDate}T00:00:00`;
  const to = `${currentDate}T23:59:59`;
  const [orders, menuItems] = await Promise.all([
    getOrdersWithItemsInRange(from, to),
    getActiveMenuItems(),
  ]);
  const dateLabel = new Date(currentDate + "T12:00:00").toLocaleDateString("es-HN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <CreateManualOrderForm menuItems={menuItems} />
      <OrdersTodayClient orders={orders} dateLabel={dateLabel} currentDate={currentDate} />
    </div>
  );
}
