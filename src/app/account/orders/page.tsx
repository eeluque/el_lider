import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";
import { getOrders } from "@/services/orders";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default async function AccountOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase.from("customer_profiles").select("id").eq("user_id", session.user.id).single();
  const orders = profile ? await getOrders({ customerId: profile.id }) : [];

  return (
    <div>
      <h1 className="text-2xl font-bold">Mis pedidos</h1>
      <p className="mt-1 text-neutral-600">Historial de órdenes.</p>
      {orders.length === 0 ? (
        <p className="mt-4 text-neutral-500">No tienes pedidos.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {orders.map((o) => (
            <Card key={o.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="font-mono">{o.order_number}</span>
                <Badge>{STATUS_LABELS[o.status] ?? o.status}</Badge>
              </CardHeader>
              <CardContent className="text-sm">
                {new Date(o.created_at).toLocaleString("es-HN")} — Total: L {Number(o.total_price).toFixed(2)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
