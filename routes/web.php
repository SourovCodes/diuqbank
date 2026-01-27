<?php

use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\ContributorController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\SubmissionVoteController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

Route::get('/questions', [QuestionController::class, 'index'])->name('questions.index');
Route::get('/questions/{question}', [QuestionController::class, 'show'])->name('questions.show');

Route::get('/contributors', [ContributorController::class, 'index'])->name('contributors.index');
Route::get('/contributors/{user:username}', [ContributorController::class, 'show'])->name('contributors.show');

Route::get('/privacy', function () {
    return Inertia::render('privacy');
})->name('privacy');

Route::get('/terms', function () {
    return Inertia::render('terms');
})->name('terms');

// Guest routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);

    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);

    // Password reset routes
    Route::get('/forgot-password', [PasswordResetController::class, 'create'])->name('password.request');
    Route::post('/forgot-password', [PasswordResetController::class, 'store'])->name('password.email');
    Route::get('/reset-password/{token}', [PasswordResetController::class, 'edit'])->name('password.reset');
    Route::post('/reset-password', [PasswordResetController::class, 'update'])->name('password.update');
});

// Authenticated routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

    // Email verification routes
    Route::get('/email/verify', [EmailVerificationController::class, 'notice'])->name('verification.notice');
    Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])->middleware('signed')->name('verification.verify');
    Route::post('/email/verification-notification', [EmailVerificationController::class, 'send'])->middleware('throttle:6,1')->name('verification.send');

    // Submission voting
    Route::post('/submissions/{submission}/upvote', [SubmissionVoteController::class, 'upvote'])->name('submissions.upvote');
    Route::post('/submissions/{submission}/downvote', [SubmissionVoteController::class, 'downvote'])->name('submissions.downvote');
});
Route::get('/flash-test/{type}', function (string $type) {
    $messages = [
        'success' => ['message' => 'Operation completed successfully!', 'description' => 'Your changes have been saved.'],
        'error' => ['message' => 'Something went wrong!', 'description' => 'Please try again or contact support.'],
        'warning' => ['message' => 'Please proceed with caution.'], // description is optional
        'info' => ['message' => 'Here is some useful information.'], // description is optional
    ];

    $toast = $messages[$type] ?? ['message' => 'Test message'];

    Inertia::flash('toast', [
        'type' => $type,
        'message' => $toast['message'],
        'description' => $toast['description'] ?? null,
    ]);

    return back();
})->whereIn('type', ['success', 'error', 'warning', 'info'])->name('flash.test');
