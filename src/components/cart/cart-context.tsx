"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { readCart, writeCart, type CartItem } from "@/lib/cart-storage";
import type { MenuItem } from "@/types";

type CartContextValue = {
  cart: CartItem[];
  add: (item: MenuItem, delta?: number) => void;
  removeLine: (menuItemId: string) => void;
  clearCart: () => void;
  getQuantity: (menuItemId: string) => number;
  total: number;
  lineCount: number;
  goToCheckout: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>(() => readCart());

  const add = useCallback(
    (item: MenuItem, delta = 1) => {
      setCart((prev) => {
        const existing = prev.find((c) => c.menuItemId === item.id);
        const rest = prev.filter((c) => c.menuItemId !== item.id);
        const newQty = (existing?.quantity ?? 0) + delta;
        let next: CartItem[];
        if (newQty <= 0) {
          next = rest;
        } else {
          next = [
            ...rest,
            {
              menuItemId: item.id,
              name: item.name,
              quantity: newQty,
              unitPrice: Number(item.price),
            },
          ];
        }
        writeCart(next);
        return next;
      });
    },
    []
  );

  const removeLine = useCallback((menuItemId: string) => {
    setCart((prev) => {
      const next = prev.filter((c) => c.menuItemId !== menuItemId);
      writeCart(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    writeCart([]);
  }, []);

  const getQuantity = useCallback(
    (menuItemId: string) => cart.find((c) => c.menuItemId === menuItemId)?.quantity ?? 0,
    [cart]
  );

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [cart]
  );

  const lineCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const goToCheckout = useCallback(() => {
    writeCart(cart);
    router.push("/checkout");
  }, [cart, router]);

  const value = useMemo(
    () => ({
      cart,
      add,
      removeLine,
      clearCart,
      getQuantity,
      total,
      lineCount,
      goToCheckout,
    }),
    [cart, add, removeLine, clearCart, getQuantity, total, lineCount, goToCheckout]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return ctx;
}
