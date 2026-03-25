import { getSupabaseAdmin } from "@/lib/db";

export async function getUnreadNotifications() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("read", false)
    .eq("resolved", false)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function markNotificationRead(id: string) {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id);
}

export async function resolveNotification(ingredientId: string) {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("notifications")
    .update({ resolved: true, read: true })
    .eq("ingredient_id", ingredientId)
    .eq("resolved", false);
}

export async function createCriticalStockNotification(
  ingredientId: string,
  ingredientName: string,
  currentStock: number,
  minimumStock: number
) {
  const supabase = getSupabaseAdmin();

  // Evita duplicados — si ya hay una activa para este ingrediente, no crea otra
  const { data: existing } = await supabase
    .from("notifications")
    .select("id")
    .eq("ingredient_id", ingredientId)
    .eq("resolved", false)
    .single();

  if (existing) return;

  await supabase.from("notifications").insert({
    ingredient_id: ingredientId,
    ingredient_name: ingredientName,
    current_stock: currentStock,
    minimum_stock: minimumStock,
  });
}