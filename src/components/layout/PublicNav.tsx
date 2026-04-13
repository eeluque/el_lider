"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function PublicNav() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b border-primary/25 bg-primary/15 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold text-foreground">
          Comedor El Líder
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/menu" className="text-sm text-foreground/80 hover:text-foreground hover:underline">
            Menú
          </Link>
          {status === "loading" ? (
            <span className="text-sm text-neutral-400">...</span>
          ) : session ? (
            <>
              {session.user.role === "customer" && (
                <Link href="/account" className="text-sm text-foreground/80 hover:underline">
                  Mi cuenta
                </Link>
              )}
              {(session.user.role === "admin" || session.user.role === "employee") && (
                <Link href="/admin" className="text-sm text-foreground/80 hover:underline">
                  Panel
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
