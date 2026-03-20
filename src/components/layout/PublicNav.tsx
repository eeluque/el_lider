"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function PublicNav() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold text-neutral-900">
          Comedor El Líder
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/menu" className="text-sm text-neutral-600 hover:underline">
            Menú
          </Link>
          <Link href="/order" className="text-sm text-neutral-600 hover:underline">
            Ordenar
          </Link>
          {status === "loading" ? (
            <span className="text-sm text-neutral-400">...</span>
          ) : session ? (
            <>
              {session.user.role === "customer" && (
                <Link href="/account" className="text-sm text-neutral-600 hover:underline">
                  Mi cuenta
                </Link>
              )}
              {(session.user.role === "admin" || session.user.role === "employee") && (
                <Link href="/employee" className="text-sm text-neutral-600 hover:underline">
                  Empleado
                </Link>
              )}
              {session.user.role === "admin" && (
                <Link href="/admin" className="text-sm text-neutral-600 hover:underline">
                  Admin
                </Link>
              )}
              <Button type="button" variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                Salir
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Registrarse</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
