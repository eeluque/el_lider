"use client";

import { useActionState, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { clearSpanishValidationMessage, setSpanishValidationMessage } from "@/lib/form-validation";
import type { Order } from "@/types";
import { cancelOwnOrder, type CancelOrderState } from "./actions";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const REASONS = [
  "Cambio de planes",
  "Elegí otro platillo",
  "Error al realizar el pedido",
  "El tiempo de espera es muy largo",
  "Otro",
];

function CancelOrderForm({ orderId }: { orderId: string }) {
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [state, formAction] = useActionState(cancelOwnOrder, null as CancelOrderState);

  return (
    <form action={formAction} className="mt-4 space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3">
      <input type="hidden" name="orderId" value={orderId} />

      <div className="space-y-2">
        <label htmlFor={`reason-${orderId}`} className="text-sm font-medium text-foreground">
          Motivo de cancelación
        </label>
        <select
          id={`reason-${orderId}`}
          name="reason"
          value={selectedReason}
          onChange={(event) => {
            event.currentTarget.setCustomValidity("");
            setSelectedReason(event.target.value);
          }}
          onInvalid={setSpanishValidationMessage}
          className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {REASONS.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </select>
      </div>

      {selectedReason === "Otro" && (
        <div className="space-y-2">
          <label htmlFor={`custom-reason-${orderId}`} className="text-sm font-medium text-foreground">
            Describe el motivo
          </label>
          <textarea
            id={`custom-reason-${orderId}`}
            name="customReason"
            rows={3}
            required
            onInvalid={setSpanishValidationMessage}
            onInput={clearSpanishValidationMessage}
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      )}

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state?.success && <p className="text-sm font-medium text-brand-green">{state.success}</p>}

      <Button type="submit" variant="destructive">
        Cancelar pedido
      </Button>
    </form>
  );
}

export function AccountOrdersList({ orders }: { orders: Order[] }) {
  return (
    <div className="mt-4 space-y-4">
      {orders.map((order) => {
        const canCancel = order.status === "pending" || order.status === "preparing";

        return (
          <Card key={order.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="font-mono">{order.order_number}</span>
              <Badge>{STATUS_LABELS[order.status] ?? order.status}</Badge>
            </CardHeader>
            <CardContent className="text-sm">
              <p>
                {new Date(order.created_at).toLocaleString("es-HN")} - Total: L{" "}
                {Number(order.total_price).toFixed(2)}
              </p>
              {order.cancellation_reason && (
                <p className="mt-2 text-muted-foreground">Motivo: {order.cancellation_reason}</p>
              )}
              {canCancel && <CancelOrderForm orderId={order.id} />}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
