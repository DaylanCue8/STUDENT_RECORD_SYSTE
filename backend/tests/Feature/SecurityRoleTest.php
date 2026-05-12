<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Student;
use App\Models\Course;
use PHPUnit\Framework\Attributes\Test;

class SecurityRoleTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function student_cannot_access_admin_dashboard()
    {
        // Create a student user
        $user = User::create([
            'first_name' => 'John',
            'last_name' => 'Student',
            'email' => 'student@example.com',
            'password' => bcrypt('password'),
            'role' => 'student'
        ]);

        $course = Course::create([
            'name' => 'Computer Science',
            'code' => 'CS'
        ]);

        Student::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'student_id' => '2600001',
            'year_level' => 1,
            'semester' => 1,
            'status' => 'regular'
        ]);

        // Login as student
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'student@example.com',
            'password' => 'password'
        ]);

        $token = $loginResponse->json('access_token');

        // Try to access admin-only endpoints
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/students');

        // Should be forbidden (403)
        $response->assertStatus(403);
    }

    #[Test]
    public function admin_can_access_student_management()
    {
        // Create an admin user
        $admin = User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin'
        ]);

        // Login as admin
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'password'
        ]);

        $token = $loginResponse->json('access_token');

        // Access admin-only endpoints
        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token
        ])->getJson('/api/students');

        // Should succeed
        $response->assertStatus(200);
    }

    #[Test]
    public function unauthenticated_user_cannot_access_protected_routes()
    {
        // Try to access protected route without token
        $response = $this->getJson('/api/students');

        $response->assertStatus(401);
    }
}