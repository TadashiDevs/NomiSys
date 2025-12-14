"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { FormData, FormErrors, TouchedFields, Worker } from "../types"

interface SeleccionTrabajadorStepProps {
  formData: FormData
  errors: FormErrors
  touchedFields: TouchedFields
  searchTerm: string
  setSearchTerm: (value: string) => void
  openWorkerSelect: boolean
  setOpenWorkerSelect: (value: boolean) => void
  selectedWorker: Worker | null
  filteredWorkers: Worker[]
  handleSelectWorker: (worker: Worker) => void
}

export function SeleccionTrabajadorStep({
  formData,
  errors,
  touchedFields,
  searchTerm,
  setSearchTerm,
  openWorkerSelect,
  setOpenWorkerSelect,
  selectedWorker,
  filteredWorkers,
  handleSelectWorker
}: SeleccionTrabajadorStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="worker">
          Trabajador <span className="text-red-500">*</span>
        </Label>
        <Popover open={openWorkerSelect} onOpenChange={setOpenWorkerSelect}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openWorkerSelect}
              className={`w-full justify-between ${errors.workerId && touchedFields.workerId ? "border-red-500" : ""}`}
            >
              {selectedWorker ? selectedWorker.name : "Buscar trabajador..."}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput
                placeholder="Buscar por nombre o cédula..."
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList>
                <CommandEmpty>No se encontraron trabajadores.</CommandEmpty>
                <CommandGroup>
                  {filteredWorkers.map((worker) => (
                    <CommandItem
                      key={worker.id}
                      value={worker.name}
                      onSelect={() => handleSelectWorker(worker)}
                    >
                      <div className="flex flex-col">
                        <span>{worker.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Cédula: {worker.cedula} | Departamento: {worker.department}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.workerId && touchedFields.workerId && (
          <p className="text-red-500 text-xs">{errors.workerId}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Solo se muestran trabajadores con estado Activo.
        </p>
      </div>
    </div>
  )
}
