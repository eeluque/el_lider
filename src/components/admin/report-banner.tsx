import type { ReactNode } from "react";

export function ReportBanner({
  title,
  subtitle,
  right,
  className,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-xl bg-primary px-5 py-4 text-primary-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between ${className ?? ""}`}
    >
      <div>
        <h1 className="font-serif text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm opacity-90">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
