"use client";

import { useActionState } from "react";
import { registerCustomer, type RegisterState } from "@/app/auth/register/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearSpanishValidationMessage, setSpanishValidationMessage } from "@/lib/form-validation";

export function RegisterForm() {
  const [state, formAction] = useActionState(registerCustomer, null as RegisterState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input id="fullName" name="fullName" onInvalid={setSpanishValidationMessage} onInput={clearSpanishValidationMessage} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Correo *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          onInvalid={setSpanishValidationMessage}
          onInput={clearSpanishValidationMessage}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" name="phone" type="tel" onInvalid={setSpanishValidationMessage} onInput={clearSpanishValidationMessage} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña *</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          onInvalid={setSpanishValidationMessage}
          onInput={clearSpanishValidationMessage}
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" className="w-full">
        Crear cuenta
      </Button>
    </form>
  );
}
