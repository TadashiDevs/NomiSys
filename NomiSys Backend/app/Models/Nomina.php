<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Nomina extends Model
{
    use HasFactory;

    /**
     * La tabla asociada al modelo.
     *
     * @var string
     */
    protected $table = 'nominas';

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'trabajador_id',
        'contrato_id',
        'fecha_inicio_periodo',
        'fecha_fin_periodo',
        'salario_base',
        'auxilio_transporte',
        'horas_extras_diurnas',
        'horas_extras_nocturnas',
        'valor_horas_extras_diurnas',
        'valor_horas_extras_nocturnas',
        'bonificaciones',
        'total_devengados',
        'descuento_salud',
        'descuento_pension',
        'retencion_fuente',
        'otras_deducciones',
        'total_deducciones',
        'neto_pagar',
        'estado',
        'fecha_calculo',
        'fecha_pago',
        'observaciones',
    ];

    /**
     * Los atributos que deben convertirse a tipos nativos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'fecha_inicio_periodo' => 'date',
        'fecha_fin_periodo' => 'date',
        'fecha_calculo' => 'datetime',
        'fecha_pago' => 'datetime',
        'salario_base' => 'integer',
        'auxilio_transporte' => 'integer',
        'horas_extras_diurnas' => 'integer',
        'horas_extras_nocturnas' => 'integer',
        'valor_horas_extras_diurnas' => 'integer',
        'valor_horas_extras_nocturnas' => 'integer',
        'bonificaciones' => 'integer',
        'total_devengados' => 'integer',
        'descuento_salud' => 'integer',
        'descuento_pension' => 'integer',
        'retencion_fuente' => 'integer',
        'otras_deducciones' => 'integer',
        'total_deducciones' => 'integer',
        'neto_pagar' => 'integer',
    ];

    /**
     * Obtener el trabajador al que pertenece la nómina.
     */
    public function trabajador(): BelongsTo
    {
        return $this->belongsTo(Trabajador::class, 'trabajador_id');
    }

    /**
     * Obtener el contrato asociado a la nómina.
     */
    public function contrato(): BelongsTo
    {
        return $this->belongsTo(Contrato::class, 'contrato_id');
    }

    /**
     * Scope para filtrar por año y mes.
     */
    public function scopePorPeriodo($query, $ano, $mes)
    {
        return $query->whereYear('fecha_inicio_periodo', $ano)
                    ->whereMonth('fecha_inicio_periodo', $mes);
    }

    /**
     * Scope para filtrar por estado.
     */
    public function scopePorEstado($query, $estado)
    {
        return $query->where('estado', $estado);
    }

    /**
     * Accessor para obtener el año del período.
     */
    public function getAnoAttribute()
    {
        return $this->fecha_inicio_periodo ? $this->fecha_inicio_periodo->year : null;
    }

    /**
     * Accessor para obtener el mes del período.
     */
    public function getMesAttribute()
    {
        return $this->fecha_inicio_periodo ? $this->fecha_inicio_periodo->month : null;
    }

    /**
     * Accessor para obtener el nombre del mes.
     */
    public function getNombreMesAttribute()
    {
        $meses = [
            1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
            5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
            9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
        ];

        return $meses[$this->mes] ?? '';
    }

    /**
     * Accessor para obtener el período completo.
     */
    public function getPeriodoCompletoAttribute()
    {
        return $this->nombre_mes . ' ' . $this->ano;
    }

    /**
     * Verificar si la nómina puede ser verificada
     */
    public function puedeSerVerificada(): bool
    {
        return $this->estado === 'Calculada';
    }

    /**
     * Verificar si la nómina puede ser pagada
     */
    public function puedeSerPagada(): bool
    {
        return $this->estado === 'Verificada';
    }

    /**
     * Marcar nómina como verificada
     */
    public function marcarComoVerificada(): bool
    {
        if ($this->puedeSerVerificada()) {
            $this->estado = 'Verificada';
            return $this->save();
        }
        return false;
    }

    /**
     * Marcar nómina como pagada
     */
    public function marcarComoPagada(): bool
    {
        if ($this->puedeSerPagada()) {
            $this->estado = 'Pagada';
            $this->fecha_pago = now();
            return $this->save();
        }
        return false;
    }

    /**
     * Obtener el color del badge según el estado
     */
    public function getColorEstadoAttribute(): string
    {
        return match($this->estado) {
            'Calculada' => 'blue',
            'Verificada' => 'yellow',
            'Pagada' => 'green',
            'Anulada' => 'red',
            default => 'gray'
        };
    }
}
