<?php

namespace App\Http\Controllers;

use App\Models\Entry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EntryController extends Controller
{
  /**
   * Display a listing of the resource.
   */
  public function index()
  {
    $entries = Entry::latest()->get();

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

    Entry::create($validated);

    return redirect()->back()->with('success', 'Entry created successfully');
  }
  /**
   * Display the specified resource.
   */
  public function show(Entry $entry)
  {
    return Inertia::render('Entry/Show', [
      'entry' => $entry,
    ]);
  }

  /**
   * Update the specified resource in storage.
   */
  public function update(Request $request, Entry $entry)
  {
    $validated = $request->validate([
      'person' => 'required|string|max:100',
      'start_date' => 'required|date',
      'finish_date' => 'required|date|after:start_date',
      'description' => 'required|string|max:500',
      'status' => 'required|in:Pending,Compensated,Not Compensated',
    ]);

    $entry->update($validated);

    return redirect()->back()->with('success', 'Entry updated successfully');
  }
  /**
   * Remove the specified resource from storage.
   */
  public function destroy(Entry $entry)
  {
    $entry->delete();

    return redirect()->back()->with('success', 'Entry deleted successfully');
  }
}
