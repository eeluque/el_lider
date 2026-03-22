"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Row = { name: string; ventas: number };

const BAR_COLORS = [
  "rgb(88, 143, 61)",
  "rgb(241, 181, 62)",
  "rgb(205, 102, 51)",
];

export function SalesSummaryReport({
  chartData,
  total,
  monthLabel,
}: {
  chartData: Row[];
  total: number;
  monthLabel: string;
}) {
  const [mode, setMode] = useState<"week" | "month">("week");
  const colored = useMemo(
    () =>
      chartData.map((d, i) => ({
        ...d,
        fill: BAR_COLORS[i % BAR_COLORS.length],
        kind: i % 3 === 0 ? "regular" : i % 3 === 1 ? "alta" : "baja",
      })),
    [chartData]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">{monthLabel}</span>
        <div className="inline-flex rounded-full border border-primary/20 bg-muted/50 p-1">
          <button
            type="button"
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${mode === "week" ? "bg-brand-green text-white shadow" : "text-foreground"}`}
            onClick={() => setMode("week")}
          >
            Semana
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${mode === "month" ? "bg-brand-green text-white shadow" : "text-foreground"}`}
            onClick={() => setMode("month")}
          >
            Mes
          </button>
        </div>
        <span className="text-sm text-muted-foreground">· Vista {mode === "week" ? "por períodos" : "agrupada"}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-primary/15 bg-card p-4 shadow-sm">
          <h3 className="font-serif text-lg font-semibold">Esta semana</h3>
          <p className="text-xs text-muted-foreground">Total vendido en el rango</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={colored}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => {
                    const n = Number(value ?? 0);
                    return [`L. ${n.toFixed(2)}`, "Ventas"];
                  }}
                />
                <Bar dataKey="ventas" radius={[4, 4, 0, 0]}>
                  {colored.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-brand-green" /> Días regulares
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-primary" /> Alta demanda
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-secondary" /> Bajos
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-primary/15 bg-card p-4 shadow-sm">
          <h3 className="font-serif text-lg font-semibold">Resumen de ventas</h3>
          <p className="text-xs text-muted-foreground">Por período en el rango seleccionado</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2">Período</th>
                  <th className="py-2 text-right">Total (L.)</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((r) => (
                  <tr key={r.name} className="border-b border-border/50">
                    <td className="py-2 font-medium">{r.name}</td>
                    <td className="py-2 text-right tabular-nums">L. {r.ventas.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="py-3">Total</td>
                  <td className="py-3 text-right">L. {total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
