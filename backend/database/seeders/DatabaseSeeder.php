<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
       $this->call([
        CourseSeeder::class,
        SemesterSeeder::class,
        SubjectSeeder::class,
        AdminSeeder::class,
    ]);

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'first_name' => 'Test',
                'last_name'  => 'User',
                'middle_name' => null,
                'suffix' => null,
                'password' => bcrypt('password'),
                'role' => 'student',
            ]
        );
    }
}
