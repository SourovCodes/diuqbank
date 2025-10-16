<?php

namespace App\Models;

use App\Enums\QuestionStatus;
use App\Enums\UnderReviewReason;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

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
            ->useDisk(diskName: 'local')
            ->storeConversionsOnDisk('public-cdn')
            ->useFallbackUrl(url('/pdf/fallback-pdf.pdf'));
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this
            ->addMediaConversion('watermarked')
            ->performOnCollections('pdf')
            ->withoutManipulations()
            ->queued();
    }

    /**
     * Scope a query to filter questions by department.
     */
    public function scopeDepartment(Builder $query, $departmentId): void
    {
        if (! $departmentId) {
            return;
        }
        $query->where('department_id', $departmentId);
    }

    /**
     * Scope a query to filter questions by course.
     */
    public function scopeCourse(Builder $query, $courseId): void
    {
        if (! $courseId) {
            return;
        }
        $query->where('course_id', $courseId);
    }

    /**
     * Scope a query to filter questions by semester.
     */
    public function scopeSemester(Builder $query, $semesterId): void
    {
        if (! $semesterId) {
            return;
        }
        $query->where('semester_id', $semesterId);
    }

    /**
     * Scope a query to filter questions by exam type.
     */
    public function scopeExamType(Builder $query, $examTypeId): void
    {
        if (! $examTypeId) {
            return;
        }
        $query->where('exam_type_id', $examTypeId);
    }

    /**
     * Scope a query to only include published questions.
     */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', QuestionStatus::PUBLISHED);
    }

    /**
     * Get the PDF URL accessor.
     */
    protected function pdfUrl(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: function (): ?string {
                $media = $this->getFirstMedia('pdf');

                if (! $media) {
                    return null;
                }

                if ($media->hasGeneratedConversion('watermarked')) {
                    return $media->getFullUrl('watermarked');
                }

                try {
                    if ($media->disk === 's3' || $media->disk === 'local') {
                        return $media->getTemporaryUrl(now()->addMinutes(5));
                    } else {
                        return $media->getFullUrl();
                    }
                } catch (\RuntimeException $exception) {
                    return $media->getFullUrl();
                }
            }
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
}
