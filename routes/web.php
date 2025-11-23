<?php

use App\Http\Controllers\EntryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Entry routes
Route::get('/records', [EntryController::class, 'index'])->name('entries.index');
Route::post('/entries', [EntryController::class, 'store'])->name('entries.store');
Route::get('/entries/{entry}', [EntryController::class, 'show'])->name('entries.show');
Route::put('/entries/{entry}', [EntryController::class, 'update'])->name('entries.update');
Route::delete('/entries/{entry}', [EntryController::class, 'destroy'])->name('entries.destroy');

require __DIR__ . '/settings.php';
