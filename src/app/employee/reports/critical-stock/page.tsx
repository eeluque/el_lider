import { getCriticalStockReport } from "@/services/reports";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function CriticalStockReportPage() {
  const items = await getCriticalStockReport();
  return (
    <div>
      <h1 className="text-2xl font-bold">Reporte: Stock crítico</h1>
      <p className="mt-1 text-neutral-600">Ingredientes bajo mínimo.</p>
      {items.length === 0 ? (
        <p className="mt-4 text-neutral-500">No hay ítems en stock crítico.</p>
      ) : (
        <Card className="mt-4">
          <CardHeader className="pb-2"><h3 className="font-semibold">Ítems</h3></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
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
                  const shortage = min - curr;
                  return (
                    <tr key={i.id} className="border-b last:border-0">
                      <td className="p-2">{i.name}</td>
                      <td className="p-2 text-right">{curr}</td>
                      <td className="p-2 text-right">{min}</td>
                      <td className="p-2 text-right text-red-600">{shortage} {i.unit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
