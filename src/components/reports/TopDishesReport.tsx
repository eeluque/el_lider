"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = [
  "rgb(88, 143, 61)",
  "rgb(241, 181, 62)",
  "rgb(205, 102, 51)",
  "rgb(117, 59, 25)",
  "rgb(60, 90, 50)",
];

export function TopDishesReport({
  dishes,
}: {
  dishes: { id: string; name: string; category: string; quantity: number; revenue: number }[];
}) {
  const top5 = dishes.slice(0, 5);
  const pieData = top5.map((d) => ({ name: d.name, value: d.quantity }));
  const totalQ = top5.reduce((s, d) => s + d.quantity, 0) || 1;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-primary/15 bg-card p-4 shadow-sm" style={{ height: "488px" }}>
        <h3 className="outfit font-serif text-lg font-semibold text-foreground">Distribución de ventas</h3>
        <p className="text-xs text-muted-foreground">Proporción de cada platillo sobre el total (top 5)</p>
        <ResponsiveContainer width="100%" height="70%">
  <PieChart margin={{ bottom: 50 }}>
    <Pie
      data={pieData}
      dataKey="value"
      nameKey="name"
      cx="50%"
      cy="50%"
      outerRadius={85}
      label={({ percent }) =>
        `${((percent ?? 0) * 100).toFixed(0)}%`
      }
    >
      {pieData.map((_, i) => (
        <Cell key={i} fill={COLORS[i % COLORS.length]} />
      ))}
    </Pie>

    <Tooltip formatter={(value) => [`${Number(value ?? 0)} uds`, "Cantidad"]} />
  </PieChart>
</ResponsiveContainer>

<div className="flex flex-col items-center text-sm">
  
  {/* Fila 1 (2 elementos) */}
  <div className="flex justify-center gap-6 mb-2">
    {pieData.slice(0, 2).map((entry, index) => (
      <div key={index} className="flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-sm"
          style={{ backgroundColor: COLORS[index % COLORS.length] }}
        />
        <span>{entry.name}</span>
      </div>
    ))}
  </div>

  {/* Fila 2 (3 elementos) */}
  <div className="flex justify-center gap-6">
    {pieData.slice(2, 5).map((entry, index) => (
      <div key={index} className="flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-sm"
          style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }}
        />
        <span>{entry.name}</span>
      </div>
    ))}
  </div>

</div>

      </div>

      <div className="rounded-xl border border-primary/15 bg-card p-4 shadow-sm" style={{ height: "488px" }}>
        <h3 className="outfit font-serif text-lg font-semibold text-foreground">Ranking detallado</h3>
        <p className="text-xs text-muted-foreground">Unidades vendidas en el periodo</p>
        <ul className="mt-4 space-y-3">
          {top5.map((d, i) => {
            const pct = (d.quantity / totalQ) * 100;
            return (
              <li key={d.id} className="flex flex-col gap-1 border-b border-border/50 pb-3 last:border-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="flex size-7 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground text-sm">{d.name}</p>
                    <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[9.5px] text-muted-foreground mb-1">
                      {d.category}
                    </span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-secondary">{d.quantity} uds</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
