"use client"

import { useState, useEffect } from "react"
import { Calculator, User, Calendar, Clock, Search, FileText, DollarSign, Users, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { trabajadoresApi, type Trabajador } from "@/services/api/trabajadores"
import { contratosApi, type Contrato } from "@/services/api/contratos"
import { nominasApi, formatearMoneda } from "@/services/api/nominas"

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

interface CalcularNominaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function CalcularNominaDialog({ open, onOpenChange, onSuccess }: CalcularNominaDialogProps) {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([])
  const [loading, setLoading] = useState(false)
  const [calculando, setCalculando] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [selectedTrabajador, setSelectedTrabajador] = useState<Trabajador | null>(null)
  const [contratoActivo, setContratoActivo] = useState<Contrato | null>(null)
  const [loadingContrato, setLoadingContrato] = useState(false)
  const [formData, setFormData] = useState({
    trabajador_id: 'ninguno',
    ano: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    horas_extras_diurnas: 0,
    horas_extras_nocturnas: 0
  })
  const [resultado, setResultado] = useState<any>(null)

  // Cargar trabajadores al abrir el diálogo
  useEffect(() => {
    if (open) {
      cargarTrabajadores()
      setResultado(null)
      setSearchTerm('')
      setShowResults(false)
      setSelectedTrabajador(null)
      setContratoActivo(null)
    }
  }, [open])

  const cargarTrabajadores = async () => {
    setLoading(true)
    try {
      const data = await trabajadoresApi.obtenerTodos()
      console.log('Trabajadores cargados:', data) // Debug
      setTrabajadores(data || [])
    } catch (error) {
      console.error('Error al cargar trabajadores:', error) // Debug
      toast.error('Error al cargar trabajadores')
      setTrabajadores([])
    } finally {
      setLoading(false)
    }
  }

  // Filtrar trabajadores según el término de búsqueda
  const trabajadoresFiltrados = trabajadores.filter(trabajador => {
    const termino = searchTerm.toLowerCase()
    const nombre = trabajador.nombres_completos?.toLowerCase() || ''
    const cedula = trabajador.cedula?.toLowerCase() || ''
    return nombre.includes(termino) || cedula.includes(termino)
  })

  // Cargar contrato activo del trabajador seleccionado
  const cargarContratoActivo = async (trabajadorId: string) => {
    setLoadingContrato(true)
    try {
      const contratos = await contratosApi.getByWorkerId(parseInt(trabajadorId))
      const contratoActivo = contratos.find(c => c.estado === 'Activo' || c.status === 'Activo')
      setContratoActivo(contratoActivo || null)
    } catch (error) {
      console.error('Error al cargar contrato:', error)
      setContratoActivo(null)
    } finally {
      setLoadingContrato(false)
    }
  }

  // Manejar selección de trabajador
  const handleSelectTrabajador = (trabajador: Trabajador) => {
    setSelectedTrabajador(trabajador)
    setFormData(prev => ({ ...prev, trabajador_id: trabajador.id }))
    setSearchTerm(`${trabajador.nombres_completos} - ${trabajador.cedula}`)
    setShowResults(false)
    cargarContratoActivo(trabajador.id)
  }

  // Ejecutar búsqueda
  const ejecutarBusqueda = () => {
    if (searchTerm.trim()) {
      setShowResults(true)
    }
  }

  // Manejar búsqueda con Enter
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      ejecutarBusqueda()
    }
  }

  // Manejar clic en lupa
  const handleSearchClick = () => {
    ejecutarBusqueda()
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calcularNomina = async () => {
    if (!selectedTrabajador) {
      toast.error('Selecciona un trabajador')
      return
    }

    if (!contratoActivo) {
      toast.error('El trabajador seleccionado no tiene un contrato activo')
      return
    }

    setCalculando(true)
    try {
      const result = await nominasApi.calcular({
        trabajador_id: parseInt(selectedTrabajador.id),
        ano: formData.ano,
        mes: formData.mes,
        horas_extras_diurnas: formData.horas_extras_diurnas,
        horas_extras_nocturnas: formData.horas_extras_nocturnas
      })

      if (result.success) {
        setResultado(result.data)
        toast.success('Nómina calculada exitosamente')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Error al calcular la nómina')
    } finally {
      setCalculando(false)
    }
  }

  const confirmarCalculo = () => {
    onSuccess()
    onOpenChange(false)
    setFormData({
      trabajador_id: 'ninguno',
      ano: new Date().getFullYear(),
      mes: new Date().getMonth() + 1,
      horas_extras_diurnas: 0,
      horas_extras_nocturnas: 0
    })
    setResultado(null)
    setSearchTerm('')
    setShowResults(false)
    setSelectedTrabajador(null)
    setContratoActivo(null)
  }

  // Generar años y meses
  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
  const meses = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calcular Nómina Individual
          </DialogTitle>
          <DialogDescription>
            Calcula la nómina para un trabajador específico en un período determinado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formulario */}
          <div className="grid gap-4">
            {/* Buscador de trabajador */}
            <div className="space-y-2">
              <Label htmlFor="trabajador">Trabajador *</Label>
              <div className="relative">
                <Input
                  placeholder="Buscar por DNI o nombre del trabajador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  disabled={loading}
                  className="pr-10"
                />
                <Search
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={handleSearchClick}
                />
              </div>

              {/* Lista de resultados de búsqueda */}
              {showResults && searchTerm && !selectedTrabajador && trabajadoresFiltrados.length > 0 && (
                <Card className="max-h-40 overflow-y-auto">
                  <CardContent className="p-2">
                    {trabajadoresFiltrados.slice(0, 5).map((trabajador) => (
                      <div
                        key={trabajador.id}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                        onClick={() => handleSelectTrabajador(trabajador)}
                      >
                        <div>
                          <p className="font-medium text-sm">{trabajador.nombres_completos}</p>
                          <p className="text-xs text-muted-foreground">DNI: {trabajador.cedula}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Seleccionar
                        </Button>
                      </div>
                    ))}
                    {trabajadoresFiltrados.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center p-2">
                        Y {trabajadoresFiltrados.length - 5} más...
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Mensaje si no hay resultados */}
              {searchTerm && trabajadoresFiltrados.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No se encontraron trabajadores con ese criterio de búsqueda.
                </p>
              )}

              {/* Error al cargar trabajadores */}
              {!loading && trabajadores.length === 0 && (
                <p className="text-sm text-red-500">
                  ⚠️ Error al cargar trabajadores. Verifica la conexión con la API.
                </p>
              )}
            </div>

            {/* Período */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ano">Año *</Label>
                <Select
                  value={formData.ano.toString()}
                  onValueChange={(value) => handleInputChange('ano', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {anos.map(ano => (
                      <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mes">Mes *</Label>
                <Select 
                  value={formData.mes.toString()} 
                  onValueChange={(value) => handleInputChange('mes', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map(mes => (
                      <SelectItem key={mes.value} value={mes.value.toString()}>{mes.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Horas extras */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horas_diurnas">Horas Extras Diurnas</Label>
                <Input
                  id="horas_diurnas"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.horas_extras_diurnas}
                  onChange={(e) => handleInputChange('horas_extras_diurnas', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horas_nocturnas">Horas Extras Nocturnas</Label>
                <Input
                  id="horas_nocturnas"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.horas_extras_nocturnas}
                  onChange={(e) => handleInputChange('horas_extras_nocturnas', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Información del trabajador y contrato seleccionado */}
          {selectedTrabajador && (
            <div className="space-y-4">
              {/* Información del Trabajador */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Información del Trabajador
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground">Nombre:</span>
                      <p className="font-medium">{selectedTrabajador.nombres_completos}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">DNI:</span>
                      <p className="font-medium">{selectedTrabajador.cedula}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estado Civil:</span>
                      <p className="font-medium">{selectedTrabajador.estado_civil || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Número de Hijos:</span>
                      <p className="font-medium">{selectedTrabajador.numero_hijos || 0}</p>
                    </div>
                  </div>

                  {/* Información relevante para cálculo de asignación familiar */}
                  {selectedTrabajador.numero_hijos > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm font-medium">Elegible para Asignación Familiar</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        10% de la RMV (S/ 102.50) por tener hijos a cargo
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Información del Contrato */}
              {loadingContrato ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm text-muted-foreground">Cargando información del contrato...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : contratoActivo ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Contrato Activo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground">Cargo:</span>
                        <p className="font-medium">{contratoActivo.cargo || contratoActivo.position || 'No especificado'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Departamento:</span>
                        <p className="font-medium">{contratoActivo.departamento || contratoActivo.department || 'No especificado'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tipo de Contrato:</span>
                        <p className="font-medium">{contratoActivo.tipo || contratoActivo.type || 'No especificado'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Jornada:</span>
                        <p className="font-medium">{contratoActivo.jornada || contratoActivo.workday || 'No especificado'}</p>
                        {/* Mostrar horario específico */}
                        {(contratoActivo.turno || contratoActivo.shift) && (contratoActivo.jornada || contratoActivo.workday) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {getScheduleForShiftAndWorkday(
                              contratoActivo.turno || contratoActivo.shift || '',
                              contratoActivo.jornada || contratoActivo.workday || ''
                            )}
                          </p>
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Turno:</span>
                        <p className="font-medium">{contratoActivo.turno || contratoActivo.shift || 'No especificado'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sistema de Pensión:</span>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{contratoActivo.pension || contratoActivo.pensionSystem || 'No especificado'}</p>
                          <Badge variant={contratoActivo.pension === 'AFP' ? 'default' : 'secondary'} className="text-xs">
                            {contratoActivo.pension === 'AFP' ? '10%' : contratoActivo.pension === 'ONP' ? '13%' : ''}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Salario base */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-700">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-sm font-medium">Salario Base</span>
                        </div>
                        <span className="text-lg font-bold text-blue-700">
                          {formatearMoneda(contratoActivo.salario || contratoActivo.salary || 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-red-700">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">Sin Contrato Activo</span>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                      Este trabajador no tiene un contrato activo. No se puede calcular la nómina.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Resultado del cálculo */}
          {resultado && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-green-600">✓ Nómina Calculada Exitosamente</CardTitle>
                <CardDescription>
                  {resultado.trabajador_nombre} - {resultado.periodo}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Ingresos</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Salario Base:</span>
                        <span className="font-mono">{formatearMoneda(resultado.salario_base)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Asignación Familiar:</span>
                        <span className="font-mono">{formatearMoneda(resultado.auxilio_transporte)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Horas Extras:</span>
                        <span className="font-mono">
                          {formatearMoneda(resultado.valor_horas_extras_diurnas + resultado.valor_horas_extras_nocturnas)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-1">
                        <span>Total Ingresos:</span>
                        <span className="font-mono">{formatearMoneda(resultado.total_devengados)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-red-600 mb-2">Deducciones</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Sistema Pensión:</span>
                        <span className="font-mono">{formatearMoneda(resultado.descuento_pension)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retención 5ta Cat.:</span>
                        <span className="font-mono">{formatearMoneda(resultado.retencion_fuente)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Otras Deducciones:</span>
                        <span className="font-mono">{formatearMoneda(resultado.otras_deducciones || 0)}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-1">
                        <span>Total Deducciones:</span>
                        <span className="font-mono">{formatearMoneda(resultado.total_deducciones)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Neto a Pagar:</span>
                    <span className="font-mono text-green-600">
                      {formatearMoneda(resultado.neto_pagar)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          {!resultado ? (
            <Button
              onClick={calcularNomina}
              disabled={calculando || !selectedTrabajador || !contratoActivo}
              className="gap-2"
            >
              {calculando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Calculando...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4" />
                  Calcular Nómina
                </>
              )}
            </Button>
          ) : (
            <Button onClick={confirmarCalculo} className="gap-2">
              <Calendar className="h-4 w-4" />
              Confirmar y Cerrar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
