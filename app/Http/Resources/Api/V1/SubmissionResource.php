<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Submission
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
        return [
            'id' => $this->id,
            'question' => new QuestionIndexResource($this->whenLoaded('question')),
            'views' => $this->views,
            'pdf_url' => $this->getFirstMediaUrl(Submission::MEDIA_COLLECTION_PDF),
            'upvote_count' => (int) ($this->upvotes_count ?? 0),
            'downvote_count' => (int) ($this->downvotes_count ?? 0),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
