<?php

use App\Http\Controllers\API\QuestionController;
use App\Http\Controllers\API\SocialiteController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::get('/profile', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('questions')->name('questions.')->group(function () {
    Route::get('/', [QuestionController::class, 'index'])->name('index');
    Route::get('/form-options', [QuestionController::class, 'formOptions'])->name('form-options');

});

Route::get('/getFilterOptions', [\App\Http\Controllers\API\QuestionController::class, 'getFilterOptions']);

Route::post('/logout', [SocialiteController::class, 'logout'])->middleware('auth:sanctum');;
Route::post('/login', [SocialiteController::class, 'login']);
Route::post('/social-login', [SocialiteController::class, 'socialLogin']);
