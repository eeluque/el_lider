"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type IngredientConsumptionItem = {
  id: string;
  name: string;
  consumption: number;
  turnover: number;
};

export function IngredientConsumptionPanels({
  items,
}: {
  items: IngredientConsumptionItem[];
}) {
  const topConsumption = [...items].sort((a, b) => b.consumption - a.consumption).slice(0, 10);
  const topTurnover = [...items].sort((a, b) => b.turnover - a.turnover).slice(0, 10);
  const maxConsumption = Math.max(...topConsumption.map((item) => item.consumption), 1);

  return (
    <div className="space-y-4">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-primary/15 bg-card p-4 shadow-sm">
          <h3 className="outfit font-serif text-lg font-semibold">Consumo en el período</h3>
          <p className="text-xs text-muted-foreground">
            Recetas del menú para pedidos entregados o listos, más salidas registradas en inventario (OUT y ajustes).
          </p>
          <ol className="mt-4 space-y-3">
            {topConsumption.map((item, index) => {
              const width = (item.consumption / maxConsumption) * 100;
              return (
                <li key={item.id} className="flex items-center gap-3 text-sm">
                  <span className="w-5 text-center font-bold text-muted-foreground">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <span className="truncate font-medium">{item.name}</span>
                      <span className="shrink-0 tabular-nums text-secondary">{Math.floor(item.consumption)}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="rounded-xl border border-primary/15 bg-card p-4 shadow-sm">
          <h3 className="outfit font-serif text-lg font-semibold">Rotación de insumos</h3>
          <p className="text-xs text-muted-foreground">Entradas registradas en inventario durante el período (movimientos IN).</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTurnover} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [Math.floor(Number(value) || 0), "Entradas"]} />
                <Bar dataKey="turnover" radius={[0, 4, 4, 0]}>
                  {topTurnover.map((_, index) => (
                    <Cell key={index} fill={index % 2 === 0 ? "rgb(205, 102, 51)" : "rgb(241, 181, 62)"} />
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
