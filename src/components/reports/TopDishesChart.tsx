"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function TopDishesChart({ data }: { data: { name: string; cantidad: number; ingresos: number }[] }) {
  return (
    <div className="h-80 w-full max-w-2xl">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={80} />
          <Tooltip formatter={(v, n) => [n === "ingresos" && v != null ? `L ${Number(v).toFixed(2)}` : v, n === "ingresos" ? "Ingresos" : "Cantidad"]} />
          <Bar dataKey="cantidad" fill="hsl(var(--primary))" name="Cantidad" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
