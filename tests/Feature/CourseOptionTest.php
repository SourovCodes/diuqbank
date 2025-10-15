<?php

use App\Models\Course;
use App\Models\Department;
use App\Models\User;

use function Pest\Laravel\actingAs;

it('allows verified users to create a course option', function () {
    cache()->put('question_form_options', 'cached');
    cache()->put('filter_options', 'cached');

    $user = User::factory()->create();
    $department = Department::factory()->create();

    $response = actingAs($user)->postJson(route('courses.store'), [
        'department_id' => $department->id,
        'name' => 'Advanced Physics',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('course.name', 'Advanced Physics')
        ->assertJsonPath('course.department_id', $department->id);

    expect(Course::query()->where('department_id', $department->id)->where('name', 'Advanced Physics')->exists())->toBeTrue();
    expect(cache()->has('question_form_options'))->toBeFalse();
    expect(cache()->has('filter_options'))->toBeFalse();
});

it('requires authentication to create a course option', function () {
    $department = Department::factory()->create();

    $response = $this->postJson(route('courses.store'), [
        'department_id' => $department->id,
        'name' => 'Advanced Physics',
    ]);

    $response->assertUnauthorized();
});

it('validates course uniqueness within a department', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();

    Course::factory()->create([
        'department_id' => $department->id,
        'name' => 'Advanced Physics',
    ]);

    $response = actingAs($user)->postJson(route('courses.store'), [
        'department_id' => $department->id,
        'name' => 'Advanced Physics',
    ]);

    $response
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});
