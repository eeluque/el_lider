import { getSupabaseAdmin } from "@/lib/db";
import type { User } from "@/types";

export async function getUsers(activeOnly = false): Promise<User[]> {
  const supabase = getSupabaseAdmin();
  let q = supabase.from("users").select("*").order("full_name");
  if (activeOnly) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as User[];
}

export async function getUserById(id: string): Promise<User | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return data as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  if (error || !data) return null;
  return data as User;
}

export async function getUsersByRole(role: "admin" | "employee" | "customer"): Promise<User[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", role)
    .order("full_name");
  if (error) throw error;
  return (data ?? []) as User[];
}