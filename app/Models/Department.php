<?php

namespace App\Models;

use App\Enums\QuestionStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'short_name',
    ];

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }

    /**
     * Scope a query to only include active departments.
     * A department is active if it has at least 1 published question.
     */
    public function scopeActive(Builder $query): void
    {
        $query->whereHas('questions', function (Builder $query) {
            $query->where('status', QuestionStatus::PUBLISHED);
        });
    }
}
