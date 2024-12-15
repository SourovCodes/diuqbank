<?php

use App\Http\Controllers\API\SocialiteController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('/profile', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::resource('questions', \App\Http\Controllers\API\QuestionController::class);
Route::get('/getFilterOptions', [\App\Http\Controllers\API\QuestionController::class, 'getFilterOptions']);

Route::post('/logout', [SocialiteController::class, 'logout'])->middleware('auth:sanctum');;
Route::post('/login', [SocialiteController::class, 'login']);
Route::post('/social-login', [SocialiteController::class, 'socialLogin']);
