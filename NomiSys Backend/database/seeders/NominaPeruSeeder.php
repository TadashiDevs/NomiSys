<?php

namespace Database\Seeders;

use App\Models\Nomina;
use App\Models\Trabajador;
use App\Models\Contrato;
use App\Services\NominaCalculatorService;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class NominaPeruSeeder extends Seeder
{
    /**
     * Ejecutar el seeder para generar nóminas de prueba según normativa peruana
     */
    public function run(): void
    {
        $this->command->info('🇵🇪 Generando nóminas de prueba según normativa peruana 2025...');
        
        // Obtener el servicio de cálculo de nóminas
        $calculatorService = new NominaCalculatorService();

        // Obtener trabajadores con contratos activos
        $trabajadores = Trabajador::whereHas('contratos', function ($query) {
            $query->where('estado', 'Activo');
        })->get();

        if ($trabajadores->isEmpty()) {
            $this->command->error('❌ No hay trabajadores con contratos activos para generar nóminas.');
            $this->command->info('💡 Ejecuta primero: php artisan db:seed --class=TrabajadorSeeder');
            $this->command->info('💡 Luego ejecuta: php artisan db:seed --class=ContratoSeeder');
            return;
        }

        // Limpiar nóminas existentes
        Nomina::truncate();
        $this->command->info('🗑️  Nóminas anteriores eliminadas');

        $fechaActual = Carbon::now();
        $nominasCreadas = 0;

        // Generar nóminas para los últimos 3 meses
        $periodos = [
            ['ano' => $fechaActual->year, 'mes' => $fechaActual->month], // Mes actual
            ['ano' => $fechaActual->copy()->subMonth()->year, 'mes' => $fechaActual->copy()->subMonth()->month], // Mes anterior
            ['ano' => $fechaActual->copy()->subMonths(2)->year, 'mes' => $fechaActual->copy()->subMonths(2)->month], // Hace 2 meses
        ];

        foreach ($periodos as $periodo) {
            $this->command->info("📅 Generando nóminas para {$periodo['mes']}/{$periodo['ano']}...");
            
            foreach ($trabajadores as $trabajador) {
                try {
                    // Generar horas extras aleatorias ocasionalmente
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

                    // Simular diferentes estados según el período
                    if ($periodo['ano'] < $fechaActual->year || 
                        ($periodo['ano'] == $fechaActual->year && $periodo['mes'] < $fechaActual->month)) {
                        
                        // Para meses anteriores, simular flujo completo
                        $probabilidad = rand(1, 100);
                        
                        if ($probabilidad <= 70) { // 70% pagadas
                            $nomina->update([
                                'estado' => 'Pagada',
                                'fecha_pago' => Carbon::create($periodo['ano'], $periodo['mes'])->addDays(rand(25, 30))
                            ]);
                        } elseif ($probabilidad <= 85) { // 15% verificadas
                            $nomina->update(['estado' => 'Verificada']);
                        } elseif ($probabilidad <= 95) { // 10% calculadas
                            // Mantener como 'Calculada'
                        } else { // 5% anuladas
                            $nomina->update(['estado' => 'Anulada']);
                        }
                    } else {
                        // Para el mes actual, la mayoría están calculadas o verificadas
                        if (rand(1, 100) <= 60) {
                            $nomina->update(['estado' => 'Verificada']);
                        }
                        // El resto se mantiene como 'Calculada'
                    }

                    $nominasCreadas++;

                } catch (\Exception $e) {
                    $this->command->error("❌ Error al crear nómina para {$trabajador->nombres_completos}: " . $e->getMessage());
                }
            }
        }

        $this->command->info("✅ Se crearon {$nominasCreadas} nóminas de ejemplo según normativa peruana.");
        
        // Mostrar estadísticas
        $this->mostrarEstadisticas();
    }

    /**
     * Mostrar estadísticas de las nóminas generadas
     */
    private function mostrarEstadisticas(): void
    {
        $this->command->info('📊 Estadísticas de nóminas generadas:');
        
        $estadisticas = [
            'Calculada' => Nomina::where('estado', 'Calculada')->count(),
            'Verificada' => Nomina::where('estado', 'Verificada')->count(),
            'Pagada' => Nomina::where('estado', 'Pagada')->count(),
            'Anulada' => Nomina::where('estado', 'Anulada')->count(),
        ];

        foreach ($estadisticas as $estado => $cantidad) {
            $emoji = match($estado) {
                'Calculada' => '🔵',
                'Verificada' => '🟡',
                'Pagada' => '🟢',
                'Anulada' => '🔴',
                default => '⚪'
            };
            $this->command->info("   {$emoji} {$estado}: {$cantidad}");
        }

        $totalNominas = array_sum($estadisticas);
        $totalIngresos = Nomina::sum('total_devengados');
        $totalDeducciones = Nomina::sum('total_deducciones');
        $totalNeto = Nomina::sum('neto_pagar');

        $this->command->info('💰 Resumen financiero:');
        $this->command->info("   📋 Total nóminas: {$totalNominas}");
        $this->command->info("   💵 Total ingresos: S/ " . number_format($totalIngresos, 2));
        $this->command->info("   📉 Total deducciones: S/ " . number_format($totalDeducciones, 2));
        $this->command->info("   💸 Total neto a pagar: S/ " . number_format($totalNeto, 2));
        
        $this->command->info('');
        $this->command->info('🎉 ¡Nóminas de prueba generadas exitosamente!');
        $this->command->info('🌐 Puedes ver las nóminas en: http://localhost:3000/dashboard/nominas');
    }
}
