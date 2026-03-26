"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OrderStatus, OrderWithItems } from "@/types";

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

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pendiente",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export function OrdersTodayClient({
  orders,
  dateLabel,
  currentDate,
}: {
  orders: OrderWithItems[];
  dateLabel: string;
  currentDate: string;
}) {
  const [tab, setTab] = useState<OrderStatus | "all">("all");

  const [clock, setClock] = useState("");

  useEffect(() => {
    function tick() {
      setClock(new Date().toLocaleString("es-HN", {
        timeZone: "America/Tegucigalpa",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }));
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const counts = useMemo(() => {
    const c: Record<OrderStatus | "all", number> = {
      all: orders.length,
      pending: 0,
      preparing: 0,
      ready: 0,
      delivered: 0,
      cancelled: 0,
    };
    for (const o of orders) {
      c[o.status]++;
    }
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    if (tab === "all") return orders;
    return orders.filter((o) => o.status === tab);
  }, [orders, tab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Pedidos de hoy</h1>
          <p className="text-sm text-secondary">{dateLabel}</p>
        </div>
        <div style={{ textAlign: "right", marginBottom: "-130px" }}>
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
        {filtered.map((o) => (
          <Card key={o.id} className="overflow-hidden border-primary/15 shadow-md">
            <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
              <span className="font-mono text-sm font-semibold text-foreground">Orden #{o.order_number}</span>
              <Badge className={`${STATUS_STYLE[o.status]} border`}>{STATUS_LABEL[o.status]}</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                {new Date(o.created_at).toLocaleString("es-HN", {
                  day: "2-digit",
                  month: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })}{" "}
                · <span className="font-medium text-foreground">{o.customer_name}</span>
              </p>
              <ul className="space-y-1 border-t border-border pt-2">
                {o.order_items?.map((line) => (
                  <li key={line.id} className="flex justify-between gap-2">
                    <span>
                      ×{line.quantity} {(line as { menu_item?: { name: string } }).menu_item?.name ?? "Ítem"}
                    </span>
                    <span className="text-muted-foreground">
                      L. {Number(line.subtotal).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/30 py-3 font-semibold">
              <span>Total</span>
              <span>L. {Number(o.total_price).toFixed(2)}</span>
            </CardFooter>
            <div className="px-4 pb-4">
              <Link href={`/admin/orders/${o.id}`} className="block">
                <Button variant="outline" size="sm" className="w-full">
                  Ver detalle
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-xl border border-dashed border-primary/30 bg-card py-12 text-center text-muted-foreground">
          No hay pedidos en este filtro.
        </p>
      )}
    </div>
  );
}
