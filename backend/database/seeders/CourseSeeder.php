<?php

namespace Database\Seeders;

use App\Models\Course;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run()
    {
        $courses = [

            // College of Education (COE)
            ['name' => 'Bachelor of Early Childhood Education'],
            ['name' => 'Bachelor of Elementary Education'],
            ['name' => 'Bachelor of Special Needs Education'],
            ['name' => 'Bachelor of Physical Education'],
            ['name' => 'Bachelor of Technology and Livelihood Education'],
            ['name' => 'Bachelor of Secondary Education (Major in Science, Filipino, English, Social Science, Mathematics, and Values Education)'],

            // College of Arts & Sciences (CAS)
            ['name' => 'Bachelor of Arts in Communication'],
            ['name' => 'Bachelor of Arts in Political Science'],
            ['name' => 'Bachelor of Arts in English Language'],
            ['name' => 'Bachelor of Science in Social Work'],
            ['name' => 'Bachelor of Science in Biology (with Specialization in Medical Biology, Environmental Biology, and Molecular Biology)'],
            ['name' => 'Bachelor of Science in Information Technology'],
            ['name' => 'Bachelor of Library and Information Science'],
            ['name' => 'Bachelor of Music in Music Education'],

            // College of Management & Entrepreneurship (CME)
            ['name' => 'Bachelor of Science in Tourism Management (with Specialization in Events Management and Travel Management)'],
            ['name' => 'Bachelor of Science in Hospitality Management (with Specialization in Hotel Operations Management, and Restaurant Operations)'],
            ['name' => 'Bachelor of Entrepreneurship'],
        ];

        foreach ($courses as $course) {
            Course::firstOrCreate(['name' => $course['name']]);
        }
    }
}