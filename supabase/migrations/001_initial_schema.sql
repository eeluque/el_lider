-- Comedor El Líder – Initial schema (NextAuth Credentials; public.users, no auth.users)
-- Run in Supabase SQL Editor or via migration

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'employee', 'customer');

CREATE TYPE order_status AS ENUM (
  'pending', 'preparing', 'ready', 'delivered', 'cancelled'
);

CREATE TYPE inventory_movement_type AS ENUM ('IN', 'OUT', 'ADJUSTMENT');

-- App users (NextAuth Credentials; password hashed with bcrypt)
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name text,
  role user_role NOT NULL DEFAULT 'customer',
  phone text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Customer profiles (for customers with accounts; points, etc.)
CREATE TABLE public.customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  points_balance integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Menu items
CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category text,
  active boolean NOT NULL DEFAULT true,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_id uuid REFERENCES public.customer_profiles(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  total_price decimal(10,2) NOT NULL DEFAULT 0,
  is_guest_order boolean NOT NULL DEFAULT false,
  reward_points_earned integer NOT NULL DEFAULT 0,
  cancellation_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);

-- Order items
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE RESTRICT,
  quantity integer NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  subtotal decimal(10,2) NOT NULL
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON public.order_items(menu_item_id);

-- Ingredients
CREATE TABLE public.ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  unit text NOT NULL,
  current_stock decimal(12,3) NOT NULL DEFAULT 0,
  minimum_stock decimal(12,3) NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Inventory movements
CREATE TABLE public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  movement_type inventory_movement_type NOT NULL,
  quantity decimal(12,3) NOT NULL,
  reason text,
  responsible_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_movements_ingredient ON public.inventory_movements(ingredient_id);
CREATE INDEX idx_inventory_movements_created_at ON public.inventory_movements(created_at);

-- Reward transactions
CREATE TABLE public.reward_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  points_change integer NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reward_transactions_customer ON public.reward_transactions(customer_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER customer_profiles_updated_at
  BEFORE UPDATE ON public.customer_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER menu_items_updated_at
  BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER ingredients_updated_at
  BEFORE UPDATE ON public.ingredients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS can be enabled later; for prototype we use service role from server
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- etc.
