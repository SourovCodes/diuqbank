<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use Illuminate\Http\JsonResponse;

class MigrationController extends Controller
{
    /**
     * Export all questions with their associated data for migration.
     */
    public function questions(): JsonResponse
    {
        $questions = Question::query()
            ->with(['department', 'course', 'semester', 'examType', 'user', 'media'])
            ->get();

        $data = $questions->map(function (Question $question) {
            $media = $question->getFirstMedia('pdf');

            return [
                'id' => $question->id,
                'section' => $question->section,
                'status' => $question->status->value,
                'under_review_reason' => $question->under_review_reason?->value,
                'duplicate_reason' => $question->duplicate_reason,
                'view_count' => $question->view_count,
                'created_at' => $question->created_at->toISOString(),
                'updated_at' => $question->updated_at->toISOString(),
                'department' => [
                    'id' => $question->department->id,
                    'name' => $question->department->name,
                    'short_name' => $question->department->short_name,
                ],
                'course' => [
                    'id' => $question->course->id,
                    'name' => $question->course->name,
                    'department_id' => $question->course->department_id,
                ],
                'semester' => [
                    'id' => $question->semester->id,
                    'name' => $question->semester->name,
                ],
                'exam_type' => [
                    'id' => $question->examType->id,
                    'name' => $question->examType->name,
                    'requires_section' => $question->examType->requires_section,
                ],
                'user' => [
                    'id' => $question->user->id,
                    'name' => $question->user->name,
                    'email' => $question->user->email,
                    'username' => $question->user->username,
                    'student_id' => $question->user->student_id,
                    'avatar_url' => $question->user->avatar_url,
                ],
                'media' => $media ? [
                    'id' => $media->id,
                    'file_name' => $media->file_name,
                    'mime_type' => $media->mime_type,
                    'size' => $media->size,
                    'url' => $question->pdf_url,
                    'original_url' => $media->getFullUrl(),
                ] : null,
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'total' => $questions->count(),
                'exported_at' => now()->toISOString(),
            ],
        ]);
    }
}
