<?php

use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class,'index'])->name('home');
Route::get('/questions', [HomeController::class,'index'])->name('questions.index');
Route::get('/questions/upload', [HomeController::class,'index'])->name('questions.create');


