import Link from "next/link";
import { getActiveMenuItems } from "@/services/menu";
import { MenuItemsByCategory } from "@/components/menu/menu-items-by-category";
import { Button } from "@/components/ui/button";

export default async function MenuPage() {
  const items = await getActiveMenuItems();

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Menú</h1>
      <p className="mt-1 text-muted-foreground">Elige y ordena en la siguiente página.</p>
      <MenuItemsByCategory items={items} />
      <div className="mt-8">
        <Link href="/order">
          <Button>Ir a ordenar</Button>
        </Link>
      </div>
    </div>
  );
}
