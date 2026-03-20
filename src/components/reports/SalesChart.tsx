"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function SalesChart({ data }: { data: { name: string; ventas: number }[] }) {
  return (
    <div className="h-80 w-full max-w-2xl">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(v) => [v != null ? `L ${Number(v).toFixed(2)}` : "", "Ventas"]} />
          <Bar dataKey="ventas" fill="var(--primary)" name="Ventas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
