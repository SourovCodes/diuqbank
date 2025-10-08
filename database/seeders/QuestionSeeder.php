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
        // Ensure we have required data
        $departments = Department::all();
        $semesters = Semester::all();
        $examTypes = ExamType::all();
        $users = User::all();

        if ($departments->isEmpty() || $semesters->isEmpty() || $examTypes->isEmpty() || $users->isEmpty()) {
            $this->command->warn('Required seed data not found. Please run other seeders first.');

            return;
        }

        // Create sample questions for each department
        foreach ($departments->take(5) as $department) {
            $courses = Course::where('department_id', $department->id)->take(3)->get();

            foreach ($courses as $course) {
                foreach ($examTypes as $examType) {
                    foreach ($semesters->take(3) as $semester) {
                        $questionData = [
                            'user_id' => $users->random()->id,
                            'department_id' => $department->id,
                            'course_id' => $course->id,
                            'semester_id' => $semester->id,
                            'exam_type_id' => $examType->id,
                            'section' => $examType->requires_section ? fake()->randomElement(['A', 'B', 'C']) : null,
                            'view_count' => fake()->numberBetween(0, 50),
                        ];

                        Question::firstOrCreate($questionData);
                    }
                }
            }
        }

        // Create some additional random questions
        Question::factory()->count(20)->create();
    }
}
