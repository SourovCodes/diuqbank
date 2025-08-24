<?php

namespace App\Http\Resources;

use App\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Question */
class QuestionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'section' => $this->section,
            'status' => $this->status,
            'view_count' => $this->view_count,
            'created_at' => $this->created_at,
            'pdf_url' => $this->pdf_url,
            'pdf_size' => $this->pdf_size,
            'department' => new DepartmentResource($this->department),
            'course' => new CourseResource($this->course),
            'semester' => new SemesterResource($this->semester),
            'exam_type' => new ExamTypeResource($this->examType),
            'uploader' => [
                'name' => $this->user->name,
                'username' => $this->user->username,
                'student_id' => $this->user->student_id,
            ],
        ];
    }
}
