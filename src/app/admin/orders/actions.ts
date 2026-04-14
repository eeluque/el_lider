"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";
import { createOrder, updateOrderStatus as updateStatus } from "@/services/orders";
import type { OrderStatus } from "@/types";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PHONE_MAX_LENGTH,
  PHONE_MIN_LENGTH,
  hasLengthInRange,
  isValidPhone,
} from "@/lib/field-rules";

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  cancellationReason?: string | null
) {
  const session = await auth();
  if (session?.user?.role !== "admin" && session?.user?.role !== "employee") {
    throw new Error("No autorizado");
  }
  await updateStatus(orderId, status, cancellationReason);
  revalidatePath("/admin/orders");
}

export type ManualOrderFormState = { error?: string; success?: string } | null;

export async function createManualOrder(
  _prev: ManualOrderFormState,
  formData: FormData
): Promise<ManualOrderFormState> {
  const session = await auth();
  if (session?.user?.role !== "admin" && session?.user?.role !== "employee") {
    return { error: "No autorizado." };
  }

  const customerName = String(formData.get("customerName") ?? "").trim();
  const customerPhone = String(formData.get("customerPhone") ?? "").trim();
  const lineIds = String(formData.get("lineIds") ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  // 1. Validaciones Básicas
  if (!customerName || !customerPhone) return { error: "Nombre y teléfono son obligatorios." };
  if (!hasLengthInRange(customerName, NAME_MIN_LENGTH, NAME_MAX_LENGTH)) return { error: "Nombre fuera de rango." };
  if (!isValidPhone(customerPhone)) return { error: "Teléfono inválido." };
  if (lineIds.length === 0) return { error: "Agrega al menos un platillo." };

  // 2. Procesamiento de Líneas con limpieza profunda
  const selectedLines = lineIds.map((id) => {
    const menuItemId = String(formData.get(`itemId-${id}`) ?? "").trim();
    const rawQty = formData.get(`quantity-${id}`);
    const quantity = rawQty === null || rawQty === "" ? 0 : Number(rawQty);
    return { menuItemId, quantity };
  }).filter(line => line.menuItemId !== "");

  if (selectedLines.length === 0) {
    return { error: "Selecciona al menos un platillo válido." };
  }

  // 3. Validación de Cantidades (Aquí es donde fallaba)
  const hasInvalidQuantity = selectedLines.some(line => 
    isNaN(line.quantity) || line.quantity <= 0
  );

  if (hasInvalidQuantity) {
    return { error: "Todas las cantidades deben ser mayores que 0." };
  }

  // 4. Validación en Base de Datos
  const supabase = getSupabaseAdmin();
  const uniqueIds = [...new Set(selectedLines.map((l) => l.menuItemId))];
  const { data: menuItems, error: dbError } = await supabase
    .from("menu_items")
    .select("id, price, active")
    .in("id", uniqueIds);

  if (dbError) return { error: "Error al validar productos." };

  const menuMap = new Map((menuItems ?? []).map((m) => [m.id, m]));
  const orderItems = [];

  for (const line of selectedLines) {
    const item = menuMap.get(line.menuItemId);
    if (!item || !item.active) return { error: `El producto ${line.menuItemId} no está disponible.` };
    
    orderItems.push({
      menuItemId: line.menuItemId,
      quantity: line.quantity,
      unitPrice: Number(item.price),
    });
  }

  // 5. Creación del Pedido
  try {
    const { orderNumber } = await createOrder({
      customerId: null,
      customerName,
      customerPhone,
      isGuest: true,
      items: orderItems,
    });

    revalidatePath("/admin/orders");
    return { success: `Pedido ${orderNumber} registrado correctamente.` };
  } catch (e) {
    return { error: "No se pudo registrar el pedido." };
  }
}