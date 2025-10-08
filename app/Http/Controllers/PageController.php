<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Department;
use App\Models\Question;
use App\Models\User;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Cache;

class PageController extends Controller
{
    public function home(): View
    {
        $stats = Cache::remember('welcome.stats', now()->addMinutes(10), function () {
            return [
                'questions' => Question::count(),
                'courses' => Course::count(),
                'departments' => Department::count(),
                'contributors' => User::whereHas('questions')->count(),
            ];
        });

        return view('welcome', [
            'stats' => $stats,
        ]);
    }
}
