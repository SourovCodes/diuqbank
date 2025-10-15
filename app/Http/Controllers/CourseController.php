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
        $course = Course::create($request->validated());

        $this->optionsRepository->clearCache();

        return response()->json([
            'course' => [
                'id' => $course->id,
                'name' => $course->name,
                'department_id' => $course->department_id,
            ],
        ], 201);
    }
}
