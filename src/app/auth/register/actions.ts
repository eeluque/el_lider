"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/db";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_MAX_LENGTH,
  PHONE_MIN_LENGTH,
  hasLengthInRange,
  isValidEmail,
  isValidPhone,
} from "@/lib/field-rules";

export type RegisterState = { error?: string } | null;

export async function registerCustomer(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!email || !password) {
    return { error: "Correo y contraseña son obligatorios." };
  }

  if (!isValidEmail(email)) {
    return { error: "Ingresa un correo válido." };
  }

  if (fullName && !hasLengthInRange(fullName, NAME_MIN_LENGTH, NAME_MAX_LENGTH)) {
    return { error: `El nombre debe tener entre ${NAME_MIN_LENGTH} y ${NAME_MAX_LENGTH} caracteres.` };
  }

  if (phone && (!isValidPhone(phone) || !hasLengthInRange(phone, PHONE_MIN_LENGTH, PHONE_MAX_LENGTH))) {
    return { error: "Ingresa un teléfono válido." };
  }

  if (!hasLengthInRange(password, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH)) {
    return { error: `La contraseña debe tener entre ${PASSWORD_MIN_LENGTH} y ${PASSWORD_MAX_LENGTH} caracteres.` };
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
