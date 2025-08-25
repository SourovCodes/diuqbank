<?php

namespace App\Http\Controllers;

use App\Http\Requests\CourseRequest;
use App\Http\Resources\CourseResource;
use App\Models\Course;

class CourseController extends Controller
{
    public function store(CourseRequest $request)
    {
        return new CourseResource(Course::create($request->validated()));
    }
}
