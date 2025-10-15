<?php

use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia;

it('renders 404 error page when accessing non-existent route', function () {
    $this->get('/this-page-does-not-exist-at-all')
        ->assertStatus(404)
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('errors/404')
        );
});

it('renders 403 error page for unauthorized access', function () {
    // Create a test route that returns 403
    Route::get('/test-forbidden', function () {
        abort(403);
    });

    $this->get('/test-forbidden')
        ->assertStatus(403)
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('errors/403')
        );
});

it('404 error page component exists', function () {
    $componentPath = resource_path('js/Pages/errors/404.tsx');
    expect(file_exists($componentPath))->toBeTrue();
});

it('403 error page component exists', function () {
    $componentPath = resource_path('js/Pages/errors/403.tsx');
    expect(file_exists($componentPath))->toBeTrue();
});

it('500 error page component exists', function () {
    $componentPath = resource_path('js/Pages/errors/500.tsx');
    expect(file_exists($componentPath))->toBeTrue();
});

it('503 error page component exists', function () {
    $componentPath = resource_path('js/Pages/errors/503.tsx');
    expect(file_exists($componentPath))->toBeTrue();
});
