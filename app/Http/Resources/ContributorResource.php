<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class ContributorResource extends JsonResource
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
            'name' => $this->name,
            'username' => $this->username,
            'avatar_url' => $this->avatar_url,
            'submissions_count' => (int) ($this->submissions_count ?? 0),
            'total_votes' => (int) ($this->total_votes ?? 0),
            'total_views' => (int) ($this->submissions_sum_views ?? 0),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
