import type { ReactNode } from "react";

type Props = {
  label: string;
  value: string;
  subtext?: string;
  icon: ReactNode;
};

export function InsightCard({ label, value, subtext, icon }: Props) {
  return (
    <div className="flex items-center gap-4 border border-primary/20 bg-[#fffdf8] px-4 py-3 shadow-sm"
      style={{ borderRight: "7px solid #CD6633" }}>
      <div className="flex size-10 shrink-0 items-center justify-center bg-primary/10">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#CD6633]">
          {label}
        </p>
        <p className="mt-1 font-serif text-[17px] font-bold text-[rgb(117,59,25)]">
          {value}
        </p>
        {subtext && (
          <p className="mt-0.5 text-xs text-[#CD6633]">{subtext}</p>
        )}
      </div>
    </div>
  );
}