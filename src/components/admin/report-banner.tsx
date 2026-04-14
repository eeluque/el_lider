import type { ReactNode } from "react";

export function ReportBanner({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="bg-[#eeba54] px-6 py-4">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold text-[#633b22] outfit">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-[#6F6868]">{subtitle}</p> : null}
        </div>
      </div>
      <div className="mt-2 border-t-[3.5px] border-[#F1B53E]" />
    </div>
  );
}