<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionDetailResource extends JsonResource
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
            'pdf_size' => $this->pdf_size,
            'pdf_url' => $this->pdf_url,
            'section' => $this->section,
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
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'username' => $this->user->username,
                'student_id' => $this->user->student_id,
                'profile_picture_url' => $this->user->getFirstMediaUrl('profile_picture'),
            ],
        ];
    }
}
