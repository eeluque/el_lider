import type { UserRole } from "@/types";

export const EMPLOYEE_RESTRICTED_ADMIN_PATHS = [
  "/admin/reports/inventory-kardex",
  "/admin/analytics/sales-summary",
  "/admin/analytics/top-dishes",
  "/admin/reports/cancelled-orders",
  "/admin/analytics/ingredient-consumption",
] as const;

export function canAccessAdminPath(role: UserRole | undefined, path: string) {
  if (role === "admin") return true;
  if (role !== "employee") return false;

  return !EMPLOYEE_RESTRICTED_ADMIN_PATHS.some((restrictedPath) => path.startsWith(restrictedPath));
}
