# Comedor El Líder – Database Schema

## Enums

```sql
CREATE TYPE user_role AS ENUM ('admin', 'employee', 'customer');

CREATE TYPE order_status AS ENUM (
  'pending',
  'preparing',
  'ready',
  'delivered',
  'cancelled'
);

CREATE TYPE inventory_movement_type AS ENUM ('IN', 'OUT', 'ADJUSTMENT');
```

## Tables

### users (Supabase Auth + extended)

- Supabase Auth handles: `id`, `email`, `encrypted_password`, `email_confirmed_at`, etc.
- We extend via `public.profiles` or a single `users` table that references `auth.users`.

**public.profiles** (extends auth.users for app-specific data):

| Column       | Type         | Notes                          |
|-------------|--------------|--------------------------------|
| id          | uuid         | PK, FK → auth.users.id         |
| email       | text         | Denormalized for convenience   |
| full_name   | text         |                                |
| role        | user_role    | admin, employee, customer      |
| phone       | text         | Optional                       |
| active      | boolean      | Default true                   |
| created_at  | timestamptz  | Default now()                  |
| updated_at  | timestamptz  | Default now()                  |

### customer_profiles

| Column       | Type         | Notes                          |
|-------------|--------------|--------------------------------|
| id          | uuid         | PK                             |
| user_id     | uuid         | FK → auth.users.id, unique     |
| full_name   | text         |                                |
| phone       | text         |                                |
| points_balance | integer    | Default 0                      |
| created_at  | timestamptz  |                                |
| updated_at  | timestamptz  |                                |

### menu_items

| Column       | Type         | Notes                          |
|-------------|--------------|--------------------------------|
| id          | uuid         | PK                             |
| name        | text         | NOT NULL                       |
| description | text         |                                |
| price       | decimal(10,2)| NOT NULL                       |
| category    | text         | e.g. Baleadas, Desayunos      |
| active      | boolean      | Default true                   |
| image_url   | text         | Optional                       |
| created_at  | timestamptz  |                                |
| updated_at  | timestamptz  |                                |

### orders

| Column              | Type         | Notes                          |
|---------------------|--------------|--------------------------------|
| id                  | uuid         | PK                             |
| order_number        | text         | UNIQUE, human-readable         |
| customer_id         | uuid         | FK → customer_profiles.id, nullable (guest) |
| customer_name       | text         | For guest or display           |
| customer_phone      | text         |                                |
| status              | order_status | Default 'pending'              |
| total_price         | decimal(10,2)|                                |
| is_guest_order      | boolean      | Default false                  |
| reward_points_earned| integer      | Default 0                      |
| cancellation_reason | text         | Nullable                       |
| created_at          | timestamptz  |                                |
| updated_at          | timestamptz  |                                |

### order_items

| Column       | Type         | Notes                          |
|-------------|--------------|--------------------------------|
| id          | uuid         | PK                             |
| order_id    | uuid         | FK → orders.id                 |
| menu_item_id| uuid         | FK → menu_items.id             |
| quantity    | integer      | NOT NULL                       |
| unit_price  | decimal(10,2)| Snapshot at order time         |
| subtotal    | decimal(10,2)| quantity * unit_price          |

### ingredients

| Column         | Type         | Notes                          |
|----------------|--------------|--------------------------------|
| id             | uuid         | PK                             |
| name           | text         | NOT NULL                       |
| unit           | text         | e.g. lb, kg, unidad            |
| current_stock  | decimal(12,3)| Default 0                      |
| minimum_stock  | decimal(12,3)| For low-stock alert            |
| active         | boolean      | Default true                   |
| created_at     | timestamptz  |                                |
| updated_at     | timestamptz  |                                |

### inventory_movements

| Column            | Type                    | Notes                          |
|-------------------|-------------------------|--------------------------------|
| id                | uuid                    | PK                             |
| ingredient_id     | uuid                    | FK → ingredients.id            |
| movement_type     | inventory_movement_type | IN, OUT, ADJUSTMENT            |
| quantity          | decimal(12,3)           | Positive for IN, negative for OUT if needed (or always positive + type) |
| reason            | text                    |                                |
| responsible_user_id| uuid                    | FK → auth.users.id, nullable   |
| created_at        | timestamptz             |                                |

### reward_transactions

| Column       | Type         | Notes                          |
|-------------|--------------|--------------------------------|
| id          | uuid         | PK                             |
| customer_id | uuid         | FK → customer_profiles.id      |
| order_id    | uuid         | FK → orders.id, nullable       |
| points_change| integer      | Positive = earned, negative = spent |
| reason      | text         | e.g. "Order #123", "Redeemed"  |
| created_at  | timestamptz  |                                |

## Indexes (suggested)

- `orders(order_number)` UNIQUE
- `orders(status)`, `orders(created_at)`, `orders(customer_id)`
- `order_items(order_id)`, `order_items(menu_item_id)`
- `inventory_movements(ingredient_id)`, `inventory_movements(created_at)`
- `profiles(role)`, `profiles(email)`

## Row Level Security (RLS)

- Enable RLS on all public tables.
- Policies: admin full access; employee read/update where needed (e.g. orders); customer only own profile and orders; guests no direct table access (orders created via server-side with nullable customer_id).
