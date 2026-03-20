import Link from "next/link";

export default function EmployeeDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Empleado</h1>
      <p className="mt-1 text-neutral-600">Vista operativa.</p>
      <div className="mt-6 flex gap-4">
        <Link href="/employee/orders" className="rounded-lg border bg-white px-4 py-3 hover:bg-neutral-50">
          Pedidos pendientes
        </Link>
        <Link href="/employee/inventory" className="rounded-lg border bg-white px-4 py-3 hover:bg-neutral-50">
          Inventario
        </Link>
      </div>
    </div>
  );
}
