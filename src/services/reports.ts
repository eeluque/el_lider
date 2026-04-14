import { getSupabaseAdmin } from "@/lib/db";
import { endOfDayIso, startOfDayIso, toLocalDateString } from "@/lib/date-range";
import { MENU_ITEM_CONSUMPTION_RECIPES, normalizeMenuItemName } from "@/lib/ingredient-consumption-recipes";

function toDayBounds(from: string, to: string) {
  const f = from.length <= 10 ? startOfDayIso(from) : from;
  const t = to.length <= 10 ? endOfDayIso(to) : to;
  return { fromIso: f, toIso: t };
}

/** Pedidos entregados en un rango de fechas (YYYY-MM-DD), inclusive. */
export async function getDeliveredOrdersInRange(fromDate: string, toDate: string) {
  const supabase = getSupabaseAdmin();
  const from = startOfDayIso(fromDate);
  const to = endOfDayIso(toDate);
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
    .in("status", ["delivered", "ready", "cancelled"])
    .gte("created_at", fromIso)
    .lte("created_at", toIso)
    .order("created_at");
  const rows = (data ?? []) as { created_at: string; total_price: number; status: string }[];
  const delivered = rows.filter((r) => r.status === "delivered" || r.status === "ready");
  const cancelled = rows.filter((r) => r.status === "cancelled");
  const byPeriod: Record<string, number> = {};
  const cancelledByPeriod: Record<string, number> = {};
  for (const r of delivered) {
    const d = new Date(r.created_at);
    const key = toLocalDateString(d);
    byPeriod[key] = (byPeriod[key] ?? 0) + Number(r.total_price);
  }
  for (const r of cancelled) {
    const d = new Date(r.created_at);
    const key = toLocalDateString(d);
    cancelledByPeriod[key] = (cancelledByPeriod[key] ?? 0) + 1;
  }
  return {
    byPeriod,
    total: delivered.reduce((sum, row) => sum + Number(row.total_price), 0),
    cancelledByPeriod,
    cancelledCount: cancelled.length,
    cancelledAmount: cancelled.reduce((sum, row) => sum + Number(row.total_price), 0),
  };
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

/**
 * Consumo de insumos en el periodo:
 * 1) Estimado por platillos vendidos (pedidos entregados o listos) según recetas en `ingredient-consumption-recipes`.
 * 2) Salidas registradas en kárdex (movimientos OUT y ADJUSTMENT, mismo criterio que el reporte de movimientos).
 */
export async function getIngredientConsumption(params: { from: string; to: string }) {
  const supabase = getSupabaseAdmin();
  const { fromIso, toIso } = toDayBounds(params.from, params.to);

  const { data: ingRows } = await supabase.from("ingredients").select("id, name").eq("active", true);
  const ingredientsList = (ingRows ?? []) as { id: string; name: string }[];
  const byIngredient: Record<string, { name: string; consumption: number; turnover: number }> = {};
  for (const ing of ingredientsList) {
    byIngredient[ing.id] = { name: ing.name, consumption: 0, turnover: 0 };
  }
  const nameToId = new Map(ingredientsList.map((i) => [i.name.trim().toLowerCase(), i.id]));

  const { data: movData } = await supabase
    .from("inventory_movements")
    .select("ingredient_id, quantity, movement_type, ingredient:ingredients(name)")
    .in("movement_type", ["IN", "OUT", "ADJUSTMENT"])
    .gte("created_at", fromIso)
    .lte("created_at", toIso)
    .order("created_at");

  for (const r of (movData ?? []) as unknown as {
    ingredient_id: string;
    quantity: number;
    movement_type: string;
    ingredient?: { name: string };
  }[]) {
    const id = r.ingredient_id;
    if (!byIngredient[id]) {
      byIngredient[id] = { name: r.ingredient?.name ?? id, consumption: 0, turnover: 0 };
    }
    const quantity = Math.abs(Number(r.quantity));
    const movementType = r.movement_type?.toUpperCase();
    if (movementType === "IN") {
      byIngredient[id].turnover += quantity;
    } else if (movementType === "OUT" || movementType === "ADJUSTMENT") {
      byIngredient[id].consumption += quantity;
    }
  }

  const { data: orderData } = await supabase
    .from("orders")
    .select("order_items(quantity, menu_item:menu_items(name))")
    .in("status", ["delivered", "ready"])
    .gte("created_at", fromIso)
    .lte("created_at", toIso);

  for (const o of orderData ?? []) {
    const items =
      (o as unknown as { order_items?: { quantity: number; menu_item?: { name: string } | null }[] }).order_items ?? [];
    for (const li of items) {
      const key = normalizeMenuItemName(li.menu_item?.name ?? "");
      const recipe = MENU_ITEM_CONSUMPTION_RECIPES[key];
      if (!recipe?.length) continue;
      const sold = Number(li.quantity) || 0;
      for (const line of recipe) {
        const iid = nameToId.get(line.ingredientName.trim().toLowerCase());
        if (!iid) continue;
        if (!byIngredient[iid]) {
          byIngredient[iid] = { name: line.ingredientName, consumption: 0, turnover: 0 };
        }
        byIngredient[iid].consumption += line.qtyPerUnit * sold;
      }
    }
  }

  return Object.entries(byIngredient)
    .map(([id, v]) => ({
      id,
      name: v.name,
      consumption: v.consumption,
      turnover: v.turnover,
    }))
    .filter((x) => x.consumption > 0 || x.turnover > 0)
    .sort((a, b) => b.consumption - a.consumption || b.turnover - a.turnover);
}
