import { getSupabaseAdmin } from "@/lib/db";
import type { Order, OrderItem, OrderStatus, OrderWithItems } from "@/types";

/** Generate next order number (e.g. ORD-001). For prototype we use timestamp-based. */
export function generateOrderNumber(): string {
  const n = Date.now().toString(36).toUpperCase().slice(-6);
  return `ORD-${n}`;
}

export async function createOrder(params: {
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  isGuest: boolean;
  items: { menuItemId: string; quantity: number; unitPrice: number }[];
}): Promise<{ orderId: string; orderNumber: string }> {
  const supabase = getSupabaseAdmin();
  const totalPrice = params.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const orderNumber = generateOrderNumber();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: params.customerId,
      customer_name: params.customerName,
      customer_phone: params.customerPhone,
      status: "pending",
      total_price: totalPrice,
      is_guest_order: params.isGuest,
      reward_points_earned: 0,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) throw new Error(orderError?.message ?? "Error al crear pedido");

  const orderItems = params.items.map((i) => ({
    order_id: order.id,
    menu_item_id: i.menuItemId,
    quantity: i.quantity,
    unit_price: i.unitPrice,
    subtotal: i.quantity * i.unitPrice,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) throw new Error("Error al guardar ítems del pedido");

  return { orderId: order.id, orderNumber: order.order_number };
}

export async function getOrders(params?: {
  status?: OrderStatus;
  from?: string;
  to?: string;
  customerId?: string;
}): Promise<Order[]> {
  const supabase = getSupabaseAdmin();
  let q = supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (params?.status) q = q.eq("status", params.status);
  if (params?.customerId) q = q.eq("customer_id", params.customerId);
  if (params?.from) q = q.gte("created_at", params.from);
  if (params?.to) q = q.lte("created_at", params.to);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function getOrderById(id: string): Promise<OrderWithItems | null> {
  const supabase = getSupabaseAdmin();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  if (orderError || !order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select(`
      *,
      menu_item:menu_items(id, name, price)
    `)
    .eq("order_id", id);
  return {
    ...(order as Order),
    order_items: (items ?? []) as OrderWithItems["order_items"],
  };
}

export async function getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
  const supabase = getSupabaseAdmin();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .single();
  if (!order) return null;
  return getOrderById(order.id);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  cancellationReason?: string | null
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const payload: { status: OrderStatus; cancellation_reason?: string | null } = { status };
  if (status === "cancelled" && cancellationReason !== undefined) payload.cancellation_reason = cancellationReason;
  const { error } = await supabase.from("orders").update(payload).eq("id", orderId);
  if (error) throw error;
}

/** Pending = not yet delivered/cancelled */
export async function getPendingOrders(): Promise<OrderWithItems[]> {
  const supabase = getSupabaseAdmin();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .in("status", ["pending", "preparing", "ready"])
    .order("created_at", { ascending: true });
  if (!orders?.length) return [];
  const withItems: OrderWithItems[] = [];
  for (const o of orders as Order[]) {
    const full = await getOrderById(o.id);
    if (full) withItems.push(full);
  }
  return withItems;
}
