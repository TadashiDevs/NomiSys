<?php

namespace Database\Seeders;

use App\Models\Nomina;
use App\Models\Trabajador;
use App\Models\Contrato;
use App\Services\NominaCalculatorService;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class NominaSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Obtener el servicio de cálculo de nóminas
        $calculatorService = new NominaCalculatorService();

        // Obtener trabajadores con contratos activos
        $trabajadores = Trabajador::whereHas('contratos', function ($query) {
            $query->where('estado', 'Activo');
        })->get();

        if ($trabajadores->isEmpty()) {
            $this->command->info('No hay trabajadores con contratos activos para generar nóminas.');
            return;
        }

        // Generar nóminas para los últimos 3 meses
        $fechaActual = Carbon::now();
        $mesesAGenerar = [
            ['ano' => $fechaActual->copy()->subMonths(2)->year, 'mes' => $fechaActual->copy()->subMonths(2)->month],
            ['ano' => $fechaActual->copy()->subMonth()->year, 'mes' => $fechaActual->copy()->subMonth()->month],
            ['ano' => $fechaActual->year, 'mes' => $fechaActual->month],
        ];

        $nominasCreadas = 0;

        foreach ($mesesAGenerar as $periodo) {
            $this->command->info("Generando nóminas para {$periodo['mes']}/{$periodo['ano']}...");

            foreach ($trabajadores as $trabajador) {
                try {
                    // Verificar si ya existe nómina para este período
                    $nominaExistente = Nomina::where('trabajador_id', $trabajador->id)
                        ->whereYear('fecha_inicio_periodo', $periodo['ano'])
                        ->whereMonth('fecha_inicio_periodo', $periodo['mes'])
                        ->first();

                    if ($nominaExistente) {
                        continue; // Saltar si ya existe
                    }

                    // Generar horas extras aleatorias (algunas veces)
                    $horasExtras = [];
                    if (rand(1, 100) <= 30) { // 30% de probabilidad de tener horas extras
                        $horasExtras = [
                            'diurnas' => rand(0, 20),
                            'nocturnas' => rand(0, 10),
                        ];
                    }

                    // Calcular nómina
                    $datosNomina = $calculatorService->calcularNomina(
                        $trabajador->id,
                        $periodo['ano'],
                        $periodo['mes'],
                        $horasExtras
                    );

                    // Crear la nómina
                    $nomina = Nomina::create($datosNomina);

                    // Marcar algunas nóminas como pagadas (solo las de meses anteriores)
                    if ($periodo['ano'] < $fechaActual->year ||
                        ($periodo['ano'] == $fechaActual->year && $periodo['mes'] < $fechaActual->month)) {

                        if (rand(1, 100) <= 80) { // 80% de probabilidad de estar pagada
                            $nomina->update([
                                'estado' => 'Pagada',
                                'fecha_pago' => Carbon::create($periodo['ano'], $periodo['mes'])->addDays(rand(25, 30))
                            ]);
                        }
                    }

                    $nominasCreadas++;

                } catch (\Exception $e) {
                    $this->command->error("Error al crear nómina para {$trabajador->nombres_completos}: " . $e->getMessage());
                }
            }
        }

        $this->command->info("✅ Se crearon {$nominasCreadas} nóminas de ejemplo.");
        
        // Mostrar estadísticas
        $this->mostrarEstadisticas();
    }

    /**
     * Mostrar estadísticas de las nóminas creadas
     */
    private function mostrarEstadisticas(): void
    {
        $totalNominas = Nomina::count();
        $nominasPagadas = Nomina::where('estado', 'Pagada')->count();
        $nominasCalculadas = Nomina::where('estado', 'Calculada')->count();
        $totalNeto = Nomina::sum('neto_pagar');

        $this->command->info("\n📊 Estadísticas de Nóminas:");
        $this->command->info("   • Total de nóminas: {$totalNominas}");
        $this->command->info("   • Nóminas pagadas: {$nominasPagadas}");
        $this->command->info("   • Nóminas calculadas: {$nominasCalculadas}");
        $this->command->info("   • Total neto acumulado: $" . number_format($totalNeto, 0, ',', '.'));

        // Estadísticas por mes
        $this->command->info("\n📅 Nóminas por período:");
        $nominasPorMes = Nomina::selectRaw('YEAR(fecha_inicio_periodo) as ano, MONTH(fecha_inicio_periodo) as mes, COUNT(*) as total, SUM(neto_pagar) as total_neto')
            ->groupBy('ano', 'mes')
            ->orderBy('ano', 'desc')
            ->orderBy('mes', 'desc')
            ->get();

        foreach ($nominasPorMes as $periodo) {
            $meses = [
                1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
                5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
                9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
            ];

            $nombreMes = $meses[$periodo->mes] ?? 'Mes desconocido';

            $this->command->info("   • {$nombreMes} {$periodo->ano}: {$periodo->total} nóminas - $" . number_format($periodo->total_neto, 0, ',', '.'));
        }
    }
}
