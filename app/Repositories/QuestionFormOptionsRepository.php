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
     *
     * @return array{departments: Collection<int, Department>, semesters: Collection<int, Semester>, courses: Collection<int, Course>, examTypes: Collection<int, ExamType>}
     */
    public function getFormOptions(): array
    {
        return cache()->remember('question_form_options', 3600, fn () => [
            'departments' => Department::query()->select('id', 'name', 'short_name')->orderBy('name')->get(),
            'semesters' => Semester::query()->select('id', 'name')->orderBy('name')->get(),
            'courses' => Course::query()->select('id', 'name', 'department_id')->orderBy('name')->get(),
            'examTypes' => ExamType::query()->select('id', 'name', 'requires_section')->orderBy('name')->get(),
        ]);
    }

    /**
     * Get cached filter options for question index page.
     *
     * @return array{departments: Collection<int, Department>, semesters: Collection<int, Semester>, courses: Collection<int, Course>, examTypes: Collection<int, ExamType>}
     */
    public function getFilterOptions(?int $departmentId): array
    {
        $filterOptions = cache()->remember('filter_options', 3600, fn () => [
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
        cache()->forget('question_form_options');
        cache()->forget('filter_options');
    }
}
