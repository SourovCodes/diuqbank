<?php

namespace Database\Factories;

use App\Enums\QuestionStatus;
use App\Enums\UnderReviewReason;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Semester;
use App\Models\User;
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
        // Get a random department
        $department = Department::inRandomOrder()->first() ?? Department::factory()->create();

        // Get a course from that department
        $course = Course::where('department_id', $department->id)->inRandomOrder()->first()
            ?? Course::factory()->create(['department_id' => $department->id]);

        // Get random semester and exam type
        $semester = Semester::inRandomOrder()->first() ?? Semester::factory()->create();
        $examType = ExamType::inRandomOrder()->first() ?? ExamType::factory()->create();

        // Get a random user
        $user = User::inRandomOrder()->first() ?? User::factory()->create();

        // Generate section if exam type requires it
        $section = null;
        if ($examType->requires_section) {
            $sections = ['A', 'B', 'C', 'D', 'E', 'F'];
            $section = $this->faker->randomElement($sections);
        }

        return [
            'user_id' => $user->id,
            'department_id' => $department->id,
            'course_id' => $course->id,
            'semester_id' => $semester->id,
            'exam_type_id' => $examType->id,
            'section' => $section,
            'status' => QuestionStatus::PUBLISHED,
            'view_count' => $this->faker->numberBetween(0, 100),
        ];
    }

    /**
     * Indicate that the question is under review.
     */
    public function underReview(?UnderReviewReason $reason = null): static
    {
        $reason = $reason ?? $this->faker->randomElement(UnderReviewReason::cases());

        return $this->state(fn (array $attributes) => [
            'status' => QuestionStatus::PENDING_REVIEW,
            'under_review_reason' => $reason,
            'duplicate_reason' => $reason === UnderReviewReason::DUPLICATE
                ? $this->faker->sentence()
                : null,
        ]);
    }

    /**
     * Indicate that the question is under review due to duplicate.
     */
    public function duplicate(?string $reason = null): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => QuestionStatus::PENDING_REVIEW,
            'under_review_reason' => UnderReviewReason::DUPLICATE,
            'duplicate_reason' => $reason ?? $this->faker->sentence(),
        ]);
    }

    /**
     * Indicate that the question needs fixing.
     */
    public function needFix(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => QuestionStatus::NEED_FIX,
        ]);
    }
}
