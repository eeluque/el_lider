// User roles
export type UserRole = "admin" | "employee" | "customer";

export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export type InventoryMovementType = "IN" | "OUT" | "ADJUSTMENT";

// DB row types (match Supabase schema)
export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  role: UserRole;
  phone: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  points_balance: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  status: OrderStatus;
  total_price: number;
  is_guest_order: boolean;
  reward_points_earned: number;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderWithItems extends Order {
  order_items?: (OrderItem & { menu_item?: Pick<MenuItem, "id" | "name" | "price"> })[];
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  ingredient_id: string;
  movement_type: InventoryMovementType;
  quantity: number;
  reason: string | null;
  responsible_user_id: string | null;
  created_at: string;
}

export interface RewardTransaction {
  id: string;
  customer_id: string;
  order_id: string | null;
  points_change: number;
  reason: string | null;
  created_at: string;
}
