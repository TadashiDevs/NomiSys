<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Ejecutar los seeders en orden
        $this->call([
            AdminUserSeeder::class,    // Primero usuarios
            TrabajadorSeeder::class,   // Luego trabajadores
            ContratoSeeder::class,     // Luego contratos (dependen de trabajadores)
            NominaPeruSeeder::class,   // Nóminas según normativa peruana 2025
        ]);
    }
}
