import { auth } from "@/lib/auth";
import { getMenuItems } from "@/services/menu";
import { CreateMenuItemForm } from "./create-menu-item-form";
import { MenuTable } from "./menu-table";

export default async function AdminMenuPage() {
  const [session, items] = await Promise.all([auth(), getMenuItems()]);
  const canManageMenu = session?.user?.role === "admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Menu</h1>
        <p className="mt-1 text-neutral-600">Gestiona el catalogo que alimenta la toma de pedidos.</p>
      </div>

      {canManageMenu ? <CreateMenuItemForm /> : null}
      <MenuTable items={items} canEdit={canManageMenu} />
    </div>
  );
}
