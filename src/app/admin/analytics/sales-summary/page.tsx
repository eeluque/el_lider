import { getSalesSummary } from "@/services/reports";
import { defaultReportRange, fillDailySalesSeries } from "@/lib/date-range";
import { todayRange } from "@/lib/date-range";
import { ReportBanner } from "@/components/admin/report-banner";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { ReportDateRangeFiltersSuspense } from "@/components/admin/report-date-range-filters";
import { SalesSummaryReport } from "@/components/reports/SalesSummaryReport";
import { ReportPagination } from "@/components/admin/report-pagination";
import { paginateSlice, parseReportPage, REPORT_PAGE_SIZE } from "@/lib/report-pagination";
import { Suspense } from "react";

export default async function SalesSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; page?: string }>;
}) {
  const params = await searchParams;
  const today = todayRange();
  const from = params.from ?? today.from;
  const to = params.to ?? today.to;
  const page = parseReportPage(params.page);
  const { byPeriod, total, cancelledByPeriod, cancelledCount, cancelledAmount } = await getSalesSummary({ from, to });
  const chartData = fillDailySalesSeries(from, to, byPeriod).map((row) => ({
    ...row,
    cancelados: cancelledByPeriod[row.dateKey] ?? 0,
  }));
  const tableRows = paginateSlice(chartData, page, REPORT_PAGE_SIZE);

  const isSameDay = from === to;

const formatDate = (dateStr: string) =>
  new Date(dateStr + "T12:00:00").toLocaleDateString("es-HN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const monthLabel =
  !from && !to
    ? "Selecciona un rango de fechas"
    : isSameDay
      ? formatDate(from)
      : `${formatDate(from)} – ${formatDate(to)}`;

  const exportRows = [
    ...chartData.map((row) => ({
      Fecha: row.dateKey,
      Día: row.name,
      "Ventas (L.)": row.ventas.toFixed(2),
      Cancelados: row.cancelados,
    })),
    {
      Fecha: "TOTAL",
      Día: "",
      "Ventas (L.)": total.toFixed(2),
      Cancelados: cancelledCount,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <ReportExportButtons title="Resumen de ventas" rows={exportRows} from={from} to={to} />
        </div>
        <ReportBanner title="Resumen de ventas" subtitle={monthLabel} />
      </div>

      <div className="rounded-xl border border-primary/10 bg-card p-4">
        <ReportDateRangeFiltersSuspense from={from} to={to} submitLabel="Actualizar" />
      </div>

      <SalesSummaryReport
        chartData={chartData}
        tableRows={tableRows}
        total={total}
        cancelledCount={cancelledCount}
        cancelledAmount={cancelledAmount}
        monthLabel={monthLabel}
        pagination={
          <Suspense fallback={null}>
            <ReportPagination totalItems={chartData.length} pageSize={REPORT_PAGE_SIZE} />
          </Suspense>
        }
      />
    </div>
  );
}
