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
            'departments' => Department::query()->withCount('questions')->orderByDesc('questions_count')->get(),
            'semesters' => $this->getSortedSemesters(),
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
            'departments' => Department::query()->withCount('questions')->orderByDesc('questions_count')->get(),
            'semesters' => $this->getSortedSemesters(),
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

    /**
     * Get semesters sorted by year (latest first) then by type (Fall, Summer, Spring, Short).
     *
     * @return Collection<int, Semester>
     */
    private function getSortedSemesters(): Collection
    {
        $typeOrder = ['Fall' => 1, 'Summer' => 2, 'Spring' => 3, 'Short' => 4];

        return Semester::query()
            ->select('id', 'name')
            ->get()
            ->sortBy([
                fn (Semester $a, Semester $b) => $this->extractYear($b->name) <=> $this->extractYear($a->name),
                fn (Semester $a, Semester $b) => ($typeOrder[$this->extractType($a->name)] ?? 99) <=> ($typeOrder[$this->extractType($b->name)] ?? 99),
            ])
            ->values();
    }

    /**
     * Extract the year from a semester name (e.g., "Fall 23" -> 23).
     */
    private function extractYear(string $name): int
    {
        preg_match('/(\d+)$/', $name, $matches);

        return (int) ($matches[1] ?? 0);
    }

    /**
     * Extract the type from a semester name (e.g., "Fall 23" -> "Fall").
     */
    private function extractType(string $name): string
    {
        preg_match('/^(\w+)/', $name, $matches);

        return $matches[1] ?? '';
    }
}
