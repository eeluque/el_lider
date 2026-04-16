"use client";

import { useActionState, useState, useRef } from "react";
import { registerInventoryMovement, type InventoryFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DESCRIPTION_MAX_LENGTH } from "@/lib/field-rules";
import type { Ingredient } from "@/types";

// Tooltip estandarizado
function NativeStyleTooltip({ message }: { message: string }) {
  return (
    <div className="absolute z-50 flex flex-col items-start -bottom-[32px] left-8 pointer-events-none animate-in fade-in slide-in-from-top-1 duration-150">
      <div className="ml-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-white drop-shadow-[0_-1px_1px_rgba(0,0,0,0.1)]" />
      <div className="bg-white border border-[#bcbcbc] shadow-[2px_2px_4px_rgba(0,0,0,0.2)] rounded-[2px] px-2 py-1 flex items-center gap-2 min-w-max">
        <div className="bg-[#ff9900] text-white flex items-center justify-center w-[16px] h-[16px] rounded-[1px] font-black text-[12px] leading-none">
          !
        </div>
        <span className="text-[12px] text-[#333] font-normal leading-none">
          {message}
        </span>
      </div>
    </div>
  );
}

export function InventoryMovementForm({ ingredients }: { ingredients: any[] }) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};

    if (!formData.get("ingredientId")) newErrors.ingredientId = "Selecciona un insumo";
    if (!formData.get("movementType")) newErrors.movementType = "Selecciona tipo de movimiento";
    if (!formData.get("quantity")) newErrors.quantity = "Ingresa una cantidad válida";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) e.preventDefault();
  };

  return (
    <div className="w-full flex flex-col">
      <button type="button" onClick={() => setOpen(!open)} className={`w-full h-[48px] flex items-center justify-between px-4 bg-[#753B19] text-white font-bold uppercase tracking-wide text-sm transition-all ${open ? "rounded-t-md" : "rounded-md shadow-sm"}`}>
        <span className="flex items-center gap-2">📦 NUEVO MOVIMIENTO</span>
        {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>

      {open && (
        <div className="bg-white p-4 border-x border-b border-neutral-200 rounded-b-md shadow-sm flex-grow flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="space-y-3" noValidate>
            <p className="text-[13px] text-neutral-600 mb-2">Gestiona entradas, salidas o ajustes de stock.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 relative">
                <Label className="text-xs font-bold text-neutral-700">Insumo <span className="text-red-500">*</span></Label>
                <select name="ingredientId" defaultValue="" className="h-9 w-full rounded-md border border-input px-3 text-sm outline-none focus:ring-2 focus:ring-[#753B19]" onChange={() => setErrors(p => ({...p, ingredientId: ""}))}>
                  <option value="" disabled>Selecciona un insumo</option>
                  {ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                {errors.ingredientId && <NativeStyleTooltip message={errors.ingredientId} />}
              </div>
              <div className="space-y-1 relative">
                <Label className="text-xs font-bold text-neutral-700">Tipo de movimiento <span className="text-red-500">*</span></Label>
                <select name="movementType" defaultValue="" className="h-9 w-full rounded-md border border-input px-3 text-sm outline-none focus:ring-2 focus:ring-[#753B19]" onChange={() => setErrors(p => ({...p, movementType: ""}))}>
                  <option value="" disabled>Selecciona tipo</option>
                  <option value="IN">Entrada</option>
                  <option value="OUT">Salida</option>
                  <option value="ADJUSTMENT">Ajuste</option>
                </select>
                {errors.movementType && <NativeStyleTooltip message={errors.movementType} />}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 relative">
                <Label className="text-xs font-bold text-neutral-700">Cantidad <span className="text-red-500">*</span></Label>
                <Input 
                  name="quantity" 
                  type="number" 
                  step="1" 
                  onKeyDown={(e) => { if (e.key === '.' || e.key === ',') e.preventDefault(); }} 
                  placeholder="0"
                  className="h-9 focus-visible:ring-[#753B19]" 
                  onChange={() => setErrors(p => ({...p, quantity: ""}))} 
                />
                {errors.quantity && <NativeStyleTooltip message={errors.quantity} />}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-neutral-700">Motivo</Label>
                <Input name="reason" placeholder="Ej. Compra semanal" className="h-9 focus-visible:ring-[#753B19]" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#f5bf56] hover:bg-[#F1B53E] text-[#753B19] font-semibold h-10 mt-5">Guardar movimiento</Button>
          </form>
        </div>
      )}
    </div>
  );
}