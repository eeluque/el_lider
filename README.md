# Comedor El Líder

Prototipo de sistema de pedidos, inventario y reportes para un comedor familiar. Proyecto de análisis de sistemas (universidad).

## Stack

- **Next.js** (App Router), **React**, **TypeScript**
- **Tailwind CSS**, **shadcn/ui**
- **PostgreSQL** vía **Supabase**
- **NextAuth.js** (Credentials) para autenticación y roles

## Requisitos

- Node.js 20+
- Cuenta en [Supabase](https://supabase.com)

## Configuración

1. Clonar y instalar dependencias:

   ```bash
   npm install
   ```

2. Crear proyecto en Supabase y ejecutar la migración SQL:
   - En el dashboard de Supabase → SQL Editor, ejecutar el contenido de `supabase/migrations/001_initial_schema.sql`.

3. Variables de entorno:
   - Copiar `.env.example` a `.env.local`.
   - Rellenar:
     - `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase.
     - `SUPABASE_SERVICE_ROLE_KEY`: service role key (Settings → API).
     - `AUTH_SECRET`: generar con `openssl rand -base64 32` (o similar).

4. **Cuenta admin personal** (ej. `eduardoluque08@gmail.com`): con `.env.local` configurado, en PowerShell:
   ```powershell
   $env:ADMIN_EMAIL="eduardoluque08@gmail.com"; $env:ADMIN_PASSWORD="tu_contraseña"; npm run upsert-admin
   ```
   Crea el usuario o lo pasa a rol **admin** (no es “empleado”: en esta app el acceso a `/admin` es solo con `role = admin`).

5. (Opcional) Poblar datos de prueba:
   ```bash
   npm run seed
   ```
   Tras el seed podrás entrar con:
   - **Admin:** admin@ellider.com / admin123
   - **Empleado:** empleado1@ellider.com / emp123
   - **Cliente:** cliente1@test.com / cli123

## Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start
```

## Rutas principales

- **Público:** `/`, `/menu`, `/order`, `/checkout`, `/login`, `/register`
- **Cliente (cuenta):** `/account`, `/account/orders`, `/account/rewards`
- **Empleado:** `/employee`, `/employee/orders`, `/employee/inventory`, `/employee/reports/*`
- **Admin:** `/admin`, `/admin/orders`, `/admin/menu`, `/admin/inventory`, `/admin/employees`, `/admin/reports/*`, `/admin/analytics/*`

## Documentación de diseño

En la carpeta `docs/`:

- `01-DATABASE-SCHEMA.md` – Esquema de datos
- `02-AUTH-AND-ROLES.md` – Auth y roles
- `03-FOLDER-STRUCTURE.md` – Estructura del proyecto
- `04-ROUTES-LIST.md` – Listado de rutas
- `05-SUPABASE-SQL.md` – SQL para Supabase (referencia; usar `supabase/migrations/001_initial_schema.sql`)
- `06-SEED-DATA-PLAN.md` – Plan de datos de prueba

## Notas

- Es un prototipo académico; no usar en producción sin endurecer seguridad y validaciones.
- Los reportes tienen filtros básicos; la exportación a PDF/Excel está preparada para ampliarse después.
