<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CourseController;
use App\Http\Controllers\Api\V1\OptionController;
use App\Http\Controllers\Api\V1\QuestionController;
use App\Http\Controllers\Api\V1\SemesterController;
use App\Http\Controllers\Api\V1\SubmissionController;
use App\Http\Controllers\Api\V1\SubmissionVoteController;
use Illuminate\Support\Facades\Route;

Route::get('/options', OptionController::class)->name('options');

Route::apiResource('questions', QuestionController::class)->only(['index', 'show']);

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::post('/courses', [CourseController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('courses.store');
    Route::post('/semesters', [SemesterController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('semesters.store');

    Route::get('/submissions', [SubmissionController::class, 'index'])
        ->name('submissions.index');
    Route::post('/submissions', [SubmissionController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('submissions.store');
    Route::patch('/submissions/{submission}', [SubmissionController::class, 'update'])
        ->middleware('throttle:10,1')
        ->name('submissions.update');
    Route::delete('/submissions/{submission}', [SubmissionController::class, 'destroy'])
        ->middleware('throttle:10,1')
        ->name('submissions.destroy');

    Route::get('/submissions/{submission}/vote', [SubmissionVoteController::class, 'show'])
        ->name('submissions.vote.show');
    Route::post('/submissions/{submission}/upvote', [SubmissionVoteController::class, 'upvote'])
        ->middleware('throttle:30,1')
        ->name('submissions.upvote');
    Route::post('/submissions/{submission}/downvote', [SubmissionVoteController::class, 'downvote'])
        ->middleware('throttle:30,1')
        ->name('submissions.downvote');
    Route::delete('/submissions/{submission}/vote', [SubmissionVoteController::class, 'destroy'])
        ->middleware('throttle:30,1')
        ->name('submissions.vote.destroy');
});

Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1')
        ->name('login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::get('/user', [AuthController::class, 'user'])->name('user');
        Route::patch('/user', [AuthController::class, 'updateProfile'])->name('user.update');
        Route::post('/user/avatar', [AuthController::class, 'updateAvatar'])->name('user.avatar');

        Route::post('/email/verification-notification', [AuthController::class, 'sendVerificationEmail'])
            ->middleware('throttle:6,1')
            ->name('verification.send');
    });

    Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware('signed')
        ->name('verification.verify');
});
