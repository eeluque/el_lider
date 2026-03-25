// /src/components/admin/notification-bell.tsx
import { getUnreadNotifications } from "@/services/notifications";
import { NotificationBellClient } from "./notification-bell-client";

export async function NotificationBell() {
  const notifications = await getUnreadNotifications();
  return <NotificationBellClient notifications={notifications} />;
}