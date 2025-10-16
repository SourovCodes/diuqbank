<?php

use App\Models\Semester;

it('orders semesters chronologically with newest first', function () {
    // Create semesters in random order
    Semester::factory()->create(['name' => 'Fall 23']);
    Semester::factory()->create(['name' => 'Spring 25']);
    Semester::factory()->create(['name' => 'Summer 24']);
    Semester::factory()->create(['name' => 'Fall 25']);
    Semester::factory()->create(['name' => 'Spring 24']);
    Semester::factory()->create(['name' => 'Summer 25']);
    Semester::factory()->create(['name' => 'Short 24']);
    Semester::factory()->create(['name' => 'Fall 24']);
    Semester::factory()->create(['name' => 'Short 25']);

    $orderedSemesters = Semester::query()->orderedBySemester();

    $names = $orderedSemesters->pluck('name')->toArray();

    // Expected order: newest year first, within year: Fall > Summer > Spring > Short
    expect($names)->toBe([
        'Fall 25',
        'Summer 25',
        'Spring 25',
        'Short 25',
        'Fall 24',
        'Summer 24',
        'Spring 24',
        'Short 24',
        'Fall 23',
    ]);
});

it('handles semesters with different year formats', function () {
    Semester::factory()->create(['name' => 'Fall 20']);
    Semester::factory()->create(['name' => 'Spring 26']);
    Semester::factory()->create(['name' => 'Fall 25']);

    $orderedSemesters = Semester::query()->orderedBySemester();

    $names = $orderedSemesters->pluck('name')->toArray();

    expect($names)->toBe([
        'Spring 26',
        'Fall 25',
        'Fall 20',
    ]);
});
