import { getActiveMenuItems } from "@/services/menu";
import { OrderCart } from "./order-cart";

export default async function OrderPage() {
  const items = await getActiveMenuItems();

  return (
    <div>
      <h1 className="text-2xl font-bold">Armar pedido</h1>
      <p className="mt-1 text-neutral-600">Agrega ítems y luego ve a pagar.</p>
      <OrderCart menuItems={items} />
    </div>
  );
}
