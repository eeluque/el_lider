"use server";

import { auth } from "@/lib/auth";
import { updateOrderStatus as updateStatus } from "@/services/orders";
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
