"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/employee", label: "Inicio" },
  { href: "/employee/orders", label: "Pedidos" },
  { href: "/employee/inventory", label: "Inventario" },
  { href: "/employee/reports/pending-orders", label: "Pedidos pendientes" },
  { href: "/employee/reports/critical-stock", label: "Stock crítico" },
];

export function EmployeeSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-52 shrink-0 border-r bg-white p-4">
      <p className="mb-4 font-semibold text-neutral-900">Empleado</p>
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
