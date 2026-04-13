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
    <div className={className}>
      <div className="rounded-t-2xl bg-[#eeba54] px-6 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="text-center lg:text-left">
            <h1 className="font-serif text-2xl font-bold text-[#633b22]">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-[#6F6868]">{subtitle}</p> : null}
          </div>
          {right ? <div className="flex justify-center lg:justify-end">{right}</div> : null}
        </div>
      </div>
      <div className="mt-2 border-t-[3.5px] border-[#F1B53E]" />
    </div>
  );
}
