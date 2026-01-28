<?php

namespace App\Repositories;

use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Semester;
use Illuminate\Support\Collection;

class QuestionFormOptionsRepository
{
    public const CACHE_KEY_FORM_OPTIONS = 'question_form_options';

    public const CACHE_KEY_FILTER_OPTIONS = 'filter_options';

    public const CACHE_KEY_API_OPTIONS = 'api_options';

    public const CACHE_TTL = 3600;

    /**
     * Get cached form options for question forms.
     *
     * @return array{departments: Collection<int, Department>, semesters: Collection<int, Semester>, courses: Collection<int, Course>, examTypes: Collection<int, ExamType>}
     */
    public function getFormOptions(): array
    {
        return cache()->remember(self::CACHE_KEY_FORM_OPTIONS, self::CACHE_TTL, fn () => [
            'departments' => Department::query()->select('id', 'name', 'short_name')->orderBy('name')->get(),
            'semesters' => Semester::query()->select('id', 'name')->orderBy('name')->get(),
            'courses' => Course::query()->select('id', 'name', 'department_id')->orderBy('name')->get(),
            'examTypes' => ExamType::query()->select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Get cached filter options for question index page.
     *
     * @return array{departments: Collection<int, Department>, semesters: Collection<int, Semester>, courses: Collection<int, Course>, examTypes: Collection<int, ExamType>}
     */
    public function getFilterOptions(?int $departmentId): array
    {
        $filterOptions = cache()->remember(self::CACHE_KEY_FILTER_OPTIONS, self::CACHE_TTL, fn () => [
            'departments' => Department::query()->select('id', 'name', 'short_name')->orderBy('name')->get(),
            'semesters' => Semester::query()->select('id', 'name')->orderBy('name')->get(),
            'courses' => Course::query()
                ->with('department:id,short_name')
                ->select('id', 'name', 'department_id')
                ->orderBy('name')
                ->get(),
            'examTypes' => ExamType::query()->select('id', 'name')->orderBy('name')->get(),
        ]);

        $filterOptions['courses'] = $this->getCoursesByDepartment($departmentId, $filterOptions['courses']);

        return $filterOptions;
    }

    /**
     * Get cached options for API endpoint.
     *
     * @return array{departments: array, courses: array, semesters: array, exam_types: array}
     */
    public function getApiOptions(): array
    {
        return cache()->remember(self::CACHE_KEY_API_OPTIONS, self::CACHE_TTL, fn () => [
            'departments' => Department::query()
                ->select(['id', 'name', 'short_name'])
                ->orderBy('name')
                ->get()
                ->toArray(),
            'courses' => Course::query()
                ->select(['id', 'department_id', 'name'])
                ->orderBy('name')
                ->get()
                ->toArray(),
            'semesters' => Semester::query()
                ->select(['id', 'name'])
                ->latest()
                ->get()
                ->toArray(),
            'exam_types' => ExamType::query()
                ->select(['id', 'name'])
                ->orderBy('name')
                ->get()
                ->toArray(),
        ]);
    }

    /**
     * Get courses filtered by department.
     *
     * @param  Collection<int, Course>  $allCourses
     * @return Collection<int, Course>
     */
    public function getCoursesByDepartment(?int $departmentId, Collection $allCourses): Collection
    {
        if ($departmentId === null) {
            return $allCourses->map(function ($course) {
                $course->name = "{$course->name} ({$course->department->short_name})";

                return $course;
            })->values();
        }

        return $allCourses->where('department_id', $departmentId)->values();
    }

    /**
     * Clear cached option collections so new records are available immediately.
     */
    public function clearCache(): void
    {
        cache()->forget(self::CACHE_KEY_FORM_OPTIONS);
        cache()->forget(self::CACHE_KEY_FILTER_OPTIONS);
        cache()->forget(self::CACHE_KEY_API_OPTIONS);
    }
}
