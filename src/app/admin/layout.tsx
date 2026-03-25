import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import type { ReactNode } from "react";
import { NotificationBell } from "@/components/admin/notification-bell";


export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap"
        rel="stylesheet"
      />
      <div className="flex min-h-screen bg-muted/50">
        <AdminSidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <AdminTopBar notificationBell={<NotificationBell />}/>
          <main className="flex-1 p-4 md:p-6 print:p-4">{children}</main>
        </div>
      </div>
    </>
  );
}


