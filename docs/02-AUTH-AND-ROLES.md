# Auth and Roles – Next.js

## Approach

- **Provider**: NextAuth.js with Credentials provider, or Supabase Auth. For “Next.js-native” and simplicity we use **NextAuth.js** with Credentials provider; user/role stored in DB (Supabase `public.profiles`).
- **Session**: JWT or database session. JWT recommended for simplicity; include `role` and `userId` in token.
- **No separate backend**: All auth and API live inside Next.js (API routes + Server Actions).

## Role model

| Role     | Value in DB | Access |
|----------|-------------|--------|
| Admin    | `admin`     | Full; /admin/*, /employee/*, all reports |
| Employee | `employee`  | /employee/*, reports: pending-orders, critical-stock |
| Customer | `customer`  | /account/*, order history, rewards |
| Guest    | —           | /, /menu, /order, /checkout (no login) |

## Route protection

- **Middleware** (optional): Redirect unauthenticated from `/admin/*` and `/employee/*` to `/login`; redirect authenticated customers from `/login` to `/` or `/account`.
- **Route guards in layout/page**: In `app/admin/layout.tsx` and `app/employee/layout.tsx`, get session and role; if not admin (or admin+employee for employee area), redirect to `/login` or `/unauthorized`.
- **Server Actions / API**: Every action checks session and role before mutating data.

## Auth flows

1. **Login**: POST to NextAuth; validate email/password against DB (or Supabase Auth); load profile for role; set session with role.
2. **Register**: Only for **customers**. Create user in Supabase Auth (or custom users table with hashed password), then insert `customer_profiles` and set `profiles.role = 'customer'`.
3. **Employee/Admin creation**: Admin-only. Create user + profile with role `employee` or `admin` (no public registration for these).

## Implementation outline

- `lib/auth.ts`: NextAuth config (Credentials provider), callbacks to add `role`, `userId` to session.
- `lib/db/auth-helpers.ts`: Validate credentials (e.g. compare password with hash from `profiles` or auth table); get user by email and return id, email, role.
- `middleware.ts`: Protect `/admin/*` (admin only), `/employee/*` (admin or employee), `/account/*` (authenticated, role customer).
- `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`: Forms that call signIn/register.
- Guest checkout: No session required; collect name + phone on checkout; create order with `customer_id = null`, `is_guest_order = true`.

## Password storage

- If using Supabase Auth: use Supabase’s built-in auth (no custom password table).
- If using custom table: store bcrypt hash only; never store plain passwords.
