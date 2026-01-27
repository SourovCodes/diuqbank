<?php

use App\Models\Semester;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

describe('store semester', function () {
    it('can create a semester with valid data', function () {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/semesters', [
                'name' => 'Fall 25',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'name',
                    'created_at',
                    'updated_at',
                ],
            ])
            ->assertJson([
                'data' => [
                    'name' => 'Fall 25',
                ],
            ]);

        $this->assertDatabaseHas('semesters', [
            'name' => 'Fall 25',
        ]);
    });

    it('requires authentication', function () {
        $response = $this->postJson('/api/v1/semesters', [
            'name' => 'Fall 25',
        ]);

        $response->assertStatus(401);
    });

    it('requires name field', function () {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/semesters', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    });

    it('requires unique semester name', function () {
        Semester::factory()->create(['name' => 'Fall 25']);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/semesters', [
                'name' => 'Fall 25',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    });

    it('requires name to match semester format', function () {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/semesters', [
                'name' => 'Invalid Semester',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    });

    it('accepts valid semester formats', function ($semesterName) {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/semesters', [
                'name' => $semesterName,
            ]);

        $response->assertStatus(201);
    })->with([
        'Fall 25',
        'Spring 26',
        'Summer 24',
        'Short 25',
    ]);

    it('normalizes whitespace in semester name', function () {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/semesters', [
                'name' => 'Fall    25',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'name' => 'Fall 25',
                ],
            ]);
    });

    it('capitalizes semester season correctly', function () {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/semesters', [
                'name' => 'fall 25',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'name' => 'Fall 25',
                ],
            ]);
    });

    it('handles uppercase input correctly', function () {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/semesters', [
                'name' => 'SPRING 26',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'name' => 'Spring 26',
                ],
            ]);
    });

    it('requires name to not exceed 255 characters', function () {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/semesters', [
                'name' => str_repeat('a', 256),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    });

    it('is rate limited to 10 requests per minute', function () {
        for ($i = 10; $i < 20; $i++) {
            $response = $this->actingAs($this->user)
                ->postJson('/api/v1/semesters', [
                    'name' => "Fall {$i}",
                ]);

            $response->assertStatus(201);
        }

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/semesters', [
                'name' => 'Fall 99',
            ]);

        $response->assertStatus(429);
    });
});
