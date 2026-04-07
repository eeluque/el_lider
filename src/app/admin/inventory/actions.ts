"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";
import { createMovement } from "@/services/inventory";
import type { InventoryMovementType } from "@/types";

export type InventoryFormState = { error?: string; success?: string } | null;

export async function createIngredient(
  _prev: InventoryFormState,
  formData: FormData
): Promise<InventoryFormState> {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { error: "No autorizado." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const currentStock = Number(formData.get("currentStock"));
  const minimumStock = Number(formData.get("minimumStock"));
  const active = formData.get("active") === "on";

  if (!name || !unit) {
    return { error: "Nombre y unidad son obligatorios." };
  }

  if (!Number.isFinite(currentStock) || currentStock < 0) {
    return { error: "El stock actual debe ser 0 o mayor." };
  }

  if (!Number.isFinite(minimumStock) || minimumStock < 0) {
    return { error: "El stock mínimo debe ser 0 o mayor." };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("ingredients").insert({
    name,
    unit,
    current_stock: currentStock,
    minimum_stock: minimumStock,
    active,
  });

  if (error) {
    console.error(error);
    return { error: "No se pudo registrar el insumo." };
  }

  revalidateInventoryViews();
  return { success: "Insumo registrado correctamente." };
}

export async function updateIngredient(
  _prev: InventoryFormState,
  formData: FormData
): Promise<InventoryFormState> {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { error: "No autorizado." };
  }

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const unit = String(formData.get("unit") ?? "").trim();
  const currentStock = Number(formData.get("currentStock"));
  const minimumStock = Number(formData.get("minimumStock"));
  const active = formData.get("active") === "on";

  if (!id) {
    return { error: "No se encontró el insumo a editar." };
  }

  if (!name || !unit) {
    return { error: "Nombre y unidad son obligatorios." };
  }

  if (!Number.isFinite(currentStock) || currentStock < 0) {
    return { error: "El stock actual debe ser 0 o mayor." };
  }

  if (!Number.isFinite(minimumStock) || minimumStock < 0) {
    return { error: "El stock mínimo debe ser 0 o mayor." };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("ingredients")
    .update({
      name,
      unit,
      current_stock: currentStock,
      minimum_stock: minimumStock,
      active,
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    return { error: "No se pudo actualizar el insumo." };
  }

  revalidateInventoryViews();
  return { success: "Insumo actualizado." };
}

export async function registerInventoryMovement(
  _prev: InventoryFormState,
  formData: FormData
): Promise<InventoryFormState> {
  const session = await auth();
  if (session?.user?.role !== "admin" && session?.user?.role !== "employee") {
    return { error: "No autorizado." };
  }

  const ingredientId = String(formData.get("ingredientId") ?? "").trim();
  const movementType = String(formData.get("movementType") ?? "").trim() as InventoryMovementType;
  const quantity = Number(formData.get("quantity"));
  const reason = String(formData.get("reason") ?? "").trim();

  if (!ingredientId) {
    return { error: "Selecciona un insumo." };
  }

  if (!["IN", "OUT", "ADJUSTMENT"].includes(movementType)) {
    return { error: "Selecciona un tipo de movimiento válido." };
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { error: "La cantidad debe ser mayor que 0." };
  }

  try {
    await createMovement({
      ingredientId,
      movementType,
      quantity,
      reason: reason || null,
      userId: session.user.id ?? null,
    });
  } catch (error) {
    console.error(error);
    return { error: "No se pudo registrar el movimiento." };
  }

  revalidateInventoryViews();
  return { success: "Movimiento registrado correctamente." };
}

function revalidateInventoryViews() {
  revalidatePath("/admin/inventory");
  revalidatePath("/employee/inventory");
  revalidatePath("/admin/reports/critical-stock");
  revalidatePath("/admin/reports/inventory-kardex");
  revalidatePath("/employee/reports/critical-stock");
}
