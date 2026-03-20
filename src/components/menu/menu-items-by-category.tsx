import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { MenuItem } from "@/types";

export function MenuItemsByCategory({ items }: { items: MenuItem[] }) {
  const byCategory = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category || "Otros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  if (items.length === 0) {
    return (
      <p className="mt-6 text-center text-muted-foreground">
        No hay platillos disponibles por el momento.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-10">
      {Object.entries(byCategory).map(([category, categoryItems]) => (
        <section key={category}>
          <h2 className="mb-4 border-b border-primary/30 pb-2 text-xl font-semibold text-foreground">
            {category}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryItems.map((item) => (
              <Card key={item.id} className="border-primary/20 shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className="shrink-0 font-medium text-secondary">L {Number(item.price).toFixed(2)}</span>
                  </div>
                </CardHeader>
                {item.description && (
                  <CardContent className="pt-0 text-sm text-muted-foreground">{item.description}</CardContent>
                )}
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
