/**
 * Recetas simplificadas: cantidad de insumo por unidad vendida del platillo.
 * Los nombres de insumos deben coincidir con `ingredients.name` en la BD.
 * Claves: nombre del menú en minúsculas (ver `normalizeMenuItemName`).
 */
export type RecipeLine = { ingredientName: string; qtyPerUnit: number };

export function normalizeMenuItemName(name: string): string {
  return name.trim().toLowerCase();
}

/** Cantidades aproximadas en las unidades del inventario (lb, unidad, etc.). */
export const MENU_ITEM_CONSUMPTION_RECIPES: Record<string, RecipeLine[]> = {
  "baleada sencilla": [
    { ingredientName: "Harina", qtyPerUnit: 0.08 },
    { ingredientName: "Frijoles", qtyPerUnit: 0.12 },
  ],
  "baleada con todo": [
    { ingredientName: "Harina", qtyPerUnit: 0.09 },
    { ingredientName: "Frijoles", qtyPerUnit: 0.14 },
    { ingredientName: "Huevos", qtyPerUnit: 1 },
    { ingredientName: "Queso", qtyPerUnit: 0.04 },
    { ingredientName: "Aguacate", qtyPerUnit: 0.5 },
  ],
  "desayuno típico": [
    { ingredientName: "Huevos", qtyPerUnit: 2 },
    { ingredientName: "Frijoles", qtyPerUnit: 0.15 },
    { ingredientName: "Queso", qtyPerUnit: 0.05 },
  ],
  "almuerzo del día": [
    { ingredientName: "Carne de res", qtyPerUnit: 0.22 },
    { ingredientName: "Frijoles", qtyPerUnit: 0.1 },
  ],
  "sopa de res": [
    { ingredientName: "Carne de res", qtyPerUnit: 0.18 },
    { ingredientName: "Frijoles", qtyPerUnit: 0.08 },
  ],
  "refresco natural": [{ ingredientName: "Limones", qtyPerUnit: 0.12 }],
};
