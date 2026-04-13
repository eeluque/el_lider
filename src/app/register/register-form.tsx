"use client";

import { useActionState } from "react";
import { registerCustomer, type RegisterState } from "@/app/auth/register/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setSpanishValidationMessage, validateSpanishOnInput } from "@/lib/form-validation";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_MAX_LENGTH,
  PHONE_MIN_LENGTH,
  PHONE_PATTERN,
} from "@/lib/field-rules";

export function RegisterForm() {
  const [state, formAction] = useActionState(registerCustomer, null as RegisterState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input
          id="fullName"
          name="fullName"
          autoFocus
          minLength={NAME_MIN_LENGTH}
          maxLength={NAME_MAX_LENGTH}
          autoComplete="name"
          onInvalid={setSpanishValidationMessage}
          onInput={validateSpanishOnInput}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Correo *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          onInvalid={setSpanishValidationMessage}
          onInput={validateSpanishOnInput}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          minLength={PHONE_MIN_LENGTH}
          maxLength={PHONE_MAX_LENGTH}
          pattern={PHONE_PATTERN}
          autoComplete="tel"
          onInvalid={setSpanishValidationMessage}
          onInput={validateSpanishOnInput}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña *</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_LENGTH}
          aria-describedby="register-password-help"
          autoComplete="new-password"
          onInvalid={setSpanishValidationMessage}
          onInput={validateSpanishOnInput}
        />
        <p id="register-password-help" className="text-xs text-muted-foreground">
          Usa entre {PASSWORD_MIN_LENGTH} y {PASSWORD_MAX_LENGTH} caracteres.
        </p>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" className="w-full">
        Crear cuenta
      </Button>
    </form>
  );
}
