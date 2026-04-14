"use client";

import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  currentWeekRange,
  formatDateInputDisplay,
  last7DaysRange,
  todayRange,
} from "@/lib/date-range";
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
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", nextFrom);
    params.set("to", nextTo);
    return `${pathname}?${params.toString()}`;
  };
}

function PresetLinks({ variant }: { variant: "admin" | "kardex" }) {
  const build = useBuildHref();
  const today = todayRange();
  const last7Days = last7DaysRange();
  const currentWeek = currentWeekRange();

  if (variant === "kardex") {
    return (
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-[#1a1a1a]">Rápido:</span>
        <Link
          href={build(today.from, today.to)}
          className="rounded-full border border-[#d4c7b0] bg-white px-3 py-1.5 text-xs font-semibold text-[#6b5030] transition hover:border-[#e8a838]"
        >
          Hoy
        </Link>
        <Link
          href={build(last7Days.from, last7Days.to)}
          className="rounded-full border border-[#d4c7b0] bg-white px-3 py-1.5 text-xs font-semibold text-[#6b5030] transition hover:border-[#e8a838]"
        >
          Últimos 7 días
        </Link>
        <Link
          href={build(currentWeek.from, currentWeek.to)}
          className="rounded-full border border-[#d4c7b0] bg-white px-3 py-1.5 text-xs font-semibold text-[#6b5030] transition hover:border-[#e8a838]"
        >
          Semana actual
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={build(today.from, today.to)} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-primary/30")}>
        Hoy
      </Link>
      <Link
        href={build(last7Days.from, last7Days.to)}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-primary/30")}
      >
        Últimos 7 días
      </Link>
      <Link
        href={build(currentWeek.from, currentWeek.to)}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "border-primary/30")}
      >
        Semana actual
      </Link>
    </div>
  );
}

function DateInputField({
  label,
  name,
  value,
  variant,
}: {
  label: string;
  name: "from" | "to";
  value: string;
  variant: "admin" | "kardex";
}) {
  return (
    <div>
      <label className={cn("mb-1 block text-xs font-medium text-muted-foreground", variant === "kardex" && "!text-[#1a1a1a]")}>
        {label}
      </label>
      <input
        type="date"
        name={name}
        lang="es-HN"
        defaultValue={value}
        title="Formato: dd/mm/yyyy"
        className={cn(
          "rounded-lg border border-input bg-background px-2 py-2 text-sm",
          variant === "kardex" && "border-[#d4c7b0] bg-[#fffdf8]"
        )}
      />
      <p className="mt-1 text-[11px] text-muted-foreground">Formato: {formatDateInputDisplay(value)}</p>
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
    <div className={cn("space-y-3", className)}>
      <PresetLinks variant={variant} />

      <form method="get" action={pathname} className={cn("flex flex-wrap items-end gap-3", variant === "kardex" && "kardex-filter")}>
        {hiddenEntries.map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        <DateInputField label="Desde" name="from" value={from} variant={variant} />
        <DateInputField label="Hasta" name="to" value={to} variant={variant} />
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
