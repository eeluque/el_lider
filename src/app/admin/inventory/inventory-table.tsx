"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Ingredient } from "@/types";

export function InventoryTable({ ingredients }: { ingredients: Ingredient[] }) {
  if (ingredients.length === 0) return <p className="mt-4 text-neutral-500">No hay ingredientes.</p>;
  return (
    <div className="mt-4 overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Unidad</TableHead>
            <TableHead>Stock actual</TableHead>
            <TableHead>Mínimo</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingredients.map((ing) => {
            const isLow = Number(ing.current_stock) <= Number(ing.minimum_stock);
            return (
              <TableRow key={ing.id}>
                <TableCell className="font-medium">{ing.name}</TableCell>
                <TableCell>{ing.unit}</TableCell>
                <TableCell>{Number(ing.current_stock)}</TableCell>
                <TableCell>{Number(ing.minimum_stock)}</TableCell>
                <TableCell>
                  <Badge variant={isLow ? "destructive" : "secondary"}>{isLow ? "Bajo stock" : "OK"}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
