import { describe, expect, it } from "vitest";
import { getNextSequentialOrderNumber } from "./orders";

describe("orders service", () => {
  it("empieza la numeracion secuencial en 000001 cuando no hay pedido previo", () => {
    expect(getNextSequentialOrderNumber()).toBe("000001");
    expect(getNextSequentialOrderNumber(null)).toBe("000001");
  });

  it("incrementa un numero secuencial existente", () => {
    expect(getNextSequentialOrderNumber("000009")).toBe("000010");
    expect(getNextSequentialOrderNumber("000999")).toBe("001000");
  });

  it("extrae e incrementa la parte numerica de formatos anteriores", () => {
    expect(getNextSequentialOrderNumber("ORD-000123")).toBe("000124");
    expect(getNextSequentialOrderNumber("PEDIDO 45")).toBe("000046");
  });
});
