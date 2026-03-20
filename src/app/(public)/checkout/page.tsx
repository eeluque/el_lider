import { CheckoutForm } from "./checkout-form";

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Completar pedido</h1>
      <p className="mt-1 text-neutral-600">Datos de contacto y confirmación.</p>
      <CheckoutForm />
    </div>
  );
}
