"use client";

import { useActionState } from "react";
import { createEmployee, type CreateEmployeeState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export function CreateEmployeeForm() {
  const [state, formAction] = useActionState(createEmployee, null as CreateEmployeeState);

  return (
    <Card className="mt-8 max-w-md">
      <CardHeader>
        <CardTitle>Nuevo empleado</CardTitle>
        <CardDescription>Crea una cuenta con rol empleado.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emp-email">Correo *</Label>
            <Input
              id="emp-email"
              name="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              onInvalid={setSpanishValidationMessage}
              onInput={validateSpanishOnInput}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emp-password">Contraseña *</Label>
            <Input
              id="emp-password"
              name="password"
              type="password"
              required
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={PASSWORD_MAX_LENGTH}
              autoComplete="new-password"
              onInvalid={setSpanishValidationMessage}
              onInput={validateSpanishOnInput}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emp-fullName">Nombre completo</Label>
            <Input
              id="emp-fullName"
              name="fullName"
              minLength={NAME_MIN_LENGTH}
              maxLength={NAME_MAX_LENGTH}
              autoComplete="name"
              onInvalid={setSpanishValidationMessage}
              onInput={validateSpanishOnInput}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emp-phone">Teléfono</Label>
            <Input
              id="emp-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              minLength={PHONE_MIN_LENGTH}
              maxLength={PHONE_MAX_LENGTH}
              pattern={PHONE_PATTERN}
              autoComplete="tel"
              placeholder="Ej. 9999-9999"
              onInvalid={setSpanishValidationMessage}
              onInput={validateSpanishOnInput}
            />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state?.success && <p className="text-sm font-medium text-brand-green">{state.success}</p>}
          <Button type="submit">Crear empleado</Button>
        </form>
      </CardContent>
    </Card>
  );
}
