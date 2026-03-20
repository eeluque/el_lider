import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="border-b bg-white px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center gap-4">
          <Link href="/account" className="font-medium">Mi cuenta</Link>
          <Link href="/account/orders" className="text-sm text-neutral-600 hover:underline">Pedidos</Link>
          <Link href="/account/rewards" className="text-sm text-neutral-600 hover:underline">Puntos</Link>
          <Link href="/" className="ml-auto text-sm text-neutral-500 hover:underline">Volver</Link>
        </div>
      </nav>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
