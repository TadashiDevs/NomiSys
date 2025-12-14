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
        Schema::create('contratos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trabajador_id')->constrained('trabajadores')->onDelete('cascade');
            $table->enum('tipo', ['Indefinido', 'Plazo Fijo']);
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();
            $table->string('cargo');
            $table->string('departamento');
            $table->enum('turno', ['Mañana', 'Tarde', 'Noche']);
            $table->enum('jornada', ['Jornada Completa', 'Media Jornada']);
            $table->enum('pension', ['AFP', 'ONP']);
            $table->integer('salario');
            $table->enum('estado', ['Activo', 'Finalizado'])->default('Activo');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contratos');
    }
};
