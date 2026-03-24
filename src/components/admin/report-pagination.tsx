"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { totalReportPages } from "@/lib/report-pagination";

type Props = {
  totalItems: number;
  pageSize: number;
  className?: string;
};

function buildPageHref(pathname: string, searchParams: URLSearchParams, page: number) {
  const p = new URLSearchParams(searchParams.toString());
  if (page <= 1) p.delete("page");
  else p.set("page", String(page));
  const q = p.toString();
  return q ? `${pathname}?${q}` : pathname;
}

export function ReportPagination({ totalItems, pageSize, className }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pages = totalReportPages(totalItems, pageSize);

  if (totalItems === 0 || pages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const prevHref = buildPageHref(pathname, searchParams, currentPage - 1);
  const nextHref = buildPageHref(pathname, searchParams, currentPage + 1);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-primary/10 bg-muted/20 px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p>
        Mostrando {start}–{end} de {totalItems} {totalItems === 1 ? "registro" : "registros"}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">
          Página {currentPage} de {pages}
        </span>
        <nav className="flex items-center gap-1" aria-label="Paginación">
          {currentPage <= 1 ? (
            <span
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pointer-events-none border-primary/40 opacity-50")}
            >
              Anterior
            </span>
          ) : (
            <Link href={prevHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-primary/40")}>
              Anterior
            </Link>
          )}
          {currentPage >= pages ? (
            <span
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pointer-events-none border-primary/40 opacity-50")}
            >
              Siguiente
            </span>
          ) : (
            <Link href={nextHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-primary/40")}>
              Siguiente
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
