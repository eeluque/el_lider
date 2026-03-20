"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function IngredientConsumptionChart({ data }: { data: { name: string; consumido: number }[] }) {
  return (
    <div className="h-80 w-full max-w-2xl">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="consumido" fill="hsl(var(--primary))" name="Consumido" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
