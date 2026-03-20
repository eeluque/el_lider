import { getSupabaseAdmin } from "@/lib/db";
import type { Ingredient, InventoryMovement, InventoryMovementType } from "@/types";

export async function getIngredients(activeOnly = false): Promise<Ingredient[]> {
  const supabase = getSupabaseAdmin();
  let q = supabase.from("ingredients").select("*").order("name");
  if (activeOnly) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Ingredient[];
}

export async function getIngredientById(id: string): Promise<Ingredient | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("ingredients").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data as Ingredient;
}

export async function getCriticalStock(): Promise<Ingredient[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .eq("active", true)
    .filter("current_stock", "lte", "minimum_stock")
    .order("current_stock");
  if (error) throw error;
  return (data ?? []) as Ingredient[];
}

export async function getInventoryMovements(params?: {
  ingredientId?: string;
  from?: string;
  to?: string;
}): Promise<InventoryMovement[]> {
  const supabase = getSupabaseAdmin();
  let q = supabase
    .from("inventory_movements")
    .select("*, ingredient:ingredients(id, name)")
    .order("created_at", { ascending: false });
  if (params?.ingredientId) q = q.eq("ingredient_id", params.ingredientId);
  if (params?.from) q = q.gte("created_at", params.from);
  if (params?.to) q = q.lte("created_at", params.to);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as InventoryMovement[];
}

export async function createMovement(params: {
  ingredientId: string;
  movementType: InventoryMovementType;
  quantity: number;
  reason: string | null;
  userId: string | null;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error: movError } = await supabase.from("inventory_movements").insert({
    ingredient_id: params.ingredientId,
    movement_type: params.movementType,
    quantity: params.quantity,
    reason: params.reason,
    responsible_user_id: params.userId,
  });
  if (movError) throw movError;

  const { data: ing } = await supabase.from("ingredients").select("current_stock").eq("id", params.ingredientId).single();
  if (!ing) return;
  const current = Number(ing.current_stock);
  const delta = params.movementType === "OUT" ? -params.quantity : params.quantity;
  const { error: updError } = await supabase
    .from("ingredients")
    .update({ current_stock: Math.max(0, current + delta) })
    .eq("id", params.ingredientId);
  if (updError) throw updError;
}
