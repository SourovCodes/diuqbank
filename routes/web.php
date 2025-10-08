<?php

use App\Http\Controllers\Page\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class);
