<?php

namespace App\Models;

use App\Enums\QuestionStatus;
use App\Enums\UnderReviewReason;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Question extends Model implements HasMedia
{
    /** @use HasFactory<\Database\Factories\QuestionFactory> */
    use HasFactory;

    use InteractsWithMedia;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'department_id',
        'course_id',
        'semester_id',
        'exam_type_id',
        'section',
        'status',
        'under_review_reason',
        'duplicate_reason',
        'view_count',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => QuestionStatus::class,
            'under_review_reason' => UnderReviewReason::class,
        ];
    }

    /**
     * Get the user that owns the question.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the department that owns the question.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the course that owns the question.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the semester that owns the question.
     */
    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    /**
     * Get the exam type that owns the question.
     */
    public function examType(): BelongsTo
    {
        return $this->belongsTo(ExamType::class);
    }

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('pdf')
            ->acceptsMimeTypes(['application/pdf'])
            ->singleFile()
            ->useDisk(diskName: 'public')
            ->useFallbackUrl(url('/pdf/fallback-pdf.pdf'));
    }

    /**
     * Get the PDF URL accessor.
     */
    protected function pdfUrl(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn () => $this->getFirstMediaUrl('pdf')
        );
    }

    /**
     * Get the PDF size accessor.
     */
    protected function pdfSize(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn () => $this->getFirstMedia('pdf')?->size ?? 0
        );
    }

    /**
     * Scope a query to only include published questions.
     */
    public function scopePublished(\Illuminate\Database\Eloquent\Builder $query): void
    {
        $query->where('status', QuestionStatus::PUBLISHED);
    }
}
