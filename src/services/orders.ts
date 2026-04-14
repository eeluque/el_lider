import { getSupabaseAdmin } from "@/lib/db";
import type { Order, OrderStatus, OrderWithItems } from "@/types";

export function getNextSequentialOrderNumber(lastOrderNumber?: string | null): string {
  const digits = (lastOrderNumber ?? "").match(/\d+/g)?.join("") ?? "";
  const lastNumber = Number.parseInt(digits, 10);
  const nextNumber = Number.isFinite(lastNumber) ? lastNumber + 1 : 1;
  return nextNumber.toString().padStart(6, "0");
}

export async function generateOrderNumber(): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("order_number")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const latestOrderNumber =
    ((data ?? []) as Array<{ order_number?: string | null }>)[0]?.order_number ?? null;

  return getNextSequentialOrderNumber(latestOrderNumber);
}

export async function createOrder(params: {
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  isGuest: boolean;
  items: { menuItemId: string; quantity: number; unitPrice: number }[];
}): Promise<{ orderId: string; orderNumber: string }> {
  const supabase = getSupabaseAdmin();
  const totalPrice = params.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const orderNumber = await generateOrderNumber();

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

  const orderItems = params.items.map((item) => ({
    order_id: order.id,
    menu_item_id: item.menuItemId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    subtotal: item.quantity * item.unitPrice,
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

export async function getOrdersWithItemsInRange(from: string, to: string): Promise<OrderWithItems[]> {
  const supabase = getSupabaseAdmin();
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        menu_item:menu_items (id, name, price, category)
      )
    `
    )
    .gte("created_at", from)
    .lte("created_at", to)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (orders ?? []) as OrderWithItems[];
}

export async function getPendingOrders(): Promise<OrderWithItems[]> {
  const supabase = getSupabaseAdmin();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .in("status", ["pending", "preparing", "ready"])
    .order("created_at", { ascending: true });
  if (!orders?.length) return [];

  const withItems: OrderWithItems[] = [];
  for (const order of orders as Order[]) {
    const full = await getOrderById(order.id);
    if (full) withItems.push(full);
  }
  return withItems;
}

export async function getCustomerTotalPoints(phone: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("orders")
    .select("reward_points_earned")
    .eq("customer_phone", phone)
    .eq("status", "delivered");
  return (data ?? []).reduce((sum, order) => sum + Number(order.reward_points_earned ?? 0), 0);
}
