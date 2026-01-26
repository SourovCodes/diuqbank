<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Semester;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Question>
 */
class QuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $department = Department::factory()->create();

        return [
            'department_id' => $department->id,
            'course_id' => Course::factory()->create(['department_id' => $department->id])->id,
            'semester_id' => Semester::factory(),
            'exam_type_id' => ExamType::factory(),
        ];
    }
}
