<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreCourseRequest;
use App\Http\Resources\Api\V1\CourseResource;
use App\Models\Course;
use App\Repositories\QuestionFormOptionsRepository;
use Illuminate\Http\JsonResponse;

class CourseController extends Controller
{
    /**
     * Store a newly created course in storage.
     */
    public function store(StoreCourseRequest $request, QuestionFormOptionsRepository $repository): JsonResponse
    {
        $course = Course::create([
            'department_id' => $request->validated('department_id'),
            'name' => $request->validated('name'),
        ]);

        $repository->clearCache();

        return (new CourseResource($course))->response()
            ->setStatusCode(201);
    }
}
