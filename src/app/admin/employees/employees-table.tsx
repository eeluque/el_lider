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
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <colgroup>
          <col className="w-[30%]" />
          <col className="w-[25%]" />
          <col className="w-[15%]" />
          <col className="w-[15%]" />
          <col className="w-[15%]" />
        </colgroup>
        <TableHeader>
          <TableRow className="bg-[#753B19] hover:bg-[#753B19]">
            <TableHead className="text-white font-bold uppercase tracking-wide">Email</TableHead>
            <TableHead className="text-white font-bold uppercase tracking-wide">Nombre</TableHead>
            <TableHead className="text-white font-bold uppercase tracking-wide">Rol</TableHead>
            <TableHead className="text-white font-bold uppercase tracking-wide">Estado</TableHead>
            <TableHead className="text-white font-bold uppercase tracking-wide">Registro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white">
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.full_name ?? "—"}</TableCell>
              <TableCell><Badge>{u.role}</Badge></TableCell>
              <TableCell>
                <Badge variant={u.active ? "default" : "secondary"}>
                  {u.active ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(u.created_at).toLocaleDateString("es-HN")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}