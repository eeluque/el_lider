"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { MenuItem } from "@/types";

const CART_STORAGE_KEY = "el_lider_cart";

export type CartItem = { menuItemId: string; name: string; quantity: number; unitPrice: number };

export function OrderCart({ menuItems }: { menuItems: MenuItem[] }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const s = sessionStorage.getItem(CART_STORAGE_KEY);
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });

  const saveCart = useCallback((newCart: CartItem[]) => {
    setCart(newCart);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
    }
  }, []);

  const add = (item: MenuItem, qty = 1) => {
    const existing = cart.find((c) => c.menuItemId === item.id);
    const rest = cart.filter((c) => c.menuItemId !== item.id);
    const newQty = (existing?.quantity ?? 0) + qty;
    if (newQty <= 0) {
      saveCart(rest);
      return;
    }
    saveCart([
      ...rest,
      {
        menuItemId: item.id,
        name: item.name,
        quantity: newQty,
        unitPrice: Number(item.price),
      },
    ]);
  };

  const remove = (menuItemId: string) => {
    saveCart(cart.filter((c) => c.menuItemId !== menuItemId));
  };

  const total = cart.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const goToCheckout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      router.push("/checkout");
    }
  };

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
            <h2 className="mb-2 text-lg font-semibold">{category}</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {categoryItems.map((item) => (
                <Card key={item.id} className="flex flex-row items-center justify-between p-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-neutral-500">L {Number(item.price).toFixed(2)}</p>
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
                    <span className="min-w-[1.5rem] text-center text-sm">
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
            <h3 className="font-semibold">Tu pedido</h3>
          </CardHeader>
          <CardContent className="space-y-2">
            {cart.length === 0 ? (
              <p className="text-sm text-neutral-500">No hay ítems. Agrega algo del menú.</p>
            ) : (
              <>
                {cart.map((c) => (
                  <div key={c.menuItemId} className="flex justify-between text-sm">
                    <span>
                      {c.name} × {c.quantity}
                    </span>
                    <span>L {(c.quantity * c.unitPrice).toFixed(2)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="h-6 px-1 text-neutral-500"
                      onClick={() => remove(c.menuItemId)}
                    >
                      Quitar
                    </Button>
                  </div>
                ))}
                <p className="mt-2 border-t pt-2 font-medium">Total: L {total.toFixed(2)}</p>
                <Button className="w-full mt-2" onClick={goToCheckout} disabled={cart.length === 0}>
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
