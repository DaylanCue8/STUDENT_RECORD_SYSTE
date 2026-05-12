<?php

namespace Database\Seeders;

use App\Models\Semester;
use Illuminate\Database\Seeder;

class SemesterSeeder extends Seeder
{
    public function run()
    {
        $semesters = [
            ['name' => '1st Semester', 'academic_year' => '2025-2026'],
            ['name' => '2nd Semester', 'academic_year' => '2025-2026'],
        ];

        foreach ($semesters as $semester) {
            Semester::create($semester);
        }
    }
}