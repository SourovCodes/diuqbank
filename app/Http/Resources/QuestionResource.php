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
            'uploaded_by' => $this->user->name,
            'uploaded_ago' => $this->created_at->diffForHumans(),
            'departments' => $this->departments->pluck('name'),
            'semesters' => $this->semesters->pluck('name'),
            'exam_types' => $this->exam_types->pluck('name'),
            'course_names' => $this->course_names->pluck('name'),
            'pdf_url' => $this->getFirstMedia('question-files')->watermarked_pdf_url

        ];
    }
}
