<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\SubjectController;

// Public Route
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes (Require Token)
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth actions
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Student Management
    Route::get('/students',             [StudentController::class, 'index']);
    Route::post('/students',            [StudentController::class, 'store']);
    Route::get('/students/{id}',        [StudentController::class, 'show']);
    Route::put('/students/{id}',        [StudentController::class, 'update']);
    Route::put('/students/{id}/grade',  [StudentController::class, 'updateGrade']);
    Route::delete('/students/{id}',      [StudentController::class, 'destroy']);
    Route::get('/student/profile',      [StudentController::class, 'showProfile']);

    // Course Management
    Route::apiResource('courses', CourseController::class);

    // Semester Management
    Route::apiResource('semesters', SemesterController::class);

    // Subject Management
    Route::apiResource('subjects', SubjectController::class);

    // Grade Management
    Route::apiResource('grades', GradeController::class);
    Route::get('/students/{student}/grades', [GradeController::class, 'studentGrades']);
    Route::get('/subjects/{subject}/grades', [GradeController::class, 'subjectGrades']);
});