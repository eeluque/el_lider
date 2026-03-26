import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById, getCustomerTotalPoints } from "@/services/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  preparing: "Preparando",
  ready: "Listo",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_BADGE: Record<string, { background: string; color: string }> = {
  pending:   { background: "#FEF3C7", color: "#92400E" },
  preparing: { background: "#DBEAFE", color: "#1E40AF" },
  ready:     { background: "#D1FAE5", color: "#065F46" },
  delivered: { background: "#F1B53E33", color: "#753B19" },
  cancelled: { background: "#FEE2E2", color: "#991B1B" },
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `Hace menos de 1 minuto`;
  
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  
  if (diff < 3600) return `Hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
  
  if (minutes === 0) return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
  
  return `Hace ${hours} ${hours === 1 ? "hora" : "horas"} y ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const totalPoints = await getCustomerTotalPoints(order.customer_phone);
  const POINTS_FOR_FREE = 10;
  const pointsProgress = totalPoints % POINTS_FOR_FREE;

  // ¿Esta orden tiene baleadas con todo?
  const baleadasEnOrden = order.order_items?.filter((item) =>
    item.menu_item?.name === "Baleada con todo"
  ) ?? [];
  const hasBaleada = baleadasEnOrden.length > 0;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 16px 40px" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>Detalle de pedido</p>
          <h1 style={{ fontFamily: "'Outfit', serif", fontSize: 26, fontWeight: 700, color: "#753B19", margin: 0 }}>
            #{order.order_number}
          </h1>
        </div>
        <Link href="/admin/orders">
          <Button variant="outline" size="sm">← Volver</Button>
        </Link>
      </div>

      {/* ── Info cliente + estado ── */}
<div style={{
  background: "#fff",
  border: "1.5px solid #e8d5b0",
  borderRadius: 12,
  padding: "20px 24px",
  marginBottom: 16,
}}>
  {/* Fila única: Cliente | Estado | Hace X */}
  <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", gap: "0 16px" }}>
    <div>
      <p style={{ fontSize: 11, color: "#999", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Cliente</p>
      <p style={{ fontWeight: 700, fontSize: 15, color: "#2a1f0f", margin: 0 }}>{order.customer_name}</p>
    </div>
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: 11, color: "#999", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Estado</p>
      <span style={{
        display: "inline-block",
        padding: "3px 12px",
        borderRadius: 99,
        fontSize: 13,
        fontWeight: 600,
        background: STATUS_BADGE[order.status]?.background ?? "#f0f0f0",
        color: STATUS_BADGE[order.status]?.color ?? "#333",
      }}>
        {STATUS_LABELS[order.status] ?? order.status}
      </span>
    </div>
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: 11, color: "#999", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tiempo</p>
      <span style={{
        display: "inline-block",
        padding: "3px 12px",
        borderRadius: 99,
        fontSize: 12,
        fontWeight: 600,
        background: "#FEE2E2",
        color: "#991B1B",
      }}>
        {timeAgo(order.created_at)}
      </span>
    </div>
  </div>

  {order.cancellation_reason && (
    <div style={{ marginTop: 12, padding: "10px 14px", background: "#FEE2E2", borderRadius: 8, fontSize: 13, color: "#991B1B" }}>
      <strong>Motivo de cancelación:</strong> {order.cancellation_reason}
    </div>
  )}
</div>

      {/* ── Ítems ── */}
      <div style={{
        background: "#fff",
        border: "1.5px solid #e8d5b0",
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 16,
      }}>
        <div style={{ background: "#753B19", padding: "12px 20px" }}>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>Productos del pedido</p>
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {order.order_items?.map((item, idx) => (
            <li key={item.id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 20px",
              borderBottom: idx < (order.order_items?.length ?? 0) - 1 ? "1px solid #f5ece0" : "none",
              background: idx % 2 === 0 ? "#fff" : "#fffaf3",
            }}>
              <span style={{ fontSize: 14, color: "#2a1f0f" }}>
                <strong>×{item.quantity}</strong> {item.menu_item?.name ?? "—"}
              </span>
              <span style={{ fontSize: 14, color: "#753B19", fontWeight: 600 }}>
                L. {Number(item.subtotal).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "14px 20px",
          background: "#FFF8E8",
          borderTop: "1.5px solid #e8d5b0",
          fontWeight: 700,
          fontSize: 16,
        }}>
          <span style={{ color: "#753B19" }}>Total</span>
          <span style={{ color: "#753B19" }}>L. {Number(order.total_price).toFixed(2)}</span>
        </div>
      </div>

      {/* ── Programa de puntos (solo si hay baleada con todo) ── */}
      {hasBaleada && (
        <div style={{
          background: "#fff",
          border: "1.5px solid #F1B53E",
          borderRadius: 12,
          padding: "16px 20px",
        }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: "#753B19", margin: "0 0 8px" }}>
            Regalía por fidelización — Baleada con todo
          </p>
          <p style={{ fontSize: 13, color: "#666", margin: "0 0 12px" }}>
            {order.customer_name} lleva <strong>{pointsProgress}</strong> de <strong>{POINTS_FOR_FREE}</strong> baleadas para ganar una gratis
          </p>
          {/* Barra de progreso */}
          <div style={{ height: 10, background: "#f0e6d2", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${(pointsProgress / POINTS_FOR_FREE) * 100}%`,
              background: "#F1B53E",
              borderRadius: 99,
              transition: "width 0.3s",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 11, color: "#aaa" }}>0</span>
            <span style={{ fontSize: 11, color: "#aaa" }}>{POINTS_FOR_FREE}</span>
          </div>
          {pointsProgress === 0 && totalPoints > 0 && (
            <p style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: "#588F3D" }}>
              🎉 ¡{order.customer_name} acaba de completar {POINTS_FOR_FREE} baleadas — tiene una gratis!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
