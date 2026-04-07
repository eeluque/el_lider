"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";
import { createOrder, updateOrderStatus as updateStatus } from "@/services/orders";
import type { OrderStatus } from "@/types";

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
    .map((value) => value.trim())
    .filter(Boolean);

  if (!customerName || !customerPhone) {
    return { error: "Nombre y teléfono son obligatorios." };
  }

  if (lineIds.length === 0) {
    return { error: "Agrega al menos un platillo al pedido." };
  }

  const selectedLines = lineIds
    .map((id) => {
      const menuItemId = String(formData.get(`itemId-${id}`) ?? "").trim();
      const quantity = Number(formData.get(`quantity-${id}`));
      return { menuItemId, quantity };
    })
    .filter((line) => line.menuItemId);

  if (selectedLines.length === 0) {
    return { error: "Selecciona al menos un platillo válido." };
  }

  if (selectedLines.some((line) => !Number.isFinite(line.quantity) || line.quantity <= 0)) {
    return { error: "Todas las cantidades deben ser mayores que 0." };
  }

  const supabase = getSupabaseAdmin();
  const uniqueIds = [...new Set(selectedLines.map((line) => line.menuItemId))];
  const { data: menuItems, error } = await supabase
    .from("menu_items")
    .select("id, price, active")
    .in("id", uniqueIds);

  if (error) {
    console.error(error);
    return { error: "No se pudieron validar los productos seleccionados." };
  }

  const menuMap = new Map((menuItems ?? []).map((item) => [item.id, item]));
  const orderItems = [];

  for (const line of selectedLines) {
    const item = menuMap.get(line.menuItemId);
    if (!item || item.active === false) {
      return { error: "Uno de los platillos seleccionados ya no está disponible." };
    }
    orderItems.push({
      menuItemId: line.menuItemId,
      quantity: line.quantity,
      unitPrice: Number(item.price),
    });
  }

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
  } catch (creationError) {
    console.error(creationError);
    return { error: "No se pudo registrar el pedido." };
  }
}
