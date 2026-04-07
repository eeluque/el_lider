"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { submitOrder } from "./actions";
import { CART_STORAGE_KEY, type CartItem } from "@/lib/cart-storage";
import { useCart } from "@/components/cart/cart-context";
import { clearSpanishValidationMessage, setSpanishValidationMessage } from "@/lib/form-validation";

export function CheckoutForm() {
  const { clearCart } = useCart();
  const { data: session, status } = useSession();
  const [cart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = window.sessionStorage.getItem(CART_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ orderNumber: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (cart.length === 0) {
      setError("No hay ítems en el carrito.");
      return;
    }
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("items", JSON.stringify(cart));
    try {
      const res = await submitOrder(formData);
      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }
      if (res.orderNumber) {
        setResult({ orderNumber: res.orderNumber });
        sessionStorage.removeItem(CART_STORAGE_KEY);
        clearCart();
      }
    } catch {
      setError("Error al enviar el pedido.");
    }
    setLoading(false);
  }

  if (cart.length === 0 && !result) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <p className="text-neutral-600">Tu carrito está vacío. Agrega ítems en la página Ordenar.</p>
          <Link href="/order">
            <Button className="mt-4">Ir a ordenar</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (result) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <h3 className="text-lg font-semibold">Pedido registrado</h3>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-600">
            Número de pedido: <strong>{result.orderNumber}</strong>
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Te contactaremos por teléfono. Gracias por tu orden.
          </p>
          <Link href="/order">
            <Button className="mt-4">Hacer otro pedido</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const total = cart.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const defaultName =
    status === "authenticated" && session?.user?.name ? String(session.user.name) : "";
  const isGuest = status !== "authenticated" || session?.user?.role !== "customer";

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <h3 className="font-semibold">Resumen</h3>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          {cart.map((c) => (
            <div key={c.menuItemId} className="flex justify-between">
              <span>{c.name} × {c.quantity}</span>
              <span>L {(c.quantity * c.unitPrice).toFixed(2)}</span>
            </div>
          ))}
          <p className="mt-2 font-medium">Total: L {total.toFixed(2)}</p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="customerName">Nombre *</Label>
        <Input
          id="customerName"
          name="customerName"
          required
          defaultValue={defaultName}
          onInvalid={setSpanishValidationMessage}
          onInput={clearSpanishValidationMessage}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customerPhone">Teléfono *</Label>
        <Input
          id="customerPhone"
          name="customerPhone"
          type="tel"
          required
          onInvalid={setSpanishValidationMessage}
          onInput={clearSpanishValidationMessage}
        />
      </div>
      {isGuest && (
        <p className="text-xs text-neutral-500">
          Pedido como invitado. Si tienes cuenta e inicias sesión, podrás ver el historial.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Enviando..." : "Confirmar pedido"}
      </Button>
    </form>
  );
}
