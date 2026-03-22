import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopBar } from "@/components/admin/admin-top-bar";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/50">
      <AdminSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopBar />
        <main className="flex-1 p-4 md:p-6 print:p-4">{children}</main>
      </div>
    </div>
  );
}
