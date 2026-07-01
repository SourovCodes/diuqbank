<?php

namespace App\Http\Resources;

use App\Models\Submission;
use App\Models\User;
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
        $question = $this->relationLoaded('question') ? $this->question : null;

        return [
            'id' => $this->id,
            'views' => $this->views,
            'created_at' => $this->created_at?->toISOString(),
            'pdf_original_temporary_url' => $this->originalPdfTemporaryUrl(),
            'user' => $this->whenLoaded('user', fn (): array => [
                'name' => $this->user->name,
                'username' => $this->user->username,
                'student_id' => $this->user->student_id,
                'email' => $this->user->email,
                'avatar_url' => $this->originalAvatarUrl($this->user),
            ]),
            'department' => $question?->relationLoaded('department') && $question->department ? [
                'short_name' => $question->department->short_name,
                'name' => $question->department->name,
            ] : null,
            'course' => $question?->relationLoaded('course') && $question->course ? [
                'name' => $question->course->name,
            ] : null,
            'semester' => $question?->relationLoaded('semester') && $question->semester ? [
                'name' => $question->semester->name,
            ] : null,
            'exam_type' => $question?->relationLoaded('examType') && $question->examType ? [
                'name' => $question->examType->name,
            ] : null,
        ];
    }

    private function originalPdfTemporaryUrl(): ?string
    {
        $media = $this->getFirstMedia('pdf');

        if (! $media) {
            return null;
        }

        try {
            return $media->getTemporaryUrl(now()->addHour());
        } catch (Throwable $exception) {
            return $media->getFullUrl();
        }
    }

    private function originalAvatarUrl(User $user): string
    {
        return $user->getFirstMediaUrl('avatar')
            ?: 'https://ui-avatars.com/api/?name='.urlencode($user->name);
    }
}
