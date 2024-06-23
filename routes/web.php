<?php

use App\Http\Controllers\ContributorController;
use App\Http\Controllers\ProfileController;
use App\Http\Middleware\EnsureDiuEmail;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
})->middleware(['auth', 'verified'])->name('home');

Route::prefix('contributors')->name('contributors.')->group(function () {
    Route::get('/', [ContributorController::class, 'index'])->name('index');
    Route::get('/{user:username}', [ContributorController::class, 'show'])->name('show');
});
Route::get('/profile', [ContributorController::class, 'profile'])->middleware(['auth'])->name('profile');

Route::prefix('my-account')->name('my-account.')->middleware(['auth'])->group(function () {
    // Route::get('/', [DashboardController::class, 'index'])->name('index');
    // Route::get('/questions', [DashboardController::class, 'questions'])->name('questions');
    Route::get('/questions/create', [ProfileController::class, 'createQuestions'])->middleware([EnsureDiuEmail::class, 'verified'])->name('questions.create');
    Route::get('/questions/{question}/edit', [ProfileController::class, 'editQuestions'])->middleware([EnsureDiuEmail::class, 'verified'])->name('questions.edit');
    // Route::get('/questions/{question:slug}/edit', [DashboardController::class, 'EditQuestions'])->name('questions.edit');

    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });

});

require __DIR__.'/auth.php';
