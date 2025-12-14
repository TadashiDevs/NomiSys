"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Save, X, AlertCircle, HelpCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { trabajadoresApi, contratosApi } from "@/services/api"

// Datos de ejemplo de contratos existentes
const existingContracts = [
  {
    id: 1,
    workerId: 1,
    startDate: new Date("2025-05-15"),
    endDate: null,
    status: "Activo",
  },
  {
    id: 2,
    workerId: 2,
    startDate: new Date("2025-05-10"),
    endDate: new Date("2025-11-10"),
    status: "Activo",
  },
]

// Mapeo de combinaciones de turno y jornada a horarios
const scheduleMap = {
  "Mañana-Jornada Completa": "08:00 a.m. – 05:00 p.m.",
  "Mañana-Media Jornada": "08:00 a.m. – 12:00 p.m.",
  "Tarde-Jornada Completa": "01:00 p.m. – 10:00 p.m.",
  "Tarde-Media Jornada": "01:00 p.m. – 05:00 p.m.",
  "Noche-Jornada Completa": "10:00 p.m. – 07:00 a.m.",
  "Noche-Media Jornada": "10:00 p.m. – 02:00 a.m."
};

export default function NewContractPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    workerId: 0,
    type: "Indefinido", // Valor por defecto para evitar errores de validación
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    position: "",
    salary: "",
    description: "",
    department: "",
    shift: "",
    workday: "",
    pension: "",
  })
  const [selectedSchedule, setSelectedSchedule] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  // Inicializar estado - todos los campos comienzan como no tocados
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  const [workers, setWorkers] = useState<any[]>([])
  const [loadingWorkers, setLoadingWorkers] = useState(false)

  // Función para cargar trabajadores (solo se llama una vez)
  const fetchWorkers = async () => {
    // Evitar múltiples llamadas si ya está cargando
    if (loadingWorkers) {
      console.log('Ya se están cargando los trabajadores, ignorando llamada adicional')
      return
    }

    try {
      setLoadingWorkers(true)
      console.log('Llamando a trabajadoresApi.getAll() - UNA SOLA VEZ')
      const data = await trabajadoresApi.getAll()

      // Transformar datos al formato esperado
      const formattedWorkers = data.map(worker => ({
        id: worker.id,
        name: worker.nombres_completos || worker.name,
        cedula: worker.cedula,
        birthDate: worker.fecha_nacimiento || worker.birthDate,
        sex: worker.sexo || worker.sex || "",
        email: worker.email || "",
        phone: worker.celular || worker.phone || "",
        address: worker.direccion || worker.address || "",
        department: worker.departamento || worker.department || "",
        maritalStatus: worker.estado_civil || worker.maritalStatus || "",
        children: worker.numero_hijos !== undefined ? String(worker.numero_hijos) : worker.children || "0",
        // Ya no se usa fecha de ingreso en el sistema
        // joinDate: worker.fecha_ingreso ? new Date(worker.fecha_ingreso) : new Date(),
        status: worker.estado || worker.status
      }))

      console.log(`Se cargaron ${formattedWorkers.length} trabajadores correctamente`)
      setWorkers(formattedWorkers)
    } catch (error) {
      console.error('Error al cargar trabajadores:', error)
      toast.error('Error al cargar los trabajadores')
    } finally {
      setLoadingWorkers(false)
    }
  }

  // Cargar trabajadores solo una vez al montar el componente
  useEffect(() => {
    // Cargar trabajadores solo si no se han cargado ya
    if (workers.length === 0 && !loadingWorkers) {
      fetchWorkers()
    }
  }, [])

  // Función para buscar trabajadores
  const searchWorkers = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    setHasSearched(true)
    try {
      // Filtrar trabajadores por término de búsqueda
      const filtered = workers.filter(
        (worker) =>
          worker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          worker.cedula?.includes(searchTerm)
      )
      setSearchResults(filtered)
    } catch (error) {
      console.error('Error al buscar trabajadores:', error)
      toast.error('Error al buscar trabajadores')
    } finally {
      setIsSearching(false)
    }
  }

  // Manejar búsqueda con Enter
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      searchWorkers()
    }
  }

  // Verificar si hay solapamiento de contratos
  const checkContractOverlap = (workerId: number, startDate: Date, endDate: Date | null) => {
    return existingContracts.some((contract) => {
      if (contract.workerId !== workerId || contract.status !== "Activo") {
        return false
      }

      // Si el contrato existente es indefinido (sin fecha de fin)
      if (contract.endDate === null) {
        return true // Siempre hay solapamiento con un contrato indefinido activo
      }

      // Si el nuevo contrato es indefinido (sin fecha de fin)
      if (endDate === null) {
        return true // Siempre hay solapamiento con un contrato indefinido nuevo
      }

      // Verificar solapamiento de fechas
      return startDate <= contract.endDate && endDate >= contract.startDate
    })
  }

  // Manejar selección de trabajador
  const handleSelectWorker = (worker: (typeof workers)[0]) => {
    setSelectedWorker(worker)
    setFormData({
      ...formData,
      workerId: worker.id,
    })
    setSearchTerm("")
    setSearchResults([])
    setHasSearched(false)

    // Limpiar error
    if (errors.workerId) {
      setErrors({
        ...errors,
        workerId: "",
      })
    }
  }

  // Manejar cambios en los campos
  const handleChange = (field: string, value: string | Date | undefined) => {
    // Actualizar datos del formulario
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [field]: value,
      };

      // Si cambia el turno o la jornada, actualizar el horario
      if (field === "shift" || field === "workday") {
        // Solo mostrar horario si ambos campos están seleccionados
        if (newData.shift && newData.workday) {
          const key = `${field === "shift" ? value : newData.shift}-${field === "workday" ? value : newData.workday}`;
          const schedule = scheduleMap[key as keyof typeof scheduleMap];
          if (schedule) {
            setSelectedSchedule(schedule);
          }
        } else {
          // Si alguno de los campos está vacío, no mostrar horario
          setSelectedSchedule("");
        }
      }

      return newData;
    });

    // No marcar los campos como tocados al cambiar su valor
    // Solo se marcarán como tocados cuando se intente enviar el formulario
  }



  // Validar paso 2
  const validateStep2 = (showErrors = false) => {
    console.log("Validando formulario con datos:", formData);
    const newErrors: Record<string, string> = {}

    // Solo validar si showErrors es true (cuando se intenta enviar el formulario)
    if (showErrors) {
      if (!formData.type) {
        newErrors.type = "El tipo de contrato es requerido"
      }

      if (!formData.startDate) {
        newErrors.startDate = "La fecha de inicio es requerida"
      } else {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (formData.startDate < today) {
          newErrors.startDate = "La fecha de inicio no puede ser anterior a la fecha actual"
        }
        // Se eliminó la validación de fecha de ingreso ya que no existe en el sistema
      }

      if (formData.type === "Plazo Fijo") {
        if (!formData.endDate) {
          newErrors.endDate = "La fecha de fin es requerida para contratos a plazo fijo"
        } else if (formData.startDate && formData.endDate <= formData.startDate) {
          newErrors.endDate = "La fecha de fin debe ser posterior a la fecha de inicio"
        }
      }

      if (!formData.position) {
        newErrors.position = "El cargo es requerido"
      }

      if (!formData.salary) {
        newErrors.salary = "El salario es requerido"
      } else if (isNaN(Number(formData.salary.toString().replace(/[^0-9]/g, ''))) || Number(formData.salary.toString().replace(/[^0-9]/g, '')) <= 0) {
        newErrors.salary = "El salario debe ser un número positivo"
      } else if (Number(formData.salary.toString().replace(/[^0-9]/g, '')) < 1025) {
        newErrors.salary = "El salario debe ser al menos S/. 1025"
      }

      if (!formData.department) {
        newErrors.department = "El departamento es requerido"
      }

      if (!formData.shift) {
        newErrors.shift = "El turno es requerido"
      }

      if (!formData.workday) {
        newErrors.workday = "La jornada es requerida"
      }

      if (!formData.pension) {
        newErrors.pension = "El sistema de pensión es requerido"
      }
    }

    // Verificar solapamiento de contratos
    if (showErrors && formData.workerId && formData.startDate && (formData.type !== "Plazo Fijo" || formData.endDate)) {
      const hasOverlap = checkContractOverlap(
        formData.workerId,
        formData.startDate,
        formData.type === "Plazo Fijo" ? formData.endDate! : null,
      )

      if (hasOverlap) {
        newErrors.overlap =
          "El trabajador ya tiene un contrato activo en esas fechas. Por favor, selecciona un rango diferente."
      }
    }

    // Solo actualizar los errores si showErrors es true
    if (showErrors) {
      console.log("Actualizando errores:", newErrors);
      setErrors(newErrors);
    }

    const isValid = Object.keys(newErrors).length === 0;
    console.log("Resultado de validación:", isValid, "Errores:", newErrors);
    return isValid;
  }

  // Avanzar al siguiente paso
  const nextStep = () => {
    // Solo avanzar si hay un trabajador seleccionado
    if (step === 1 && selectedWorker) {
      // Limpiar errores y campos tocados antes de avanzar al siguiente paso
      setErrors({});
      // Inicializar todos los campos como no tocados
      setTouchedFields({});
      // Resetear el estado de envío
      setIsSubmitting(false);
      setStep(2);
    }
  }

  // Volver al paso anterior
  const prevStep = () => {
    setStep(1)
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Formulario enviado, paso actual:", step);

    // Solo validar y mostrar errores cuando se presiona el botón Guardar
    if (step === 2) {
      // Prevenir múltiples envíos
      if (isSubmitting) {
        console.log("Ya se está procesando un envío, ignorando clic adicional");
        return;
      }

      // Establecer que estamos intentando enviar el formulario
      setIsSubmitting(true);
      console.log("Estado de envío establecido a true");

      // Validar con mostrar errores = true
      const isValid = validateStep2(true);
      console.log("Resultado de validación:", isValid, "Errores:", errors);

      // Continuar con el proceso de envío solo si es válido
      handleFormSubmission(isValid);

      // El código se ha movido a la función handleFormSubmission
    }
  }

  // Función para manejar el envío del formulario después de la validación
  const handleFormSubmission = async (isValid: boolean) => {
    if (isValid) {
      try {
        // Preparar datos para enviar al API
        const cleanedSalary = formData.salary ? formData.salary.toString().replace(/[^0-9]/g, '') : "1025";

        const contratoData = {
          workerId: formData.workerId,
          type: formData.type,
          startDate: formData.startDate,
          endDate: formData.type === "Plazo Fijo" ? formData.endDate : undefined,
          position: formData.position,
          salary: cleanedSalary,
          status: "Activo",
          department: formData.department,
          shift: formData.shift,
          workday: formData.workday,
          pension: formData.pension
        };

        console.log("Enviando datos al API:", contratoData);

        // Llamar al API para crear el contrato
        const response = await contratosApi.create(contratoData);
        console.log("Respuesta del API:", response);

        // Limpiar errores después de guardar exitosamente
        setErrors({});
        toast.success("Contrato guardado correctamente");

        // Forzar redirección inmediata sin esperar
        window.location.href = "/dashboard/contratos";
      } catch (error) {
        console.error("Error al guardar el contrato:", error);
        toast.error("Error al guardar el contrato. Por favor, intente nuevamente.");
        setIsSubmitting(false);
      }
    } else {
      // Si no es válido, mantener los errores visibles
      // pero dejar de mostrar el estado de envío
      console.log("Formulario no válido, errores:", errors);
      setIsSubmitting(false);
    }
    }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Contrato</h1>
        <p className="text-muted-foreground">Crea un nuevo contrato laboral para un trabajador.</p>
      </div>

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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="worker">
                    Trabajador <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative max-w-md">
                    <Input
                      placeholder="Buscar por DNI o nombre del trabajador..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        // Limpiar resultados y estado de búsqueda cuando se borra el input
                        if (!e.target.value.trim()) {
                          setSearchResults([])
                          setHasSearched(false)
                        }
                      }}
                      onKeyPress={handleSearchKeyPress}
                      className={cn(
                        "pr-10",
                        errors.workerId ? "border-red-500" : ""
                      )}
                      disabled={loadingWorkers}
                    />
                    <button
                      type="button"
                      onClick={searchWorkers}
                      disabled={!searchTerm.trim() || isSearching || loadingWorkers}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSearching ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.workerId && <p className="text-sm text-red-500">{errors.workerId}</p>}

                  {/* Mostrar resultados de búsqueda */}
                  {searchResults.length > 0 && (
                    <div className="border rounded-md max-w-md max-h-60 overflow-y-auto">
                      {searchResults.map((worker) => (
                        <div
                          key={worker.id}
                          className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                          onClick={() => handleSelectWorker(worker)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{worker.name}</span>
                            <div className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                              <span>Cédula: {worker.cedula}</span>
                              <span>|</span>
                              <span>Sexo: {worker.sex || "No especificado"}</span>
                              <span>|</span>
                              <span>Celular: {worker.phone || "No especificado"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Mensaje cuando no hay resultados - solo después de buscar */}
                  {hasSearched && searchResults.length === 0 && !isSearching && !loadingWorkers && (
                    <p className="text-sm text-muted-foreground max-w-md">
                      No se encontraron trabajadores que coincidan con "{searchTerm}". Intenta con otro término de búsqueda.
                    </p>
                  )}

                  {/* Mensaje de carga inicial */}
                  {loadingWorkers && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-md">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Cargando trabajadores...
                    </div>
                  )}
                </div>

                {selectedWorker && (
                  <div className="rounded-md border p-4 mt-4">
                    <h3 className="font-bold mb-2">Información del trabajador</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-bold">Nombres y Apellidos:</span> {selectedWorker.name}
                      </div>
                      <div>
                        <span className="font-bold">Cédula:</span> {selectedWorker.cedula}
                      </div>
                      <div>
                        <span className="font-bold">Sexo:</span> {selectedWorker.sex || "No especificado"}
                      </div>
                      <div>
                        <span className="font-bold">Fecha de nacimiento:</span>{" "}
                        {selectedWorker.birthDate ? format(new Date(selectedWorker.birthDate), "dd/MM/yyyy") : "No especificado"}
                      </div>
                      <div>
                        <span className="font-bold">Email:</span> {selectedWorker.email || "No especificado"}
                      </div>
                      <div>
                        <span className="font-bold">Celular:</span> {selectedWorker.phone || "No especificado"}
                      </div>
                      <div>
                        <span className="font-bold">Estado civil:</span> {selectedWorker.maritalStatus || "No especificado"}
                      </div>
                      <div>
                        <span className="font-bold">Número de hijos:</span> {selectedWorker.children || "0"}
                      </div>
                      <div className="col-span-2">
                        <span className="font-bold">Dirección:</span> {selectedWorker.address || "No especificado"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="type">
                      Tipo de Contrato <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                      <SelectTrigger className={errors.type && isSubmitting ? "border-red-500" : ""}>
                        <SelectValue placeholder="Seleccionar tipo de contrato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Indefinido">Indefinido</SelectItem>
                        <SelectItem value="Plazo Fijo">Plazo Fijo</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && isSubmitting && <p className="text-xs text-red-500">{errors.type}</p>}
                  </div>

                  <div className="space-y-1">
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
                            errors.startDate && isSubmitting && "border-red-500",
                          )}
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
                          disabled={(date) => {
                            // Obtener la fecha actual del sistema en tiempo real
                            const now = new Date()

                            // Crear una fecha para hoy (solo fecha, sin hora)
                            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

                            // Crear una fecha para la fecha seleccionada (solo fecha, sin hora)
                            const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

                            // Comparar las fechas usando timestamps para mayor precisión
                            return selectedDate.getTime() < today.getTime()
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">Solo se permite seleccionar desde la fecha actual en adelante</p>
                    {errors.startDate && isSubmitting && <p className="text-xs text-red-500">{errors.startDate}</p>}
                  </div>

                  {formData.type === "Plazo Fijo" && (
                    <div className="space-y-1">
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
                              errors.endDate && isSubmitting && "border-red-500",
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
                            initialFocus
                            disabled={(date) => {
                              if (!formData.startDate) return true

                              // Para contratos a plazo fijo, la fecha de fin debe ser al menos un día después de la fecha de inicio
                              const startDate = new Date(formData.startDate)
                              startDate.setHours(0, 0, 0, 0)
                              const compareDate = new Date(date)
                              compareDate.setHours(0, 0, 0, 0)

                              // Formatear fechas para comparación
                              const startDateFormatted = startDate.toISOString().split('T')[0]
                              const dateFormatted = compareDate.toISOString().split('T')[0]

                              // La fecha de fin debe ser posterior a la fecha de inicio
                              return dateFormatted <= startDateFormatted
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-muted-foreground">La fecha de fin debe ser posterior a la fecha de inicio</p>
                      {errors.endDate && isSubmitting && <p className="text-xs text-red-500">{errors.endDate}</p>}
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label htmlFor="position">
                      Cargo <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.position} onValueChange={(value) => handleChange("position", value)}>
                      <SelectTrigger className={errors.position && isSubmitting ? "border-red-500" : ""}>
                        <SelectValue placeholder="Seleccionar cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gerente">Gerente</SelectItem>
                        <SelectItem value="Supervisor">Supervisor</SelectItem>
                        <SelectItem value="Analista">Analista</SelectItem>
                        <SelectItem value="Asistente">Asistente</SelectItem>
                        <SelectItem value="Técnico">Técnico</SelectItem>
                        <SelectItem value="Operario">Operario</SelectItem>
                        <SelectItem value="Vendedor">Vendedor</SelectItem>
                        <SelectItem value="Recepcionista">Recepcionista</SelectItem>
                        <SelectItem value="Diseñador">Diseñador</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.position && isSubmitting && <p className="text-xs text-red-500">{errors.position}</p>}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="salary">
                        Salario <span className="text-red-500">*</span>
                      </Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5">
                              <HelpCircle className="h-3 w-3" />
                              <span className="sr-only">Ayuda</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">El salario debe estar entre S/. 1025 y S/. 5000 según normativa.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-2">
                        <span className="text-gray-500">S/</span>
                      </div>
                      <Input
                        id="salary"
                        value={formData.salary}
                        onChange={(e) => {
                          // Solo permitir números enteros (sin decimales)
                          const value = e.target.value;
                          if (value === "" || /^[0-9]*$/.test(value)) {
                            handleChange("salary", value);
                          }
                        }}
                        onKeyDown={(e) => {
                          // Prevenir entrada de caracteres no numéricos
                          if (!/[0-9]/.test(e.key) &&
                              e.key !== 'Backspace' &&
                              e.key !== 'Delete' &&
                              e.key !== 'ArrowLeft' &&
                              e.key !== 'ArrowRight' &&
                              e.key !== 'Tab') {
                            e.preventDefault();
                          }
                        }}
                        className={errors.salary && isSubmitting ? "border-red-500" :
                                  (formData.salary && Number(formData.salary.toString().replace(/[^0-9]/g, '')) < 1025) ? "border-red-500" : ""}
                        placeholder=""
                        inputMode="numeric"
                        type="text"
                      />
                    </div>
                    {errors.salary && isSubmitting && <p className="text-xs text-red-500">{errors.salary}</p>}
                    {formData.salary && Number(formData.salary.toString().replace(/[^0-9]/g, '')) > 0 && Number(formData.salary.toString().replace(/[^0-9]/g, '')) < 1025 &&
                      <p className="text-xs text-red-500">El sueldo mínimo es de S/. 1025</p>
                    }
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="department">
                      Departamento <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.department} onValueChange={(value) => handleChange("department", value)}>
                      <SelectTrigger className={errors.department && isSubmitting ? "border-red-500" : ""}>
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
                    {errors.department && isSubmitting && <p className="text-xs text-red-500">{errors.department}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="shift">
                      Turno <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.shift} onValueChange={(value) => handleChange("shift", value)}>
                      <SelectTrigger className={errors.shift && isSubmitting ? "border-red-500" : ""}>
                        <SelectValue placeholder="Seleccionar Turno" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mañana">Mañana</SelectItem>
                        <SelectItem value="Tarde">Tarde</SelectItem>
                        <SelectItem value="Noche">Noche</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.shift && isSubmitting && <p className="text-xs text-red-500">{errors.shift}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="workday">
                      Jornada <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.workday} onValueChange={(value) => handleChange("workday", value)}>
                      <SelectTrigger className={errors.workday && isSubmitting ? "border-red-500" : ""}>
                        <SelectValue placeholder="Seleccionar Jornada" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Jornada Completa">Jornada Completa</SelectItem>
                        <SelectItem value="Media Jornada">Media Jornada</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.workday && isSubmitting && <p className="text-xs text-red-500">{errors.workday}</p>}
                    {selectedSchedule && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Horario: {selectedSchedule}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="pension">
                      Pensión <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.pension} onValueChange={(value) => handleChange("pension", value)}>
                      <SelectTrigger className={errors.pension && isSubmitting ? "border-red-500" : ""}>
                        <SelectValue placeholder="Seleccionar Pensión" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AFP">AFP</SelectItem>
                        <SelectItem value="ONP">ONP</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.pension && isSubmitting && <p className="text-xs text-red-500">{errors.pension}</p>}
                  </div>
                </div>

                {errors.overlap && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error de solapamiento</AlertTitle>
                    <AlertDescription>{errors.overlap}</AlertDescription>
                  </Alert>
                )}

                <Alert className="mt-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Importante</AlertTitle>
                  <AlertDescription className="text-xs">
                    Todos los cambios en contratos quedan registrados con el usuario y fecha de modificación para fines
                    de auditoría.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between max-w-3xl mx-auto">
            {step === 1 ? (
              <>
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/contratos")}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button type="button" onClick={nextStep} disabled={!selectedWorker}>
                  Siguiente
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={prevStep}>
                  Anterior
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || (formData.salary ? (Number(formData.salary.toString().replace(/[^0-9]/g, '')) > 0 && Number(formData.salary.toString().replace(/[^0-9]/g, '')) < 1025) : false)}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar
                    </>
                  )}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
