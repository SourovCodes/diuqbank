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
            'department' => $this->whenLoaded('department', fn () => [
                'id' => $this->department->id,
                'name' => $this->department->name,
                'short_name' => $this->department->short_name,
            ]),
            'course' => $this->whenLoaded('course', fn () => [
                'id' => $this->course->id,
                'name' => $this->course->name,
            ]),
            'semester' => $this->whenLoaded('semester', fn () => [
                'id' => $this->semester->id,
                'name' => $this->semester->name,
            ]),
            'exam_type' => $this->whenLoaded('examType', fn () => [
                'id' => $this->examType->id,
                'name' => $this->examType->name,
            ]),
            'created_at' => $this->created_at,
            'submissions' => $this->whenLoaded('submissions', fn () => $this->submissions->map(fn ($submission) => [
                'id' => $submission->id,
                'user' => [
                    'name' => $submission->user?->name,
                    'username' => $submission->user?->username,
                ],
                'pdf_url' => $submission->getFirstMediaUrl('pdf'),
                'upvote_count' => (int) ($submission->upvotes_count ?? 0),
                'downvote_count' => (int) ($submission->downvotes_count ?? 0),
            ])),
        ];
    }
}
