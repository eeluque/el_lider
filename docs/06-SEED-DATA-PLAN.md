# Seed Data Plan

## Purpose

- One admin, 1–2 employees, 2 customers.
- Several menu items and ingredients.
- Sample orders (pending, preparing, delivered, cancelled) and order items.
- Sample inventory movements.

## Users (auth + profiles)

| Email                 | Role     | Password (dev) | Notes        |
|-----------------------|----------|----------------|--------------|
| admin@ellider.com     | admin    | admin123       | Full access  |
| empleado1@ellider.com | employee | emp123         | Kitchen view |
| empleado2@ellider.com | employee | emp123         | Optional     |
| cliente1@test.com     | customer | cli123         | Has history  |
| cliente2@test.com     | customer | cli123         | Optional     |

Passwords: hashed with bcrypt (e.g. 10 rounds) in seed script or Supabase Auth.

## Customer profiles

- cliente1@test.com: full_name "María López", phone "+504 9999-0001", points_balance 15.
- cliente2@test.com: full_name "Juan Pérez", phone "+504 9999-0002", points_balance 5.

## Menu items

| name               | description           | price  | category   | active |
|--------------------|-----------------------|--------|------------|--------|
| Baleada sencilla   | Baleada con frijoles  | 35.00  | Baleadas   | true   |
| Baleada con todo   | Con frijoles, huevo, aguacate | 50.00 | Baleadas | true   |
| Desayuno típico    | Huevos, frijoles, plátano, queso | 65.00 | Desayunos | true |
| Almuerzo del día   | Plato del día con carne y ensalada | 80.00 | Almuerzos | true   |
| Sopa de res        | Sopa de res con verduras | 70.00 | Almuerzos | true   |
| Refresco natural  | Limonada o horchata   | 25.00  | Bebidas    | true   |

## Ingredients

| name      | unit   | current_stock | minimum_stock | active |
|-----------|--------|---------------|---------------|--------|
| Harina   | lb     | 50            | 10            | true   |
| Frijoles | lb     | 25            | 5             | true   |
| Huevos   | unidad| 120           | 30            | true   |
| Queso    | lb     | 8             | 5             | true   |
| Aguacate | unidad| 15            | 10            | true   |
| Carne de res | lb | 20            | 5             | true   |
| Limones  | lb     | 5             | 3             | true   |

## Orders (examples)

1. **Order #ORD-001**: Customer María López (logged-in), 2 Baleada con todo, 1 Refresco. Status: delivered. total_price 125, reward_points_earned 2 (or by rule).
2. **Order #ORD-002**: Guest "Pedro Sánchez", phone "+504 8888-1111". 1 Desayuno típico. Status: preparing.
3. **Order #ORD-003**: Guest "Ana García", phone "+504 8888-2222". 1 Almuerzo del día, 1 Refresco. Status: pending.
4. **Order #ORD-004**: Customer Juan Pérez. 1 Baleada sencilla. Status: cancelled. cancellation_reason "Cliente canceló por tiempo de espera".

## Order items

- One row per line item; unit_price and subtotal from menu at order time.

## Inventory movements

- 2–3 movements per ingredient: e.g. IN +20 Harina (reason "Compra semanal"), OUT -5 Frijoles (reason "Uso cocina"), ADJUSTMENT -2 Huevos (reason "Ajuste por conteo").

## Execution

- **Option A**: SQL seed file run in Supabase (insert users via Auth API or seed script that uses Supabase Auth Admin).
- **Option B**: Next.js script `scripts/seed.ts` (or `seed.js`) that uses Supabase client + Auth admin to create users and then insert profiles, menu_items, ingredients, orders, order_items, inventory_movements, reward_transactions.
- **Option C**: Prisma/other ORM seed if we introduce an ORM later.

Recommendation: **Option B** with a script that can be run with `npx ts-node scripts/seed.ts` or `pnpm run seed`, using `SUPABASE_SERVICE_ROLE_KEY` for admin operations and creating auth users + profile rows + rest of data.
