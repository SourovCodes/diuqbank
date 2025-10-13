<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'created_at' => $this->created_at->toISOString(),
            'view_count' => $this->view_count,
            'section' => $this->section,
            'department' => $this->department->short_name ?? '',
            'course' => $this->course->name ?? '',
            'semester' => $this->semester->name ?? '',
            'exam_type' => $this->examType->name ?? '',
        ];
    }
}
