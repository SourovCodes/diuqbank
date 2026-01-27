<?php

namespace App\Models;

use App\Enums\QuestionStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    /** @use HasFactory<\Database\Factories\QuestionFactory> */
    use HasFactory;

    protected $fillable = [
        'department_id',
        'course_id',
        'semester_id',
        'exam_type_id',
        'status',
        'rejection_reason',
    ];

    /**
     * @return array<string, mixed>
     */
    protected function casts(): array
    {
        return [
            'status' => QuestionStatus::class,
        ];
    }

    /**
     * @return BelongsTo<Department, $this>
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * @return BelongsTo<Course, $this>
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * @return BelongsTo<Semester, $this>
     */
    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    /**
     * @return BelongsTo<ExamType, $this>
     */
    public function examType(): BelongsTo
    {
        return $this->belongsTo(ExamType::class);
    }

    /**
     * @return HasMany<Submission, $this>
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    /**
     * Get the working title for the question.
     * Format: "Course Name (DEPT), Semester Name, Exam Type Name"
     */
    public function getTitleAttribute(): string
    {
        return sprintf(
            '%s (%s), %s, %s',
            $this->course?->name ?? 'Unknown Course',
            $this->department?->short_name ?? 'N/A',
            $this->semester?->name ?? 'Unknown Semester',
            $this->examType?->name ?? 'Unknown Exam'
        );
    }

    /**
     * Check if the question matches a search query.
     * Matches if ALL words in the search appear somewhere in the title.
     */
    public function matchesSearch(string $search): bool
    {
        $title = strtolower($this->title);
        $words = preg_split('/\s+/', strtolower(trim($search)));

        foreach ($words as $word) {
            if ($word !== '' && ! str_contains($title, $word)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Scope a query to only include published questions.
     */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', QuestionStatus::Published);
    }

    /**
     * Scope a query to filter by department.
     */
    public function scopeDepartment(Builder $query, $departmentId): void
    {
        if (! $departmentId) {
            return;
        }

        $query->where('department_id', $departmentId);
    }

    /**
     * Scope a query to filter by course.
     */
    public function scopeCourse(Builder $query, $courseId): void
    {
        if (! $courseId) {
            return;
        }

        $query->where('course_id', $courseId);
    }

    /**
     * Scope a query to filter by semester.
     */
    public function scopeSemester(Builder $query, $semesterId): void
    {
        if (! $semesterId) {
            return;
        }

        $query->where('semester_id', $semesterId);
    }

    /**
     * Scope a query to filter by exam type.
     */
    public function scopeExamType(Builder $query, $examTypeId): void
    {
        if (! $examTypeId) {
            return;
        }

        $query->where('exam_type_id', $examTypeId);
    }

    /**
     * Scope a query to apply all filters at once.
     */
    public function scopeFiltered(Builder $query, $departmentId, $courseId, $semesterId, $examTypeId): void
    {
        $query
            ->department($departmentId)
            ->course($courseId)
            ->semester($semesterId)
            ->examType($examTypeId);
    }
}
