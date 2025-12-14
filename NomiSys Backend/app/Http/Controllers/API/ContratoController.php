<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Contrato;
use App\Models\Trabajador;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContratoController extends Controller
{
    /**
     * Crear un nuevo controlador de contratos.
     *
     * @return void
     */
    public function __construct()
    {
        // El middleware auth:api se aplica en routes/api.php
    }

    /**
     * Obtener todos los contratos.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Contrato::with('trabajador');

        // Filtrar por estado si se proporciona
        if ($request->has('estado')) {
            $query->where('estado', $request->estado);
        }

        // Filtrar por tipo si se proporciona
        if ($request->has('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        $contratos = $query->get();

        return response()->json($contratos);
    }

    /**
     * Almacenar un nuevo contrato.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'trabajador_id' => 'required|exists:trabajadores,id',
            'tipo' => 'required|in:Indefinido,Plazo Fijo',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|required_if:tipo,Plazo Fijo|after:fecha_inicio',
            'cargo' => 'required|string|max:100',
            'departamento' => 'required|string|max:100',
            'turno' => 'required|in:Mañana,Tarde,Noche',
            'jornada' => 'required|in:Jornada Completa,Media Jornada',
            'pension' => 'required|in:AFP,ONP',
            'salario' => 'required|integer|min:1025',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Verificar que el trabajador exista
        $trabajador = Trabajador::find($request->trabajador_id);
        if (!$trabajador) {
            return response()->json(['error' => 'Trabajador no encontrado'], 404);
        }

        $contrato = Contrato::create($request->all());

        return response()->json($contrato, 201);
    }

    /**
     * Obtener un contrato específico.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        $contrato = Contrato::with('trabajador')->find($id);

        if (!$contrato) {
            return response()->json(['error' => 'Contrato no encontrado'], 404);
        }

        return response()->json($contrato);
    }

    /**
     * Actualizar un contrato específico.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $contrato = Contrato::find($id);

        if (!$contrato) {
            return response()->json(['error' => 'Contrato no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'trabajador_id' => 'exists:trabajadores,id',
            'tipo' => 'in:Indefinido,Plazo Fijo',
            'fecha_inicio' => 'date',
            'fecha_fin' => 'nullable|date|required_if:tipo,Plazo Fijo|after:fecha_inicio',
            'cargo' => 'string|max:100',
            'departamento' => 'string|max:100',
            'turno' => 'in:Mañana,Tarde,Noche',
            'jornada' => 'in:Jornada Completa,Media Jornada',
            'pension' => 'in:AFP,ONP',
            'salario' => 'integer|min:1025',
            'estado' => 'in:Activo,Finalizado',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $contrato->update($request->all());

        return response()->json($contrato);
    }

    /**
     * Eliminar un contrato específico.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        $contrato = Contrato::find($id);

        if (!$contrato) {
            return response()->json(['error' => 'Contrato no encontrado'], 404);
        }

        $contrato->delete();

        return response()->json(['message' => 'Contrato eliminado exitosamente']);
    }

    /**
     * Finalizar un contrato.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function finalizar(Request $request, string $id): JsonResponse
    {
        $contrato = Contrato::find($id);

        if (!$contrato) {
            return response()->json(['error' => 'Contrato no encontrado'], 404);
        }

        // Establecer la fecha de fin como la fecha actual
        $contrato->fecha_fin = now()->format('Y-m-d');
        $contrato->estado = 'Finalizado';

        if ($contrato->save()) {
            return response()->json($contrato);
        }

        return response()->json(['error' => 'Error al finalizar el contrato'], 500);
    }

    /**
     * Obtener contratos por trabajador.
     *
     * @param  string  $trabajadorId
     * @return \Illuminate\Http\JsonResponse
     */
    public function porTrabajador(string $trabajadorId): JsonResponse
    {
        $trabajador = Trabajador::find($trabajadorId);

        if (!$trabajador) {
            return response()->json(['error' => 'Trabajador no encontrado'], 404);
        }

        $contratos = Contrato::where('trabajador_id', $trabajadorId)->get();

        return response()->json($contratos);
    }
}
