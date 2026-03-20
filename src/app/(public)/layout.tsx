import { PublicNav } from "@/components/layout/PublicNav";

export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PublicNav />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
