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
import type { MenuItem } from "@/types";
import { Pencil } from "lucide-react";
import { useActionState, useState, useEffect } from "react";
import { updateMenuItem, type MenuItemFormState } from "./actions";

const CATEGORIES = ["Almuerzos", "Desayunos", "Bebidas", "Burritas", "Baleadas"];

function EditableMenuRow({ item, canEdit }: { item: MenuItem; canEdit: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description ?? "");
  const [active, setActive] = useState<boolean>(item.active);
  const [price, setPrice] = useState(String(Number(item.price)));
  const [category, setCategory] = useState(item.category ?? "");
  const [state, formAction] = useActionState(updateMenuItem, null as MenuItemFormState);

  // Este cierra el editor cuando se guarda
  useEffect(() => {
    if (state?.success) {
      setEditKey(k => k + 1);
      setIsEditing(false);
    }
  }, [state?.success]);

  // Este sincroniza los valores cuando el item cambia desde el servidor
  useEffect(() => {
    setName(item.name);
    setDescription(item.description ?? "");
    setCategory(item.category ?? "");
    setPrice(String(Number(item.price)));
    setActive(item.active);
  }, [item]);

  function openEdit() {
    setEditKey(k => k + 1);
    setActive(item.active);
    setPrice(String(Number(item.price)));
    setName(item.name);
    setDescription(item.description ?? "");
    setCategory(item.category ?? "");
    setIsEditing(true);
  }

  return (
    <TableRow>
      {/* PLATILLO */}
      <TableCell className="font-medium">
        {isEditing ? (
          <div className="space-y-2 py-3" key={editKey}>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground w-20 shrink-0">Nombre</label>
              <Input name="name" form={`edit-${item.id}`}
                value={name} onChange={e => setName(e.target.value)}
                required className="h-8 w-[32rem] text-sm"
                onInvalid={setSpanishValidationMessage} onInput={clearSpanishValidationMessage}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground w-20 shrink-0">Descripción</label>
              <Input name="description" form={`edit-${item.id}`}
                value={description} onChange={e => setDescription(e.target.value)}
                className="h-8 w-[32rem] text-sm"
                onInvalid={setSpanishValidationMessage} onInput={clearSpanishValidationMessage}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <p>{item.name}</p>
            {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
          </div>
        )}
      </TableCell>

      {/* CATEGORÍA */}
      <TableCell>
        {isEditing ? (
          <div className="flex justify-center" key={editKey}>
            <select name="category" form={`edit-${item.id}`}
              value={category} onChange={e => setCategory(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none transition focus-visible:border-ring"
            >
              <option value="">— Selecciona una categoría —</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        ) : (
          item.category ?? "-"
        )}
      </TableCell>

      {/* PRECIO */}
      <TableCell>
        {isEditing ? (
          <div className="flex justify-center" key={editKey}>
            <Input
              name="price"
              form={`edit-${item.id}`}
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
              className="h-8 w-24 text-sm"
              onInvalid={setSpanishValidationMessage}
              onInput={clearSpanishValidationMessage}
            />
          </div>
        ) : (
          `L ${Number(item.price).toFixed(2)}`
        )}
      </TableCell>

      {/* ESTADO */}
      <TableCell>
        {isEditing ? (
          <div className="flex justify-center">
            {/* Un solo hidden input que refleja el estado actual */}
            <input type="hidden" name="active" value={active ? "true" : "false"} form={`edit-${item.id}`} />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={e => setActive(e.target.checked)}
                className="size-4 rounded border-input cursor-pointer"
              />
              Activo
            </label>
          </div>
        ) : (
          <Badge variant={item.active ? "default" : "secondary"}>
            {item.active ? "Activo" : "Inactivo"}
          </Badge>
        )}
      </TableCell>

      {/* ACCIÓN */}
      <TableCell className="w-[160px]">
        {!canEdit ? (
          <span className="text-sm text-muted-foreground">Solo lectura</span>
        ) : isEditing ? (
          <div className="flex flex-col items-center gap-2">
            <form id={`edit-${item.id}`} action={formAction}>
              <input type="hidden" name="id" defaultValue={item.id} />
            </form>
            {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
            {state?.success && <p className="text-xs font-medium text-brand-green">{state.success}</p>}
            <div className="flex gap-1">
              <Button type="submit" form={`edit-${item.id}`} size="sm"
                className="bg-[#588f3d] hover:bg-[#4a7a33] text-white border-0">
                Guardar
              </Button>
              <Button type="button" size="sm"
                className="bg-[#CD6633] hover:bg-[#b85a2d] text-white border-0"
                onClick={() => setIsEditing(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" size="sm" variant="outline" onClick={openEdit}>
            <Pencil />
            Editar
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

export function MenuTable({ items, canEdit = true }: { items: MenuItem[]; canEdit?: boolean }) {
  if (items.length === 0) return <p className="mt-4 text-neutral-500">No hay items en el menu.</p>;

  return (
    <div className="mt-4 overflow-x-auto rounded-md border">
      <Table>
        <colgroup>
          <col className="w-[40%]" />
          <col className="w-[18%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
        </colgroup>
        <TableHeader>
          <TableRow className="bg-[#753B19] hover:bg-[#753B19]">
            <TableHead className="text-white font-bold uppercase tracking-wide text-center">Platillo</TableHead>
            <TableHead className="text-white font-bold uppercase tracking-wide text-center">Categoría</TableHead>
            <TableHead className="text-white font-bold uppercase tracking-wide text-center">Precio</TableHead>
            <TableHead className="text-white font-bold uppercase tracking-wide text-center">Estado</TableHead>
            <TableHead className="text-white font-bold uppercase tracking-wide text-center">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white">
          {items.map((item) => (
            <EditableMenuRow key={item.id} item={item} canEdit={canEdit} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}