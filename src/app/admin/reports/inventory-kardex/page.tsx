import { getInventoryKardex } from "@/services/reports";
import { getIngredients } from "@/services/inventory";
import { defaultReportRange } from "@/lib/date-range";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { ReportDateRangeFiltersSuspense } from "@/components/admin/report-date-range-filters";


// ─── helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("es-HN", { day: "2-digit" });
  const month = d.toLocaleDateString("es-HN", { month: "short" });
  const year = d.toLocaleDateString("es-HN", { year: "numeric" });
  return `${day} ${month}\n${year}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// ─── types ───────────────────────────────────────────────────────────────────

type Movement = {
  id: string;
  created_at: string;
  movement_type: string; // "IN" | "OUT"
  quantity: number;
  reason: string | null;
  ingredient?: { name: string; unit?: string };
  responsible?: {
    full_name: string;
    image_url?: string | null; // include if your users table has it
  };
  responsible_user_id?: string | null;
  notes?: string | null;
};

// ─── page ────────────────────────────────────────────────────────────────────

export default async function InventoryKardexPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; ingredientId?: string }>;
}) {
  const params = await searchParams;
  const dr = defaultReportRange();
  const from = params.from ?? dr.from;
  const to = params.to ?? dr.to;

  const [movements, ingredients] = await Promise.all([
    getInventoryKardex({
      from,
      to,
      ingredientId: params.ingredientId || undefined,
    }),
    getIngredients(true),
  ]);

  // Derive the ingredient label shown in the card header
  const selectedIngredient = ingredients.find(
    (i: { id: string; name: string }) => i.id === params.ingredientId
  );
  const ingredientLabel = selectedIngredient?.name ?? "Todos los ingredientes";
  const ingredientUnit = selectedIngredient?.unit ?? "";

  // API devuelve movimientos más recientes primero; el saldo va en orden cronológico
  const chronological = [...(movements as Movement[])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  let runningStock = 0;
  const rows: (Movement & { runningStock: number })[] = chronological.map((m) => {
    const qty = Number(m.quantity);
    if (m.movement_type.toUpperCase() === "IN") {
      runningStock += qty;
    } else {
      runningStock -= qty;
    }
    return { ...m, runningStock };
  });

  const currentStock = runningStock;

  const exportRows = rows.map((m) => ({
    Fecha: formatDate(m.created_at).replace("\n", " "),
    Tipo: m.movement_type === "IN" ? "Entrada" : "Salida",
    Detalle: m.reason ?? "",
    Entrada: m.movement_type === "IN" ? `+${m.quantity}` : "—",
    Salida: m.movement_type === "OUT" || m.movement_type === "ADJUSTMENT" ? `-${m.quantity}` : "—",
    Stock: m.runningStock,
    Responsable: m.responsible?.full_name ?? "",
    Observaciones: m.notes ?? "",
  }));


  // Period display
  const periodLabel = (() => {
    const f = new Date(from + "T12:00:00");
    const t = new Date(to + "T12:00:00");
    return `${f.toLocaleDateString("es-HN", { day: "2-digit", month: "short", year: "numeric" })} – ${t.toLocaleDateString("es-HN", { day: "2-digit", month: "short", year: "numeric" })}`;
  })();

  return (
    <>
      {/* Google Fonts – Outfit */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        .kardex-root * { font-family: 'Outfit', sans-serif; }

        /* header gradient */
        .kardex-header {
          background: #eeba54;
          border-radius: 0;
          padding: 18px 24px 14px;
          text-align: center;
        }

        /* filter bar */
        .kardex-filter {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 18px 0 12px;
        }
        .kardex-filter label { font-weight: 600; font-size: 14px; color: #1a1a1a; }
        .kardex-filter input[type="date"],
        .kardex-filter select {
          border: 1.5px solid #d4c7b0;
          border-radius: 8px;
          padding: 7px 12px;
          font-size: 14px;
          font-family: 'Outfit', sans-serif;
          background: #fffdf8;
          color: #1a1a1a;
          outline: none;
        }
        .kardex-filter input[type="date"]:focus,
        .kardex-filter select:focus { border-color: #e8a838; }

        .kardex-btn {
          background: #CD6633;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 20px;
          font-size: 14px;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .kardex-btn:hover { background: #a85522; }

        /* card */
        .kardex-card {
          background: #753B19;
          border-radius: 10px 10px 0 0;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .kardex-card-left { display: flex; align-items: center; gap: 10px; }
        .kardex-card-name { color: #fff; font-weight: 400; font-size: 16px; font-family: 'Outfit', sans-serif; }
        .kardex-unit-badge {
          background: #D9D9D94D;
          color: #D9D9D9;
          font-size: 11px;
          font-weight: 400;
          font-family: 'Outfit', sans-serif;
          padding: 2px 10px;
          border-radius: 99px;
          letter-spacing: 0.02em;
        }
        .kardex-stock-label { color: #e8c87a; font-size: 12px; text-align: right; line-height: 1.3; font-family: 'Playfair Display', serif; }
        .kardex-stock-value { color: #f5d68a; font-size: 22px; font-weight: 700; }

        /* table */
        .kardex-table-wrap {
          border: 1.5px solid #e8d5b0;
          border-top: none;
          border-radius: 0 0 10px 10px;
          overflow: hidden;
        }
        .kardex-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .kardex-table thead tr {
          background: #F1B53E;
          border-bottom: 1.5px solid #e0cba8;
        }
        .kardex-table th {
          padding: 10px 14px;
          text-align: left;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.05em;
          color: #6b5030;
          text-transform: uppercase;
        }
        .kardex-table th.right { text-align: right; }
        .kardex-table td {
          padding: 14px 14px;
          vertical-align: middle;
          color: #2a1f0f;
          border-bottom: 1px solid #f0e6d2;
        }
        .kardex-table tbody tr:last-child td { border-bottom: none; }
        .kardex-table tbody tr:hover { background: #fffaf3; }

        /* movement badge */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 99px;
          font-weight: 600;
          font-size: 12px;
        }
        .badge-entrada {
          background: #e6f9ee;
          color: #1a7a3e;
          border: 1px solid #b2e8c8;
        }
        .badge-salida {
          background: #fff0e6;
          color: #c05a10;
          border: 1px solid #f5c8a0;
        }
        .badge-icon { font-size: 13px; }

        /* qty cells */
        .qty-entrada { color: #588F3D; font-weight: 700; text-align: right; }
        .qty-salida  { color: #CD6633; font-weight: 700; text-align: right; }
        .qty-dash    { color: #bbb; text-align: right;}

        /* avatar */
        .avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }
        .avatar-initials {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #e8a838;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .responsible-cell { display: flex; align-items: center; gap: 8px; }
      `}</style>


      <div className="kardex-root" style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px 40px" }}>
        {/* ── Export Buttons ── */}
        <div style={{ display: "flex", justifyContent: "flex-end", margin: "24px 0 -16px" }}>
          <ReportExportButtons title="Kárdex de Movimientos de Insumos" rows={exportRows} from={from} to={to} ingredientLabel={ingredientLabel}
  ingredientUnit={ingredientUnit} />
        </div>

        {/* ── Page header ── */}
        <div className="kardex-header" style={{ marginTop: 24 }}>
          <h1 style={{ color: "#000000", fontWeight: 700, fontSize: 22, margin: 0, fontFamily: "'Playfair Display', serif" }}>
            Kárdex de Movimientos de Insumos
          </h1>
          <p style={{ color: "#6F6868", fontSize: 13, margin: "6px 0 0", fontWeight: 400 }}>
            Periodo: {periodLabel}
          </p>
        </div>
        <div style={{ borderTop: "3.5px solid #F1B53E", margin: "8px 0 0 0" }} />

        {/* ── Filtros de tiempo + ingrediente ── */}
        <ReportDateRangeFiltersSuspense
          from={from}
          to={to}
          variant="kardex"
          formFieldNames={["ingredientId"]}
          submitLabel="Filtrar"
          className="kardex-filter-wrap"
        >
          <label htmlFor="k-ing" style={{ marginLeft: 12, fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>
            Ingrediente:
          </label>
          <select id="k-ing" name="ingredientId" defaultValue={params.ingredientId ?? ""}>
            <option value="">Todos</option>
            {(ingredients as { id: string; name: string }[]).map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </ReportDateRangeFiltersSuspense>

        {/* ── Ingredient card header ── */}
        <div className="kardex-card">
          <div className="kardex-card-left">
            <span className="kardex-card-name">{ingredientLabel}</span>
            {ingredientUnit && (
              <span className="kardex-unit-badge">{ingredientUnit}</span>
            )}
          </div>
          <div style={{ textAlign: "right", fontFamily: "'Playfair Display', serif" }}>
            <div className="kardex-stock-label">Stock actual:</div>
            <div>
              <span className="kardex-stock-value">
                {currentStock}
              </span>
              {ingredientUnit && (
                <span style={{ color: "#ffffff", fontSize: 12, marginLeft: 4, fontFamily: "'Outfit', sans-serif", fontWeight: 200 }}>
                  {ingredientUnit} en existencia
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="kardex-table-wrap">
          <table className="kardex-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo de Movimiento</th>
                <th>Detalle / Motivo</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Stock</th>
                <th>Responsable</th>
                <th className="right">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "#999", padding: "32px 0" }}>
                    Sin movimientos en este periodo.
                  </td>
                </tr>
              )}
              {rows.map((m) => {
                const isEntrada = m.movement_type.toUpperCase() === "IN";
                const qty = Number(m.quantity);
                const responsibleName = m.responsible?.full_name ?? "—";
                // If your users table has image_url, use it; otherwise fall back to initials
                const avatarUrl = m.responsible?.image_url ?? null;

                return (
                  <tr key={m.id}>
                    {/* DATE */}
                    <td style={{ whiteSpace: "pre-line", color: "#6b5030", fontSize: 12 }}>
                      {formatDate(m.created_at)}
                    </td>

                    {/* MOVEMENT TYPE BADGE */}
                    <td>
                      {isEntrada ? (
                        <span className="badge badge-entrada">
                          <span className="badge-icon">↑</span> Entrada
                        </span>
                      ) : (
                        <span className="badge badge-salida">
                          <span className="badge-icon">↓</span> Salida
                        </span>
                      )}
                    </td>

                    {/* REASON */}
                    <td style={{ color: "#4a3820" }}>{m.reason ?? "—"}</td>

                    {/* ENTRADA qty */}
                    <td className={isEntrada ? "qty-entrada" : "qty-dash"}>
                      {isEntrada ? `+${qty}` : "—"}
                    </td>

                    {/* SALIDA qty */}
                    <td className={!isEntrada ? "qty-salida" : "qty-dash"}>
                      {!isEntrada ? `-${qty}` : "—"}
                    </td>

                    {/* RUNNING STOCK */}
                    <td style={{ fontWeight: 600, textAlign: "right" }}>{m.runningStock}</td>

                    {/* RESPONSIBLE with avatar */}
                    <td>
                      <div className="responsible-cell">
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={avatarUrl}
                            alt={responsibleName}
                            className="avatar"
                          />
                        ) : (
                          <div className="avatar-initials" title={responsibleName}>
                            {responsibleName !== "—" ? getInitials(responsibleName) : "?"}
                          </div>
                        )}
                        <span>{responsibleName}</span>
                      </div>
                    </td>

                    {/* NOTES */}
                    <td style={{ textAlign: "right", color: "#888", fontStyle: m.notes ? "normal" : "italic" }}>
                      {m.notes ?? ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}