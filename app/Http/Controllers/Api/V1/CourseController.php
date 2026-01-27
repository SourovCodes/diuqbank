<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreCourseRequest;
use App\Models\Course;
use Illuminate\Http\JsonResponse;

class CourseController extends Controller
{
    /**
     * Store a newly created course in storage.
     */
    public function store(StoreCourseRequest $request): JsonResponse
    {
        $course = Course::create([
            'department_id' => $request->validated('department_id'),
            'name' => $request->validated('name'),
        ]);

        return response()->json([
            'data' => $course,
            'message' => 'Course created successfully.',
        ], 201);
    }
}
