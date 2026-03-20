"use client";

import { PublicNav } from "@/components/layout/PublicNav";
import { CartProvider } from "@/components/cart/cart-context";
import { CartQuickBar } from "@/components/cart/cart-quick-bar";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <PublicNav />
      <main className="mx-auto max-w-6xl px-4 py-6 pb-28">{children}</main>
      <CartQuickBar />
    </CartProvider>
  );
}
