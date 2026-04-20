"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { createMenuItem, type MenuItemFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";
import { DESCRIPTION_MAX_LENGTH, NAME_MAX_LENGTH } from "@/lib/field-rules";
import { ToastNotification } from "@/components/ui/toast-notification";

const CATEGORIES = ["Baleadas", "Bebidas", "Burritas", "Desayunos", "Almuerzos"];

function NativeStyleTooltip({ message }: { message: string }) {
  return (
    <div className="absolute z-50 flex flex-col items-start -bottom-[38px] left-6 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
      <div className="ml-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-white drop-shadow-[0_-1px_1px_rgba(0,0,0,0.1)]" />
      <div className="bg-white border border-[#bcbcbc] shadow-[2px_2px_4px_rgba(0,0,0,0.2)] rounded-[2px] px-2 py-1.5 flex items-center gap-2 min-w-max">
        <div className="bg-[#ff9900] text-white flex items-center justify-center w-[18px] h-[18px] rounded-[1px] font-black text-[14px] leading-none">
          !
        </div>
        <span className="text-[13px] text-[#333] font-normal leading-none">{message}</span>
      </div>
    </div>
  );
}

export function CreateMenuItemForm() {
  const [state, formAction] = useActionState(createMenuItem, null as MenuItemFormState);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [errors, setErrors] = useState({
    name: false,
    category: false,
    price: false,
  });

  const [toastKey, setToastKey] = useState(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (state?.success) {
      setToastMsg(state.success);
      setToastKey(k => k + 1);
      formRef.current?.reset();
    }
  }, [state]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const nameRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/;
    const isNameInvalid = !name.trim() || !nameRegex.test(name);

    const newErrors = {
      name: isNameInvalid,
      category: !formData.get("category"),
      price: !formData.get("price") || parseFloat(formData.get("price") as string) <= 0,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(v => v)) {
      e.preventDefault();
      return;
    }
  };

  return (
    <>
      {toastMsg && <ToastNotification key={toastKey} message={toastMsg} onClose={() => setToastMsg(null)} />}

      <div className="max-w-md rounded-md border overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#753B19] text-white font-bold uppercase tracking-wide text-sm"
        >
          <span>🍽️ Nuevo platillo</span>
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>

        {open && (
          <div className="bg-white p-4">
            <p className="text-sm text-muted-foreground mb-4">
              Registra los productos que aparecerán disponibles para tomar pedidos.
            </p>

            <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2 relative">
                <Label htmlFor="menu-name" className="font-semibold">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="menu-name"
                  name="name"
                  maxLength={NAME_MAX_LENGTH}
                  placeholder="Baleada sencilla"
                  onChange={() => setErrors(prev => ({ ...prev, name: false }))}
                  className="focus-visible:ring-[#753B19]"
                />
                {errors.name && <NativeStyleTooltip message="El platillo solo puede contener letras y números." />}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="menu-category" className="font-semibold">
                  Categoría <span className="text-red-500">*</span>
                </Label>
                <select
                  id="menu-category"
                  name="category"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#753B19]"
                  defaultValue=""
                  onChange={() => setErrors(prev => ({ ...prev, category: false }))}
                >
                  <option value="" disabled>— Selecciona una categoría —</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <NativeStyleTooltip message="Selecciona una categoría" />}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="menu-price" className="font-semibold">
                  Precio <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">L.</span>
                  <Input
                    id="menu-price"
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-8 focus-visible:ring-[#753B19]"
                    onChange={() => setErrors(prev => ({ ...prev, price: false }))}
                  />
                </div>
                {errors.price && <NativeStyleTooltip message="Ingresa un precio válido" />}
              </div>

              <div className="space-y-2">
                <Label htmlFor="menu-description" className="font-semibold">Descripción</Label>
                <textarea
                  id="menu-description"
                  name="description"
                  rows={3}
                  maxLength={DESCRIPTION_MAX_LENGTH}
                  placeholder="Describe el platillo (opcional)"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#753B19]"
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" name="active" defaultChecked className="size-4 rounded border-input" />
                Disponible para pedidos
              </label>

              {state?.error && <p className="text-sm text-destructive font-medium">{state.error}</p>}

              <Button type="submit" className="w-full bg-[#f5bf56] hover:bg-[#F1B53E] text-[#753B19] font-semibold">
                Guardar platillo
              </Button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}