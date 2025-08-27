<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Department;
use App\Models\Question;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class HomeController extends Controller
{
    public function index()
    {
        $counts = Cache::remember('home:counts', now()->addMinutes(10), function () {
            return [
                'questionsCount' => Question::published()->count(),
                'coursesCount' => Course::count(),
                'departmentsCount' => Department::count(),
                'contributorsCount' => User::has('questions')->count(),
            ];
        });

        return view('home', $counts);
    }
}
