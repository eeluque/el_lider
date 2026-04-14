import type { OrderStatus } from "@/types";

export const CUSTOMER_CANCELLATION_REASONS = [
  "Larga espera",
  "Falta de atención",
  "Cambio de opinión",
] as const;

export function getNextOrderStatus(status: OrderStatus): OrderStatus | null {
  if (status === "pending") return "preparing";
  if (status === "preparing") return "ready";
  if (status === "ready") return "delivered";
  return null;
}

export function getOrderStatusLabel(status: OrderStatus): string {
  if (status === "pending") return "Pendiente";
  if (status === "preparing") return "Preparando";
  if (status === "ready") return "Listo";
  if (status === "delivered") return "Entregado";
  return "Cancelado";
}
