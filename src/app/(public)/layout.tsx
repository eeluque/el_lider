import { PublicShell } from "@/components/layout/PublicShell";

export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/60">
      <PublicShell>{children}</PublicShell>
    </div>
  );
}
