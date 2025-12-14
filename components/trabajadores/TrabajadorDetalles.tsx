"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { formatDate } from "@/services/utils/date-formatter"

interface Worker {
  id: number
  name: string
  cedula: string
  email?: string
  phone?: string
  address?: string
  birthDate?: string
  sex?: string
  status: string // Mantenemos el status aunque no se muestre en la interfaz
  maritalStatus?: string
  children?: string
}

interface TrabajadorDetallesProps {
  worker: Worker | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TrabajadorDetalles({ worker, open, onOpenChange }: TrabajadorDetallesProps) {
  if (!worker) return null

  const dialogDescriptionId = "trabajador-detalles-descripcion"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
        aria-describedby={dialogDescriptionId}
      >
        <DialogHeader>
          <DialogTitle>Detalles del Trabajador</DialogTitle>
          <DialogDescription id={dialogDescriptionId}>
            Información completa del trabajador
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Nombre:</p>
            <p className="text-sm">{worker.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Cédula:</p>
            <p className="text-sm">{worker.cedula}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Fecha de Nacimiento:</p>
            <p className="text-sm">{worker.birthDate ? formatDate(worker.birthDate) : "No especificado"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Sexo:</p>
            <p className="text-sm">{worker.sex || "No especificado"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Email:</p>
            <p className="text-sm">{worker.email || "No especificado"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Celular:</p>
            <p className="text-sm">{worker.phone || "No especificado"}</p>
          </div>
          <div className="space-y-1 col-span-2">
            <p className="text-sm font-medium">Dirección:</p>
            <p className="text-sm">{worker.address || "No especificado"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Estado Civil:</p>
            <p className="text-sm">{worker.maritalStatus || "No especificado"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Número de Hijos:</p>
            <p className="text-sm">{worker.children || "0"}</p>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
