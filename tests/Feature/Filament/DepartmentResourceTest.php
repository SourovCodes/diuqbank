<?php

use App\Filament\Resources\Departments\Pages\CreateDepartment;
use App\Filament\Resources\Departments\Pages\EditDepartment;
use App\Filament\Resources\Departments\Pages\ListDepartments;
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

it('lists departments in the table', function (): void {
    /** @var User $admin */
    $admin = User::factory()->create();
    $departments = Department::factory()->count(3)->create();

    actingAs($admin);

    Livewire::test(ListDepartments::class)
        ->assertOk()
        ->assertCanSeeTableRecords($departments);
});

it('creates a department from the form', function (): void {
    /** @var User $admin */
    $admin = User::factory()->create();
    /** @var Department $departmentData */
    $departmentData = Department::factory()->make();

    actingAs($admin);

    Livewire::test(CreateDepartment::class)
        ->assertOk()
        ->fillForm([
            'name' => $departmentData->name,
            'short_name' => Str::lower($departmentData->short_name),
        ])
        ->call('create')
        ->assertNotified()
        ->assertRedirect();

    assertDatabaseHas(Department::class, [
        'name' => $departmentData->name,
        'short_name' => Str::upper($departmentData->short_name),
    ]);
});

it('updates a department from the form', function (): void {
    /** @var User $admin */
    $admin = User::factory()->create();
    /** @var Department $department */
    $department = Department::factory()->create();
    /** @var Department $newDepartmentData */
    $newDepartmentData = Department::factory()->make();

    actingAs($admin);

    Livewire::test(EditDepartment::class, ['record' => $department->getKey()])
        ->assertOk()
        ->fillForm([
            'name' => $newDepartmentData->name,
            'short_name' => Str::lower($newDepartmentData->short_name),
        ])
        ->call('save')
        ->assertNotified();

    assertDatabaseHas(Department::class, [
        'id' => $department->id,
        'name' => $newDepartmentData->name,
        'short_name' => Str::upper($newDepartmentData->short_name),
    ]);
});
