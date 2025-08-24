<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Department;
use App\Models\Question;
use App\Models\User;

class HomeController extends Controller
{
    public function index()
    {
        $questionsCount = Question::published()->count();
        $coursesCount = Course::active()->count();
        $departmentsCount = Department::active()->count();
        $contributorsCount = User::has('questions')->count();

        return view('home', [
            'questionsCount' => $questionsCount,
            'coursesCount' => $coursesCount,
            'departmentsCount' => $departmentsCount,
            'contributorsCount' => $contributorsCount,
        ]);
    }
}


