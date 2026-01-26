<?php

use App\Filament\Resources\Courses\Pages\CreateCourse;
use App\Filament\Resources\Courses\Pages\EditCourse;
use App\Filament\Resources\Courses\Pages\ListCourses;
use App\Models\Course;
use App\Models\Department;
use App\Models\User;

use function Pest\Laravel\assertDatabaseHas;
use function Pest\Livewire\livewire;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

describe('List Page', function () {
    it('can load the list page', function () {
        livewire(ListCourses::class)
            ->assertOk();
    });

    it('can display courses in the table', function () {
        $courses = Course::factory()->count(3)->create();

        livewire(ListCourses::class)
            ->assertCanSeeTableRecords($courses);
    });

    it('can filter courses by department', function () {
        $department = Department::factory()->create();
        $coursesInDept = Course::factory()->count(2)->for($department)->create();
        $otherCourse = Course::factory()->create();

        livewire(ListCourses::class)
            ->filterTable('department', $department->id)
            ->assertCanSeeTableRecords($coursesInDept)
            ->assertCanNotSeeTableRecords([$otherCourse]);
    });
});

describe('Create Page', function () {
    it('can load the create page', function () {
        livewire(CreateCourse::class)
            ->assertOk();
    });

    it('can create a course', function () {
        $department = Department::factory()->create();
        $newData = Course::factory()->make();

        livewire(CreateCourse::class)
            ->fillForm([
                'department_id' => $department->id,
                'name' => $newData->name,
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        assertDatabaseHas(Course::class, [
            'department_id' => $department->id,
            'name' => $newData->name,
        ]);
    });

    it('validates required fields', function () {
        livewire(CreateCourse::class)
            ->fillForm([
                'department_id' => null,
                'name' => null,
            ])
            ->call('create')
            ->assertHasFormErrors(['department_id' => 'required', 'name' => 'required']);
    });
});

describe('Edit Page', function () {
    it('can load the edit page', function () {
        $course = Course::factory()->create();

        livewire(EditCourse::class, ['record' => $course->getRouteKey()])
            ->assertOk();
    });

    it('can update a course', function () {
        $course = Course::factory()->create();
        $newDepartment = Department::factory()->create();

        livewire(EditCourse::class, ['record' => $course->getRouteKey()])
            ->fillForm([
                'department_id' => $newDepartment->id,
                'name' => 'Updated Course Name',
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $course->refresh();
        expect($course->department_id)->toBe($newDepartment->id);
        expect($course->name)->toBe('Updated Course Name');
    });

    it('can delete a course', function () {
        $course = Course::factory()->create();

        livewire(EditCourse::class, ['record' => $course->getRouteKey()])
            ->callAction('delete');

        expect(Course::find($course->id))->toBeNull();
    });
});
