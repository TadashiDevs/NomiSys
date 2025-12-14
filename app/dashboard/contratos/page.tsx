"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Trash2, FileEdit, Eye, Save, X, AlertCircle } from "lucide-react"

// Función para formatear fechas en formato dd/mm/aaaa
const formatDate = (dateString: string): string => {
  if (!dateString || dateString === 'N/A') return 'N/A';

  try {
    // Limpiar la fecha si contiene información de zona horaria o milisegundos
    let cleanDateString = dateString;

    // Si la fecha tiene formato con hora y milisegundos (como en la imagen)
    if (dateString.includes('T00:00:00.000000Z')) {
      cleanDateString = dateString.split('T')[0];
    }

    // Verificar si la fecha incluye hora (formato ISO)
    if (cleanDateString.includes('T') || cleanDateString.includes(':')) {
      const date = new Date(cleanDateString);
      if (isNaN(date.getTime())) throw new Error('Fecha inválida');

      // Formatear como dd/mm/aaaa
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // Si la fecha ya está en formato yyyy-mm-dd
    if (cleanDateString.includes('-')) {
      const parts = cleanDateString.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
      }
    }

    // Si ya está en formato dd/mm/aaaa, devolverla tal cual
    if (cleanDateString.includes('/')) {
      return cleanDateString;
    }

    return cleanDateString;
  } catch (error) {
    console.error('Error al formatear fecha:', error, dateString);
    return dateString; // Devolver la fecha original si hay error
  }
}
import { Button } from "@/components/ui/button"
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
import { ContratosTable } from "@/components/contratos/ContratosTable"
import { ContratoDetalles } from "@/components/contratos/ContratoDetalles"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { contratosApi } from "@/services/api/contratos"
import { useNotifications } from "@/context/NotificationContext"
import { useToastNotifications } from "@/context/ToastNotificationContext"

