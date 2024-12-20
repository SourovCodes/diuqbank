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
    Route::get('/form-options', [QuestionController::class, 'formOptions'])->middleware('auth:sanctum')->name('form-options');
    Route::post('/temp_upload', [QuestionController::class, 'tempUpload'])->middleware('auth:sanctum')->name('temp_upload');

});

Route::prefix('migrate')->name('migrate.')->group(function () {
    Route::get('/questions', function (Request $request) {
        return \App\Models\Question::with(['media','user'])->get();
    });
    Route::get('/users', function (Request $request) {
        return \App\Models\User::with(['media'])->get();
    });
    Route::get('/departments', function (Request $request) {
        return \App\Models\Department::all();
    });
    Route::get('/semesters', function (Request $request) {
        return \App\Models\Semester::all();
    });
    Route::get('/exam-types', function (Request $request) {
        return \App\Models\ExamType::all();
    });
    Route::get('/course-names', function (Request $request) {
        return \App\Models\CourseName::all();
    });
    Route::get('/users', function (Request $request) {
        return \App\Models\User::all();
    });
});


Route::get('/getFilterOptions', [\App\Http\Controllers\API\QuestionController::class, 'getFilterOptions']);

Route::post('/logout', [SocialiteController::class, 'logout'])->middleware('auth:sanctum');;
Route::post('/login', [SocialiteController::class, 'login']);
Route::post('/social-login', [SocialiteController::class, 'socialLogin']);
