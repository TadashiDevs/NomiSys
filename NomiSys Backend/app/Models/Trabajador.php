<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trabajador extends Model
{
    use HasFactory;

    /**
     * La tabla asociada al modelo.
     *
     * @var string
     */
    protected $table = 'trabajadores';

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'cedula',
        'nombres_completos',
        'fecha_nacimiento',
        'edad',
        'sexo',
        'email',
        'direccion',
        'celular',
        'estado_civil',
        'numero_hijos',
    ];

    /**
     * Los atributos que deben convertirse a tipos nativos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'fecha_nacimiento' => 'date',
        'edad' => 'integer',
        'numero_hijos' => 'integer',
    ];

    /**
     * Obtener los contratos del trabajador.
     */
    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class, 'trabajador_id');
    }

    /**
     * Obtener las nóminas del trabajador.
     */
    public function nominas(): HasMany
    {
        return $this->hasMany(Nomina::class, 'trabajador_id');
    }

    /**
     * Ya no es necesario este accessor porque ahora tenemos la columna nombres_completos
     * pero lo mantenemos por compatibilidad con el código existente.
     */
    public function getNombreCompletoAttribute(): string
    {
        return $this->nombres_completos;
    }
}
