"use client";

import { useMemo, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Row = { name: string; ventas: number; cancelados?: number; dateKey?: string };

const GREEN = "rgb(88, 143, 61)";
const AMBER = "rgb(234, 179, 8)";
const RED = "rgb(220, 38, 38)";

function tierFills(ventas: number[]): string[] {
  if (ventas.length === 0) return [];
  const sorted = [...ventas].sort((a, b) => a - b);
  const length = sorted.length;
  const lowBound = sorted[Math.floor((length - 1) * 0.33)]!;
  const highBound = sorted[Math.ceil((length - 1) * 0.67)]!;

  return ventas.map((value) => {
    if (value >= highBound) return GREEN;
    if (value <= lowBound) return RED;
    return AMBER;
  });
}

export function SalesSummaryReport({
  chartData,
  tableRows,
  total,
  cancelledCount,
  cancelledAmount,
  monthLabel,
  pagination,
}: {
  chartData: Row[];
  tableRows?: Row[];
  total: number;
  cancelledCount: number;
  cancelledAmount: number;
  monthLabel: string;
  pagination?: ReactNode;
}) {
  const rowsForTable = tableRows ?? chartData;
  const fills = useMemo(() => tierFills(chartData.map((item) => item.ventas)), [chartData]);
  const colored = chartData.map((item, index) => ({ ...item, fill: fills[index] ?? AMBER }));
  const rowKey = (row: Row) => row.dateKey ?? row.name;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">{monthLabel}</span>
        <span className="text-sm text-muted-foreground">· Ventas registradas por día en horario Central Standard Time</span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-primary/15 bg-card p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Ventas confirmadas</p>
          <p className="mt-2 text-2xl font-bold text-foreground">L. {total.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-destructive/20 bg-card p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Pedidos cancelados</p>
          <p className="mt-2 text-2xl font-bold text-destructive">{cancelledCount}</p>
        </div>
        <div className="rounded-xl border border-destructive/20 bg-card p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Monto cancelado</p>
          <p className="mt-2 text-2xl font-bold text-destructive">L. {cancelledAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-primary/15 bg-card p-4 shadow-sm">
          <h3 className="outfit font-serif text-lg font-semibold">Ventas por día</h3>
          <p className="text-xs text-muted-foreground">Color según el monto del día frente al resto del período</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={colored}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={chartData.length > 10 ? -35 : 0}
                  textAnchor={chartData.length > 10 ? "end" : "middle"}
                  height={chartData.length > 10 ? 70 : 30}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "cancelados") return [Number(value ?? 0), "Cancelados"];
                    return [`L. ${Number(value ?? 0).toFixed(2)}`, "Ventas"];
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
              <span className="size-2 rounded-full" style={{ backgroundColor: GREEN }} /> Días de alta demanda
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full" style={{ backgroundColor: AMBER }} /> Días regulares
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full" style={{ backgroundColor: RED }} /> Días bajos
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-primary/15 bg-card p-4 shadow-sm">
          <h3 className="outfit font-serif text-lg font-semibold">Resumen de ventas</h3>
          <p className="text-xs text-muted-foreground">Incluye visibilidad de cancelaciones por día</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2">Día</th>
                  <th className="py-2 text-right">Ventas (L.)</th>
                  <th className="py-2 text-right">Cancelados</th>
                </tr>
              </thead>
              <tbody>
                {rowsForTable.map((row) => (
                  <tr key={rowKey(row)} className="border-b border-border/50">
                    <td className="py-2 font-medium">{row.name}</td>
                    <td className="py-2 text-right tabular-nums column-money-amount">L. {row.ventas.toFixed(2)}</td>
                    <td className="py-2 text-right tabular-nums">{row.cancelados ?? 0}</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="py-3">Total</td>
                  <td className="py-3 text-right column-money-amount">L. {total.toFixed(2)}</td>
                  <td className="py-3 text-right">{cancelledCount}</td>
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
