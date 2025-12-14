"use client"

import { Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { SeleccionTrabajadorStep } from "./components/SeleccionTrabajadorStep"
import { DetallesContratoStep } from "./components/DetallesContratoStep"
import { useContratoForm } from "./hooks/useContratoForm"
import { ContratoFormProps } from "./types"

export function ContratoForm({
  workers,
  initialData,
  isEditing = false,
  onSubmit,
  onCancel
}: ContratoFormProps) {
  const {
    step,
    setStep,
    formData,
    errors,
    touchedFields,
    isSubmitting,
    setIsSubmitting,
    searchTerm,
    setSearchTerm,
    openWorkerSelect,
    setOpenWorkerSelect,
    selectedWorker,
    filteredWorkers,
    handleSelectWorker,
    handleChange,
    validateStep1,
    validateStep2,
    handleNextStep
  } = useContratoForm(workers, initialData, isEditing)

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Solo validar y mostrar errores cuando se presiona el botón Guardar
    if (step === 2) {
      // Validar con mostrar errores = true
      const isValid = validateStep2(true)

      if (isValid) {
        setIsSubmitting(true)

        // Llamar a la función onSubmit proporcionada por el componente padre
        onSubmit(formData)

        setIsSubmitting(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{step === 1 ? "Seleccionar Trabajador" : "Información del Contrato"}</CardTitle>
          <CardDescription>
            {step === 1
              ? "Busca y selecciona el trabajador para el nuevo contrato."
              : "Completa los detalles del contrato laboral."}
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-3xl mx-auto">
          {step === 1 ? (
            <SeleccionTrabajadorStep
              formData={formData}
              errors={errors}
              touchedFields={touchedFields}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              openWorkerSelect={openWorkerSelect}
              setOpenWorkerSelect={setOpenWorkerSelect}
              selectedWorker={selectedWorker}
              filteredWorkers={filteredWorkers}
              handleSelectWorker={handleSelectWorker}
            />
          ) : (
            <DetallesContratoStep
              formData={formData}
              errors={errors}
              touchedFields={touchedFields}
              isEditing={isEditing}
              selectedWorker={selectedWorker}
              handleChange={handleChange}
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between max-w-3xl mx-auto">
          {step === 1 ? (
            <>
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button type="button" onClick={handleNextStep} disabled={!selectedWorker}>
                Continuar
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={step === 2 && !isEditing ? () => setStep(1) : onCancel}
              >
                <X className="mr-2 h-4 w-4" />
                {step === 2 && !isEditing ? "Atrás" : "Cancelar"}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </form>
  )
}
