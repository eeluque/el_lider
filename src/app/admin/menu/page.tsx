import { getMenuItems } from "@/services/menu";
import { CreateMenuItemForm } from "./create-menu-item-form";
import { MenuTable } from "./menu-table";

export default async function AdminMenuPage() {
  const items = await getMenuItems();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Menú</h1>
        <p className="mt-1 text-neutral-600">Gestiona el catálogo que alimenta la toma de pedidos.</p>
      </div>

      <CreateMenuItemForm />
      <MenuTable items={items} />
    </div>
  );
}
