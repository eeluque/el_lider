/**
 * Inserta muchos pedidos y líneas para probar paginación en reportes (entregados, cancelados, ventas).
 * Ejecutar después de `npm run seed` cuando ya existan menu_items.
 *
 * Uso: npm run seed:pagination
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

const DELIVERED_COUNT = 45;
const CANCELLED_COUNT = 35;

function isoDaysAgo(days: number, hour = 12) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, Math.floor(Math.random() * 50), 0, 0);
  return d.toISOString();
}

async function main() {
  const { data: menu } = await supabase.from("menu_items").select("id, price").eq("active", true).limit(6);
  if (!menu?.length) {
    console.error("No hay menu_items activos. Ejecuta primero npm run seed");
    process.exit(1);
  }

  const base = Date.now();
  const deliveredOrders = Array.from({ length: DELIVERED_COUNT }, (_, i) => {
    const m = menu[i % menu.length]!;
    const total = Number(m.price) * (1 + (i % 3));
    return {
      order_number: `PAG-DEL-${base}-${i}`,
      customer_name: `Cliente prueba ${i + 1}`,
      customer_phone: `+504 9000-${String(i).padStart(4, "0")}`,
      status: "delivered" as const,
      total_price: total,
      is_guest_order: true,
      created_at: isoDaysAgo(i % 28, 10 + (i % 8)),
    };
  });

  const cancelledOrders = Array.from({ length: CANCELLED_COUNT }, (_, i) => {
    const m = menu[(i + 2) % menu.length]!;
    return {
      order_number: `PAG-CAN-${base}-${i}`,
      customer_name: `Cancel test ${i + 1}`,
      customer_phone: `+504 8000-${String(i).padStart(4, "0")}`,
      status: "cancelled" as const,
      total_price: Number(m.price),
      is_guest_order: true,
      cancellation_reason: i % 3 === 0 ? "Tiempo de espera" : i % 3 === 1 ? "Cambio de planes" : "Otro motivo (fixture)",
      created_at: isoDaysAgo((i * 2) % 25, 14),
    };
  });

  const { data: insertedDel, error: e1 } = await supabase.from("orders").insert(deliveredOrders).select("id, total_price");
  if (e1) throw e1;

  const { data: insertedCan, error: e2 } = await supabase.from("orders").insert(cancelledOrders).select("id, total_price");
  if (e2) throw e2;

  const items: { order_id: string; menu_item_id: string; quantity: number; unit_price: number; subtotal: number }[] = [];

  for (let i = 0; i < (insertedDel ?? []).length; i++) {
    const o = insertedDel![i]!;
    const m = menu[i % menu.length]!;
    const qty = 1 + (i % 2);
    const unit = Number(m.price);
    items.push({
      order_id: o.id,
      menu_item_id: m.id,
      quantity: qty,
      unit_price: unit,
      subtotal: qty * unit,
    });
  }

  for (let i = 0; i < (insertedCan ?? []).length; i++) {
    const o = insertedCan![i]!;
    const m = menu[(i + 1) % menu.length]!;
    items.push({
      order_id: o.id,
      menu_item_id: m.id,
      quantity: 1,
      unit_price: Number(m.price),
      subtotal: Number(m.price),
    });
  }

  if (items.length) {
    const { error: e3 } = await supabase.from("order_items").insert(items);
    if (e3) throw e3;
  }

  console.log("Datos de paginación insertados:", {
    entregados: insertedDel?.length ?? 0,
    cancelados: insertedCan?.length ?? 0,
    lineas_pedido: items.length,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
