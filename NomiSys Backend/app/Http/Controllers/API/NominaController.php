<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Nomina;
use App\Services\NominaCalculatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;

class NominaController extends Controller
{
    protected $nominaCalculator;

    public function __construct(NominaCalculatorService $nominaCalculator)
    {
        $this->nominaCalculator = $nominaCalculator;
    }

    /**
     * Obtener todas las nóminas con filtros opcionales
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Nomina::with(['trabajador', 'contrato']);

            // Filtros opcionales
            if ($request->has('ano')) {
                $query->whereYear('fecha_inicio_periodo', $request->ano);
            }

            if ($request->has('mes')) {
                $query->whereMonth('fecha_inicio_periodo', $request->mes);
            }

            if ($request->has('estado')) {
                $query->where('estado', $request->estado);
            }

            if ($request->has('trabajador_id')) {
                $query->where('trabajador_id', $request->trabajador_id);
            }

            // Ordenar por fecha de cálculo descendente
            $nominas = $query->orderBy('fecha_calculo', 'desc')->get();

            // Formatear datos para el frontend
            $nominasFormateadas = $nominas->map(function ($nomina) {
                return [
                    'id' => $nomina->id,
                    'trabajador_id' => $nomina->trabajador_id,
                    'trabajador_nombre' => $nomina->trabajador->nombres_completos,
                    'trabajador_cedula' => $nomina->trabajador->cedula,
                    'periodo' => $nomina->periodo_completo,
                    'ano' => $nomina->ano,
                    'mes' => $nomina->mes,
                    'salario_base' => $nomina->salario_base,
                    'auxilio_transporte' => $nomina->auxilio_transporte,
                    'horas_extras_diurnas' => $nomina->horas_extras_diurnas,
                    'horas_extras_nocturnas' => $nomina->horas_extras_nocturnas,
                    'valor_horas_extras_diurnas' => $nomina->valor_horas_extras_diurnas,
                    'valor_horas_extras_nocturnas' => $nomina->valor_horas_extras_nocturnas,
                    'bonificaciones' => $nomina->bonificaciones,
                    'total_devengados' => $nomina->total_devengados,
                    'descuento_salud' => $nomina->descuento_salud,
                    'descuento_pension' => $nomina->descuento_pension,
                    'retencion_fuente' => $nomina->retencion_fuente,
                    'otras_deducciones' => $nomina->otras_deducciones,
                    'total_deducciones' => $nomina->total_deducciones,
                    'neto_pagar' => $nomina->neto_pagar,
                    'estado' => $nomina->estado,
                    'fecha_calculo' => $nomina->fecha_calculo->format('Y-m-d H:i:s'),
                    'fecha_pago' => $nomina->fecha_pago?->format('Y-m-d H:i:s'),
                    'observaciones' => $nomina->observaciones,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $nominasFormateadas,
                'message' => 'Nóminas obtenidas exitosamente'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las nóminas: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calcular nómina individual
     */
    public function calcular(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'trabajador_id' => 'required|integer|exists:trabajadores,id',
            'ano' => 'required|integer|min:2020|max:2030',
            'mes' => 'required|integer|min:1|max:12',
            'horas_extras_diurnas' => 'nullable|integer|min:0|max:100',
            'horas_extras_nocturnas' => 'nullable|integer|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $horasExtras = [
                'diurnas' => $request->horas_extras_diurnas ?? 0,
                'nocturnas' => $request->horas_extras_nocturnas ?? 0,
            ];

            // Calcular nómina
            $datosNomina = $this->nominaCalculator->calcularNomina(
                $request->trabajador_id,
                $request->ano,
                $request->mes,
                $horasExtras
            );

            // Guardar nómina
            $nomina = $this->nominaCalculator->guardarNomina($datosNomina);

