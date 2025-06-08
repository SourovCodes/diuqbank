<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\QuestionsController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class,'index'])->name('home');
Route::get('/questions', [QuestionsController::class,'index'])->name('questions.index');
Route::get('/questions/{question}', [QuestionsController::class,'show'])->name('questions.show');
Route::get('/questions/upload', [HomeController::class,'index'])->name('questions.create');


