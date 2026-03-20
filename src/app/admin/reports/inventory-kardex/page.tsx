import { getInventoryKardex } from "@/services/reports";
import { getIngredients } from "@/services/inventory";

export default async function InventoryKardexPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; ingredientId?: string }>;
}) {
  const params = await searchParams;
  const from = params.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const to = params.to ?? new Date().toISOString().slice(0, 10);
  const movements = await getInventoryKardex({
    from: from + "T00:00:00",
    to: to + "T23:59:59",
    ingredientId: params.ingredientId || undefined,
  });
  const ingredients = await getIngredients(true);

  return (
    <div>
      <h1 className="text-2xl font-bold">Kardex de inventario</h1>
      <p className="mt-1 text-neutral-600">Movimientos por período.</p>
      <form className="mt-4 flex flex-wrap gap-2">
        <input type="date" name="from" defaultValue={from} className="rounded border px-2 py-1" />
        <input type="date" name="to" defaultValue={to} className="rounded border px-2 py-1" />
        <select name="ingredientId" className="rounded border px-2 py-1">
          <option value="">Todos</option>
          {ingredients.map((i) => (
            <option key={i.id} value={i.id}>{i.name}</option>
          ))}
        </select>
        <button type="submit" className="rounded bg-neutral-800 px-3 py-1 text-white">Filtrar</button>
      </form>
      <div className="mt-4 overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-neutral-50">
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Ingrediente</th>
              <th className="p-2 text-left">Tipo</th>
              <th className="p-2 text-right">Cantidad</th>
              <th className="p-2 text-left">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m: { id: string; created_at: string; movement_type: string; quantity: number; reason: string | null; ingredient?: { name: string } }) => (
              <tr key={m.id} className="border-b last:border-0">
                <td className="p-2">{new Date(m.created_at).toLocaleString("es-HN")}</td>
                <td className="p-2">{(m.ingredient as { name: string })?.name ?? "—"}</td>
                <td className="p-2">{m.movement_type}</td>
                <td className="p-2 text-right">{Number(m.quantity)}</td>
                <td className="p-2">{m.reason ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
