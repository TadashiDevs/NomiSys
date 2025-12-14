"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { FormData, FormErrors, TouchedFields, Worker } from "../types"

interface DetallesContratoStepProps {
  formData: FormData
  errors: FormErrors
  touchedFields: TouchedFields
  isEditing: boolean
  selectedWorker: Worker | null
  handleChange: (field: keyof FormData, value: any) => void
}

export function DetallesContratoStep({
  formData,
  errors,
  touchedFields,
  isEditing,
  selectedWorker,
  handleChange
}: DetallesContratoStepProps) {
  return (
    <div className="space-y-6">
      {/* Mostrar trabajador seleccionado */}
      {selectedWorker && !isEditing && (
        <div className="p-4 border rounded-md bg-muted">
          <h3 className="font-medium mb-2">Trabajador seleccionado:</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Nombre:</span> {selectedWorker.name}
            </div>
            <div>
              <span className="font-medium">Cédula:</span> {selectedWorker.cedula}
            </div>
            <div>
              <span className="font-medium">Departamento:</span> {selectedWorker.department}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">
            Tipo de Contrato <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleChange("type", value)}
            disabled={isEditing}
          >
            <SelectTrigger
              className={cn(
                errors.type && touchedFields.type ? "border-red-500" : "",
                isEditing ? "bg-muted" : ""
              )}
            >
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Indefinido">Indefinido</SelectItem>
              <SelectItem value="Plazo Fijo">Plazo Fijo</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && touchedFields.type && (
            <p className="text-red-500 text-xs">{errors.type}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">
            Fecha de Inicio <span className="text-red-500">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.startDate && "text-muted-foreground",
                  errors.startDate && touchedFields.startDate ? "border-red-500" : "",
                  isEditing ? "bg-muted" : ""
                )}
                disabled={isEditing}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.startDate ? (
                  format(formData.startDate, "PPP", { locale: es })
                ) : (
                  <span>Seleccionar fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.startDate}
                onSelect={(date) => handleChange("startDate", date)}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
          {errors.startDate && touchedFields.startDate && (
            <p className="text-red-500 text-xs">{errors.startDate}</p>
          )}
        </div>

        {formData.type === "Plazo Fijo" && (
          <div className="space-y-2">
            <Label htmlFor="endDate">
              Fecha de Fin <span className="text-red-500">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.endDate && "text-muted-foreground",
                    errors.endDate && touchedFields.endDate ? "border-red-500" : ""
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.endDate ? (
                    format(formData.endDate, "PPP", { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.endDate}
                  onSelect={(date) => handleChange("endDate", date)}
                  disabled={(date) => formData.startDate ? date <= formData.startDate : false}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            {errors.endDate && touchedFields.endDate && (
              <p className="text-red-500 text-xs">{errors.endDate}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="position">
            Cargo <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.position}
            onValueChange={(value) => handleChange("position", value)}
          >
            <SelectTrigger className={errors.position && touchedFields.position ? "border-red-500" : ""}>
              <SelectValue placeholder="Seleccionar cargo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Gerente de Área">Gerente de Área</SelectItem>
              <SelectItem value="Supervisor">Supervisor</SelectItem>
              <SelectItem value="Desarrollador">Desarrollador</SelectItem>
              <SelectItem value="Contador">Contador</SelectItem>
              <SelectItem value="Técnico">Técnico</SelectItem>
              <SelectItem value="Operario">Operario</SelectItem>
            </SelectContent>
          </Select>
          {errors.position && touchedFields.position && (
            <p className="text-red-500 text-xs">{errors.position}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary">
            Salario (S/.) <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500">S/</span>
            </div>
            <input
              id="salary"
              type="number"
              min="1025"
              step="1"
              placeholder="1025"
              value={formData.salary}
              onChange={(e) => handleChange("salary", e.target.value)}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10",
                errors.salary && touchedFields.salary ? "border-red-500" : ""
              )}
            />
          </div>
          {errors.salary && touchedFields.salary && (
            <p className="text-red-500 text-xs">{errors.salary}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">
            Departamento <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.department}
            onValueChange={(value) => handleChange("department", value)}
          >
            <SelectTrigger className={errors.department && touchedFields.department ? "border-red-500" : ""}>
              <SelectValue placeholder="Seleccionar departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Administración">Administración</SelectItem>
              <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
              <SelectItem value="Tecnología">Tecnología</SelectItem>
              <SelectItem value="Finanzas">Finanzas</SelectItem>
              <SelectItem value="Ventas">Ventas</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Operaciones">Operaciones</SelectItem>
              <SelectItem value="Logística">Logística</SelectItem>
            </SelectContent>
          </Select>
          {errors.department && touchedFields.department && (
            <p className="text-red-500 text-xs">{errors.department}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shift">
            Turno <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.shift}
            onValueChange={(value) => handleChange("shift", value)}
          >
            <SelectTrigger className={errors.shift && touchedFields.shift ? "border-red-500" : ""}>
              <SelectValue placeholder="Seleccionar turno" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mañana">Mañana</SelectItem>
              <SelectItem value="Tarde">Tarde</SelectItem>
              <SelectItem value="Noche">Noche</SelectItem>
            </SelectContent>
          </Select>
          {errors.shift && touchedFields.shift && (
            <p className="text-red-500 text-xs">{errors.shift}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="workday">
            Jornada <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.workday}
            onValueChange={(value) => handleChange("workday", value)}
          >
            <SelectTrigger className={errors.workday && touchedFields.workday ? "border-red-500" : ""}>
              <SelectValue placeholder="Seleccionar jornada" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Jornada Completa">Jornada Completa</SelectItem>
              <SelectItem value="Media Jornada">Media Jornada</SelectItem>
            </SelectContent>
          </Select>
          {errors.workday && touchedFields.workday && (
            <p className="text-red-500 text-xs">{errors.workday}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pension">
            Pensión <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.pension}
            onValueChange={(value) => handleChange("pension", value)}
          >
            <SelectTrigger className={errors.pension && touchedFields.pension ? "border-red-500" : ""}>
              <SelectValue placeholder="Seleccionar sistema de pensión" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AFP">AFP</SelectItem>
              <SelectItem value="ONP">ONP</SelectItem>
            </SelectContent>
          </Select>
          {errors.pension && touchedFields.pension && (
            <p className="text-red-500 text-xs">{errors.pension}</p>
          )}
        </div>

        {isEditing && (
          <div className="space-y-2">
            <Label htmlFor="status">
              Estado <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Finalizado">Finalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}


      </div>
    </div>
  )
}
