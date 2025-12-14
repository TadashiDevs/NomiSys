<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Trabajador;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TrabajadorController extends Controller
{
    /**
     * Crear un nuevo controlador de trabajadores.
     *
     * @return void
     */
    public function __construct()
    {
        // El middleware auth:api se aplica en routes/api.php
    }

    /**
     * Obtener todos los trabajadores.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $query = Trabajador::query();

        // No hay filtros por estado o cargo ya que estos campos se han eliminado

        $trabajadores = $query->get();

        return response()->json($trabajadores);
    }

    /**
     * Almacenar un nuevo trabajador.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'cedula' => 'required|string|unique:trabajadores',
            'nombres_completos' => 'required|string|max:200',
            'fecha_nacimiento' => 'required|date',
            'edad' => 'required|integer|min:18',
            'sexo' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'direccion' => 'required|string|max:255',
            'celular' => 'required|string|size:9',
            'estado_civil' => 'required|in:Soltero,Casado,Divorciado,Viudo',
            'numero_hijos' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $trabajador = Trabajador::create($request->all());

        return response()->json($trabajador, 201);
    }

    /**
     * Obtener un trabajador específico.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        $trabajador = Trabajador::with('contratos')->find($id);

        if (!$trabajador) {
            return response()->json(['error' => 'Trabajador no encontrado'], 404);
        }

        return response()->json($trabajador);
    }

    /**
     * Actualizar un trabajador específico.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $trabajador = Trabajador::find($id);

        if (!$trabajador) {
            return response()->json(['error' => 'Trabajador no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'cedula' => 'string|unique:trabajadores,cedula,' . $id,
            'nombres_completos' => 'string|max:200',
            'fecha_nacimiento' => 'date',
            'edad' => 'integer|min:18',
            'sexo' => 'string|max:20',
            'email' => 'nullable|email|max:255',
            'direccion' => 'string|max:255',
            'celular' => 'string|size:9',
            'estado_civil' => 'in:Soltero,Casado,Divorciado,Viudo',
            'numero_hijos' => 'integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $trabajador->update($request->all());

        return response()->json($trabajador);
    }

    /**
     * Eliminar un trabajador específico.
     *
     * @param  string  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        $trabajador = Trabajador::find($id);

        if (!$trabajador) {
            return response()->json(['error' => 'Trabajador no encontrado'], 404);
        }

        $trabajador->delete();

        return response()->json(['message' => 'Trabajador eliminado exitosamente']);
    }
}
