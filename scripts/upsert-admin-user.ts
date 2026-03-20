/**
 * Crea o actualiza un usuario con rol admin (NextAuth Credentials).
 *
 * Uso (recomendado, sin guardar la contraseña en archivos):
 *   ADMIN_EMAIL=eduardoluque08@gmail.com ADMIN_PASSWORD=tu_contraseña npm run upsert-admin
 *
 * Requiere .env.local con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 */

import { config } from "dotenv";
import { hash } from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env" });

const email = (process.env.ADMIN_EMAIL ?? "eduardoluque08@gmail.com").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const fullName = process.env.ADMIN_FULL_NAME ?? "Eduardo Luque";

async function main() {
  if (!password || password.length < 6) {
    console.error("Define ADMIN_PASSWORD (mín. 6 caracteres), por ejemplo:");
    console.error('  set ADMIN_PASSWORD=tu_clave && npm run upsert-admin');
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const passwordHash = await hash(password, 10);

  const { data: existing } = await supabase.from("users").select("id").eq("email", email).maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("users")
      .update({
        password_hash: passwordHash,
        full_name: fullName,
        role: "admin",
        active: true,
      })
      .eq("id", existing.id);
    if (error) throw error;
    console.log("Usuario actualizado a admin:", email);
  } else {
    const { error } = await supabase.from("users").insert({
      email,
      password_hash: passwordHash,
      full_name: fullName,
      role: "admin",
      active: true,
    });
    if (error) throw error;
    console.log("Usuario admin creado:", email);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
