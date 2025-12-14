"use client"

import { useState, useEffect } from "react"
import { Plus, Calculator, FileText, DollarSign, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { nominasApi, formatearMoneda, formatearPeriodo, type Nomina } from "@/services/api/nominas"
import NominasTable from "@/components/nominas/NominasTable"
import CalcularNominaDialog from "@/components/nominas/CalcularNominaDialog"
import CalcularMasivoDialog from "@/components/nominas/CalcularMasivoDialog"
import EstadisticasNominas from "@/components/nominas/EstadisticasNominas"

export default function NominasPage() {
  const [nominas, setNominas] = useState<Nomina[]>([])
  const [loading, setLoading] = useState(true)
  const [showCalcularDialog, setShowCalcularDialog] = useState(false)
  const [showCalcularMasivoDialog, setShowCalcularMasivoDialog] = useState(false)
  const [filtros, setFiltros] = useState({
    ano: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    estado: 'todos'
  })

  // Cargar nóminas
  const cargarNominas = async () => {
    setLoading(true)
    try {
      const data = await nominasApi.obtenerTodas(filtros)
      setNominas(data)
    } catch (error) {
      console.error('Error al cargar nóminas:', error)
      toast.error('Error al cargar las nóminas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarNominas()
  }, [filtros])

  // Manejar cálculo exitoso
  const handleCalculoExitoso = () => {
    cargarNominas()
    setShowCalcularDialog(false)
    setShowCalcularMasivoDialog(false)
  }

  // Estadísticas rápidas
  const estadisticas = {
    total: nominas.length,
    calculadas: nominas.filter(n => n.estado === 'Calculada').length,
    pagadas: nominas.filter(n => n.estado === 'Pagada').length,
    totalNeto: nominas.reduce((sum, n) => sum + n.neto_pagar, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Nóminas</h1>
          <p className="text-muted-foreground">
            Calcula y gestiona las nóminas de los trabajadores
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowCalcularDialog(true)}
            className="gap-2"
          >
            <Calculator className="h-4 w-4" />
            Calcular Individual
          </Button>
          <Button 
            onClick={() => setShowCalcularMasivoDialog(true)}
            variant="outline"
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Calcular Masivo
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nóminas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.total}</div>
            <p className="text-xs text-muted-foreground">
              {formatearPeriodo(filtros.año, filtros.mes)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calculadas</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.calculadas}</div>
            <p className="text-xs text-muted-foreground">
              Pendientes de pago
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagadas</CardTitle>
            <Badge variant="success" className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.pagadas}</div>
            <p className="text-xs text-muted-foreground">
              Completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Neto</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatearMoneda(estadisticas.totalNeto)}</div>
            <p className="text-xs text-muted-foreground">
              A pagar este período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal */}
      <Tabs defaultValue="nominas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="nominas">Nóminas</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="nominas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Nóminas</CardTitle>
              <CardDescription>
                Gestiona las nóminas calculadas y pendientes de pago
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NominasTable 
                nominas={nominas}
                loading={loading}
                filtros={filtros}
                onFiltrosChange={setFiltros}
                onRecargar={cargarNominas}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estadisticas" className="space-y-4">
          <EstadisticasNominas
            ano={filtros.ano}
            mes={filtros.mes}
          />
        </TabsContent>
      </Tabs>

      {/* Diálogos */}
      <CalcularNominaDialog
        open={showCalcularDialog}
        onOpenChange={setShowCalcularDialog}
        onSuccess={handleCalculoExitoso}
      />

      <CalcularMasivoDialog
        open={showCalcularMasivoDialog}
        onOpenChange={setShowCalcularMasivoDialog}
        onSuccess={handleCalculoExitoso}
      />
    </div>
  )
}
