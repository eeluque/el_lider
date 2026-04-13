import Image from "next/image";
import { Suspense } from "react";
import { ReportDateRangeFiltersSuspense } from "@/components/admin/report-date-range-filters";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { ReportPagination } from "@/components/admin/report-pagination";
import { defaultReportRange } from "@/lib/date-range";
import { paginateSlice, parseReportPage, REPORT_PAGE_SIZE } from "@/lib/report-pagination";
import { getIngredients } from "@/services/inventory";
import { getInventoryKardex } from "@/services/reports";

function formatDate(iso: string) {
  const date = new Date(iso);
  const day = date.toLocaleDateString("es-HN", { day: "2-digit" });
  const month = date.toLocaleDateString("es-HN", { month: "short" });
  const year = date.toLocaleDateString("es-HN", { year: "numeric" });
  return `${day} ${month}\n${year}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

type Movement = {
  id: string;
  created_at: string;
  movement_type: string;
  quantity: number;
  reason: string | null;
  ingredient?: { name: string; unit?: string };
  responsible?: {
    full_name: string;
    image_url?: string | null;
  };
  responsible_user_id?: string | null;
  notes?: string | null;
};

export default async function InventoryKardexPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; ingredientId?: string; page?: string }>;
}) {
  const params = await searchParams;
  const range = defaultReportRange();
  const from = params.from ?? range.from;
  const to = params.to ?? range.to;
  const page = parseReportPage(params.page);

  const [movements, ingredients] = await Promise.all([
    getInventoryKardex({
      from,
      to,
      ingredientId: params.ingredientId || undefined,
    }),
    getIngredients(true),
  ]);

  const selectedIngredient = ingredients.find((ingredient: { id: string; name: string }) => ingredient.id === params.ingredientId);
  const headerIngredientName = selectedIngredient?.name ?? "Todos los ingredientes";
  const ingredientUnit = selectedIngredient?.unit ?? "";
  const isSingleIngredient = !!params.ingredientId;

  const chronological = [...(movements as Movement[])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const stockSummary = chronological.reduce<{
    rows: Array<Movement & { runningStock: number }>;
    runningStock: number;
  }>(
    (acc, movement) => {
      const quantity = Number(movement.quantity);
      const nextRunningStock =
        movement.movement_type.toUpperCase() === "IN"
          ? acc.runningStock + quantity
          : acc.runningStock - quantity;

      acc.rows.push({ ...movement, runningStock: nextRunningStock });
      acc.runningStock = nextRunningStock;
      return acc;
    },
    { rows: [], runningStock: 0 }
  );

  const rows = stockSummary.rows;
  const currentStock = stockSummary.runningStock;
  const pagedRows = paginateSlice(rows, page, REPORT_PAGE_SIZE);

  function formatRowIngredient(movement: Movement) {
    const name = movement.ingredient?.name?.trim();
    const unit = movement.ingredient?.unit?.trim();
    if (!name) return "—";
    return unit ? `${name} (${unit})` : name;
  }

  const exportRows = rows.map((movement) => ({
    Fecha: formatDate(movement.created_at).replace("\n", " "),
    ...(!params.ingredientId && { Ingrediente: formatRowIngredient(movement) }),
    "Tipo de movimiento":
      movement.movement_type === "IN" ? "Entrada" : movement.movement_type === "ADJUSTMENT" ? "Ajuste" : "Salida",
    Detalle: movement.reason ?? "",
    Entrada: movement.movement_type === "IN" ? `+${movement.quantity}` : "—",
    Salida: movement.movement_type === "OUT" || movement.movement_type === "ADJUSTMENT" ? `-${movement.quantity}` : "—",
    Stock: movement.runningStock,
    Responsable: movement.responsible?.full_name ?? "",
    Observaciones: movement.notes ?? "",
  }));

  const periodLabel = (() => {
    const start = new Date(`${from}T12:00:00`);
    const end = new Date(`${to}T12:00:00`);
    return `${start.toLocaleDateString("es-HN", { day: "2-digit", month: "short", year: "numeric" })} – ${end.toLocaleDateString(
      "es-HN",
      { day: "2-digit", month: "short", year: "numeric" }
    )}`;
  })();

  return (
    <>
      <style>{`
        .kardex-root * { font-family: 'Outfit', sans-serif; }
        .kardex-header {
          background: #eeba54;
          border-radius: 0;
          padding: 18px 24px 14px;
          text-align: center;
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
        .kardex-card {
          background: #753b19;
          border-radius: 10px 10px 0 0;
          padding: 14px 20px;
          min-height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .kardex-card-left { display: flex; align-items: center; gap: 10px; }
        .kardex-card-name { color: #fff; font-weight: 400; font-size: 16px; }
        .kardex-unit-badge {
          background: #d9d9d94d;
          color: #d9d9d9;
          font-size: 11px;
          font-weight: 400;
          padding: 2px 10px;
          border-radius: 99px;
          letter-spacing: 0.02em;
        }
        .kardex-stock-label {
          color: #e8c87a;
          font-size: 12px;
          text-align: right;
          line-height: 1.3;
          font-family: 'Playfair Display', serif;
        }
        .kardex-stock-value { color: #f5d68a; font-size: 22px; font-weight: 700; }
        .kardex-table-wrap { overflow-x: auto; }
        .kardex-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .kardex-table thead tr {
          background: #f1b53e;
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
        .kardex-table td {
          padding: 14px;
          vertical-align: middle;
          color: #2a1f0f;
          border-bottom: 1px solid #f0e6d2;
        }
        .kardex-table tbody tr:last-child td { border-bottom: none; }
        .kardex-table tbody tr:hover { background: #fffaf3; }
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
        .kardex-root .qty-entrada { color: #588f3d !important; font-weight: 700; text-align: right; }
        .kardex-root .qty-salida { color: #cd6633 !important; font-weight: 700; text-align: right; }
        .kardex-root .qty-dash { color: #bbb; text-align: right; }
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
        .responsible-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
      `}</style>

      <div className="kardex-root" style={{ maxWidth: 1460, margin: "0 auto", padding: "0 16px 40px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", margin: "24px 0 -16px" }}>
          <ReportExportButtons
            title="Kardex de movimientos de insumos"
            rows={exportRows}
            from={from}
            to={to}
            ingredientLabel={headerIngredientName}
            ingredientUnit={ingredientUnit}
          />
        </div>

        <div className="kardex-header" style={{ marginTop: 24 }}>
          <h1 style={{ color: "#633b22", fontWeight: 700, fontSize: 22, margin: 0, fontFamily: "'Outfit', serif" }}>
            Kardex de movimientos de insumos
          </h1>
          <p style={{ color: "#6f6868", fontSize: 13, margin: "6px 0 0", fontWeight: 400 }}>Período: {periodLabel}</p>
        </div>
        <div style={{ borderTop: "3.5px solid #f1b53e", margin: "8px 0 0" }} />

        <div className="mb-6 rounded-xl border border-primary/10 bg-card p-4">
          <ReportDateRangeFiltersSuspense
            from={from}
            to={to}
            variant="kardex"
            formFieldNames={["ingredientId"]}
            submitLabel="Filtrar"
            className="kardex-filter"
          >
            <label htmlFor="k-ing" style={{ marginLeft: 12 }}>
              Ingrediente:
            </label>
            <select id="k-ing" name="ingredientId" defaultValue={params.ingredientId ?? ""}>
              <option value="">Todos</option>
              {(ingredients as { id: string; name: string }[]).map((ingredient) => (
                <option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name}
                </option>
              ))}
            </select>
          </ReportDateRangeFiltersSuspense>
        </div>

        <div className="overflow-hidden rounded-2xl border border-primary/15 bg-card shadow-md">
          <div className="kardex-card">
            <div className="kardex-card-left">
              <span className="kardex-card-name">{headerIngredientName}</span>
              {ingredientUnit && <span className="kardex-unit-badge">{ingredientUnit}</span>}
            </div>
            <div style={{ textAlign: "right", fontFamily: "'Playfair Display', serif" }}>
              {isSingleIngredient && (
                <>
                  <div className="kardex-stock-label">Stock actual:</div>
                  <div>
                    <span className="kardex-stock-value">{currentStock}</span>
                    {ingredientUnit && (
                      <span
                        style={{
                          color: "#ffffff",
                          fontSize: 12,
                          marginLeft: 4,
                          fontFamily: "'Outfit', sans-serif",
                          fontWeight: 200,
                        }}
                      >
                        {ingredientUnit} en existencia
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="kardex-table-wrap">
            <table className="kardex-table">
              <thead>
                <tr>
                  <th style={{ width: "9%" }}>Fecha</th>
                  {!params.ingredientId && <th style={{ width: "12%" }}>Ingrediente</th>}
                  <th style={{ width: "13%", textAlign: "center" }}>Tipo de movimiento</th>
                  <th style={{ width: "20%", textAlign: "center" }}>Detalle / motivo</th>
                  <th style={{ width: "8%", textAlign: "right" }}>Entrada</th>
                  <th style={{ width: "8%", textAlign: "right" }}>Salida</th>
                  {isSingleIngredient && <th style={{ width: "7%", textAlign: "right" }}>Stock</th>}
                  <th style={{ width: "15%", textAlign: "center" }}>Responsable</th>
                  <th style={{ width: "8%", textAlign: "center" }}>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={!params.ingredientId ? 8 : isSingleIngredient ? 8 : 7}
                      style={{ textAlign: "center", color: "#999", padding: "32px 0" }}
                    >
                      Sin movimientos en este período.
                    </td>
                  </tr>
                )}
                {pagedRows.map((movement) => {
                  const movementType = movement.movement_type.toUpperCase();
                  const isEntry = movementType === "IN";
                  const isAdjustment = movementType === "ADJUSTMENT";
                  const quantity = Number(movement.quantity);
                  const responsibleName = movement.responsible?.full_name ?? "—";
                  const avatarUrl = movement.responsible?.image_url ?? null;

                  return (
                    <tr key={movement.id}>
                      <td style={{ whiteSpace: "pre-line", color: "#6b5030", fontSize: 12 }}>{formatDate(movement.created_at)}</td>

                      {!params.ingredientId && (
                        <td style={{ color: "#2a1f0f", fontWeight: 600 }}>
                          {movement.ingredient?.name ?? "—"}
                          {movement.ingredient?.unit ? (
                            <span style={{ display: "block", fontWeight: 400, fontSize: 11, color: "#888" }}>
                              {movement.ingredient.unit}
                            </span>
                          ) : null}
                        </td>
                      )}

                      <td style={{ textAlign: "center" }}>
                        {isEntry ? (
                          <span className="badge badge-entrada">
                            <span className="badge-icon">↑</span> Entrada
                          </span>
                        ) : isAdjustment ? (
                          <span className="badge" style={{ background: "#f0e6d8", color: "#6b5030", border: "1px solid #d4c7b0" }}>
                            Ajuste
                          </span>
                        ) : (
                          <span className="badge badge-salida">
                            <span className="badge-icon">↓</span> Salida
                          </span>
                        )}
                      </td>

                      <td style={{ color: "#4a3820" }}>{movement.reason ?? "—"}</td>
                      <td className={isEntry ? "qty-entrada" : "qty-dash"}>{isEntry ? `+${quantity}` : "—"}</td>
                      <td className={!isEntry ? "qty-salida" : "qty-dash"}>{!isEntry ? `-${quantity}` : "—"}</td>

                      {isSingleIngredient && <td style={{ fontWeight: 600, textAlign: "right" }}>{movement.runningStock}</td>}

                      <td style={{ whiteSpace: "nowrap", textAlign: "center" }}>
                        <div className="responsible-cell">
                          {avatarUrl ? (
                            <Image src={avatarUrl} alt={responsibleName} width={30} height={30} className="avatar" unoptimized />
                          ) : (
                            <div className="avatar-initials" title={responsibleName}>
                              {responsibleName !== "—" ? getInitials(responsibleName) : "?"}
                            </div>
                          )}
                          <span>{responsibleName}</span>
                        </div>
                      </td>

                      <td style={{ textAlign: "left", color: "#888", fontStyle: movement.notes ? "normal" : "italic" }}>{movement.notes ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {rows.length > REPORT_PAGE_SIZE && (
            <Suspense fallback={null}>
              <ReportPagination totalItems={rows.length} pageSize={REPORT_PAGE_SIZE} />
            </Suspense>
          )}
        </div>
      </div>
    </>
  );
}
