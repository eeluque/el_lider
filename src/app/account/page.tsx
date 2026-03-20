import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from("customer_profiles")
    .select("full_name, phone, points_balance")
    .eq("user_id", session.user.id)
    .single();

  return (
    <div>
      <h1 className="text-2xl font-bold">Mi cuenta</h1>
      <Card className="mt-4">
        <CardHeader><h3 className="font-semibold">Perfil</h3></CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p><span className="text-neutral-500">Nombre:</span> {profile?.full_name ?? session.user.name ?? "—"}</p>
          <p><span className="text-neutral-500">Correo:</span> {session.user.email}</p>
          <p><span className="text-neutral-500">Teléfono:</span> {profile?.phone ?? "—"}</p>
          <p><span className="text-neutral-500">Puntos:</span> {profile?.points_balance ?? 0}</p>
        </CardContent>
      </Card>
      <div className="mt-4 flex gap-4">
        <Link href="/account/orders"><span className="text-primary underline">Ver mis pedidos</span></Link>
        <Link href="/account/rewards"><span className="text-primary underline">Ver puntos</span></Link>
      </div>
    </div>
  );
}
