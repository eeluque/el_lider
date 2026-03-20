import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getActiveMenuItems } from "@/services/menu";
import { MenuItemsByCategory } from "@/components/menu/menu-items-by-category";

export default async function HomePage() {
  const items = await getActiveMenuItems();

  return (
    <div>
      <section className="rounded-xl border border-primary/25 bg-primary/10 px-6 py-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Comedor El Líder</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Pedidos organizados, inventario bajo control. Explora nuestro menú y ordena cuando quieras.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/order">
            <Button size="lg">Ordenar ahora</Button>
          </Link>
          <Link href="/menu">
            <Button size="lg" variant="secondary">
              Ver menú completo
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-center text-2xl font-bold text-foreground">Nuestro menú</h2>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Platillos activos disponibles hoy
        </p>
        <MenuItemsByCategory items={items} />
      </section>
    </div>
  );
}
