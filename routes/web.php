<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');


Route::get('/flash-test/{type}', function (string $type) {
    $messages = [
        'success' => ['message' => 'Operation completed successfully!', 'description' => 'Your changes have been saved.'],
        'error' => ['message' => 'Something went wrong!', 'description' => 'Please try again or contact support.'],
        'warning' => ['message' => 'Please proceed with caution.'], // description is optional
        'info' => ['message' => 'Here is some useful information.'], // description is optional
    ];

    $toast = $messages[$type] ?? ['message' => 'Test message'];

    Inertia::flash('toast', [
        'type' => $type,
        'message' => $toast['message'],
        'description' => $toast['description'] ?? null,
    ]);

    return back();
})->whereIn('type', ['success', 'error', 'warning', 'info'])->name('flash.test');
