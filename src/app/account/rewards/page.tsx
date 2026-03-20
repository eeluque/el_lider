import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";

export default async function AccountRewardsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from("customer_profiles")
    .select("id, points_balance")
    .eq("user_id", session.user.id)
    .single();
  type Tx = { id: string; created_at: string; points_change: number; reason: string | null };
  let transactions: Tx[] = [];
  if (profile?.id) {
    const { data } = await supabase
      .from("reward_transactions")
      .select("*")
      .eq("customer_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);
    transactions = (data ?? []) as Tx[];
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Puntos de recompensa</h1>
      <p className="mt-1 text-neutral-600">Saldo actual: <strong>{profile?.points_balance ?? 0}</strong> puntos.</p>
      <p className="mt-2 text-sm text-neutral-500">Regla MVP: 1 punto por cada L50 en pedidos completados (configurable más adelante).</p>
      {transactions.length > 0 ? (
        <div className="mt-4 overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-neutral-50">
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-right">Cambio</th>
                <th className="p-2 text-left">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="p-2">{new Date(t.created_at).toLocaleString("es-HN")}</td>
                  <td className="p-2 text-right">{t.points_change > 0 ? "+" : ""}{t.points_change}</td>
                  <td className="p-2">{t.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 text-neutral-500">Aún no hay movimientos de puntos.</p>
      )}
    </div>
  );
}
