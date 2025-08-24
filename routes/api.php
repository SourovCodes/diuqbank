<?php


use App\Http\Controllers\CourseController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\SemesterController;
use Illuminate\Support\Facades\Route;

// API Routes with 'api.' name prefix
Route::name('api.')->group(function () {
 

    // Protected routes requiring authentication
    Route::middleware('auth:sanctum')->group(function () {
       


        // Resource creation routes
        Route::post('courses', [CourseController::class, 'store'])
            ->name('courses.store');
        Route::post('semesters', [SemesterController::class, 'store'])
            ->name('semesters.store');

        // Question management routes
        Route::prefix('questions')->name('questions.')->group(function () {
       
            Route::post('generate-presigned-url', [QuestionController::class, 'generatePresignedUrl'])
                ->name('generate-presigned-url');

            Route::post('/', [QuestionController::class, 'store'])
                ->name('store');

            Route::patch('{question}', [QuestionController::class, 'update'])
                ->name('update');
        });
    });



  



});
