"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function IngredientConsumptionPanels({
  items,
}: {
  items: { id: string; name: string; total: number }[];
}) {
  const top10 = items.slice(0, 10);
  const max = Math.max(...top10.map((i) => i.total), 1);

  return (
    <div className="space-y-4">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-primary/15 bg-card p-4 shadow-sm">
          <h3 className="font-serif text-lg font-semibold">Consumo en el período</h3>
          <p className="text-xs text-muted-foreground">Top 10 de insumos consumidos (salidas registradas)</p>
          <ol className="mt-4 space-y-3">
            {top10.map((item, i) => {
              const w = (item.total / max) * 100;
              return (
                <li key={item.id} className="flex items-center gap-3 text-sm">
                  <span className="w-5 text-center font-bold text-muted-foreground">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <span className="truncate font-medium">{item.name}</span>
                      <span className="shrink-0 tabular-nums text-secondary">{item.total}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${w}%` }} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="rounded-xl border border-primary/15 bg-card p-4 shadow-sm">
          <h3 className="font-serif text-lg font-semibold">Rotación de insumos</h3>
          <p className="text-xs text-muted-foreground">Volumen total de salidas en el período</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [value ?? 0, "Consumo"]} />
                <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                  {top10.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? "rgb(205, 102, 51)" : "rgb(241, 181, 62)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
