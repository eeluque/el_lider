"use client";

import { useActionState, useState, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MenuItem } from "@/types";
import { createManualOrder, type ManualOrderFormState } from "./actions";

type OrderLine = { id: number; menuItemId: string; quantity: number };
const EMPTY_LINE: OrderLine = { id: Date.now(), menuItemId: "", quantity: 1 };

function NativeStyleTooltip({ message }: { message: string }) {
  return (
    <div className="absolute z-50 flex flex-col items-start -bottom-[38px] left-6 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
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

export function CreateManualOrderForm({ menuItems }: { menuItems: MenuItem[] }) {
  const [state, formAction] = useActionState(createManualOrder, null as ManualOrderFormState);
  const [lines, setLines] = useState<OrderLine[]>([EMPTY_LINE]);
  const formRef = useRef<HTMLFormElement>(null);

  const [phoneValue, setPhoneValue] = useState("");
  const [errors, setErrors] = useState({ customerName: "", customerPhone: "" });

  const total = lines.reduce((sum, line) => {
    const item = menuItems.find((m) => m.id === line.menuItemId);
    return item ? sum + Number(item.price) * (line.quantity || 0) : sum;
  }, 0);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 8) val = val.slice(0, 8);
    let formatted = val.length > 4 ? `${val.slice(0, 4)}-${val.slice(4)}` : val;
    setPhoneValue(formatted);
    setErrors(prev => ({ ...prev, customerPhone: "" }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const name = formData.get("customerName") as string;
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    const newErrors = {
      customerName: !name.trim() 
        ? "El campo es obligatorio" 
        : (!nameRegex.test(name) ? "El nombre solo puede contener letras" : ""),
      customerPhone: !phoneValue.trim() 
        ? "Este campo es obligatorio" 
        : (phoneValue.length < 9 ? "Ingresa un teléfono válido" : ""),
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some(msg => msg !== "")) {
      e.preventDefault();
    }
  };

  const updateLine = (id: number, patch: Partial<OrderLine>) => {
    setLines((curr) => curr.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  return (
    <div className="space-y-4">
      <div className="mb-8">
        <h1 className="outfit font-serif text-3xl font-bold text-foreground">Registrar Pedido</h1>
        <p className="text-muted-foreground">Captura pedidos de WhatsApp, llamadas o presenciales.</p>
      </div>

      <div className="rounded-md border overflow-hidden shadow-sm">
        <div className="bg-[#753B19] px-4 py-3">
          <span className="text-white font-bold uppercase tracking-wide text-sm">Detalle del pedido</span>
        </div>

        <div className="bg-white p-6">
          <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="space-y-6" noValidate>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 relative">
                <Label htmlFor="customerName" className="font-semibold">Nombre del cliente *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  placeholder="Ej. Armando Mendoza"
                  onChange={() => setErrors(prev => ({ ...prev, customerName: "" }))}
                  className="focus-visible:ring-[#753B19]"
                />
                {errors.customerName && <NativeStyleTooltip message={errors.customerName} />}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="customerPhone" className="font-semibold">Teléfono *</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  value={phoneValue}
                  onChange={handlePhoneChange}
                  placeholder="0000-0000"
                  className="focus-visible:ring-[#753B19]"
                />
                {errors.customerPhone && <NativeStyleTooltip message={errors.customerPhone} />}
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-[#753B19] uppercase text-xs tracking-wider">Productos</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => setLines([...lines, { id: Date.now(), menuItemId: "", quantity: 1 }])} className="border-[#753B19] text-[#753B19] font-bold">
                  <Plus className="size-4 mr-1" /> Agregar línea
                </Button>
              </div>

              {lines.map((line, idx) => (
                <div key={line.id} className="flex gap-3 items-end bg-muted/20 p-3 rounded-lg border border-dashed">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs">Platillo #{idx + 1}</Label>
                    <select
                      name={`itemId-${line.id}`}
                      required
                      value={line.menuItemId}
                      onChange={(e) => updateLine(line.id, { menuItemId: e.target.value })}
                      className="w-full h-10 rounded-md border border-input bg-white px-3 text-sm focus:ring-2 focus:ring-[#753B19]/50 outline-none"
                    >
                      <option value="">Seleccionar...</option>
                      {menuItems.map((m) => (
                        <option key={m.id} value={m.id}>{m.name} - L. {Number(m.price).toFixed(2)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-24 space-y-2">
                    <Label className="text-xs">Cant.</Label>
                    <Input
                      name={`quantity-${line.id}`}
                      type="number"
                      min="1"
                      required
                      value={line.quantity}
                      onChange={(e) => updateLine(line.id, { quantity: e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)) })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={lines.length === 1}
                    onClick={() => setLines(lines.filter(l => l.id !== line.id))}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-5" />
                  </Button>
                </div>
              ))}
              <input type="hidden" name="lineIds" value={lines.map(l => l.id).join(",")} />
            </div>

            <div className="flex items-center justify-between py-3 border-t border-b border-dashed border-[#753B19]/20">
              <span className="text-muted-foreground font-medium italic">Total estimado</span>
              <span className="text-2xl font-bold text-[#753B19] column-money-amount">
                L {total.toFixed(2)}
              </span>
            </div>

            {state?.error && <p className="text-sm text-destructive font-bold">{state.error}</p>}
            {state?.success && <p className="text-sm font-bold text-green-600">{state.success}</p>}

            <Button type="submit" className="w-full bg-[#F1B53E] hover:bg-[#d9a337] text-[#753B19] font-bold h-12 text-lg">
              Registrar pedido
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}