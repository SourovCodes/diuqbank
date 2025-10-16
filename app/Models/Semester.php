<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Semester extends Model
{
    /** @use HasFactory<\Database\Factories\SemesterFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
    ];

    /**
     * Get the questions for the semester.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }

    /**
     * Scope a query to order semesters chronologically (newest first).
     */
    public function scopeOrderedBySemester($query)
    {
        return $query->get()->sortByDesc(function ($semester) {
            // Parse semester name (e.g., "Fall 23", "Spring 25")
            preg_match('/^(Spring|Summer|Fall|Short)\s+(\d+)$/', $semester->name, $matches);

            if (! $matches) {
                // If format doesn't match, return a default low value
                return 0;
            }

            $season = $matches[1];
            $year = (int) $matches[2];

            // Chronological order within a year: Spring (1), Summer (2), Fall (3), Short (4)
            // Reverse chronological (newest first): Fall (4), Summer (3), Spring (2), Short (1)
            // Higher numbers come first when sorting descending
            $seasonOrder = match ($season) {
                'Fall' => 4,
                'Summer' => 3,
                'Spring' => 2,
                'Short' => 1,
                default => 0,
            };

            // Create a composite score: year * 10 + season order
            // This ensures Fall 25 > Summer 25 > Spring 25 > Short 25
            // And all of 25 comes before all of 24
            return ($year * 10) + $seasonOrder;
        })->values();
    }
}
