"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Plus, Save, X, AlertCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TrabajadoresTable } from "@/components/trabajadores/TrabajadoresTable"
import { TrabajadorDetalles } from "@/components/trabajadores/TrabajadorDetalles"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { trabajadoresApi } from "@/services/api/trabajadores"
import { consultarDniReniec } from "@/services/api/reniec"
import { formatDate } from "@/services/utils/date-formatter"
import { useNotifications } from "@/context/NotificationContext"
import { useToastNotifications } from "@/context/ToastNotificationContext"
import { cn } from "@/lib/utils"

export default function WorkersPage() {
  const { addNotification } = useNotifications()
  const { showToast } = useToastNotifications()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [workers, setWorkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [workerToDelete, setWorkerToDelete] = useState<string | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [newWorkerDialogOpen, setNewWorkerDialogOpen] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<any>(null)
  const [editFormData, setEditFormData] = useState({
    email: "",
    phone: "",
    address: "",
    maritalStatus: "",
    children: "",
  })
  const [newWorkerFormData, setNewWorkerFormData] = useState({
    name: "",
    cedula: "",
    birthDate: undefined as Date | undefined,
    birthDateText: "",
    sex: "",
    email: "",
    phone: "",
    address: "",
    status: "Activo",
    maritalStatus: "",
    children: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newWorkerErrors, setNewWorkerErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmittingNewWorker, setIsSubmittingNewWorker] = useState(false)
  const [cedulaExists, setCedulaExists] = useState(false)
  const [isLoadingDni, setIsLoadingDni] = useState(false)
  const [dniError, setDniError] = useState("")

  // Función para recargar trabajadores
  const fetchWorkers = async () => {
    try {
      setLoading(true)
      const data = await trabajadoresApi.getAll()
      console.log('Datos recibidos en fetchWorkers:', data)

      // Transformar datos al formato esperado por la UI
      const formattedWorkers = data.map(worker => ({
        id: worker.id,
        name: worker.nombres_completos, // Mapear nombres_completos a name
        cedula: worker.cedula,
        birthDate: worker.fecha_nacimiento,
        age: worker.edad || 0,
        sex: worker.sexo || '',
        email: worker.email || '',
        phone: worker.celular || '',
        address: worker.direccion || '',
        department: worker.departamento || '',
        position: worker.cargo || '',
        salary: worker.salario || '',
        joinDate: worker.fecha_ingreso || '',
        status: worker.estado,
        inactiveReason: worker.motivo_inactividad || '',
        inactiveDetails: '',
        maritalStatus: worker.estado_civil || '',
        children: worker.numero_hijos !== undefined ? String(worker.numero_hijos) : '',
      }))

      setWorkers(formattedWorkers)
    } catch (error) {
      console.error('Error al cargar trabajadores:', error)
      toast.error('Error al cargar los trabajadores')
    } finally {
      setLoading(false)
    }
  }

  // Cargar trabajadores desde la API
  useEffect(() => {
    fetchWorkers()
  }, [])

  // Detectar parámetro URL para abrir modal de nuevo trabajador
  useEffect(() => {
    const nuevo = searchParams.get('nuevo')
    if (nuevo === 'true') {
      clearNewWorkerForm()
      setNewWorkerDialogOpen(true)
      // Limpiar el parámetro de la URL
      router.replace('/dashboard/trabajadores')
    }
  }, [searchParams, router])

  // Manejar eliminación
  const handleDeleteClick = (id: number) => {
    setWorkerToDelete(id.toString())
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (workerToDelete) {
      const worker = workers.find((w) => w.id === workerToDelete)

      if (worker && worker.status === "Retirado") {
        // No permitir eliminar trabajadores retirados
        setDeleteDialogOpen(false)
        return
      }

      try {
        await trabajadoresApi.delete(workerToDelete)
        setWorkers(workers.filter((worker) => worker.id !== workerToDelete))
        setDeleteDialogOpen(false)

        // Mostrar notificación de éxito
        toast.success("Trabajador eliminado correctamente")
      } catch (error) {
        console.error('Error al eliminar trabajador:', error)
        toast.error('Error al eliminar el trabajador')
        setDeleteDialogOpen(false)
      }
    }
  }

  // Manejar edición
  const handleEditClick = (id: number) => {
    const worker = workers.find((w) => w.id.toString() === id.toString())

    if (worker) {
      setSelectedWorker(worker)
      setEditFormData({
        email: worker.email || "",
        phone: worker.phone || "",
        address: worker.address || "",
        maritalStatus: worker.maritalStatus || "",
        children: worker.children || "",
      })
      setEditDialogOpen(true)
    }
  }

  // Manejar cambios en los campos del formulario de edición
  const handleChange = (field: string, value: string) => {
    setEditFormData({
      ...editFormData,
      [field]: value,
    })

    // Limpiar error del campo
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      })
    }
  }

  // Validar formulario de edición
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar estado civil
    if (!editFormData.maritalStatus.trim()) {
      newErrors.maritalStatus = "El estado civil es requerido"
    }

    // Validar número de hijos (si se ha ingresado)
    if (editFormData.children && isNaN(Number(editFormData.children))) {
      newErrors.children = "El número de hijos debe ser un valor numérico"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar envío del formulario de edición
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Actualizar trabajador
    if (selectedWorker) {
      try {
        // Preparar datos para la API
        const updateData = {
          name: selectedWorker.name,
          address: editFormData.address,
          phone: editFormData.phone,
          email: editFormData.email,
          maritalStatus: editFormData.maritalStatus,
          children: editFormData.children,
        }

        // Llamar a la API para actualizar
        await trabajadoresApi.update(selectedWorker.id, updateData)

        // Actualizar la lista local
        const updatedWorkers = workers.map((worker) => {
          if (worker.id === selectedWorker.id) {
            return {
              ...worker,
              email: editFormData.email,
              phone: editFormData.phone,
              address: editFormData.address,
              maritalStatus: editFormData.maritalStatus,
              children: editFormData.children,
            }
          }
          return worker
        })

        setWorkers(updatedWorkers)
        setIsSubmitting(false)
        setEditDialogOpen(false)

        // Mostrar notificación en la interfaz
        toast.success("Trabajador actualizado correctamente")

        // Agregar notificación al sistema de notificaciones
        addNotification(
          "Actualización de trabajador",
          `Se actualizaron los datos de ${selectedWorker.name}`,
          "success"
        )

        // Mostrar notificación temporal debajo del icono
        showToast(
          "Trabajador actualizado correctamente",
          `Se actualizaron los datos de ${selectedWorker.name}`,
          "success"
        )
      } catch (error) {
        console.error('Error al actualizar trabajador:', error)
        toast.error('Error al actualizar el trabajador')
        setIsSubmitting(false)
      }
    }
  }

  // Manejar vista detallada
  const handleViewClick = (id: number) => {
    const worker = workers.find((w) => w.id.toString() === id.toString())
    if (worker) {
      setSelectedWorker(worker)
      setViewDialogOpen(true)
    }
  }

  // Funciones para nuevo trabajador
  const calculateAge = (birthDateText: string) => {
    if (!birthDateText) return null
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(birthDateText)) return null

    const parts = birthDateText.split('/')
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10)

    const birthDate = new Date(year, month, day)
    if (isNaN(birthDate.getTime())) return null

    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  // Función para limpiar el formulario de nuevo trabajador
  const clearNewWorkerForm = () => {
    setNewWorkerFormData({
      name: "",
      cedula: "",
      birthDate: undefined,
      birthDateText: "",
      sex: "",
      email: "",
      phone: "",
      address: "",
      status: "Activo",
      maritalStatus: "",
      children: "",
    })
    setNewWorkerErrors({})
    setCedulaExists(false)
    setDniError("")
  }

  const handleNewWorkerChange = (field: string, value: string | Date | undefined) => {
    if (field === "cedula" && typeof value === "string") {
      setCedulaExists(value === "12345678")
    }

    setNewWorkerFormData({
      ...newWorkerFormData,
      [field]: value,
    })

    if (newWorkerErrors[field]) {
      setNewWorkerErrors({
        ...newWorkerErrors,
        [field]: "",
      })
    }
  }

  const validateNewWorkerForm = () => {
    const newErrors: Record<string, string> = {}
    const age = calculateAge(newWorkerFormData.birthDateText)
    const isUnderage = age !== null && age < 18

    if (!newWorkerFormData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }

    if (!newWorkerFormData.cedula.trim()) {
      newErrors.cedula = "La cédula es requerida"
    } else if (cedulaExists) {
      newErrors.cedula = "Esta cédula ya está registrada"
    }

    if (!newWorkerFormData.birthDateText) {
      newErrors.birthDate = "La fecha de nacimiento es requerida"
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(newWorkerFormData.birthDateText)) {
      newErrors.birthDate = "El formato debe ser DD/MM/AAAA"
    } else if (isUnderage) {
      newErrors.birthDate = "El trabajador debe ser mayor de 18 años"
    }

    if (!newWorkerFormData.sex) {
      newErrors.sex = "El sexo es requerido"
    }

    if (!newWorkerFormData.maritalStatus) {
      newErrors.maritalStatus = "El estado civil es requerido"
    }

    if (newWorkerFormData.children && isNaN(Number(newWorkerFormData.children))) {
      newErrors.children = "El número de hijos debe ser un valor numérico"
    }

    if (newWorkerFormData.phone && newWorkerFormData.phone.length > 0 && newWorkerFormData.phone.length !== 9) {
      newErrors.phone = "El número de celular debe tener exactamente 9 dígitos"
    }

    setNewWorkerErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNewWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateNewWorkerForm()) {
      return
    }

    setIsSubmittingNewWorker(true)

    try {
      let birthDate = undefined
      if (newWorkerFormData.birthDateText && /^\d{2}\/\d{2}\/\d{4}$/.test(newWorkerFormData.birthDateText)) {
        const parts = newWorkerFormData.birthDateText.split('/')
        birthDate = new Date(
          parseInt(parts[2]),
          parseInt(parts[1]) - 1,
          parseInt(parts[0])
        )
      }

      await trabajadoresApi.create({
        cedula: newWorkerFormData.cedula,
        name: newWorkerFormData.name,
        birthDate: birthDate,
        sex: newWorkerFormData.sex,
        email: newWorkerFormData.email,
        phone: newWorkerFormData.phone,
        address: newWorkerFormData.address,
        status: newWorkerFormData.status,
        maritalStatus: newWorkerFormData.maritalStatus,
        children: newWorkerFormData.children,
      })

      toast.success("Trabajador guardado correctamente")
      setNewWorkerDialogOpen(false)

      // Limpiar formulario
      clearNewWorkerForm()

      // Recargar lista de trabajadores
      await fetchWorkers()
    } catch (error) {
      console.error("Error al guardar el trabajador:", error)
      toast.error("Error al guardar el trabajador. Inténtelo de nuevo.")
    } finally {
      setIsSubmittingNewWorker(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado de la página */}

      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trabajadores</h1>
          <p className="text-muted-foreground">Gestiona la información de los trabajadores de la empresa.</p>
        </div>
        <Button onClick={() => {
          clearNewWorkerForm()
          setNewWorkerDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Trabajador
        </Button>
      </div>

      <TrabajadoresTable
        workers={workers}
        onViewClick={handleViewClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          onOpenAutoFocus={(e) => e.preventDefault()}
          aria-describedby="eliminar-trabajador-descripcion"
        >
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription id="eliminar-trabajador-descripcion">
              Esta acción no se puede deshacer. Esto eliminará permanentemente al trabajador y todos sus datos
              asociados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para ver detalles del trabajador */}
      <TrabajadorDetalles
        worker={selectedWorker}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      {/* Diálogo para editar trabajador */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent
          className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
          onOpenAutoFocus={(e) => e.preventDefault()}
          aria-describedby="editar-trabajador-descripcion"
        >
          <DialogHeader>
            <DialogTitle>Editar Trabajador</DialogTitle>
            <DialogDescription id="editar-trabajador-descripcion">
              Actualiza la información del trabajador. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>

          {selectedWorker && (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 py-4">
                {/* Campos no editables */}
                <div className="space-y-2">
                  <Label htmlFor="cedula-input">Cédula</Label>
                  <Input id="cedula-input" value={selectedWorker.cedula} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name-input">Nombre Completo</Label>
                  <Input id="name-input" value={selectedWorker.name} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate-input">Fecha de Nacimiento</Label>
                  <Input id="birthDate-input" value={formatDate(selectedWorker.birthDate)} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age-input">Edad</Label>
                  <Input id="age-input" value={`${selectedWorker.age} años`} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sex-input">Sexo</Label>
                  <Input
                    id="sex-input"
                    value={selectedWorker.sex || ""}
                    disabled
                    className="bg-muted"
                    placeholder=""
                  />
                </div>

                {/* Campos editables */}
                <div className="space-y-2">
                  <Label htmlFor="email-input">Correo Electrónico</Label>
                  <Input
                    id="email-input"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone-input">Celular</Label>
                  <Input
                    id="phone-input"
                    value={editFormData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address-input">Dirección</Label>
                  <Input
                    id="address-input"
                    value={editFormData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maritalStatus-select">
                    Estado Civil <span className="text-red-500">*</span>
                  </Label>
                  <Select value={editFormData.maritalStatus} onValueChange={(value) => handleChange("maritalStatus", value)}>
                    <SelectTrigger
                      id="maritalStatus-select"
                      className={errors.maritalStatus ? "border-red-500" : ""}
                      autoFocus={false}
                    >
                      <SelectValue placeholder="Seleccionar estado civil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soltero">Soltero</SelectItem>
                      <SelectItem value="Casado">Casado</SelectItem>
                      <SelectItem value="Divorciado">Divorciado</SelectItem>
                      <SelectItem value="Viudo">Viudo</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.maritalStatus && <p className="text-sm text-red-500">{errors.maritalStatus}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="children-input">Número de Hijos</Label>
                  <Input
                    id="children-input"
                    value={editFormData.children}
                    onChange={(e) => {
                      // Solo permitir números
                      const value = e.target.value;
                      if (value === "" || /^[0-9]*$/.test(value)) {
                        handleChange("children", value);
                      }
                    }}
                    className={errors.children ? "border-red-500" : ""}
                    placeholder="0"
                    inputMode="numeric"
                  />
                  {errors.children && <p className="text-sm text-red-500">{errors.children}</p>}
                </div>


              </div>

              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>
                  Los cambios en los datos personales del trabajador serán registrados en el sistema.
                </AlertDescription>
              </Alert>

              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para nuevo trabajador */}
      <Dialog open={newWorkerDialogOpen} onOpenChange={(open) => {
        if (!open) {
          // Cuando se cierra el modal, limpiar el formulario
          clearNewWorkerForm()
        }
        setNewWorkerDialogOpen(open)
      }}>
        <DialogContent
          className="sm:max-w-[650px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
          aria-describedby="nuevo-trabajador-descripcion"
        >
          <DialogHeader>
            <DialogTitle>Nuevo Trabajador</DialogTitle>
            <DialogDescription id="nuevo-trabajador-descripcion">
              Ingresa la información del nuevo trabajador. Los campos marcados con * son obligatorios.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleNewWorkerSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {/* DNI con búsqueda */}
              <div className="space-y-2">
                <Label htmlFor="new-cedula">
                  DNI (Cédula) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="new-cedula"
                    value={newWorkerFormData.cedula}
                    onChange={(e) => handleNewWorkerChange("cedula", e.target.value)}
                    className={cn(
                      "pr-10",
                      newWorkerErrors.cedula || cedulaExists ? "border-red-500" : ""
                    )}
                    maxLength={8}
                    placeholder="Ingrese 8 dígitos"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoadingDni || !newWorkerFormData.cedula || newWorkerFormData.cedula.length !== 8}
                    onClick={async () => {
                      try {
                        setIsLoadingDni(true)
                        setDniError("")

                        const datosReniec = await consultarDniReniec(newWorkerFormData.cedula)

                        const nuevoEstado = { ...newWorkerFormData }

                        if (datosReniec.data && datosReniec.data.nombres && datosReniec.data.apellidos) {
                          nuevoEstado.name = `${datosReniec.data.nombres} ${datosReniec.data.apellidos}`
                        } else if (datosReniec.nombres_completos) {
                          nuevoEstado.name = datosReniec.nombres_completos
                        }

                        let fechaFormateada = ''
                        if (datosReniec.data && datosReniec.data.fecha_nacimiento) {
                          if (datosReniec.data.fecha_nacimiento.includes('-')) {
                            const fechaParts = datosReniec.data.fecha_nacimiento.split('-')
                            if (fechaParts.length === 3) {
                              fechaFormateada = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`
                            }
                          }
                        } else if (datosReniec.fecha_nacimiento) {
                          if (datosReniec.fecha_nacimiento.includes('-')) {
                            const fechaParts = datosReniec.fecha_nacimiento.split('-')
                            if (fechaParts.length === 3) {
                              fechaFormateada = `${fechaParts[2]}/${fechaParts[1]}/${fechaParts[0]}`
                            }
                          } else if (datosReniec.fecha_nacimiento.includes('/')) {
                            fechaFormateada = datosReniec.fecha_nacimiento
                          }
                        }

                        if (fechaFormateada) {
                          nuevoEstado.birthDateText = fechaFormateada
                        }

                        if (datosReniec.data && datosReniec.data.sexo) {
                          nuevoEstado.sex = datosReniec.data.sexo.charAt(0).toUpperCase() + datosReniec.data.sexo.slice(1).toLowerCase()
                        } else if (datosReniec.sexo) {
                          nuevoEstado.sex = datosReniec.sexo.charAt(0).toUpperCase() + datosReniec.sexo.slice(1).toLowerCase()
                        }

                        setNewWorkerFormData(nuevoEstado)

                        try {
                          const trabajadores = await trabajadoresApi.getAll()
                          const existeTrabajador = trabajadores.some(t => t.cedula === newWorkerFormData.cedula)
                          setCedulaExists(existeTrabajador)
                        } catch (error) {
                          console.error("Error al verificar si el DNI existe:", error)
                        }

                      } catch (error) {
                        console.error("Error al consultar el DNI:", error)
                        setDniError("No se pudo obtener información para este DNI")
                      } finally {
                        setIsLoadingDni(false)
                      }
                    }}
                  >
                    {isLoadingDni ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {dniError && <p className="text-xs text-red-500">{dniError}</p>}
                {cedulaExists && <p className="text-xs text-red-500">¡Este DNI ya está registrado!</p>}
                {newWorkerErrors.cedula && <p className="text-xs text-red-500">{newWorkerErrors.cedula}</p>}
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="new-name">
                  Nombres y Apellidos <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="new-name"
                  value={newWorkerFormData.name}
                  onChange={(e) => handleNewWorkerChange("name", e.target.value)}
                  className={newWorkerErrors.name ? "border-red-500" : ""}
                />
                {newWorkerErrors.name && <p className="text-xs text-red-500">{newWorkerErrors.name}</p>}
              </div>

              {/* Fecha de Nacimiento */}
              <div className="space-y-2">
                <Label htmlFor="new-birthDate">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="new-birthDate"
                  value={newWorkerFormData.birthDateText}
                  onChange={(e) => {
                    let value = e.target.value
                    value = value.replace(/[^\d\/]/g, '')

                    const parts = value.split('/')
                    if (parts[0] && parts[0].length > 0) {
                      const day = parseInt(parts[0])
                      if (day > 31) parts[0] = "31"
                      else if (day === 0 && parts[0].length === 2) parts[0] = "01"
                    }

                    if (parts[1] && parts[1].length > 0) {
                      const month = parseInt(parts[1])
                      if (month > 12) parts[1] = "12"
                      else if (month === 0 && parts[1].length === 2) parts[1] = "01"
                    }

                    value = parts.join('/')
                    if (value.length <= 10) {
                      handleNewWorkerChange("birthDateText", value)
                    }
                  }}
                  className={newWorkerErrors.birthDate ? "border-red-500" : ""}
                  placeholder="DD/MM/AAAA"
                  maxLength={10}
                />
                {/* Mostrar edad calculada */}
                {newWorkerFormData.birthDateText && calculateAge(newWorkerFormData.birthDateText) !== null && (
                  <p className={`text-sm ${calculateAge(newWorkerFormData.birthDateText)! < 18 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    Edad: {calculateAge(newWorkerFormData.birthDateText)} años
                  </p>
                )}
                {newWorkerErrors.birthDate && <p className="text-xs text-red-500">{newWorkerErrors.birthDate}</p>}
              </div>

              {/* Sexo */}
              <div className="space-y-2">
                <Label htmlFor="new-sex">
                  Sexo <span className="text-red-500">*</span>
                </Label>
                <Select value={newWorkerFormData.sex} onValueChange={(value) => handleNewWorkerChange("sex", value)}>
                  <SelectTrigger className={newWorkerErrors.sex ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccionar sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                  </SelectContent>
                </Select>
                {newWorkerErrors.sex && <p className="text-xs text-red-500">{newWorkerErrors.sex}</p>}
              </div>

              {/* Estado Civil */}
              <div className="space-y-2">
                <Label htmlFor="new-maritalStatus">
                  Estado Civil <span className="text-red-500">*</span>
                </Label>
                <Select value={newWorkerFormData.maritalStatus} onValueChange={(value) => handleNewWorkerChange("maritalStatus", value)}>
                  <SelectTrigger className={newWorkerErrors.maritalStatus ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccionar estado civil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Soltero">Soltero</SelectItem>
                    <SelectItem value="Casado">Casado</SelectItem>
                    <SelectItem value="Divorciado">Divorciado</SelectItem>
                    <SelectItem value="Viudo">Viudo</SelectItem>
                  </SelectContent>
                </Select>
                {newWorkerErrors.maritalStatus && <p className="text-xs text-red-500">{newWorkerErrors.maritalStatus}</p>}
              </div>

              {/* Número de Hijos */}
              <div className="space-y-2">
                <Label htmlFor="new-children">Número de Hijos</Label>
                <Input
                  id="new-children"
                  value={newWorkerFormData.children}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === "" || /^[0-9]*$/.test(value)) {
                      handleNewWorkerChange("children", value)
                    }
                  }}
                  className={newWorkerErrors.children ? "border-red-500" : ""}
                  placeholder="0"
                  inputMode="numeric"
                />
                {newWorkerErrors.children && <p className="text-xs text-red-500">{newWorkerErrors.children}</p>}
              </div>

              {/* Celular */}
              <div className="space-y-2">
                <Label htmlFor="new-phone">Celular</Label>
                <Input
                  id="new-phone"
                  value={newWorkerFormData.phone}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === "" || (/^[0-9]*$/.test(value) && value.length <= 9)) {
                      handleNewWorkerChange("phone", value)
                    }
                  }}
                  className={newWorkerErrors.phone ? "border-red-500" : ""}
                  placeholder="987654321"
                  inputMode="numeric"
                  maxLength={9}
                />
                {newWorkerErrors.phone && <p className="text-xs text-red-500">{newWorkerErrors.phone}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="new-email">Correo Electrónico</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newWorkerFormData.email}
                  onChange={(e) => handleNewWorkerChange("email", e.target.value)}
                  placeholder="ejemplo@correo.com"
                />
              </div>

              {/* Dirección */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="new-address">Dirección</Label>
                <Input
                  id="new-address"
                  value={newWorkerFormData.address}
                  onChange={(e) => handleNewWorkerChange("address", e.target.value)}
                  placeholder="Dirección completa"
                />
              </div>
            </div>

            {/* Alerta de menor de edad */}
            {newWorkerFormData.birthDateText && calculateAge(newWorkerFormData.birthDateText) !== null && calculateAge(newWorkerFormData.birthDateText)! < 18 ? (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Menor de Edad</AlertTitle>
                <AlertDescription>
                  El trabajador debe ser mayor de 18 años para poder ser registrado en el sistema.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>
                  Los cambios en datos personales generarán una notificación automática al departamento de RRHH.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => {
                clearNewWorkerForm()
                setNewWorkerDialogOpen(false)
              }}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmittingNewWorker ||
                  Boolean(newWorkerFormData.birthDateText && calculateAge(newWorkerFormData.birthDateText) !== null && calculateAge(newWorkerFormData.birthDateText)! < 18)
                }
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmittingNewWorker ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
