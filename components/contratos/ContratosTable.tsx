"use client"

import { useState } from "react"
import { Search, Trash2, Eye, Filter, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Contract {
  id: string
  worker: string
  cedula: string
  department: string
  position: string
  type: string
  startDate: string
  endDate?: string
  salary: string
  status: string
}

interface ContratosTableProps {
  contracts: Contract[]
  onViewClick: (id: string) => void
  onFinishClick: (id: string) => void
  onDeleteClick: (id: string) => void
}

export function ContratosTable({
  contracts,
  onViewClick,
  onFinishClick,
  onDeleteClick
}: ContratosTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filtrar contratos
  const filteredContracts = contracts.filter((contract) => {
    // Buscar por nombre o cédula, asegurándose de que los valores existan
    const workerName = contract.worker || '';
    const cedula = contract.cedula || '';

    const matchesSearch =
      workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cedula.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || contract.type === typeFilter;
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por cédula o nombre..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Tipo</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Indefinido">Indefinido</SelectItem>
              <SelectItem value="Plazo Fijo">Plazo Fijo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Estado</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Activo">Activo</SelectItem>
              <SelectItem value="Finalizado">Finalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cédula</TableHead>
              <TableHead>Nombres y Apellidos</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Tipo de Contrato</TableHead>
              <TableHead>Fecha Inicio</TableHead>
              <TableHead>Fecha Fin</TableHead>
              <TableHead>Salario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  No se encontraron contratos con los filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              filteredContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{contract.cedula && contract.cedula !== "No disponible" ? contract.cedula : "No disponible"}</TableCell>
                  <TableCell className="font-medium">{contract.worker && contract.worker !== "No asignado" ? contract.worker : "No asignado"}</TableCell>
                  <TableCell>{contract.department || "No asignado"}</TableCell>
                  <TableCell>{contract.position || "No asignado"}</TableCell>
                  <TableCell>{contract.type}</TableCell>
                  <TableCell>{contract.startDate}</TableCell>
                  <TableCell>{contract.endDate || "N/A"}</TableCell>
                  <TableCell>{contract.salary}</TableCell>
                  <TableCell>
                    <Badge
                      variant={contract.status === "Activo" ? "success" : "inactive"}
                    >
                      {contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onViewClick(contract.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {contract.status === "Activo" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onFinishClick(contract.id)}
                          title="Finalizar contrato"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => onDeleteClick(contract.id)}>
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
