import { getSupabaseAdmin } from "@/lib/db";
import type { MenuItem } from "@/types";

export async function getActiveMenuItems(): Promise<MenuItem[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("active", true)
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as MenuItem[];
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as MenuItem[];
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("menu_items").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data as MenuItem;
}
