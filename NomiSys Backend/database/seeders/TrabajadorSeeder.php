<?php

namespace Database\Seeders;

use App\Models\Trabajador;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TrabajadorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verificar si ya hay datos en la tabla
        if (Trabajador::count() > 0) {
            $this->command->info('La tabla de trabajadores ya tiene datos. Omitiendo seeder.');
            // Verificar si existen los trabajadores con IDs del 1 al 5
            for ($i = 1; $i <= 5; $i++) {
                if (!Trabajador::where('id', $i)->exists()) {
                    $this->command->warn("No existe trabajador con ID $i. Esto puede causar problemas con los contratos.");
                }
            }
            return;
        }

        // Datos de ejemplo actualizados según la nueva estructura de la tabla
        $trabajadores = [
            [
                'cedula' => '12345678',
                'nombres_completos' => 'Juan Carlos Pérez Gómez',
                'fecha_nacimiento' => '1985-05-15',
                'edad' => 38,
                'sexo' => 'Masculino',
                'email' => 'juan.perez@example.com',
                'direccion' => 'Av. Principal 123, Lima',
                'celular' => '987654321',
                'estado_civil' => 'Casado',
                'numero_hijos' => 2,
                'created_at' => '2023-01-10 00:00:00',
                'updated_at' => '2023-01-10 00:00:00',
            ],
            [
                'cedula' => '87654321',
                'nombres_completos' => 'María Elena López Torres',
                'fecha_nacimiento' => '1990-10-20',
                'edad' => 33,
                'sexo' => 'Femenino',
                'email' => 'maria.lopez@example.com',
                'direccion' => 'Jr. Los Pinos 456, Lima',
                'celular' => '987123456',
                'estado_civil' => 'Soltero',
                'numero_hijos' => 0,
                'created_at' => '2023-02-05 00:00:00',
                'updated_at' => '2023-02-05 00:00:00',
            ],
            [
                'cedula' => '45678912',
                'nombres_completos' => 'Pedro José Ramírez Silva',
                'fecha_nacimiento' => '1988-03-25',
                'edad' => 35,
                'sexo' => 'Masculino',
                'email' => 'pedro.ramirez@example.com',
                'direccion' => 'Calle Las Flores 789, Lima',
                'celular' => '912345678',
                'estado_civil' => 'Divorciado',
                'numero_hijos' => 1,
                'created_at' => '2022-05-05 00:00:00',
                'updated_at' => '2022-12-15 00:00:00',
            ],
            [
                'cedula' => '78912345',
                'nombres_completos' => 'Ana María Gonzales Díaz',
                'fecha_nacimiento' => '1992-07-12',
                'edad' => 31,
                'sexo' => 'Femenino',
                'email' => 'ana.gonzales@example.com',
                'direccion' => 'Av. Los Álamos 234, Lima',
                'celular' => '945678123',
                'estado_civil' => 'Casado',
                'numero_hijos' => 1,
                'created_at' => '2023-03-15 00:00:00',
                'updated_at' => '2023-03-15 00:00:00',
            ],
            [
                'cedula' => '32165498',
                'nombres_completos' => 'Luis Alberto Mendoza Castro',
                'fecha_nacimiento' => '1980-12-05',
                'edad' => 43,
                'sexo' => 'Masculino',
                'email' => 'luis.mendoza@example.com',
                'direccion' => 'Jr. Las Palmeras 567, Lima',
                'celular' => '956789123',
                'estado_civil' => 'Viudo',
                'numero_hijos' => 3,
                'created_at' => '2022-08-10 00:00:00',
                'updated_at' => '2022-08-10 00:00:00',
            ],
        ];

        // Insertar los datos
        foreach ($trabajadores as $trabajador) {
            Trabajador::create($trabajador);
        }
    }
}
