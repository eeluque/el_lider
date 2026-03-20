import { getIngredientConsumption } from "@/services/reports";
import { IngredientConsumptionChart } from "@/components/reports/IngredientConsumptionChart";

export default async function IngredientConsumptionPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const to = params.to ?? new Date().toISOString().slice(0, 10);
  const from = params.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const consumption = await getIngredientConsumption({ from, to });
  const chartData = consumption.slice(0, 10).map((c) => ({ name: c.name, consumido: c.total }));

  return (
    <div>
      <h1 className="text-2xl font-bold">Consumo de ingredientes</h1>
      <p className="mt-1 text-neutral-600">Salidas (OUT) en el período.</p>
      <form className="mt-4 flex flex-wrap gap-2">
        <input type="date" name="from" defaultValue={from} className="rounded border px-2 py-1" />
        <input type="date" name="to" defaultValue={to} className="rounded border px-2 py-1" />
        <button type="submit" className="rounded bg-neutral-800 px-3 py-1 text-white">Actualizar</button>
      </form>
      <div className="mt-6">
        <IngredientConsumptionChart data={chartData} />
      </div>
      <div className="mt-4 overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-neutral-50">
              <th className="p-2 text-left">Ingrediente</th>
              <th className="p-2 text-right">Total consumido</th>
            </tr>
          </thead>
          <tbody>
            {consumption.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="p-2">{c.name}</td>
                <td className="p-2 text-right">{c.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
