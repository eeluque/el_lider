import { getCriticalStockReport } from "@/services/reports";

export default async function CriticalStockPage() {
  const items = await getCriticalStockReport();
  return (
    <div>
      <h1 className="text-2xl font-bold">Stock crítico</h1>
      <p className="mt-1 text-neutral-600">Ingredientes bajo mínimo.</p>
      {items.length === 0 ? (
        <p className="mt-4 text-neutral-500">No hay ítems en stock crítico.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-neutral-50">
                <th className="p-2 text-left">Ingrediente</th>
                <th className="p-2 text-right">Stock actual</th>
                <th className="p-2 text-right">Mínimo</th>
                <th className="p-2 text-right">Faltante</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => {
                const curr = Number(i.current_stock);
                const min = Number(i.minimum_stock);
                return (
                  <tr key={i.id} className="border-b last:border-0">
                    <td className="p-2">{i.name}</td>
                    <td className="p-2 text-right">{curr}</td>
                    <td className="p-2 text-right">{min}</td>
                    <td className="p-2 text-right text-red-600">{min - curr} {i.unit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
