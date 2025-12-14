<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ContratoController;
use App\Http\Controllers\API\NominaController;
use App\Http\Controllers\API\TrabajadorController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Ruta de prueba para verificar que la API está funcionando
Route::get('/test', function (Request $request) {
    return response()->json([
        'message' => 'API funcionando correctamente',
        'status' => 'success',
        'timestamp' => now()->toDateTimeString(),
    ]);
});

// Rutas de autenticación (públicas)
Route::group(['prefix' => 'auth'], function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    
    // Rutas protegidas de autenticación
    Route::group(['middleware' => 'auth:api'], function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

// Rutas protegidas con autenticación JWT
Route::group(['middleware' => 'auth:api'], function () {
    
    // Rutas de trabajadores
    Route::group(['prefix' => 'trabajadores'], function () {
        Route::get('/', [TrabajadorController::class, 'index']);
        Route::post('/', [TrabajadorController::class, 'store']);
        Route::get('/{id}', [TrabajadorController::class, 'show']);
        Route::put('/{id}', [TrabajadorController::class, 'update']);
        Route::delete('/{id}', [TrabajadorController::class, 'destroy']);
    });

    // Rutas de contratos
    Route::group(['prefix' => 'contratos'], function () {
        Route::get('/', [ContratoController::class, 'index']);
        Route::get('/trabajador/{trabajadorId}', [ContratoController::class, 'porTrabajador']);
        Route::post('/', [ContratoController::class, 'store']);
        Route::get('/{id}', [ContratoController::class, 'show']);
        Route::put('/{id}', [ContratoController::class, 'update']);
        Route::delete('/{id}', [ContratoController::class, 'destroy']);
        Route::post('/{id}/finalizar', [ContratoController::class, 'finalizar']);
    });

    // Rutas de nóminas
    Route::group(['prefix' => 'nominas'], function () {
        Route::get('/', [NominaController::class, 'index']);
        Route::post('/calcular', [NominaController::class, 'calcular']);
        Route::post('/calcular-masivo', [NominaController::class, 'calcularMasivo']);
        Route::get('/{id}', [NominaController::class, 'show']);
        Route::post('/{id}/marcar-verificada', [NominaController::class, 'marcarVerificada']);
        Route::post('/{id}/marcar-pagada', [NominaController::class, 'marcarPagada']);
        Route::get('/{id}/boleta-pdf', [NominaController::class, 'generarBoletaPDF']);
    });
    
});
