import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-semibold">Sin permiso</h1>
      <p className="text-neutral-600">No tienes acceso a esta sección.</p>
      <Link href="/">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}
