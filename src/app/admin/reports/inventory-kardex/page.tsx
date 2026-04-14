import Image from "next/image";
import { Suspense } from "react";
import { ReportBanner } from "@/components/admin/report-banner";
import { ReportDateRangeFiltersSuspense } from "@/components/admin/report-date-range-filters";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { ReportPagination } from "@/components/admin/report-pagination";
import { defaultReportRange, formatCentralDate, formatCentralRangeLabel } from "@/lib/date-range";
import { paginateSlice, parseReportPage, REPORT_PAGE_SIZE } from "@/lib/report-pagination";
import { getIngredients } from "@/services/inventory";
import { getInventoryKardex } from "@/services/reports";

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
  notes?: string | null;
};

function formatKardexDate(iso: string) {
  const date = new Date(iso);
  const day = formatCentralDate(date, { day: "2-digit" });
  const month = formatCentralDate(date, { month: "short" });
  const year = formatCentralDate(date, { year: "numeric" });
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

  const selectedIngredient = ingredients.find((ingredient: { id: string; name: string; unit?: string }) => ingredient.id === params.ingredientId);
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
  const periodLabel = formatCentralRangeLabel(from, to);

  const exportRows = rows.map((movement) => ({
    Fecha: formatKardexDate(movement.created_at).replace("\n", " "),
    ...(!params.ingredientId && {
      Ingrediente: movement.ingredient?.name ?? "—",
    }),
    "Tipo de movimiento":
      movement.movement_type === "IN" ? "Entrada" : movement.movement_type === "ADJUSTMENT" ? "Ajuste" : "Salida",
    Detalle: movement.reason ?? "—",
    Entrada: movement.movement_type === "IN" ? `+${movement.quantity}` : "—",
    Salida: movement.movement_type === "OUT" || movement.movement_type === "ADJUSTMENT" ? `-${movement.quantity}` : "—",
    Stock: movement.runningStock,
    Responsable: movement.responsible?.full_name ?? "—",
    Observaciones: movement.notes ?? "",
  }));

  return (
    <div className="space-y-6">
      <ReportBanner
        title="Kardex de movimientos de insumos"
        subtitle={periodLabel}
        right={
          <ReportExportButtons
            title="Kardex de movimientos de insumos"
            rows={exportRows}
            from={from}
            to={to}
            ingredientLabel={headerIngredientName}
            ingredientUnit={ingredientUnit}
          />
        }
      />

      <div className="rounded-xl border border-primary/10 bg-card p-4">
        <ReportDateRangeFiltersSuspense
          from={from}
          to={to}
          formFieldNames={["ingredientId"]}
          submitLabel="Filtrar"
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Ingrediente</label>
            <select
              id="k-ing"
              name="ingredientId"
              defaultValue={params.ingredientId ?? ""}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todos</option>
              {(ingredients as { id: string; name: string }[]).map((ingredient) => (
                <option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name}
                </option>
              ))}
            </select>
          </div>
        </ReportDateRangeFiltersSuspense>
      </div>

      <div className="overflow-hidden rounded-2xl border border-primary/15 bg-card shadow-md">
        <div className="flex flex-col gap-3 border-b border-primary/10 bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground">{headerIngredientName}</h2>
            {ingredientUnit && <p className="text-sm text-muted-foreground">Unidad base: {ingredientUnit}</p>}
          </div>
          {isSingleIngredient && (
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Stock actual</p>
              <p className="text-2xl font-bold text-foreground">
                {currentStock} {ingredientUnit}
              </p>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary/15 text-left text-xs font-semibold uppercase text-[rgb(117,59,25)]">
                <th className="p-3">Fecha</th>
                {!params.ingredientId && <th className="p-3">Ingrediente</th>}
                <th className="p-3">Tipo</th>
                <th className="p-3">Detalle / motivo</th>
                <th className="p-3 text-right">Entrada</th>
                <th className="p-3 text-right">Salida</th>
                {isSingleIngredient && <th className="p-3 text-right">Stock</th>}
                <th className="p-3">Responsable</th>
                <th className="p-3">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.length === 0 && (
                <tr>
                  <td colSpan={!params.ingredientId ? 8 : isSingleIngredient ? 8 : 7} className="px-4 py-10 text-center text-muted-foreground">
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
                  <tr key={movement.id} className="border-b border-border/60 last:border-0 odd:bg-muted/30">
                    <td className="whitespace-pre-line p-3 text-xs text-muted-foreground">{formatKardexDate(movement.created_at)}</td>
                    {!params.ingredientId && (
                      <td className="p-3">
                        <p className="font-medium">{movement.ingredient?.name ?? "—"}</p>
                        {movement.ingredient?.unit && <p className="text-xs text-muted-foreground">{movement.ingredient.unit}</p>}
                      </td>
                    )}
                    <td className="p-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isEntry
                            ? "bg-brand-green/15 text-brand-green"
                            : isAdjustment
                              ? "bg-primary/15 text-[rgb(117,59,25)]"
                              : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {isEntry ? "Entrada" : isAdjustment ? "Ajuste" : "Salida"}
                      </span>
                    </td>
                    <td className="p-3">{movement.reason ?? "—"}</td>
                    <td className="p-3 text-right font-semibold text-brand-green">{isEntry ? `+${quantity}` : "—"}</td>
                    <td className="p-3 text-right font-semibold text-destructive">{!isEntry ? `-${quantity}` : "—"}</td>
                    {isSingleIngredient && <td className="p-3 text-right font-semibold">{movement.runningStock}</td>}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {avatarUrl ? (
                          <Image src={avatarUrl} alt={responsibleName} width={30} height={30} className="rounded-full" unoptimized />
                        ) : (
                          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-[rgb(117,59,25)]">
                            {responsibleName !== "—" ? getInitials(responsibleName) : "?"}
                          </div>
                        )}
                        <span>{responsibleName}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{movement.notes ?? "—"}</td>
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
  );
}
