<?php

namespace App\Repositories;

use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Semester;
use Illuminate\Support\Collection;

class QuestionFormOptionsRepository
{
    /**
     * Get cached form options for question forms.
     */
    public function getFormOptions(): array
    {
        return cache()->remember('question_form_options', 3600, fn () => [
            'departments' => Department::select('id', 'name')->orderBy('name')->get(),
            'semesters' => Semester::select('id', 'name')->orderBy('name', 'desc')->get(),
            'courses' => Course::select('id', 'name', 'department_id')->orderBy('name')->get(),
            'examTypes' => ExamType::select('id', 'name', 'requires_section')->orderBy('name')->get(),
        ]);
    }

    /**
     * Get cached filter options for question index page.
     */
    public function getFilterOptions(?int $departmentId): array
    {
        $filterOptions = cache()->remember('filter_options', 3600, fn () => [
            'departments' => Department::select('id', 'short_name as name')->orderBy('short_name')->get(),
            'semesters' => Semester::select('id', 'name')->get(),
            'courses' => Course::select('id', 'name', 'department_id')->orderBy('name')->get(),
            'examTypes' => ExamType::select('id', 'name')->orderBy('name')->get(),
        ]);

        $filterOptions['courses'] = $this->getCoursesByDepartment($departmentId, $filterOptions['courses']);

        return $filterOptions;
    }

    /**
     * Get courses filtered by department.
     */
    public function getCoursesByDepartment(?int $departmentId, Collection $allCourses): Collection
    {
        if ($departmentId === null) {
            return $allCourses;
        }

        return $allCourses->where('department_id', $departmentId)->values();
    }

    /**
     * Clear cached option collections so new records are available immediately.
     */
    public function clearCache(): void
    {
        cache()->forget('question_form_options');
        cache()->forget('filter_options');
    }
}
