"use client";

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
import { updateOrderStatus } from "@/app/admin/orders/actions";
import type { OrderWithItems } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  preparing: "Preparando",
  ready: "Listo",
};

export function PendingOrdersTable({ orders }: { orders: OrderWithItems[] }) {
  const router = useRouter();

  async function changeStatus(orderId: string, status: "preparing" | "ready" | "delivered") {
    await updateOrderStatus(orderId, status);
    router.refresh();
  }

  if (orders.length === 0) {
    return <p className="mt-4 text-neutral-500">No hay pedidos pendientes.</p>;
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nº</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Hora</TableHead>
            <TableHead>Ítems</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="font-mono">{o.order_number}</TableCell>
              <TableCell>{o.customer_name}</TableCell>
              <TableCell className="text-sm">{new Date(o.created_at).toLocaleTimeString("es-HN")}</TableCell>
              <TableCell className="text-sm">
                {o.order_items?.map((i) => `${i.menu_item?.name ?? "—"} × ${i.quantity}`).join(", ") ?? "—"}
              </TableCell>
              <TableCell>L {Number(o.total_price).toFixed(2)}</TableCell>
              <TableCell><Badge>{STATUS_LABELS[o.status] ?? o.status}</Badge></TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {o.status === "pending" && (
                    <Button size="sm" variant="outline" onClick={() => changeStatus(o.id, "preparing")}>
                      En preparación
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
