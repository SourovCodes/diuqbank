<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Database\Seeder;

class QuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding questions...');

        // Get all necessary data
        $users = User::all();
        $departments = Department::all();
        $semesters = Semester::all();
        $examTypes = ExamType::all();

        if ($users->isEmpty() || $departments->isEmpty() || $semesters->isEmpty() || $examTypes->isEmpty()) {
            $this->command->warn('Required seed data not found. Please run other seeders first.');

            return;
        }

        $this->command->info("Creating 100 questions for each of {$users->count()} users...");

        foreach ($users as $user) {
            $this->command->info("Creating questions for user: {$user->name}");

            for ($i = 0; $i < 100; $i++) {
                // Random department
                $department = $departments->random();

                // Get courses for this department
                $courses = Course::where('department_id', $department->id)->get();

                if ($courses->isEmpty()) {
                    continue;
                }

                $course = $courses->random();
                $semester = $semesters->random();
                $examType = $examTypes->random();

                Question::create([
                    'user_id' => $user->id,
                    'department_id' => $department->id,
                    'course_id' => $course->id,
                    'semester_id' => $semester->id,
                    'exam_type_id' => $examType->id,
                    'section' => $examType->requires_section ? fake()->randomElement(['A', 'B', 'C']) : null,
                    'view_count' => fake()->numberBetween(0, 100),
                ]);
            }
        }

        $this->command->info('Questions seeded successfully!');
    }
}
