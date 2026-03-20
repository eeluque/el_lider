import { getMenuItems } from "@/services/menu";
import { MenuTable } from "./menu-table";

export default async function AdminMenuPage() {
  const items = await getMenuItems();

  return (
    <div>
      <h1 className="text-2xl font-bold">Menú</h1>
      <p className="mt-1 text-neutral-600">Gestionar platillos.</p>
      <MenuTable items={items} />
    </div>
  );
}
