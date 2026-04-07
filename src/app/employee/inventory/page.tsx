import { InventoryMovementForm } from "@/app/admin/inventory/inventory-movement-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCriticalStock, getIngredients } from "@/services/inventory";

export default async function EmployeeInventoryPage() {
  const [ingredients, critical] = await Promise.all([getIngredients(true), getCriticalStock()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventario</h1>
        <p className="mt-1 text-neutral-600">Consulta stock, alertas y registra movimientos del día.</p>
      </div>

      <InventoryMovementForm
        ingredients={ingredients}
        title="Registrar salida o entrada"
        description="Captura consumo de cocina, reposición por compra o ajustes simples."
      />

      {critical.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-amber-800">Stock crítico</h3>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm">
              {critical.map((ing) => (
                <li key={ing.id} className="flex items-center justify-between">
                  <span>{ing.name}</span>
                  <Badge variant="destructive">
                    {Number(ing.current_stock)} / {Number(ing.minimum_stock)} {ing.unit}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-neutral-50">
              <th className="p-3 text-left font-medium">Nombre</th>
              <th className="p-3 text-left font-medium">Unidad</th>
              <th className="p-3 text-right font-medium">Stock</th>
              <th className="p-3 text-right font-medium">Mínimo</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing) => {
              const isLow = Number(ing.current_stock) <= Number(ing.minimum_stock);
              return (
                <tr key={ing.id} className="border-b last:border-0">
                  <td className="p-3">{ing.name}</td>
                  <td className="p-3">{ing.unit}</td>
                  <td className="p-3 text-right">{Number(ing.current_stock)}</td>
                  <td className="p-3 text-right">
                    {Number(ing.minimum_stock)}
                    {isLow && <span className="ml-1 text-amber-600">!</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
