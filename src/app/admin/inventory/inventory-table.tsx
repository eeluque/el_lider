"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { clearSpanishValidationMessage, setSpanishValidationMessage } from "@/lib/form-validation";
import type { Ingredient } from "@/types";
import { Pencil, X } from "lucide-react";
import { useActionState, useState } from "react";
import { updateIngredient, type InventoryFormState } from "./actions";

function EditableIngredientRow({ ingredient, canEdit }: { ingredient: Ingredient; canEdit: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction] = useActionState(updateIngredient, null as InventoryFormState);
  const isLow = Number(ingredient.current_stock) <= Number(ingredient.minimum_stock);

  return (
    <TableRow>
      <TableCell className="font-medium">
        {isEditing && canEdit ? (
          <form action={formAction} className="space-y-2">
            <input type="hidden" name="id" value={ingredient.id} />
            <Input name="name" defaultValue={ingredient.name} required onInvalid={setSpanishValidationMessage} onInput={clearSpanishValidationMessage} />
            <Input name="unit" defaultValue={ingredient.unit} required onInvalid={setSpanishValidationMessage} onInput={clearSpanishValidationMessage} />
            <Input
              name="currentStock"
              type="number"
              min="0"
              step="0.001"
              defaultValue={Number(ingredient.current_stock)}
              required
              onInvalid={setSpanishValidationMessage}
              onInput={clearSpanishValidationMessage}
            />
            <Input
              name="minimumStock"
              type="number"
              min="0"
              step="0.001"
              defaultValue={Number(ingredient.minimum_stock)}
              required
              onInvalid={setSpanishValidationMessage}
              onInput={clearSpanishValidationMessage}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="active"
                defaultChecked={ingredient.active}
                className="size-4 rounded border-input"
              />
              Activo
            </label>
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            {state?.success && <p className="text-sm font-medium text-brand-green">{state.success}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm">Guardar</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                Cerrar
              </Button>
            </div>
          </form>
        ) : (
          ingredient.name
        )}
      </TableCell>
      <TableCell>{ingredient.unit}</TableCell>
      <TableCell>{Number(ingredient.current_stock)}</TableCell>
      <TableCell>{Number(ingredient.minimum_stock)}</TableCell>
      <TableCell>
        <Badge variant={isLow ? "destructive" : "secondary"}>{isLow ? "Bajo stock" : "OK"}</Badge>
      </TableCell>
      <TableCell className="w-[110px]">
        {canEdit ? (
          !isEditing ? (
            <Button type="button" size="sm" variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil />
              Editar
            </Button>
          ) : (
            <Button type="button" size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              <X />
              Cerrar
            </Button>
          )
        ) : (
          <span className="text-sm text-muted-foreground">Solo lectura</span>
        )}
      </TableCell>
    </TableRow>
  );
}

export function InventoryTable({ ingredients, canEdit = true }: { ingredients: Ingredient[]; canEdit?: boolean }) {
  if (ingredients.length === 0) return <p className="mt-4 text-neutral-500">No hay ingredientes.</p>;

  return (
    <div className="mt-4 overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Unidad</TableHead>
            <TableHead>Stock actual</TableHead>
            <TableHead>Minimo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Accion</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.map((ingredient) => (
            <EditableIngredientRow key={ingredient.id} ingredient={ingredient} canEdit={canEdit} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
