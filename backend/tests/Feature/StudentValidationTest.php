<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;
use App\Models\Course;
use App\Models\User;
use PHPUnit\Framework\Attributes\Test;

class StudentValidationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $this->actingAs($this->admin, 'sanctum');
    }

    #[Test]
    public function registration_fails_if_email_is_missing()
    {
        // Create a course first
        $course = Course::create([
            'name' => 'Computer Science',
            'code' => 'CS'
        ]);

        // Attempt to create student without email
        $response = $this->postJson('/api/students', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'course_id' => $course->id,
            'year_level' => 1,
            'semester' => 1,
        ]);

        // Assert validation error for missing email
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
    }

    #[Test]
    public function registration_succeeds_with_valid_data()
    {
        $course = Course::create([
            'name' => 'Computer Science',
            'code' => 'CS'
        ]);

        $response = $this->postJson('/api/students', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'course_id' => $course->id,
            'year_level' => 1,
            'semester' => 1,
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'student' => [
                         'id',
                         'student_id',
                         'user_id',
                         'course_id',
                         'year_level',
                         'semester',
                         'status',
                     ]
                 ]);
    }

    #[Test]
    public function registration_fails_with_duplicate_email()
    {
        $course = Course::create([
            'name' => 'Computer Science',
            'code' => 'CS'
        ]);

        // Create first student
        $this->postJson('/api/students', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'course_id' => $course->id,
            'year_level' => 1,
            'semester' => 1,
        ]);

        // Try to create second student with same email
        $response = $this->postJson('/api/students', [
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'john.doe@example.com', // Same email
            'course_id' => $course->id,
            'year_level' => 1,
            'semester' => 1,
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
    }
}