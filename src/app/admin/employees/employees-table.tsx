"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function EmployeesTable({
  users,
}: {
  users: { id: string; email: string; full_name: string | null; role: string; active: boolean; created_at: string }[];
}) {
  if (users.length === 0) return <p className="mt-4 text-neutral-500">No hay empleados.</p>;
  return (
    <div className="mt-4 overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Registro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.full_name ?? "—"}</TableCell>
              <TableCell><Badge>{u.role}</Badge></TableCell>
              <TableCell><Badge variant={u.active ? "default" : "secondary"}>{u.active ? "Activo" : "Inactivo"}</Badge></TableCell>
              <TableCell className="text-sm text-neutral-500">{new Date(u.created_at).toLocaleDateString("es-HN")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
