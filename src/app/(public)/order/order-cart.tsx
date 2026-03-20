"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useCart } from "@/components/cart/cart-context";
import type { MenuItem } from "@/types";

export type { CartItem } from "@/lib/cart-storage";

export function OrderCart({ menuItems }: { menuItems: MenuItem[] }) {
  const { cart, add, removeLine, total, goToCheckout } = useCart();

  const byCategory = menuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category || "Otros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {Object.entries(byCategory).map(([category, categoryItems]) => (
          <section key={category} className="mb-6">
            <h2 className="mb-2 text-lg font-semibold text-foreground">{category}</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {categoryItems.map((item) => (
                <Card key={item.id} className="flex flex-row items-center justify-between p-3">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">L {Number(item.price).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => add(item, -1)}
                      disabled={!cart.find((c) => c.menuItemId === item.id)?.quantity}
                    >
                      −
                    </Button>
                    <span className="min-w-[1.5rem] text-center text-sm tabular-nums">
                      {cart.find((c) => c.menuItemId === item.id)?.quantity ?? 0}
                    </span>
                    <Button type="button" variant="outline" size="sm" onClick={() => add(item, 1)}>
                      +
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div>
        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-foreground">Tu pedido</h3>
          </CardHeader>
          <CardContent className="space-y-2">
            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay ítems. Agrega desde el inicio o el menú.</p>
            ) : (
              <>
                {cart.map((c) => (
                  <div key={c.menuItemId} className="flex flex-wrap items-center justify-between gap-1 text-sm">
                    <span>
                      {c.name} × {c.quantity}
                    </span>
                    <span className="font-medium">L {(c.quantity * c.unitPrice).toFixed(2)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-muted-foreground"
                      onClick={() => removeLine(c.menuItemId)}
                    >
                      Quitar
                    </Button>
                  </div>
                ))}
                <p className="mt-2 border-t border-border pt-2 font-medium text-foreground">
                  Total: L {total.toFixed(2)}
                </p>
                <Button className="mt-2 w-full" onClick={goToCheckout}>
                  Ir a pagar
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
