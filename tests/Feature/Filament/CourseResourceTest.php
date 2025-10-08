<?php

use App\Filament\Resources\Courses\Pages\CreateCourse;
use App\Filament\Resources\Courses\Pages\EditCourse;
use App\Filament\Resources\Courses\Pages\ListCourses;
use App\Models\Course;
use App\Models\Department;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Livewire\Livewire;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    Filament::setCurrentPanel('admin');

    /** @var \App\Models\User $user */
    $user = User::factory()->createOne();

    actingAs($user);
});

it('lists courses in the table', function (): void {
    $department = Department::factory()->create([
        'name' => 'Computer Science and Engineering',
        'short_name' => 'CSE',
    ]);

    $courses = Course::factory()
        ->count(3)
        ->sequence(
            ['name' => 'Algorithms'],
            ['name' => 'Database Systems'],
            ['name' => 'Software Engineering'],
        )
        ->create([
            'department_id' => $department->id,
        ]);

    Livewire::test(ListCourses::class)
        ->assertOk()
        ->assertCanSeeTableRecords($courses);
});

it('filters courses by department', function (): void {
    $science = Department::factory()->create([
        'name' => 'Computer Science and Engineering',
        'short_name' => 'CSE',
    ]);
    $business = Department::factory()->create([
        'name' => 'Business Administration',
        'short_name' => 'BBA',
    ]);

    $scienceCourses = Course::factory()
        ->count(2)
        ->sequence(
            ['name' => 'Data Structures'],
            ['name' => 'Operating Systems'],
        )
        ->create([
            'department_id' => $science->id,
        ]);

    $businessCourses = Course::factory()
        ->count(2)
        ->sequence(
            ['name' => 'Marketing Basics'],
            ['name' => 'Corporate Finance'],
        )
        ->create([
            'department_id' => $business->id,
        ]);

    Livewire::test(ListCourses::class)
        ->filterTable('department', $science->id)
        ->assertCanSeeTableRecords($scienceCourses)
        ->assertCanNotSeeTableRecords($businessCourses);
});

it('creates a course from the create page', function (): void {
    $department = Department::factory()->create([
        'name' => 'Mathematics',
        'short_name' => 'MATH',
    ]);

    $rawName = 'numerical methods for engineers';
    $expectedName = Str::headline(str($rawName)->squish()->toString());

    Livewire::test(CreateCourse::class)
        ->assertOk()
        ->fillForm([
            'department_id' => $department->id,
            'name' => $rawName,
        ])
        ->call('create')
        ->assertNotified()
        ->assertRedirect();

    assertDatabaseHas(Course::class, [
        'department_id' => $department->id,
        'name' => $expectedName,
    ]);
});

it('updates a course from the edit page', function (): void {
    $department = Department::factory()->create([
        'name' => 'Physics',
        'short_name' => 'PHY',
    ]);

    $course = Course::factory()->create([
        'department_id' => $department->id,
        'name' => 'Classical Mechanics',
    ]);

    $updatedName = 'modern physics';
    $expectedName = Str::headline(str($updatedName)->squish()->toString());

    Livewire::test(EditCourse::class, [
        'record' => $course->getKey(),
    ])
        ->assertOk()
        ->fillForm([
            'department_id' => $department->id,
            'name' => $updatedName,
        ])
        ->call('save')
        ->assertNotified();

    assertDatabaseHas(Course::class, [
        'id' => $course->getKey(),
        'department_id' => $department->id,
        'name' => $expectedName,
    ]);
});
