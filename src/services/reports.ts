import { getSupabaseAdmin } from "@/lib/db";
import { toLocalDateString } from "@/lib/date-range";

function toDayBounds(from: string, to: string) {
  const f = from.length <= 10 ? `${from}T00:00:00` : from;
  const t = to.length <= 10 ? `${to}T23:59:59` : to;
  return { fromIso: f, toIso: t };
}

/** Pedidos entregados en un rango de fechas (YYYY-MM-DD), inclusive. */
export async function getDeliveredOrdersInRange(fromDate: string, toDate: string) {
  const supabase = getSupabaseAdmin();
  const from = `${fromDate}T00:00:00`;
  const to = `${toDate}T23:59:59`;
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*, menu_item:menu_items(name))")
    .eq("status", "delivered")
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at", { ascending: false });
  return data ?? [];
}

/** Un solo día (compatibilidad). */
export async function getDeliveredOrdersDaily(date: string) {
  return getDeliveredOrdersInRange(date, date);
}

/** Inventory movements with optional filters */
export async function getInventoryKardex(params: { ingredientId?: string; from?: string; to?: string }) {
  const supabase = getSupabaseAdmin();
  let q = supabase
    .from("inventory_movements")
    .select("*, ingredient:ingredients(name, unit), responsible:users(id, full_name)")
    .order("created_at", { ascending: false });
  if (params.ingredientId) q = q.eq("ingredient_id", params.ingredientId);
  if (params.from && params.to) {
    const { fromIso, toIso } = toDayBounds(params.from.slice(0, 10), params.to.slice(0, 10));
    q = q.gte("created_at", fromIso).lte("created_at", toIso);
  }
  const { data } = await q;
  return data ?? [];
}

/** Critical stock (current_stock <= minimum_stock) */
export async function getCriticalStockReport() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("ingredients")
    .select("*")
    .eq("active", true)
    .order("current_stock");
  const list = (data ?? []) as { id: string; name: string; unit: string; current_stock: number; minimum_stock: number }[];
  return list.filter((i) => Number(i.current_stock) <= Number(i.minimum_stock));
}

/** Cancelled orders with optional filters */
export async function getCancelledOrders(params: { from?: string; to?: string; reason?: string }) {
  const supabase = getSupabaseAdmin();
  let q = supabase
    .from("orders")
    .select("*, order_items(*, menu_item:menu_items(name))")
    .eq("status", "cancelled")
    .order("created_at", { ascending: false });
  if (params.from && params.to) {
    const { fromIso, toIso } = toDayBounds(params.from, params.to);
    q = q.gte("created_at", fromIso).lte("created_at", toIso);
  }
  if (params.reason) q = q.ilike("cancellation_reason", `%${params.reason}%`);
  const { data } = await q;
  return data ?? [];
}

/** Ventas totales por día natural (zona local) en el rango. */
export async function getSalesSummary(params: { from: string; to: string }) {
  const supabase = getSupabaseAdmin();
  const { fromIso, toIso } = toDayBounds(params.from, params.to);
  const { data } = await supabase
    .from("orders")
    .select("created_at, total_price, status")
    .in("status", ["delivered", "ready"])
    .gte("created_at", fromIso)
    .lte("created_at", toIso)
    .order("created_at");
  const rows = (data ?? []) as { created_at: string; total_price: number; status: string }[];
  const delivered = rows.filter((r) => r.status === "delivered" || r.status === "ready");
  const byPeriod: Record<string, number> = {};
  for (const r of delivered) {
    const d = new Date(r.created_at);
    const key = toLocalDateString(d);
    byPeriod[key] = (byPeriod[key] ?? 0) + Number(r.total_price);
  }
  return { byPeriod, total: delivered.reduce((s, r) => s + Number(r.total_price), 0) };
}

/** Top dishes by quantity sold in a period */
export async function getTopDishes(params: { from: string; to: string }) {
  const supabase = getSupabaseAdmin();
  const { fromIso, toIso } = toDayBounds(params.from, params.to);
  const { data: orders } = await supabase
    .from("orders")
    .select("id")
    .in("status", ["delivered", "ready"])
    .gte("created_at", fromIso)
    .lte("created_at", toIso);
  const orderIds = (orders ?? []).map((o) => o.id);
  if (orderIds.length === 0) return [];
  const { data: items } = await supabase
    .from("order_items")
    .select("menu_item_id, quantity, unit_price")
    .in("order_id", orderIds);
  const byItem: Record<string, { name: string; quantity: number; revenue: number }> = {};
  for (const i of items ?? []) {
    const id = i.menu_item_id;
    if (!byItem[id]) byItem[id] = { name: id, quantity: 0, revenue: 0 };
    byItem[id].quantity += i.quantity;
    byItem[id].revenue += i.quantity * Number(i.unit_price);
  }
  const menuIds = Object.keys(byItem);
  if (menuIds.length === 0) return [];
  const { data: names } = await supabase.from("menu_items").select("id, name, category").in("id", menuIds);
  const meta = Object.fromEntries((names ?? []).map((n) => [n.id, { name: n.name, category: n.category ?? "—" }]));
  return Object.entries(byItem)
    .map(([id, v]) => ({
      id,
      name: meta[id]?.name ?? id,
      category: meta[id]?.category ?? "—",
      quantity: v.quantity,
      revenue: v.revenue,
    }))
    .sort((a, b) => b.quantity - a.quantity);
}

/** Kardex con saldo acumulado en el período (desde cero en el rango) */
export async function getKardexWithBalance(ingredientId: string, from: string, to: string) {
  const supabase = getSupabaseAdmin();
  const { data: ing } = await supabase.from("ingredients").select("*").eq("id", ingredientId).single();
  const { data: movements } = await supabase
    .from("inventory_movements")
    .select("*, responsible:users(full_name)")
    .eq("ingredient_id", ingredientId)
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at", { ascending: true });
  const rows = movements ?? [];
  let running = 0;
  const enriched = rows.map((m) => {
    const q = Number(m.quantity);
    if (m.movement_type === "OUT") running -= Math.abs(q);
    else running += Math.abs(q);
    return { ...m, balance: running };
  });
  return { ingredient: ing, movements: enriched };
}

/** Ingredient consumption (OUT movements) in period */
export async function getIngredientConsumption(params: { from: string; to: string }) {
  const supabase = getSupabaseAdmin();
  const { fromIso, toIso } = toDayBounds(params.from, params.to);
  const { data } = await supabase
    .from("inventory_movements")
    .select("*, ingredient:ingredients(name)")
    .eq("movement_type", "OUT")
    .gte("created_at", fromIso)
    .lte("created_at", toIso)
    .order("created_at");
  const rows = (data ?? []) as { ingredient_id: string; quantity: number; created_at: string; ingredient?: { name: string } }[];
  const byIngredient: Record<string, { name: string; total: number }> = {};
  for (const r of rows) {
    const id = r.ingredient_id;
    if (!byIngredient[id]) byIngredient[id] = { name: (r.ingredient as { name: string })?.name ?? id, total: 0 };
    byIngredient[id].total += Number(r.quantity);
  }
  return Object.entries(byIngredient)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.total - a.total);
}
