"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { currentWeekRange, last7DaysRange, todayRange } from "@/lib/date-range";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  from: string;
  to: string;
  /** Nombres de campos que el formulario ya incluye (no duplicar como hidden). */
  formFieldNames?: string[];
  className?: string;
  /** Contenido extra dentro del mismo formulario (motivo, groupBy, ingrediente, etc.) */
  children?: ReactNode;
  submitLabel?: string;
  /** Variante visual para alinear con la página kárdex (botones pill). */
  variant?: "admin" | "kardex";
};

function useBuildHref() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (nextFrom: string, nextTo: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("from", nextFrom);
    p.set("to", nextTo);
    return `${pathname}?${p.toString()}`;
  };
}

function PresetLinks({ variant }: { variant: "admin" | "kardex" }) {
  const build = useBuildHref();
  const t = todayRange();
  const w7 = last7DaysRange();
  const cw = currentWeekRange();

  if (variant === "kardex") {
    return (
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-[#1a1a1a]">Rápido:</span>
        <Link
          href={build(t.from, t.to)}
          className="rounded-full border border-[#d4c7b0] bg-white px-3 py-1.5 text-xs font-semibold text-[#6b5030] transition hover:border-[#e8a838]"
        >
          Hoy
        </Link>
        <Link
          href={build(w7.from, w7.to)}
          className="rounded-full border border-[#d4c7b0] bg-white px-3 py-1.5 text-xs font-semibold text-[#6b5030] transition hover:border-[#e8a838]"
        >
          Últimos 7 días
        </Link>
        <Link
          href={build(cw.from, cw.to)}
          className="rounded-full border border-[#d4c7b0] bg-white px-3 py-1.5 text-xs font-semibold text-[#6b5030] transition hover:border-[#e8a838]"
        >
          Semana actual
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={build(t.from, t.to)} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-primary/30")}>
        Hoy
      </Link>
      <Link href={build(w7.from, w7.to)} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-primary/30")}>
        Últimos 7 días
      </Link>
      <Link href={build(cw.from, cw.to)} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-primary/30")}>
        Semana actual
      </Link>
    </div>
  );
}

/**
 * Filtros de tiempo: presets + rango manual (GET). Preserva el resto de query params.
 * Envolver en `<Suspense fallback={...}>` en la página padre (useSearchParams).
 */
export function ReportDateRangeFilters({
  from,
  to,
  formFieldNames = [],
  className,
  children,
  submitLabel = "Aplicar rango",
  variant = "admin",
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skipHidden = new Set(["from", "to", ...formFieldNames]);

  const hiddenEntries: [string, string][] = [];
  searchParams.forEach((value, key) => {
    if (!skipHidden.has(key)) hiddenEntries.push([key, value]);
  });

  return (
    <div className={cn("space-y-3", className)}>
      <PresetLinks variant={variant} />

      <form method="get" action={pathname} className={cn("flex flex-wrap items-end gap-3", variant === "kardex" && "kardex-filter")}>
        {hiddenEntries.map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <div>
          <label className={cn("mb-1 block text-xs font-medium text-muted-foreground", variant === "kardex" && "!text-[#1a1a1a]")}>
            Desde
          </label>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className={cn(
              "rounded-lg border border-input bg-background px-2 py-2 text-sm",
              variant === "kardex" && "border-[#d4c7b0] bg-[#fffdf8]"
            )}
          />
        </div>
        <div>
          <label className={cn("mb-1 block text-xs font-medium text-muted-foreground", variant === "kardex" && "!text-[#1a1a1a]")}>
            Hasta
          </label>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className={cn(
              "rounded-lg border border-input bg-background px-2 py-2 text-sm",
              variant === "kardex" && "border-[#d4c7b0] bg-[#fffdf8]"
            )}
          />
        </div>
        {children}
        {variant === "kardex" ? (
          <button type="submit" className="kardex-btn">
            {submitLabel}
          </button>
        ) : (
          <button type="submit" className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
            {submitLabel}
          </button>
        )}
      </form>
    </div>
  );
}

export function ReportDateRangeFiltersSuspense(props: Props) {
  return (
    <Suspense fallback={<div className="h-20 animate-pulse rounded-lg bg-muted/40" aria-hidden />}>
      <ReportDateRangeFilters {...props} />
    </Suspense>
  );
}
