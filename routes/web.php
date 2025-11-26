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
    $perPage = min(max((int)$perPage, 1), 100);

    $search = $request->input('search', '');
    $status = $request->input('status', 'all');
    $sortField = $request->input('sort_field', 'created_at');
    $sortOrder = $request->input('sort_order', 'desc');

    $query = Lembur::query();

    if ($search) {
        $query->where(function ($q) use ($search) {
            $q->where('person', 'ilike', "%{$search}%")
                ->orWhere('description', 'ilike', "%{$search}%");
        });
    }

    if ($status !== 'all') {
        $query->where('status', $status);
    }

    $allowedSorts = ['created_at', 'start_date', 'finish_date', 'duration'];
    if ($sortField === 'duration') {
        $query->orderByRaw("(finish_date - start_date) " . ($sortOrder === 'asc' ? 'ASC' : 'DESC'));
    } elseif (in_array($sortField, $allowedSorts)) {
        $query->orderBy($sortField, $sortOrder === 'asc' ? 'asc' : 'desc');
    } else {
        $query->orderBy('created_at', 'desc');
    }

    $entries = $query->paginate($perPage)->withQueryString();

    return Inertia::render('overtime/ViewOvertime', [
        'entries' => $entries,
        'filters' => [
            'search' => $search,
            'status' => $status,
            'sort_field' => $sortField,
            'sort_order' => $sortOrder,
        ],
    ]);
})->name('overtime.view');

Route::get('/records', [LemburController::class, 'index'])->name('entries.index');
Route::post('/entries', [LemburController::class, 'store'])->name('entries.store');
Route::get('/entries/{entry}', [LemburController::class, 'show'])->name('entries.show');
Route::put('/entries/{entry}', [LemburController::class, 'update'])->name('entries.update');
Route::delete('/entries/{entry}', [LemburController::class, 'destroy'])->name('entries.destroy');
