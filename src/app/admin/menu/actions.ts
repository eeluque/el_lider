"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";

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
  const active = formData.get("active") === "on";

  if (!name) {
    return { error: "El nombre del platillo es obligatorio." };
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
  const active = formData.get("active") === "on";

  if (!id) {
    return { error: "No se encontró el platillo a editar." };
  }

  if (!name) {
    return { error: "El nombre del platillo es obligatorio." };
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
