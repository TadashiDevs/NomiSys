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
        Schema::create('trabajadores', function (Blueprint $table) {
            $table->id();
            $table->string('cedula')->unique();
            $table->string('nombres_completos');
            $table->date('fecha_nacimiento');
            $table->integer('edad');
            $table->string('sexo');
            $table->string('email')->nullable();
            $table->string('direccion');
            $table->string('celular');
            $table->enum('estado_civil', ['Soltero', 'Casado', 'Divorciado', 'Viudo']);
            $table->integer('numero_hijos');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trabajadores');
    }
};
