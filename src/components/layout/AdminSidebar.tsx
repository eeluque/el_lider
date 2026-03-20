"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/menu", label: "Menú" },
  { href: "/admin/inventory", label: "Inventario" },
  { href: "/admin/employees", label: "Empleados" },
  { href: "/admin/reports/delivered-orders-daily", label: "Entregados (día)" },
  { href: "/admin/reports/inventory-kardex", label: "Kardex inventario" },
  { href: "/admin/reports/critical-stock", label: "Stock crítico" },
  { href: "/admin/reports/cancelled-orders", label: "Cancelados" },
  { href: "/admin/analytics/sales-summary", label: "Ventas" },
  { href: "/admin/analytics/top-dishes", label: "Platos más vendidos" },
  { href: "/admin/analytics/ingredient-consumption", label: "Consumo ingredientes" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 border-r bg-white p-4">
      <p className="mb-4 font-semibold text-neutral-900">Admin</p>
      <nav className="space-y-1">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`block rounded px-3 py-2 text-sm ${pathname === href ? "bg-neutral-100 font-medium" : "text-neutral-600 hover:bg-neutral-50"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
