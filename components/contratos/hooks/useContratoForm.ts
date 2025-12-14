"use client"

import { useState } from "react"
import { FormData, FormErrors, TouchedFields, Worker } from "../types"

export const useContratoForm = (workers: Worker[], initialData?: FormData, isEditing = false) => {
  const [step, setStep] = useState(isEditing ? 2 : 1)
  const [formData, setFormData] = useState<FormData>(initialData || {
    workerId: undefined,
    type: "Indefinido",
    startDate: undefined,
    endDate: undefined,
    position: "",
    salary: "",
    status: "Activo",

    department: "",
    shift: "Mañana",
    workday: "Jornada Completa",
    pension: "AFP",
  })

  const [errors, setErrors] = useState<FormErrors>({
    workerId: "",
    type: "",
    startDate: "",
    endDate: "",
    position: "",
    salary: "",
    status: "",

    department: "",
    shift: "",
    workday: "",
    pension: "",
  })

  const [touchedFields, setTouchedFields] = useState<TouchedFields>({
    workerId: false,
    type: false,
    startDate: false,
    endDate: false,
    position: false,
    salary: false,
    status: false,

    department: false,
    shift: false,
    workday: false,
    pension: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [openWorkerSelect, setOpenWorkerSelect] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(
    initialData?.workerId
      ? workers.find(w => w.id === initialData.workerId) || null
      : null
  )

  // Filtrar trabajadores para la búsqueda
  const filteredWorkers = workers.filter((worker) => {
    return (
      worker.status === "Activo" &&
      (worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.cedula.includes(searchTerm))
    )
  })

  // Manejar selección de trabajador
  const handleSelectWorker = (worker: Worker) => {
    setSelectedWorker(worker)
    setFormData((prev) => ({ ...prev, workerId: worker.id }))
    setTouchedFields((prev) => ({ ...prev, workerId: true }))
    setErrors((prev) => ({ ...prev, workerId: "" }))
    setOpenWorkerSelect(false)
  }

  // Manejar cambios en los campos
  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setTouchedFields((prev) => ({ ...prev, [field]: true }))

    // Validar campo
    validateField(field, value)
  }

  // Validar un campo específico
  const validateField = (field: keyof FormData, value: any) => {
    let errorMessage = ""

    switch (field) {
      case "workerId":
        if (!value) errorMessage = "Debe seleccionar un trabajador"
        break
      case "type":
        if (!value) errorMessage = "Debe seleccionar un tipo de contrato"
        break
      case "startDate":
        if (!value) errorMessage = "La fecha de inicio es obligatoria"
        break
      case "endDate":
        if (formData.type === "Plazo Fijo" && !value)
          errorMessage = "La fecha de fin es obligatoria para contratos a plazo fijo"
        break
      case "position":
        if (!value) errorMessage = "El cargo es obligatorio"
        break
      case "salary":
        if (!value) errorMessage = "El salario es obligatorio"
        else if (isNaN(Number(value)) || Number(value) < 1025)
          errorMessage = "El salario debe ser un número mayor o igual a S/. 1025"
        break
      case "department":
        if (!value) errorMessage = "El departamento es obligatorio"
        break
      case "shift":
        if (!value) errorMessage = "El turno es obligatorio"
        break
      case "workday":
        if (!value) errorMessage = "La jornada es obligatoria"
        break
      case "pension":
        if (!value) errorMessage = "El sistema de pensión es obligatorio"
        break

    }

    setErrors(prev => ({ ...prev, [field]: errorMessage }))
    return !errorMessage
  }

  // Validar paso 1
  const validateStep1 = () => {
    const isValid = validateField("workerId", formData.workerId)
    return isValid
  }

  // Validar paso 2
  const validateStep2 = (showErrors = false) => {
    if (showErrors) {
      // Marcar campos como tocados para mostrar errores
      setTouchedFields({
        ...touchedFields,
        type: true,
        startDate: true,
        endDate: formData.type === "Plazo Fijo",
        position: true,
        salary: true,
        status: true,

        department: true,
        shift: true,
        workday: true,
        pension: true
      })
    }

    let isValid = true

    // Validar cada campo
    isValid = validateField("type", formData.type) && isValid
    isValid = validateField("startDate", formData.startDate) && isValid

    if (formData.type === "Plazo Fijo") {
      isValid = validateField("endDate", formData.endDate) && isValid
    }

    isValid = validateField("position", formData.position) && isValid
    isValid = validateField("salary", formData.salary) && isValid
    isValid = validateField("department", formData.department) && isValid
    isValid = validateField("shift", formData.shift) && isValid
    isValid = validateField("workday", formData.workday) && isValid
    isValid = validateField("pension", formData.pension) && isValid



    return isValid
  }

  // Manejar avance al siguiente paso
  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  return {
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
  }
}
