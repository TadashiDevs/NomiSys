<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('nominas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trabajador_id')->constrained('trabajadores')->onDelete('cascade');
            $table->foreignId('contrato_id')->constrained('contratos')->onDelete('cascade');
            
            // Información del período
            $table->date('fecha_inicio_periodo');
            $table->date('fecha_fin_periodo');
            
            // Devengados
            $table->integer('salario_base');
            $table->integer('auxilio_transporte')->default(0);
            $table->integer('horas_extras_diurnas')->default(0);
            $table->integer('horas_extras_nocturnas')->default(0);
            $table->integer('valor_horas_extras_diurnas')->default(0);
            $table->integer('valor_horas_extras_nocturnas')->default(0);
            $table->integer('bonificaciones')->default(0);
            $table->integer('total_devengados');
            
            // Deducciones
            $table->integer('descuento_salud'); // 4%
            $table->integer('descuento_pension'); // 4%
            $table->integer('retencion_fuente')->default(0);
            $table->integer('otras_deducciones')->default(0);
            $table->integer('total_deducciones');
            
            // Neto a pagar
            $table->integer('neto_pagar');
            
            // Estado y control (agregado estado "Verificada")
            $table->enum('estado', ['Calculada', 'Verificada', 'Pagada', 'Anulada'])->default('Calculada');
            $table->timestamp('fecha_calculo');
            $table->timestamp('fecha_pago')->nullable();
            $table->text('observaciones')->nullable();
            
            $table->timestamps();
            
            // Índices únicos para evitar duplicados
            $table->unique(['trabajador_id', 'fecha_inicio_periodo'], 'unique_nomina_trabajador_periodo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nominas');
    }
};
