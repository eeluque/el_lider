import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";
import { getOrders } from "@/services/orders";
import { AccountOrdersList } from "./account-orders-list";

export default async function AccountOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from("customer_profiles")
    .select("id")
    .eq("user_id", session.user.id)
    .single();
  const orders = profile ? await getOrders({ customerId: profile.id }) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold">Mis pedidos</h1>
      <p className="mt-1 text-neutral-600">Historial de órdenes y cancelación de pedidos en proceso.</p>
      {orders.length === 0 ? (
        <p className="mt-4 text-neutral-500">No tienes pedidos.</p>
      ) : (
        <AccountOrdersList orders={orders} />
      )}
    </div>
  );
}
