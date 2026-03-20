"use server";

import { hash } from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/db";
import { redirect } from "next/navigation";

export type RegisterState = { error?: string } | null;

export async function registerCustomer(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const email = (formData.get("email") as string)?.trim()?.toLowerCase();
  const password = formData.get("password") as string;
  const fullName = (formData.get("fullName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();

  if (!email || !password) {
    return { error: "Email y contraseña son requeridos." };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase.from("users").select("id").eq("email", email).single();
  if (existing) {
    return { error: "Ya existe una cuenta con este correo." };
  }

  const passwordHash = await hash(password, 10);
  const { data: newUser, error: userError } = await supabase
    .from("users")
    .insert({
      email,
      password_hash: passwordHash,
      full_name: fullName || null,
      role: "customer",
      phone: phone || null,
      active: true,
    })
    .select("id")
    .single();

  if (userError || !newUser) {
    console.error(userError);
    return { error: "Error al crear la cuenta. Intenta de nuevo." };
  }

  const { error: profileError } = await supabase.from("customer_profiles").insert({
    user_id: newUser.id,
    full_name: fullName || null,
    phone: phone || null,
    points_balance: 0,
  });

  if (profileError) {
    console.error(profileError);
    return { error: "Error al crear el perfil. Intenta de nuevo." };
  }

  redirect("/login?registered=1");
}