            // Cargar relaciones
            $nomina->load(['trabajador', 'contrato']);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $nomina->id,
                    'trabajador_nombre' => $nomina->trabajador->nombres_completos,
                    'periodo' => $nomina->periodo_completo,
                    'salario_base' => $nomina->salario_base,
                    'auxilio_transporte' => $nomina->auxilio_transporte,
                    'horas_extras_diurnas' => $nomina->horas_extras_diurnas,
                    'horas_extras_nocturnas' => $nomina->horas_extras_nocturnas,
                    'valor_horas_extras_diurnas' => $nomina->valor_horas_extras_diurnas,
                    'valor_horas_extras_nocturnas' => $nomina->valor_horas_extras_nocturnas,
                    'total_devengados' => $nomina->total_devengados,
                    'descuento_salud' => $nomina->descuento_salud,
                    'descuento_pension' => $nomina->descuento_pension,
                    'retencion_fuente' => $nomina->retencion_fuente,
                    'total_deducciones' => $nomina->total_deducciones,
                    'neto_pagar' => $nomina->neto_pagar,
                    'estado' => $nomina->estado,
                    'fecha_calculo' => $nomina->fecha_calculo->format('Y-m-d H:i:s'),
                ],
                'message' => 'Nómina calculada exitosamente'
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Calcular nóminas masivas para todos los trabajadores
     */
    public function calcularMasivo(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'ano' => 'required|integer|min:2020|max:2030',
            'mes' => 'required|integer|min:1|max:12',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos de entrada inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $resultados = $this->nominaCalculator->calcularNominasMasivas(
                $request->ano,
                $request->mes
            );

            $exitosos = collect($resultados)->where('status', 'success')->count();
            $errores = collect($resultados)->where('status', 'error')->count();

            return response()->json([
                'success' => true,
                'data' => $resultados,
                'summary' => [
                    'total_procesados' => count($resultados),
                    'exitosos' => $exitosos,
                    'errores' => $errores,
                ],
                'message' => "Proceso completado: {$exitosos} nóminas calculadas, {$errores} errores"
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en el cálculo masivo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener detalle de una nómina específica
     */
    public function show($id): JsonResponse
    {
        try {
            $nomina = Nomina::with(['trabajador', 'contrato'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $nomina->id,
                    'trabajador' => [
                        'id' => $nomina->trabajador->id,
                        'nombre' => $nomina->trabajador->nombres_completos,
                        'cedula' => $nomina->trabajador->cedula,
                    ],
                    'contrato' => [
                        'id' => $nomina->contrato->id,
                        'cargo' => $nomina->contrato->cargo,
                        'departamento' => $nomina->contrato->departamento,
                    ],
                    'periodo' => [
                        'ano' => $nomina->ano,
                        'mes' => $nomina->mes,
                        'nombre_mes' => $nomina->nombre_mes,
                        'fecha_inicio' => $nomina->fecha_inicio_periodo,
                        'fecha_fin' => $nomina->fecha_fin_periodo,
                    ],
                    'devengados' => [
                        'salario_base' => $nomina->salario_base,
                        'auxilio_transporte' => $nomina->auxilio_transporte,
                        'horas_extras_diurnas' => $nomina->horas_extras_diurnas,
                        'valor_horas_extras_diurnas' => $nomina->valor_horas_extras_diurnas,
                        'horas_extras_nocturnas' => $nomina->horas_extras_nocturnas,
                        'valor_horas_extras_nocturnas' => $nomina->valor_horas_extras_nocturnas,
                        'bonificaciones' => $nomina->bonificaciones,
                        'total' => $nomina->total_devengados,
                    ],
                    'deducciones' => [
                        'descuento_salud' => $nomina->descuento_salud,
                        'descuento_pension' => $nomina->descuento_pension,
                        'retencion_fuente' => $nomina->retencion_fuente,
                        'otras_deducciones' => $nomina->otras_deducciones,
                        'total' => $nomina->total_deducciones,
                    ],
                    'neto_pagar' => $nomina->neto_pagar,
                    'estado' => $nomina->estado,
                    'fecha_calculo' => $nomina->fecha_calculo,
                    'fecha_pago' => $nomina->fecha_pago,
                    'observaciones' => $nomina->observaciones,
                ],
                'message' => 'Detalle de nómina obtenido exitosamente'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Nómina no encontrada'
            ], 404);
        }
    }

    /**
     * Marcar nómina como verificada
     */
    public function marcarVerificada($id): JsonResponse
    {
        try {
            $nomina = Nomina::findOrFail($id);

            if (!$nomina->puedeSerVerificada()) {
                return response()->json([
                    'success' => false,
                    'message' => 'La nómina no puede ser verificada en su estado actual'
                ], 400);
            }

            $nomina->marcarComoVerificada();

            return response()->json([
                'success' => true,
                'message' => 'Nómina verificada exitosamente'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar la nómina'
            ], 500);
        }
    }

    /**
     * Marcar nómina como pagada
     */
    public function marcarPagada($id): JsonResponse
    {
        try {
            $nomina = Nomina::findOrFail($id);

            if (!$nomina->puedeSerPagada()) {
                return response()->json([
                    'success' => false,
                    'message' => 'La nómina debe estar verificada antes de ser pagada'
                ], 400);
            }

            $nomina->marcarComoPagada();

            return response()->json([
                'success' => true,
                'message' => 'Nómina marcada como pagada exitosamente'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al marcar la nómina como pagada'
            ], 500);
        }
    }

    /**
     * Generar boleta de pago en PDF
     */
    public function generarBoletaPDF($id): JsonResponse
    {
        try {
            $nomina = Nomina::with(['trabajador', 'contrato'])->findOrFail($id);

            // TODO: Implementar generación de PDF con la estructura del Ministerio de Trabajo
            // Por ahora retornamos la estructura de datos que se usará

            $boletaData = [
                'empresa' => [
                    'nombre' => 'EMPRESA EJEMPLO S.A.C.',
                    'ruc' => '20123456789',
                    'direccion' => 'Av. Principal 123, Lima'
                ],
                'trabajador' => [
                    'nombre' => $nomina->trabajador->nombres_completos,
                    'dni' => $nomina->trabajador->cedula,
                    'cargo' => $nomina->contrato->cargo,
                    'departamento' => $nomina->contrato->departamento
                ],
                'periodo' => $nomina->periodo_completo,
                'ingresos' => [
                    'sueldo_basico' => $nomina->salario_base,
                    'asignacion_familiar' => $nomina->auxilio_transporte, // Renombrado
                    'horas_extras' => $nomina->valor_horas_extras_diurnas + $nomina->valor_horas_extras_nocturnas,
                    'bonificaciones' => $nomina->bonificaciones,
                    'total_ingresos' => $nomina->total_devengados
                ],
                'deducciones' => [
                    'sistema_pension' => $nomina->descuento_pension,
                    'retencion_5ta' => $nomina->retencion_fuente,
                    'otras_deducciones' => $nomina->otras_deducciones,
                    'total_deducciones' => $nomina->total_deducciones
                ],
                'neto_pagar' => $nomina->neto_pagar,
                'fecha_pago' => $nomina->fecha_pago,
                'estado' => $nomina->estado
            ];

            return response()->json([
                'success' => true,
                'data' => $boletaData,
                'message' => 'Estructura de boleta generada (PDF pendiente de implementar)'
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al generar la boleta de pago'
            ], 500);
        }
    }
}
