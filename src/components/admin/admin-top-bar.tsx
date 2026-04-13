"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Home, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminTopBar({ notificationBell }: { notificationBell?: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <header className="flex h-14 items-center justify-end gap-2 border-b border-primary/20 bg-card px-4">
      <Link
        href="/"
        className="flex size-9 items-center justify-center rounded-full text-primary transition hover:bg-primary/15"
        title="Ir al sitio"
      >
        <Home className="size-5" />
      </Link>
      {notificationBell}
      <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-muted/50 py-1 pl-1 pr-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary/25 text-primary">
          <User className="size-4" />
        </span>
        <span className="hidden max-w-[140px] truncate text-xs text-foreground sm:inline">
          {session?.user?.email ?? "—"}
        </span>
      </div>
      <Button type="button" variant="ghost" size="sm" className="text-foreground" onClick={() => signOut({ callbackUrl: "/" })}>
        Salir
      </Button>
    </header>
  );
}
