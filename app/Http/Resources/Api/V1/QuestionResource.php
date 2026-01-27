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
            'status' => $this->status->value,
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
            'submissions_count' => $this->whenCounted('submissions'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
