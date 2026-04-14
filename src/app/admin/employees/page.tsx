import { getSupabaseAdmin } from "@/lib/db";
import { EmployeesTable } from "./employees-table";
import { CreateEmployeeForm } from "./create-employee-form";

export default async function AdminEmployeesPage() {
  const supabase = getSupabaseAdmin();
  const { data: users } = await supabase
    .from("users")
    .select("id, email, full_name, role, active, created_at")
    .in("role", ["admin", "employee"])
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Empleados</h1>
        <p className="mt-1 text-muted-foreground">Usuarios admin y empleados.</p>
      </div>
      <CreateEmployeeForm />
      <EmployeesTable users={(users ?? []) as { id: string; email: string; full_name: string | null; role: string; active: boolean; created_at: string }[]} />
    </div>
  );
}
