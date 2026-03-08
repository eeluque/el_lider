# Routes List

## Public (no login)

| Route        | Description                |
|-------------|----------------------------|
| /           | Home                       |
| /menu       | Browse active menu items   |
| /order      | Add items to cart          |
| /checkout   | Guest or logged-in checkout|
| /login      | Login                      |
| /register   | Customer registration      |

## Customer (authenticated, role = customer)

| Route             | Description           |
|-------------------|-----------------------|
| /account          | Account overview      |
| /account/orders   | Order history         |
| /account/rewards  | Points + reward history |

## Employee (admin or employee)

| Route                          | Description              |
|--------------------------------|--------------------------|
| /employee                      | Employee dashboard       |
| /employee/orders               | Incoming/pending orders  |
| /employee/inventory            | View inventory + alerts  |
| /employee/reports/pending-orders | Pending orders report  |

## Admin only

| Route                                 | Description                    |
|---------------------------------------|--------------------------------|
| /admin                                | Admin dashboard                |
| /admin/menu                           | Manage menu items              |
| /admin/orders                         | All orders, status, cancel     |
| /admin/inventory                      | Ingredients + movements        |
| /admin/employees                      | List/create employees          |
| /admin/reports/delivered-orders-daily | Daily delivered orders         |
| /admin/reports/inventory-kardex      | Inventory movement kardex      |
| /admin/reports/critical-stock        | Critical stock list            |
| /admin/reports/cancelled-orders      | Cancelled orders + causes      |
| /admin/analytics/sales-summary       | Sales by day/week/month        |
| /admin/analytics/top-dishes          | Best-selling dishes            |
| /admin/analytics/ingredient-consumption | Ingredient consumption     |

## Shared report (admin + employee)

- **Critical stock**: Can be under `/reports/critical-stock` or `/employee/reports/critical-stock` and `/admin/reports/critical-stock`; same data, different entry points. For simplicity, one route `/employee/reports/critical-stock` and admin uses employee area or a duplicate link from admin.

Preferred: **Single report at `/reports/critical-stock`** (or under employee) and allow both roles in middleware/layout.
