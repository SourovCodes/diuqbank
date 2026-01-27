<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Question
 */
class QuestionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'department' => [
                'id' => $this->department->id,
                'name' => $this->department->name,
                'short_name' => $this->department->short_name,
            ],
            'course' => [
                'id' => $this->course->id,
                'name' => $this->course->name,
            ],
            'semester' => [
                'id' => $this->semester->id,
                'name' => $this->semester->name,
            ],
            'exam_type' => [
                'id' => $this->examType->id,
                'name' => $this->examType->name,
            ],
            'created_at' => $this->created_at,
            'submissions' => $this->submissions->map(fn ($submission) => [
                'id' => $submission->id,
                'user' => [
                    'name' => $submission->user->name,
                    'username' => $submission->user->username,
                ],
                'pdf_url' => $submission->getFirstMediaUrl('pdf'),
                'upvote_count' => (int) $submission->upvotes_count,
                'downvote_count' => (int) $submission->downvotes_count,
            ]),
        ];
    }
}
