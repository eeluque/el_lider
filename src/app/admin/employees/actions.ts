"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";

export type CreateEmployeeState = { error?: string; success?: string } | null;

export async function createEmployee(
  _prev: CreateEmployeeState,
  formData: FormData
): Promise<CreateEmployeeState> {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return { error: "No autorizado." };
  }

  const email = (formData.get("email") as string)?.trim()?.toLowerCase();
  const password = formData.get("password") as string;
  const fullName = (formData.get("fullName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();

  if (!email || !password) {
    return { error: "Correo y contraseña son obligatorios." };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
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
