<?php

namespace App\Services;

use App\Models\Contrato;
use App\Models\Nomina;
use App\Models\Trabajador;
use Carbon\Carbon;
use Exception;

class NominaCalculatorService
{
    // Constantes para cálculos según normativa peruana 2025
    const RMV_2025 = 1025; // Remuneración Mínima Vital 2025 (S/.)
    const UIT_2025 = 5150; // Unidad Impositiva Tributaria 2025 (S/.)
    const ASIGNACION_FAMILIAR_PORCENTAJE = 0.10; // 10% de la RMV
    const PORCENTAJE_AFP = 0.10; // 10% (promedio AFP)
    const PORCENTAJE_ONP = 0.13; // 13% ONP
    const PORCENTAJE_ESSALUD = 0.09; // 9% EsSalud (empleador)
    const HORAS_MENSUALES = 240; // Horas laborales por mes (8h x 30 días)
    const LIMITE_5TA_CATEGORIA = 7 * 5150; // 7 UIT para retención 5ta categoría
    const PORCENTAJE_5TA_CATEGORIA = 0.08; // 8% retención sobre exceso

    /**
     * Calcular nómina para un trabajador en un período específico
     * Implementa normativa laboral peruana 2025
     */
    public function calcularNomina(int $trabajadorId, int $ano, int $mes, array $horasExtras = []): array
    {
        // Calcular fechas del período
        $fechaInicio = Carbon::create($ano, $mes, 1);
        $fechaFin = $fechaInicio->copy()->endOfMonth();

        // Validar que no exista nómina para este período
        $nominaExistente = Nomina::where('trabajador_id', $trabajadorId)
            ->whereDate('fecha_inicio_periodo', $fechaInicio->toDateString())
            ->first();

        if ($nominaExistente) {
            throw new Exception("Ya existe una nómina calculada para este trabajador en el período {$mes}/{$ano}");
        }

        // Obtener trabajador y contrato activo
        $trabajador = Trabajador::findOrFail($trabajadorId);
        $contrato = $this->obtenerContratoActivo($trabajadorId);

        if (!$contrato) {
            throw new Exception("El trabajador {$trabajador->nombres_completos} no tiene un contrato activo");
        }

        // === CÁLCULO DE INGRESOS (antes "Devengados") ===

        // 1. Salario base del contrato
        $salarioBase = $contrato->salario;

        // 2. Asignación familiar (10% RMV si tiene hijos a cargo)
        $asignacionFamiliar = $this->calcularAsignacionFamiliar($trabajador);

        // 3. Horas extras
        $horasExtrasDiurnas = $horasExtras['diurnas'] ?? 0;
        $horasExtrasNocturnas = $horasExtras['nocturnas'] ?? 0;
        $valorHorasExtrasDiurnas = $this->calcularHorasExtrasDiurnas($salarioBase, $horasExtrasDiurnas);
        $valorHorasExtrasNocturnas = $this->calcularHorasExtrasNocturnas($salarioBase, $horasExtrasNocturnas);

        // 4. Bonificaciones adicionales (si las hay)
        $bonificaciones = 0; // Se puede parametrizar en el futuro

        // Total de ingresos
        $totalIngresos = $salarioBase + $asignacionFamiliar + $valorHorasExtrasDiurnas + $valorHorasExtrasNocturnas + $bonificaciones;

        // === CÁLCULO DE DEDUCCIONES ===

        // 1. Sistema de pensiones (AFP u ONP según contrato)
        $descuentoPension = $this->calcularDescuentoPension($salarioBase, $contrato->pension);

        // 2. Retención 5ta categoría (si corresponde)
        $retencion5taCategoria = $this->calcularRetencion5taCategoria($totalIngresos);

        // 3. Otras deducciones (préstamos, etc.)
        $otrasDeducciones = 0; // Se puede parametrizar en el futuro

        // Total deducciones
        $totalDeducciones = $descuentoPension + $retencion5taCategoria + $otrasDeducciones;

        // Neto a pagar
        $netoPagar = $totalIngresos - $totalDeducciones;

        // EsSalud (9% a cargo del empleador - no se descuenta al trabajador)
        $essaludEmpleador = $this->calcularEsSaludEmpleador($salarioBase);

        return [
            'trabajador_id' => $trabajadorId,
            'contrato_id' => $contrato->id,
            'fecha_inicio_periodo' => $fechaInicio->toDateString(),
            'fecha_fin_periodo' => $fechaFin->toDateString(),
            'salario_base' => $salarioBase,
            'auxilio_transporte' => $asignacionFamiliar, // Renombrado para compatibilidad
            'horas_extras_diurnas' => $horasExtrasDiurnas,
            'horas_extras_nocturnas' => $horasExtrasNocturnas,
            'valor_horas_extras_diurnas' => $valorHorasExtrasDiurnas,
            'valor_horas_extras_nocturnas' => $valorHorasExtrasNocturnas,
            'bonificaciones' => $bonificaciones,
            'total_devengados' => $totalIngresos, // Cambiado de "devengados" a "ingresos"
            'descuento_salud' => 0, // En Perú no se descuenta salud al trabajador
            'descuento_pension' => $descuentoPension,
            'retencion_fuente' => $retencion5taCategoria,
            'otras_deducciones' => $otrasDeducciones,
            'total_deducciones' => $totalDeducciones,
            'neto_pagar' => $netoPagar,
            'estado' => 'Calculada',
            'fecha_calculo' => now(),
            'observaciones' => null
        ];
    }

