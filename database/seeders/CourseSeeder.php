<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Department;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding courses...');

        $departments = Department::all();

        $courseTemplates = [
            'Introduction to',
            'Advanced',
            'Fundamentals of',
            'Applied',
            'Theoretical',
            'Practical',
            'Modern',
            'Contemporary',
            'Classical',
            'Experimental',
            'Research Methods in',
            'Special Topics in',
            'Seminar in',
            'Workshop on',
            'Project on',
            'Laboratory in',
            'Studio on',
            'Principles of',
            'Theory of',
            'Practice of',
            'Analysis of',
            'Design of',
            'Development of',
            'Management of',
            'Systems in',
            'Techniques in',
            'Methods in',
            'Applications of',
            'Innovations in',
            'Trends in',
        ];

        foreach ($departments as $department) {
            // Generate between 10 to 30 courses per department
            $courseCount = rand(10, 30);
            $this->command->info("Creating {$courseCount} courses for {$department->name}");

            for ($i = 1; $i <= $courseCount; $i++) {
                // Use template + number to ensure uniqueness
                if ($i <= count($courseTemplates)) {
                    $courseName = $courseTemplates[$i - 1].' '.$department->short_name;
                } else {
                    $courseName = $department->short_name.' '.($i - count($courseTemplates));
                }

                Course::create([
                    'department_id' => $department->id,
                    'name' => $courseName,
                ]);
            }
        }
    }
}
