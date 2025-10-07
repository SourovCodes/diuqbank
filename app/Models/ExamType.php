<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamType extends Model
{
    /** @use HasFactory<\Database\Factories\ExamTypeFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'requires_section',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'requires_section' => 'boolean',
    ];

    /**
     * Get the questions for the exam type.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }
}
