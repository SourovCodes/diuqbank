<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Question
 */
class QuestionIndexResource extends JsonResource
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
            'views' => (int) $this->submissions_max_views,
            'created_at' => $this->created_at,
        ];
    }
}
