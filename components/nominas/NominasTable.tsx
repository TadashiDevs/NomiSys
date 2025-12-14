"use client"

import { useState } from "react"
import { Search, Eye, CreditCard, Filter, Calendar, CheckCircle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { type Nomina, formatearMoneda, nominasApi } from "@/services/api/nominas"
import { BoletaPagoService } from "@/services/pdf/boletaPagoService"
import DetalleNominaDialog from "./DetalleNominaDialog"

interface NominasTableProps {
  nominas: Nomina[]
  loading: boolean
  filtros: {
    ano: number
    mes: number
    estado: string
  }
  onFiltrosChange: (filtros: any) => void
  onRecargar: () => void
}

export default function NominasTable({ 
  nominas, 
  loading, 
  filtros, 
  onFiltrosChange, 
  onRecargar 
}: NominasTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [procesandoPago, setProcesandoPago] = useState<number | null>(null)
  const [nominaSeleccionada, setNominaSeleccionada] = useState<Nomina | null>(null)
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false)

  // Filtrar nóminas por término de búsqueda
  const nominasFiltradas = nominas.filter(nomina =>
    nomina.trabajador_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nomina.trabajador_cedula.includes(searchTerm)
  )

  // Manejar cambio de filtros
  const handleFiltroChange = (key: string, value: string) => {
    onFiltrosChange({
      ...filtros,
      [key]: key === 'ano' || key === 'mes' ? parseInt(value) : value
    })
  }

  // Marcar como verificada
  const marcarComoVerificada = async (nominaId: number) => {
    setProcesandoPago(nominaId)
    try {
      const result = await nominasApi.marcarVerificada(nominaId)
      if (result.success) {
        toast.success('Nómina verificada exitosamente')
        onRecargar()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Error al verificar la nómina')
    } finally {
      setProcesandoPago(null)
    }
  }

  // Marcar como pagada
  const marcarComoPagada = async (nominaId: number) => {
    setProcesandoPago(nominaId)
    try {
      const result = await nominasApi.marcarPagada(nominaId)
      if (result.success) {
        toast.success('Nómina marcada como pagada')
        onRecargar()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Error al marcar la nómina como pagada')
    } finally {
      setProcesandoPago(null)
    }
  }

  // Ver detalle de nómina
  const verDetalleNomina = (nomina: Nomina) => {
    setNominaSeleccionada(nomina)
    setModalDetalleAbierto(true)
  }

  // Generar boleta PDF
  const generarBoletaPDF = async (nominaId: number) => {
    try {
      // Buscar la nómina en la lista actual
      const nomina = nominas.find(n => n.id === nominaId)
      if (!nomina) {
        toast.error('No se encontró la información de la nómina')
        return
      }

      // Generar y descargar el PDF
      await BoletaPagoService.generarBoletaPDF(nomina)
      toast.success('Boleta de pago generada y descargada exitosamente')

    } catch (error) {
      console.error('Error al generar PDF:', error)
      toast.error('Error al generar la boleta de pago')
    }
  }

  // Generar años para el filtro
  const anosDisponibles = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
  
  // Generar meses
  const meses = [
    { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={filtros.ano.toString()} onValueChange={(value) => handleFiltroChange('ano', value)}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent>
            {anosDisponibles.map(ano => (
              <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtros.mes.toString()} onValueChange={(value) => handleFiltroChange('mes', value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Mes" />
          </SelectTrigger>
          <SelectContent>
            {meses.map(mes => (
              <SelectItem key={mes.value} value={mes.value.toString()}>{mes.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtros.estado} onValueChange={(value) => handleFiltroChange('estado', value)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="Calculada">Calculada</SelectItem>
            <SelectItem value="Verificada">Verificada</SelectItem>
            <SelectItem value="Pagada">Pagada</SelectItem>
            <SelectItem value="Anulada">Anulada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trabajador</TableHead>
              <TableHead>Cédula</TableHead>
              <TableHead>Período</TableHead>
              <TableHead className="text-right">Ingresos</TableHead>
              <TableHead className="text-right">Deducciones</TableHead>
              <TableHead className="text-right">Neto a Pagar</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nominasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  {nominas.length === 0 
                    ? "No hay nóminas calculadas para este período"
                    : "No se encontraron nóminas con los filtros aplicados"
                  }
                </TableCell>
              </TableRow>
            ) : (
              nominasFiltradas.map((nomina) => (
                <TableRow key={nomina.id}>
                  <TableCell className="font-medium">
                    {nomina.trabajador_nombre}
                  </TableCell>
                  <TableCell>{nomina.trabajador_cedula}</TableCell>
                  <TableCell>{nomina.periodo}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatearMoneda(nomina.total_devengados)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatearMoneda(nomina.total_deducciones)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {formatearMoneda(nomina.neto_pagar)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        nomina.estado === "Pagada"
                          ? "success"
                          : nomina.estado === "Verificada"
                          ? "secondary"
                          : nomina.estado === "Calculada"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {nomina.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => verDetalleNomina(nomina)}
                      >
                        <Eye className="h-3 w-3" />
                        Ver
                      </Button>

                      {nomina.estado === 'Calculada' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => marcarComoVerificada(nomina.id)}
                          disabled={procesandoPago === nomina.id}
                        >
                          <CheckCircle className="h-3 w-3" />
                          {procesandoPago === nomina.id ? 'Verificando...' : 'Verificar'}
                        </Button>
                      )}

                      {nomina.estado === 'Verificada' && (
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-1"
                          onClick={() => marcarComoPagada(nomina.id)}
                          disabled={procesandoPago === nomina.id}
                        >
                          <CreditCard className="h-3 w-3" />
                          {procesandoPago === nomina.id ? 'Procesando...' : 'Pagar'}
                        </Button>
                      )}

                      {nomina.estado === 'Pagada' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => generarBoletaPDF(nomina.id)}
                        >
                          <FileText className="h-3 w-3" />
                          PDF
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Resumen */}
      {nominasFiltradas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumen del Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Nóminas</p>
                <p className="font-bold">{nominasFiltradas.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Ingresos</p>
                <p className="font-bold">
                  {formatearMoneda(nominasFiltradas.reduce((sum, n) => sum + n.total_devengados, 0))}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Deducciones</p>
                <p className="font-bold">
                  {formatearMoneda(nominasFiltradas.reduce((sum, n) => sum + n.total_deducciones, 0))}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Neto</p>
                <p className="font-bold text-green-600">
                  {formatearMoneda(nominasFiltradas.reduce((sum, n) => sum + n.neto_pagar, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de detalle */}
      <DetalleNominaDialog
        nomina={nominaSeleccionada}
        open={modalDetalleAbierto}
        onOpenChange={setModalDetalleAbierto}
      />
    </div>
  )
}
