import { getSalesSummary } from "@/services/reports";
import { SalesChart } from "@/components/reports/SalesChart";

export default async function SalesSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; groupBy?: string }>;
}) {
  const params = await searchParams;
  const to = params.to ?? new Date().toISOString().slice(0, 10);
  const from = params.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const groupBy = (params.groupBy as "day" | "week" | "month") ?? "day";
  const { byPeriod, total } = await getSalesSummary({ from, to, groupBy });
  const chartData = Object.entries(byPeriod)
    .map(([name, value]) => ({ name, ventas: value }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <h1 className="text-2xl font-bold">Resumen de ventas</h1>
      <p className="mt-1 text-neutral-600">Total en período: L {total.toFixed(2)}</p>
      <form className="mt-4 flex flex-wrap gap-2">
        <input type="date" name="from" defaultValue={from} className="rounded border px-2 py-1" />
        <input type="date" name="to" defaultValue={to} className="rounded border px-2 py-1" />
        <select name="groupBy" defaultValue={groupBy} className="rounded border px-2 py-1">
          <option value="day">Por día</option>
          <option value="week">Por semana</option>
          <option value="month">Por mes</option>
        </select>
        <button type="submit" className="rounded bg-neutral-800 px-3 py-1 text-white">Actualizar</button>
      </form>
      <div className="mt-6">
        <SalesChart data={chartData} />
      </div>
      <div className="mt-4 overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-neutral-50">
              <th className="p-2 text-left">Período</th>
              <th className="p-2 text-right">Ventas (L)</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((r) => (
              <tr key={r.name} className="border-b last:border-0">
                <td className="p-2">{r.name}</td>
                <td className="p-2 text-right">{r.ventas.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
