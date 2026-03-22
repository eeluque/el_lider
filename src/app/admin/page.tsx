import Link from "next/link";
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Package, Users, FileBarChart } from "lucide-react";

const cards = [
  { href: "/admin/orders", title: "Pedidos de hoy", desc: "Filtrar por estado y ver detalle", icon: ShoppingBag },
  { href: "/admin/menu", title: "Menú", desc: "Platillos y precios", icon: UtensilsCrossed },
  { href: "/admin/inventory", title: "Inventario", desc: "Insumos y existencias", icon: Package },
  { href: "/admin/employees", title: "Empleados", desc: "Cuentas del equipo", icon: Users },
  { href: "/admin/analytics/sales-summary", title: "Resumen de ventas", desc: "Reportes y gráficos", icon: FileBarChart },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-primary/15 px-5 py-6 text-primary-foreground">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="size-8 text-[rgb(117,59,25)]" />
          <div>
            <h1 className="font-serif text-2xl font-bold text-[rgb(117,59,25)]">Dashboard</h1>
            <p className="text-sm text-[rgb(117,59,25)]/80">Accesos rápidos a la gestión del comedor</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ href, title, desc, icon: Icon }) => (
          <Link key={href} href={href} className="group">
            <div className="h-full rounded-xl border border-primary/20 bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md">
              <Icon className="size-8 text-secondary" />
              <h3 className="mt-3 font-serif text-lg font-semibold text-foreground group-hover:text-secondary">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