export default function ContractsPage() {
  const router = useRouter()
  const { addNotification } = useNotifications()
  const { showToast } = useToastNotifications()
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [finishDialogOpen, setFinishDialogOpen] = useState(false)
  const [contractToDelete, setContractToDelete] = useState<string | null>(null)
  const [selectedContract, setSelectedContract] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState("")

  // Cargar contratos desde la API
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true)
        const data = await contratosApi.getAll()
        // Logs eliminados para mejorar el rendimiento

        // Transformar datos al formato esperado por la UI
        const formattedContracts = data.map(contract => {
          // Usar una aserción de tipo para acceder a propiedades que pueden venir del backend
          const contractData = contract as any;

          // Determinar el tipo de contrato (puede venir como 'tipo' del backend)
          const contractType = contractData.type || contractData.tipo || 'Indefinido';

          // Determinar las fechas (pueden venir con nombres diferentes del backend)
          const rawStartDate = contractData.startDate || contractData.fecha_inicio || 'N/A';
          const rawEndDate = contractData.endDate || contractData.fecha_fin || null;

          // Formatear fechas en formato dd/mm/aaaa
          const startDate = formatDate(rawStartDate);
          const endDate = rawEndDate ? formatDate(rawEndDate) : null;

          // Determinar el estado (puede venir como 'estado' del backend)
          const status = contractData.status || contractData.estado || 'Activo';

          // Determinar el salario (asegurarse de que sea un string)
          const salary = contractData.salary ?
            (typeof contractData.salary === 'string' ? contractData.salary : `${contractData.salary}`) :
            (contractData.salario ? `${contractData.salario}` : '0');

          // Obtener información del trabajador directamente del objeto de contrato
          // En la respuesta del backend, el objeto trabajador viene anidado
          let workerName = 'No asignado';
          let cedula = 'No disponible';

          // Verificar si el contrato tiene información del trabajador anidada
          if (contractData.trabajador) {
            workerName = contractData.trabajador.nombres_completos || contractData.trabajador.name || `ID: ${contractData.trabajador.id}`;
            cedula = contractData.trabajador.cedula || contractData.trabajador.documento || 'No disponible';
          }

          // Obtener departamento y cargo
          let department = 'No asignado';
          let position = 'No asignado';
          let shift = 'No asignado';
          let workday = 'No asignado';
          let pension = 'No asignado';

          // Obtener departamento directamente del contrato (no del trabajador)
          department = contractData.department || contractData.departamento || 'No asignado';

          // Obtener cargo del contrato
          position = contractData.position || contractData.cargo || 'No asignado';

          console.log('Datos del contrato:', {
            id: contractData.id,
            department: department,
            departamento: contractData.departamento,
            position: position
          });

          // Obtener turno, jornada y pensión
          shift = contractData.shift || contractData.turno || 'No asignado';
          workday = contractData.workday || contractData.jornada || 'No asignado';
          pension = contractData.pension || contractData.sistema_pension || 'No asignado';

          return {
            id: contractData.id,
            worker: workerName,
            cedula: cedula,
            department: department,
            position: position,
            workerId: contractData.workerId || contractData.trabajador_id,
            type: contractType,
            startDate: startDate,
            endDate: endDate,
            shift: shift,
            workday: workday,
            salary: salary.includes('S/.') ? salary : `S/. ${salary}`,
            pension: pension,
            status: status,
            hasPayrolls: false, // Por defecto asumimos que no tiene nóminas
          }
        })

        setContracts(formattedContracts)
      } catch (error) {
        console.error('Error al cargar contratos:', error)
        toast.error('Error al cargar los contratos')
      } finally {
        setLoading(false)
      }
    }

    fetchContracts()
  }, [])

  // Filtrar contratos
  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = contract.worker.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || contract.type === typeFilter
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  // Manejar eliminación
  const handleDeleteClick = (id: string) => {
    const contract = contracts.find((c) => c.id === id)

    if (contract && contract.hasPayrolls) {
      setErrorMessage("No se puede eliminar este contrato porque tiene nóminas asociadas.")
      setDeleteDialogOpen(true)
      return
    }

    setContractToDelete(id)
    setErrorMessage("")
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (contractToDelete && !errorMessage) {
      try {
        await contratosApi.delete(contractToDelete)
        setContracts(contracts.filter((contract) => contract.id !== contractToDelete))
        toast.success("Contrato eliminado correctamente")
      } catch (error) {
        console.error('Error al eliminar contrato:', error)
        toast.error('Error al eliminar el contrato')
      }
    }
    setDeleteDialogOpen(false)
  }

  // Manejar finalización de contrato
  const handleFinishClick = (id: string) => {
    const contract = contracts.find((c) => c.id === id)

    if (contract && contract.status !== "Activo") {
      // No permitir finalizar contratos que ya están finalizados
      return
    }

    if (contract) {
      setSelectedContract(contract)
      setFinishDialogOpen(true)
    }
  }

  // Confirmar finalización de contrato
  const confirmFinish = async () => {
    if (selectedContract) {
      try {
        const today = new Date()
        const formattedToday = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`

        // Usar el método finalize en lugar de update
        await contratosApi.finalize(selectedContract.id)

        // Actualizar la lista local
        const updatedContracts = contracts.map((contract) => {
          if (contract.id === selectedContract.id) {
            return {
              ...contract,
              status: "Finalizado",
              endDate: formattedToday
            }
          }
          return contract
        })

        setContracts(updatedContracts)
        setFinishDialogOpen(false)

        // Mostrar notificación en la interfaz
        toast.success("Contrato finalizado correctamente")

        // Agregar notificación al sistema de notificaciones
        addNotification(
          "Contrato finalizado",
          `El contrato de ${selectedContract.worker} ha sido finalizado`,
          "warning"
        )

        // Mostrar notificación temporal debajo del icono
        showToast(
          "Contrato finalizado correctamente",
          `El contrato de ${selectedContract.worker} ha sido finalizado`,
          "warning"
        )
      } catch (error) {
        console.error('Error al finalizar contrato:', error)
        toast.error('Error al finalizar el contrato')
      }
    }
  }



  // Manejar vista detallada
  const handleViewClick = (id: string) => {
    const contract = contracts.find((c) => c.id === id)
    if (contract) {
      // Asegurarse de que todos los campos necesarios estén presentes
      const completeContract = {
        ...contract,
        department: contract.department || "No asignado",
        position: contract.position || "No asignado",
        shift: contract.shift || "No asignado",
        workday: contract.workday || "No asignado",
        pension: contract.pension || "No asignado"
      }
      setSelectedContract(completeContract)
      setViewDialogOpen(true)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contratos</h1>
          <p className="text-muted-foreground">Gestiona los contratos laborales de los trabajadores.</p>
        </div>
        <Link href="/dashboard/contratos/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Contrato
          </Button>
        </Link>
      </div>

      <ContratosTable
        contracts={filteredContracts}
        onViewClick={handleViewClick}
        onFinishClick={handleFinishClick}
        onDeleteClick={handleDeleteClick}
      />

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          onOpenAutoFocus={(e) => e.preventDefault()}
          aria-describedby="eliminar-contrato-descripcion"
        >
          <DialogHeader>
            <DialogTitle>{errorMessage ? "No se puede eliminar" : "¿Estás seguro?"}</DialogTitle>
            <DialogDescription id="eliminar-contrato-descripcion">
              {errorMessage ||
                "Esta acción no se puede deshacer. Esto eliminará permanentemente el contrato y todos sus datos asociados."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {errorMessage ? "Aceptar" : "Cancelar"}
            </Button>
            {!errorMessage && (
              <Button variant="destructive" onClick={confirmDelete}>
                Eliminar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para ver detalles del contrato */}
      <ContratoDetalles
        contract={selectedContract}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      {/* Diálogo de confirmación para finalizar contrato */}
      <Dialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          onOpenAutoFocus={(e) => e.preventDefault()}
          aria-describedby="finalizar-contrato-descripcion"
        >
          <DialogHeader>
            <DialogTitle>Finalizar Contrato</DialogTitle>
            <DialogDescription id="finalizar-contrato-descripcion">
              ¿Estás seguro de que deseas finalizar este contrato? Esta acción cambiará el estado del contrato a "Finalizado" y establecerá la fecha de fin como la fecha actual.
            </DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <div className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Trabajador</Label>
                  <p className="text-sm font-medium">{selectedContract.worker}</p>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Contrato</Label>
                  <p className="text-sm font-medium">{selectedContract.type}</p>
                </div>

                <div className="space-y-2">
                  <Label>Fecha de Inicio</Label>
                  <p className="text-sm font-medium">{selectedContract.startDate}</p>
                </div>

                <div className="space-y-2">
                  <Label>Nueva Fecha de Fin</Label>
                  <p className="text-sm font-medium">
                    {new Date().getDate().toString().padStart(2, '0')}/
                    {(new Date().getMonth() + 1).toString().padStart(2, '0')}/
                    {new Date().getFullYear()}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setFinishDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={confirmFinish}>
              Finalizar Contrato
            </Button>
          </DialogFooter>



        </DialogContent>
      </Dialog>
    </div>
  )
}
