import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Comedor El Líder</CardTitle>
          <CardDescription>Crear cuenta de cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <p className="mt-4 text-center text-sm text-neutral-600">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary underline">
              Inicia sesión
            </Link>
          </p>
          <p className="mt-2 text-center text-sm">
            <Link href="/" className="text-neutral-500 hover:underline">
              Volver al inicio
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
