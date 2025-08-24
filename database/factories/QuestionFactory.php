<?php

namespace Database\Factories;

use App\Enums\QuestionStatus;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Question;
use App\Models\Semester;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Carbon;

class QuestionFactory extends Factory
{
    protected $model = Question::class;

    public function definition(): array
    {
        $course = Course::all()->random();
        return [
            'section' => $this->faker->word(),
            'status' => $this->faker->randomElement(QuestionStatus::cases())->value,
            'view_count' => $this->faker->randomNumber(),
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),

            'user_id' => User::all()->random()->id,
            'department_id' => $course->department_id,
            'course_id' => $course->id,
            'semester_id' => Semester::all()->random()->id,
            'exam_type_id' => ExamType::all()->random()->id,
            'pdf_key' => "/questions/1aee71f2-3725-41f1-b5d2-b4505501b6c1.pdf",
            'pdf_size' => $this->faker->numberBetween(100000, 10485760),
            'is_watermarked' => $this->faker->boolean(50),

        ];
    }
}
