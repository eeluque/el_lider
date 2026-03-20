import { getSupabaseAdmin } from "@/lib/db";
import { EmployeesTable } from "./employees-table";

export default async function AdminEmployeesPage() {
  const supabase = getSupabaseAdmin();
  const { data: users } = await supabase
    .from("users")
    .select("id, email, full_name, role, active, created_at")
    .in("role", ["admin", "employee"])
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">Empleados</h1>
      <p className="mt-1 text-neutral-600">Usuarios admin y empleados.</p>
      <EmployeesTable users={(users ?? []) as { id: string; email: string; full_name: string | null; role: string; active: boolean; created_at: string }[]} />
    </div>
  );
}
