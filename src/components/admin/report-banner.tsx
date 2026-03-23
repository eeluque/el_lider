import type { ReactNode } from "react";

export function ReportBanner({
  title,
  subtitle,
  right,
  className,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className} style={{ width: "100%" }}>
      {/* ── Cuadrado dorado ── */}
      <div
        style={{
          background: "#eeba54",
          padding: "18px 24px 14px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#000000",
            fontWeight: 700,
            fontSize: 22,
            margin: 0,
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: "#6F6868", fontSize: 13, margin: "6px 0 0", fontWeight: 400 }}>
            {subtitle}
          </p>
        )}
        {right && <div style={{ marginTop: 8 }}>{right}</div>}
      </div>

      {/* ── Línea dorada ── */}
      <div style={{ borderTop: "3.5px solid #F1B53E", margin: "8px 0 0 0" }} />
    </div>
  );
}