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
import type { MenuItem } from "@/types";
import { Pencil } from "lucide-react";
import { useActionState, useState, useEffect } from "react";
import { updateMenuItem, type MenuItemFormState } from "./actions";

const CATEGORIES = ["Almuerzos", "Desayunos", "Bebidas", "Burritas", "Baleadas"];

// El componente de globito que ya usas en el create form
function NativeStyleTooltip({ message }: { message: string }) {
  return (
    <div className="absolute z-50 flex flex-col items-start -bottom-[38px] left-25 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
      <div className="ml-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-white drop-shadow-[0_-1px_1px_rgba(0,0,0,0.1)]" />
      <div className="bg-white border border-[#bcbcbc] shadow-[2px_2px_4px_rgba(0,0,0,0.2)] rounded-[2px] px-2 py-1.5 flex items-center gap-2 min-w-max">
        <div className="bg-[#ff9900] text-white flex items-center justify-center w-[18px] h-[18px] rounded-[1px] font-black text-[14px] leading-none">
          !
        </div>
        <span className="text-[13px] text-[#333] font-normal leading-none">
          {message}
        </span>
      </div>
    </div>
  );
}

function EditableMenuRow({ item, canEdit }: { item: MenuItem; canEdit: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editKey, setEditKey] = useState(0);
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description ?? "");
  const [active, setActive] = useState<boolean>(item.active);
  const [price, setPrice] = useState(String(Number(item.price)));
  const [category, setCategory] = useState(item.category ?? "");
  
  // Estado para los errores múltiples
  const [errors, setErrors] = useState({
    name: false,
    category: false,
    price: false
  });

  const [state, formAction] = useActionState(updateMenuItem, null as MenuItemFormState);

  useEffect(() => {
    if (state?.success) {
      setEditKey(k => k + 1);
      setIsEditing(false);
      setErrors({ name: false, category: false, price: false });
    }
  }, [state?.success]);

  useEffect(() => {
    setName(item.name);
    setDescription(item.description ?? "");
    setCategory(item.category ?? "");
    setPrice(String(Number(item.price)));
    setActive(item.active);
  }, [item]);

  // Manejador del envío para validar ANTES de ir al server action
  const handleLocalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const newErrors = {
      name: !name.trim(),
      category: !category || category === "",
      // Si está vacío o es 0/negativo, pedimos que sea obligatorio/válido
      price: !price || parseFloat(price) <= 0
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(v => v)) {
      e.preventDefault();
      return;
    }
  };

  function openEdit() {
    setEditKey(k => k + 1);
    setErrors({ name: false, category: false, price: false });
    setIsEditing(true);
  }

  return (
    <TableRow>
      {/* PLATILLO */}
      <TableCell className="font-medium">
        {isEditing ? (
          <div className="space-y-2 py-3" key={editKey}>
            <div className="flex items-center gap-2 relative">
              <label className="text-xs font-medium text-muted-foreground w-20 shrink-0">Nombre</label>
              <Input 
                name="name" 
                form={`edit-${item.id}`}
                value={name} 
                onChange={e => { setName(e.target.value); setErrors(p => ({...p, name: false})) }}
                className="h-8 w-[32rem] text-sm focus-visible:ring-[#753B19]"
              />
              {errors.name && <NativeStyleTooltip message="El nombre es obligatorio" />}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground w-20 shrink-0">Descripción</label>
              <Input 
                name="description" 
                form={`edit-${item.id}`}
                value={description} 
                onChange={e => setDescription(e.target.value)}
                className="h-8 w-[32rem] text-sm focus-visible:ring-[#753B19]"
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
          <div className="flex justify-center relative" key={editKey}>
            <select 
              name="category" 
              form={`edit-${item.id}`}
              value={category} 
              onChange={e => { setCategory(e.target.value); setErrors(p => ({...p, category: false})) }}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[#753B19]"
            >
              <option value="" disabled>— Selecciona una categoría —</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <NativeStyleTooltip message="Selecciona una categoría" />}
          </div>
        ) : (
          item.category ?? "-"
        )}
      </TableCell>

      {/* PRECIO */}
      <TableCell>
    {isEditing ? (
      <div className="flex justify-center relative" key={editKey}>
        <Input
          name="price"
          form={`edit-${item.id}`}
          type="number"
          step="0.01"
          value={price}
          onChange={e => { setPrice(e.target.value); setErrors(p => ({...p, price: false})) }}
          className="h-8 w-24 text-sm focus-visible:ring-[#753B19]"
        />
        {errors.price && <NativeStyleTooltip message="El precio es obligatorio" />}
      </div>
    ) : (
      `L ${Number(item.price).toFixed(2)}`
    )}
  </TableCell>

      {/* ESTADO */}
      <TableCell>
        {isEditing ? (
          <div className="flex justify-center">
            <input type="hidden" name="active" value={active ? "true" : "false"} form={`edit-${item.id}`} />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={e => setActive(e.target.checked)}
                className="size-4 rounded border-input cursor-pointer accent-[#753B19]"
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
            {/* AQUÍ ESTÁ EL TRUCO: El form tiene el handleLocalSubmit */}
            <form id={`edit-${item.id}`} action={formAction} onSubmit={handleLocalSubmit} noValidate>
              <input type="hidden" name="id" defaultValue={item.id} />
            </form>
            {state?.error && <p className="text-xs text-destructive font-bold">{state.error}</p>}
            <div className="flex gap-1">
              <Button type="submit" form={`edit-${item.id}`} size="sm"
                className="bg-[#588f3d] hover:bg-[#4a7a33] text-white border-0 font-bold">
                Guardar
              </Button>
              <Button type="button" size="sm"
                className="bg-[#CD6633] hover:bg-[#b85a2d] text-white border-0 font-bold"
                onClick={() => setIsEditing(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <Button type="button" size="sm" variant="outline" onClick={openEdit}>
            <Pencil className="size-4 mr-1" />
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