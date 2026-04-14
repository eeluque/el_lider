"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatCentralDate, formatCentralDateTime } from "@/lib/date-range";
import { getNextOrderStatus, getOrderStatusLabel } from "@/lib/orders";
import type { OrderStatus, OrderWithItems } from "@/types";
import { updateOrderStatus } from "./actions";

const TABS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "pending", label: "Pendientes" },
  { key: "preparing", label: "Preparando" },
  { key: "ready", label: "Listos" },
  { key: "delivered", label: "Entregados" },
  { key: "cancelled", label: "Cancelados" },
];

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-primary/25 text-[rgb(117,59,25)] border-primary/40",
  preparing: "bg-secondary/20 text-secondary",
  ready: "bg-brand-green/15 text-brand-green border-brand-green/30",
  delivered: "bg-muted text-foreground",
  cancelled: "bg-destructive/15 text-destructive",
};

export function OrdersTodayClient({
  orders,
  dateLabel,
}: {
  orders: OrderWithItems[];
  dateLabel: string;
  currentDate: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<OrderStatus | "all">("all");
  const [clock, setClock] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function tick() {
      setClock(
        formatCentralDate(new Date(), {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const counts = useMemo(() => {
    const countMap: Record<OrderStatus | "all", number> = {
      all: orders.length,
      pending: 0,
      preparing: 0,
      ready: 0,
      delivered: 0,
      cancelled: 0,
    };
    for (const order of orders) countMap[order.status]++;
    return countMap;
  }, [orders]);

  const filtered = useMemo(() => {
    if (tab === "all") return orders;
    return orders.filter((order) => order.status === tab);
  }, [orders, tab]);

  function advanceStatus(orderId: string, currentStatus: OrderStatus) {
    const nextStatus = getNextOrderStatus(currentStatus);
    if (!nextStatus) return;

    startTransition(async () => {
      await updateOrderStatus(orderId, nextStatus);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="outfit font-serif text-3xl font-bold text-foreground">Pedidos de hoy</h1>
          <p className="text-xl text-secondary">{dateLabel}</p>
        </div>
        <div className="text-right">
          <p className="outfit font-serif text-3xl font-bold text-foreground">{clock.split(",").pop()?.trim()}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              tab === key
                ? "border-primary bg-primary/25 text-[rgb(117,59,25)] shadow-sm"
                : "border-border bg-card text-foreground hover:bg-muted/80"
            }`}
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-white">
              {counts[key]}
            </span>
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((order) => {
          const nextStatus = getNextOrderStatus(order.status);

          return (
            <Card key={order.id} className="overflow-hidden border-primary/15 shadow-md">
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                <span className="font-mono text-sm font-semibold text-foreground">Orden #{order.order_number}</span>
                {nextStatus ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => advanceStatus(order.id, order.status)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition hover:scale-[1.02] ${STATUS_STYLE[order.status]}`}
                    title={`Cambiar a ${getOrderStatusLabel(nextStatus)}`}
                  >
                    {getOrderStatusLabel(order.status)}
                  </button>
                ) : (
                  <Badge className={`${STATUS_STYLE[order.status]} border`}>{getOrderStatusLabel(order.status)}</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  {formatCentralDate(order.created_at, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  · <span className="font-medium text-foreground">{order.customer_name}</span>
                </p>
                <ul className="space-y-1 border-t border-border pt-2">
                  {order.order_items?.map((line) => (
                    <li key={line.id} className="flex justify-between gap-2">
                      <span>
                        ×{line.quantity} {(line as { menu_item?: { name: string } }).menu_item?.name ?? "Ítem"}
                      </span>
                      <span className="text-muted-foreground">L. {Number(line.subtotal).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                {order.cancellation_reason && (
                  <p className="rounded-lg bg-destructive/8 px-3 py-2 text-xs text-destructive">
                    Motivo de cancelación: {order.cancellation_reason}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t bg-muted/30 py-3 font-semibold">
                <span>Total</span>
                <span>L. {Number(order.total_price).toFixed(2)}</span>
              </CardFooter>
              <div className="space-y-2 px-4 pb-4">
                {nextStatus && (
                  <p className="text-xs text-muted-foreground">
                    Haz clic en el estado para avanzar a {getOrderStatusLabel(nextStatus)}.
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Registrado: {formatCentralDateTime(order.created_at)}</p>
                <Link href={`/admin/orders/${order.id}`} className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    Ver detalle
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-primary/30 bg-card py-12 text-center text-muted-foreground">
          No hay pedidos en este filtro.
        </p>
      )}
    </div>
  );
}