    /**
     * Calcular asignación familiar según normativa peruana
     * 10% de la RMV si el trabajador tiene hijos a cargo (independientemente del estado civil)
     */
    private function calcularAsignacionFamiliar(Trabajador $trabajador): int
    {
        // Verificar si tiene hijos a cargo
        $tieneHijos = $trabajador->numero_hijos > 0;

        if ($tieneHijos) {
            return round(self::RMV_2025 * self::ASIGNACION_FAMILIAR_PORCENTAJE);
        }

        return 0;
    }

    /**
     * Calcular horas extras diurnas según normativa peruana
     * Fórmula: (Salario_Base/240) * 1.25 * Horas_Diurnas
     */
    private function calcularHorasExtrasDiurnas(int $salarioBase, int $horas): int
    {
        if ($horas <= 0) return 0;
        $valorHora = $salarioBase / self::HORAS_MENSUALES;
        return round($valorHora * 1.25 * $horas);
    }

    /**
     * Calcular horas extras nocturnas según normativa peruana
     * Fórmula: (Salario_Base/240) * 1.35 * Horas_Nocturnas (35% adicional en Perú)
     */
    private function calcularHorasExtrasNocturnas(int $salarioBase, int $horas): int
    {
        if ($horas <= 0) return 0;
        $valorHora = $salarioBase / self::HORAS_MENSUALES;
        return round($valorHora * 1.35 * $horas); // 35% adicional para nocturnas en Perú
    }

    /**
     * Calcular descuento de pensión según sistema (AFP u ONP)
     * AFP: 10% promedio, ONP: 13%
     */
    private function calcularDescuentoPension(int $salarioBase, string $sistemaPension): int
    {
        if ($sistemaPension === 'AFP') {
            return round($salarioBase * self::PORCENTAJE_AFP);
        } elseif ($sistemaPension === 'ONP') {
            return round($salarioBase * self::PORCENTAJE_ONP);
        }

        return 0; // Si no tiene sistema definido
    }

    /**
     * Calcular EsSalud a cargo del empleador (9%)
     * No se descuenta al trabajador, pero se calcula para información
     */
    private function calcularEsSaludEmpleador(int $salarioBase): int
    {
        return round($salarioBase * self::PORCENTAJE_ESSALUD);
    }

    /**
     * Calcular retención de 5ta categoría según normativa peruana
     * Se aplica si los ingresos anuales superan 7 UIT
     */
    private function calcularRetencion5taCategoria(int $ingresosMensuales): int
    {
        $ingresosAnualesEstimados = $ingresosMensuales * 12;
        $limiteExencion = self::LIMITE_5TA_CATEGORIA; // 7 UIT

        if ($ingresosAnualesEstimados <= $limiteExencion) {
            return 0;
        }

        // Calcular retención mensual sobre el exceso
        $excesoAnual = $ingresosAnualesEstimados - $limiteExencion;
        $retencionAnual = $excesoAnual * self::PORCENTAJE_5TA_CATEGORIA;
        $retencionMensual = $retencionAnual / 12;

        return round($retencionMensual);
    }

    /**
     * Obtener contrato activo del trabajador
     */
    private function obtenerContratoActivo(int $trabajadorId): ?Contrato
    {
        return Contrato::where('trabajador_id', $trabajadorId)
            ->where('estado', 'Activo')
            ->first();
    }

    /**
     * Guardar nómina calculada
     */
    public function guardarNomina(array $datosNomina): Nomina
    {
        return Nomina::create($datosNomina);
    }

    /**
     * Calcular nóminas masivas para todos los trabajadores activos
     */
    public function calcularNominasMasivas(int $ano, int $mes): array
    {
        $trabajadoresActivos = Trabajador::whereHas('contratos', function ($query) {
            $query->where('estado', 'Activo');
        })->get();

        $resultados = [];

        foreach ($trabajadoresActivos as $trabajador) {
            try {
                $datosNomina = $this->calcularNomina($trabajador->id, $ano, $mes);
                $nomina = $this->guardarNomina($datosNomina);
                $resultados[] = [
                    'trabajador_id' => $trabajador->id,
                    'nombre' => $trabajador->nombres_completos,
                    'status' => 'success',
                    'nomina_id' => $nomina->id,
                    'neto_pagar' => $nomina->neto_pagar
                ];
            } catch (Exception $e) {
                $resultados[] = [
                    'trabajador_id' => $trabajador->id,
                    'nombre' => $trabajador->nombres_completos,
                    'status' => 'error',
                    'error' => $e->getMessage()
                ];
            }
        }

        return $resultados;
    }
}
