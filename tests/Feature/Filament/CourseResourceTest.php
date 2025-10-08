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
});

it('lists courses in the table', function (): void {
    /** @var User $admin */
    $admin = User::factory()->create();
    $courses = collect([
        Course::factory()->for(Department::factory())->create(['name' => 'Course Alpha']),
        Course::factory()->for(Department::factory())->create(['name' => 'Course Beta']),
        Course::factory()->for(Department::factory())->create(['name' => 'Course Gamma']),
    ]);

    actingAs($admin);

    Livewire::test(ListCourses::class)
        ->assertOk()
        ->assertCanSeeTableRecords($courses);
});

it('creates a course from the form', function (): void {
    /** @var User $admin */
    $admin = User::factory()->create();
    /** @var Department $department */
    $department = Department::factory()->create();
    /** @var Course $courseData */
    $courseData = Course::factory()->make(['department_id' => $department->id]);

    actingAs($admin);

    Livewire::test(CreateCourse::class)
        ->assertOk()
        ->fillForm([
            'department_id' => $department->getKey(),
            'name' => Str::lower($courseData->name),
        ])
        ->call('create')
        ->assertNotified()
        ->assertRedirect();

    assertDatabaseHas(Course::class, [
        'department_id' => $department->id,
        'name' => Str::headline($courseData->name),
    ]);
});

it('updates a course from the form', function (): void {
    /** @var User $admin */
    $admin = User::factory()->create();
    /** @var Course $course */
    $course = Course::factory()->create();
    /** @var Department $newDepartment */
    $newDepartment = Department::factory()->create();
    /** @var Course $newCourseData */
    $newCourseData = Course::factory()->make(['department_id' => $newDepartment->id]);

    actingAs($admin);

    Livewire::test(EditCourse::class, ['record' => $course->getKey()])
        ->assertOk()
        ->fillForm([
            'department_id' => $newDepartment->getKey(),
            'name' => Str::lower($newCourseData->name),
        ])
        ->call('save')
        ->assertNotified();

    assertDatabaseHas(Course::class, [
        'id' => $course->id,
        'department_id' => $newDepartment->id,
        'name' => Str::headline($newCourseData->name),
    ]);
});
