<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index()
    {
        return Subject::with('course', 'semester')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'course_id' => 'required|exists:courses,id',
            'semester_id' => 'required|exists:semesters,id',
            'year_level' => 'required|integer|min:1|max:4',
        ]);

        $subject = Subject::create($validated);

        return response()->json($subject->load('course', 'semester'), 201);
    }

    public function show($id)
    {
        return Subject::with('course', 'semester')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $subject = Subject::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string',
            'course_id' => 'required|exists:courses,id',
            'semester_id' => 'required|exists:semesters,id',
            'year_level' => 'required|integer|min:1|max:4',
        ]);

        $subject->update($validated);

        return response()->json($subject->load('course', 'semester'));
    }

    public function destroy($id)
    {
        $subject = Subject::findOrFail($id);
        $subject->delete();

        return response()->json(['message' => 'Subject deleted']);
    }
}