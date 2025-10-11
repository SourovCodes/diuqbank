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

Route::get('/about', function () {
    return Inertia::render('about');
})->name('about');

Route::get('/privacy-policy', function () {
    return Inertia::render('privacy-policy');
})->name('privacy-policy');

Route::get('/terms-of-service', function () {
    return Inertia::render('terms-of-service');
})->name('terms-of-service');

Route::get('/questions', [\App\Http\Controllers\QuestionPageController::class, 'index'])->name('questions.index');
Route::get('/questions/{question}', [\App\Http\Controllers\QuestionPageController::class, 'show'])->name('questions.show');
Route::post('/questions/{question}/view', [\App\Http\Controllers\QuestionPageController::class, 'incrementView'])->name('questions.view');

Route::get('/contributors', [\App\Http\Controllers\ContributorsPageController::class, 'index'])->name('contributors.index');
Route::get('/contributors/{user}', [\App\Http\Controllers\ContributorsPageController::class, 'show'])->name('contributors.show');
