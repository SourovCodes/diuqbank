<?php

namespace App\Http\Resources;

use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Question
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
            'submissions_count' => $this->whenCounted('submissions'),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
