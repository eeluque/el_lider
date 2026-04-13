import type { ReactNode } from "react";
import { Outfit, Playfair_Display } from "next/font/google";
import { AdminTopBar } from "@/components/admin/admin-top-bar";
import { NotificationBell } from "@/components/admin/notification-bell";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { auth } from "@/lib/auth";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <div className={`${outfit.variable} ${playfairDisplay.variable} flex min-h-screen bg-muted/50`}>
      <AdminSidebar role={session?.user?.role} />
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopBar notificationBell={<NotificationBell />} />
        <main className="flex-1 p-4 md:p-6 print:p-4">{children}</main>
      </div>
    </div>
  );
}
