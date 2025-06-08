<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;


class Question extends Model implements HasMedia
{

    use InteractsWithMedia;


    protected $fillable = [
        'department_id',
        'course_id',
        'semester_id',
        'exam_type_id',
        'user_id',
        'view_count',
    ];

    public function registerMediaCollections(): void
    {
        $this
            ->addMediaCollection('question-files')
            ->useFallbackUrl(asset('no-content.pdf'))
            ->useFallbackPath(public_path('/no-content.pdf'));

    }

    public function getPdfUrlAttribute(): string
    {
        return $this->getFirstMediaUrl('question-files');
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }


}
