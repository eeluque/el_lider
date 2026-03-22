"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Package, Users, FileBarChart, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

const main: NavItem[] = [
  { href: "/admin", label: "Dashboards", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Órdenes", icon: ShoppingBag },
  { href: "/", label: "Inicio", icon: UtensilsCrossed },
];

const manage: NavItem[] = [
  { href: "/admin/menu", label: "Menú", icon: UtensilsCrossed },
  { href: "/admin/inventory", label: "Inventario", icon: Package },
  { href: "/admin/employees", label: "Empleados", icon: Users },
];

const reports: NavItem[] = [
  { href: "/admin/analytics/sales-summary", label: "Resumen de ventas", icon: FileBarChart },
  { href: "/admin/analytics/top-dishes", label: "Platillos más vendidos", icon: FileBarChart },
  { href: "/admin/analytics/ingredient-consumption", label: "Consumo de insumos", icon: FileBarChart },
  { href: "/admin/reports/cancelled-orders", label: "Pedidos cancelados", icon: FileBarChart },
  { href: "/admin/reports/inventory-kardex", label: "Kardex", icon: FileBarChart },
  { href: "/admin/reports/critical-stock", label: "Lista de insumos", icon: FileBarChart },
  { href: "/admin/reports/delivered-orders-daily", label: "Entregados del día", icon: FileBarChart },
];

function NavBlock({ title, items }: { title: string; items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <div className="mb-6">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-[rgb(117,59,25)]/70">{title}</p>
      <nav className="space-y-0.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href + label}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-[rgb(117,59,25)]/15 text-[rgb(117,59,25)] shadow-sm"
                  : "text-[rgb(117,59,25)]/90 hover:bg-white/40"
              }`}
            >
              <Icon className="size-5 shrink-0 opacity-80" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AdminSidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-[rgb(117,59,25)]/10 bg-primary py-6">
      <Link href="/admin" className="mb-8 px-5">
        <p className="font-serif text-lg font-bold leading-tight text-[rgb(117,59,25)]">Comedor El Líder</p>
        <p className="text-xs text-[rgb(117,59,25)]/70">Panel administrativo</p>
      </Link>
      <div className="flex-1 overflow-y-auto px-3">
        <NavBlock title="Principal" items={main} />
        <NavBlock title="Gestión" items={manage} />
        <NavBlock title="Reportes" items={reports} />
      </div>
      <div className="mt-auto border-t border-[rgb(117,59,25)]/15 px-3 pt-4">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[rgb(117,59,25)] hover:bg-white/40"
        >
          <LogOut className="size-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
