<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCourseRequest;
use App\Models\Course;
use App\Repositories\QuestionFormOptionsRepository;
use Illuminate\Http\JsonResponse;

class CourseController extends Controller
{
    public function __construct(protected QuestionFormOptionsRepository $optionsRepository) {}

    public function store(StoreCourseRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $course = Course::firstOrCreate(
            [
                'name' => $validated['name'],
                'department_id' => $validated['department_id'],
            ]
        );

        if ($course->wasRecentlyCreated) {
            $this->optionsRepository->clearCache();
        }

        return response()->json([
            'course' => [
                'id' => $course->id,
                'name' => $course->name,
                'department_id' => $course->department_id,
            ],
        ], $course->wasRecentlyCreated ? 201 : 200);
    }
}
