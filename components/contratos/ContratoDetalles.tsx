"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/services/utils/date-formatter"

// Mapeo de combinaciones de turno y jornada a horarios
const scheduleMap: Record<string, string> = {
  "Mañana-Jornada Completa": "08:00 a.m. – 05:00 p.m.",
  "Mañana-Media Jornada": "08:00 a.m. – 12:00 p.m.",
  "Tarde-Jornada Completa": "01:00 p.m. – 10:00 p.m.",
  "Tarde-Media Jornada": "01:00 p.m. – 05:00 p.m.",
  "Noche-Jornada Completa": "10:00 p.m. – 07:00 a.m.",
  "Noche-Media Jornada": "10:00 p.m. – 02:00 a.m."
};

// Función para obtener el horario según el turno y la jornada
const getScheduleForShiftAndWorkday = (shift: string, workday: string): string => {
  const key = `${shift}-${workday}`;
  return scheduleMap[key] || "Horario no definido";
};

interface Contract {
  id: string
  worker: string
  department?: string
  position?: string
  type: string
  startDate: string
  endDate?: string
  shift?: string
  workday?: string
  salary: string
  pension?: string
  status: string

}

interface ContratoDetallesProps {
  contract: Contract | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContratoDetalles({ contract, open, onOpenChange }: ContratoDetallesProps) {
  if (!contract) return null

  const dialogDescriptionId = "contrato-detalles-descripcion"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl max-h-[90vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
        aria-describedby={dialogDescriptionId}
      >
        <DialogHeader>
          <DialogTitle>Detalles del Contrato</DialogTitle>
          <DialogDescription id={dialogDescriptionId}>
            Información completa del contrato
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 col-span-2">
            <p className="text-sm font-medium">Trabajador:</p>
            <p className="text-sm">{contract.worker}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Departamento:</p>
            <p className="text-sm">{contract.department || "No asignado"}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Cargo:</p>
            <p className="text-sm">{contract.position || "No asignado"}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Tipo de Contrato:</p>
            <p className="text-sm">{contract.type}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Estado:</p>
            <Badge
              variant={contract.status === "Activo" ? "success" : "inactive"}
            >
              {contract.status}
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Fecha de Inicio:</p>
            <p className="text-sm">{contract.startDate || "N/A"}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Fecha de Fin:</p>
            <p className="text-sm">{contract.endDate || "N/A"}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Turno:</p>
            <p className="text-sm">{contract.shift || "No asignado"}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Jornada:</p>
            <p className="text-sm">{contract.workday || "No asignado"}</p>
            {contract.shift && contract.workday && (
              <p className="text-xs text-muted-foreground">
                {getScheduleForShiftAndWorkday(contract.shift, contract.workday)}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Salario:</p>
            <p className="text-sm">{contract.salary}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Pensión:</p>
            <p className="text-sm">{contract.pension || "No asignado"}</p>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
