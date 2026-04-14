// app/admin/orders/new/page.tsx
import { getSupabaseAdmin } from "@/lib/db";
import { CreateManualOrderForm } from "../create-manual-order-form";

export default async function NewOrderPage() {
  const supabase = getSupabaseAdmin(); 
  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("*")
    .order("name");

  return <CreateManualOrderForm menuItems={menuItems ?? []} />;
}