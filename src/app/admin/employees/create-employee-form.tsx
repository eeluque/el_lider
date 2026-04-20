"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { createEmployee, type CreateEmployeeState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PASSWORD_MIN_LENGTH } from "@/lib/field-rules";
import { ToastNotification } from "@/components/ui/toast-notification";

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

export function CreateEmployeeForm() {
  const [state, formAction] = useActionState(createEmployee, null as CreateEmployeeState);
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [phoneValue, setPhoneValue] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
  });

  useEffect(() => {
    if (state?.success) {
      setToast(state.success);
      // Resetea el form al guardar exitosamente
      formRef.current?.reset();
      setPhoneValue("");
    }
  }, [state?.success]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 8) val = val.slice(0, 8);
    let formatted = val;
    if (val.length > 4) formatted = `${val.slice(0, 4)}-${val.slice(4)}`;
    setPhoneValue(formatted);
    setErrors(prev => ({ ...prev, phone: "" }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const phone = phoneValue;

    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

    const newErrors = {
      email: !email.trim()
        ? "El campo es obligatorio"
        : (!email.includes("@") ? "Ingresa un correo válido" : ""),
      password: !password
        ? "El campo es obligatorio"
        : (password.length < PASSWORD_MIN_LENGTH ? `Mínimo ${PASSWORD_MIN_LENGTH} caracteres` : ""),
      fullName: !fullName.trim()
        ? "El campo es obligatorio"
        : (!nameRegex.test(fullName) ? "Solo se permiten letras" : ""),
      phone: !phone.trim()
        ? "Este campo es obligatorio"
        : (phone.length < 9 ? "Ingresa un teléfono válido" : ""),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(msg => msg !== "")) {
      e.preventDefault();
      return;
    }
  };

  return (
    <>
      {toast && <ToastNotification message={toast} onClose={() => setToast(null)} />}

      <div className="max-w-md rounded-md border overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#753B19] text-white font-bold uppercase tracking-wide text-sm"
        >
          <span>Nuevo empleado</span>
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>

        {open && (
          <div className="bg-white p-4">
            <p className="text-sm text-muted-foreground mb-4">Crea una cuenta con rol empleado.</p>

            <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="space-y-4" noValidate>

              <div className="space-y-2 relative">
                <Label htmlFor="emp-fullName" className="font-semibold">
                  Nombre completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="emp-fullName"
                  name="fullName"
                  placeholder="Nombres y apellidos"
                  onChange={() => setErrors(prev => ({ ...prev, fullName: "" }))}
                  className="focus-visible:ring-[#753B19]"
                />
                {errors.fullName && <NativeStyleTooltip message={errors.fullName} />}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="emp-phone" className="font-semibold">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="emp-phone"
                  name="phone"
                  type="text"
                  value={phoneValue}
                  onChange={handlePhoneChange}
                  placeholder="9999-9999"
                  className="focus-visible:ring-[#753B19]"
                />
                {errors.phone && <NativeStyleTooltip message={errors.phone} />}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="emp-email" className="font-semibold">
                  Correo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="emp-email"
                  name="email"
                  type="email"
                  placeholder="example@dominio.com"
                  onChange={() => setErrors(prev => ({ ...prev, email: "" }))}
                  className="focus-visible:ring-[#753B19]"
                />
                {errors.email && <NativeStyleTooltip message={errors.email} />}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="emp-password" className="font-semibold">
                  Contraseña <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="emp-password"
                  name="password"
                  type="password"
                  placeholder="********"
                  onChange={() => setErrors(prev => ({ ...prev, password: "" }))}
                  className="focus-visible:ring-[#753B19]"
                />
                {errors.password && <NativeStyleTooltip message={errors.password} />}
              </div>

              {state?.error && <p className="text-sm text-destructive font-medium">{state.error}</p>}

              <Button type="submit" className="w-full bg-[#F1B53E] hover:bg-[#d9a337] text-[#753B19] font-bold mt-5">
                Crear empleado
              </Button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}