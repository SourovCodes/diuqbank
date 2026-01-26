<?php

use App\Filament\Resources\Semesters\Pages\CreateSemester;
use App\Filament\Resources\Semesters\Pages\EditSemester;
use App\Filament\Resources\Semesters\Pages\ListSemesters;
use App\Models\Semester;
use App\Models\User;

use function Pest\Laravel\assertDatabaseHas;
use function Pest\Livewire\livewire;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

describe('List Page', function () {
    it('can load the list page', function () {
        livewire(ListSemesters::class)
            ->assertOk();
    });

    it('can display semesters in the table', function () {
        $semesters = Semester::factory()->count(3)->create();

        livewire(ListSemesters::class)
            ->assertCanSeeTableRecords($semesters);
    });

    it('can search semesters by name', function () {
        $semester = Semester::factory()->create(['name' => 'Spring 2024']);
        Semester::factory()->create(['name' => 'Fall 2024']);

        livewire(ListSemesters::class)
            ->searchTable('Spring')
            ->assertCanSeeTableRecords([$semester])
            ->assertCountTableRecords(1);
    });
});

describe('Create Page', function () {
    it('can load the create page', function () {
        livewire(CreateSemester::class)
            ->assertOk();
    });

    it('can create a semester', function () {
        livewire(CreateSemester::class)
            ->fillForm([
                'name' => 'Summer 2025',
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        assertDatabaseHas(Semester::class, [
            'name' => 'Summer 2025',
        ]);
    });

    it('validates required fields', function () {
        livewire(CreateSemester::class)
            ->fillForm([
                'name' => null,
            ])
            ->call('create')
            ->assertHasFormErrors(['name' => 'required']);
    });
});

describe('Edit Page', function () {
    it('can load the edit page', function () {
        $semester = Semester::factory()->create();

        livewire(EditSemester::class, ['record' => $semester->getRouteKey()])
            ->assertOk();
    });

    it('can update a semester', function () {
        $semester = Semester::factory()->create();

        livewire(EditSemester::class, ['record' => $semester->getRouteKey()])
            ->fillForm([
                'name' => 'Winter 2026',
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $semester->refresh();
        expect($semester->name)->toBe('Winter 2026');
    });

    it('can delete a semester', function () {
        $semester = Semester::factory()->create();

        livewire(EditSemester::class, ['record' => $semester->getRouteKey()])
            ->callAction('delete');

        expect(Semester::find($semester->id))->toBeNull();
    });
});
