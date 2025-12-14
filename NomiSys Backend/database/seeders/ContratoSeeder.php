<?php

namespace Database\Seeders;

use App\Models\Contrato;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContratoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar si ya hay datos en la tabla
        if (Contrato::count() > 0) {
            $this->command->info('La tabla de contratos ya tiene datos. Omitiendo seeder.');
            return;
        }

        // Verificar si existen trabajadores en la base de datos
        $trabajadoresCount = \App\Models\Trabajador::count();
        if ($trabajadoresCount === 0) {
            $this->command->info('No hay trabajadores en la base de datos. Ejecutando TrabajadorSeeder primero.');
            $this->call(TrabajadorSeeder::class);
        }

        // Datos de ejemplo basados en el frontend
        $contratos = [
            [
                'trabajador_id' => 1, // Juan Carlos Pérez Gómez
                'tipo' => 'Indefinido',
                'fecha_inicio' => '2023-01-15',
                'cargo' => 'Desarrollador',
                'departamento' => 'Tecnología',
                'turno' => 'Mañana',
                'jornada' => 'Jornada Completa',
                'pension' => 'AFP',
                'salario' => 3500,
                'estado' => 'Activo',
                'created_at' => '2023-01-10 00:00:00',
                'updated_at' => '2023-01-10 00:00:00',
            ],
            [
                'trabajador_id' => 2, // María Elena López Torres
                'tipo' => 'Plazo Fijo',
                'fecha_inicio' => '2023-02-15',
                'fecha_fin' => '2023-08-15',
                'cargo' => 'Gerente de Área',
                'departamento' => 'Administración',
                'turno' => 'Mañana',
                'jornada' => 'Jornada Completa',
                'pension' => 'AFP',
                'salario' => 4000,
                'estado' => 'Activo',
                'created_at' => '2023-02-10 00:00:00',
                'updated_at' => '2023-02-10 00:00:00',
            ],
            [
                'trabajador_id' => 3, // Pedro José Ramírez Silva
                'tipo' => 'Indefinido',
                'fecha_inicio' => '2022-05-10',
                'cargo' => 'Técnico',
                'departamento' => 'Soporte',
                'turno' => 'Tarde',
                'jornada' => 'Jornada Completa',
                'pension' => 'ONP',
                'salario' => 2800,
                'estado' => 'Finalizado',
                'created_at' => '2022-05-05 00:00:00',
                'updated_at' => '2022-12-15 00:00:00',
            ],
            [
                'trabajador_id' => 4, // Ana María Gonzales Díaz
                'tipo' => 'Indefinido',
                'fecha_inicio' => '2023-03-20',
                'cargo' => 'Contador',
                'departamento' => 'Finanzas',
                'turno' => 'Mañana',
                'jornada' => 'Jornada Completa',
                'pension' => 'AFP',
                'salario' => 3200,
                'estado' => 'Activo',
                'created_at' => '2023-03-15 00:00:00',
                'updated_at' => '2023-03-15 00:00:00',
            ],
            [
                'trabajador_id' => 5, // Luis Alberto Mendoza Castro
                'tipo' => 'Plazo Fijo',
                'fecha_inicio' => '2022-08-15',
                'fecha_fin' => '2023-08-15',
                'cargo' => 'Supervisor',
                'departamento' => 'Operaciones',
                'turno' => 'Noche',
                'jornada' => 'Media Jornada',
                'pension' => 'ONP',
                'salario' => 3800,
                'estado' => 'Activo',
                'created_at' => '2022-08-10 00:00:00',
                'updated_at' => '2022-08-10 00:00:00',
            ],
        ];

        // Insertar los datos
        foreach ($contratos as $contrato) {
            // Verificar si el trabajador existe
            $trabajadorExists = \App\Models\Trabajador::where('id', $contrato['trabajador_id'])->exists();

            if ($trabajadorExists) {
                Contrato::create($contrato);
            } else {
                $this->command->warn("No se pudo crear contrato para trabajador_id {$contrato['trabajador_id']} porque no existe.");
            }
        }
    }
}
