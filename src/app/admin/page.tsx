import { FileBarChart, LayoutDashboard, Package, ShoppingBag, Users, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import type { UserRole } from "@/types";

type DashboardCard = {
  href: string;
  title: string;
  desc: string;
  icon: typeof LayoutDashboard;
  roles: Array<Extract<UserRole, "admin" | "employee">>;
};

const cards: DashboardCard[] = [
  {
    href: "/admin/orders",
    title: "Pedidos de hoy",
    desc: "Filtrar por estado y ver detalle",
    icon: ShoppingBag,
    roles: ["admin", "employee"],
  },
  {
    href: "/admin/menu",
    title: "Menú",
    desc: "Platillos y precios",
    icon: UtensilsCrossed,
    roles: ["admin", "employee"],
  },
  {
    href: "/admin/inventory",
    title: "Inventario",
    desc: "Insumos y existencias",
    icon: Package,
    roles: ["admin", "employee"],
  },
  {
    href: "/admin/employees",
    title: "Empleados",
    desc: "Cuentas del equipo",
    icon: Users,
    roles: ["admin"],
  },
  {
    href: "/admin/reports/delivered-orders-daily",
    title: "Pedidos entregados",
    desc: "Seguimiento diario de órdenes",
    icon: FileBarChart,
    roles: ["admin", "employee"],
  },
  {
    href: "/admin/reports/critical-stock",
    title: "Lista de insumos",
    desc: "Alertas y stock crítico",
    icon: FileBarChart,
    roles: ["admin", "employee"],
  },
  {
    href: "/admin/analytics/sales-summary",
    title: "Resumen de ventas",
    desc: "Reportes y gráficos",
    icon: FileBarChart,
    roles: ["admin"],
  },
];

export default async function AdminDashboardPage() {
  const session = await auth();
  const role = session?.user?.role === "employee" ? "employee" : "admin";
  const visibleCards = cards.filter((card) => card.roles.includes(role));

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
        {visibleCards.map(({ href, title, desc, icon: Icon }) => (
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
