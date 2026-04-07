"use client";

import { useActionState, useState } from "react";
import { Pencil, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearSpanishValidationMessage, setSpanishValidationMessage } from "@/lib/form-validation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MenuItem } from "@/types";
import { updateMenuItem, type MenuItemFormState } from "./actions";

function EditableMenuRow({ item }: { item: MenuItem }) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction] = useActionState(updateMenuItem, null as MenuItemFormState);

  return (
    <TableRow>
      <TableCell className="font-medium">
        {isEditing ? (
          <form action={formAction} className="space-y-2">
            <input type="hidden" name="id" value={item.id} />
            <Input name="name" defaultValue={item.name} required onInvalid={setSpanishValidationMessage} onInput={clearSpanishValidationMessage} />
            <Input name="category" defaultValue={item.category ?? ""} onInvalid={setSpanishValidationMessage} onInput={clearSpanishValidationMessage} />
            <Input
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={Number(item.price)}
              required
              onInvalid={setSpanishValidationMessage}
              onInput={clearSpanishValidationMessage}
            />
            <textarea
              name="description"
              defaultValue={item.description ?? ""}
              rows={2}
              onInvalid={setSpanishValidationMessage}
              onInput={clearSpanishValidationMessage}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={item.active} className="size-4 rounded border-input" />
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
          <div className="space-y-1">
            <p>{item.name}</p>
            {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
          </div>
        )}
      </TableCell>
      <TableCell>{item.category ?? "-"}</TableCell>
      <TableCell>L {Number(item.price).toFixed(2)}</TableCell>
      <TableCell>
        <Badge variant={item.active ? "default" : "secondary"}>{item.active ? "Activo" : "Inactivo"}</Badge>
      </TableCell>
      <TableCell className="w-[110px]">
        {!isEditing ? (
          <Button type="button" size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            <Pencil />
            Editar
          </Button>
        ) : (
          <Button type="button" size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
            <X />
            Cerrar
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

export function MenuTable({ items }: { items: MenuItem[] }) {
  if (items.length === 0) return <p className="mt-4 text-neutral-500">No hay items en el menú.</p>;

  return (
    <div className="mt-4 overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Platillo</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <EditableMenuRow key={item.id} item={item} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
