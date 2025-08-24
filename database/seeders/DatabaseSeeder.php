<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester; // added
use App\Models\User; // added
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
                 User::factory(20)->create();

        $departments = [
            ['name' => 'Computer Science & Engineering', 'short_name' => 'CSE'],
            ['name' => 'Electrical & Electronic Engineering', 'short_name' => 'EEE'],
            ['name' => 'Electronics & Communication Engineering', 'short_name' => 'ECE'],
            ['name' => 'Civil Engineering', 'short_name' => 'CE'],
            ['name' => 'Mechanical Engineering', 'short_name' => 'ME'],
            ['name' => 'Industrial & Production Engineering', 'short_name' => 'IPE'],
            ['name' => 'Architecture', 'short_name' => 'ARCH'],
            ['name' => 'Business Administration', 'short_name' => 'BBA'],
            ['name' => 'Law', 'short_name' => 'LAW'],
            ['name' => 'English', 'short_name' => 'ENG'],
            ['name' => 'Mathematics', 'short_name' => 'MATH'],
            ['name' => 'Physics', 'short_name' => 'PHY'],
            ['name' => 'Chemistry', 'short_name' => 'CHEM'],
            ['name' => 'Pharmacy', 'short_name' => 'PHARM'],
            ['name' => 'Public Health', 'short_name' => 'PH'],
            ['name' => 'Textile Engineering', 'short_name' => 'TE'],
            ['name' => 'Environmental Science', 'short_name' => 'ES'],
            ['name' => 'Biochemistry & Molecular Biology', 'short_name' => 'BMB'],
            ['name' => 'Genetic Engineering & Biotechnology', 'short_name' => 'GEB'],
            ['name' => 'Software Engineering', 'short_name' => 'SWE'],
        ];
        foreach ($departments as $department) {
            Department::factory()->create($department);
        }

        // Seed semesters (term-based names)
        $semesters = [
            ['name' => 'Fall 23'],
            ['name' => 'Spring 25'],
            ['name' => 'Summer 25'],
            ['name' => 'Short 23'],
            ['name' => 'Spring 23'],
            ['name' => 'Summer 23'],
            ['name' => 'Fall 24'],
            ['name' => 'Spring 24'],
            ['name' => 'Summer 24'],
            ['name' => 'Short 24'],
            ['name' => 'Fall 25'],
            ['name' => 'Short 25'],
            ['name' => 'Spring 26'],
            ['name' => 'Summer 26'],
        ];
        foreach ($semesters as $semester) {
            Semester::factory()->create($semester);
        }

        // Seed exam types
        $examTypes = [
            ['name' => 'Mid', 'requires_section' => false],
            ['name' => 'Final', 'requires_section' => false],
        ];
        foreach ($examTypes as $examType) {
            ExamType::factory()->create($examType);
        }

        Course::factory(100)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        Question::factory(3000)->create();
    }
}
