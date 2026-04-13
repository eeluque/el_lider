"use server";

import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";
import { createOrder } from "@/services/orders";
import type { CartItem } from "@/lib/cart-storage";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PHONE_MAX_LENGTH,
  PHONE_MIN_LENGTH,
  hasLengthInRange,
  isValidPhone,
} from "@/lib/field-rules";

export async function submitOrder(formData: FormData): Promise<{ error?: string; orderNumber?: string }> {
  const itemsJson = formData.get("items");
  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();

  if (!customerName || !customerPhone) {
    return { error: "Nombre y teléfono son obligatorios." };
  }

  if (!hasLengthInRange(customerName, NAME_MIN_LENGTH, NAME_MAX_LENGTH)) {
    return { error: `El nombre debe tener entre ${NAME_MIN_LENGTH} y ${NAME_MAX_LENGTH} caracteres.` };
  }

  if (!isValidPhone(customerPhone) || !hasLengthInRange(customerPhone, PHONE_MIN_LENGTH, PHONE_MAX_LENGTH)) {
    return { error: "Ingresa un teléfono válido." };
  }

  let cart: CartItem[];
  try {
    cart = JSON.parse(String(itemsJson ?? "[]"));
  } catch {
    return { error: "Carrito inválido." };
  }

  if (!Array.isArray(cart) || cart.length === 0) {
    return { error: "No hay ítems en el pedido." };
  }

  const session = await auth();
  let customerId: string | null = null;
  if (session?.user?.role === "customer" && session.user.id) {
    const supabase = getSupabaseAdmin();
    const { data: profile } = await supabase
      .from("customer_profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();
    if (profile) customerId = profile.id;
  }

  const orderItems = cart.map((c) => ({
    menuItemId: c.menuItemId,
    quantity: c.quantity,
    unitPrice: c.unitPrice,
  }));

  try {
    const { orderNumber } = await createOrder({
      customerId,
      customerName,
      customerPhone,
      isGuest: !customerId,
      items: orderItems,
    });
    return { orderNumber };
  } catch (err) {
    console.error(err);
    return { error: "No se pudo crear el pedido. Intenta de nuevo." };
  }
}
