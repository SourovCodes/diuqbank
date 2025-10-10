<?php

use App\Models\Course;
use App\Models\Department;
use App\Models\Question;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'questionsCount' => Question::query()->count(),
        'coursesCount' => Course::query()->count(),
        'departmentsCount' => Department::query()->count(),
        'contributorsCount' => User::query()->whereHas('questions')->count(),
    ]);
})->name('home');
