"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearSpanishValidationMessage, setSpanishValidationMessage } from "@/lib/form-validation";
import { registerInventoryMovement, type InventoryFormState } from "./actions";
import type { Ingredient } from "@/types";

export function InventoryMovementForm({
  ingredients,
  title = "Registrar movimiento",
  description = "Usa esta vista para registrar entradas, salidas o ajustes de stock.",
}: {
  ingredients: Ingredient[];
  title?: string;
  description?: string;
}) {
  const [state, formAction] = useActionState(registerInventoryMovement, null as InventoryFormState);

  return (
    <Card className="border-primary/15 shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="movement-ingredient">Insumo *</Label>
            <select
              id="movement-ingredient"
              name="ingredientId"
              required
              defaultValue=""
              onInvalid={setSpanishValidationMessage}
              onChange={clearSpanishValidationMessage}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="" disabled>
                Selecciona un insumo
              </option>
              {ingredients.map((ingredient) => (
                <option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name} ({ingredient.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="movement-type">Tipo *</Label>
            <select
              id="movement-type"
              name="movementType"
              required
              defaultValue="OUT"
              onInvalid={setSpanishValidationMessage}
              onChange={clearSpanishValidationMessage}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="IN">Entrada</option>
              <option value="OUT">Salida</option>
              <option value="ADJUSTMENT">Ajuste</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="movement-quantity">Cantidad *</Label>
            <Input
              id="movement-quantity"
              name="quantity"
              type="number"
              min="0.001"
              step="0.001"
              required
              onInvalid={setSpanishValidationMessage}
              onInput={clearSpanishValidationMessage}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="movement-reason">Motivo</Label>
            <Input id="movement-reason" name="reason" onInvalid={setSpanishValidationMessage} onInput={clearSpanishValidationMessage} />
          </div>

          {state?.error && <p className="text-sm text-destructive md:col-span-2">{state.error}</p>}
          {state?.success && (
            <p className="text-sm font-medium text-brand-green md:col-span-2">{state.success}</p>
          )}

          <div className="md:col-span-2">
            <Button type="submit">Guardar movimiento</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
