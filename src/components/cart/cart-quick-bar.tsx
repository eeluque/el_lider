"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "./cart-context";

/** Barra fija: ir a pagar en 1 clic desde cualquier página pública con ítems en carrito */
export function CartQuickBar() {
  const { cart, total, lineCount, goToCheckout } = useCart();

  if (cart.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary/30 bg-card/95 p-3 shadow-[0_-4px_20px_rgba(117,59,25,0.12)] backdrop-blur-md supports-[backdrop-filter]:bg-card/90">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-2">
        <div className="text-sm text-foreground">
          <span className="font-semibold">{lineCount}</span> ítem{lineCount !== 1 ? "s" : ""} ·{" "}
          <span className="font-semibold text-secondary">L {total.toFixed(2)}</span>
        </div>
        <div className="flex gap-2">
          <Link href="/order">
            <Button type="button" variant="outline" size="sm">
              Revisar
            </Button>
          </Link>
          <Button type="button" size="sm" onClick={goToCheckout}>
            Pagar ahora
          </Button>
        </div>
      </div>
    </div>
  );
}
