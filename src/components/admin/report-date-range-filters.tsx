"use client";

import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { currentWeekRange, last7DaysRange, todayRange } from "@/lib/date-range";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  from: string;
  to: string;
  formFieldNames?: string[];
  className?: string;
  children?: ReactNode;
  submitLabel?: string;
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
  <div className={cn("flex flex-col gap-3", className)}>
    <form method="get" action={pathname} className={cn("flex flex-col gap-3", variant === "kardex" && "kardex-filter")}>
      {hiddenEntries.map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}

      {/* Fila 1: Acceso rápido + fechas + botón */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Acceso rápido:</span>
          <PresetLinks variant={variant} />
        </div>
        <div className="flex flex-wrap items-end gap-3 ml-30">
          <div>
            <label style={{color: "rgb(155 114 89)"}} className="mb-1 block text-sm font-semibold uppercase tracking-wide">
              Desde
            </label>
            <input type="date" name="from" defaultValue={from || undefined}
              className={cn("rounded-lg border border-input bg-background px-2 py-2 text-sm", variant === "kardex" && "border-[#d4c7b0] bg-[#fffdf8]")}
            />
          </div>
          <div>
            <label style={{color: "rgb(155 114 89)"}} className="mb-1 block text-sm font-semibold uppercase tracking-wide">
              Hasta
            </label>
            <input type="date" name="to" defaultValue={to || undefined}
              className={cn("rounded-lg border border-input bg-background px-2 py-2 text-sm", variant === "kardex" && "border-[#d4c7b0] bg-[#fffdf8]")}
            />
          </div>
          {/* Botón solo si NO es kardex */}
          {variant !== "kardex" && (
            <button type="submit" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "bg-[#CD6633] hover:bg-[#b85a2d] text-white border-0")}>
              {submitLabel}
            </button>
          )}
        </div>
      </div>

      {/* Fila 2: solo para kardex — Ingrediente + Filtrar */}
      <div className="flex flex-wrap items-end gap-3">
        {children}
        {variant === "kardex" && (
          <button type="submit" className="bg-[#CD6633] text-white border-0 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#b85a2d]">
            {submitLabel}
          </button>
        )}
      </div>
    </form>
  </div>
);
}

export function ReportDateRangeFiltersSuspense(props: Props) {
  return (
    <Suspense fallback={<div className="h-5 animate-pulse rounded-lg bg-muted/40" aria-hidden />}>
      <ReportDateRangeFilters {...props} />
    </Suspense>
  );
}
