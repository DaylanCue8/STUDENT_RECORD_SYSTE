<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Student;
use App\Models\Course;
use PHPUnit\Framework\Attributes\Test;

class StudentIdGenerationTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function student_is_created_with_correct_yy_format_id()
    {
        // Create a course first
        $course = Course::create([
            'name' => 'Computer Science',
            'code' => 'CS'
        ]);

        // Create a user
        $user = User::create([
            'first_name' => 'John',
            'middle_name' => 'Doe',
            'last_name' => 'Smith',
            'suffix' => null,
            'email' => 'john.smith@example.com',
            'password' => bcrypt('password'),
            'role' => 'student'
        ]);

        // Create student - this should generate the ID
        $student = Student::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'year_level' => 1,
            'semester' => 1,
            'status' => 'regular'
        ]);

        // Assert the ID format is YYXXXXX
        $this->assertMatchesRegularExpression('/^\d{7}$/', $student->student_id);

        // Assert it starts with current year (26 for 2026)
        $this->assertStringStartsWith('26', $student->student_id);

        // Assert the sequential number is 00001 for first student
        $this->assertStringEndsWith('00001', $student->student_id);
    }

    #[Test]
    public function student_ids_increment_correctly()
    {
        $course = Course::create([
            'name' => 'Computer Science',
            'code' => 'CS'
        ]);

        // Create first student
        $user1 = User::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => bcrypt('password'),
            'role' => 'student'
        ]);

        $student1 = Student::create([
            'user_id' => $user1->id,
            'course_id' => $course->id,
            'year_level' => 1,
            'semester' => 1,
            'status' => 'regular'
        ]);

        // Create second student
        $user2 = User::create([
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane@example.com',
            'password' => bcrypt('password'),
            'role' => 'student'
        ]);

        $student2 = Student::create([
            'user_id' => $user2->id,
            'course_id' => $course->id,
            'year_level' => 1,
            'semester' => 1,
            'status' => 'regular'
        ]);

        // Assert IDs increment
        $this->assertEquals('2600001', $student1->student_id);
        $this->assertEquals('2600002', $student2->student_id);
    }
}