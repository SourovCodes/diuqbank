<?php

use App\Http\Controllers\Api\Auth\GoogleAuthController;
use App\Http\Controllers\Api\ContactFormSubmissionsController;
use App\Http\Controllers\Api\ContributorsController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\QuestionsController;
use App\Http\Resources\SessionUserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return new SessionUserResource($request->user());
})->middleware('auth:sanctum');

Route::get('/questions/filter-options', [QuestionsController::class, 'filters']);
Route::get('/questions', [QuestionsController::class, 'index']);
Route::get('/questions-cached', [QuestionsController::class, 'indexCached']);
Route::delete('/questions-cache', [QuestionsController::class, 'clearCache']);
Route::get('/questions/{question}', [QuestionsController::class, 'show']);
Route::post('/questions', [QuestionsController::class, 'store'])->middleware('auth:sanctum');
Route::put('/questions/{question}', [QuestionsController::class, 'update'])->middleware('auth:sanctum');

Route::get('/contributors', [ContributorsController::class, 'index']);
Route::get('/contributors/{user:username}', [ContributorsController::class, 'show']);

Route::post('/contact', [ContactFormSubmissionsController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/image', [ProfileController::class, 'updateImage']);
});

// Google OAuth for SPA
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->middleware('guest');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->middleware('guest');

// Google OAuth for Mobile Apps (Flutter)
Route::post('/auth/google/mobile', [GoogleAuthController::class, 'mobileAuth'])->middleware('guest');
