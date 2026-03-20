import { getTopDishes } from "@/services/reports";
import { TopDishesChart } from "@/components/reports/TopDishesChart";

export default async function TopDishesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const to = params.to ?? new Date().toISOString().slice(0, 10);
  const from = params.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const dishes = await getTopDishes({ from, to });
  const chartData = dishes.slice(0, 10).map((d) => ({ name: d.name, cantidad: d.quantity, ingresos: d.revenue }));

  return (
    <div>
      <h1 className="text-2xl font-bold">Platos más vendidos</h1>
      <p className="mt-1 text-neutral-600">Por cantidad e ingresos en el período.</p>
      <form className="mt-4 flex flex-wrap gap-2">
        <input type="date" name="from" defaultValue={from} className="rounded border px-2 py-1" />
        <input type="date" name="to" defaultValue={to} className="rounded border px-2 py-1" />
        <button type="submit" className="rounded bg-neutral-800 px-3 py-1 text-white">Actualizar</button>
      </form>
      <div className="mt-6">
        <TopDishesChart data={chartData} />
      </div>
      <div className="mt-4 overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-neutral-50">
              <th className="p-2 text-left">Plato</th>
              <th className="p-2 text-right">Unidades</th>
              <th className="p-2 text-right">Ingresos (L)</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((d) => (
              <tr key={d.id} className="border-b last:border-0">
                <td className="p-2">{d.name}</td>
                <td className="p-2 text-right">{d.quantity}</td>
                <td className="p-2 text-right">{d.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
