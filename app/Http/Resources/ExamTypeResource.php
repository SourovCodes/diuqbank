<?php

namespace App\Http\Resources;

use App\Models\ExamType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ExamType */
class ExamTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'requires_section' => $this->requires_section,
        ];
    }
}
