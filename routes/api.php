<?php

use App\Http\Controllers\Api\Auth\GoogleAuthController;
use App\Http\Controllers\Api\QuestionsController;
use App\Http\Resources\SessionUserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return new SessionUserResource($request->user());
})->middleware('auth:sanctum');

Route::get('/questions', [QuestionsController::class, 'index']);

// Google OAuth for SPA
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->middleware('guest');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->middleware('guest');
