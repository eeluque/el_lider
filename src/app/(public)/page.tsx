import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h1 className="text-3xl font-bold text-neutral-900">Comedor El Líder</h1>
      <p className="mt-2 text-neutral-600">
        Pedidos organizados, inventario bajo control. Bienvenido.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/menu">
          <Button>Ver menú</Button>
        </Link>
        <Link href="/order">
          <Button variant="outline">Ordenar ahora</Button>
        </Link>
      </div>
    </div>
  );
}
