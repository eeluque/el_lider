/**
 * Datos extra para probar reportes en Supabase (pedidos entregados/cancelados, movimientos).
 * Ejecutar después de `npm run seed` si la BD está vacía de menú/insumos.
 *
 * Uso: npm run seed:report-fixtures
 * Requiere: .env con NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!supabaseUrl || !serviceKey) {
  console.error("Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  const { data: admin } = await supabase.from("users").select("id").eq("role", "admin").limit(1).maybeSingle();
  const adminId = admin?.id ?? null;

  const { data: menuSample } = await supabase.from("menu_items").select("id, name").eq("active", true).limit(2);
  const { data: ingredients } = await supabase.from("ingredients").select("id, name").eq("active", true).limit(3);

  if (!menuSample?.length) {
    console.error("No hay menu_items activos. Ejecuta primero npm run seed");
    process.exit(1);
  }
  if (!ingredients?.length) {
    console.error("No hay ingredients. Ejecuta primero npm run seed");
    process.exit(1);
  }

  const m1 = menuSample[0]!;
  const m2 = menuSample[1] ?? menuSample[0]!;
  const ingA = ingredients[0]!;
  const ingB = ingredients[1] ?? ingredients[0]!;

  const now = new Date();
  const d7 = new Date(now);
  d7.setDate(d7.getDate() - 3);
  const iso = (d: Date) => d.toISOString();

  const ordersPayload = [
    {
      order_number: `RPT-DEL-${Date.now()}`,
      customer_name: "Cliente Reportes",
      customer_phone: "+504 0000-0000",
      status: "delivered" as const,
      total_price: 150,
      is_guest_order: true,
      created_at: iso(d7),
    },
    {
      order_number: `RPT-READY-${Date.now()}`,
      customer_name: "Cliente Reportes 2",
      customer_phone: "+504 0000-0001",
      status: "ready" as const,
      total_price: 80,
      is_guest_order: true,
      created_at: iso(d7),
    },
    {
      order_number: `RPT-CAN-${Date.now()}`,
      customer_name: "Cliente Cancel",
      customer_phone: "+504 0000-0002",
      status: "cancelled" as const,
      total_price: 45,
      is_guest_order: true,
      cancellation_reason: "Tiempo de espera (fixture reportes)",
      created_at: iso(d7),
    },
  ];

  const { data: insertedOrders, error: ordErr } = await supabase.from("orders").insert(ordersPayload).select("id, order_number, status");
  if (ordErr) throw ordErr;

  const del = insertedOrders?.find((o) => o.status === "delivered");
  const ready = insertedOrders?.find((o) => o.status === "ready");
  const can = insertedOrders?.find((o) => o.status === "cancelled");

  const items: { order_id: string; menu_item_id: string; quantity: number; unit_price: number; subtotal: number }[] = [];
  if (del) {
    items.push(
      { order_id: del.id, menu_item_id: m1.id, quantity: 2, unit_price: 50, subtotal: 100 },
      { order_id: del.id, menu_item_id: m2.id, quantity: 1, unit_price: 50, subtotal: 50 }
    );
  }
  if (ready) {
    items.push({ order_id: ready.id, menu_item_id: m1.id, quantity: 1, unit_price: 80, subtotal: 80 });
  }
  if (can) {
    items.push({ order_id: can.id, menu_item_id: m2.id, quantity: 1, unit_price: 45, subtotal: 45 });
  }
  if (items.length) {
    const { error: oiErr } = await supabase.from("order_items").insert(items);
    if (oiErr) throw oiErr;
  }

  const movs = [];
  if (adminId) {
    movs.push({
      ingredient_id: ingA.id,
      movement_type: "IN" as const,
      quantity: 15,
      reason: "Fixture: compra reportes",
      responsible_user_id: adminId,
      created_at: iso(d7),
    });
    movs.push({
      ingredient_id: ingB.id,
      movement_type: "OUT" as const,
      quantity: 4,
      reason: "Fixture: uso cocina reportes",
      responsible_user_id: adminId,
      created_at: iso(d7),
    });
    movs.push({
      ingredient_id: ingA.id,
      movement_type: "ADJUSTMENT" as const,
      quantity: 1,
      reason: "Fixture: ajuste inventario",
      responsible_user_id: adminId,
      created_at: iso(d7),
    });
  }
  if (movs.length) {
    const { error: movErr } = await supabase.from("inventory_movements").insert(movs);
    if (movErr) throw movErr;
  }

  console.log("Fixtures de reportes insertados:", {
    orders: insertedOrders?.map((o) => o.order_number),
    movements: movs.length,
    nota: adminId ? "OK" : "Sin usuario admin: no se insertaron movimientos de inventario",
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
