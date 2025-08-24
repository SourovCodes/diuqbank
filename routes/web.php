<?php

use App\Http\Controllers\Auth\GoogleLoginController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QuestionsPageController;
use App\Http\Controllers\ContributorsPageController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::view('/about', 'about')->name('about');
Route::view('/login', 'auth.login')->middleware('guest')->name('login');
Route::get('/questions', [QuestionsPageController::class, 'index'])->name('questions.index');

// Question creation and editing routes (require authentication)
Route::middleware('auth')->group(function () {
    Route::get('/questions/create', [QuestionsPageController::class, 'create'])->name('questions.create');
    Route::get('/questions/{question}/edit', [QuestionsPageController::class, 'edit'])->name('questions.edit');
    
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
});
Route::get('/questions/{question}', [QuestionsPageController::class, 'show'])->name('questions.show');

Route::get('/contributors', [ContributorsPageController::class, 'index'])->name('contributors.index');
Route::get('/contributors/{user}', [ContributorsPageController::class, 'show'])->name('contributors.show');

Route::get('/auth/google/redirect', [GoogleLoginController::class, 'redirect'])->middleware('guest')->name('auth.google.redirect');
Route::post('/logout', function (Request $request) {
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect()->route('home');
})->middleware('auth')->name('logout');
Route::get('/auth/google/callback', [GoogleLoginController::class, 'googleCallback'])->middleware('guest')->name('auth.google.callback');
