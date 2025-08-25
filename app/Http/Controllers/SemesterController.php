<?php

namespace App\Http\Controllers;

use App\Http\Requests\SemesterRequest;
use App\Http\Resources\SemesterResource;
use App\Models\Semester;

class SemesterController extends Controller
{
    public function store(SemesterRequest $request)
    {
        return new SemesterResource(Semester::create($request->validated()));
    }
}
