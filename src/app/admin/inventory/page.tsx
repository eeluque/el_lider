import { getIngredients } from "@/services/inventory";
import { InventoryTable } from "./inventory-table";

export default async function AdminInventoryPage() {
  const ingredients = await getIngredients();
  return (
    <div>
      <h1 className="text-2xl font-bold">Inventario</h1>
      <p className="mt-1 text-neutral-600">Ingredientes y stock.</p>
      <InventoryTable ingredients={ingredients} />
    </div>
  );
}
