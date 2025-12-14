"use client"

import { useState } from "react"
import { Search, Trash2, FileEdit, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Función para formatear la fecha como dd/mm/aaaa
const formatDate = (dateString: string): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateString;
  }
}

interface Worker {
  id: number
  name: string
  cedula: string
  sex: string
  phone: string
  email: string
  address: string
  status: string // Mantenemos el status para el filtro aunque no se muestre en la tabla
}

interface TrabajadoresTableProps {
  workers: Worker[]
  onViewClick: (id: number) => void
  onEditClick: (id: number) => void
  onDeleteClick: (id: number) => void
}

export function TrabajadoresTable({
  workers,
  onViewClick,
  onEditClick,
  onDeleteClick
}: TrabajadoresTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filtrar trabajadores
  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          worker.cedula.includes(searchTerm)

    return matchesSearch
  })



  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre o cédula..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cédula</TableHead>
              <TableHead>Nombres y Apellidos</TableHead>
              <TableHead>Sexo</TableHead>
              <TableHead>Celular</TableHead>
              <TableHead>Correo Electrónico</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No se encontraron trabajadores con los filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              filteredWorkers.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell>{worker.cedula}</TableCell>
                  <TableCell className="font-medium">{worker.name}</TableCell>
                  <TableCell>{worker.sex || "-"}</TableCell>
                  <TableCell>{worker.phone || "-"}</TableCell>
                  <TableCell>{worker.email || "-"}</TableCell>
                  <TableCell>{worker.address || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onViewClick(worker.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEditClick(worker.id)}>
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDeleteClick(worker.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
