<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Department;
use App\Models\Question;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class PagesController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('home', [
            'questionsCount' => Question::query()->count(),
            'coursesCount' => Course::query()->count(),
            'departmentsCount' => Department::query()->count(),
            'contributorsCount' => User::query()->whereHas('questions')->count(),
        ]);
    }

    public function about(): Response
    {
        return Inertia::render('about');
    }

    public function privacy(): Response
    {
        return Inertia::render('privacy-policy');
    }

    public function terms(): Response
    {
        return Inertia::render('terms-of-service');
    }

    public function contact(): Response
    {
        return Inertia::render('contact');
    }

    public function helpDeveloper(): Response
    {
        return Inertia::render('help-developer');
    }
}
