import { Suspense } from "react";
import { ReportBanner } from "@/components/admin/report-banner";
import { ReportDateRangeFiltersSuspense } from "@/components/admin/report-date-range-filters";
import { ReportExportButtons } from "@/components/admin/report-export-buttons";
import { ReportPagination } from "@/components/admin/report-pagination";
import { SalesSummaryReport } from "@/components/reports/SalesSummaryReport";
import { defaultReportRange, fillDailySalesSeries, formatCentralRangeLabel } from "@/lib/date-range";
import { paginateSlice, parseReportPage, REPORT_PAGE_SIZE } from "@/lib/report-pagination";
import { getSalesSummary } from "@/services/reports";

export default async function SalesSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; page?: string }>;
}) {
  const params = await searchParams;
  const range = defaultReportRange();
  const to = params.to ?? range.to;
  const from = params.from ?? range.from;
  const page = parseReportPage(params.page);
  const { byPeriod, total, cancelledByPeriod, cancelledCount, cancelledAmount } = await getSalesSummary({ from, to });
  const chartData = fillDailySalesSeries(from, to, byPeriod).map((row) => ({
    ...row,
    cancelados: cancelledByPeriod[row.dateKey] ?? 0,
  }));
  const tableRows = paginateSlice(chartData, page, REPORT_PAGE_SIZE);
  const rangeLabel = formatCentralRangeLabel(from, to);

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
        <ReportBanner title="Resumen de ventas" subtitle={rangeLabel} />
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
        monthLabel={rangeLabel}
        pagination={
          <Suspense fallback={null}>
            <ReportPagination totalItems={chartData.length} pageSize={REPORT_PAGE_SIZE} />
          </Suspense>
        }
      />
    </div>
  );
}
