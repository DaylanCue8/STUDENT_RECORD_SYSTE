<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    /**
     * Display all grades (with optional filtering).
     */
    public function index()
    {
        return Grade::with('student', 'subject')->get();
    }

    /**
     * Store a new grade.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id'  => 'required|exists:students,id',
            'subject_id'  => 'required|exists:subjects,id',
            'grade'       => 'required|numeric|min:0|max:100',
            'grade_letter' => 'nullable|string|max:2',
            'remarks'     => 'nullable|string|max:255',
        ]);

        $grade = Grade::updateOrCreate(
            ['student_id' => $validated['student_id'], 'subject_id' => $validated['subject_id']],
            $validated
        );

        return response()->json([
            'message' => 'Grade saved successfully.',
            'grade'   => $grade
        ], 201);
    }

    /**
     * Display a specific grade.
     */
    public function show($id)
    {
        $grade = Grade::with('student', 'subject')->findOrFail($id);
        return response()->json($grade);
    }

    /**
     * Update a specific grade.
     */
    public function update(Request $request, $id)
    {
        $grade = Grade::findOrFail($id);

        $validated = $request->validate([
            'grade'        => 'nullable|numeric|min:0|max:100',
            'grade_letter' => 'nullable|string|max:2',
            'remarks'      => 'nullable|string|max:255',
        ]);

        $grade->update($validated);

        return response()->json([
            'message' => 'Grade updated successfully.',
            'grade'   => $grade
        ]);
    }

    /**
     * Delete a specific grade.
     */
    public function destroy($id)
    {
        $grade = Grade::findOrFail($id);
        $grade->delete();

        return response()->json([
            'message' => 'Grade deleted successfully.'
        ]);
    }

    /**
     * Get all grades for a specific student.
     */
    public function studentGrades($student)
    {
        $grades = Grade::with('subject')
            ->where('student_id', $student)
            ->get();

        return response()->json($grades);
    }

    /**
     * Get all grades for a specific subject.
     */
    public function subjectGrades($subject)
    {
        $grades = Grade::with('student')
            ->where('subject_id', $subject)
            ->get();

        return response()->json($grades);
    }
}
