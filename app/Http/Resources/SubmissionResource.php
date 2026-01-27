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
            'pdf_url' => $pdfMedia?->getUrl(),
            'vote_score' => (int) ($this->votes_sum_value ?? 0),
            'user_vote' => $user ? $this->getUserVote($user) : null,
            'views' => $this->views,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
