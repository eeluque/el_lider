"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
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

export type CreateEmployeeState = { error?: string; success?: string } | null;

export async function createEmployee(
  _prev: CreateEmployeeState,
  formData: FormData
): Promise<CreateEmployeeState> {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { error: "No autorizado." };
  }

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
  const { data: existing } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
  if (existing) {
    return { error: "Ya existe un usuario con ese correo." };
  }

  const passwordHash = await hash(password, 10);
  const { error } = await supabase.from("users").insert({
    email,
    password_hash: passwordHash,
    full_name: fullName || null,
    phone: phone || null,
    role: "employee",
    active: true,
  });

  if (error) {
    console.error(error);
    return { error: "No se pudo crear el empleado." };
  }

  revalidatePath("/admin/employees");
  return { success: "Empleado creado correctamente." };
}
