<?php

namespace App\Http\Controllers;

use App\Models\Lembur;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LemburController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index()
  {
    $entries = Lembur::latest()->get();

    return Inertia::render('Records', [
      'entries' => $entries,
    ]);
  }

  /**
   * Store a newly created resource in storage.
   */
  public function store(Request $request)
  {
    $validated = $request->validate([
      'person' => 'required|string|max:100',
      'start_date' => 'required|date',
      'finish_date' => 'required|date|after:start_date',
      'description' => 'required|string|max:500',
      'status' => 'required|in:Pending,Compensated,Not Compensated',
    ]);

    Lembur::create($validated);

    return redirect()->back()->with('success', 'Lembur created successfully');
  }
  /**
   * Display the specified resource.
   */
  public function show(Lembur $entry)
  {
    return Inertia::render('Lembur/Show', [
      'entry' => $entry,
    ]);
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(Request $request, Lembur $entry)
  {
    $validated = $request->validate([
      'status' => 'required|in:Pending,Compensated,Not Compensated',
    ]);

    $entry->update($validated);

    return redirect()->back();
  }
  /**
   * Remove the specified resource from storage.
   */
  public function destroy(Lembur $entry)
  {
    $entry->delete();

    return redirect()->back();
  }
}
