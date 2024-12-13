<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'departments' => $this->departments->pluck('name')->join(', '),
            'semesters' => $this->semesters->pluck('name')->join(', '),
            'exam_types' => $this->exam_types->pluck('name')->join(', '),
            'course_names' => $this->course_names->pluck('name')->join(', '),

        ];
    }
}
