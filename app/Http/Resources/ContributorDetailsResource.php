<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContributorDetailsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'name' => $this->name,
            'username' => $this->username,
            'student_id' => $this->student_id,
            'questions_count' => $this->questions_count,
            'total_views' => $this->total_views ?? 0,
            'avatar'=> $this->avatar_url,
            'questions' => QuestionResource::collection($this->questions),
        ];
    }
}
