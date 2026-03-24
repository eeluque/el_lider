"use client";

import { useMemo, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Row = { name: string; ventas: number; dateKey?: string };

const GREEN = "rgb(88, 143, 61)";
const AMBER = "rgb(234, 179, 8)";
const RED = "rgb(220, 38, 38)";

function tierFills(ventas: number[]): string[] {
  if (ventas.length === 0) return [];
  const sorted = [...ventas].sort((a, b) => a - b);
  const n = sorted.length;
  const lowBound = sorted[Math.floor((n - 1) * 0.33)]!;
  const highBound = sorted[Math.ceil((n - 1) * 0.67)]!;
  return ventas.map((v) => {
    if (v >= highBound) return GREEN;
    if (v <= lowBound) return RED;
    return AMBER;
  });
}

export function SalesSummaryReport({
  chartData,
  tableRows,
  total,
  monthLabel,
  pagination,
}: {
  chartData: Row[];
  /** Filas mostradas en la tabla (p. ej. página actual); si se omite, se usa chartData. */
  tableRows?: Row[];
  total: number;
  monthLabel: string;
  pagination?: ReactNode;
}) {
  const rowsForTable = tableRows ?? chartData;
  const fills = useMemo(() => tierFills(chartData.map((d) => d.ventas)), [chartData]);
  const colored = chartData.map((d, i) => ({ ...d, fill: fills[i] ?? AMBER }));
  const rowKey = (r: Row) => r.dateKey ?? r.name;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">{monthLabel}</span>
        <span className="text-sm text-muted-foreground">· Ventas por día en el rango</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-primary/15 bg-card p-4 shadow-sm">
          <h3 className="font-serif text-lg font-semibold">Ventas por día</h3>
          <p className="text-xs text-muted-foreground">Color según el monto del día frente al resto del periodo (alto / medio / bajo)</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={colored}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={chartData.length > 10 ? -35 : 0} textAnchor={chartData.length > 10 ? "end" : "middle"} height={chartData.length > 10 ? 70 : 30} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => {
                    const n = Number(value ?? 0);
                    return [`L. ${n.toFixed(2)}`, "Ventas"];
                  }}
                />
                <Bar dataKey="ventas" radius={[4, 4, 0, 0]}>
                  {colored.map((entry) => (
                    <Cell key={rowKey(entry)} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full" style={{ backgroundColor: GREEN }} /> Mejor relación en el periodo
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full" style={{ backgroundColor: AMBER }} /> Intermedio
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full" style={{ backgroundColor: RED }} /> Más bajo en el periodo
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-primary/15 bg-card p-4 shadow-sm">
          <h3 className="font-serif text-lg font-semibold">Resumen de ventas</h3>
          <p className="text-xs text-muted-foreground">Por día en el rango seleccionado</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2">Día</th>
                  <th className="py-2 text-right">Total (L.)</th>
                </tr>
              </thead>
              <tbody>
                {rowsForTable.map((r) => (
                  <tr key={rowKey(r)} className="border-b border-border/50">
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
          {pagination}
        </div>
      </div>
    </div>
  );
}
