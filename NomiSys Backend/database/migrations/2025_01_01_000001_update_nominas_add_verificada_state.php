<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Actualizar la columna estado para incluir 'Verificada'
        DB::statement("ALTER TABLE nominas MODIFY COLUMN estado ENUM('Calculada', 'Verificada', 'Pagada', 'Anulada') DEFAULT 'Calculada'");
        
        // Agregar comentarios a las columnas para clarificar el uso según normativa peruana
        Schema::table('nominas', function (Blueprint $table) {
            $table->comment('Tabla de nóminas según normativa laboral peruana 2025');
        });
        
        // Actualizar comentarios de campos específicos
        DB::statement("ALTER TABLE nominas MODIFY COLUMN auxilio_transporte INT DEFAULT 0 COMMENT 'Asignación familiar (10% RMV si tiene hijos y está casado/conviviente)'");
        DB::statement("ALTER TABLE nominas MODIFY COLUMN total_devengados INT COMMENT 'Total de ingresos del trabajador'");
        DB::statement("ALTER TABLE nominas MODIFY COLUMN descuento_salud INT COMMENT 'En Perú no se descuenta salud al trabajador (EsSalud es del empleador)'");
        DB::statement("ALTER TABLE nominas MODIFY COLUMN descuento_pension INT COMMENT 'AFP (10%) u ONP (13%) según sistema del trabajador'");
        DB::statement("ALTER TABLE nominas MODIFY COLUMN retencion_fuente INT DEFAULT 0 COMMENT 'Retención 5ta categoría si ingresos anuales > 7 UIT'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revertir al estado anterior
        DB::statement("ALTER TABLE nominas MODIFY COLUMN estado ENUM('Calculada', 'Pagada', 'Anulada') DEFAULT 'Calculada'");
        
        // Remover comentarios
        Schema::table('nominas', function (Blueprint $table) {
            $table->comment('');
        });
    }
};
