import type { InventoryMovementType, OrderStatus } from "@/types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const INVENTORY_MOVEMENT_LABELS: Record<InventoryMovementType, string> = {
  IN: "Entrada",
  OUT: "Salida",
  ADJUSTMENT: "Ajuste",
};
