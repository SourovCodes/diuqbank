<?php

use App\Models\Semester;
use App\Models\User;

use function Pest\Laravel\actingAs;

it('allows verified users to create a semester option', function () {
    cache()->put('question_form_options', 'cached');
    cache()->put('filter_options', 'cached');

    $user = User::factory()->create();

    $response = actingAs($user)->postJson(route('semesters.store'), [
        'name' => 'Spring 26',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('semester.name', 'Spring 26');

    expect(Semester::query()->where('name', 'Spring 26')->exists())->toBeTrue();
    expect(cache()->has('question_form_options'))->toBeFalse();
    expect(cache()->has('filter_options'))->toBeFalse();
});

it('requires authentication to create a semester option', function () {
    $response = $this->postJson(route('semesters.store'), [
        'name' => 'Spring 26',
    ]);

    $response->assertUnauthorized();
});

it('validates uniqueness when creating semesters', function () {
    $user = User::factory()->create();
    Semester::factory()->create(['name' => 'Spring 26']);

    $response = actingAs($user)->postJson(route('semesters.store'), [
        'name' => 'Spring 26',
    ]);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});

it('validates semester name format', function (string $invalidName) {
    $user = User::factory()->create();

    $response = actingAs($user)->postJson(route('semesters.store'), [
        'name' => $invalidName,
    ]);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
})->with([
    'Spring 2026' => 'Spring 2026',
    'Fall 2025' => 'Fall 2025',
    'SPRING 25' => 'SPRING 25',
    'Spring25' => 'Spring25',
    'Winter 25' => 'Winter 25',
    'Autumn 25' => 'Autumn 25',
    'Spring 5' => 'Spring 5',
    'Spring 256' => 'Spring 256',
    'Spring' => 'Spring',
    '25' => '25',
]);

it('accepts valid semester name formats', function (string $validName) {
    $user = User::factory()->create();

    $response = actingAs($user)->postJson(route('semesters.store'), [
        'name' => $validName,
    ]);

    $response->assertCreated();
})->with([
    'Fall 20' => 'Fall 20',
    'Spring 23' => 'Spring 23',
    'Summer 25' => 'Summer 25',
    'Short 25' => 'Short 25',
    'Fall 99' => 'Fall 99',
    'Spring 00' => 'Spring 00',
]);

it('automatically capitalizes the first letter of semester names', function (string $input, string $expected) {
    $user = User::factory()->create();

    $response = actingAs($user)->postJson(route('semesters.store'), [
        'name' => $input,
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('semester.name', $expected);

    expect(Semester::query()->where('name', $expected)->exists())->toBeTrue();
})->with([
    'lowercase fall' => ['fall 25', 'Fall 25'],
    'lowercase spring' => ['spring 23', 'Spring 23'],
    'lowercase summer' => ['summer 20', 'Summer 20'],
    'lowercase short' => ['short 24', 'Short 24'],
]);
