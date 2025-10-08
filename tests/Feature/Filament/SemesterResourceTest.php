<?php

use App\Filament\Resources\Semesters\Pages\CreateSemester;
use App\Filament\Resources\Semesters\Pages\EditSemester;
use App\Filament\Resources\Semesters\Pages\ListSemesters;
use App\Models\Semester;
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

it('lists semesters in the table', function (): void {
    /** @var User $admin */
    $admin = User::factory()->create();
    $semesters = Semester::factory()->count(3)->create();

    actingAs($admin);

    Livewire::test(ListSemesters::class)
        ->assertOk()
        ->assertCanSeeTableRecords($semesters);
});

it('creates a semester from the form', function (): void {
    /** @var User $admin */
    $admin = User::factory()->create();
    /** @var Semester $semesterData */
    $semesterData = Semester::factory()->make();

    actingAs($admin);

    Livewire::test(CreateSemester::class)
        ->assertOk()
        ->fillForm([
            'name' => Str::lower($semesterData->name),
        ])
        ->call('create')
        ->assertNotified()
        ->assertRedirect();

    assertDatabaseHas(Semester::class, [
        'name' => Str::headline($semesterData->name),
    ]);
});

it('updates a semester from the form', function (): void {
    /** @var User $admin */
    $admin = User::factory()->create();
    /** @var Semester $semester */
    $semester = Semester::factory()->create();
    /** @var Semester $newSemesterData */
    $newSemesterData = Semester::factory()->make();

    actingAs($admin);

    Livewire::test(EditSemester::class, ['record' => $semester->getKey()])
        ->assertOk()
        ->fillForm([
            'name' => Str::lower($newSemesterData->name),
        ])
        ->call('save')
        ->assertNotified();

    assertDatabaseHas(Semester::class, [
        'id' => $semester->id,
        'name' => Str::headline($newSemesterData->name),
    ]);
});
