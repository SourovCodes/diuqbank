<?php

namespace App\Http\Controllers\Page;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Department;
use App\Models\Question;
use App\Models\User;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Cache;

class HomeController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): View
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
