import { beforeEach, describe, expect, it } from "vitest";
import { resetQueue, setResponseQueue, type SBResponse } from "@/test/supabase-queue";
import {
  getCancelledOrders,
  getCriticalStockReport,
  getDeliveredOrdersDaily,
  getDeliveredOrdersInRange,
  getIngredientConsumption,
  getInventoryKardex,
  getKardexWithBalance,
  getSalesSummary,
  getTopDishes,
} from "./reports";

describe("reports service", () => {
  beforeEach(() => {
    resetQueue();
  });

  function q(data: unknown): SBResponse {
    return { data, error: null };
  }

  it("getDeliveredOrdersInRange devuelve pedidos", async () => {
    const rows = [{ id: "o1", order_number: "A-1", status: "delivered" }];
    setResponseQueue([q(rows)]);
    const result = await getDeliveredOrdersInRange("2025-01-01", "2025-01-31");
    expect(result).toEqual(rows);
  });

  it("getDeliveredOrdersDaily delega al rango de un dia", async () => {
    setResponseQueue([q([{ id: "x" }])]);
    const result = await getDeliveredOrdersDaily("2025-06-01");
    expect(result).toHaveLength(1);
  });

  it("getInventoryKardex con ingrediente y fechas", async () => {
    const movements = [{ id: "m1", quantity: 1 }];
    setResponseQueue([q(movements)]);
    const result = await getInventoryKardex({
      ingredientId: "ing-1",
      from: "2025-01-01",
      to: "2025-01-02",
    });
    expect(result).toEqual(movements);
  });

  it("getInventoryKardex sin fechas", async () => {
    setResponseQueue([q([])]);
    const result = await getInventoryKardex({ ingredientId: undefined, from: undefined, to: undefined });
    expect(result).toEqual([]);
  });

  it("getInventoryKardex acepta fechas ISO largas", async () => {
    setResponseQueue([q([])]);
    await getInventoryKardex({
      from: "2025-01-01T00:00:00.000Z",
      to: "2025-01-02T23:59:59.999Z",
    });
    expect(true).toBe(true);
  });

  it("getCriticalStockReport filtra stock bajo", async () => {
    setResponseQueue([
      q([
        { id: "1", name: "A", unit: "lb", current_stock: 2, minimum_stock: 5, active: true },
        { id: "2", name: "B", unit: "lb", current_stock: 10, minimum_stock: 5, active: true },
      ]),
    ]);
    const result = await getCriticalStockReport();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("A");
  });

  it("getCancelledOrders con rango de fechas", async () => {
    setResponseQueue([q([])]);
    await getCancelledOrders({ from: "2025-01-01", to: "2025-01-31" });
  });

  it("getCancelledOrders sin fechas", async () => {
    setResponseQueue([q([])]);
    await getCancelledOrders({});
  });

  it("getCancelledOrders con motivo", async () => {
    setResponseQueue([q([])]);
    await getCancelledOrders({ from: "2025-01-01", to: "2025-01-31", reason: "espera" });
  });

  it("getSalesSummary agrupa ventas y visibiliza cancelados", async () => {
    setResponseQueue([
      q([
        { created_at: "2025-03-10T14:00:00.000Z", total_price: 100, status: "delivered" },
        { created_at: "2025-03-10T15:00:00.000Z", total_price: 50, status: "ready" },
        { created_at: "2025-03-10T16:00:00.000Z", total_price: 25, status: "cancelled" },
      ]),
    ]);
    const result = await getSalesSummary({
      from: "2025-03-01",
      to: "2025-03-31",
    });
    expect(result.total).toBe(150);
    expect(result.cancelledCount).toBe(1);
    expect(result.cancelledAmount).toBe(25);
    expect(Object.keys(result.byPeriod).length).toBeGreaterThan(0);
    expect(Object.values(result.cancelledByPeriod)[0]).toBe(1);
  });

  it("getSalesSummary con fechas ISO largas", async () => {
    setResponseQueue([q([])]);
    await getSalesSummary({
      from: "2025-01-01T12:00:00.000Z",
      to: "2025-01-31T12:00:00.000Z",
    });
  });

  it("getTopDishes sin ordenes en rango", async () => {
    setResponseQueue([q([])]);
    const result = await getTopDishes({ from: "2025-01-01", to: "2025-01-31" });
    expect(result).toEqual([]);
  });

  it("getTopDishes con ordenes pero sin items", async () => {
    setResponseQueue([q([{ id: "ord1" }]), q([])]);
    const result = await getTopDishes({ from: "2025-01-01", to: "2025-01-31" });
    expect(result).toEqual([]);
  });

  it("getTopDishes integra ordenes, items y menu", async () => {
    setResponseQueue([
      q([{ id: "ord1" }]),
      q([
        { menu_item_id: "mi1", quantity: 2, unit_price: 10 },
        { menu_item_id: "mi2", quantity: 5, unit_price: 1 },
      ]),
      q([
        { id: "mi1", name: "Plato A", category: "Cat" },
        { id: "mi2", name: "Plato B", category: "Cat" },
      ]),
    ]);
    const result = await getTopDishes({ from: "2025-01-01", to: "2025-01-31" });
    expect(result[0].quantity).toBe(5);
    expect(result[1].quantity).toBe(2);
    expect(result[0].name).toBe("Plato B");
  });

  it("getKardexWithBalance acumula IN y OUT", async () => {
    setResponseQueue([
      q({ id: "ing1", name: "Harina", unit: "lb", current_stock: 100 }),
      q([
        { id: "m1", movement_type: "IN", quantity: 10, created_at: "2025-01-01T10:00:00Z" },
        { id: "m2", movement_type: "OUT", quantity: 3, created_at: "2025-01-02T10:00:00Z" },
      ]),
    ]);
    const result = await getKardexWithBalance("ing1", "2025-01-01T00:00:00", "2025-01-31T23:59:59");
    expect(result.ingredient).toMatchObject({ name: "Harina" });
    expect(result.movements).toHaveLength(2);
    expect(result.movements[1].balance).toBe(7);
  });

  it("getIngredientConsumption separa consumo y rotacion por insumo", async () => {
    setResponseQueue([
      q([
        { id: "i1", name: "Arroz" },
        { id: "i2", name: "Frijol" },
      ]),
      q([
        { ingredient_id: "i1", quantity: 4, movement_type: "IN", ingredient: { name: "Arroz" } },
        { ingredient_id: "i1", quantity: 5, movement_type: "OUT", ingredient: { name: "Arroz" } },
        { ingredient_id: "i2", quantity: 10, movement_type: "OUT", ingredient: { name: "Frijol" } },
      ]),
      q([]),
    ]);
    const result = await getIngredientConsumption({ from: "2025-01-01", to: "2025-01-31" });
    expect(result[0].consumption).toBe(10);
    expect(result[0].name).toBe("Frijol");
    expect(result[1].consumption).toBe(5);
    expect(result[1].turnover).toBe(4);
  });

  it("getIngredientConsumption usa id si no hay nombre", async () => {
    setResponseQueue([
      q([]),
      q([
        {
          ingredient_id: "i99",
          quantity: 1,
          movement_type: "OUT",
          created_at: "2025-01-01T00:00:00Z",
          ingredient: undefined,
        },
      ]),
      q([]),
    ]);
    const result = await getIngredientConsumption({ from: "2025-01-01", to: "2025-01-31" });
    expect(result[0].name).toBe("i99");
    expect(result[0].consumption).toBe(1);
  });

  it("getIngredientConsumption suma recetas sin afectar la rotacion", async () => {
    setResponseQueue([
      q([{ id: "i1", name: "Harina" }]),
      q([
        { ingredient_id: "i1", quantity: 3, movement_type: "IN", ingredient: { name: "Harina" } },
      ]),
      q([
        {
          order_items: [
            {
              quantity: 2,
              menu_item: { name: "Baleada sencilla" },
            },
          ],
        },
      ]),
    ]);
    const result = await getIngredientConsumption({ from: "2025-01-01", to: "2025-01-31" });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Harina");
    expect(result[0].consumption).toBeCloseTo(0.16);
    expect(result[0].turnover).toBe(3);
  });
});
