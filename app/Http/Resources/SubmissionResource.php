<?php

namespace App\Http\Resources;

use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Submission
 */
class SubmissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $pdfMedia = $this->getFirstMedia('pdf');
        $user = $request->user();

        return [
            'id' => $this->id,
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'question' => $this->whenLoaded('question', fn () => [
                'id' => $this->question->id,
                'department' => $this->question->relationLoaded('department') ? [
                    'id' => $this->question->department?->id,
                    'name' => $this->question->department?->name,
                    'short_name' => $this->question->department?->short_name,
                ] : null,
                'course' => $this->question->relationLoaded('course') ? [
                    'id' => $this->question->course?->id,
                    'name' => $this->question->course?->name,
                ] : null,
                'semester' => $this->question->relationLoaded('semester') ? [
                    'id' => $this->question->semester?->id,
                    'name' => $this->question->semester?->name,
                ] : null,
                'exam_type' => $this->question->relationLoaded('examType') ? [
                    'id' => $this->question->examType?->id,
                    'name' => $this->question->examType?->name,
                ] : null,
            ]),
            'pdf_url' => $pdfMedia?->getUrl(),
            'vote_score' => (int) ($this->votes_sum_value ?? 0),
            'user_vote' => $user ? $this->getUserVote($user) : null,
            'views' => $this->views,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
