/**
 * Seed script for Comedor El Líder.
 * Run: npm run seed  (or npx tsx scripts/seed.ts)
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env" });
import { hash } from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!supabaseUrl || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function seed() {
  console.log("Seeding...");

  const adminHash = await hash("admin123", 10);
  const empHash = await hash("emp123", 10);
  const cliHash = await hash("cli123", 10);

  const { data: admin } = await supabase
    .from("users")
    .insert({
      email: "admin@ellider.com",
      password_hash: adminHash,
      full_name: "Admin El Líder",
      role: "admin",
      active: true,
    })
    .select("id")
    .single();

  const { data: emp1 } = await supabase
    .from("users")
    .insert({
      email: "empleado1@ellider.com",
      password_hash: empHash,
      full_name: "Empleado Uno",
      role: "employee",
      active: true,
    })
    .select("id")
    .single();

  const { data: cust1 } = await supabase
    .from("users")
    .insert({
      email: "cliente1@test.com",
      password_hash: cliHash,
      full_name: "María López",
      role: "customer",
      phone: "+504 9999-0001",
      active: true,
    })
    .select("id")
    .single();

  const { data: cp1 } = await supabase
    .from("customer_profiles")
    .insert({
      user_id: cust1!.id,
      full_name: "María López",
      phone: "+504 9999-0001",
      points_balance: 15,
    })
    .select("id")
    .single();

  const menuItems = [
    { name: "Baleada sencilla", description: "Baleada con frijoles", price: 35, category: "Baleadas", active: true },
    { name: "Baleada con todo", description: "Con frijoles, huevo, aguacate", price: 50, category: "Baleadas", active: true },
    { name: "Desayuno típico", description: "Huevos, frijoles, plátano, queso", price: 65, category: "Desayunos", active: true },
    { name: "Almuerzo del día", description: "Plato del día con carne y ensalada", price: 80, category: "Almuerzos", active: true },
    { name: "Sopa de res", description: "Sopa de res con verduras", price: 70, category: "Almuerzos", active: true },
    { name: "Refresco natural", description: "Limonada o horchata", price: 25, category: "Bebidas", active: true },
  ];
  const { data: insertedMenu } = await supabase.from("menu_items").insert(menuItems).select("id, name, price");

  const ingredients = [
    { name: "Harina", unit: "lb", current_stock: 50, minimum_stock: 10, active: true },
    { name: "Frijoles", unit: "lb", current_stock: 25, minimum_stock: 5, active: true },
    { name: "Huevos", unit: "unidad", current_stock: 120, minimum_stock: 30, active: true },
    { name: "Queso", unit: "lb", current_stock: 8, minimum_stock: 5, active: true },
    { name: "Aguacate", unit: "unidad", current_stock: 15, minimum_stock: 10, active: true },
    { name: "Carne de res", unit: "lb", current_stock: 20, minimum_stock: 5, active: true },
    { name: "Limones", unit: "lb", current_stock: 5, minimum_stock: 3, active: true },
  ];
  const { data: insertedIng } = await supabase.from("ingredients").insert(ingredients).select("id");

  const baleadaTodo = insertedMenu?.find((m) => m.name === "Baleada con todo");
  const refresco = insertedMenu?.find((m) => m.name === "Refresco natural");
  const desayuno = insertedMenu?.find((m) => m.name === "Desayuno típico");
  const almuerzo = insertedMenu?.find((m) => m.name === "Almuerzo del día");
  const baleadaSen = insertedMenu?.find((m) => m.name === "Baleada sencilla");

  await supabase.from("orders").insert([
    {
      order_number: "ORD-001",
      customer_id: cp1?.id ?? null,
      customer_name: "María López",
      customer_phone: "+504 9999-0001",
      status: "delivered",
      total_price: 125,
      is_guest_order: false,
      reward_points_earned: 2,
    },
    {
      order_number: "ORD-002",
      customer_id: null,
      customer_name: "Pedro Sánchez",
      customer_phone: "+504 8888-1111",
      status: "preparing",
      total_price: 65,
      is_guest_order: true,
    },
    {
      order_number: "ORD-003",
      customer_id: null,
      customer_name: "Ana García",
      customer_phone: "+504 8888-2222",
      status: "pending",
      total_price: 105,
      is_guest_order: true,
    },
    {
      order_number: "ORD-004",
      customer_id: null,
      customer_name: "Juan Pérez",
      customer_phone: "+504 8888-3333",
      status: "cancelled",
      total_price: 35,
      is_guest_order: false,
      cancellation_reason: "Cliente canceló por tiempo de espera",
    },
  ]);

  const { data: orders } = await supabase.from("orders").select("id, order_number").in("order_number", ["ORD-001", "ORD-002", "ORD-003", "ORD-004"]);
  const o1 = orders?.find((o) => o.order_number === "ORD-001");
  const o2 = orders?.find((o) => o.order_number === "ORD-002");
  const o3 = orders?.find((o) => o.order_number === "ORD-003");
  const o4 = orders?.find((o) => o.order_number === "ORD-004");

  if (o1 && baleadaTodo && refresco) {
    await supabase.from("order_items").insert([
      { order_id: o1.id, menu_item_id: baleadaTodo.id, quantity: 2, unit_price: 50, subtotal: 100 },
      { order_id: o1.id, menu_item_id: refresco.id, quantity: 1, unit_price: 25, subtotal: 25 },
    ]);
  }
  if (o2 && desayuno) {
    await supabase.from("order_items").insert([{ order_id: o2.id, menu_item_id: desayuno.id, quantity: 1, unit_price: 65, subtotal: 65 }]);
  }
  if (o3 && almuerzo && refresco) {
    await supabase.from("order_items").insert([
      { order_id: o3.id, menu_item_id: almuerzo.id, quantity: 1, unit_price: 80, subtotal: 80 },
      { order_id: o3.id, menu_item_id: refresco.id, quantity: 1, unit_price: 25, subtotal: 25 },
    ]);
  }
  if (o4 && baleadaSen) {
    await supabase.from("order_items").insert([{ order_id: o4.id, menu_item_id: baleadaSen.id, quantity: 1, unit_price: 35, subtotal: 35 }]);
  }

  const harina = insertedIng?.[0]?.id;
  const frijoles = insertedIng?.[1]?.id;
  if (harina && admin) {
    await supabase.from("inventory_movements").insert({
      ingredient_id: harina,
      movement_type: "IN",
      quantity: 20,
      reason: "Compra semanal",
      responsible_user_id: admin.id,
    });
  }
  if (frijoles && admin) {
    await supabase.from("inventory_movements").insert({
      ingredient_id: frijoles,
      movement_type: "OUT",
      quantity: 5,
      reason: "Uso cocina",
      responsible_user_id: admin.id,
    });
  }

  console.log("Seed done.");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
