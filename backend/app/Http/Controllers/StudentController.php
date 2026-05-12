<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Student;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    /**
     * Display a listing of all students with user details.
     */
    public function index()
    {
        if (request()->user()->role !== 'admin') {
            abort(403, 'Access denied');
        }
        return Student::with('user', 'course', 'grades.subject.semester')->get();
    }

    /**
     * Store a new student + user account.
     */
    public function store(Request $request)
{
    $validated = $request->validate([
        'first_name'  => 'required|string|max:255',
        'middle_name' => 'nullable|string|max:255',
        'last_name'   => 'required|string|max:255',
        'suffix'      => 'nullable|string|max:50',
        'email'       => 'required|email|unique:users,email',
        'course_id'   => 'required|exists:courses,id',
        'year_level'  => 'required|integer|min:1|max:4',
        'semester'    => 'required|integer|in:1,2',
    ]);

    // ✅ Generate ID BEFORE the transaction
    $yearPrefix  = date('y'); // 'Y' = 2026, 'y' = 26

$lastStudent = Student::where('student_id', 'LIKE', "{$yearPrefix}%")
    ->orderBy('student_id', 'desc')
    ->first();

$newNumber = $lastStudent
    ? str_pad((int) substr($lastStudent->student_id, 4) + 1, 5, '0', STR_PAD_LEFT)
    : '00001';

$generatedId = $yearPrefix . $newNumber; // e.g. "26" + "00001" = "2600001"

    return DB::transaction(function () use ($validated, $generatedId) {

        $user = User::create([
            'first_name'  => $validated['first_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'last_name'   => $validated['last_name'],
            'suffix'      => $validated['suffix'] ?? null,
            'email'       => $validated['email'],
            'password'    => Hash::make('LEYTENORMALUNIVERSITY'),
            'role'        => 'student',
        ]);

        $student = Student::create([
            'user_id'    => $user->id,
            'student_id' => $generatedId,
            'course_id'  => $validated['course_id'],
            'year_level' => $validated['year_level'],
            'semester'   => $validated['semester'],
        ]);

        return response()->json([
            'message' => 'Student account created successfully.',
            'student' => [
                'id' => $student->id,
                'student_id' => $student->student_id,
                'user_id' => $student->user_id,
                'course_id' => $student->course_id,
                'year_level' => $student->year_level,
                'semester' => $student->semester,
                'status' => $student->status,
                'created_at' => $student->created_at,
                'updated_at' => $student->updated_at,
                'user' => $student->load('user')->user,
            ],
        ], 201);
    });
}

    /**
     * Update grades for a student (bulk update)
     */
    public function updateGrade(Request $request, $id)
    {
        $validated = $request->validate([
            'grades' => 'required|array',
            'grades.*.subject_id' => 'required|exists:subjects,id',
            'grades.*.grade' => 'nullable|numeric|min:0|max:5',
        ]);

        $student = Student::findOrFail($id);

        $updatedGrades = [];
        foreach ($validated['grades'] as $gradeData) {
            $grade = \App\Models\Grade::updateOrCreate(
                ['student_id' => $student->id, 'subject_id' => $gradeData['subject_id']],
                ['grade' => $gradeData['grade'] ?? 0]
            );
            $updatedGrades[] = $grade;
        }

        return response()->json([
            'message' => 'Grades updated successfully.',
            'grades' => $updatedGrades,
        ]);
    }

    /**
     * Delete a student and their associated user account.
     */
    public function destroy($id)
    {
        $student = Student::with('user')->findOrFail($id);

        DB::transaction(function () use ($student) {
            $userId = $student->user_id;
            $student->delete();           // delete student record first (FK)
            User::destroy($userId);       // then delete the login account
        });

        return response()->json([
            'message' => 'Student removed successfully.',
        ]);
    }

    /**
     * Get the profile and academic data of the currently logged-in student.
     */
    public function showProfile(Request $request)
    {
        // Get the authenticated user from the token
        $user = $request->user();

        // Retrieve the student record linked to this user
        $studentData = Student::with('user', 'course', 'grades.subject.semester')
            ->where('user_id', $user->id)
            ->first();

        if (!$studentData) {
            return response()->json([
                'message' => 'Student academic record not found.'
            ], 404);
        }

        return response()->json($studentData);
    }

    /**
     * Get a specific student's details (admin view).
     */
    public function show($id)
    {
        $student = Student::with('user', 'course', 'grades.subject.semester')->findOrFail($id);
        return response()->json($student);
    }

    /**
     * Update student details (e.g., status, year_level, semester).
     */
    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $validated = $request->validate([
            'status'     => 'nullable|in:regular,irregular',
            'year_level' => 'nullable|integer|min:1|max:4',
            'semester'   => 'nullable|integer|in:1,2',
        ]);

        $student->update($validated);

        return response()->json([
            'message' => 'Student updated successfully.',
            'student' => $student
        ]);
    }

}