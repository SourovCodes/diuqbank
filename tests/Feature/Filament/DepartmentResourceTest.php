<?php

use App\Filament\Resources\Departments\Pages\CreateDepartment;
use App\Filament\Resources\Departments\Pages\EditDepartment;
use App\Filament\Resources\Departments\Pages\ListDepartments;
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

it('lists departments with their statistics', function (): void {
    $departments = Department::factory()
        ->count(3)
        ->sequence(
            ['name' => 'Architecture', 'short_name' => 'ARCH'],
            ['name' => 'Civil Engineering', 'short_name' => 'CE'],
            ['name' => 'Economics', 'short_name' => 'ECON'],
        )
        ->create();

    Livewire::test(ListDepartments::class)
        ->assertOk()
        ->assertCanSeeTableRecords($departments);
});

it('filters departments by courses availability', function (): void {
    $withCourses = Department::factory()->create([
        'name' => 'Computer Science and Engineering',
        'short_name' => 'CSE',
    ]);

    $withoutCourses = Department::factory()->create([
        'name' => 'Psychology',
        'short_name' => 'PSY',
    ]);

    Course::factory()->create([
        'department_id' => $withCourses->id,
        'name' => 'Introduction to Programming',
    ]);

    Livewire::test(ListDepartments::class)
        ->filterTable('has_courses', true)
        ->assertCanSeeTableRecords([$withCourses])
        ->assertCanNotSeeTableRecords([$withoutCourses]);
});

it('creates a department from the create page', function (): void {
    $rawShortName = 'cse';

    Livewire::test(CreateDepartment::class)
        ->assertOk()
        ->fillForm([
            'name' => 'Computer Science and Engineering',
            'short_name' => $rawShortName,
        ])
        ->call('create')
        ->assertNotified()
        ->assertRedirect();

    assertDatabaseHas(Department::class, [
        'name' => 'Computer Science and Engineering',
        'short_name' => Str::upper($rawShortName),
    ]);
});

it('updates a department from the edit page', function (): void {
    $department = Department::factory()->create([
        'name' => 'Mathematics',
        'short_name' => 'MATH',
    ]);

    Livewire::test(EditDepartment::class, [
        'record' => $department->getKey(),
    ])
        ->assertOk()
        ->fillForm([
            'name' => 'Applied Mathematics',
            'short_name' => 'amth',
        ])
        ->call('save')
        ->assertNotified();

    assertDatabaseHas(Department::class, [
        'id' => $department->getKey(),
        'name' => 'Applied Mathematics',
        'short_name' => Str::upper('amth'),
    ]);
});
