<?php

use App\Models\Course;
use App\Models\Department;
use App\Models\ExamType;
use App\Models\Semester;

describe('options', function () {
    it('returns all form options', function () {
        $department = Department::factory()->create();
        $course = Course::factory()->for($department)->create();
        $semester = Semester::factory()->create();
        $examType = ExamType::factory()->create();

        $response = $this->getJson('/api/v1/options');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    'departments' => [
                        ['id', 'name', 'short_name'],
                    ],
                    'courses' => [
                        ['id', 'department_id', 'name'],
                    ],
                    'semesters' => [
                        ['id', 'name'],
                    ],
                    'exam_types' => [
                        ['id', 'name'],
                    ],
                ],
            ]);

        $response->assertJsonPath('data.departments.0.id', $department->id);
        $response->assertJsonPath('data.courses.0.id', $course->id);
        $response->assertJsonPath('data.courses.0.department_id', $department->id);
        $response->assertJsonPath('data.semesters.0.id', $semester->id);
        $response->assertJsonPath('data.exam_types.0.id', $examType->id);
    });

    it('returns empty arrays when no data exists', function () {
        $response = $this->getJson('/api/v1/options');

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'departments' => [],
                    'courses' => [],
                    'semesters' => [],
                    'exam_types' => [],
                ],
            ]);
    });

    it('sorts departments alphabetically by name', function () {
        Department::factory()->create(['name' => 'Zebra Department']);
        Department::factory()->create(['name' => 'Alpha Department']);

        $response = $this->getJson('/api/v1/options');

        $response->assertStatus(200);
        $departments = $response->json('data.departments');

        expect($departments[0]['name'])->toBe('Alpha Department');
        expect($departments[1]['name'])->toBe('Zebra Department');
    });

    it('sorts semesters by newest first', function () {
        $older = Semester::factory()->create(['name' => 'Fall 24', 'created_at' => now()->subDay()]);
        $newer = Semester::factory()->create(['name' => 'Spring 25', 'created_at' => now()]);

        $response = $this->getJson('/api/v1/options');

        $response->assertStatus(200);
        $semesters = $response->json('data.semesters');

        expect($semesters[0]['id'])->toBe($newer->id);
        expect($semesters[1]['id'])->toBe($older->id);
    });
});
