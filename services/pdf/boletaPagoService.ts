import { type Nomina, formatearMoneda, nominasApi } from "@/services/api/nominas"
import { contratosApi } from "@/services/api/contratos"

// Interfaz para datos de la empresa
interface DatosEmpresa {
  nombre: string
  ruc: string
  direccion: string
  telefono?: string
  email?: string
}

// Datos por defecto de la empresa
const DATOS_EMPRESA: DatosEmpresa = {
  nombre: "EMPRESA NOMISYS S.A.C.",
  ruc: "20123456789",
  direccion: "Av. Principal 123, Lima - Perú",
  telefono: "(01) 234-5678",
  email: "rrhh@nomisys.com"
}

/**
 * Servicio para generar boletas de pago en PDF
 */
export class BoletaPagoService {
  private static formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  private static obtenerMesPeriodo(periodo: string): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    
    // Extraer mes del período (formato: "Enero 2025")
    const partes = periodo.split(' ')
    if (partes.length >= 2) {
      return periodo
    }
    
    // Si no tiene el formato esperado, usar el período tal como está
    return periodo
  }

  /**
   * Generar boleta de pago en PDF usando HTML y print
   */
  static async generarBoletaPDF(nomina: Nomina): Promise<void> {
    try {
      // Obtener información del contrato del trabajador
      let cargoTrabajador = 'EMPLEADO'
      let departamentoTrabajador = 'No especificado'
      let pensionTrabajador = 'AFP'

      try {
        const contratos = await contratosApi.getByWorkerId(nomina.trabajador_id)
        const contratoActivo = contratos.find(c => c.estado === 'Activo' || c.status === 'Activo')

        if (contratoActivo) {
          cargoTrabajador = contratoActivo.cargo || contratoActivo.position || 'EMPLEADO'
          departamentoTrabajador = contratoActivo.departamento || contratoActivo.department || 'No especificado'
          pensionTrabajador = contratoActivo.pension || contratoActivo.pensionSystem || 'AFP'
        }
      } catch (error) {
        console.warn('No se pudo obtener información del contrato:', error)
      }

      // Crear HTML de la boleta
      const htmlContent = this.generarHTMLBoleta(nomina, cargoTrabajador, departamentoTrabajador, pensionTrabajador)

      // Crear una nueva ventana para imprimir
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      if (!printWindow) {
        throw new Error('No se pudo abrir la ventana de impresión')
      }

      // Escribir el contenido HTML
      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Esperar a que se cargue el contenido
      printWindow.onload = () => {
        // Configurar para imprimir como PDF
        printWindow.print()

        // Cerrar la ventana después de un momento
        setTimeout(() => {
          printWindow.close()
        }, 1000)
      }

    } catch (error) {
      console.error('Error al generar PDF:', error)
      throw new Error('Error al generar la boleta de pago')
    }
  }

  /**
   * Generar HTML de la boleta de pago
   */
  private static generarHTMLBoleta(nomina: Nomina, cargo: string, departamento: string, pension: string): string {
    const fechaGeneracion = new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Boleta de Pago - ${nomina.trabajador_nombre}</title>
    <style>
        @page {
            size: A4;
            margin: 15mm;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: white;
        }

        .boleta-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 10mm;
            background: white;
        }

        .header {
            background: #f5f5f5;
            border: 2px solid #4682b4;
            padding: 15px;
            margin-bottom: 20px;
            text-align: center;
        }

        .header h1 {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }

        .header .subtitle {
            font-size: 12px;
            color: #666;
            margin-bottom: 15px;
        }

        .header-info {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            text-align: left;
        }

        .company-info h3 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .company-info p {
            font-size: 11px;
            margin: 2px 0;
        }

        .boleta-info {
            text-align: right;
        }

        .boleta-info p {
            font-size: 11px;
            margin: 2px 0;
        }

        .section {
            background: #fafafa;
            border: 1px solid #ddd;
            padding: 10px;
            margin-bottom: 12px;
        }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #4682b4;
            margin-bottom: 10px;
            border-bottom: 2px solid #4682b4;
            padding-bottom: 5px;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        .info-grid-trabajador {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .info-item {
            display: flex;
            justify-content: space-between;
        }

        .info-label {
            font-weight: bold;
            color: #555;
        }

        .info-value {
            font-weight: bold;
            color: #333;
        }

        .tables-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }

        .table-section {
            border: 1px solid #ddd;
        }

        .table-header {
            padding: 10px;
            font-weight: bold;
            text-align: center;
            color: white;
        }

        .ingresos-header {
            background: #28a745;
        }

        .deducciones-header {
            background: #dc3545;
        }

        .table-content {
            padding: 10px;
        }

        .table-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }

        .table-row:last-child {
            border-bottom: none;
        }

        .table-total {
            background: #f8f9fa;
            font-weight: bold;
            margin-top: 10px;
            padding: 8px;
            border-top: 2px solid #333;
        }

        .neto-pagar {
            background: #4682b4;
            color: white;
            padding: 12px;
            text-align: center;
            margin: 15px 0;
            border-radius: 5px;
        }

        .neto-pagar h2 {
            font-size: 16px;
            margin-bottom: 8px;
        }

        .neto-amount {
            font-size: 22px;
            font-weight: bold;
        }

        .neto-letras {
            font-size: 10px;
            margin-top: 6px;
            opacity: 0.9;
        }

        .footer {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 2px solid #4682b4;
            text-align: center;
            font-size: 9px;
            color: #666;
        }

        .observaciones {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 8px;
            margin: 10px 0;
        }

        .observaciones h4 {
            color: #856404;
            margin-bottom: 5px;
        }

        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .boleta-container {
                box-shadow: none;
                border: none;
            }
        }
    </style>
