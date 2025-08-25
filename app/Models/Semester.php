<?php

namespace App\Models;

use App\Enums\QuestionStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Semester extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }

    /**
     * Scope a query to only include active semesters.
     * A semester is active if it has at least 1 published question.
     */
    public function scopeActive(Builder $query): void
    {
        $query->whereHas('questions', function (Builder $query) {
            $query->where('status', QuestionStatus::PUBLISHED);
        });
    }

    /**
     * Scope to order semesters chronologically (latest first).
     * Sorts by year and then by season order: Spring -> Summer -> Fall -> Short
     */
    public function scopeOrderByLatest(Builder $query): void
    {
        $query->orderByRaw('
            CAST(SUBSTRING(name, -2) AS UNSIGNED) DESC,
            CASE 
                WHEN name LIKE "Spring%" THEN 1
                WHEN name LIKE "Summer%" THEN 2  
                WHEN name LIKE "Fall%" THEN 3
                WHEN name LIKE "Short%" THEN 4
                ELSE 5
            END DESC
        ');
    }
}
