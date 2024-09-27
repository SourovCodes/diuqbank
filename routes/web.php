<?php

use App\Http\Controllers\ContributorController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QuestionController;
use App\Http\Middleware\EnsureDiuEmail;
use Illuminate\Support\Facades\Route;

Route::get('/', [QuestionController::class, 'home'])->name('home');

Route::get('/php', function () {
    return phpinfo();
})->name('php');

Route::prefix('questions')->name('questions.')->group(function () {
    Route::get('/', [QuestionController::class, 'index'])->name('index');
    Route::get('/{question}', [QuestionController::class, 'show'])->name('show');
    Route::get('/pdfviewer/{question}', [QuestionController::class, 'pdfViewer'])->name('pdfviewer');

});
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
    });

});

Route::prefix('pages')->middleware([])->group(function () {
    Route::get('faq', [PageController::class, 'faq'])->name('pages.faq');
    Route::get('about', [PageController::class, 'about'])->name('pages.about');
    Route::get('contact', [PageController::class, 'contact'])->name('pages.contact');
    Route::get('privacy-policy', [PageController::class, 'privacyPolicy'])->name('pages.privacy-policy');
    Route::get('terms-and-conditions', [PageController::class, 'termsAndConditions'])->name('pages.terms-and-conditions');
    Route::get('cf-div-2', [PageController::class, 'cfDiv2'])->name('pages.cf-div-2');


});


require __DIR__.'/auth.php';
