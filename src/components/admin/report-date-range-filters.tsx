"use client";

import { Suspense, type ReactNode, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
};

type PresetRange = {
  from: string;
  to: string;
};

function PresetButtons({
  onSelect,
}: {
  onSelect: (range: PresetRange) => void;
}) {
  const searchParams = useSearchParams();
  const selectedFrom = searchParams.get("from");
  const selectedTo = searchParams.get("to");

  const presets = [
    { label: "Hoy", range: todayRange() },
    { label: "Últimos 7 días", range: last7DaysRange() },
    { label: "Esta semana", range: currentWeekRange() },
  ] as const;

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map(({ label, range }) => {
        const isActive = selectedFrom === range.from && selectedTo === range.to;

        return (
          <button
            key={label}
            type="button"
            onClick={() => onSelect(range)}
            data-active={isActive}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-primary/30 transition-colors data-[active=true]:border-primary data-[active=true]:bg-primary/10 data-[active=true]:text-[rgb(117,59,25)]"
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function DateField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: "from" | "to";
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold uppercase tracking-wide text-[rgb(117,59,25)]">
        {label}
      </label>
      <input
        type="date"
        name={name}
        lang="es-HN"
        value={value}
        title="Formato: dd/mm/yyyy"
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
      />
      <p className="mt-1 text-[11px] text-muted-foreground">
        Formato: {formatDateInputDisplay(value)}
      </p>
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
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const skipHidden = new Set(["from", "to", ...formFieldNames]);
  const [fromValue, setFromValue] = useState(from);
  const [toValue, setToValue] = useState(to);

  const hiddenEntries: [string, string][] = [];
  searchParams.forEach((value, key) => {
    if (!skipHidden.has(key)) hiddenEntries.push([key, value]);
  });

  function navigateWithRange(nextFrom: string, nextTo: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", nextFrom);
    params.set("to", nextTo);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <form method="get" action={pathname} className="flex flex-col gap-4">
        {hiddenEntries.map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}

        <div className="flex flex-wrap items-start gap-6">
          <div className="flex min-w-[220px] flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-[rgb(117,59,25)]">
              Acceso rápido
            </span>
            <PresetButtons
              onSelect={(range) => {
                setFromValue(range.from);
                setToValue(range.to);
                navigateWithRange(range.from, range.to);
              }}
            />
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <DateField label="Desde" name="from" value={fromValue} onChange={setFromValue} />
            <DateField label="Hasta" name="to" value={toValue} onChange={setToValue} />
            <button
              type="submit"
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "border-0 bg-[#CD6633] text-white hover:bg-[#b85a2d]"
              )}
            >
              {submitLabel}
            </button>
          </div>
        </div>

        {children ? <div className="flex flex-wrap items-end gap-3">{children}</div> : null}
      </form>
    </div>
  );
}

export function ReportDateRangeFiltersSuspense(props: Props) {
  return (
    <Suspense fallback={<div className="h-5 animate-pulse rounded-lg bg-muted/40" aria-hidden />}>
      <ReportDateRangeFilters
        key={`${props.from}-${props.to}-${props.formFieldNames?.join(",") ?? ""}`}
        {...props}
      />
    </Suspense>
  );
}
