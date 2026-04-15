"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getNextOrderStatus } from "@/lib/orders";
import { updateOrderStatus } from "./actions";
import type { Order, OrderStatus } from "@/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export function OrderTable({ orders }: { orders: Order[] }) {
  const router = useRouter();

  async function changeStatus(orderId: string, status: OrderStatus, reason?: string) {
    await updateOrderStatus(orderId, status, reason);
    router.refresh();
  }

  if (orders.length === 0) {
    return <p className="mt-4 text-neutral-500">No hay pedidos.</p>;
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nº</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="font-mono text-sm">{o.order_number}</TableCell>
              <TableCell>{o.customer_name}</TableCell>
              <TableCell>{o.customer_phone}</TableCell>
              <TableCell className="text-sm text-neutral-500">
                {new Date(o.created_at).toLocaleString("es-HN")}
              </TableCell>
              <TableCell>L {Number(o.total_price).toFixed(2)}</TableCell>
              <TableCell>
                {getNextOrderStatus(o.status) ? (
                  <button
                    type="button"
                    onClick={() => changeStatus(o.id, getNextOrderStatus(o.status)!)}
                    className="cursor-pointer"
                    title={`Cambiar a ${STATUS_LABELS[getNextOrderStatus(o.status)!]}`}
                  >
                    <Badge variant={o.status === "cancelled" ? "destructive" : "secondary"}>
                      {STATUS_LABELS[o.status]}
                    </Badge>
                  </button>
                ) : (
                  <Badge variant={o.status === "cancelled" ? "destructive" : "secondary"}>
                    {STATUS_LABELS[o.status]}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {o.status === "pending" && (
                    <Button size="sm" variant="outline" onClick={() => changeStatus(o.id, "preparing")}>
                      Preparando
                    </Button>
                  )}
                  {o.status === "preparing" && (
                    <Button size="sm" variant="outline" onClick={() => changeStatus(o.id, "ready")}>
                      Listo
                    </Button>
                  )}
                  {o.status === "ready" && (
                    <Button size="sm" variant="outline" onClick={() => changeStatus(o.id, "delivered")}>
                      Entregado
                    </Button>
                  )}
                  {!["delivered", "cancelled"].includes(o.status) && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const reason = window.prompt("Motivo de cancelación (opcional):");
                        changeStatus(o.id, "cancelled", reason ?? undefined);
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                  <Link href={`/admin/orders/${o.id}`}>
                    <Button size="sm" variant="ghost">Ver</Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
