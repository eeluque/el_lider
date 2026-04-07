"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";

type Notification = {
  id: string;
  ingredient_name: string;
  current_stock: number;
  minimum_stock: number;
  created_at: string;
  read: boolean;
  unit?: string; 
};

export function NotificationBellClient({ notifications }: { notifications: Notification[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cierra al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex size-9 items-center justify-center rounded-full text-primary transition hover:bg-primary/15"
        title="Notificaciones"
        aria-label="Notificaciones"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 size-2 rounded-full bg-destructive" />
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute",
          right: 0,
          top: "calc(100% + 8px)",
          width: 320,
          background: "#fff",
          border: "1px solid #e8d5b0",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          zIndex: 50,
          overflow: "hidden",
        }}>
          {/* Header del dropdown */}
          <div style={{
            background: "#753B19",
            padding: "12px 16px",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <Bell size={15} />
            Notificaciones
            {unreadCount > 0 && (
              <span style={{
                marginLeft: "auto",
                background: "#e53e3e",
                color: "#fff",
                borderRadius: 99,
                fontSize: 11,
                fontWeight: 700,
                padding: "1px 8px",
              }}>
                {unreadCount}
              </span>
            )}
          </div>

          {/* Lista */}
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center", color: "#999", fontSize: 13 }}>
                Sin notificaciones pendientes
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #f5ece0",
                  background: n.read ? "#fff" : "#fff8f0",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{
                      fontSize: 18,
                      lineHeight: 1,
                      marginTop: 1,
                    }}>⚠️</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#753B19" }}>
                        Stock crítico: {n.ingredient_name}
                      </p>
                      <p style={{ margin: "3px 0 0", fontSize: 12, color: "#666" }}>
                        Stock actual: <strong>{n.current_stock}</strong> {n.unit && <span style={{ fontSize: 11, color: "#888" }}>{n.unit}</span>} — mínimo: <strong>{n.minimum_stock}</strong> {n.unit && <span style={{ fontSize: 11, color: "#888" }}>{n.unit}</span>}
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: 11, color: "#e53e3e", fontWeight: 600 }}>
                        Programe una reposición inmediata
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: "10px 16px",
              background: "#fffaf3",
              borderTop: "1px solid #f0e6d2",
              fontSize: 11,
              color: "#999",
              textAlign: "center",
            }}>
              Las notificaciones se resuelven automáticamente al reponer el stock
            </div>
          )}
        </div>
      )}
    </div>
  );
}