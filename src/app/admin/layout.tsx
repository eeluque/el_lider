import { AdminSidebar } from "@/components/layout/AdminSidebar";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="mb-4 flex justify-end">
          <Link href="/" className="text-sm text-neutral-500 hover:underline">
            Volver al sitio
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
