"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import type { MenuItem } from "@/types";

export function MenuItemsByCategory({ items }: { items: MenuItem[] }) {
  const { add, getQuantity, removeLine } = useCart();

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
            {categoryItems.map((item) => {
              const qty = getQuantity(item.id);
              const price = Number(item.price);
              return (
                <Card
                  key={item.id}
                  className="flex flex-col border-primary/20 shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium leading-snug text-foreground">{item.name}</span>
                      <span className="shrink-0 font-semibold text-secondary">L {price.toFixed(2)}</span>
                    </div>
                  </CardHeader>
                  {item.description && (
                    <CardContent className="flex-1 pt-0 text-sm text-muted-foreground">
                      {item.description}
                    </CardContent>
                  )}
                  <CardFooter className="mt-auto flex flex-col gap-3 border-t border-primary/15 bg-muted/30 pt-4">
                    {qty === 0 ? (
                      <Button
                        type="button"
                        className="w-full"
                        size="lg"
                        onClick={() => add(item, 1)}
                      >
                        Agregar al pedido
                      </Button>
                    ) : (
                      <div className="flex w-full flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-muted-foreground">En tu pedido</span>
                          <span className="text-sm font-semibold text-foreground">
                            L {(qty * price).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-10 shrink-0"
                            onClick={() => add(item, -1)}
                            aria-label="Quitar uno"
                          >
                            −
                          </Button>
                          <span className="min-w-[2rem] text-center text-lg font-semibold tabular-nums">
                            {qty}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-10 shrink-0"
                            onClick={() => add(item, 1)}
                            aria-label="Agregar uno"
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-muted-foreground"
                          onClick={() => removeLine(item.id)}
                        >
                          Quitar del pedido
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
