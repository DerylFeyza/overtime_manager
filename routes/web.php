<?php

use App\Http\Controllers\LemburController;
use App\Models\Lembur;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Illuminate\Http\Request;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/list', function (Request $request) {
    $perPage = $request->input('per_page', 10);
    $entries = Lembur::orderBy('created_at', 'desc')->paginate($perPage);

    return Inertia::render('overtime/ViewOvertime', [
        'entries' => $entries,
    ]);
})->name('overtime.view');

Route::get('/records', [LemburController::class, 'index'])->name('entries.index');
Route::post('/entries', [LemburController::class, 'store'])->name('entries.store');
Route::get('/entries/{entry}', [LemburController::class, 'show'])->name('entries.show');
Route::put('/entries/{entry}', [LemburController::class, 'update'])->name('entries.update');
Route::delete('/entries/{entry}', [LemburController::class, 'destroy'])->name('entries.destroy');
