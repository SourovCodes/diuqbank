<?php

namespace App\Services;

use App\Enums\QuestionStatus;
use App\Models\Question;

class QuestionDuplicateChecker
{
    /**
     * Check if a duplicate question exists.
     */
    public function check(array $attributes, ?int $excludeId = null): ?Question
    {
        $query = Question::query()
            ->where('status', QuestionStatus::PUBLISHED)
            ->where('department_id', $attributes['department_id'])
            ->where('course_id', $attributes['course_id'])
            ->where('semester_id', $attributes['semester_id'])
            ->where('exam_type_id', $attributes['exam_type_id']);

        // Handle section comparison (null/empty are treated as equal)
        $section = $attributes['section'] ?? null;
        if ($section === '' || $section === null) {
            $query->whereNull('section');
        } else {
            $query->where('section', $section);
        }

        // Exclude current question when updating
        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        // Return the oldest duplicate (original question)
        return $query->orderBy('created_at', 'asc')->first();
    }
}
