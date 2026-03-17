<?php

namespace App\Http\Resources;

use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Throwable;

/**
 * @mixin Submission
 */
class PublicSubmissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return array_merge($this->resource->toArray(), [
            'pdf_url' => $this->pdf_url,
            'pdf_original_temporary_url' => $this->originalPdfTemporaryUrl(),
            'vote_score' => (int) ($this->votes_sum_value ?? 0),
            'user' => $this->whenLoaded('user', function (): array {
                return array_merge($this->user->toArray(), [
                    'avatar_url' => $this->user->avatar_url,
                ]);
            }),
            'question' => $this->whenLoaded('question', function (): array {
                return array_merge($this->question->toArray(), [
                    'title' => $this->question->title,
                    'department' => $this->question->relationLoaded('department') ? $this->question->department?->toArray() : null,
                    'course' => $this->question->relationLoaded('course') ? $this->question->course?->toArray() : null,
                    'semester' => $this->question->relationLoaded('semester') ? $this->question->semester?->toArray() : null,
                    'exam_type' => $this->question->relationLoaded('examType') ? $this->question->examType?->toArray() : null,
                ]);
            }),
        ]);
    }

    private function originalPdfTemporaryUrl(): ?string
    {
        $media = $this->getFirstMedia('pdf');

        if (! $media) {
            return null;
        }

        try {
            return $media->getTemporaryUrl(now()->addMinutes(5));
        } catch (Throwable $exception) {
            return $media->getFullUrl();
        }
    }
}
