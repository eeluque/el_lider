"use client";

import { useActionState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { clearSpanishValidationMessage, setSpanishValidationMessage } from "@/lib/form-validation";
import { formatCentralDateTime } from "@/lib/date-range";
import { CUSTOMER_CANCELLATION_REASONS, getOrderStatusLabel } from "@/lib/orders";
import type { Order } from "@/types";
import { cancelOwnOrder, type CancelOrderState } from "./actions";

function CancelOrderForm({ orderId }: { orderId: string }) {
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
          required
          defaultValue=""
          onInvalid={setSpanishValidationMessage}
          onInput={clearSpanishValidationMessage}
          className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            Selecciona un motivo
          </option>
          {CUSTOMER_CANCELLATION_REASONS.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </select>
      </div>

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
              <Badge variant={order.status === "cancelled" ? "destructive" : "secondary"}>
                {getOrderStatusLabel(order.status)}
              </Badge>
            </CardHeader>
            <CardContent className="text-sm">
              <p>
                {formatCentralDateTime(order.created_at)} - Total: L. {Number(order.total_price).toFixed(2)}
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
