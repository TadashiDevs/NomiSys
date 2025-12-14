"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Users,
  FileText,
  Calculator,
  ArrowUpRight,
  UserPlus,
  FileSignature,
  Calendar,
  AlertTriangle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/services"
import { Trabajador } from "@/services/api/trabajadores"
import { Contrato } from "@/services/api/contratos"
import { nominasApi, formatearMoneda, obtenerNombreMes } from "@/services/api/nominas"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  // Estados para almacenar datos de la API
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([])
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Estadísticas calculadas
  const [stats, setStats] = useState({
    totalTrabajadores: 0,
    trabajadoresNuevosMes: 0,
    contratosActivos: 0,
    contratosNuevosMes: 0,
    contratosPorVencer: 0,
    nominasProcesadas: 0,
    totalNetoMes: 0,
    mesActual: ''
  })

  // Función para formatear fechas en formato dd/mm/yyyy
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
  }

  // Cargar datos de la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Cargar trabajadores
        const trabajadoresData = await api.trabajadoresApi.getAll()
        setTrabajadores(trabajadoresData)

        // Cargar contratos
        const contratosData = await api.contratosApi.getAll()
        setContratos(contratosData)

        // Calcular estadísticas
        const hoy = new Date()
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

        // Trabajadores nuevos en el último mes
        const trabajadoresNuevos = trabajadoresData.filter(t => {
          const fechaCreacion = new Date(t.created_at || '')
          return fechaCreacion >= inicioMes
        })

        // Contratos activos
        const contratosActivos = contratosData.filter(c =>
          c.status === 'Activo' || c.estado === 'Activo'
        )

        // Contratos nuevos en el último mes
        const contratosNuevos = contratosData.filter(c => {
          const fechaCreacion = new Date(c.created_at || c.createdAt || '')
          return fechaCreacion >= inicioMes
        })

        // Contratos por vencer en los próximos 30 días
        const treintaDiasDespues = new Date()
        treintaDiasDespues.setDate(hoy.getDate() + 30)

        const contratosPorVencer = contratosData.filter(c => {
          // Solo contratos a plazo fijo y activos
          if ((c.type !== 'Plazo Fijo' && c.tipo !== 'Plazo Fijo') ||
              (c.status !== 'Activo' && c.estado !== 'Activo')) {
            return false
          }

          const fechaFin = new Date(c.endDate || c.fecha_fin || '')
          return fechaFin >= hoy && fechaFin <= treintaDiasDespues
        })

        // Obtener estadísticas de nóminas del mes actual
        const estadisticasNominas = await nominasApi.obtenerEstadisticas(hoy.getFullYear(), hoy.getMonth() + 1)
        const mesActual = obtenerNombreMes(hoy.getMonth() + 1)

        // Actualizar estadísticas
        setStats({
          totalTrabajadores: trabajadoresData.length,
          trabajadoresNuevosMes: trabajadoresNuevos.length,
          contratosActivos: contratosActivos.length,
          contratosNuevosMes: contratosNuevos.length,
          contratosPorVencer: contratosPorVencer.length,
          nominasProcesadas: estadisticasNominas.total_nominas,
          totalNetoMes: estadisticasNominas.total_neto,
          mesActual: mesActual
        })

        setLoading(false)
      } catch (err) {
        console.error('Error al cargar datos:', err)
        setError('Error al cargar datos. Por favor, intente nuevamente.')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido al sistema de gestión de recursos humanos.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/trabajadores?nuevo=true">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Trabajador
            </Button>
          </Link>
          <Link href="/dashboard/contratos/nuevo">
            <Button variant="outline">
              <FileSignature className="mr-2 h-4 w-4" />
              Nuevo Contrato
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="recent">Actividad Reciente</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Trabajadores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : stats.totalTrabajadores}</div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Cargando..." : `+${stats.trabajadoresNuevosMes} en el último mes`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contratos Activos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : stats.contratosActivos}</div>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Cargando..." : `+${stats.contratosNuevosMes} en el último mes`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contratos por Vencer</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : stats.contratosPorVencer}</div>
                <p className="text-xs text-muted-foreground">Contratos a plazo fijo activos</p>
              </CardContent>
            </Card>
            <Link href="/dashboard/nominas">
              <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Nóminas Procesadas</CardTitle>
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : stats.nominasProcesadas}</div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? "Cargando..." : `${stats.mesActual} ${new Date().getFullYear()}`}
                  </p>
                  {!loading && stats.totalNetoMes > 0 && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      {formatearMoneda(stats.totalNetoMes)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Trabajadores Recientes</CardTitle>
                <CardDescription>Últimos trabajadores registrados en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Cargando trabajadores...</div>
                ) : error ? (
                  <div className="text-center py-4 text-red-500">{error}</div>
                ) : trabajadores.length === 0 ? (
                  <div className="text-center py-4">No hay trabajadores registrados</div>
                ) : (
                  <div className="space-y-4">
                    {trabajadores
                      .sort((a, b) => {
                        // Ordenar por fecha de creación (más reciente primero)
                        const dateA = new Date(a.created_at || '').getTime()
                        const dateB = new Date(b.created_at || '').getTime()
                        return dateB - dateA
                      })
                      .slice(0, 3) // Mostrar solo los 3 más recientes
                      .map((worker, index) => {
                        // Obtener nombre completo (compatibilidad con frontend/backend)
                        const nombre = worker.nombres_completos || worker.name || ''
                        // Obtener departamento
                        const departamento = worker.departamento || worker.department || ''
                        // Obtener fecha de creación formateada
                        const fecha = worker.created_at ? formatDate(worker.created_at) : ''
                        // Obtener estado
                        const estado = worker.estado || worker.status || 'Activo'

                        return (
                          <div key={worker.id || index} className="flex items-center justify-between space-x-4">
                            <div className="flex items-center space-x-4">
                              <Avatar>
                                <AvatarFallback>
                                  {nombre
                                    .split(" ")
                                    .slice(0, 2)
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{nombre}</p>
                                <p className="text-xs text-muted-foreground">{departamento}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <p className="text-xs text-muted-foreground">{fecha}</p>
                              <Badge
                                variant={estado === "Activo" ? "success" : estado === "Inactivo" ? "warning" : "inactive"}
                                className="text-xs"
                              >
                                {estado}
                              </Badge>
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  <Link href="/dashboard/trabajadores">
                    <Button variant="ghost" size="sm" className="gap-1">
                      Ver todos
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Contratos Recientes</CardTitle>
                <CardDescription>Últimos contratos registrados en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Cargando contratos...</div>
                ) : error ? (
                  <div className="text-center py-4 text-red-500">{error}</div>
                ) : contratos.length === 0 ? (
                  <div className="text-center py-4">No hay contratos registrados</div>
                ) : (
                  <div className="space-y-4">
                    {contratos
                      .sort((a, b) => {
                        // Ordenar por fecha de creación (más reciente primero)
                        const dateA = new Date(a.created_at || a.createdAt || '').getTime()
                        const dateB = new Date(b.created_at || b.createdAt || '').getTime()
                        return dateB - dateA
                      })
                      .slice(0, 3) // Mostrar solo los 3 más recientes
                      .map((contract, index) => {
                        // Buscar el trabajador asociado al contrato
                        const trabajador = trabajadores.find(t => {
                          const contractWorkerId = contract.trabajador_id || contract.workerId;
                          return t.id.toString() === contractWorkerId?.toString();
                        })

                        // Si no se encuentra el trabajador, no mostrar este contrato
                        if (!trabajador) {
                          return null; // Usar return null en lugar de continue en un map
                        }

                        // Obtener nombre del trabajador
                        const nombreTrabajador = trabajador.nombres_completos || trabajador.name || ''

                        // Obtener tipo de contrato
                        const tipoContrato = contract.tipo || contract.type || ''

                        // Obtener fecha de creación formateada
                        const fecha = (contract.created_at || contract.createdAt)
                          ? formatDate(contract.created_at || contract.createdAt || '')
                          : ''

                        // Obtener estado
                        const estado = contract.estado || contract.status || 'Activo'

                        return (
                          <div key={contract.id || index} className="flex items-center justify-between space-x-4">
                            <div>
                              <p className="text-sm font-medium">{nombreTrabajador}</p>
                              <p className="text-xs text-muted-foreground">{tipoContrato}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <p className="text-xs text-muted-foreground">{fecha}</p>
                              <Badge
                                variant={estado === "Activo" ? "success" : "inactive"}
                                className="text-xs"
                              >
                                {estado}
                              </Badge>
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  <Link href="/dashboard/contratos">
                    <Button variant="ghost" size="sm" className="gap-1">
                      Ver todos
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Cargando actividad reciente...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Acción</TableHead>
                      <TableHead>Elemento</TableHead>
                      <TableHead>Fecha y Hora</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Generar actividad reciente basada en trabajadores y contratos */}
                    {[
                      // Actividad de trabajadores
                      ...trabajadores
                        .sort((a, b) => {
                          const dateA = new Date(a.created_at || '').getTime()
                          const dateB = new Date(b.created_at || '').getTime()
                          return dateB - dateA
                        })
                        .slice(0, 3)
                        .map(t => ({
                          user: "Administrador",
                          action: "Creó",
                          item: `Trabajador: ${t.nombres_completos || t.name || ''}`,
                          date: t.created_at ? `${formatDate(t.created_at)} ${new Date(t.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` : '',
                          timestamp: new Date(t.created_at || '').getTime()
                        })),

                      // Actividad de contratos
                      ...contratos
                        .sort((a, b) => {
                          const dateA = new Date(a.created_at || a.createdAt || '').getTime()
                          const dateB = new Date(b.created_at || b.createdAt || '').getTime()
                          return dateB - dateA
                        })
                        .slice(0, 3)
                        .map(c => {
                          const trabajador = trabajadores.find(t => {
                            const contractWorkerId = c.trabajador_id || c.workerId;
                            return t.id.toString() === contractWorkerId?.toString();
                          })

                          // Si no se encuentra el trabajador, omitir este registro
                          if (!trabajador) {
                            return null;
                          }

                          const nombreTrabajador = trabajador.nombres_completos || trabajador.name || ''

                          return {
                            user: "Administrador",
                            action: "Creó",
                            item: `Contrato: ${nombreTrabajador}`,
                            date: (c.created_at || c.createdAt) ? `${formatDate(c.created_at || c.createdAt || '')} ${new Date(c.created_at || c.createdAt || '').toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` : '',
                            timestamp: new Date(c.created_at || c.createdAt || '').getTime()
                          }
                        })
                    ]
                    .filter(item => item !== null) // Filtrar elementos nulos
                    .sort((a, b) => b!.timestamp - a!.timestamp) // Ordenar por fecha (más reciente primero)
                    .slice(0, 5) // Mostrar solo los 5 más recientes
                    .map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell>{activity.user}</TableCell>
                        <TableCell>{activity.action}</TableCell>
                        <TableCell>{activity.item}</TableCell>
                        <TableCell>{activity.date}</TableCell>
                      </TableRow>
                    ))}

                    {/* Mostrar mensaje si no hay actividad */}
                    {trabajadores.length === 0 && contratos.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          No hay actividad reciente
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alertas del Sistema</CardTitle>
              <CardDescription>Notificaciones importantes que requieren atención</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Cargando alertas...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
              ) : (
                <div className="space-y-4">
                  {/* Generar alertas basadas en contratos por vencer */}
                  {contratos
                    .filter(c => {
                      // Solo contratos a plazo fijo y activos
                      if ((c.type !== 'Plazo Fijo' && c.tipo !== 'Plazo Fijo') ||
                          (c.status !== 'Activo' && c.estado !== 'Activo')) {
                        return false
                      }

                      const hoy = new Date()
                      const fechaFin = new Date(c.endDate || c.fecha_fin || '')
                      const treintaDiasDespues = new Date()
                      treintaDiasDespues.setDate(hoy.getDate() + 30)

                      return fechaFin >= hoy && fechaFin <= treintaDiasDespues
                    })
                    .sort((a, b) => {
                      // Ordenar por fecha de fin (más cercana primero)
                      const fechaFinA = new Date(a.endDate || a.fecha_fin || '').getTime()
                      const fechaFinB = new Date(b.endDate || b.fecha_fin || '').getTime()
                      return fechaFinA - fechaFinB
                    })
                    .map(contrato => {
                      // Buscar el trabajador asociado al contrato
                      const trabajador = trabajadores.find(t => {
                        const contractWorkerId = contrato.trabajador_id || contrato.workerId;
                        return t.id.toString() === contractWorkerId?.toString();
                      })

                      // Si no se encuentra el trabajador, omitir este registro
                      if (!trabajador) {
                        return null;
                      }

                      // Obtener nombre del trabajador
                      const nombreTrabajador = trabajador.nombres_completos || trabajador.name || ''

                      // Calcular días restantes
                      const hoy = new Date()
                      const fechaFin = new Date(contrato.endDate || contrato.fecha_fin || '')
                      const diasRestantes = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

                      // Determinar prioridad basada en días restantes
                      let prioridad = "Baja"
                      if (diasRestantes <= 7) {
                        prioridad = "Alta"
                      } else if (diasRestantes <= 15) {
                        prioridad = "Media"
                      }

                      return {
                        title: "Contrato por vencer",
                        description: `El contrato de ${nombreTrabajador} vence en ${diasRestantes} días.`,
                        date: formatDate(new Date().toISOString()),
                        priority: prioridad,
                      }
                    })
                    .filter(alert => alert !== null) // Filtrar alertas nulas
                    .map((alert, index) => (
                      <div key={index} className="flex items-start space-x-4 rounded-md border p-4">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{alert.title}</p>
                            <Badge
                              variant={
                                alert.priority === "Alta"
                                  ? "destructive"
                                  : alert.priority === "Media"
                                    ? "warning"
                                    : "info"
                              }
                            >
                              {alert.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.description}</p>
                          <p className="text-xs text-muted-foreground">{alert.date}</p>
                        </div>
                      </div>
                    ))}

                  {/* Mostrar mensaje si no hay alertas */}
                  {contratos.filter(c =>
                    (c.type === 'Plazo Fijo' || c.tipo === 'Plazo Fijo') &&
                    (c.status === 'Activo' || c.estado === 'Activo')
                  ).length === 0 && (
                    <div className="text-center py-4">
                      No hay contratos a plazo fijo activos por vencer
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
