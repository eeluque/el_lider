"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";
import {
  CATEGORY_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  hasLengthInRange,
} from "@/lib/field-rules";

export type MenuItemFormState = { error?: string; success?: string } | null;

export async function createMenuItem(
  _prev: MenuItemFormState,
  formData: FormData
): Promise<MenuItemFormState> {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { error: "No autorizado." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const priceValue = Number(formData.get("price"));
  const active = formData.get("active") === "true";

  if (!hasLengthInRange(name, NAME_MIN_LENGTH, NAME_MAX_LENGTH)) {
    return { error: `El nombre del platillo debe tener entre ${NAME_MIN_LENGTH} y ${NAME_MAX_LENGTH} caracteres.` };
  }

  if (category.length > CATEGORY_MAX_LENGTH) {
    return { error: `La categoría no puede exceder ${CATEGORY_MAX_LENGTH} caracteres.` };
  }

  if (description.length > DESCRIPTION_MAX_LENGTH) {
    return { error: `La descripción no puede exceder ${DESCRIPTION_MAX_LENGTH} caracteres.` };
  }

  if (!Number.isFinite(priceValue) || priceValue <= 0) {
    return { error: "El precio debe ser mayor que 0." };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("menu_items").insert({
    name,
    description: description || null,
    category: category || null,
    price: priceValue,
    active,
  });

  if (error) {
    console.error(error);
    return { error: "No se pudo guardar el platillo." };
  }

  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/order");

  return { success: "Platillo registrado correctamente." };
}

export async function updateMenuItem(
  _prev: MenuItemFormState,
  formData: FormData
): Promise<MenuItemFormState> {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { error: "No autorizado." };
  }

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const priceValue = Number(formData.get("price"));
  const active = formData.get("active") === "true";

  if (!id) {
    return { error: "No se encontró el platillo a editar." };
  }

  if (!hasLengthInRange(name, NAME_MIN_LENGTH, NAME_MAX_LENGTH)) {
    return { error: `El nombre del platillo debe tener entre ${NAME_MIN_LENGTH} y ${NAME_MAX_LENGTH} caracteres.` };
  }

  if (category.length > CATEGORY_MAX_LENGTH) {
    return { error: `La categoría no puede exceder ${CATEGORY_MAX_LENGTH} caracteres.` };
  }

  if (description.length > DESCRIPTION_MAX_LENGTH) {
    return { error: `La descripción no puede exceder ${DESCRIPTION_MAX_LENGTH} caracteres.` };
  }

  if (!Number.isFinite(priceValue) || priceValue <= 0) {
    return { error: "El precio debe ser mayor que 0." };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("menu_items")
    .update({
      name,
      description: description || null,
      category: category || null,
      price: priceValue,
      active,
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    return { error: "No se pudo actualizar el platillo." };
  }

  revalidatePath("/admin/menu");
  revalidatePath("/menu");
  revalidatePath("/order");

  return { success: "Platillo actualizado." };
}
