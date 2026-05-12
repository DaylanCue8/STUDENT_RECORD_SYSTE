<?php

namespace App\Http\Controllers;

use App\Models\Semester;
use Illuminate\Http\Request;

class SemesterController extends Controller
{
    public function index()
    {
        return Semester::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'academic_year' => 'required|string',
        ]);

        $semester = Semester::create($validated);

        return response()->json($semester, 201);
    }

    public function show($id)
    {
        return Semester::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $semester = Semester::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string',
            'academic_year' => 'required|string',
        ]);

        $semester->update($validated);

        return response()->json($semester);
    }

    public function destroy($id)
    {
        $semester = Semester::findOrFail($id);
        $semester->delete();

        return response()->json(['message' => 'Semester deleted']);
    }
}