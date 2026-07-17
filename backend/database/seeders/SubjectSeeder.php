<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run()
    {
        $subjects = [];

        $BachelorofScienceinInformationTechnologyCourseId = $this->getCourseId('Bachelor of Science in Information Technology');

        // Bachelor - 9 subjects per semester per year (4 years × 2 semesters)
        $BachelorofScienceinInformationTechnologySubjects = [
            // 1st Year
            1 => [
                ['name' => 'Introduction to Computing', 'semester_id' => 1],
                ['name' => 'Fundamentals of Programming', 'semester_id' => 1],
                ['name' => 'Mathematics in the Modern World', 'semester_id' => 1],
                ['name' => 'English Composition', 'semester_id' => 1],
                ['name' => 'General Education: Social Sciences', 'semester_id' => 1],
                ['name' => 'Digital Literacy', 'semester_id' => 1],
                ['name' => 'Computer Hardware Basics', 'semester_id' => 1],
                ['name' => 'Physical Education 1', 'semester_id' => 1],
                ['name' => 'Values Education', 'semester_id' => 1],
                ['name' => 'Data Structures', 'semester_id' => 2],
                ['name' => 'Web Development Fundamentals', 'semester_id' => 2],
                ['name' => 'Discrete Mathematics', 'semester_id' => 2],
                ['name' => 'Literature', 'semester_id' => 2],
                ['name' => 'General Education: Natural Sciences', 'semester_id' => 2],
                ['name' => 'Database Systems Intro', 'semester_id' => 2],
                ['name' => 'Operating Systems', 'semester_id' => 2],
                ['name' => 'Physical Education 2', 'semester_id' => 2],
                ['name' => 'Philippine History', 'semester_id' => 2],
            ],
            // 2nd Year
            2 => [
                ['name' => 'Object-Oriented Programming', 'semester_id' => 1],
                ['name' => 'Database Design', 'semester_id' => 1],
                ['name' => 'Web Design and Development', 'semester_id' => 1],
                ['name' => 'Linear Algebra', 'semester_id' => 1],
                ['name' => 'Algorithms Analysis', 'semester_id' => 1],
                ['name' => 'Software Engineering Basics', 'semester_id' => 1],
                ['name' => 'Computer Networks', 'semester_id' => 1],
                ['name' => 'Physical Education 3', 'semester_id' => 1],
                ['name' => 'Risk Management', 'semester_id' => 1],
                ['name' => 'Advanced Database Systems', 'semester_id' => 2],
                ['name' => 'System Administration', 'semester_id' => 2],
                ['name' => 'Mobile App Development', 'semester_id' => 2],
                ['name' => 'Probability and Statistics', 'semester_id' => 2],
                ['name' => 'Network Security', 'semester_id' => 2],
                ['name' => 'Software Project Management', 'semester_id' => 2],
                ['name' => 'Cloud Computing', 'semester_id' => 2],
                ['name' => 'Physical Education 4', 'semester_id' => 2],
                ['name' => 'Enterprise Governance', 'semester_id' => 2],
            ],
            // 3rd Year
            3 => [
                ['name' => 'Advanced Web Development', 'semester_id' => 1],
                ['name' => 'Machine Learning Basics', 'semester_id' => 1],
                ['name' => 'Software Testing and QA', 'semester_id' => 1],
                ['name' => 'Advanced Algorithms', 'semester_id' => 1],
                ['name' => 'Information Security', 'semester_id' => 1],
                ['name' => 'System Design', 'semester_id' => 1],
                ['name' => 'DevOps and CI/CD', 'semester_id' => 1],
                ['name' => 'Capstone Project 1', 'semester_id' => 1],
                ['name' => 'Professional Ethics in IT', 'semester_id' => 1],
                ['name' => 'Artificial Intelligence', 'semester_id' => 2],
                ['name' => 'Enterprise Architecture', 'semester_id' => 2],
                ['name' => 'Data Mining and Analytics', 'semester_id' => 2],
                ['name' => 'Distributed Systems', 'semester_id' => 2],
                ['name' => 'IoT and Embedded Systems', 'semester_id' => 2],
                ['name' => 'IT Project Management', 'semester_id' => 2],
                ['name' => 'Web Services and APIs', 'semester_id' => 2],
                ['name' => 'Capstone Project 2', 'semester_id' => 2],
                ['name' => 'IT Compliance and Audit', 'semester_id' => 2],
            ],
            // 4th Year
            4 => [
                ['name' => 'Advanced Cybersecurity', 'semester_id' => 1],
                ['name' => 'Big Data Analytics', 'semester_id' => 1],
                ['name' => 'Blockchain Technology', 'semester_id' => 1],
                ['name' => 'Cloud Architecture', 'semester_id' => 1],
                ['name' => 'Advanced AI and Deep Learning', 'semester_id' => 1],
                ['name' => 'IT Strategy and Planning', 'semester_id' => 1],
                ['name' => 'Elective: Advanced Topics', 'semester_id' => 1],
                ['name' => 'Internship Seminar', 'semester_id' => 1],
                ['name' => 'Technical Writing', 'semester_id' => 1],
                ['name' => 'Quantum Computing Intro', 'semester_id' => 2],
                ['name' => 'IT Innovation Lab', 'semester_id' => 2],
                ['name' => 'Final Year Project 1', 'semester_id' => 2],
                ['name' => 'Final Year Project 2', 'semester_id' => 2],
                ['name' => 'IT Leadership', 'semester_id' => 2],
                ['name' => 'Emerging Technologies', 'semester_id' => 2],
                ['name' => 'IT Entrepreneurship', 'semester_id' => 2],
                ['name' => 'Practicum', 'semester_id' => 2],
                ['name' => 'Professional Certification Prep', 'semester_id' => 2],
            ],
        ];

        // Create BSIT subjects
        foreach ($BachelorofScienceinInformationTechnologySubjects as $yearLevel => $yearSubjects) {
            foreach ($yearSubjects as $subject) {
                $subjects[] = array_merge($subject, ['course_id' => $BachelorofScienceinInformationTechnologyCourseId, 'year_level' => $yearLevel]);
            }
        }

        

        $otherCourseNames = [
            'Bachelor of Early Childhood Education',
            'Bachelor of Elementary Education',
            'Bachelor of Special Needs Education',
            'Bachelor of Physical Education',
            'Bachelor of Technology and Livelihood Education',
            'Bachelor of Secondary Education (Major in Science, Filipino, English, Social Science, Mathematics, and Values Education)',
            'Bachelor of Arts in Communication',
            'Bachelor of Arts in Political Science',
            'Bachelor of Arts in English Language',
            'Bachelor of Science in Social Work',
            'Bachelor of Science in Biology (with Specialization in Medical Biology, Environmental Biology, and Molecular Biology)',
            'Bachelor of Library and Information Science',
            'Bachelor of Music in Music Education',
            'Bachelor of Science in Tourism Management (with Specialization in Events Management and Travel Management)',
            'Bachelor of Science in Hospitality Management (with Specialization in Hotel Operations Management, and Restaurant Operations)',
            'Bachelor of Entrepreneurship',
        ];

        foreach ($otherCourseNames as $courseName) {
            $courseId = $this->getCourseId($courseName);
            if (!$courseId) {
                continue;
            }

            for ($yearLevel = 1; $yearLevel <= 4; $yearLevel++) {
                for ($semesterId = 1; $semesterId <= 2; $semesterId++) {
                    for ($index = 1; $index <= 9; $index++) {
                        $subjects[] = [
                            'name' => "Dummy Subject Year {$yearLevel} Sem {$semesterId} #{$index}",
                            'semester_id' => $semesterId,
                            'course_id' => $courseId,
                            'year_level' => $yearLevel,
                        ];
                    }
                }
            }
        }

        foreach ($subjects as $subject) {
            Subject::create($subject);
        }
    }

    private function getCourseId(string $name): ?int
    {
        return Course::where('name', $name)->value('id');
    }
}