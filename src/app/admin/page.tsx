import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Admin</h1>
      <p className="mt-1 text-neutral-600">Gestión del comedor.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/orders">
          <div className="rounded-lg border bg-white p-4 shadow-sm hover:bg-neutral-50">
            <h3 className="font-medium">Pedidos</h3>
            <p className="text-sm text-neutral-500">Ver y actualizar estado</p>
          </div>
        </Link>
        <Link href="/admin/menu">
          <div className="rounded-lg border bg-white p-4 shadow-sm hover:bg-neutral-50">
            <h3 className="font-medium">Menú</h3>
            <p className="text-sm text-neutral-500">Gestionar platillos</p>
          </div>
        </Link>
        <Link href="/admin/inventory">
          <div className="rounded-lg border bg-white p-4 shadow-sm hover:bg-neutral-50">
            <h3 className="font-medium">Inventario</h3>
            <p className="text-sm text-neutral-500">Ingredientes y movimientos</p>
          </div>
        </Link>
        <Link href="/admin/employees">
          <div className="rounded-lg border bg-white p-4 shadow-sm hover:bg-neutral-50">
            <h3 className="font-medium">Empleados</h3>
            <p className="text-sm text-neutral-500">Usuarios y roles</p>
          </div>
        </Link>
        <Link href="/admin/analytics/sales-summary">
          <div className="rounded-lg border bg-white p-4 shadow-sm hover:bg-neutral-50">
            <h3 className="font-medium">Ventas</h3>
            <p className="text-sm text-neutral-500">Resumen por período</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
