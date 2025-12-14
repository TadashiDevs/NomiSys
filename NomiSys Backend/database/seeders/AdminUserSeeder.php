<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear usuario administrador si no existe
        User::firstOrCreate(
            ['email' => 'admin@nomisys.com'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Crear usuario normal para pruebas si no existe
        User::firstOrCreate(
            ['email' => 'usuario@nomisys.com'],
            [
                'name' => 'Usuario',
                'password' => Hash::make('usuario123'),
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );
    }
}
