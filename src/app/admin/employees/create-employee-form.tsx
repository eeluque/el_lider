"use client";

import { useActionState, useState } from "react";
import { createEmployee, type CreateEmployeeState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";
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
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-md rounded-md border overflow-hidden">
      {/* Header colapsable */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#753B19] text-white font-bold uppercase tracking-wide text-sm"
      >
        <span>Crear empleado</span>
        {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>

      {/* Contenido colapsable */}
      {open && (
        <div className="bg-white p-4">
          <p className="text-sm text-muted-foreground mb-4">Crea una cuenta con rol empleado.</p>
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
                placeholder="example@dominio.com"
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
                placeholder="********"
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
                placeholder="Nombres y apellidos"
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
                placeholder="9999-9999"
                onInvalid={setSpanishValidationMessage}
                onInput={validateSpanishOnInput}
              />
            </div>
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            {state?.success && <p className="text-sm font-medium text-brand-green">{state.success}</p>}
            <Button type="submit">Crear empleado</Button>
          </form>
        </div>
      )}
    </div>
  );
}