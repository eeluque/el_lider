"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setSpanishValidationMessage, validateSpanishOnInput } from "@/lib/form-validation";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PHONE_MAX_LENGTH,
  PHONE_MIN_LENGTH,
  PHONE_PATTERN,
} from "@/lib/field-rules";
import type { MenuItem } from "@/types";
import { createManualOrder, type ManualOrderFormState } from "./actions";

type OrderLine = { id: number; menuItemId: string; quantity: number };

const EMPTY_LINE: OrderLine = { id: 1, menuItemId: "", quantity: 1 };

export function CreateManualOrderForm({ menuItems }: { menuItems: MenuItem[] }) {
  const [state, formAction] = useActionState(createManualOrder, null as ManualOrderFormState);
  const [lines, setLines] = useState<OrderLine[]>([EMPTY_LINE]);

  const total = lines.reduce((sum, line) => {
    const item = menuItems.find((menuItem) => menuItem.id === line.menuItemId);
    if (!item) return sum;
    return sum + Number(item.price) * line.quantity;
  }, 0);

  function updateLine(id: number, patch: Partial<OrderLine>) {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  }

  function addLine() {
    setLines((current) => [
      ...current,
      { id: current[current.length - 1]?.id ? current[current.length - 1].id + 1 : 1, menuItemId: "", quantity: 1 },
    ]);
  }

  function removeLine(id: number) {
    setLines((current) => (current.length === 1 ? current : current.filter((line) => line.id !== id)));
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="outfit font-serif text-3xl font-bold text-foreground">Registrar Pedido</h1>
        <p className="outfit font-serif text-lg text-muted-foreground">
          Captura pedidos recibidos por WhatsApp, llamada o atención en el comedor.
        </p>
      </div>

      <div className="rounded-md border overflow-hidden shadow-sm mt-8">
        {/* Header café */}
        <div className="bg-[#753B19] px-4 py-3 flex items-center justify-between">
          <span className="text-white font-bold uppercase tracking-wide text-medium">Detalle del pedido</span>
        </div>

        {/* Contenido */}
        <div className="bg-white p-6">
          <form action={formAction} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="manual-customer-name" className="text-lg">Nombre del cliente *</Label>
                <Input
                  className="h-10 text-lg"
                  id="manual-customer-name"
                  name="customerName"
                  required
                  autoFocus
                  minLength={NAME_MIN_LENGTH}
                  maxLength={NAME_MAX_LENGTH}
                  placeholder="Nombre y/o apellido"
                  onInvalid={setSpanishValidationMessage}
                  onInput={validateSpanishOnInput}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-customer-phone" className="text-lg">Teléfono *</Label>
                <Input
                  className="h-10 text-lg"
                  id="manual-customer-phone"
                  name="customerPhone"
                  type="tel"
                  required
                  inputMode="tel"
                  minLength={PHONE_MIN_LENGTH}
                  maxLength={PHONE_MAX_LENGTH}
                  pattern={PHONE_PATTERN}
                  placeholder="9999-9999"
                  onInvalid={setSpanishValidationMessage}
                  onInput={validateSpanishOnInput}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm"
                  className="font-bold" onClick={addLine}>
                  <Plus />
                  Agregar línea
                </Button>
              </div>
              {lines.map((line, index) => (
                <div key={line.id} className="grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-3 md:grid-cols-[1fr_120px_auto]">
                  <div className="space-y-2">
                    <Label htmlFor={`manual-item-${line.id}`} className="text-base">Platillo #{index + 1}</Label>
                    <select
                      id={`manual-item-${line.id}`}
                      name={`itemId-${line.id}`}
                      required
                      value={line.menuItemId}
                      onChange={(event) => {
                        event.currentTarget.setCustomValidity("");
                        updateLine(line.id, { menuItemId: event.target.value });
                      }}
                      onInvalid={setSpanishValidationMessage}
                      className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-base outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="">Selecciona un platillo</option>
                      {menuItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} - L {Number(item.price).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`manual-quantity-${line.id}`} className="text-base">Cantidad</Label>
                    <Input
                      className="h-10 text-base"
                      id={`manual-quantity-${line.id}`}
                      name={`quantity-${line.id}`}
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={line.quantity}
                      onInvalid={setSpanishValidationMessage}
                      onChange={(event) =>
                        updateLine(line.id, {
                          quantity: Math.max(1, Number(event.target.value || 1)),
                        })
                      }
                      onInput={validateSpanishOnInput}
                    />
                  </div>

                  <div className="flex items-end justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeLine(line.id)}
                      disabled={lines.length === 1}
                      aria-label={`Eliminar línea ${index + 1}`}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}

              <input type="hidden" name="lineIds" value={lines.map((line) => line.id).join(",")} />
            </div>

            <div className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-lg font-bold text-foreground">Total estimado</span>
                <span className="text-lg font-semibold column-money-amount">L. {total.toFixed(2)}</span>
              </div>
            </div>

            {state?.error && <p className="text-base text-destructive">{state.error}</p>}
            {state?.success && <p className="text-base font-xl text-brand-green">{state.success}</p>}

            <Button type="submit" size="lg" className="bg-[#588f3b] hover:bg-[#4a7a33] text-white border-0">Registrar pedido</Button>
          </form>
        </div>
      </div>
    </div>
  );
}