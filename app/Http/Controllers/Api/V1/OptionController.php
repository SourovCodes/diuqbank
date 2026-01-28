<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Semester;
use Illuminate\Http\JsonResponse;

class OptionController extends Controller
{
    /**
     * Get all form options (departments, courses, semesters, exam types).
     */
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'data' => [
                'departments' => Department::query()
                    ->select(['id', 'name', 'short_name'])
                    ->orderBy('name')
                    ->get(),
                'courses' => Course::query()
                    ->select(['id', 'department_id', 'name'])
                    ->orderBy('name')
                    ->get(),
                'semesters' => Semester::query()
                    ->select(['id', 'name'])
                    ->latest()
                    ->get(),
                'exam_types' => ExamType::query()
                    ->select(['id', 'name'])
                    ->orderBy('name')
                    ->get(),
            ],
        ]);
    }
}
