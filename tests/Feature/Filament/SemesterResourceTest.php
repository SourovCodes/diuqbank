<?php

use App\Filament\Resources\Semesters\Pages\CreateSemester;
use App\Filament\Resources\Semesters\Pages\EditSemester;
use App\Filament\Resources\Semesters\Pages\ListSemesters;
use App\Models\Question;
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

    /** @var \App\Models\User $user */
    $user = User::factory()->createOne();

    actingAs($user);
});

it('lists semesters in the table', function (): void {
    $semesters = Semester::factory()
        ->count(3)
        ->sequence(
            ['name' => 'Spring 2024'],
            ['name' => 'Summer 2024'],
            ['name' => 'Fall 2024'],
        )
        ->create();

    Livewire::test(ListSemesters::class)
        ->assertOk()
        ->assertCanSeeTableRecords($semesters);
});

it('filters semesters by question availability', function (): void {
    $withQuestions = Semester::factory()->create(['name' => 'Spring 2025']);
    $withoutQuestions = Semester::factory()->create(['name' => 'Fall 2025']);

    Question::factory()->create([
        'semester_id' => $withQuestions->id,
    ]);

    Livewire::test(ListSemesters::class)
        ->filterTable('has_questions', true)
        ->assertCanSeeTableRecords([$withQuestions])
        ->assertCanNotSeeTableRecords([$withoutQuestions]);
});

it('creates a semester from the create page', function (): void {
    $rawName = 'fall 2026';

    Livewire::test(CreateSemester::class)
        ->assertOk()
        ->fillForm([
            'name' => $rawName,
        ])
        ->call('create')
        ->assertNotified()
        ->assertRedirect();

    assertDatabaseHas(Semester::class, [
        'name' => Str::headline(str($rawName)->squish()->toString()),
    ]);
});

it('updates a semester from the edit page', function (): void {
    $semester = Semester::factory()->create([
        'name' => 'Spring 2027',
    ]);

    $updatedName = 'summer 2027';

    Livewire::test(EditSemester::class, [
        'record' => $semester->getKey(),
    ])
        ->assertOk()
        ->fillForm([
            'name' => $updatedName,
        ])
        ->call('save')
        ->assertNotified();

    assertDatabaseHas(Semester::class, [
        'id' => $semester->getKey(),
        'name' => Str::headline(str($updatedName)->squish()->toString()),
    ]);
});
