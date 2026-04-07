"use client";

import { useActionState } from "react";
import { createEmployee, type CreateEmployeeState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clearSpanishValidationMessage, setSpanishValidationMessage } from "@/lib/form-validation";

export function CreateEmployeeForm() {
  const [state, formAction] = useActionState(createEmployee, null as CreateEmployeeState);

  return (
    <Card className="mt-8 max-w-md">
      <CardHeader>
        <CardTitle>Nuevo empleado</CardTitle>
        <CardDescription>Crea una cuenta con rol empleado. Podrá acceder a /employee.</CardDescription>
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
              onInvalid={setSpanishValidationMessage}
              onInput={clearSpanishValidationMessage}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emp-password">Contraseña *</Label>
            <Input
              id="emp-password"
              name="password"
              type="password"
              required
              onInvalid={setSpanishValidationMessage}
              onInput={clearSpanishValidationMessage}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emp-fullName">Nombre completo</Label>
            <Input id="emp-fullName" name="fullName" onInvalid={setSpanishValidationMessage} onInput={clearSpanishValidationMessage} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emp-phone">Teléfono</Label>
            <Input id="emp-phone" name="phone" type="tel" onInvalid={setSpanishValidationMessage} onInput={clearSpanishValidationMessage} />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state?.success && <p className="text-sm font-medium text-brand-green">{state.success}</p>}
          <Button type="submit">Crear empleado</Button>
        </form>
      </CardContent>
    </Card>
  );
}
