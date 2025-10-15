<?php

use App\Models\Semester;
use App\Models\User;

use function Pest\Laravel\actingAs;

it('allows verified users to create a semester option', function () {
    cache()->put('question_form_options', 'cached');
    cache()->put('filter_options', 'cached');

    $user = User::factory()->create();

    $response = actingAs($user)->postJson(route('semesters.store'), [
        'name' => 'Spring 2026',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('semester.name', 'Spring 2026');

    expect(Semester::query()->where('name', 'Spring 2026')->exists())->toBeTrue();
    expect(cache()->has('question_form_options'))->toBeFalse();
    expect(cache()->has('filter_options'))->toBeFalse();
});

it('requires authentication to create a semester option', function () {
    $response = $this->postJson(route('semesters.store'), [
        'name' => 'Spring 2026',
    ]);

    $response->assertUnauthorized();
});

it('validates uniqueness when creating semesters', function () {
    $user = User::factory()->create();
    Semester::factory()->create(['name' => 'Spring 2026']);

    $response = actingAs($user)->postJson(route('semesters.store'), [
        'name' => 'Spring 2026',
    ]);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});
