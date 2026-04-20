"use client";

import { useActionState, useState, useRef } from "react";
import { createIngredient, type InventoryFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH, UNIT_MAX_LENGTH } from "@/lib/field-rules";

// Componente de Tooltip estandarizado
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

export function CreateIngredientForm({ units = [] }: { units: string[] }) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, formAction] = useActionState(createIngredient, null as InventoryFormState);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const newErrors: Record<string, string> = {};

    if (!formData.get("name")) newErrors.name = "El nombre es obligatorio";
    if (!formData.get("unit")) newErrors.unit = "La unidad es obligatoria";
    if (!formData.get("currentStock")) newErrors.currentStock = "Ingrese un stock actual";
    if (!formData.get("minimumStock")) newErrors.minimumStock = "Ingrese un stock mínimo";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) e.preventDefault();
  };

  return (
    <div className="w-full flex flex-col">
      <button type="button" onClick={() => setOpen(!open)} className={`w-full h-[48px] flex items-center justify-between px-4 bg-[#753B19] text-white font-bold uppercase tracking-wide text-sm transition-all ${open ? "rounded-t-md" : "rounded-md shadow-sm"}`}>
        <span className="flex items-center gap-2">🧀 NUEVO INGREDIENTE</span>
        {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>

      {open && (
        <div className="bg-white p-4 border-x border-b border-neutral-200 rounded-b-md shadow-sm flex-grow flex flex-col justify-between">
          <form action={formAction} onSubmit={handleSubmit} className="space-y-3" noValidate>
            <p className="text-[13px] text-neutral-600 mb-2">Registra insumos y niveles de alerta.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 relative">
                <Label className="text-xs font-bold text-neutral-700">Nombre <span className="text-red-500">*</span></Label>
                <Input name="name" className="h-9 focus-visible:ring-[#753B19]" onChange={() => setErrors(p => ({...p, name: ""}))} />
                {errors.name && <NativeStyleTooltip message={errors.name} />}
              </div>
              <div className="space-y-1 relative">
                <div className="space-y-1 relative">
                  <Label className="text-xs font-bold text-neutral-700">Unidad <span className="text-red-500">*</span></Label>
                  <select
                    name="unit"
                    onChange={() => setErrors(p => ({...p, unit: ""}))}
                    className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition focus-visible:border-[#753B19] focus-visible:ring-2 focus-visible:ring-[#753B19]/30"
                  >
                    <option value="">Selecciona una unidad</option>
                    {units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  {errors.unit && <NativeStyleTooltip message={errors.unit} />}
                </div>
                {errors.unit && <NativeStyleTooltip message={errors.unit} />}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 relative">
                <Label className="text-xs font-bold text-neutral-700">Stock actual <span className="text-red-500">*</span></Label>
                <Input name="currentStock" type="number" className="h-9 focus-visible:ring-[#753B19]" onChange={() => setErrors(p => ({...p, currentStock: ""}))} />
                {errors.currentStock && <NativeStyleTooltip message={errors.currentStock} />}
              </div>
              <div className="space-y-1 relative">
                <Label className="text-xs font-bold text-neutral-700">Stock mínimo <span className="text-red-500">*</span></Label>
                <Input name="minimumStock" type="number" className="h-9 focus-visible:ring-[#753B19]" onChange={() => setErrors(p => ({...p, minimumStock: ""}))} />
                {errors.minimumStock && <NativeStyleTooltip message={errors.minimumStock} />}
              </div>
            </div>
            
            {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
            {state?.success && <p className="text-sm text-green-600">{state.success}</p>}
            <Button type="submit" className="w-full bg-[#f5bf56] hover:bg-[#F1B53E] text-[#753B19] font-semibold h-10 mt-5">Guardar ingrediente</Button>
          </form>
        </div>
      )}
    </div>
  );
}