import Link from "next/link";
import { getActiveMenuItems } from "@/services/menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function MenuPage() {
  const items = await getActiveMenuItems();
  const byCategory = items.reduce<Record<string, typeof items>>((acc, item) => {
    const cat = item.category || "Otros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-bold">Menú</h1>
      <p className="mt-1 text-neutral-600">Elige y ordena en la siguiente página.</p>
      <div className="mt-6 space-y-8">
        {Object.entries(byCategory).map(([category, categoryItems]) => (
          <section key={category}>
            <h2 className="mb-3 text-lg font-semibold text-neutral-800">{category}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-neutral-600">L {Number(item.price).toFixed(2)}</span>
                    </div>
                  </CardHeader>
                  {item.description && (
                    <CardContent className="pt-0 text-sm text-neutral-500">
                      {item.description}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-8">
        <Link href="/order">
          <Button>Ir a ordenar</Button>
        </Link>
      </div>
    </div>
  );
}
