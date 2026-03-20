/** Carrito en sessionStorage — misma clave en menú, /order y checkout */

export const CART_STORAGE_KEY = "el_lider_cart";

export type CartItem = {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const s = sessionStorage.getItem(CART_STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function writeCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}
