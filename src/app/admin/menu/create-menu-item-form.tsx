"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setSpanishValidationMessage, validateSpanishOnInput } from "@/lib/form-validation";
import {
  CATEGORY_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
} from "@/lib/field-rules";
import { createMenuItem, type MenuItemFormState } from "./actions";

export function CreateMenuItemForm() {
  const [state, formAction] = useActionState(createMenuItem, null as MenuItemFormState);

  return (
    <Card className="border-primary/15 shadow-sm">
      <CardHeader>
        <CardTitle>Nuevo platillo</CardTitle>
        <CardDescription>
          Registra los productos que aparecerán disponibles para tomar pedidos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="menu-name">Nombre *</Label>
            <Input
              id="menu-name"
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
            <Label htmlFor="menu-category">Categoría</Label>
            <Input
              id="menu-category"
              name="category"
              maxLength={CATEGORY_MAX_LENGTH}
              onInvalid={setSpanishValidationMessage}
              onInput={validateSpanishOnInput}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="menu-price">Precio *</Label>
            <Input
              id="menu-price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              required
              onInvalid={setSpanishValidationMessage}
              onInput={validateSpanishOnInput}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="menu-description">Descripción</Label>
            <textarea
              id="menu-description"
              name="description"
              rows={3}
              maxLength={DESCRIPTION_MAX_LENGTH}
              onInvalid={setSpanishValidationMessage}
              onInput={validateSpanishOnInput}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-foreground md:col-span-2">
            <input type="checkbox" name="active" defaultChecked className="size-4 rounded border-input" />
            Disponible para pedidos
          </label>

          {state?.error && <p className="text-sm text-destructive md:col-span-2">{state.error}</p>}
          {state?.success && <p className="text-sm font-medium text-brand-green md:col-span-2">{state.success}</p>}

          <div className="md:col-span-2">
            <Button type="submit">Guardar platillo</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
