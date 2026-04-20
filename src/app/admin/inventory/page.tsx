import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { INVENTORY_MOVEMENT_LABELS } from "@/lib/labels";
import { getIngredients, getInventoryMovements } from "@/services/inventory";
import { CreateIngredientForm } from "./create-ingredient-form";
import { InventoryMovementForm } from "./inventory-movement-form";
import { InventoryTable } from "./inventory-table";

export default async function AdminInventoryPage() {
  const [session, ingredients, movements] = await Promise.all([
    auth(),
    getIngredients(),
    getInventoryMovements(),
  ]);
  const canManageIngredients = session?.user?.role === "admin";
  const units = [...new Set(ingredients.map((i: { unit: string }) => i.unit).filter(Boolean))];


  return (
    <div className="space-y-8">
      <div>
        <h1 className="outfit font-serif text-3xl font-bold text-foreground">Inventario</h1>
        <p className="mt-1 text-sm text-neutral-500">Gestión centralizada de insumos, existencias y registros de stock.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-stretch">
        <div className="lg:col-span-4 flex">
          {canManageIngredients && <CreateIngredientForm units={units} />}
        </div>
        <div className="lg:col-span-6 flex">
          <InventoryMovementForm ingredients={ingredients.filter((i) => i.active)} />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase text-neutral-700 tracking-wider ml-1">Listado de Existencias</h2>
        <InventoryTable ingredients={ingredients} canEdit={canManageIngredients} />
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-bold uppercase text-neutral-700 tracking-wider ml-1">Movimientos Recientes</h2>
          <p className="text-xs text-neutral-500 ml-1">Últimos 10 registros de entradas, salidas y ajustes de inventario.</p>
        </div>

        <div className="overflow-hidden rounded-md border border-neutral-200 shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#753B19]">
              <tr className="border-none">
                <th className="px-4 py-3 font-bold text-white uppercase text-[11px] text-center tracking-wider">Fecha</th>
                <th className="px-4 py-3 font-bold text-white uppercase text-[11px] text-center tracking-wider">Insumo</th>
                <th className="px-4 py-3 font-bold text-white uppercase text-[11px] text-center tracking-wider">Tipo</th>
                <th className="px-4 py-3 font-bold text-white uppercase text-[11px] text-right tracking-wider">Cantidad</th>
                <th className="px-4 py-3 font-bold text-white uppercase text-[11px] text-left tracking-wider pl-8">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {movements.slice(0, 10).map((movement) => (
                <tr key={movement.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-neutral-500 text-center text-xs">
                    {new Date(movement.created_at).toLocaleString("es-HN", {
                      dateStyle: "short",
                      timeStyle: "short"
                    })}
                  </td>
                  <td className="px-4 py-3 text-neutral-800 text-center">
                    {(movement as { ingredient?: { name?: string } }).ingredient?.name ?? "Insumo"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge 
                      variant="outline"
                      className={`
                        font-semibold text-[10px] uppercase px-2 py-0.5 border-none
                        ${movement.movement_type === "IN" 
                          ? "bg-green-100 text-[#065f46]" // Verde suave para entradas
                          : movement.movement_type === "OUT" 
                            ? "bg-[#fee2e2] text-[#991b1b]" // Rojo suave para salidas
                            : "bg-neutral-100 text-neutral-600" // Gris suave para ajustes
                        }
                      `}
                    >
                      {INVENTORY_MOVEMENT_LABELS[movement.movement_type]}
                    </Badge>
                  </td>
                  {/* Cantidad alineada a la derecha */}
                  <td className="px-4 py-3 text-right font-black text-neutral-900">
                    {Number(movement.quantity)}
                  </td>
                  {/* Motivo alineado a la izquierda */}
                  <td className="px-4 py-3 text-neutral-500 text-left pl-8 italic text-xs">
                    {movement.reason ?? "Sin detalle"}
                  </td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-neutral-400 italic">
                    No se han registrado movimientos de stock todavía.
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