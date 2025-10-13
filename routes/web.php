<?php

use Illuminate\Support\Facades\Route;

Route::get('/', [\App\Http\Controllers\PagesController::class, 'home'])->name('home');
Route::get('/about', [\App\Http\Controllers\PagesController::class, 'about'])->name('about');
Route::get('/privacy-policy', [\App\Http\Controllers\PagesController::class, 'privacy'])->name('privacy-policy');
Route::get('/terms-of-service', [\App\Http\Controllers\PagesController::class, 'terms'])->name('terms-of-service');
Route::get('/contact', [\App\Http\Controllers\PagesController::class, 'contact'])->name('contact');
Route::post('/contact', \App\Http\Controllers\ContactFormController::class)->name('contact.submit');

Route::get('/login', [\App\Http\Controllers\Auth\AuthController::class, 'login'])->name('login');
Route::post('/logout', [\App\Http\Controllers\Auth\AuthController::class, 'logout'])->name('logout');
Route::get('/auth/google', [\App\Http\Controllers\Auth\GoogleAuthController::class, 'redirect'])->name('auth.google');
Route::get('/auth/google/callback', [\App\Http\Controllers\Auth\GoogleAuthController::class, 'callback'])->name('auth.google.callback');

Route::get('/questions', [\App\Http\Controllers\QuestionsController::class, 'index'])->name('questions.index');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/questions/create', [\App\Http\Controllers\QuestionPageController::class, 'create'])->name('questions.create');
    Route::post('/questions', [\App\Http\Controllers\QuestionPageController::class, 'store'])->name('questions.store');
    Route::get('/questions/{question}/edit', [\App\Http\Controllers\QuestionPageController::class, 'edit'])->name('questions.edit');
    Route::put('/questions/{question}', [\App\Http\Controllers\QuestionPageController::class, 'update'])->name('questions.update');
});

Route::get('/questions/{question}', [\App\Http\Controllers\QuestionPageController::class, 'show'])->name('questions.show');
Route::post('/questions/{question}/view', [\App\Http\Controllers\QuestionPageController::class, 'incrementView'])->name('questions.view');

Route::get('/contributors', [\App\Http\Controllers\ContributorsPageController::class, 'index'])->name('contributors.index');
Route::get('/contributors/{user}', [\App\Http\Controllers\ContributorsPageController::class, 'show'])->name('contributors.show');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [\App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/image', [\App\Http\Controllers\ProfileController::class, 'updateImage'])->name('profile.image.update');
});
