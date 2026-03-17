<?php

use App\Models\Course;
use App\Models\Department;
use App\Models\Semester;
use App\Models\User;

// Course API Tests
test('guest cannot create course', function () {
    $department = Department::factory()->create();

    $response = $this->postJson('/courses', [
        'name' => 'New Course',
        'department_id' => $department->id,
    ]);

    $response->assertStatus(401);
});

test('authenticated user can create course', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();

    $response = $this->actingAs($user)->postJson('/courses', [
        'name' => 'New Course',
        'department_id' => $department->id,
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('courses', [
        'name' => 'New Course',
        'department_id' => $department->id,
    ]);
});

test('course creation requires name', function () {
    $user = User::factory()->create();
    $department = Department::factory()->create();

    $response = $this->actingAs($user)->postJson('/courses', [
        'department_id' => $department->id,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors('name');
});

test('course creation requires department_id', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/courses', [
        'name' => 'New Course',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors('department_id');
});

test('course creation requires valid department_id', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/courses', [
        'name' => 'New Course',
        'department_id' => 99999,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors('department_id');
});

// Semester API Tests
test('guest cannot create semester', function () {
    $response = $this->postJson('/semesters', [
        'name' => 'Fall 2026',
    ]);

    $response->assertStatus(401);
});

test('authenticated user can create semester', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/semesters', [
        'name' => 'Fall 26',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('semesters', [
        'name' => 'Fall 26',
    ]);
});

test('semester creation requires name', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/semesters', []);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors('name');
});

test('duplicate semester returns existing semester with 200', function () {
    $user = User::factory()->create();
    $existingSemester = Semester::factory()->create(['name' => 'Spring 26']);

    $response = $this->actingAs($user)->postJson('/semesters', [
        'name' => 'Spring 26',
    ]);

    $response->assertStatus(200);
    $response->assertJson([
        'semester' => [
            'id' => $existingSemester->id,
            'name' => 'Spring 26',
        ],
    ]);

    $this->assertDatabaseCount('semesters', 1);
});

test('duplicate course returns existing course with 200', function () {
    $user = User::factory()->create();
    $existingCourse = Course::factory()->create();

    $response = $this->actingAs($user)->postJson('/courses', [
        'name' => $existingCourse->name,
        'department_id' => $existingCourse->department_id,
    ]);

    $response->assertStatus(200);
    $response->assertJson([
        'course' => [
            'id' => $existingCourse->id,
        ],
    ]);

    $this->assertDatabaseCount('courses', 1);
});
