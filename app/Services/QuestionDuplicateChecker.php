<?php

namespace App\Services;

use App\Enums\QuestionStatus;
use App\Models\Question;

class QuestionDuplicateChecker
{
    /**
     * Check if a duplicate question exists.
     */
    public function check(array $attributes, ?int $currentQuestionId = null): ?Question
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

        // Get the first matching question (oldest)
        $firstMatch = $query->orderBy('created_at', 'asc')->first();

        // If no match found or the match is the current question, it's not a duplicate
        if ($firstMatch === null || ($currentQuestionId !== null && $firstMatch->id === $currentQuestionId)) {
            return null;
        }

        // Return the duplicate (original question)
        return $firstMatch;
    }
}
