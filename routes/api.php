<?php

use App\Http\Controllers\Api\Auth\GoogleAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Google OAuth for SPA
Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->middleware('guest');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->middleware('guest');
