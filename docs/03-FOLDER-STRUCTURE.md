# Project Folder Structure

```
el_lider/
├── app/
│   ├── (public)/                 # Public layout group
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Home
│   │   ├── menu/
│   │   │   └── page.tsx          # Browse menu
│   │   ├── order/
│   │   │   └── page.tsx          # Build order (cart)
│   │   └── checkout/
│   │       └── page.tsx          # Guest or logged-in checkout
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── account/                  # Authenticated customer
│   │   ├── layout.tsx            # Guard: customer only
│   │   ├── page.tsx              # Account overview
│   │   ├── orders/
│   │   │   └── page.tsx          # Order history
│   │   └── rewards/
│   │       └── page.tsx          # Points balance + history
│   ├── employee/
│   │   ├── layout.tsx            # Guard: admin or employee
│   │   ├── page.tsx              # Employee dashboard
│   │   ├── orders/
│   │   │   └── page.tsx          # Incoming/pending orders
│   │   ├── inventory/
│   │   │   └── page.tsx          # View inventory + low stock
│   │   └── reports/
│   │       └── pending-orders/
│   │           └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx            # Guard: admin only
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── menu/
│   │   │   └── page.tsx          # CRUD menu items
│   │   ├── orders/
│   │   │   └── page.tsx          # All orders, status updates
│   │   ├── inventory/
│   │   │   └── page.tsx          # Ingredients + movements
│   │   ├── employees/
│   │   │   └── page.tsx          # List/create employees
│   │   ├── reports/
│   │   │   ├── delivered-orders-daily/
│   │   │   ├── inventory-kardex/
│   │   │   ├── critical-stock/
│   │   │   └── cancelled-orders/
│   │   └── analytics/
│   │       ├── sales-summary/
│   │       ├── top-dishes/
│   │       └── ingredient-consumption/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.ts
│   │   └── ...                   # Optional API routes
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn components
│   ├── layout/
│   │   ├── PublicNav.tsx
│   │   ├── AdminSidebar.tsx
│   │   └── EmployeeSidebar.tsx
│   ├── orders/
│   ├── menu/
│   ├── inventory/
│   └── reports/
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── db.ts                     # Supabase client
│   ├── validations.ts            # Zod schemas if used
│   └── ...
├── services/
│   ├── orders.ts                 # Order queries + actions
│   ├── menu.ts
│   ├── inventory.ts
│   ├── rewards.ts
│   └── reports.ts
├── types/
│   └── index.ts                  # Shared types
├── utils/
│   └── ...
├── docs/                         # Planning docs (this folder)
├── supabase/
│   └── migrations/               # SQL migrations
├── .env.local
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Notes

- **app/(public)**: No auth required; shared layout and nav.
- **app/(auth)**: Login/register; redirect if already logged in.
- **app/account**: Layout checks session + role customer.
- **app/employee**: Layout checks session + role admin or employee.
- **app/admin**: Layout checks session + role admin only.
- **Server Actions** can live next to routes (e.g. `app/admin/menu/actions.ts`) or in `services/` and be imported.
- **Reports**: Query helpers in `services/reports.ts`; pages only compose UI and call them.