</head>
<body>
    <div class="boleta-container">
        <!-- ENCABEZADO -->
        <div class="header">
            <h1>BOLETA DE PAGO</h1>
            <div class="subtitle">Documento de Liquidación de Haberes</div>

            <div class="header-info">
                <div class="company-info">
                    <h3>${DATOS_EMPRESA.nombre}</h3>
                    <p>RUC: ${DATOS_EMPRESA.ruc}</p>
                    <p>${DATOS_EMPRESA.direccion}</p>
                    <p>Tel: ${DATOS_EMPRESA.telefono || '(01) 234-5678'}</p>
                </div>

                <div class="boleta-info">
                    <p><strong>N° BOLETA:</strong> ${String(nomina.id).padStart(6, '0')}</p>
                    <p><strong>ESTADO:</strong> ${nomina.estado}</p>
                    <p><strong>GENERADO:</strong> ${fechaGeneracion}</p>
                </div>
            </div>
        </div>

        <!-- INFORMACIÓN DEL TRABAJADOR -->
        <div class="section">
            <div class="section-title">DATOS DEL TRABAJADOR</div>
            <div class="info-grid-trabajador">
                <div class="info-item">
                    <span class="info-label">Apellidos y Nombres:</span>
                    <span class="info-value">${nomina.trabajador_nombre.toUpperCase()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">DNI/Cédula:</span>
                    <span class="info-value">${nomina.trabajador_cedula}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Cargo:</span>
                    <span class="info-value">${cargo.toUpperCase()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Departamento:</span>
                    <span class="info-value">${departamento.toUpperCase()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Sistema de Pensión:</span>
                    <span class="info-value">${pension.toUpperCase()}</span>
                </div>
            </div>
        </div>

        <!-- PERÍODO -->
        <div class="section">
            <div class="section-title">PERÍODO DE LIQUIDACIÓN</div>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Período:</span>
                    <span class="info-value">${this.obtenerMesPeriodo(nomina.periodo).toUpperCase()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Fecha de Cálculo:</span>
                    <span class="info-value">${this.formatearFecha(nomina.fecha_calculo)}</span>
                </div>
                ${nomina.fecha_pago ? `
                <div class="info-item">
                    <span class="info-label">Fecha de Pago:</span>
                    <span class="info-value">${this.formatearFecha(nomina.fecha_pago)}</span>
                </div>
                ` : ''}
            </div>
        </div>

        <!-- TABLAS DE INGRESOS Y DEDUCCIONES -->
        <div class="tables-container">
            <!-- INGRESOS -->
            <div class="table-section">
                <div class="table-header ingresos-header">
                    DEVENGADOS (INGRESOS)
                </div>
                <div class="table-content">
                    <div class="table-row">
                        <span>Sueldo Básico</span>
                        <span>${formatearMoneda(nomina.salario_base)}</span>
                    </div>
                    <div class="table-row">
                        <span>Asignación Familiar</span>
                        <span>${formatearMoneda(nomina.auxilio_transporte || 0)}</span>
                    </div>
                    <div class="table-row">
                        <span>Horas Extras</span>
                        <span>${formatearMoneda((nomina.valor_horas_extras_diurnas || 0) + (nomina.valor_horas_extras_nocturnas || 0))}</span>
                    </div>
                    <div class="table-row">
                        <span>Bonificaciones</span>
                        <span>${formatearMoneda(nomina.bonificaciones || 0)}</span>
                    </div>
                    <div class="table-total">
                        <div class="table-row">
                            <span>TOTAL DEVENGADOS</span>
                            <span>${formatearMoneda(nomina.total_devengados)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- DEDUCCIONES -->
            <div class="table-section">
                <div class="table-header deducciones-header">
                    DEDUCCIONES
                </div>
                <div class="table-content">
                    <div class="table-row">
                        <span>Sistema Pensión</span>
                        <span>${formatearMoneda(nomina.descuento_pension || 0)}</span>
                    </div>
                    <div class="table-row">
                        <span>Retención 5ta Cat.</span>
                        <span>${formatearMoneda(nomina.retencion_fuente || 0)}</span>
                    </div>
                    <div class="table-row">
                        <span>Otras Deducciones</span>
                        <span>${formatearMoneda(nomina.otras_deducciones || 0)}</span>
                    </div>
                    <div class="table-total">
                        <div class="table-row">
                            <span>TOTAL DEDUCCIONES</span>
                            <span>${formatearMoneda(nomina.total_deducciones)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- NETO A PAGAR -->
        <div class="neto-pagar">
            <h2>NETO A PAGAR</h2>
            <div class="neto-amount">${formatearMoneda(nomina.neto_pagar)}</div>
            <div class="neto-letras">SON: ${this.numeroALetras(nomina.neto_pagar)}</div>
        </div>

        <!-- OBSERVACIONES -->
        ${nomina.observaciones ? `
        <div class="observaciones">
            <h4>OBSERVACIONES:</h4>
            <p>${nomina.observaciones}</p>
        </div>
        ` : ''}

        <!-- PIE DE PÁGINA -->
        <div class="footer">
            <p>Este documento constituye la boleta de pago oficial según la legislación laboral peruana.</p>
            <p>Para consultas o reclamos dirigirse al Área de Recursos Humanos.</p>
            <p>${DATOS_EMPRESA.email || 'rrhh@nomisys.com'} | ${DATOS_EMPRESA.telefono || '(01) 234-5678'}</p>
            <p style="margin-top: 10px; font-style: italic;">Sistema NomiSys v1.0 - Generado el ${fechaGeneracion}</p>
        </div>
    </div>
</body>
</html>`
  }



  private static numeroALetras(numero: number): string {
    // Función simple para convertir número a letras (implementación básica)
    const entero = Math.floor(numero)
    const decimales = Math.round((numero - entero) * 100)

    if (entero === 0) return 'CERO SOLES CON 00/100'

    // Implementación básica - en un caso real usarías una librería
    const miles = Math.floor(entero / 1000)
    const resto = entero % 1000

    let resultado = ''
    if (miles > 0) {
      resultado += `${miles} MIL `
    }
    if (resto > 0) {
      resultado += `${resto} `
    }

    return `${resultado}SOLES CON ${decimales.toString().padStart(2, '0')}/100`
  }


}
