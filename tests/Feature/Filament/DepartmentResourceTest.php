<?php

use App\Filament\Resources\Departments\Pages\CreateDepartment;
use App\Filament\Resources\Departments\Pages\EditDepartment;
use App\Filament\Resources\Departments\Pages\ListDepartments;
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
        livewire(ListDepartments::class)
            ->assertOk();
    });

    it('can display departments in the table', function () {
        $departments = Department::factory()->count(3)->create();

        livewire(ListDepartments::class)
            ->assertCanSeeTableRecords($departments);
    });

    it('can search departments by name', function () {
        $department = Department::factory()->create(['name' => 'Computer Science']);
        Department::factory()->create(['name' => 'Electrical Engineering']);

        livewire(ListDepartments::class)
            ->searchTable('Computer')
            ->assertCanSeeTableRecords([$department])
            ->assertCountTableRecords(1);
    });
});

describe('Create Page', function () {
    it('can load the create page', function () {
        livewire(CreateDepartment::class)
            ->assertOk();
    });

    it('can create a department', function () {
        $newData = Department::factory()->make();

        livewire(CreateDepartment::class)
            ->fillForm([
                'name' => $newData->name,
                'short_name' => $newData->short_name,
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        assertDatabaseHas(Department::class, [
            'name' => $newData->name,
            'short_name' => $newData->short_name,
        ]);
    });

    it('validates required fields', function () {
        livewire(CreateDepartment::class)
            ->fillForm([
                'name' => null,
                'short_name' => null,
            ])
            ->call('create')
            ->assertHasFormErrors(['name' => 'required', 'short_name' => 'required']);
    });
});

describe('Edit Page', function () {
    it('can load the edit page', function () {
        $department = Department::factory()->create();

        livewire(EditDepartment::class, ['record' => $department->getRouteKey()])
            ->assertOk();
    });

    it('can update a department', function () {
        $department = Department::factory()->create();
        $newData = Department::factory()->make();

        livewire(EditDepartment::class, ['record' => $department->getRouteKey()])
            ->fillForm([
                'name' => $newData->name,
                'short_name' => $newData->short_name,
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $department->refresh();
        expect($department->name)->toBe($newData->name);
        expect($department->short_name)->toBe($newData->short_name);
    });

    it('can delete a department', function () {
        $department = Department::factory()->create();

        livewire(EditDepartment::class, ['record' => $department->getRouteKey()])
            ->callAction('delete');

        expect(Department::find($department->id))->toBeNull();
    });
});
