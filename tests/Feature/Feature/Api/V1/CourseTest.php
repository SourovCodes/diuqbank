<?php

use App\Models\Course;
use App\Models\Department;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

describe('store course', function () {
    it('can create a course with valid data', function () {
        $department = Department::factory()->create();

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/courses', [
                'department_id' => $department->id,
                'name' => 'Introduction to Programming',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'department_id',
                    'name',
                    'created_at',
                    'updated_at',
                ],
            ])
            ->assertJson([
                'data' => [
                    'department_id' => $department->id,
                    'name' => 'Introduction to Programming',
                ],
            ]);

        $this->assertDatabaseHas('courses', [
            'department_id' => $department->id,
            'name' => 'Introduction to Programming',
        ]);
    });

    it('requires authentication', function () {
        $department = Department::factory()->create();

        $response = $this->postJson('/api/v1/courses', [
            'department_id' => $department->id,
            'name' => 'Introduction to Programming',
        ]);

        $response->assertStatus(401);
    });

    it('requires department_id field', function () {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/courses', [
                'name' => 'Introduction to Programming',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['department_id']);
    });

    it('requires name field', function () {
        $department = Department::factory()->create();

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/courses', [
                'department_id' => $department->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    });

    it('requires department_id to exist in departments table', function () {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/courses', [
                'department_id' => 99999,
                'name' => 'Introduction to Programming',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['department_id']);
    });

    it('requires unique course name within the same department', function () {
        $department = Department::factory()->create();
        Course::factory()->create([
            'department_id' => $department->id,
            'name' => 'Introduction to Programming',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/courses', [
                'department_id' => $department->id,
                'name' => 'Introduction to Programming',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    });

    it('allows duplicate course names in different departments', function () {
        $department1 = Department::factory()->create();
        $department2 = Department::factory()->create();

        Course::factory()->create([
            'department_id' => $department1->id,
            'name' => 'Introduction to Programming',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/courses', [
                'department_id' => $department2->id,
                'name' => 'Introduction to Programming',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseCount('courses', 2);
    });

    it('requires name to not exceed 255 characters', function () {
        $department = Department::factory()->create();

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/courses', [
                'department_id' => $department->id,
                'name' => str_repeat('a', 256),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    });

    it('is rate limited to 10 requests per minute', function () {
        $department = Department::factory()->create();

        for ($i = 0; $i < 10; $i++) {
            $response = $this->actingAs($this->user)
                ->postJson('/api/v1/courses', [
                    'department_id' => $department->id,
                    'name' => "Course {$i}",
                ]);

            $response->assertStatus(201);
        }

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/courses', [
                'department_id' => $department->id,
                'name' => 'Rate Limited Course',
            ]);

        $response->assertStatus(429);
    });
});
