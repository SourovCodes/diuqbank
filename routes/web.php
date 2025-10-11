<?php

use Illuminate\Support\Facades\Route;

Route::get('/', [\App\Http\Controllers\PagesController::class, 'home'])->name('home');
Route::get('/about', [\App\Http\Controllers\PagesController::class, 'about'])->name('about');
Route::get('/privacy-policy', [\App\Http\Controllers\PagesController::class, 'privacy'])->name('privacy-policy');
Route::get('/terms-of-service', [\App\Http\Controllers\PagesController::class, 'terms'])->name('terms-of-service');

Route::get('/questions', [\App\Http\Controllers\QuestionPageController::class, 'index'])->name('questions.index');
Route::get('/questions/{question}', [\App\Http\Controllers\QuestionPageController::class, 'show'])->name('questions.show');
Route::post('/questions/{question}/view', [\App\Http\Controllers\QuestionPageController::class, 'incrementView'])->name('questions.view');

Route::get('/contributors', [\App\Http\Controllers\ContributorsPageController::class, 'index'])->name('contributors.index');
Route::get('/contributors/{user}', [\App\Http\Controllers\ContributorsPageController::class, 'show'])->name('contributors.show');
