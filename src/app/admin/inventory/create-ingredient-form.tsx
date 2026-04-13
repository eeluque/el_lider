"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setSpanishValidationMessage, validateSpanishOnInput } from "@/lib/form-validation";
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH, UNIT_MAX_LENGTH } from "@/lib/field-rules";
import { createIngredient, type InventoryFormState } from "./actions";

export function CreateIngredientForm() {
  const [state, formAction] = useActionState(createIngredient, null as InventoryFormState);

  return (
    <Card className="border-primary/15 shadow-sm">
      <CardHeader>
        <CardTitle>Nuevo insumo</CardTitle>
        <CardDescription>
          Registra ingredientes y define desde el inicio su nivel mínimo de reposición.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ingredient-name">Nombre *</Label>
            <Input
              id="ingredient-name"
              name="name"
              required
              autoFocus
              minLength={NAME_MIN_LENGTH}
              maxLength={NAME_MAX_LENGTH}
              onInvalid={setSpanishValidationMessage}
              onInput={validateSpanishOnInput}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ingredient-unit">Unidad *</Label>
            <Input
              id="ingredient-unit"
              name="unit"
              required
              maxLength={UNIT_MAX_LENGTH}
              placeholder="Ej. lb, kg, unidad"
              onInvalid={setSpanishValidationMessage}
              onInput={validateSpanishOnInput}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ingredient-stock">Stock actual *</Label>
            <Input
              id="ingredient-stock"
              name="currentStock"
              type="number"
              min="0"
              step="0.001"
              required
              onInvalid={setSpanishValidationMessage}
              onInput={validateSpanishOnInput}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ingredient-minimum">Stock mínimo *</Label>
            <Input
              id="ingredient-minimum"
              name="minimumStock"
              type="number"
              min="0"
              step="0.001"
              required
              onInvalid={setSpanishValidationMessage}
              onInput={validateSpanishOnInput}
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground md:col-span-2">
            <input type="checkbox" name="active" defaultChecked className="size-4 rounded border-input" />
            Insumo activo
          </label>

          {state?.error && <p className="text-sm text-destructive md:col-span-2">{state.error}</p>}
          {state?.success && <p className="text-sm font-medium text-brand-green md:col-span-2">{state.success}</p>}

          <div className="md:col-span-2">
            <Button type="submit">Guardar insumo</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
