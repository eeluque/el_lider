"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearSpanishValidationMessage, setSpanishValidationMessage } from "@/lib/form-validation";
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
              onInvalid={setSpanishValidationMessage}
              onInput={clearSpanishValidationMessage}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ingredient-unit">Unidad *</Label>
            <Input
              id="ingredient-unit"
              name="unit"
              required
              onInvalid={setSpanishValidationMessage}
              onInput={clearSpanishValidationMessage}
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
              onInput={clearSpanishValidationMessage}
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
              onInput={clearSpanishValidationMessage}
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground md:col-span-2">
            <input type="checkbox" name="active" defaultChecked className="size-4 rounded border-input" />
            Insumo activo
          </label>

          {state?.error && <p className="text-sm text-destructive md:col-span-2">{state.error}</p>}
          {state?.success && (
            <p className="text-sm font-medium text-brand-green md:col-span-2">{state.success}</p>
          )}

          <div className="md:col-span-2">
            <Button type="submit">Guardar insumo</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
