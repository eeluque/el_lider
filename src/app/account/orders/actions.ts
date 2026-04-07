"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";

export type CancelOrderState = { error?: string; success?: string } | null;

const ALLOWED_REASONS = new Set([
  "Cambio de planes",
  "Elegí otro platillo",
  "Error al realizar el pedido",
  "El tiempo de espera es muy largo",
  "Otro",
]);

export async function cancelOwnOrder(
  _prev: CancelOrderState,
  formData: FormData
): Promise<CancelOrderState> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "customer") {
    return { error: "No autorizado." };
  }

  const orderId = String(formData.get("orderId") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const customReason = String(formData.get("customReason") ?? "").trim();

  if (!orderId) {
    return { error: "Pedido inválido." };
  }

  if (!reason || !ALLOWED_REASONS.has(reason)) {
    return { error: "Selecciona un motivo de cancelación." };
  }

  const finalReason = reason === "Otro" ? customReason : reason;
  if (!finalReason) {
    return { error: "Describe el motivo de cancelación." };
  }

  const supabase = getSupabaseAdmin();
  const { data: profile } = await supabase
    .from("customer_profiles")
    .select("id")
    .eq("user_id", session.user.id)
    .single();

  if (!profile) {
    return { error: "No se encontró el perfil del cliente." };
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .eq("customer_id", profile.id)
    .single();

  if (!order) {
    return { error: "No se encontró el pedido." };
  }

  if (!["pending", "preparing"].includes(order.status)) {
    return { error: "Este pedido ya no se puede cancelar." };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled", cancellation_reason: finalReason })
    .eq("id", orderId);

  if (error) {
    console.error(error);
    return { error: "No se pudo cancelar el pedido." };
  }

  revalidatePath("/account/orders");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/orders");

  return { success: "Pedido cancelado correctamente." };
}
