"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { MenuItem } from "@/types";

export function MenuTable({ items }: { items: MenuItem[] }) {
  if (items.length === 0) return <p className="mt-4 text-neutral-500">No hay ítems en el menú.</p>;
  return (
    <div className="mt-4 overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.category ?? "—"}</TableCell>
              <TableCell>L {Number(item.price).toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={item.active ? "default" : "secondary"}>{item.active ? "Activo" : "Inactivo"}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
