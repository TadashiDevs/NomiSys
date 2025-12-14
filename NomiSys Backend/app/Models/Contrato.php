<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contrato extends Model
{
    use HasFactory;

    /**
     * La tabla asociada al modelo.
     *
     * @var string
     */
    protected $table = 'contratos';

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'trabajador_id',
        'tipo',
        'fecha_inicio',
        'fecha_fin',
        'cargo',
        'departamento',
        'turno',
        'jornada',
        'pension',
        'salario',
        'estado',
    ];

    /**
     * Los atributos que deben convertirse a tipos nativos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'salario' => 'integer',
    ];

    /**
     * Obtener el trabajador al que pertenece el contrato.
     */
    public function trabajador(): BelongsTo
    {
        return $this->belongsTo(Trabajador::class, 'trabajador_id');
    }

    /**
     * Obtener las nóminas del contrato.
     */
    public function nominas(): HasMany
    {
        return $this->hasMany(Nomina::class, 'contrato_id');
    }

    /**
     * Finalizar el contrato.
     */
    public function finalizar(): bool
    {
        $this->estado = 'Finalizado';
        $this->fecha_fin = now()->format('Y-m-d');
        return $this->save();
    }
}
