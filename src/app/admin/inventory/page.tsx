import { Badge } from "@/components/ui/badge";
import { getIngredients, getInventoryMovements } from "@/services/inventory";
import { CreateIngredientForm } from "./create-ingredient-form";
import { InventoryMovementForm } from "./inventory-movement-form";
import { InventoryTable } from "./inventory-table";

export default async function AdminInventoryPage() {
  const [ingredients, movements] = await Promise.all([
    getIngredients(),
    getInventoryMovements(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inventario</h1>
        <p className="mt-1 text-neutral-600">Registra insumos, consulta existencias y captura movimientos.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CreateIngredientForm />
        <InventoryMovementForm ingredients={ingredients.filter((ingredient) => ingredient.active)} />
      </div>

      <InventoryTable ingredients={ingredients} />

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Movimientos recientes</h2>
          <p className="text-sm text-muted-foreground">Últimos registros de entradas, salidas y ajustes.</p>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Insumo</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Cantidad</th>
                <th className="px-4 py-3 font-medium">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {movements.slice(0, 10).map((movement) => (
                <tr key={movement.id} className="border-b last:border-0">
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(movement.created_at).toLocaleString("es-HN")}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {(movement as { ingredient?: { name?: string } }).ingredient?.name ?? "Insumo"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={movement.movement_type === "OUT" ? "destructive" : "secondary"}>
                      {movement.movement_type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{Number(movement.quantity)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{movement.reason ?? "Sin detalle"}</td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Aún no hay movimientos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
