<?php

namespace App\Models;

use App\Enums\QuestionStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'department_id',
        'course_id',
        'semester_id',
        'exam_type_id',
        'section',
        'status',
        'view_count',
        'pdf_key',
        'pdf_size',
        'is_watermarked',
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
            'is_watermarked' => 'boolean',
        ];
    }

    /**
     * Scope a query to only include published questions.
     */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', QuestionStatus::PUBLISHED);
    }

    /**
     * Scope a query to filter questions by uploader (user).
     */
    public function scopeUploader(Builder $query, $userId): void
    {
        if (! $userId) {
            return;
        }
        $query->where('user_id', $userId);
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function examType(): BelongsTo
    {
        return $this->belongsTo(ExamType::class);
    }

    /**
     * Get the PDF URL attribute.
     */
    public function getPdfUrlAttribute(): ?string
    {
        if (! $this->pdf_key) {
            return null;
        }

        return Storage::disk('s3')->url($this->pdf_key);
    }
}
