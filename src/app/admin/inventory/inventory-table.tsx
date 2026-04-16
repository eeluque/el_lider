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
import type { Ingredient } from "@/types";
import { Pencil, X, Save } from "lucide-react";
import { useActionState, useState } from "react";
import { updateIngredient, type InventoryFormState } from "./actions";

function EditableIngredientRow({ ingredient, canEdit }: { ingredient: Ingredient; canEdit: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction] = useActionState(updateIngredient, null as InventoryFormState);
  const isLow = Number(ingredient.current_stock) <= Number(ingredient.minimum_stock);

  return (
    <TableRow className="bg-white hover:bg-neutral-50 transition-colors">
      <TableCell className="font-medium text-left">
        {isEditing && canEdit ? (
          <form id={`edit-form-${ingredient.id}`} action={formAction} className="flex flex-col gap-2 mx-auto max-w-[150px]">
            <input type="hidden" name="id" value={ingredient.id} />
            <Input name="name" defaultValue={ingredient.name} className="h-8 text-xs text-center focus-visible:ring-[#753B19]" />
            <label className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase text-neutral-500">
              <input
                type="checkbox"
                name="active"
                defaultChecked={ingredient.active}
                className="size-3 accent-[#753B19] rounded border-input"
              />
              Activo
            </label>
          </form>
        ) : (
          <span className="text-neutral-900">
            {ingredient.name}
          </span>
        )}
      </TableCell>

      <TableCell className="text-left text-neutral-600">{ingredient.unit}</TableCell>

      <TableCell className="text-right pr-8">
        {isEditing ? (
          <Input 
            name="currentStock" 
            form={`edit-form-${ingredient.id}`} 
            type="number" 
            defaultValue={Number(ingredient.current_stock)} 
            className="h-8 text-xs w-20 ml-auto text-right focus-visible:ring-[#753B19]" 
          />
        ) : (
          <span className="font-bold">{Number(ingredient.current_stock)}</span>
        )}
      </TableCell>

      <TableCell className="text-right pr-8">
        {isEditing ? (
          <Input 
            name="minimumStock" 
            form={`edit-form-${ingredient.id}`} 
            type="number" 
            defaultValue={Number(ingredient.minimum_stock)} 
            className="h-8 text-xs w-20 ml-auto text-right focus-visible:ring-[#753B19]" 
          />
        ) : (
          <span className="text-neutral-500">{Number(ingredient.minimum_stock)}</span>
        )}
      </TableCell>

      <TableCell className="text-center">
        <Badge 
          variant={isLow ? "destructive" : "outline"}
          className={!isLow ? "text-green-700 border-green-200 bg-green-50" : ""}
        >
          {isLow ? "Stock crítico" : "Stock suficiente"}
        </Badge>
      </TableCell>

      <TableCell className="text-center">
        {canEdit && (
          <div className="flex justify-center gap-2">
            {isEditing ? (
              <>
                <Button form={`edit-form-${ingredient.id}`} type="submit" size="sm" className="bg-[#588f3d] hover:bg-[#4a7a33] text-white h-8">
                  <Save className="size-3 mr-1" /> Guardar
                </Button>
                <Button type="button" size="sm"
                className="bg-[#CD6633] hover:bg-[#b85a2d] text-white border-0 font-bold"
                onClick={() => setIsEditing(false)}>
                x Cerrar
              </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)} 
                className="h-8 text-[#753B19] border-neutral-300 hover:bg-neutral-100"
              >
                <Pencil className="size-3 mr-1" /> Editar
              </Button>
            )}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

export function InventoryTable({ ingredients, canEdit = true }: { ingredients: Ingredient[]; canEdit?: boolean }) {
  if (ingredients.length === 0) return (
    <div className="mt-8 p-12 text-center bg-white rounded-md border border-neutral-100 shadow-sm">
      <p className="text-neutral-500">Aún no hay insumos registrados en el inventario.</p>
    </div>
  );

  return (
    <div className="mt-6 overflow-hidden rounded-md border border-neutral-200 shadow-sm">
      <Table>
        <TableHeader className="bg-[#753B19]">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="text-white font-bold uppercase text-[11px] text-center tracking-wider">Insumo</TableHead>
            <TableHead className="text-white font-bold uppercase text-[11px] text-center tracking-wider">Unidad</TableHead>
            <TableHead className="text-white font-bold uppercase text-[11px] text-center tracking-wider">Stock Actual</TableHead>
            <TableHead className="text-white font-bold uppercase text-[11px] text-center tracking-wider">Stock Mínimo</TableHead>
            <TableHead className="text-white font-bold uppercase text-[11px] text-center tracking-wider">Estado</TableHead>
            <TableHead className="text-white font-bold uppercase text-[11px] text-center tracking-wider">Acción</TableHead>
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